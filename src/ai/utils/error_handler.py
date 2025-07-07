#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🚨 Error Handler - معالج الأخطاء المتقدم
=======================================

نظام شامل لمعالجة الأخطاء يدعم:
- تصنيف الأخطاء حسب النوع والخطورة
- إعادة المحاولة التلقائية
- تسجيل مفصل للأخطاء
- إشعارات الأخطاء
- تتبع الأخطاء والإحصائيات
- معالجة آمنة للعمليات

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
import traceback
import asyncio
import functools
import time
from typing import Dict, Any, List, Optional, Union, Callable, Type
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import json
import uuid

# استيراد وحدات النظام
try:
    from .logger import setup_logger
    logger = setup_logger(__name__)
except ImportError:
    logger = logging.getLogger(__name__)

class ErrorType(Enum):
    """أنواع الأخطاء"""
    SYSTEM = "system"                    # أخطاء النظام
    NETWORK = "network"                  # أخطاء الشبكة
    API = "api"                         # أخطاء API
    DATABASE = "database"               # أخطاء قاعدة البيانات
    VALIDATION = "validation"           # أخطاء التحقق
    AUTHENTICATION = "authentication"   # أخطاء المصادقة
    AUTHORIZATION = "authorization"     # أخطاء التخويل
    BUSINESS_LOGIC = "business_logic"   # أخطاء منطق العمل
    EXTERNAL_SERVICE = "external_service" # أخطاء الخدمات الخارجية
    USER_INPUT = "user_input"           # أخطاء إدخال المستخدم
    CONFIGURATION = "configuration"     # أخطاء الإعدادات
    UNKNOWN = "unknown"                 # أخطاء غير معروفة

class ErrorSeverity(Enum):
    """مستويات خطورة الأخطاء"""
    LOW = "low"           # منخفضة - تحذيرات
    MEDIUM = "medium"     # متوسطة - أخطاء قابلة للاسترداد
    HIGH = "high"         # عالية - أخطاء حرجة
    CRITICAL = "critical" # حرجة - أخطاء تتطلب تدخل فوري

@dataclass
class ErrorContext:
    """
    📋 سياق الخطأ
    """
    error_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = field(default_factory=datetime.now)
    error_type: ErrorType = ErrorType.UNKNOWN
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
    message: str = ""
    details: str = ""
    traceback_info: str = ""
    function_name: str = ""
    module_name: str = ""
    line_number: int = 0
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    request_id: Optional[str] = None
    additional_data: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'error_id': self.error_id,
            'timestamp': self.timestamp.isoformat(),
            'error_type': self.error_type.value,
            'severity': self.severity.value,
            'message': self.message,
            'details': self.details,
            'traceback_info': self.traceback_info,
            'function_name': self.function_name,
            'module_name': self.module_name,
            'line_number': self.line_number,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'request_id': self.request_id,
            'additional_data': self.additional_data
        }

@dataclass
class RetryConfig:
    """
    🔄 إعدادات إعادة المحاولة
    """
    max_attempts: int = 3
    base_delay: float = 1.0
    max_delay: float = 60.0
    backoff_factor: float = 2.0
    jitter: bool = True
    retryable_errors: List[Type[Exception]] = field(default_factory=list)
    
    def should_retry(self, exception: Exception, attempt: int) -> bool:
        """تحديد ما إذا كان يجب إعادة المحاولة"""
        if attempt >= self.max_attempts:
            return False
        
        if not self.retryable_errors:
            # إعادة المحاولة للأخطاء الشائعة
            retryable_types = (
                ConnectionError,
                TimeoutError,
                OSError,
                # يمكن إضافة المزيد حسب الحاجة
            )
            return isinstance(exception, retryable_types)
        
        return any(isinstance(exception, error_type) for error_type in self.retryable_errors)
    
    def get_delay(self, attempt: int) -> float:
        """حساب وقت التأخير"""
        delay = min(
            self.base_delay * (self.backoff_factor ** attempt),
            self.max_delay
        )
        
        if self.jitter:
            import random
            delay *= (0.5 + random.random() * 0.5)
        
        return delay

class ErrorHandler:
    """
    🚨 معالج الأخطاء المتقدم
    
    يوفر نظام شامل لمعالجة الأخطاء مع:
    - تصنيف وتتبع الأخطاء
    - إعادة المحاولة التلقائية
    - تسجيل مفصل
    - إشعارات الأخطاء
    - إحصائيات الأخطاء
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        تهيئة معالج الأخطاء
        
        Args:
            config: إعدادات المعالج
        """
        self.config = config or {}
        
        # إعدادات التسجيل
        self.log_errors = self.config.get('log_errors', True)
        self.log_level = self.config.get('log_level', 'ERROR')
        
        # إعدادات الإشعارات
        self.send_notifications = self.config.get('send_notifications', False)
        self.notification_threshold = ErrorSeverity(
            self.config.get('notification_threshold', 'high')
        )
        
        # تخزين الأخطاء
        self.error_history: List[ErrorContext] = []
        self.max_history_size = self.config.get('max_history_size', 1000)
        
        # إحصائيات الأخطاء
        self.error_stats = {
            'total_errors': 0,
            'errors_by_type': {},
            'errors_by_severity': {},
            'errors_by_hour': {},
            'last_error_time': None,
            'most_common_error': None
        }
        
        # معالجات مخصصة
        self.custom_handlers: Dict[ErrorType, Callable] = {}
        
        logger.info("🚨 تم تهيئة معالج الأخطاء")
    
    def handle_error(
        self,
        exception: Exception,
        context: Optional[ErrorContext] = None,
        **kwargs
    ) -> ErrorContext:
        """
        معالجة خطأ
        
        Args:
            exception: الاستثناء
            context: سياق الخطأ
            **kwargs: معلومات إضافية
            
        Returns:
            ErrorContext: سياق الخطأ المُحدث
        """
        # إنشاء سياق الخطأ إذا لم يُحدد
        if context is None:
            context = self._create_error_context(exception, **kwargs)
        
        # تحديث سياق الخطأ
        self._update_error_context(context, exception)
        
        # تسجيل الخطأ
        if self.log_errors:
            self._log_error(context)
        
        # إضافة إلى التاريخ
        self._add_to_history(context)
        
        # تحديث الإحصائيات
        self._update_statistics(context)
        
        # تشغيل المعالج المخصص
        if context.error_type in self.custom_handlers:
            try:
                self.custom_handlers[context.error_type](context)
            except Exception as e:
                logger.warning(f"⚠️ فشل في تشغيل المعالج المخصص: {e}")
        
        # إرسال إشعار إذا لزم الأمر
        if self._should_send_notification(context):
            self._send_notification(context)
        
        return context
    
    def _create_error_context(
        self,
        exception: Exception,
        **kwargs
    ) -> ErrorContext:
        """إنشاء سياق خطأ من الاستثناء"""
        
        # الحصول على معلومات التتبع
        tb = traceback.extract_tb(exception.__traceback__)
        if tb:
            last_frame = tb[-1]
            function_name = last_frame.name
            module_name = last_frame.filename.split('/')[-1]
            line_number = last_frame.lineno
        else:
            function_name = "unknown"
            module_name = "unknown"
            line_number = 0
        
        # تحديد نوع الخطأ
        error_type = self._classify_error(exception)
        
        # تحديد مستوى الخطورة
        severity = self._determine_severity(exception, error_type)
        
        return ErrorContext(
            error_type=error_type,
            severity=severity,
            message=str(exception),
            details=repr(exception),
            traceback_info=traceback.format_exc(),
            function_name=function_name,
            module_name=module_name,
            line_number=line_number,
            user_id=kwargs.get('user_id'),
            session_id=kwargs.get('session_id'),
            request_id=kwargs.get('request_id'),
            additional_data=kwargs.get('additional_data', {})
        )
    
    def _update_error_context(self, context: ErrorContext, exception: Exception):
        """تحديث سياق الخطأ"""
        if not context.message:
            context.message = str(exception)
        
        if not context.details:
            context.details = repr(exception)
        
        if not context.traceback_info:
            context.traceback_info = traceback.format_exc()
    
    def _classify_error(self, exception: Exception) -> ErrorType:
        """تصنيف نوع الخطأ"""
        
        # تصنيف حسب نوع الاستثناء
        if isinstance(exception, (ConnectionError, OSError)):
            return ErrorType.NETWORK
        elif isinstance(exception, TimeoutError):
            return ErrorType.NETWORK
        elif isinstance(exception, ValueError):
            return ErrorType.VALIDATION
        elif isinstance(exception, KeyError):
            return ErrorType.CONFIGURATION
        elif isinstance(exception, PermissionError):
            return ErrorType.AUTHORIZATION
        elif isinstance(exception, FileNotFoundError):
            return ErrorType.SYSTEM
        else:
            # تصنيف حسب رسالة الخطأ
            message = str(exception).lower()
            if 'api' in message or 'http' in message:
                return ErrorType.API
            elif 'database' in message or 'sql' in message:
                return ErrorType.DATABASE
            elif 'auth' in message:
                return ErrorType.AUTHENTICATION
            elif 'permission' in message:
                return ErrorType.AUTHORIZATION
            else:
                return ErrorType.UNKNOWN
    
    def _determine_severity(
        self,
        exception: Exception,
        error_type: ErrorType
    ) -> ErrorSeverity:
        """تحديد مستوى خطورة الخطأ"""
        
        # أخطاء حرجة
        critical_types = [ErrorType.SYSTEM, ErrorType.DATABASE]
        if error_type in critical_types:
            return ErrorSeverity.CRITICAL
        
        # أخطاء عالية الخطورة
        high_severity_types = [ErrorType.AUTHENTICATION, ErrorType.AUTHORIZATION]
        if error_type in high_severity_types:
            return ErrorSeverity.HIGH
        
        # أخطاء متوسطة الخطورة
        medium_severity_types = [ErrorType.API, ErrorType.NETWORK, ErrorType.EXTERNAL_SERVICE]
        if error_type in medium_severity_types:
            return ErrorSeverity.MEDIUM
        
        # أخطاء منخفضة الخطورة
        return ErrorSeverity.LOW
    
    def _log_error(self, context: ErrorContext):
        """تسجيل الخطأ"""
        
        log_message = (
            f"[{context.error_id}] {context.error_type.value.upper()} "
            f"({context.severity.value.upper()}): {context.message}"
        )
        
        log_details = {
            'error_id': context.error_id,
            'error_type': context.error_type.value,
            'severity': context.severity.value,
            'function': context.function_name,
            'module': context.module_name,
            'line': context.line_number,
            'user_id': context.user_id,
            'session_id': context.session_id,
            'request_id': context.request_id
        }
        
        # اختيار مستوى التسجيل حسب الخطورة
        if context.severity == ErrorSeverity.CRITICAL:
            logger.critical(log_message, extra=log_details)
            logger.critical(f"Traceback:\n{context.traceback_info}")
        elif context.severity == ErrorSeverity.HIGH:
            logger.error(log_message, extra=log_details)
            logger.debug(f"Traceback:\n{context.traceback_info}")
        elif context.severity == ErrorSeverity.MEDIUM:
            logger.warning(log_message, extra=log_details)
        else:
            logger.info(log_message, extra=log_details)
    
    def _add_to_history(self, context: ErrorContext):
        """إضافة الخطأ إلى التاريخ"""
        self.error_history.append(context)
        
        # الحفاظ على حجم التاريخ
        if len(self.error_history) > self.max_history_size:
            self.error_history = self.error_history[-self.max_history_size:]
    
    def _update_statistics(self, context: ErrorContext):
        """تحديث إحصائيات الأخطاء"""
        self.error_stats['total_errors'] += 1
        self.error_stats['last_error_time'] = context.timestamp
        
        # إحصائيات حسب النوع
        error_type = context.error_type.value
        if error_type not in self.error_stats['errors_by_type']:
            self.error_stats['errors_by_type'][error_type] = 0
        self.error_stats['errors_by_type'][error_type] += 1
        
        # إحصائيات حسب الخطورة
        severity = context.severity.value
        if severity not in self.error_stats['errors_by_severity']:
            self.error_stats['errors_by_severity'][severity] = 0
        self.error_stats['errors_by_severity'][severity] += 1
        
        # إحصائيات حسب الساعة
        hour_key = context.timestamp.strftime('%Y-%m-%d %H:00')
        if hour_key not in self.error_stats['errors_by_hour']:
            self.error_stats['errors_by_hour'][hour_key] = 0
        self.error_stats['errors_by_hour'][hour_key] += 1
        
        # تحديد الخطأ الأكثر شيوعاً
        most_common = max(
            self.error_stats['errors_by_type'].items(),
            key=lambda x: x[1]
        )
        self.error_stats['most_common_error'] = most_common[0]
    
    def _should_send_notification(self, context: ErrorContext) -> bool:
        """تحديد ما إذا كان يجب إرسال إشعار"""
        if not self.send_notifications:
            return False
        
        # إرسال إشعار للأخطاء التي تتجاوز العتبة المحددة
        severity_levels = {
            ErrorSeverity.LOW: 1,
            ErrorSeverity.MEDIUM: 2,
            ErrorSeverity.HIGH: 3,
            ErrorSeverity.CRITICAL: 4
        }
        
        return (
            severity_levels[context.severity] >= 
            severity_levels[self.notification_threshold]
        )
    
    def _send_notification(self, context: ErrorContext):
        """إرسال إشعار الخطأ"""
        try:
            # يمكن تخصيص هذه الدالة لإرسال إشعارات عبر:
            # - البريد الإلكتروني
            # - Slack
            # - SMS
            # - Webhook
            
            notification_data = {
                'error_id': context.error_id,
                'timestamp': context.timestamp.isoformat(),
                'severity': context.severity.value,
                'type': context.error_type.value,
                'message': context.message,
                'function': context.function_name,
                'module': context.module_name
            }
            
            logger.info(f"📧 إرسال إشعار خطأ: {json.dumps(notification_data, ensure_ascii=False)}")
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في إرسال إشعار الخطأ: {e}")
    
    def register_custom_handler(
        self,
        error_type: ErrorType,
        handler: Callable[[ErrorContext], None]
    ):
        """تسجيل معالج مخصص لنوع خطأ معين"""
        self.custom_handlers[error_type] = handler
        logger.info(f"🔧 تم تسجيل معالج مخصص لنوع الخطأ: {error_type.value}")
    
    def get_error_statistics(self) -> Dict[str, Any]:
        """الحصول على إحصائيات الأخطاء"""
        stats = self.error_stats.copy()
        
        # إضافة معلومات إضافية
        if stats['total_errors'] > 0:
            # معدل الأخطاء في الساعة الأخيرة
            current_hour = datetime.now().strftime('%Y-%m-%d %H:00')
            stats['errors_last_hour'] = stats['errors_by_hour'].get(current_hour, 0)
            
            # أكثر الأخطاء خطورة
            critical_count = stats['errors_by_severity'].get('critical', 0)
            high_count = stats['errors_by_severity'].get('high', 0)
            stats['critical_errors_count'] = critical_count + high_count
        
        return stats
    
    def get_recent_errors(self, limit: int = 10) -> List[Dict[str, Any]]:
        """الحصول على الأخطاء الأخيرة"""
        recent_errors = sorted(
            self.error_history,
            key=lambda x: x.timestamp,
            reverse=True
        )[:limit]
        
        return [error.to_dict() for error in recent_errors]
    
    def clear_error_history(self):
        """مسح تاريخ الأخطاء"""
        self.error_history.clear()
        logger.info("🗑️ تم مسح تاريخ الأخطاء")
    
    def reset_statistics(self):
        """إعادة تعيين الإحصائيات"""
        self.error_stats = {
            'total_errors': 0,
            'errors_by_type': {},
            'errors_by_severity': {},
            'errors_by_hour': {},
            'last_error_time': None,
            'most_common_error': None
        }
        logger.info("📊 تم إعادة تعيين إحصائيات الأخطاء")

# معالج الأخطاء العام
_global_error_handler = None

def get_error_handler() -> ErrorHandler:
    """الحصول على معالج الأخطاء العام"""
    global _global_error_handler
    if _global_error_handler is None:
        _global_error_handler = ErrorHandler()
    return _global_error_handler

def handle_error(
    exception: Exception,
    context: Optional[ErrorContext] = None,
    **kwargs
) -> ErrorContext:
    """معالجة خطأ باستخدام المعالج العام"""
    handler = get_error_handler()
    return handler.handle_error(exception, context, **kwargs)

# Decorators للمعالجة التلقائية
def retry_on_error(
    max_attempts: int = 3,
    base_delay: float = 1.0,
    backoff_factor: float = 2.0,
    retryable_errors: Optional[List[Type[Exception]]] = None
):
    """
    Decorator لإعادة المحاولة عند حدوث خطأ
    
    Args:
        max_attempts: عدد المحاولات الأقصى
        base_delay: التأخير الأساسي
        backoff_factor: معامل التأخير المتزايد
        retryable_errors: أنواع الأخطاء القابلة للإعادة
    """
    def decorator(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            config = RetryConfig(
                max_attempts=max_attempts,
                base_delay=base_delay,
                backoff_factor=backoff_factor,
                retryable_errors=retryable_errors or []
            )
            
            last_exception = None
            
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    
                    if not config.should_retry(e, attempt):
                        break
                    
                    if attempt < max_attempts - 1:
                        delay = config.get_delay(attempt)
                        logger.warning(
                            f"⚠️ محاولة {attempt + 1} فشلت، إعادة المحاولة خلال {delay:.2f}s: {e}"
                        )
                        await asyncio.sleep(delay)
            
            # معالجة الخطأ النهائي
            handle_error(last_exception)
            raise last_exception
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            config = RetryConfig(
                max_attempts=max_attempts,
                base_delay=base_delay,
                backoff_factor=backoff_factor,
                retryable_errors=retryable_errors or []
            )
            
            last_exception = None
            
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    
                    if not config.should_retry(e, attempt):
                        break
                    
                    if attempt < max_attempts - 1:
                        delay = config.get_delay(attempt)
                        logger.warning(
                            f"⚠️ محاولة {attempt + 1} فشلت، إعادة المحاولة خلال {delay:.2f}s: {e}"
                        )
                        time.sleep(delay)
            
            # معالجة الخطأ النهائي
            handle_error(last_exception)
            raise last_exception
        
        # تحديد نوع الدالة
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

def safe_execute(
    default_return=None,
    log_errors: bool = True,
    raise_on_error: bool = False
):
    """
    Decorator للتنفيذ الآمن مع معالجة الأخطاء
    
    Args:
        default_return: القيمة المُرجعة عند حدوث خطأ
        log_errors: تسجيل الأخطاء
        raise_on_error: رفع الخطأ بعد المعالجة
    """
    def decorator(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                if log_errors:
                    handle_error(e)
                
                if raise_on_error:
                    raise
                
                return default_return
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if log_errors:
                    handle_error(e)
                
                if raise_on_error:
                    raise
                
                return default_return
        
        # تحديد نوع الدالة
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

# تصدير الوحدات المهمة
__all__ = [
    'ErrorHandler',
    'ErrorType',
    'ErrorSeverity',
    'ErrorContext',
    'RetryConfig',
    'get_error_handler',
    'handle_error',
    'retry_on_error',
    'safe_execute'
]

