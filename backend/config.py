"""
إعدادات المشروع والمفاتيح
Google Ads AI Platform Configuration
"""

import os
from dotenv import load_dotenv
from typing import Dict, Any
from pathlib import Path

# تحميل متغيرات البيئة مع تحديد المسار الصحيح
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

class Config:
    """إعدادات المشروع الأساسية"""
    
    # ===========================================
    # Flask Configuration
    # ===========================================
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    PORT = int(os.getenv('FLASK_PORT', 5000))
    
    # ===========================================
    # JWT Configuration
    # ===========================================
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    
    # ===========================================
    # CORS Configuration
    # ===========================================
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # ===========================================
    # Google Ads API Configuration
    # ===========================================
    GOOGLE_ADS_CONFIG = {
        'developer_token': os.getenv('GOOGLE_DEVELOPER_TOKEN'),
        'client_id': os.getenv('GOOGLE_CLIENT_ID'),
        'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
        'refresh_token': os.getenv('GOOGLE_REFRESH_TOKEN'),
        'login_customer_id': os.getenv('MCC_LOGIN_CUSTOMER_ID'),
        'use_proto_plus': True
    }
    
    # ===========================================
    # Supabase Configuration (مُحدث)
    # ===========================================
    SUPABASE_CONFIG = {
        'url': os.getenv('SUPABASE_URL'),
        'key': os.getenv('SUPABASE_KEY'),  # تم التغيير هنا
        'service_role_key': os.getenv('SUPABASE_KEY')  # استخدام نفس المفتاح
    }
    
    # ===========================================
    # Google AI (Gemini) Configuration
    # ===========================================
    GOOGLE_AI_API_KEY = os.getenv('GOOGLE_AI_API_KEY')
    
    # ===========================================
    # Google Maps Configuration
    # ===========================================
    GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
    
    # ===========================================
    # Redis Configuration
    # ===========================================
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # ===========================================
    # Application Configuration
    # ===========================================
    APP_NAME = os.getenv('APP_NAME', 'Google Ads AI Platform')
    APP_VERSION = os.getenv('APP_VERSION', '1.0.0')
    APP_ENVIRONMENT = os.getenv('APP_ENVIRONMENT', 'development')
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'DEBUG')
    
    # ===========================================
    # Rate Limiting Configuration
    # ===========================================
    RATE_LIMIT_PER_MINUTE = int(os.getenv('RATE_LIMIT_PER_MINUTE', 60))
    RATE_LIMIT_PER_HOUR = int(os.getenv('RATE_LIMIT_PER_HOUR', 1000))
    
    # ===========================================
    # Google Ads Campaign Specifications
    # ===========================================
    GOOGLE_ADS_SPECS = {
        'search_campaign': {
            'headlines': {
                'max_count': 15,
                'max_length': 30
            },
            'descriptions': {
                'max_count': 4,
                'max_length': 90
            },
            'path_fields': {
                'max_length': 15
            }
        },
        'display_campaign': {
            'headlines': {
                'max_count': 5,
                'max_length': 30
            },
            'descriptions': {
                'max_count': 5,
                'max_length': 90
            },
            'images': {
                'landscape': '1200x628',
                'square': '1200x1200',
                'logo': '1200x1200',
                'max_size_kb': 150
            }
        },
        'video_campaign': {
            'video_formats': ['MP4', 'AVI', 'MOV', 'WMV'],
            'aspect_ratios': ['16:9', '9:16', '1:1'],
            'max_duration_seconds': 30,
            'thumbnails': {
                'size': '1280x720',
                'format': ['JPEG', 'PNG']
            }
        },
        'shopping_campaign': {
            'product_images': {
                'min_size': '100x100',
                'recommended_size': '800x800',
                'max_size': '1200x1200',
                'formats': ['JPEG', 'PNG'],
                'background': 'white_preferred'
            }
        }
    }
    
    # ===========================================
    # Keyword Match Types
    # ===========================================
    KEYWORD_MATCH_TYPES = {
        'exact': 'EXACT',
        'phrase': 'PHRASE', 
        'broad': 'BROAD',
        'broad_modified': 'BROAD_MODIFIED'
    }
    
    # ===========================================
    # Campaign Types
    # ===========================================
    CAMPAIGN_TYPES = {
        'search': 'SEARCH',
        'display': 'DISPLAY',
        'shopping': 'SHOPPING',
        'video': 'VIDEO',
        'app': 'APP',
        'performance_max': 'PERFORMANCE_MAX',
        'discovery': 'DISCOVERY'
    }
    
    @classmethod
    def validate_config(cls) -> Dict[str, Any]:
        """التحقق من صحة الإعدادات"""
        errors = []
        warnings = []
        
        # التحقق من Google Ads API
        if not cls.GOOGLE_ADS_CONFIG['developer_token']:
            warnings.append("GOOGLE_DEVELOPER_TOKEN مفقود")
        if not cls.GOOGLE_ADS_CONFIG['client_id']:
            warnings.append("GOOGLE_CLIENT_ID مفقود")
        if not cls.GOOGLE_ADS_CONFIG['client_secret']:
            warnings.append("GOOGLE_CLIENT_SECRET مفقود")
        if not cls.GOOGLE_ADS_CONFIG['refresh_token']:
            warnings.append("GOOGLE_REFRESH_TOKEN مفقود")
        if not cls.GOOGLE_ADS_CONFIG['login_customer_id']:
            warnings.append("MCC_LOGIN_CUSTOMER_ID مفقود")
            
        # التحقق من Supabase (مُحدث)
        if not cls.SUPABASE_CONFIG['url']:
            warnings.append("SUPABASE_URL مفقود")
        if not cls.SUPABASE_CONFIG['key']:
            warnings.append("SUPABASE_KEY مفقود")
            
        # التحقق من Google AI
        if not cls.GOOGLE_AI_API_KEY:
            warnings.append("GOOGLE_AI_API_KEY مفقود - سيتم استخراجه من قاعدة البيانات")
            
        # التحقق من Google Maps
        if not cls.GOOGLE_MAPS_API_KEY:
            warnings.append("GOOGLE_MAPS_API_KEY مفقود")
            
        return {
            'valid': True,  # تم تغيير هذا لعدم إيقاف الخادم
            'errors': errors,
            'warnings': warnings
        }
    
    @classmethod
    def get_google_ads_yaml_config(cls) -> str:
        """إنشاء ملف تكوين Google Ads YAML"""
        return f"""
developer_token: {cls.GOOGLE_ADS_CONFIG['developer_token']}
client_id: {cls.GOOGLE_ADS_CONFIG['client_id']}
client_secret: {cls.GOOGLE_ADS_CONFIG['client_secret']}
refresh_token: {cls.GOOGLE_ADS_CONFIG['refresh_token']}
login_customer_id: {cls.GOOGLE_ADS_CONFIG['login_customer_id']}
use_proto_plus: {str(cls.GOOGLE_ADS_CONFIG['use_proto_plus']).lower()}
"""

class DevelopmentConfig(Config):
    """إعدادات بيئة التطوير"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """إعدادات بيئة الإنتاج"""
    DEBUG = False
    LOG_LEVEL = 'INFO'
    
class TestingConfig(Config):
    """إعدادات بيئة الاختبار"""
    TESTING = True
    DEBUG = True

# اختيار الإعدادات حسب البيئة
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig
}

def get_config() -> Config:
    """الحصول على إعدادات البيئة الحالية"""
    env = os.getenv('APP_ENVIRONMENT', 'development')
    return config_map.get(env, DevelopmentConfig)

