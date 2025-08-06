"""
طبقة التوافق النهائية الصحيحة
استخدام البدائل الآمنة المثبتة مسبقاً:
- pycryptodome بدلاً من cryptography
- python-jose بدلاً من PyJWT
- passlib بدلاً من bcrypt

Author: Google Ads AI Platform Team
Version: 1.0.0 - Final Correct
"""

import os
import sys
import logging
import json
import hashlib
import secrets
import base64
from typing import Any, Dict, Optional, Union, List
from datetime import datetime, timedelta

# إعداد التسجيل
logger = logging.getLogger(__name__)

# ==================== استيراد البدائل الآمنة المثبتة ====================

# استيراد python-jose (البديل الآمن لـ PyJWT)
try:
    from jose import jwt
    JWT_AVAILABLE = True
    JWT_LIBRARY = 'python-jose'
    logger.info("✅ تم تحميل python-jose بنجاح")
except ImportError:
    JWT_AVAILABLE = False
    JWT_LIBRARY = 'غير متاح'
    logger.error("❌ python-jose غير متاح")

# استيراد passlib (البديل الآمن لـ bcrypt)
try:
    from passlib.hash import bcrypt as passlib_bcrypt
    BCRYPT_AVAILABLE = True
    BCRYPT_LIBRARY = 'passlib'
    logger.info("✅ تم تحميل passlib بنجاح")
except ImportError:
    BCRYPT_AVAILABLE = False
    BCRYPT_LIBRARY = 'غير متاح'
    logger.error("❌ passlib غير متاح")

# استيراد pycryptodome (البديل الآمن لـ cryptography)
try:
    from Crypto.Hash import SHA256
    from Crypto.Cipher import AES
    from Crypto.Random import get_random_bytes
    CRYPTO_AVAILABLE = True
    CRYPTO_LIBRARY = 'pycryptodome'
    logger.info("✅ تم تحميل pycryptodome بنجاح")
except ImportError:
    CRYPTO_AVAILABLE = False
    CRYPTO_LIBRARY = 'غير متاح'
    logger.error("❌ pycryptodome غير متاح")

# ==================== دوال مساعدة للاستيراد الآمن ====================

def safe_import_jwt():
    """استيراد آمن لـ JWT (python-jose)"""
    if JWT_AVAILABLE:
        return jwt
    else:
        raise ImportError("python-jose غير متاح - يرجى تثبيته: pip install python-jose")

def safe_import_bcrypt():
    """استيراد آمن لـ bcrypt (passlib)"""
    if BCRYPT_AVAILABLE:
        return passlib_bcrypt
    else:
        raise ImportError("passlib غير متاح - يرجى تثبيته: pip install passlib")

def safe_import_crypto():
    """استيراد آمن للتشفير (pycryptodome)"""
    if CRYPTO_AVAILABLE:
        return {'SHA256': SHA256, 'AES': AES, 'get_random_bytes': get_random_bytes}
    else:
        raise ImportError("pycryptodome غير متاح - يرجى تثبيته: pip install pycryptodome")

# ==================== تصدير المكتبات للاستخدام المباشر ====================

# تصدير jwt (python-jose)
if JWT_AVAILABLE:
    # تصدير jwt مباشرة من python-jose
    pass  # jwt متاح بالفعل من الاستيراد أعلاه
else:
    jwt = None

# تصدير bcrypt (passlib)
if BCRYPT_AVAILABLE:
    bcrypt = passlib_bcrypt
else:
    bcrypt = None

# تصدير crypto components (pycryptodome)
if CRYPTO_AVAILABLE:
    # تصدير مكونات التشفير
    crypto_hash = SHA256
    crypto_cipher = AES
    crypto_random = get_random_bytes
else:
    crypto_hash = None
    crypto_cipher = None
    crypto_random = None

# ==================== دوال مساعدة للتشفير ====================

def hash_password(password: str) -> str:
    """تشفير كلمة المرور باستخدام passlib"""
    if not BCRYPT_AVAILABLE:
        raise ImportError("passlib غير متاح")
    
    try:
        return passlib_bcrypt.hash(password)
    except Exception as e:
        logger.error(f"خطأ في تشفير كلمة المرور: {e}")
        raise

def verify_password(password: str, hashed: str) -> bool:
    """التحقق من كلمة المرور باستخدام passlib"""
    if not BCRYPT_AVAILABLE:
        raise ImportError("passlib غير متاح")
    
    try:
        return passlib_bcrypt.verify(password, hashed)
    except Exception as e:
        logger.error(f"خطأ في التحقق من كلمة المرور: {e}")
        raise

def create_jwt_token(payload: Dict[str, Any], secret_key: str, algorithm: str = 'HS256') -> str:
    """إنشاء JWT token باستخدام python-jose"""
    if not JWT_AVAILABLE:
        raise ImportError("python-jose غير متاح")
    
    try:
        token = jwt.encode(payload, secret_key, algorithm=algorithm)
        return token if isinstance(token, str) else token.decode('utf-8')
    except Exception as e:
        logger.error(f"خطأ في إنشاء JWT token: {e}")
        raise

def verify_jwt_token(token: str, secret_key: str, algorithms: List[str] = None) -> Dict[str, Any]:
    """التحقق من JWT token باستخدام python-jose"""
    if not JWT_AVAILABLE:
        raise ImportError("python-jose غير متاح")
    
    try:
        if algorithms is None:
            algorithms = ['HS256']
        return jwt.decode(token, secret_key, algorithms=algorithms)
    except Exception as e:
        logger.error(f"خطأ في التحقق من JWT token: {e}")
        raise

def encrypt_data(data: str, key: str) -> str:
    """تشفير البيانات باستخدام pycryptodome"""
    if not CRYPTO_AVAILABLE:
        raise ImportError("pycryptodome غير متاح")
    
    try:
        # إنشاء مفتاح 32 بايت
        key_hash = hashlib.sha256(key.encode('utf-8')).digest()
        
        # إنشاء IV عشوائي
        iv = get_random_bytes(16)
        
        # تشفير البيانات
        cipher = AES.new(key_hash, AES.MODE_CBC, iv)
        
        # إضافة padding
        data_bytes = data.encode('utf-8')
        padding_length = 16 - (len(data_bytes) % 16)
        padded_data = data_bytes + bytes([padding_length] * padding_length)
        
        encrypted = cipher.encrypt(padded_data)
        
        # دمج IV مع البيانات المشفرة
        result = iv + encrypted
        return base64.b64encode(result).decode('utf-8')
        
    except Exception as e:
        logger.error(f"خطأ في تشفير البيانات: {e}")
        raise

def decrypt_data(encrypted_data: str, key: str) -> str:
    """فك تشفير البيانات باستخدام pycryptodome"""
    if not CRYPTO_AVAILABLE:
        raise ImportError("pycryptodome غير متاح")
    
    try:
        # فك تشفير base64
        encrypted_bytes = base64.b64decode(encrypted_data.encode('utf-8'))
        
        # استخراج IV
        iv = encrypted_bytes[:16]
        encrypted = encrypted_bytes[16:]
        
        # إنشاء مفتاح
        key_hash = hashlib.sha256(key.encode('utf-8')).digest()
        
        # فك التشفير
        cipher = AES.new(key_hash, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(encrypted)
        
        # إزالة padding
        padding_length = decrypted[-1]
        decrypted = decrypted[:-padding_length]
        
        return decrypted.decode('utf-8')
        
    except Exception as e:
        logger.error(f"خطأ في فك تشفير البيانات: {e}")
        raise

def hash_data(data: Union[str, bytes]) -> str:
    """تشفير البيانات بـ SHA256 باستخدام pycryptodome"""
    if not CRYPTO_AVAILABLE:
        raise ImportError("pycryptodome غير متاح")
    
    try:
        if isinstance(data, str):
            data = data.encode('utf-8')
        
        hash_obj = SHA256.new(data)
        return hash_obj.hexdigest()
    except Exception as e:
        logger.error(f"خطأ في تشفير البيانات: {e}")
        raise

# ==================== دوال المراقبة والتشخيص ====================

def get_compatibility_status() -> Dict[str, Any]:
    """الحصول على حالة التوافق"""
    return {
        'jwt': {
            'available': JWT_AVAILABLE,
            'library': JWT_LIBRARY,
            'status': 'متاح' if JWT_AVAILABLE else 'غير متاح'
        },
        'bcrypt': {
            'available': BCRYPT_AVAILABLE,
            'library': BCRYPT_LIBRARY,
            'status': 'متاح' if BCRYPT_AVAILABLE else 'غير متاح'
        },
        'crypto': {
            'available': CRYPTO_AVAILABLE,
            'library': CRYPTO_LIBRARY,
            'status': 'متاح' if CRYPTO_AVAILABLE else 'غير متاح'
        },
        'all_available': all([JWT_AVAILABLE, BCRYPT_AVAILABLE, CRYPTO_AVAILABLE]),
        'summary': {
            'total_libraries': 3,
            'available_count': sum([JWT_AVAILABLE, BCRYPT_AVAILABLE, CRYPTO_AVAILABLE]),
            'missing_count': 3 - sum([JWT_AVAILABLE, BCRYPT_AVAILABLE, CRYPTO_AVAILABLE])
        },
        'timestamp': datetime.utcnow().isoformat()
    }

def test_all_libraries() -> Dict[str, Any]:
    """اختبار جميع المكتبات"""
    results = {}
    
    # اختبار JWT (python-jose)
    try:
        if JWT_AVAILABLE:
            test_payload = {
                'user_id': 'test_user',
                'exp': int((datetime.utcnow() + timedelta(minutes=5)).timestamp()),
                'iat': int(datetime.utcnow().timestamp())
            }
            token = create_jwt_token(test_payload, 'test_secret_key')
            decoded = verify_jwt_token(token, 'test_secret_key')
            results['jwt'] = {
                'success': True,
                'library': 'python-jose',
                'payload_match': decoded['user_id'] == 'test_user'
            }
        else:
            results['jwt'] = {'success': False, 'error': 'python-jose غير متاح'}
    except Exception as e:
        results['jwt'] = {'success': False, 'error': str(e)}
    
    # اختبار bcrypt (passlib)
    try:
        if BCRYPT_AVAILABLE:
            test_password = 'test_password_123'
            hashed = hash_password(test_password)
            is_valid = verify_password(test_password, hashed)
            is_invalid = verify_password('wrong_password', hashed)
            results['bcrypt'] = {
                'success': True,
                'library': 'passlib',
                'verification_correct': is_valid,
                'verification_incorrect': not is_invalid
            }
        else:
            results['bcrypt'] = {'success': False, 'error': 'passlib غير متاح'}
    except Exception as e:
        results['bcrypt'] = {'success': False, 'error': str(e)}
    
    # اختبار crypto (pycryptodome)
    try:
        if CRYPTO_AVAILABLE:
            test_data = 'test data for encryption'
            test_key = 'test_encryption_key'
            
            # اختبار التشفير وفك التشفير
            encrypted = encrypt_data(test_data, test_key)
            decrypted = decrypt_data(encrypted, test_key)
            
            # اختبار hash
            hashed = hash_data(test_data)
            
            results['crypto'] = {
                'success': True,
                'library': 'pycryptodome',
                'encryption_match': decrypted == test_data,
                'hash_generated': len(hashed) == 64  # SHA256 hex length
            }
        else:
            results['crypto'] = {'success': False, 'error': 'pycryptodome غير متاح'}
    except Exception as e:
        results['crypto'] = {'success': False, 'error': str(e)}
    
    return results

# ==================== تسجيل حالة التحميل ====================

def log_initialization_status():
    """تسجيل حالة التهيئة"""
    logger.info("=" * 60)
    logger.info("🔧 طبقة التوافق النهائية - البدائل الآمنة")
    logger.info("=" * 60)
    
    status = get_compatibility_status()
    
    for lib_name, lib_info in status.items():
        if isinstance(lib_info, dict) and 'available' in lib_info:
            icon = "✅" if lib_info['available'] else "❌"
            logger.info(f"{icon} {lib_name}: {lib_info['library']} - {lib_info['status']}")
    
    if status['all_available']:
        logger.info("🎉 جميع البدائل الآمنة متاحة ومثبتة!")
    else:
        missing_count = status['summary']['missing_count']
        logger.warning(f"⚠️ {missing_count} مكتبة مفقودة من أصل 3")
    
    logger.info(f"📊 الإحصائيات: {status['summary']['available_count']}/3 متاحة")
    logger.info("=" * 60)

# تشغيل تسجيل حالة التهيئة
log_initialization_status()

# ==================== تصدير جميع المكونات ====================

__all__ = [
    # المكتبات الأساسية
    'jwt', 'bcrypt', 'crypto_hash', 'crypto_cipher', 'crypto_random',
    
    # دوال الاستيراد الآمن
    'safe_import_jwt', 'safe_import_bcrypt', 'safe_import_crypto',
    
    # دوال مساعدة
    'hash_password', 'verify_password',
    'create_jwt_token', 'verify_jwt_token',
    'encrypt_data', 'decrypt_data', 'hash_data',
    
    # دوال المراقبة
    'get_compatibility_status', 'test_all_libraries',
    
    # متغيرات الحالة
    'JWT_AVAILABLE', 'BCRYPT_AVAILABLE', 'CRYPTO_AVAILABLE',
    'JWT_LIBRARY', 'BCRYPT_LIBRARY', 'CRYPTO_LIBRARY'
]

logger.info("✅ تم تحميل طبقة التوافق النهائية بنجاح!")

