"""
JWT Manager - نظام إدارة JWT المحدث
"""

import os
from jose import jwt  # ✅ تم التغيير من import jwt إلى from jose import jwt
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from enum import Enum
from flask import current_app

logger = logging.getLogger(__name__)

class TokenType(Enum):
    """أنواع الرموز المميزة"""
    ACCESS = "access"
    REFRESH = "refresh"
    VERIFICATION = "verification"
    RESET = "reset"

class UserRole(Enum):
    """أدوار المستخدمين"""
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class JWTManager:
    """مدير JWT"""
    
    def __init__(self):
        self.secret_key = None
        self.algorithm = "HS256"
    
    def init_app(self, app):
        """تهيئة المدير مع تطبيق Flask"""
        self.secret_key = app.config.get('JWT_SECRET_KEY', 'default-secret-key')
        app.jwt_manager = self
    
    def create_token(self, token_type: TokenType, claims: Dict[str, Any], 
                    expires_delta: Optional[timedelta] = None) -> str:
        """إنشاء رمز JWT"""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=24)
        
        payload = {
            "type": token_type.value,
            "exp": expire,
            "iat": datetime.utcnow(),
            **claims
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def decode_token(self, token: str) -> Dict[str, Any]:
        """فك تشفير رمز JWT"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise Exception("الرمز منتهي الصلاحية")
        except jwt.InvalidTokenError:
            raise Exception("رمز غير صالح")

# إنشاء مثيل عام
jwt_manager = JWTManager()

