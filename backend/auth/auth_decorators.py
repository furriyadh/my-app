from functools import wraps
from flask import jsonify, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt


def jwt_required_with_identity():
    """
    A decorator that ensures a valid JWT is present in the request
    and loads the user identity into Flask\'s global \'g\' object.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
                g.user_id = get_jwt_identity()
                g.jwt_claims = get_jwt()
            except Exception as e:
                return jsonify({"msg": str(e)}), 401
            return fn(*args, **kwargs)
        return decorator
    return wrapper


def role_required(roles):
    """A decorator that checks if the current user has one of the required roles."""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_roles = claims.get("roles", [])
            
            if not any(role in user_roles for role in roles):
                return jsonify({"msg": "Insufficient permissions"}), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# يمكنك إضافة المزيد من الـ decorators هنا حسب الحاجة
