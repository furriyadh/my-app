#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🔧 Google Ads Configuration - محدث لدعم MCC الديناميكي
========================================================

ملف إعدادات Google Ads API محدث ليدعم:
- نظام MCC الديناميكي
- إدارة حسابات متعددة
- التبديل التلقائي بين الحسابات
- إعدادات متقدمة للعمليات الجماعية

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 2.0.0
"""

import os
import logging
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass, field
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv()

logger = logging.getLogger(__name__)

@dataclass
class MCCSettings:
    """
    🏢 إعدادات MCC الديناميكية
    """
    enabled: bool = False
    login_customer_id: Optional[str] = None
    auto_discover_accounts: bool = True
    include_manager_accounts: bool = False
    include_test_accounts: bool = False
    filter_active_only: bool = True
    refresh_interval: int = 3600  # seconds
    cache_enabled: bool = True
    cache_ttl: int = 1800  # seconds
    
    @classmethod
    def from_env(cls) -> 'MCCSettings':
        """تحميل إعدادات MCC من متغيرات البيئة"""
        return cls(
            enabled=os.getenv('GOOGLE_ADS_USE_MCC', 'false').lower() == 'true',
            login_customer_id=os.getenv('GOOGLE_ADS_LOGIN_CUSTOMER_ID'),
            auto_discover_accounts=os.getenv('GOOGLE_ADS_AUTO_DISCOVER_ACCOUNTS', 'true').lower() == 'true',
            include_manager_accounts=os.getenv('GOOGLE_ADS_INCLUDE_MANAGER_ACCOUNTS', 'false').lower() == 'true',
            include_test_accounts=os.getenv('GOOGLE_ADS_INCLUDE_TEST_ACCOUNTS', 'false').lower() == 'true',
            filter_active_only=os.getenv('GOOGLE_ADS_FILTER_ACTIVE_ONLY', 'true').lower() == 'true',
            refresh_interval=int(os.getenv('MCC_REFRESH_INTERVAL', '3600')),
            cache_enabled=os.getenv('MCC_CACHE_ENABLED', 'true').lower() == 'true',
            cache_ttl=int(os.getenv('MCC_CACHE_TTL', '1800'))
        )

@dataclass
class BulkOperationSettings:
    """
    ⚡ إعدادات العمليات الجماعية
    """
    enabled: bool = True
    max_accounts_per_operation: int = 50
    max_concurrent_operations: int = 5
    batch_size: int = 1000
    timeout_seconds: int = 300
    retry_attempts: int = 3
    retry_delay: float = 1.0
    
    @classmethod
    def from_env(cls) -> 'BulkOperationSettings':
        """تحميل إعدادات العمليات الجماعية من متغيرات البيئة"""
        return cls(
            enabled=os.getenv('MCC_BULK_OPERATIONS_ENABLED', 'true').lower() == 'true',
            max_accounts_per_operation=int(os.getenv('MCC_MAX_ACCOUNTS_PER_OPERATION', '50')),
            max_concurrent_operations=int(os.getenv('MCC_MAX_CONCURRENT_OPERATIONS', '5')),
            batch_size=int(os.getenv('MCC_BATCH_SIZE', '1000')),
            timeout_seconds=int(os.getenv('MCC_TIMEOUT_SECONDS', '300')),
            retry_attempts=int(os.getenv('MCC_RETRY_ATTEMPTS', '3')),
            retry_delay=float(os.getenv('MCC_RETRY_DELAY', '1.0'))
        )

@dataclass
class GoogleAdsConfig:
    """
    🔧 إعدادات Google Ads API الشاملة
    """
    # إعدادات أساسية
    developer_token: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    refresh_token: Optional[str] = None
    
    # إعدادات MCC
    login_customer_id: Optional[str] = None
    use_proto_plus: bool = True
    
    # إعدادات متقدمة
    mcc_settings: MCCSettings = field(default_factory=MCCSettings)
    bulk_settings: BulkOperationSettings = field(default_factory=BulkOperationSettings)
    
    # إعدادات الأداء
    timeout: int = 60
    retry_count: int = 3
    page_size: int = 10000
    
    def __post_init__(self):
        """تهيئة الإعدادات بعد الإنشاء"""
        self._load_from_env()
        self.mcc_settings = MCCSettings.from_env()
        self.bulk_settings = BulkOperationSettings.from_env()
    
    def _load_from_env(self):
        """تحميل الإعدادات من متغيرات البيئة"""
        self.developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN') or os.getenv('GOOGLE_DEVELOPER_TOKEN')
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID') or os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET') or os.getenv('GOOGLE_CLIENT_SECRET')
        self.refresh_token = os.getenv('GOOGLE_ADS_REFRESH_TOKEN') or os.getenv('GOOGLE_REFRESH_TOKEN')
        self.login_customer_id = os.getenv('GOOGLE_ADS_LOGIN_CUSTOMER_ID') or os.getenv('MCC_LOGIN_CUSTOMER_ID')
        
        # إعدادات الأداء
        self.timeout = int(os.getenv('GOOGLE_ADS_TIMEOUT', '60'))
        self.retry_count = int(os.getenv('GOOGLE_ADS_RETRY_COUNT', '3'))
        self.page_size = int(os.getenv('GOOGLE_ADS_PAGE_SIZE', '10000'))
        self.use_proto_plus = os.getenv('GOOGLE_ADS_USE_PROTO_PLUS', 'true').lower() == 'true'
    
    def is_valid(self) -> bool:
        """
        التحقق من صحة الإعدادات
        
        Returns:
            bool: True إذا كانت الإعدادات صحيحة
        """
        required_fields = [
            self.developer_token,
            self.client_id,
            self.client_secret,
            self.refresh_token
        ]
        
        # التحقق من وجود جميع الحقول المطلوبة
        if not all(required_fields):
            missing_fields = []
            if not self.developer_token:
                missing_fields.append('developer_token')
            if not self.client_id:
                missing_fields.append('client_id')
            if not self.client_secret:
                missing_fields.append('client_secret')
            if not self.refresh_token:
                missing_fields.append('refresh_token')
            
            logger.error(f"حقول مطلوبة مفقودة: {missing_fields}")
            return False
        
        # التحقق من تنسيق معرف العميل
        if self.login_customer_id:
            clean_id = self.login_customer_id.replace('-', '')
            if not clean_id.isdigit() or len(clean_id) != 10:
                logger.error(f"معرف العميل غير صحيح: {self.login_customer_id}")
                return False
        
        return True
    
    def get_client_config(self, customer_id: Optional[str] = None) -> Dict[str, Any]:
        """
        الحصول على إعدادات العميل لـ Google Ads Client
        
        Args:
            customer_id: معرف العميل (اختياري)
        
        Returns:
            Dict[str, Any]: إعدادات العميل
        """
        config = {
            'developer_token': self.developer_token,
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'refresh_token': self.refresh_token,
            'use_proto_plus': self.use_proto_plus
        }
        
        # إضافة معرف العميل للدخول
        if customer_id:
            config['login_customer_id'] = customer_id
        elif self.login_customer_id:
            config['login_customer_id'] = self.login_customer_id
        
        return config
    
    def create_client(self, customer_id: Optional[str] = None) -> Optional['GoogleAdsClient']:
        """
        إنشاء عميل Google Ads
        
        Args:
            customer_id: معرف العميل (اختياري)
        
        Returns:
            GoogleAdsClient: عميل Google Ads أو None في حالة الفشل
        """
        try:
            # التحقق من صحة الإعدادات
            if not self.is_valid():
                logger.error("إعدادات Google Ads غير صحيحة")
                return None
            
            # الحصول على إعدادات العميل
            client_config = self.get_client_config(customer_id)
            
            # محاولة إنشاء العميل
            try:
                from google.ads.googleads.client import GoogleAdsClient
                client = GoogleAdsClient.load_from_dict(client_config)
                
                # اختبار الاتصال
                customer_service = client.get_service("CustomerService")
                accessible_customers = customer_service.list_accessible_customers()
                
                logger.info(f"تم إنشاء عميل Google Ads بنجاح. الحسابات المتاحة: {len(accessible_customers.resource_names)}")
                return client
                
            except ImportError:
                logger.warning("مكتبة Google Ads غير متاحة - سيتم استخدام محاكاة")
                return None
                
        except Exception as e:
            logger.error(f"فشل في إنشاء عميل Google Ads: {e}")
            return None
    
    def test_connection(self, customer_id: Optional[str] = None) -> bool:
        """
        اختبار الاتصال مع Google Ads API
        
        Args:
            customer_id: معرف العميل (اختياري)
        
        Returns:
            bool: True إذا نجح الاتصال
        """
        try:
            client = self.create_client(customer_id)
            if client is None:
                return False
            
            # محاولة جلب قائمة الحسابات المتاحة
            customer_service = client.get_service("CustomerService")
            accessible_customers = customer_service.list_accessible_customers()
            
            logger.info(f"اختبار الاتصال نجح. عدد الحسابات المتاحة: {len(accessible_customers.resource_names)}")
            return True
            
        except Exception as e:
            logger.error(f"فشل اختبار الاتصال: {e}")
            return False
    
    def get_accessible_customers(self, customer_id: Optional[str] = None) -> List[str]:
        """
        الحصول على قائمة الحسابات المتاحة
        
        Args:
            customer_id: معرف العميل (اختياري)
        
        Returns:
            List[str]: قائمة معرفات الحسابات المتاحة
        """
        try:
            client = self.create_client(customer_id)
            if client is None:
                return []
            
            customer_service = client.get_service("CustomerService")
            accessible_customers = customer_service.list_accessible_customers()
            
            # استخراج معرفات الحسابات
            customer_ids = []
            for resource_name in accessible_customers.resource_names:
                # استخراج معرف العميل من resource name
                customer_id = resource_name.split('/')[-1]
                customer_ids.append(customer_id)
            
            logger.info(f"تم العثور على {len(customer_ids)} حساب متاح")
            return customer_ids
            
        except Exception as e:
            logger.error(f"فشل في الحصول على الحسابات المتاحة: {e}")
            return []
    
    def validate_customer_id(self, customer_id: str) -> bool:
        """
        التحقق من صحة معرف العميل
        
        Args:
            customer_id: معرف العميل
        
        Returns:
            bool: True إذا كان المعرف صحيحاً
        """
        if not customer_id:
            return False
        
        # إزالة الشرطات والمسافات
        clean_id = customer_id.replace('-', '').replace(' ', '')
        
        # التحقق من أنه يحتوي على 10 أرقام فقط
        if not clean_id.isdigit() or len(clean_id) != 10:
            return False
        
        return True
    
    def format_customer_id(self, customer_id: str) -> str:
        """
        تنسيق معرف العميل
        
        Args:
            customer_id: معرف العميل
        
        Returns:
            str: معرف العميل منسق
        """
        if not customer_id:
            return ""
        
        # إزالة الشرطات والمسافات
        clean_id = customer_id.replace('-', '').replace(' ', '')
        
        # إضافة الشرطات في المواضع الصحيحة
        if len(clean_id) == 10:
            return f"{clean_id[:3]}-{clean_id[3:6]}-{clean_id[6:]}"
        
        return clean_id
    
    def to_dict(self) -> Dict[str, Any]:
        """
        تحويل الإعدادات إلى قاموس
        
        Returns:
            Dict[str, Any]: الإعدادات كقاموس
        """
        return {
            'developer_token': self.developer_token[:10] + "..." if self.developer_token else None,
            'client_id': self.client_id,
            'client_secret': self.client_secret[:10] + "..." if self.client_secret else None,
            'refresh_token': self.refresh_token[:20] + "..." if self.refresh_token else None,
            'login_customer_id': self.login_customer_id,
            'use_proto_plus': self.use_proto_plus,
            'timeout': self.timeout,
            'retry_count': self.retry_count,
            'page_size': self.page_size,
            'mcc_settings': {
                'enabled': self.mcc_settings.enabled,
                'auto_discover_accounts': self.mcc_settings.auto_discover_accounts,
                'include_manager_accounts': self.mcc_settings.include_manager_accounts,
                'filter_active_only': self.mcc_settings.filter_active_only
            },
            'bulk_settings': {
                'enabled': self.bulk_settings.enabled,
                'max_accounts_per_operation': self.bulk_settings.max_accounts_per_operation,
                'max_concurrent_operations': self.bulk_settings.max_concurrent_operations,
                'batch_size': self.bulk_settings.batch_size
            }
        }
    
    def __str__(self) -> str:
        """تمثيل نصي للإعدادات"""
        status = "✅ صحيح" if self.is_valid() else "❌ غير صحيح"
        mcc_status = "🏢 مُفعل" if self.mcc_settings.enabled else "🏢 غير مُفعل"
        
        return f"GoogleAdsConfig({status}, MCC: {mcc_status})"

# دوال مساعدة للاستخدام السريع
def load_config() -> GoogleAdsConfig:
    """تحميل إعدادات Google Ads من متغيرات البيئة"""
    return GoogleAdsConfig()

def create_client(customer_id: Optional[str] = None) -> Optional['GoogleAdsClient']:
    """إنشاء عميل Google Ads سريع"""
    config = load_config()
    return config.create_client(customer_id)

def test_connection(customer_id: Optional[str] = None) -> bool:
    """اختبار اتصال سريع"""
    config = load_config()
    return config.test_connection(customer_id)

def get_accessible_customers() -> List[str]:
    """الحصول على الحسابات المتاحة سريع"""
    config = load_config()
    return config.get_accessible_customers()

# تصدير الوحدات المهمة
__all__ = [
    'GoogleAdsConfig',
    'MCCSettings',
    'BulkOperationSettings',
    'load_config',
    'create_client',
    'test_connection',
    'get_accessible_customers'
]
