#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
⏱️ Rate Limiter - محدد معدل الطلبات المتقدم
==========================================

نظام شامل لتحديد معدل الطلبات يدعم:
- خوارزميات متعددة (Token Bucket, Sliding Window, Fixed Window)
- حدود مخصصة لكل مستخدم/API
- إحصائيات مفصلة
- تخزين مؤقت للحالة
- إشعارات تجاوز الحدود
- استرداد تلقائي

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
import asyncio
import time
import math
from typing import Dict, Any, List, Optional, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import threading
from abc import ABC, abstractmethod
from collections import deque, defaultdict

# استيراد وحدات النظام
try:
    from .logger import setup_logger
    logger = setup_logger(__name__)
except ImportError:
    logger = logging.getLogger(__name__)

class RateLimitType(Enum):
    """أنواع تحديد معدل الطلبات"""
    TOKEN_BUCKET = "token_bucket"         # دلو الرموز
    SLIDING_WINDOW = "sliding_window"     # نافذة منزلقة
    FIXED_WINDOW = "fixed_window"         # نافذة ثابتة
    LEAKY_BUCKET = "leaky_bucket"         # دلو متسرب

class RateLimitStatus(Enum):
    """حالة تحديد معدل الطلبات"""
    ALLOWED = "allowed"           # مسموح
    DENIED = "denied"             # مرفوض
    WARNING = "warning"           # تحذير (قريب من الحد)

@dataclass
class RateLimit:
    """
    📊 حد معدل الطلبات
    """
    key: str                              # مفتاح التعريف
    limit: int                            # عدد الطلبات المسموحة
    window_seconds: int                   # نافذة الوقت بالثواني
    algorithm: RateLimitType = RateLimitType.TOKEN_BUCKET
    burst_limit: Optional[int] = None     # حد الاندفاع
    warning_threshold: float = 0.8        # عتبة التحذير (80%)
    
    def __post_init__(self):
        """تهيئة إضافية"""
        if self.burst_limit is None:
            self.burst_limit = self.limit
    
    @property
    def requests_per_second(self) -> float:
        """معدل الطلبات في الثانية"""
        return self.limit / self.window_seconds
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'key': self.key,
            'limit': self.limit,
            'window_seconds': self.window_seconds,
            'algorithm': self.algorithm.value,
            'burst_limit': self.burst_limit,
            'warning_threshold': self.warning_threshold,
            'requests_per_second': self.requests_per_second
        }

@dataclass
class RateLimitResult:
    """
    📋 نتيجة فحص معدل الطلبات
    """
    allowed: bool
    status: RateLimitStatus
    remaining: int = 0                    # الطلبات المتبقية
    reset_time: Optional[datetime] = None # وقت إعادة التعيين
    retry_after: Optional[int] = None     # الانتظار قبل المحاولة التالية (ثانية)
    current_usage: int = 0                # الاستخدام الحالي
    limit_info: Optional[RateLimit] = None
    message: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'allowed': self.allowed,
            'status': self.status.value,
            'remaining': self.remaining,
            'reset_time': self.reset_time.isoformat() if self.reset_time else None,
            'retry_after': self.retry_after,
            'current_usage': self.current_usage,
            'limit_info': self.limit_info.to_dict() if self.limit_info else None,
            'message': self.message
        }

class RateLimitAlgorithm(ABC):
    """
    🏗️ واجهة خوارزمية تحديد معدل الطلبات
    """
    
    @abstractmethod
    async def is_allowed(self, rate_limit: RateLimit) -> RateLimitResult:
        """فحص ما إذا كان الطلب مسموح"""
        pass
    
    @abstractmethod
    async def reset(self, key: str):
        """إعادة تعيين الحالة"""
        pass
    
    @abstractmethod
    def get_state(self, key: str) -> Dict[str, Any]:
        """الحصول على حالة المفتاح"""
        pass

class TokenBucket(RateLimitAlgorithm):
    """
    🪣 خوارزمية دلو الرموز
    
    تسمح بالاندفاع في الطلبات مع الحفاظ على معدل ثابت
    """
    
    def __init__(self):
        """تهيئة دلو الرموز"""
        self.buckets: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.RLock()
        
        logger.debug("🪣 تم تهيئة خوارزمية دلو الرموز")
    
    async def is_allowed(self, rate_limit: RateLimit) -> RateLimitResult:
        """فحص ما إذا كان الطلب مسموح"""
        current_time = time.time()
        
        with self.lock:
            # الحصول على حالة الدلو أو إنشاؤها
            if rate_limit.key not in self.buckets:
                self.buckets[rate_limit.key] = {
                    'tokens': rate_limit.burst_limit,
                    'last_refill': current_time,
                    'total_requests': 0
                }
            
            bucket = self.buckets[rate_limit.key]
            
            # حساب الرموز الجديدة
            time_passed = current_time - bucket['last_refill']
            tokens_to_add = time_passed * rate_limit.requests_per_second
            
            # تحديث الرموز
            bucket['tokens'] = min(
                rate_limit.burst_limit,
                bucket['tokens'] + tokens_to_add
            )
            bucket['last_refill'] = current_time
            
            # فحص توفر الرموز
            if bucket['tokens'] >= 1:
                # استهلاك رمز
                bucket['tokens'] -= 1
                bucket['total_requests'] += 1
                
                # حساب الحالة
                usage_ratio = (rate_limit.burst_limit - bucket['tokens']) / rate_limit.burst_limit
                
                if usage_ratio >= rate_limit.warning_threshold:
                    status = RateLimitStatus.WARNING
                    message = f"تحذير: اقتراب من حد معدل الطلبات ({usage_ratio:.1%})"
                else:
                    status = RateLimitStatus.ALLOWED
                    message = "طلب مسموح"
                
                return RateLimitResult(
                    allowed=True,
                    status=status,
                    remaining=int(bucket['tokens']),
                    current_usage=bucket['total_requests'],
                    limit_info=rate_limit,
                    message=message
                )
            else:
                # لا توجد رموز متاحة
                retry_after = math.ceil(1 / rate_limit.requests_per_second)
                
                return RateLimitResult(
                    allowed=False,
                    status=RateLimitStatus.DENIED,
                    remaining=0,
                    retry_after=retry_after,
                    current_usage=bucket['total_requests'],
                    limit_info=rate_limit,
                    message=f"تم تجاوز حد معدل الطلبات، حاول مرة أخرى خلال {retry_after}s"
                )
    
    async def reset(self, key: str):
        """إعادة تعيين الدلو"""
        with self.lock:
            if key in self.buckets:
                del self.buckets[key]
                logger.debug(f"🗑️ تم إعادة تعيين دلو الرموز: {key}")
    
    def get_state(self, key: str) -> Dict[str, Any]:
        """الحصول على حالة الدلو"""
        with self.lock:
            if key in self.buckets:
                bucket = self.buckets[key].copy()
                bucket['algorithm'] = 'token_bucket'
                return bucket
            return {}

class SlidingWindow(RateLimitAlgorithm):
    """
    🪟 خوارزمية النافذة المنزلقة
    
    تتبع الطلبات في نافذة زمنية منزلقة
    """
    
    def __init__(self):
        """تهيئة النافذة المنزلقة"""
        self.windows: Dict[str, deque] = {}
        self.lock = threading.RLock()
        
        logger.debug("🪟 تم تهيئة خوارزمية النافذة المنزلقة")
    
    async def is_allowed(self, rate_limit: RateLimit) -> RateLimitResult:
        """فحص ما إذا كان الطلب مسموح"""
        current_time = time.time()
        window_start = current_time - rate_limit.window_seconds
        
        with self.lock:
            # الحصول على النافذة أو إنشاؤها
            if rate_limit.key not in self.windows:
                self.windows[rate_limit.key] = deque()
            
            window = self.windows[rate_limit.key]
            
            # إزالة الطلبات القديمة
            while window and window[0] < window_start:
                window.popleft()
            
            # فحص الحد
            current_count = len(window)
            
            if current_count < rate_limit.limit:
                # إضافة الطلب الجديد
                window.append(current_time)
                
                # حساب الحالة
                usage_ratio = (current_count + 1) / rate_limit.limit
                
                if usage_ratio >= rate_limit.warning_threshold:
                    status = RateLimitStatus.WARNING
                    message = f"تحذير: اقتراب من حد معدل الطلبات ({usage_ratio:.1%})"
                else:
                    status = RateLimitStatus.ALLOWED
                    message = "طلب مسموح"
                
                return RateLimitResult(
                    allowed=True,
                    status=status,
                    remaining=rate_limit.limit - current_count - 1,
                    reset_time=datetime.fromtimestamp(window[0] + rate_limit.window_seconds) if window else None,
                    current_usage=current_count + 1,
                    limit_info=rate_limit,
                    message=message
                )
            else:
                # تم تجاوز الحد
                oldest_request = window[0] if window else current_time
                retry_after = math.ceil(oldest_request + rate_limit.window_seconds - current_time)
                
                return RateLimitResult(
                    allowed=False,
                    status=RateLimitStatus.DENIED,
                    remaining=0,
                    retry_after=max(1, retry_after),
                    reset_time=datetime.fromtimestamp(oldest_request + rate_limit.window_seconds),
                    current_usage=current_count,
                    limit_info=rate_limit,
                    message=f"تم تجاوز حد معدل الطلبات، حاول مرة أخرى خلال {retry_after}s"
                )
    
    async def reset(self, key: str):
        """إعادة تعيين النافذة"""
        with self.lock:
            if key in self.windows:
                del self.windows[key]
                logger.debug(f"🗑️ تم إعادة تعيين النافذة المنزلقة: {key}")
    
    def get_state(self, key: str) -> Dict[str, Any]:
        """الحصول على حالة النافذة"""
        with self.lock:
            if key in self.windows:
                window = self.windows[key]
                return {
                    'algorithm': 'sliding_window',
                    'current_requests': len(window),
                    'oldest_request': window[0] if window else None,
                    'newest_request': window[-1] if window else None
                }
            return {}

class FixedWindow(RateLimitAlgorithm):
    """
    📅 خوارزمية النافذة الثابتة
    
    تقسم الوقت إلى نوافذ ثابتة وتحدد الطلبات في كل نافذة
    """
    
    def __init__(self):
        """تهيئة النافذة الثابتة"""
        self.windows: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.RLock()
        
        logger.debug("📅 تم تهيئة خوارزمية النافذة الثابتة")
    
    def _get_window_key(self, rate_limit: RateLimit, current_time: float) -> str:
        """الحصول على مفتاح النافذة الحالية"""
        window_number = int(current_time // rate_limit.window_seconds)
        return f"{rate_limit.key}:{window_number}"
    
    async def is_allowed(self, rate_limit: RateLimit) -> RateLimitResult:
        """فحص ما إذا كان الطلب مسموح"""
        current_time = time.time()
        window_key = self._get_window_key(rate_limit, current_time)
        window_start = (int(current_time // rate_limit.window_seconds)) * rate_limit.window_seconds
        window_end = window_start + rate_limit.window_seconds
        
        with self.lock:
            # الحصول على النافذة أو إنشاؤها
            if window_key not in self.windows:
                self.windows[window_key] = {
                    'count': 0,
                    'start_time': window_start,
                    'end_time': window_end
                }
            
            window = self.windows[window_key]
            
            # فحص الحد
            if window['count'] < rate_limit.limit:
                # زيادة العداد
                window['count'] += 1
                
                # حساب الحالة
                usage_ratio = window['count'] / rate_limit.limit
                
                if usage_ratio >= rate_limit.warning_threshold:
                    status = RateLimitStatus.WARNING
                    message = f"تحذير: اقتراب من حد معدل الطلبات ({usage_ratio:.1%})"
                else:
                    status = RateLimitStatus.ALLOWED
                    message = "طلب مسموح"
                
                return RateLimitResult(
                    allowed=True,
                    status=status,
                    remaining=rate_limit.limit - window['count'],
                    reset_time=datetime.fromtimestamp(window['end_time']),
                    current_usage=window['count'],
                    limit_info=rate_limit,
                    message=message
                )
            else:
                # تم تجاوز الحد
                retry_after = math.ceil(window['end_time'] - current_time)
                
                return RateLimitResult(
                    allowed=False,
                    status=RateLimitStatus.DENIED,
                    remaining=0,
                    retry_after=max(1, retry_after),
                    reset_time=datetime.fromtimestamp(window['end_time']),
                    current_usage=window['count'],
                    limit_info=rate_limit,
                    message=f"تم تجاوز حد معدل الطلبات، حاول مرة أخرى خلال {retry_after}s"
                )
    
    async def reset(self, key: str):
        """إعادة تعيين النوافذ"""
        with self.lock:
            # حذف جميع النوافذ المرتبطة بالمفتاح
            keys_to_delete = [k for k in self.windows.keys() if k.startswith(f"{key}:")]
            for k in keys_to_delete:
                del self.windows[k]
            
            if keys_to_delete:
                logger.debug(f"🗑️ تم إعادة تعيين {len(keys_to_delete)} نافذة ثابتة: {key}")
    
    def get_state(self, key: str) -> Dict[str, Any]:
        """الحصول على حالة النوافذ"""
        with self.lock:
            windows = {}
            for window_key, window_data in self.windows.items():
                if window_key.startswith(f"{key}:"):
                    windows[window_key] = window_data.copy()
            
            return {
                'algorithm': 'fixed_window',
                'windows': windows
            }

class RateLimiter:
    """
    ⏱️ محدد معدل الطلبات المتقدم
    
    يوفر نظام شامل لتحديد معدل الطلبات مع دعم:
    - خوارزميات متعددة
    - حدود مخصصة
    - إحصائيات مفصلة
    - تنظيف تلقائي
    """
    
    def __init__(self, default_algorithm: RateLimitType = RateLimitType.TOKEN_BUCKET):
        """
        تهيئة محدد معدل الطلبات
        
        Args:
            default_algorithm: الخوارزمية الافتراضية
        """
        self.default_algorithm = default_algorithm
        
        # الخوارزميات المتاحة
        self.algorithms = {
            RateLimitType.TOKEN_BUCKET: TokenBucket(),
            RateLimitType.SLIDING_WINDOW: SlidingWindow(),
            RateLimitType.FIXED_WINDOW: FixedWindow()
        }
        
        # حدود معدل الطلبات المسجلة
        self.rate_limits: Dict[str, RateLimit] = {}
        
        # إحصائيات
        self.stats = {
            'total_requests': 0,
            'allowed_requests': 0,
            'denied_requests': 0,
            'warning_requests': 0,
            'start_time': datetime.now(),
            'requests_by_key': defaultdict(int),
            'denials_by_key': defaultdict(int)
        }
        
        # مهام التنظيف
        self.cleanup_task = None
        self.cleanup_interval = 300  # 5 دقائق
        
        logger.info(f"⏱️ تم تهيئة محدد معدل الطلبات (الخوارزمية الافتراضية: {default_algorithm.value})")
    
    def register_rate_limit(self, rate_limit: RateLimit):
        """
        تسجيل حد معدل طلبات
        
        Args:
            rate_limit: حد معدل الطلبات
        """
        self.rate_limits[rate_limit.key] = rate_limit
        logger.info(f"📝 تم تسجيل حد معدل طلبات: {rate_limit.key} ({rate_limit.limit}/{rate_limit.window_seconds}s)")
    
    async def is_allowed(
        self,
        key: str,
        limit: Optional[int] = None,
        window_seconds: Optional[int] = None,
        algorithm: Optional[RateLimitType] = None
    ) -> RateLimitResult:
        """
        فحص ما إذا كان الطلب مسموح
        
        Args:
            key: مفتاح التعريف
            limit: عدد الطلبات المسموحة (اختياري)
            window_seconds: نافذة الوقت (اختياري)
            algorithm: الخوارزمية (اختياري)
            
        Returns:
            RateLimitResult: نتيجة الفحص
        """
        # الحصول على حد معدل الطلبات
        if key in self.rate_limits:
            rate_limit = self.rate_limits[key]
        elif limit is not None and window_seconds is not None:
            # إنشاء حد مؤقت
            rate_limit = RateLimit(
                key=key,
                limit=limit,
                window_seconds=window_seconds,
                algorithm=algorithm or self.default_algorithm
            )
        else:
            # لا يوجد حد محدد
            return RateLimitResult(
                allowed=True,
                status=RateLimitStatus.ALLOWED,
                message="لا يوجد حد معدل طلبات محدد"
            )
        
        # اختيار الخوارزمية
        algorithm_impl = self.algorithms.get(rate_limit.algorithm)
        if algorithm_impl is None:
            logger.warning(f"⚠️ خوارزمية غير مدعومة: {rate_limit.algorithm}")
            algorithm_impl = self.algorithms[self.default_algorithm]
        
        # فحص الطلب
        result = await algorithm_impl.is_allowed(rate_limit)
        
        # تحديث الإحصائيات
        self._update_statistics(key, result)
        
        return result
    
    async def reset_key(self, key: str):
        """
        إعادة تعيين حالة مفتاح معين
        
        Args:
            key: المفتاح
        """
        # إعادة تعيين في جميع الخوارزميات
        for algorithm in self.algorithms.values():
            await algorithm.reset(key)
        
        logger.info(f"🔄 تم إعادة تعيين حالة المفتاح: {key}")
    
    async def reset_all(self):
        """إعادة تعيين جميع الحالات"""
        for key in list(self.rate_limits.keys()):
            await self.reset_key(key)
        
        # إعادة تعيين الإحصائيات
        self.stats = {
            'total_requests': 0,
            'allowed_requests': 0,
            'denied_requests': 0,
            'warning_requests': 0,
            'start_time': datetime.now(),
            'requests_by_key': defaultdict(int),
            'denials_by_key': defaultdict(int)
        }
        
        logger.info("🔄 تم إعادة تعيين جميع حالات محدد معدل الطلبات")
    
    def get_key_state(self, key: str) -> Dict[str, Any]:
        """
        الحصول على حالة مفتاح معين
        
        Args:
            key: المفتاح
            
        Returns:
            Dict[str, Any]: حالة المفتاح في جميع الخوارزميات
        """
        state = {}
        
        for algorithm_type, algorithm in self.algorithms.items():
            algorithm_state = algorithm.get_state(key)
            if algorithm_state:
                state[algorithm_type.value] = algorithm_state
        
        return state
    
    def _update_statistics(self, key: str, result: RateLimitResult):
        """تحديث الإحصائيات"""
        self.stats['total_requests'] += 1
        self.stats['requests_by_key'][key] += 1
        
        if result.status == RateLimitStatus.ALLOWED:
            self.stats['allowed_requests'] += 1
        elif result.status == RateLimitStatus.DENIED:
            self.stats['denied_requests'] += 1
            self.stats['denials_by_key'][key] += 1
        elif result.status == RateLimitStatus.WARNING:
            self.stats['warning_requests'] += 1
    
    def get_statistics(self) -> Dict[str, Any]:
        """الحصول على الإحصائيات"""
        total_requests = self.stats['total_requests']
        uptime = (datetime.now() - self.stats['start_time']).total_seconds()
        
        stats = self.stats.copy()
        stats.update({
            'uptime_seconds': uptime,
            'requests_per_second': round(total_requests / max(uptime, 1), 2),
            'allowed_percentage': round(
                (self.stats['allowed_requests'] / max(total_requests, 1)) * 100, 2
            ),
            'denied_percentage': round(
                (self.stats['denied_requests'] / max(total_requests, 1)) * 100, 2
            ),
            'warning_percentage': round(
                (self.stats['warning_requests'] / max(total_requests, 1)) * 100, 2
            ),
            'top_requesters': dict(
                sorted(self.stats['requests_by_key'].items(), key=lambda x: x[1], reverse=True)[:10]
            ),
            'top_denied': dict(
                sorted(self.stats['denials_by_key'].items(), key=lambda x: x[1], reverse=True)[:10]
            )
        })
        
        return stats
    
    def reset_statistics(self):
        """إعادة تعيين الإحصائيات"""
        self.stats = {
            'total_requests': 0,
            'allowed_requests': 0,
            'denied_requests': 0,
            'warning_requests': 0,
            'start_time': datetime.now(),
            'requests_by_key': defaultdict(int),
            'denials_by_key': defaultdict(int)
        }
        logger.info("📊 تم إعادة تعيين إحصائيات محدد معدل الطلبات")
    
    async def start_cleanup_task(self):
        """بدء مهمة التنظيف التلقائي"""
        if self.cleanup_task is None:
            self.cleanup_task = asyncio.create_task(self._cleanup_loop())
            logger.info("🧹 تم بدء مهمة التنظيف التلقائي لمحدد معدل الطلبات")
    
    async def stop_cleanup_task(self):
        """إيقاف مهمة التنظيف التلقائي"""
        if self.cleanup_task:
            self.cleanup_task.cancel()
            try:
                await self.cleanup_task
            except asyncio.CancelledError:
                pass
            self.cleanup_task = None
            logger.info("🛑 تم إيقاف مهمة التنظيف التلقائي لمحدد معدل الطلبات")
    
    async def _cleanup_loop(self):
        """حلقة التنظيف التلقائي"""
        while True:
            try:
                await asyncio.sleep(self.cleanup_interval)
                await self._cleanup_expired_data()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.warning(f"⚠️ خطأ في مهمة التنظيف: {e}")
    
    async def _cleanup_expired_data(self):
        """تنظيف البيانات المنتهية الصلاحية"""
        try:
            current_time = time.time()
            cleanup_count = 0
            
            # تنظيف النوافذ المنزلقة
            sliding_window = self.algorithms[RateLimitType.SLIDING_WINDOW]
            if hasattr(sliding_window, 'windows'):
                for key, window in list(sliding_window.windows.items()):
                    # إزالة الطلبات القديمة
                    if key in self.rate_limits:
                        rate_limit = self.rate_limits[key]
                        window_start = current_time - rate_limit.window_seconds
                        
                        original_size = len(window)
                        while window and window[0] < window_start:
                            window.popleft()
                        
                        cleanup_count += original_size - len(window)
                        
                        # حذف النوافذ الفارغة
                        if not window:
                            del sliding_window.windows[key]
            
            # تنظيف النوافذ الثابتة
            fixed_window = self.algorithms[RateLimitType.FIXED_WINDOW]
            if hasattr(fixed_window, 'windows'):
                for window_key, window_data in list(fixed_window.windows.items()):
                    if window_data['end_time'] < current_time:
                        del fixed_window.windows[window_key]
                        cleanup_count += 1
            
            if cleanup_count > 0:
                logger.debug(f"🧹 تم تنظيف {cleanup_count} عنصر منتهي الصلاحية")
                
        except Exception as e:
            logger.warning(f"⚠️ فشل في تنظيف البيانات المنتهية الصلاحية: {e}")

# محدد معدل الطلبات العام
_global_rate_limiter = None

def get_rate_limiter(algorithm: RateLimitType = RateLimitType.TOKEN_BUCKET) -> RateLimiter:
    """
    الحصول على محدد معدل الطلبات العام
    
    Args:
        algorithm: الخوارزمية الافتراضية
        
    Returns:
        RateLimiter: محدد معدل الطلبات
    """
    global _global_rate_limiter
    
    if _global_rate_limiter is None:
        _global_rate_limiter = RateLimiter(default_algorithm=algorithm)
    
    return _global_rate_limiter

# دوال مساعدة سريعة
async def check_rate_limit(
    key: str,
    limit: int,
    window_seconds: int,
    algorithm: RateLimitType = RateLimitType.TOKEN_BUCKET
) -> bool:
    """
    فحص سريع لمعدل الطلبات
    
    Args:
        key: مفتاح التعريف
        limit: عدد الطلبات المسموحة
        window_seconds: نافذة الوقت
        algorithm: الخوارزمية
        
    Returns:
        bool: مسموح أم لا
    """
    limiter = get_rate_limiter()
    result = await limiter.is_allowed(key, limit, window_seconds, algorithm)
    return result.allowed

def rate_limit_decorator(
    limit: int,
    window_seconds: int,
    algorithm: RateLimitType = RateLimitType.TOKEN_BUCKET,
    key_func: Optional[callable] = None
):
    """
    Decorator لتحديد معدل الطلبات
    
    Args:
        limit: عدد الطلبات المسموحة
        window_seconds: نافذة الوقت
        algorithm: الخوارزمية
        key_func: دالة لإنشاء المفتاح
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # إنشاء المفتاح
            if key_func:
                key = key_func(*args, **kwargs)
            else:
                key = f"{func.__module__}.{func.__name__}"
            
            # فحص معدل الطلبات
            limiter = get_rate_limiter()
            result = await limiter.is_allowed(key, limit, window_seconds, algorithm)
            
            if not result.allowed:
                raise Exception(f"Rate limit exceeded: {result.message}")
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator

# تصدير الوحدات المهمة
__all__ = [
    'RateLimiter',
    'RateLimit',
    'RateLimitResult',
    'RateLimitType',
    'RateLimitStatus',
    'RateLimitAlgorithm',
    'TokenBucket',
    'SlidingWindow',
    'FixedWindow',
    'get_rate_limiter',
    'check_rate_limit',
    'rate_limit_decorator'
]

