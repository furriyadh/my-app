"""
Google Ads API Integration Module
وحدة التكامل مع Google Ads API - محدث ليقرأ من .env
"""

import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json

# تحميل متغيرات البيئة من ملف .env
load_dotenv()

try:
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    from google.auth.exceptions import RefreshError
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import Flow
    GOOGLE_ADS_AVAILABLE = True
except ImportError as e:
    GOOGLE_ADS_AVAILABLE = False
    print(f"تحذير: Google Ads API غير متاح - {str(e)}")

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleAdsAPIManager:
    """مدير Google Ads API مع دعم MCC - يقرأ من ملف .env"""
    
    def __init__(self):
        """
        تهيئة مدير Google Ads API
        يقرأ التكوين من متغيرات البيئة (.env)
        """
        self.client = None
        self.credentials = None
        
        # قراءة التكوين من متغيرات البيئة
        self.developer_token = os.getenv('GOOGLE_DEVELOPER_TOKEN')
        self.customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        self.refresh_token = os.getenv('GOOGLE_REFRESH_TOKEN')
        
        # تحميل التكوين
        self._load_config()
    
    def _load_config(self):
        """تحميل تكوين Google Ads API من متغيرات البيئة"""
        try:
            # التحقق من وجود المتغيرات المطلوبة
            required_vars = {
                'GOOGLE_DEVELOPER_TOKEN': self.developer_token,
                'MCC_LOGIN_CUSTOMER_ID': self.customer_id,
                'GOOGLE_CLIENT_ID': self.client_id,
                'GOOGLE_CLIENT_SECRET': self.client_secret,
                'GOOGLE_REFRESH_TOKEN': self.refresh_token
            }
            
            missing_vars = [var for var, value in required_vars.items() if not value]
            
            if missing_vars:
                logger.warning(f"⚠️ متغيرات البيئة المفقودة: {', '.join(missing_vars)}")
                return False
            
            # إنشاء OAuth credentials
            if self.client_id and self.client_secret and self.refresh_token:
                self.credentials = Credentials(
                    token=None,  # سيتم تجديده تلقائياً
                    refresh_token=self.refresh_token,
                    client_id=self.client_id,
                    client_secret=self.client_secret,
                    token_uri='https://oauth2.googleapis.com/token'
                )
                
                logger.info("✅ تم تحميل تكوين Google Ads API من ملف .env بنجاح")
                return True
            else:
                logger.warning("⚠️ OAuth credentials غير مكتملة في ملف .env")
                return False
                
        except Exception as e:
            logger.error(f"❌ خطأ في تحميل التكوين: {str(e)}")
            return False
    
    def get_config_status(self) -> Dict[str, Any]:
        """جلب حالة التكوين"""
        return {
            'developer_token_configured': bool(self.developer_token),
            'customer_id_configured': bool(self.customer_id),
            'client_id_configured': bool(self.client_id),
            'client_secret_configured': bool(self.client_secret),
            'refresh_token_configured': bool(self.refresh_token),
            'credentials_ready': bool(self.credentials),
            'google_ads_available': GOOGLE_ADS_AVAILABLE
        }
    
    def initialize_client(self) -> bool:
        """تهيئة عميل Google Ads API"""
        if not GOOGLE_ADS_AVAILABLE:
            logger.error("❌ Google Ads API غير متاح")
            return False
            
        try:
            if not self.developer_token:
                logger.error("❌ GOOGLE_DEVELOPER_TOKEN غير مكون في ملف .env")
                return False
            
            if not self.credentials:
                logger.error("❌ OAuth credentials غير مكونة في ملف .env")
                return False
            
            # إنشاء تكوين العميل
            client_config = {
                'developer_token': self.developer_token,
                'use_proto_plus': True,
                'oauth2': {
                    'client_id': self.client_id,
                    'client_secret': self.client_secret,
                    'refresh_token': self.refresh_token
                }
            }
            
            # إضافة login_customer_id إذا كان متوفراً
            if self.customer_id:
                client_config['login_customer_id'] = self.customer_id
            
            # إنشاء عميل Google Ads
            self.client = GoogleAdsClient.load_from_dict(client_config)
            
            logger.info("✅ تم تهيئة عميل Google Ads API بنجاح")
            return True
            
        except Exception as e:
            logger.error(f"❌ خطأ في تهيئة العميل: {str(e)}")
            return False
    
    def get_accessible_customers(self) -> List[Dict[str, Any]]:
        """جلب قائمة العملاء المتاحين"""
        if not GOOGLE_ADS_AVAILABLE:
            logger.error("❌ Google Ads API غير متاح")
            return []
            
        if not self.client:
            logger.error("❌ العميل غير مهيأ")
            return []
        
        try:
            customer_service = self.client.get_service("CustomerService")
            accessible_customers = customer_service.list_accessible_customers()
            
            customers = []
            for customer_resource in accessible_customers.resource_names:
                customer_id = customer_resource.split('/')[-1]
                customers.append({
                    'customer_id': customer_id,
                    'resource_name': customer_resource
                })
            
            logger.info(f"✅ تم جلب {len(customers)} عميل متاح")
            return customers
            
        except GoogleAdsException as ex:
            logger.error(f"❌ خطأ Google Ads API: {ex}")
            return []
        except Exception as e:
            logger.error(f"❌ خطأ عام: {str(e)}")
            return []
    
    def get_customer_info(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """جلب معلومات عميل محدد"""
        if not GOOGLE_ADS_AVAILABLE:
            return None
            
        if not self.client:
            logger.error("❌ العميل غير مهيأ")
            return None
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            query = """
                SELECT 
                    customer.id,
                    customer.descriptive_name,
                    customer.currency_code,
                    customer.time_zone,
                    customer.manager,
                    customer.test_account,
                    customer.auto_tagging_enabled,
                    customer.tracking_url_template,
                    customer.final_url_suffix
                FROM customer 
                LIMIT 1
            """
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            for row in response:
                customer = row.customer
                return {
                    'id': customer.id,
                    'name': customer.descriptive_name,
                    'currency_code': customer.currency_code,
                    'time_zone': customer.time_zone,
                    'is_manager': customer.manager,
                    'is_test_account': customer.test_account,
                    'auto_tagging_enabled': customer.auto_tagging_enabled,
                    'tracking_url_template': customer.tracking_url_template,
                    'final_url_suffix': customer.final_url_suffix
                }
            
            return None
            
        except GoogleAdsException as ex:
            logger.error(f"❌ خطأ Google Ads API: {ex}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام: {str(e)}")
            return None
    
    def get_campaigns(self, customer_id: str) -> List[Dict[str, Any]]:
        """جلب قائمة الحملات لعميل محدد"""
        if not GOOGLE_ADS_AVAILABLE:
            return []
            
        if not self.client:
            logger.error("❌ العميل غير مهيأ")
            return []
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            query = """
                SELECT 
                    campaign.id,
                    campaign.name,
                    campaign.status,
                    campaign.advertising_channel_type,
                    campaign.start_date,
                    campaign.end_date,
                    campaign.serving_status,
                    campaign_budget.amount_micros,
                    campaign_budget.delivery_method
                FROM campaign
                ORDER BY campaign.name
            """
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            campaigns = []
            for row in response:
                campaign = row.campaign
                budget = row.campaign_budget
                
                campaigns.append({
                    'id': campaign.id,
                    'name': campaign.name,
                    'status': campaign.status.name,
                    'channel_type': campaign.advertising_channel_type.name,
                    'start_date': campaign.start_date,
                    'end_date': campaign.end_date,
                    'serving_status': campaign.serving_status.name,
                    'budget_amount_micros': budget.amount_micros,
                    'budget_delivery_method': budget.delivery_method.name
                })
            
            logger.info(f"✅ تم جلب {len(campaigns)} حملة للعميل {customer_id}")
            return campaigns
            
        except GoogleAdsException as ex:
            logger.error(f"❌ خطأ Google Ads API: {ex}")
            return []
        except Exception as e:
            logger.error(f"❌ خطأ عام: {str(e)}")
            return []
    
    def get_account_performance(self, customer_id: str, date_range: str = "LAST_30_DAYS") -> Dict[str, Any]:
        """جلب أداء الحساب"""
        if not GOOGLE_ADS_AVAILABLE or not self.client:
            return {}
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            query = f"""
                SELECT 
                    metrics.impressions,
                    metrics.clicks,
                    metrics.cost_micros,
                    metrics.conversions,
                    metrics.ctr,
                    metrics.average_cpc,
                    metrics.cost_per_conversion
                FROM customer
                WHERE segments.date DURING {date_range}
            """
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            total_metrics = {
                'impressions': 0,
                'clicks': 0,
                'cost_micros': 0,
                'conversions': 0,
                'ctr': 0,
                'average_cpc': 0,
                'cost_per_conversion': 0
            }
            
            for row in response:
                metrics = row.metrics
                total_metrics['impressions'] += metrics.impressions
                total_metrics['clicks'] += metrics.clicks
                total_metrics['cost_micros'] += metrics.cost_micros
                total_metrics['conversions'] += metrics.conversions
            
            # حساب المتوسطات
            if total_metrics['impressions'] > 0:
                total_metrics['ctr'] = (total_metrics['clicks'] / total_metrics['impressions']) * 100
            
            if total_metrics['clicks'] > 0:
                total_metrics['average_cpc'] = total_metrics['cost_micros'] / total_metrics['clicks']
            
            if total_metrics['conversions'] > 0:
                total_metrics['cost_per_conversion'] = total_metrics['cost_micros'] / total_metrics['conversions']
            
            return total_metrics
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب أداء الحساب: {str(e)}")
            return {}
    
    def sync_mcc_accounts(self) -> Dict[str, Any]:
        """مزامنة حسابات MCC"""
        if not GOOGLE_ADS_AVAILABLE:
            return {'success': False, 'error': 'Google Ads API غير متاح'}
            
        if not self.client:
            logger.error("❌ العميل غير مهيأ")
            return {'success': False, 'error': 'العميل غير مهيأ'}
        
        try:
            # جلب العملاء المتاحين
            customers = self.get_accessible_customers()
            
            synced_accounts = []
            errors = []
            
            for customer in customers:
                customer_id = customer['customer_id']
                
                try:
                    # جلب معلومات العميل
                    customer_info = self.get_customer_info(customer_id)
                    
                    if customer_info:
                        # جلب الحملات
                        campaigns = self.get_campaigns(customer_id)
                        
                        # جلب أداء الحساب
                        performance = self.get_account_performance(customer_id)
                        
                        synced_accounts.append({
                            'customer_id': customer_id,
                            'customer_info': customer_info,
                            'campaigns_count': len(campaigns),
                            'campaigns': campaigns[:5],  # أول 5 حملات فقط
                            'performance': performance,
                            'sync_timestamp': datetime.utcnow().isoformat()
                        })
                    else:
                        errors.append(f"فشل في جلب معلومات العميل {customer_id}")
                        
                except Exception as e:
                    errors.append(f"خطأ في مزامنة العميل {customer_id}: {str(e)}")
            
            return {
                'success': True,
                'synced_accounts': synced_accounts,
                'total_accounts': len(synced_accounts),
                'errors': errors,
                'mcc_customer_id': self.customer_id,
                'sync_timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ خطأ في مزامنة MCC: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'sync_timestamp': datetime.utcnow().isoformat()
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """اختبار الاتصال مع Google Ads API"""
        try:
            config_status = self.get_config_status()
            
            if not config_status['google_ads_available']:
                return {
                    'success': False,
                    'error': 'Google Ads API غير مثبت',
                    'details': 'قم بتثبيت google-ads package'
                }
            
            if not all([
                config_status['developer_token_configured'],
                config_status['client_id_configured'],
                config_status['client_secret_configured'],
                config_status['refresh_token_configured']
            ]):
                return {
                    'success': False,
                    'error': 'تكوين غير مكتمل في ملف .env',
                    'config_status': config_status,
                    'required_vars': [
                        'GOOGLE_DEVELOPER_TOKEN',
                        'GOOGLE_CLIENT_ID', 
                        'GOOGLE_CLIENT_SECRET',
                        'GOOGLE_REFRESH_TOKEN',
                        'MCC_LOGIN_CUSTOMER_ID'
                    ]
                }
            
            if not self.initialize_client():
                return {
                    'success': False,
                    'error': 'فشل في تهيئة العميل',
                    'details': 'تحقق من صحة المتغيرات في ملف .env'
                }
            
            # اختبار جلب العملاء
            customers = self.get_accessible_customers()
            
            return {
                'success': True,
                'message': 'تم الاتصال بنجاح',
                'accessible_customers_count': len(customers),
                'mcc_customer_id': self.customer_id,
                'config_source': '.env file',
                'test_timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'test_timestamp': datetime.utcnow().isoformat()
            }

# إنشاء instance عام
google_ads_manager = GoogleAdsAPIManager()

def get_google_ads_manager() -> GoogleAdsAPIManager:
    """إرجاع instance مدير Google Ads API"""
    return google_ads_manager

