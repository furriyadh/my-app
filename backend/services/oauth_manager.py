"""
OAuth Manager - مدير المصادقة OAuth مُصحح ومُحسن
يحل مشاكل OAuth والمصادقة مع Google APIs
"""
import os
import json
import logging
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
from urllib.parse import urlencode, parse_qs
import requests

# إعداد التسجيل
logger = logging.getLogger(__name__)

class OAuthManager:
    """مدير OAuth للمصادقة مع Google APIs"""
    
    def __init__(self):
        # إعدادات OAuth
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/api/oauth/google/callback')
        
        # URLs للمصادقة
        self.auth_url = 'https://accounts.google.com/o/oauth2/auth'
        self.token_url = 'https://oauth2.googleapis.com/token'
        self.userinfo_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        
        # Scopes مطلوبة
        self.scopes = [
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
        
        # تخزين مؤقت للـ tokens
        self.tokens_cache = {}
        
        # فحص التكوين
        self.is_configured = self._check_configuration()
        
        if self.is_configured:
            logger.info("✅ تم تهيئة OAuth Manager بنجاح")
        else:
            logger.warning("⚠️ OAuth Manager غير مُكون بالكامل")
    
    def _check_configuration(self) -> bool:
        """فحص تكوين OAuth"""
        required_vars = ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET']
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            logger.warning(f"متغيرات OAuth مفقودة: {missing_vars}")
            return False
        
        return True
    
    def generate_auth_url(self, state: Optional[str] = None) -> Tuple[str, str]:
        """إنشاء URL للمصادقة"""
        if not self.is_configured:
            raise ValueError("OAuth غير مُكون - تحقق من متغيرات البيئة")
        
        # إنشاء state عشوائي للأمان
        if not state:
            state = secrets.token_urlsafe(32)
        
        # معاملات المصادقة
        auth_params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': ' '.join(self.scopes),
            'response_type': 'code',
            'access_type': 'offline',
            # إزالة prompt تماماً
            'state': state
        }
        
        auth_url = f"{self.auth_url}?{urlencode(auth_params)}"
        
        logger.info(f"تم إنشاء URL للمصادقة: {auth_url[:100]}...")
        return auth_url, state
    
    def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        """تبديل authorization code بـ access token"""
        if not self.is_configured:
            raise ValueError("OAuth غير مُكون")
        
        try:
            # معاملات طلب الـ token
            token_data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': self.redirect_uri
            }
            
            # طلب الـ tokens
            response = requests.post(
                self.token_url,
                data=token_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=30
            )
            
            response.raise_for_status()
            tokens = response.json()
            
            # إضافة معلومات إضافية
            tokens['created_at'] = datetime.utcnow().isoformat()
            tokens['expires_at'] = (
                datetime.utcnow() + timedelta(seconds=tokens.get('expires_in', 3600))
            ).isoformat()
            
            # حفظ في الـ cache
            user_id = self._get_user_id_from_token(tokens.get('access_token'))
            if user_id:
                self.tokens_cache[user_id] = tokens
            
            logger.info("✅ تم تبديل الكود بـ tokens بنجاح")
            return tokens
            
        except requests.RequestException as e:
            logger.error(f"خطأ في طلب الـ tokens: {e}")
            raise
        except Exception as e:
            logger.error(f"خطأ غير متوقع في تبديل الكود: {e}")
            raise
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """تجديد access token باستخدام refresh token"""
        if not self.is_configured:
            raise ValueError("OAuth غير مُكون")
        
        try:
            # معاملات تجديد الـ token
            refresh_data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            }
            
            # طلب تجديد الـ token
            response = requests.post(
                self.token_url,
                data=refresh_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=30
            )
            
            response.raise_for_status()
            new_tokens = response.json()
            
            # إضافة refresh token إذا لم يتم إرجاعه
            if 'refresh_token' not in new_tokens:
                new_tokens['refresh_token'] = refresh_token
            
            # إضافة معلومات إضافية
            new_tokens['created_at'] = datetime.utcnow().isoformat()
            new_tokens['expires_at'] = (
                datetime.utcnow() + timedelta(seconds=new_tokens.get('expires_in', 3600))
            ).isoformat()
            
            logger.info("✅ تم تجديد access token بنجاح")
            return new_tokens
            
        except requests.RequestException as e:
            logger.error(f"خطأ في تجديد الـ token: {e}")
            raise
        except Exception as e:
            logger.error(f"خطأ غير متوقع في تجديد الـ token: {e}")
            raise
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """الحصول على معلومات المستخدم"""
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            
            response = requests.get(
                self.userinfo_url,
                headers=headers,
                timeout=30
            )
            
            response.raise_for_status()
            user_info = response.json()
            
            logger.info(f"تم الحصول على معلومات المستخدم: {user_info.get('email', 'unknown')}")
            return user_info
            
        except requests.RequestException as e:
            logger.error(f"خطأ في الحصول على معلومات المستخدم: {e}")
            raise
        except Exception as e:
            logger.error(f"خطأ غير متوقع في الحصول على معلومات المستخدم: {e}")
            raise
    
    def _get_user_id_from_token(self, access_token: str) -> Optional[str]:
        """الحصول على معرف المستخدم من الـ token"""
        try:
            user_info = self.get_user_info(access_token)
            return user_info.get('id') or user_info.get('email')
        except:
            return None
    
    def validate_token(self, access_token: str) -> bool:
        """التحقق من صحة الـ token"""
        try:
            # محاولة الحصول على معلومات المستخدم
            self.get_user_info(access_token)
            return True
        except:
            return False
    
    def is_token_expired(self, tokens: Dict[str, Any]) -> bool:
        """فحص انتهاء صلاحية الـ token"""
        try:
            expires_at = tokens.get('expires_at')
            if not expires_at:
                return True
            
            expiry_time = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            return datetime.utcnow() >= expiry_time
            
        except:
            return True
    
    def get_valid_token(self, user_id: str) -> Optional[str]:
        """الحصول على token صالح للمستخدم"""
        try:
            tokens = self.tokens_cache.get(user_id)
            if not tokens:
                return None
            
            # فحص انتهاء الصلاحية
            if not self.is_token_expired(tokens):
                return tokens.get('access_token')
            
            # محاولة التجديد
            refresh_token = tokens.get('refresh_token')
            if refresh_token:
                new_tokens = self.refresh_access_token(refresh_token)
                self.tokens_cache[user_id] = new_tokens
                return new_tokens.get('access_token')
            
            return None
            
        except Exception as e:
            logger.error(f"خطأ في الحصول على token صالح: {e}")
            return None
    
    def revoke_token(self, token: str) -> bool:
        """إلغاء الـ token"""
        try:
            revoke_url = f"https://oauth2.googleapis.com/revoke?token={token}"
            
            response = requests.post(revoke_url, timeout=30)
            response.raise_for_status()
            
            logger.info("✅ تم إلغاء الـ token بنجاح")
            return True
            
        except Exception as e:
            logger.error(f"خطأ في إلغاء الـ token: {e}")
            return False
    
    def get_status(self) -> Dict[str, Any]:
        """الحصول على حالة OAuth Manager"""
        return {
            'configured': self.is_configured,
            'client_id_configured': bool(self.client_id),
            'client_secret_configured': bool(self.client_secret),
            'redirect_uri': self.redirect_uri,
            'scopes': self.scopes,
            'cached_tokens_count': len(self.tokens_cache),
            'auth_url': self.auth_url,
            'token_url': self.token_url
        }

# إنشاء مثيل عام
oauth_manager = OAuthManager()

# دوال مساعدة
def is_oauth_configured() -> bool:
    """فحص تكوين OAuth"""
    return oauth_manager.is_configured

def get_oauth_status() -> Dict[str, Any]:
    """الحصول على حالة OAuth"""
    return oauth_manager.get_status()

def create_auth_url(state: Optional[str] = None) -> Tuple[str, str]:
    """إنشاء URL للمصادقة"""
    return oauth_manager.generate_auth_url(state)

def exchange_code(code: str) -> Dict[str, Any]:
    """تبديل الكود بـ tokens"""
    return oauth_manager.exchange_code_for_tokens(code)

def get_user_info(access_token: str) -> Dict[str, Any]:
    """الحصول على معلومات المستخدم"""
    return oauth_manager.get_user_info(access_token)

# تصدير الكلاسات والدوال
__all__ = [
    'OAuthManager',
    'oauth_manager',
    'is_oauth_configured',
    'get_oauth_status',
    'create_auth_url',
    'exchange_code',
    'get_user_info'
]

# تسجيل حالة التحميل
logger.info(f"🔐 تم تحميل OAuth Manager - مُكون: {oauth_manager.is_configured}")

