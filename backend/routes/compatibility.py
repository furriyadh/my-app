"""
طبقة توافق للمكتبات البديلة
================================================================================
هذا الملف يوفر واجهات متوافقة للمكتبات البديلة
"""

# ✅ JWT compatibility layer
try:
    from jose import jwt
    from jose import jwk
    from jose import jws
    JWT_AVAILABLE = True
    print("✅ JWT: استخدام python-jose")
except ImportError:
    # Fallback to PyJWT if available
    try:
        import jwt
        JWT_AVAILABLE = True
        print("⚠️ JWT: استخدام PyJWT (fallback)")
    except ImportError:
        JWT_AVAILABLE = False
        print("❌ JWT: غير متاح")

# ✅ Crypto compatibility layer  
try:
    from Crypto.Hash import SHA256, SHA512
    from Crypto.Cipher import AES
    from Crypto.Protocol.KDF import PBKDF2
    from Crypto.Random import get_random_bytes
    CRYPTO_AVAILABLE = True
    print("✅ Crypto: استخدام PyCryptodome")
except ImportError:
    try:
        from cryptography.hazmat.primitives import hashes
        CRYPTO_AVAILABLE = True
        print("⚠️ Crypto: استخدام cryptography (fallback)")
    except ImportError:
        CRYPTO_AVAILABLE = False
        print("❌ Crypto: غير متاح")

# ✅ Password hashing compatibility layer
try:
    from passlib.hash import bcrypt as bcrypt_hash
    from passlib.hash import pbkdf2_sha256
    PASSWORD_AVAILABLE = True
    print("✅ Password: استخدام passlib")
except ImportError:
    try:
        import bcrypt
        PASSWORD_AVAILABLE = True
        print("⚠️ Password: استخدام bcrypt (fallback)")
    except ImportError:
        PASSWORD_AVAILABLE = False
        print("❌ Password: غير متاح")

# Helper functions
def safe_jwt_encode(payload, secret, algorithm='HS256'):
    """JWT encoding with error handling"""
    if JWT_AVAILABLE:
        return jwt.encode(payload, secret, algorithm=algorithm)
    else:
        raise ImportError("JWT library not available")

def safe_jwt_decode(token, secret, algorithms=['HS256']):
    """JWT decoding with error handling"""
    if JWT_AVAILABLE:
        return jwt.decode(token, secret, algorithms=algorithms)
    else:
        raise ImportError("JWT library not available")

def safe_hash_password(password):
    """Password hashing with error handling"""
    if PASSWORD_AVAILABLE:
        return bcrypt_hash.hash(password)
    else:
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()

def safe_verify_password(password, hashed):
    """Password verification with error handling"""
    if PASSWORD_AVAILABLE:
        return bcrypt_hash.verify(password, hashed)
    else:
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest() == hashed
