"""
Redis Configuration Manager
مدير إعدادات Redis المتطور

نظام شامل لإدارة Redis يتضمن:
- إدارة الاتصالات مع Connection Pooling
- التخزين المؤقت الذكي مع TTL
- إدارة الجلسات والمصادقة
- مراقبة الأداء والإحصائيات
- دعم Redis Cluster والتوزيع
- آليات الاسترداد والأمان
"""

import os
import json
import logging
import time
import threading
from typing import Dict, Any, Optional, List, Union, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from functools import wraps
import hashlib

# استيراد Redis مع معالجة أخطاء متقدمة
try:
    import redis
    from redis.connection import ConnectionPool
    from redis.sentinel import Sentinel
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logging.warning("Redis library not available, using memory fallback")

logger = logging.getLogger(__name__)

@dataclass
class RedisConnectionConfig:
    """إعدادات اتصال Redis"""
    host: str = 'localhost'
    port: int = 6379
    password: Optional[str] = None
    db: int = 0
    username: Optional[str] = None
    
    # إعدادات الاتصال
    socket_timeout: float = 5.0
    socket_connect_timeout: float = 5.0
    socket_keepalive: bool = True
    socket_keepalive_options: Dict[str, int] = None
    
    # إعدادات Connection Pool
    max_connections: int = 50
    retry_on_timeout: bool = True
    health_check_interval: int = 30
    
    # إعدادات SSL
    ssl: bool = False
    ssl_cert_reqs: str = 'required'
    ssl_ca_certs: Optional[str] = None
    ssl_certfile: Optional[str] = None
    ssl_keyfile: Optional[str] = None
    
    # إعدادات Sentinel (للتوزيع)
    sentinel_hosts: Optional[List[tuple]] = None
    sentinel_service_name: Optional[str] = None
    
    def __post_init__(self):
        # تحميل من متغيرات البيئة
        self.host = os.getenv('REDIS_HOST', self.host)
        self.port = int(os.getenv('REDIS_PORT', self.port))
        self.password = os.getenv('REDIS_PASSWORD', self.password)
        self.db = int(os.getenv('REDIS_DB', self.db))
        self.username = os.getenv('REDIS_USERNAME', self.username)
        
        # إعدادات SSL من البيئة
        self.ssl = os.getenv('REDIS_SSL', 'false').lower() == 'true'
        self.ssl_ca_certs = os.getenv('REDIS_SSL_CA_CERTS', self.ssl_ca_certs)
        
        # إعدادات Connection Pool
        self.max_connections = int(os.getenv('REDIS_MAX_CONNECTIONS', self.max_connections))
        
        if self.socket_keepalive_options is None:
            self.socket_keepalive_options = {}

def redis_operation(retry_count: int = 3, fallback_value: Any = None):
    """Decorator لعمليات Redis مع إعادة المحاولة والاسترداد"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            if not self.is_available:
                logger.warning(f"Redis غير متاح، استخدام القيمة الاحتياطية لـ {func.__name__}")
                return fallback_value
            
            last_exception = None
            for attempt in range(retry_count):
                try:
                    start_time = time.time()
                    result = func(self, *args, **kwargs)
                    
                    # تتبع الأداء
                    execution_time = time.time() - start_time
                    self._track_operation(func.__name__, True, execution_time)
                    
                    return result
                    
                except redis.ConnectionError as e:
                    last_exception = e
                    logger.warning(f"خطأ اتصال Redis في المحاولة {attempt + 1}: {str(e)}")
                    if attempt < retry_count - 1:
                        time.sleep(0.5 * (2 ** attempt))  # Exponential backoff
                        self._reconnect()
                    
                except redis.TimeoutError as e:
                    last_exception = e
                    logger.warning(f"انتهت مهلة Redis في المحاولة {attempt + 1}: {str(e)}")
                    if attempt < retry_count - 1:
                        time.sleep(0.2 * (2 ** attempt))
                    
                except Exception as e:
                    last_exception = e
                    logger.error(f"خطأ غير متوقع في Redis: {str(e)}")
                    break
            
            # تتبع الفشل
            self._track_operation(func.__name__, False, 0)
            logger.error(f"فشل في جميع محاولات {func.__name__}: {str(last_exception)}")
            return fallback_value
            
        return wrapper
    return decorator

class MemoryFallback:
    """نظام احتياطي للتخزين في الذاكرة عند عدم توفر Redis"""
    
    def __init__(self):
        self._data = {}
        self._expiry = {}
        self._lock = threading.RLock()
        
        # تنظيف دوري للبيانات المنتهية الصلاحية
        self._cleanup_thread = threading.Thread(target=self._cleanup_expired, daemon=True)
        self._cleanup_thread.start()
    
    def _cleanup_expired(self):
        """تنظيف البيانات المنتهية الصلاحية"""
        while True:
            try:
                current_time = time.time()
                with self._lock:
                    expired_keys = [
                        key for key, expiry in self._expiry.items()
                        if expiry and expiry < current_time
                    ]
                    for key in expired_keys:
                        self._data.pop(key, None)
                        self._expiry.pop(key, None)
                
                time.sleep(60)  # تنظيف كل دقيقة
            except Exception as e:
                logger.error(f"خطأ في تنظيف الذاكرة: {str(e)}")
                time.sleep(60)
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """حفظ قيمة في الذاكرة"""
        try:
            with self._lock:
                self._data[key] = value
                if ttl:
                    self._expiry[key] = time.time() + ttl
                else:
                    self._expiry[key] = None
            return True
        except Exception:
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """جلب قيمة من الذاكرة"""
        try:
            with self._lock:
                if key not in self._data:
                    return None
                
                # فحص انتهاء الصلاحية
                expiry = self._expiry.get(key)
                if expiry and expiry < time.time():
                    self._data.pop(key, None)
                    self._expiry.pop(key, None)
                    return None
                
                return self._data[key]
        except Exception:
            return None
    
    def delete(self, key: str) -> bool:
        """حذف قيمة من الذاكرة"""
        try:
            with self._lock:
                self._data.pop(key, None)
                self._expiry.pop(key, None)
            return True
        except Exception:
            return False
    
    def exists(self, key: str) -> bool:
        """فحص وجود مفتاح"""
        return self.get(key) is not None
    
    def clear(self) -> int:
        """مسح جميع البيانات"""
        try:
            with self._lock:
                count = len(self._data)
                self._data.clear()
                self._expiry.clear()
            return count
        except Exception:
            return 0

class RedisManager:
    """مدير Redis المتطور مع ميزات متقدمة"""
    
    def __init__(self, config: Optional[RedisConnectionConfig] = None):
        """تهيئة مدير Redis"""
        self.config = config or RedisConnectionConfig()
        self.client = None
        self.pool = None
        self.sentinel = None
        self.is_available = False
        self._lock = threading.RLock()
        
        # نظام احتياطي للذاكرة
        self.memory_fallback = MemoryFallback()
        
        # إعدادات التخزين المؤقت
        self.cache_prefix = os.getenv('REDIS_CACHE_PREFIX', 'google_ads_ai:')
        self.default_ttl = int(os.getenv('REDIS_DEFAULT_TTL', 3600))
        self.session_ttl = int(os.getenv('REDIS_SESSION_TTL', 86400))
        
        # إحصائيات الأداء
        self.metrics = {
            'total_operations': 0,
            'successful_operations': 0,
            'failed_operations': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'average_response_time': 0.0,
            'last_operation_time': None,
            'connection_errors': 0,
            'timeout_errors': 0,
            'operations_by_type': {}
        }
        
        # تهيئة الاتصال
        self._initialize_connection()
        
        # بدء مراقبة الصحة
        self._start_health_monitor()
    
    def _initialize_connection(self):
        """تهيئة اتصال Redis"""
        if not REDIS_AVAILABLE:
            logger.warning("Redis library غير متاح، سيتم استخدام التخزين في الذاكرة")
            return
        
        try:
            # إعداد Sentinel إذا كان متاحاً
            if self.config.sentinel_hosts and self.config.sentinel_service_name:
                self._setup_sentinel()
            else:
                self._setup_direct_connection()
            
            # اختبار الاتصال
            if self.client:
                self.client.ping()
                self.is_available = True
                logger.info("✅ تم الاتصال بـ Redis بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في الاتصال بـ Redis: {str(e)}")
            self.is_available = False
            self.client = None
    
    def _setup_sentinel(self):
        """إعداد Redis Sentinel للتوزيع"""
        try:
            self.sentinel = Sentinel(
                self.config.sentinel_hosts,
                socket_timeout=self.config.socket_timeout,
                socket_connect_timeout=self.config.socket_connect_timeout
            )
            
            self.client = self.sentinel.master_for(
                self.config.sentinel_service_name,
                socket_timeout=self.config.socket_timeout,
                password=self.config.password,
                db=self.config.db
            )
            
            logger.info("تم إعداد Redis Sentinel بنجاح")
            
        except Exception as e:
            logger.error(f"فشل في إعداد Redis Sentinel: {str(e)}")
            raise
    
    def _setup_direct_connection(self):
        """إعداد اتصال مباشر بـ Redis"""
        try:
            # إنشاء Connection Pool
            pool_kwargs = {
                'host': self.config.host,
                'port': self.config.port,
                'password': self.config.password,
                'db': self.config.db,
                'socket_timeout': self.config.socket_timeout,
                'socket_connect_timeout': self.config.socket_connect_timeout,
                'socket_keepalive': self.config.socket_keepalive,
                'socket_keepalive_options': self.config.socket_keepalive_options,
                'max_connections': self.config.max_connections,
                'retry_on_timeout': self.config.retry_on_timeout,
                'health_check_interval': self.config.health_check_interval,
                'decode_responses': True
            }
            
            # إضافة إعدادات المصادقة
            if self.config.username:
                pool_kwargs['username'] = self.config.username
            
            # إضافة إعدادات SSL
            if self.config.ssl:
                pool_kwargs.update({
                    'ssl': True,
                    'ssl_cert_reqs': self.config.ssl_cert_reqs,
                    'ssl_ca_certs': self.config.ssl_ca_certs,
                    'ssl_certfile': self.config.ssl_certfile,
                    'ssl_keyfile': self.config.ssl_keyfile
                })
            
            self.pool = ConnectionPool(**pool_kwargs)
            self.client = redis.Redis(connection_pool=self.pool)
            
            logger.info("تم إعداد اتصال Redis المباشر بنجاح")
            
        except Exception as e:
            logger.error(f"فشل في إعداد اتصال Redis: {str(e)}")
            raise
    
    def _reconnect(self):
        """إعادة الاتصال بـ Redis"""
        try:
            with self._lock:
                logger.info("محاولة إعادة الاتصال بـ Redis...")
                self._initialize_connection()
        except Exception as e:
            logger.error(f"فشل في إعادة الاتصال: {str(e)}")
    
    def _start_health_monitor(self):
        """بدء مراقبة صحة الاتصال"""
        def health_check():
            while True:
                try:
                    if self.is_available and self.client:
                        self.client.ping()
                    elif not self.is_available:
                        # محاولة إعادة الاتصال
                        self._reconnect()
                    
                    time.sleep(30)  # فحص كل 30 ثانية
                    
                except Exception as e:
                    logger.warning(f"فشل في فحص صحة Redis: {str(e)}")
                    self.is_available = False
                    time.sleep(10)  # إعادة المحاولة بعد 10 ثوان
        
        health_thread = threading.Thread(target=health_check, daemon=True)
        health_thread.start()
    
    def _track_operation(self, operation_name: str, success: bool, response_time: float):
        """تتبع إحصائيات العمليات"""
        with self._lock:
            self.metrics['total_operations'] += 1
            self.metrics['last_operation_time'] = time.time()
            
            if success:
                self.metrics['successful_operations'] += 1
            else:
                self.metrics['failed_operations'] += 1
            
            # تحديث متوسط وقت الاستجابة
            if response_time > 0:
                total_time = (self.metrics['average_response_time'] * 
                            (self.metrics['total_operations'] - 1))
                self.metrics['average_response_time'] = (
                    (total_time + response_time) / self.metrics['total_operations']
                )
            
            # تتبع العمليات حسب النوع
            self.metrics['operations_by_type'][operation_name] = (
                self.metrics['operations_by_type'].get(operation_name, 0) + 1
            )
    
    def _get_full_key(self, key: str) -> str:
        """الحصول على المفتاح الكامل مع البادئة"""
        return f"{self.cache_prefix}{key}"
    
    def _serialize_value(self, value: Any) -> str:
        """تحويل القيمة إلى نص للتخزين"""
        if isinstance(value, (dict, list, tuple)):
            return json.dumps(value, ensure_ascii=False, default=str)
        elif isinstance(value, (int, float, bool)):
            return json.dumps(value)
        else:
            return str(value)
    
    def _deserialize_value(self, value: str) -> Any:
        """تحويل النص إلى قيمة"""
        if not value:
            return None
        
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return value
    
    # ===========================================
    # العمليات الأساسية
    # ===========================================
    
    @redis_operation(retry_count=3, fallback_value=False)
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """حفظ قيمة في Redis"""
        full_key = self._get_full_key(key)
        serialized_value = self._serialize_value(value)
        ttl = ttl or self.default_ttl
        
        if self.is_available:
            result = self.client.setex(full_key, ttl, serialized_value)
            return bool(result)
        else:
            return self.memory_fallback.set(full_key, value, ttl)
    
    @redis_operation(retry_count=3, fallback_value=None)
    def get(self, key: str) -> Optional[Any]:
        """جلب قيمة من Redis"""
        full_key = self._get_full_key(key)
        
        if self.is_available:
            value = self.client.get(full_key)
            if value is not None:
                self.metrics['cache_hits'] += 1
                return self._deserialize_value(value)
            else:
                self.metrics['cache_misses'] += 1
                return None
        else:
            value = self.memory_fallback.get(full_key)
            if value is not None:
                self.metrics['cache_hits'] += 1
            else:
                self.metrics['cache_misses'] += 1
            return value
    
    @redis_operation(retry_count=3, fallback_value=False)
    def delete(self, key: str) -> bool:
        """حذف قيمة من Redis"""
        full_key = self._get_full_key(key)
        
        if self.is_available:
            result = self.client.delete(full_key)
            return bool(result)
        else:
            return self.memory_fallback.delete(full_key)
    
    @redis_operation(retry_count=3, fallback_value=False)
    def exists(self, key: str) -> bool:
        """فحص وجود مفتاح في Redis"""
        full_key = self._get_full_key(key)
        
        if self.is_available:
            return bool(self.client.exists(full_key))
        else:
            return self.memory_fallback.exists(full_key)
    
    @redis_operation(retry_count=3, fallback_value=0)
    def expire(self, key: str, ttl: int) -> bool:
        """تحديد مدة انتهاء صلاحية المفتاح"""
        full_key = self._get_full_key(key)
        
        if self.is_available:
            return bool(self.client.expire(full_key, ttl))
        else:
            # للذاكرة، نحتاج لإعادة تعيين القيمة مع TTL جديد
            value = self.memory_fallback.get(full_key)
            if value is not None:
                return self.memory_fallback.set(full_key, value, ttl)
            return False
    
    @redis_operation(retry_count=3, fallback_value=-1)
    def ttl(self, key: str) -> int:
        """الحصول على الوقت المتبقي لانتهاء صلاحية المفتاح"""
        full_key = self._get_full_key(key)
        
        if self.is_available:
            return self.client.ttl(full_key)
        else:
            # للذاكرة، نحتاج لحساب TTL يدوياً
            if full_key in self.memory_fallback._expiry:
                expiry = self.memory_fallback._expiry[full_key]
                if expiry:
                    remaining = int(expiry - time.time())
                    return max(remaining, -1)
                else:
                    return -1  # لا ينتهي
            return -2  # غير موجود
    
    # ===========================================
    # عمليات متقدمة
    # ===========================================
    
    @redis_operation(retry_count=3, fallback_value=0)
    def increment(self, key: str, amount: int = 1) -> int:
        """زيادة قيمة رقمية"""
        full_key = self._get_full_key(key)
        
        if self.is_available:
            return self.client.incrby(full_key, amount)
        else:
            # تنفيذ في الذاكرة
            current = self.memory_fallback.get(full_key) or 0
            new_value = int(current) + amount
            self.memory_fallback.set(full_key, new_value)
            return new_value
    
    @redis_operation(retry_count=3, fallback_value=0)
    def decrement(self, key: str, amount: int = 1) -> int:
        """تقليل قيمة رقمية"""
        return self.increment(key, -amount)
    
    @redis_operation(retry_count=3, fallback_value=[])
    def get_keys_by_pattern(self, pattern: str) -> List[str]:
        """الحصول على المفاتيح حسب النمط"""
        full_pattern = self._get_full_key(pattern)
        
        if self.is_available:
            keys = self.client.keys(full_pattern)
            # إزالة البادئة من النتائج
            return [key.replace(self.cache_prefix, '') for key in keys]
        else:
            # البحث في الذاكرة
            import fnmatch
            matching_keys = []
            for key in self.memory_fallback._data.keys():
                if fnmatch.fnmatch(key, full_pattern):
                    matching_keys.append(key.replace(self.cache_prefix, ''))
            return matching_keys
    
    @redis_operation(retry_count=3, fallback_value=0)
    def clear_cache(self, pattern: str = "*") -> int:
        """مسح التخزين المؤقت حسب النمط"""
        keys = self.get_keys_by_pattern(pattern)
        deleted_count = 0
        
        for key in keys:
            if self.delete(key):
                deleted_count += 1
        
        return deleted_count
    
    # ===========================================
    # إدارة الجلسات
    # ===========================================
    
    def set_session(self, session_id: str, data: Dict[str, Any], 
                   ttl: Optional[int] = None) -> bool:
        """حفظ بيانات الجلسة"""
        ttl = ttl or self.session_ttl
        return self.set(f"session:{session_id}", data, ttl)
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """جلب بيانات الجلسة"""
        return self.get(f"session:{session_id}")
    
    def delete_session(self, session_id: str) -> bool:
        """حذف الجلسة"""
        return self.delete(f"session:{session_id}")
    
    def extend_session(self, session_id: str, ttl: Optional[int] = None) -> bool:
        """تمديد مدة الجلسة"""
        ttl = ttl or self.session_ttl
        return self.expire(f"session:{session_id}", ttl)
    
    def get_active_sessions(self) -> List[str]:
        """الحصول على الجلسات النشطة"""
        session_keys = self.get_keys_by_pattern("session:*")
        return [key.replace("session:", "") for key in session_keys]
    
    # ===========================================
    # إدارة المعاملات
    # ===========================================
    
    @redis_operation(retry_count=3, fallback_value=False)
    def atomic_update(self, key: str, update_func: Callable[[Any], Any], 
                     max_retries: int = 10) -> bool:
        """تحديث ذري للقيمة"""
        if not self.is_available:
            # للذاكرة، استخدام lock
            with self.memory_fallback._lock:
                current_value = self.memory_fallback.get(self._get_full_key(key))
                new_value = update_func(current_value)
                return self.memory_fallback.set(self._get_full_key(key), new_value)
        
        # للـ Redis، استخدام WATCH/MULTI/EXEC
        full_key = self._get_full_key(key)
        
        for _ in range(max_retries):
            try:
                with self.client.pipeline() as pipe:
                    pipe.watch(full_key)
                    current_value = pipe.get(full_key)
                    if current_value:
                        current_value = self._deserialize_value(current_value)
                    
                    new_value = update_func(current_value)
                    serialized_value = self._serialize_value(new_value)
                    
                    pipe.multi()
                    pipe.set(full_key, serialized_value)
                    pipe.execute()
                    return True
                    
            except redis.WatchError:
                continue  # إعادة المحاولة
            except Exception as e:
                logger.error(f"خطأ في التحديث الذري: {str(e)}")
                return False
        
        return False
    
    # ===========================================
    # المراقبة والإحصائيات
    # ===========================================
    
    def get_metrics(self) -> Dict[str, Any]:
        """الحصول على إحصائيات الأداء"""
        metrics = self.metrics.copy()
        
        # إضافة معلومات إضافية
        metrics.update({
            'is_available': self.is_available,
            'cache_hit_rate': (
                self.metrics['cache_hits'] / 
                max(self.metrics['cache_hits'] + self.metrics['cache_misses'], 1)
            ) * 100,
            'success_rate': (
                self.metrics['successful_operations'] / 
                max(self.metrics['total_operations'], 1)
            ) * 100,
            'config': asdict(self.config),
            'timestamp': datetime.utcnow().isoformat()
        })
        
        return metrics
    
    def get_redis_info(self) -> Dict[str, Any]:
        """الحصول على معلومات Redis"""
        if not self.is_available:
            return {
                'available': False,
                'fallback_mode': True,
                'memory_keys_count': len(self.memory_fallback._data)
            }
        
        try:
            info = self.client.info()
            return {
                'available': True,
                'version': info.get('redis_version'),
                'mode': info.get('redis_mode', 'standalone'),
                'used_memory': info.get('used_memory_human'),
                'used_memory_peak': info.get('used_memory_peak_human'),
                'connected_clients': info.get('connected_clients'),
                'total_commands_processed': info.get('total_commands_processed'),
                'instantaneous_ops_per_sec': info.get('instantaneous_ops_per_sec'),
                'keyspace_hits': info.get('keyspace_hits'),
                'keyspace_misses': info.get('keyspace_misses'),
                'uptime_in_seconds': info.get('uptime_in_seconds'),
                'role': info.get('role')
            }
        except Exception as e:
            logger.error(f"خطأ في جلب معلومات Redis: {str(e)}")
            return {'available': False, 'error': str(e)}
    
    def health_check(self) -> Dict[str, Any]:
        """فحص صحة النظام"""
        try:
            start_time = time.time()
            
            if self.is_available and self.client:
                # اختبار ping
                self.client.ping()
                response_time = time.time() - start_time
                
                # اختبار عملية كتابة/قراءة
                test_key = f"health_check:{int(time.time())}"
                test_value = "health_check_value"
                
                self.set(test_key, test_value, 60)
                retrieved_value = self.get(test_key)
                self.delete(test_key)
                
                write_read_success = retrieved_value == test_value
                
                return {
                    'status': 'healthy',
                    'redis_available': True,
                    'ping_response_time': response_time,
                    'write_read_test': write_read_success,
                    'fallback_mode': False,
                    'timestamp': datetime.utcnow().isoformat()
                }
            else:
                return {
                    'status': 'degraded',
                    'redis_available': False,
                    'fallback_mode': True,
                    'message': 'استخدام التخزين في الذاكرة',
                    'timestamp': datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            return {
                'status': 'unhealthy',
                'redis_available': False,
                'error': str(e),
                'fallback_mode': True,
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def reset_metrics(self):
        """إعادة تعيين الإحصائيات"""
        with self._lock:
            self.metrics = {
                'total_operations': 0,
                'successful_operations': 0,
                'failed_operations': 0,
                'cache_hits': 0,
                'cache_misses': 0,
                'average_response_time': 0.0,
                'last_operation_time': None,
                'connection_errors': 0,
                'timeout_errors': 0,
                'operations_by_type': {}
            }
    
    def close(self):
        """إغلاق الاتصالات"""
        try:
            if self.client:
                self.client.close()
            if self.pool:
                self.pool.disconnect()
            logger.info("تم إغلاق اتصالات Redis")
        except Exception as e:
            logger.error(f"خطأ في إغلاق Redis: {str(e)}")

# إنشاء مثيل عام
redis_manager = RedisManager()

# دوال مساعدة للاستخدام السريع
def cache_set(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    """حفظ في التخزين المؤقت"""
    return redis_manager.set(key, value, ttl)

def cache_get(key: str) -> Optional[Any]:
    """جلب من التخزين المؤقت"""
    return redis_manager.get(key)

def cache_delete(key: str) -> bool:
    """حذف من التخزين المؤقت"""
    return redis_manager.delete(key)

def cache_exists(key: str) -> bool:
    """فحص وجود في التخزين المؤقت"""
    return redis_manager.exists(key)

def cache_clear(pattern: str = "*") -> int:
    """مسح التخزين المؤقت"""
    return redis_manager.clear_cache(pattern)

def get_cache_metrics() -> Dict[str, Any]:
    """الحصول على إحصائيات التخزين المؤقت"""
    return redis_manager.get_metrics()

def cache_health_check() -> Dict[str, Any]:
    """فحص صحة التخزين المؤقت"""
    return redis_manager.health_check()

# تصدير الكلاسات والدوال المهمة
__all__ = [
    'RedisConnectionConfig', 'RedisManager', 'MemoryFallback',
    'redis_manager', 'cache_set', 'cache_get', 'cache_delete', 
    'cache_exists', 'cache_clear', 'get_cache_metrics', 'cache_health_check'
]

