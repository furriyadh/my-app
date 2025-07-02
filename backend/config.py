"""
إعدادات المشروع والمفاتيح - محدث لحل مشكلة OAuth
Google Ads AI Platform Configuration
"""

import os
from dotenv import load_dotenv
from typing import Dict, Any
from pathlib import Path

# تحميل متغيرات البيئة مع تحديد المسار الصحيح
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

class Config:
    """إعدادات المشروع الأساسية"""
    
    # ===================================================
    # Flask Configuration
    # ===================================================
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    PORT = int(os.getenv('FLASK_PORT', 5000))
    
    # ===================================================
    # JWT Configuration
    # ===================================================
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    
    # ===================================================
    # CORS Configuration
    # ===================================================
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # ===================================================
    # Google Ads API Configuration - محدث بالقيم الجديدة
    # ===================================================
    GOOGLE_ADS_CONFIG = {
        'developer_token': os.getenv('GOOGLE_DEVELOPER_TOKEN'),
        'client_id': os.getenv('GOOGLE_CLIENT_ID_NEW'),          # ⭐ استخدام Client ID الجديد
        'client_secret': os.getenv('GOOGLE_CLIENT_SECRET_NEW'),   # ⭐ استخدام Client Secret الجديد
        'refresh_token': os.getenv('GOOGLE_REFRESH_TOKEN'),
        'login_customer_id': os.getenv('MCC_LOGIN_CUSTOMER_ID'),
        'use_proto_plus': True
    }
    
    # ===================================================
    # OAuth Configuration - للتوافق مع Frontend
    # ===================================================
    OAUTH_CONFIG = {
        'google_client_id': os.getenv('GOOGLE_CLIENT_ID_NEW'),
        'google_client_secret': os.getenv('GOOGLE_CLIENT_SECRET_NEW'),
        'redirect_uri': os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/api/oauth/callback'),
        'scopes': [
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
    }
    
    # ===================================================
    # Supabase Configuration (تحديث)
    # ===================================================
    SUPABASE_CONFIG = {
        'url': os.getenv('SUPABASE_URL'),
        'key': os.getenv('SUPABASE_ANON_KEY'),
        'service_role_key': os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    }
    
    # ===================================================
    # Database Configuration
    # ===================================================
    DATABASE_CONFIG = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', 5432)),
        'name': os.getenv('DB_NAME', 'furriyadh_db'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', ''),
        'ssl_mode': os.getenv('DB_SSL_MODE', 'prefer')
    }
    
    # ===================================================
    # Logging Configuration
    # ===================================================
    LOGGING_CONFIG = {
        'level': os.getenv('LOG_LEVEL', 'INFO'),
        'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        'file': os.getenv('LOG_FILE', 'app.log')
    }
    
    # ===================================================
    # Security Configuration
    # ===================================================
    SECURITY_CONFIG = {
        'secret_key': os.getenv('SECRET_KEY', 'your-secret-key-here'),
        'password_salt': os.getenv('PASSWORD_SALT', 'your-salt-here'),
        'session_timeout': int(os.getenv('SESSION_TIMEOUT', 3600))
    }
    
    @classmethod
    def validate_config(cls) -> bool:
        """التحقق من صحة الإعدادات المطلوبة"""
        required_vars = [
            'GOOGLE_CLIENT_ID_NEW',
            'GOOGLE_CLIENT_SECRET_NEW',
            'GOOGLE_DEVELOPER_TOKEN',
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"⚠️ متغيرات البيئة المفقودة: {', '.join(missing_vars)}")
            return False
        
        print("✅ جميع متغيرات البيئة المطلوبة موجودة")
        return True
    
    @classmethod
    def get_google_ads_config(cls) -> Dict[str, Any]:
        """الحصول على إعدادات Google Ads API"""
        return cls.GOOGLE_ADS_CONFIG.copy()
    
    @classmethod
    def get_oauth_config(cls) -> Dict[str, Any]:
        """الحصول على إعدادات OAuth"""
        return cls.OAUTH_CONFIG.copy()
    
    @classmethod
    def get_supabase_config(cls) -> Dict[str, Any]:
        """الحصول على إعدادات Supabase"""
        return cls.SUPABASE_CONFIG.copy()

# إنشاء instance من الإعدادات
config = Config()

# التحقق من الإعدادات عند تحميل الملف
if __name__ == "__main__":
    config.validate_config()

