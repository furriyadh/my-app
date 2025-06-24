"""
مسارات المصادقة - Authentication Routes
Google Ads AI Platform - Authentication API Routes
"""

from flask import Blueprint, request, jsonify, session
from functools import wraps
import logging
from datetime import datetime
from typing import Dict, Any

# استيرادات مطلقة بدلاً من النسبية
from services.oauth_handler import OAuthHandler
from utils.validators import validate_email, validate_user_data
from utils.helpers import generate_unique_id, sanitize_text
from utils.database import DatabaseManager

# إنشاء Blueprint
auth_bp = Blueprint('auth', __name__)

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

logger = logging.getLogger(__name__)

def login_required(f):
    """ديكوريتر للتحقق من تسجيل الدخول"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({
                'success': False,
                'message': 'يجب تسجيل الدخول أولاً',
                'error_code': 'AUTHENTICATION_REQUIRED'
            }), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """ديكوريتر للتحقق من صلاحيات الإدارة"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({
                'success': False,
                'message': 'يجب تسجيل الدخول أولاً',
                'error_code': 'AUTHENTICATION_REQUIRED'
            }), 401
        
        user_role = session.get('user_role', 'user')
        if user_role != 'admin':
            return jsonify({
                'success': False,
                'message': 'غير مصرح لك بالوصول لهذا المورد',
                'error_code': 'INSUFFICIENT_PERMISSIONS'
            }), 403
        
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/health', methods=['GET'])
def health_check():
    """فحص صحة Auth API"""
    try:
        return jsonify({
            'success': True,
            'service': 'Authentication API',
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'components': {
                'oauth_handler': oauth_handler is not None,
                'database_manager': db_manager is not None,
                'session_support': True
            },
            'message': 'خدمة المصادقة تعمل بنجاح'
        })
    except Exception as e:
        logger.error(f"خطأ في فحص صحة Auth API: {str(e)}")
        return jsonify({
            'success': False,
            'service': 'Authentication API',
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """تسجيل الدخول"""
    try:
        if not db_manager:
            return jsonify({
                'success': False,
                'message': 'خدمة قاعدة البيانات غير متاحة',
                'error_code': 'DATABASE_UNAVAILABLE'
            }), 503
            
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'بيانات غير صحيحة',
                'error_code': 'INVALID_DATA'
            }), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # التحقق من البيانات
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'البريد الإلكتروني وكلمة المرور مطلوبان',
                'error_code': 'MISSING_CREDENTIALS'
            }), 400
        
        # التحقق من صحة البريد الإلكتروني
        try:
            is_valid_email, email_message = validate_email(email)
            if not is_valid_email:
                return jsonify({
                    'success': False,
                    'message': f'البريد الإلكتروني: {email_message}',
                    'error_code': 'INVALID_EMAIL'
                }), 400
        except Exception:
            # إذا فشل التحقق، استخدم تحقق أساسي
            if '@' not in email or '.' not in email:
                return jsonify({
                    'success': False,
                    'message': 'البريد الإلكتروني غير صحيح',
                    'error_code': 'INVALID_EMAIL'
                }), 400
        
        # محاولة تسجيل الدخول (مثال أساسي)
        # في التطبيق الحقيقي، سيتم التحقق من قاعدة البيانات
        if email == "admin@example.com" and password == "admin123":
            user = {
                'id': 1,
                'name': 'المدير',
                'email': email,
                'role': 'admin'
            }
        elif email == "user@example.com" and password == "user123":
            user = {
                'id': 2,
                'name': 'مستخدم',
                'email': email,
                'role': 'user'
            }
        else:
            return jsonify({
                'success': False,
                'message': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
                'error_code': 'INVALID_CREDENTIALS'
            }), 401
        
        # إنشاء جلسة المستخدم
        session['user_id'] = user['id']
        session['user_email'] = user['email']
        session['user_name'] = user['name']
        session['user_role'] = user.get('role', 'user')
        session['login_time'] = datetime.now().isoformat()
        
        # تسجيل عملية تسجيل الدخول
        logger.info(f"تسجيل دخول ناجح للمستخدم: {email}")
        
        return jsonify({
            'success': True,
            'message': 'تم تسجيل الدخول بنجاح',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user.get('role', 'user')
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل الدخول: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في تسجيل الدخول',
            'error_code': 'LOGIN_ERROR'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """تسجيل الخروج"""
    try:
        user_email = session.get('user_email')
        
        # مسح الجلسة
        session.clear()
        
        # تسجيل عملية تسجيل الخروج
        logger.info(f"تسجيل خروج للمستخدم: {user_email}")
        
        return jsonify({
            'success': True,
            'message': 'تم تسجيل الخروج بنجاح'
        })
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل الخروج: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في تسجيل الخروج',
            'error_code': 'LOGOUT_ERROR'
        }), 500

@auth_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """الحصول على ملف المستخدم الشخصي"""
    try:
        user_id = session.get('user_id')
        user_name = session.get('user_name')
        user_email = session.get('user_email')
        user_role = session.get('user_role')
        
        return jsonify({
            'success': True,
            'user': {
                'id': user_id,
                'name': user_name,
                'email': user_email,
                'role': user_role,
                'login_time': session.get('login_time')
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الملف الشخصي: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في الحصول على البيانات',
            'error_code': 'PROFILE_ERROR'
        }), 500

@auth_bp.route('/check-session', methods=['GET'])
def check_session():
    """التحقق من حالة الجلسة"""
    try:
        if 'user_id' in session:
            return jsonify({
                'success': True,
                'authenticated': True,
                'user': {
                    'id': session.get('user_id'),
                    'name': session.get('user_name'),
                    'email': session.get('user_email'),
                    'role': session.get('user_role')
                }
            })
        else:
            return jsonify({
                'success': True,
                'authenticated': False,
                'message': 'لا توجد جلسة نشطة'
            })
            
    except Exception as e:
        logger.error(f"خطأ في التحقق من الجلسة: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في التحقق من الجلسة',
            'error_code': 'SESSION_CHECK_ERROR'
        }), 500

@auth_bp.route('/google/login', methods=['GET'])
def google_login():
    """تسجيل الدخول بـ Google"""
    try:
        if not oauth_handler:
            return jsonify({
                'success': False,
                'message': 'خدمة Google OAuth غير متاحة',
                'error_code': 'OAUTH_UNAVAILABLE'
            }), 503
            
        # إنشاء رابط تسجيل الدخول بـ Google
        auth_url = oauth_handler.get_authorization_url()
        
        return jsonify({
            'success': True,
            'auth_url': auth_url,
            'message': 'انقر على الرابط لتسجيل الدخول بـ Google'
        })
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل الدخول بـ Google: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في تسجيل الدخول بـ Google',
            'error_code': 'GOOGLE_LOGIN_ERROR'
        }), 500

# معالج الأخطاء للـ Blueprint
@auth_bp.errorhandler(404)
def not_found(error):
    """معالج الصفحات غير الموجودة في Auth API"""
    return jsonify({
        'success': False,
        'error': 'المسار غير موجود في Auth API',
        'available_endpoints': [
            '/health',
            '/login',
            '/logout',
            '/profile',
            '/check-session',
            '/google/login'
        ]
    }), 404

@auth_bp.errorhandler(500)
def internal_error(error):
    """معالج الأخطاء الداخلية في Auth API"""
    logger.error(f"خطأ داخلي في Auth API: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'خطأ داخلي في Auth API',
        'message': 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى'
    }), 500

