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
- إدارة الحسابات الإعلانية وربطها بـ MCC
- تحليل جودة الحسابات واختيار الأفضل

Author: Google Ads AI Platform Team
Version: 3.1.0
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
    'supabase': False,
    'google_ads_helpers': False,
    'google_ads_database': False
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

try:
    from utils.google_ads_api import GoogleAdsApiManager
    SERVICES_STATUS['google_ads_api'] = True
except ImportError as e:
    logger.warning(f"⚠️ GoogleAdsApiManager غير متاح: {e}")

try:
    from utils.google_ads_helpers import (
        GoogleAdsAccountAnalyzer, GoogleAdsMCCManager, 
        GoogleAdsDataFormatter, GoogleAdsAccountSelector
    )
    SERVICES_STATUS['google_ads_helpers'] = True
except ImportError as e:
    logger.warning(f"⚠️ Google Ads Helpers غير متاح: {e}")

try:
    from utils.google_ads_database import GoogleAdsDatabaseManager, google_ads_db
    SERVICES_STATUS['google_ads_database'] = True
except ImportError as e:
    logger.warning(f"⚠️ Google Ads Database غير متاح: {e}")

# تحديد حالة الخدمات
GOOGLE_ADS_OAUTH_SERVICES_AVAILABLE = any(SERVICES_STATUS.values())
logger.info(f"✅ تم تحميل خدمات Google Ads OAuth - الخدمات المتاحة: {sum(SERVICES_STATUS.values())}/9")

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
    redirect_uri: str = "http://localhost:3000/api/auth/callback/google"
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
            'accounts_linked': 0,
            'mcc_links_attempted': 0,
            'mcc_links_successful': 0,
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
    
    def record_account_linked(self):
        """تسجيل ربط حساب"""
        self.metrics['accounts_linked'] += 1
    
    def record_mcc_link_attempt(self):
        """تسجيل محاولة ربط MCC"""
        self.metrics['mcc_links_attempted'] += 1
    
    def record_mcc_link_success(self):
        """تسجيل نجاح ربط MCC"""
        self.metrics['mcc_links_successful'] += 1
    
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
        
        mcc_success_rate = 0
        if self.metrics['mcc_links_attempted'] > 0:
            mcc_success_rate = (self.metrics['mcc_links_successful'] / self.metrics['mcc_links_attempted']) * 100
        
        return {
            **self.metrics,
            'success_rate': success_rate,
            'mcc_success_rate': mcc_success_rate,
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
        self.google_ads_client = GoogleAdsClient() if SERVICES_STATUS.get('google_ads_client') else None
        self.oauth_handler = OAuthHandler() if SERVICES_STATUS.get('oauth_handler') else None
        self.db_manager = DatabaseManager() if SERVICES_STATUS.get('database') else None
        self.google_ads_api_manager = GoogleAdsApiManager() if SERVICES_STATUS.get('google_ads_api') else None
        self.google_ads_db = google_ads_db if SERVICES_STATUS.get('google_ads_database') else None
        
        # تخزين مؤقت للجلسات والرموز
        self.oauth_sessions: Dict[str, OAuthSession] = {}
        self.access_tokens: Dict[str, AccessToken] = {}
        
        # إعدادات التنظيف التلقائي
        self.cleanup_thread = threading.Thread(target=self._cleanup_sessions_and_tokens, daemon=True)
        self.cleanup_thread.start()
        
        logger.info("✅ تم تهيئة GoogleAdsOAuthManager")

    def _load_default_config(self) -> OAuthConfig:
        """تحميل الإعدادات الافتراضية من متغيرات البيئة"""
        return OAuthConfig(
            client_id=os.getenv("GOOGLE_CLIENT_ID", ""),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET", ""),
            redirect_uri=os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/callback/google"),
            security_level=SecurityLevel(os.getenv("OAUTH_SECURITY_LEVEL", "enhanced"))
        )
    
    def _cleanup_sessions_and_tokens(self):
        """تنظيف الجلسات والرموز المنتهية الصلاحية"""
        while True:
            try:
                current_time = datetime.now(timezone.utc)
                
                # تنظيف الجلسات المنتهية الصلاحية
                expired_sessions = [
                    session_id for session_id, session in self.oauth_sessions.items()
                    if session.is_expired()
                ]
                
                for session_id in expired_sessions:
                    del self.oauth_sessions[session_id]
                    logger.debug(f"تم حذف جلسة منتهية الصلاحية: {session_id}")
                
                # تنظيف الرموز المنتهية الصلاحية
                expired_tokens = [
                    token_id for token_id, token in self.access_tokens.items()
                    if token.is_expired()
                ]
                
                for token_id in expired_tokens:
                    del self.access_tokens[token_id]
                    logger.debug(f"تم حذف رمز منتهي الصلاحية: {token_id}")
                
                # النوم لمدة 5 دقائق قبل التنظيف التالي
                time.sleep(300)
                
            except Exception as e:
                logger.error(f"خطأ في تنظيف الجلسات والرموز: {e}")
                time.sleep(60)  # النوم لمدة دقيقة في حالة الخطأ

    async def create_authorization_url_async(
        self, 
        user_id: str, 
        ip_address: str = None, 
        user_agent: str = None
    ) -> Dict[str, Any]:
        """إنشاء رابط التفويض بشكل غير متزامن"""
        try:
            # فحص حد المعدل
            if not self.security_manager.check_rate_limit(ip_address or user_id):
                self.metrics_collector.record_rate_limit_hit()
                return {
                    "success": False,
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": "تم تجاوز حد المعدل المسموح"
                }
            
            # فحص حظر IP
            if ip_address and self.security_manager.is_ip_blocked(ip_address):
                return {
                    "success": False,
                    "error": "IP_BLOCKED",
                    "message": "عنوان IP محظور"
                }
            
            # توليد معرف جلسة فريد
            session_id = generate_unique_id() if SERVICES_STATUS.get('helpers') else secrets.token_urlsafe(32)
            
            # توليد state آمن
            state = self.security_manager.generate_secure_state()
            
            # توليد PKCE إذا كان مفعلاً
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
                security_level=self.config.security_level
            )
            
            # حفظ الجلسة
            self.oauth_sessions[session_id] = oauth_session
            
            # بناء معاملات URL
            auth_params = {
                "client_id": self.config.client_id,
                "redirect_uri": self.config.redirect_uri,
                "scope": " ".join(self.config.scope),
                "response_type": "code",
                "state": state,
                "access_type": "offline",
                "prompt": "consent",
                "include_granted_scopes": "true"
            }
            
            # إضافة PKCE إذا كان مفعلاً
            if self.config.use_pkce and code_challenge:
                auth_params.update({
                    "code_challenge": code_challenge,
                    "code_challenge_method": "S256"
                })
            
            # بناء URL
            authorization_url = f"{self.config.authorization_base_url}?{urlencode(auth_params)}"
            
            # تسجيل المقاييس
            self.metrics_collector.record_oauth_initiated()
            
            logger.info(f"تم إنشاء رابط تفويض للمستخدم {user_id}")
            
            return {
                "success": True,
                "authorization_url": authorization_url,
                "session_id": session_id,
                "state": state,
                "expires_at": oauth_session.expires_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء رابط التفويض: {e}")
            self.metrics_collector.record_oauth_failed()
            return {
                "success": False,
                "error": "AUTHORIZATION_URL_CREATION_FAILED",
                "message": str(e)
            }

    async def exchange_code_for_token_async(
        self, 
        session_id: str, 
        authorization_code: str, 
        state: str
    ) -> Dict[str, Any]:
        """تبديل كود التفويض برمز الوصول بشكل غير متزامن"""
        try:
            # التحقق من وجود الجلسة
            if session_id not in self.oauth_sessions:
                return {
                    "success": False,
                    "error": "SESSION_NOT_FOUND",
                    "message": "جلسة OAuth غير موجودة"
                }
            
            oauth_session = self.oauth_sessions[session_id]
            
            # التحقق من صلاحية الجلسة
            if not oauth_session.is_active():
                return {
                    "success": False,
                    "error": "SESSION_EXPIRED",
                    "message": "جلسة OAuth منتهية الصلاحية"
                }
            
            # التحقق من state
            if not self.security_manager.validate_state(state, oauth_session.state):
                return {
                    "success": False,
                    "error": "INVALID_STATE",
                    "message": "معامل state غير صحيح"
                }
            
            # إعداد بيانات الطلب
            token_data = {
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
                "code": authorization_code,
                "grant_type": "authorization_code",
                "redirect_uri": oauth_session.redirect_uri
            }
            
            # إضافة PKCE إذا كان متاحاً
            if oauth_session.code_verifier:
                token_data["code_verifier"] = oauth_session.code_verifier
            
            # إرسال طلب تبديل الرمز
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.config.token_url,
                    data=token_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                ) as response:
                    
                    if response.status != 200:
                        error_data = await response.json()
                        return {
                            "success": False,
                            "error": "TOKEN_EXCHANGE_FAILED",
                            "message": error_data.get("error_description", "فشل في تبديل الرمز")
                        }
                    
                    token_response = await response.json()
            
            # استخراج معلومات الرمز
            access_token = token_response.get("access_token")
            refresh_token = token_response.get("refresh_token")
            expires_in = token_response.get("expires_in", 3600)
            token_type = token_response.get("token_type", "Bearer")
            scope = token_response.get("scope", "")
            
            # جلب معلومات المستخدم
            user_info = await self._fetch_user_info_async(access_token)
            
            # إنشاء كائن رمز الوصول
            token_id = generate_unique_id() if SERVICES_STATUS.get('helpers') else secrets.token_urlsafe(32)
            access_token_obj = AccessToken(
                token_id=token_id,
                user_id=oauth_session.user_id,
                access_token=access_token,
                refresh_token=refresh_token,
                token_type=token_type,
                expires_in=expires_in,
                scope=scope,
                expires_at=datetime.now(timezone.utc) + timedelta(seconds=expires_in),
                security_level=oauth_session.security_level,
                metadata={
                    "session_id": session_id,
                    "user_info": user_info,
                    "oauth_flow_completed_at": datetime.now(timezone.utc).isoformat()
                }
            )
            
            # حفظ الرمز
            self.access_tokens[token_id] = access_token_obj
            
            # تحديث حالة الجلسة
            oauth_session.status = OAuthState.COMPLETED
            oauth_session.update_activity()
            
            # تسجيل المقاييس
            flow_duration = (datetime.now(timezone.utc) - oauth_session.created_at).total_seconds()
            self.metrics_collector.record_oauth_completed(flow_duration)
            
            logger.info(f"تم تبديل الرمز بنجاح للمستخدم {oauth_session.user_id}")
            
            return {
                "success": True,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": token_type,
                "expires_in": expires_in,
                "scope": scope,
                "user_info": user_info,
                "token_id": token_id
            }
            
        except Exception as e:
            logger.error(f"خطأ في تبديل الرمز: {e}")
            self.metrics_collector.record_oauth_failed()
            return {
                "success": False,
                "error": "TOKEN_EXCHANGE_ERROR",
                "message": str(e)
            }

    async def _fetch_user_info_async(self, access_token: str) -> Dict[str, Any]:
        """جلب معلومات المستخدم بشكل غير متزامن"""
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.config.userinfo_url, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.warning(f"فشل في جلب معلومات المستخدم: {response.status}")
                        return {}
                        
        except Exception as e:
            logger.error(f"خطأ في جلب معلومات المستخدم: {e}")
            return {}

    async def refresh_token_async(self, token_id: str) -> Dict[str, Any]:
        """تجديد رمز الوصول بشكل غير متزامن"""
        try:
            if token_id not in self.access_tokens:
                return {
                    "success": False,
                    "error": "TOKEN_NOT_FOUND",
                    "message": "رمز الوصول غير موجود"
                }
            
            token_obj = self.access_tokens[token_id]
            
            if not token_obj.refresh_token:
                return {
                    "success": False,
                    "error": "NO_REFRESH_TOKEN",
                    "message": "رمز التجديد غير متاح"
                }
            
            # إعداد بيانات طلب التجديد
            refresh_data = {
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
                "refresh_token": token_obj.refresh_token,
                "grant_type": "refresh_token"
            }
            
            # إرسال طلب التجديد
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.config.token_url,
                    data=refresh_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                ) as response:
                    
                    if response.status != 200:
                        error_data = await response.json()
                        return {
                            "success": False,
                            "error": "TOKEN_REFRESH_FAILED",
                            "message": error_data.get("error_description", "فشل في تجديد الرمز")
                        }
                    
                    refresh_response = await response.json()
            
            # تحديث معلومات الرمز
            new_access_token = refresh_response.get("access_token")
            new_refresh_token = refresh_response.get("refresh_token", token_obj.refresh_token)
            expires_in = refresh_response.get("expires_in", 3600)
            
            token_obj.access_token = new_access_token
            token_obj.refresh_token = new_refresh_token
            token_obj.expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
            token_obj.last_refreshed = datetime.now(timezone.utc)
            token_obj.refresh_count += 1
            
            # تسجيل المقاييس
            self.metrics_collector.metrics['tokens_refreshed'] += 1
            
            logger.info(f"تم تجديد الرمز بنجاح: {token_id}")
            
            return {
                "success": True,
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
                "expires_in": expires_in,
                "token_type": token_obj.token_type
            }
            
        except Exception as e:
            logger.error(f"خطأ في تجديد الرمز: {e}")
            return {
                "success": False,
                "error": "TOKEN_REFRESH_ERROR",
                "message": str(e)
            }

    async def revoke_token_async(self, token_id: str) -> Dict[str, Any]:
        """إلغاء رمز الوصول بشكل غير متزامن"""
        try:
            if token_id not in self.access_tokens:
                return {
                    "success": False,
                    "error": "TOKEN_NOT_FOUND",
                    "message": "رمز الوصول غير موجود"
                }
            
            token_obj = self.access_tokens[token_id]
            
            # إلغاء الرمز من Google
            revoke_data = {"token": token_obj.access_token}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.config.revoke_url,
                    data=revoke_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                ) as response:
                    
                    # Google يرجع 200 حتى لو كان الرمز غير صالح
                    if response.status not in [200, 400]:
                        logger.warning(f"استجابة غير متوقعة من Google عند إلغاء الرمز: {response.status}")
            
            # إزالة الرمز من التخزين المحلي
            token_obj.is_active = False
            del self.access_tokens[token_id]
            
            # تسجيل المقاييس
            self.metrics_collector.metrics['tokens_revoked'] += 1
            
            logger.info(f"تم إلغاء الرمز بنجاح: {token_id}")
            
            return {
                "success": True,
                "message": "تم إلغاء الرمز بنجاح"
            }
            
        except Exception as e:
            logger.error(f"خطأ في إلغاء الرمز: {e}")
            return {
                "success": False,
                "error": "TOKEN_REVOCATION_ERROR",
                "message": str(e)
            }

# إنشاء مثيل مشترك من مدير OAuth
oauth_manager = GoogleAdsOAuthManager()

# ==================== ديكوريترز ====================

def login_required(f):
    """ديكوريتر للتحقق من تسجيل الدخول"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({
                "success": False,
                "message": "يجب تسجيل الدخول أولاً",
                "error_code": "AUTHENTICATION_REQUIRED"
            }), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """ديكوريتر للتحقق من صلاحيات الإدارة"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({
                "success": False,
                "message": "يجب تسجيل الدخول أولاً",
                "error_code": "AUTHENTICATION_REQUIRED"
            }), 401
        
        user_role = session.get("user_role", "user")
        if user_role != "admin":
            return jsonify({
                "success": False,
                "message": "غير مصرح لك بالوصول لهذا المورد",
                "error_code": "INSUFFICIENT_PERMISSIONS"
            }), 403
        
        return f(*args, **kwargs)
    return decorated_function

def rate_limit_check(f):
    """ديكوريتر لفحص حد المعدل"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip_address = request.remote_addr
        
        if not oauth_manager.security_manager.check_rate_limit(ip_address):
            oauth_manager.metrics_collector.record_rate_limit_hit()
            return jsonify({
                "success": False,
                "message": "تم تجاوز حد المعدل المسموح",
                "error_code": "RATE_LIMIT_EXCEEDED"
            }), 429
        
        return f(*args, **kwargs)
    return decorated_function

# ==================== مسارات API ====================

@google_ads_oauth_bp.route("/health", methods=["GET"])
def health_check():
    """فحص صحة خدمة Google Ads OAuth"""
    try:
        return jsonify({
            "success": True,
            "service": "Google Ads OAuth API",
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "3.1.0",
            "components": SERVICES_STATUS,
            "metrics": oauth_manager.metrics_collector.get_metrics(),
            "message": "خدمة Google Ads OAuth تعمل بنجاح"
        })
    except Exception as e:
        logger.error(f"خطأ في فحص صحة Google Ads OAuth API: {str(e)}")
        return jsonify({
            "success": False,
            "service": "Google Ads OAuth API",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@google_ads_oauth_bp.route("/initiate", methods=["POST"])
@login_required
@rate_limit_check
def initiate_oauth():
    """بدء تدفق OAuth لـ Google Ads"""
    try:
        user_id = session.get("user_id")
        ip_address = request.remote_addr
        user_agent = request.headers.get("User-Agent", "")

        # استخدام الطريقة غير المتزامنة
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            auth_result = loop.run_until_complete(
                oauth_manager.create_authorization_url_async(user_id, ip_address, user_agent)
            )
        finally:
            loop.close()

        if auth_result.get("success"):
            # حفظ معرف الجلسة في session
            session["oauth_session_id"] = auth_result["session_id"]
            
            logger.info(f"تم بدء OAuth للمستخدم {user_id}")
            
            return jsonify({
                "success": True,
                "authorization_url": auth_result["authorization_url"],
                "session_id": auth_result["session_id"],
                "expires_at": auth_result["expires_at"],
                "message": "تم إنشاء رابط التفويض بنجاح"
            })
        else:
            return jsonify({
                "success": False,
                "message": auth_result.get("message", "فشل في إنشاء رابط التفويض"),
                "error_code": auth_result.get("error", "AUTHORIZATION_URL_FAILED")
            }), 500

    except Exception as e:
        logger.error(f"خطأ في بدء OAuth: {str(e)}")
        oauth_manager.metrics_collector.record_oauth_failed()
        return jsonify({
            "success": False,
            "message": "حدث خطأ في بدء عملية المصادقة",
            "error_code": "OAUTH_INITIATION_ERROR"
        }), 500

@google_ads_oauth_bp.route("/callback", methods=["GET"])
def oauth_callback():
    """معالجة رد الاتصال من Google OAuth"""
    try:
        # الحصول على المعاملات من URL
        code = request.args.get("code")
        state = request.args.get("state")
        error = request.args.get("error")

        # التحقق من وجود خطأ
        if error:
            logger.error(f"خطأ في OAuth callback: {error}")
            oauth_manager.metrics_collector.record_oauth_failed()
            return redirect(f"{os.getenv('FRONTEND_DASHBOARD_URL', '/dashboard')}?oauth_error={error}")

        # التحقق من وجود الكود والحالة
        if not code or not state:
            oauth_manager.metrics_collector.record_oauth_failed()
            return jsonify({
                "success": False,
                "message": "كود التفويض أو الحالة مفقودة",
                "error_code": "MISSING_CALLBACK_PARAMS"
            }), 400

        # التحقق من معرف الجلسة
        session_id = session.get("oauth_session_id")
        if not session_id:
            oauth_manager.metrics_collector.record_oauth_failed()
            return jsonify({
                "success": False,
                "message": "معرف جلسة OAuth مفقود",
                "error_code": "OAUTH_SESSION_MISSING"
            }), 400

        # تبديل الكود برمز الوصول
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            exchange_result = loop.run_until_complete(
                oauth_manager.exchange_code_for_token_async(session_id, code, state)
            )
        finally:
            loop.close()

        if not exchange_result.get("success"):
            oauth_manager.metrics_collector.record_oauth_failed()
            return jsonify({
                "success": False,
                "message": exchange_result.get("message", "فشل في تبديل الكود"),
                "error_code": "TOKEN_EXCHANGE_FAILED"
            }), 400

        # الحصول على معلومات الرمز والمستخدم
        user_id = session.get("user_id")
        access_token = exchange_result.get("access_token")
        refresh_token = exchange_result.get("refresh_token")
        user_info = exchange_result.get("user_info", {})

        # ==================================================================
        # الخطوة 1: جلب حسابات Google Ads المتاحة
        # ==================================================================
        ads_accounts_result = get_google_ads_accounts(access_token, refresh_token, user_id)
        
        if not ads_accounts_result.get("success"):
            logger.warning(f"فشل في جلب حسابات Google Ads للمستخدم {user_id}: {ads_accounts_result.get('message')}")
            return redirect(f"{os.getenv('FRONTEND_DASHBOARD_URL', '/dashboard')}?oauth_success=true&no_ads_accounts=true")

        customer_accounts = ads_accounts_result.get("accounts", [])
        
        if not customer_accounts:
            logger.info(f"المستخدم {user_id} ليس لديه حسابات Google Ads")
            return redirect(f"{os.getenv('FRONTEND_DASHBOARD_URL', '/dashboard')}?oauth_success=true&no_ads_accounts=true")

        # ==================================================================
        # الخطوة 2: اختيار وربط الحساب الإعلاني الرئيسي
        # ==================================================================
        primary_account_result = select_primary_ads_account(customer_accounts, user_id)
        
        if not primary_account_result.get("success"):
            logger.error(f"فشل في اختيار الحساب الإعلاني الرئيسي: {primary_account_result.get('message')}")
            return redirect(f"{os.getenv('FRONTEND_DASHBOARD_URL', '/dashboard')}?oauth_error=account_selection_failed")

        primary_account = primary_account_result.get("account")

        # ==================================================================
        # الخطوة 3: ربط الحساب بـ MCC (إذا كان مطلوباً)
        # ==================================================================
        mcc_link_result = link_account_to_mcc(primary_account, user_id)
        
        if mcc_link_result.get("success") and mcc_link_result.get("linked"):
            oauth_manager.metrics_collector.record_mcc_link_success()
        elif mcc_link_result.get("linked") is not None:
            oauth_manager.metrics_collector.record_mcc_link_attempt()

        # ==================================================================
        # الخطوة 4: حفظ معلومات الحساب في قاعدة البيانات
        # ==================================================================
        save_result = save_ads_account_to_database(
            user_id=user_id,
            account_info=primary_account,
            access_token=access_token,
            refresh_token=refresh_token,
            user_info=user_info,
            all_accounts=customer_accounts
        )

        if not save_result.get("success"):
            logger.error(f"فشل في حفظ معلومات الحساب: {save_result.get('message')}")
            return redirect(f"{os.getenv('FRONTEND_DASHBOARD_URL', '/dashboard')}?oauth_error=database_save_failed")

        # تسجيل نجاح ربط الحساب
        oauth_manager.metrics_collector.record_account_linked()

        # ==================================================================
        # الخطوة 5: إعادة التوجيه إلى لوحة التحكم مع رسالة نجاح
        # ==================================================================
        logger.info(f"تم ربط حساب Google Ads بنجاح للمستخدم {user_id}")
        
        # تنظيف معرف جلسة OAuth
        session.pop("oauth_session_id", None)
        
        # إعادة التوجيه مع معلومات النجاح
        redirect_url = (
            f"{os.getenv('FRONTEND_DASHBOARD_URL', '/dashboard')}"
            f"?oauth_success=true"
            f"&account_id={primary_account.get('customer_id', '')}"
            f"&account_name={primary_account.get('descriptive_name', '')}"
        )
        
        return redirect(redirect_url)

    except Exception as e:
        logger.error(f"خطأ في معالجة OAuth callback: {str(e)}")
        oauth_manager.metrics_collector.record_oauth_failed()
        return redirect(f"{os.getenv('FRONTEND_DASHBOARD_URL', '/dashboard')}?oauth_error=callback_processing_failed")

def get_google_ads_accounts(access_token: str, refresh_token: str, user_id: str) -> Dict[str, Any]:
    """جلب حسابات Google Ads المتاحة للمستخدم"""
    try:
        if not oauth_manager.google_ads_api_manager:
            return {
                "success": False,
                "message": "Google Ads API Manager غير متاح",
                "accounts": []
            }

        # إنشاء عميل Google Ads API
        google_ads_client = oauth_manager.google_ads_api_manager.get_client(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user_id
        )

        if not google_ads_client:
            return {
                "success": False,
                "message": "فشل في إنشاء عميل Google Ads API",
                "accounts": []
            }

        # جلب قائمة الحسابات المتاحة
        customer_accounts = oauth_manager.google_ads_api_manager.list_accessible_customers(google_ads_client)

        if not customer_accounts:
            return {
                "success": True,
                "message": "لا توجد حسابات Google Ads متاحة",
                "accounts": []
            }

        # تحسين معلومات الحسابات
        enhanced_accounts = []
        for account in customer_accounts:
            try:
                # جلب معلومات إضافية عن الحساب
                account_details = oauth_manager.google_ads_api_manager.get_customer_details(
                    google_ads_client, 
                    account.get('customer_id', '')
                )
                
                enhanced_account = {
                    "customer_id": account.get('customer_id', ''),
                    "descriptive_name": account.get('descriptive_name', ''),
                    "currency_code": account_details.get('currency_code', 'USD'),
                    "time_zone": account_details.get('time_zone', 'UTC'),
                    "manager": account.get('manager', False),
                    "test_account": account.get('test_account', False),
                    "auto_tagging_enabled": account_details.get('auto_tagging_enabled', False),
                    "conversion_tracking_id": account_details.get('conversion_tracking_id', ''),
                    "remarketing_setting": account_details.get('remarketing_setting', {}),
                    "status": account_details.get('status', 'UNKNOWN'),
                    "account_type": "MCC" if account.get('manager', False) else "STANDARD"
                }
                
                enhanced_accounts.append(enhanced_account)
                
            except Exception as e:
                logger.warning(f"فشل في جلب تفاصيل الحساب {account.get('customer_id', '')}: {str(e)}")
                # إضافة الحساب بالمعلومات الأساسية فقط
                enhanced_accounts.append({
                    "customer_id": account.get('customer_id', ''),
                    "descriptive_name": account.get('descriptive_name', ''),
                    "manager": account.get('manager', False),
                    "test_account": account.get('test_account', False),
                    "account_type": "MCC" if account.get('manager', False) else "STANDARD",
                    "status": "UNKNOWN"
                })

        logger.info(f"تم جلب {len(enhanced_accounts)} حساب Google Ads للمستخدم {user_id}")
        
        return {
            "success": True,
            "message": f"تم جلب {len(enhanced_accounts)} حساب بنجاح",
            "accounts": enhanced_accounts
        }

    except Exception as e:
        logger.error(f"خطأ في جلب حسابات Google Ads: {str(e)}")
        return {
            "success": False,
            "message": f"خطأ في جلب الحسابات: {str(e)}",
            "accounts": []
        }

def select_primary_ads_account(customer_accounts: List[Dict], user_id: str) -> Dict[str, Any]:
    """اختيار الحساب الإعلاني الرئيسي باستخدام منطق متقدم"""
    try:
        if not customer_accounts:
            return {
                "success": False,
                "message": "لا توجد حسابات متاحة للاختيار",
                "account": None
            }

        # استخدام Google Ads Account Selector إذا كان متاحاً
        if SERVICES_STATUS.get('google_ads_helpers'):
            try:
                best_account = GoogleAdsAccountSelector.select_best_primary_account(customer_accounts)
                if best_account:
                    best_account['selected_at'] = datetime.utcnow().isoformat()
                    best_account['selected_by'] = user_id
                    best_account['is_primary'] = True
                    
                    logger.info(f"تم اختيار الحساب الرئيسي {best_account.get('customer_id')} للمستخدم {user_id} باستخدام المحلل المتقدم")
                    
                    return {
                        "success": True,
                        "message": "تم اختيار الحساب الرئيسي بنجاح باستخدام التحليل المتقدم",
                        "account": best_account
                    }
            except Exception as e:
                logger.warning(f"فشل في استخدام المحلل المتقدم، التبديل للمنطق الأساسي: {str(e)}")

        # منطق اختيار الحساب الرئيسي الأساسي
        # 1. البحث عن حساب غير إداري (MCC) وغير تجريبي
        standard_accounts = [
            account for account in customer_accounts 
            if not account.get('manager', False) and not account.get('test_account', False)
        ]

        # 2. إذا لم توجد حسابات عادية، البحث عن حسابات غير تجريبية
        if not standard_accounts:
            standard_accounts = [
                account for account in customer_accounts 
                if not account.get('test_account', False)
            ]

        # 3. إذا لم توجد، استخدام أي حساب متاح
        if not standard_accounts:
            standard_accounts = customer_accounts

        # 4. اختيار الحساب الأول (يمكن تحسين هذا المنطق لاحقاً)
        primary_account = standard_accounts[0]

        # 5. إضافة معلومات إضافية
        primary_account['selected_at'] = datetime.utcnow().isoformat()
        primary_account['selected_by'] = user_id
        primary_account['is_primary'] = True

        logger.info(f"تم اختيار الحساب الرئيسي {primary_account.get('customer_id')} للمستخدم {user_id}")

        return {
            "success": True,
            "message": "تم اختيار الحساب الرئيسي بنجاح",
            "account": primary_account
        }

    except Exception as e:
        logger.error(f"خطأ في اختيار الحساب الرئيسي: {str(e)}")
        return {
            "success": False,
            "message": f"خطأ في اختيار الحساب: {str(e)}",
            "account": None
        }

def link_account_to_mcc(account_info: Dict, user_id: str) -> Dict[str, Any]:
    """ربط الحساب الإعلاني بـ MCC (إذا كان مطلوباً)"""
    try:
        # تسجيل محاولة ربط MCC
        oauth_manager.metrics_collector.record_mcc_link_attempt()
        
        # التحقق من إعدادات MCC باستخدام المساعد المتقدم
        if SERVICES_STATUS.get('google_ads_helpers'):
            try:
                mcc_validation = GoogleAdsMCCManager.validate_mcc_configuration()
                if not mcc_validation.get("valid"):
                    logger.info(f"إعدادات MCC غير صحيحة: {mcc_validation.get('issues')}")
                    return {
                        "success": True,
                        "message": "إعدادات MCC غير مكونة أو غير صحيحة",
                        "linked": False,
                        "issues": mcc_validation.get('issues', [])
                    }
                
                # التحقق من إمكانية ربط الحساب
                can_link_result = GoogleAdsMCCManager.can_link_to_mcc(account_info)
                if not can_link_result.get("can_link"):
                    logger.info(f"لا يمكن ربط الحساب بـ MCC: {can_link_result.get('reasons')}")
                    return {
                        "success": True,
                        "message": "لا يمكن ربط الحساب بـ MCC",
                        "linked": False,
                        "reasons": can_link_result.get('reasons', [])
                    }
                
                mcc_customer_id = mcc_validation.get("mcc_customer_id")
                
            except Exception as e:
                logger.warning(f"فشل في استخدام مساعد MCC المتقدم: {str(e)}")
                # التبديل للمنطق الأساسي
                mcc_customer_id = os.getenv('GOOGLE_ADS_MCC_CUSTOMER_ID')
                
                if not mcc_customer_id:
                    logger.info("لا يوجد MCC مكون، تخطي عملية الربط")
                    return {
                        "success": True,
                        "message": "لا يوجد MCC مكون",
                        "linked": False
                    }
        else:
            # المنطق الأساسي للتحقق من MCC
            mcc_customer_id = os.getenv('GOOGLE_ADS_MCC_CUSTOMER_ID')
            
            if not mcc_customer_id:
                logger.info("لا يوجد MCC مكون، تخطي عملية الربط")
                return {
                    "success": True,
                    "message": "لا يوجد MCC مكون",
                    "linked": False
                }

            # التحقق من أن الحساب ليس MCC بالفعل
            if account_info.get('manager', False):
                logger.info(f"الحساب {account_info.get('customer_id')} هو MCC بالفعل")
                return {
                    "success": True,
                    "message": "الحساب هو MCC بالفعل",
                    "linked": False
                }

        # التحقق من توفر Google Ads API Manager
        if not oauth_manager.google_ads_api_manager:
            logger.warning("Google Ads API Manager غير متاح لربط MCC")
            return {
                "success": False,
                "message": "خدمة Google Ads API غير متاحة",
                "linked": False
            }

        # محاولة ربط الحساب بـ MCC
        try:
            link_result = oauth_manager.google_ads_api_manager.link_customer_to_mcc(
                mcc_customer_id=mcc_customer_id,
                customer_id=account_info.get('customer_id'),
                user_id=user_id
            )

            if link_result.get('success'):
                logger.info(f"تم ربط الحساب {account_info.get('customer_id')} بـ MCC {mcc_customer_id}")
                return {
                    "success": True,
                    "message": "تم ربط الحساب بـ MCC بنجاح",
                    "linked": True,
                    "mcc_customer_id": mcc_customer_id
                }
            else:
                logger.warning(f"فشل في ربط الحساب بـ MCC: {link_result.get('message')}")
                return {
                    "success": False,
                    "message": link_result.get('message', 'فشل في ربط MCC'),
                    "linked": False
                }

        except Exception as link_error:
            logger.warning(f"خطأ في ربط MCC: {str(link_error)}")
            return {
                "success": False,
                "message": f"خطأ في ربط MCC: {str(link_error)}",
                "linked": False
            }

    except Exception as e:
        logger.error(f"خطأ في عملية ربط MCC: {str(e)}")
        return {
            "success": False,
            "message": f"خطأ في ربط MCC: {str(e)}",
            "linked": False
        }

def save_ads_account_to_database(
    user_id: str,
    account_info: Dict,
    access_token: str,
    refresh_token: str,
    user_info: Dict,
    all_accounts: List[Dict]
) -> Dict[str, Any]:
    """حفظ معلومات حساب Google Ads في قاعدة البيانات"""
    try:
        # استخدام قاعدة بيانات Google Ads المتخصصة إذا كانت متاحة
        db_to_use = oauth_manager.google_ads_db if oauth_manager.google_ads_db else oauth_manager.db_manager
        
        if not db_to_use:
            logger.error("لا توجد خدمة قاعدة بيانات متاحة")
            return {
                "success": False,
                "message": "خدمة قاعدة البيانات غير متاحة"
            }

        # إعداد بيانات الحساب الرئيسي
        account_data = {
            "id": generate_unique_id() if SERVICES_STATUS.get('helpers') else secrets.token_urlsafe(32),
            "user_id": user_id,
            "customer_id": account_info.get('customer_id', ''),
            "descriptive_name": sanitize_text(account_info.get('descriptive_name', '')) if SERVICES_STATUS.get('helpers') else account_info.get('descriptive_name', ''),
            "currency_code": account_info.get('currency_code', 'USD'),
            "time_zone": account_info.get('time_zone', 'UTC'),
            "manager": account_info.get('manager', False),
            "test_account": account_info.get('test_account', False),
            "auto_tagging_enabled": account_info.get('auto_tagging_enabled', False),
            "conversion_tracking_id": account_info.get('conversion_tracking_id', ''),
            "status": account_info.get('status', 'ACTIVE'),
            "account_type": account_info.get('account_type', 'STANDARD'),
            "is_primary": True,
            "linked_at": datetime.utcnow().isoformat(),
            "last_sync": datetime.utcnow().isoformat(),
            "metadata": {
                "remarketing_setting": account_info.get('remarketing_setting', {}),
                "selected_at": account_info.get('selected_at'),
                "oauth_completed_at": datetime.utcnow().isoformat(),
                "selection_reason": account_info.get('selection_reason', ''),
                "quality_analysis": account_info.get('quality_analysis', {})
            }
        }

        # حفظ الحساب الرئيسي
        save_account_result = db_to_use.save_google_ads_account(account_data)
        
        if not save_account_result:
            return {
                "success": False,
                "message": "فشل في حفظ معلومات الحساب الرئيسي"
            }

        # إعداد بيانات رمز الوصول
        token_data = {
            "id": generate_unique_id() if SERVICES_STATUS.get('helpers') else secrets.token_urlsafe(32),
            "user_id": user_id,
            "customer_id": account_info.get('customer_id', ''),
            "access_token": oauth_manager.security_manager.encrypt_sensitive_data(access_token),
            "refresh_token": oauth_manager.security_manager.encrypt_sensitive_data(refresh_token) if refresh_token else None,
            "token_type": "Bearer",
            "scope": "https://www.googleapis.com/auth/adwords",
            "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            "created_at": datetime.utcnow().isoformat(),
            "last_refreshed": datetime.utcnow().isoformat(),
            "is_active": True,
            "metadata": {
                "user_info": user_info,
                "oauth_flow_completed": True,
                "security_level": oauth_manager.config.security_level.value
            }
        }

        # حفظ رمز الوصول
        save_token_result = db_to_use.save_oauth_token(token_data)
        
        if not save_token_result:
            logger.warning("فشل في حفظ رمز الوصول، لكن تم حفظ الحساب")

        # حفظ جميع الحسابات المتاحة (للمرجع) مع تحليل الجودة
        try:
            for account in all_accounts:
                if account.get('customer_id') != account_info.get('customer_id'):
                    # تحليل جودة الحساب إذا كان المساعد متاحاً
                    quality_analysis = {}
                    if SERVICES_STATUS.get('google_ads_helpers'):
                        try:
                            quality_analysis = GoogleAdsAccountAnalyzer.analyze_account_quality(account)
                        except Exception as e:
                            logger.warning(f"فشل في تحليل جودة الحساب {account.get('customer_id')}: {str(e)}")
                    
                    additional_account_data = {
                        "id": generate_unique_id() if SERVICES_STATUS.get('helpers') else secrets.token_urlsafe(32),
                        "user_id": user_id,
                        "customer_id": account.get('customer_id', ''),
                        "descriptive_name": sanitize_text(account.get('descriptive_name', '')) if SERVICES_STATUS.get('helpers') else account.get('descriptive_name', ''),
                        "currency_code": account.get('currency_code', 'USD'),
                        "time_zone": account.get('time_zone', 'UTC'),
                        "manager": account.get('manager', False),
                        "test_account": account.get('test_account', False),
                        "status": account.get('status', 'AVAILABLE'),
                        "account_type": account.get('account_type', 'STANDARD'),
                        "is_primary": False,
                        "linked_at": datetime.utcnow().isoformat(),
                        "last_sync": datetime.utcnow().isoformat(),
                        "metadata": {
                            "available_for_selection": True,
                            "discovered_at": datetime.utcnow().isoformat(),
                            "quality_analysis": quality_analysis
                        }
                    }
                    
                    db_to_use.save_google_ads_account(additional_account_data)
                    
        except Exception as e:
            logger.warning(f"فشل في حفظ الحسابات الإضافية: {str(e)}")

        # تحديث ملف المستخدم
        try:
            user_update_data = {
                "google_ads_connected": True,
                "google_ads_customer_id": account_info.get('customer_id', ''),
                "google_ads_connected_at": datetime.utcnow().isoformat(),
                "last_oauth_completion": datetime.utcnow().isoformat()
            }
            
            if hasattr(db_to_use, 'update_user'):
                db_to_use.update_user(user_id, user_update_data)
            elif oauth_manager.db_manager and hasattr(oauth_manager.db_manager, 'update_user'):
                oauth_manager.db_manager.update_user(user_id, user_update_data)
            
        except Exception as e:
            logger.warning(f"فشل في تحديث ملف المستخدم: {str(e)}")

        logger.info(f"تم حفظ معلومات حساب Google Ads بنجاح للمستخدم {user_id}")

        return {
            "success": True,
            "message": "تم حفظ معلومات الحساب بنجاح",
            "account_id": account_data["id"],
            "customer_id": account_info.get('customer_id', ''),
            "token_saved": save_token_result
        }

    except Exception as e:
        logger.error(f"خطأ في حفظ معلومات الحساب: {str(e)}")
        return {
            "success": False,
            "message": f"خطأ في حفظ البيانات: {str(e)}"
        }

@google_ads_oauth_bp.route("/accounts", methods=["GET"])
@login_required
def get_user_ads_accounts():
    """جلب حسابات Google Ads للمستخدم من قاعدة البيانات"""
    try:
        user_id = session.get("user_id")
        
        # استخدام قاعدة بيانات Google Ads المتخصصة إذا كانت متاحة
        db_to_use = oauth_manager.google_ads_db if oauth_manager.google_ads_db else oauth_manager.db_manager
        
        if not db_to_use:
            return jsonify({
                "success": False,
                "message": "خدمة قاعدة البيانات غير متاحة",
                "error_code": "DATABASE_UNAVAILABLE"
            }), 503

        # جلب حسابات المستخدم
        accounts = db_to_use.get_user_google_ads_accounts(user_id)
        
        if not accounts:
            return jsonify({
                "success": True,
                "message": "لا توجد حسابات Google Ads مربوطة",
                "accounts": [],
                "total": 0
            })

        # تنسيق البيانات للعرض باستخدام المنسق المتقدم إذا كان متاحاً
        if SERVICES_STATUS.get('google_ads_helpers'):
            try:
                formatted_accounts = GoogleAdsDataFormatter.format_accounts_list(accounts)
            except Exception as e:
                logger.warning(f"فشل في استخدام المنسق المتقدم: {str(e)}")
                formatted_accounts = accounts
        else:
            # تنسيق أساسي
            formatted_accounts = []
            for account in accounts:
                formatted_account = {
                    "id": account.get("id"),
                    "customer_id": account.get("customer_id"),
                    "descriptive_name": account.get("descriptive_name"),
                    "currency_code": account.get("currency_code"),
                    "time_zone": account.get("time_zone"),
                    "account_type": account.get("account_type"),
                    "is_primary": account.get("is_primary", False),
                    "status": account.get("status"),
                    "linked_at": account.get("linked_at"),
                    "last_sync": account.get("last_sync")
                }
                formatted_accounts.append(formatted_account)

        return jsonify({
            "success": True,
            "message": f"تم جلب {len(formatted_accounts)} حساب",
            "accounts": formatted_accounts,
            "total": len(formatted_accounts)
        })

    except Exception as e:
        logger.error(f"خطأ في جلب حسابات المستخدم: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في جلب الحسابات",
            "error_code": "ACCOUNTS_FETCH_ERROR"
        }), 500

@google_ads_oauth_bp.route("/accounts/<customer_id>/set-primary", methods=["POST"])
@login_required
def set_primary_account(customer_id: str):
    """تعيين حساب كحساب رئيسي"""
    try:
        user_id = session.get("user_id")
        
        # استخدام قاعدة بيانات Google Ads المتخصصة إذا كانت متاحة
        db_to_use = oauth_manager.google_ads_db if oauth_manager.google_ads_db else oauth_manager.db_manager
        
        if not db_to_use:
            return jsonify({
                "success": False,
                "message": "خدمة قاعدة البيانات غير متاحة",
                "error_code": "DATABASE_UNAVAILABLE"
            }), 503

        # التحقق من ملكية الحساب
        if hasattr(db_to_use, 'get_google_ads_account_by_customer_id'):
            account = db_to_use.get_google_ads_account_by_customer_id(user_id, customer_id)
        else:
            # طريقة بديلة للتحقق
            accounts = db_to_use.get_user_google_ads_accounts(user_id)
            account = next((acc for acc in accounts if acc.get('customer_id') == customer_id), None)
        
        if not account:
            return jsonify({
                "success": False,
                "message": "الحساب غير موجود أو غير مملوك لك",
                "error_code": "ACCOUNT_NOT_FOUND"
            }), 404

        # تعيين الحساب الجديد كرئيسي
        result = db_to_use.set_primary_google_ads_account(user_id, customer_id)
        
        if result:
            logger.info(f"تم تعيين الحساب {customer_id} كحساب رئيسي للمستخدم {user_id}")
            
            return jsonify({
                "success": True,
                "message": "تم تعيين الحساب كحساب رئيسي بنجاح",
                "customer_id": customer_id
            })
        else:
            return jsonify({
                "success": False,
                "message": "فشل في تعيين الحساب الرئيسي",
                "error_code": "SET_PRIMARY_FAILED"
            }), 500

    except Exception as e:
        logger.error(f"خطأ في تعيين الحساب الرئيسي: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تعيين الحساب الرئيسي",
            "error_code": "SET_PRIMARY_ERROR"
        }), 500

@google_ads_oauth_bp.route("/revoke", methods=["POST"])
@login_required
def revoke_oauth():
    """إلغاء تفويض Google Ads OAuth"""
    try:
        user_id = session.get("user_id")
        
        # استخدام قاعدة بيانات Google Ads المتخصصة إذا كانت متاحة
        db_to_use = oauth_manager.google_ads_db if oauth_manager.google_ads_db else oauth_manager.db_manager
        
        if not db_to_use:
            return jsonify({
                "success": False,
                "message": "خدمة قاعدة البيانات غير متاحة",
                "error_code": "DATABASE_UNAVAILABLE"
            }), 503

        # جلب رموز الوصول للمستخدم
        tokens = db_to_use.get_user_oauth_tokens(user_id)
        
        # إلغاء الرموز من Google باستخدام الطريقة غير المتزامنة
        revoked_count = 0
        for token in tokens:
            try:
                # فك تشفير الرمز
                decrypted_token = oauth_manager.security_manager.decrypt_sensitive_data(
                    token.get("access_token", "")
                )
                
                # إنشاء معرف رمز مؤقت للإلغاء
                temp_token_id = generate_unique_id() if SERVICES_STATUS.get('helpers') else secrets.token_urlsafe(32)
                oauth_manager.access_tokens[temp_token_id] = AccessToken(
                    token_id=temp_token_id,
                    user_id=user_id,
                    access_token=decrypted_token
                )
                
                # إلغاء الرمز
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                try:
                    revoke_result = loop.run_until_complete(
                        oauth_manager.revoke_token_async(temp_token_id)
                    )
                    if revoke_result.get("success"):
                        revoked_count += 1
                finally:
                    loop.close()
                    
            except Exception as e:
                logger.warning(f"فشل في إلغاء رمز من Google: {str(e)}")

        # حذف الرموز من قاعدة البيانات
        db_to_use.delete_user_oauth_tokens(user_id)
        
        # تحديث حالة الحسابات
        db_to_use.deactivate_user_google_ads_accounts(user_id)
        
        # تحديث ملف المستخدم
        try:
            user_update_data = {
                "google_ads_connected": False,
                "google_ads_customer_id": None,
                "google_ads_disconnected_at": datetime.utcnow().isoformat()
            }
            
            if hasattr(db_to_use, 'update_user'):
                db_to_use.update_user(user_id, user_update_data)
            elif oauth_manager.db_manager and hasattr(oauth_manager.db_manager, 'update_user'):
                oauth_manager.db_manager.update_user(user_id, user_update_data)
                
        except Exception as e:
            logger.warning(f"فشل في تحديث ملف المستخدم: {str(e)}")

        logger.info(f"تم إلغاء تفويض Google Ads للمستخدم {user_id}")

        return jsonify({
            "success": True,
            "message": "تم إلغاء التفويض بنجاح",
            "revoked_tokens": revoked_count,
            "total_tokens": len(tokens)
        })

    except Exception as e:
        logger.error(f"خطأ في إلغاء التفويض: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في إلغاء التفويض",
            "error_code": "REVOKE_ERROR"
        }), 500

@google_ads_oauth_bp.route("/status", methods=["GET"])
@login_required
def get_oauth_status():
    """جلب حالة OAuth للمستخدم"""
    try:
        user_id = session.get("user_id")
        
        # استخدام قاعدة بيانات Google Ads المتخصصة إذا كانت متاحة
        db_to_use = oauth_manager.google_ads_db if oauth_manager.google_ads_db else oauth_manager.db_manager
        
        if not db_to_use:
            return jsonify({
                "success": False,
                "message": "خدمة قاعدة البيانات غير متاحة",
                "error_code": "DATABASE_UNAVAILABLE"
            }), 503

        # جلب معلومات المستخدم
        user_info = {}
        try:
            if hasattr(db_to_use, 'get_user_by_id'):
                user_info = db_to_use.get_user_by_id(user_id) or {}
            elif oauth_manager.db_manager and hasattr(oauth_manager.db_manager, 'get_user_by_id'):
                user_info = oauth_manager.db_manager.get_user_by_id(user_id) or {}
        except Exception as e:
            logger.warning(f"فشل في جلب معلومات المستخدم: {str(e)}")
        
        # جلب الحساب الرئيسي
        primary_account = db_to_use.get_primary_google_ads_account(user_id)
        
        # جلب رموز الوصول النشطة
        active_tokens = db_to_use.get_active_oauth_tokens(user_id)
        
        # جلب جميع الحسابات
        all_accounts = db_to_use.get_user_google_ads_accounts(user_id)
        
        # تحديد حالة الاتصال
        is_connected = (
            user_info.get("google_ads_connected", False) and 
            primary_account is not None and 
            len(active_tokens) > 0
        )

        status_data = {
            "connected": is_connected,
            "user_id": user_id,
            "primary_account": {
                "customer_id": primary_account.get("customer_id") if primary_account else None,
                "descriptive_name": primary_account.get("descriptive_name") if primary_account else None,
                "currency_code": primary_account.get("currency_code") if primary_account else None,
                "linked_at": primary_account.get("linked_at") if primary_account else None,
                "account_type": primary_account.get("account_type") if primary_account else None,
                "status": primary_account.get("status") if primary_account else None
            } if primary_account else None,
            "tokens_count": len(active_tokens),
            "last_oauth_completion": user_info.get("last_oauth_completion"),
            "connected_at": user_info.get("google_ads_connected_at"),
            "total_accounts": len(all_accounts),
            "service_status": {
                "oauth_manager": True,
                "google_ads_api": SERVICES_STATUS.get('google_ads_api', False),
                "google_ads_helpers": SERVICES_STATUS.get('google_ads_helpers', False),
                "google_ads_database": SERVICES_STATUS.get('google_ads_database', False)
            },
            "metrics": oauth_manager.metrics_collector.get_metrics()
        }

        return jsonify({
            "success": True,
            "message": "تم جلب حالة OAuth بنجاح",
            "status": status_data
        })

    except Exception as e:
        logger.error(f"خطأ في جلب حالة OAuth: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في جلب حالة OAuth",
            "error_code": "STATUS_ERROR"
        }), 500

@google_ads_oauth_bp.route("/refresh-token", methods=["POST"])
@login_required
def refresh_user_token():
    """تجديد رمز الوصول للمستخدم"""
    try:
        user_id = session.get("user_id")
        
        # جلب رموز المستخدم النشطة
        db_to_use = oauth_manager.google_ads_db if oauth_manager.google_ads_db else oauth_manager.db_manager
        
        if not db_to_use:
            return jsonify({
                "success": False,
                "message": "خدمة قاعدة البيانات غير متاحة",
                "error_code": "DATABASE_UNAVAILABLE"
            }), 503

        active_tokens = db_to_use.get_active_oauth_tokens(user_id)
        
        if not active_tokens:
            return jsonify({
                "success": False,
                "message": "لا توجد رموز نشطة للتجديد",
                "error_code": "NO_ACTIVE_TOKENS"
            }), 404

        # تجديد أول رمز نشط
        token = active_tokens[0]
        token_id = token.get('id')
        
        # إنشاء كائن رمز مؤقت للتجديد
        temp_token_obj = AccessToken(
            token_id=token_id,
            user_id=user_id,
            access_token=oauth_manager.security_manager.decrypt_sensitive_data(token.get('access_token', '')),
            refresh_token=oauth_manager.security_manager.decrypt_sensitive_data(token.get('refresh_token', '')) if token.get('refresh_token') else None
        )
        
        oauth_manager.access_tokens[token_id] = temp_token_obj
        
        # تجديد الرمز
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            refresh_result = loop.run_until_complete(
                oauth_manager.refresh_token_async(token_id)
            )
        finally:
            loop.close()

        if refresh_result.get("success"):
            # تحديث الرمز في قاعدة البيانات
            updated_token_data = {
                **token,
                "access_token": oauth_manager.security_manager.encrypt_sensitive_data(refresh_result.get("access_token")),
                "refresh_token": oauth_manager.security_manager.encrypt_sensitive_data(refresh_result.get("refresh_token")) if refresh_result.get("refresh_token") else token.get("refresh_token"),
                "last_refreshed": datetime.utcnow().isoformat(),
                "refresh_count": token.get("refresh_count", 0) + 1
            }
            
            db_to_use.save_oauth_token(updated_token_data)
            
            return jsonify({
                "success": True,
                "message": "تم تجديد الرمز بنجاح",
                "expires_in": refresh_result.get("expires_in", 3600)
            })
        else:
            return jsonify({
                "success": False,
                "message": refresh_result.get("message", "فشل في تجديد الرمز"),
                "error_code": "TOKEN_REFRESH_FAILED"
            }), 400

    except Exception as e:
        logger.error(f"خطأ في تجديد الرمز: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تجديد الرمز",
            "error_code": "TOKEN_REFRESH_ERROR"
        }), 500

@google_ads_oauth_bp.route("/metrics", methods=["GET"])
@admin_required
def get_oauth_metrics():
    """جلب مقاييس OAuth (للمديرين فقط)"""
    try:
        metrics = oauth_manager.metrics_collector.get_metrics()
        
        return jsonify({
            "success": True,
            "message": "تم جلب المقاييس بنجاح",
            "metrics": metrics,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logger.error(f"خطأ في جلب المقاييس: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في جلب المقاييس",
            "error_code": "METRICS_ERROR"
        }), 500

@google_ads_oauth_bp.route("/metrics/reset", methods=["POST"])
@admin_required
def reset_oauth_metrics():
    """إعادة تعيين مقاييس OAuth (للمديرين فقط)"""
    try:
        oauth_manager.metrics_collector.reset_metrics()
        
        return jsonify({
            "success": True,
            "message": "تم إعادة تعيين المقاييس بنجاح",
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logger.error(f"خطأ في إعادة تعيين المقاييس: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في إعادة تعيين المقاييس",
            "error_code": "METRICS_RESET_ERROR"
        }), 500

# ==================== وظائف التسجيل والتصدير ====================

def register_google_ads_oauth_routes(app):
    """تسجيل مسارات Google Ads OAuth"""
    app.register_blueprint(google_ads_oauth_bp)
    logger.info("✅ تم تسجيل مسارات Google Ads OAuth")

def cleanup_oauth_manager():
    """تنظيف مدير OAuth عند إغلاق التطبيق"""
    try:
        # إيقاف thread التنظيف
        if hasattr(oauth_manager, 'cleanup_thread') and oauth_manager.cleanup_thread.is_alive():
            # لا يمكن إيقاف daemon thread بشكل مباشر، سيتم إيقافه تلقائياً
            pass
        
        # إغلاق اتصالات قاعدة البيانات
        if oauth_manager.google_ads_db and hasattr(oauth_manager.google_ads_db, 'close_connection'):
            oauth_manager.google_ads_db.close_connection()
        
        logger.info("✅ تم تنظيف مدير OAuth")
        
    except Exception as e:
        logger.error(f"خطأ في تنظيف مدير OAuth: {str(e)}")

# تصدير الكلاسات والوظائف
__all__ = [
    'google_ads_oauth_bp', 
    'register_google_ads_oauth_routes',
    'oauth_manager',
    'GoogleAdsOAuthManager',
    'OAuthConfig',
    'OAuthSession',
    'AccessToken',
    'SecurityManager',
    'MetricsCollector',
    'cleanup_oauth_manager'
]

