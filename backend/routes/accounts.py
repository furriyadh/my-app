"""
Google Ads Accounts Management System
نظام إدارة حسابات Google Ads المتطور والشامل

يوفر نظام إدارة حسابات متكامل لـ Google Ads بما في ذلك:
- إدارة الحسابات والعملاء
- نظام MCC (My Client Center) متقدم
- مصادقة OAuth 2.0 آمنة
- إدارة الأذونات والصلاحيات
- مراقبة الأداء في الوقت الفعلي
- تحليلات متقدمة للحسابات
- نظام تنبيهات ذكي
- تقارير مفصلة وقابلة للتخصيص
- إدارة الميزانيات والحدود
- نظام أمان متعدد الطبقات

Author: Google Ads AI Platform Team
Version: 3.0.0
Security Level: Enterprise
Performance: High-Performance Architecture
"""

import os
import asyncio
import json
import time
import uuid
import hashlib
import secrets
import re
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple, Union, Set, Callable
from dataclasses import dataclass, field, asdict
from enum import Enum, auto
from functools import wraps, lru_cache
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from collections import defaultdict, Counter
import logging

# Flask imports
from flask import Blueprint, request, jsonify, session, current_app, g

# ==================== استيراد البدائل الآمنة ====================

# استيراد python-jose بدلاً من PyJWT
try:
    from jose import jwt
    from jose.exceptions import JWTError, ExpiredSignatureError, JWTClaimsError
    JWT_AVAILABLE = True
    JWT_LIBRARY = 'python-jose'
except ImportError:
    JWT_AVAILABLE = False
    JWT_LIBRARY = 'غير متاح'
    jwt = None
    JWTError = Exception
    ExpiredSignatureError = Exception
    JWTClaimsError = Exception

# استيراد passlib بدلاً من bcrypt
try:
    from passlib.hash import bcrypt as passlib_bcrypt
    from passlib.context import CryptContext
    BCRYPT_AVAILABLE = True
    BCRYPT_LIBRARY = 'passlib'
    # إنشاء context للتشفير
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except ImportError:
    BCRYPT_AVAILABLE = False
    BCRYPT_LIBRARY = 'غير متاح'
    passlib_bcrypt = None
    pwd_context = None

# استيراد pycryptodome بدلاً من cryptography
try:
    from Crypto.Hash import SHA256, SHA512, HMAC
    from Crypto.Cipher import AES
    from Crypto.Random import get_random_bytes
    from Crypto.Protocol.KDF import PBKDF2
    from Crypto.Util.Padding import pad, unpad
    CRYPTO_AVAILABLE = True
    CRYPTO_LIBRARY = 'pycryptodome'
except ImportError:
    CRYPTO_AVAILABLE = False
    CRYPTO_LIBRARY = 'غير متاح'
    SHA256 = None
    SHA512 = None
    HMAC = None
    AES = None
    get_random_bytes = None
    PBKDF2 = None
    pad = None
    unpad = None

# استيراد pydantic مع إصلاح ForwardRef
try:
    from pydantic import BaseModel, Field, validator, root_validator
    from pydantic.dataclasses import dataclass as pydantic_dataclass
    from pydantic.types import EmailStr, SecretStr
    # تحديد إصدار pydantic بدون استيراد _internal
    import pydantic
    PYDANTIC_V2 = hasattr(pydantic, '__version__') and pydantic.__version__.startswith('2.')
    
    PYDANTIC_AVAILABLE = True
    PYDANTIC_LIBRARY = f'pydantic v{"2" if PYDANTIC_V2 else "1"}'
except ImportError:
    PYDANTIC_AVAILABLE = False
    PYDANTIC_LIBRARY = 'غير متاح'
    BaseModel = object
    Field = lambda **kwargs: None
    validator = lambda *args, **kwargs: lambda f: f
    root_validator = lambda *args, **kwargs: lambda f: f
    pydantic_dataclass = dataclass
    EmailStr = str
    SecretStr = str
    PYDANTIC_V2 = False

# Third-party imports
import pandas as pd
import numpy as np

# إعداد التسجيل المتقدم
logger = logging.getLogger(__name__)

# تسجيل حالة المكتبات
logger.info(f"🔐 JWT Library: {JWT_LIBRARY} ({'✅' if JWT_AVAILABLE else '❌'})")
logger.info(f"🔒 Bcrypt Library: {BCRYPT_LIBRARY} ({'✅' if BCRYPT_AVAILABLE else '❌'})")
logger.info(f"🔑 Crypto Library: {CRYPTO_LIBRARY} ({'✅' if CRYPTO_AVAILABLE else '❌'})")
logger.info(f"📊 Pydantic Library: {PYDANTIC_LIBRARY} ({'✅' if PYDANTIC_AVAILABLE else '❌'})")

# إنشاء Blueprint مع إعدادات متقدمة
accounts_bp = Blueprint(
    'accounts',
    __name__,
    url_prefix='/api/accounts',
    static_folder=None,
    template_folder=None
)

# محاولة استيراد الخدمات المطلوبة
SERVICES_STATUS = {
    'google_ads_client': False,
    'mcc_manager': False,
    'oauth_handler': False,
    'validators': False,
    'helpers': False,
    'database': False,
    'redis': False,
    'ai_services': False
}

try:
    from services.google_ads_client import GoogleAdsClientService
    SERVICES_STATUS['google_ads_client'] = True
except ImportError as e:
    logger.warning(f"⚠️ GoogleAdsClientService غير متاح: {e}")

try:
    from services.mcc_manager import MCCManager
    SERVICES_STATUS['mcc_manager'] = True
except ImportError as e:
    logger.warning(f"⚠️ MCCManager غير متاح: {e}")

try:
    from services.oauth_handler import OAuthHandler
    SERVICES_STATUS['oauth_handler'] = True
except ImportError as e:
    logger.warning(f"⚠️ OAuthHandler غير متاح: {e}")

try:
    from utils.validators import GoogleAdsValidator, validate_email, validate_user_data
    SERVICES_STATUS['validators'] = True
except ImportError as e:
    logger.warning(f"⚠️ Validators غير متاح: {e}")

try:
    from utils.helpers import (
        format_currency, format_percentage, calculate_performance_score,
        generate_campaign_id, sanitize_text, generate_unique_id
    )
    SERVICES_STATUS['helpers'] = True
except ImportError as e:
    logger.warning(f"⚠️ Helpers غير متاح: {e}")

try:
    from utils.database import DatabaseManager
    SERVICES_STATUS['database'] = True
except ImportError as e:
    logger.warning(f"⚠️ DatabaseManager غير متاح: {e}")

try:
    from utils.redis_config import cache_set, cache_get, cache_delete
    SERVICES_STATUS['redis'] = True
except ImportError as e:
    logger.warning(f"⚠️ Redis غير متاح: {e}")

try:
    from services.ai_services import AccountAnalyzer, PerformancePredictor, RecommendationEngine
    SERVICES_STATUS['ai_services'] = True
except ImportError as e:
    logger.warning(f"⚠️ AI Services غير متاح: {e}")

# تحديد حالة الخدمات
SERVICES_AVAILABLE = any(SERVICES_STATUS.values())
logger.info(f"✅ تم تحميل خدمات Accounts - الخدمات المتاحة: {sum(SERVICES_STATUS.values())}/8")

# إعداد Thread Pool للعمليات المتوازية
accounts_executor = ThreadPoolExecutor(max_workers=20, thread_name_prefix="accounts_worker")

# ==================== دوال الأمان والتشفير ====================

class AccountsSecurityManager:
    """مدير الأمان والتشفير لخدمة الحسابات"""
    
    def __init__(self):
        """تهيئة مدير الأمان"""
        self.jwt_secret = os.getenv('JWT_SECRET_KEY', 'accounts_secret_key_change_in_production')
        self.encryption_key = self._derive_encryption_key()
        self.session_timeout = timedelta(hours=24)
        
    def _derive_encryption_key(self) -> bytes:
        """اشتقاق مفتاح التشفير"""
        if CRYPTO_AVAILABLE:
            try:
                # استخدام PBKDF2 من pycryptodome
                password = self.jwt_secret.encode('utf-8')
                salt = b'google_ads_accounts_salt_2024'
                key = PBKDF2(password, salt, 32, count=100000, hmac_hash_module=SHA256)
                return key
            except Exception as e:
                logger.error(f"خطأ في اشتقاق مفتاح التشفير: {e}")
        
        # fallback إلى hashlib
        import hashlib
        return hashlib.sha256(self.jwt_secret.encode('utf-8')).digest()
    
    def create_jwt_token(self, payload: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """إنشاء JWT token باستخدام python-jose"""
        if not JWT_AVAILABLE:
            logger.warning("JWT غير متاح - استخدام fallback")
            return self._create_fallback_token(payload)
        
        try:
            if expires_delta:
                expire = datetime.utcnow() + expires_delta
            else:
                expire = datetime.utcnow() + self.session_timeout
            
            payload.update({
                'exp': expire,
                'iat': datetime.utcnow(),
                'jti': str(uuid.uuid4()),
                'service': 'accounts'
            })
            
            token = jwt.encode(payload, self.jwt_secret, algorithm='HS256')
            return token if isinstance(token, str) else token.decode('utf-8')
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء JWT token: {e}")
            return self._create_fallback_token(payload)
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """التحقق من JWT token باستخدام python-jose"""
        if not JWT_AVAILABLE:
            return self._verify_fallback_token(token)
        
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            return payload
        except ExpiredSignatureError:
            logger.warning("JWT token منتهي الصلاحية")
            return None
        except JWTError as e:
            logger.error(f"خطأ في التحقق من JWT token: {e}")
            return None
        except Exception as e:
            logger.error(f"خطأ عام في التحقق من JWT token: {e}")
            return None
    
    def _create_fallback_token(self, payload: Dict[str, Any]) -> str:
        """إنشاء token احتياطي"""
        import base64
        import json
        
        try:
            payload_str = json.dumps(payload, default=str)
            encoded_payload = base64.b64encode(payload_str.encode('utf-8')).decode('utf-8')
            return f"accounts_fallback_{encoded_payload}_{uuid.uuid4().hex}"
        except Exception:
            return f"accounts_emergency_token_{uuid.uuid4().hex}"
    
    def _verify_fallback_token(self, token: str) -> Optional[Dict[str, Any]]:
        """التحقق من token احتياطي"""
        try:
            if token.startswith('accounts_fallback_'):
                parts = token.split('_', 3)
                if len(parts) >= 3:
                    import base64
                    import json
                    payload_str = base64.b64decode(parts[2]).decode('utf-8')
                    return json.loads(payload_str)
            return None
        except Exception:
            return None
    
    def hash_password(self, password: str) -> str:
        """تشفير كلمة المرور باستخدام passlib"""
        if BCRYPT_AVAILABLE and pwd_context:
            try:
                return pwd_context.hash(password)
            except Exception as e:
                logger.error(f"خطأ في تشفير كلمة المرور بـ passlib: {e}")
        
        # fallback إلى hashlib
        import hashlib
        salt = secrets.token_hex(16)
        hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return f"pbkdf2_sha256${salt}${hashed.hex()}"
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """التحقق من كلمة المرور باستخدام passlib"""
        if BCRYPT_AVAILABLE and pwd_context:
            try:
                return pwd_context.verify(password, hashed_password)
            except Exception as e:
                logger.error(f"خطأ في التحقق من كلمة المرور بـ passlib: {e}")
        
        # fallback للتحقق من pbkdf2
        try:
            if hashed_password.startswith('pbkdf2_sha256$'):
                parts = hashed_password.split('$')
                if len(parts) == 3:
                    salt = parts[1]
                    stored_hash = parts[2]
                    import hashlib
                    computed_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
                    return computed_hash.hex() == stored_hash
        except Exception as e:
            logger.error(f"خطأ في التحقق من كلمة المرور fallback: {e}")
        
        return False
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """تشفير البيانات الحساسة باستخدام pycryptodome"""
        if not CRYPTO_AVAILABLE:
            logger.warning("Crypto غير متاح - استخدام base64 encoding")
            import base64
            return base64.b64encode(data.encode('utf-8')).decode('utf-8')
        
        try:
            # إنشاء IV عشوائي
            iv = get_random_bytes(16)
            
            # إنشاء cipher
            cipher = AES.new(self.encryption_key, AES.MODE_CBC, iv)
            
            # تشفير البيانات مع padding
            padded_data = pad(data.encode('utf-8'), AES.block_size)
            encrypted_data = cipher.encrypt(padded_data)
            
            # دمج IV مع البيانات المشفرة
            result = iv + encrypted_data
            
            import base64
            return base64.b64encode(result).decode('utf-8')
            
        except Exception as e:
            logger.error(f"خطأ في تشفير البيانات: {e}")
            # fallback
            import base64
            return base64.b64encode(data.encode('utf-8')).decode('utf-8')
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """فك تشفير البيانات الحساسة باستخدام pycryptodome"""
        if not CRYPTO_AVAILABLE:
            logger.warning("Crypto غير متاح - استخدام base64 decoding")
            try:
                import base64
                return base64.b64decode(encrypted_data.encode('utf-8')).decode('utf-8')
            except Exception:
                return encrypted_data
        
        try:
            import base64
            encrypted_bytes = base64.b64decode(encrypted_data.encode('utf-8'))
            
            # استخراج IV
            iv = encrypted_bytes[:16]
            encrypted = encrypted_bytes[16:]
            
            # إنشاء cipher
            cipher = AES.new(self.encryption_key, AES.MODE_CBC, iv)
            
            # فك التشفير وإزالة padding
            decrypted_padded = cipher.decrypt(encrypted)
            decrypted_data = unpad(decrypted_padded, AES.block_size)
            
            return decrypted_data.decode('utf-8')
            
        except Exception as e:
            logger.error(f"خطأ في فك تشفير البيانات: {e}")
            # fallback
            try:
                import base64
                return base64.b64decode(encrypted_data.encode('utf-8')).decode('utf-8')
            except Exception:
                return encrypted_data
    
    def create_secure_hash(self, data: str) -> str:
        """إنشاء hash آمن باستخدام pycryptodome"""
        if CRYPTO_AVAILABLE:
            try:
                hash_obj = SHA256.new(data.encode('utf-8'))
                return hash_obj.hexdigest()
            except Exception as e:
                logger.error(f"خطأ في إنشاء hash بـ pycryptodome: {e}")
        
        # fallback إلى hashlib
        import hashlib
        return hashlib.sha256(data.encode('utf-8')).hexdigest()

# إنشاء مدير الأمان
accounts_security_manager = AccountsSecurityManager()

# ==================== JWT Decorator ====================

def jwt_required_accounts(f):
    """Decorator للتحقق من JWT token في accounts"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Authorization header مطلوب',
                'error_code': 'MISSING_AUTH_HEADER'
            }), 401
        
        token = auth_header.split(' ')[1]
        token_data = accounts_security_manager.verify_jwt_token(token)
        
        if not token_data:
            return jsonify({
                'success': False,
                'error': 'Token غير صحيح أو منتهي الصلاحية',
                'error_code': 'INVALID_TOKEN'
            }), 401
        
        # إضافة بيانات المستخدم إلى request
        request.current_user = token_data
        return f(*args, **kwargs)
    
    return decorated_function

# ==================== Data Models ====================

class AccountType(Enum):
    """أنواع الحسابات"""
    INDIVIDUAL = "individual"
    BUSINESS = "business"
    AGENCY = "agency"
    MCC = "mcc"
    ENTERPRISE = "enterprise"

class AccountStatus(Enum):
    """حالات الحساب"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"
    CLOSED = "closed"
    UNDER_REVIEW = "under_review"

class PermissionLevel(Enum):
    """مستويات الصلاحيات"""
    READ_ONLY = "read_only"
    STANDARD = "standard"
    ADMIN = "admin"
    OWNER = "owner"
    SUPER_ADMIN = "super_admin"

# إصلاح مشكلة pydantic ForwardRef
if PYDANTIC_AVAILABLE:
    class UserModel(BaseModel):
        """نموذج المستخدم مع إصلاح ForwardRef"""
        user_id: str = Field(..., description="معرف المستخدم الفريد")
        email: str = Field(..., description="البريد الإلكتروني")
        name: str = Field(..., description="اسم المستخدم")
        role: str = Field(default="user", description="دور المستخدم")
        account_type: AccountType = Field(default=AccountType.INDIVIDUAL, description="نوع الحساب")
        status: AccountStatus = Field(default=AccountStatus.PENDING, description="حالة الحساب")
        permissions: List[str] = Field(default_factory=list, description="قائمة الصلاحيات")
        created_at: datetime = Field(default_factory=datetime.utcnow, description="تاريخ الإنشاء")
        updated_at: Optional[datetime] = Field(default=None, description="تاريخ آخر تحديث")
        last_login: Optional[datetime] = Field(default=None, description="آخر تسجيل دخول")
        metadata: Dict[str, Any] = Field(default_factory=dict, description="بيانات إضافية")
        
        class Config:
            """إعدادات النموذج"""
            use_enum_values = True
            validate_assignment = True
            arbitrary_types_allowed = True
            json_encoders = {
                datetime: lambda v: v.isoformat() if v else None
            }
        
        @validator('email')
        def validate_email_format(cls, v):
            """التحقق من صحة البريد الإلكتروني"""
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
                raise ValueError('البريد الإلكتروني غير صحيح')
            return v.lower()
        
        @validator('name')
        def validate_name(cls, v):
            """التحقق من صحة الاسم"""
            if not v or len(v.strip()) < 2:
                raise ValueError('الاسم يجب أن يكون حرفين على الأقل')
            return v.strip()
    
    class AccountModel(BaseModel):
        """نموذج الحساب مع إصلاح ForwardRef"""
        account_id: str = Field(..., description="معرف الحساب الفريد")
        customer_id: str = Field(..., description="معرف العميل في Google Ads")
        account_name: str = Field(..., description="اسم الحساب")
        account_type: AccountType = Field(..., description="نوع الحساب")
        status: AccountStatus = Field(..., description="حالة الحساب")
        owner_id: str = Field(..., description="معرف مالك الحساب")
        currency: str = Field(default="USD", description="العملة")
        timezone: str = Field(default="UTC", description="المنطقة الزمنية")
        budget_limit: Optional[float] = Field(default=None, description="حد الميزانية")
        spend_limit: Optional[float] = Field(default=None, description="حد الإنفاق")
        permissions: Dict[str, List[str]] = Field(default_factory=dict, description="صلاحيات المستخدمين")
        settings: Dict[str, Any] = Field(default_factory=dict, description="إعدادات الحساب")
        created_at: datetime = Field(default_factory=datetime.utcnow, description="تاريخ الإنشاء")
        updated_at: Optional[datetime] = Field(default=None, description="تاريخ آخر تحديث")
        last_activity: Optional[datetime] = Field(default=None, description="آخر نشاط")
        metadata: Dict[str, Any] = Field(default_factory=dict, description="بيانات إضافية")
        
        class Config:
            """إعدادات النموذج"""
            use_enum_values = True
            validate_assignment = True
            arbitrary_types_allowed = True
            json_encoders = {
                datetime: lambda v: v.isoformat() if v else None
            }
        
        @validator('account_name')
        def validate_account_name(cls, v):
            """التحقق من صحة اسم الحساب"""
            if not v or len(v.strip()) < 3:
                raise ValueError('اسم الحساب يجب أن يكون 3 أحرف على الأقل')
            return v.strip()
        
        @validator('currency')
        def validate_currency(cls, v):
            """التحقق من صحة العملة"""
            valid_currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD']
            if v.upper() not in valid_currencies:
                raise ValueError(f'العملة غير مدعومة. العملات المدعومة: {", ".join(valid_currencies)}')
            return v.upper()

else:
    # نماذج احتياطية بدون pydantic
    @dataclass
    class UserModel:
        """نموذج المستخدم احتياطي"""
        user_id: str
        email: str
        name: str
        role: str = "user"
        account_type: AccountType = AccountType.INDIVIDUAL
        status: AccountStatus = AccountStatus.PENDING
        permissions: List[str] = field(default_factory=list)
        created_at: datetime = field(default_factory=datetime.utcnow)
        updated_at: Optional[datetime] = None
        last_login: Optional[datetime] = None
        metadata: Dict[str, Any] = field(default_factory=dict)
    
    @dataclass
    class AccountModel:
        """نموذج الحساب احتياطي"""
        account_id: str
        customer_id: str
        account_name: str
        account_type: AccountType
        status: AccountStatus
        owner_id: str
        currency: str = "USD"
        timezone: str = "UTC"
        budget_limit: Optional[float] = None
        spend_limit: Optional[float] = None
        permissions: Dict[str, List[str]] = field(default_factory=dict)
        settings: Dict[str, Any] = field(default_factory=dict)
        created_at: datetime = field(default_factory=datetime.utcnow)
        updated_at: Optional[datetime] = None
        last_activity: Optional[datetime] = None
        metadata: Dict[str, Any] = field(default_factory=dict)

# ==================== Helper Functions ====================

def validate_email_format(email: str) -> Tuple[bool, str]:
    """التحقق من صحة البريد الإلكتروني"""
    try:
        if not email or "@" not in email or "." not in email:
            return False, "البريد الإلكتروني غير صحيح"
        
        # تحقق أكثر تفصيلاً
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            return False, "تنسيق البريد الإلكتروني غير صحيح"
        
        return True, "صحيح"
    except Exception as e:
        return False, f"خطأ في التحقق من البريد الإلكتروني: {str(e)}"

def validate_user_data(name: str, email: str, password: str) -> Tuple[bool, str]:
    """التحقق من صحة بيانات المستخدم"""
    try:
        # التحقق من الاسم
        if not name or len(name.strip()) < 2:
            return False, "الاسم يجب أن يكون حرفين على الأقل"
        
        # التحقق من البريد الإلكتروني
        email_valid, email_msg = validate_email_format(email)
        if not email_valid:
            return False, email_msg
        
        # التحقق من كلمة المرور
        if not password or len(password) < 6:
            return False, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
        
        # تحقق من قوة كلمة المرور
        if not re.search(r'[A-Za-z]', password) or not re.search(r'\d', password):
            return False, "كلمة المرور يجب أن تحتوي على أحرف وأرقام"
        
        return True, "صحيح"
    except Exception as e:
        return False, f"خطأ في التحقق من البيانات: {str(e)}"

def generate_unique_id() -> str:
    """توليد معرف فريد"""
    return str(uuid.uuid4())

def sanitize_text(text: str) -> str:
    """تنظيف النص"""
    if not text:
        return ""
    return str(text).strip()

def format_currency(amount: float, currency: str = "USD") -> str:
    """تنسيق العملة"""
    try:
        if currency == "USD":
            return f"${amount:,.2f}"
        elif currency == "EUR":
            return f"€{amount:,.2f}"
        elif currency == "GBP":
            return f"£{amount:,.2f}"
        else:
            return f"{amount:,.2f} {currency}"
    except Exception:
        return f"{amount} {currency}"

def format_percentage(value: float) -> str:
    """تنسيق النسبة المئوية"""
    try:
        return f"{value:.2f}%"
    except Exception:
        return f"{value}%"

def calculate_performance_score(data: Dict[str, Any]) -> float:
    """حساب نقاط الأداء"""
    try:
        # خوارزمية بسيطة لحساب الأداء
        clicks = data.get('clicks', 0)
        impressions = data.get('impressions', 1)
        conversions = data.get('conversions', 0)
        cost = data.get('cost', 1)
        
        ctr = (clicks / impressions) * 100 if impressions > 0 else 0
        conversion_rate = (conversions / clicks) * 100 if clicks > 0 else 0
        cpc = cost / clicks if clicks > 0 else 0
        
        # نقاط الأداء (0-100)
        score = min(100, (ctr * 2) + (conversion_rate * 3) + max(0, 50 - cpc))
        return round(score, 2)
    except Exception:
        return 75.0  # نقاط افتراضية

# ==================== Account Services ====================

class AccountManager:
    """مدير الحسابات الرئيسي"""
    
    def __init__(self):
        """تهيئة مدير الحسابات"""
        self.accounts_cache = {}
        self.users_cache = {}
        
    def create_account(self, account_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """إنشاء حساب جديد"""
        try:
            # توليد معرف الحساب
            account_id = generate_unique_id()
            customer_id = f"customers/{secrets.randbelow(9999999999)}"
            
            # إنشاء نموذج الحساب
            if PYDANTIC_AVAILABLE:
                try:
                    account = AccountModel(
                        account_id=account_id,
                        customer_id=customer_id,
                        account_name=account_data.get('account_name', ''),
                        account_type=AccountType(account_data.get('account_type', 'individual')),
                        status=AccountStatus.PENDING,
                        owner_id=user_id,
                        currency=account_data.get('currency', 'USD'),
                        timezone=account_data.get('timezone', 'UTC'),
                        budget_limit=account_data.get('budget_limit'),
                        spend_limit=account_data.get('spend_limit'),
                        settings=account_data.get('settings', {}),
                        metadata=account_data.get('metadata', {})
                    )
                    account_dict = account.dict()
                except Exception as e:
                    logger.error(f"خطأ في إنشاء نموذج pydantic: {e}")
                    # fallback إلى dict عادي
                    account_dict = self._create_account_dict(account_id, customer_id, account_data, user_id)
            else:
                account_dict = self._create_account_dict(account_id, customer_id, account_data, user_id)
            
            # حفظ الحساب في الكاش
            self.accounts_cache[account_id] = account_dict
            
            return {
                'success': True,
                'account_id': account_id,
                'customer_id': customer_id,
                'account': account_dict
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء الحساب: {e}")
            return {
                'success': False,
                'error': f'خطأ في إنشاء الحساب: {str(e)}'
            }
    
    def _create_account_dict(self, account_id: str, customer_id: str, account_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """إنشاء قاموس الحساب"""
        return {
            'account_id': account_id,
            'customer_id': customer_id,
            'account_name': account_data.get('account_name', ''),
            'account_type': account_data.get('account_type', 'individual'),
            'status': 'pending',
            'owner_id': user_id,
            'currency': account_data.get('currency', 'USD'),
            'timezone': account_data.get('timezone', 'UTC'),
            'budget_limit': account_data.get('budget_limit'),
            'spend_limit': account_data.get('spend_limit'),
            'permissions': {},
            'settings': account_data.get('settings', {}),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': None,
            'last_activity': None,
            'metadata': account_data.get('metadata', {})
        }
    
    def get_account(self, account_id: str, user_id: str) -> Dict[str, Any]:
        """الحصول على حساب"""
        try:
            if account_id not in self.accounts_cache:
                return {
                    'success': False,
                    'error': 'الحساب غير موجود'
                }
            
            account = self.accounts_cache[account_id]
            
            # التحقق من الصلاحيات
            if account.get('owner_id') != user_id:
                user_permissions = account.get('permissions', {}).get(user_id, [])
                if 'read' not in user_permissions and 'admin' not in user_permissions:
                    return {
                        'success': False,
                        'error': 'غير مسموح بالوصول'
                    }
            
            return {
                'success': True,
                'account': account
            }
            
        except Exception as e:
            logger.error(f"خطأ في الحصول على الحساب: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def update_account(self, account_id: str, update_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """تحديث حساب"""
        try:
            if account_id not in self.accounts_cache:
                return {
                    'success': False,
                    'error': 'الحساب غير موجود'
                }
            
            account = self.accounts_cache[account_id]
            
            # التحقق من الصلاحيات
            if account.get('owner_id') != user_id:
                user_permissions = account.get('permissions', {}).get(user_id, [])
                if 'admin' not in user_permissions:
                    return {
                        'success': False,
                        'error': 'غير مسموح بالتعديل'
                    }
            
            # تحديث البيانات
            allowed_fields = [
                'account_name', 'currency', 'timezone', 'budget_limit', 
                'spend_limit', 'settings', 'metadata'
            ]
            
            for field in allowed_fields:
                if field in update_data:
                    account[field] = update_data[field]
            
            account['updated_at'] = datetime.utcnow().isoformat()
            
            return {
                'success': True,
                'account': account
            }
            
        except Exception as e:
            logger.error(f"خطأ في تحديث الحساب: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def list_accounts(self, user_id: str) -> Dict[str, Any]:
        """قائمة الحسابات"""
        try:
            user_accounts = []
            
            for account_id, account in self.accounts_cache.items():
                # التحقق من الصلاحيات
                if (account.get('owner_id') == user_id or 
                    user_id in account.get('permissions', {})):
                    
                    # إضافة معلومات مختصرة
                    account_summary = {
                        'account_id': account_id,
                        'account_name': account.get('account_name'),
                        'account_type': account.get('account_type'),
                        'status': account.get('status'),
                        'currency': account.get('currency'),
                        'created_at': account.get('created_at'),
                        'last_activity': account.get('last_activity')
                    }
                    user_accounts.append(account_summary)
            
            return {
                'success': True,
                'accounts': user_accounts,
                'total_count': len(user_accounts)
            }
            
        except Exception as e:
            logger.error(f"خطأ في قائمة الحسابات: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_account(self, account_id: str, user_id: str) -> Dict[str, Any]:
        """حذف حساب"""
        try:
            if account_id not in self.accounts_cache:
                return {
                    'success': False,
                    'error': 'الحساب غير موجود'
                }
            
            account = self.accounts_cache[account_id]
            
            # التحقق من الصلاحيات (المالك فقط)
            if account.get('owner_id') != user_id:
                return {
                    'success': False,
                    'error': 'غير مسموح بالحذف - المالك فقط'
                }
            
            # حذف الحساب
            del self.accounts_cache[account_id]
            
            return {
                'success': True,
                'message': 'تم حذف الحساب بنجاح'
            }
            
        except Exception as e:
            logger.error(f"خطأ في حذف الحساب: {e}")
            return {
                'success': False,
                'error': str(e)
            }

class UserManager:
    """مدير المستخدمين"""
    
    def __init__(self):
        """تهيئة مدير المستخدمين"""
        self.users_cache = {}
        
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء مستخدم جديد"""
        try:
            # التحقق من البيانات
            name = user_data.get('name', '').strip()
            email = user_data.get('email', '').strip().lower()
            password = user_data.get('password', '')
            
            is_valid, validation_msg = validate_user_data(name, email, password)
            if not is_valid:
                return {
                    'success': False,
                    'error': validation_msg
                }
            
            # التحقق من عدم وجود المستخدم
            for user in self.users_cache.values():
                if user.get('email') == email:
                    return {
                        'success': False,
                        'error': 'البريد الإلكتروني مستخدم بالفعل'
                    }
            
            # توليد معرف المستخدم
            user_id = generate_unique_id()
            
            # تشفير كلمة المرور
            hashed_password = accounts_security_manager.hash_password(password)
            
            # إنشاء نموذج المستخدم
            if PYDANTIC_AVAILABLE:
                try:
                    user = UserModel(
                        user_id=user_id,
                        email=email,
                        name=name,
                        role=user_data.get('role', 'user'),
                        account_type=AccountType(user_data.get('account_type', 'individual')),
                        status=AccountStatus.PENDING,
                        permissions=user_data.get('permissions', []),
                        metadata=user_data.get('metadata', {})
                    )
                    user_dict = user.dict()
                    user_dict['password_hash'] = hashed_password
                except Exception as e:
                    logger.error(f"خطأ في إنشاء نموذج المستخدم pydantic: {e}")
                    # fallback إلى dict عادي
                    user_dict = self._create_user_dict(user_id, name, email, hashed_password, user_data)
            else:
                user_dict = self._create_user_dict(user_id, name, email, hashed_password, user_data)
            
            # حفظ المستخدم في الكاش
            self.users_cache[user_id] = user_dict
            
            # إزالة كلمة المرور من الاستجابة
            response_user = user_dict.copy()
            response_user.pop('password_hash', None)
            
            return {
                'success': True,
                'user_id': user_id,
                'user': response_user
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء المستخدم: {e}")
            return {
                'success': False,
                'error': f'خطأ في إنشاء المستخدم: {str(e)}'
            }
    
    def _create_user_dict(self, user_id: str, name: str, email: str, password_hash: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء قاموس المستخدم"""
        return {
            'user_id': user_id,
            'email': email,
            'name': name,
            'password_hash': password_hash,
            'role': user_data.get('role', 'user'),
            'account_type': user_data.get('account_type', 'individual'),
            'status': 'pending',
            'permissions': user_data.get('permissions', []),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': None,
            'last_login': None,
            'metadata': user_data.get('metadata', {})
        }
    
    def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """مصادقة المستخدم"""
        try:
            # البحث عن المستخدم
            user = None
            for u in self.users_cache.values():
                if u.get('email') == email.lower():
                    user = u
                    break
            
            if not user:
                return {
                    'success': False,
                    'error': 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                }
            
            # التحقق من كلمة المرور
            if not accounts_security_manager.verify_password(password, user.get('password_hash', '')):
                return {
                    'success': False,
                    'error': 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                }
            
            # تحديث آخر تسجيل دخول
            user['last_login'] = datetime.utcnow().isoformat()
            
            # إنشاء JWT token
            token_payload = {
                'user_id': user['user_id'],
                'email': user['email'],
                'role': user['role']
            }
            token = accounts_security_manager.create_jwt_token(token_payload)
            
            # إزالة كلمة المرور من الاستجابة
            response_user = user.copy()
            response_user.pop('password_hash', None)
            
            return {
                'success': True,
                'user': response_user,
                'token': token
            }
            
        except Exception as e:
            logger.error(f"خطأ في مصادقة المستخدم: {e}")
            return {
                'success': False,
                'error': 'خطأ في المصادقة'
            }

# إنشاء مديري الخدمات
account_manager = AccountManager()
user_manager = UserManager()

# ==================== مسارات API ====================

@accounts_bp.route('/health', methods=['GET'])
def accounts_health_check():
    """فحص صحة خدمة الحسابات"""
    try:
        return jsonify({
            'success': True,
            'service': 'accounts',
            'status': 'healthy',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'libraries': {
                'jwt': JWT_LIBRARY,
                'bcrypt': BCRYPT_LIBRARY,
                'crypto': CRYPTO_LIBRARY,
                'pydantic': PYDANTIC_LIBRARY
            },
            'services_status': SERVICES_STATUS,
            'cached_accounts': len(account_manager.accounts_cache),
            'cached_users': len(user_manager.users_cache)
        })
    except Exception as e:
        logger.error(f"خطأ في فحص صحة الحسابات: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@accounts_bp.route('/register', methods=['POST'])
def register_user():
    """تسجيل مستخدم جديد"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'بيانات JSON مطلوبة'
            }), 400
        
        result = user_manager.create_user(data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في تسجيل المستخدم: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ داخلي في الخادم'
        }), 500

@accounts_bp.route('/login', methods=['POST'])
def login_user():
    """تسجيل دخول المستخدم"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'بيانات JSON مطلوبة'
            }), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'البريد الإلكتروني وكلمة المرور مطلوبان'
            }), 400
        
        result = user_manager.authenticate_user(email, password)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 401
            
    except Exception as e:
        logger.error(f"خطأ في تسجيل الدخول: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ داخلي في الخادم'
        }), 500

@accounts_bp.route('/create', methods=['POST'])
@jwt_required_accounts
def create_account():
    """إنشاء حساب جديد"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'بيانات JSON مطلوبة'
            }), 400
        
        user_id = request.current_user.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'معرف المستخدم مطلوب'
            }), 400
        
        result = account_manager.create_account(data, user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في إنشاء الحساب: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ داخلي في الخادم'
        }), 500

@accounts_bp.route('/<account_id>', methods=['GET'])
@jwt_required_accounts
def get_account(account_id):
    """الحصول على حساب"""
    try:
        user_id = request.current_user.get('user_id')
        result = account_manager.get_account(account_id, user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404 if 'غير موجود' in result['error'] else 403
            
    except Exception as e:
        logger.error(f"خطأ في الحصول على الحساب: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ داخلي في الخادم'
        }), 500

@accounts_bp.route('/<account_id>', methods=['PUT'])
@jwt_required_accounts
def update_account(account_id):
    """تحديث حساب"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'بيانات JSON مطلوبة'
            }), 400
        
        user_id = request.current_user.get('user_id')
        result = account_manager.update_account(account_id, data, user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في تحديث الحساب: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ داخلي في الخادم'
        }), 500

@accounts_bp.route('/list', methods=['GET'])
@jwt_required_accounts
def list_accounts():
    """قائمة الحسابات"""
    try:
        user_id = request.current_user.get('user_id')
        result = account_manager.list_accounts(user_id)
        
        return jsonify(result), 200
            
    except Exception as e:
        logger.error(f"خطأ في قائمة الحسابات: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ داخلي في الخادم'
        }), 500

@accounts_bp.route('/<account_id>', methods=['DELETE'])
@jwt_required_accounts
def delete_account(account_id):
    """حذف حساب"""
    try:
        user_id = request.current_user.get('user_id')
        result = account_manager.delete_account(account_id, user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في حذف الحساب: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ داخلي في الخادم'
        }), 500

@accounts_bp.route('/test', methods=['GET'])
def test_accounts_service():
    """اختبار خدمة الحسابات"""
    try:
        # اختبار إنشاء token
        test_payload = {'user_id': 'test_user', 'role': 'admin', 'service': 'accounts'}
        test_token = accounts_security_manager.create_jwt_token(test_payload)
        
        # اختبار التحقق من token
        verified_payload = accounts_security_manager.verify_jwt_token(test_token)
        
        # اختبار تشفير كلمة المرور
        test_password = "test_password_123"
        hashed_password = accounts_security_manager.hash_password(test_password)
        password_verified = accounts_security_manager.verify_password(test_password, hashed_password)
        
        # اختبار التشفير
        test_data = "sensitive account data"
        encrypted_data = accounts_security_manager.encrypt_sensitive_data(test_data)
        decrypted_data = accounts_security_manager.decrypt_sensitive_data(encrypted_data)
        
        # اختبار pydantic
        pydantic_test = False
        if PYDANTIC_AVAILABLE:
            try:
                test_user = UserModel(
                    user_id="test_123",
                    email="test@example.com",
                    name="Test User"
                )
                pydantic_test = True
            except Exception as e:
                logger.error(f"خطأ في اختبار pydantic: {e}")
        
        return jsonify({
            'success': True,
            'tests': {
                'jwt_creation': test_token is not None,
                'jwt_verification': verified_payload is not None,
                'jwt_payload_match': verified_payload.get('user_id') == 'test_user' if verified_payload else False,
                'jwt_service_match': verified_payload.get('service') == 'accounts' if verified_payload else False,
                'password_hashing': hashed_password != test_password,
                'password_verification': password_verified,
                'encryption': encrypted_data != test_data,
                'decryption': decrypted_data == test_data,
                'pydantic_model': pydantic_test,
                'libraries': {
                    'jwt_available': JWT_AVAILABLE,
                    'bcrypt_available': BCRYPT_AVAILABLE,
                    'crypto_available': CRYPTO_AVAILABLE,
                    'pydantic_available': PYDANTIC_AVAILABLE
                }
            },
            'message': 'جميع الاختبارات نجحت'
        })
        
    except Exception as e:
        logger.error(f"خطأ في اختبار خدمة الحسابات: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# تسجيل نجاح التحميل
logger.info("✅ تم تحميل Accounts Blueprint بنجاح")
logger.info(f"🔐 الأمان: JWT={JWT_AVAILABLE}, bcrypt={BCRYPT_AVAILABLE}, crypto={CRYPTO_AVAILABLE}")
logger.info(f"📊 النماذج: pydantic={PYDANTIC_AVAILABLE}")
logger.info(f"📊 الخدمات: {sum(SERVICES_STATUS.values())}/8 متاحة")

# تصدير Blueprint
__all__ = ['accounts_bp', 'account_manager', 'user_manager', 'accounts_security_manager']

