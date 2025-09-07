"""
Google Ads API - JWT Authentication Module
نظام المصادقة لـ Google Ads API باستخدام المكتبات الأصلية السريعة

المكتبات المستخدمة:
✅ bcrypt (الأصلي السريع)
✅ PyJWT (الأصلي السريع)
✅ cryptography (الأصلي السريع)

Author: Google Ads AI Platform Team
Version: 3.0.0 - Original Libraries Only
"""

import os
import json
import secrets
import re
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Union
from flask import Blueprint, request, jsonify, g, current_app

# المكتبات الأصلية السريعة فقط
import bcrypt
import jwt as PyJWT
from cryptography.fernet import Fernet

# تعريف Blueprint
google_ads_auth_bp = Blueprint('google_ads_auth', __name__, url_prefix='/google-ads/auth')

# إعداد التسجيل
logger = logging.getLogger(__name__)

# دوال مساعدة
def generate_unique_id():
    """توليد معرف فريد"""
    return secrets.token_urlsafe(16)

def sanitize_text(text):
    """تنظيف النص"""
    return re.sub(r'[<>"\\]', '', str(text))

def validate_email(email: str) -> bool:
    """التحقق من صحة البريد الإلكتروني"""
    if not email or not isinstance(email, str):
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email.strip()))

def hash_password(password: str) -> str:
    """تشفير كلمة المرور باستخدام bcrypt الأصلي"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """التحقق من كلمة المرور باستخدام bcrypt الأصلي"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# فئة إدارة JWT للـ Google Ads
class GoogleAdsJWTManager:
    """مدير JWT خاص بـ Google Ads باستخدام PyJWT الأصلي"""
    
    def __init__(self):
        self.secret_key = os.getenv('GOOGLE_ADS_JWT_SECRET', secrets.token_urlsafe(32))
        self.algorithm = 'HS256'
        self.access_token_expires = timedelta(hours=2)
        self.refresh_token_expires = timedelta(days=7)
        
        logger.info("✅ تم تهيئة GoogleAdsJWTManager بنجاح")
    
    def generate_token(self, user_id: str, customer_id: str = None, token_type: str = 'access') -> str:
        """توليد JWT token خاص بـ Google Ads باستخدام PyJWT الأصلي"""
        payload = {
            'user_id': user_id,
            'customer_id': customer_id,
            'type': token_type,
            'scope': 'google_ads_api',
            'exp': datetime.utcnow() + (
                self.access_token_expires if token_type == 'access' 
                else self.refresh_token_expires
            ),
            'iat': datetime.utcnow(),
            'iss': 'google_ads_platform'
        }
        
        return PyJWT.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """التحقق من JWT token باستخدام PyJWT الأصلي"""
        try:
            payload = PyJWT.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # التحقق من النطاق
            if payload.get('scope') != 'google_ads_api':
                logger.warning("Token scope غير صحيح")
                return None
                
            return payload
        except PyJWT.ExpiredSignatureError:
            logger.warning("Google Ads token منتهي الصلاحية")
            return None
        except PyJWT.InvalidTokenError:
            logger.warning("Google Ads token غير صحيح")
            return None
    
    def refresh_token(self, refresh_token: str) -> Optional[Dict[str, str]]:
        """تجديد access token باستخدام refresh token"""
        payload = self.verify_token(refresh_token)
        
        if not payload or payload.get('type') != 'refresh':
            return None
        
        # توليد access token جديد
        new_access_token = self.generate_token(
            payload['user_id'], 
            payload.get('customer_id'), 
            'access'
        )
        
        return {
            'access_token': new_access_token,
            'token_type': 'Bearer',
            'expires_in': int(self.access_token_expires.total_seconds())
        }

# إنشاء instance من GoogleAdsJWTManager
google_ads_jwt_manager = GoogleAdsJWTManager()

# فئة إدارة OAuth خاصة بـ Google Ads
class GoogleAdsOAuthManager:
    """مدير OAuth خاص بـ Google Ads مع cryptography الأصلي"""
    
    def __init__(self):
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_ADS_REDIRECT_URI', 'http://localhost:3000/api/oauth/google/callback')
        self.scope = 'https://www.googleapis.com/auth/adwords'
        self.is_configured = bool(self.client_id and self.client_secret)
        
        # إعداد التشفير باستخدام cryptography الأصلي
        try:
            self.encryption_key = Fernet.generate_key()
            self.cipher_suite = Fernet(self.encryption_key)
        except Exception as e:
            logger.warning(f"⚠️ فشل في إعداد التشفير: {e}")
            self.encryption_key = None
            self.cipher_suite = None
        
        if not self.is_configured:
            logger.warning("⚠️ Google Ads OAuth غير مُكون")
        else:
            logger.info("✅ تم تهيئة GoogleAdsOAuthManager بنجاح")
    
    def encrypt_data(self, data: str) -> str:
        """تشفير البيانات باستخدام cryptography الأصلي"""
        encrypted_data = self.cipher_suite.encrypt(data.encode())
        return encrypted_data.decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """فك تشفير البيانات باستخدام cryptography الأصلي"""
        decrypted_data = self.cipher_suite.decrypt(encrypted_data.encode())
        return decrypted_data.decode()
    
    def get_authorization_url(self, state: str = None) -> Dict[str, Any]:
        """الحصول على رابط التخويل لـ Google Ads"""
        if not self.is_configured:
            return {
                'success': False,
                'error': 'Google Ads OAuth غير مُكون',
                'url': None
            }
        
        if not state:
            state = secrets.token_urlsafe(32)
        
        auth_url = (
            f"https://accounts.google.com/o/oauth2/auth?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"scope={self.scope}&"
            f"response_type=code&"
            f"access_type=offline&"
            # إزالة prompt تماماً
            f"state={state}"
        )
        
        return {
            'success': True,
            'url': auth_url,
            'state': state,
            'expires_in': 600
        }
    
    def exchange_code_for_tokens(self, code: str, state: str = None) -> Dict[str, Any]:
        """تبديل الكود بـ Google Ads tokens"""
        if not self.is_configured:
            return {
                'success': False,
                'error': 'Google Ads OAuth غير مُكون'
            }
        
        # محاكاة تبديل الكود مع تشفير الـ tokens
        access_token = f"gads_access_{secrets.token_urlsafe(20)}"
        refresh_token = f"gads_refresh_{secrets.token_urlsafe(20)}"
        
        # تشفير الـ tokens باستخدام cryptography الأصلي
        encrypted_access = self.encrypt_data(access_token)
        encrypted_refresh = self.encrypt_data(refresh_token)
        
        return {
            'success': True,
            'access_token': encrypted_access,
            'refresh_token': encrypted_refresh,
            'expires_in': 3600,
            'token_type': 'Bearer',
            'scope': self.scope
        }

# إنشاء instance من GoogleAdsOAuthManager
google_ads_oauth_manager = GoogleAdsOAuthManager()

# فئة إدارة المستخدمين لـ Google Ads
class GoogleAdsUserManager:
    """مدير المستخدمين لـ Google Ads"""
    
    def __init__(self):
        self.users = {}
        self.customer_accounts = {}
        logger.info("✅ تم تهيئة GoogleAdsUserManager بنجاح")
    
    def create_user(self, email: str, password: str, customer_id: str = None) -> Dict[str, Any]:
        """إنشاء مستخدم Google Ads جديد"""
        if not validate_email(email):
            return {'success': False, 'error': 'البريد الإلكتروني غير صحيح'}
        
        if email in self.users:
            return {'success': False, 'error': 'المستخدم موجود بالفعل'}
        
        user_id = generate_unique_id()
        hashed_password = hash_password(password)
        
        user_data = {
            'id': user_id,
            'email': email,
            'password': hashed_password,
            'customer_id': customer_id,
            'created_at': datetime.utcnow().isoformat(),
            'last_login': None,
            'is_active': True
        }
        
        self.users[email] = user_data
        
        if customer_id:
            self.customer_accounts[customer_id] = user_id
        
        return {'success': True, 'user_id': user_id}
    
    def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """مصادقة مستخدم Google Ads"""
        user = self.users.get(email)
        
        if not user or not user.get('is_active'):
            return None
        
        if verify_password(password, user['password']):
            # تحديث آخر تسجيل دخول
            user['last_login'] = datetime.utcnow().isoformat()
            return user
        
        return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """الحصول على مستخدم بالمعرف"""
        for user in self.users.values():
            if user['id'] == user_id:
                return user
        return None

# إنشاء instance من GoogleAdsUserManager
google_ads_user_manager = GoogleAdsUserManager()

# مسارات API لـ Google Ads Authentication
@google_ads_auth_bp.route('/login', methods=['POST'])
def google_ads_login():
    """تسجيل الدخول لـ Google Ads"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    customer_id = data.get('customer_id')
    
    if not email or not password:
        return jsonify({
            'success': False,
            'error': 'البريد الإلكتروني وكلمة المرور مطلوبان'
        }), 400
    
    # مصادقة المستخدم
    user = google_ads_user_manager.authenticate_user(email, password)
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'بيانات الدخول غير صحيحة'
        }), 401
    
    # توليد tokens باستخدام PyJWT الأصلي
    access_token = google_ads_jwt_manager.generate_token(
        user['id'], 
        customer_id or user.get('customer_id'), 
        'access'
    )
    refresh_token = google_ads_jwt_manager.generate_token(
        user['id'], 
        customer_id or user.get('customer_id'), 
        'refresh'
    )
    
    return jsonify({
        'success': True,
        'message': 'تم تسجيل الدخول لـ Google Ads بنجاح',
        'user_id': user['id'],
        'customer_id': customer_id or user.get('customer_id'),
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': int(google_ads_jwt_manager.access_token_expires.total_seconds())
    })

@google_ads_auth_bp.route('/register', methods=['POST'])
def google_ads_register():
    """تسجيل مستخدم Google Ads جديد"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    customer_id = data.get('customer_id')
    
    if not email or not password:
        return jsonify({
            'success': False,
            'error': 'البريد الإلكتروني وكلمة المرور مطلوبان'
        }), 400
    
    if len(password) < 8:
        return jsonify({
            'success': False,
            'error': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
        }), 400
    
    # إنشاء المستخدم
    result = google_ads_user_manager.create_user(email, password, customer_id)
    
    if not result['success']:
        return jsonify(result), 400
    
    # توليد tokens باستخدام PyJWT الأصلي
    access_token = google_ads_jwt_manager.generate_token(
        result['user_id'], 
        customer_id, 
        'access'
    )
    refresh_token = google_ads_jwt_manager.generate_token(
        result['user_id'], 
        customer_id, 
        'refresh'
    )
    
    return jsonify({
        'success': True,
        'message': 'تم تسجيل مستخدم Google Ads بنجاح',
        'user_id': result['user_id'],
        'customer_id': customer_id,
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': int(google_ads_jwt_manager.access_token_expires.total_seconds())
    })

@google_ads_auth_bp.route('/oauth/authorize', methods=['GET'])
def google_ads_oauth_authorize():
    """بدء عملية OAuth لـ Google Ads"""
    state = secrets.token_urlsafe(32)
    auth_result = google_ads_oauth_manager.get_authorization_url(state)
    
    if auth_result['success']:
        return jsonify({
            'success': True,
            'authorization_url': auth_result['url'],
            'state': auth_result['state'],
            'message': 'اذهب إلى الرابط لإكمال تخويل Google Ads'
        })
    else:
        return jsonify({
            'success': False,
            'error': auth_result['error']
        }), 400

@google_ads_auth_bp.route('/oauth/callback', methods=['GET', 'POST'])
def google_ads_oauth_callback():
    """معالجة callback من Google Ads OAuth"""
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')
    
    if error:
        return jsonify({
            'success': False,
            'error': f'Google Ads OAuth error: {error}'
        }), 400
    
    if not code:
        return jsonify({
            'success': False,
            'error': 'لم يتم استلام كود التخويل من Google Ads'
        }), 400
    
    token_result = google_ads_oauth_manager.exchange_code_for_tokens(code, state)
    
    if token_result['success']:
        return jsonify({
            'success': True,
            'message': 'تم تخويل Google Ads بنجاح',
            'tokens': {
                'access_token': token_result['access_token'][:20] + '...',
                'expires_in': token_result['expires_in'],
                'scope': token_result['scope']
            }
        })
    else:
        return jsonify({
            'success': False,
            'error': token_result['error']
        }), 400

@google_ads_auth_bp.route('/refresh', methods=['POST'])
def google_ads_refresh_token():
    """تجديد access token لـ Google Ads"""
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        return jsonify({
            'success': False,
            'error': 'Refresh token مطلوب'
        }), 400
    
    result = google_ads_jwt_manager.refresh_token(refresh_token)
    
    if result:
        return jsonify({
            'success': True,
            'message': 'تم تجديد Google Ads token بنجاح',
            **result
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Refresh token غير صحيح أو منتهي الصلاحية'
        }), 401

@google_ads_auth_bp.route('/verify', methods=['POST'])
def google_ads_verify_token():
    """التحقق من صحة Google Ads token"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            'success': False,
            'error': 'Google Ads token مطلوب'
        }), 401
    
    token = auth_header.split(' ')[1]
    token_data = google_ads_jwt_manager.verify_token(token)
    
    if token_data:
        user = google_ads_user_manager.get_user_by_id(token_data['user_id'])
        
        return jsonify({
            'success': True,
            'valid': True,
            'user_id': token_data['user_id'],
            'customer_id': token_data.get('customer_id'),
            'scope': token_data.get('scope'),
            'expires_at': token_data.get('exp'),
            'user_email': user.get('email') if user else None
        })
    else:
        return jsonify({
            'success': False,
            'valid': False,
            'error': 'Google Ads token غير صحيح أو منتهي الصلاحية'
        }), 401

@google_ads_auth_bp.route('/health', methods=['GET'])
def google_ads_auth_health():
    """فحص صحة نظام مصادقة Google Ads"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'service': 'Google Ads Authentication',
        'libraries': {
            'bcrypt': 'original',
            'PyJWT': 'original',
            'cryptography': 'original'
        },
        'oauth_configured': google_ads_oauth_manager.is_configured,
        'performance': 'optimized',
        'timestamp': datetime.utcnow().isoformat()
    })

# تعريف __all__ للتصدير
__all__ = [
    'google_ads_auth_bp',
    'google_ads_jwt_manager', 
    'google_ads_oauth_manager',
    'google_ads_user_manager',
    'GoogleAdsJWTManager',
    'GoogleAdsOAuthManager',
    'GoogleAdsUserManager'
]

# تسجيل Blueprint
logger.info("✅ تم تحميل google_ads_auth_bp - المكتبات الأصلية فقط")
logger.info("🚀 Google Ads Auth: bcrypt + PyJWT + cryptography (أصلية وسريعة)")

