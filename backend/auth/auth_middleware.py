from flask import Blueprint, request, jsonify, g
try:
    # محاولة استخدام flask_jwt_extended إذا كان متاحاً
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
    FLASK_JWT_AVAILABLE = True
except ImportError:
    # إذا لم يكن متاحاً، استخدم jose
    from jose import jwt
    FLASK_JWT_AVAILABLE = False

auth_middleware_bp = Blueprint("auth_middleware", __name__)

@auth_middleware_bp.before_app_request
def load_user_from_jwt():
    """
    Loads user identity from JWT into Flask's global 'g' object
    before each application request, if a JWT is present.
    """
    g.user_id = None
    g.jwt_claims = None
    
    try:
        if FLASK_JWT_AVAILABLE:
            # استخدام flask_jwt_extended إذا كان متاحاً
            verify_jwt_in_request(optional=True) # optional=True means it won't raise error if no JWT
            
            # If JWT is present and valid, get identity and claims
            if get_jwt_identity():
                g.user_id = get_jwt_identity()
                g.jwt_claims = get_jwt()
        else:
            # استخدام jose كبديل
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                # هنا يمكن إضافة منطق فك تشفير JWT باستخدام jose
                # لكن نتركه اختياري لتجنب الأخطاء
                pass
                
    except Exception as e:
        # Log the error but don't stop the request, as it's optional
        print(f"[Auth Middleware Error]: {e}")

# Example of a simple route to test the middleware (for development/testing)
@auth_middleware_bp.route("/test_auth_middleware")
def test_auth_middleware():
    if g.user_id:
        return jsonify({"message": f"User {g.user_id} is authenticated.", "claims": g.jwt_claims}), 200
    else:
        return jsonify({"message": "User is not authenticated."}), 200

