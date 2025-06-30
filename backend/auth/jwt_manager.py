from flask_jwt_extended import JWTManager

jwt_manager = JWTManager()



from backend.utils.database import DatabaseManager

db_manager = DatabaseManager()

@jwt_manager.user_identity_loader
def user_identity_lookup(user_id):
    return user_id

@jwt_manager.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return db_manager.get_user_by_id(identity)




from enum import Enum

class TokenType(Enum):
    ACCESS = "access"
    REFRESH = "refresh"
    VERIFICATION = "verification"
    RESET = "reset"

class UserRole(Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


