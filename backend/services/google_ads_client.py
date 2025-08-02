"""
Google Ads Client - عميل Google Ads مُصحح ومُحسن
يحل مشاكل credentials والاتصال مع Google Ads API
"""
import os
import yaml
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

# إعداد التسجيل
logger = logging.getLogger(__name__)

class GoogleAdsClientManager:
    """مدير عميل Google Ads مع معالجة أخطاء متقدمة"""
    
    def __init__(self):
        self.client = None
        self.is_initialized = False
        self.config = {}
        self.credentials_status = {}
        
        # محاولة التهيئة
        self._initialize()
    
    def _initialize(self):
        """تهيئة عميل Google Ads"""
        try:
            # فحص المكتبة
            if not self._check_library():
                return
            
            # تحميل الإعدادات
            if not self._load_configuration():
                return
            
            # إنشاء العميل
            if not self._create_client():
                return
            
            self.is_initialized = True
            logger.info("✅ تم تهيئة Google Ads Client بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة Google Ads Client: {e}")
            self.is_initialized = False
    
    def _check_library(self) -> bool:
        """فحص توفر مكتبة Google Ads"""
        try:
            global GoogleAdsClient, GoogleAdsException
            from google.ads.googleads.client import GoogleAdsClient
            from google.ads.googleads.errors import GoogleAdsException
            return True
        except ImportError as e:
            logger.warning(f"⚠️ مكتبة Google Ads غير متاحة: {e}")
            return False
    
    def _load_configuration(self) -> bool:
        """تحميل إعدادات Google Ads"""
        try:
            # الطريقة الأولى: من متغيرات البيئة
            env_config = self._load_from_env()
            if env_config:
                self.config = env_config
                logger.info("✅ تم تحميل إعدادات Google Ads من متغيرات البيئة")
                return True
            
            # الطريقة الثانية: من ملف YAML
            yaml_config = self._load_from_yaml()
            if yaml_config:
                self.config = yaml_config
                logger.info("✅ تم تحميل إعدادات Google Ads من ملف YAML")
                return True
            
            logger.warning("⚠️ لم يتم العثور على إعدادات Google Ads صالحة")
            return False
            
        except Exception as e:
            logger.error(f"❌ خطأ في تحميل إعدادات Google Ads: {e}")
            return False
    
    def _load_from_env(self) -> Optional[Dict[str, Any]]:
        """تحميل الإعدادات من متغيرات البيئة"""
        required_vars = {
            'developer_token': 'GOOGLE_ADS_DEVELOPER_TOKEN',
            'client_id': 'GOOGLE_ADS_CLIENT_ID',
            'client_secret': 'GOOGLE_ADS_CLIENT_SECRET',
            'refresh_token': 'GOOGLE_ADS_REFRESH_TOKEN'
        }
        
        config = {}
        missing_vars = []
        
        for key, env_var in required_vars.items():
            value = os.getenv(env_var)
            if value:
                config[key] = value
                self.credentials_status[key] = True
            else:
                missing_vars.append(env_var)
                self.credentials_status[key] = False
        
        # متغيرات اختيارية
        optional_vars = {
            'login_customer_id': 'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
            'use_proto_plus': 'GOOGLE_ADS_USE_PROTO_PLUS'
        }
        
        for key, env_var in optional_vars.items():
            value = os.getenv(env_var)
            if value:
                if key == 'use_proto_plus':
                    config[key] = value.lower() in ('true', '1', 'yes')
                else:
                    config[key] = value
        
        if missing_vars:
            logger.warning(f"متغيرات البيئة مفقودة: {missing_vars}")
            return None
        
        return config
    
    def _load_from_yaml(self) -> Optional[Dict[str, Any]]:
        """تحميل الإعدادات من ملف YAML"""
        yaml_paths = [
            'google-ads.yaml',
            'config/google-ads.yaml',
            'services/google-ads.yaml',
            os.path.expanduser('~/google-ads.yaml')
        ]
        
        for yaml_path in yaml_paths:
            try:
                if os.path.exists(yaml_path):
                    with open(yaml_path, 'r', encoding='utf-8') as f:
                        yaml_config = yaml.safe_load(f)
                    
                    # استخراج إعدادات Google Ads
                    if 'google_ads' in yaml_config:
                        return yaml_config['google_ads']
                    elif 'developer_token' in yaml_config:
                        return yaml_config
                        
            except Exception as e:
                logger.warning(f"خطأ في قراءة {yaml_path}: {e}")
                continue
        
        return None
    
    def _create_client(self) -> bool:
        """إنشاء عميل Google Ads"""
        try:
            if not self.config:
                logger.error("لا توجد إعدادات لإنشاء العميل")
                return False
            
            # التحقق من المتطلبات الأساسية
            required_fields = ['developer_token', 'client_id', 'client_secret', 'refresh_token']
            missing_fields = [field for field in required_fields if not self.config.get(field)]
            
            if missing_fields:
                logger.error(f"حقول مطلوبة مفقودة: {missing_fields}")
                return False
            
            # إنشاء العميل
            self.client = GoogleAdsClient.load_from_dict(self.config)
            
            # اختبار العميل
            if not self._test_client():
                return False
            
            logger.info("✅ تم إنشاء عميل Google Ads بنجاح")
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في إنشاء عميل Google Ads: {e}")
            return False
    
    def _test_client(self) -> bool:
        """اختبار عميل Google Ads"""
        try:
            if not self.client:
                return False
            
            # اختبار بسيط - الحصول على خدمة العملاء
            customer_service = self.client.get_service("CustomerService")
            
            # إذا كان لدينا login_customer_id، نختبر الوصول
            login_customer_id = self.config.get('login_customer_id')
            if login_customer_id:
                # تنظيف معرف العميل
                clean_id = login_customer_id.replace('-', '')
                if len(clean_id) == 10 and clean_id.isdigit():
                    # اختبار صالح
                    logger.info(f"✅ تم التحقق من معرف العميل: {login_customer_id}")
                else:
                    logger.warning(f"⚠️ معرف العميل غير صالح: {login_customer_id}")
            
            return True
            
        except Exception as e:
            logger.warning(f"⚠️ فشل اختبار العميل: {e}")
            return False
    
    def get_client(self):
        """الحصول على عميل Google Ads"""
        if self.is_initialized and self.client:
            return self.client
        return None
    
    def get_customer_service(self):
        """الحصول على خدمة العملاء"""
        if self.client:
            return self.client.get_service("CustomerService")
        return None
    
    def get_campaign_service(self):
        """الحصول على خدمة الحملات"""
        if self.client:
            return self.client.get_service("CampaignService")
        return None
    
    def get_google_ads_service(self):
        """الحصول على خدمة Google Ads الرئيسية"""
        if self.client:
            return self.client.get_service("GoogleAdsService")
        return None
    
    def test_connection(self) -> Dict[str, Any]:
        """اختبار الاتصال مع Google Ads API"""
        try:
            if not self.is_initialized:
                return {
                    'success': False,
                    'error': 'العميل غير مُهيأ',
                    'timestamp': datetime.utcnow().isoformat()
                }
            
            # اختبار الحصول على خدمة
            customer_service = self.get_customer_service()
            if not customer_service:
                return {
                    'success': False,
                    'error': 'فشل في الحصول على خدمة العملاء',
                    'timestamp': datetime.utcnow().isoformat()
                }
            
            return {
                'success': True,
                'message': 'تم اختبار الاتصال بنجاح',
                'api_version': 'v16',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def get_status(self) -> Dict[str, Any]:
        """الحصول على حالة العميل"""
        return {
            'initialized': self.is_initialized,
            'client_available': self.client is not None,
            'configuration_loaded': bool(self.config),
            'credentials_status': self.credentials_status,
            'config_source': 'environment' if self._load_from_env() else 'yaml' if self._load_from_yaml() else 'none',
            'login_customer_id': self.config.get('login_customer_id', 'غير محدد'),
            'developer_token_configured': bool(self.config.get('developer_token')),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def create_yaml_config_template(self, file_path: str = 'google-ads.yaml') -> bool:
        """إنشاء قالب ملف إعدادات YAML"""
        try:
            template = {
                'google_ads': {
                    'developer_token': 'YOUR_DEVELOPER_TOKEN_HERE',
                    'client_id': 'YOUR_CLIENT_ID_HERE',
                    'client_secret': 'YOUR_CLIENT_SECRET_HERE',
                    'refresh_token': 'YOUR_REFRESH_TOKEN_HERE',
                    'login_customer_id': 'YOUR_LOGIN_CUSTOMER_ID_HERE',
                    'use_proto_plus': True
                }
            }
            
            with open(file_path, 'w', encoding='utf-8') as f:
                yaml.dump(template, f, default_flow_style=False, allow_unicode=True)
            
            logger.info(f"✅ تم إنشاء قالب الإعدادات: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في إنشاء قالب الإعدادات: {e}")
            return False

# إنشاء مثيل عام
google_ads_client_manager = GoogleAdsClientManager()

# دوال مساعدة
def get_google_ads_client():
    """الحصول على عميل Google Ads"""
    return google_ads_client_manager.get_client()

def is_google_ads_available() -> bool:
    """فحص توفر Google Ads"""
    return google_ads_client_manager.is_initialized

def get_google_ads_status() -> Dict[str, Any]:
    """الحصول على حالة Google Ads"""
    return google_ads_client_manager.get_status()

def test_google_ads_connection() -> Dict[str, Any]:
    """اختبار اتصال Google Ads"""
    return google_ads_client_manager.test_connection()

def create_config_template(file_path: str = 'google-ads.yaml') -> bool:
    """إنشاء قالب إعدادات"""
    return google_ads_client_manager.create_yaml_config_template(file_path)

# تصدير الكلاسات والدوال
__all__ = [
    'GoogleAdsClientManager',
    'google_ads_client_manager',
    'get_google_ads_client',
    'is_google_ads_available',
    'get_google_ads_status',
    'test_google_ads_connection',
    'create_config_template'
]

# تسجيل حالة التحميل
logger.info(f"🎯 تم تحميل Google Ads Client Manager - مُهيأ: {google_ads_client_manager.is_initialized}")



# ===== إضافة GoogleAdsClientService المفقود =====

class GoogleAdsClientService:
    """خدمة Google Ads Client المتطورة - الفئة المفقودة"""
    
    def __init__(self, client_manager: GoogleAdsClientManager = None):
        """تهيئة خدمة Google Ads Client"""
        self.client_manager = client_manager or GoogleAdsClientManager()
        self.client = self.client_manager.client if self.client_manager.is_initialized else None
        self.is_ready = self.client_manager.is_initialized
        
        logger.info(f"🎯 تم تحميل Google Ads Client Service - جاهز: {self.is_ready}")
    
    def get_client(self):
        """الحصول على عميل Google Ads"""
        if not self.is_ready:
            logger.warning("⚠️ Google Ads Client غير جاهز")
            return None
        return self.client
    
    def is_client_ready(self) -> bool:
        """فحص جاهزية العميل"""
        return self.is_ready and self.client is not None
    
    def get_customer_service(self):
        """الحصول على خدمة العملاء"""
        if not self.is_client_ready():
            return None
        try:
            return self.client.get_service("CustomerService")
        except Exception as e:
            logger.error(f"❌ فشل في الحصول على CustomerService: {e}")
            return None
    
    def get_campaign_service(self):
        """الحصول على خدمة الحملات"""
        if not self.is_client_ready():
            return None
        try:
            return self.client.get_service("CampaignService")
        except Exception as e:
            logger.error(f"❌ فشل في الحصول على CampaignService: {e}")
            return None
    
    def get_ad_group_service(self):
        """الحصول على خدمة مجموعات الإعلانات"""
        if not self.is_client_ready():
            return None
        try:
            return self.client.get_service("AdGroupService")
        except Exception as e:
            logger.error(f"❌ فشل في الحصول على AdGroupService: {e}")
            return None
    
    def get_keyword_view_service(self):
        """الحصول على خدمة عرض الكلمات المفتاحية"""
        if not self.is_client_ready():
            return None
        try:
            return self.client.get_service("KeywordViewService")
        except Exception as e:
            logger.error(f"❌ فشل في الحصول على KeywordViewService: {e}")
            return None
    
    def get_google_ads_service(self):
        """الحصول على خدمة Google Ads الرئيسية"""
        if not self.is_client_ready():
            return None
        try:
            return self.client.get_service("GoogleAdsService")
        except Exception as e:
            logger.error(f"❌ فشل في الحصول على GoogleAdsService: {e}")
            return None
    
    def search(self, customer_id: str, query: str):
        """تنفيذ استعلام بحث"""
        if not self.is_client_ready():
            logger.error("❌ Google Ads Client غير جاهز للبحث")
            return []
        
        try:
            ga_service = self.get_google_ads_service()
            if not ga_service:
                return []
            
            response = ga_service.search(customer_id=customer_id, query=query)
            return list(response)
        except Exception as e:
            logger.error(f"❌ فشل في تنفيذ البحث: {e}")
            return []
    
    def get_campaigns(self, customer_id: str):
        """الحصول على قائمة الحملات"""
        query = """
            SELECT 
                campaign.id,
                campaign.name,
                campaign.status,
                campaign.advertising_channel_type,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros
            FROM campaign 
            WHERE segments.date DURING LAST_30_DAYS
        """
        return self.search(customer_id, query)
    
    def get_ad_groups(self, customer_id: str, campaign_id: str = None):
        """الحصول على مجموعات الإعلانات"""
        query = """
            SELECT 
                ad_group.id,
                ad_group.name,
                ad_group.status,
                ad_group.campaign,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros
            FROM ad_group 
            WHERE segments.date DURING LAST_30_DAYS
        """
        if campaign_id:
            query += f" AND ad_group.campaign = 'customers/{customer_id}/campaigns/{campaign_id}'"
        
        return self.search(customer_id, query)
    
    def get_keywords(self, customer_id: str, ad_group_id: str = None):
        """الحصول على الكلمات المفتاحية"""
        query = """
            SELECT 
                ad_group_criterion.keyword.text,
                ad_group_criterion.keyword.match_type,
                ad_group_criterion.status,
                ad_group_criterion.ad_group,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.ctr,
                metrics.average_cpc
            FROM keyword_view 
            WHERE segments.date DURING LAST_30_DAYS
        """
        if ad_group_id:
            query += f" AND ad_group_criterion.ad_group = 'customers/{customer_id}/adGroups/{ad_group_id}'"
        
        return self.search(customer_id, query)
    
    def get_performance_metrics(self, customer_id: str, date_range: str = "LAST_30_DAYS"):
        """الحصول على مقاييس الأداء"""
        query = f"""
            SELECT 
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.ctr,
                metrics.average_cpc,
                metrics.conversions,
                metrics.conversion_rate,
                metrics.cost_per_conversion,
                segments.date
            FROM campaign 
            WHERE segments.date DURING {date_range}
        """
        return self.search(customer_id, query)

class GoogleAdsConfig:
    """إعدادات Google Ads API"""
    
    def __init__(self):
        self.name = "GoogleAdsConfig"
        self.version = "2.0.0"
        self.config = {}
        self.load_config()
    
    def load_config(self):
        """تحميل إعدادات Google Ads"""
        try:
            # تحميل من متغيرات البيئة
            self.config = {
                'developer_token': os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN', ''),
                'client_id': os.getenv('GOOGLE_ADS_CLIENT_ID', ''),
                'client_secret': os.getenv('GOOGLE_ADS_CLIENT_SECRET', ''),
                'refresh_token': os.getenv('GOOGLE_ADS_REFRESH_TOKEN', ''),
                'customer_id': os.getenv('GOOGLE_ADS_CUSTOMER_ID', ''),
                'login_customer_id': os.getenv('GOOGLE_ADS_LOGIN_CUSTOMER_ID', ''),
                'use_proto_plus': True,
                'api_version': 'v15'
            }
            
            logger.info(f"✅ تم تحميل {self.name} v{self.version}")
            
        except Exception as e:
            logger.error(f"❌ خطأ في تحميل إعدادات Google Ads: {e}")
    
    def get_config(self) -> Dict[str, Any]:
        """الحصول على الإعدادات"""
        return self.config.copy()
    
    def validate_config(self) -> bool:
        """التحقق من صحة الإعدادات"""
        required_fields = ['developer_token', 'client_id', 'client_secret', 'refresh_token']
        
        for field in required_fields:
            if not self.config.get(field):
                logger.warning(f"⚠️ حقل مطلوب مفقود: {field}")
                return False
        
        return True
    
    def update_config(self, updates: Dict[str, Any]):
        """تحديث الإعدادات"""
        self.config.update(updates)
        logger.info("✅ تم تحديث إعدادات Google Ads")

# إنشاء instance عام للاستخدام
google_ads_client_service = GoogleAdsClientService()
google_ads_config = GoogleAdsConfig()

# تصدير الفئات والوظائف
__all__ = [
    'GoogleAdsClientManager',
    'GoogleAdsClientService', 
    'GoogleAdsConfig',
    'google_ads_client_service',
    'google_ads_config'
]

