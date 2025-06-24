"""
Google Ads OAuth 2.0 API
نظام المصادقة المتطور لـ Google Ads

يوفر مسارات API شاملة للمصادقة مع Google Ads بما في ذلك:
- تدفق OAuth 2.0 الكامل والآمن مع PKCE
- إدارة رموز الوصول والتحديث المتقدمة
- التحقق من الصلاحيات والنطاقات
- إدارة جلسات المستخدمين المتطورة
- تجديد الرموز التلقائي والذكي
- نظام أمان متقدم ومراقبة شاملة
- دعم العمليات غير المتزامنة
- تشفير متقدم للبيانات الحساسة

Author: Google Ads AI Platform Team
Version: 2.1.0
Security Level: Enterprise
Performance: Optimized
"""

import os
import asyncio
import aiohttp
import hashlib
import hmac
import base64
import secrets
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple, Union, Callable
from dataclasses import dataclass, field, asdict
from enum import Enum, auto
from functools import wraps, lru_cache
from urllib.parse import urlencode, parse_qs, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from contextlib import asynccontextmanager

# Flask imports
from flask import Blueprint, request, jsonify, redirect, session, url_for, current_app
from flask_jwt_extended import (
    jwt_required, get_jwt_identity, create_access_token, 
    create_refresh_token, get_jwt, verify_jwt_in_request
)

# Third-party imports
import requests
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# Local imports
import logging

# إعداد التسجيل المتقدم
logger = logging.getLogger(__name__)

# إنشاء Blueprint مع إعدادات متقدمة
google_ads_oauth_bp = Blueprint(
    'google_ads_oauth', 
    __name__,
    url_prefix='/api/google-ads/oauth',
    static_folder=None,
    template_folder=None
)

# محاولة استيراد الخدمات المطلوبة مع معالجة أخطاء متقدمة
SERVICES_STATUS = {
    'google_ads_client': False,
    'oauth_handler': False,
    'validators': False,
    'helpers': False,
    'database': False,
    'redis': False,
    'supabase': False
}

try:
    from services.google_ads_client import GoogleAdsClient
    SERVICES_STATUS['google_ads_client'] = True
except ImportError as e:
    logger.warning(f"⚠️ GoogleAdsClient غير متاح: {e}")

try:
    from services.oauth_handler import OAuthHandler
    SERVICES_STATUS['oauth_handler'] = True
except ImportError as e:
    logger.warning(f"⚠️ OAuthHandler غير متاح: {e}")

try:
    from utils.validators import validate_oauth_config, validate_callback_data, validate_token_data
    SERVICES_STATUS['validators'] = True
except ImportError as e:
    logger.warning(f"⚠️ Validators غير متاح: {e}")

try:
    from utils.helpers import (
        generate_unique_id, sanitize_text, encrypt_token, decrypt_token,
        format_datetime, calculate_expiry_time, generate_secure_token
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
    from utils.redis_config import redis_config, cache_set, cache_get, cache_delete
    SERVICES_STATUS['redis'] = True
except ImportError as e:
    logger.warning(f"⚠️ Redis غير متاح: {e}")

try:
    from utils.supabase_config import supabase_config, db_insert, db_select, db_update
    SERVICES_STATUS['supabase'] = True
except ImportError as e:
    logger.warning(f"⚠️ Supabase غير متاح: {e}")

# تحديد حالة الخدمات
GOOGLE_ADS_OAUTH_SERVICES_AVAILABLE = any(SERVICES_STATUS.values())
logger.info(f"✅ تم تحميل خدمات Google Ads OAuth - الخدمات المتاحة: {sum(SERVICES_STATUS.values())}/7")

# إعداد Thread Pool للعمليات المتوازية
executor = ThreadPoolExecutor(max_workers=20, thread_name_prefix="oauth_worker")

class OAuthState(Enum):
    """حالات OAuth"""
    PENDING = auto()
    AUTHORIZED = auto()
    COMPLETED = auto()
    EXPIRED = auto()
    REVOKED = auto()
    ERROR = auto()

class TokenType(Enum):
    """أنواع الرموز"""
    ACCESS = "access_token"
    REFRESH = "refresh_token"
    ID = "id_token"

class SecurityLevel(Enum):
    """مستويات الأمان"""
    BASIC = "basic"
    STANDARD = "standard"
    ENHANCED = "enhanced"
    ENTERPRISE = "enterprise"

@dataclass
class OAuthConfig:
    """إعدادات OAuth المتقدمة"""
    client_id: str
    client_secret: str
    authorization_base_url: str = "https://accounts.google.com/o/oauth2/v2/auth"
    token_url: str = "https://oauth2.googleapis.com/token"
    revoke_url: str = "https://oauth2.googleapis.com/revoke"
    userinfo_url: str = "https://www.googleapis.com/oauth2/v2/userinfo"
    scope: List[str] = field(default_factory=lambda: [
        "https://www.googleapis.com/auth/adwords",
        "https://www.googleapis.com/auth/adwords.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ])
    redirect_uri: str = "http://localhost:5000/api/google-ads/oauth/callback"
    security_level: SecurityLevel = SecurityLevel.ENHANCED
    use_pkce: bool = True
    use_state: bool = True
    session_timeout: int = 600  # 10 دقائق
    token_refresh_threshold: int = 300  # 5 دقائق
    max_retry_attempts: int = 3
    rate_limit_per_minute: int = 60
    enable_logging: bool = True
    enable_metrics: bool = True

@dataclass
class OAuthSession:
    """جلسة OAuth متطورة"""
    session_id: str
    user_id: str
    state: str
    code_verifier: Optional[str] = None
    code_challenge: Optional[str] = None
    code_challenge_method: str = "S256"
    redirect_uri: str = ""
    scopes: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(minutes=10))
    last_activity: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    status: OAuthState = OAuthState.PENDING
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    security_level: SecurityLevel = SecurityLevel.STANDARD
    metadata: Dict[str, Any] = field(default_factory=dict)
    retry_count: int = 0
    error_message: Optional[str] = None

    def is_expired(self) -> bool:
        """فحص انتهاء صلاحية الجلسة"""
        return datetime.now(timezone.utc) > self.expires_at

    def is_active(self) -> bool:
        """فحص نشاط الجلسة"""
        return self.status in [OAuthState.PENDING, OAuthState.AUTHORIZED] and not self.is_expired()

    def update_activity(self):
        """تحديث آخر نشاط"""
        self.last_activity = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        data['expires_at'] = self.expires_at.isoformat()
        data['last_activity'] = self.last_activity.isoformat()
        data['status'] = self.status.name
        data['security_level'] = self.security_level.value
        return data

@dataclass
class AccessToken:
    """رمز الوصول المتطور"""
    token_id: str
    user_id: str
    access_token: str
    refresh_token: Optional[str] = None
    id_token: Optional[str] = None
    token_type: str = "Bearer"
    expires_in: int = 3600
    scope: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=1))
    last_refreshed: Optional[datetime] = None
    refresh_count: int = 0
    is_active: bool = True
    security_level: SecurityLevel = SecurityLevel.STANDARD
    metadata: Dict[str, Any] = field(default_factory=dict)
    usage_count: int = 0
    last_used: Optional[datetime] = None

    def is_expired(self) -> bool:
        """فحص انتهاء صلاحية الرمز"""
        return datetime.now(timezone.utc) > self.expires_at

    def needs_refresh(self, threshold_seconds: int = 300) -> bool:
        """فحص الحاجة لتجديد الرمز"""
        if not self.is_active or not self.refresh_token:
            return False
        time_until_expiry = (self.expires_at - datetime.now(timezone.utc)).total_seconds()
        return time_until_expiry <= threshold_seconds

    def update_usage(self):
        """تحديث إحصائيات الاستخدام"""
        self.usage_count += 1
        self.last_used = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        data['expires_at'] = self.expires_at.isoformat()
        data['last_refreshed'] = self.last_refreshed.isoformat() if self.last_refreshed else None
        data['last_used'] = self.last_used.isoformat() if self.last_used else None
        data['security_level'] = self.security_level.value
        return data

class SecurityManager:
    """مدير الأمان المتطور"""
    
    def __init__(self):
        """تهيئة مدير الأمان"""
        self.encryption_key = self._generate_encryption_key()
        self.fernet = Fernet(self.encryption_key)
        self.rate_limits: Dict[str, List[float]] = {}
        self.blocked_ips: set = set()
        self.suspicious_activities: Dict[str, int] = {}
    
    def _generate_encryption_key(self) -> bytes:
        """توليد مفتاح التشفير"""
        password = os.getenv('OAUTH_ENCRYPTION_PASSWORD', 'default_password').encode()
        salt = os.getenv('OAUTH_ENCRYPTION_SALT', 'default_salt').encode()
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return base64.urlsafe_b64encode(kdf.derive(password))
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """تشفير البيانات الحساسة"""
        try:
            return self.fernet.encrypt(data.encode()).decode()
        except Exception as e:
            logger.error(f"خطأ في تشفير البيانات: {e}")
            return data
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """فك تشفير البيانات الحساسة"""
        try:
            return self.fernet.decrypt(encrypted_data.encode()).decode()
        except Exception as e:
            logger.error(f"خطأ في فك تشفير البيانات: {e}")
            return encrypted_data
    
    def check_rate_limit(self, identifier: str, limit_per_minute: int = 60) -> bool:
        """فحص حد المعدل"""
        now = time.time()
        minute_ago = now - 60
        
        if identifier not in self.rate_limits:
            self.rate_limits[identifier] = []
        
        # تنظيف الطلبات القديمة
        self.rate_limits[identifier] = [
            timestamp for timestamp in self.rate_limits[identifier] 
            if timestamp > minute_ago
        ]
        
        # فحص الحد
        if len(self.rate_limits[identifier]) >= limit_per_minute:
            self._log_suspicious_activity(identifier, "rate_limit_exceeded")
            return False
        
        # إضافة الطلب الحالي
        self.rate_limits[identifier].append(now)
        return True
    
    def _log_suspicious_activity(self, identifier: str, activity_type: str):
        """تسجيل النشاط المشبوه"""
        if identifier not in self.suspicious_activities:
            self.suspicious_activities[identifier] = 0
        
        self.suspicious_activities[identifier] += 1
        
        # حظر IP إذا تجاوز الحد
        if self.suspicious_activities[identifier] > 10:
            self.blocked_ips.add(identifier)
            logger.warning(f"🚫 تم حظر IP: {identifier} بسبب النشاط المشبوه")
    
    def is_ip_blocked(self, ip_address: str) -> bool:
        """فحص حظر IP"""
        return ip_address in self.blocked_ips
    
    def generate_secure_state(self, length: int = 32) -> str:
        """توليد state آمن"""
        return secrets.token_urlsafe(length)
    
    def generate_pkce_pair(self) -> Tuple[str, str]:
        """توليد PKCE code verifier و challenge"""
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode('utf-8')).digest()
        ).decode('utf-8').rstrip('=')
        return code_verifier, code_challenge
    
    def validate_state(self, received_state: str, expected_state: str) -> bool:
        """التحقق من صحة state"""
        return hmac.compare_digest(received_state, expected_state)

class MetricsCollector:
    """جامع المقاييس"""
    
    def __init__(self):
        """تهيئة جامع المقاييس"""
        self.metrics = {
            'oauth_flows_initiated': 0,
            'oauth_flows_completed': 0,
            'oauth_flows_failed': 0,
            'tokens_issued': 0,
            'tokens_refreshed': 0,
            'tokens_revoked': 0,
            'security_violations': 0,
            'rate_limit_hits': 0,
            'average_flow_duration': 0.0,
            'last_reset': datetime.now(timezone.utc)
        }
        self.flow_durations: List[float] = []
    
    def record_oauth_initiated(self):
        """تسجيل بدء OAuth"""
        self.metrics['oauth_flows_initiated'] += 1
    
    def record_oauth_completed(self, duration: float):
        """تسجيل إكمال OAuth"""
        self.metrics['oauth_flows_completed'] += 1
        self.flow_durations.append(duration)
        self._update_average_duration()
    
    def record_oauth_failed(self):
        """تسجيل فشل OAuth"""
        self.metrics['oauth_flows_failed'] += 1
    
    def record_token_issued(self):
        """تسجيل إصدار رمز"""
        self.metrics['tokens_issued'] += 1
    
    def record_token_refreshed(self):
        """تسجيل تجديد رمز"""
        self.metrics['tokens_refreshed'] += 1
    
    def record_token_revoked(self):
        """تسجيل إلغاء رمز"""
        self.metrics['tokens_revoked'] += 1
    
    def record_security_violation(self):
        """تسجيل انتهاك أمني"""
        self.metrics['security_violations'] += 1
    
    def record_rate_limit_hit(self):
        """تسجيل ضرب حد المعدل"""
        self.metrics['rate_limit_hits'] += 1
    
    def _update_average_duration(self):
        """تحديث متوسط مدة التدفق"""
        if self.flow_durations:
            self.metrics['average_flow_duration'] = sum(self.flow_durations) / len(self.flow_durations)
    
    def get_metrics(self) -> Dict[str, Any]:
        """جلب المقاييس"""
        success_rate = 0
        if self.metrics['oauth_flows_initiated'] > 0:
            success_rate = (self.metrics['oauth_flows_completed'] / self.metrics['oauth_flows_initiated']) * 100
        
        return {
            **self.metrics,
            'success_rate': success_rate,
            'total_flows': self.metrics['oauth_flows_initiated'],
            'active_tokens': self.metrics['tokens_issued'] - self.metrics['tokens_revoked']
        }
    
    def reset_metrics(self):
        """إعادة تعيين المقاييس"""
        self.metrics = {key: 0 if isinstance(value, (int, float)) else datetime.now(timezone.utc) 
                       for key, value in self.metrics.items()}
        self.flow_durations.clear()

class GoogleAdsOAuthManager:
    """مدير OAuth لـ Google Ads المتطور والمحسن"""
    
    def __init__(self, config: Optional[OAuthConfig] = None):
        """تهيئة مدير OAuth"""
        self.config = config or self._load_default_config()
        self.security_manager = SecurityManager()
        self.metrics_collector = MetricsCollector()
        
        # تهيئة الخدمات
        self.google_ads_client = GoogleAdsClient() if SERVICES_STATUS['google_ads_client'] else None
        self.oauth_handler = OAuthHandler() if SERVICES_STATUS['oauth_handler'] else None
        self.db_manager = DatabaseManager() if SERVICES_STATUS['database'] else None
        
        # تخزين مؤقت للجلسات والرموز
        self.oauth_sessions: Dict[str, OAuthSession] = {}
        self.access_tokens: Dict[str, AccessToken] = {}
        
        # إعدادات التنظيف التلقائي
        self.cleanup_interval = 300  # 5 دقائق
        self.last_cleanup = datetime.now(timezone.utc)
        
        # بدء مهام الخلفية
        self._start_background_tasks()
        
        logger.info("🚀 تم تهيئة مدير Google Ads OAuth المتطور")
    
    def _load_default_config(self) -> OAuthConfig:
        """تحميل الإعدادات الافتراضية"""
        return OAuthConfig(
            client_id=os.getenv('GOOGLE_CLIENT_ID', ''),
            client_secret=os.getenv('GOOGLE_CLIENT_SECRET', ''),
            redirect_uri=os.getenv('OAUTH_REDIRECT_URI', 'http://localhost:5000/api/google-ads/oauth/callback'),
            security_level=SecurityLevel(os.getenv('OAUTH_SECURITY_LEVEL', 'enhanced'))
        )
    
    def _start_background_tasks(self):
        """بدء مهام الخلفية"""
        def cleanup_worker():
            while True:
                try:
                    asyncio.run(self._cleanup_expired_sessions())
                    time.sleep(self.cleanup_interval)
                except Exception as e:
                    logger.error(f"خطأ في مهمة التنظيف: {e}")
                    time.sleep(60)  # انتظار دقيقة قبل المحاولة مرة أخرى
        
        cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True, name="oauth_cleanup")
        cleanup_thread.start()
    
    async def _cleanup_expired_sessions(self):
        """تنظيف الجلسات المنتهية الصلاحية"""
        now = datetime.now(timezone.utc)
        
        # تنظيف الجلسات المنتهية
        expired_sessions = [
            session_id for session_id, session in self.oauth_sessions.items()
            if session.is_expired()
        ]
        
        for session_id in expired_sessions:
            del self.oauth_sessions[session_id]
            logger.debug(f"🧹 تم حذف الجلسة المنتهية: {session_id}")
        
        # تنظيف الرموز المنتهية
        expired_tokens = [
            token_id for token_id, token in self.access_tokens.items()
            if token.is_expired() and not token.refresh_token
        ]
        
        for token_id in expired_tokens:
            del self.access_tokens[token_id]
            logger.debug(f"🧹 تم حذف الرمز المنتهي: {token_id}")
        
        self.last_cleanup = now
        
        if expired_sessions or expired_tokens:
            logger.info(f"🧹 تنظيف تلقائي: {len(expired_sessions)} جلسة، {len(expired_tokens)} رمز")
    
    async def initiate_oauth_flow(self, user_id: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """بدء تدفق OAuth المتطور"""
        start_time = time.time()
        
        try:
            # تسجيل بدء التدفق
            self.metrics_collector.record_oauth_initiated()
            
            # فحص الأمان الأولي
            ip_address = request_data.get('ip_address', 'unknown')
            user_agent = request_data.get('user_agent', 'unknown')
            
            if self.security_manager.is_ip_blocked(ip_address):
                self.metrics_collector.record_security_violation()
                return {'success': False, 'error': 'IP محظور بسبب النشاط المشبوه'}
            
            if not self.security_manager.check_rate_limit(ip_address, self.config.rate_limit_per_minute):
                self.metrics_collector.record_rate_limit_hit()
                return {'success': False, 'error': 'تم تجاوز حد المعدل المسموح'}
            
            # التحقق من صحة البيانات
            if SERVICES_STATUS['validators']:
                validation_result = validate_oauth_config(self.config.__dict__)
                if not validation_result.get('valid', True):
                    return {'success': False, 'error': 'إعدادات OAuth غير صحيحة', 'details': validation_result.get('errors')}
            
            # إنشاء معرف جلسة فريد
            session_id = generate_unique_id('oauth_session') if SERVICES_STATUS['helpers'] else f"session_{int(time.time())}"
            
            # إنشاء state للأمان
            state = self.security_manager.generate_secure_state()
            
            # إنشاء PKCE إذا كان مفعلاً
            code_verifier, code_challenge = None, None
            if self.config.use_pkce:
                code_verifier, code_challenge = self.security_manager.generate_pkce_pair()
            
            # إنشاء جلسة OAuth
            oauth_session = OAuthSession(
                session_id=session_id,
                user_id=user_id,
                state=state,
                code_verifier=code_verifier,
                code_challenge=code_challenge,
                redirect_uri=self.config.redirect_uri,
                scopes=self.config.scope,
                ip_address=ip_address,
                user_agent=user_agent,
                security_level=self.config.security_level,
                metadata=request_data.get('metadata', {})
            )
            
            # حفظ الجلسة
            self.oauth_sessions[session_id] = oauth_session
            
            # حفظ في Redis إذا كان متاحاً
            if SERVICES_STATUS['redis']:
                cache_set(f"oauth_session:{session_id}", oauth_session.to_dict(), 600)
            
            # حفظ في قاعدة البيانات إذا كانت متاحة
            if self.db_manager:
                await self._save_oauth_session_to_database(oauth_session)
            
            # بناء URL التفويض
            auth_params = {
                'client_id': self.config.client_id,
                'redirect_uri': self.config.redirect_uri,
                'scope': ' '.join(self.config.scope),
                'response_type': 'code',
                'access_type': 'offline',
                'prompt': 'consent'
            }
            
            if self.config.use_state:
                auth_params['state'] = state
            
            if self.config.use_pkce and code_challenge:
                auth_params['code_challenge'] = code_challenge
                auth_params['code_challenge_method'] = 'S256'
            
            authorization_url = f"{self.config.authorization_base_url}?{urlencode(auth_params)}"
            
            # تسجيل النشاط
            await self._log_oauth_activity(user_id, 'oauth_initiated', {
                'session_id': session_id,
                'scopes': self.config.scope,
                'security_level': self.config.security_level.value,
                'ip_address': ip_address
            })
            
            return {
                'success': True,
                'oauth_session': {
                    'session_id': session_id,
                    'authorization_url': authorization_url,
                    'state': state,
                    'expires_at': oauth_session.expires_at.isoformat(),
                    'security_level': self.config.security_level.value
                },
                'message': 'تم بدء تدفق OAuth بنجاح',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            self.metrics_collector.record_oauth_failed()
            logger.error(f"خطأ في بدء تدفق OAuth: {e}")
            return {'success': False, 'error': f'خطأ في بدء تدفق OAuth: {str(e)}'}
    
    async def handle_oauth_callback(self, callback_data: Dict[str, Any]) -> Dict[str, Any]:
        """معالجة callback من Google المتطورة"""
        try:
            # التحقق من صحة بيانات callback
            if SERVICES_STATUS['validators']:
                validation_result = validate_callback_data(callback_data)
                if not validation_result.get('valid', True):
                    self.metrics_collector.record_oauth_failed()
                    return {'success': False, 'error': 'بيانات callback غير صحيحة', 'details': validation_result.get('errors')}
            
            # استخراج البيانات
            code = callback_data.get('code')
            state = callback_data.get('state')
            error = callback_data.get('error')
            
            # التحقق من وجود خطأ
            if error:
                self.metrics_collector.record_oauth_failed()
                return {'success': False, 'error': f'خطأ في التفويض: {error}'}
            
            # البحث عن الجلسة
            oauth_session = await self._find_session_by_state(state)
            if not oauth_session:
                self.metrics_collector.record_oauth_failed()
                return {'success': False, 'error': 'جلسة OAuth غير صحيحة أو منتهية الصلاحية'}
            
            # التحقق من صحة state
            if self.config.use_state and not self.security_manager.validate_state(state, oauth_session.state):
                self.metrics_collector.record_security_violation()
                return {'success': False, 'error': 'state غير صحيح - محاولة أمنية مشبوهة'}
            
            # تبديل الكود برمز الوصول
            token_result = await self._exchange_code_for_tokens(code, oauth_session)
            if not token_result['success']:
                self.metrics_collector.record_oauth_failed()
                return token_result
            
            # إنشاء رمز الوصول
            access_token = AccessToken(
                token_id=generate_unique_id('access_token') if SERVICES_STATUS['helpers'] else f"token_{int(time.time())}",
                user_id=oauth_session.user_id,
                access_token=self.security_manager.encrypt_sensitive_data(token_result['access_token']),
                refresh_token=self.security_manager.encrypt_sensitive_data(token_result.get('refresh_token', '')),
                id_token=self.security_manager.encrypt_sensitive_data(token_result.get('id_token', '')),
                token_type=token_result.get('token_type', 'Bearer'),
                expires_in=token_result.get('expires_in', 3600),
                scope=token_result.get('scope', ''),
                security_level=oauth_session.security_level,
                metadata={
                    'ip_address': oauth_session.ip_address,
                    'user_agent': oauth_session.user_agent,
                    'session_id': oauth_session.session_id
                }
            )
            
            # حفظ رمز الوصول
            self.access_tokens[access_token.token_id] = access_token
            self.metrics_collector.record_token_issued()
            
            # حفظ في Redis إذا كان متاحاً
            if SERVICES_STATUS['redis']:
                cache_set(f"access_token:{access_token.token_id}", access_token.to_dict(), access_token.expires_in)
            
            # حفظ في قاعدة البيانات
            if self.db_manager:
                await self._save_access_token_to_database(access_token)
            
            # تنظيف الجلسة
            oauth_session.status = OAuthState.COMPLETED
            if oauth_session.session_id in self.oauth_sessions:
                del self.oauth_sessions[oauth_session.session_id]
            
            # إنشاء JWT token للمستخدم
            jwt_token = create_access_token(
                identity=oauth_session.user_id,
                additional_claims={
                    'google_ads_token_id': access_token.token_id,
                    'scopes': oauth_session.scopes,
                    'security_level': oauth_session.security_level.value
                }
            )
            
            # تسجيل النشاط
            await self._log_oauth_activity(oauth_session.user_id, 'oauth_completed', {
                'token_id': access_token.token_id,
                'scopes': oauth_session.scopes,
                'security_level': oauth_session.security_level.value
            })
            
            # تسجيل إكمال التدفق
            flow_duration = (datetime.now(timezone.utc) - oauth_session.created_at).total_seconds()
            self.metrics_collector.record_oauth_completed(flow_duration)
            
            return {
                'success': True,
                'authentication': {
                    'token_id': access_token.token_id,
                    'jwt_token': jwt_token,
                    'expires_at': access_token.expires_at.isoformat(),
                    'scopes': oauth_session.scopes,
                    'security_level': oauth_session.security_level.value
                },
                'message': 'تم إكمال المصادقة بنجاح',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            self.metrics_collector.record_oauth_failed()
            logger.error(f"خطأ في معالجة OAuth callback: {e}")
            return {'success': False, 'error': f'خطأ في معالجة OAuth callback: {str(e)}'}
    
    async def _find_session_by_state(self, state: str) -> Optional[OAuthSession]:
        """البحث عن الجلسة بواسطة state"""
        # البحث في الذاكرة
        for session in self.oauth_sessions.values():
            if session.state == state and session.is_active():
                return session
        
        # البحث في Redis إذا كان متاحاً
        if SERVICES_STATUS['redis']:
            # يمكن تحسين هذا بحفظ mapping من state إلى session_id
            pass
        
        return None
    
    async def _exchange_code_for_tokens(self, code: str, oauth_session: OAuthSession) -> Dict[str, Any]:
        """تبديل الكود برموز الوصول"""
        try:
            token_data = {
                'client_id': self.config.client_id,
                'client_secret': self.config.client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': oauth_session.redirect_uri
            }
            
            # إضافة PKCE إذا كان متاحاً
            if oauth_session.code_verifier:
                token_data['code_verifier'] = oauth_session.code_verifier
            
            # إرسال الطلب
            async with aiohttp.ClientSession() as session:
                async with session.post(self.config.token_url, data=token_data) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {'success': True, **result}
                    else:
                        error_text = await response.text()
                        logger.error(f"خطأ في تبديل الكود: {response.status} - {error_text}")
                        return {'success': False, 'error': f'فشل تبديل الكود: {response.status}'}
        
        except Exception as e:
            logger.error(f"خطأ في تبديل الكود: {e}")
            return {'success': False, 'error': str(e)}
    
    async def refresh_access_token(self, token_id: str, user_id: str) -> Dict[str, Any]:
        """تجديد رمز الوصول المتطور"""
        try:
            # البحث عن رمز الوصول
            access_token = await self._get_access_token(token_id)
            if not access_token:
                return {'success': False, 'error': 'رمز الوصول غير موجود'}
            
            # التحقق من الصلاحيات
            if access_token.user_id != user_id:
                self.metrics_collector.record_security_violation()
                return {'success': False, 'error': 'ليس لديك صلاحية لتجديد هذا الرمز'}
            
            # التحقق من الحاجة للتجديد
            if not access_token.needs_refresh(self.config.token_refresh_threshold):
                time_until_expiry = (access_token.expires_at - datetime.now(timezone.utc)).total_seconds()
                return {
                    'success': True,
                    'message': 'الرمز لا يحتاج تجديد حالياً',
                    'expires_in': int(time_until_expiry)
                }
            
            # تجديد الرمز
            refresh_result = await self._refresh_token_with_google(access_token)
            if not refresh_result['success']:
                return refresh_result
            
            # تحديث بيانات الرمز
            access_token.access_token = self.security_manager.encrypt_sensitive_data(refresh_result['access_token'])
            access_token.expires_in = refresh_result.get('expires_in', 3600)
            access_token.expires_at = datetime.now(timezone.utc) + timedelta(seconds=access_token.expires_in)
            access_token.last_refreshed = datetime.now(timezone.utc)
            access_token.refresh_count += 1
            
            # تحديث refresh token إذا تم إرساله
            if refresh_result.get('refresh_token'):
                access_token.refresh_token = self.security_manager.encrypt_sensitive_data(refresh_result['refresh_token'])
            
            # حفظ التحديثات
            self.access_tokens[token_id] = access_token
            self.metrics_collector.record_token_refreshed()
            
            # تحديث في Redis
            if SERVICES_STATUS['redis']:
                cache_set(f"access_token:{token_id}", access_token.to_dict(), access_token.expires_in)
            
            # تحديث في قاعدة البيانات
            if self.db_manager:
                await self._update_access_token_in_database(access_token)
            
            # تسجيل النشاط
            await self._log_oauth_activity(user_id, 'token_refreshed', {
                'token_id': token_id,
                'refresh_count': access_token.refresh_count,
                'new_expires_at': access_token.expires_at.isoformat()
            })
            
            return {
                'success': True,
                'token': {
                    'token_id': token_id,
                    'expires_at': access_token.expires_at.isoformat(),
                    'expires_in': access_token.expires_in,
                    'refresh_count': access_token.refresh_count
                },
                'message': 'تم تجديد رمز الوصول بنجاح',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في تجديد رمز الوصول: {e}")
            return {'success': False, 'error': f'خطأ في تجديد رمز الوصول: {str(e)}'}
    
    async def _get_access_token(self, token_id: str) -> Optional[AccessToken]:
        """جلب رمز الوصول من مصادر متعددة"""
        # البحث في الذاكرة
        if token_id in self.access_tokens:
            return self.access_tokens[token_id]
        
        # البحث في Redis
        if SERVICES_STATUS['redis']:
            cached_token = cache_get(f"access_token:{token_id}")
            if cached_token:
                # تحويل من dict إلى AccessToken
                return self._dict_to_access_token(cached_token)
        
        # البحث في قاعدة البيانات
        if self.db_manager:
            return await self._get_access_token_from_database(token_id)
        
        return None
    
    def _dict_to_access_token(self, data: Dict[str, Any]) -> AccessToken:
        """تحويل dict إلى AccessToken"""
        # تحويل التواريخ من string إلى datetime
        for date_field in ['created_at', 'expires_at', 'last_refreshed', 'last_used']:
            if data.get(date_field):
                data[date_field] = datetime.fromisoformat(data[date_field].replace('Z', '+00:00'))
        
        # تحويل security_level من string إلى enum
        if 'security_level' in data:
            data['security_level'] = SecurityLevel(data['security_level'])
        
        return AccessToken(**data)
    
    async def _refresh_token_with_google(self, access_token: AccessToken) -> Dict[str, Any]:
        """تجديد الرمز مع Google"""
        try:
            refresh_token = self.security_manager.decrypt_sensitive_data(access_token.refresh_token)
            
            token_data = {
                'client_id': self.config.client_id,
                'client_secret': self.config.client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.config.token_url, data=token_data) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {'success': True, **result}
                    else:
                        error_text = await response.text()
                        logger.error(f"خطأ في تجديد الرمز: {response.status} - {error_text}")
                        return {'success': False, 'error': f'فشل تجديد الرمز: {response.status}'}
        
        except Exception as e:
            logger.error(f"خطأ في تجديد الرمز مع Google: {e}")
            return {'success': False, 'error': str(e)}
    
    async def revoke_access_token(self, token_id: str, user_id: str) -> Dict[str, Any]:
        """إلغاء رمز الوصول المتطور"""
        try:
            # البحث عن رمز الوصول
            access_token = await self._get_access_token(token_id)
            if not access_token:
                return {'success': False, 'error': 'رمز الوصول غير موجود'}
            
            # التحقق من الصلاحيات
            if access_token.user_id != user_id:
                self.metrics_collector.record_security_violation()
                return {'success': False, 'error': 'ليس لديك صلاحية لإلغاء هذا الرمز'}
            
            # إلغاء الرمز مع Google
            revoke_result = await self._revoke_token_with_google(access_token)
            if not revoke_result['success']:
                logger.warning(f"فشل إلغاء الرمز مع Google: {revoke_result['error']}")
            
            # تعطيل الرمز محلياً
            access_token.is_active = False
            self.metrics_collector.record_token_revoked()
            
            # إزالة من التخزين المؤقت
            if token_id in self.access_tokens:
                del self.access_tokens[token_id]
            
            # إزالة من Redis
            if SERVICES_STATUS['redis']:
                cache_delete(f"access_token:{token_id}")
            
            # تحديث في قاعدة البيانات
            if self.db_manager:
                await self._update_access_token_in_database(access_token)
            
            # تسجيل النشاط
            await self._log_oauth_activity(user_id, 'token_revoked', {
                'token_id': token_id,
                'revoke_reason': 'user_request'
            })
            
            return {
                'success': True,
                'message': 'تم إلغاء رمز الوصول بنجاح',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في إلغاء رمز الوصول: {e}")
            return {'success': False, 'error': f'خطأ في إلغاء رمز الوصول: {str(e)}'}
    
    async def _revoke_token_with_google(self, access_token: AccessToken) -> Dict[str, Any]:
        """إلغاء الرمز مع Google"""
        try:
            token = self.security_manager.decrypt_sensitive_data(access_token.access_token)
            
            revoke_data = {'token': token}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.config.revoke_url, data=revoke_data) as response:
                    if response.status == 200:
                        return {'success': True}
                    else:
                        error_text = await response.text()
                        logger.error(f"خطأ في إلغاء الرمز: {response.status} - {error_text}")
                        return {'success': False, 'error': f'فشل إلغاء الرمز: {response.status}'}
        
        except Exception as e:
            logger.error(f"خطأ في إلغاء الرمز مع Google: {e}")
            return {'success': False, 'error': str(e)}
    
    async def get_user_tokens(self, user_id: str) -> Dict[str, Any]:
        """جلب رموز المستخدم المتطور"""
        try:
            user_tokens = []
            
            # البحث في الذاكرة
            for token in self.access_tokens.values():
                if token.user_id == user_id and token.is_active:
                    user_tokens.append({
                        'token_id': token.token_id,
                        'created_at': token.created_at.isoformat(),
                        'expires_at': token.expires_at.isoformat(),
                        'last_used': token.last_used.isoformat() if token.last_used else None,
                        'usage_count': token.usage_count,
                        'refresh_count': token.refresh_count,
                        'scope': token.scope,
                        'security_level': token.security_level.value,
                        'is_expired': token.is_expired(),
                        'needs_refresh': token.needs_refresh(self.config.token_refresh_threshold)
                    })
            
            # البحث في قاعدة البيانات للرموز الإضافية
            if self.db_manager:
                db_tokens = await self._get_user_tokens_from_database(user_id)
                # دمج النتائج وإزالة المكررات
                existing_ids = {token['token_id'] for token in user_tokens}
                for db_token in db_tokens:
                    if db_token['token_id'] not in existing_ids:
                        user_tokens.append(db_token)
            
            return {
                'success': True,
                'user_id': user_id,
                'tokens': user_tokens,
                'total_tokens': len(user_tokens),
                'active_tokens': len([t for t in user_tokens if not t['is_expired']]),
                'expired_tokens': len([t for t in user_tokens if t['is_expired']]),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في جلب رموز المستخدم: {e}")
            return {'success': False, 'error': f'خطأ في جلب رموز المستخدم: {str(e)}'}
    
    async def get_oauth_sessions(self, user_id: str) -> Dict[str, Any]:
        """جلب جلسات OAuth للمستخدم"""
        try:
            user_sessions = []
            
            for session in self.oauth_sessions.values():
                if session.user_id == user_id:
                    user_sessions.append({
                        'session_id': session.session_id,
                        'created_at': session.created_at.isoformat(),
                        'expires_at': session.expires_at.isoformat(),
                        'last_activity': session.last_activity.isoformat(),
                        'status': session.status.name,
                        'scopes': session.scopes,
                        'security_level': session.security_level.value,
                        'ip_address': session.ip_address,
                        'is_expired': session.is_expired(),
                        'is_active': session.is_active()
                    })
            
            return {
                'success': True,
                'user_id': user_id,
                'sessions': user_sessions,
                'total_sessions': len(user_sessions),
                'active_sessions': len([s for s in user_sessions if s['is_active']]),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في جلب جلسات OAuth: {e}")
            return {'success': False, 'error': f'خطأ في جلب جلسات OAuth: {str(e)}'}
    
    def get_metrics(self) -> Dict[str, Any]:
        """جلب مقاييس الأداء"""
        return {
            'oauth_metrics': self.metrics_collector.get_metrics(),
            'security_metrics': {
                'blocked_ips': len(self.security_manager.blocked_ips),
                'suspicious_activities': len(self.security_manager.suspicious_activities),
                'rate_limits_active': len(self.security_manager.rate_limits)
            },
            'system_metrics': {
                'active_sessions': len(self.oauth_sessions),
                'active_tokens': len(self.access_tokens),
                'last_cleanup': self.last_cleanup.isoformat(),
                'services_status': SERVICES_STATUS
            },
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    
    async def _log_oauth_activity(self, user_id: str, activity_type: str, details: Dict[str, Any]):
        """تسجيل نشاط OAuth"""
        try:
            activity_log = {
                'user_id': user_id,
                'activity_type': activity_type,
                'details': details,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'ip_address': details.get('ip_address', 'unknown')
            }
            
            # تسجيل في الـ logger
            logger.info(f"OAuth Activity: {activity_type} for user {user_id}")
            
            # حفظ في قاعدة البيانات إذا كانت متاحة
            if SERVICES_STATUS['supabase']:
                db_insert('oauth_activity_logs', activity_log)
            
        except Exception as e:
            logger.error(f"خطأ في تسجيل نشاط OAuth: {e}")
    
    # دوال قاعدة البيانات (يمكن تنفيذها حسب نوع قاعدة البيانات المستخدمة)
    async def _save_oauth_session_to_database(self, oauth_session: OAuthSession):
        """حفظ جلسة OAuth في قاعدة البيانات"""
        if SERVICES_STATUS['supabase']:
            try:
                db_insert('oauth_sessions', oauth_session.to_dict())
            except Exception as e:
                logger.error(f"خطأ في حفظ جلسة OAuth: {e}")
    
    async def _save_access_token_to_database(self, access_token: AccessToken):
        """حفظ رمز الوصول في قاعدة البيانات"""
        if SERVICES_STATUS['supabase']:
            try:
                db_insert('access_tokens', access_token.to_dict())
            except Exception as e:
                logger.error(f"خطأ في حفظ رمز الوصول: {e}")
    
    async def _update_access_token_in_database(self, access_token: AccessToken):
        """تحديث رمز الوصول في قاعدة البيانات"""
        if SERVICES_STATUS['supabase']:
            try:
                db_update('access_tokens', access_token.to_dict(), {'token_id': access_token.token_id})
            except Exception as e:
                logger.error(f"خطأ في تحديث رمز الوصول: {e}")
    
    async def _get_access_token_from_database(self, token_id: str) -> Optional[AccessToken]:
        """جلب رمز الوصول من قاعدة البيانات"""
        if SERVICES_STATUS['supabase']:
            try:
                result = db_select('access_tokens', filters={'token_id': token_id}, limit=1)
                if result['success'] and result['data']:
                    return self._dict_to_access_token(result['data'][0])
            except Exception as e:
                logger.error(f"خطأ في جلب رمز الوصول من قاعدة البيانات: {e}")
        return None
    
    async def _get_user_tokens_from_database(self, user_id: str) -> List[Dict[str, Any]]:
        """جلب رموز المستخدم من قاعدة البيانات"""
        if SERVICES_STATUS['supabase']:
            try:
                result = db_select('access_tokens', filters={'user_id': user_id, 'is_active': True})
                if result['success']:
                    return result['data']
            except Exception as e:
                logger.error(f"خطأ في جلب رموز المستخدم من قاعدة البيانات: {e}")
        return []

# إنشاء مثيل مدير OAuth
oauth_manager = GoogleAdsOAuthManager()

# ===========================================
# API Routes - المسارات المتطورة
# ===========================================

@google_ads_oauth_bp.route('/initiate', methods=['POST'])
@jwt_required()
def initiate_oauth():
    """بدء تدفق OAuth"""
    try:
        user_id = get_jwt_identity()
        request_data = request.get_json() or {}
        
        # إضافة معلومات الطلب
        request_data.update({
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', 'unknown')
        })
        
        # تشغيل العملية غير المتزامنة
        result = asyncio.run(oauth_manager.initiate_oauth_flow(user_id, request_data))
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"خطأ في API بدء OAuth: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في بدء تدفق OAuth',
            'message': str(e)
        }), 500

@google_ads_oauth_bp.route('/callback', methods=['GET'])
def oauth_callback():
    """معالجة callback من Google"""
    try:
        # استخراج بيانات callback
        callback_data = {
            'code': request.args.get('code'),
            'state': request.args.get('state'),
            'error': request.args.get('error'),
            'error_description': request.args.get('error_description')
        }
        
        # معالجة callback
        result = asyncio.run(oauth_manager.handle_oauth_callback(callback_data))
        
        if result['success']:
            # إعادة توجيه للصفحة الرئيسية مع الرمز
            return redirect(f"/?token={result['authentication']['jwt_token']}")
        else:
            return jsonify(result), 400
        
    except Exception as e:
        logger.error(f"خطأ في API callback: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في معالجة OAuth callback',
            'message': str(e)
        }), 500

@google_ads_oauth_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    """تجديد رمز الوصول"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        token_id = data.get('token_id')
        
        if not token_id:
            return jsonify({
                'success': False,
                'error': 'معرف الرمز مطلوب'
            }), 400
        
        result = asyncio.run(oauth_manager.refresh_access_token(token_id, user_id))
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"خطأ في API تجديد الرمز: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في تجديد رمز الوصول',
            'message': str(e)
        }), 500

@google_ads_oauth_bp.route('/revoke', methods=['POST'])
@jwt_required()
def revoke_token():
    """إلغاء رمز الوصول"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        token_id = data.get('token_id')
        
        if not token_id:
            return jsonify({
                'success': False,
                'error': 'معرف الرمز مطلوب'
            }), 400
        
        result = asyncio.run(oauth_manager.revoke_access_token(token_id, user_id))
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"خطأ في API إلغاء الرمز: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في إلغاء رمز الوصول',
            'message': str(e)
        }), 500

@google_ads_oauth_bp.route('/tokens', methods=['GET'])
@jwt_required()
def get_user_tokens():
    """الحصول على رموز المستخدم"""
    try:
        user_id = get_jwt_identity()
        
        result = asyncio.run(oauth_manager.get_user_tokens(user_id))
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"خطأ في API جلب الرموز: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على رموز المستخدم',
            'message': str(e)
        }), 500

@google_ads_oauth_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_oauth_sessions():
    """الحصول على جلسات OAuth النشطة"""
    try:
        user_id = get_jwt_identity()
        
        result = asyncio.run(oauth_manager.get_oauth_sessions(user_id))
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"خطأ في API جلب الجلسات: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على جلسات OAuth',
            'message': str(e)
        }), 500

@google_ads_oauth_bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_oauth_metrics():
    """الحصول على مقاييس OAuth"""
    try:
        # التحقق من صلاحيات الإدارة (يمكن تخصيصها)
        claims = get_jwt()
        if not claims.get('is_admin', False):
            return jsonify({
                'success': False,
                'error': 'صلاحيات إدارية مطلوبة'
            }), 403
        
        metrics = oauth_manager.get_metrics()
        
        return jsonify({
            'success': True,
            'metrics': metrics,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في API المقاييس: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على المقاييس',
            'message': str(e)
        }), 500

@google_ads_oauth_bp.route('/health', methods=['GET'])
def health_check():
    """فحص صحة خدمة OAuth"""
    try:
        health_status = {
            'service': 'Google Ads OAuth',
            'status': 'healthy',
            'version': '2.1.0',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'services_status': SERVICES_STATUS,
            'active_sessions': len(oauth_manager.oauth_sessions),
            'active_tokens': len(oauth_manager.access_tokens),
            'last_cleanup': oauth_manager.last_cleanup.isoformat()
        }
        
        # فحص الخدمات الأساسية
        if not any(SERVICES_STATUS.values()):
            health_status['status'] = 'degraded'
            health_status['warning'] = 'بعض الخدمات غير متاحة'
        
        return jsonify(health_status)
        
    except Exception as e:
        logger.error(f"خطأ في فحص الصحة: {e}")
        return jsonify({
            'service': 'Google Ads OAuth',
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

# تسجيل معلومات Blueprint
logger.info(f"✅ تم تحميل Google Ads OAuth Blueprint - الخدمات متاحة: {GOOGLE_ADS_OAUTH_SERVICES_AVAILABLE}")
logger.info(f"📊 حالة الخدمات: {sum(SERVICES_STATUS.values())}/7 متاحة")

# تصدير Blueprint والكلاسات
__all__ = [
    'google_ads_oauth_bp',
    'GoogleAdsOAuthManager',
    'OAuthConfig',
    'OAuthSession',
    'AccessToken',
    'SecurityManager',
    'MetricsCollector',
    'OAuthState',
    'TokenType',
    'SecurityLevel'
]

