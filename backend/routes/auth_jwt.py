from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import logging
from datetime import datetime

# استيرادات مُصححة - إزالة backend من المسارات
try:
    from utils.validators import validate_email, validate_user_data
except ImportError:
    try:
        from ..utils.validators import validate_email, validate_user_data
    except ImportError:
        # دوال احتياطية للتحقق
        def validate_email(email):
            if not email or "@" not in email or "." not in email:
                return False, "البريد الإلكتروني غير صحيح"
            return True, "صحيح"
        
        def validate_user_data(name, email, password):
            if not name or len(name.strip()) < 2:
                return False, "الاسم يجب أن يكون حرفين على الأقل"
            if not email or "@" not in email:
                return False, "البريد الإلكتروني غير صحيح"
            if not password or len(password) < 6:
                return False, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
            return True, "صحيح"

try:
    from utils.helpers import generate_unique_id, sanitize_text
except ImportError:
    try:
        from ..utils.helpers import generate_unique_id, sanitize_text
    except ImportError:
        # دوال احتياطية
        import uuid
        def generate_unique_id():
            return str(uuid.uuid4())
        def sanitize_text(text):
            return str(text).strip()

try:
    from utils.database import DatabaseManager
except ImportError:
    try:
        from ..utils.database import DatabaseManager
    except ImportError:
        DatabaseManager = None

# إنشاء Blueprint جديد للمسارات المتعلقة بالمصادقة
auth_routes_bp = Blueprint("auth_routes", __name__)

# إعداد الخدمات مع معالجة آمنة للأخطاء
try:
    db_manager = DatabaseManager() if DatabaseManager else None
except Exception as e:
    db_manager = None
    logging.warning(f"فشل في تحميل DatabaseManager: {e}")

logger = logging.getLogger(__name__)

@auth_routes_bp.route("/login", methods=["POST"])
def login():
    """تسجيل الدخول باستخدام JWT"""
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
        
        # إنشاء JWT
        access_token = create_access_token(identity=user["id"])
        
        # تسجيل عملية تسجيل الدخول
        logger.info(f"تسجيل دخول ناجح للمستخدم: {email}")
        
        return jsonify({
            "success": True,
            "message": "تم تسجيل الدخول بنجاح",
            "access_token": access_token,
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

@auth_routes_bp.route("/register", methods=["POST"])
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

@auth_routes_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """الحصول على ملف المستخدم الشخصي"""
    try:
        current_user_id = get_jwt_identity()
        
        if not db_manager:
            # إرجاع بيانات تجريبية
            return jsonify({
                "success": True,
                "user": {
                    "id": current_user_id,
                    "name": "مستخدم تجريبي",
                    "email": "demo@example.com",
                    "role": "user"
                },
                "note": "بيانات تجريبية - قاعدة البيانات غير متاحة"
            })
        
        user = db_manager.get_user_by_id(current_user_id)
        
        if not user:
            return jsonify({
                "success": False,
                "message": "المستخدم غير موجود",
                "error_code": "USER_NOT_FOUND"
            }), 404
            
        return jsonify({
            "success": True,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user.get("role", "user")
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الملف الشخصي: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في الحصول على البيانات",
            "error_code": "PROFILE_ERROR"
        }), 500

@auth_routes_bp.route('/status', methods=['GET'])
def auth_status():
    """حالة خدمة المصادقة"""
    return jsonify({
        'service': 'Auth JWT API',
        'status': 'active',
        'version': '1.0.0',
        'services_status': {
            'database_manager': db_manager is not None,
            'jwt_enabled': True
        },
        'timestamp': datetime.now().isoformat()
    })

# تسجيل معلومات التحميل
logger.info("✅ تم تحميل Auth JWT Blueprint بنجاح")
logger.info(f"📊 الخدمات المتاحة: {sum([db_manager is not None])}/1")

