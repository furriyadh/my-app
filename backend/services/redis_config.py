"""
Redis Configuration - إعداد Redis مُصحح ومُحسن
يحل مشاكل الاتصال ويوفر fallback آمن
"""
import redis
import logging
import os
import time
from typing import Optional, Any, Dict
from functools import wraps

# إعداد التسجيل
logger = logging.getLogger(__name__)

class RedisManager:
    """مدير Redis مع معالجة أخطاء متقدمة"""
    
    def __init__(self):
        self.client: Optional[redis.Redis] = None
        self.connected = False
        self.last_connection_attempt = 0
        self.connection_retry_delay = 30  # 30 ثانية بين المحاولات
        
        # إعدادات الاتصال
        self.config = {
            'host': os.getenv('REDIS_HOST', 'localhost'),
            'port': int(os.getenv('REDIS_PORT', 6379)),
            'db': int(os.getenv('REDIS_DB', 0)),
            'decode_responses': True,
            'socket_connect_timeout': 5,
            'socket_timeout': 5,
            'retry_on_timeout': True,
            'health_check_interval': 30
        }
        
        # محاولة الاتصال الأولي
        self._connect()
    
    def _connect(self) -> bool:
        """محاولة الاتصال بـ Redis"""
        try:
            current_time = time.time()
            
            # تجنب المحاولات المتكررة
            if (current_time - self.last_connection_attempt) < self.connection_retry_delay:
                return self.connected
            
            self.last_connection_attempt = current_time
            
            # إنشاء اتصال جديد
            self.client = redis.Redis(**self.config)
            
            # اختبار الاتصال
            self.client.ping()
            
            self.connected = True
            logger.info("✅ تم الاتصال بـ Redis بنجاح")
            return True
            
        except redis.ConnectionError as e:
            self.connected = False
            logger.warning(f"⚠️ فشل الاتصال بـ Redis: {e}")
            return False
        except Exception as e:
            self.connected = False
            logger.error(f"❌ خطأ غير متوقع في Redis: {e}")
            return False
    
    def _ensure_connection(self) -> bool:
        """التأكد من وجود اتصال صالح"""
        if not self.connected or not self.client:
            return self._connect()
        
        try:
            # اختبار الاتصال الحالي
            self.client.ping()
            return True
        except:
            # إعادة الاتصال
            return self._connect()
    
    def get(self, key: str, default: Any = None) -> Any:
        """الحصول على قيمة من Redis مع fallback"""
        try:
            if not self._ensure_connection():
                logger.debug(f"Redis غير متاح - استخدام القيمة الافتراضية لـ {key}")
                return default
            
            value = self.client.get(key)
            return value if value is not None else default
            
        except Exception as e:
            logger.warning(f"خطأ في قراءة {key} من Redis: {e}")
            return default
    
    def set(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        """تعيين قيمة في Redis مع معالجة الأخطاء"""
        try:
            if not self._ensure_connection():
                logger.debug(f"Redis غير متاح - تجاهل تعيين {key}")
                return False
            
            result = self.client.set(key, value, ex=ex)
            return bool(result)
            
        except Exception as e:
            logger.warning(f"خطأ في كتابة {key} إلى Redis: {e}")
            return False
    
    def delete(self, *keys: str) -> int:
        """حذف مفاتيح من Redis"""
        try:
            if not self._ensure_connection():
                logger.debug(f"Redis غير متاح - تجاهل حذف {keys}")
                return 0
            
            return self.client.delete(*keys)
            
        except Exception as e:
            logger.warning(f"خطأ في حذف {keys} من Redis: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """فحص وجود مفتاح في Redis"""
        try:
            if not self._ensure_connection():
                return False
            
            return bool(self.client.exists(key))
            
        except Exception as e:
            logger.warning(f"خطأ في فحص وجود {key} في Redis: {e}")
            return False
    
    def expire(self, key: str, time: int) -> bool:
        """تعيين انتهاء صلاحية لمفتاح"""
        try:
            if not self._ensure_connection():
                return False
            
            return bool(self.client.expire(key, time))
            
        except Exception as e:
            logger.warning(f"خطأ في تعيين انتهاء صلاحية {key}: {e}")
            return False
    
    def get_status(self) -> Dict[str, Any]:
        """الحصول على حالة Redis"""
        status = {
            'connected': self.connected,
            'host': self.config['host'],
            'port': self.config['port'],
            'db': self.config['db'],
            'last_connection_attempt': self.last_connection_attempt
        }
        
        if self.connected and self.client:
            try:
                info = self.client.info()
                status.update({
                    'redis_version': info.get('redis_version', 'unknown'),
                    'used_memory': info.get('used_memory_human', 'unknown'),
                    'connected_clients': info.get('connected_clients', 0),
                    'uptime_in_seconds': info.get('uptime_in_seconds', 0)
                })
            except:
                pass
        
        return status
    
    def health_check(self) -> bool:
        """فحص صحة Redis"""
        return self._ensure_connection()

# إنشاء مثيل عام
redis_manager = RedisManager()

# دوال مساعدة للاستخدام المباشر
def get_redis_client() -> Optional[redis.Redis]:
    """الحصول على عميل Redis"""
    if redis_manager._ensure_connection():
        return redis_manager.client
    return None

def is_redis_available() -> bool:
    """فحص توفر Redis"""
    return redis_manager.connected

def get_redis_status() -> Dict[str, Any]:
    """الحصول على حالة Redis"""
    return redis_manager.get_status()

# Decorator للدوال التي تستخدم Redis
def redis_fallback(fallback_value=None):
    """Decorator لتوفير fallback عند فشل Redis"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                if not is_redis_available():
                    logger.debug(f"Redis غير متاح - استخدام fallback في {func.__name__}")
                    return fallback_value
                
                return func(*args, **kwargs)
                
            except Exception as e:
                logger.warning(f"خطأ في {func.__name__}: {e}")
                return fallback_value
        
        return wrapper
    return decorator

# دوال مساعدة مع fallback
@redis_fallback(fallback_value=None)
def cache_get(key: str, default=None):
    """الحصول على قيمة من cache مع fallback"""
    return redis_manager.get(key, default)

@redis_fallback(fallback_value=False)
def cache_set(key: str, value: Any, timeout: Optional[int] = None):
    """تعيين قيمة في cache مع fallback"""
    return redis_manager.set(key, value, ex=timeout)

@redis_fallback(fallback_value=0)
def cache_delete(*keys: str):
    """حذف مفاتيح من cache مع fallback"""
    return redis_manager.delete(*keys)

# تصدير الدوال والكلاسات
__all__ = [
    'RedisManager',
    'redis_manager',
    'get_redis_client',
    'is_redis_available',
    'get_redis_status',
    'redis_fallback',
    'cache_get',
    'cache_set',
    'cache_delete'
]

# تسجيل حالة التحميل
logger.info(f"🔧 تم تحميل Redis Manager - متصل: {redis_manager.connected}")

