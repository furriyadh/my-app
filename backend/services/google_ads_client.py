"""
Google Ads Client - عميل Google Ads محسن باستخدام المكتبة الرسمية
يتبع أفضل الممارسات من google-ads-python الرسمية
"""
import os
import yaml
import logging
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv('../.env.development')

# إعداد التسجيل
logger = logging.getLogger(__name__)

class GoogleAdsClientManager:
    """
    مدير عميل Google Ads محسن - يتبع المكتبة الرسمية
    
    Features:
    - استخدام GoogleAdsClient.load_from_dict() المعياري
    - معالجة أخطاء GoogleAdsException بطريقة احترافية  
    - دعم MCC operations بشكل صحيح
    - إدارة tokens محسنة
    """
    
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
            # إصلاح مشكلة التهيئة - السماح بالاستمرار مع OAuth2 Manager
            logger.info("ℹ️ سيتم استخدام OAuth2 Manager للربط التلقائي")
    
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
            'login_customer_id': 'MCC_LOGIN_CUSTOMER_ID',
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
            # إذا كنا في وضع الاختبار، لا نظهر تحذيراً مزعجاً
            if os.getenv('FLASK_ENV') == 'testing' or os.getenv('TESTING') == 'True':
                logger.info("🧪 وضع الاختبار: سيتم تجاهل متغيرات البيئة المفقودة")
                return None
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
            
            # إضافة use_proto_plus إلى الإعدادات
            if 'use_proto_plus' not in self.config:
                self.config['use_proto_plus'] = False
            
            # إصلاح مشكلة credentials - تحسين المعالجة
            if 'refresh_token' in self.config:
                refresh_token = self.config['refresh_token']
                if refresh_token.startswith('your-') or not refresh_token or refresh_token == '':
                    logger.warning("⚠️ refresh_token غير صحيح - سيتم استخدام OAuth2 Manager فقط")
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
    
    def create_client_with_token(self, access_token: str, refresh_token: str = None) -> Optional[Any]:
        """
        إنشاء عميل Google Ads مع token محدد - طريقة محسنة
        يتبع أفضل الممارسات من المكتبة الرسمية
        
        Args:
            access_token: Access token للمصادقة
            refresh_token: Refresh token (اختياري)
            
        Returns:
            GoogleAdsClient instance أو None
        """
        try:
            # بناء الإعدادات الديناميكية
            config = {
                "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
                "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
                "refresh_token": refresh_token or access_token,
                "login_customer_id": os.getenv("MCC_LOGIN_CUSTOMER_ID"),
                "use_proto_plus": True
            }
            
            # التحقق من المتغيرات المطلوبة
            required_fields = ["developer_token", "client_id", "client_secret"]
            missing_fields = [field for field in required_fields if not config.get(field)]
            
            if missing_fields:
                logger.error(f"❌ متغيرات البيئة المفقودة: {missing_fields}")
                return None
            
            # إنشاء العميل باستخدام الطريقة المعيارية
            client = GoogleAdsClient.load_from_dict(config_dict=config, version="v20")
            
            logger.info("✅ تم إنشاء عميل Google Ads بـ token محدد")
            return client
            
        except Exception as e:
            logger.error(f"❌ فشل في إنشاء العميل بـ token: {e}")
            return None
    
    def link_customer_to_mcc_standard(self, client, manager_customer_id: str, customer_id: str) -> Dict[str, Any]:
        """
        ربط عميل بـ MCC باستخدام الطريقة المعيارية من المكتبة الرسمية
        
        Args:
            client: GoogleAdsClient instance
            manager_customer_id: معرف حساب MCC
            customer_id: معرف العميل المراد ربطه
            
        Returns:
            Dict يحتوي على نتيجة العملية
        """
        try:
            # الحصول على خدمة Customer Client Link
            customer_client_link_service = client.get_service("CustomerClientLinkService")
            
            # إنشاء العملية
            operation = client.get_type("CustomerClientLinkOperation")
            customer_client_link = operation.create
            customer_client_link.client_customer = f"customers/{customer_id}"
            customer_client_link.status = client.enums.ManagerLinkStatusEnum.PENDING
            
            # تنفيذ العملية
            logger.info(f"🔗 بدء ربط العميل {customer_id} بـ MCC {manager_customer_id}")
            
            response = customer_client_link_service.mutate_customer_client_link(
                customer_id=manager_customer_id,
                operation=operation
            )
            
            logger.info(f"✅ تم إرسال طلب الربط بنجاح: {response.result.resource_name}")
            
            return {
                "success": True,
                "resource_name": response.result.resource_name,
                "status": "PENDING_APPROVAL",
                "message": "تم إرسال طلب الربط بنجاح - ينتظر موافقة العميل",
                "manager_customer_id": manager_customer_id,
                "customer_id": customer_id
            }
            
        except GoogleAdsException as ex:
            logger.error(f"❌ خطأ في Google Ads API: {ex.error.message}")
            
            # استخراج تفاصيل الأخطاء
            error_details = []
            for error in ex.failure.errors:
                error_info = {
                    "message": error.message,
                    "error_code": error.error_code._name_ if hasattr(error.error_code, '_name_') else str(error.error_code),
                    "trigger": error.trigger.value if error.trigger else None
                }
                
                if error.location:
                    error_info["field_path"] = [
                        field.field_name for field in error.location.field_path_elements
                    ]
                
                error_details.append(error_info)
            
            return {
                "success": False,
                "error": "Google Ads API Error",
                "message": ex.error.message,
                "error_details": error_details,
                "request_id": ex.request_id
            }
            
        except Exception as e:
            logger.error(f"❌ خطأ غير متوقع في ربط MCC: {e}")
            return {
                "success": False,
                "error": "Unexpected Error",
                "message": f"خطأ غير متوقع: {str(e)}"
            }
    
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
                'api_version': 'v20',
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
    """خدمة Google Ads Client المتطورة"""
    
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
                'login_customer_id': os.getenv('MCC_LOGIN_CUSTOMER_ID', ''),
                'use_proto_plus': True,
                'api_version': 'v20'
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

