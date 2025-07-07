#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🏢 MCC Manager - إدارة حسابات MCC الديناميكية
==============================================

هذا الملف يدير جميع حسابات Google Ads المرتبطة بحساب MCC
ويوفر وظائف اكتشاف الحسابات تلقائياً والعمليات الجماعية.

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import os
import logging
import asyncio
from typing import List, Dict, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
import time

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

# استخدام أحدث إصدار متاح (v18)
try:
    from google.ads.googleads.v18.services.types.customer_service import ListAccessibleCustomersRequest
    from google.ads.googleads.v18.services.types.google_ads_service import SearchGoogleAdsRequest
    API_VERSION = "v18"
except ImportError:
    try:
        from google.ads.googleads.v19.services.types.customer_service import ListAccessibleCustomersRequest
        from google.ads.googleads.v19.services.types.google_ads_service import SearchGoogleAdsRequest
        API_VERSION = "v19"
    except ImportError:
        try:
            from google.ads.googleads.v20.services.types.customer_service import ListAccessibleCustomersRequest
            from google.ads.googleads.v20.services.types.google_ads_service import SearchGoogleAdsRequest
            API_VERSION = "v20"
        except ImportError:
            # استخدام الاستيراد العام إذا فشلت الإصدارات المحددة
            ListAccessibleCustomersRequest = None
            SearchGoogleAdsRequest = None
            API_VERSION = "generic"

from ..config.google_ads_config import GoogleAdsConfig
from ..utils.logger import setup_logger

# إعداد نظام السجلات
logger = setup_logger(__name__)

@dataclass
class MCCAccount:
    """
    🏢 كلاس يمثل حساب MCC
    """
    customer_id: str
    name: str = ""
    currency_code: str = ""
    time_zone: str = ""
    status: str = ""
    account_type: str = ""
    manager: bool = False
    test_account: bool = False
    auto_tagging_enabled: bool = False
    has_partners_badge: bool = False
    descriptive_name: str = ""
    can_manage_clients: bool = False
    optimization_score: float = 0.0
    last_updated: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل الحساب إلى قاموس"""
        return {
            'customer_id': self.customer_id,
            'name': self.name,
            'currency_code': self.currency_code,
            'time_zone': self.time_zone,
            'status': self.status,
            'account_type': self.account_type,
            'manager': self.manager,
            'test_account': self.test_account,
            'auto_tagging_enabled': self.auto_tagging_enabled,
            'has_partners_badge': self.has_partners_badge,
            'descriptive_name': self.descriptive_name,
            'can_manage_clients': self.can_manage_clients,
            'optimization_score': self.optimization_score,
            'last_updated': self.last_updated.isoformat()
        }

@dataclass
class MCCStats:
    """
    📊 إحصائيات MCC
    """
    total_accounts: int = 0
    active_accounts: int = 0
    suspended_accounts: int = 0
    test_accounts: int = 0
    manager_accounts: int = 0
    client_accounts: int = 0
    total_campaigns: int = 0
    total_budget: float = 0.0
    last_sync: datetime = field(default_factory=datetime.now)

class MCCManager:
    """
    🏢 مدير حسابات MCC الديناميكي
    
    يوفر وظائف:
    - اكتشاف الحسابات تلقائياً
    - إدارة الحسابات الجديدة
    - العمليات الجماعية
    - مراقبة الأداء
    """
    
    def __init__(self, config: Optional[GoogleAdsConfig] = None):
        """
        تهيئة مدير MCC
        
        Args:
            config: إعدادات Google Ads API
        """
        self.config = config or GoogleAdsConfig()
        self.client = None
        self.accounts: Dict[str, MCCAccount] = {}
        self.stats = MCCStats()
        self.cache_file = "./cache/mcc_accounts.json"
        self.last_discovery = None
        
        # إعدادات من متغيرات البيئة
        self.auto_discover = os.getenv('GOOGLE_ADS_AUTO_DISCOVER_ACCOUNTS', 'true').lower() == 'true'
        self.include_managers = os.getenv('GOOGLE_ADS_INCLUDE_MANAGER_ACCOUNTS', 'false').lower() == 'true'
        self.include_test = os.getenv('GOOGLE_ADS_INCLUDE_TEST_ACCOUNTS', 'false').lower() == 'true'
        self.refresh_interval = int(os.getenv('GOOGLE_ADS_ACCOUNTS_REFRESH_INTERVAL', '3600'))
        self.cache_enabled = os.getenv('GOOGLE_ADS_ACCOUNTS_CACHE_ENABLED', 'true').lower() == 'true'
        
        logger.info("🏢 تم تهيئة مدير MCC بنجاح")
    
    def _initialize_client(self) -> bool:
        """
        تهيئة عميل Google Ads API
        
        Returns:
            bool: True إذا نجحت التهيئة
        """
        try:
            if not self.config.is_valid():
                logger.error("❌ إعدادات Google Ads API غير صحيحة")
                return False
            
            # إنشاء عميل Google Ads
            self.client = GoogleAdsClient.load_from_env()
            logger.info("✅ تم تهيئة عميل Google Ads API بنجاح")
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة عميل Google Ads API: {e}")
            return False
    
    def discover_accounts(self, force_refresh: bool = False) -> List[MCCAccount]:
        """
        اكتشاف جميع الحسابات المتاحة في MCC
        
        Args:
            force_refresh: فرض التحديث حتى لو كان التخزين المؤقت صالح
            
        Returns:
            List[MCCAccount]: قائمة الحسابات المكتشفة
        """
        try:
            # التحقق من التخزين المؤقت
            if not force_refresh and self._is_cache_valid():
                logger.info("📋 تحميل الحسابات من التخزين المؤقت")
                return self._load_from_cache()
            
            # تهيئة العميل
            if not self.client and not self._initialize_client():
                return []
            
            logger.info("🔍 بدء اكتشاف حسابات MCC...")
            
            # الحصول على الحسابات المتاحة
            customer_service = self.client.get_service("CustomerService")
            accessible_customers = customer_service.list_accessible_customers()
            
            discovered_accounts = []
            
            for customer_resource in accessible_customers.resource_names:
                customer_id = customer_resource.split('/')[-1]
                
                try:
                    # الحصول على تفاصيل الحساب
                    account = self._get_account_details(customer_id)
                    if account and self._should_include_account(account):
                        discovered_accounts.append(account)
                        self.accounts[customer_id] = account
                        
                except Exception as e:
                    logger.warning(f"⚠️ فشل في الحصول على تفاصيل الحساب {customer_id}: {e}")
                    continue
            
            # تحديث الإحصائيات
            self._update_stats()
            
            # حفظ في التخزين المؤقت
            if self.cache_enabled:
                self._save_to_cache()
            
            self.last_discovery = datetime.now()
            
            logger.info(f"✅ تم اكتشاف {len(discovered_accounts)} حساب بنجاح")
            return discovered_accounts
            
        except GoogleAdsException as ex:
            logger.error(f"❌ خطأ Google Ads API: {ex}")
            return []
        except Exception as e:
            logger.error(f"❌ خطأ في اكتشاف الحسابات: {e}")
            return []
    
    def _get_account_details(self, customer_id: str) -> Optional[MCCAccount]:
        """
        الحصول على تفاصيل حساب محدد
        
        Args:
            customer_id: معرف الحساب
            
        Returns:
            MCCAccount: تفاصيل الحساب أو None
        """
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            query = """
                SELECT 
                    customer.id,
                    customer.descriptive_name,
                    customer.currency_code,
                    customer.time_zone,
                    customer.status,
                    customer.manager,
                    customer.test_account,
                    customer.auto_tagging_enabled,
                    customer.has_partners_badge,
                    customer.can_manage_clients,
                    customer.optimization_score
                FROM customer
                LIMIT 1
            """
            
            request = SearchGoogleAdsRequest(
                customer_id=customer_id,
                query=query
            )
            
            response = ga_service.search(request=request)
            
            for row in response:
                customer = row.customer
                
                return MCCAccount(
                    customer_id=str(customer.id),
                    name=customer.descriptive_name or f"Account {customer.id}",
                    currency_code=customer.currency_code or "",
                    time_zone=customer.time_zone or "",
                    status=customer.status.name if customer.status else "",
                    manager=customer.manager,
                    test_account=customer.test_account,
                    auto_tagging_enabled=customer.auto_tagging_enabled,
                    has_partners_badge=customer.has_partners_badge,
                    descriptive_name=customer.descriptive_name or "",
                    can_manage_clients=customer.can_manage_clients,
                    optimization_score=customer.optimization_score or 0.0,
                    account_type="MANAGER" if customer.manager else "CLIENT"
                )
            
            return None
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في الحصول على تفاصيل الحساب {customer_id}: {e}")
            return None
    
    def _should_include_account(self, account: MCCAccount) -> bool:
        """
        تحديد ما إذا كان يجب تضمين الحساب
        
        Args:
            account: الحساب للفحص
            
        Returns:
            bool: True إذا كان يجب تضمين الحساب
        """
        # استبعاد الحسابات التجريبية إذا لم تكن مطلوبة
        if account.test_account and not self.include_test:
            return False
        
        # استبعاد الحسابات الإدارية إذا لم تكن مطلوبة
        if account.manager and not self.include_managers:
            return False
        
        # تضمين الحسابات النشطة فقط
        if account.status in ["SUSPENDED", "CANCELLED"]:
            filter_active = os.getenv('GOOGLE_ADS_FILTER_ACTIVE_ACCOUNTS_ONLY', 'true').lower() == 'true'
            if filter_active:
                return False
        
        return True
    
    def _update_stats(self):
        """تحديث إحصائيات MCC"""
        self.stats.total_accounts = len(self.accounts)
        self.stats.active_accounts = sum(1 for acc in self.accounts.values() if acc.status == "ENABLED")
        self.stats.suspended_accounts = sum(1 for acc in self.accounts.values() if acc.status == "SUSPENDED")
        self.stats.test_accounts = sum(1 for acc in self.accounts.values() if acc.test_account)
        self.stats.manager_accounts = sum(1 for acc in self.accounts.values() if acc.manager)
        self.stats.client_accounts = sum(1 for acc in self.accounts.values() if not acc.manager)
        self.stats.last_sync = datetime.now()
    
    def _is_cache_valid(self) -> bool:
        """التحقق من صحة التخزين المؤقت"""
        if not self.cache_enabled or not os.path.exists(self.cache_file):
            return False
        
        try:
            cache_time = os.path.getmtime(self.cache_file)
            cache_age = time.time() - cache_time
            return cache_age < self.refresh_interval
        except:
            return False
    
    def _load_from_cache(self) -> List[MCCAccount]:
        """تحميل الحسابات من التخزين المؤقت"""
        try:
            with open(self.cache_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            accounts = []
            for acc_data in data.get('accounts', []):
                account = MCCAccount(**acc_data)
                accounts.append(account)
                self.accounts[account.customer_id] = account
            
            # تحديث الإحصائيات
            if 'stats' in data:
                stats_data = data['stats']
                self.stats = MCCStats(**stats_data)
            
            return accounts
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تحميل التخزين المؤقت: {e}")
            return []
    
    def _save_to_cache(self):
        """حفظ الحسابات في التخزين المؤقت"""
        try:
            os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
            
            data = {
                'accounts': [acc.to_dict() for acc in self.accounts.values()],
                'stats': {
                    'total_accounts': self.stats.total_accounts,
                    'active_accounts': self.stats.active_accounts,
                    'suspended_accounts': self.stats.suspended_accounts,
                    'test_accounts': self.stats.test_accounts,
                    'manager_accounts': self.stats.manager_accounts,
                    'client_accounts': self.stats.client_accounts,
                    'total_campaigns': self.stats.total_campaigns,
                    'total_budget': self.stats.total_budget,
                    'last_sync': self.stats.last_sync.isoformat()
                },
                'last_updated': datetime.now().isoformat()
            }
            
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            logger.warning(f"⚠️ فشل في حفظ التخزين المؤقت: {e}")
    
    def get_accounts(self, account_type: Optional[str] = None, 
                    status: Optional[str] = None) -> List[MCCAccount]:
        """
        الحصول على قائمة الحسابات مع فلترة اختيارية
        
        Args:
            account_type: نوع الحساب (CLIENT, MANAGER)
            status: حالة الحساب (ENABLED, SUSPENDED, etc.)
            
        Returns:
            List[MCCAccount]: قائمة الحسابات المفلترة
        """
        accounts = list(self.accounts.values())
        
        if account_type:
            accounts = [acc for acc in accounts if acc.account_type == account_type]
        
        if status:
            accounts = [acc for acc in accounts if acc.status == status]
        
        return accounts
    
    def get_client_accounts(self) -> List[MCCAccount]:
        """الحصول على حسابات العملاء فقط"""
        return self.get_accounts(account_type="CLIENT", status="ENABLED")
    
    def get_account_by_id(self, customer_id: str) -> Optional[MCCAccount]:
        """الحصول على حساب محدد بالمعرف"""
        return self.accounts.get(customer_id)
    
    def refresh_accounts(self) -> bool:
        """تحديث قائمة الحسابات"""
        try:
            self.discover_accounts(force_refresh=True)
            logger.info("✅ تم تحديث قائمة الحسابات بنجاح")
            return True
        except Exception as e:
            logger.error(f"❌ فشل في تحديث الحسابات: {e}")
            return False
    
    def get_stats(self) -> MCCStats:
        """الحصول على إحصائيات MCC"""
        return self.stats
    
    def monitor_new_accounts(self) -> List[MCCAccount]:
        """
        مراقبة الحسابات الجديدة
        
        Returns:
            List[MCCAccount]: قائمة الحسابات الجديدة المكتشفة
        """
        if not self.auto_discover:
            return []
        
        try:
            old_accounts = set(self.accounts.keys())
            self.discover_accounts(force_refresh=True)
            new_accounts = set(self.accounts.keys()) - old_accounts
            
            new_account_objects = [self.accounts[acc_id] for acc_id in new_accounts]
            
            if new_account_objects:
                logger.info(f"🆕 تم اكتشاف {len(new_account_objects)} حساب جديد")
                
                # إشعار بالحسابات الجديدة
                for account in new_account_objects:
                    logger.info(f"🆕 حساب جديد: {account.name} ({account.customer_id})")
            
            return new_account_objects
            
        except Exception as e:
            logger.error(f"❌ فشل في مراقبة الحسابات الجديدة: {e}")
            return []
    
    def setup_new_account(self, account: MCCAccount) -> bool:
        """
        إعداد حساب جديد تلقائياً
        
        Args:
            account: الحساب الجديد
            
        Returns:
            bool: True إذا نجح الإعداد
        """
        try:
            logger.info(f"⚙️ بدء إعداد الحساب الجديد: {account.name}")
            
            # هنا يمكن إضافة منطق الإعداد التلقائي
            # مثل إنشاء حملات افتراضية، تطبيق قوالب، إلخ
            
            logger.info(f"✅ تم إعداد الحساب {account.name} بنجاح")
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في إعداد الحساب {account.name}: {e}")
            return False

# دوال مساعدة للاستخدام السريع
def get_mcc_manager() -> MCCManager:
    """الحصول على مدير MCC"""
    return MCCManager()

def discover_all_accounts() -> List[MCCAccount]:
    """اكتشاف جميع الحسابات"""
    manager = get_mcc_manager()
    return manager.discover_accounts()

def get_client_accounts() -> List[MCCAccount]:
    """الحصول على حسابات العملاء فقط"""
    manager = get_mcc_manager()
    manager.discover_accounts()
    return manager.get_client_accounts()

# اختبار النظام
if __name__ == "__main__":
    print("🧪 اختبار مدير MCC...")
    
    try:
        manager = MCCManager()
        accounts = manager.discover_accounts()
        
        print(f"✅ تم اكتشاف {len(accounts)} حساب")
        
        for account in accounts[:5]:  # عرض أول 5 حسابات
            print(f"  📋 {account.name} ({account.customer_id}) - {account.account_type}")
        
        stats = manager.get_stats()
        print(f"📊 الإحصائيات:")
        print(f"  📈 إجمالي الحسابات: {stats.total_accounts}")
        print(f"  ✅ الحسابات النشطة: {stats.active_accounts}")
        print(f"  👥 حسابات العملاء: {stats.client_accounts}")
        
    except Exception as e:
        print(f"❌ خطأ في الاختبار: {e}")

