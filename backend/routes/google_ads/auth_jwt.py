"""
مسارات المصادقة المحدثة - Updated Authentication Routes
Google Ads AI Platform - JWT Authentication API Routes

تم تحديث النظام لاستخدام JWT بدلاً من Flask Sessions
نظام متكامل يشمل جميع وظائف المصادقة والإدارة
"""

import json
import bcrypt
from flask import Blueprint, request, jsonify, g
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import logging
import os
import secrets
import hashlib
import re

# استيراد النظام الجديد
from auth.jwt_manager import jwt_manager, TokenType, UserRole
from auth.auth_decorators import jwt_required, admin_required, role_required, get_current_user

# استيرادات الخدمات الموجودة
try:
    from utils.validators import validate_email, validate_user_data
except ImportError:
    validate_email = None
    validate_user_data = None

try:
    from utils.helpers import generate_unique_id, sanitize_text
except ImportError:
    def generate_unique_id():
        return secrets.token_urlsafe(16)
    
    def sanitize_text(text):
        return re.sub(r'[<>"\']', '', str(text))

try:
    from utils.database import DatabaseManager
except ImportError:
    DatabaseManager = None

try:
    from utils.supabase_config import supabase_config, db_select, db_insert, db_update
except ImportError:
    supabase_config = None
    db_select = None
    db_insert = None
    db_update = None

# إنشاء Blueprint
auth_bp = Blueprint("auth", __name__)

# إعداد الخدمات
db_manager = None
if DatabaseManager:
    try:
        db_manager = DatabaseManager()
    except Exception as e:
        logging.warning(f"فشل في تحميل DatabaseManager: {e}")

logger = logging.getLogger(__name__)

# ===========================================
# دوال مساعدة للتشفير والتحقق
# ===========================================

def hash_password(password: str) -> str:
    """تشفير كلمة المرور باستخدام bcrypt"""
    try:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"خطأ في تشفير كلمة المرور: {e}")
        # fallback to simple hash (not recommended for production)
        return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """التحقق من كلمة المرور"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        # fallback verification
        return hashlib.sha256(password.encode()).hexdigest() == hashed

def validate_email_format(email: str) -> tuple[bool, str]:
    """التحقق من صيغة البريد الإلكتروني"""
    if validate_email:
        return validate_email(email)
    
    # تحقق أساسي
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

def update_user(user_id: str, updates: Dict[str, Any]) -> bool:
    """تحديث بيانات المستخدم"""
    try:
        if supabase_config and supabase_config.is_connected():
            result = db_update('users', updates, {'id': user_id})
            return result and result.get('success', False)
        elif db_manager:
            return db_manager.update_user(user_id, updates)
        return False
    except Exception as e:
        logger.error(f"خطأ في تحديث المستخدم: {e}")
        return False

def get_users_list(limit: int = 50, offset: int = 0, filters: Optional[Dict] = None) -> Dict[str, Any]:
    """جلب قائمة المستخدمين مع pagination"""
    try:
        if supabase_config and supabase_config.is_connected():
            # TODO: تنفيذ pagination و filters
            result = db_select('users', limit=limit)
            if result and result.get('success'):
                return {
                    'success': True,
                    'users': result.get('data', []),
                    'total': len(result.get('data', []))
                }
        elif db_manager:
            return db_manager.get_users_list(limit, offset, filters)
        
        return {'success': False, 'users': [], 'total': 0}
    except Exception as e:
        logger.error(f"خطأ في جلب قائمة المستخدمين: {e}")
        return {'success': False, 'users': [], 'total': 0}

# ===========================================
# دوال مساعدة للتحقق والتنظيف
# ===========================================

def clean_user_data(user: Dict[str, Any]) -> Dict[str, Any]:
    """تنظيف بيانات المستخدم من البيانات الحساسة"""
    sensitive_fields = ['password_hash', 'reset_token', 'verification_token']
    return {k: v for k, v in user.items() if k not in sensitive_fields}

def log_security_event(event_type: str, user_id: str = None, details: Dict = None):
    """تسجيل الأحداث الأمنية"""
    try:
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', ''),
            'details': details or {}
        }
        logger.info(f"Security Event: {json.dumps(log_data, ensure_ascii=False)}")
    except Exception as e:
        logger.error(f"خطأ في تسجيل الحدث الأمني: {e}")

# ===========================================
# مسارات الصحة والحالة
# ===========================================

@auth_bp.route("/health", methods=["GET"])
def health_check():
    """فحص صحة Auth API"""
    try:
        components_status = {
            "jwt_manager": jwt_manager is not None,
            "supabase": supabase_config.is_connected() if supabase_config else False,
            "database_manager": db_manager is not None,
            "bcrypt": True,
            "auth_system": "JWT"
        }
        
        all_healthy = all(components_status.values())
        
        return jsonify({
            "success": True,
            "service": "JWT Authentication API",
            "status": "healthy" if all_healthy else "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "components": components_status,
            "message": "خدمة المصادقة JWT تعمل بنجاح" if all_healthy else "بعض المكونات غير متاحة"
        }), 200 if all_healthy else 206
        
    except Exception as e:
        logger.error(f"خطأ في فحص صحة Auth API: {str(e)}")
        return jsonify({
            "success": False,
            "service": "JWT Authentication API",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@auth_bp.route("/status", methods=["GET"])
def status_check():
    """فحص حالة مفصل للنظام"""
    try:
        return jsonify({
            "success": True,
            "system": {
                "name": "Google Ads AI Platform - Auth Service",
                "version": "2.0.0",
                "auth_method": "JWT",
                "uptime": datetime.utcnow().isoformat()
            },
            "database": {
                "supabase_connected": supabase_config.is_connected() if supabase_config else False,
                "database_manager": db_manager is not None
            },
            "security": {
                "password_hashing": "bcrypt",
                "token_type": "JWT",
                "encryption": "enabled"
            }
        })
    except Exception as e:
        logger.error(f"خطأ في فحص الحالة: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
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
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        remember_me = data.get("remember_me", False)
        
        # التحقق من البيانات
        if not email or not password:
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني وكلمة المرور مطلوبان",
                "error_code": "MISSING_CREDENTIALS"
            }), 400
        
        # التحقق من صحة البريد الإلكتروني
        is_valid_email, email_message = validate_email_format(email)
        if not is_valid_email:
            return jsonify({
                "success": False,
                "message": f"البريد الإلكتروني: {email_message}",
                "error_code": "INVALID_EMAIL"
            }), 400
        
        # جلب المستخدم من قاعدة البيانات
        user = get_user_by_email(email)
        if not user:
            log_security_event("LOGIN_FAILED", details={"email": email, "reason": "user_not_found"})
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                "error_code": "INVALID_CREDENTIALS"
            }), 401
        
        # التحقق من كلمة المرور
        if not verify_password(password, user.get("password_hash", "")):
            log_security_event("LOGIN_FAILED", user_id=user.get('id'), details={"reason": "wrong_password"})
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                "error_code": "INVALID_CREDENTIALS"
            }), 401
        
        # التحقق من حالة المستخدم
        if user.get("status") == "inactive":
            log_security_event("LOGIN_BLOCKED", user_id=user.get('id'), details={"reason": "account_inactive"})
            return jsonify({
                "success": False,
                "message": "الحساب غير نشط. يرجى التواصل مع الإدارة",
                "error_code": "ACCOUNT_INACTIVE"
            }), 403
        
        if user.get("email_verified") == False:
            return jsonify({
                "success": False,
                "message": "يرجى تأكيد البريد الإلكتروني أولاً",
                "error_code": "EMAIL_NOT_VERIFIED"
            }), 403
        
        # إعداد بيانات المستخدم للرمز
        user_data = {
            'id': user['id'],
            'email': user['email'],
            'name': user.get('name', ''),
            'role': user.get('role', UserRole.USER.value),
            'permissions': user.get('permissions', []),
            'metadata': {
                'last_login': datetime.utcnow().isoformat(),
                'login_ip': request.remote_addr,
                'user_agent': request.headers.get('User-Agent', '')
            }
        }
        
        # إنشاء رموز JWT
        tokens = jwt_manager.create_token_pair(user_data)
        
        # تحديث آخر تسجيل دخول
        update_user(user['id'], {
            'last_login_at': datetime.utcnow().isoformat(),
            'login_count': user.get('login_count', 0) + 1
        })
        
        # تسجيل عملية تسجيل الدخول
        log_security_event("LOGIN_SUCCESS", user_id=user['id'])
        logger.info(f"تسجيل دخول ناجح للمستخدم: {email} - IP: {request.remote_addr}")
        
        return jsonify({
            "success": True,
            "message": "تم تسجيل الدخول بنجاح",
            "user": clean_user_data(user),
            **tokens
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
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        # استخراج البيانات
        name = sanitize_text(data.get("name", "")).strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")
        
        # التحقق من البيانات الأساسية
        if not all([name, email, password, confirm_password]):
            return jsonify({
                "success": False,
                "message": "جميع البيانات مطلوبة",
                "error_code": "MISSING_REQUIRED_FIELDS"
            }), 400
        
        # التحقق من تطابق كلمات المرور
        if password != confirm_password:
            return jsonify({
                "success": False,
                "message": "كلمات المرور غير متطابقة",
                "error_code": "PASSWORD_MISMATCH"
            }), 400
        
        # التحقق من قوة كلمة المرور
        is_strong, password_message = validate_password_strength(password)
        if not is_strong:
            return jsonify({
                "success": False,
                "message": password_message,
                "error_code": "WEAK_PASSWORD"
            }), 400
        
        # التحقق من صحة البريد الإلكتروني
        is_valid_email, email_message = validate_email_format(email)
        if not is_valid_email:
            return jsonify({
                "success": False,
                "message": f"البريد الإلكتروني: {email_message}",
                "error_code": "INVALID_EMAIL"
            }), 400
        
        # التحقق من عدم وجود المستخدم
        existing_user = get_user_by_email(email)
        if existing_user:
            log_security_event("REGISTRATION_FAILED", details={"email": email, "reason": "email_exists"})
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني مستخدم بالفعل",
                "error_code": "EMAIL_EXISTS"
            }), 409
        
        # إنشاء المستخدم الجديد
        user_data = {
            'id': generate_unique_id(),
            'name': name,
            'email': email,
            'password_hash': hash_password(password),
            'role': UserRole.USER.value,
            'status': 'active',
            'email_verified': False,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'login_count': 0,
            'permissions': []
        }
        
        # حفظ المستخدم في قاعدة البيانات
        new_user = create_user(user_data)
        if not new_user:
            return jsonify({
                "success": False,
                "message": "فشل في إنشاء الحساب",
                "error_code": "USER_CREATION_FAILED"
            }), 500
        
        # إنشاء رمز تأكيد البريد الإلكتروني
        verification_token = jwt_manager.create_verification_token({
            'id': new_user['id'],
            'email': new_user['email'],
            'name': new_user['name']
        })
        
        # تسجيل الحدث
        log_security_event("REGISTRATION_SUCCESS", user_id=new_user['id'])
        logger.info(f"تم إنشاء حساب جديد: {email}")
        
        return jsonify({
            "success": True,
            "message": "تم إنشاء الحساب بنجاح. يرجى تأكيد البريد الإلكتروني",
            "user": clean_user_data(new_user),
            "verification_required": True
        })
        
    except Exception as e:
        logger.error(f"خطأ في التسجيل: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في إنشاء الحساب",
            "error_code": "REGISTRATION_ERROR"
        }), 500

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """تسجيل الخروج"""
    try:
        current_user = get_current_user()
        
        # TODO: إضافة الرمز إلى blacklist
        # jwt_manager.revoke_token(g.current_token)
        
        log_security_event("LOGOUT", user_id=current_user['id'])
        logger.info(f"تسجيل خروج للمستخدم: {current_user['email']}")
        
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

@auth_bp.route("/refresh-token", methods=["POST"])
def refresh_token():
    """تجديد رمز الوصول"""
    try:
        data = request.get_json()
        refresh_token = data.get("refresh_token") if data else None
        
        if not refresh_token:
            return jsonify({
                "success": False,
                "message": "رمز التجديد مطلوب",
                "error_code": "REFRESH_TOKEN_REQUIRED"
            }), 400
        
        # تجديد الرمز
        new_tokens = jwt_manager.refresh_access_token(refresh_token)
        
        if not new_tokens:
            log_security_event("TOKEN_REFRESH_FAILED", details={"reason": "invalid_refresh_token"})
            return jsonify({
                "success": False,
                "message": "رمز التجديد غير صالح أو منتهي الصلاحية",
                "error_code": "INVALID_REFRESH_TOKEN"
            }), 401
        
        log_security_event("TOKEN_REFRESH_SUCCESS")
        
        return jsonify({
            "success": True,
            "message": "تم تجديد الرمز بنجاح",
            **new_tokens
        })
        
    except Exception as e:
        logger.error(f"خطأ في تجديد الرمز: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تجديد الرمز",
            "error_code": "TOKEN_REFRESH_ERROR"
        }), 500

@auth_bp.route("/check-session", methods=["GET"])
@jwt_required()
def check_session():
    """التحقق من صحة الجلسة (الرمز)"""
    try:
        current_user = get_current_user()
        
        return jsonify({
            "success": True,
            "authenticated": True,
            "user": {
                "id": current_user["id"],
                "name": current_user["name"],
                "email": current_user["email"],
                "role": current_user["role"]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في فحص الجلسة: {str(e)}")
        return jsonify({
            "success": False,
            "authenticated": False,
            "error_code": "SESSION_CHECK_ERROR"
        }), 500
"""
مسارات المصادقة المحدثة - Updated Authentication Routes
Google Ads AI Platform - JWT Authentication API Routes

تم تحديث النظام لاستخدام JWT بدلاً من Flask Sessions
نظام متكامل يشمل جميع وظائف المصادقة والإدارة
"""

import json
import bcrypt
from flask import Blueprint, request, jsonify, g
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import logging
import os
import secrets
import hashlib
import re

# استيراد النظام الجديد
from auth.jwt_manager import jwt_manager, TokenType, UserRole
from auth.auth_decorators import jwt_required, admin_required, role_required, get_current_user

# استيرادات الخدمات الموجودة
try:
    from utils.validators import validate_email, validate_user_data
except ImportError:
    validate_email = None
    validate_user_data = None

try:
    from utils.helpers import generate_unique_id, sanitize_text
except ImportError:
    def generate_unique_id():
        return secrets.token_urlsafe(16)
    
    def sanitize_text(text):
        return re.sub(r'[<>"\']', '', str(text))

try:
    from utils.database import DatabaseManager
except ImportError:
    DatabaseManager = None

try:
    from utils.supabase_config import supabase_config, db_select, db_insert, db_update
except ImportError:
    supabase_config = None
    db_select = None
    db_insert = None
    db_update = None

# إنشاء Blueprint
auth_bp = Blueprint("auth", __name__)

# إعداد الخدمات
db_manager = None
if DatabaseManager:
    try:
        db_manager = DatabaseManager()
    except Exception as e:
        logging.warning(f"فشل في تحميل DatabaseManager: {e}")

logger = logging.getLogger(__name__)

# ===========================================
# دوال مساعدة للتشفير والتحقق
# ===========================================

def hash_password(password: str) -> str:
    """تشفير كلمة المرور باستخدام bcrypt"""
    try:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"خطأ في تشفير كلمة المرور: {e}")
        # fallback to simple hash (not recommended for production)
        return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """التحقق من كلمة المرور"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        # fallback verification
        return hashlib.sha256(password.encode()).hexdigest() == hashed

def validate_email_format(email: str) -> tuple[bool, str]:
    """التحقق من صيغة البريد الإلكتروني"""
    if validate_email:
        return validate_email(email)
    
    # تحقق أساسي
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

def update_user(user_id: str, updates: Dict[str, Any]) -> bool:
    """تحديث بيانات المستخدم"""
    try:
        if supabase_config and supabase_config.is_connected():
            result = db_update('users', updates, {'id': user_id})
            return result and result.get('success', False)
        elif db_manager:
            return db_manager.update_user(user_id, updates)
        return False
    except Exception as e:
        logger.error(f"خطأ في تحديث المستخدم: {e}")
        return False

def get_users_list(limit: int = 50, offset: int = 0, filters: Optional[Dict] = None) -> Dict[str, Any]:
    """جلب قائمة المستخدمين مع pagination"""
    try:
        if supabase_config and supabase_config.is_connected():
            # TODO: تنفيذ pagination و filters
            result = db_select('users', limit=limit)
            if result and result.get('success'):
                return {
                    'success': True,
                    'users': result.get('data', []),
                    'total': len(result.get('data', []))
                }
        elif db_manager:
            return db_manager.get_users_list(limit, offset, filters)
        
        return {'success': False, 'users': [], 'total': 0}
    except Exception as e:
        logger.error(f"خطأ في جلب قائمة المستخدمين: {e}")
        return {'success': False, 'users': [], 'total': 0}

# ===========================================
# دوال مساعدة للتحقق والتنظيف
# ===========================================

def clean_user_data(user: Dict[str, Any]) -> Dict[str, Any]:
    """تنظيف بيانات المستخدم من البيانات الحساسة"""
    sensitive_fields = ['password_hash', 'reset_token', 'verification_token']
    return {k: v for k, v in user.items() if k not in sensitive_fields}

def log_security_event(event_type: str, user_id: str = None, details: Dict = None):
    """تسجيل الأحداث الأمنية"""
    try:
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', ''),
            'details': details or {}
        }
        logger.info(f"Security Event: {json.dumps(log_data, ensure_ascii=False)}")
    except Exception as e:
        logger.error(f"خطأ في تسجيل الحدث الأمني: {e}")

# ===========================================
# مسارات الصحة والحالة
# ===========================================

@auth_bp.route("/health", methods=["GET"])
def health_check():
    """فحص صحة Auth API"""
    try:
        components_status = {
            "jwt_manager": jwt_manager is not None,
            "supabase": supabase_config.is_connected() if supabase_config else False,
            "database_manager": db_manager is not None,
            "bcrypt": True,
            "auth_system": "JWT"
        }
        
        all_healthy = all(components_status.values())
        
        return jsonify({
            "success": True,
            "service": "JWT Authentication API",
            "status": "healthy" if all_healthy else "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "components": components_status,
            "message": "خدمة المصادقة JWT تعمل بنجاح" if all_healthy else "بعض المكونات غير متاحة"
        }), 200 if all_healthy else 206
        
    except Exception as e:
        logger.error(f"خطأ في فحص صحة Auth API: {str(e)}")
        return jsonify({
            "success": False,
            "service": "JWT Authentication API",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@auth_bp.route("/status", methods=["GET"])
def status_check():
    """فحص حالة مفصل للنظام"""
    try:
        return jsonify({
            "success": True,
            "system": {
                "name": "Google Ads AI Platform - Auth Service",
                "version": "2.0.0",
                "auth_method": "JWT",
                "uptime": datetime.utcnow().isoformat()
            },
            "database": {
                "supabase_connected": supabase_config.is_connected() if supabase_config else False,
                "database_manager": db_manager is not None
            },
            "security": {
                "password_hashing": "bcrypt",
                "token_type": "JWT",
                "encryption": "enabled"
            }
        })
    except Exception as e:
        logger.error(f"خطأ في فحص الحالة: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
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
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        remember_me = data.get("remember_me", False)
        
        # التحقق من البيانات
        if not email or not password:
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني وكلمة المرور مطلوبان",
                "error_code": "MISSING_CREDENTIALS"
            }), 400
        
        # التحقق من صحة البريد الإلكتروني
        is_valid_email, email_message = validate_email_format(email)
        if not is_valid_email:
            return jsonify({
                "success": False,
                "message": f"البريد الإلكتروني: {email_message}",
                "error_code": "INVALID_EMAIL"
            }), 400
        
        # جلب المستخدم من قاعدة البيانات
        user = get_user_by_email(email)
        if not user:
            log_security_event("LOGIN_FAILED", details={"email": email, "reason": "user_not_found"})
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                "error_code": "INVALID_CREDENTIALS"
            }), 401
        
        # التحقق من كلمة المرور
        if not verify_password(password, user.get("password_hash", "")):
            log_security_event("LOGIN_FAILED", user_id=user.get('id'), details={"reason": "wrong_password"})
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                "error_code": "INVALID_CREDENTIALS"
            }), 401
        
        # التحقق من حالة المستخدم
        if user.get("status") == "inactive":
            log_security_event("LOGIN_BLOCKED", user_id=user.get('id'), details={"reason": "account_inactive"})
            return jsonify({
                "success": False,
                "message": "الحساب غير نشط. يرجى التواصل مع الإدارة",
                "error_code": "ACCOUNT_INACTIVE"
            }), 403
        
        if user.get("email_verified") == False:
            return jsonify({
                "success": False,
                "message": "يرجى تأكيد البريد الإلكتروني أولاً",
                "error_code": "EMAIL_NOT_VERIFIED"
            }), 403
        
        # إعداد بيانات المستخدم للرمز
        user_data = {
            'id': user['id'],
            'email': user['email'],
            'name': user.get('name', ''),
            'role': user.get('role', UserRole.USER.value),
            'permissions': user.get('permissions', []),
            'metadata': {
                'last_login': datetime.utcnow().isoformat(),
                'login_ip': request.remote_addr,
                'user_agent': request.headers.get('User-Agent', '')
            }
        }
        
        # إنشاء رموز JWT
        tokens = jwt_manager.create_token_pair(user_data)
        
        # تحديث آخر تسجيل دخول
        update_user(user['id'], {
            'last_login_at': datetime.utcnow().isoformat(),
            'login_count': user.get('login_count', 0) + 1
        })
        
        # تسجيل عملية تسجيل الدخول
        log_security_event("LOGIN_SUCCESS", user_id=user['id'])
        logger.info(f"تسجيل دخول ناجح للمستخدم: {email} - IP: {request.remote_addr}")
        
        return jsonify({
            "success": True,
            "message": "تم تسجيل الدخول بنجاح",
            "user": clean_user_data(user),
            **tokens
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
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        # استخراج البيانات
        name = sanitize_text(data.get("name", "")).strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")
        
        # التحقق من البيانات الأساسية
        if not all([name, email, password, confirm_password]):
            return jsonify({
                "success": False,
                "message": "جميع البيانات مطلوبة",
                "error_code": "MISSING_REQUIRED_FIELDS"
            }), 400
        
        # التحقق من تطابق كلمات المرور
        if password != confirm_password:
            return jsonify({
                "success": False,
                "message": "كلمات المرور غير متطابقة",
                "error_code": "PASSWORD_MISMATCH"
            }), 400
        
        # التحقق من قوة كلمة المرور
        is_strong, password_message = validate_password_strength(password)
        if not is_strong:
            return jsonify({
                "success": False,
                "message": password_message,
                "error_code": "WEAK_PASSWORD"
            }), 400
        
        # التحقق من صحة البريد الإلكتروني
        is_valid_email, email_message = validate_email_format(email)
        if not is_valid_email:
            return jsonify({
                "success": False,
                "message": f"البريد الإلكتروني: {email_message}",
                "error_code": "INVALID_EMAIL"
            }), 400
        
        # التحقق من عدم وجود المستخدم
        existing_user = get_user_by_email(email)
        if existing_user:
            log_security_event("REGISTRATION_FAILED", details={"email": email, "reason": "email_exists"})
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني مستخدم بالفعل",
                "error_code": "EMAIL_EXISTS"
            }), 409
        
        # إنشاء المستخدم الجديد
        user_data = {
            'id': generate_unique_id(),
            'name': name,
            'email': email,
            'password_hash': hash_password(password),
            'role': UserRole.USER.value,
            'status': 'active',
            'email_verified': False,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'login_count': 0,
            'permissions': []
        }
        
        # حفظ المستخدم في قاعدة البيانات
        new_user = create_user(user_data)
        if not new_user:
            return jsonify({
                "success": False,
                "message": "فشل في إنشاء الحساب",
                "error_code": "USER_CREATION_FAILED"
            }), 500
        
        # إنشاء رمز تأكيد البريد الإلكتروني
        verification_token = jwt_manager.create_verification_token({
            'id': new_user['id'],
            'email': new_user['email'],
            'name': new_user['name']
        })
        
        # تسجيل الحدث
        log_security_event("REGISTRATION_SUCCESS", user_id=new_user['id'])
        logger.info(f"تم إنشاء حساب جديد: {email}")
        
        return jsonify({
            "success": True,
            "message": "تم إنشاء الحساب بنجاح. يرجى تأكيد البريد الإلكتروني",
            "user": clean_user_data(new_user),
            "verification_required": True
        })
        
    except Exception as e:
        logger.error(f"خطأ في التسجيل: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في إنشاء الحساب",
            "error_code": "REGISTRATION_ERROR"
        }), 500

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """تسجيل الخروج"""
    try:
        current_user = get_current_user()
        
        # TODO: إضافة الرمز إلى blacklist
        # jwt_manager.revoke_token(g.current_token)
        
        log_security_event("LOGOUT", user_id=current_user['id'])
        logger.info(f"تسجيل خروج للمستخدم: {current_user['email']}")
        
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

@auth_bp.route("/refresh-token", methods=["POST"])
def refresh_token():
    """تجديد رمز الوصول"""
    try:
        data = request.get_json()
        refresh_token = data.get("refresh_token") if data else None
        
        if not refresh_token:
            return jsonify({
                "success": False,
                "message": "رمز التجديد مطلوب",
                "error_code": "REFRESH_TOKEN_REQUIRED"
            }), 400
        
        # تجديد الرمز
        new_tokens = jwt_manager.refresh_access_token(refresh_token)
        
        if not new_tokens:
            log_security_event("TOKEN_REFRESH_FAILED", details={"reason": "invalid_refresh_token"})
            return jsonify({
                "success": False,
                "message": "رمز التجديد غير صالح أو منتهي الصلاحية",
                "error_code": "INVALID_REFRESH_TOKEN"
            }), 401
        
        log_security_event("TOKEN_REFRESH_SUCCESS")
        
        return jsonify({
            "success": True,
            "message": "تم تجديد الرمز بنجاح",
            **new_tokens
        })
        
    except Exception as e:
        logger.error(f"خطأ في تجديد الرمز: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تجديد الرمز",
            "error_code": "TOKEN_REFRESH_ERROR"
        }), 500

@auth_bp.route("/check-session", methods=["GET"])
@jwt_required()
def check_session():
    """التحقق من صحة الجلسة (الرمز)"""
    try:
        current_user = get_current_user()
        
        return jsonify({
            "success": True,
            "authenticated": True,
            "user": {
                "id": current_user["id"],
                "name": current_user["name"],
                "email": current_user["email"],
                "role": current_user["role"]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في فحص الجلسة: {str(e)}")
        return jsonify({
            "success": False,
            "authenticated": False,
            "error_code": "SESSION_CHECK_ERROR"
        }), 500


# ===========================================
# مسارات الملف الشخصي
# ===========================================

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """جلب الملف الشخصي"""
    try:
        current_user = get_current_user()
        
        # جلب بيانات محدثة من قاعدة البيانات
        user = get_user_by_email(current_user['email'])
        if not user:
            return jsonify({
                "success": False,
                "message": "المستخدم غير موجود",
                "error_code": "USER_NOT_FOUND"
            }), 404
        
        return jsonify({
            "success": True,
            "user": clean_user_data(user)
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب الملف الشخصي: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في جلب الملف الشخصي",
            "error_code": "PROFILE_ERROR"
        }), 500

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """تحديث الملف الشخصي"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        # البيانات المسموح تحديثها
        allowed_fields = ['name', 'phone', 'company', 'timezone']
        updates = {}
        
        for field in allowed_fields:
            if field in data:
                if field == 'name':
                    updates[field] = sanitize_text(data[field]).strip()
                elif field in ['phone', 'company', 'timezone']:
                    updates[field] = sanitize_text(data[field]).strip()
        
        if not updates:
            return jsonify({
                "success": False,
                "message": "لا توجد بيانات للتحديث",
                "error_code": "NO_UPDATES"
            }), 400
        
        # إضافة وقت التحديث
        updates['updated_at'] = datetime.utcnow().isoformat()
        
        # تحديث قاعدة البيانات
        success = update_user(current_user['id'], updates)
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في تحديث الملف الشخصي",
                "error_code": "UPDATE_FAILED"
            }), 500
        
        log_security_event("PROFILE_UPDATED", user_id=current_user['id'])
        logger.info(f"تم تحديث الملف الشخصي للمستخدم: {current_user['email']}")
        
        return jsonify({
            "success": True,
            "message": "تم تحديث الملف الشخصي بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحديث الملف الشخصي: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تحديث الملف الشخصي",
            "error_code": "PROFILE_UPDATE_ERROR"
        }), 500

# ===========================================
# مسارات إدارة كلمة المرور
# ===========================================

@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """تغيير كلمة المرور"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        current_password = data.get("current_password", "")
        new_password = data.get("new_password", "")
        confirm_password = data.get("confirm_password", "")
        
        if not all([current_password, new_password, confirm_password]):
            return jsonify({
                "success": False,
                "message": "جميع البيانات مطلوبة",
                "error_code": "MISSING_REQUIRED_FIELDS"
            }), 400
        
        # التحقق من تطابق كلمة المرور الجديدة
        if new_password != confirm_password:
            return jsonify({
                "success": False,
                "message": "كلمة المرور الجديدة غير متطابقة",
                "error_code": "PASSWORD_MISMATCH"
            }), 400
        
        # التحقق من قوة كلمة المرور الجديدة
        is_strong, password_message = validate_password_strength(new_password)
        if not is_strong:
            return jsonify({
                "success": False,
                "message": password_message,
                "error_code": "WEAK_PASSWORD"
            }), 400
        
        # جلب المستخدم والتحقق من كلمة المرور الحالية
        user = get_user_by_email(current_user['email'])
        if not user or not verify_password(current_password, user.get("password_hash", "")):
            log_security_event("PASSWORD_CHANGE_FAILED", user_id=current_user['id'], details={"reason": "wrong_current_password"})
            return jsonify({
                "success": False,
                "message": "كلمة المرور الحالية غير صحيحة",
                "error_code": "INVALID_CURRENT_PASSWORD"
            }), 401
        
        # تحديث كلمة المرور
        updates = {
            'password_hash': hash_password(new_password),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        success = update_user(current_user['id'], updates)
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في تحديث كلمة المرور",
                "error_code": "PASSWORD_UPDATE_FAILED"
            }), 500
        
        log_security_event("PASSWORD_CHANGED", user_id=current_user['id'])
        logger.info(f"تم تغيير كلمة المرور للمستخدم: {current_user['email']}")
        
        return jsonify({
            "success": True,
            "message": "تم تغيير كلمة المرور بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في تغيير كلمة المرور: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تغيير كلمة المرور",
            "error_code": "PASSWORD_CHANGE_ERROR"
        }), 500

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """طلب إعادة تعيين كلمة المرور"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        email = data.get("email", "").strip().lower()
        
        if not email:
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني مطلوب",
                "error_code": "EMAIL_REQUIRED"
            }), 400
        
        # التحقق من صحة البريد الإلكتروني
        is_valid_email, email_message = validate_email_format(email)
        if not is_valid_email:
            return jsonify({
                "success": False,
                "message": f"البريد الإلكتروني: {email_message}",
                "error_code": "INVALID_EMAIL"
            }), 400
        
        # جلب المستخدم
        user = get_user_by_email(email)
        if not user:
            # لأسباب أمنية، نرجع نفس الرسالة حتى لو لم يوجد المستخدم
            return jsonify({
                "success": True,
                "message": "إذا كان البريد الإلكتروني موجود، ستصلك رسالة إعادة تعيين كلمة المرور"
            })
        
        # إنشاء رمز إعادة تعيين كلمة المرور
        reset_token = jwt_manager.create_reset_token({
            'id': user['id'],
            'email': user['email'],
            'name': user['name']
        })
        
        # TODO: إرسال بريد إعادة التعيين
        # send_password_reset_email(email, reset_token)
        
        log_security_event("PASSWORD_RESET_REQUESTED", user_id=user['id'])
        logger.info(f"طلب إعادة تعيين كلمة المرور: {email}")
        
        return jsonify({
            "success": True,
            "message": "إذا كان البريد الإلكتروني موجود، ستصلك رسالة إعادة تعيين كلمة المرور"
        })
        
    except Exception as e:
        logger.error(f"خطأ في طلب إعادة تعيين كلمة المرور: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في طلب إعادة تعيين كلمة المرور",
            "error_code": "FORGOT_PASSWORD_ERROR"
        }), 500

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """إعادة تعيين كلمة المرور"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        token = data.get("token", "")
        new_password = data.get("new_password", "")
        confirm_password = data.get("confirm_password", "")
        
        if not all([token, new_password, confirm_password]):
            return jsonify({
                "success": False,
                "message": "جميع البيانات مطلوبة",
                "error_code": "MISSING_REQUIRED_FIELDS"
            }), 400
        
        # التحقق من تطابق كلمات المرور
        if new_password != confirm_password:
            return jsonify({
                "success": False,
                "message": "كلمات المرور غير متطابقة",
                "error_code": "PASSWORD_MISMATCH"
            }), 400
        
        # التحقق من قوة كلمة المرور
        is_strong, password_message = validate_password_strength(new_password)
        if not is_strong:
            return jsonify({
                "success": False,
                "message": password_message,
                "error_code": "WEAK_PASSWORD"
            }), 400
        
        # التحقق من رمز إعادة التعيين
        payload = jwt_manager.verify_token(token, TokenType.RESET)
        
        if not payload:
            return jsonify({
                "success": False,
                "message": "رمز إعادة التعيين غير صالح أو منتهي الصلاحية",
                "error_code": "INVALID_RESET_TOKEN"
            }), 401
        
        # تحديث كلمة المرور
        updates = {
            'password_hash': hash_password(new_password),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        success = update_user(payload.user_id, updates)
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في إعادة تعيين كلمة المرور",
                "error_code": "PASSWORD_RESET_FAILED"
            }), 500
        
        log_security_event("PASSWORD_RESET_SUCCESS", user_id=payload.user_id)
        logger.info(f"تم إعادة تعيين كلمة المرور للمستخدم: {payload.email}")
        
        return jsonify({
            "success": True,
            "message": "تم إعادة تعيين كلمة المرور بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في إعادة تعيين كلمة المرور: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في إعادة تعيين كلمة المرور",
            "error_code": "PASSWORD_RESET_ERROR"
        }), 500

# ===========================================
# مسارات التحقق من البريد الإلكتروني
# ===========================================

@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    """تأكيد البريد الإلكتروني"""
    try:
        data = request.get_json()
        token = data.get("token") if data else None
        
        if not token:
            return jsonify({
                "success": False,
                "message": "رمز التحقق مطلوب",
                "error_code": "TOKEN_REQUIRED"
            }), 400
        
        # التحقق من رمز التأكيد
        payload = jwt_manager.verify_token(token, TokenType.VERIFICATION)
        
        if not payload:
            return jsonify({
                "success": False,
                "message": "رمز التحقق غير صالح أو منتهي الصلاحية",
                "error_code": "INVALID_VERIFICATION_TOKEN"
            }), 401
        
        # تحديث حالة التحقق
        success = update_user(payload.user_id, {
            'email_verified': True,
            'updated_at': datetime.utcnow().isoformat()
        })
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في تأكيد البريد الإلكتروني",
                "error_code": "VERIFICATION_FAILED"
            }), 500
        
        log_security_event("EMAIL_VERIFIED", user_id=payload.user_id)
        logger.info(f"تم تأكيد البريد الإلكتروني: {payload.email}")
        
        return jsonify({
            "success": True,
            "message": "تم تأكيد البريد الإلكتروني بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في تأكيد البريد الإلكتروني: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تأكيد البريد الإلكتروني",
            "error_code": "EMAIL_VERIFICATION_ERROR"
        }), 500

@auth_bp.route("/resend-verification", methods=["POST"])
def resend_verification():
    """إعادة إرسال رمز تأكيد البريد الإلكتروني"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        email = data.get("email", "").strip().lower()
        
        if not email:
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني مطلوب",
                "error_code": "EMAIL_REQUIRED"
            }), 400
        
        # جلب المستخدم
        user = get_user_by_email(email)
        if not user:
            return jsonify({
                "success": True,
                "message": "إذا كان البريد الإلكتروني موجود، ستصلك رسالة التأكيد"
            })
        
        # التحقق من أن البريد غير مؤكد
        if user.get('email_verified', False):
            return jsonify({
                "success": False,
                "message": "البريد الإلكتروني مؤكد بالفعل",
                "error_code": "EMAIL_ALREADY_VERIFIED"
            }), 400
        
        # إنشاء رمز تأكيد جديد
        verification_token = jwt_manager.create_verification_token({
            'id': user['id'],
            'email': user['email'],
            'name': user['name']
        })
        
        # TODO: إرسال بريد التأكيد
        # send_verification_email(email, verification_token)
        
        log_security_event("VERIFICATION_RESENT", user_id=user['id'])
        logger.info(f"إعادة إرسال رمز التأكيد: {email}")
        
        return jsonify({
            "success": True,
            "message": "تم إرسال رمز التأكيد إلى بريدك الإلكتروني"
        })
        
    except Exception as e:
        logger.error(f"خطأ في إعادة إرسال رمز التأكيد: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في إعادة إرسال رمز التأكيد",
            "error_code": "RESEND_VERIFICATION_ERROR"
        }), 500

# ===========================================
# مسارات إدارية
# ===========================================

@auth_bp.route("/admin/users", methods=["GET"])
@admin_required
def admin_get_users():
    """جلب قائمة المستخدمين (للإدارة فقط)"""
    try:
        # معاملات الاستعلام
        limit = min(int(request.args.get('limit', 50)), 100)  # حد أقصى 100
        offset = int(request.args.get('offset', 0))
        
        # جلب المستخدمين
        result = get_users_list(limit=limit, offset=offset)
        
        if not result['success']:
            return jsonify({
                "success": False,
                "message": "فشل في جلب قائمة المستخدمين",
                "error_code": "USERS_FETCH_FAILED"
            }), 500
        
        # تنظيف البيانات الحساسة
        clean_users = [clean_user_data(user) for user in result['users']]
        
        return jsonify({
            "success": True,
            "users": clean_users,
            "total": result['total'],
            "limit": limit,
            "offset": offset
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب المستخدمين: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في جلب المستخدمين",
            "error_code": "ADMIN_USERS_ERROR"
        }), 500

@auth_bp.route("/admin/users/<user_id>/status", methods=["PUT"])
@admin_required
def admin_update_user_status(user_id: str):
    """تحديث حالة المستخدم (للإدارة فقط)"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data or 'status' not in data:
            return jsonify({
                "success": False,
                "message": "حالة المستخدم مطلوبة",
                "error_code": "STATUS_REQUIRED"
            }), 400
        
        new_status = data['status']
        allowed_statuses = ['active', 'inactive', 'suspended']
        
        if new_status not in allowed_statuses:
            return jsonify({
                "success": False,
                "message": f"حالة غير صحيحة. الحالات المسموحة: {', '.join(allowed_statuses)}",
                "error_code": "INVALID_STATUS"
            }), 400
        
        # التحقق من وجود المستخدم
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({
                "success": False,
                "message": "المستخدم غير موجود",
                "error_code": "USER_NOT_FOUND"
            }), 404
        
        # منع تعديل حالة المدير الأعلى
        if user.get('role') == UserRole.SUPER_ADMIN.value:
            return jsonify({
                "success": False,
                "message": "لا يمكن تعديل حالة المدير الأعلى",
                "error_code": "CANNOT_MODIFY_SUPER_ADMIN"
            }), 403
        
        # تحديث الحالة
        success = update_user(user_id, {
            'status': new_status,
            'updated_at': datetime.utcnow().isoformat()
        })
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في تحديث حالة المستخدم",
                "error_code": "STATUS_UPDATE_FAILED"
            }), 500
        
        log_security_event("USER_STATUS_UPDATED", user_id=current_user['id'], 
                          details={"target_user": user_id, "new_status": new_status})
        
        return jsonify({
            "success": True,
            "message": "تم تحديث حالة المستخدم بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحديث حالة المستخدم: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تحديث حالة المستخدم",
            "error_code": "ADMIN_STATUS_UPDATE_ERROR"
        }), 500

# تصدير Blueprint
__all__ = ['auth_bp']

