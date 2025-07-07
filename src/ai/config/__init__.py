# Google Ads AI Platform - Configuration Package
# Centralized configuration management for all AI components

# استيراد من الملف المحدث باستخدام المسار الكامل
try:
    from .google_ads_config_updated import (
        GoogleAdsManager,
        GoogleAdsConfig,
        MCCSettings,
        BulkOperationSettings
    )
    CONFIG_UPDATED_AVAILABLE = True
except ImportError as e:
    print(f"تحذير: فشل في استيراد من google_ads_config_updated: {e}")
    CONFIG_UPDATED_AVAILABLE = False
    # استيراد من الملف الأساسي كبديل
    try:
        from .google_ads_config import GoogleAdsConfig
        # إنشاء كلاسات بديلة بسيطة
        class GoogleAdsManager:
            def __init__(self, config=None):
                self.config = config or GoogleAdsConfig()
        
        class MCCSettings:
            def __init__(self):
                self.enabled = False
        
        class BulkOperationSettings:
            def __init__(self):
                self.enabled = True
    except ImportError:
        # إنشاء كلاسات فارغة كحل أخير
        class GoogleAdsConfig:
            def __init__(self):
                pass
        
        class GoogleAdsManager:
            def __init__(self, config=None):
                self.config = config or GoogleAdsConfig()
        
        class MCCSettings:
            def __init__(self):
                self.enabled = False
        
        class BulkOperationSettings:
            def __init__(self):
                self.enabled = True

# استيراد من الملف الأساسي (للتوافق مع الإصدارات القديمة)
try:
    from .google_ads_config import (
        load_config,
        create_client,
        test_connection,
        get_accessible_customers
    )
except ImportError:
    # إنشاء دوال بديلة إذا لم يكن الملف الأساسي متاحاً
    def load_config():
        return GoogleAdsConfig()
    
    def create_client(customer_id=None):
        config = GoogleAdsConfig()
        return config.create_client(customer_id) if hasattr(config, 'create_client') else None
    
    def test_connection(customer_id=None):
        config = GoogleAdsConfig()
        return config.test_connection(customer_id) if hasattr(config, 'test_connection') else False
    
    def get_accessible_customers():
        config = GoogleAdsConfig()
        return config.get_accessible_customers() if hasattr(config, 'get_accessible_customers') else []

# إنشاء مثيل مدير عام
google_ads_manager = None

def get_google_ads_manager():
    """الحصول على مثيل مدير Google Ads"""
    global google_ads_manager
    if google_ads_manager is None:
        google_ads_manager = GoogleAdsManager()
    return google_ads_manager

def get_google_ads_client(customer_id=None):
    """الحصول على عميل Google Ads"""
    manager = get_google_ads_manager()
    return manager.get_client(customer_id) if hasattr(manager, 'get_client') else None

def authenticate_google_ads():
    """مصادقة Google Ads"""
    manager = get_google_ads_manager()
    return manager.authenticate() if hasattr(manager, 'authenticate') else False

def validate_google_ads_config():
    """التحقق من صحة إعدادات Google Ads"""
    config = GoogleAdsConfig()
    return config.is_valid() if hasattr(config, 'is_valid') else True

__all__ = [
    'GoogleAdsManager',
    'GoogleAdsConfig',
    'MCCSettings', 
    'BulkOperationSettings',
    'google_ads_manager',
    'get_google_ads_manager',
    'get_google_ads_client',
    'authenticate_google_ads',
    'validate_google_ads_config',
    'load_config',
    'create_client',
    'test_connection',
    'get_accessible_customers'
]

