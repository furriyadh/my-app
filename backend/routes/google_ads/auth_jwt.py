"""
Google Ads AI Platform - JWT Authentication API
نظام المصادقة المحدث والمبسط باستخدام JWT

المميزات:
- تسجيل الدخول والتسجيل باستخدام JWT
- إدارة الملف الشخصي
- تأكيد البريد الإلكتروني
- إعادة تعيين كلمة المرور
- نظام الأدوار والصلاحيات
- تسجيل الأحداث الأمنية

Author: Google Ads AI Platform Team
Version: 2.0.0
"""

import json
import bcrypt
import secrets
import hashlib
import re
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from flask import Blueprint, request, jsonify, g

# استيراد النظام الجديد
from backend.auth.jwt_manager import jwt_manager, TokenType, UserRole
from backend.auth.auth_decorators import jwt_required, admin_required, role_required, get_current_user

# استيرادات الخدمات الموجودة مع معالجة الأخطاء
try:
    from backend.utils.validators import validate_email, validate_user_data
except ImportError:
    validate_email = None
    validate_user_data = None

try:
    from backend.utils.helpers import generate_unique_id, sanitize_text
except ImportError:
    def generate_unique_id():
        return secrets.token_urlsafe(16)
    
    def sanitize_text(text):
        return re.sub(r'[<>"\\]', '', str(text))

try:
    from backend.utils.database import DatabaseManager
except ImportError:
    DatabaseManager = None

try:
    from backend.utils.supabase_config import supabase_config, db_select, db_insert, db_update
except ImportError:
    supabase_config = None
    db_select = None
    db_insert = None
    db_update = None

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# تهيئة DatabaseManager
db_manager = None
if DatabaseManager:
    try:
        db_manager = DatabaseManager()
        logger.info("✅ تم تهيئة DatabaseManager بنجاح.")
    except Exception as e:
        logger.error(f"❌ فشل تهيئة DatabaseManager: {e}")

# إنشاء Blueprint
auth_bp = Blueprint(
    'auth_jwt',
    __name__,
    url_prefix='/api/auth'
)

# ===========================================
# دوال مساعدة
# ===========================================

def arabic_jsonify(data, status_code=200):
    """دالة مساعدة لإنشاء استجابات JSON مع دعم الترميز العربي"""
    response = jsonify(data)
    response.status_code = status_code
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response

def hash_password(password: str) -> str:
    """تشفير كلمة المرور باستخدام bcrypt"""
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def check_password(password: str, hashed: str) -> bool:
    """التحقق من كلمة المرور المشفرة"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except ValueError:
        # للتوافق مع الأنظمة القديمة
        logger.warning("كلمة المرور المشفرة ليست بصيغة bcrypt. محاولة التحقق باستخدام SHA256.")
        return hashlib.sha256(password.encode('utf-8')).hexdigest() == hashed
    except Exception as e:
        logger.error(f"خطأ في التحقق من كلمة المرور: {e}")
        return False

def validate_email_format(email: str) -> tuple[bool, str]:
    """التحقق من صيغة البريد الإلكتروني"""
    if validate_email:
        return validate_email(email)
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(email_pattern, email):
        return True, "البريد الإلكتروني صحيح"
    return False, "صيغة البريد الإلكتروني غير صحيحة"

def validate_password_strength(password: str) -> tuple[bool, str]:
    """التحقق من قوة كلمة المرور"""
    if len(password) < 8:
        return False, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
    
    if not re.search(r'[A-Za-z]', password):
        return False, "كلمة المرور يجب أن تحتوي على حروف"
    
    if not re.search(r'\d', password):
        return False, "كلمة المرور يجب أن تحتوي على أرقام"
    
    return True, "كلمة المرور قوية"

def clean_user_data(user: Dict[str, Any]) -> Dict[str, Any]:
    """تنظيف بيانات المستخدم قبل إرسالها للعميل"""
    cleaned_data = user.copy()
    cleaned_data.pop('password', None)
    cleaned_data.pop('verification_code', None)
    cleaned_data.pop('reset_token', None)
    cleaned_data.pop('reset_token_expires_at', None)
    return cleaned_data

def log_security_event(event_type: str, user_id: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
    """تسجيل الأحداث الأمنية"""
    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "ip_address": request.remote_addr if request else "N/A",
        "user_agent": request.headers.get('User-Agent') if request else "N/A",
        "details": details if details is not None else {}
    }
    logger.info(f"SECURITY_EVENT: {json.dumps(event)}")

# ===========================================
# دوال قاعدة البيانات
# ===========================================

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """جلب المستخدم بالبريد الإلكتروني"""
    try:
        if supabase_config and supabase_config.is_connected():
            result = db_select('users', filters={'email': email}, limit=1)
            if result and result.get('success') and result.get('data'):
                return result['data'][0]
        elif db_manager:
            return db_manager.get_user_by_email(email)
        return None
    except Exception as e:
        logger.error(f"خطأ في جلب المستخدم: {e}")
        return None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """جلب المستخدم بالمعرف"""
    try:
        if supabase_config and supabase_config.is_connected():
            result = db_select('users', filters={'id': user_id}, limit=1)
            if result and result.get('success') and result.get('data'):
                return result['data'][0]
        elif db_manager:
            return db_manager.get_user_by_id(user_id)
        return None
    except Exception as e:
        logger.error(f"خطأ في جلب المستخدم: {e}")
        return None

def create_user(user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """إنشاء مستخدم جديد"""
    try:
        if supabase_config and supabase_config.is_connected():
            result = db_insert('users', user_data)
            if result and result.get('success') and result.get('data'):
                return result['data'][0]
        elif db_manager:
            return db_manager.create_user(user_data)
        return None
    except Exception as e:
        logger.error(f"خطأ في إنشاء المستخدم: {e}")
        return None

def update_user(user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """تحديث بيانات المستخدم"""
    try:
        if supabase_config and supabase_config.is_connected():
            result = db_update('users', {'id': user_id}, updates)
            if result and result.get('success') and result.get('data'):
                return result['data'][0]
        elif db_manager:
            return db_manager.update_user(user_id, updates)
        return None
    except Exception as e:
        logger.error(f"خطأ في تحديث المستخدم: {e}")
        return None

# ===========================================
# مسارات فحص الصحة
# ===========================================

@auth_bp.route("/health", methods=["GET"])
def health_check():
    """فحص صحة خدمة المصادقة"""
    try:
        db_status = "غير متصل"
        if supabase_config and supabase_config.is_connected():
            db_status = "متصل (Supabase)"
        elif db_manager:
            db_status = "متصل (DatabaseManager)"
        
        return arabic_jsonify({
            "success": True,
            "service": "JWT Authentication API",
            "status": "صحي",
            "database_connection": db_status,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"خطأ في فحص الصحة: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "service": "JWT Authentication API",
            "status": "خطأ",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

# ===========================================
# مسارات المصادقة الأساسية
# ===========================================

@auth_bp.route("/login", methods=["POST"])
def login():
    """تسجيل الدخول باستخدام JWT"""
    try:
        data = request.get_json()
        
        if not data:
            return arabic_jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        remember_me = data.get("remember_me", False)
        
        # التحقق من البيانات
        if not email or not password:
            return arabic_jsonify({
                "success": False,
                "message": "البريد الإلكتروني وكلمة المرور مطلوبان",
                "error_code": "MISSING_CREDENTIALS"
            }), 400
        
        # التحقق من صحة البريد الإلكتروني
        is_valid_email, email_message = validate_email_format(email)
        if not is_valid_email:
            return arabic_jsonify({
                "success": False,
                "message": f"البريد الإلكتروني: {email_message}",
                "error_code": "INVALID_EMAIL"
            }), 400
        
        user = get_user_by_email(email)
        if not user or not check_password(password, user.get('password', '')):
            log_security_event("LOGIN_FAILED", details={"email": email, "reason": "INVALID_CREDENTIALS"})
            return arabic_jsonify({
                "success": False,
                "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                "error_code": "INVALID_CREDENTIALS"
            }), 401
        
        if not user.get('is_active', True):
            log_security_event("LOGIN_FAILED", user_id=user['id'], details={"email": email, "reason": "ACCOUNT_INACTIVE"})
            return arabic_jsonify({
                "success": False,
                "message": "الحساب غير نشط. يرجى الاتصال بالدعم.",
                "error_code": "ACCOUNT_INACTIVE"
            }), 403
        
        if not user.get('is_verified', False):
            log_security_event("LOGIN_FAILED", user_id=user['id'], details={"email": email, "reason": "EMAIL_NOT_VERIFIED"})
            return arabic_jsonify({
                "success": False,
                "message": "البريد الإلكتروني غير مؤكد. يرجى تأكيد بريدك الإلكتروني.",
                "error_code": "EMAIL_NOT_VERIFIED"
            }), 403

        # إنشاء رموز JWT
        additional_claims = {
            "user_id": user["id"],
            "email": user["email"],
            "role": user.get("role", UserRole.USER.value)
        }
        access_token = jwt_manager.create_token(
            TokenType.ACCESS, 
            additional_claims, 
            expires_delta=timedelta(hours=24)
        )
        refresh_token = jwt_manager.create_token(
            TokenType.REFRESH, 
            additional_claims, 
            expires_delta=timedelta(days=7) if remember_me else timedelta(days=1)
        )
        
        log_security_event("LOGIN_SUCCESS", user_id=user['id'], details={"email": email})
        
        return arabic_jsonify({
            "success": True,
            "message": "تم تسجيل الدخول بنجاح",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": clean_user_data(user)
        })
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل الدخول: {str(e)}")
        log_security_event("LOGIN_ERROR", details={"error": str(e)})
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء تسجيل الدخول",
            "error_code": "LOGIN_ERROR"
        }), 500

@auth_bp.route("/register", methods=["POST"])
def register():
    """تسجيل مستخدم جديد"""
    try:
        data = request.get_json()
        
        if not data:
            return arabic_jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")
        
        # التحقق من البيانات المدخلة
        if not name or not email or not password or not confirm_password:
            return arabic_jsonify({
                "success": False,
                "message": "جميع الحقول مطلوبة",
                "error_code": "MISSING_FIELDS"
            }), 400
        
        if password != confirm_password:
            return arabic_jsonify({
                "success": False,
                "message": "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
                "error_code": "PASSWORD_MISMATCH"
            }), 400
        
        is_valid_email, email_message = validate_email_format(email)
        if not is_valid_email:
            return arabic_jsonify({
                "success": False,
                "message": f"البريد الإلكتروني: {email_message}",
                "error_code": "INVALID_EMAIL"
            }), 400
        
        is_strong_password, password_message = validate_password_strength(password)
        if not is_strong_password:
            return arabic_jsonify({
                "success": False,
                "message": f"كلمة المرور: {password_message}",
                "error_code": "WEAK_PASSWORD"
            }), 400
        
        # فحص إذا كان المستخدم موجودًا بالفعل
        if get_user_by_email(email):
            return arabic_jsonify({
                "success": False,
                "message": "البريد الإلكتروني مسجل بالفعل",
                "error_code": "EMAIL_ALREADY_REGISTERED"
            }), 409
        
        hashed_password = hash_password(password)
        user_id = generate_unique_id()
        verification_code = secrets.token_urlsafe(32)
        
        new_user_data = {
            "id": user_id,
            "name": sanitize_text(name),
            "email": email,
            "password": hashed_password,
            "role": UserRole.USER.value,
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True,
            "is_verified": False,
            "verification_code": verification_code
        }
        
        new_user = create_user(new_user_data)
        
        if not new_user:
            raise Exception("فشل في إنشاء المستخدم في قاعدة البيانات")
        
        log_security_event("REGISTER_SUCCESS", user_id=new_user['id'], details={"email": email})
        
        logger.info(f"تم إنشاء مستخدم جديد: {email}. رمز التأكيد: {verification_code}")
        
        return arabic_jsonify({
            "success": True,
            "message": "تم التسجيل بنجاح. يرجى تأكيد بريدك الإلكتروني.",
            "user": clean_user_data(new_user)
        }), 201

    except Exception as e:
        logger.error(f"خطأ في التسجيل: {str(e)}")
        log_security_event("REGISTER_ERROR", details={"error": str(e)})
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء التسجيل",
            "error_code": "REGISTER_ERROR"
        }), 500

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """تسجيل الخروج"""
    try:
        current_user = get_current_user()
        
        if current_user:
            log_security_event("LOGOUT_SUCCESS", user_id=current_user.get('id'))
        
        return arabic_jsonify({
            "success": True,
            "message": "تم تسجيل الخروج بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل الخروج: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء تسجيل الخروج",
            "error_code": "LOGOUT_ERROR"
        }), 500

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(token_type=TokenType.REFRESH)
def refresh_token():
    """تحديث رمز الوصول باستخدام رمز التحديث"""
    try:
        current_user = get_current_user()
        
        additional_claims = {
            "user_id": current_user["id"],
            "email": current_user["email"],
            "role": current_user.get("role", UserRole.USER.value)
        }
        access_token = jwt_manager.create_token(
            TokenType.ACCESS, 
            additional_claims, 
            expires_delta=timedelta(hours=24)
        )
        
        log_security_event("TOKEN_REFRESH", user_id=current_user.get('id'))
        
        return arabic_jsonify({
            "success": True,
            "message": "تم تحديث رمز الوصول بنجاح",
            "access_token": access_token
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحديث الرمز: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء تحديث الرمز",
            "error_code": "TOKEN_REFRESH_ERROR"
        }), 500

@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    """تأكيد البريد الإلكتروني"""
    try:
        data = request.get_json()
        
        if not data:
            return arabic_jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        email = data.get("email", "").strip().lower()
        code = data.get("code", "").strip()
        
        if not email or not code:
            return arabic_jsonify({
                "success": False,
                "message": "البريد الإلكتروني ورمز التأكيد مطلوبان",
                "error_code": "MISSING_FIELDS"
            }), 400
        
        user = get_user_by_email(email)
        
        if not user:
            return arabic_jsonify({
                "success": False,
                "message": "المستخدم غير موجود",
                "error_code": "USER_NOT_FOUND"
            }), 404
        
        if user.get("is_verified", False):
            return arabic_jsonify({
                "success": False,
                "message": "البريد الإلكتروني مؤكد بالفعل",
                "error_code": "EMAIL_ALREADY_VERIFIED"
            }), 409
        
        if user.get("verification_code") != code:
            log_security_event("EMAIL_VERIFICATION_FAILED", user_id=user['id'], details={"email": email, "reason": "INVALID_CODE"})
            return arabic_jsonify({
                "success": False,
                "message": "رمز التأكيد غير صحيح",
                "error_code": "INVALID_VERIFICATION_CODE"
            }), 400
        
        updated_user = update_user(user["id"], {"is_verified": True, "verification_code": None})
        
        if not updated_user:
            raise Exception("فشل في تحديث حالة المستخدم في قاعدة البيانات")
        
        log_security_event("EMAIL_VERIFICATION_SUCCESS", user_id=user['id'], details={"email": email})
        
        return arabic_jsonify({
            "success": True,
            "message": "تم تأكيد البريد الإلكتروني بنجاح",
            "user": clean_user_data(updated_user)
        })
        
    except Exception as e:
        logger.error(f"خطأ في تأكيد البريد الإلكتروني: {str(e)}")
        log_security_event("EMAIL_VERIFICATION_ERROR", details={"error": str(e)})
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء تأكيد البريد الإلكتروني",
            "error_code": "EMAIL_VERIFICATION_ERROR"
        }), 500

@auth_bp.route("/request-password-reset", methods=["POST"])
def request_password_reset():
    """طلب إعادة تعيين كلمة المرور"""
    try:
        data = request.get_json()
        
        if not data:
            return arabic_jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        email = data.get("email", "").strip().lower()
        
        if not email:
            return arabic_jsonify({
                "success": False,
                "message": "البريد الإلكتروني مطلوب",
                "error_code": "MISSING_EMAIL"
            }), 400
        
        user = get_user_by_email(email)
        
        if not user:
            # لا تكشف عن وجود المستخدم لأسباب أمنية
            logger.warning(f"محاولة طلب إعادة تعيين كلمة مرور لبريد غير موجود: {email}")
            return arabic_jsonify({
                "success": True,
                "message": "إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابط إعادة تعيين كلمة المرور."
            })
        
        reset_token = secrets.token_urlsafe(64)
        reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)
        
        updated_user = update_user(user["id"], {
            "reset_token": reset_token,
            "reset_token_expires_at": reset_token_expires_at.isoformat()
        })
        
        if not updated_user:
            raise Exception("فشل في تحديث رمز إعادة تعيين كلمة المرور في قاعدة البيانات")
        
        # هنا يجب إرسال البريد الإلكتروني للمستخدم مع رابط إعادة التعيين الذي يحتوي على reset_token
        logger.info(f"تم إنشاء رمز إعادة تعيين كلمة المرور للمستخدم {email}: {reset_token}")
        
        log_security_event("PASSWORD_RESET_REQUEST", user_id=user['id'], details={"email": email})
        
        return arabic_jsonify({
            "success": True,
            "message": "إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابط إعادة تعيين كلمة المرور."
        })
        
    except Exception as e:
        logger.error(f"خطأ في طلب إعادة تعيين كلمة المرور: {str(e)}")
        log_security_event("PASSWORD_RESET_REQUEST_ERROR", details={"error": str(e)})
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء طلب إعادة تعيين كلمة المرور",
            "error_code": "PASSWORD_RESET_REQUEST_ERROR"
        }), 500

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """إعادة تعيين كلمة المرور"""
    try:
        data = request.get_json()
        
        if not data:
            return arabic_jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        token = data.get("token", "").strip()
        new_password = data.get("new_password", "")
        confirm_new_password = data.get("confirm_new_password", "")
        
        if not token or not new_password or not confirm_new_password:
            return arabic_jsonify({
                "success": False,
                "message": "جميع الحقول مطلوبة",
                "error_code": "MISSING_FIELDS"
            }), 400
        
        if new_password != confirm_new_password:
            return arabic_jsonify({
                "success": False,
                "message": "كلمة المرور الجديدة وتأكيدها غير متطابقين",
                "error_code": "PASSWORD_MISMATCH"
            }), 400
        
        is_strong_password, password_message = validate_password_strength(new_password)
        if not is_strong_password:
            return arabic_jsonify({
                "success": False,
                "message": f"كلمة المرور الجديدة: {password_message}",
                "error_code": "WEAK_PASSWORD"
            }), 400
        
        # البحث عن المستخدم باستخدام رمز إعادة التعيين
        user = None
        if supabase_config and supabase_config.is_connected():
            result = db_select(
                'users',
                filters={
                    'reset_token': token,
                    'reset_token_expires_at.gte': datetime.utcnow().isoformat()
                },
                limit=1
            )
            if result and result.get('success') and result.get('data'):
                user = result['data'][0]
        elif db_manager:
            user = db_manager.get_user_by_reset_token(token)
            if user and datetime.fromisoformat(user.get('reset_token_expires_at')) < datetime.utcnow():
                user = None # الرمز منتهي الصلاحية
        
        if not user:
            log_security_event("PASSWORD_RESET_FAILED", details={"token": token, "reason": "INVALID_OR_EXPIRED_TOKEN"})
            return arabic_jsonify({
                "success": False,
                "message": "رمز إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية",
                "error_code": "INVALID_OR_EXPIRED_TOKEN"
            }), 400
        
        hashed_password = hash_password(new_password)
        updated_user = update_user(user["id"], {
            "password": hashed_password,
            "reset_token": None,
            "reset_token_expires_at": None
        })
        
        if not updated_user:
            raise Exception("فشل في تحديث كلمة المرور في قاعدة البيانات")
        
        log_security_event("PASSWORD_RESET_SUCCESS", user_id=user['id'])
        
        return arabic_jsonify({
            "success": True,
            "message": "تم إعادة تعيين كلمة المرور بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في إعادة تعيين كلمة المرور: {str(e)}")
        log_security_event("PASSWORD_RESET_ERROR", details={"error": str(e)})
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء إعادة تعيين كلمة المرور",
            "error_code": "PASSWORD_RESET_ERROR"
        }), 500

# ===========================================
# مسارات إدارة الملف الشخصي
# ===========================================

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """جلب بيانات الملف الشخصي للمستخدم الحالي"""
    try:
        current_user = get_current_user()
        
        if not current_user:
            return arabic_jsonify({
                "success": False,
                "message": "المستخدم غير مصادق عليه",
                "error_code": "UNAUTHENTICATED"
            }), 401
        
        return arabic_jsonify({
            "success": True,
            "user": clean_user_data(current_user)
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب الملف الشخصي: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء جلب الملف الشخصي",
            "error_code": "GET_PROFILE_ERROR"
        }), 500

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """تحديث بيانات الملف الشخصي للمستخدم الحالي"""
    try:
        data = request.get_json()
        
        if not data:
            return arabic_jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        current_user = get_current_user()
        
        if not current_user:
            return arabic_jsonify({
                "success": False,
                "message": "المستخدم غير مصادق عليه",
                "error_code": "UNAUTHENTICATED"
            }), 401
        
        user_id = current_user["id"]
        updates = {}
        
        if "name" in data:
            updates["name"] = sanitize_text(data["name"].strip())
        
        if "email" in data:
            new_email = data["email"].strip().lower()
            if new_email != current_user["email"]:
                is_valid_email, email_message = validate_email_format(new_email)
                if not is_valid_email:
                    return arabic_jsonify({
                        "success": False,
                        "message": f"البريد الإلكتروني: {email_message}",
                        "error_code": "INVALID_EMAIL"
                    }), 400
                
                if get_user_by_email(new_email):
                    return arabic_jsonify({
                        "success": False,
                        "message": "البريد الإلكتروني الجديد مسجل بالفعل",
                        "error_code": "EMAIL_ALREADY_REGISTERED"
                    }), 409
                
                updates["email"] = new_email
                updates["is_verified"] = False # يتطلب إعادة تأكيد البريد الإلكتروني
                updates["verification_code"] = secrets.token_urlsafe(32)
                logger.info(f"تم تغيير البريد الإلكتروني للمستخدم {user_id} إلى {new_email}. رمز التأكيد الجديد: {updates['verification_code']}")
        
        if "role" in data and current_user.get("role") == UserRole.ADMIN.value:
            # السماح للمسؤولين بتغيير الأدوار
            if data["role"] in [role.value for role in UserRole]:
                updates["role"] = data["role"]
            else:
                return arabic_jsonify({
                    "success": False,
                    "message": "دور غير صالح",
                    "error_code": "INVALID_ROLE"
                }), 400
        elif "role" in data:
            return arabic_jsonify({
                "success": False,
                "message": "ليس لديك صلاحية لتغيير الدور",
                "error_code": "UNAUTHORIZED_ROLE_CHANGE"
            }), 403

        if not updates:
            return arabic_jsonify({
                "success": False,
                "message": "لا توجد بيانات للتحديث",
                "error_code": "NO_DATA_TO_UPDATE"
            }), 400
        
        updated_user = update_user(user_id, updates)
        
        if not updated_user:
            raise Exception("فشل في تحديث الملف الشخصي في قاعدة البيانات")
        
        log_security_event("PROFILE_UPDATE_SUCCESS", user_id=user_id, details=updates)
        
        return arabic_jsonify({
            "success": True,
            "message": "تم تحديث الملف الشخصي بنجاح",
            "user": clean_user_data(updated_user)
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحديث الملف الشخصي: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء تحديث الملف الشخصي",
            "error_code": "UPDATE_PROFILE_ERROR"
        }), 500

@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """تغيير كلمة المرور للمستخدم الحالي"""
    try:
        data = request.get_json()
        
        if not data:
            return arabic_jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        current_password = data.get("current_password", "")
        new_password = data.get("new_password", "")
        confirm_new_password = data.get("confirm_new_password", "")
        
        if not current_password or not new_password or not confirm_new_password:
            return arabic_jsonify({
                "success": False,
                "message": "جميع الحقول مطلوبة",
                "error_code": "MISSING_FIELDS"
            }), 400
        
        if new_password != confirm_new_password:
            return arabic_jsonify({
                "success": False,
                "message": "كلمة المرور الجديدة وتأكيدها غير متطابقين",
                "error_code": "PASSWORD_MISMATCH"
            }), 400
        
        is_strong_password, password_message = validate_password_strength(new_password)
        if not is_strong_password:
            return arabic_jsonify({
                "success": False,
                "message": f"كلمة المرور الجديدة: {password_message}",
                "error_code": "WEAK_PASSWORD"
            }), 400
        
        current_user = get_current_user()
        
        if not current_user:
            return arabic_jsonify({
                "success": False,
                "message": "المستخدم غير مصادق عليه",
                "error_code": "UNAUTHENTICATED"
            }), 401
        
        if not check_password(current_password, current_user.get("password", "")):
            log_security_event("CHANGE_PASSWORD_FAILED", user_id=current_user['id'], details={"reason": "INCORRECT_CURRENT_PASSWORD"})
            return arabic_jsonify({
                "success": False,
                "message": "كلمة المرور الحالية غير صحيحة",
                "error_code": "INCORRECT_CURRENT_PASSWORD"
            }), 400
        
        hashed_new_password = hash_password(new_password)
        updated_user = update_user(current_user["id"], {"password": hashed_new_password})
        
        if not updated_user:
            raise Exception("فشل في تحديث كلمة المرور في قاعدة البيانات")
        
        log_security_event("CHANGE_PASSWORD_SUCCESS", user_id=current_user['id'])
        
        return arabic_jsonify({
            "success": True,
            "message": "تم تغيير كلمة المرور بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في تغيير كلمة المرور: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء تغيير كلمة المرور",
            "error_code": "CHANGE_PASSWORD_ERROR"
        }), 500

@auth_bp.route("/admin/users", methods=["GET"])
@admin_required()
def get_all_users():
    """جلب جميع المستخدمين (للمسؤولين فقط)"""
    try:
        users = []
        if supabase_config and supabase_config.is_connected():
            result = db_select('users')
            if result and result.get('success') and result.get('data'):
                users = result['data']
        elif db_manager:
            users = db_manager.get_all_users()
        
        cleaned_users = [clean_user_data(user) for user in users]
        
        return arabic_jsonify({
            "success": True,
            "users": cleaned_users
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب جميع المستخدمين: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء جلب المستخدمين",
            "error_code": "GET_ALL_USERS_ERROR"
        }), 500

@auth_bp.route("/admin/user/<user_id>", methods=["PUT"])
@admin_required()
def admin_update_user(user_id):
    """تحديث بيانات مستخدم معين بواسطة المسؤول"""
    try:
        data = request.get_json()
        
        if not data:
            return arabic_jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        user = get_user_by_id(user_id)
        if not user:
            return arabic_jsonify({
                "success": False,
                "message": "المستخدم غير موجود",
                "error_code": "USER_NOT_FOUND"
            }), 404
        
        updates = {}
        if "name" in data:
            updates["name"] = sanitize_text(data["name"].strip())
        if "email" in data:
            new_email = data["email"].strip().lower()
            if new_email != user["email"]:
                is_valid_email, email_message = validate_email_format(new_email)
                if not is_valid_email:
                    return arabic_jsonify({
                        "success": False,
                        "message": f"البريد الإلكتروني: {email_message}",
                        "error_code": "INVALID_EMAIL"
                    }), 400
                if get_user_by_email(new_email):
                    return arabic_jsonify({
                        "success": False,
                        "message": "البريد الإلكتروني الجديد مسجل بالفعل",
                        "error_code": "EMAIL_ALREADY_REGISTERED"
                    }), 409
                updates["email"] = new_email
                updates["is_verified"] = False
                updates["verification_code"] = secrets.token_urlsafe(32)
        if "password" in data:
            is_strong_password, password_message = validate_password_strength(data["password"])
            if not is_strong_password:
                return arabic_jsonify({
                    "success": False,
                    "message": f"كلمة المرور: {password_message}",
                    "error_code": "WEAK_PASSWORD"
                }), 400
            updates["password"] = hash_password(data["password"])
        if "role" in data:
            if data["role"] in [role.value for role in UserRole]:
                updates["role"] = data["role"]
            else:
                return arabic_jsonify({
                    "success": False,
                    "message": "دور غير صالح",
                    "error_code": "INVALID_ROLE"
                }), 400
        if "is_active" in data:
            updates["is_active"] = bool(data["is_active"])
        if "is_verified" in data:
            updates["is_verified"] = bool(data["is_verified"])
        
        if not updates:
            return arabic_jsonify({
                "success": False,
                "message": "لا توجد بيانات للتحديث",
                "error_code": "NO_DATA_TO_UPDATE"
            }), 400
        
        updated_user = update_user(user_id, updates)
        
        if not updated_user:
            raise Exception("فشل في تحديث المستخدم في قاعدة البيانات")
        
        log_security_event("ADMIN_USER_UPDATE_SUCCESS", user_id=user_id, details=updates)
        
        return arabic_jsonify({
            "success": True,
            "message": "تم تحديث المستخدم بنجاح",
            "user": clean_user_data(updated_user)
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحديث المستخدم بواسطة المسؤول: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء تحديث المستخدم",
            "error_code": "ADMIN_UPDATE_USER_ERROR"
        }), 500

@auth_bp.route("/admin/user/<user_id>", methods=["DELETE"])
@admin_required()
def admin_delete_user(user_id):
    """حذف مستخدم معين بواسطة المسؤول"""
    try:
        user = get_user_by_id(user_id)
        if not user:
            return arabic_jsonify({
                "success": False,
                "message": "المستخدم غير موجود",
                "error_code": "USER_NOT_FOUND"
            }), 404
        
        if supabase_config and supabase_config.is_connected():
            result = supabase_config.client.table('users').delete().eq('id', user_id).execute()
            if result.data:
                log_security_event("ADMIN_USER_DELETE_SUCCESS", user_id=user_id)
                return arabic_jsonify({
                    "success": True,
                    "message": "تم حذف المستخدم بنجاح"
                })
            else:
                raise Exception("فشل في حذف المستخدم من Supabase")
        elif db_manager:
            if db_manager.delete_user(user_id):
                log_security_event("ADMIN_USER_DELETE_SUCCESS", user_id=user_id)
                return arabic_jsonify({
                    "success": True,
                    "message": "تم حذف المستخدم بنجاح"
                })
            else:
                raise Exception("فشل في حذف المستخدم من DatabaseManager")
        else:
            raise Exception("لا يوجد اتصال بقاعدة البيانات")
        
    except Exception as e:
        logger.error(f"خطأ في حذف المستخدم بواسطة المسؤول: {str(e)}")
        return arabic_jsonify({
            "success": False,
            "message": "حدث خطأ غير متوقع أثناء حذف المستخدم",
            "error_code": "ADMIN_DELETE_USER_ERROR"
        }), 500

