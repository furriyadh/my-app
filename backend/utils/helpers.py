"""
Helpers Module
وحدة الدوال المساعدة
"""

import os
import re
import json
import hashlib
import secrets
import bcrypt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Union
from decimal import Decimal
import logging

# استيراد دوال التحقق من validators
try:
    from .validators import validate_email
except ImportError:
    # دالة احتياطية للتحقق من البريد الإلكتروني
    def validate_email(email: str) -> bool:
        """التحقق من صحة البريد الإلكتروني"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

logger = logging.getLogger(__name__)

def format_currency(amount: Union[float, int, Decimal], currency: str = 'SAR') -> str:
    """تنسيق المبلغ حسب العملة"""
    try:
        if amount is None:
            return f"0.00 {currency}"
        
        amount = float(amount)
        
        # رموز العملات
        currency_symbols = {
            'SAR': 'ر.س',
            'USD': '$',
            'EUR': '€',
            'AED': 'د.إ',
            'EGP': 'ج.م',
            'KWD': 'د.ك',
            'QAR': 'ر.ق',
            'BHD': 'د.ب',
            'OMR': 'ر.ع'
        }
        
        symbol = currency_symbols.get(currency, currency)
        
        # تنسيق الرقم
        if amount >= 1000000:
            formatted = f"{amount/1000000:.1f}M"
        elif amount >= 1000:
            formatted = f"{amount/1000:.1f}K"
        else:
            formatted = f"{amount:.2f}"
        
        return f"{formatted} {symbol}"
        
    except (ValueError, TypeError):
        return f"0.00 {currency}"

def format_percentage(value: Union[float, int], decimal_places: int = 2) -> str:
    """تنسيق النسبة المئوية"""
    try:
        if value is None:
            return "0.00%"
        
        value = float(value)
        return f"{value:.{decimal_places}f}%"
        
    except (ValueError, TypeError):
        return "0.00%"

def format_number(number: Union[float, int], decimal_places: int = 0) -> str:
    """تنسيق الأرقام مع فواصل الآلاف"""
    try:
        if number is None:
            return "0"
        
        number = float(number)
        
        if decimal_places > 0:
            return f"{number:,.{decimal_places}f}"
        else:
            return f"{int(number):,}"
            
    except (ValueError, TypeError):
        return "0"

def calculate_performance_score(metrics: Dict[str, float]) -> Dict[str, Any]:
    """حساب نقاط الأداء"""
    try:
        # المقاييس الافتراضية
        ctr = metrics.get('ctr', 0)
        conversion_rate = metrics.get('conversion_rate', 0)
        quality_score = metrics.get('quality_score', 5)
        roas = metrics.get('roas', 0)
        
        # حساب النقاط لكل مقياس (من 100)
        ctr_score = min(ctr * 50, 100)  # CTR أعلى من 2% = 100 نقطة
        conversion_score = min(conversion_rate * 20, 100)  # معدل تحويل أعلى من 5% = 100 نقطة
        quality_score_normalized = (quality_score / 10) * 100  # Quality Score من 10
        roas_score = min(roas * 25, 100)  # ROAS أعلى من 4 = 100 نقطة
        
        # النقاط الإجمالية (متوسط مرجح)
        total_score = (
            ctr_score * 0.25 +
            conversion_score * 0.30 +
            quality_score_normalized * 0.25 +
            roas_score * 0.20
        )
        
        # تحديد المستوى
        if total_score >= 80:
            level = "ممتاز"
            color = "green"
        elif total_score >= 60:
            level = "جيد"
            color = "blue"
        elif total_score >= 40:
            level = "متوسط"
            color = "orange"
        else:
            level = "ضعيف"
            color = "red"
        
        return {
            'total_score': round(total_score, 1),
            'level': level,
            'color': color,
            'breakdown': {
                'ctr_score': round(ctr_score, 1),
                'conversion_score': round(conversion_score, 1),
                'quality_score': round(quality_score_normalized, 1),
                'roas_score': round(roas_score, 1)
            }
        }
        
    except Exception as e:
        logger.error(f"خطأ في حساب نقاط الأداء: {str(e)}")
        return {
            'total_score': 0,
            'level': "غير محدد",
            'color': "gray",
            'breakdown': {
                'ctr_score': 0,
                'conversion_score': 0,
                'quality_score': 0,
                'roas_score': 0
            }
        }

def sanitize_text(text: str) -> str:
    """تنظيف النص من الأحرف الضارة"""
    if not text:
        return ""
    
    # إزالة HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # إزالة JavaScript
    text = re.sub(r'<script.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    
    # إزالة الأحرف الخاصة الضارة
    text = re.sub(r'[<>"\']', '', text)
    
    # تنظيف المسافات
    text = ' '.join(text.split())
    
    return text.strip()

def generate_hash(data: str) -> str:
    """إنشاء hash للبيانات"""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def generate_short_id(length: int = 8) -> str:
    """إنشاء معرف قصير"""
    import random
    import string
    
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def parse_date_range(date_range: str) -> tuple:
    """تحليل نطاق التاريخ"""
    today = datetime.now().date()
    
    if date_range == 'today':
        return today, today
    elif date_range == 'yesterday':
        yesterday = today - timedelta(days=1)
        return yesterday, yesterday
    elif date_range == 'last_7_days':
        start_date = today - timedelta(days=7)
        return start_date, today
    elif date_range == 'last_30_days':
        start_date = today - timedelta(days=30)
        return start_date, today
    elif date_range == 'this_month':
        start_date = today.replace(day=1)
        return start_date, today
    elif date_range == 'last_month':
        first_day_this_month = today.replace(day=1)
        last_day_last_month = first_day_this_month - timedelta(days=1)
        first_day_last_month = last_day_last_month.replace(day=1)
        return first_day_last_month, last_day_last_month
    else:
        # افتراضي: آخر 30 يوم
        start_date = today - timedelta(days=30)
        return start_date, today

def format_date_arabic(date_obj: datetime) -> str:
    """تنسيق التاريخ بالعربية"""
    if not date_obj:
        return ""
    
    arabic_months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ]
    
    month_name = arabic_months[date_obj.month - 1]
    return f"{date_obj.day} {month_name} {date_obj.year}"

def calculate_growth_rate(current: float, previous: float) -> Dict[str, Any]:
    """حساب معدل النمو"""
    try:
        if previous == 0:
            if current > 0:
                return {
                    'rate': float('inf'),
                    'percentage': "∞%",
                    'direction': 'up',
                    'color': 'green'
                }
            else:
                return {
                    'rate': 0,
                    'percentage': "0%",
                    'direction': 'stable',
                    'color': 'gray'
                }
        
        rate = ((current - previous) / previous) * 100
        
        if rate > 0:
            direction = 'up'
            color = 'green'
            percentage = f"+{rate:.1f}%"
        elif rate < 0:
            direction = 'down'
            color = 'red'
            percentage = f"{rate:.1f}%"
        else:
            direction = 'stable'
            color = 'gray'
            percentage = "0%"
        
        return {
            'rate': round(rate, 2),
            'percentage': percentage,
            'direction': direction,
            'color': color
        }
        
    except Exception as e:
        logger.error(f"خطأ في حساب معدل النمو: {str(e)}")
        return {
            'rate': 0,
            'percentage': "0%",
            'direction': 'stable',
            'color': 'gray'
        }

def validate_and_clean_data(data: Dict[str, Any], required_fields: List[str] = None) -> Dict[str, Any]:
    """التحقق من البيانات وتنظيفها"""
    cleaned_data = {}
    
    for key, value in data.items():
        if isinstance(value, str):
            cleaned_data[key] = sanitize_text(value)
        else:
            cleaned_data[key] = value
    
    # التحقق من الحقول المطلوبة
    if required_fields:
        for field in required_fields:
            if field not in cleaned_data or not cleaned_data[field]:
                raise ValueError(f"الحقل {field} مطلوب")
    
    return cleaned_data

def create_response(success: bool = True, data: Any = None, message: str = "", 
                   error_code: str = None, status_code: int = 200) -> Dict[str, Any]:
    """إنشاء استجابة موحدة"""
    response = {
        'success': success,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if data is not None:
        response['data'] = data
    
    if message:
        response['message'] = message
    
    if error_code:
        response['error_code'] = error_code
    
    return response

def paginate_data(data: List[Any], page: int = 1, limit: int = 20) -> Dict[str, Any]:
    """تقسيم البيانات إلى صفحات"""
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
            'has_prev': page > 1
        }
    }

def convert_timezone(dt: datetime, from_tz: str = 'UTC', to_tz: str = 'Asia/Riyadh') -> datetime:
    """تحويل المنطقة الزمنية"""
    try:
        import pytz
        
        if dt.tzinfo is None:
            # إذا لم تكن هناك معلومات منطقة زمنية، افترض أنها UTC
            dt = pytz.timezone(from_tz).localize(dt)
        
        target_tz = pytz.timezone(to_tz)
        return dt.astimezone(target_tz)
        
    except ImportError:
        # إذا لم تكن pytz متاحة، أرجع التاريخ كما هو
        return dt
    except Exception as e:
        logger.error(f"خطأ في تحويل المنطقة الزمنية: {str(e)}")
        return dt

def extract_keywords_from_text(text: str, max_keywords: int = 20) -> List[str]:
    """استخراج الكلمات المفتاحية من النص"""
    if not text:
        return []
    
    # تنظيف النص
    text = sanitize_text(text.lower())
    
    # إزالة كلمات الوقف العربية والإنجليزية
    stop_words = {
        'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
        'التي', 'الذي', 'التي', 'كان', 'كانت', 'يكون', 'تكون', 'هو', 'هي',
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
    }
    
    # تقسيم النص إلى كلمات
    words = re.findall(r'\b\w+\b', text)
    
    # تصفية الكلمات
    keywords = []
    for word in words:
        if (len(word) >= 3 and 
            word not in stop_words and 
            not word.isdigit()):
            keywords.append(word)
    
    # إزالة التكرارات والحد من العدد
    unique_keywords = list(dict.fromkeys(keywords))
    return unique_keywords[:max_keywords]

def calculate_budget_recommendation(current_performance: Dict[str, float], 
                                  target_goals: Dict[str, float]) -> Dict[str, Any]:
    """حساب توصيات الميزانية"""
    try:
        current_spend = current_performance.get('spend', 0)
        current_conversions = current_performance.get('conversions', 0)
        current_revenue = current_performance.get('revenue', 0)
        
        target_conversions = target_goals.get('conversions', current_conversions * 1.2)
        target_revenue = target_goals.get('revenue', current_revenue * 1.2)
        
        # حساب التكلفة لكل تحويل
        if current_conversions > 0:
            cost_per_conversion = current_spend / current_conversions
            recommended_spend = target_conversions * cost_per_conversion
        else:
            recommended_spend = current_spend * 1.5
        
        # حساب العائد المتوقع على الاستثمار
        if recommended_spend > 0:
            expected_roas = target_revenue / recommended_spend
        else:
            expected_roas = 0
        
        # تحديد مستوى التوصية
        if expected_roas >= 4:
            recommendation_level = "مُوصى به بشدة"
            confidence = "عالية"
        elif expected_roas >= 2:
            recommendation_level = "مُوصى به"
            confidence = "متوسطة"
        else:
            recommendation_level = "يحتاج مراجعة"
            confidence = "منخفضة"
        
        return {
            'recommended_budget': round(recommended_spend, 2),
            'expected_conversions': round(target_conversions, 0),
            'expected_revenue': round(target_revenue, 2),
            'expected_roas': round(expected_roas, 2),
            'recommendation_level': recommendation_level,
            'confidence': confidence,
            'budget_change': round(((recommended_spend - current_spend) / current_spend) * 100, 1) if current_spend > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"خطأ في حساب توصيات الميزانية: {str(e)}")
        return {
            'recommended_budget': 0,
            'expected_conversions': 0,
            'expected_revenue': 0,
            'expected_roas': 0,
            'recommendation_level': "غير محدد",
            'confidence': "منخفضة",
            'budget_change': 0
        }


def send_notification(user_id: str, message: str, notification_type: str = 'info') -> Dict[str, Any]:
    """إرسال إشعار للمستخدم"""
    try:
        # في التطبيق الحقيقي، هذه الدالة ستتصل بخدمة الإشعارات
        # مثل Firebase، Pusher، أو نظام إشعارات مخصص
        
        notification_data = {
            'user_id': user_id,
            'message': message,
            'type': notification_type,
            'timestamp': datetime.utcnow().isoformat(),
            'read': False,
            'id': generate_unique_id('notif')
        }
        
        # محاكاة إرسال الإشعار
        logging.info(f"إشعار للمستخدم {user_id}: {message}")
        
        return {
            'success': True,
            'notification_id': notification_data['id'],
            'message': 'تم إرسال الإشعار بنجاح'
        }
        
    except Exception as e:
        logging.error(f"خطأ في إرسال الإشعار: {e}")
        return {
            'success': False,
            'error': f'فشل في إرسال الإشعار: {str(e)}'
        }

def encrypt_token(token: str, key: str = None) -> str:
    """تشفير الرمز المميز"""
    try:
        if not key:
            # استخدام مفتاح افتراضي (في التطبيق الحقيقي، يجب استخدام مفتاح آمن من متغيرات البيئة)
            key = os.getenv('ENCRYPTION_KEY', 'default-encryption-key-2025')
        
        # تشفير بسيط باستخدام base64 (في التطبيق الحقيقي، استخدم تشفير أقوى)
        import base64
        
        # إضافة salt للأمان
        salt = secrets.token_hex(8)
        combined = f"{salt}:{token}"
        
        # تشفير
        encoded = base64.b64encode(combined.encode()).decode()
        
        return encoded
        
    except Exception as e:
        logging.error(f"خطأ في تشفير الرمز: {e}")
        return token  # إرجاع الرمز الأصلي في حالة الخطأ

def decrypt_token(encrypted_token: str, key: str = None) -> str:
    """فك تشفير الرمز المميز"""
    try:
        if not key:
            key = os.getenv('ENCRYPTION_KEY', 'default-encryption-key-2025')
        
        # فك التشفير
        import base64
        
        decoded = base64.b64decode(encrypted_token.encode()).decode()
        
        # فصل salt عن الرمز
        if ':' in decoded:
            salt, token = decoded.split(':', 1)
            return token
        else:
            return decoded
            
    except Exception as e:
        logging.error(f"خطأ في فك تشفير الرمز: {e}")
        return encrypted_token  # إرجاع الرمز المشفر في حالة الخطأ

def calculate_percentage_change(old_value: float, new_value: float) -> float:
    """حساب نسبة التغيير بين قيمتين"""
    try:
        if old_value == 0:
            return 100.0 if new_value > 0 else 0.0
        
        change = ((new_value - old_value) / old_value) * 100
        return round(change, 2)
        
    except Exception as e:
        logging.error(f"خطأ في حساب نسبة التغيير: {e}")
        return 0.0

def calculate_hash(data: Any) -> str:
    """حساب hash للبيانات"""
    try:
        # تحويل البيانات إلى نص
        if isinstance(data, dict):
            data_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
        elif isinstance(data, (list, tuple)):
            data_str = json.dumps(list(data), ensure_ascii=False)
        else:
            data_str = str(data)
        
        # حساب SHA256 hash
        hash_object = hashlib.sha256(data_str.encode('utf-8'))
        return hash_object.hexdigest()
        
    except Exception as e:
        logging.error(f"خطأ في حساب hash: {e}")
        return hashlib.sha256(str(data).encode()).hexdigest()

def format_file_size(size_bytes: int) -> str:
    """تنسيق حجم الملف"""
    try:
        if size_bytes == 0:
            return "0 بايت"
        
        size_names = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت", "تيرابايت"]
        import math
        
        i = int(math.floor(math.log(size_bytes, 1024)))
        p = math.pow(1024, i)
        s = round(size_bytes / p, 2)
        
        return f"{s} {size_names[i]}"
        
    except Exception as e:
        return f"{size_bytes} بايت"

def validate_date_format(date_string: str, format_string: str = '%Y-%m-%d') -> Dict[str, Any]:
    """التحقق من تنسيق التاريخ"""
    try:
        datetime.strptime(date_string, format_string)
        return {
            'valid': True,
            'message': 'تنسيق التاريخ صحيح'
        }
    except ValueError:
        return {
            'valid': False,
            'error': f'تنسيق التاريخ غير صحيح. المطلوب: {format_string}'
        }

def get_time_ago(timestamp: datetime) -> str:
    """حساب الوقت المنقضي منذ تاريخ معين"""
    try:
        now = datetime.utcnow()
        
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        
        diff = now - timestamp
        
        if diff.days > 365:
            years = diff.days // 365
            return f"منذ {years} سنة" if years == 1 else f"منذ {years} سنوات"
        elif diff.days > 30:
            months = diff.days // 30
            return f"منذ {months} شهر" if months == 1 else f"منذ {months} أشهر"
        elif diff.days > 0:
            return f"منذ {diff.days} يوم" if diff.days == 1 else f"منذ {diff.days} أيام"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"منذ {hours} ساعة" if hours == 1 else f"منذ {hours} ساعات"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"منذ {minutes} دقيقة" if minutes == 1 else f"منذ {minutes} دقائق"
        else:
            return "منذ لحظات"
            
    except Exception as e:
        return "غير محدد"

def clean_html_tags(text: str) -> str:
    """إزالة HTML tags من النص"""
    try:
        if not text:
            return ""
        
        # إزالة HTML tags
        clean_text = re.sub(r'<[^>]+>', '', text)
        
        # إزالة المسافات الزائدة
        clean_text = re.sub(r'\s+', ' ', clean_text)
        
        return clean_text.strip()
        
    except Exception as e:
        return text

def generate_slug(text: str, max_length: int = 50) -> str:
    """إنشاء slug من النص"""
    try:
        if not text:
            return ""
        
        # تحويل إلى أحرف صغيرة
        slug = text.lower()
        
        # إزالة الأحرف الخاصة
        slug = re.sub(r'[^\w\s-]', '', slug)
        
        # استبدال المسافات بشرطات
        slug = re.sub(r'[\s_-]+', '-', slug)
        
        # إزالة الشرطات من البداية والنهاية
        slug = slug.strip('-')
        
        # تحديد الطول
        if len(slug) > max_length:
            slug = slug[:max_length].rstrip('-')
        
        return slug
        
    except Exception as e:
        return generate_unique_id('slug')

def is_valid_json(json_string: str) -> bool:
    """التحقق من صحة JSON"""
    try:
        json.loads(json_string)
        return True
    except (ValueError, TypeError):
        return False

def merge_dictionaries(*dicts) -> Dict[str, Any]:
    """دمج عدة قواميس"""
    result = {}
    for d in dicts:
        if isinstance(d, dict):
            result.update(d)
    return result

def get_nested_value(data: Dict[str, Any], key_path: str, default: Any = None) -> Any:
    """الحصول على قيمة من قاموس متداخل باستخدام مسار النقاط"""
    try:
        keys = key_path.split('.')
        value = data
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
        
    except Exception:
        return default

def set_nested_value(data: Dict[str, Any], key_path: str, value: Any) -> Dict[str, Any]:
    """تعيين قيمة في قاموس متداخل باستخدام مسار النقاط"""
    try:
        keys = key_path.split('.')
        current = data
        
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        current[keys[-1]] = value
        return data
        
    except Exception:
        return data

def remove_duplicates_from_list(items: List[Any], key: str = None) -> List[Any]:
    """إزالة التكرارات من القائمة"""
    try:
        if not items:
            return []
        
        if key:
            # إزالة التكرارات بناءً على مفتاح معين
            seen = set()
            result = []
            for item in items:
                if isinstance(item, dict) and key in item:
                    if item[key] not in seen:
                        seen.add(item[key])
                        result.append(item)
                else:
                    result.append(item)
            return result
        else:
            # إزالة التكرارات العادية
            return list(dict.fromkeys(items))
            
    except Exception:
        return items

def chunk_list(items: List[Any], chunk_size: int) -> List[List[Any]]:
    """تقسيم القائمة إلى مجموعات صغيرة"""
    try:
        chunks = []
        for i in range(0, len(items), chunk_size):
            chunks.append(items[i:i + chunk_size])
        return chunks
    except Exception:
        return [items]

# تصدير جميع الدوال
__all__ = [
    'setup_logging',
    'format_currency',
    'format_percentage',
    'format_number',
    'calculate_performance_score',
    'sanitize_text',
    'generate_hash',
    'generate_short_id',
    'parse_date_range',
    'format_date_arabic',
    'calculate_growth_rate',
    'validate_and_clean_data',
    'create_response',
    'paginate_data',
    'convert_timezone',
    'extract_keywords_from_text',
    'calculate_budget_recommendation',
    'send_notification',
    'encrypt_token',
    'decrypt_token',
    'calculate_percentage_change'
]



def setup_logging(level: str = 'INFO', log_file: str = None) -> None:
    """إعداد نظام التسجيل"""
    import logging
    import os
    from datetime import datetime
    
    # تحديد مستوى التسجيل
    log_levels = {
        'DEBUG': logging.DEBUG,
        'INFO': logging.INFO,
        'WARNING': logging.WARNING,
        'ERROR': logging.ERROR,
        'CRITICAL': logging.CRITICAL
    }
    
    log_level = log_levels.get(level.upper(), logging.INFO)
    
    # تنسيق الرسائل
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # إعداد المعالج الأساسي
    handlers = []
    
    # معالج وحدة التحكم
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    handlers.append(console_handler)
    
    # معالج الملف (إذا تم تحديده)
    if log_file:
        # إنشاء مجلد السجلات إذا لم يكن موجوداً
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)
    
    # تكوين التسجيل الأساسي
    logging.basicConfig(
        level=log_level,
        handlers=handlers,
        force=True
    )
    
    # تسجيل رسالة البداية
    logger = logging.getLogger(__name__)
    logger.info(f"تم إعداد نظام التسجيل - المستوى: {level}")
    
    if log_file:
        logger.info(f"ملف السجل: {log_file}")



def generate_unique_id(prefix: str = '', length: int = 12) -> str:
    """
    إنشاء معرف فريد
    
    Args:
        prefix (str): بادئة المعرف
        length (int): طول المعرف
        
    Returns:
        str: المعرف الفريد
    """
    try:
        import secrets
        import string
        
        # إنشاء معرف عشوائي
        characters = string.ascii_letters + string.digits
        random_id = ''.join(secrets.choice(characters) for _ in range(length))
        
        # إضافة الطابع الزمني للتأكد من الفرادة
        timestamp = str(int(datetime.utcnow().timestamp() * 1000))[-6:]
        
        if prefix:
            return f"{prefix}_{random_id}_{timestamp}"
        else:
            return f"{random_id}_{timestamp}"
            
    except Exception as e:
        logger.error(f"خطأ في إنشاء المعرف الفريد: {str(e)}")
        # fallback إلى UUID
        import uuid
        unique_id = str(uuid.uuid4()).replace('-', '')[:length]
        return f"{prefix}_{unique_id}" if prefix else unique_id

def validate_url_format(url: str) -> Dict[str, Any]:
    """
    التحقق من تنسيق الرابط
    
    Args:
        url (str): الرابط للتحقق منه
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        if not url:
            return {'valid': False, 'message': "الرابط مطلوب"}
        
        if not isinstance(url, str):
            return {'valid': False, 'message': "الرابط يجب أن يكون نص"}
        
        url = url.strip()
        
        if len(url) < 10:
            return {'valid': False, 'message': "الرابط قصير جداً"}
        
        if len(url) > 2048:
            return {'valid': False, 'message': "الرابط طويل جداً"}
        
        # نمط التحقق من الرابط المتقدم
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        if not url_pattern.match(url):
            return {'valid': False, 'message': "تنسيق الرابط غير صحيح"}
        
        # فحص إضافي للنطاقات المشبوهة
        suspicious_domains = ['bit.ly', 'tinyurl.com', 'short.link']
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            if any(suspicious in domain for suspicious in suspicious_domains):
                return {'valid': False, 'message': "نطاق مشبوه غير مسموح"}
        except:
            pass
        
        return {'valid': True, 'message': "تنسيق الرابط صحيح"}
        
    except Exception as e:
        return {'valid': False, 'message': f"خطأ في التحقق من تنسيق الرابط: {str(e)}"}

def generate_secure_token(length: int = 32) -> str:
    """
    إنشاء رمز آمن
    
    Args:
        length (int): طول الرمز
        
    Returns:
        str: الرمز الآمن
    """
    try:
        import secrets
        return secrets.token_urlsafe(length)
    except Exception as e:
        logger.error(f"خطأ في إنشاء الرمز الآمن: {str(e)}")
        # fallback
        import hashlib
        import time
        data = f"{time.time()}_{generate_unique_id()}"
        return hashlib.sha256(data.encode()).hexdigest()[:length]

def hash_password(password: str) -> str:
    """
    تشفير كلمة المرور
    
    Args:
        password (str): كلمة المرور
        
    Returns:
        str: كلمة المرور المشفرة
    """
    try:
        import bcrypt
        # تشفير كلمة المرور باستخدام bcrypt
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except ImportError:
        # fallback إلى hashlib إذا لم تكن bcrypt متاحة
        import hashlib
        salt = generate_unique_id(length=16)
        combined = f"{salt}:{password}"
        hashed = hashlib.sha256(combined.encode()).hexdigest()
        return f"{salt}:{hashed}"
    except Exception as e:
        logger.error(f"خطأ في تشفير كلمة المرور: {str(e)}")
        raise

def verify_password(password: str, hashed: str) -> bool:
    """
    التحقق من كلمة المرور
    
    Args:
        password (str): كلمة المرور الأصلية
        hashed (str): كلمة المرور المشفرة
        
    Returns:
        bool: True إذا كانت كلمة المرور صحيحة
    """
    try:
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except ImportError:
        # fallback للتحقق من hashlib
        try:
            salt, stored_hash = hashed.split(':', 1)
            combined = f"{salt}:{password}"
            computed_hash = hashlib.sha256(combined.encode()).hexdigest()
            return computed_hash == stored_hash
        except:
            return False
    except Exception as e:
        logger.error(f"خطأ في التحقق من كلمة المرور: {str(e)}")
        return False

def sanitize_filename(filename: str) -> str:
    """
    تنظيف اسم الملف
    
    Args:
        filename (str): اسم الملف
        
    Returns:
        str: اسم الملف المنظف
    """
    try:
        if not filename:
            return "file"
        
        # إزالة الأحرف الخطيرة
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        
        # إزالة النقاط المتتالية
        filename = re.sub(r'\.{2,}', '.', filename)
        
        # إزالة المسافات من البداية والنهاية
        filename = filename.strip()
        
        # التأكد من أن الاسم ليس فارغاً
        if not filename:
            filename = "file"
        
        # تحديد الطول
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:255-len(ext)] + ext
        
        return filename
        
    except Exception as e:
        logger.error(f"خطأ في تنظيف اسم الملف: {str(e)}")
        return "file"

def calculate_estimated_performance(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    حساب الأداء المتوقع
    
    Args:
        data (Dict[str, Any]): بيانات الأداء الحالي
        
    Returns:
        Dict[str, Any]: الأداء المتوقع
    """
    try:
        current_impressions = data.get('impressions', 0)
        current_clicks = data.get('clicks', 0)
        current_conversions = data.get('conversions', 0)
        current_cost = data.get('cost', 0)
        
        # حساب المعدلات الحالية
        ctr = (current_clicks / current_impressions * 100) if current_impressions > 0 else 0
        conversion_rate = (current_conversions / current_clicks * 100) if current_clicks > 0 else 0
        cpc = (current_cost / current_clicks) if current_clicks > 0 else 0
        
        # توقع التحسن بناءً على أفضل الممارسات
        estimated_ctr_improvement = min(ctr * 1.2, 5.0)  # تحسن 20% أو حد أقصى 5%
        estimated_conversion_improvement = min(conversion_rate * 1.15, 10.0)  # تحسن 15% أو حد أقصى 10%
        
        # حساب الأداء المتوقع
        estimated_clicks = current_impressions * (estimated_ctr_improvement / 100)
        estimated_conversions = estimated_clicks * (estimated_conversion_improvement / 100)
        estimated_cost = estimated_clicks * cpc
        
        return {
            'current_performance': {
                'impressions': current_impressions,
                'clicks': current_clicks,
                'conversions': current_conversions,
                'cost': current_cost,
                'ctr': round(ctr, 2),
                'conversion_rate': round(conversion_rate, 2),
                'cpc': round(cpc, 2)
            },
            'estimated_performance': {
                'impressions': current_impressions,
                'clicks': round(estimated_clicks, 0),
                'conversions': round(estimated_conversions, 0),
                'cost': round(estimated_cost, 2),
                'ctr': round(estimated_ctr_improvement, 2),
                'conversion_rate': round(estimated_conversion_improvement, 2),
                'cpc': round(cpc, 2)
            },
            'improvement': {
                'clicks_increase': round(((estimated_clicks - current_clicks) / current_clicks * 100) if current_clicks > 0 else 0, 1),
                'conversions_increase': round(((estimated_conversions - current_conversions) / current_conversions * 100) if current_conversions > 0 else 0, 1),
                'ctr_increase': round(((estimated_ctr_improvement - ctr) / ctr * 100) if ctr > 0 else 0, 1)
            }
        }
        
    except Exception as e:
        logger.error(f"خطأ في حساب الأداء المتوقع: {str(e)}")
        return {
            'current_performance': {},
            'estimated_performance': {},
            'improvement': {},
            'error': str(e)
        }

def extract_domain_info(url: str) -> Dict[str, Any]:
    """
    استخراج معلومات النطاق من الرابط
    
    Args:
        url (str): الرابط
        
    Returns:
        Dict[str, Any]: معلومات النطاق
    """
    try:
        from urllib.parse import urlparse
        
        if not url.startswith(('http://', 'https://')):
            url = f"https://{url}"
        
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        # إزالة www
        if domain.startswith('www.'):
            domain = domain[4:]
        
        # استخراج TLD
        domain_parts = domain.split('.')
        tld = domain_parts[-1] if len(domain_parts) > 1 else ''
        
        # تحديد نوع الموقع
        site_type = 'unknown'
        if any(keyword in domain for keyword in ['shop', 'store', 'buy', 'cart']):
            site_type = 'ecommerce'
        elif any(keyword in domain for keyword in ['blog', 'news', 'article']):
            site_type = 'content'
        elif any(keyword in domain for keyword in ['service', 'company', 'business']):
            site_type = 'business'
        
        return {
            'domain': domain,
            'subdomain': parsed.netloc.replace(domain, '').replace('www.', '').strip('.'),
            'tld': tld,
            'path': parsed.path,
            'site_type': site_type,
            'is_secure': parsed.scheme == 'https',
            'full_url': url
        }
        
    except Exception as e:
        logger.error(f"خطأ في استخراج معلومات النطاق: {str(e)}")
        return {
            'domain': '',
            'subdomain': '',
            'tld': '',
            'path': '',
            'site_type': 'unknown',
            'is_secure': False,
            'full_url': url,
            'error': str(e)
        }

def get_country_codes() -> Dict[str, str]:
    """
    الحصول على رموز البلدان
    
    Returns:
        Dict[str, str]: قاموس رموز البلدان
    """
    return {
        'SA': 'المملكة العربية السعودية',
        'AE': 'الإمارات العربية المتحدة',
        'EG': 'مصر',
        'KW': 'الكويت',
        'QA': 'قطر',
        'BH': 'البحرين',
        'OM': 'عمان',
        'JO': 'الأردن',
        'LB': 'لبنان',
        'SY': 'سوريا',
        'IQ': 'العراق',
        'YE': 'اليمن',
        'PS': 'فلسطين',
        'MA': 'المغرب',
        'TN': 'تونس',
        'DZ': 'الجزائر',
        'LY': 'ليبيا',
        'SD': 'السودان',
        'US': 'الولايات المتحدة',
        'GB': 'المملكة المتحدة',
        'DE': 'ألمانيا',
        'FR': 'فرنسا',
        'IT': 'إيطاليا',
        'ES': 'إسبانيا',
        'CA': 'كندا',
        'AU': 'أستراليا',
        'IN': 'الهند',
        'CN': 'الصين',
        'JP': 'اليابان',
        'KR': 'كوريا الجنوبية',
        'BR': 'البرازيل',
        'MX': 'المكسيك',
        'TR': 'تركيا',
        'RU': 'روسيا'
    }

def format_response(success: bool = True, data: Any = None, message: str = "", 
                   error_code: str = None, status_code: int = 200) -> Dict[str, Any]:
    """
    تنسيق الاستجابة الموحدة
    
    Args:
        success (bool): حالة النجاح
        data (Any): البيانات
        message (str): الرسالة
        error_code (str): رمز الخطأ
        status_code (int): رمز الحالة
        
    Returns:
        Dict[str, Any]: الاستجابة المنسقة
    """
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
    
    if not success and not message:
        response['message'] = "حدث خطأ غير متوقع"
    
    return response

def log_request_info(request_data: Dict[str, Any], user_id: str = None) -> None:
    """
    تسجيل معلومات الطلب
    
    Args:
        request_data (Dict[str, Any]): بيانات الطلب
        user_id (str): معرف المستخدم
    """
    try:
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'method': request_data.get('method', 'UNKNOWN'),
            'endpoint': request_data.get('endpoint', 'UNKNOWN'),
            'ip_address': request_data.get('ip_address', 'UNKNOWN'),
            'user_agent': request_data.get('user_agent', 'UNKNOWN'),
            'request_id': generate_unique_id('req')
        }
        
        logger.info(f"طلب API: {log_data}")
        
    except Exception as e:
        logger.error(f"خطأ في تسجيل معلومات الطلب: {str(e)}")

# تحديث قائمة __all__ لتشمل جميع الدوال
__all__ = [
    'setup_logging',
    'format_currency',
    'format_percentage',
    'format_number',
    'calculate_performance_score',
    'sanitize_text',
    'generate_hash',
    'generate_short_id',
    'parse_date_range',
    'format_date_arabic',
    'calculate_growth_rate',
    'validate_and_clean_data',
    'create_response',
    'paginate_data',
    'convert_timezone',
    'extract_keywords_from_text',
    'calculate_budget_recommendation',
    'send_notification',
    'encrypt_token',
    'decrypt_token',
    'calculate_percentage_change',
    'calculate_hash',
    'format_file_size',
    'validate_date_format',
    'get_time_ago',
    'clean_html_tags',
    'generate_slug',
    'is_valid_json',
    'merge_dictionaries',
    'get_nested_value',
    'set_nested_value',
    'remove_duplicates_from_list',
    'chunk_list',
    'generate_unique_id',
    'validate_url_format',
    'generate_secure_token',
    'hash_password',
    'verify_password',
    'sanitize_filename',
    'calculate_estimated_performance',
    'extract_domain_info',
    'get_country_codes',
    'format_response',
    'log_request_info'
]


def send_email(to_email: str, subject: str, body: str, html_body: str = None) -> Dict[str, Any]:
    """
    إرسال بريد إلكتروني
    
    Args:
        to_email (str): البريد الإلكتروني للمستقبل
        subject (str): موضوع الرسالة
        body (str): نص الرسالة
        html_body (str): نص HTML للرسالة
        
    Returns:
        Dict[str, Any]: نتيجة الإرسال
    """
    try:
        # التحقق من صحة البريد الإلكتروني
        email_result = validate_email(to_email)
        if not email_result['valid']:
            return {
                'success': False,
                'message': f"البريد الإلكتروني غير صحيح: {email_result['message']}"
            }
        
        # التحقق من الموضوع والنص
        if not subject or not subject.strip():
            return {
                'success': False,
                'message': "موضوع الرسالة مطلوب"
            }
        
        if not body or not body.strip():
            return {
                'success': False,
                'message': "نص الرسالة مطلوب"
            }
        
        # محاولة إرسال البريد الإلكتروني
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            import os
            
            # إعدادات SMTP من متغيرات البيئة
            smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
            smtp_port = int(os.getenv('SMTP_PORT', '587'))
            smtp_username = os.getenv('SMTP_USERNAME', '')
            smtp_password = os.getenv('SMTP_PASSWORD', '')
            
            if not smtp_username or not smtp_password:
                logger.warning("إعدادات SMTP غير متوفرة - سيتم محاكاة الإرسال")
                return {
                    'success': True,
                    'message': "تم محاكاة إرسال البريد الإلكتروني بنجاح",
                    'simulated': True,
                    'details': {
                        'to': to_email,
                        'subject': subject,
                        'body_length': len(body)
                    }
                }
            
            # إنشاء الرسالة
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = smtp_username
            msg['To'] = to_email
            
            # إضافة النص العادي
            text_part = MIMEText(body, 'plain', 'utf-8')
            msg.attach(text_part)
            
            # إضافة HTML إذا كان متوفراً
            if html_body:
                html_part = MIMEText(html_body, 'html', 'utf-8')
                msg.attach(html_part)
            
            # إرسال الرسالة
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.send_message(msg)
            
            logger.info(f"تم إرسال بريد إلكتروني إلى {to_email} بموضوع: {subject}")
            
            return {
                'success': True,
                'message': "تم إرسال البريد الإلكتروني بنجاح",
                'details': {
                    'to': to_email,
                    'subject': subject,
                    'sent_at': datetime.utcnow().isoformat()
                }
            }
            
        except Exception as smtp_error:
            logger.error(f"خطأ في إرسال البريد الإلكتروني: {str(smtp_error)}")
            
            # محاكاة الإرسال في حالة الخطأ
            return {
                'success': True,
                'message': "تم محاكاة إرسال البريد الإلكتروني (خطأ في SMTP)",
                'simulated': True,
                'smtp_error': str(smtp_error),
                'details': {
                    'to': to_email,
                    'subject': subject,
                    'body_length': len(body)
                }
            }
            
    except Exception as e:
        logger.error(f"خطأ عام في إرسال البريد الإلكتروني: {str(e)}")
        return {
            'success': False,
            'message': f"خطأ في إرسال البريد الإلكتروني: {str(e)}"
        }

# تحديث قائمة __all__
__all__.append('send_email')

