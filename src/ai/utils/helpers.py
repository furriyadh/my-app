#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🛠️ Helpers - دوال مساعدة عامة
=============================

مجموعة شاملة من الدوال المساعدة للاستخدام في جميع أنحاء النظام:
- معالجة النصوص والبيانات
- تحويلات التاريخ والوقت
- عمليات الملفات والمجلدات
- تشفير وفك تشفير
- تحقق من صحة البيانات
- عمليات رياضية وإحصائية
- دوال شبكة ومعالجة URLs

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
import asyncio
import json
import re
import os
import hashlib
import base64
import uuid
import time
import math
import statistics
from typing import Dict, Any, List, Optional, Union, Tuple, Callable
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse, urljoin, quote, unquote
from pathlib import Path
import mimetypes
import gzip
import zipfile
import tarfile

# استيراد مكتبات إضافية
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# استيراد وحدات النظام
try:
    from .logger import setup_logger
    logger = setup_logger(__name__)
except ImportError:
    logger = logging.getLogger(__name__)

# ==================== دوال معالجة النصوص ====================

def clean_text(text: str, remove_extra_spaces: bool = True) -> str:
    """
    تنظيف النص من الأحرف غير المرغوبة
    
    Args:
        text: النص المراد تنظيفه
        remove_extra_spaces: إزالة المسافات الزائدة
        
    Returns:
        str: النص المُنظف
    """
    if not isinstance(text, str):
        text = str(text)
    
    # إزالة الأحرف الخاصة
    text = re.sub(r'[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF-]', '', text)
    
    # إزالة المسافات الزائدة
    if remove_extra_spaces:
        text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def truncate_text(text: str, max_length: int, suffix: str = "...") -> str:
    """
    اقتطاع النص إلى طول محدد
    
    Args:
        text: النص
        max_length: الطول الأقصى
        suffix: اللاحقة عند الاقتطاع
        
    Returns:
        str: النص المقتطع
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix

def extract_numbers(text: str) -> List[float]:
    """
    استخراج الأرقام من النص
    
    Args:
        text: النص
        
    Returns:
        List[float]: قائمة الأرقام
    """
    pattern = r'-?\d+\.?\d*'
    matches = re.findall(pattern, text)
    return [float(match) for match in matches if match]

def extract_emails(text: str) -> List[str]:
    """
    استخراج عناوين البريد الإلكتروني من النص
    
    Args:
        text: النص
        
    Returns:
        List[str]: قائمة عناوين البريد الإلكتروني
    """
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.findall(pattern, text)

def extract_urls(text: str) -> List[str]:
    """
    استخراج الروابط من النص
    
    Args:
        text: النص
        
    Returns:
        List[str]: قائمة الروابط
    """
    pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.findall(pattern, text)

def slugify(text: str, max_length: int = 50) -> str:
    """
    تحويل النص إلى slug صالح للاستخدام في URLs
    
    Args:
        text: النص
        max_length: الطول الأقصى
        
    Returns:
        str: النص المُحول
    """
    # تحويل إلى أحرف صغيرة
    text = text.lower()
    
    # استبدال المسافات والأحرف الخاصة بشرطات
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    
    # إزالة الشرطات من البداية والنهاية
    text = text.strip('-')
    
    # اقتطاع إلى الطول المحدد
    return text[:max_length]

# ==================== دوال التاريخ والوقت ====================

def now_utc() -> datetime:
    """الحصول على التاريخ والوقت الحالي بتوقيت UTC"""
    return datetime.now(timezone.utc)

def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    تنسيق التاريخ والوقت
    
    Args:
        dt: التاريخ والوقت
        format_str: نمط التنسيق
        
    Returns:
        str: التاريخ والوقت المُنسق
    """
    return dt.strftime(format_str)

def parse_datetime(date_str: str, format_str: str = "%Y-%m-%d %H:%M:%S") -> Optional[datetime]:
    """
    تحليل نص التاريخ والوقت
    
    Args:
        date_str: نص التاريخ والوقت
        format_str: نمط التحليل
        
    Returns:
        Optional[datetime]: التاريخ والوقت المُحلل أو None
    """
    try:
        return datetime.strptime(date_str, format_str)
    except ValueError:
        return None

def time_ago(dt: datetime) -> str:
    """
    حساب الوقت المنقضي منذ تاريخ معين
    
    Args:
        dt: التاريخ والوقت
        
    Returns:
        str: الوقت المنقضي بصيغة نصية
    """
    now = datetime.now(dt.tzinfo) if dt.tzinfo else datetime.now()
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return f"{int(seconds)} ثانية"
    elif seconds < 3600:
        return f"{int(seconds // 60)} دقيقة"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} ساعة"
    elif seconds < 2592000:  # 30 days
        return f"{int(seconds // 86400)} يوم"
    elif seconds < 31536000:  # 365 days
        return f"{int(seconds // 2592000)} شهر"
    else:
        return f"{int(seconds // 31536000)} سنة"

def get_date_range(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    days: int = 30
) -> Tuple[datetime, datetime]:
    """
    الحصول على نطاق تاريخ
    
    Args:
        start_date: تاريخ البداية
        end_date: تاريخ النهاية
        days: عدد الأيام (إذا لم تُحدد التواريخ)
        
    Returns:
        Tuple[datetime, datetime]: تاريخ البداية والنهاية
    """
    if end_date is None:
        end_date = now_utc()
    
    if start_date is None:
        start_date = end_date - timedelta(days=days)
    
    return start_date, end_date

# ==================== دوال الملفات والمجلدات ====================

def ensure_dir(path: Union[str, Path]) -> Path:
    """
    التأكد من وجود المجلد وإنشاؤه إذا لم يكن موجوداً
    
    Args:
        path: مسار المجلد
        
    Returns:
        Path: مسار المجلد
    """
    path = Path(path)
    path.mkdir(parents=True, exist_ok=True)
    return path

def get_file_size(file_path: Union[str, Path]) -> int:
    """
    الحصول على حجم الملف بالبايت
    
    Args:
        file_path: مسار الملف
        
    Returns:
        int: حجم الملف بالبايت
    """
    return Path(file_path).stat().st_size

def format_file_size(size_bytes: int) -> str:
    """
    تنسيق حجم الملف بوحدة مناسبة
    
    Args:
        size_bytes: حجم الملف بالبايت
        
    Returns:
        str: حجم الملف المُنسق
    """
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    
    return f"{s} {size_names[i]}"

def get_file_extension(file_path: Union[str, Path]) -> str:
    """
    الحصول على امتداد الملف
    
    Args:
        file_path: مسار الملف
        
    Returns:
        str: امتداد الملف
    """
    return Path(file_path).suffix.lower()

def get_mime_type(file_path: Union[str, Path]) -> str:
    """
    الحصول على نوع MIME للملف
    
    Args:
        file_path: مسار الملف
        
    Returns:
        str: نوع MIME
    """
    mime_type, _ = mimetypes.guess_type(str(file_path))
    return mime_type or 'application/octet-stream'

def compress_file(input_path: Union[str, Path], output_path: Union[str, Path]) -> bool:
    """
    ضغط ملف باستخدام gzip
    
    Args:
        input_path: مسار الملف المدخل
        output_path: مسار الملف المضغوط
        
    Returns:
        bool: نجح الضغط أم لا
    """
    try:
        with open(input_path, 'rb') as f_in:
            with gzip.open(output_path, 'wb') as f_out:
                f_out.writelines(f_in)
        return True
    except Exception as e:
        logger.error(f"فشل في ضغط الملف: {e}")
        return False

def decompress_file(input_path: Union[str, Path], output_path: Union[str, Path]) -> bool:
    """
    فك ضغط ملف gzip
    
    Args:
        input_path: مسار الملف المضغوط
        output_path: مسار الملف المفكوك
        
    Returns:
        bool: نجح فك الضغط أم لا
    """
    try:
        with gzip.open(input_path, 'rb') as f_in:
            with open(output_path, 'wb') as f_out:
                f_out.writelines(f_in)
        return True
    except Exception as e:
        logger.error(f"فشل في فك ضغط الملف: {e}")
        return False

# ==================== دوال التشفير والأمان ====================

def generate_uuid() -> str:
    """إنشاء UUID فريد"""
    return str(uuid.uuid4())

def generate_random_string(length: int = 32, include_symbols: bool = False) -> str:
    """
    إنشاء نص عشوائي
    
    Args:
        length: طول النص
        include_symbols: تضمين رموز خاصة
        
    Returns:
        str: النص العشوائي
    """
    import random
    import string
    
    chars = string.ascii_letters + string.digits
    if include_symbols:
        chars += "!@#$%^&*"
    
    return ''.join(random.choice(chars) for _ in range(length))

def hash_string(text: str, algorithm: str = 'sha256') -> str:
    """
    تشفير النص باستخدام hash
    
    Args:
        text: النص
        algorithm: خوارزمية التشفير
        
    Returns:
        str: النص المُشفر
    """
    hash_obj = hashlib.new(algorithm)
    hash_obj.update(text.encode('utf-8'))
    return hash_obj.hexdigest()

def encode_base64(data: Union[str, bytes]) -> str:
    """
    تشفير البيانات باستخدام Base64
    
    Args:
        data: البيانات
        
    Returns:
        str: البيانات المُشفرة
    """
    if isinstance(data, str):
        data = data.encode('utf-8')
    
    return base64.b64encode(data).decode('utf-8')

def decode_base64(encoded_data: str) -> bytes:
    """
    فك تشفير البيانات من Base64
    
    Args:
        encoded_data: البيانات المُشفرة
        
    Returns:
        bytes: البيانات المفكوكة
    """
    return base64.b64decode(encoded_data)

def mask_sensitive_data(data: str, mask_char: str = "*", visible_chars: int = 4) -> str:
    """
    إخفاء البيانات الحساسة
    
    Args:
        data: البيانات
        mask_char: حرف الإخفاء
        visible_chars: عدد الأحرف المرئية من النهاية
        
    Returns:
        str: البيانات المُخفاة
    """
    if len(data) <= visible_chars:
        return mask_char * len(data)
    
    return mask_char * (len(data) - visible_chars) + data[-visible_chars:]

# ==================== دوال التحقق من صحة البيانات ====================

def is_valid_email(email: str) -> bool:
    """
    التحقق من صحة عنوان البريد الإلكتروني
    
    Args:
        email: عنوان البريد الإلكتروني
        
    Returns:
        bool: صحيح أم لا
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def is_valid_url(url: str) -> bool:
    """
    التحقق من صحة الرابط
    
    Args:
        url: الرابط
        
    Returns:
        bool: صحيح أم لا
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def is_valid_phone(phone: str, country_code: str = "SA") -> bool:
    """
    التحقق من صحة رقم الهاتف
    
    Args:
        phone: رقم الهاتف
        country_code: رمز الدولة
        
    Returns:
        bool: صحيح أم لا
    """
    # تنظيف الرقم
    phone = re.sub(r'[^\d+]', '', phone)
    
    # أنماط أرقام الهاتف حسب الدولة
    patterns = {
        "SA": r'^(\+966|966|0)?[5][0-9]{8}$',  # السعودية
        "US": r'^(\+1|1)?[2-9]\d{2}[2-9]\d{2}\d{4}$',  # أمريكا
        "UK": r'^(\+44|44|0)?[1-9]\d{8,9}$'  # بريطانيا
    }
    
    pattern = patterns.get(country_code, r'^\+?[1-9]\d{1,14}$')
    return bool(re.match(pattern, phone))

def validate_json(json_str: str) -> Tuple[bool, Optional[Dict]]:
    """
    التحقق من صحة JSON
    
    Args:
        json_str: نص JSON
        
    Returns:
        Tuple[bool, Optional[Dict]]: صحيح أم لا، والبيانات المُحللة
    """
    try:
        data = json.loads(json_str)
        return True, data
    except json.JSONDecodeError:
        return False, None

def sanitize_input(input_str: str, max_length: int = 1000) -> str:
    """
    تنظيف المدخلات من الأكواد الضارة
    
    Args:
        input_str: النص المدخل
        max_length: الطول الأقصى
        
    Returns:
        str: النص المُنظف
    """
    # إزالة HTML tags
    input_str = re.sub(r'<[^>]+>', '', input_str)
    
    # إزالة JavaScript
    input_str = re.sub(r'<script.*?</script>', '', input_str, flags=re.DOTALL | re.IGNORECASE)
    
    # إزالة الأحرف الخطيرة
    dangerous_chars = ['<', '>', '"', "'", '&', ';']
    for char in dangerous_chars:
        input_str = input_str.replace(char, '')
    
    # اقتطاع إلى الطول المحدد
    return input_str[:max_length]

# ==================== دوال رياضية وإحصائية ====================

def safe_divide(a: float, b: float, default: float = 0.0) -> float:
    """
    قسمة آمنة تتجنب القسمة على صفر
    
    Args:
        a: البسط
        b: المقام
        default: القيمة الافتراضية عند القسمة على صفر
        
    Returns:
        float: نتيجة القسمة
    """
    return a / b if b != 0 else default

def percentage(part: float, total: float) -> float:
    """
    حساب النسبة المئوية
    
    Args:
        part: الجزء
        total: الكل
        
    Returns:
        float: النسبة المئوية
    """
    return safe_divide(part * 100, total)

def round_to_precision(number: float, precision: int = 2) -> float:
    """
    تقريب الرقم إلى دقة محددة
    
    Args:
        number: الرقم
        precision: عدد الأرقام العشرية
        
    Returns:
        float: الرقم المُقرب
    """
    return round(number, precision)

def calculate_statistics(numbers: List[float]) -> Dict[str, float]:
    """
    حساب الإحصائيات الأساسية لقائمة أرقام
    
    Args:
        numbers: قائمة الأرقام
        
    Returns:
        Dict[str, float]: الإحصائيات
    """
    if not numbers:
        return {}
    
    return {
        'count': len(numbers),
        'sum': sum(numbers),
        'mean': statistics.mean(numbers),
        'median': statistics.median(numbers),
        'mode': statistics.mode(numbers) if len(set(numbers)) < len(numbers) else None,
        'min': min(numbers),
        'max': max(numbers),
        'range': max(numbers) - min(numbers),
        'std_dev': statistics.stdev(numbers) if len(numbers) > 1 else 0,
        'variance': statistics.variance(numbers) if len(numbers) > 1 else 0
    }

def normalize_list(numbers: List[float], min_val: float = 0, max_val: float = 1) -> List[float]:
    """
    تطبيع قائمة أرقام إلى نطاق محدد
    
    Args:
        numbers: قائمة الأرقام
        min_val: القيمة الدنيا
        max_val: القيمة العليا
        
    Returns:
        List[float]: القائمة المُطبعة
    """
    if not numbers:
        return []
    
    min_num = min(numbers)
    max_num = max(numbers)
    
    if min_num == max_num:
        return [min_val] * len(numbers)
    
    range_num = max_num - min_num
    range_target = max_val - min_val
    
    return [
        min_val + (num - min_num) * range_target / range_num
        for num in numbers
    ]

# ==================== دوال الشبكة والـ URLs ====================

def build_url(base_url: str, path: str = "", params: Optional[Dict[str, Any]] = None) -> str:
    """
    بناء رابط كامل
    
    Args:
        base_url: الرابط الأساسي
        path: المسار
        params: معاملات الاستعلام
        
    Returns:
        str: الرابط الكامل
    """
    url = urljoin(base_url, path)
    
    if params:
        query_string = "&".join([f"{k}={quote(str(v))}" for k, v in params.items()])
        url += f"?{query_string}"
    
    return url

def parse_url(url: str) -> Dict[str, Any]:
    """
    تحليل الرابط إلى مكوناته
    
    Args:
        url: الرابط
        
    Returns:
        Dict[str, Any]: مكونات الرابط
    """
    parsed = urlparse(url)
    
    return {
        'scheme': parsed.scheme,
        'netloc': parsed.netloc,
        'hostname': parsed.hostname,
        'port': parsed.port,
        'path': parsed.path,
        'params': parsed.params,
        'query': parsed.query,
        'fragment': parsed.fragment,
        'username': parsed.username,
        'password': parsed.password
    }

def extract_domain(url: str) -> str:
    """
    استخراج النطاق من الرابط
    
    Args:
        url: الرابط
        
    Returns:
        str: النطاق
    """
    parsed = urlparse(url)
    return parsed.netloc

async def check_url_status(url: str, timeout: int = 10) -> Tuple[bool, int]:
    """
    فحص حالة الرابط
    
    Args:
        url: الرابط
        timeout: مهلة الانتظار
        
    Returns:
        Tuple[bool, int]: متاح أم لا، رمز الحالة
    """
    if not REQUESTS_AVAILABLE:
        logger.warning("مكتبة requests غير متاحة")
        return False, 0
    
    try:
        response = requests.head(url, timeout=timeout, allow_redirects=True)
        return response.status_code < 400, response.status_code
    except Exception as e:
        logger.warning(f"فشل في فحص الرابط {url}: {e}")
        return False, 0

# ==================== دوال معالجة البيانات ====================

def flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
    """
    تسطيح القاموس المتداخل
    
    Args:
        d: القاموس
        parent_key: المفتاح الأب
        sep: فاصل المفاتيح
        
    Returns:
        Dict[str, Any]: القاموس المُسطح
    """
    items = []
    
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    
    return dict(items)

def unflatten_dict(d: Dict[str, Any], sep: str = '.') -> Dict[str, Any]:
    """
    إلغاء تسطيح القاموس
    
    Args:
        d: القاموس المُسطح
        sep: فاصل المفاتيح
        
    Returns:
        Dict[str, Any]: القاموس المتداخل
    """
    result = {}
    
    for key, value in d.items():
        keys = key.split(sep)
        current = result
        
        for k in keys[:-1]:
            if k not in current:
                current[k] = {}
            current = current[k]
        
        current[keys[-1]] = value
    
    return result

def merge_dicts(*dicts: Dict[str, Any]) -> Dict[str, Any]:
    """
    دمج عدة قواميس
    
    Args:
        *dicts: القواميس
        
    Returns:
        Dict[str, Any]: القاموس المدموج
    """
    result = {}
    
    for d in dicts:
        if isinstance(d, dict):
            result.update(d)
    
    return result

def filter_dict(d: Dict[str, Any], keys: List[str], include: bool = True) -> Dict[str, Any]:
    """
    تصفية القاموس حسب المفاتيح
    
    Args:
        d: القاموس
        keys: قائمة المفاتيح
        include: تضمين أم استبعاد المفاتيح
        
    Returns:
        Dict[str, Any]: القاموس المُصفى
    """
    if include:
        return {k: v for k, v in d.items() if k in keys}
    else:
        return {k: v for k, v in d.items() if k not in keys}

def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """
    تقسيم القائمة إلى أجزاء
    
    Args:
        lst: القائمة
        chunk_size: حجم الجزء
        
    Returns:
        List[List[Any]]: قائمة الأجزاء
    """
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]

def remove_duplicates(lst: List[Any], key: Optional[Callable] = None) -> List[Any]:
    """
    إزالة التكرارات من القائمة
    
    Args:
        lst: القائمة
        key: دالة استخراج المفتاح للمقارنة
        
    Returns:
        List[Any]: القائمة بدون تكرارات
    """
    if key is None:
        return list(dict.fromkeys(lst))
    
    seen = set()
    result = []
    
    for item in lst:
        item_key = key(item)
        if item_key not in seen:
            seen.add(item_key)
            result.append(item)
    
    return result

# ==================== دوال الأداء والمراقبة ====================

class Timer:
    """مؤقت لقياس الأداء"""
    
    def __init__(self):
        self.start_time = None
        self.end_time = None
    
    def start(self):
        """بدء التوقيت"""
        self.start_time = time.time()
        return self
    
    def stop(self):
        """إيقاف التوقيت"""
        self.end_time = time.time()
        return self
    
    @property
    def elapsed(self) -> float:
        """الوقت المنقضي بالثواني"""
        if self.start_time is None:
            return 0
        
        end = self.end_time or time.time()
        return end - self.start_time
    
    def __enter__(self):
        return self.start()
    
    def __exit__(self, *args):
        self.stop()

def measure_time(func: Callable) -> Callable:
    """
    Decorator لقياس وقت تنفيذ الدالة
    
    Args:
        func: الدالة
        
    Returns:
        Callable: الدالة مع قياس الوقت
    """
    async def async_wrapper(*args, **kwargs):
        with Timer() as timer:
            result = await func(*args, **kwargs)
        
        logger.debug(f"⏱️ {func.__name__} استغرق {timer.elapsed:.3f}s")
        return result
    
    def sync_wrapper(*args, **kwargs):
        with Timer() as timer:
            result = func(*args, **kwargs)
        
        logger.debug(f"⏱️ {func.__name__} استغرق {timer.elapsed:.3f}s")
        return result
    
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper

def memory_usage() -> Dict[str, float]:
    """
    الحصول على استخدام الذاكرة
    
    Returns:
        Dict[str, float]: معلومات الذاكرة
    """
    try:
        import psutil
        process = psutil.Process()
        memory_info = process.memory_info()
        
        return {
            'rss_mb': memory_info.rss / 1024 / 1024,  # Resident Set Size
            'vms_mb': memory_info.vms / 1024 / 1024,  # Virtual Memory Size
            'percent': process.memory_percent()
        }
    except ImportError:
        return {'error': 'psutil not available'}

# ==================== دوال متنوعة ====================

def retry_async(max_attempts: int = 3, delay: float = 1.0, backoff: float = 2.0):
    """
    Decorator لإعادة المحاولة للدوال غير المتزامنة
    
    Args:
        max_attempts: عدد المحاولات الأقصى
        delay: التأخير الأولي
        backoff: معامل زيادة التأخير
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            last_exception = None
            current_delay = delay
            
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    
                    if attempt < max_attempts - 1:
                        logger.warning(f"محاولة {attempt + 1} فشلت، إعادة المحاولة خلال {current_delay}s: {e}")
                        await asyncio.sleep(current_delay)
                        current_delay *= backoff
            
            raise last_exception
        
        return wrapper
    return decorator

def get_system_info() -> Dict[str, Any]:
    """
    الحصول على معلومات النظام
    
    Returns:
        Dict[str, Any]: معلومات النظام
    """
    import platform
    
    info = {
        'platform': platform.platform(),
        'system': platform.system(),
        'release': platform.release(),
        'version': platform.version(),
        'machine': platform.machine(),
        'processor': platform.processor(),
        'python_version': platform.python_version(),
        'hostname': platform.node()
    }
    
    # إضافة معلومات الذاكرة إذا كانت متاحة
    memory_info = memory_usage()
    if 'error' not in memory_info:
        info['memory'] = memory_info
    
    return info

# تصدير الوحدات المهمة
__all__ = [
    # دوال النصوص
    'clean_text', 'truncate_text', 'extract_numbers', 'extract_emails', 
    'extract_urls', 'slugify',
    
    # دوال التاريخ والوقت
    'now_utc', 'format_datetime', 'parse_datetime', 'time_ago', 'get_date_range',
    
    # دوال الملفات
    'ensure_dir', 'get_file_size', 'format_file_size', 'get_file_extension',
    'get_mime_type', 'compress_file', 'decompress_file',
    
    # دوال التشفير
    'generate_uuid', 'generate_random_string', 'hash_string', 'encode_base64',
    'decode_base64', 'mask_sensitive_data',
    
    # دوال التحقق
    'is_valid_email', 'is_valid_url', 'is_valid_phone', 'validate_json',
    'sanitize_input',
    
    # دوال رياضية
    'safe_divide', 'percentage', 'round_to_precision', 'calculate_statistics',
    'normalize_list',
    
    # دوال الشبكة
    'build_url', 'parse_url', 'extract_domain', 'check_url_status',
    
    # دوال البيانات
    'flatten_dict', 'unflatten_dict', 'merge_dicts', 'filter_dict',
    'chunk_list', 'remove_duplicates',
    
    # دوال الأداء
    'Timer', 'measure_time', 'memory_usage', 'retry_async', 'get_system_info'
]

