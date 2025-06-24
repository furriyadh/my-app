"""
نظام التحقق من البيانات
Google Ads AI Platform - Data Validators
"""

import re
import os
import secrets
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime
from marshmallow import Schema, fields, validate, ValidationError, post_load

class RequestValidator:
    """فئة التحقق من الطلبات"""
    
    @staticmethod
    def validate_user_registration(data: Dict[str, Any]) -> Dict[str, Any]:
        """التحقق من بيانات تسجيل المستخدم"""
        schema = UserRegistrationSchema()
        try:
            result = schema.load(data)
            return {
                'valid': True,
                'data': result
            }
        except ValidationError as err:
            return {
                'valid': False,
                'errors': err.messages
            }
    
    @staticmethod
    def validate_campaign_creation(data: Dict[str, Any]) -> Dict[str, Any]:
        """التحقق من بيانات إنشاء الحملة"""
        schema = CampaignCreationSchema()
        try:
            result = schema.load(data)
            return {
                'valid': True,
                'data': result
            }
        except ValidationError as err:
            return {
                'valid': False,
                'errors': err.messages
            }
    
    @staticmethod
    def validate_website_url(data: Dict[str, Any]) -> Dict[str, Any]:
        """التحقق من رابط الموقع الإلكتروني"""
        schema = WebsiteUrlSchema()
        try:
            result = schema.load(data)
            return {
                'valid': True,
                'data': result
            }
        except ValidationError as err:
            return {
                'valid': False,
                'errors': err.messages
            }

class UserRegistrationSchema(Schema):
    """مخطط التحقق من تسجيل المستخدم"""
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    phone = fields.Str(allow_none=True, validate=validate.Length(min=8, max=20))
    company = fields.Str(allow_none=True, validate=validate.Length(max=200))

class CampaignCreationSchema(Schema):
    """مخطط التحقق من إنشاء الحملة"""
    name = fields.Str(required=True, validate=validate.Length(min=3, max=255))
    budget = fields.Float(required=True, validate=validate.Range(min=1))
    keywords = fields.List(fields.Str(), required=True, validate=validate.Length(min=1))
    target_location = fields.Str(required=True)
    website_url = fields.Url(required=True)

class WebsiteUrlSchema(Schema):
    """مخطط التحقق من رابط الموقع"""
    url = fields.Url(required=True)

# ===== الدوال المفقودة المطلوبة =====

def validate_email(email: str) -> Dict[str, Any]:
    """
    التحقق من صحة البريد الإلكتروني
    
    Args:
        email (str): البريد الإلكتروني للتحقق منه
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        if not email:
            return {'valid': False, 'message': "البريد الإلكتروني مطلوب"}
        
        if not isinstance(email, str):
            return {'valid': False, 'message': "البريد الإلكتروني يجب أن يكون نص"}
        
        email = email.strip().lower()
        
        if len(email) < 5:
            return {'valid': False, 'message': "البريد الإلكتروني قصير جداً"}
        
        if len(email) > 254:
            return {'valid': False, 'message': "البريد الإلكتروني طويل جداً"}
        
        # نمط التحقق من البريد الإلكتروني
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not email_pattern.match(email):
            return {'valid': False, 'message': "تنسيق البريد الإلكتروني غير صحيح"}
        
        # فحص إضافي للنطاقات المحظورة
        blocked_domains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com']
        domain = email.split('@')[1] if '@' in email else ''
        
        if domain in blocked_domains:
            return {'valid': False, 'message': "هذا النطاق غير مسموح"}
        
        return {'valid': True, 'message': "البريد الإلكتروني صحيح"}
        
    except Exception as e:
        return {'valid': False, 'message': f"خطأ في التحقق من البريد الإلكتروني: {str(e)}"}

def validate_account_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات الحساب
    
    Args:
        data (Dict[str, Any]): بيانات الحساب
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من معرف الحساب
        account_id = data.get('account_id', '')
        if not account_id:
            errors.append("معرف الحساب مطلوب")
        elif not isinstance(account_id, str):
            errors.append("معرف الحساب يجب أن يكون نص")
        
        # التحقق من اسم الحساب
        account_name = data.get('account_name', '')
        if not account_name:
            errors.append("اسم الحساب مطلوب")
        elif len(account_name.strip()) < 2:
            errors.append("اسم الحساب قصير جداً")
        elif len(account_name.strip()) > 255:
            errors.append("اسم الحساب طويل جداً")
        
        # التحقق من العملة
        currency = data.get('currency', '')
        valid_currencies = ['SAR', 'USD', 'EUR', 'AED', 'EGP', 'KWD', 'QAR', 'BHD', 'OMR']
        if currency and currency not in valid_currencies:
            errors.append(f"العملة غير صحيحة. العملات المتاحة: {', '.join(valid_currencies)}")
        
        # التحقق من المنطقة الزمنية
        timezone = data.get('timezone', '')
        if timezone and not isinstance(timezone, str):
            errors.append("المنطقة الزمنية يجب أن تكون نص")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من بيانات الحساب: {str(e)}"]}

def validate_client_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات العميل
    
    Args:
        data (Dict[str, Any]): بيانات العميل
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من البريد الإلكتروني
        email = data.get('email', '')
        email_result = validate_email(email)
        if not email_result['valid']:
            errors.append(f"البريد الإلكتروني: {email_result['message']}")
        
        # التحقق من الدور
        role = data.get('role', '')
        valid_roles = ['admin', 'standard', 'read_only', 'email_only']
        if not role:
            errors.append("الدور مطلوب")
        elif role not in valid_roles:
            errors.append(f"الدور غير صحيح. الأدوار المتاحة: {', '.join(valid_roles)}")
        
        # التحقق من مستوى الوصول
        access_level = data.get('access_level', '')
        valid_levels = ['standard', 'admin', 'read_only']
        if access_level and access_level not in valid_levels:
            errors.append(f"مستوى الوصول غير صحيح. المستويات المتاحة: {', '.join(valid_levels)}")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من بيانات العميل: {str(e)}"]}

def validate_url(url: str) -> Dict[str, Any]:
    """
    التحقق من صحة الرابط
    
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
        
        # نمط التحقق من الرابط
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        if not url_pattern.match(url):
            return {'valid': False, 'message': "تنسيق الرابط غير صحيح"}
        
        return {'valid': True, 'message': "الرابط صحيح"}
        
    except Exception as e:
        return {'valid': False, 'message': f"خطأ في التحقق من الرابط: {str(e)}"}

def validate_phone_number(phone: str) -> Dict[str, Any]:
    """
    التحقق من صحة رقم الهاتف
    
    Args:
        phone (str): رقم الهاتف للتحقق منه
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        if not phone:
            return {'valid': True, 'message': "رقم الهاتف اختياري"}
        
        if not isinstance(phone, str):
            return {'valid': False, 'message': "رقم الهاتف يجب أن يكون نص"}
        
        # إزالة المسافات والرموز
        phone_clean = re.sub(r'[\s\-\(\)]', '', phone)
        
        if len(phone_clean) < 8:
            return {'valid': False, 'message': "رقم الهاتف قصير جداً"}
        
        if len(phone_clean) > 15:
            return {'valid': False, 'message': "رقم الهاتف طويل جداً"}
        
        # نمط التحقق من رقم الهاتف
        phone_pattern = re.compile(r'^[\+]?[1-9][\d]{0,15}$')
        if not phone_pattern.match(phone_clean):
            return {'valid': False, 'message': "تنسيق رقم الهاتف غير صحيح"}
        
        return {'valid': True, 'message': "رقم الهاتف صحيح"}
        
    except Exception as e:
        return {'valid': False, 'message': f"خطأ في التحقق من رقم الهاتف: {str(e)}"}

def validate_customer_id(customer_id: str) -> Dict[str, Any]:
    """
    التحقق من صحة معرف العميل في Google Ads
    
    Args:
        customer_id (str): معرف العميل
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        if not customer_id:
            return {'valid': False, 'message': "معرف العميل مطلوب"}
        
        if not isinstance(customer_id, str):
            return {'valid': False, 'message': "معرف العميل يجب أن يكون نص"}
        
        # إزالة الشرطات
        customer_id_clean = customer_id.replace('-', '')
        
        # يجب أن يكون 10 أرقام
        if not customer_id_clean.isdigit():
            return {'valid': False, 'message': "معرف العميل يجب أن يحتوي على أرقام فقط"}
        
        if len(customer_id_clean) != 10:
            return {'valid': False, 'message': "معرف العميل يجب أن يكون 10 أرقام"}
        
        return {'valid': True, 'message': "معرف العميل صحيح"}
        
    except Exception as e:
        return {'valid': False, 'message': f"خطأ في التحقق من معرف العميل: {str(e)}"}

def validate_campaign_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات الحملة
    
    Args:
        data (Dict[str, Any]): بيانات الحملة
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من اسم الحملة
        name = data.get('name', '')
        if not name:
            errors.append("اسم الحملة مطلوب")
        elif len(name.strip()) < 3:
            errors.append("اسم الحملة قصير جداً")
        elif len(name.strip()) > 255:
            errors.append("اسم الحملة طويل جداً")
        
        # التحقق من الميزانية
        budget = data.get('budget', 0)
        try:
            budget = float(budget)
            if budget <= 0:
                errors.append("الميزانية يجب أن تكون أكبر من صفر")
        except (ValueError, TypeError):
            errors.append("الميزانية يجب أن تكون رقم")
        
        # التحقق من نوع الحملة
        campaign_type = data.get('campaign_type', '')
        valid_types = ['SEARCH', 'DISPLAY', 'SHOPPING', 'VIDEO', 'SMART', 'PERFORMANCE_MAX']
        if campaign_type and campaign_type not in valid_types:
            errors.append(f"نوع الحملة غير صحيح. الأنواع المتاحة: {', '.join(valid_types)}")
        
        # التحقق من الكلمات المفتاحية
        keywords = data.get('keywords', [])
        if keywords and not isinstance(keywords, list):
            errors.append("الكلمات المفتاحية يجب أن تكون قائمة")
        elif keywords and len(keywords) == 0:
            errors.append("يجب إضافة كلمة مفتاحية واحدة على الأقل")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من بيانات الحملة: {str(e)}"]}

def validate_keyword_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات الكلمة المفتاحية
    
    Args:
        data (Dict[str, Any]): بيانات الكلمة المفتاحية
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من نص الكلمة المفتاحية
        keyword_text = data.get('keyword_text', '')
        if not keyword_text:
            errors.append("نص الكلمة المفتاحية مطلوب")
        elif len(keyword_text.strip()) < 2:
            errors.append("الكلمة المفتاحية قصيرة جداً")
        elif len(keyword_text.strip()) > 80:
            errors.append("الكلمة المفتاحية طويلة جداً")
        
        # التحقق من نوع المطابقة
        match_type = data.get('match_type', '')
        valid_types = ['EXACT', 'PHRASE', 'BROAD']
        if match_type and match_type not in valid_types:
            errors.append(f"نوع المطابقة غير صحيح. الأنواع المتاحة: {', '.join(valid_types)}")
        
        # التحقق من العرض
        bid_amount = data.get('bid_amount', 0)
        if bid_amount:
            try:
                bid_amount = float(bid_amount)
                if bid_amount <= 0:
                    errors.append("مبلغ العرض يجب أن يكون أكبر من صفر")
            except (ValueError, TypeError):
                errors.append("مبلغ العرض يجب أن يكون رقم")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من بيانات الكلمة المفتاحية: {str(e)}"]}

def validate_ad_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات الإعلان
    
    Args:
        data (Dict[str, Any]): بيانات الإعلان
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من العنوان
        headline = data.get('headline', '')
        if not headline:
            errors.append("عنوان الإعلان مطلوب")
        elif len(headline.strip()) < 5:
            errors.append("عنوان الإعلان قصير جداً")
        elif len(headline.strip()) > 30:
            errors.append("عنوان الإعلان طويل جداً")
        
        # التحقق من الوصف
        description = data.get('description', '')
        if not description:
            errors.append("وصف الإعلان مطلوب")
        elif len(description.strip()) < 10:
            errors.append("وصف الإعلان قصير جداً")
        elif len(description.strip()) > 90:
            errors.append("وصف الإعلان طويل جداً")
        
        # التحقق من الرابط النهائي
        final_url = data.get('final_url', '')
        if final_url:
            url_result = validate_url(final_url)
            if not url_result['valid']:
                errors.append(f"الرابط النهائي: {url_result['message']}")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من بيانات الإعلان: {str(e)}"]}

def validate_budget_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات الميزانية
    
    Args:
        data (Dict[str, Any]): بيانات الميزانية
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من المبلغ
        amount = data.get('amount', 0)
        try:
            amount = float(amount)
            if amount <= 0:
                errors.append("مبلغ الميزانية يجب أن يكون أكبر من صفر")
            elif amount > 1000000:
                errors.append("مبلغ الميزانية كبير جداً")
        except (ValueError, TypeError):
            errors.append("مبلغ الميزانية يجب أن يكون رقم")
        
        # التحقق من نوع الميزانية
        budget_type = data.get('budget_type', '')
        valid_types = ['DAILY', 'MONTHLY', 'TOTAL']
        if budget_type and budget_type not in valid_types:
            errors.append(f"نوع الميزانية غير صحيح. الأنواع المتاحة: {', '.join(valid_types)}")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من بيانات الميزانية: {str(e)}"]}

def validate_location_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات الموقع الجغرافي
    
    Args:
        data (Dict[str, Any]): بيانات الموقع
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من اسم الموقع
        location_name = data.get('location_name', '')
        if not location_name:
            errors.append("اسم الموقع مطلوب")
        elif len(location_name.strip()) < 2:
            errors.append("اسم الموقع قصير جداً")
        
        # التحقق من رمز البلد
        country_code = data.get('country_code', '')
        if country_code and len(country_code) != 2:
            errors.append("رمز البلد يجب أن يكون حرفين")
        
        # التحقق من معرف الموقع
        location_id = data.get('location_id', '')
        if location_id and not str(location_id).isdigit():
            errors.append("معرف الموقع يجب أن يكون رقم")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من بيانات الموقع: {str(e)}"]}

def validate_date_range(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة نطاق التاريخ
    
    Args:
        data (Dict[str, Any]): بيانات نطاق التاريخ
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من تاريخ البداية
        start_date = data.get('start_date', '')
        if start_date:
            try:
                datetime.strptime(start_date, '%Y-%m-%d')
            except ValueError:
                errors.append("تنسيق تاريخ البداية غير صحيح (YYYY-MM-DD)")
        
        # التحقق من تاريخ النهاية
        end_date = data.get('end_date', '')
        if end_date:
            try:
                datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                errors.append("تنسيق تاريخ النهاية غير صحيح (YYYY-MM-DD)")
        
        # التحقق من أن تاريخ البداية قبل تاريخ النهاية
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d')
                end = datetime.strptime(end_date, '%Y-%m-%d')
                if start > end:
                    errors.append("تاريخ البداية يجب أن يكون قبل تاريخ النهاية")
            except ValueError:
                pass  # الخطأ تم التعامل معه أعلاه
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من نطاق التاريخ: {str(e)}"]}

def validate_file_upload(file_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة رفع الملف
    
    Args:
        file_data (Dict[str, Any]): بيانات الملف
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(file_data, dict):
            return {'valid': False, 'errors': ["بيانات الملف يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من اسم الملف
        filename = file_data.get('filename', '')
        if not filename:
            errors.append("اسم الملف مطلوب")
        else:
            # التحقق من امتداد الملف
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.csv', '.xlsx']
            file_ext = os.path.splitext(filename)[1].lower()
            if file_ext not in allowed_extensions:
                errors.append(f"امتداد الملف غير مسموح. الامتدادات المسموحة: {', '.join(allowed_extensions)}")
        
        # التحقق من حجم الملف
        file_size = file_data.get('file_size', 0)
        try:
            file_size = int(file_size)
            max_size = 10 * 1024 * 1024  # 10 MB
            if file_size > max_size:
                errors.append("حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)")
        except (ValueError, TypeError):
            errors.append("حجم الملف يجب أن يكون رقم")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من رفع الملف: {str(e)}"]}

def validate_api_key(api_key: str) -> Dict[str, Any]:
    """
    التحقق من صحة مفتاح API
    
    Args:
        api_key (str): مفتاح API
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        if not api_key:
            return {'valid': False, 'message': "مفتاح API مطلوب"}
        
        if not isinstance(api_key, str):
            return {'valid': False, 'message': "مفتاح API يجب أن يكون نص"}
        
        if len(api_key) < 32:
            return {'valid': False, 'message': "مفتاح API قصير جداً"}
        
        if len(api_key) > 128:
            return {'valid': False, 'message': "مفتاح API طويل جداً"}
        
        # التحقق من أن المفتاح يحتوي على أحرف وأرقام فقط
        if not re.match(r'^[a-zA-Z0-9_-]+$', api_key):
            return {'valid': False, 'message': "مفتاح API يحتوي على أحرف غير مسموحة"}
        
        return {'valid': True, 'message': "مفتاح API صحيح"}
        
    except Exception as e:
        return {'valid': False, 'message': f"خطأ في التحقق من مفتاح API: {str(e)}"}

def validate_json_data(json_string: str) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات JSON
    
    Args:
        json_string (str): نص JSON
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        if not json_string:
            return {'valid': False, 'message': "بيانات JSON مطلوبة"}
        
        if not isinstance(json_string, str):
            return {'valid': False, 'message': "بيانات JSON يجب أن تكون نص"}
        
        # محاولة تحليل JSON
        import json
        parsed_data = json.loads(json_string)
        
        return {
            'valid': True, 
            'message': "بيانات JSON صحيحة",
            'data': parsed_data
        }
        
    except json.JSONDecodeError as e:
        return {'valid': False, 'message': f"خطأ في تنسيق JSON: {str(e)}"}
    except Exception as e:
        return {'valid': False, 'message': f"خطأ في التحقق من JSON: {str(e)}"}

# تصدير جميع الدوال
__all__ = [
    'RequestValidator',
    'UserRegistrationSchema',
    'CampaignCreationSchema', 
    'WebsiteUrlSchema',
    'validate_email',
    'validate_account_data',
    'validate_client_data',
    'validate_url',
    'validate_phone_number',
    'validate_customer_id',
    'validate_campaign_data',
    'validate_keyword_data',
    'validate_ad_data',
    'validate_budget_data',
    'validate_location_data',
    'validate_date_range',
    'validate_file_upload',
    'validate_api_key',
    'validate_json_data'
]


def validate_permission_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات الصلاحيات
    
    Args:
        data (Dict[str, Any]): بيانات الصلاحيات
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من نوع الصلاحية
        permission_type = data.get('permission_type', '')
        valid_types = ['read', 'write', 'admin', 'full_access']
        if not permission_type:
            errors.append("نوع الصلاحية مطلوب")
        elif permission_type not in valid_types:
            errors.append(f"نوع الصلاحية غير صحيح. الأنواع المتاحة: {', '.join(valid_types)}")
        
        # التحقق من المورد
        resource = data.get('resource', '')
        if not resource:
            errors.append("المورد مطلوب")
        elif len(resource.strip()) < 2:
            errors.append("اسم المورد قصير جداً")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من بيانات الصلاحيات: {str(e)}"]}

def validate_sync_config(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة إعدادات المزامنة
    
    Args:
        data (Dict[str, Any]): إعدادات المزامنة
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من نوع المزامنة
        sync_type = data.get('sync_type', '')
        valid_types = ['manual', 'automatic', 'scheduled']
        if not sync_type:
            errors.append("نوع المزامنة مطلوب")
        elif sync_type not in valid_types:
            errors.append(f"نوع المزامنة غير صحيح. الأنواع المتاحة: {', '.join(valid_types)}")
        
        # التحقق من التكرار
        frequency = data.get('frequency', 0)
        if sync_type == 'scheduled':
            try:
                frequency = int(frequency)
                if frequency <= 0:
                    errors.append("تكرار المزامنة يجب أن يكون أكبر من صفر")
            except (ValueError, TypeError):
                errors.append("تكرار المزامنة يجب أن يكون رقم")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من إعدادات المزامنة: {str(e)}"]}

def validate_report_config(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة إعدادات التقرير
    
    Args:
        data (Dict[str, Any]): إعدادات التقرير
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من نوع التقرير
        report_type = data.get('report_type', '')
        valid_types = ['performance', 'keywords', 'campaigns', 'accounts', 'custom']
        if not report_type:
            errors.append("نوع التقرير مطلوب")
        elif report_type not in valid_types:
            errors.append(f"نوع التقرير غير صحيح. الأنواع المتاحة: {', '.join(valid_types)}")
        
        # التحقق من نطاق التاريخ
        date_range = data.get('date_range', {})
        if date_range:
            date_result = validate_date_range(date_range)
            if not date_result['valid']:
                errors.extend(date_result['errors'])
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من إعدادات التقرير: {str(e)}"]}

def validate_oauth_config(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة إعدادات OAuth
    
    Args:
        data (Dict[str, Any]): إعدادات OAuth
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من معرف العميل
        client_id = data.get('client_id', '')
        if not client_id:
            errors.append("معرف العميل مطلوب")
        elif len(client_id.strip()) < 10:
            errors.append("معرف العميل قصير جداً")
        
        # التحقق من سر العميل
        client_secret = data.get('client_secret', '')
        if not client_secret:
            errors.append("سر العميل مطلوب")
        elif len(client_secret.strip()) < 10:
            errors.append("سر العميل قصير جداً")
        
        # التحقق من رابط الإعادة التوجيه
        redirect_uri = data.get('redirect_uri', '')
        if redirect_uri:
            url_result = validate_url(redirect_uri)
            if not url_result['valid']:
                errors.append(f"رابط الإعادة التوجيه: {url_result['message']}")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من إعدادات OAuth: {str(e)}"]}

def validate_user_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات المستخدم
    
    Args:
        data (Dict[str, Any]): بيانات المستخدم
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من الاسم
        name = data.get('name', '')
        if not name:
            errors.append("الاسم مطلوب")
        elif len(name.strip()) < 2:
            errors.append("الاسم قصير جداً")
        elif len(name.strip()) > 100:
            errors.append("الاسم طويل جداً")
        
        # التحقق من البريد الإلكتروني
        email = data.get('email', '')
        email_result = validate_email(email)
        if not email_result['valid']:
            errors.append(f"البريد الإلكتروني: {email_result['message']}")
        
        # التحقق من كلمة المرور
        password = data.get('password', '')
        if password:
            if len(password) < 8:
                errors.append("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
            elif not re.search(r'[A-Za-z]', password):
                errors.append("كلمة المرور يجب أن تحتوي على حروف")
            elif not re.search(r'\d', password):
                errors.append("كلمة المرور يجب أن تحتوي على أرقام")
        
        # التحقق من رقم الهاتف
        phone = data.get('phone', '')
        if phone:
            phone_result = validate_phone_number(phone)
            if not phone_result['valid']:
                errors.append(f"رقم الهاتف: {phone_result['message']}")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من بيانات المستخدم: {str(e)}"]}

# تحديث قائمة __all__
__all__.extend([
    'validate_permission_data',
    'validate_sync_config', 
    'validate_report_config',
    'validate_oauth_config',
    'validate_user_data'
])


def validate_callback_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات callback OAuth
    
    Args:
        data (Dict[str, Any]): بيانات callback
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        errors = []
        
        if not isinstance(data, dict):
            return {'valid': False, 'errors': ["البيانات يجب أن تكون في تنسيق JSON"]}
        
        # التحقق من رمز التفويض
        code = data.get('code', '')
        if not code:
            errors.append("رمز التفويض مطلوب")
        elif len(code.strip()) < 10:
            errors.append("رمز التفويض قصير جداً")
        
        # التحقق من state (اختياري)
        state = data.get('state', '')
        if state and len(state.strip()) < 5:
            errors.append("معامل state قصير جداً")
        
        # التحقق من وجود خطأ
        error = data.get('error', '')
        if error:
            errors.append(f"خطأ في OAuth: {error}")
        
        return {'valid': len(errors) == 0, 'errors': errors}
        
    except Exception as e:
        return {'valid': False, 'errors': [f"خطأ في التحقق من بيانات callback: {str(e)}"]}

# تحديث قائمة __all__
__all__.append('validate_callback_data')

