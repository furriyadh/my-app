"""
Auth Decorators - مزخرفات المصادقة
"""

import logging
from functools import wraps
from flask import request, jsonify, g
from .jwt_manager import jwt_manager, TokenType, UserRole

logger = logging.getLogger(__name__)

def jwt_required(token_type: TokenType = TokenType.ACCESS):
    """مزخرف للتحقق من JWT"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = None
            auth_header = request.headers.get('Authorization')
            
            if auth_header:
                try:
                    token = auth_header.split(' ')[1]
                except IndexError:
                    return jsonify({'success': False, 'message': 'تنسيق رأس التفويض غير صحيح'}), 401
            
            if not token:
                return jsonify({'success': False, 'message': 'الرمز المميز مطلوب'}), 401
            
            try:
                payload = jwt_manager.decode_token(token)
                if payload.get('type') != token_type.value:
                    return jsonify({'success': False, 'message': 'نوع رمز غير صحيح'}), 401
                
                g.current_user_id = payload.get('user_id')
                g.current_user_email = payload.get('email')
                g.current_user_role = payload.get('role')
                
            except Exception as e:
                return jsonify({'success': False, 'message': str(e)}), 401
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def admin_required():
    """مزخرف للتحقق من صلاحيات المسؤول"""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            if g.current_user_role != UserRole.ADMIN.value:
                return jsonify({'success': False, 'message': 'صلاحيات مسؤول مطلوبة'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def role_required(required_role: UserRole):
    """مزخرف للتحقق من دور معين"""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            if g.current_user_role != required_role.value:
                return jsonify({'success': False, 'message': f'دور {required_role.value} مطلوب'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def get_current_user():
    """الحصول على المستخدم الحالي"""
    return {
        'id': g.get('current_user_id'),
        'email': g.get('current_user_email'),
        'role': g.get('current_user_role')
    }

def jwt_required_with_identity(token_type: TokenType = TokenType.ACCESS):
    """مزخرف للتحقق من JWT مع إرجاع هوية المستخدم"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = None
            auth_header = request.headers.get('Authorization')
            
            if auth_header:
                try:
                    token = auth_header.split(' ')[1]
                except IndexError:
                    return jsonify({'success': False, 'message': 'تنسيق رأس التفويض غير صحيح'}), 401
            
            if not token:
                return jsonify({'success': False, 'message': 'الرمز المميز مطلوب'}), 401
            
            try:
                payload = jwt_manager.decode_token(token)
                if payload.get('type') != token_type.value:
                    return jsonify({'success': False, 'message': 'نوع رمز غير صحيح'}), 401
                
                g.current_user_id = payload.get('user_id')
                g.current_user_email = payload.get('email')
                g.current_user_role = payload.get('role')
                
                # إرجاع هوية المستخدم كمعامل إضافي
                return f(get_current_user(), *args, **kwargs)
                
            except Exception as e:
                return jsonify({'success': False, 'message': str(e)}), 401
            
        return decorated_function
    return decorator

