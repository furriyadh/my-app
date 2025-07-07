#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🔄 Data Mapper - مُحول البيانات
===============================

مُحول شامل للبيانات يدعم:
- تحويل البيانات بين صيغ مختلفة
- ربط الحقول والمخططات
- تنظيف وتطبيع البيانات
- التحقق من صحة البيانات
- التحويلات المخصصة

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
import json
import re
from typing import Dict, Any, List, Optional, Union, Callable
from datetime import datetime, date
from dataclasses import dataclass, field
from enum import Enum
import copy

# استيراد وحدات النظام
try:
    from ..utils.logger import setup_logger
    logger = setup_logger(__name__)
except ImportError:
    logger = logging.getLogger(__name__)

class DataType(Enum):
    """أنواع البيانات"""
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    DATE = "date"
    DATETIME = "datetime"
    LIST = "list"
    DICT = "dict"
    EMAIL = "email"
    URL = "url"
    PHONE = "phone"

class TransformationType(Enum):
    """أنواع التحويلات"""
    DIRECT = "direct"              # نسخ مباشر
    RENAME = "rename"              # إعادة تسمية
    CONVERT = "convert"            # تحويل نوع البيانات
    CALCULATE = "calculate"        # حساب من حقول أخرى
    CONSTANT = "constant"          # قيمة ثابتة
    CONDITIONAL = "conditional"    # تحويل شرطي
    CUSTOM = "custom"              # دالة مخصصة

@dataclass
class FieldMapping:
    """
    🔗 ربط الحقول
    """
    source_field: str
    target_field: str
    transformation: TransformationType = TransformationType.DIRECT
    data_type: Optional[DataType] = None
    default_value: Any = None
    validation_rules: List[str] = field(default_factory=list)
    custom_function: Optional[Callable] = None
    parameters: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'source_field': self.source_field,
            'target_field': self.target_field,
            'transformation': self.transformation.value,
            'data_type': self.data_type.value if self.data_type else None,
            'default_value': self.default_value,
            'validation_rules': self.validation_rules,
            'parameters': self.parameters
        }

@dataclass
class MappingSchema:
    """
    📋 مخطط الربط
    """
    name: str
    description: str = ""
    field_mappings: List[FieldMapping] = field(default_factory=list)
    global_transformations: Dict[str, Any] = field(default_factory=dict)
    validation_enabled: bool = True
    strict_mode: bool = False  # إذا كان True، يرفض الحقول غير المعرفة
    
    def add_mapping(self, mapping: FieldMapping):
        """إضافة ربط حقل"""
        self.field_mappings.append(mapping)
    
    def get_mapping(self, source_field: str) -> Optional[FieldMapping]:
        """الحصول على ربط حقل"""
        for mapping in self.field_mappings:
            if mapping.source_field == source_field:
                return mapping
        return None
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'name': self.name,
            'description': self.description,
            'field_mappings': [mapping.to_dict() for mapping in self.field_mappings],
            'global_transformations': self.global_transformations,
            'validation_enabled': self.validation_enabled,
            'strict_mode': self.strict_mode
        }

@dataclass
class MappingResult:
    """
    📊 نتيجة التحويل
    """
    success: bool
    mapped_data: Any = None
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    skipped_fields: List[str] = field(default_factory=list)
    processing_time: float = 0.0
    records_processed: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'success': self.success,
            'mapped_data': self.mapped_data,
            'errors': self.errors,
            'warnings': self.warnings,
            'skipped_fields': self.skipped_fields,
            'processing_time': self.processing_time,
            'records_processed': self.records_processed
        }

class DataMapper:
    """
    🔄 مُحول البيانات المتقدم
    
    يوفر تحويل شامل للبيانات مع دعم:
    - ربط الحقول المرن
    - تحويلات متعددة الأنواع
    - التحقق من صحة البيانات
    - التحويلات المخصصة
    """
    
    def __init__(self, mapping_config: Optional[Dict[str, Any]] = None):
        """
        تهيئة مُحول البيانات
        
        Args:
            mapping_config: إعدادات الربط
        """
        self.schemas: Dict[str, MappingSchema] = {}
        self.custom_functions: Dict[str, Callable] = {}
        
        # إحصائيات التحويل
        self.mapping_stats = {
            'total_mappings': 0,
            'successful_mappings': 0,
            'failed_mappings': 0,
            'total_records_processed': 0,
            'average_processing_time': 0.0
        }
        
        # تحميل الإعدادات إذا وُجدت
        if mapping_config:
            self._load_config(mapping_config)
        
        # تسجيل الدوال المدمجة
        self._register_builtin_functions()
        
        logger.info("🔄 تم تهيئة مُحول البيانات")
    
    def _load_config(self, config: Dict[str, Any]):
        """تحميل إعدادات الربط"""
        try:
            if 'schemas' in config:
                for schema_data in config['schemas']:
                    schema = self._create_schema_from_dict(schema_data)
                    self.schemas[schema.name] = schema
            
            logger.info(f"📋 تم تحميل {len(self.schemas)} مخطط ربط")
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل إعدادات الربط: {e}")
    
    def _create_schema_from_dict(self, schema_data: Dict[str, Any]) -> MappingSchema:
        """إنشاء مخطط من قاموس"""
        schema = MappingSchema(
            name=schema_data['name'],
            description=schema_data.get('description', ''),
            validation_enabled=schema_data.get('validation_enabled', True),
            strict_mode=schema_data.get('strict_mode', False)
        )
        
        # إضافة ربط الحقول
        for mapping_data in schema_data.get('field_mappings', []):
            mapping = FieldMapping(
                source_field=mapping_data['source_field'],
                target_field=mapping_data['target_field'],
                transformation=TransformationType(mapping_data.get('transformation', 'direct')),
                data_type=DataType(mapping_data['data_type']) if mapping_data.get('data_type') else None,
                default_value=mapping_data.get('default_value'),
                validation_rules=mapping_data.get('validation_rules', []),
                parameters=mapping_data.get('parameters', {})
            )
            schema.add_mapping(mapping)
        
        return schema
    
    def _register_builtin_functions(self):
        """تسجيل الدوال المدمجة"""
        
        # دوال التحويل الأساسية
        self.custom_functions.update({
            'to_upper': lambda x: str(x).upper() if x else '',
            'to_lower': lambda x: str(x).lower() if x else '',
            'trim': lambda x: str(x).strip() if x else '',
            'format_phone': self._format_phone,
            'format_email': self._format_email,
            'parse_date': self._parse_date,
            'calculate_ctr': self._calculate_ctr,
            'calculate_cpc': self._calculate_cpc,
            'format_currency': self._format_currency,
            'clean_text': self._clean_text
        })
        
        logger.debug(f"🔧 تم تسجيل {len(self.custom_functions)} دالة مدمجة")
    
    def register_schema(self, schema: MappingSchema):
        """تسجيل مخطط ربط"""
        self.schemas[schema.name] = schema
        logger.info(f"📋 تم تسجيل مخطط الربط: {schema.name}")
    
    def register_custom_function(self, name: str, function: Callable):
        """تسجيل دالة مخصصة"""
        self.custom_functions[name] = function
        logger.info(f"🔧 تم تسجيل الدالة المخصصة: {name}")
    
    async def map_data(
        self,
        data: Union[Dict[str, Any], List[Dict[str, Any]]],
        schema_name: str
    ) -> MappingResult:
        """
        تحويل البيانات باستخدام مخطط محدد
        
        Args:
            data: البيانات المراد تحويلها
            schema_name: اسم مخطط الربط
            
        Returns:
            MappingResult: نتيجة التحويل
        """
        start_time = datetime.now()
        
        if schema_name not in self.schemas:
            return MappingResult(
                success=False,
                errors=[f"مخطط الربط غير موجود: {schema_name}"]
            )
        
        schema = self.schemas[schema_name]
        
        try:
            # تحديد نوع البيانات
            if isinstance(data, list):
                # قائمة من السجلات
                mapped_records = []
                errors = []
                warnings = []
                skipped_fields = set()
                
                for i, record in enumerate(data):
                    result = await self._map_single_record(record, schema)
                    
                    if result.success:
                        mapped_records.append(result.mapped_data)
                    else:
                        errors.extend([f"السجل {i+1}: {error}" for error in result.errors])
                    
                    warnings.extend(result.warnings)
                    skipped_fields.update(result.skipped_fields)
                
                processing_time = (datetime.now() - start_time).total_seconds()
                
                # تحديث الإحصائيات
                self.mapping_stats['total_mappings'] += 1
                self.mapping_stats['total_records_processed'] += len(data)
                
                if not errors:
                    self.mapping_stats['successful_mappings'] += 1
                    success = True
                    mapped_data = mapped_records
                else:
                    self.mapping_stats['failed_mappings'] += 1
                    success = False
                    mapped_data = mapped_records if mapped_records else None
                
                return MappingResult(
                    success=success,
                    mapped_data=mapped_data,
                    errors=errors,
                    warnings=list(warnings),
                    skipped_fields=list(skipped_fields),
                    processing_time=processing_time,
                    records_processed=len(data)
                )
                
            else:
                # سجل واحد
                result = await self._map_single_record(data, schema)
                result.processing_time = (datetime.now() - start_time).total_seconds()
                result.records_processed = 1
                
                # تحديث الإحصائيات
                self.mapping_stats['total_mappings'] += 1
                self.mapping_stats['total_records_processed'] += 1
                
                if result.success:
                    self.mapping_stats['successful_mappings'] += 1
                else:
                    self.mapping_stats['failed_mappings'] += 1
                
                return result
                
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            
            self.mapping_stats['total_mappings'] += 1
            self.mapping_stats['failed_mappings'] += 1
            
            logger.error(f"❌ فشل في تحويل البيانات: {e}")
            
            return MappingResult(
                success=False,
                errors=[f"خطأ في التحويل: {e}"],
                processing_time=processing_time
            )
        
        finally:
            # تحديث متوسط وقت المعالجة
            self._update_average_processing_time(
                (datetime.now() - start_time).total_seconds()
            )
    
    async def _map_single_record(
        self,
        record: Dict[str, Any],
        schema: MappingSchema
    ) -> MappingResult:
        """تحويل سجل واحد"""
        
        mapped_record = {}
        errors = []
        warnings = []
        skipped_fields = []
        
        try:
            # معالجة كل ربط حقل
            for mapping in schema.field_mappings:
                try:
                    # الحصول على القيمة المصدر
                    source_value = self._get_source_value(record, mapping.source_field)
                    
                    # تطبيق التحويل
                    transformed_value = await self._apply_transformation(
                        source_value, mapping, record
                    )
                    
                    # التحقق من صحة البيانات
                    if schema.validation_enabled and mapping.validation_rules:
                        validation_result = self._validate_value(
                            transformed_value, mapping.validation_rules
                        )
                        if not validation_result['valid']:
                            errors.append(
                                f"فشل التحقق من {mapping.target_field}: {validation_result['message']}"
                            )
                            continue
                    
                    # تعيين القيمة في السجل المُحول
                    self._set_target_value(mapped_record, mapping.target_field, transformed_value)
                    
                except Exception as e:
                    error_msg = f"فشل في تحويل {mapping.source_field} -> {mapping.target_field}: {e}"
                    errors.append(error_msg)
                    logger.debug(error_msg)
            
            # معالجة الحقول غير المعرفة في الوضع غير الصارم
            if not schema.strict_mode:
                for key, value in record.items():
                    if not schema.get_mapping(key) and key not in mapped_record:
                        mapped_record[key] = value
                        skipped_fields.append(key)
            
            # تطبيق التحويلات العامة
            if schema.global_transformations:
                mapped_record = await self._apply_global_transformations(
                    mapped_record, schema.global_transformations
                )
            
            success = len(errors) == 0
            
            return MappingResult(
                success=success,
                mapped_data=mapped_record if success else None,
                errors=errors,
                warnings=warnings,
                skipped_fields=skipped_fields
            )
            
        except Exception as e:
            return MappingResult(
                success=False,
                errors=[f"خطأ في معالجة السجل: {e}"]
            )
    
    def _get_source_value(self, record: Dict[str, Any], field_path: str) -> Any:
        """الحصول على قيمة من مسار الحقل"""
        
        # دعم المسارات المتداخلة (مثل: user.profile.name)
        keys = field_path.split('.')
        value = record
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return None
        
        return value
    
    def _set_target_value(self, record: Dict[str, Any], field_path: str, value: Any):
        """تعيين قيمة في مسار الحقل"""
        
        keys = field_path.split('.')
        current = record
        
        # إنشاء المسار المتداخل
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        # تعيين القيمة النهائية
        current[keys[-1]] = value
    
    async def _apply_transformation(
        self,
        value: Any,
        mapping: FieldMapping,
        full_record: Dict[str, Any]
    ) -> Any:
        """تطبيق التحويل على القيمة"""
        
        # استخدام القيمة الافتراضية إذا كانت القيمة فارغة
        if value is None and mapping.default_value is not None:
            value = mapping.default_value
        
        # تطبيق التحويل حسب النوع
        if mapping.transformation == TransformationType.DIRECT:
            return value
        
        elif mapping.transformation == TransformationType.RENAME:
            return value  # إعادة التسمية تتم في مستوى أعلى
        
        elif mapping.transformation == TransformationType.CONVERT:
            return self._convert_data_type(value, mapping.data_type)
        
        elif mapping.transformation == TransformationType.CALCULATE:
            return self._calculate_value(full_record, mapping.parameters)
        
        elif mapping.transformation == TransformationType.CONSTANT:
            return mapping.parameters.get('value', mapping.default_value)
        
        elif mapping.transformation == TransformationType.CONDITIONAL:
            return self._apply_conditional_transformation(value, mapping.parameters)
        
        elif mapping.transformation == TransformationType.CUSTOM:
            function_name = mapping.parameters.get('function')
            if function_name and function_name in self.custom_functions:
                return self.custom_functions[function_name](value)
            elif mapping.custom_function:
                return mapping.custom_function(value)
            else:
                raise ValueError(f"دالة مخصصة غير موجودة: {function_name}")
        
        else:
            raise ValueError(f"نوع تحويل غير مدعوم: {mapping.transformation}")
    
    def _convert_data_type(self, value: Any, target_type: Optional[DataType]) -> Any:
        """تحويل نوع البيانات"""
        
        if value is None or target_type is None:
            return value
        
        try:
            if target_type == DataType.STRING:
                return str(value)
            
            elif target_type == DataType.INTEGER:
                return int(float(value)) if value != '' else 0
            
            elif target_type == DataType.FLOAT:
                return float(value) if value != '' else 0.0
            
            elif target_type == DataType.BOOLEAN:
                if isinstance(value, bool):
                    return value
                elif isinstance(value, str):
                    return value.lower() in ['true', '1', 'yes', 'on', 'نعم']
                else:
                    return bool(value)
            
            elif target_type == DataType.DATE:
                return self._parse_date(value).date() if value else None
            
            elif target_type == DataType.DATETIME:
                return self._parse_date(value) if value else None
            
            elif target_type == DataType.LIST:
                if isinstance(value, list):
                    return value
                elif isinstance(value, str):
                    return [item.strip() for item in value.split(',')]
                else:
                    return [value]
            
            elif target_type == DataType.DICT:
                if isinstance(value, dict):
                    return value
                elif isinstance(value, str):
                    return json.loads(value)
                else:
                    return {'value': value}
            
            else:
                return value
                
        except Exception as e:
            logger.warning(f"⚠️ فشل في تحويل نوع البيانات: {e}")
            return value
    
    def _calculate_value(self, record: Dict[str, Any], parameters: Dict[str, Any]) -> Any:
        """حساب قيمة من حقول أخرى"""
        
        formula = parameters.get('formula', '')
        
        # دعم بعض الصيغ الأساسية
        if formula == 'ctr':
            clicks = float(record.get('clicks', 0))
            impressions = float(record.get('impressions', 0))
            return round((clicks / impressions * 100), 2) if impressions > 0 else 0
        
        elif formula == 'cpc':
            cost = float(record.get('cost', 0))
            clicks = float(record.get('clicks', 0))
            return round((cost / clicks), 2) if clicks > 0 else 0
        
        elif formula == 'conversion_rate':
            conversions = float(record.get('conversions', 0))
            clicks = float(record.get('clicks', 0))
            return round((conversions / clicks * 100), 2) if clicks > 0 else 0
        
        elif formula == 'roas':
            conversion_value = float(record.get('conversion_value', 0))
            cost = float(record.get('cost', 0))
            return round((conversion_value / cost), 2) if cost > 0 else 0
        
        else:
            # محاولة تقييم الصيغة كتعبير رياضي بسيط
            try:
                # استبدال أسماء الحقول بقيمها
                expression = formula
                for key, value in record.items():
                    if isinstance(value, (int, float)):
                        expression = expression.replace(f'{{{key}}}', str(value))
                
                # تقييم التعبير (محدود للأمان)
                if re.match(r'^[\d\+\-\*\/\(\)\.\s]+$', expression):
                    return eval(expression)
                else:
                    return 0
                    
            except Exception:
                return 0
    
    def _apply_conditional_transformation(self, value: Any, parameters: Dict[str, Any]) -> Any:
        """تطبيق تحويل شرطي"""
        
        conditions = parameters.get('conditions', [])
        default_value = parameters.get('default', value)
        
        for condition in conditions:
            condition_type = condition.get('type', 'equals')
            condition_value = condition.get('value')
            result_value = condition.get('result', value)
            
            if condition_type == 'equals' and value == condition_value:
                return result_value
            elif condition_type == 'contains' and isinstance(value, str) and condition_value in value:
                return result_value
            elif condition_type == 'greater_than' and isinstance(value, (int, float)) and value > condition_value:
                return result_value
            elif condition_type == 'less_than' and isinstance(value, (int, float)) and value < condition_value:
                return result_value
        
        return default_value
    
    async def _apply_global_transformations(
        self,
        record: Dict[str, Any],
        transformations: Dict[str, Any]
    ) -> Dict[str, Any]:
        """تطبيق التحويلات العامة"""
        
        # إضافة حقول محسوبة عامة
        if 'calculated_fields' in transformations:
            for field_name, formula in transformations['calculated_fields'].items():
                record[field_name] = self._calculate_value(record, {'formula': formula})
        
        # إضافة طوابع زمنية
        if transformations.get('add_timestamp', False):
            record['processed_at'] = datetime.now().isoformat()
        
        # إضافة معرف فريد
        if transformations.get('add_id', False):
            record['id'] = f"{int(datetime.now().timestamp())}_{hash(str(record)) % 10000}"
        
        return record
    
    def _validate_value(self, value: Any, rules: List[str]) -> Dict[str, Any]:
        """التحقق من صحة القيمة"""
        
        for rule in rules:
            if rule == 'required' and (value is None or value == ''):
                return {'valid': False, 'message': 'الحقل مطلوب'}
            
            elif rule == 'email' and value:
                email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                if not re.match(email_pattern, str(value)):
                    return {'valid': False, 'message': 'تنسيق البريد الإلكتروني غير صحيح'}
            
            elif rule == 'phone' and value:
                phone_pattern = r'^[\+]?[1-9][\d]{0,15}$'
                if not re.match(phone_pattern, str(value).replace(' ', '').replace('-', '')):
                    return {'valid': False, 'message': 'تنسيق رقم الهاتف غير صحيح'}
            
            elif rule.startswith('min_length:') and value:
                min_length = int(rule.split(':')[1])
                if len(str(value)) < min_length:
                    return {'valid': False, 'message': f'الطول الأدنى {min_length} أحرف'}
            
            elif rule.startswith('max_length:') and value:
                max_length = int(rule.split(':')[1])
                if len(str(value)) > max_length:
                    return {'valid': False, 'message': f'الطول الأقصى {max_length} أحرف'}
        
        return {'valid': True, 'message': ''}
    
    # دوال التحويل المدمجة
    def _format_phone(self, phone: str) -> str:
        """تنسيق رقم الهاتف"""
        if not phone:
            return ''
        
        # إزالة الأحرف غير الرقمية
        digits = re.sub(r'\D', '', str(phone))
        
        # تنسيق أساسي
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits[0] == '1':
            return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
        else:
            return phone
    
    def _format_email(self, email: str) -> str:
        """تنسيق البريد الإلكتروني"""
        if not email:
            return ''
        return str(email).lower().strip()
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """تحليل التاريخ"""
        if not date_str:
            return None
        
        # صيغ التاريخ المدعومة
        date_formats = [
            '%Y-%m-%d',
            '%Y-%m-%d %H:%M:%S',
            '%d/%m/%Y',
            '%m/%d/%Y',
            '%Y/%m/%d',
            '%d-%m-%Y',
            '%m-%d-%Y'
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(str(date_str), fmt)
            except ValueError:
                continue
        
        return None
    
    def _calculate_ctr(self, data: Dict[str, Any]) -> float:
        """حساب معدل النقر"""
        clicks = float(data.get('clicks', 0))
        impressions = float(data.get('impressions', 0))
        return round((clicks / impressions * 100), 2) if impressions > 0 else 0
    
    def _calculate_cpc(self, data: Dict[str, Any]) -> float:
        """حساب تكلفة النقرة"""
        cost = float(data.get('cost', 0))
        clicks = float(data.get('clicks', 0))
        return round((cost / clicks), 2) if clicks > 0 else 0
    
    def _format_currency(self, amount: Union[int, float]) -> str:
        """تنسيق العملة"""
        if not amount:
            return '$0.00'
        return f"${float(amount):,.2f}"
    
    def _clean_text(self, text: str) -> str:
        """تنظيف النص"""
        if not text:
            return ''
        
        # إزالة المسافات الزائدة
        cleaned = re.sub(r'\s+', ' ', str(text)).strip()
        
        # إزالة الأحرف الخاصة
        cleaned = re.sub(r'[^\w\s\u0600-\u06FF]', '', cleaned)
        
        return cleaned
    
    def _update_average_processing_time(self, processing_time: float):
        """تحديث متوسط وقت المعالجة"""
        current_avg = self.mapping_stats['average_processing_time']
        total_mappings = self.mapping_stats['total_mappings']
        
        if total_mappings == 1:
            self.mapping_stats['average_processing_time'] = processing_time
        else:
            new_avg = ((current_avg * (total_mappings - 1)) + processing_time) / total_mappings
            self.mapping_stats['average_processing_time'] = new_avg
    
    def get_mapping_stats(self) -> Dict[str, Any]:
        """الحصول على إحصائيات التحويل"""
        stats = self.mapping_stats.copy()
        
        if stats['total_mappings'] > 0:
            stats['success_rate'] = (stats['successful_mappings'] / stats['total_mappings']) * 100
        else:
            stats['success_rate'] = 0
        
        return stats
    
    def reset_mapping_stats(self):
        """إعادة تعيين إحصائيات التحويل"""
        self.mapping_stats = {
            'total_mappings': 0,
            'successful_mappings': 0,
            'failed_mappings': 0,
            'total_records_processed': 0,
            'average_processing_time': 0.0
        }
        logger.info("📊 تم إعادة تعيين إحصائيات التحويل")

# دوال مساعدة للاستخدام السريع
def get_data_mapper(mapping_config: Optional[Dict[str, Any]] = None) -> DataMapper:
    """الحصول على مُحول البيانات"""
    return DataMapper(mapping_config=mapping_config)

def create_simple_mapping_schema(
    name: str,
    field_mappings: Dict[str, str]
) -> MappingSchema:
    """إنشاء مخطط ربط بسيط"""
    schema = MappingSchema(name=name)
    
    for source_field, target_field in field_mappings.items():
        mapping = FieldMapping(
            source_field=source_field,
            target_field=target_field,
            transformation=TransformationType.DIRECT
        )
        schema.add_mapping(mapping)
    
    return schema

async def map_data_quick(
    data: Union[Dict[str, Any], List[Dict[str, Any]]],
    field_mappings: Dict[str, str],
    schema_name: str = "quick_mapping"
) -> MappingResult:
    """تحويل سريع للبيانات"""
    mapper = get_data_mapper()
    schema = create_simple_mapping_schema(schema_name, field_mappings)
    mapper.register_schema(schema)
    
    return await mapper.map_data(data, schema_name)

# تصدير الوحدات المهمة
__all__ = [
    'DataMapper',
    'MappingSchema',
    'FieldMapping',
    'MappingResult',
    'DataType',
    'TransformationType',
    'get_data_mapper',
    'create_simple_mapping_schema',
    'map_data_quick'
]

