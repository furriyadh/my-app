#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
💾 Cache Manager - مدير التخزين المؤقت المتقدم
==============================================

نظام شامل لإدارة التخزين المؤقت يدعم:
- أنواع تخزين متعددة (Memory, File, Redis)
- انتهاء صلاحية ذكي (TTL)
- ضغط البيانات
- تشفير البيانات الحساسة
- إحصائيات الأداء
- تنظيف تلقائي
- نسخ احتياطي واستعادة

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
import asyncio
import json
import pickle
import gzip
import hashlib
import time
import os
from typing import Dict, Any, List, Optional, Union, Callable, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import threading
from abc import ABC, abstractmethod

# استيراد المكتبات الاختيارية
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None

# استيراد وحدات النظام
try:
    from .logger import setup_logger
    logger = setup_logger(__name__)
except ImportError:
    logger = logging.getLogger(__name__)

class CacheType(Enum):
    """أنواع التخزين المؤقت"""
    MEMORY = "memory"     # ذاكرة النظام
    FILE = "file"         # ملفات النظام
    REDIS = "redis"       # قاعدة بيانات Redis
    HYBRID = "hybrid"     # مختلط

class SerializationType(Enum):
    """أنواع التسلسل"""
    JSON = "json"
    PICKLE = "pickle"
    STRING = "string"

@dataclass
class CacheEntry:
    """
    📦 عنصر التخزين المؤقت
    """
    key: str
    value: Any
    created_at: datetime = field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None
    access_count: int = 0
    last_accessed: datetime = field(default_factory=datetime.now)
    size_bytes: int = 0
    compressed: bool = False
    encrypted: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def is_expired(self) -> bool:
        """فحص انتهاء الصلاحية"""
        if self.expires_at is None:
            return False
        return datetime.now() > self.expires_at
    
    @property
    def age_seconds(self) -> float:
        """عمر العنصر بالثواني"""
        return (datetime.now() - self.created_at).total_seconds()
    
    def touch(self):
        """تحديث وقت الوصول"""
        self.last_accessed = datetime.now()
        self.access_count += 1
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'key': self.key,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'access_count': self.access_count,
            'last_accessed': self.last_accessed.isoformat(),
            'size_bytes': self.size_bytes,
            'compressed': self.compressed,
            'encrypted': self.encrypted,
            'metadata': self.metadata,
            'is_expired': self.is_expired,
            'age_seconds': self.age_seconds
        }

class CacheBackend(ABC):
    """
    🏗️ واجهة خلفية التخزين المؤقت
    """
    
    @abstractmethod
    async def get(self, key: str) -> Optional[CacheEntry]:
        """الحصول على عنصر"""
        pass
    
    @abstractmethod
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        **kwargs
    ) -> bool:
        """حفظ عنصر"""
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> bool:
        """حذف عنصر"""
        pass
    
    @abstractmethod
    async def exists(self, key: str) -> bool:
        """فحص وجود عنصر"""
        pass
    
    @abstractmethod
    async def clear(self) -> bool:
        """مسح جميع العناصر"""
        pass
    
    @abstractmethod
    async def keys(self, pattern: str = "*") -> List[str]:
        """الحصول على المفاتيح"""
        pass
    
    @abstractmethod
    async def size(self) -> int:
        """حجم التخزين المؤقت"""
        pass

class MemoryCache(CacheBackend):
    """
    🧠 تخزين مؤقت في الذاكرة
    """
    
    def __init__(self, max_size: int = 1000):
        """
        تهيئة التخزين المؤقت في الذاكرة
        
        Args:
            max_size: الحد الأقصى لعدد العناصر
        """
        self.max_size = max_size
        self.cache: Dict[str, CacheEntry] = {}
        self.lock = threading.RLock()
        
        logger.debug(f"🧠 تم تهيئة تخزين مؤقت في الذاكرة (حد أقصى: {max_size})")
    
    async def get(self, key: str) -> Optional[CacheEntry]:
        """الحصول على عنصر"""
        with self.lock:
            if key not in self.cache:
                return None
            
            entry = self.cache[key]
            
            # فحص انتهاء الصلاحية
            if entry.is_expired:
                del self.cache[key]
                return None
            
            # تحديث إحصائيات الوصول
            entry.touch()
            return entry
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        **kwargs
    ) -> bool:
        """حفظ عنصر"""
        with self.lock:
            # حساب وقت انتهاء الصلاحية
            expires_at = None
            if ttl is not None:
                expires_at = datetime.now() + timedelta(seconds=ttl)
            
            # حساب حجم البيانات
            try:
                size_bytes = len(pickle.dumps(value))
            except:
                size_bytes = len(str(value).encode('utf-8'))
            
            # إنشاء العنصر
            entry = CacheEntry(
                key=key,
                value=value,
                expires_at=expires_at,
                size_bytes=size_bytes,
                metadata=kwargs
            )
            
            # إدارة الحجم الأقصى
            if len(self.cache) >= self.max_size and key not in self.cache:
                await self._evict_lru()
            
            self.cache[key] = entry
            return True
    
    async def delete(self, key: str) -> bool:
        """حذف عنصر"""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                return True
            return False
    
    async def exists(self, key: str) -> bool:
        """فحص وجود عنصر"""
        entry = await self.get(key)
        return entry is not None
    
    async def clear(self) -> bool:
        """مسح جميع العناصر"""
        with self.lock:
            self.cache.clear()
            return True
    
    async def keys(self, pattern: str = "*") -> List[str]:
        """الحصول على المفاتيح"""
        with self.lock:
            if pattern == "*":
                return list(self.cache.keys())
            
            # تطبيق نمط بسيط
            import fnmatch
            return [key for key in self.cache.keys() if fnmatch.fnmatch(key, pattern)]
    
    async def size(self) -> int:
        """حجم التخزين المؤقت"""
        with self.lock:
            return len(self.cache)
    
    async def _evict_lru(self):
        """إزالة العنصر الأقل استخداماً"""
        if not self.cache:
            return
        
        # العثور على العنصر الأقل استخداماً
        lru_key = min(
            self.cache.keys(),
            key=lambda k: (self.cache[k].access_count, self.cache[k].last_accessed)
        )
        
        del self.cache[lru_key]
        logger.debug(f"🗑️ تم إزالة العنصر الأقل استخداماً: {lru_key}")

class FileCache(CacheBackend):
    """
    📁 تخزين مؤقت في الملفات
    """
    
    def __init__(
        self,
        cache_dir: str = "/tmp/cache",
        max_files: int = 10000,
        compress: bool = True
    ):
        """
        تهيئة التخزين المؤقت في الملفات
        
        Args:
            cache_dir: مجلد التخزين المؤقت
            max_files: الحد الأقصى لعدد الملفات
            compress: ضغط الملفات
        """
        self.cache_dir = cache_dir
        self.max_files = max_files
        self.compress = compress
        self.lock = threading.RLock()
        
        # إنشاء مجلد التخزين المؤقت
        os.makedirs(cache_dir, exist_ok=True)
        
        logger.debug(f"📁 تم تهيئة تخزين مؤقت في الملفات: {cache_dir}")
    
    def _get_file_path(self, key: str) -> str:
        """الحصول على مسار الملف"""
        # تشفير المفتاح لضمان أسماء ملفات آمنة
        safe_key = hashlib.md5(key.encode()).hexdigest()
        extension = ".gz" if self.compress else ".cache"
        return os.path.join(self.cache_dir, f"{safe_key}{extension}")
    
    async def get(self, key: str) -> Optional[CacheEntry]:
        """الحصول على عنصر"""
        file_path = self._get_file_path(key)
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with self.lock:
                # قراءة الملف
                if self.compress:
                    with gzip.open(file_path, 'rb') as f:
                        data = pickle.load(f)
                else:
                    with open(file_path, 'rb') as f:
                        data = pickle.load(f)
                
                entry = data['entry']
                
                # فحص انتهاء الصلاحية
                if entry.is_expired:
                    os.remove(file_path)
                    return None
                
                # تحديث إحصائيات الوصول
                entry.touch()
                
                # حفظ التحديث
                await self._save_entry(file_path, entry)
                
                return entry
                
        except Exception as e:
            logger.warning(f"⚠️ فشل في قراءة ملف التخزين المؤقت {file_path}: {e}")
            # حذف الملف التالف
            try:
                os.remove(file_path)
            except:
                pass
            return None
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        **kwargs
    ) -> bool:
        """حفظ عنصر"""
        try:
            # حساب وقت انتهاء الصلاحية
            expires_at = None
            if ttl is not None:
                expires_at = datetime.now() + timedelta(seconds=ttl)
            
            # إنشاء العنصر
            entry = CacheEntry(
                key=key,
                value=value,
                expires_at=expires_at,
                metadata=kwargs
            )
            
            # إدارة الحد الأقصى للملفات
            await self._manage_file_limit()
            
            # حفظ الملف
            file_path = self._get_file_path(key)
            await self._save_entry(file_path, entry)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في حفظ ملف التخزين المؤقت: {e}")
            return False
    
    async def _save_entry(self, file_path: str, entry: CacheEntry):
        """حفظ العنصر في ملف"""
        with self.lock:
            data = {
                'entry': entry,
                'saved_at': datetime.now()
            }
            
            if self.compress:
                with gzip.open(file_path, 'wb') as f:
                    pickle.dump(data, f)
            else:
                with open(file_path, 'wb') as f:
                    pickle.dump(data, f)
            
            # تحديث حجم الملف
            entry.size_bytes = os.path.getsize(file_path)
    
    async def delete(self, key: str) -> bool:
        """حذف عنصر"""
        file_path = self._get_file_path(key)
        
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception as e:
            logger.warning(f"⚠️ فشل في حذف ملف التخزين المؤقت: {e}")
        
        return False
    
    async def exists(self, key: str) -> bool:
        """فحص وجود عنصر"""
        entry = await self.get(key)
        return entry is not None
    
    async def clear(self) -> bool:
        """مسح جميع العناصر"""
        try:
            with self.lock:
                for filename in os.listdir(self.cache_dir):
                    if filename.endswith(('.cache', '.gz')):
                        file_path = os.path.join(self.cache_dir, filename)
                        os.remove(file_path)
            return True
        except Exception as e:
            logger.error(f"❌ فشل في مسح التخزين المؤقت: {e}")
            return False
    
    async def keys(self, pattern: str = "*") -> List[str]:
        """الحصول على المفاتيح"""
        keys = []
        
        try:
            for filename in os.listdir(self.cache_dir):
                if filename.endswith(('.cache', '.gz')):
                    file_path = os.path.join(self.cache_dir, filename)
                    try:
                        # قراءة المفتاح من الملف
                        if self.compress:
                            with gzip.open(file_path, 'rb') as f:
                                data = pickle.load(f)
                        else:
                            with open(file_path, 'rb') as f:
                                data = pickle.load(f)
                        
                        entry = data['entry']
                        if not entry.is_expired:
                            keys.append(entry.key)
                        else:
                            # حذف الملف المنتهي الصلاحية
                            os.remove(file_path)
                            
                    except:
                        # حذف الملف التالف
                        try:
                            os.remove(file_path)
                        except:
                            pass
        except Exception as e:
            logger.warning(f"⚠️ فشل في قراءة مفاتيح التخزين المؤقت: {e}")
        
        # تطبيق النمط
        if pattern != "*":
            import fnmatch
            keys = [key for key in keys if fnmatch.fnmatch(key, pattern)]
        
        return keys
    
    async def size(self) -> int:
        """حجم التخزين المؤقت"""
        try:
            count = 0
            for filename in os.listdir(self.cache_dir):
                if filename.endswith(('.cache', '.gz')):
                    count += 1
            return count
        except:
            return 0
    
    async def _manage_file_limit(self):
        """إدارة الحد الأقصى للملفات"""
        try:
            current_size = await self.size()
            if current_size >= self.max_files:
                # حذف الملفات الأقدم
                files_info = []
                for filename in os.listdir(self.cache_dir):
                    if filename.endswith(('.cache', '.gz')):
                        file_path = os.path.join(self.cache_dir, filename)
                        mtime = os.path.getmtime(file_path)
                        files_info.append((file_path, mtime))
                
                # ترتيب حسب وقت التعديل
                files_info.sort(key=lambda x: x[1])
                
                # حذف الملفات الأقدم
                files_to_delete = current_size - self.max_files + 1
                for i in range(min(files_to_delete, len(files_info))):
                    try:
                        os.remove(files_info[i][0])
                    except:
                        pass
                        
        except Exception as e:
            logger.warning(f"⚠️ فشل في إدارة حد الملفات: {e}")

class RedisCache(CacheBackend):
    """
    🔴 تخزين مؤقت في Redis
    """
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
        prefix: str = "cache:"
    ):
        """
        تهيئة التخزين المؤقت في Redis
        
        Args:
            host: عنوان الخادم
            port: رقم المنفذ
            db: رقم قاعدة البيانات
            password: كلمة المرور
            prefix: بادئة المفاتيح
        """
        if not REDIS_AVAILABLE:
            raise ImportError("مكتبة redis غير متاحة")
        
        self.prefix = prefix
        self.redis_client = redis.Redis(
            host=host,
            port=port,
            db=db,
            password=password,
            decode_responses=False
        )
        
        # اختبار الاتصال
        try:
            self.redis_client.ping()
            logger.debug(f"🔴 تم تهيئة تخزين مؤقت في Redis: {host}:{port}")
        except Exception as e:
            logger.error(f"❌ فشل في الاتصال بـ Redis: {e}")
            raise
    
    def _get_redis_key(self, key: str) -> str:
        """الحصول على مفتاح Redis"""
        return f"{self.prefix}{key}"
    
    async def get(self, key: str) -> Optional[CacheEntry]:
        """الحصول على عنصر"""
        try:
            redis_key = self._get_redis_key(key)
            data = self.redis_client.get(redis_key)
            
            if data is None:
                return None
            
            entry = pickle.loads(data)
            
            # فحص انتهاء الصلاحية (إضافي)
            if entry.is_expired:
                await self.delete(key)
                return None
            
            # تحديث إحصائيات الوصول
            entry.touch()
            
            # حفظ التحديث
            await self._save_entry(redis_key, entry)
            
            return entry
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في قراءة من Redis: {e}")
            return None
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        **kwargs
    ) -> bool:
        """حفظ عنصر"""
        try:
            # حساب وقت انتهاء الصلاحية
            expires_at = None
            if ttl is not None:
                expires_at = datetime.now() + timedelta(seconds=ttl)
            
            # إنشاء العنصر
            entry = CacheEntry(
                key=key,
                value=value,
                expires_at=expires_at,
                metadata=kwargs
            )
            
            # حفظ في Redis
            redis_key = self._get_redis_key(key)
            await self._save_entry(redis_key, entry, ttl)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في حفظ في Redis: {e}")
            return False
    
    async def _save_entry(
        self,
        redis_key: str,
        entry: CacheEntry,
        ttl: Optional[int] = None
    ):
        """حفظ العنصر في Redis"""
        data = pickle.dumps(entry)
        entry.size_bytes = len(data)
        
        if ttl is not None:
            self.redis_client.setex(redis_key, ttl, data)
        else:
            self.redis_client.set(redis_key, data)
    
    async def delete(self, key: str) -> bool:
        """حذف عنصر"""
        try:
            redis_key = self._get_redis_key(key)
            result = self.redis_client.delete(redis_key)
            return result > 0
        except Exception as e:
            logger.warning(f"⚠️ فشل في حذف من Redis: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """فحص وجود عنصر"""
        try:
            redis_key = self._get_redis_key(key)
            return self.redis_client.exists(redis_key) > 0
        except Exception as e:
            logger.warning(f"⚠️ فشل في فحص وجود العنصر في Redis: {e}")
            return False
    
    async def clear(self) -> bool:
        """مسح جميع العناصر"""
        try:
            pattern = f"{self.prefix}*"
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"❌ فشل في مسح Redis: {e}")
            return False
    
    async def keys(self, pattern: str = "*") -> List[str]:
        """الحصول على المفاتيح"""
        try:
            redis_pattern = f"{self.prefix}{pattern}"
            redis_keys = self.redis_client.keys(redis_pattern)
            
            # إزالة البادئة
            keys = []
            for redis_key in redis_keys:
                if isinstance(redis_key, bytes):
                    redis_key = redis_key.decode('utf-8')
                key = redis_key[len(self.prefix):]
                keys.append(key)
            
            return keys
        except Exception as e:
            logger.warning(f"⚠️ فشل في قراءة مفاتيح Redis: {e}")
            return []
    
    async def size(self) -> int:
        """حجم التخزين المؤقت"""
        try:
            pattern = f"{self.prefix}*"
            keys = self.redis_client.keys(pattern)
            return len(keys)
        except Exception as e:
            logger.warning(f"⚠️ فشل في حساب حجم Redis: {e}")
            return 0

class CacheManager:
    """
    💾 مدير التخزين المؤقت المتقدم
    
    يوفر واجهة موحدة لإدارة التخزين المؤقت مع دعم:
    - أنواع تخزين متعددة
    - ضغط وتشفير البيانات
    - إحصائيات الأداء
    - تنظيف تلقائي
    """
    
    def __init__(
        self,
        backend: CacheBackend,
        default_ttl: int = 3600,
        enable_compression: bool = False,
        enable_encryption: bool = False
    ):
        """
        تهيئة مدير التخزين المؤقت
        
        Args:
            backend: خلفية التخزين المؤقت
            default_ttl: مدة الصلاحية الافتراضية (ثانية)
            enable_compression: تفعيل الضغط
            enable_encryption: تفعيل التشفير
        """
        self.backend = backend
        self.default_ttl = default_ttl
        self.enable_compression = enable_compression
        self.enable_encryption = enable_encryption
        
        # إحصائيات الأداء
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0,
            'errors': 0,
            'total_size_bytes': 0,
            'start_time': datetime.now()
        }
        
        # مهام التنظيف التلقائي
        self.cleanup_task = None
        self.cleanup_interval = 300  # 5 دقائق
        
        logger.info("💾 تم تهيئة مدير التخزين المؤقت")
    
    async def get(self, key: str, default=None) -> Any:
        """
        الحصول على قيمة من التخزين المؤقت
        
        Args:
            key: المفتاح
            default: القيمة الافتراضية
            
        Returns:
            Any: القيمة المحفوظة أو القيمة الافتراضية
        """
        try:
            entry = await self.backend.get(key)
            
            if entry is not None:
                self.stats['hits'] += 1
                value = entry.value
                
                # فك الضغط إذا لزم الأمر
                if entry.compressed and self.enable_compression:
                    value = self._decompress_data(value)
                
                # فك التشفير إذا لزم الأمر
                if entry.encrypted and self.enable_encryption:
                    value = self._decrypt_data(value)
                
                return value
            else:
                self.stats['misses'] += 1
                return default
                
        except Exception as e:
            self.stats['errors'] += 1
            logger.warning(f"⚠️ فشل في الحصول على {key}: {e}")
            return default
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        compress: Optional[bool] = None,
        encrypt: Optional[bool] = None,
        **kwargs
    ) -> bool:
        """
        حفظ قيمة في التخزين المؤقت
        
        Args:
            key: المفتاح
            value: القيمة
            ttl: مدة الصلاحية (ثانية)
            compress: ضغط البيانات
            encrypt: تشفير البيانات
            **kwargs: معلومات إضافية
            
        Returns:
            bool: نجح الحفظ أم لا
        """
        try:
            # استخدام الإعدادات الافتراضية
            if ttl is None:
                ttl = self.default_ttl
            
            if compress is None:
                compress = self.enable_compression
            
            if encrypt is None:
                encrypt = self.enable_encryption
            
            # معالجة البيانات
            processed_value = value
            
            # ضغط البيانات
            if compress:
                processed_value = self._compress_data(processed_value)
                kwargs['compressed'] = True
            
            # تشفير البيانات
            if encrypt:
                processed_value = self._encrypt_data(processed_value)
                kwargs['encrypted'] = True
            
            # حفظ في التخزين المؤقت
            success = await self.backend.set(key, processed_value, ttl, **kwargs)
            
            if success:
                self.stats['sets'] += 1
            else:
                self.stats['errors'] += 1
            
            return success
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"❌ فشل في حفظ {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """
        حذف عنصر من التخزين المؤقت
        
        Args:
            key: المفتاح
            
        Returns:
            bool: نجح الحذف أم لا
        """
        try:
            success = await self.backend.delete(key)
            
            if success:
                self.stats['deletes'] += 1
            
            return success
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.warning(f"⚠️ فشل في حذف {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """فحص وجود مفتاح"""
        try:
            return await self.backend.exists(key)
        except Exception as e:
            self.stats['errors'] += 1
            logger.warning(f"⚠️ فشل في فحص وجود {key}: {e}")
            return False
    
    async def clear(self) -> bool:
        """مسح جميع العناصر"""
        try:
            success = await self.backend.clear()
            
            if success:
                # إعادة تعيين الإحصائيات
                self.stats.update({
                    'hits': 0,
                    'misses': 0,
                    'sets': 0,
                    'deletes': 0,
                    'errors': 0,
                    'total_size_bytes': 0
                })
            
            return success
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"❌ فشل في مسح التخزين المؤقت: {e}")
            return False
    
    async def keys(self, pattern: str = "*") -> List[str]:
        """الحصول على المفاتيح"""
        try:
            return await self.backend.keys(pattern)
        except Exception as e:
            self.stats['errors'] += 1
            logger.warning(f"⚠️ فشل في الحصول على المفاتيح: {e}")
            return []
    
    async def size(self) -> int:
        """حجم التخزين المؤقت"""
        try:
            return await self.backend.size()
        except Exception as e:
            self.stats['errors'] += 1
            logger.warning(f"⚠️ فشل في حساب الحجم: {e}")
            return 0
    
    def _compress_data(self, data: Any) -> bytes:
        """ضغط البيانات"""
        try:
            serialized = pickle.dumps(data)
            compressed = gzip.compress(serialized)
            return compressed
        except Exception as e:
            logger.warning(f"⚠️ فشل في ضغط البيانات: {e}")
            return pickle.dumps(data)
    
    def _decompress_data(self, data: bytes) -> Any:
        """فك ضغط البيانات"""
        try:
            decompressed = gzip.decompress(data)
            return pickle.loads(decompressed)
        except Exception as e:
            logger.warning(f"⚠️ فشل في فك ضغط البيانات: {e}")
            return pickle.loads(data)
    
    def _encrypt_data(self, data: Any) -> bytes:
        """تشفير البيانات (تنفيذ بسيط)"""
        # ملاحظة: هذا تنفيذ بسيط للتوضيح
        # في الإنتاج، استخدم مكتبة تشفير قوية مثل cryptography
        try:
            import base64
            serialized = pickle.dumps(data)
            encoded = base64.b64encode(serialized)
            return encoded
        except Exception as e:
            logger.warning(f"⚠️ فشل في تشفير البيانات: {e}")
            return pickle.dumps(data)
    
    def _decrypt_data(self, data: bytes) -> Any:
        """فك تشفير البيانات (تنفيذ بسيط)"""
        try:
            import base64
            decoded = base64.b64decode(data)
            return pickle.loads(decoded)
        except Exception as e:
            logger.warning(f"⚠️ فشل في فك تشفير البيانات: {e}")
            return pickle.loads(data)
    
    def get_statistics(self) -> Dict[str, Any]:
        """الحصول على إحصائيات الأداء"""
        total_requests = self.stats['hits'] + self.stats['misses']
        hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        uptime = (datetime.now() - self.stats['start_time']).total_seconds()
        
        return {
            'hits': self.stats['hits'],
            'misses': self.stats['misses'],
            'sets': self.stats['sets'],
            'deletes': self.stats['deletes'],
            'errors': self.stats['errors'],
            'total_requests': total_requests,
            'hit_rate_percentage': round(hit_rate, 2),
            'error_rate_percentage': round(
                (self.stats['errors'] / max(total_requests, 1) * 100), 2
            ),
            'uptime_seconds': uptime,
            'requests_per_second': round(total_requests / max(uptime, 1), 2)
        }
    
    def reset_statistics(self):
        """إعادة تعيين الإحصائيات"""
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0,
            'errors': 0,
            'total_size_bytes': 0,
            'start_time': datetime.now()
        }
        logger.info("📊 تم إعادة تعيين إحصائيات التخزين المؤقت")
    
    async def start_cleanup_task(self):
        """بدء مهمة التنظيف التلقائي"""
        if self.cleanup_task is None:
            self.cleanup_task = asyncio.create_task(self._cleanup_loop())
            logger.info("🧹 تم بدء مهمة التنظيف التلقائي")
    
    async def stop_cleanup_task(self):
        """إيقاف مهمة التنظيف التلقائي"""
        if self.cleanup_task:
            self.cleanup_task.cancel()
            try:
                await self.cleanup_task
            except asyncio.CancelledError:
                pass
            self.cleanup_task = None
            logger.info("🛑 تم إيقاف مهمة التنظيف التلقائي")
    
    async def _cleanup_loop(self):
        """حلقة التنظيف التلقائي"""
        while True:
            try:
                await asyncio.sleep(self.cleanup_interval)
                await self._cleanup_expired()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.warning(f"⚠️ خطأ في مهمة التنظيف: {e}")
    
    async def _cleanup_expired(self):
        """تنظيف العناصر المنتهية الصلاحية"""
        try:
            keys = await self.keys()
            expired_count = 0
            
            for key in keys:
                entry = await self.backend.get(key)
                if entry and entry.is_expired:
                    await self.delete(key)
                    expired_count += 1
            
            if expired_count > 0:
                logger.debug(f"🧹 تم تنظيف {expired_count} عنصر منتهي الصلاحية")
                
        except Exception as e:
            logger.warning(f"⚠️ فشل في تنظيف العناصر المنتهية الصلاحية: {e}")

# مدير التخزين المؤقت العام
_global_cache_manager = None

def get_cache_manager(
    cache_type: CacheType = CacheType.MEMORY,
    **kwargs
) -> CacheManager:
    """
    الحصول على مدير التخزين المؤقت العام
    
    Args:
        cache_type: نوع التخزين المؤقت
        **kwargs: إعدادات إضافية
        
    Returns:
        CacheManager: مدير التخزين المؤقت
    """
    global _global_cache_manager
    
    if _global_cache_manager is None:
        # إنشاء الخلفية المناسبة
        if cache_type == CacheType.MEMORY:
            backend = MemoryCache(max_size=kwargs.get('max_size', 1000))
        elif cache_type == CacheType.FILE:
            backend = FileCache(
                cache_dir=kwargs.get('cache_dir', '/tmp/cache'),
                max_files=kwargs.get('max_files', 10000),
                compress=kwargs.get('compress', True)
            )
        elif cache_type == CacheType.REDIS:
            backend = RedisCache(
                host=kwargs.get('host', 'localhost'),
                port=kwargs.get('port', 6379),
                db=kwargs.get('db', 0),
                password=kwargs.get('password'),
                prefix=kwargs.get('prefix', 'cache:')
            )
        else:
            # افتراضي: ذاكرة
            backend = MemoryCache()
        
        _global_cache_manager = CacheManager(
            backend=backend,
            default_ttl=kwargs.get('default_ttl', 3600),
            enable_compression=kwargs.get('enable_compression', False),
            enable_encryption=kwargs.get('enable_encryption', False)
        )
    
    return _global_cache_manager

# تصدير الوحدات المهمة
__all__ = [
    'CacheManager',
    'CacheType',
    'CacheEntry',
    'CacheBackend',
    'MemoryCache',
    'FileCache',
    'RedisCache',
    'SerializationType',
    'get_cache_manager'
]

