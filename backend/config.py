import os
from dotenv import load_dotenv
from pathlib import Path

# تحميل متغيرات البيئة
env_path_local = Path(__file__).parent.parent / ".env.local"
env_path = Path(__file__).parent.parent / ".env"

load_dotenv(dotenv_path=env_path)
load_dotenv(dotenv_path=env_path_local, override=True)

class Config:
    """إعدادات التطبيق الأساسية"""
    
    # إعدادات Flask
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "google-ads-ai-platform-secret-key-2025")
    DEBUG = os.getenv("FLASK_ENV") == "development"
    
    # إعدادات Google Ads API
    GOOGLE_DEVELOPER_TOKEN = os.getenv("GOOGLE_DEVELOPER_TOKEN")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
    MCC_LOGIN_CUSTOMER_ID = os.getenv("MCC_LOGIN_CUSTOMER_ID")
    
    # إعدادات Supabase
    SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # إعدادات Google AI
    GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")

def validate_config():
    """التحقق من صحة الإعدادات المطلوبة"""
    required_vars = [
        "GOOGLE_DEVELOPER_TOKEN",
        "GOOGLE_CLIENT_ID", 
        "GOOGLE_CLIENT_SECRET",
        "MCC_LOGIN_CUSTOMER_ID"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"متغيرات البيئة المطلوبة مفقودة: {', '.join(missing_vars)}")
    
    # التحقق من Supabase
    supabase_vars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    supabase_missing = [var for var in supabase_vars if not os.getenv(var)]
    
    if supabase_missing:
        raise ValueError(f"لم يتم تقديم قيم Supabase صالحة: {', '.join(supabase_missing)}")
    
    return True

