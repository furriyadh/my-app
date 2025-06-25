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
import bcrypt
import uuid
import base64
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Union, Tuple
from decimal import Decimal
from functools import wraps
import time
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

@safe_execute(default_return="0")
def format_number(number: Union[float, int], decimal_places: int = 0, 
                 use_separators: bool = True, locale: str = 'ar') -> str:
    """تنسيق الأرقام مع فواصل الآلاف ودعم اللغات"""
    if number is None:
        return "0"
    
    try:
        number = float(number)
        
        if decimal_places > 0:
            formatted = f"{number:.{decimal_places}f}"
        else:
            formatted = f"{int(number)}"
        
        if use_separators:
            # استخدام فاصلة للعربية ونقطة للإنجليزية
            if locale == 'ar':
                formatted = f"{float(formatted):,.{decimal_places}f}".replace(',', '،')
            else:
                formatted = f"{float(formatted):,.{decimal_places}f}"
        
        return formatted
        
    except (ValueError, TypeError):
        return "0"

@safe_execute(default_return="")
def format_phone_number(phone: str, country_code: str = 'SA') -> str:
    """تنسيق رقم الهاتف حسب الدولة"""
    if not phone:
        return ""
    
    # إزالة جميع الأحرف غير الرقمية
    clean_phone = re.sub(r'[^\d]', '', phone)
    
    # رموز الدول
    country_codes = {
        'SA': '+966',
        'AE': '+971',
        'EG': '+20',
        'KW': '+965',
        'QA': '+974',
        'BH': '+973',
        'OM': '+968',
        'US': '+1',
        'UK': '+44'
    }
    
    code = country_codes.get(country_code, '+966')
    
    # إزالة رمز الدولة إذا كان موجوداً
    if clean_phone.startswith(code.replace('+', '')):
        clean_phone = clean_phone[len(code.replace('+', '')):]
    elif clean_phone.startswith('0'):
        clean_phone = clean_phone[1:]
    
    # تنسيق الرقم
    if country_code == 'SA' and len(clean_phone) == 9:
        return f"{code} {clean_phone[:2]} {clean_phone[2:5]} {clean_phone[5:]}"
    elif len(clean_phone) >= 8:
        return f"{code} {clean_phone}"
    
    return phone  # إرجاع الرقم الأصلي إذا لم يكن صالحاً

# ===========================================
# دوال حساب الأداء والإحصائيات
# ===========================================

@performance_monitor
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

@safe_execute(default_return={})
def calculate_growth_rate(current: float, previous: float, 
                         period: str = "period") -> Dict[str, Any]:
    """حساب معدل النمو مع تفاصيل إضافية"""
    try:
        if previous == 0:
            if current > 0:
                return {
                    'rate': float('inf'),
                    'percentage': "∞%",
                    'direction': 'up',
                    'color': 'green',
                    'description': f"نمو لا نهائي في {period}",
                    'absolute_change': current
                }
            else:
                return {
                    'rate': 0,
                    'percentage': "0%",
                    'direction': 'stable',
                    'color': 'gray',
                    'description': f"لا يوجد تغيير في {period}",
                    'absolute_change': 0
                }
        
        rate = ((current - previous) / previous) * 100
        absolute_change = current - previous
        
        if rate > 0:
            direction = 'up'
            color = 'green'
            percentage = f"+{rate:.1f}%"
            description = f"نمو إيجابي بنسبة {rate:.1f}% في {period}"
        elif rate < 0:
            direction = 'down'
            color = 'red'
            percentage = f"{rate:.1f}%"
            description = f"انخفاض بنسبة {abs(rate):.1f}% في {period}"
        else:
            direction = 'stable'
            color = 'gray'
            percentage = "0%"
            description = f"استقرار في {period}"
        
        return {
            'rate': round(rate, 2),
            'percentage': percentage,
            'direction': direction,
            'color': color,
            'description': description,
            'absolute_change': round(absolute_change, 2),
            'current_value': current,
            'previous_value': previous
        }
        
    except Exception as e:
        logger.error(f"خطأ في حساب معدل النمو: {str(e)}")
        return {
            'rate': 0,
            'percentage': "0%",
            'direction': 'stable',
            'color': 'gray',
            'description': "خطأ في الحساب",
            'absolute_change': 0
        }

@safe_execute(default_return={})
def calculate_budget_recommendation(current_performance: Dict[str, float], 
                                  target_goals: Dict[str, float],
                                  constraints: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
    """حساب توصيات الميزانية مع قيود"""
    constraints = constraints or {}
    
    current_spend = current_performance.get('spend', 0)
    current_conversions = current_performance.get('conversions', 0)
    current_revenue = current_performance.get('revenue', 0)
    
    target_conversions = target_goals.get('conversions', current_conversions * 1.2)
    target_revenue = target_goals.get('revenue', current_revenue * 1.2)
    max_budget = constraints.get('max_budget', float('inf'))
    min_roas = constraints.get('min_roas', 2.0)
    
    # حساب التكلفة لكل تحويل
    if current_conversions > 0:
        cost_per_conversion = current_spend / current_conversions
        recommended_spend = target_conversions * cost_per_conversion
    else:
        recommended_spend = current_spend * 1.5
    
    # تطبيق القيود
    recommended_spend = min(recommended_spend, max_budget)
    
    # حساب العائد المتوقع على الاستثمار
    if recommended_spend > 0:
        expected_roas = target_revenue / recommended_spend
    else:
        expected_roas = 0
    
    # التحقق من الحد الأدنى للعائد
    if expected_roas < min_roas and recommended_spend > 0:
        recommended_spend = target_revenue / min_roas
        expected_roas = min_roas
    
    # تحديد مستوى التوصية
    confidence_factors = []
    
    if expected_roas >= 4:
        recommendation_level = "مُوصى به بشدة"
        confidence = "عالية جداً"
        confidence_factors.append("عائد استثمار ممتاز")
    elif expected_roas >= 3:
        recommendation_level = "مُوصى به بشدة"
        confidence = "عالية"
        confidence_factors.append("عائد استثمار جيد جداً")
    elif expected_roas >= 2:
        recommendation_level = "مُوصى به"
        confidence = "متوسطة"
        confidence_factors.append("عائد استثمار مقبول")
    else:
        recommendation_level = "يحتاج مراجعة"
        confidence = "منخفضة"
        confidence_factors.append("عائد استثمار منخفض")
    
    # عوامل إضافية للثقة
    if current_conversions >= 30:
        confidence_factors.append("بيانات كافية للتحليل")
    elif current_conversions >= 10:
        confidence_factors.append("بيانات محدودة")
    else:
        confidence_factors.append("بيانات غير كافية")
    
    budget_change_percent = ((recommended_spend - current_spend) / current_spend * 100) if current_spend > 0 else 0
    
    return {
        'recommended_budget': round(recommended_spend, 2),
        'expected_conversions': round(target_conversions, 0),
        'expected_revenue': round(target_revenue, 2),
        'expected_roas': round(expected_roas, 2),
        'recommendation_level': recommendation_level,
        'confidence': confidence,
        'confidence_factors': confidence_factors,
        'budget_change_percent': round(budget_change_percent, 1),
        'budget_change_amount': round(recommended_spend - current_spend, 2),
        'constraints_applied': constraints,
        'analysis_date': datetime.utcnow().isoformat()
    }

# ===========================================
# دوال معالجة النصوص والتنظيف
# ===========================================

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

@safe_execute(default_return=[])
def extract_keywords_from_text(text: str, max_keywords: int = 20, 
                              min_length: int = 3, language: str = 'ar') -> List[str]:
    """استخراج الكلمات المفتاحية من النص مع دعم اللغات"""
    if not text:
        return []
    
    # تنظيف النص
    text = sanitize_text(text.lower())
    
    # كلمات الوقف حسب اللغة
    stop_words_ar = {
        'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
        'التي', 'الذي', 'كان', 'كانت', 'يكون', 'تكون', 'هو', 'هي', 'أن',
        'أو', 'لكن', 'لكن', 'حيث', 'عند', 'بعد', 'قبل', 'أثناء', 'خلال'
    }
    
    stop_words_en = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    }
    
    stop_words = stop_words_ar if language == 'ar' else stop_words_en
    
    # تقسيم النص إلى كلمات
    if language == 'ar':
        # دعم أفضل للعربية
        words = re.findall(r'[\u0600-\u06FF\w]+', text)
    else:
        words = re.findall(r'\b\w+\b', text)
    
    # تصفية الكلمات
    keywords = []
    word_count = {}
    
    for word in words:
        if (len(word) >= min_length and 
            word not in stop_words and 
            not word.isdigit() and
            not re.match(r'^[^\u0600-\u06FF\w]*$', word)):  # ليس رموز فقط
            
            # حساب تكرار الكلمات
            word_count[word] = word_count.get(word, 0) + 1
    
    # ترتيب الكلمات حسب التكرار
    sorted_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
    keywords = [word for word, count in sorted_words[:max_keywords]]
    
    return keywords

# ===========================================
# دوال التشفير والأمان
# ===========================================

@safe_execute(default_return="")
def generate_unique_id(prefix: str = "", length: int = 12) -> str:
    """إنشاء معرف فريد مع بادئة اختيارية"""
    # استخدام UUID4 للحصول على معرف فريد
    unique_part = str(uuid.uuid4()).replace('-', '')[:length]
    
    if prefix:
        return f"{prefix}_{unique_part}"
    return unique_part

@safe_execute(default_return="")
def generate_hash(data: str, algorithm: str = 'sha256') -> str:
    """إنشاء hash للبيانات مع خوارزميات متعددة"""
    if not data:
        return ""
    
    try:
        if algorithm == 'md5':
            return hashlib.md5(data.encode('utf-8')).hexdigest()
        elif algorithm == 'sha1':
            return hashlib.sha1(data.encode('utf-8')).hexdigest()
        elif algorithm == 'sha256':
            return hashlib.sha256(data.encode('utf-8')).hexdigest()
        elif algorithm == 'sha512':
            return hashlib.sha512(data.encode('utf-8')).hexdigest()
        else:
            return hashlib.sha256(data.encode('utf-8')).hexdigest()
    except Exception as e:
        logger.error(f"خطأ في إنشاء hash: {str(e)}")
        return ""

@safe_execute(default_return="")
def generate_short_id(length: int = 8, use_numbers: bool = True, 
                     use_uppercase: bool = True, use_lowercase: bool = True) -> str:
    """إنشاء معرف قصير قابل للتخصيص"""
    import random
    import string
    
    characters = ""
    if use_lowercase:
        characters += string.ascii_lowercase
    if use_uppercase:
        characters += string.ascii_uppercase
    if use_numbers:
        characters += string.digits
    
    if not characters:
        characters = string.ascii_letters + string.digits
    
    return ''.join(random.choice(characters) for _ in range(length))

@safe_execute(default_return="")
def encrypt_token(token: str, key: Optional[str] = None) -> str:
    """تشفير الرمز المميز مع تشفير قوي"""
    try:
        if not token:
            return ""
        
        # استخدام مفتاح من متغيرات البيئة أو مفتاح افتراضي
        encryption_key = key or os.getenv('ENCRYPTION_KEY', 'default-key-2025-secure')
        
        # إضافة salt للأمان
        salt = secrets.token_hex(16)
        
        # دمج البيانات
        combined = f"{salt}:{token}:{int(time.time())}"
        
        # تشفير باستخدام base64 مع تعقيد إضافي
        encoded = base64.b64encode(combined.encode('utf-8')).decode('utf-8')
        
        # إضافة طبقة تشفير إضافية
        final_hash = hashlib.sha256(f"{encoded}{encryption_key}".encode()).hexdigest()[:16]
        
        return f"{encoded}.{final_hash}"
        
    except Exception as e:
        logger.error(f"خطأ في تشفير الرمز: {str(e)}")
        return token

@safe_execute(default_return="")
def decrypt_token(encrypted_token: str, key: Optional[str] = None) -> str:
    """فك تشفير الرمز المميز"""
    try:
        if not encrypted_token or '.' not in encrypted_token:
            return ""
        
        # فصل الرمز المشفر عن hash التحقق
        encoded_part, verification_hash = encrypted_token.rsplit('.', 1)
        
        # التحقق من صحة الرمز
        encryption_key = key or os.getenv('ENCRYPTION_KEY', 'default-key-2025-secure')
        expected_hash = hashlib.sha256(f"{encoded_part}{encryption_key}".encode()).hexdigest()[:16]
        
        if verification_hash != expected_hash:
            logger.warning("فشل في التحقق من صحة الرمز المشفر")
            return ""
        
        # فك التشفير
        decoded = base64.b64decode(encoded_part.encode('utf-8')).decode('utf-8')
        
        # فصل المكونات
        parts = decoded.split(':')
        if len(parts) >= 3:
            salt, token, timestamp = parts[0], parts[1], parts[2]
            
            # التحقق من انتهاء صلاحية الرمز (24 ساعة)
            token_time = int(timestamp)
            current_time = int(time.time())
            if current_time - token_time > 86400:  # 24 ساعة
                logger.warning("انتهت صلاحية الرمز المشفر")
                return ""
            
            return token
        
        return ""
        
    except Exception as e:
        logger.error(f"خطأ في فك تشفير الرمز: {str(e)}")
        return ""

@safe_execute(default_return="")
def hash_password(password: str) -> str:
    """تشفير كلمة المرور باستخدام bcrypt"""
    try:
        if not password:
            return ""
        
        # إنشاء salt وتشفير كلمة المرور
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
        
    except Exception as e:
        logger.error(f"خطأ في تشفير كلمة المرور: {str(e)}")
        return ""

@safe_execute(default_return=False)
def verify_password(password: str, hashed_password: str) -> bool:
    """التحقق من كلمة المرور"""
    try:
        if not password or not hashed_password:
            return False
        
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        
    except Exception as e:
        logger.error(f"خطأ في التحقق من كلمة المرور: {str(e)}")
        return False

# ===========================================
# دوال التواريخ والأوقات
# ===========================================

@safe_execute(default_return=(datetime.now().date(), datetime.now().date()))
def parse_date_range(date_range: str) -> Tuple[datetime, datetime]:
    """تحليل نطاق التاريخ مع خيارات متقدمة"""
    today = datetime.now().date()
    
    date_ranges = {
        'today': (today, today),
        'yesterday': (today - timedelta(days=1), today - timedelta(days=1)),
        'last_7_days': (today - timedelta(days=7), today),
        'last_14_days': (today - timedelta(days=14), today),
        'last_30_days': (today - timedelta(days=30), today),
        'last_60_days': (today - timedelta(days=60), today),
        'last_90_days': (today - timedelta(days=90), today),
        'this_week': (today - timedelta(days=today.weekday()), today),
        'last_week': (today - timedelta(days=today.weekday() + 7), 
                     today - timedelta(days=today.weekday() + 1)),
        'this_month': (today.replace(day=1), today),
        'last_month': None,  # سيتم حسابه أدناه
        'this_quarter': None,  # سيتم حسابه أدناه
        'last_quarter': None,  # سيتم حسابه أدناه
        'this_year': (today.replace(month=1, day=1), today),
        'last_year': (today.replace(year=today.year-1, month=1, day=1),
                     today.replace(year=today.year-1, month=12, day=31))
    }
    
    # حساب الشهر الماضي
    if date_range == 'last_month':
        first_day_this_month = today.replace(day=1)
        last_day_last_month = first_day_this_month - timedelta(days=1)
        first_day_last_month = last_day_last_month.replace(day=1)
        return first_day_last_month, last_day_last_month
    
    # حساب الربع الحالي
    if date_range == 'this_quarter':
        quarter = (today.month - 1) // 3 + 1
        first_month = (quarter - 1) * 3 + 1
        first_day = today.replace(month=first_month, day=1)
        return first_day, today
    
    # حساب الربع الماضي
    if date_range == 'last_quarter':
        current_quarter = (today.month - 1) // 3 + 1
        last_quarter = current_quarter - 1 if current_quarter > 1 else 4
        year = today.year if current_quarter > 1 else today.year - 1
        
        first_month = (last_quarter - 1) * 3 + 1
        last_month = last_quarter * 3
        
        first_day = datetime(year, first_month, 1).date()
        # آخر يوم في الربع
        if last_month == 12:
            last_day = datetime(year, 12, 31).date()
        else:
            last_day = (datetime(year, last_month + 1, 1) - timedelta(days=1)).date()
        
        return first_day, last_day
    
    return date_ranges.get(date_range, (today - timedelta(days=30), today))

@safe_execute(default_return="")
def format_date_arabic(date_obj: Union[datetime, str], 
                      format_type: str = 'full') -> str:
    """تنسيق التاريخ بالعربية مع خيارات متعددة"""
    if not date_obj:
        return ""
    
    # تحويل النص إلى تاريخ إذا لزم الأمر
    if isinstance(date_obj, str):
        try:
            date_obj = datetime.fromisoformat(date_obj.replace('Z', '+00:00'))
        except:
            return date_obj
    
    arabic_months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ]
    
    arabic_days = [
        'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'
    ]
    
    month_name = arabic_months[date_obj.month - 1]
    
    if format_type == 'full':
        day_name = arabic_days[date_obj.weekday()]
        return f"{day_name}، {date_obj.day} {month_name} {date_obj.year}"
    elif format_type == 'short':
        return f"{date_obj.day} {month_name} {date_obj.year}"
    elif format_type == 'month_year':
        return f"{month_name} {date_obj.year}"
    elif format_type == 'day_month':
        return f"{date_obj.day} {month_name}"
    else:
        return f"{date_obj.day} {month_name} {date_obj.year}"

@safe_execute(default_return=None)
def convert_timezone(dt: datetime, from_tz: str = 'UTC', 
                    to_tz: str = 'Asia/Riyadh') -> Optional[datetime]:
    """تحويل المنطقة الزمنية مع معالجة أخطاء محسنة"""
    try:
        import pytz
        
        if dt.tzinfo is None:
            # إذا لم تكن هناك معلومات منطقة زمنية، افترض المنطقة المحددة
            source_tz = pytz.timezone(from_tz)
            dt = source_tz.localize(dt)
        
        target_tz = pytz.timezone(to_tz)
        return dt.astimezone(target_tz)
        
    except ImportError:
        logger.warning("مكتبة pytz غير متاحة، سيتم إرجاع التاريخ كما هو")
        return dt
    except Exception as e:
        logger.error(f"خطأ في تحويل المنطقة الزمنية: {str(e)}")
        return dt

# ===========================================
# دوال التحقق والتنظيف
# ===========================================

@safe_execute(default_return={})
def validate_and_clean_data(data: Dict[str, Any], 
                           required_fields: Optional[List[str]] = None,
                           field_types: Optional[Dict[str, type]] = None,
                           custom_validators: Optional[Dict[str, callable]] = None) -> Dict[str, Any]:
    """التحقق من البيانات وتنظيفها مع خيارات متقدمة"""
    if not isinstance(data, dict):
        raise ValueError("البيانات يجب أن تكون من نوع dict")
    
    cleaned_data = {}
    errors = []
    
    # تنظيف البيانات
    for key, value in data.items():
        if isinstance(value, str):
            cleaned_data[key] = sanitize_text(value)
        elif isinstance(value, (int, float)) and value != value:  # NaN check
            cleaned_data[key] = None
        else:
            cleaned_data[key] = value
    
    # التحقق من الحقول المطلوبة
    if required_fields:
        for field in required_fields:
            if field not in cleaned_data or cleaned_data[field] in [None, "", []]:
                errors.append(f"الحقل '{field}' مطلوب")
    
    # التحقق من أنواع البيانات
    if field_types:
        for field, expected_type in field_types.items():
            if field in cleaned_data and cleaned_data[field] is not None:
                if not isinstance(cleaned_data[field], expected_type):
                    try:
                        # محاولة تحويل النوع
                        cleaned_data[field] = expected_type(cleaned_data[field])
                    except (ValueError, TypeError):
                        errors.append(f"الحقل '{field}' يجب أن يكون من نوع {expected_type.__name__}")
    
    # تطبيق المدققات المخصصة
    if custom_validators:
        for field, validator in custom_validators.items():
            if field in cleaned_data and cleaned_data[field] is not None:
                try:
                    if not validator(cleaned_data[field]):
                        errors.append(f"الحقل '{field}' لا يجتاز التحقق المخصص")
                except Exception as e:
                    errors.append(f"خطأ في التحقق من الحقل '{field}': {str(e)}")
    
    if errors:
        raise ValueError(f"أخطاء في التحقق من البيانات: {'; '.join(errors)}")
    
    return cleaned_data

# ===========================================
# دوال الاستجابة والتقسيم
# ===========================================

@safe_execute(default_return={})
def create_response(success: bool = True, data: Any = None, message: str = "", 
                   error_code: Optional[str] = None, status_code: int = 200,
                   metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """إنشاء استجابة موحدة مع معلومات إضافية"""
    response = {
        'success': success,
        'timestamp': datetime.utcnow().isoformat(),
        'status_code': status_code
    }
    
    if data is not None:
        response['data'] = data
    
    if message:
        response['message'] = message
    
    if error_code:
        response['error_code'] = error_code
    
    if metadata:
        response['metadata'] = metadata
    
    # إضافة معلومات إضافية للتطوير
    if os.getenv('DEBUG', 'False').lower() == 'true':
        response['debug_info'] = {
            'server_time': time.time(),
            'process_id': os.getpid()
        }
    
    return response

@safe_execute(default_return={})
def paginate_data(data: List[Any], page: int = 1, limit: int = 20,
                 sort_key: Optional[str] = None, sort_reverse: bool = False) -> Dict[str, Any]:
    """تقسيم البيانات إلى صفحات مع خيارات ترتيب"""
    if not isinstance(data, list):
        data = list(data)
    
    # ترتيب البيانات إذا طُلب ذلك
    if sort_key:
        try:
            if isinstance(data[0], dict):
                data = sorted(data, key=lambda x: x.get(sort_key, ''), reverse=sort_reverse)
            else:
                data = sorted(data, key=lambda x: getattr(x, sort_key, ''), reverse=sort_reverse)
        except (IndexError, AttributeError, TypeError):
            pass  # تجاهل أخطاء الترتيب
    
    total = len(data)
    start = (page - 1) * limit
    end = start + limit
    
    paginated_data = data[start:end]
    total_pages = (total + limit - 1) // limit
    
    return {
        'data': paginated_data,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': total_pages,
            'has_next': page < total_pages,
            'has_prev': page > 1,
            'start_index': start + 1 if paginated_data else 0,
            'end_index': min(end, total),
            'showing': len(paginated_data)
        },
        'sort_info': {
            'sort_key': sort_key,
            'sort_reverse': sort_reverse
        } if sort_key else None
    }

# ===========================================
# دوال الإشعارات والتواصل
# ===========================================

@safe_execute(default_return={})
def send_notification(user_id: str, message: str, notification_type: str = 'info',
                     priority: str = 'normal', channels: Optional[List[str]] = None,
                     metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """إرسال إشعار للمستخدم مع خيارات متقدمة"""
    channels = channels or ['in_app']
    metadata = metadata or {}
    
    notification_data = {
        'id': generate_unique_id('notif'),
        'user_id': user_id,
        'message': message,
        'type': notification_type,
        'priority': priority,
        'channels': channels,
        'metadata': metadata,
        'timestamp': datetime.utcnow().isoformat(),
        'read': False,
        'delivered': False
    }
    
    try:
        # في التطبيق الحقيقي، هذه الدالة ستتصل بخدمة الإشعارات
        # مثل Firebase، Pusher، أو نظام إشعارات مخصص
        
        # محاكاة إرسال الإشعار
        logger.info(f"إشعار {notification_type} للمستخدم {user_id}: {message}")
        
        # محاكاة نجاح الإرسال
        notification_data['delivered'] = True
        notification_data['delivery_time'] = datetime.utcnow().isoformat()
        
        return {
            'success': True,
            'notification_id': notification_data['id'],
            'message': 'تم إرسال الإشعار بنجاح',
            'notification_data': notification_data
        }
        
    except Exception as e:
        logger.error(f"خطأ في إرسال الإشعار: {str(e)}")
        return {
            'success': False,
            'error': f'فشل في إرسال الإشعار: {str(e)}',
            'notification_data': notification_data
        }

# ===========================================
# دوال متنوعة ومساعدة
# ===========================================

@safe_execute(default_return={})
def get_system_info() -> Dict[str, Any]:
    """الحصول على معلومات النظام"""
    import platform
    import psutil
    
    try:
        return {
            'platform': platform.platform(),
            'python_version': platform.python_version(),
            'cpu_count': psutil.cpu_count(),
            'memory_total': psutil.virtual_memory().total,
            'memory_available': psutil.virtual_memory().available,
            'disk_usage': psutil.disk_usage('/').percent,
            'timestamp': datetime.utcnow().isoformat()
        }
    except ImportError:
        return {
            'platform': platform.platform(),
            'python_version': platform.python_version(),
            'timestamp': datetime.utcnow().isoformat(),
            'note': 'psutil not available for detailed system info'
        }

@safe_execute(default_return="")
def generate_slug(text: str, max_length: int = 50) -> str:
    """إنشاء slug من النص"""
    if not text:
        return ""
    
    # تحويل إلى أحرف صغيرة
    slug = text.lower()
    
    # استبدال المسافات والأحرف الخاصة بشرطات
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    
    # إزالة الشرطات من البداية والنهاية
    slug = slug.strip('-')
    
    # تحديد الطول
    if len(slug) > max_length:
        slug = slug[:max_length].rstrip('-')
    
    return slug

# تصدير جميع الدوال المهمة
__all__ = [
    # دوال التنسيق
    'format_currency', 'format_percentage', 'format_number', 'format_phone_number',
    'format_date_arabic',
    
    # دوال الحساب
    'calculate_performance_score', 'calculate_growth_rate', 'calculate_budget_recommendation',
    
    # دوال النصوص
    'sanitize_text', 'extract_keywords_from_text', 'generate_slug',
    
    # دوال الأمان
    'generate_unique_id', 'generate_hash', 'generate_short_id', 'encrypt_token',
    'decrypt_token', 'hash_password', 'verify_password',
    
    # دوال التواريخ
    'parse_date_range', 'convert_timezone',
    
    # دوال التحقق
    'validate_email', 'validate_phone', 'validate_url', 'validate_and_clean_data',
    
    # دوال الاستجابة
    'create_response', 'paginate_data',
    
    # دوال الإشعارات
    'send_notification',
    
    # دوال متنوعة
    'get_system_info',
    
    # Decorators
    'performance_monitor', 'safe_execute'
]



# ===========================================
# دوال إدارة الحملات والمعرفات
# ===========================================

@safe_execute(default_return="")
def generate_campaign_id(prefix: str = "camp", length: int = 12) -> str:
    """إنشاء معرف فريد للحملة مع بادئة مخصصة"""
    timestamp = str(int(time.time()))[-6:]  # آخر 6 أرقام من timestamp
    random_part = secrets.token_hex(3)  # 6 أحرف عشوائية
    unique_part = str(uuid.uuid4()).replace('-', '')[:6]  # 6 أحرف من UUID
    
    campaign_id = f"{prefix}_{timestamp}_{random_part}_{unique_part}"
    
    # التأكد من الطول المطلوب
    if len(campaign_id) > length + len(prefix) + 3:  # +3 للشرطات السفلية
        campaign_id = f"{prefix}_{timestamp}_{random_part}"
    
    return campaign_id.lower()

@safe_execute(default_return="")
def generate_ad_group_id(campaign_id: str = "", prefix: str = "adg") -> str:
    """إنشاء معرف فريد لمجموعة الإعلانات"""
    timestamp = str(int(time.time()))[-4:]
    random_part = secrets.token_hex(2)
    
    if campaign_id:
        # استخراج جزء من معرف الحملة للربط
        camp_part = campaign_id.split('_')[-1][:4] if '_' in campaign_id else campaign_id[:4]
        return f"{prefix}_{camp_part}_{timestamp}_{random_part}".lower()
    
    return f"{prefix}_{timestamp}_{random_part}".lower()

@safe_execute(default_return="")
def generate_keyword_id(ad_group_id: str = "", prefix: str = "kw") -> str:
    """إنشاء معرف فريد للكلمة المفتاحية"""
    timestamp = str(int(time.time()))[-4:]
    random_part = secrets.token_hex(2)
    
    if ad_group_id:
        # استخراج جزء من معرف مجموعة الإعلانات
        adg_part = ad_group_id.split('_')[-1][:3] if '_' in ad_group_id else ad_group_id[:3]
        return f"{prefix}_{adg_part}_{timestamp}_{random_part}".lower()
    
    return f"{prefix}_{timestamp}_{random_part}".lower()

@safe_execute(default_return={})
def validate_campaign_data(campaign_data: Dict[str, Any]) -> Dict[str, Any]:
    """التحقق من صحة بيانات الحملة وتنظيفها"""
    errors = []
    warnings = []
    cleaned_data = {}
    
    # الحقول المطلوبة
    required_fields = ['name', 'budget', 'target_locations']
    
    # التحقق من الحقول المطلوبة
    for field in required_fields:
        if field not in campaign_data or not campaign_data[field]:
            errors.append(f"الحقل '{field}' مطلوب")
        else:
            cleaned_data[field] = campaign_data[field]
    
    # التحقق من اسم الحملة
    if 'name' in campaign_data:
        name = str(campaign_data['name']).strip()
        if len(name) < 3:
            errors.append("اسم الحملة يجب أن يكون 3 أحرف على الأقل")
        elif len(name) > 100:
            errors.append("اسم الحملة يجب أن يكون أقل من 100 حرف")
        else:
            # تنظيف اسم الحملة
            cleaned_data['name'] = sanitize_text(name)
    
    # التحقق من الميزانية
    if 'budget' in campaign_data:
        try:
            budget = float(campaign_data['budget'])
            if budget <= 0:
                errors.append("الميزانية يجب أن تكون أكبر من صفر")
            elif budget < 10:
                warnings.append("الميزانية منخفضة جداً، قد لا تحقق نتائج جيدة")
            elif budget > 100000:
                warnings.append("الميزانية عالية جداً، تأكد من صحة المبلغ")
            else:
                cleaned_data['budget'] = round(budget, 2)
        except (ValueError, TypeError):
            errors.append("الميزانية يجب أن تكون رقماً صحيحاً")
    
    # التحقق من المواقع المستهدفة
    if 'target_locations' in campaign_data:
        locations = campaign_data['target_locations']
        if isinstance(locations, list):
            if len(locations) == 0:
                errors.append("يجب تحديد موقع واحد على الأقل")
            else:
                cleaned_locations = []
                for location in locations:
                    if isinstance(location, str) and location.strip():
                        cleaned_locations.append(location.strip())
                cleaned_data['target_locations'] = cleaned_locations
        else:
            errors.append("المواقع المستهدفة يجب أن تكون قائمة")
    
    # التحقق من الحقول الاختيارية
    optional_fields = {
        'start_date': 'تاريخ البداية',
        'end_date': 'تاريخ النهاية',
        'bid_strategy': 'استراتيجية المزايدة',
        'target_audience': 'الجمهور المستهدف',
        'keywords': 'الكلمات المفتاحية'
    }
    
    for field, field_name in optional_fields.items():
        if field in campaign_data and campaign_data[field]:
            if field in ['start_date', 'end_date']:
                # التحقق من التواريخ
                try:
                    if isinstance(campaign_data[field], str):
                        datetime.fromisoformat(campaign_data[field].replace('Z', '+00:00'))
                    cleaned_data[field] = campaign_data[field]
                except ValueError:
                    warnings.append(f"تنسيق {field_name} غير صحيح")
            elif field == 'keywords':
                # التحقق من الكلمات المفتاحية
                keywords = campaign_data[field]
                if isinstance(keywords, list):
                    cleaned_keywords = []
                    for keyword in keywords:
                        if isinstance(keyword, str) and len(keyword.strip()) >= 2:
                            cleaned_keywords.append(keyword.strip().lower())
                    if cleaned_keywords:
                        cleaned_data[field] = cleaned_keywords
                    else:
                        warnings.append("لا توجد كلمات مفتاحية صالحة")
                else:
                    warnings.append("الكلمات المفتاحية يجب أن تكون قائمة")
            else:
                cleaned_data[field] = campaign_data[field]
    
    # إضافة معرف فريد إذا لم يكن موجوداً
    if 'campaign_id' not in cleaned_data:
        cleaned_data['campaign_id'] = generate_campaign_id()
    
    # إضافة timestamp
    cleaned_data['created_at'] = datetime.utcnow().isoformat()
    cleaned_data['updated_at'] = datetime.utcnow().isoformat()
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'cleaned_data': cleaned_data,
        'validation_summary': {
            'total_errors': len(errors),
            'total_warnings': len(warnings),
            'fields_validated': len(cleaned_data),
            'validation_date': datetime.utcnow().isoformat()
        }
    }

@safe_execute(default_return="")
def format_campaign_name(name: str, prefix: str = "", suffix: str = "", 
                        max_length: int = 100, auto_date: bool = False) -> str:
    """تنسيق اسم الحملة مع خيارات متقدمة"""
    if not name:
        return ""
    
    # تنظيف الاسم الأساسي
    clean_name = sanitize_text(name).strip()
    
    # إضافة البادئة
    if prefix:
        clean_name = f"{prefix} {clean_name}"
    
    # إضافة التاريخ التلقائي
    if auto_date:
        current_date = datetime.now().strftime("%Y%m")
        clean_name = f"{clean_name} {current_date}"
    
    # إضافة اللاحقة
    if suffix:
        clean_name = f"{clean_name} {suffix}"
    
    # تحديد الطول
    if len(clean_name) > max_length:
        # قطع النص مع الحفاظ على الكلمات
        words = clean_name.split()
        truncated = ""
        for word in words:
            if len(truncated + " " + word) <= max_length:
                truncated += (" " + word) if truncated else word
            else:
                break
        clean_name = truncated
    
    return clean_name

@safe_execute(default_return={})
def validate_ad_group_data(ad_group_data: Dict[str, Any]) -> Dict[str, Any]:
    """التحقق من صحة بيانات مجموعة الإعلانات"""
    errors = []
    warnings = []
    cleaned_data = {}
    
    # الحقول المطلوبة
    required_fields = ['name', 'campaign_id', 'default_cpc']
    
    for field in required_fields:
        if field not in ad_group_data or not ad_group_data[field]:
            errors.append(f"الحقل '{field}' مطلوب")
        else:
            cleaned_data[field] = ad_group_data[field]
    
    # التحقق من اسم مجموعة الإعلانات
    if 'name' in ad_group_data:
        name = str(ad_group_data['name']).strip()
        if len(name) < 2:
            errors.append("اسم مجموعة الإعلانات يجب أن يكون حرفين على الأقل")
        elif len(name) > 80:
            errors.append("اسم مجموعة الإعلانات يجب أن يكون أقل من 80 حرف")
        else:
            cleaned_data['name'] = sanitize_text(name)
    
    # التحقق من تكلفة النقرة الافتراضية
    if 'default_cpc' in ad_group_data:
        try:
            cpc = float(ad_group_data['default_cpc'])
            if cpc <= 0:
                errors.append("تكلفة النقرة يجب أن تكون أكبر من صفر")
            elif cpc < 0.1:
                warnings.append("تكلفة النقرة منخفضة جداً")
            elif cpc > 50:
                warnings.append("تكلفة النقرة عالية جداً")
            else:
                cleaned_data['default_cpc'] = round(cpc, 2)
        except (ValueError, TypeError):
            errors.append("تكلفة النقرة يجب أن تكون رقماً")
    
    # إضافة معرف فريد
    if 'ad_group_id' not in cleaned_data:
        campaign_id = cleaned_data.get('campaign_id', '')
        cleaned_data['ad_group_id'] = generate_ad_group_id(campaign_id)
    
    # إضافة timestamps
    cleaned_data['created_at'] = datetime.utcnow().isoformat()
    cleaned_data['updated_at'] = datetime.utcnow().isoformat()
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'cleaned_data': cleaned_data
    }

@safe_execute(default_return={})
def validate_keyword_data(keyword_data: Dict[str, Any]) -> Dict[str, Any]:
    """التحقق من صحة بيانات الكلمة المفتاحية"""
    errors = []
    warnings = []
    cleaned_data = {}
    
    # الحقول المطلوبة
    required_fields = ['keyword', 'ad_group_id', 'match_type']
    
    for field in required_fields:
        if field not in keyword_data or not keyword_data[field]:
            errors.append(f"الحقل '{field}' مطلوب")
        else:
            cleaned_data[field] = keyword_data[field]
    
    # التحقق من الكلمة المفتاحية
    if 'keyword' in keyword_data:
        keyword = str(keyword_data['keyword']).strip().lower()
        if len(keyword) < 2:
            errors.append("الكلمة المفتاحية يجب أن تكون حرفين على الأقل")
        elif len(keyword) > 80:
            errors.append("الكلمة المفتاحية يجب أن تكون أقل من 80 حرف")
        else:
            cleaned_data['keyword'] = keyword
    
    # التحقق من نوع المطابقة
    if 'match_type' in keyword_data:
        valid_match_types = ['EXACT', 'PHRASE', 'BROAD']
        match_type = str(keyword_data['match_type']).upper()
        if match_type not in valid_match_types:
            errors.append(f"نوع المطابقة يجب أن يكون أحد: {', '.join(valid_match_types)}")
        else:
            cleaned_data['match_type'] = match_type
    
    # التحقق من تكلفة النقرة المخصصة
    if 'cpc_bid' in keyword_data and keyword_data['cpc_bid']:
        try:
            cpc = float(keyword_data['cpc_bid'])
            if cpc <= 0:
                errors.append("تكلفة النقرة يجب أن تكون أكبر من صفر")
            else:
                cleaned_data['cpc_bid'] = round(cpc, 2)
        except (ValueError, TypeError):
            errors.append("تكلفة النقرة يجب أن تكون رقماً")
    
    # إضافة معرف فريد
    if 'keyword_id' not in cleaned_data:
        ad_group_id = cleaned_data.get('ad_group_id', '')
        cleaned_data['keyword_id'] = generate_keyword_id(ad_group_id)
    
    # إضافة timestamps
    cleaned_data['created_at'] = datetime.utcnow().isoformat()
    cleaned_data['updated_at'] = datetime.utcnow().isoformat()
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'cleaned_data': cleaned_data
    }

@safe_execute(default_return="")
def generate_account_id(prefix: str = "acc", customer_id: str = "") -> str:
    """إنشاء معرف فريد للحساب"""
    timestamp = str(int(time.time()))[-6:]
    random_part = secrets.token_hex(3)
    
    if customer_id:
        # استخدام جزء من customer_id
        cust_part = customer_id.replace('-', '')[-4:] if customer_id else ""
        return f"{prefix}_{cust_part}_{timestamp}_{random_part}".lower()
    
    return f"{prefix}_{timestamp}_{random_part}".lower()

@safe_execute(default_return={})
def validate_budget_data(budget_data: Dict[str, Any]) -> Dict[str, Any]:
    """التحقق من صحة بيانات الميزانية"""
    errors = []
    warnings = []
    cleaned_data = {}
    
    # التحقق من المبلغ
    if 'amount' in budget_data:
        try:
            amount = float(budget_data['amount'])
            if amount <= 0:
                errors.append("مبلغ الميزانية يجب أن يكون أكبر من صفر")
            elif amount < 10:
                warnings.append("الميزانية منخفضة جداً")
            elif amount > 100000:
                warnings.append("الميزانية عالية جداً، تأكد من صحة المبلغ")
            else:
                cleaned_data['amount'] = round(amount, 2)
        except (ValueError, TypeError):
            errors.append("مبلغ الميزانية يجب أن يكون رقماً")
    
    # التحقق من نوع الميزانية
    if 'delivery_method' in budget_data:
        valid_methods = ['STANDARD', 'ACCELERATED']
        method = str(budget_data['delivery_method']).upper()
        if method not in valid_methods:
            errors.append(f"طريقة التسليم يجب أن تكون أحد: {', '.join(valid_methods)}")
        else:
            cleaned_data['delivery_method'] = method
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'cleaned_data': cleaned_data
    }

# تحديث قائمة التصدير
__all__.extend([
    'generate_campaign_id',
    'generate_ad_group_id', 
    'generate_keyword_id',
    'generate_account_id',
    'validate_campaign_data',
    'validate_ad_group_data',
    'validate_keyword_data',
    'validate_budget_data',
    'format_campaign_name'
])



# ===========================================
# دوال إدارة الحملات والمعرفات (الدوال المفقودة)
# ===========================================

def generate_campaign_id(prefix: str = "camp", length: int = 12) -> str:
    """إنشاء معرف فريد للحملة مع بادئة مخصصة"""
    try:
        import time
        import uuid
        
        timestamp = str(int(time.time()))[-6:]  # آخر 6 أرقام من timestamp
        random_part = secrets.token_hex(3)  # 6 أحرف عشوائية
        unique_part = str(uuid.uuid4()).replace('-', '')[:6]  # 6 أحرف من UUID
        
        campaign_id = f"{prefix}_{timestamp}_{random_part}_{unique_part}"
        
        # التأكد من الطول المطلوب
        if len(campaign_id) > length + len(prefix) + 3:  # +3 للشرطات السفلية
            campaign_id = f"{prefix}_{timestamp}_{random_part}"
        
        return campaign_id.lower()
        
    except Exception as e:
        logger.error(f"خطأ في إنشاء معرف الحملة: {str(e)}")
        return f"{prefix}_{generate_short_id()}"

def generate_ad_group_id(campaign_id: str = "", prefix: str = "adg") -> str:
    """إنشاء معرف فريد لمجموعة الإعلانات"""
    try:
        import time
        
        timestamp = str(int(time.time()))[-4:]
        random_part = secrets.token_hex(2)
        
        if campaign_id:
            # استخراج جزء من معرف الحملة للربط
            camp_part = campaign_id.split('_')[-1][:4] if '_' in campaign_id else campaign_id[:4]
            return f"{prefix}_{camp_part}_{timestamp}_{random_part}".lower()
        
        return f"{prefix}_{timestamp}_{random_part}".lower()
        
    except Exception as e:
        logger.error(f"خطأ في إنشاء معرف مجموعة الإعلانات: {str(e)}")
        return f"{prefix}_{generate_short_id()}"

def generate_keyword_id(ad_group_id: str = "", prefix: str = "kw") -> str:
    """إنشاء معرف فريد للكلمة المفتاحية"""
    try:
        import time
        
        timestamp = str(int(time.time()))[-4:]
        random_part = secrets.token_hex(2)
        
        if ad_group_id:
            # استخراج جزء من معرف مجموعة الإعلانات
            adg_part = ad_group_id.split('_')[-1][:3] if '_' in ad_group_id else ad_group_id[:3]
            return f"{prefix}_{adg_part}_{timestamp}_{random_part}".lower()
        
        return f"{prefix}_{timestamp}_{random_part}".lower()
        
    except Exception as e:
        logger.error(f"خطأ في إنشاء معرف الكلمة المفتاحية: {str(e)}")
        return f"{prefix}_{generate_short_id()}"

def validate_campaign_data(campaign_data: Dict[str, Any]) -> Dict[str, Any]:
    """التحقق من صحة بيانات الحملة وتنظيفها"""
    try:
        errors = []
        warnings = []
        cleaned_data = {}
        
        # الحقول المطلوبة
        required_fields = ['name', 'budget', 'target_locations']
        
        # التحقق من الحقول المطلوبة
        for field in required_fields:
            if field not in campaign_data or not campaign_data[field]:
                errors.append(f"الحقل '{field}' مطلوب")
            else:
                cleaned_data[field] = campaign_data[field]
        
        # التحقق من اسم الحملة
        if 'name' in campaign_data:
            name = str(campaign_data['name']).strip()
            if len(name) < 3:
                errors.append("اسم الحملة يجب أن يكون 3 أحرف على الأقل")
            elif len(name) > 100:
                errors.append("اسم الحملة يجب أن يكون أقل من 100 حرف")
            else:
                # تنظيف اسم الحملة
                cleaned_data['name'] = sanitize_text(name)
        
        # التحقق من الميزانية
        if 'budget' in campaign_data:
            try:
                budget = float(campaign_data['budget'])
                if budget <= 0:
                    errors.append("الميزانية يجب أن تكون أكبر من صفر")
                elif budget < 10:
                    warnings.append("الميزانية منخفضة جداً، قد لا تحقق نتائج جيدة")
                elif budget > 100000:
                    warnings.append("الميزانية عالية جداً، تأكد من صحة المبلغ")
                else:
                    cleaned_data['budget'] = round(budget, 2)
            except (ValueError, TypeError):
                errors.append("الميزانية يجب أن تكون رقماً صحيحاً")
        
        # التحقق من المواقع المستهدفة
        if 'target_locations' in campaign_data:
            locations = campaign_data['target_locations']
            if isinstance(locations, list):
                if len(locations) == 0:
                    errors.append("يجب تحديد موقع واحد على الأقل")
                else:
                    cleaned_locations = []
                    for location in locations:
                        if isinstance(location, str) and location.strip():
                            cleaned_locations.append(location.strip())
                    cleaned_data['target_locations'] = cleaned_locations
            else:
                errors.append("المواقع المستهدفة يجب أن تكون قائمة")
        
        # إضافة معرف فريد إذا لم يكن موجوداً
        if 'campaign_id' not in cleaned_data:
            cleaned_data['campaign_id'] = generate_campaign_id()
        
        # إضافة timestamp
        cleaned_data['created_at'] = datetime.utcnow().isoformat()
        cleaned_data['updated_at'] = datetime.utcnow().isoformat()
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'cleaned_data': cleaned_data,
            'validation_summary': {
                'total_errors': len(errors),
                'total_warnings': len(warnings),
                'fields_validated': len(cleaned_data),
                'validation_date': datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"خطأ في التحقق من بيانات الحملة: {str(e)}")
        return {
            'is_valid': False,
            'errors': [f"خطأ في التحقق: {str(e)}"],
            'warnings': [],
            'cleaned_data': {},
            'validation_summary': {
                'total_errors': 1,
                'total_warnings': 0,
                'fields_validated': 0,
                'validation_date': datetime.utcnow().isoformat()
            }
        }

def format_campaign_name(name: str, prefix: str = "", suffix: str = "", 
                        max_length: int = 100, auto_date: bool = False) -> str:
    """تنسيق اسم الحملة مع خيارات متقدمة"""
    try:
        if not name:
            return ""
        
        # تنظيف الاسم الأساسي
        clean_name = sanitize_text(name).strip()
        
        # إضافة البادئة
        if prefix:
            clean_name = f"{prefix} {clean_name}"
        
        # إضافة التاريخ التلقائي
        if auto_date:
            current_date = datetime.now().strftime("%Y%m")
            clean_name = f"{clean_name} {current_date}"
        
        # إضافة اللاحقة
        if suffix:
            clean_name = f"{clean_name} {suffix}"
        
        # تحديد الطول
        if len(clean_name) > max_length:
            # قطع النص مع الحفاظ على الكلمات
            words = clean_name.split()
            truncated = ""
            for word in words:
                if len(truncated + " " + word) <= max_length:
                    truncated += (" " + word) if truncated else word
                else:
                    break
            clean_name = truncated
        
        return clean_name
        
    except Exception as e:
        logger.error(f"خطأ في تنسيق اسم الحملة: {str(e)}")
        return str(name)[:max_length] if name else ""

def validate_ad_group_data(ad_group_data: Dict[str, Any]) -> Dict[str, Any]:
    """التحقق من صحة بيانات مجموعة الإعلانات"""
    try:
        errors = []
        warnings = []
        cleaned_data = {}
        
        # الحقول المطلوبة
        required_fields = ['name', 'campaign_id', 'default_cpc']
        
        for field in required_fields:
            if field not in ad_group_data or not ad_group_data[field]:
                errors.append(f"الحقل '{field}' مطلوب")
            else:
                cleaned_data[field] = ad_group_data[field]
        
        # التحقق من اسم مجموعة الإعلانات
        if 'name' in ad_group_data:
            name = str(ad_group_data['name']).strip()
            if len(name) < 2:
                errors.append("اسم مجموعة الإعلانات يجب أن يكون حرفين على الأقل")
            elif len(name) > 80:
                errors.append("اسم مجموعة الإعلانات يجب أن يكون أقل من 80 حرف")
            else:
                cleaned_data['name'] = sanitize_text(name)
        
        # التحقق من تكلفة النقرة الافتراضية
        if 'default_cpc' in ad_group_data:
            try:
                cpc = float(ad_group_data['default_cpc'])
                if cpc <= 0:
                    errors.append("تكلفة النقرة يجب أن تكون أكبر من صفر")
                elif cpc < 0.1:
                    warnings.append("تكلفة النقرة منخفضة جداً")
                elif cpc > 50:
                    warnings.append("تكلفة النقرة عالية جداً")
                else:
                    cleaned_data['default_cpc'] = round(cpc, 2)
            except (ValueError, TypeError):
                errors.append("تكلفة النقرة يجب أن تكون رقماً")
        
        # إضافة معرف فريد
        if 'ad_group_id' not in cleaned_data:
            campaign_id = cleaned_data.get('campaign_id', '')
            cleaned_data['ad_group_id'] = generate_ad_group_id(campaign_id)
        
        # إضافة timestamps
        cleaned_data['created_at'] = datetime.utcnow().isoformat()
        cleaned_data['updated_at'] = datetime.utcnow().isoformat()
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'cleaned_data': cleaned_data
        }
        
    except Exception as e:
        logger.error(f"خطأ في التحقق من بيانات مجموعة الإعلانات: {str(e)}")
        return {
            'is_valid': False,
            'errors': [f"خطأ في التحقق: {str(e)}"],
            'warnings': [],
            'cleaned_data': {}
        }

def validate_keyword_data(keyword_data: Dict[str, Any]) -> Dict[str, Any]:
    """التحقق من صحة بيانات الكلمة المفتاحية"""
    try:
        errors = []
        warnings = []
        cleaned_data = {}
        
        # الحقول المطلوبة
        required_fields = ['keyword', 'ad_group_id', 'match_type']
        
        for field in required_fields:
            if field not in keyword_data or not keyword_data[field]:
                errors.append(f"الحقل '{field}' مطلوب")
            else:
                cleaned_data[field] = keyword_data[field]
        
        # التحقق من الكلمة المفتاحية
        if 'keyword' in keyword_data:
            keyword = str(keyword_data['keyword']).strip().lower()
            if len(keyword) < 2:
                errors.append("الكلمة المفتاحية يجب أن تكون حرفين على الأقل")
            elif len(keyword) > 80:
                errors.append("الكلمة المفتاحية يجب أن تكون أقل من 80 حرف")
            else:
                cleaned_data['keyword'] = keyword
        
        # التحقق من نوع المطابقة
        if 'match_type' in keyword_data:
            valid_match_types = ['EXACT', 'PHRASE', 'BROAD']
            match_type = str(keyword_data['match_type']).upper()
            if match_type not in valid_match_types:
                errors.append(f"نوع المطابقة يجب أن يكون أحد: {', '.join(valid_match_types)}")
            else:
                cleaned_data['match_type'] = match_type
        
        # إضافة معرف فريد
        if 'keyword_id' not in cleaned_data:
            ad_group_id = cleaned_data.get('ad_group_id', '')
            cleaned_data['keyword_id'] = generate_keyword_id(ad_group_id)
        
        # إضافة timestamps
        cleaned_data['created_at'] = datetime.utcnow().isoformat()
        cleaned_data['updated_at'] = datetime.utcnow().isoformat()
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'cleaned_data': cleaned_data
        }
        
    except Exception as e:
        logger.error(f"خطأ في التحقق من بيانات الكلمة المفتاحية: {str(e)}")
        return {
            'is_valid': False,
            'errors': [f"خطأ في التحقق: {str(e)}"],
            'warnings': [],
            'cleaned_data': {}
        }

def generate_account_id(prefix: str = "acc", customer_id: str = "") -> str:
    """إنشاء معرف فريد للحساب"""
    try:
        import time
        
        timestamp = str(int(time.time()))[-6:]
        random_part = secrets.token_hex(3)
        
        if customer_id:
            # استخدام جزء من customer_id
            cust_part = customer_id.replace('-', '')[-4:] if customer_id else ""
            return f"{prefix}_{cust_part}_{timestamp}_{random_part}".lower()
        
        return f"{prefix}_{timestamp}_{random_part}".lower()
        
    except Exception as e:
        logger.error(f"خطأ في إنشاء معرف الحساب: {str(e)}")
        return f"{prefix}_{generate_short_id()}"

def validate_budget_data(budget_data: Dict[str, Any]) -> Dict[str, Any]:
    """التحقق من صحة بيانات الميزانية"""
    try:
        errors = []
        warnings = []
        cleaned_data = {}
        
        # التحقق من المبلغ
        if 'amount' in budget_data:
            try:
                amount = float(budget_data['amount'])
                if amount <= 0:
                    errors.append("مبلغ الميزانية يجب أن يكون أكبر من صفر")
                elif amount < 10:
                    warnings.append("الميزانية منخفضة جداً")
                elif amount > 100000:
                    warnings.append("الميزانية عالية جداً، تأكد من صحة المبلغ")
                else:
                    cleaned_data['amount'] = round(amount, 2)
            except (ValueError, TypeError):
                errors.append("مبلغ الميزانية يجب أن يكون رقماً")
        
        # التحقق من نوع الميزانية
        if 'delivery_method' in budget_data:
            valid_methods = ['STANDARD', 'ACCELERATED']
            method = str(budget_data['delivery_method']).upper()
            if method not in valid_methods:
                errors.append(f"طريقة التسليم يجب أن تكون أحد: {', '.join(valid_methods)}")
            else:
                cleaned_data['delivery_method'] = method
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'cleaned_data': cleaned_data
        }
        
    except Exception as e:
        logger.error(f"خطأ في التحقق من بيانات الميزانية: {str(e)}")
        return {
            'is_valid': False,
            'errors': [f"خطأ في التحقق: {str(e)}"],
            'warnings': [],
            'cleaned_data': {}
        }

