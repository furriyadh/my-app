from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt

auth_middleware_bp = Blueprint("auth_middleware", __name__)

@auth_middleware_bp.before_app_request
def load_user_from_jwt():
    """
    Loads user identity from JWT into Flask\'s global \'g\' object
    before each application request, if a JWT is present.
    """
    g.user_id = None
    g.jwt_claims = None
    try:
        # Attempt to verify JWT in the request
        verify_jwt_in_request(optional=True) # optional=True means it won\'t raise error if no JWT
        
        # If JWT is present and valid, get identity and claims
        if get_jwt_identity():
            g.user_id = get_jwt_identity()
            g.jwt_claims = get_jwt()
            # You might want to fetch full user object from DB here and attach to g.user
            # For example: g.user = db_manager.get_user_by_id(g.user_id)
            
    except Exception as e:
        # Log the error but don\'t stop the request, as it\'s optional
        # In a real app, you\'d use a proper logger here
        print(f"[Auth Middleware Error]: {e}")
        # Optionally, you could return an error response here if authentication is mandatory
        # return jsonify({"msg": "Invalid token or authentication failed"}), 401

# Placeholder for OAuth integration logic if needed
# This middleware could also handle OAuth token validation or user lookup
# For example, if you have an OAuth token in headers, you\'d validate it here
# and set g.user_id based on the OAuth provider\'s user info.

# Example of a simple route to test the middleware (for development/testing)
@auth_middleware_bp.route("/test_auth_middleware")
def test_auth_middleware():
    if g.user_id:
        return jsonify({"message": f"User {g.user_id} is authenticated.", "claims": g.jwt_claims}), 200
    else:
        return jsonify({"message": "User is not authenticated."}), 200
