"""
Google Ads OAuth Routes
مسارات OAuth المطورة لـ Google Ads API

نظام OAuth 2.0 متطور مع PKCE وإدارة شاملة للجلسات
يدعم التحديث التلقائي للرموز والمصادقة الآمنة

Author: Google Ads AI Platform Team
Version: 2.1.0
License: MIT
Created: 2024-06-24
Last Modified: 2024-06-24
"""

import os
import json
import secrets
import hashlib
import base64
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple, List
from urllib.parse import urlencode, parse_qs
import asyncio
from functools import wraps

# Flask imports with error handling
try:
    from flask import Blueprint, request, jsonify, session, redirect, url_for, current_app  # type: ignore
    from flask_cors import cross_origin  # type: ignore
except ImportError as e:
    logging.error(f"Flask import error: {e}")
    raise

# Google Ads imports with error handling
try:
    import requests
    from google.ads.googleads.client import GoogleAdsClient  # type: ignore
    from google.ads.googleads.errors import GoogleAdsException  # type: ignore
except ImportError as e:
    logging.warning(f"Google Ads imports not available: {e}")

# إعداد التسجيل المتقدم
logger = logging.getLogger(__name__)

# إنشاء Blueprint مع تكوين محسن
google_ads_oauth = Blueprint(
    'google_ads_oauth',
    __name__,
    url_prefix='/api/google-ads/oauth'
)

class OAuthConfig:
    """تكوين OAuth المتطور"""
    
    def __init__(self):
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_ADS_REDIRECT_URI', 'http://localhost:3000/auth/callback')
        self.developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
        self.customer_id = os.getenv('GOOGLE_ADS_CUSTOMER_ID')
        
        # OAuth 2.0 endpoints
        self.auth_uri = 'https://accounts.google.com/o/oauth2/v2/auth'
        self.token_uri = 'https://oauth2.googleapis.com/token'
        self.revoke_uri = 'https://oauth2.googleapis.com/revoke'
        
        # OAuth scopes
        self.scopes = [
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
        
        # PKCE configuration
        self.code_challenge_method = 'S256'
        
        # Session configuration
        self.session_timeout = 3600  # 1 hour
        self.refresh_threshold = 300  # 5 minutes before expiry

    def validate(self) -> Tuple[bool, List[str]]:
        """التحقق من صحة التكوين"""
        errors = []
        
        if not self.client_id:
            errors.append("GOOGLE_ADS_CLIENT_ID is required")
        if not self.client_secret:
            errors.append("GOOGLE_ADS_CLIENT_SECRET is required")
        if not self.developer_token:
            errors.append("GOOGLE_ADS_DEVELOPER_TOKEN is required")
        if not self.customer_id:
            errors.append("GOOGLE_ADS_CUSTOMER_ID is required")
            
        return len(errors) == 0, errors

class PKCEHelper:
    """مساعد PKCE للأمان المتقدم"""
    
    @staticmethod
    def generate_code_verifier() -> str:
        """إنشاء code verifier عشوائي"""
        return base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
    
    @staticmethod
    def generate_code_challenge(verifier: str) -> str:
        """إنشاء code challenge من verifier"""
        digest = hashlib.sha256(verifier.encode('utf-8')).digest()
        return base64.urlsafe_b64encode(digest).decode('utf-8').rstrip('=')

class TokenManager:
    """مدير الرموز المتطور"""
    
    def __init__(self, config: OAuthConfig):
        self.config = config
    
    def exchange_code_for_tokens(self, code: str, code_verifier: str) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """تبديل authorization code بـ access token"""
        try:
            data = {
                'client_id': self.config.client_id,
                'client_secret': self.config.client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': self.config.redirect_uri,
                'code_verifier': code_verifier
            }
            
            response = requests.post(self.config.token_uri, data=data, timeout=30)
            
            if response.status_code == 200:
                tokens = response.json()
                
                # إضافة معلومات إضافية
                tokens['expires_at'] = datetime.utcnow() + timedelta(seconds=tokens.get('expires_in', 3600))
                tokens['created_at'] = datetime.utcnow()
                
                return True, tokens, None
            else:
                error_msg = f"Token exchange failed: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return False, None, error_msg
                
        except Exception as e:
            error_msg = f"Token exchange error: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    def refresh_access_token(self, refresh_token: str) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """تحديث access token"""
        try:
            data = {
                'client_id': self.config.client_id,
                'client_secret': self.config.client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            }
            
            response = requests.post(self.config.token_uri, data=data, timeout=30)
            
            if response.status_code == 200:
                tokens = response.json()
                
                # إضافة معلومات إضافية
                tokens['expires_at'] = datetime.utcnow() + timedelta(seconds=tokens.get('expires_in', 3600))
                tokens['refreshed_at'] = datetime.utcnow()
                
                return True, tokens, None
            else:
                error_msg = f"Token refresh failed: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return False, None, error_msg
                
        except Exception as e:
            error_msg = f"Token refresh error: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    def revoke_token(self, token: str) -> Tuple[bool, Optional[str]]:
        """إلغاء token"""
        try:
            data = {'token': token}
            response = requests.post(self.config.revoke_uri, data=data, timeout=30)
            
            if response.status_code == 200:
                return True, None
            else:
                error_msg = f"Token revocation failed: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return False, error_msg
                
        except Exception as e:
            error_msg = f"Token revocation error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg

class GoogleAdsAPITester:
    """اختبار Google Ads API"""
    
    def __init__(self, config: OAuthConfig):
        self.config = config
    
    def test_api_connection(self, access_token: str) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """اختبار الاتصال بـ Google Ads API"""
        try:
            # إنشاء Google Ads client
            credentials = {
                'developer_token': self.config.developer_token,
                'refresh_token': access_token,  # في الواقع نحتاج refresh_token
                'client_id': self.config.client_id,
                'client_secret': self.config.client_secret,
                'use_proto_plus': True
            }
            
            client = GoogleAdsClient.load_from_dict(credentials)
            
            # اختبار بسيط - الحصول على معلومات العميل
            customer_service = client.get_service("CustomerService")
            customer = customer_service.get_customer(
                customer_id=self.config.customer_id
            )
            
            result = {
                'customer_id': customer.id,
                'descriptive_name': customer.descriptive_name,
                'currency_code': customer.currency_code,
                'time_zone': customer.time_zone,
                'status': 'connected'
            }
            
            return True, result, None
            
        except GoogleAdsException as e:
            error_msg = f"Google Ads API error: {e.error.code().name} - {e.error.message}"
            logger.error(error_msg)
            return False, None, error_msg
            
        except Exception as e:
            error_msg = f"API test error: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg

# إنشاء مثيلات الخدمات
oauth_config = OAuthConfig()
token_manager = TokenManager(oauth_config)
api_tester = GoogleAdsAPITester(oauth_config)

def require_auth(f):
    """ديكوريتر للتحقق من المصادقة"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'access_token' not in session:
            return jsonify({
                'success': False,
                'error': 'Authentication required',
                'message': 'يجب تسجيل الدخول أولاً'
            }), 401
        return f(*args, **kwargs)
    return decorated_function

@google_ads_oauth.route('/config', methods=['GET'])
@cross_origin()
def get_oauth_config():
    """الحصول على تكوين OAuth"""
    try:
        is_valid, errors = oauth_config.validate()
        
        return jsonify({
            'success': True,
            'config': {
                'client_id': oauth_config.client_id,
                'redirect_uri': oauth_config.redirect_uri,
                'scopes': oauth_config.scopes,
                'auth_uri': oauth_config.auth_uri,
                'is_valid': is_valid,
                'errors': errors if not is_valid else []
            },
            'message': 'تكوين OAuth جاهز' if is_valid else 'تكوين OAuth غير مكتمل'
        })
        
    except Exception as e:
        logger.error(f"Config error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Configuration error',
            'message': f'خطأ في التكوين: {str(e)}'
        }), 500

@google_ads_oauth.route('/authorize', methods=['GET'])
@cross_origin()
def authorize():
    """بدء عملية OAuth"""
    try:
        # التحقق من التكوين
        is_valid, errors = oauth_config.validate()
        if not is_valid:
            return jsonify({
                'success': False,
                'error': 'Invalid configuration',
                'errors': errors,
                'message': 'تكوين OAuth غير صحيح'
            }), 400
        
        # إنشاء PKCE parameters
        code_verifier = PKCEHelper.generate_code_verifier()
        code_challenge = PKCEHelper.generate_code_challenge(code_verifier)
        state = secrets.token_urlsafe(32)
        
        # حفظ في الجلسة
        session['code_verifier'] = code_verifier
        session['oauth_state'] = state
        session['oauth_started_at'] = datetime.utcnow().isoformat()
        
        # بناء URL المصادقة
        auth_params = {
            'client_id': oauth_config.client_id,
            'redirect_uri': oauth_config.redirect_uri,
            'scope': ' '.join(oauth_config.scopes),
            'response_type': 'code',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': oauth_config.code_challenge_method,
            'access_type': 'offline',
            'prompt': 'consent'
        }
        
        auth_url = f"{oauth_config.auth_uri}?{urlencode(auth_params)}"
        
        return jsonify({
            'success': True,
            'auth_url': auth_url,
            'state': state,
            'message': 'رابط المصادقة جاهز'
        })
        
    except Exception as e:
        logger.error(f"Authorization error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Authorization error',
            'message': f'خطأ في المصادقة: {str(e)}'
        }), 500

@google_ads_oauth.route('/callback', methods=['GET', 'POST'])
@cross_origin()
def oauth_callback():
    """معالجة callback من Google"""
    try:
        # الحصول على parameters
        code = request.args.get('code')
        state = request.args.get('state')
        error = request.args.get('error')
        
        if error:
            return jsonify({
                'success': False,
                'error': f'OAuth error: {error}',
                'message': f'خطأ في المصادقة: {error}'
            }), 400
        
        if not code or not state:
            return jsonify({
                'success': False,
                'error': 'Missing parameters',
                'message': 'معاملات مفقودة في الاستجابة'
            }), 400
        
        # التحقق من state
        if state != session.get('oauth_state'):
            return jsonify({
                'success': False,
                'error': 'Invalid state',
                'message': 'حالة غير صحيحة - محاولة تلاعب محتملة'
            }), 400
        
        # الحصول على code_verifier
        code_verifier = session.get('code_verifier')
        if not code_verifier:
            return jsonify({
                'success': False,
                'error': 'Missing code verifier',
                'message': 'code verifier مفقود من الجلسة'
            }), 400
        
        # تبديل code بـ tokens
        success, tokens, error_msg = token_manager.exchange_code_for_tokens(code, code_verifier)
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Token exchange failed',
                'message': f'فشل في تبديل الرمز: {error_msg}'
            }), 400
        
        # حفظ tokens في الجلسة
        session['access_token'] = tokens['access_token']
        session['refresh_token'] = tokens.get('refresh_token')
        session['token_expires_at'] = tokens['expires_at'].isoformat()
        session['authenticated_at'] = datetime.utcnow().isoformat()
        
        # تنظيف الجلسة
        session.pop('code_verifier', None)
        session.pop('oauth_state', None)
        session.pop('oauth_started_at', None)
        
        return jsonify({
            'success': True,
            'tokens': {
                'access_token': tokens['access_token'][:20] + '...',  # إخفاء جزئي
                'expires_in': tokens.get('expires_in'),
                'token_type': tokens.get('token_type'),
                'scope': tokens.get('scope')
            },
            'message': 'تم تسجيل الدخول بنجاح'
        })
        
    except Exception as e:
        logger.error(f"Callback error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Callback processing error',
            'message': f'خطأ في معالجة الاستجابة: {str(e)}'
        }), 500

@google_ads_oauth.route('/refresh', methods=['POST'])
@cross_origin()
def refresh_token():
    """تحديث access token"""
    try:
        refresh_token = session.get('refresh_token')
        if not refresh_token:
            return jsonify({
                'success': False,
                'error': 'No refresh token',
                'message': 'لا يوجد refresh token في الجلسة'
            }), 400
        
        success, tokens, error_msg = token_manager.refresh_access_token(refresh_token)
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Token refresh failed',
                'message': f'فشل في تحديث الرمز: {error_msg}'
            }), 400
        
        # تحديث الجلسة
        session['access_token'] = tokens['access_token']
        session['token_expires_at'] = tokens['expires_at'].isoformat()
        session['last_refreshed_at'] = datetime.utcnow().isoformat()
        
        return jsonify({
            'success': True,
            'tokens': {
                'access_token': tokens['access_token'][:20] + '...',
                'expires_in': tokens.get('expires_in'),
                'token_type': tokens.get('token_type')
            },
            'message': 'تم تحديث الرمز بنجاح'
        })
        
    except Exception as e:
        logger.error(f"Refresh error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Token refresh error',
            'message': f'خطأ في تحديث الرمز: {str(e)}'
        }), 500

@google_ads_oauth.route('/revoke', methods=['POST'])
@cross_origin()
@require_auth
def revoke_token():
    """إلغاء access token"""
    try:
        access_token = session.get('access_token')
        
        success, error_msg = token_manager.revoke_token(access_token)
        
        if success:
            # تنظيف الجلسة
            session.clear()
            
            return jsonify({
                'success': True,
                'message': 'تم إلغاء الرمز وتسجيل الخروج بنجاح'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Token revocation failed',
                'message': f'فشل في إلغاء الرمز: {error_msg}'
            }), 400
        
    except Exception as e:
        logger.error(f"Revoke error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Token revocation error',
            'message': f'خطأ في إلغاء الرمز: {str(e)}'
        }), 500

@google_ads_oauth.route('/status', methods=['GET'])
@cross_origin()
def get_auth_status():
    """الحصول على حالة المصادقة"""
    try:
        access_token = session.get('access_token')
        token_expires_at = session.get('token_expires_at')
        
        if not access_token:
            return jsonify({
                'success': True,
                'authenticated': False,
                'message': 'غير مسجل الدخول'
            })
        
        # التحقق من انتهاء صلاحية الرمز
        expires_at = datetime.fromisoformat(token_expires_at) if token_expires_at else None
        is_expired = expires_at and expires_at <= datetime.utcnow()
        needs_refresh = expires_at and (expires_at - datetime.utcnow()).total_seconds() < oauth_config.refresh_threshold
        
        return jsonify({
            'success': True,
            'authenticated': True,
            'token_info': {
                'expires_at': token_expires_at,
                'is_expired': is_expired,
                'needs_refresh': needs_refresh,
                'authenticated_at': session.get('authenticated_at'),
                'last_refreshed_at': session.get('last_refreshed_at')
            },
            'message': 'مسجل الدخول' if not is_expired else 'انتهت صلاحية الرمز'
        })
        
    except Exception as e:
        logger.error(f"Status error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Status check error',
            'message': f'خطأ في فحص الحالة: {str(e)}'
        }), 500

@google_ads_oauth.route('/test', methods=['GET'])
@cross_origin()
@require_auth
def test_api_connection():
    """اختبار الاتصال بـ Google Ads API"""
    try:
        access_token = session.get('access_token')
        
        success, result, error_msg = api_tester.test_api_connection(access_token)
        
        if success:
            return jsonify({
                'success': True,
                'api_status': 'connected',
                'customer_info': result,
                'message': 'الاتصال بـ Google Ads API ناجح'
            })
        else:
            return jsonify({
                'success': False,
                'api_status': 'failed',
                'error': error_msg,
                'message': f'فشل الاتصال بـ Google Ads API: {error_msg}'
            }), 400
        
    except Exception as e:
        logger.error(f"API test error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'API test error',
            'message': f'خطأ في اختبار API: {str(e)}'
        }), 500

# تصدير Blueprint
oauth_bp = google_ads_oauth

# معلومات إضافية للتصدير
__all__ = [
    'oauth_bp',
    'google_ads_oauth',
    'OAuthConfig',
    'TokenManager',
    'PKCEHelper',
    'GoogleAdsAPITester'
]

