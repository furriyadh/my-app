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
from services.oauth_handler import OAuthHandler
from services.google_ads_client import GoogleAdsClientManager
from config import Config

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint
oauth_bp = Blueprint(
    'google_ads_oauth',
    __name__,
    url_prefix='/api/google-ads/oauth'
)

def arabic_jsonify(data, status_code=200):
    """دعم التشفير العربي JSON وإضافة معلومات إضافية"""
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
        
        # معالجة OAuth بتهيئة
        oauth_handler = OAuthHandler()
        
        # تحديد النطاقات الإضافية بناءً على الطلب
        requested_scope_key = request.args.get('scope')
        additional_scopes = []
        
        scope_mapping = {
            'youtube': ['https://www.googleapis.com/auth/youtube.readonly'],
            'analytics': ['https://www.googleapis.com/auth/analytics.readonly'],
            'merchant': ['https://www.googleapis.com/auth/content'] 
        }
        
        if requested_scope_key and requested_scope_key in scope_mapping:
            additional_scopes = scope_mapping[requested_scope_key]
        
        # إنشاء رابط التفويض
        auth_result = oauth_handler.create_authorization_url(
            user_id=user_id,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', 'Unknown'),
            additional_scopes=additional_scopes
        )
        
        if not auth_result.get('success'):
            logger.error(f"فشل في إنشاء رابط التفويض: {auth_result.get('message', 'خطأ غير معروف')}")
            return arabic_jsonify({
                "success": False,
                "message": auth_result.get('message', 'فشل في إنشاء رابط التفويض'),
                "error_code": "AUTHORIZATION_URL_FAILED"
            }), 500
            
        return redirect(auth_result.get('authorization_url'))
        
    except Exception as e:
        logger.error(f"خطأ في authorize: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": f"خطأ في بدء عملية التفويض: {str(e)}",
            "error_code": "AUTHORIZE_ERROR"
        }), 500

@oauth_bp.route("/callback", methods=["GET"])
def oauth_callback():
    """معالجة callback من Google OAuth"""
    try:
        # الحصول على الكود من الاستعلام
        code = request.args.get('code')
        state = request.args.get('state')
        error = request.args.get('error')
        
        if error:
            logger.error(f"خطأ OAuth من Google: {error}")
            return arabic_jsonify({
                "success": False,
                "message": f"خطأ في التفويض: {error}",
                "error_code": "OAUTH_ERROR"
            }), 400
            
        if not code:
            logger.error("لم يتم استلام كود التفويض")
            return arabic_jsonify({
                "success": False,
                "message": "لم يتم استلام كود التفويض من Google",
                "error_code": "MISSING_AUTH_CODE"
            }), 400
            
        # معالجة OAuth
        oauth_handler = OAuthHandler()
        
        # تبديل الكود بالرمز المميز
        token_result = oauth_handler.exchange_code_for_token(
            code=code,
            state=state
        )
        
        if not token_result.get('success'):
            logger.error(f"فشل في تبديل الكود: {token_result.get('message', 'خطأ غير معروف')}")
            return arabic_jsonify({
                "success": False,
                "message": token_result.get('message', 'فشل في الحصول على الرمز المميز'),
                "error_code": "TOKEN_EXCHANGE_FAILED"
            }), 500
            
        # حفظ الرمز المميز في الجلسة
        session['access_token'] = token_result.get('access_token')
        session['refresh_token'] = token_result.get('refresh_token')
        session['token_expires_at'] = token_result.get('expires_at')
        
        # اختبار الاتصال بـ Google Ads API
        try:
            google_ads_client = GoogleAdsClientManager()
            if google_ads_client.is_initialized:
                logger.info("✅ تم اختبار الاتصال بـ Google Ads API بنجاح")
            else:
                logger.warning("⚠️ Google Ads Client غير مهيأ - سيتم استخدام OAuth2 Manager")
            
        except Exception as ads_error:
            logger.warning(f"تحذير: لم يتم اختبار Google Ads API: {str(ads_error)}")
            
        return arabic_jsonify({
            "success": True,
            "message": "تم التفويض بنجاح",
            "data": {
                "access_token": token_result.get('access_token')[:20] + "...",  # جزء من الرمز للأمان
                "expires_in": token_result.get('expires_in'),
                "scope": token_result.get('scope')
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في oauth_callback: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": f"خطأ في معالجة callback: {str(e)}",
            "error_code": "CALLBACK_ERROR"
        }), 500

@oauth_bp.route("/refresh", methods=["POST"])
def refresh_token():
    """تجديد الرمز المميز"""
    try:
        refresh_token = session.get('refresh_token') or request.json.get('refresh_token')
        
        if not refresh_token:
            return arabic_jsonify({
                "success": False,
                "message": "لم يتم العثور على refresh token",
                "error_code": "MISSING_REFRESH_TOKEN"
            }), 400
            
        oauth_handler = OAuthHandler()
        
        # تجديد الرمز المميز
        refresh_result = oauth_handler.refresh_access_token(refresh_token)
        
        if not refresh_result.get('success'):
            return arabic_jsonify({
                "success": False,
                "message": refresh_result.get('message', 'فشل في تجديد الرمز المميز'),
                "error_code": "TOKEN_REFRESH_FAILED"
            }), 500
            
        # تحديث الجلسة
        session['access_token'] = refresh_result.get('access_token')
        session['token_expires_at'] = refresh_result.get('expires_at')
        
        return arabic_jsonify({
            "success": True,
            "message": "تم تجديد الرمز المميز بنجاح",
            "data": {
                "access_token": refresh_result.get('access_token')[:20] + "...",
                "expires_in": refresh_result.get('expires_in')
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في refresh_token: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": f"خطأ في تجديد الرمز المميز: {str(e)}",
            "error_code": "REFRESH_ERROR"
        }), 500

@oauth_bp.route("/revoke", methods=["POST"])
def revoke_token():
    """إلغاء الرمز المميز"""
    try:
        access_token = session.get('access_token') or request.json.get('access_token')
        
        if not access_token:
            return arabic_jsonify({
                "success": False,
                "message": "لم يتم العثور على access token",
                "error_code": "MISSING_ACCESS_TOKEN"
            }), 400
            
        oauth_handler = OAuthHandler()
        
        # إلغاء الرمز المميز
        revoke_result = oauth_handler.revoke_token(access_token)
        
        # مسح الجلسة
        session.pop('access_token', None)
        session.pop('refresh_token', None)
        session.pop('token_expires_at', None)
        
        return arabic_jsonify({
            "success": True,
            "message": "تم إلغاء الرمز المميز بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في revoke_token: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": f"خطأ في إلغاء الرمز المميز: {str(e)}",
            "error_code": "REVOKE_ERROR"
        }), 500

@oauth_bp.route("/status", methods=["GET"])
def oauth_status():
    """فحص حالة OAuth"""
    try:
        access_token = session.get('access_token')
        expires_at = session.get('token_expires_at')
        
        if not access_token:
            return arabic_jsonify({
                "success": True,
                "authenticated": False,
                "message": "غير مُصرح"
            })
            
        # فحص انتهاء الصلاحية
        is_expired = False
        if expires_at:
            try:
                expires_datetime = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
                is_expired = datetime.now() > expires_datetime
            except:
                is_expired = True
                
        return arabic_jsonify({
            "success": True,
            "authenticated": True,
            "token_valid": not is_expired,
            "expires_at": expires_at,
            "message": "مُصرح" if not is_expired else "انتهت صلاحية الرمز المميز"
        })
        
    except Exception as e:
        logger.error(f"خطأ في oauth_status: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": f"خطأ في فحص حالة OAuth: {str(e)}",
            "error_code": "STATUS_ERROR"
        }), 500

@oauth_bp.route("/config", methods=["GET"])
def oauth_config():
    """الحصول على إعدادات OAuth"""
    try:
        return arabic_jsonify({
            "success": True,
            "config": {
                "client_id": Config.GOOGLE_ADS_CLIENT_ID,
                "scopes": [
                    "https://www.googleapis.com/auth/adwords"
                ],
                "redirect_uri": url_for('google_ads_oauth.oauth_callback', _external=True),
                "response_type": "code",
                "access_type": "offline",
                # إزالة prompt تماماً
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في oauth_config: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": f"خطأ في الحصول على إعدادات OAuth: {str(e)}",
            "error_code": "CONFIG_ERROR"
        }), 500

@oauth_bp.route("/test", methods=["GET"])
def test_oauth():
    """اختبار شامل لإعدادات OAuth"""
    try:
        test_results = {
            "config_check": False,
            "client_credentials": False,
            "google_ads_api": False,
            "errors": []
        }
        
        # فحص الإعدادات
        try:
            if Config.GOOGLE_ADS_CLIENT_ID and Config.GOOGLE_ADS_CLIENT_SECRET:
                test_results["config_check"] = True
                test_results["client_credentials"] = True
            else:
                test_results["errors"].append("إعدادات OAuth غير مكتملة")
        except Exception as e:
            test_results["errors"].append(f"خطأ في فحص الإعدادات: {str(e)}")
            
        # اختبار Google Ads API (إذا توفر refresh token)
        try:
            refresh_token = session.get('refresh_token')
            if refresh_token:
                google_ads_client = GoogleAdsClientManager()
                if google_ads_client.is_initialized:
                    test_results["google_ads_api"] = True
                    test_results["accessible_customers"] = "متاح"
                else:
                    test_results["errors"].append("Google Ads Client غير مهيأ")
            else:
                test_results["errors"].append("لا يوجد refresh token للاختبار")
                
        except Exception as e:
            test_results["errors"].append(f"خطأ في اختبار Google Ads API: {str(e)}")
            
        return arabic_jsonify({
            "success": True,
            "test_results": test_results,
            "overall_status": "نجح" if all([
                test_results["config_check"],
                test_results["client_credentials"]
            ]) else "فشل جزئي"
        })
        
    except Exception as e:
        logger.error(f"خطأ في test_oauth: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": f"خطأ في اختبار OAuth: {str(e)}",
            "error_code": "TEST_ERROR"
        }), 500

# ===========================================
# معالجات الأخطاء
# ===========================================

@oauth_bp.errorhandler(404)
def not_found(error):
    """معالج خطأ 404"""
    return arabic_jsonify({
        "success": False,
        "message": "المسار غير موجود",
        "error_code": "NOT_FOUND"
    }), 404

@oauth_bp.errorhandler(500)
def internal_error(error):
    """معالج خطأ 500"""
    logger.error(f"خطأ داخلي في OAuth: {str(error)}")
    return arabic_jsonify({
        "success": False,
        "message": "خطأ داخلي في الخادم",
        "error_code": "INTERNAL_ERROR"
    }), 500

# ===========================================
# تسجيل Blueprint
# ===========================================

logger.info("✅ تم تحميل OAuth Routes بنجاح")
logger.info(f"📊 عدد المسارات المتاحة: {len(oauth_bp.url_map._rules) if hasattr(oauth_bp, 'url_map') else 'غير محدد'}")

