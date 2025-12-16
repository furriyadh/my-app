#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OAuth Handler للباك اند - محدث لحل مشكلة OAuth
معالج OAuth لـ Google Ads API مع الدعم الكامل للتكامل
"""

import os
import json
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import requests
from urllib.parse import urlencode, parse_qs
import base64
import hashlib
import secrets

# إعداد الـ logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleOAuthHandler:
    """معالج OAuth لـ Google Ads API"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        تهيئة معالج OAuth
        
        Args:
            config: إعدادات OAuth من ملف config.py
        """
        self.client_id = config.get('google_client_id')
        self.client_secret = config.get('google_client_secret')
        self.redirect_uri = config.get('redirect_uri')
        self.scopes = config.get('scopes', [])
        
        # Google OAuth endpoints
        self.auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        self.token_url = "https://oauth2.googleapis.com/token"
        self.userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        
        # التحقق من الإعدادات المطلوبة
        self._validate_config()
    
    def _validate_config(self) -> None:
        """التحقق من صحة إعدادات OAuth"""
        required_fields = ['client_id', 'client_secret', 'redirect_uri']
        missing_fields = [field for field in required_fields if not getattr(self, field)]
        
        if missing_fields:
            raise ValueError(f"إعدادات OAuth مفقودة: {', '.join(missing_fields)}")
        
        logger.info("✅ تم التحقق من إعدادات OAuth بنجاح")
    
    def generate_auth_url(self, state: Optional[str] = None) -> Tuple[str, str]:
        """
        إنشاء رابط المصادقة
        
        Args:
            state: حالة اختيارية للأمان
            
        Returns:
            Tuple[str, str]: (auth_url, state)
        """
        if not state:
            state = secrets.token_urlsafe(32)
        
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': ' '.join(self.scopes),
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent',
            'state': state,
            'include_granted_scopes': 'true'
        }
        
        auth_url = f"{self.auth_url}?{urlencode(params)}"
        
        logger.info(f"🔗 تم إنشاء رابط المصادقة: {auth_url[:100]}...")
        return auth_url, state
    
    def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        """
        تبديل authorization code بـ access token
        
        Args:
            code: Authorization code من Google
            
        Returns:
            Dict[str, Any]: معلومات الـ tokens
        """
        try:
            data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': self.redirect_uri
            }
            
            logger.info("🔄 تبديل authorization code بـ access token...")
            
            response = requests.post(self.token_url, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            
            # إضافة معلومات إضافية
            token_data['created_at'] = datetime.utcnow().isoformat()
            token_data['expires_at'] = (
                datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 3600))
            ).isoformat()
            
            logger.info("✅ تم الحصول على access token بنجاح")
            return token_data
            
        except requests.RequestException as e:
            logger.error(f"❌ خطأ في تبديل authorization code: {e}")
            raise Exception(f"فشل في الحصول على access token: {e}")
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        تجديد access token باستخدام refresh token
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            Dict[str, Any]: معلومات الـ token الجديد
        """
        try:
            data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            }
            
            logger.info("🔄 تجديد access token...")
            
            response = requests.post(self.token_url, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            
            # إضافة معلومات إضافية
            token_data['created_at'] = datetime.utcnow().isoformat()
            token_data['expires_at'] = (
                datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 3600))
            ).isoformat()
            
            # الاحتفاظ بـ refresh token إذا لم يتم إرجاع واحد جديد
            if 'refresh_token' not in token_data:
                token_data['refresh_token'] = refresh_token
            
            logger.info("✅ تم تجديد access token بنجاح")
            return token_data
            
        except requests.RequestException as e:
            logger.error(f"❌ خطأ في تجديد access token: {e}")
            raise Exception(f"فشل في تجديد access token: {e}")
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        الحصول على معلومات المستخدم
        
        Args:
            access_token: Access token
            
        Returns:
            Dict[str, Any]: معلومات المستخدم
        """
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            
            logger.info("👤 الحصول على معلومات المستخدم...")
            
            response = requests.get(self.userinfo_url, headers=headers)
            response.raise_for_status()
            
            user_info = response.json()
            
            logger.info(f"✅ تم الحصول على معلومات المستخدم: {user_info.get('email', 'غير محدد')}")
            return user_info
            
        except requests.RequestException as e:
            logger.error(f"❌ خطأ في الحصول على معلومات المستخدم: {e}")
            raise Exception(f"فشل في الحصول على معلومات المستخدم: {e}")
    
    def validate_token(self, access_token: str) -> bool:
        """
        التحقق من صحة access token
        
        Args:
            access_token: Access token للتحقق منه
            
        Returns:
            bool: True إذا كان الـ token صحيح
        """
        try:
            user_info = self.get_user_info(access_token)
            return bool(user_info.get('email'))
        except:
            return False
    
    def revoke_token(self, token: str) -> bool:
        """
        إلغاء access token
        
        Args:
            token: Token للإلغاء
            
        Returns:
            bool: True إذا تم الإلغاء بنجاح
        """
        try:
            revoke_url = f"https://oauth2.googleapis.com/revoke?token={token}"
            
            logger.info("🚫 إلغاء access token...")
            
            response = requests.post(revoke_url)
            response.raise_for_status()
            
            logger.info("✅ تم إلغاء access token بنجاح")
            return True
            
        except requests.RequestException as e:
            logger.error(f"❌ خطأ في إلغاء access token: {e}")
            return False

def create_oauth_handler(config: Dict[str, Any]) -> GoogleOAuthHandler:
    """
    إنشاء معالج OAuth
    
    Args:
        config: إعدادات OAuth
        
    Returns:
        GoogleOAuthHandler: معالج OAuth
    """
    return GoogleOAuthHandler(config)

# إنشاء نسخة عامة للاستخدام في التطبيق
# استخدام متغيرات البيئة مباشرة لتجنب مشاكل الاستيراد الدائري
try:
    oauth_config = {
        'google_client_id': os.getenv('GOOGLE_ADS_CLIENT_ID'),
        'google_client_secret': os.getenv('GOOGLE_ADS_CLIENT_SECRET'),
        'redirect_uri': os.getenv('OAUTH_REDIRECT_URI', 'http://localhost:3000/api/oauth/google/callback'),
        'scopes': os.getenv('GOOGLE_OAUTH_SCOPES', '').split(' ') if os.getenv('GOOGLE_OAUTH_SCOPES') else [
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.force-ssl'
        ]
    }
    
    # تحديث redirect_uri للإنتاج
    if os.getenv('NODE_ENV') == 'production':
        oauth_config['redirect_uri'] = 'https://furriyadh.com/api/oauth/google/callback'
        
    oauth_manager = create_oauth_handler(oauth_config)
    logger.info("✅ تم تهيئة oauth_manager بنجاح")
except Exception as e:
    logger.error(f"❌ فشل تهيئة oauth_manager: {e}")
    oauth_manager = None

# مثال على الاستخدام
if __name__ == "__main__":
    # إعدادات تجريبية
    test_config = {
        'google_client_id': os.getenv('GOOGLE_ADS_CLIENT_ID_NEW'),
        'google_client_secret': os.getenv('GOOGLE_ADS_CLIENT_SECRET_NEW'),
                    'redirect_uri': os.getenv('GOOGLE_OAUTH_REDIRECT_URI') or (
                        'https://furriyadh.com/api/oauth/google/callback' if os.getenv('NODE_ENV') == 'production' 
                        else 'http://localhost:3000/api/oauth/google/callback'
                    ),
        'scopes': [
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
    }
    
    try:
        oauth_handler = create_oauth_handler(test_config)
        auth_url, state = oauth_handler.generate_auth_url()
        print(f"🔗 رابط المصادقة: {auth_url}")
        print(f"🔐 State: {state}")
    except Exception as e:
        print(f"❌ خطأ: {e}")

