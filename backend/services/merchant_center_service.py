"""
Google Merchant Center Service
خدمة Google Merchant Center المتطورة

نظام شامل لإدارة Google Merchant Center API يتضمن:
- جلب حسابات Merchant Center المرتبطة
- إدارة المنتجات والكتالوجات
- ربط الحسابات مع Google Ads
- مراقبة حالة المنتجات
- تحليل أداء Shopping Campaigns
"""

import os
import json
import logging
import time
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass

# إعداد التسجيل
logger = logging.getLogger(__name__)

# استيراد Google Ads مع معالجة أخطاء متقدمة
try:
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    from google.auth.exceptions import RefreshError
    GOOGLE_ADS_AVAILABLE = True
    logger.info("✅ تم تحميل Google Ads API بنجاح")
except ImportError as e:
    GOOGLE_ADS_AVAILABLE = False
    logger.warning(f"⚠️ لم يتم تحميل Google Ads API: {e}")

@dataclass
class MerchantCenterAccount:
    """فئة بيانات حساب Merchant Center"""
    merchant_id: str
    name: str
    country: str
    currency: str
    status: str
    linked_ads_accounts: List[str]
    products_count: int = 0
    approved_products: int = 0
    pending_products: int = 0
    disapproved_products: int = 0
    last_sync: Optional[datetime] = None

class MerchantCenterService:
    """خدمة Google Merchant Center المتطورة"""
    
    def __init__(self):
        """تهيئة خدمة Merchant Center"""
        self.client = None
        self.mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        self.developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        self.refresh_token = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')
        
        # تهيئة العميل
        self._initialize_client()
    
    def _initialize_client(self) -> bool:
        """تهيئة عميل Google Ads"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("Google Ads API غير متاح")
                return False
            
            # التحقق من وجود المتغيرات المطلوبة
            required_vars = {
                'developer_token': self.developer_token,
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': self.refresh_token,
                'mcc_customer_id': self.mcc_customer_id
            }
            
            missing_vars = [k for k, v in required_vars.items() if not v]
            if missing_vars:
                logger.error(f"متغيرات البيئة المفقودة: {missing_vars}")
                return False
            
            # إنشاء تكوين العميل
            config = {
                'developer_token': self.developer_token,
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': self.refresh_token,
                'login_customer_id': self.mcc_customer_id,
                'use_proto_plus': True
            }
            
            # تهيئة العميل
            self.client = GoogleAdsClient.load_from_dict(config, version="v17")
            logger.info("✅ تم تهيئة عميل Google Ads بنجاح")
            return True
            
        except Exception as e:
            logger.error(f"خطأ في تهيئة عميل Google Ads: {e}")
            return False
    
    def get_linked_merchant_accounts(self, customer_id: str = None) -> List[MerchantCenterAccount]:
        """جلب حسابات Merchant Center المرتبطة"""
        try:
            if not self.client:
                logger.error("عميل Google Ads غير مهيأ")
                return []
            
            # استخدام MCC customer ID إذا لم يتم تحديد customer_id
            target_customer_id = customer_id or self.mcc_customer_id
            
            # الحصول على خدمة Google Ads
            googleads_service = self.client.get_service("GoogleAdsService")
            
            # استعلام GAQL لجلب حسابات Merchant Center المرتبطة
            query = """
                SELECT
                    customer.id,
                    customer.descriptive_name,
                    customer.currency_code,
                    customer.time_zone,
                    customer.status,
                    shopping_setting.merchant_id,
                    shopping_setting.sales_country,
                    shopping_setting.campaign_priority,
                    shopping_setting.enable_local
                FROM customer
                WHERE shopping_setting.merchant_id IS NOT NULL
                AND customer.status = 'ENABLED'
            """
            
            # تنفيذ الاستعلام
            response = googleads_service.search(customer_id=target_customer_id, query=query)
            
            merchant_accounts = []
            
            for row in response:
                customer = row.customer
                shopping_setting = row.shopping_setting
                
                # إنشاء كائن حساب Merchant Center
                merchant_account = MerchantCenterAccount(
                    merchant_id=str(shopping_setting.merchant_id),
                    name=customer.descriptive_name,
                    country=shopping_setting.sales_country,
                    currency=customer.currency_code,
                    status=customer.status.name,
                    linked_ads_accounts=[str(customer.id)],
                    last_sync=datetime.now()
                )
                
                # جلب إحصائيات المنتجات
                product_stats = self._get_product_statistics(
                    target_customer_id, 
                    str(shopping_setting.merchant_id)
                )
                
                if product_stats:
                    merchant_account.products_count = product_stats.get('total', 0)
                    merchant_account.approved_products = product_stats.get('approved', 0)
                    merchant_account.pending_products = product_stats.get('pending', 0)
                    merchant_account.disapproved_products = product_stats.get('disapproved', 0)
                
                merchant_accounts.append(merchant_account)
            
            logger.info(f"تم جلب {len(merchant_accounts)} حساب Merchant Center")
            return merchant_accounts
            
        except GoogleAdsException as ex:
            logger.error(f"خطأ Google Ads API: {ex.error.code().name}")
            for error in ex.errors:
                logger.error(f"تفاصيل الخطأ: {error.message}")
            return []
            
        except Exception as e:
            logger.error(f"خطأ في جلب حسابات Merchant Center: {e}")
            return []
    
    def _get_product_statistics(self, customer_id: str, merchant_id: str) -> Dict[str, int]:
        """جلب إحصائيات المنتجات لحساب Merchant Center"""
        try:
            googleads_service = self.client.get_service("GoogleAdsService")
            
            # استعلام لجلب إحصائيات المنتجات
            query = f"""
                SELECT
                    shopping_product.status,
                    metrics.impressions,
                    metrics.clicks
                FROM shopping_product
                WHERE shopping_product.merchant_center_id = {merchant_id}
            """
            
            response = googleads_service.search(customer_id=customer_id, query=query)
            
            stats = {
                'total': 0,
                'approved': 0,
                'pending': 0,
                'disapproved': 0
            }
            
            for row in response:
                stats['total'] += 1
                status = row.shopping_product.status.name.lower()
                
                if 'approved' in status:
                    stats['approved'] += 1
                elif 'pending' in status:
                    stats['pending'] += 1
                elif 'disapproved' in status:
                    stats['disapproved'] += 1
            
            return stats
            
        except Exception as e:
            logger.warning(f"لم يتم الحصول على إحصائيات المنتجات: {e}")
            return {}
    
    def get_all_mcc_merchant_accounts(self) -> List[MerchantCenterAccount]:
        """جلب جميع حسابات Merchant Center من جميع حسابات MCC"""
        try:
            if not self.client:
                logger.error("عميل Google Ads غير مهيأ")
                return []
            
            # جلب جميع حسابات العملاء في MCC
            customer_accounts = self._get_mcc_customer_accounts()
            
            all_merchant_accounts = []
            
            for customer_id in customer_accounts:
                try:
                    # جلب حسابات Merchant Center لكل عميل
                    merchant_accounts = self.get_linked_merchant_accounts(customer_id)
                    all_merchant_accounts.extend(merchant_accounts)
                    
                except Exception as e:
                    logger.warning(f"خطأ في جلب حسابات Merchant Center للعميل {customer_id}: {e}")
                    continue
            
            # إزالة التكرارات بناءً على merchant_id
            unique_accounts = {}
            for account in all_merchant_accounts:
                if account.merchant_id not in unique_accounts:
                    unique_accounts[account.merchant_id] = account
                else:
                    # دمج حسابات Google Ads المرتبطة
                    existing = unique_accounts[account.merchant_id]
                    existing.linked_ads_accounts.extend(account.linked_ads_accounts)
                    existing.linked_ads_accounts = list(set(existing.linked_ads_accounts))
            
            result = list(unique_accounts.values())
            logger.info(f"تم جلب {len(result)} حساب Merchant Center فريد من MCC")
            return result
            
        except Exception as e:
            logger.error(f"خطأ في جلب حسابات Merchant Center من MCC: {e}")
            return []
    
    def _get_mcc_customer_accounts(self) -> List[str]:
        """جلب جميع حسابات العملاء في MCC"""
        try:
            googleads_service = self.client.get_service("GoogleAdsService")
            
            query = """
                SELECT
                    customer_client.id,
                    customer_client.descriptive_name,
                    customer_client.manager,
                    customer_client.test_account,
                    customer_client.status
                FROM customer_client
                WHERE customer_client.status = 'ENABLED'
                AND customer_client.manager = false
                AND customer_client.test_account = false
            """
            
            response = googleads_service.search(customer_id=self.mcc_customer_id, query=query)
            
            customer_ids = []
            for row in response:
                customer_ids.append(str(row.customer_client.id))
            
            logger.info(f"تم جلب {len(customer_ids)} حساب عميل من MCC")
            return customer_ids
            
        except Exception as e:
            logger.error(f"خطأ في جلب حسابات العملاء من MCC: {e}")
            return []
    
    def get_merchant_account_details(self, merchant_id: str) -> Optional[Dict[str, Any]]:
        """جلب تفاصيل حساب Merchant Center محدد"""
        try:
            accounts = self.get_all_mcc_merchant_accounts()
            
            for account in accounts:
                if account.merchant_id == merchant_id:
                    return {
                        'merchant_id': account.merchant_id,
                        'name': account.name,
                        'country': account.country,
                        'currency': account.currency,
                        'status': account.status,
                        'linked_ads_accounts': account.linked_ads_accounts,
                        'products': {
                            'total': account.products_count,
                            'approved': account.approved_products,
                            'pending': account.pending_products,
                            'disapproved': account.disapproved_products
                        },
                        'last_sync': account.last_sync.isoformat() if account.last_sync else None
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"خطأ في جلب تفاصيل حساب Merchant Center: {e}")
            return None
    
    def validate_merchant_account(self, merchant_id: str) -> Dict[str, Any]:
        """التحقق من صحة حساب Merchant Center"""
        try:
            account_details = self.get_merchant_account_details(merchant_id)
            
            if not account_details:
                return {
                    'valid': False,
                    'error': 'حساب Merchant Center غير موجود',
                    'merchant_id': merchant_id
                }
            
            # فحوصات الصحة
            checks = {
                'account_exists': True,
                'account_enabled': account_details['status'] == 'ENABLED',
                'has_products': account_details['products']['total'] > 0,
                'has_approved_products': account_details['products']['approved'] > 0,
                'linked_to_ads': len(account_details['linked_ads_accounts']) > 0
            }
            
            # حساب النتيجة الإجمالية
            total_checks = len(checks)
            passed_checks = sum(checks.values())
            health_score = (passed_checks / total_checks) * 100
            
            return {
                'valid': checks['account_exists'] and checks['account_enabled'],
                'merchant_id': merchant_id,
                'health_score': health_score,
                'checks': checks,
                'account_details': account_details,
                'recommendations': self._generate_recommendations(checks, account_details)
            }
            
        except Exception as e:
            logger.error(f"خطأ في التحقق من حساب Merchant Center: {e}")
            return {
                'valid': False,
                'error': str(e),
                'merchant_id': merchant_id
            }
    
    def _generate_recommendations(self, checks: Dict[str, bool], account_details: Dict[str, Any]) -> List[str]:
        """توليد توصيات لتحسين حساب Merchant Center"""
        recommendations = []
        
        if not checks['has_products']:
            recommendations.append("قم بإضافة منتجات إلى حساب Merchant Center")
        
        if not checks['has_approved_products']:
            recommendations.append("تأكد من موافقة Google على منتجاتك")
        
        if not checks['linked_to_ads']:
            recommendations.append("اربط حساب Merchant Center بحساب Google Ads")
        
        if account_details['products']['disapproved'] > 0:
            recommendations.append("راجع المنتجات المرفوضة وأصلح المشاكل")
        
        if account_details['products']['pending'] > account_details['products']['approved']:
            recommendations.append("انتظر موافقة Google على المنتجات المعلقة")
        
        return recommendations
    
    def get_service_status(self) -> Dict[str, Any]:
        """الحصول على حالة خدمة Merchant Center"""
        return {
            'service_name': 'Merchant Center Service',
            'google_ads_available': GOOGLE_ADS_AVAILABLE,
            'client_initialized': self.client is not None,
            'mcc_customer_id': self.mcc_customer_id,
            'configuration_complete': all([
                self.developer_token,
                self.client_id,
                self.client_secret,
                self.refresh_token,
                self.mcc_customer_id
            ]),
            'timestamp': datetime.now().isoformat()
        }

# إنشاء مثيل عام للخدمة
merchant_center_service = MerchantCenterService()

