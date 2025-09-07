import os
from dotenv import load_dotenv
from pathlib import Path

# تحديد البيئة أولاً
NODE_ENV = os.getenv("NODE_ENV", "development")

# تحميل متغيرات البيئة حسب البيئة
if NODE_ENV == "production":
    env_path = Path(__file__).parent.parent / ".env.production"
else:
    env_path = Path(__file__).parent.parent / ".env.development"

# تحميل ملف البيئة إذا كان موجوداً
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"✅ تم تحميل متغيرات البيئة من: {env_path}")
else:
    print(f"⚠️ ملف البيئة غير موجود: {env_path}")
    # تحميل من متغيرات البيئة الافتراضية
    load_dotenv()

class Config:
    """إعدادات التطبيق الأساسية"""
    
    # إعدادات Flask
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "google-ads-ai-platform-secret-key-2025")
    DEBUG = os.getenv("FLASK_ENV") == "development"
    
    # إعدادات البيئة
    ENVIRONMENT = os.getenv("NODE_ENV", "development")
    IS_PRODUCTION = ENVIRONMENT == "production"
    
    # URLs حسب البيئة
    if IS_PRODUCTION:
        FRONTEND_URL = "https://furriyadh.com"
        BACKEND_URL = "https://furriyadh.com"
        API_BASE_URL = "https://furriyadh.com/api"
    else:
        FRONTEND_URL = "http://localhost:3000"
        BACKEND_URL = "http://localhost:5000"
        API_BASE_URL = "http://localhost:5000/api"
    
    # إعدادات Google Ads API
    GOOGLE_ADS_DEVELOPER_TOKEN = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN")
    GOOGLE_ADS_CLIENT_ID = os.getenv("GOOGLE_ADS_CLIENT_ID")
    GOOGLE_ADS_CLIENT_SECRET = os.getenv("GOOGLE_ADS_CLIENT_SECRET")
    GOOGLE_ADS_REFRESH_TOKEN = os.getenv("GOOGLE_ADS_REFRESH_TOKEN")
    
    # إعدادات MCC
    MCC_LOGIN_CUSTOMER_ID = os.getenv("MCC_LOGIN_CUSTOMER_ID")
    
    # إعدادات قاعدة البيانات
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # إعدادات Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # إعدادات OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # إعدادات البريد الإلكتروني
    EMAIL_SENDER_EMAIL = os.getenv("EMAIL_SENDER_EMAIL")
    EMAIL_SENDER_PASSWORD = os.getenv("EMAIL_SENDER_PASSWORD")
    EMAIL_SMTP_SERVER = os.getenv("EMAIL_SMTP_SERVER", "smtp.gmail.com")
    EMAIL_SMTP_PORT = int(os.getenv("EMAIL_SMTP_PORT", "587"))
    
    # إعدادات الأمان
    JWT_SECRET = os.getenv("JWT_SECRET")
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
    
    # إعدادات Google AI
    GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")
    GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")

class DevelopmentConfig(Config):
    """إعدادات التطوير"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """إعدادات الإنتاج"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """إعدادات الاختبار"""
    DEBUG = True
    TESTING = True

# اختيار الإعداد حسب البيئة
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}