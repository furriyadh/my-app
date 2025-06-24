"""
OAuth Handler Service
خدمة معالجة OAuth

يوفر وظائف OAuth 2.0 لـ Google Ads API بما في ذلك:
- إنشاء روابط التفويض
- تبديل الرموز
- تجديد الرموز
- إدارة الجلسات
- التحقق من الصلاحيات
"""

import os
import logging
import secrets
import hashlib
import base64
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import requests
from urllib.parse import urlencode, parse_qs, urlparse
import jwt

# إعداد التسجيل
logger = logging.getLogger(__name__)

class OAuthHandler:
    """معالج OAuth 2.0 المتطور لـ Google Ads"""
    
    def __init__(self):
        """تهيئة معالج OAuth"""
        self.logger = logging.getLogger(__name__)
        
        # إعدادات OAuth من متغيرات البيئة
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5000/oauth/callback')
        self.developer_token = os.getenv('GOOGLE_DEVELOPER_TOKEN')
        
        # نطاقات Google Ads
        self.scopes = [
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
        
        # URLs للـ OAuth
        self.auth_url = 'https://accounts.google.com/o/oauth2/v2/auth'
        self.token_url = 'https://oauth2.googleapis.com/token'
        self.userinfo_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        self.revoke_url = 'https://oauth2.googleapis.com/revoke'
        
        # تخزين الجلسات النشطة
        self.active_sessions = {}
        self.token_cache = {}
        self.state_storage = {}
        
        self.logger.info("تم تهيئة معالج OAuth")
    
    # ===========================================
    # إنشاء روابط التفويض
    # ===========================================
    
    def create_authorization_url(self, client_id: str = None, redirect_uri: str = None, 
                               scopes: List[str] = None, state: str = None, 
                               include_granted_scopes: bool = True) -> Dict[str, Any]:
        """إنشاء رابط التفويض مع PKCE - الدالة المطلوبة في MCC"""
        try:
            # استخدام الإعدادات المحفوظة أو المرسلة
            used_client_id = client_id or self.client_id
            used_redirect_uri = redirect_uri or self.redirect_uri
            used_scopes = scopes or self.scopes
            
            if not used_client_id:
                return {
                    'success': False,
                    'error': 'Client ID required',
                    'message': 'معرف العميل مطلوب'
                }
            
            # إنشاء state آمن
            if not state:
                state = self._generate_state()
            
            # إنشاء PKCE للأمان الإضافي
            code_verifier = self._generate_code_verifier()
            code_challenge = self._generate_code_challenge(code_verifier)
            
            # حفظ معلومات الجلسة
            self.state_storage[state] = {
                'code_verifier': code_verifier,
                'code_challenge': code_challenge,
                'client_id': used_client_id,
                'redirect_uri': used_redirect_uri,
                'scopes': used_scopes,
                'timestamp': datetime.now().isoformat(),
                'expires_at': (datetime.now() + timedelta(minutes=10)).isoformat()
            }
            
            # معاملات التفويض
            auth_params = {
                'client_id': used_client_id,
                'redirect_uri': used_redirect_uri,
                'scope': ' '.join(used_scopes),
                'response_type': 'code',
                'state': state,
                'access_type': 'offline',
                'prompt': 'consent',
                'code_challenge': code_challenge,
                'code_challenge_method': 'S256',
                'include_granted_scopes': 'true'
            }
            
            # بناء الرابط
            authorization_url = f"{self.auth_url}?{urlencode(auth_params)}"
            
            return {
                'success': True,
                'authorization_url': authorization_url,
                'state': state,
                'code_challenge': code_challenge,
                'expires_in': 600,  # 10 دقائق
                'message': 'تم إنشاء رابط التفويض بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء رابط التفويض: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في إنشاء رابط التفويض'
            }
    
    def exchange_code_for_token(self, code: str, state: str) -> Dict[str, Any]:
        """تبديل الكود برمز الوصول - الدالة المطلوبة في MCC"""
        try:
            # التحقق من صحة state
            if state not in self.state_storage:
                return {
                    'success': False,
                    'error': 'Invalid state',
                    'message': 'حالة غير صالحة'
                }
            
            session_data = self.state_storage[state]
            
            # التحقق من انتهاء الصلاحية
            expires_at = datetime.fromisoformat(session_data['expires_at'])
            if datetime.now() > expires_at:
                del self.state_storage[state]
                return {
                    'success': False,
                    'error': 'Session expired',
                    'message': 'انتهت صلاحية الجلسة'
                }
            
            # معاملات تبديل الرمز
            token_params = {
                'client_id': session_data['client_id'],
                'client_secret': self.client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': session_data['redirect_uri'],
                'code_verifier': session_data['code_verifier']
            }
            
            # إرسال طلب التبديل
            response = requests.post(
                self.token_url,
                data=token_params,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                # إضافة معلومات إضافية
                token_data['obtained_at'] = datetime.now().isoformat()
                token_data['expires_at'] = (
                    datetime.now() + timedelta(seconds=token_data.get('expires_in', 3600))
                ).isoformat()
                
                # الحصول على معلومات المستخدم
                user_info_result = self._get_user_info(token_data['access_token'])
                
                # تنظيف الجلسة
                del self.state_storage[state]
                
                return {
                    'success': True,
                    'token_data': token_data,
                    'user_info': user_info_result.get('user_info', {}),
                    'scopes': session_data['scopes'],
                    'message': 'تم تبديل الكود بنجاح'
                }
            else:
                error_data = response.json() if response.content else {}
                return {
                    'success': False,
                    'error': error_data.get('error', 'token_exchange_failed'),
                    'error_description': error_data.get('error_description', 'فشل في تبديل الكود'),
                    'message': 'فشل في الحصول على رمز الوصول'
                }
                
        except Exception as e:
            self.logger.error(f"خطأ في تبديل الكود: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تبديل الكود'
            }
    
    # ===========================================
    # إدارة الرموز
    # ===========================================
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """تجديد رمز الوصول"""
        try:
            if not refresh_token:
                return {
                    'success': False,
                    'error': 'Refresh token required',
                    'message': 'رمز التجديد مطلوب'
                }
            
            # معاملات تجديد الرمز
            refresh_params = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            }
            
            # إرسال طلب التجديد
            response = requests.post(
                self.token_url,
                data=refresh_params,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                # إضافة معلومات إضافية
                token_data['obtained_at'] = datetime.now().isoformat()
                token_data['expires_at'] = (
                    datetime.now() + timedelta(seconds=token_data.get('expires_in', 3600))
                ).isoformat()
                
                # الاحتفاظ بـ refresh_token الأصلي إذا لم يتم إرجاع واحد جديد
                if 'refresh_token' not in token_data:
                    token_data['refresh_token'] = refresh_token
                
                return {
                    'success': True,
                    'access_token': token_data['access_token'],
                    'refresh_token': token_data.get('refresh_token', refresh_token),
                    'expires_in': token_data.get('expires_in', 3600),
                    'expires_at': token_data['expires_at'],
                    'token_type': token_data.get('token_type', 'Bearer'),
                    'scope': token_data.get('scope', ''),
                    'message': 'تم تجديد رمز الوصول بنجاح'
                }
            else:
                error_data = response.json() if response.content else {}
                return {
                    'success': False,
                    'error': error_data.get('error', 'refresh_failed'),
                    'error_description': error_data.get('error_description', 'فشل في تجديد الرمز'),
                    'message': 'فشل في تجديد رمز الوصول'
                }
                
        except Exception as e:
            self.logger.error(f"خطأ في تجديد الرمز: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تجديد رمز الوصول'
            }
    
    def revoke_token(self, token: str) -> Dict[str, Any]:
        """إلغاء رمز الوصول أو التجديد"""
        try:
            if not token:
                return {
                    'success': False,
                    'error': 'Token required',
                    'message': 'الرمز مطلوب'
                }
            
            # إرسال طلب الإلغاء
            revoke_params = {'token': token}
            response = requests.post(
                self.revoke_url,
                data=revoke_params,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                # إزالة الرمز من الذاكرة المؤقتة
                self._remove_token_from_cache(token)
                
                return {
                    'success': True,
                    'message': 'تم إلغاء الرمز بنجاح'
                }
            else:
                return {
                    'success': False,
                    'error': 'revoke_failed',
                    'message': 'فشل في إلغاء الرمز'
                }
                
        except Exception as e:
            self.logger.error(f"خطأ في إلغاء الرمز: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في إلغاء الرمز'
            }
    
    def validate_token(self, access_token: str) -> Dict[str, Any]:
        """التحقق من صحة رمز الوصول"""
        try:
            if not access_token:
                return {
                    'success': False,
                    'error': 'Access token required',
                    'message': 'رمز الوصول مطلوب'
                }
            
            # التحقق من الرمز عبر Google
            validation_url = f"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={access_token}"
            response = requests.get(validation_url)
            
            if response.status_code == 200:
                token_info = response.json()
                
                # التحقق من صحة العميل
                if token_info.get('audience') != self.client_id:
                    return {
                        'success': False,
                        'error': 'Invalid client',
                        'message': 'رمز غير صالح لهذا التطبيق'
                    }
                
                # التحقق من النطاقات
                token_scopes = token_info.get('scope', '').split()
                required_scope = 'https://www.googleapis.com/auth/adwords'
                
                if required_scope not in token_scopes:
                    return {
                        'success': False,
                        'error': 'Insufficient scope',
                        'message': 'الرمز لا يحتوي على النطاقات المطلوبة'
                    }
                
                return {
                    'success': True,
                    'valid': True,
                    'token_info': token_info,
                    'expires_in': int(token_info.get('expires_in', 0)),
                    'scopes': token_scopes,
                    'message': 'الرمز صالح'
                }
            else:
                return {
                    'success': False,
                    'valid': False,
                    'error': 'Invalid token',
                    'message': 'رمز الوصول غير صالح'
                }
                
        except Exception as e:
            self.logger.error(f"خطأ في التحقق من الرمز: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في التحقق من الرمز'
            }
    
    # ===========================================
    # إدارة الجلسات والرموز
    # ===========================================
    
    def get_token_info(self, token_id: str) -> Dict[str, Any]:
        """الحصول على معلومات الرمز"""
        try:
            if token_id not in self.token_cache:
                return {
                    'success': False,
                    'error': 'Token not found',
                    'message': 'الرمز غير موجود'
                }
            
            token_cache_data = self.token_cache[token_id]
            token_data = token_cache_data['token_data']
            
            # التحقق من انتهاء الصلاحية
            expires_at = datetime.fromisoformat(token_data['expires_at'])
            is_expired = datetime.now() > expires_at
            
            return {
                'success': True,
                'token_id': token_id,
                'token_data': token_data,
                'user_info': token_cache_data.get('user_info', {}),
                'scopes': token_cache_data.get('scopes', []),
                'is_expired': is_expired,
                'time_remaining': (expires_at - datetime.now()).total_seconds() if not is_expired else 0,
                'created_at': token_cache_data.get('created_at'),
                'message': 'معلومات الرمز'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في الحصول على معلومات الرمز: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في الحصول على معلومات الرمز'
            }
    
    def refresh_token_by_id(self, token_id: str) -> Dict[str, Any]:
        """تجديد رمز بالمعرف"""
        try:
            if token_id not in self.token_cache:
                return {
                    'success': False,
                    'error': 'Token not found',
                    'message': 'الرمز غير موجود'
                }
            
            token_cache_data = self.token_cache[token_id]
            refresh_token = token_cache_data['token_data'].get('refresh_token')
            
            if not refresh_token:
                return {
                    'success': False,
                    'error': 'No refresh token available',
                    'message': 'رمز التجديد غير متوفر'
                }
            
            # تجديد الرمز
            refresh_result = self.refresh_access_token(refresh_token)
            
            if refresh_result['success']:
                # تحديث الذاكرة المؤقتة
                token_cache_data['token_data'].update({
                    'access_token': refresh_result['access_token'],
                    'expires_at': refresh_result['expires_at'],
                    'obtained_at': datetime.now().isoformat()
                })
                
                return {
                    'success': True,
                    'token_id': token_id,
                    'new_access_token': refresh_result['access_token'],
                    'expires_at': refresh_result['expires_at'],
                    'message': 'تم تجديد الرمز بنجاح'
                }
            else:
                return refresh_result
                
        except Exception as e:
            self.logger.error(f"خطأ في تجديد الرمز بالمعرف: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تجديد الرمز'
            }
    
    def revoke_token_by_id(self, token_id: str) -> Dict[str, Any]:
        """إلغاء رمز بالمعرف"""
        try:
            if token_id not in self.token_cache:
                return {
                    'success': False,
                    'error': 'Token not found',
                    'message': 'الرمز غير موجود'
                }
            
            token_cache_data = self.token_cache[token_id]
            access_token = token_cache_data['token_data'].get('access_token')
            
            if access_token:
                # إلغاء الرمز
                revoke_result = self.revoke_token(access_token)
                
                if revoke_result['success']:
                    # إزالة من الذاكرة المؤقتة
                    del self.token_cache[token_id]
                    
                    return {
                        'success': True,
                        'token_id': token_id,
                        'message': 'تم إلغاء الرمز وإزالته من الذاكرة المؤقتة'
                    }
                else:
                    return revoke_result
            else:
                # إزالة من الذاكرة المؤقتة حتى لو لم يكن هناك رمز وصول
                del self.token_cache[token_id]
                return {
                    'success': True,
                    'token_id': token_id,
                    'message': 'تم إزالة الرمز من الذاكرة المؤقتة'
                }
                
        except Exception as e:
            self.logger.error(f"خطأ في إلغاء الرمز بالمعرف: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في إلغاء الرمز'
            }
    
    def get_active_sessions(self) -> Dict[str, Any]:
        """الحصول على الجلسات النشطة"""
        try:
            # تنظيف الجلسات المنتهية الصلاحية أولاً
            current_time = datetime.now()
            expired_sessions = []
            
            for state, session_data in list(self.state_storage.items()):
                expires_at = datetime.fromisoformat(session_data['expires_at'])
                if current_time > expires_at:
                    expired_sessions.append(state)
                    del self.state_storage[state]
            
            # إحصائيات الجلسات
            active_sessions = []
            for state, session_data in self.state_storage.items():
                expires_at = datetime.fromisoformat(session_data['expires_at'])
                time_remaining = (expires_at - current_time).total_seconds()
                
                active_sessions.append({
                    'state': state,
                    'created_at': session_data['timestamp'],
                    'expires_at': session_data['expires_at'],
                    'time_remaining': max(0, time_remaining),
                    'scopes': session_data['scopes'],
                    'client_id': session_data['client_id'][:10] + '...' if len(session_data['client_id']) > 10 else session_data['client_id']
                })
            
            return {
                'success': True,
                'active_sessions': active_sessions,
                'active_sessions_count': len(active_sessions),
                'expired_sessions_cleaned': len(expired_sessions),
                'total_tokens_cached': len(self.token_cache),
                'message': 'قائمة الجلسات النشطة'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في الحصول على الجلسات النشطة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في الحصول على الجلسات النشطة'
            }
    
    # ===========================================
    # دوال مساعدة
    # ===========================================
    
    def _generate_state(self) -> str:
        """إنشاء state عشوائي آمن"""
        return secrets.token_urlsafe(32)
    
    def _generate_token_id(self) -> str:
        """إنشاء معرف رمز فريد"""
        return f"token_{secrets.token_urlsafe(16)}"
    
    def _generate_code_verifier(self) -> str:
        """إنشاء PKCE code verifier"""
        return base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
    
    def _generate_code_challenge(self, code_verifier: str) -> str:
        """إنشاء PKCE code challenge"""
        digest = hashlib.sha256(code_verifier.encode('utf-8')).digest()
        return base64.urlsafe_b64encode(digest).decode('utf-8').rstrip('=')
    
    def _get_user_info(self, access_token: str) -> Dict[str, Any]:
        """الحصول على معلومات المستخدم"""
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get(self.userinfo_url, headers=headers)
            
            if response.status_code == 200:
                user_info = response.json()
                return {
                    'success': True,
                    'user_info': user_info
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to get user info',
                    'message': 'فشل في الحصول على معلومات المستخدم'
                }
                
        except Exception as e:
            self.logger.error(f"خطأ في الحصول على معلومات المستخدم: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _remove_token_from_cache(self, token: str) -> None:
        """إزالة الرمز من الذاكرة المؤقتة"""
        try:
            # البحث عن الرمز في الذاكرة المؤقتة وإزالته
            for token_id, token_cache_data in list(self.token_cache.items()):
                token_data = token_cache_data['token_data']
                if (token_data.get('access_token') == token or 
                    token_data.get('refresh_token') == token):
                    del self.token_cache[token_id]
                    self.logger.info(f"تم إزالة الرمز {token_id} من الذاكرة المؤقتة")
                    break
        except Exception as e:
            self.logger.error(f"خطأ في إزالة الرمز من الذاكرة المؤقتة: {str(e)}")
    
    # ===========================================
    # الدوال المفقودة المطلوبة
    # ===========================================
    
    def get_session_info(self, state: str) -> Dict[str, Any]:
        """الحصول على معلومات الجلسة"""
        try:
            if state not in self.state_storage:
                return {
                    'success': False,
                    'error': 'Session not found',
                    'message': 'الجلسة غير موجودة'
                }
            
            session_data = self.state_storage[state]
            expires_at = datetime.fromisoformat(session_data['expires_at'])
            is_expired = datetime.now() > expires_at
            
            return {
                'success': True,
                'session_data': session_data,
                'is_expired': is_expired,
                'time_remaining': (expires_at - datetime.now()).total_seconds() if not is_expired else 0,
                'message': 'معلومات الجلسة'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في الحصول على معلومات الجلسة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في الحصول على معلومات الجلسة'
            }
    
    def cleanup_expired_sessions(self) -> Dict[str, Any]:
        """تنظيف الجلسات المنتهية الصلاحية"""
        try:
            current_time = datetime.now()
            expired_sessions = []
            
            for state, session_data in list(self.state_storage.items()):
                expires_at = datetime.fromisoformat(session_data['expires_at'])
                if current_time > expires_at:
                    expired_sessions.append(state)
                    del self.state_storage[state]
            
            return {
                'success': True,
                'expired_sessions_count': len(expired_sessions),
                'active_sessions_count': len(self.state_storage),
                'message': f'تم تنظيف {len(expired_sessions)} جلسة منتهية الصلاحية'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في تنظيف الجلسات: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تنظيف الجلسات'
            }
    
    def get_oauth_status(self) -> Dict[str, Any]:
        """الحصول على حالة OAuth"""
        try:
            # تنظيف الجلسات المنتهية الصلاحية أولاً
            cleanup_result = self.cleanup_expired_sessions()
            
            return {
                'success': True,
                'oauth_configured': bool(self.client_id and self.client_secret),
                'client_id_set': bool(self.client_id),
                'client_secret_set': bool(self.client_secret),
                'redirect_uri': self.redirect_uri,
                'scopes': self.scopes,
                'active_sessions': len(self.state_storage),
                'cleanup_result': cleanup_result,
                'endpoints': {
                    'auth_url': self.auth_url,
                    'token_url': self.token_url,
                    'userinfo_url': self.userinfo_url
                },
                'message': 'حالة OAuth'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في الحصول على حالة OAuth: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في الحصول على حالة OAuth'
            }
    
    def test_oauth_configuration(self) -> Dict[str, Any]:
        """اختبار إعدادات OAuth"""
        try:
            issues = []
            
            # فحص الإعدادات الأساسية
            if not self.client_id:
                issues.append('Client ID غير مُعرف')
            
            if not self.client_secret:
                issues.append('Client Secret غير مُعرف')
            
            if not self.redirect_uri:
                issues.append('Redirect URI غير مُعرف')
            
            # فحص صحة الـ URLs
            try:
                response = requests.get(self.auth_url.split('?')[0], timeout=5)
                if response.status_code >= 400:
                    issues.append('Auth URL غير متاح')
            except:
                issues.append('لا يمكن الوصول إلى Auth URL')
            
            try:
                response = requests.post(self.token_url, data={}, timeout=5)
                # نتوقع 400 لأننا لم نرسل بيانات صحيحة، لكن الـ endpoint يجب أن يكون متاحاً
                if response.status_code == 404:
                    issues.append('Token URL غير متاح')
            except:
                issues.append('لا يمكن الوصول إلى Token URL')
            
            return {
                'success': True,
                'configuration_valid': len(issues) == 0,
                'issues': issues,
                'recommendations': self._get_configuration_recommendations(issues),
                'message': 'تم فحص إعدادات OAuth'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في اختبار إعدادات OAuth: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في اختبار إعدادات OAuth'
            }
    
    def _get_configuration_recommendations(self, issues: List[str]) -> List[str]:
        """الحصول على توصيات لحل مشاكل الإعدادات"""
        recommendations = []
        
        if 'Client ID غير مُعرف' in issues:
            recommendations.append('قم بتعيين متغير البيئة GOOGLE_CLIENT_ID')
        
        if 'Client Secret غير مُعرف' in issues:
            recommendations.append('قم بتعيين متغير البيئة GOOGLE_CLIENT_SECRET')
        
        if 'Redirect URI غير مُعرف' in issues:
            recommendations.append('قم بتعيين متغير البيئة OAUTH_REDIRECT_URI')
        
        if any('URL' in issue for issue in issues):
            recommendations.append('تحقق من اتصال الإنترنت والجدار الناري')
        
        return recommendations

# إنشاء مثيل عام
oauth_handler = OAuthHandler()

# تصدير الكلاس والمثيل
__all__ = ['OAuthHandler', 'oauth_handler']

