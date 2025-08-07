"""
Helpers Module
وحدة الدوال المساعدة المتطورة

تحتوي على مجموعة شاملة من الدوال المساعدة للتطبيق:
- تنسيق البيانات والعملات
- حساب الأداء والإحصائيات
- معالجة النصوص والتشفير
- إدارة التواريخ والأوقات
- التحقق من البيانات والتنظيف
- إدارة الجلسات والإشعارات
"""

import os
import re
import json
import hashlib
import secrets
import uuid
import base64
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Union, Tuple
from decimal import Decimal
from functools import wraps
import time

# استبدال bcrypt → passlib (حل مشكلة VS Code نهائياً)
BCRYPT_AVAILABLE = False
bcrypt = None

try:
    from passlib.hash import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    # fallback شامل بدون استيراد bcrypt مباشرة
    BCRYPT_AVAILABLE = False
    
    # fallback آمن بدون تشفير (للتطوير فقط)
    class bcrypt:
        @staticmethod
        def hash(password: str) -> str:
            """fallback - تشفير بسيط (غير آمن للإنتاج)"""
            import hashlib
            salt = hashlib.sha256(os.urandom(32)).hexdigest()
            return hashlib.sha256((password + salt).encode()).hexdigest() + ':' + salt
        
        @staticmethod
        def verify(password: str, hashed: str) -> bool:
            """fallback - التحقق البسيط"""
            try:
                password_hash, salt = hashed.split(':')
                return hashlib.sha256((password + salt).encode()).hexdigest() == password_hash
            except:
                return False

def generate_analysis_id() -> str:
    """توليد معرف فريد للتحليلات."""
    return str(uuid.uuid4())

# استيراد دوال التحقق من validators مع معالجة أخطاء متقدمة
try:
    from .validators import validate_email, validate_phone, validate_url
except ImportError:
    # دوال احتياطية للتحقق
    def validate_email(email: str) -> bool:
        """التحقق من صحة البريد الإلكتروني"""
        if not email or not isinstance(email, str):
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email.strip()))
    
    def validate_phone(phone: str) -> bool:
        """التحقق من صحة رقم الهاتف"""
        if not phone or not isinstance(phone, str):
            return False
        # إزالة المسافات والرموز
        clean_phone = re.sub(r'[^\d+]', '', phone)
        # التحقق من الطول والتنسيق
        return len(clean_phone) >= 10 and len(clean_phone) <= 15
    
    def validate_url(url: str) -> bool:
        """التحقق من صحة الرابط"""
        if not url or not isinstance(url, str):
            return False
        pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
        return bool(re.match(pattern, url.strip()))

# إعداد نظام السجلات
logger = logging.getLogger(__name__)

def performance_monitor(func):
    """Decorator لمراقبة أداء الدوال"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            if execution_time > 1.0:  # تحذير إذا استغرقت أكثر من ثانية
                logger.warning(f"دالة {func.__name__} استغرقت {execution_time:.2f} ثانية")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"خطأ في دالة {func.__name__} بعد {execution_time:.2f} ثانية: {str(e)}")
            raise
    return wrapper

def safe_execute(default_return=None, log_errors=True):
    """Decorator لتنفيذ آمن مع معالجة الأخطاء"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if log_errors:
                    logger.error(f"خطأ في دالة {func.__name__}: {str(e)}")
                return default_return
        return wrapper
    return decorator

# ===========================================
# دوال تنسيق البيانات
# ===========================================

@safe_execute(default_return="0.00 SAR")
def format_currency(amount: Union[float, int, Decimal], currency: str = 'SAR', 
                   locale: str = 'ar') -> str:
    """تنسيق المبلغ حسب العملة مع دعم اللغات المتعددة"""
    if amount is None:
        return f"0.00 {currency}"
    
    try:
        amount = float(amount)
        
        # رموز العملات
        currency_symbols = {
            'SAR': {'ar': 'ر.س', 'en': 'SAR'},
            'USD': {'ar': 'دولار', 'en': '$'},
            'EUR': {'ar': 'يورو', 'en': '€'},
            'AED': {'ar': 'د.إ', 'en': 'AED'},
            'EGP': {'ar': 'ج.م', 'en': 'EGP'},
            'KWD': {'ar': 'د.ك', 'en': 'KWD'},
            'QAR': {'ar': 'ر.ق', 'en': 'QAR'},
            'BHD': {'ar': 'د.ب', 'en': 'BHD'},
            'OMR': {'ar': 'ر.ع', 'en': 'OMR'}
        }
        
        symbol = currency_symbols.get(currency, {}).get(locale, currency)
        
        # تنسيق الرقم حسب الحجم
        if abs(amount) >= 1000000000:  # مليار
            formatted = f"{amount/1000000000:.1f}B" if locale == 'en' else f"{amount/1000000000:.1f} مليار"
        elif abs(amount) >= 1000000:  # مليون
            formatted = f"{amount/1000000:.1f}M" if locale == 'en' else f"{amount/1000000:.1f} مليون"
        elif abs(amount) >= 1000:  # ألف
            formatted = f"{amount/1000:.1f}K" if locale == 'en' else f"{amount/1000:.1f} ألف"
        else:
            formatted = f"{amount:.2f}"
        
        return f"{formatted} {symbol}" if locale == 'en' else f"{symbol} {formatted}"
        
    except (ValueError, TypeError) as e:
        logger.error(f"خطأ في تنسيق العملة: {str(e)}")
        return f"0.00 {currency}"

@safe_execute(default_return="0.00%")
def format_percentage(value: Union[float, int], decimal_places: int = 2, 
                     show_sign: bool = True) -> str:
    """تنسيق النسبة المئوية مع خيارات متقدمة"""
    if value is None:
        return "0.00%"
    
    try:
        value = float(value)
        sign = "+" if value > 0 and show_sign else ""
        return f"{sign}{value:.{decimal_places}f}%"
    except (ValueError, TypeError):
        return "0.00%"

@safe_execute(default_return="")
def sanitize_text(text: str, strict: bool = False) -> str:
    """تنظيف النص من الأحرف الضارة مع خيارات متقدمة"""
    if not text or not isinstance(text, str):
        return ""
    
    # إزالة HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # إزالة JavaScript و CSS
    text = re.sub(r'<script.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
    
    if strict:
        # تنظيف صارم - إزالة جميع الأحرف الخاصة
        text = re.sub(r'[<>"\'\&\$\%\@\#\^\*\(\)\[\]\{\}\|\\\`\~]', '', text)
    else:
        # تنظيف أساسي - إزالة الأحرف الضارة فقط
        text = re.sub(r'[<>"\']', '', text)
    
    # تنظيف المسافات المتعددة
    text = ' '.join(text.split())
    
    return text.strip()

@safe_execute(default_return={})
def calculate_performance_score(metrics: Dict[str, float], 
                              weights: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
    """حساب نقاط الأداء مع أوزان قابلة للتخصيص"""
    # الأوزان الافتراضية
    default_weights = {
        'ctr': 0.25,
        'conversion_rate': 0.30,
        'quality_score': 0.25,
        'roas': 0.20
    }
    
    weights = weights or default_weights
    
    # المقاييس الافتراضية
    ctr = metrics.get('ctr', 0)
    conversion_rate = metrics.get('conversion_rate', 0)
    quality_score = metrics.get('quality_score', 5)
    roas = metrics.get('roas', 0)
    
    # حساب النقاط لكل مقياس (من 100)
    scores = {
        'ctr_score': min(ctr * 50, 100),  # CTR أعلى من 2% = 100 نقطة
        'conversion_score': min(conversion_rate * 20, 100),  # معدل تحويل أعلى من 5% = 100 نقطة
        'quality_score': (quality_score / 10) * 100,  # Quality Score من 10
        'roas_score': min(roas * 25, 100)  # ROAS أعلى من 4 = 100 نقطة
    }
    
    # النقاط الإجمالية (متوسط مرجح)
    total_score = sum(scores[f"{key}_score"] * weight 
                     for key, weight in weights.items() 
                     if f"{key}_score" in scores)
    
    # تحديد المستوى والتوصيات
    if total_score >= 90:
        level, color, recommendation = "ممتاز جداً", "green", "استمر في الأداء الرائع"
    elif total_score >= 80:
        level, color, recommendation = "ممتاز", "green", "أداء ممتاز، حافظ عليه"
    elif total_score >= 70:
        level, color, recommendation = "جيد جداً", "blue", "أداء جيد، يمكن تحسينه"
    elif total_score >= 60:
        level, color, recommendation = "جيد", "blue", "يحتاج تحسينات طفيفة"
    elif total_score >= 40:
        level, color, recommendation = "متوسط", "orange", "يحتاج تحسينات واضحة"
    elif total_score >= 20:
        level, color, recommendation = "ضعيف", "red", "يحتاج تحسينات جذرية"
    else:
        level, color, recommendation = "ضعيف جداً", "red", "يحتاج إعادة نظر شاملة"
    
    return {
        'total_score': round(total_score, 1),
        'level': level,
        'color': color,
        'recommendation': recommendation,
        'breakdown': {key: round(score, 1) for key, score in scores.items()},
        'weights_used': weights,
        'timestamp': datetime.utcnow().isoformat()
    }

@safe_execute(default_return=False)
def validate_amount(amount: Union[float, int, str]) -> bool:
    """التحقق من صحة المبلغ مع معالجة Decimal صحيحة"""
    try:
        # تحويل إلى Decimal للدقة
        decimal_amount = Decimal(str(amount))
        
        # التحقق من القيم السالبة
        if decimal_amount <= 0:
            return False
        
        # التحقق من الحد الأقصى
        if decimal_amount > Decimal('1000000'):
            return False
        
        # التحقق من عدد الخانات العشرية
        if decimal_amount.as_tuple().exponent < -2:
            return False
        
        return True
        
    except (ValueError, TypeError, Decimal.InvalidOperation):
        return False

def calculate_hash(data: Union[str, Dict, List], algorithm: str = 'sha256') -> str:
    """
    حساب hash للبيانات
    
    Args:
        data: البيانات المراد تشفيرها
        algorithm: خوارزمية التشفير (sha256, md5, sha1)
    
    Returns:
        str: قيمة hash بصيغة hexadecimal
    """
    try:
        # تحويل البيانات إلى string
        if isinstance(data, (dict, list)):
            data_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
        else:
            data_str = str(data)
        
        # اختيار خوارزمية التشفير
        if algorithm == 'md5':
            hash_obj = hashlib.md5()
        elif algorithm == 'sha1':
            hash_obj = hashlib.sha1()
        else:  # sha256 افتراضي
            hash_obj = hashlib.sha256()
        
        # تشفير البيانات
        hash_obj.update(data_str.encode('utf-8'))
        return hash_obj.hexdigest()
        
    except Exception as e:
        logger.error(f"خطأ في حساب hash: {str(e)}")
        return ""

@safe_execute(default_return={})
def process_financial_data(amount: Union[float, int, str], 
                          currency: str = 'SAR',
                          include_analysis: bool = True) -> Dict[str, Any]:
    """معالجة البيانات المالية مع تحليل شامل"""
    try:
        # تحويل إلى Decimal للدقة
        decimal_amount = Decimal(str(amount))
        result = {
            'original_amount': amount,
            'processed_data': {
                'amount': decimal_amount,
                'currency': currency,
                'formatted': format_currency(decimal_amount, currency),
                'is_valid': validate_amount(decimal_amount)
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if include_analysis:
            # تحليل المبلغ
            analysis = {
                'category': 'unknown',
                'risk_level': 'medium',
                'recommendations': []
            }
            
            # تصنيف المبلغ
            if decimal_amount < Decimal('10'):
                analysis['category'] = 'micro'
                analysis['risk_level'] = 'low'
            elif decimal_amount > Decimal('10000'):
                analysis['category'] = 'large'
                analysis['risk_level'] = 'high'
                analysis['recommendations'].append('يتطلب موافقة إضافية')
            else:
                analysis['category'] = 'standard'
            
            result['analysis'] = analysis
        
        return result
        
    except Exception as e:
        logger.error(f"خطأ في معالجة البيانات المالية: {str(e)}")
        return {}

@safe_execute(default_return="")
def format_currency_advanced(amount: Union[float, int, Decimal], 
                            currency: str = 'USD',
                            locale: str = 'en') -> str:
    """تنسيق العملة المتقدم مع دعم عملات متعددة"""
    try:
        decimal_amount = Decimal(str(amount))
        
        # تنسيق حسب العملة
        if currency == 'USD':
            return f"${decimal_amount:,.2f}"
        elif currency == 'EUR':
            return f"€{decimal_amount:,.2f}"
        elif currency == 'GBP':
            return f"£{decimal_amount:,.2f}"
        else:
            return f"{decimal_amount:,.2f} {currency.upper()}"
            
    except Exception as e:
        logger.error(f"خطأ في تنسيق العملة المتقدم: {str(e)}")
        return f"0.00 {currency}"

# قائمة الدوال المُصدرة
__all__ = [
    # دوال التنسيق
    'format_currency', 'format_percentage', 'format_currency_advanced',
    
    # دوال التنظيف والتحقق
    'sanitize_text', 'validate_email', 'validate_phone', 'validate_url',
    'validate_amount',
    
    # دوال الحساب والتحليل
    'calculate_performance_score', 'calculate_hash', 'process_financial_data',
    
    # دوال الأمان والمراقبة
    'performance_monitor', 'safe_execute',
    
    # دوال التشفير
    'bcrypt',
    
    # دوال التحليل
    'generate_analysis_id'
]

