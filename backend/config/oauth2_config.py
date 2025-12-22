"""
OAuth Configuration - إعدادات OAuth لربط الحسابات الإعلانية
يحل مشاكل ربط الحسابات الإعلانية بالحساب الإداري
"""

import os
from typing import Dict, Any, List

class OAuthConfig:
    """إعدادات OAuth لربط الحسابات الإعلانية"""
    
    def __init__(self):
        # إعدادات Google OAuth
        self.google_client_id = os.getenv('GOOGLE_ADS_CLIENT_ID') or os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.google_client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET') or os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        # تحديد redirect URI حسب البيئة
        if os.getenv('NODE_ENV') == 'production':
            self.google_redirect_uri = os.getenv('GOOGLE_OAUTH_REDIRECT_URI', 'https://furriyadh.com/api/oauth/google/callback')
        else:
            self.google_redirect_uri = os.getenv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost:3000/api/oauth/google/callback')
        
        # إعدادات Google Ads API
        self.google_ads_developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
        self.google_ads_login_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        self.mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        
        # إعدادات الجلسة
        self.session_secret_key = os.getenv('SESSION_SECRET_KEY', 'your-secret-key-change-this')
        self.session_lifetime = int(os.getenv('SESSION_LIFETIME', '3600'))  # ساعة واحدة
        
        # Scopes مطلوبة
        self.required_scopes = [
            'https://www.googleapis.com/auth/adwords',  # Google Ads API
            'https://www.googleapis.com/auth/userinfo.email',  # معلومات البريد الإلكتروني
            'https://www.googleapis.com/auth/userinfo.profile',  # معلومات الملف الشخصي
            'https://www.googleapis.com/auth/analytics.readonly'  # Google Analytics (اختياري)
        ]
        
        # إعدادات الأمان
        self.csrf_protection = os.getenv('CSRF_PROTECTION', 'True').lower() == 'true'
        self.secure_cookies = os.getenv('SECURE_COOKIES', 'False').lower() == 'true'
        
        # فحص التكوين
        self.is_valid = self._validate_configuration()
    
    def _validate_configuration(self) -> bool:
        """التحقق من صحة الإعدادات"""
        required_vars = [
            'google_client_id',
            'google_client_secret',
            'google_ads_developer_token'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not getattr(self, var):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"⚠️ متغيرات OAuth مفقودة: {missing_vars}")
            return False
        
        return True
    
    def get_google_oauth_config(self) -> Dict[str, Any]:
        """الحصول على إعدادات Google OAuth"""
        return {
            'client_id': self.google_client_id,
            'client_secret': self.google_client_secret,
            'redirect_uri': self.google_redirect_uri,
            'scopes': self.required_scopes,
            'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth',
            'token_url': 'https://oauth2.googleapis.com/token',
            'userinfo_url': 'https://www.googleapis.com/oauth2/v2/userinfo',
            'revoke_url': 'https://oauth2.googleapis.com/revoke'
        }
    
    def get_google_ads_config(self) -> Dict[str, Any]:
        """الحصول على إعدادات Google Ads API"""
        return {
            'developer_token': self.google_ads_developer_token,
            'login_customer_id': self.google_ads_login_customer_id,
            'mcc_customer_id': self.mcc_customer_id,
            'use_proto_plus': True
        }
    
    def get_session_config(self) -> Dict[str, Any]:
        """الحصول على إعدادات الجلسة"""
        return {
            'secret_key': self.session_secret_key,
            'lifetime': self.session_lifetime,
            'secure': self.secure_cookies,
            'httponly': True,
            'samesite': 'Lax'
        }
    
    def get_security_config(self) -> Dict[str, Any]:
        """الحصول على إعدادات الأمان"""
        return {
            'csrf_protection': self.csrf_protection,
            'secure_cookies': self.secure_cookies,
            'session_secure': self.secure_cookies
        }
    
    def get_all_config(self) -> Dict[str, Any]:
        """الحصول على جميع الإعدادات"""
        return {
            'oauth': self.get_google_oauth_config(),
            'google_ads': self.get_google_ads_config(),
            'session': self.get_session_config(),
            'security': self.get_security_config(),
            'is_valid': self.is_valid
        }
    
    def print_config_summary(self):
        """طباعة ملخص الإعدادات"""
        print("🔧 إعدادات OAuth:")
        print(f"   ✅ Google Client ID: {'مُعين' if self.google_client_id else 'غير مُعين'}")
        print(f"   ✅ Google Client Secret: {'مُعين' if self.google_client_secret else 'غير مُعين'}")
        print(f"   ✅ Google Ads Developer Token: {'مُعين' if self.google_ads_developer_token else 'غير مُعين'}")
        print(f"   ✅ MCC Customer ID: {'مُعين' if self.mcc_customer_id else 'غير مُعين'}")
        print(f"   ✅ Redirect URI: {self.google_redirect_uri}")
        print(f"   ✅ التكوين صحيح: {'نعم' if self.is_valid else 'لا'}")
        
        if not self.is_valid:
            print("⚠️ يرجى تعيين المتغيرات المطلوبة في ملف .env")

# إنشاء instance عام
oauth_config = OAuthConfig()

# دوال مساعدة
def get_oauth_config():
    """الحصول على إعدادات OAuth"""
    return oauth_config.get_all_config()

def is_oauth_configured():
    """التحقق من تكوين OAuth"""
    return oauth_config.is_valid

def print_oauth_config():
    """طباعة إعدادات OAuth"""
    oauth_config.print_config_summary()
