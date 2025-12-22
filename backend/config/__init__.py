"""
Config Module - وحدة الإعدادات
"""

class Config:
    """فئة الإعدادات الأساسية"""
    
    def __init__(self):
        self.GOOGLE_ADS_CLIENT_ID = None
        self.GOOGLE_ADS_CLIENT_SECRET = None
        self.GOOGLE_ADS_DEVELOPER_TOKEN = None
        self.GOOGLE_ADS_REFRESH_TOKEN = None
        self.GOOGLE_ADS_LOGIN_CUSTOMER_ID = None
        self.MCC_LOGIN_CUSTOMER_ID = None
        self.SESSION_SECRET_KEY = None
        self.FLASK_ENV = 'development'
        self.FLASK_DEBUG = True
        self.SECRET_KEY = 'dev-secret-key'
    
    def load_from_env(self):
        """تحميل الإعدادات من متغيرات البيئة"""
        import os
        self.GOOGLE_ADS_CLIENT_ID = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.GOOGLE_ADS_CLIENT_SECRET = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        self.GOOGLE_ADS_DEVELOPER_TOKEN = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
        self.GOOGLE_ADS_REFRESH_TOKEN = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')
        self.GOOGLE_ADS_LOGIN_CUSTOMER_ID = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        self.MCC_LOGIN_CUSTOMER_ID = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        self.SESSION_SECRET_KEY = os.getenv('SESSION_SECRET_KEY', 'dev-session-key')
        self.FLASK_ENV = os.getenv('FLASK_ENV', 'development')
        self.FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
        self.SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')

# إنشاء instance افتراضي
config = Config()
