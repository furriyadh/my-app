"""
Google Ads OAuth Routes
مسارات OAuth المحسنة لـ Google Ads API

المميزات:
- تدفق OAuth 2.0 آمن
- إدارة الجلسات والرموز المميزة
- معالجة الأخطاء المتقدمة
- دعم بيئات التطوير والإنتاج
"""

import os
import json
import logging
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from flask import Blueprint, request, jsonify, redirect, session, url_for  # type: ignore

# استيراد الخدمات
from backend.services.oauth_handler import OAuthHandler
from backend.services.google_ads_client import GoogleAdsClientService, GoogleAdsConfig
from backend.config import Config

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint
oauth_bp = Blueprint(
    'google_ads_oauth',
    __name__,
    url_prefix='/api/google-ads/oauth'
)

def arabic_jsonify(data, status_code=200):
    """دالة مساعدة لإنشاء استجابات JSON مع دعم الترميز العربي"""
    response = jsonify(data)
    response.status_code = status_code
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response

# ===========================================
# مسارات OAuth الأساسية
# ===========================================

@oauth_bp.route("/authorize", methods=["GET"])
def authorize():
    """بدء تدفق OAuth 2.0 لـ Google Ads"""
    try:
        # الحصول على معرف المستخدم من الطلب أو الجلسة
        user_id = request.args.get('user_id') or session.get('user_id', 'anonymous')
        
        # تهيئة معالج OAuth
        oauth_handler = OAuthHandler()
        
        # إنشاء رابط التفويض
        auth_result = oauth_handler.create_authorization_url(
            user_id=user_id,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', 'Unknown')
        )
        
        if not auth_result.get('success'):
            logger.error(f"فشل في إنشاء رابط التفويض: {auth_result.get('message')}")
            return arabic_jsonify({
                "success": False,
                "message": auth_result.get('message', 'فشل في إنشاء رابط التفويض'),
                "error_code": "AUTHORIZATION_URL_FAILED"
            }), 500
        
        # حفظ معرف الجلسة في session
        session['oauth_session_id'] = auth_result['session_id']
        session['oauth_user_id'] = user_id
        
        # إعادة التوجيه إلى Google
        authorization_url = auth_result['authorization_url']
        
        logger.info(f"تم إنشاء رابط التفويض للمستخدم {user_id}: {authorization_url}")
        
        # إذا كان الطلب من API، إرجاع JSON
        if request.headers.get('Accept') == 'application/json':
            return arabic_jsonify({
                "success": True,
                "authorization_url": authorization_url,
                "session_id": auth_result['session_id']
            })
        
        # إعادة التوجيه المباشر
        return redirect(authorization_url)
        
    except Exception as e:
        logger.error(f"خطأ في بدء تدفق OAuth: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء بدء تدفق OAuth",
            "error_code": "OAUTH_START_ERROR"
        }), 500

@oauth_bp.route("/callback", methods=["GET"])
def oauth_callback():
    """معالجة رد الاتصال من Google OAuth"""
    try:
        # الحصول على المعاملات من الطلب
        code = request.args.get("code")
        state = request.args.get("state")
        error = request.args.get("error")
        
        # معالجة الأخطاء
        if error:
            logger.error(f"خطأ في رد الاتصال من Google OAuth: {error}")
            return arabic_jsonify({
                "success": False,
                "message": f"خطأ في المصادقة: {error}",
                "error_code": "OAUTH_ERROR"
            }), 400
        
        if not code or not state:
            logger.error("رمز المصادقة أو state مفقود في رد الاتصال")
            return arabic_jsonify({
                "success": False,
                "message": "رمز المصادقة أو معرف الجلسة مفقود",
                "error_code": "MISSING_PARAMETERS"
            }), 400
        
        # تهيئة معالج OAuth
        oauth_handler = OAuthHandler()
        
        # معالجة رد الاتصال
        callback_result = oauth_handler.handle_oauth_callback(code, state)
        
        if not callback_result.get('success'):
            logger.error(f"فشل في معالجة رد الاتصال: {callback_result.get('message')}")
            return arabic_jsonify({
                "success": False,
                "message": callback_result.get('message', 'فشل في معالجة رد الاتصال'),
                "error_code": "CALLBACK_PROCESSING_FAILED"
            }), 400
        
        # الحصول على الرموز المميزة
        access_token = callback_result.get('access_token')
        refresh_token = callback_result.get('refresh_token')
        
        # الحصول على معلومات المستخدم
        user_info_result = oauth_handler.get_user_info(access_token)
        user_info = user_info_result.get('user_info', {}) if user_info_result.get('success') else {}
        
        # تهيئة عميل Google Ads للاختبار
        try:
            google_ads_config = GoogleAdsConfig(
                developer_token=Config.GOOGLE_DEVELOPER_TOKEN,
                client_id=Config.GOOGLE_CLIENT_ID,
                client_secret=Config.GOOGLE_CLIENT_SECRET,
                refresh_token=refresh_token,
                login_customer_id=Config.MCC_LOGIN_CUSTOMER_ID
            )
            
            google_ads_client = GoogleAdsClientService(google_ads_config)
            
            # اختبار الاتصال بـ Google Ads API
            accessible_customers = google_ads_client.get_accessible_customers()
            
            logger.info(f"تم الحصول على {len(accessible_customers)} حساب متاح من Google Ads API")
            
        except Exception as ads_error:
            logger.warning(f"تحذير: لم يتم اختبار Google Ads API: {str(ads_error)}")
            accessible_customers = []
        
        # تنظيف الجلسة
        session.pop('oauth_session_id', None)
        session.pop('oauth_user_id', None)
        
        logger.info(f"تم إكمال تدفق OAuth بنجاح للمستخدم: {user_info.get('email', 'غير معروف')}")
        
        # إرجاع النتيجة
        return arabic_jsonify({
            "success": True,
            "message": "تم إكمال المصادقة بنجاح",
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user_info": user_info,
                "google_ads_accounts": len(accessible_customers),
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في معالجة رد الاتصال OAuth: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء معالجة رد الاتصال",
            "error_code": "CALLBACK_ERROR"
        }), 500

@oauth_bp.route("/refresh", methods=["POST"])
def refresh_token():
    """تجديد رمز الوصول"""
    try:
        data = request.get_json()
        
        if not data:
            return arabic_jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        user_id = data.get('user_id')
        
        if not user_id:
            return arabic_jsonify({
                "success": False,
                "message": "معرف المستخدم مطلوب",
                "error_code": "MISSING_USER_ID"
            }), 400
        
        # تهيئة معالج OAuth
        oauth_handler = OAuthHandler()
        
        # تجديد الرمز
        refresh_result = oauth_handler.refresh_access_token(user_id)
        
        if not refresh_result.get('success'):
            logger.error(f"فشل في تجديد الرمز للمستخدم {user_id}: {refresh_result.get('message')}")
            return arabic_jsonify({
                "success": False,
                "message": refresh_result.get('message', 'فشل في تجديد الرمز'),
                "error_code": "TOKEN_REFRESH_FAILED"
            }), 400
        
        logger.info(f"تم تجديد الرمز بنجاح للمستخدم: {user_id}")
        
        return arabic_jsonify({
            "success": True,
            "message": "تم تجديد الرمز بنجاح",
            "access_token": refresh_result.get('access_token'),
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في تجديد الرمز: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء تجديد الرمز",
            "error_code": "REFRESH_ERROR"
        }), 500

@oauth_bp.route("/revoke", methods=["POST"])
def revoke_token():
    """إلغاء رمز الوصول"""
    try:
        data = request.get_json()
        
        if not data:
            return arabic_jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        user_id = data.get('user_id')
        
        if not user_id:
            return arabic_jsonify({
                "success": False,
                "message": "معرف المستخدم مطلوب",
                "error_code": "MISSING_USER_ID"
            }), 400
        
        # تهيئة معالج OAuth
        oauth_handler = OAuthHandler()
        
        # إلغاء الرمز
        revoke_result = oauth_handler.revoke_token(user_id)
        
        if not revoke_result.get('success'):
            logger.error(f"فشل في إلغاء الرمز للمستخدم {user_id}: {revoke_result.get('message')}")
            return arabic_jsonify({
                "success": False,
                "message": revoke_result.get('message', 'فشل في إلغاء الرمز'),
                "error_code": "TOKEN_REVOKE_FAILED"
            }), 400
        
        logger.info(f"تم إلغاء الرمز بنجاح للمستخدم: {user_id}")
        
        return arabic_jsonify({
            "success": True,
            "message": "تم إلغاء الرمز بنجاح",
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في إلغاء الرمز: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء إلغاء الرمز",
            "error_code": "REVOKE_ERROR"
        }), 500

# ===========================================
# مسارات المعلومات والحالة
# ===========================================

@oauth_bp.route("/status", methods=["GET"])
def oauth_status():
    """فحص حالة OAuth"""
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return arabic_jsonify({
                "success": False,
                "message": "معرف المستخدم مطلوب",
                "error_code": "MISSING_USER_ID"
            }), 400
        
        # تهيئة معالج OAuth
        oauth_handler = OAuthHandler()
        
        # فحص حالة الرمز
        user_tokens = oauth_handler.token_cache.get(user_id)
        
        if not user_tokens:
            return arabic_jsonify({
                "success": True,
                "authenticated": False,
                "message": "المستخدم غير مصادق"
            })
        
        # فحص انتهاء صلاحية الرمز
        expires_at = user_tokens.get('expires_at')
        is_expired = False
        
        if expires_at:
            is_expired = datetime.fromisoformat(expires_at.replace('Z', '+00:00')) < datetime.utcnow()
        
        return arabic_jsonify({
            "success": True,
            "authenticated": True,
            "token_expired": is_expired,
            "has_refresh_token": bool(user_tokens.get('refresh_token')),
            "scope": user_tokens.get('scope'),
            "expires_at": expires_at
        })
        
    except Exception as e:
        logger.error(f"خطأ في فحص حالة OAuth: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء فحص الحالة",
            "error_code": "STATUS_ERROR"
        }), 500

@oauth_bp.route("/config", methods=["GET"])
def oauth_config():
    """الحصول على إعدادات OAuth العامة"""
    try:
        return arabic_jsonify({
            "success": True,
            "config": {
                "client_id": Config.GOOGLE_CLIENT_ID,
                "redirect_uri": Config.GOOGLE_REDIRECT_URI,
                "scopes": [
                    "https://www.googleapis.com/auth/adwords",
                    "https://www.googleapis.com/auth/userinfo.email",
                    "https://www.googleapis.com/auth/userinfo.profile"
                ],
                "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
                "environment": os.getenv("FLASK_ENV", "development")
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على إعدادات OAuth: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء الحصول على الإعدادات",
            "error_code": "CONFIG_ERROR"
        }), 500

# ===========================================
# مسارات الاختبار
# ===========================================

@oauth_bp.route("/test", methods=["GET"])
def test_oauth():
    """اختبار إعدادات OAuth"""
    try:
        # فحص متغيرات البيئة المطلوبة
        required_vars = {
            "GOOGLE_CLIENT_ID": Config.GOOGLE_CLIENT_ID,
            "GOOGLE_CLIENT_SECRET": Config.GOOGLE_CLIENT_SECRET,
            "GOOGLE_DEVELOPER_TOKEN": Config.GOOGLE_DEVELOPER_TOKEN,
            "MCC_LOGIN_CUSTOMER_ID": Config.MCC_LOGIN_CUSTOMER_ID
        }
        
        missing_vars = []
        configured_vars = {}
        
        for var_name, var_value in required_vars.items():
            if var_value:
                configured_vars[var_name] = "مكون"
            else:
                missing_vars.append(var_name)
                configured_vars[var_name] = "مفقود"
        
        # اختبار تهيئة معالج OAuth
        oauth_handler_status = "فشل"
        oauth_error = None
        
        try:
            oauth_handler = OAuthHandler()
            if oauth_handler.client_id and oauth_handler.client_secret:
                oauth_handler_status = "نجح"
        except Exception as e:
            oauth_error = str(e)
        
        return arabic_jsonify({
            "success": True,
            "test_results": {
                "environment_variables": configured_vars,
                "missing_variables": missing_vars,
                "oauth_handler_initialization": oauth_handler_status,
                "oauth_handler_error": oauth_error,
                "redirect_uri": Config.GOOGLE_REDIRECT_URI,
                "environment": os.getenv("FLASK_ENV", "development"),
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في اختبار OAuth: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء اختبار OAuth",
            "error_code": "TEST_ERROR"
        }), 500

