#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
✅ Validators Utility - أداة التحقق
==================================

نظام تحقق متقدم لمنصة Google Ads AI Platform
يدعم التحقق من صحة البيانات والمدخلات

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import re
import os
import json
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass
from enum import Enum

class ValidationResult(Enum):
    """نتائج التحقق"""
    VALID = "VALID"
    INVALID = "INVALID"
    WARNING = "WARNING"

@dataclass
class ValidationError:
    """خطأ التحقق"""
    field: str
    message: str
    code: str
    severity: ValidationResult

class DataValidator:
    """
    مُحقق البيانات
    """
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """التحقق من صحة البريد الإلكتروني"""
        if not email or not isinstance(email, str):
            return False
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """التحقق من صحة الرابط"""
        if not url or not isinstance(url, str):
            return False
        
        pattern = r'^https?://(?:[-\w.])+(?:\:[0-9]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$'
        return bool(re.match(pattern, url))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """التحقق من صحة رقم الهاتف"""
        if not phone or not isinstance(phone, str):
            return False
        
        # إزالة المسافات والرموز
        clean_phone = re.sub(r'[^\d+]', '', phone)
        
        # التحقق من الطول والتنسيق
        pattern = r'^\+?[1-9]\d{1,14}$'
        return bool(re.match(pattern, clean_phone))
    
    @staticmethod
    def validate_customer_id(customer_id: str) -> bool:
        """التحقق من صحة Customer ID"""
        if not customer_id or not isinstance(customer_id, str):
            return False
        
        # إزالة الشرطات
        clean_id = customer_id.replace('-', '')
        
        # التحقق من أنه رقم من 10 أرقام
        return clean_id.isdigit() and len(clean_id) == 10
    
    @staticmethod
    def validate_developer_token(token: str) -> bool:
        """التحقق من صحة Developer Token"""
        if not token or not isinstance(token, str):
            return False
        
        # Developer Token عادة ما يكون 22 حرف
        return len(token) >= 20 and len(token) <= 30
    
    @staticmethod
    def validate_budget(budget: Union[int, float]) -> bool:
        """التحقق من صحة الميزانية"""
        try:
            budget_float = float(budget)
            return budget_float > 0
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_keywords(keywords: List[str]) -> bool:
        """التحقق من صحة الكلمات المفتاحية"""
        if not keywords or not isinstance(keywords, list):
            return False
        
        for keyword in keywords:
            if not isinstance(keyword, str) or len(keyword.strip()) == 0:
                return False
            if len(keyword) > 80:  # حد Google Ads
                return False
        
        return True
    
    @staticmethod
    def validate_campaign_name(name: str) -> bool:
        """التحقق من صحة اسم الحملة"""
        if not name or not isinstance(name, str):
            return False
        
        name = name.strip()
        return 1 <= len(name) <= 255
    
    @staticmethod
    def validate_ad_text(text: str, max_length: int = 90) -> bool:
        """التحقق من صحة نص الإعلان"""
        if not text or not isinstance(text, str):
            return False
        
        text = text.strip()
        return 1 <= len(text) <= max_length

class GoogleAdsValidator:
    """
    مُحقق بيانات Google Ads
    """
    
    def __init__(self):
        self.errors: List[ValidationError] = []
    
    def validate_campaign_data(self, campaign_data: Dict[str, Any]) -> List[ValidationError]:
        """التحقق من بيانات الحملة"""
        self.errors = []
        
        # التحقق من اسم الحملة
        if 'name' not in campaign_data:
            self.errors.append(ValidationError(
                field='name',
                message='اسم الحملة مطلوب',
                code='MISSING_CAMPAIGN_NAME',
                severity=ValidationResult.INVALID
            ))
        elif not DataValidator.validate_campaign_name(campaign_data['name']):
            self.errors.append(ValidationError(
                field='name',
                message='اسم الحملة غير صحيح',
                code='INVALID_CAMPAIGN_NAME',
                severity=ValidationResult.INVALID
            ))
        
        # التحقق من الميزانية
        if 'budget' not in campaign_data:
            self.errors.append(ValidationError(
                field='budget',
                message='الميزانية مطلوبة',
                code='MISSING_BUDGET',
                severity=ValidationResult.INVALID
            ))
        elif not DataValidator.validate_budget(campaign_data['budget']):
            self.errors.append(ValidationError(
                field='budget',
                message='الميزانية غير صحيحة',
                code='INVALID_BUDGET',
                severity=ValidationResult.INVALID
            ))
        
        # التحقق من الكلمات المفتاحية
        if 'keywords' in campaign_data:
            if not DataValidator.validate_keywords(campaign_data['keywords']):
                self.errors.append(ValidationError(
                    field='keywords',
                    message='الكلمات المفتاحية غير صحيحة',
                    code='INVALID_KEYWORDS',
                    severity=ValidationResult.INVALID
                ))
        
        return self.errors
    
    def validate_account_data(self, account_data: Dict[str, Any]) -> List[ValidationError]:
        """التحقق من بيانات الحساب"""
        self.errors = []
        
        # التحقق من Customer ID
        if 'customer_id' not in account_data:
            self.errors.append(ValidationError(
                field='customer_id',
                message='Customer ID مطلوب',
                code='MISSING_CUSTOMER_ID',
                severity=ValidationResult.INVALID
            ))
        elif not DataValidator.validate_customer_id(account_data['customer_id']):
            self.errors.append(ValidationError(
                field='customer_id',
                message='Customer ID غير صحيح',
                code='INVALID_CUSTOMER_ID',
                severity=ValidationResult.INVALID
            ))
        
        # التحقق من اسم الحساب
        if 'name' in account_data and not account_data['name'].strip():
            self.errors.append(ValidationError(
                field='name',
                message='اسم الحساب لا يمكن أن يكون فارغاً',
                code='EMPTY_ACCOUNT_NAME',
                severity=ValidationResult.WARNING
            ))
        
        return self.errors
    
    def validate_config(self, config: Dict[str, Any]) -> List[ValidationError]:
        """التحقق من إعدادات Google Ads"""
        self.errors = []
        
        required_fields = [
            'developer_token',
            'client_id',
            'client_secret',
            'refresh_token'
        ]
        
        for field in required_fields:
            if field not in config or not config[field]:
                self.errors.append(ValidationError(
                    field=field,
                    message=f'{field} مطلوب',
                    code=f'MISSING_{field.upper()}',
                    severity=ValidationResult.INVALID
                ))
        
        # التحقق من Developer Token
        if 'developer_token' in config:
            if not DataValidator.validate_developer_token(config['developer_token']):
                self.errors.append(ValidationError(
                    field='developer_token',
                    message='Developer Token غير صحيح',
                    code='INVALID_DEVELOPER_TOKEN',
                    severity=ValidationResult.INVALID
                ))
        
        return self.errors

class FileValidator:
    """
    مُحقق الملفات
    """
    
    @staticmethod
    def validate_file_exists(file_path: str) -> bool:
        """التحقق من وجود الملف"""
        return os.path.exists(file_path) and os.path.isfile(file_path)
    
    @staticmethod
    def validate_directory_exists(dir_path: str) -> bool:
        """التحقق من وجود المجلد"""
        return os.path.exists(dir_path) and os.path.isdir(dir_path)
    
    @staticmethod
    def validate_json_file(file_path: str) -> bool:
        """التحقق من صحة ملف JSON"""
        try:
            if not FileValidator.validate_file_exists(file_path):
                return False
            
            with open(file_path, 'r', encoding='utf-8') as f:
                json.load(f)
            return True
        except (json.JSONDecodeError, IOError):
            return False
    
    @staticmethod
    def validate_file_size(file_path: str, max_size_mb: int = 10) -> bool:
        """التحقق من حجم الملف"""
        try:
            if not FileValidator.validate_file_exists(file_path):
                return False
            
            file_size = os.path.getsize(file_path)
            max_size_bytes = max_size_mb * 1024 * 1024
            return file_size <= max_size_bytes
        except OSError:
            return False

# دوال مساعدة سريعة
def is_valid_email(email: str) -> bool:
    """التحقق من صحة البريد الإلكتروني"""
    return DataValidator.validate_email(email)

def is_valid_url(url: str) -> bool:
    """التحقق من صحة الرابط"""
    return DataValidator.validate_url(url)

def is_valid_customer_id(customer_id: str) -> bool:
    """التحقق من صحة Customer ID"""
    return DataValidator.validate_customer_id(customer_id)

def validate_campaign(campaign_data: Dict[str, Any]) -> List[ValidationError]:
    """التحقق من بيانات الحملة"""
    validator = GoogleAdsValidator()
    return validator.validate_campaign_data(campaign_data)

def validate_account(account_data: Dict[str, Any]) -> List[ValidationError]:
    """التحقق من بيانات الحساب"""
    validator = GoogleAdsValidator()
    return validator.validate_account_data(account_data)

# اختبار النظام
if __name__ == "__main__":
    # اختبار التحقق من البيانات
    print("🧪 اختبار نظام التحقق...")
    
    # اختبار البريد الإلكتروني
    print(f"✅ بريد صحيح: {is_valid_email('test@example.com')}")
    print(f"❌ بريد خاطئ: {is_valid_email('invalid-email')}")
    
    # اختبار Customer ID
    print(f"✅ Customer ID صحيح: {is_valid_customer_id('123-456-7890')}")
    print(f"❌ Customer ID خاطئ: {is_valid_customer_id('123')}")
    
    # اختبار بيانات الحملة
    campaign_data = {
        'name': 'حملة تجريبية',
        'budget': 100.0,
        'keywords': ['كلمة مفتاحية 1', 'كلمة مفتاحية 2']
    }
    
    errors = validate_campaign(campaign_data)
    if errors:
        print("❌ أخطاء في بيانات الحملة:")
        for error in errors:
            print(f"   - {error.field}: {error.message}")
    else:
        print("✅ بيانات الحملة صحيحة")
    
    print("✅ تم اختبار نظام التحقق بنجاح")

