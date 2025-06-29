"""
مسارات المصادقة - Authentication Routes
Google Ads AI Platform - Authentication API Routes
"""

import json
from flask import Blueprint, request, jsonify, session, redirect, url_for
from functools import wraps
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import os

# استيرادات مطلقة بدلاً من النسبية
from services.oauth_handler import OAuthHandler
from utils.validators import validate_email, validate_user_data
from utils.helpers import generate_unique_id, sanitize_text
from utils.database import DatabaseManager # افتراض وجود DatabaseManager
from utils.google_ads_api import GoogleAdsApiManager # افتراض وجود GoogleAdsApiManager

# إنشاء Blueprint
auth_bp = Blueprint("auth", __name__)

# إعداد الخدمات
try:
    oauth_handler = OAuthHandler()
except Exception as e:
    oauth_handler = None
    logging.warning(f"فشل في تحميل OAuthHandler: {e}")

try:
    db_manager = DatabaseManager()
except Exception as e:
    db_manager = None
    logging.warning(f"فشل في تحميل DatabaseManager: {e}")

try:
    google_ads_api_manager = GoogleAdsApiManager()
except Exception as e:
    google_ads_api_manager = None
    logging.warning(f"فشل في تحميل GoogleAdsApiManager: {e}")

logger = logging.getLogger(__name__)

def login_required(f):
    """ديكوريتر للتحقق من تسجيل الدخول"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({
                "success": False,
                "message": "يجب تسجيل الدخول أولاً",
                "error_code": "AUTHENTICATION_REQUIRED"
            }), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """ديكوريتر للتحقق من صلاحيات الإدارة"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({
                "success": False,
                "message": "يجب تسجيل الدخول أولاً",
                "error_code": "AUTHENTICATION_REQUIRED"
            }), 401
        
        user_role = session.get("user_role", "user")
        if user_role != "admin":
            return jsonify({
                "success": False,
                "message": "غير مصرح لك بالوصول لهذا المورد",
                "error_code": "INSUFFICIENT_PERMISSIONS"
            }), 403
        
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route("/health", methods=["GET"])
def health_check():
    """فحص صحة Auth API"""
    try:
        return jsonify({
            "success": True,
            "service": "Authentication API",
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "components": {
                "oauth_handler": oauth_handler is not None,
                "database_manager": db_manager is not None,
                "google_ads_api_manager": google_ads_api_manager is not None,
                "session_support": True
            },
            "message": "خدمة المصادقة تعمل بنجاح"
        })
    except Exception as e:
        logger.error(f"خطأ في فحص صحة Auth API: {str(e)}")
        return jsonify({
            "success": False,
            "service": "Authentication API",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    """تسجيل الدخول"""
    try:
        if not db_manager:
            return jsonify({
                "success": False,
                "message": "خدمة قاعدة البيانات غير متاحة",
                "error_code": "DATABASE_UNAVAILABLE"
            }), 503
            
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        # التحقق من البيانات
        if not email or not password:
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني وكلمة المرور مطلوبان",
                "error_code": "MISSING_CREDENTIALS"
            }), 400
        
        # التحقق من صحة البريد الإلكتروني
        try:
            is_valid_email, email_message = validate_email(email)
            if not is_valid_email:
                return jsonify({
                    "success": False,
                    "message": f"البريد الإلكتروني: {email_message}",
                    "error_code": "INVALID_EMAIL"
                }), 400
        except Exception:
            # إذا فشل التحقق، استخدم تحقق أساسي
            if "@" not in email or "." not in email:
                return jsonify({
                    "success": False,
                    "message": "البريد الإلكتروني غير صحيح",
                    "error_code": "INVALID_EMAIL"
                }), 400
        
        # محاولة تسجيل الدخول من قاعدة البيانات
        user = db_manager.get_user_by_email(email)
        if not user or not db_manager.check_password(user["password_hash"], password):
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                "error_code": "INVALID_CREDENTIALS"
            }), 401
        
        # إنشاء جلسة المستخدم
        session["user_id"] = user["id"]
        session["user_email"] = user["email"]
        session["user_name"] = user["name"]
        session["user_role"] = user.get("role", "user")
        session["login_time"] = datetime.now().isoformat()
        
        # تسجيل عملية تسجيل الدخول
        logger.info(f"تسجيل دخول ناجح للمستخدم: {email}")
        
        return jsonify({
            "success": True,
            "message": "تم تسجيل الدخول بنجاح",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user.get("role", "user")
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل الدخول: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تسجيل الدخول",
            "error_code": "LOGIN_ERROR"
        }), 500

@auth_bp.route("/register", methods=["POST"])
def register():
    """تسجيل مستخدم جديد"""
    try:
        if not db_manager:
            return jsonify({
                "success": False,
                "message": "خدمة قاعدة البيانات غير متاحة",
                "error_code": "DATABASE_UNAVAILABLE"
            }), 503

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "بيانات غير صحيحة", "error_code": "INVALID_DATA"}), 400

        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        validation_result, validation_message = validate_user_data(name, email, password)
        if not validation_result:
            return jsonify({"success": False, "message": validation_message, "error_code": "VALIDATION_ERROR"}), 400

        if db_manager.get_user_by_email(email):
            return jsonify({"success": False, "message": "البريد الإلكتروني مسجل بالفعل", "error_code": "EMAIL_ALREADY_EXISTS"}), 409

        user_id = generate_unique_id()
        password_hash = db_manager.hash_password(password)
        
        new_user = {
            "id": user_id,
            "name": sanitize_text(name),
            "email": email,
            "password_hash": password_hash,
            "role": "user",
            "created_at": datetime.utcnow().isoformat()
        }
        
        db_manager.add_user(new_user)
        logger.info(f"تم تسجيل مستخدم جديد: {email}")

        return jsonify({
            "success": True,
            "message": "تم تسجيل المستخدم بنجاح",
            "user": {"id": user_id, "name": name, "email": email, "role": "user"}
        }), 201

    except Exception as e:
        logger.error(f"خطأ في تسجيل المستخدم: {str(e)}")
        return jsonify({"success": False, "message": "حدث خطأ في تسجيل المستخدم", "error_code": "REGISTRATION_ERROR"}), 500

@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    """تسجيل الخروج"""
    try:
        user_email = session.get("user_email")
        
        # مسح الجلسة
        session.clear()
        
        # تسجيل عملية تسجيل الخروج
        logger.info(f"تسجيل خروج للمستخدم: {user_email}")
        
        return jsonify({
            "success": True,
            "message": "تم تسجيل الخروج بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل الخروج: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تسجيل الخروج",
            "error_code": "LOGOUT_ERROR"
        }), 500

@auth_bp.route("/profile", methods=["GET"])
@login_required
def get_profile():
    """الحصول على ملف المستخدم الشخصي"""
    try:
        user_id = session.get("user_id")
        user_name = session.get("user_name")
        user_email = session.get("user_email")
        user_role = session.get("user_role")
        
        return jsonify({
            "success": True,
            "user": {
                "id": user_id,
                "name": user_name,
                "email": user_email,
                "role": user_role,
                "login_time": session.get("login_time")
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الملف الشخصي: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في الحصول على البيانات",
            "error_code": "PROFILE_ERROR"
        }), 500

@auth_bp.route("/check-session", methods=["GET"])
def check_session():
    """التحقق من حالة الجلسة"""
    try:
        if "user_id" in session:
            return jsonify({
                "success": True,
                "authenticated": True,
                "user": {
                    "id": session.get("user_id"),
                    "name": session.get("user_name"),
                    "email": session.get("user_email"),
                    "role": session.get("user_role")
                }
            })
        else:
            return jsonify({
                "success": True,
                "authenticated": False,
                "message": "لا توجد جلسة نشطة"
            })
            
    except Exception as e:
        logger.error(f"خطأ في التحقق من الجلسة: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في التحقق من الجلسة",
            "error_code": "SESSION_CHECK_ERROR"
        }), 500

@auth_bp.route("/google/login", methods=["GET"])
@login_required # يجب أن يكون المستخدم مسجلاً للدخول العادي أولاً
def google_login():
    """تسجيل الدخول بـ Google Ads OAuth"""
    try:
        if not oauth_handler:
            return jsonify({
                "success": False,
                "message": "خدمة Google OAuth غير متاحة",
                "error_code": "OAUTH_UNAVAILABLE"
            }), 503
        
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"success": False, "message": "معرف المستخدم غير موجود في الجلسة", "error_code": "USER_ID_MISSING"}), 400

        # الحصول على IP وعامل المستخدم للمصادقة
        ip_address = request.remote_addr
        user_agent = request.headers.get("User-Agent")

        auth_result = oauth_handler.create_authorization_url(user_id, ip_address, user_agent)
        
        if auth_result["success"]:
            # تخزين session_id في الجلسة لمطابقته لاحقًا في رد الاتصال
            session["oauth_session_id"] = auth_result["session_id"]
            return jsonify({
                "success": True,
                "authorization_url": auth_result["authorization_url"],
                "message": "تم إنشاء رابط التفويض بنجاح. يرجى إعادة توجيه المستخدم."
            })
        else:
            return jsonify({"success": False, "message": auth_result["message"], "error": auth_result["error"]}), 500
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل الدخول بـ Google Ads: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تسجيل الدخول بـ Google Ads",
            "error_code": "GOOGLE_ADS_LOGIN_ERROR"
        }), 500

@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    """معالجة رد الاتصال من Google OAuth"""
    try:
        if not oauth_handler:
            return jsonify({"success": False, "message": "خدمة Google OAuth غير متاحة", "error_code": "OAUTH_UNAVAILABLE"}), 503

        code = request.args.get("code")
        state = request.args.get("state")
        error = request.args.get("error")

        if error:
            logger.error(f"خطأ في رد الاتصال من Google: {error}")
            return redirect(os.getenv("FRONTEND_DASHBOARD_URL", "/dashboard") + f"?oauth_error={error}")

        if not code or not state:
            return jsonify({"success": False, "message": "كود أو حالة مفقودة في رد الاتصال", "error_code": "MISSING_CALLBACK_PARAMS"}), 400

        # التحقق من session_id المخزن في الجلسة
        session_id = session.get("oauth_session_id")
        if not session_id:
            return jsonify({"success": False, "message": "معرف جلسة OAuth مفقود", "error_code": "OAUTH_SESSION_MISSING"}), 400

        exchange_result = oauth_handler.exchange_code_for_token(session_id, code, state)

        if exchange_result["success"]:
            user_id = session.get("user_id")
            access_token = exchange_result["access_token"]
            refresh_token = exchange_result.get("refresh_token")
            user_info = exchange_result.get("user_info", {})

            # ==================================================================
            # الخطوة 1: الحصول على قائمة حسابات Google Ads للمستخدم
            # ==================================================================
            if not google_ads_api_manager:
                logger.warning("GoogleAdsApiManager غير متاح. لا يمكن جلب حسابات Google Ads.")
                # يمكن إعادة التوجيه مع رسالة خطأ أو إظهار صفحة اختيار لاحقًا
                return redirect(os.getenv("FRONTEND_DASHBOARD_URL", "/dashboard") + "?oauth_success=true&no_ads_accounts=true")

            # تهيئة عميل Google Ads API باستخدام الـ access token
            google_ads_client = google_ads_api_manager.get_client(access_token, refresh_token, user_id)
            
            # جلب قائمة حسابات Google Ads التي يمكن للمستخدم الوصول إليها
            try:
                customer_accounts = google_ads_api_manager.list_accessible_customers(google_ads_client)
                
                if not customer_accounts:
                    logger.info(f"المستخدم {user_id} ليس لديه حسابات Google Ads يمكن الوصول إليها.")
                    return redirect(os.getenv("FRONTEND_DASHBOARD_URL", "/dashboard") + "?oauth_success=true&no_ads_accounts=true")

                # ==================================================================
                # الخطوة 2: اختيار الحساب الإعلاني وربطه بـ MCC (إذا كان مطلوبًا)
                # ==================================================================
                # هنا، ستحتاج إلى منطق لاختيار الحساب الإعلاني الرئيسي
                # يمكن أن يكون ذلك:
                # أ) إذا كان هناك حساب واحد فقط، اختاره تلقائيًا.
                # ب) إذا كان هناك MCC، استخدمه كحساب رئيسي.
                # ج) إعادة توجيه المستخدم إلى صفحة اختيار الحساب في الواجهة الأمامية.
                
                # لغرض هذا الكود، سنفترض أننا نختار أول حساب كحساب رئيسي أو MCC
                # في سيناريو حقيقي، قد تحتاج إلى واجهة مستخدم لاختيار الحساب
                target_customer_id = None
                is_mcc = False
                
                # البحث عن حساب MCC إذا كان موجودًا
                for account in customer_accounts:
                    if account.manager_account:
                        target_customer_id = account.id
                        is_mcc = True
                        break
                
                # إذا لم يتم العثور على MCC، اختر أول حساب عادي
                if not target_customer_id and customer_accounts:
                    target_customer_id = customer_accounts[0].id

                if not target_customer_id:
                    logger.warning(f"المستخدم {user_id} لديه رموز ولكن لا يوجد حساب Google Ads يمكن ربطه.")
                    return redirect(os.getenv("FRONTEND_DASHBOARD_URL", "/dashboard") + "?oauth_success=true&no_valid_account=true")

                # ==================================================================
                # الخطوة 3: ربط الحساب بـ MCC الخاص بك (إذا لم يكن مرتبطًا بالفعل)
                # ==================================================================
                # هذه الخطوة تتطلب أن يكون لديك MCC ID الخاص بك
                your_mcc_id = os.getenv("GOOGLE_ADS_MCC_ID") # يجب تعيينه في .env
                
                if your_mcc_id and not is_mcc: # إذا كان الحساب ليس MCC بالفعل
                    try:
                        # تحقق مما إذا كان الحساب مرتبطًا بالفعل بـ MCC الخاص بك
                        # هذه الوظيفة (is_linked_to_mcc) يجب أن تكون موجودة في GoogleAdsApiManager
                        # وقد تتطلب استدعاء API إضافي
                        # لغرض هذا المثال، سنفترض أنها غير مرتبطة ونحاول الربط
                        
                        # ربط الحساب العادي بـ MCC الخاص بك
                        # هذه الوظيفة (link_customer_to_mcc) يجب أن تكون موجودة في GoogleAdsApiManager
                        # وتتطلب صلاحيات خاصة في Google Ads API
                        # google_ads_api_manager.link_customer_to_mcc(google_ads_client, target_customer_id, your_mcc_id)
                        logger.info(f"تم محاولة ربط الحساب {target_customer_id} بـ MCC {your_mcc_id}")
                        # يجب أن يتم التحقق من نجاح الربط عبر API

                    except Exception as link_e:
                        logger.error(f"فشل ربط الحساب {target_customer_id} بـ MCC {your_mcc_id}: {str(link_e)}")
                        # يمكن إعادة التوجيه مع رسالة خطأ
                        return redirect(os.getenv("FRONTEND_DASHBOARD_URL", "/dashboard") + f"?oauth_success=true&link_error={str(link_e)}")

                # ==================================================================
                # الخطوة 4: تسجيل العميل في قاعدة البيانات
                # ==================================================================
                if db_manager:
                    try:
                        # تحديث معلومات المستخدم في قاعدة البيانات
                        db_manager.update_user_google_ads_info(
                            user_id,
                            target_customer_id,
                            access_token,
                            refresh_token,
                            user_info.get("email"),
                            user_info.get("name"),
                            json.dumps([acc.to_dict() for acc in customer_accounts]) # تخزين جميع الحسابات المتاحة
                        )
                        logger.info(f"تم تحديث معلومات Google Ads للمستخدم {user_id} في قاعدة البيانات.")
                    except Exception as db_e:
                        logger.error(f"خطأ في تحديث قاعدة البيانات للمستخدم {user_id}: {str(db_e)}")
                        return redirect(os.getenv("FRONTEND_DASHBOARD_URL", "/dashboard") + f"?oauth_success=true&db_error={str(db_e)}")
                else:
                    logger.warning("DatabaseManager غير متاح. لا يمكن حفظ معلومات Google Ads.")

                # ==================================================================
                # الخطوة 5: التحويل إلى لوحة التحكم (Dashboard URL)
                # ==================================================================
                dashboard_url = os.getenv("FRONTEND_DASHBOARD_URL", "https://diceaks.com/dashboard" )
                return redirect(dashboard_url + "?oauth_success=true&customer_id=" + str(target_customer_id))

            except Exception as api_e:
                logger.error(f"خطأ في التفاعل مع Google Ads API: {str(api_e)}")
                return redirect(os.getenv("FRONTEND_DASHBOARD_URL", "/dashboard") + f"?oauth_error=api_error&details={str(api_e)}")

        else:
            logger.error(f"فشل تبديل رمز OAuth: {exchange_result.get("error", "خطأ غير معروف")}")
            return redirect(os.getenv("FRONTEND_DASHBOARD_URL", "/dashboard") + f"?oauth_error=exchange_failed&details={exchange_result.get("error", "")}")

    except Exception as e:
        logger.error(f"خطأ عام في معالجة رد اتصال Google: {str(e)}")
        return redirect(os.getenv("FRONTEND_DASHBOARD_URL", "/dashboard") + f"?oauth_error=general_error&details={str(e)}")

# معالج الأخطاء للـ Blueprint
@auth_bp.errorhandler(404)
def not_found(error):
    """معالج الصفحات غير الموجودة في Auth API"""
    return jsonify({
        "success": False,
        "error": "المسار غير موجود في Auth API",
        "available_endpoints": [
            "/health",
            "/login",
            "/register",
            "/logout",
            "/profile",
            "/check-session",
            "/google/login",
            "/google/callback" # إضافة مسار رد الاتصال
        ]
    }), 404

@auth_bp.errorhandler(500)
def internal_error(error):
    """معالج الأخطاء الداخلية في Auth API"""
    logger.error(f"خطأ داخلي في Auth API: {str(error)}")
    return jsonify({
        "success": False,
        "error": "خطأ داخلي في Auth API",
        "message": "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى"
    }), 500

