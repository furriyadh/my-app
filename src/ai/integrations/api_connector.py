#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🔌 API Connector - موصل APIs العام
==================================

موصل شامل للتكامل مع APIs مختلفة يدعم:
- HTTP/HTTPS requests
- مصادقة متعددة الأنواع
- إدارة معدل الطلبات
- إعادة المحاولة التلقائية
- ذاكرة التخزين المؤقت
- مراقبة الأداء

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
import asyncio
import json
import time
from typing import Dict, Any, List, Optional, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import hashlib
import base64

# استيراد المكتبات الاختيارية
try:
    import aiohttp
    import ssl
    AIOHTTP_AVAILABLE = True
except ImportError:
    AIOHTTP_AVAILABLE = False
    aiohttp = None

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    requests = None

# استيراد وحدات النظام
try:
    from ..utils.logger import setup_logger
    logger = setup_logger(__name__)
except ImportError:
    logger = logging.getLogger(__name__)

class HTTPMethod(Enum):
    """طرق HTTP المدعومة"""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"

class AuthType(Enum):
    """أنواع المصادقة"""
    NONE = "none"
    BASIC = "basic"
    BEARER = "bearer"
    API_KEY = "api_key"
    OAUTH2 = "oauth2"
    CUSTOM = "custom"

class ContentType(Enum):
    """أنواع المحتوى"""
    JSON = "application/json"
    XML = "application/xml"
    FORM = "application/x-www-form-urlencoded"
    MULTIPART = "multipart/form-data"
    TEXT = "text/plain"

@dataclass
class AuthConfig:
    """
    🔐 إعدادات المصادقة
    """
    auth_type: AuthType = AuthType.NONE
    username: Optional[str] = None
    password: Optional[str] = None
    token: Optional[str] = None
    api_key: Optional[str] = None
    api_key_header: str = "X-API-Key"
    custom_headers: Dict[str, str] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'auth_type': self.auth_type.value,
            'username': self.username,
            'password': '***' if self.password else None,
            'token': '***' if self.token else None,
            'api_key': '***' if self.api_key else None,
            'api_key_header': self.api_key_header,
            'custom_headers': self.custom_headers
        }

@dataclass
class RequestConfig:
    """
    ⚙️ إعدادات الطلب
    """
    timeout: int = 30
    max_retries: int = 3
    retry_delay: float = 1.0
    retry_backoff: float = 2.0
    verify_ssl: bool = True
    follow_redirects: bool = True
    max_redirects: int = 10
    user_agent: str = "AI-Platform-API-Connector/1.0"
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'timeout': self.timeout,
            'max_retries': self.max_retries,
            'retry_delay': self.retry_delay,
            'retry_backoff': self.retry_backoff,
            'verify_ssl': self.verify_ssl,
            'follow_redirects': self.follow_redirects,
            'max_redirects': self.max_redirects,
            'user_agent': self.user_agent
        }

@dataclass
class APIRequest:
    """
    📤 طلب API
    """
    method: HTTPMethod
    url: str
    headers: Dict[str, str] = field(default_factory=dict)
    params: Dict[str, Any] = field(default_factory=dict)
    data: Any = None
    json_data: Optional[Dict[str, Any]] = None
    files: Optional[Dict[str, Any]] = None
    auth_config: Optional[AuthConfig] = None
    request_config: Optional[RequestConfig] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'method': self.method.value,
            'url': self.url,
            'headers': self.headers,
            'params': self.params,
            'data': self.data,
            'json_data': self.json_data,
            'files': bool(self.files),
            'auth_config': self.auth_config.to_dict() if self.auth_config else None,
            'request_config': self.request_config.to_dict() if self.request_config else None,
            'metadata': self.metadata
        }

@dataclass
class APIResponse:
    """
    📥 استجابة API
    """
    request_id: str
    success: bool
    status_code: int = 0
    headers: Dict[str, str] = field(default_factory=dict)
    content: Any = None
    json_data: Optional[Dict[str, Any]] = None
    text_data: Optional[str] = None
    error_message: str = ""
    response_time: float = 0.0
    retry_count: int = 0
    cached: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'request_id': self.request_id,
            'success': self.success,
            'status_code': self.status_code,
            'headers': self.headers,
            'content_type': type(self.content).__name__ if self.content else None,
            'json_data': self.json_data,
            'text_data': self.text_data,
            'error_message': self.error_message,
            'response_time': self.response_time,
            'retry_count': self.retry_count,
            'cached': self.cached,
            'metadata': self.metadata
        }

class APIConnector:
    """
    🔌 موصل APIs العام
    
    يوفر واجهة موحدة للتكامل مع APIs مختلفة مع دعم:
    - طرق HTTP متعددة
    - أنواع مصادقة مختلفة
    - إدارة معدل الطلبات
    - إعادة المحاولة التلقائية
    - ذاكرة التخزين المؤقت
    """
    
    def __init__(self, base_url: Optional[str] = None):
        """
        تهيئة موصل API
        
        Args:
            base_url: الرابط الأساسي للAPI
        """
        self.base_url = base_url.rstrip('/') if base_url else None
        
        # إعدادات افتراضية
        self.default_auth = AuthConfig()
        self.default_request_config = RequestConfig()
        
        # إدارة معدل الطلبات
        self.rate_limit = {
            'requests_per_second': 10,
            'requests_per_minute': 100,
            'current_second_count': 0,
            'current_minute_count': 0,
            'last_second_reset': time.time(),
            'last_minute_reset': time.time()
        }
        
        # ذاكرة التخزين المؤقت
        self.cache = {}
        self.cache_ttl = timedelta(minutes=5)
        
        # إحصائيات الأداء
        self.performance_stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'cached_requests': 0,
            'average_response_time': 0.0,
            'total_retry_attempts': 0
        }
        
        # جلسة HTTP
        self.session = None
        
        logger.info(f"🔌 تم تهيئة موصل API - الرابط الأساسي: {self.base_url or 'غير محدد'}")
    
    async def __aenter__(self):
        """دخول السياق غير المتزامن"""
        await self._create_session()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """خروج السياق غير المتزامن"""
        await self._close_session()
    
    async def _create_session(self):
        """إنشاء جلسة HTTP"""
        if AIOHTTP_AVAILABLE and not self.session:
            connector = aiohttp.TCPConnector(
                ssl=ssl.create_default_context() if self.default_request_config.verify_ssl else False
            )
            timeout = aiohttp.ClientTimeout(total=self.default_request_config.timeout)
            self.session = aiohttp.ClientSession(
                connector=connector,
                timeout=timeout,
                headers={'User-Agent': self.default_request_config.user_agent}
            )
            logger.debug("🔗 تم إنشاء جلسة HTTP غير متزامنة")
    
    async def _close_session(self):
        """إغلاق جلسة HTTP"""
        if self.session:
            await self.session.close()
            self.session = None
            logger.debug("🔗 تم إغلاق جلسة HTTP")
    
    async def send_request(self, request: APIRequest) -> APIResponse:
        """
        إرسال طلب API
        
        Args:
            request: طلب API
            
        Returns:
            APIResponse: استجابة API
        """
        start_time = time.time()
        request_id = self._generate_request_id(request)
        
        # فحص معدل الطلبات
        if not self._check_rate_limit():
            return APIResponse(
                request_id=request_id,
                success=False,
                status_code=429,
                error_message="تم تجاوز حد معدل الطلبات"
            )
        
        # فحص الذاكرة المؤقتة للطلبات GET
        if request.method == HTTPMethod.GET:
            cache_key = self._generate_cache_key(request)
            cached_response = self._get_cached_response(cache_key)
            if cached_response:
                self.performance_stats['cached_requests'] += 1
                return cached_response
        
        # تحضير الطلب
        prepared_request = await self._prepare_request(request)
        
        # تنفيذ الطلب مع إعادة المحاولة
        response = await self._execute_request_with_retry(prepared_request, request_id)
        
        # حساب وقت الاستجابة
        response.response_time = time.time() - start_time
        
        # حفظ في الذاكرة المؤقتة إذا نجح
        if response.success and request.method == HTTPMethod.GET:
            cache_key = self._generate_cache_key(request)
            self._cache_response(cache_key, response)
        
        # تحديث الإحصائيات
        self.performance_stats['total_requests'] += 1
        if response.success:
            self.performance_stats['successful_requests'] += 1
        else:
            self.performance_stats['failed_requests'] += 1
        
        self._update_average_response_time(response.response_time)
        self._update_rate_limit_counters()
        
        return response
    
    async def _prepare_request(self, request: APIRequest) -> APIRequest:
        """تحضير الطلب"""
        prepared = APIRequest(
            method=request.method,
            url=self._build_url(request.url),
            headers=request.headers.copy(),
            params=request.params.copy(),
            data=request.data,
            json_data=request.json_data,
            files=request.files,
            auth_config=request.auth_config or self.default_auth,
            request_config=request.request_config or self.default_request_config,
            metadata=request.metadata.copy()
        )
        
        # إضافة headers المصادقة
        auth_headers = self._build_auth_headers(prepared.auth_config)
        prepared.headers.update(auth_headers)
        
        # إضافة Content-Type إذا لم يُحدد
        if 'Content-Type' not in prepared.headers:
            if prepared.json_data:
                prepared.headers['Content-Type'] = ContentType.JSON.value
            elif prepared.data and isinstance(prepared.data, dict):
                prepared.headers['Content-Type'] = ContentType.FORM.value
        
        return prepared
    
    async def _execute_request_with_retry(
        self,
        request: APIRequest,
        request_id: str
    ) -> APIResponse:
        """تنفيذ الطلب مع إعادة المحاولة"""
        
        config = request.request_config
        last_error = None
        
        for attempt in range(config.max_retries + 1):
            try:
                # تنفيذ الطلب
                response = await self._execute_single_request(request, request_id)
                response.retry_count = attempt
                
                # إذا نجح الطلب أو كان الخطأ غير قابل للإعادة
                if response.success or not self._is_retryable_error(response.status_code):
                    return response
                
                last_error = response.error_message
                
            except Exception as e:
                last_error = str(e)
                logger.debug(f"محاولة {attempt + 1} فشلت: {e}")
            
            # انتظار قبل إعادة المحاولة
            if attempt < config.max_retries:
                delay = config.retry_delay * (config.retry_backoff ** attempt)
                await asyncio.sleep(delay)
                self.performance_stats['total_retry_attempts'] += 1
        
        # فشل جميع المحاولات
        return APIResponse(
            request_id=request_id,
            success=False,
            status_code=500,
            error_message=f"فشل بعد {config.max_retries + 1} محاولات: {last_error}",
            retry_count=config.max_retries
        )
    
    async def _execute_single_request(
        self,
        request: APIRequest,
        request_id: str
    ) -> APIResponse:
        """تنفيذ طلب واحد"""
        
        if AIOHTTP_AVAILABLE:
            return await self._execute_aiohttp_request(request, request_id)
        elif REQUESTS_AVAILABLE:
            return await self._execute_requests_request(request, request_id)
        else:
            return await self._execute_mock_request(request, request_id)
    
    async def _execute_aiohttp_request(
        self,
        request: APIRequest,
        request_id: str
    ) -> APIResponse:
        """تنفيذ طلب باستخدام aiohttp"""
        
        if not self.session:
            await self._create_session()
        
        try:
            # تحضير البيانات
            kwargs = {
                'headers': request.headers,
                'params': request.params
            }
            
            if request.json_data:
                kwargs['json'] = request.json_data
            elif request.data:
                kwargs['data'] = request.data
            
            if request.files:
                # تحويل الملفات لصيغة aiohttp
                data = aiohttp.FormData()
                for key, file_data in request.files.items():
                    data.add_field(key, file_data)
                kwargs['data'] = data
            
            # تنفيذ الطلب
            async with self.session.request(
                request.method.value,
                request.url,
                **kwargs
            ) as response:
                
                # قراءة المحتوى
                content = await response.read()
                text_data = await response.text()
                
                # محاولة تحليل JSON
                json_data = None
                try:
                    json_data = await response.json()
                except:
                    pass
                
                return APIResponse(
                    request_id=request_id,
                    success=200 <= response.status < 300,
                    status_code=response.status,
                    headers=dict(response.headers),
                    content=content,
                    json_data=json_data,
                    text_data=text_data,
                    error_message="" if 200 <= response.status < 300 else f"HTTP {response.status}"
                )
                
        except Exception as e:
            return APIResponse(
                request_id=request_id,
                success=False,
                status_code=0,
                error_message=f"خطأ في الطلب: {e}"
            )
    
    async def _execute_requests_request(
        self,
        request: APIRequest,
        request_id: str
    ) -> APIResponse:
        """تنفيذ طلب باستخدام requests (متزامن)"""
        
        try:
            # تحضير البيانات
            kwargs = {
                'headers': request.headers,
                'params': request.params,
                'timeout': request.request_config.timeout,
                'verify': request.request_config.verify_ssl,
                'allow_redirects': request.request_config.follow_redirects
            }
            
            if request.json_data:
                kwargs['json'] = request.json_data
            elif request.data:
                kwargs['data'] = request.data
            
            if request.files:
                kwargs['files'] = request.files
            
            # تنفيذ الطلب في thread pool
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.request(request.method.value, request.url, **kwargs)
            )
            
            # تحليل JSON إذا أمكن
            json_data = None
            try:
                json_data = response.json()
            except:
                pass
            
            return APIResponse(
                request_id=request_id,
                success=response.ok,
                status_code=response.status_code,
                headers=dict(response.headers),
                content=response.content,
                json_data=json_data,
                text_data=response.text,
                error_message="" if response.ok else f"HTTP {response.status_code}"
            )
            
        except Exception as e:
            return APIResponse(
                request_id=request_id,
                success=False,
                status_code=0,
                error_message=f"خطأ في الطلب: {e}"
            )
    
    async def _execute_mock_request(
        self,
        request: APIRequest,
        request_id: str
    ) -> APIResponse:
        """تنفيذ طلب وهمي (للاختبار)"""
        
        await asyncio.sleep(0.1)  # محاكاة وقت الاستجابة
        
        # استجابة وهمية
        mock_data = {
            'message': 'استجابة وهمية',
            'method': request.method.value,
            'url': request.url,
            'timestamp': datetime.now().isoformat()
        }
        
        return APIResponse(
            request_id=request_id,
            success=True,
            status_code=200,
            headers={'Content-Type': 'application/json'},
            json_data=mock_data,
            text_data=json.dumps(mock_data),
            error_message=""
        )
    
    def _build_url(self, url: str) -> str:
        """بناء الرابط الكامل"""
        if url.startswith(('http://', 'https://')):
            return url
        elif self.base_url:
            return f"{self.base_url}/{url.lstrip('/')}"
        else:
            return url
    
    def _build_auth_headers(self, auth_config: AuthConfig) -> Dict[str, str]:
        """بناء headers المصادقة"""
        headers = {}
        
        if auth_config.auth_type == AuthType.BASIC and auth_config.username and auth_config.password:
            credentials = base64.b64encode(
                f"{auth_config.username}:{auth_config.password}".encode()
            ).decode()
            headers['Authorization'] = f"Basic {credentials}"
        
        elif auth_config.auth_type == AuthType.BEARER and auth_config.token:
            headers['Authorization'] = f"Bearer {auth_config.token}"
        
        elif auth_config.auth_type == AuthType.API_KEY and auth_config.api_key:
            headers[auth_config.api_key_header] = auth_config.api_key
        
        # إضافة headers مخصصة
        headers.update(auth_config.custom_headers)
        
        return headers
    
    def _generate_request_id(self, request: APIRequest) -> str:
        """إنشاء معرف طلب فريد"""
        timestamp = int(time.time() * 1000)
        request_hash = hashlib.md5(str(request.to_dict()).encode()).hexdigest()[:8]
        return f"{request.method.value}_{timestamp}_{request_hash}"
    
    def _generate_cache_key(self, request: APIRequest) -> str:
        """إنشاء مفتاح ذاكرة التخزين المؤقت"""
        cache_data = {
            'method': request.method.value,
            'url': request.url,
            'params': request.params,
            'headers': {k: v for k, v in request.headers.items() if k.lower() not in ['authorization', 'x-api-key']}
        }
        return hashlib.md5(str(cache_data).encode()).hexdigest()
    
    def _get_cached_response(self, cache_key: str) -> Optional[APIResponse]:
        """الحصول على استجابة من الذاكرة المؤقتة"""
        if cache_key not in self.cache:
            return None
        
        cached_item = self.cache[cache_key]
        if datetime.now() - cached_item['timestamp'] > self.cache_ttl:
            del self.cache[cache_key]
            return None
        
        response = cached_item['response']
        response.cached = True
        return response
    
    def _cache_response(self, cache_key: str, response: APIResponse):
        """حفظ استجابة في الذاكرة المؤقتة"""
        if response.success:
            self.cache[cache_key] = {
                'response': response,
                'timestamp': datetime.now()
            }
    
    def _check_rate_limit(self) -> bool:
        """فحص حدود معدل الطلبات"""
        current_time = time.time()
        
        # إعادة تعيين العدادات
        if current_time - self.rate_limit['last_second_reset'] >= 1:
            self.rate_limit['current_second_count'] = 0
            self.rate_limit['last_second_reset'] = current_time
        
        if current_time - self.rate_limit['last_minute_reset'] >= 60:
            self.rate_limit['current_minute_count'] = 0
            self.rate_limit['last_minute_reset'] = current_time
        
        # فحص الحدود
        if self.rate_limit['current_second_count'] >= self.rate_limit['requests_per_second']:
            return False
        
        if self.rate_limit['current_minute_count'] >= self.rate_limit['requests_per_minute']:
            return False
        
        return True
    
    def _update_rate_limit_counters(self):
        """تحديث عدادات معدل الطلبات"""
        self.rate_limit['current_second_count'] += 1
        self.rate_limit['current_minute_count'] += 1
    
    def _is_retryable_error(self, status_code: int) -> bool:
        """تحديد ما إذا كان الخطأ قابل لإعادة المحاولة"""
        # أخطاء الخادم وبعض أخطاء العميل
        retryable_codes = [408, 429, 500, 502, 503, 504]
        return status_code in retryable_codes
    
    def _update_average_response_time(self, response_time: float):
        """تحديث متوسط وقت الاستجابة"""
        current_avg = self.performance_stats['average_response_time']
        total_requests = self.performance_stats['total_requests']
        
        if total_requests == 0:
            self.performance_stats['average_response_time'] = response_time
        else:
            new_avg = ((current_avg * total_requests) + response_time) / (total_requests + 1)
            self.performance_stats['average_response_time'] = new_avg
    
    # دوال مساعدة للطرق الشائعة
    async def get(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        auth_config: Optional[AuthConfig] = None
    ) -> APIResponse:
        """طلب GET"""
        request = APIRequest(
            method=HTTPMethod.GET,
            url=url,
            params=params or {},
            headers=headers or {},
            auth_config=auth_config
        )
        return await self.send_request(request)
    
    async def post(
        self,
        url: str,
        data: Any = None,
        json_data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        auth_config: Optional[AuthConfig] = None
    ) -> APIResponse:
        """طلب POST"""
        request = APIRequest(
            method=HTTPMethod.POST,
            url=url,
            data=data,
            json_data=json_data,
            headers=headers or {},
            auth_config=auth_config
        )
        return await self.send_request(request)
    
    async def put(
        self,
        url: str,
        data: Any = None,
        json_data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        auth_config: Optional[AuthConfig] = None
    ) -> APIResponse:
        """طلب PUT"""
        request = APIRequest(
            method=HTTPMethod.PUT,
            url=url,
            data=data,
            json_data=json_data,
            headers=headers or {},
            auth_config=auth_config
        )
        return await self.send_request(request)
    
    async def delete(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        auth_config: Optional[AuthConfig] = None
    ) -> APIResponse:
        """طلب DELETE"""
        request = APIRequest(
            method=HTTPMethod.DELETE,
            url=url,
            headers=headers or {},
            auth_config=auth_config
        )
        return await self.send_request(request)
    
    def set_default_auth(self, auth_config: AuthConfig):
        """تعيين المصادقة الافتراضية"""
        self.default_auth = auth_config
        logger.info(f"🔐 تم تعيين المصادقة الافتراضية: {auth_config.auth_type.value}")
    
    def set_rate_limit(self, requests_per_second: int, requests_per_minute: int):
        """تعيين حدود معدل الطلبات"""
        self.rate_limit['requests_per_second'] = requests_per_second
        self.rate_limit['requests_per_minute'] = requests_per_minute
        logger.info(f"⏱️ تم تعيين حدود معدل الطلبات: {requests_per_second}/ثانية، {requests_per_minute}/دقيقة")
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """الحصول على إحصائيات الأداء"""
        stats = self.performance_stats.copy()
        
        if stats['total_requests'] > 0:
            stats['success_rate'] = (stats['successful_requests'] / stats['total_requests']) * 100
            stats['cache_hit_rate'] = (stats['cached_requests'] / stats['total_requests']) * 100
        else:
            stats['success_rate'] = 0
            stats['cache_hit_rate'] = 0
        
        return stats
    
    def reset_performance_stats(self):
        """إعادة تعيين إحصائيات الأداء"""
        self.performance_stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'cached_requests': 0,
            'average_response_time': 0.0,
            'total_retry_attempts': 0
        }
        logger.info("📊 تم إعادة تعيين إحصائيات الأداء")
    
    def clear_cache(self):
        """مسح الذاكرة المؤقتة"""
        self.cache.clear()
        logger.info("🗑️ تم مسح الذاكرة المؤقتة")

# دوال مساعدة للاستخدام السريع
def get_api_connector(base_url: Optional[str] = None) -> APIConnector:
    """الحصول على موصل API"""
    return APIConnector(base_url=base_url)

async def quick_get(
    url: str,
    params: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None
) -> APIResponse:
    """طلب GET سريع"""
    async with get_api_connector() as connector:
        return await connector.get(url, params, headers)

async def quick_post(
    url: str,
    json_data: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None
) -> APIResponse:
    """طلب POST سريع"""
    async with get_api_connector() as connector:
        return await connector.post(url, json_data=json_data, headers=headers)

# تصدير الوحدات المهمة
__all__ = [
    'APIConnector',
    'APIRequest',
    'APIResponse',
    'AuthConfig',
    'RequestConfig',
    'HTTPMethod',
    'AuthType',
    'ContentType',
    'get_api_connector',
    'quick_get',
    'quick_post'
]

