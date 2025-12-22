#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
📤 Response Models - نماذج الاستجابات
===================================

نماذج شاملة لاستجابات APIs:
- استجابات النجاح والفشل
- أخطاء التحقق والمعالجة
- استجابات مقسمة على صفحات
- استجابات العمليات الجماعية
- استجابات التحليلات والإحصائيات

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
from typing import Dict, Any, List, Optional, Union, Generic, TypeVar
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, field

# استيراد Pydantic إذا كان متاحاً
try:
    from pydantic import BaseModel, Field, validator, root_validator
    from pydantic.generics import GenericModel
    PYDANTIC_AVAILABLE = True
except ImportError:
    from dataclasses import dataclass as BaseModel
    GenericModel = BaseModel
    def Field(*args, **kwargs):
        return field()
    def validator(*args, **kwargs):
        def decorator(func):
            return func
        return decorator
    def root_validator(*args, **kwargs):
        def decorator(func):
            return func
        return decorator
    PYDANTIC_AVAILABLE = False

logger = logging.getLogger(__name__)

# Type variable for generic responses
T = TypeVar('T')

# ==================== Enums ====================

class ResponseStatus(str, Enum):
    """حالة الاستجابة"""
    SUCCESS = "success"                       # نجح
    ERROR = "error"                          # خطأ
    WARNING = "warning"                      # تحذير
    PARTIAL_SUCCESS = "partial_success"      # نجح جزئياً
    PENDING = "pending"                      # في الانتظار
    PROCESSING = "processing"                # قيد المعالجة

class ErrorType(str, Enum):
    """نوع الخطأ"""
    VALIDATION_ERROR = "validation_error"     # خطأ تحقق
    AUTHENTICATION_ERROR = "authentication_error"  # خطأ مصادقة
    AUTHORIZATION_ERROR = "authorization_error"     # خطأ تخويل
    NOT_FOUND_ERROR = "not_found_error"      # غير موجود
    CONFLICT_ERROR = "conflict_error"        # تضارب
    RATE_LIMIT_ERROR = "rate_limit_error"    # تجاوز الحد
    SERVER_ERROR = "server_error"            # خطأ خادم
    NETWORK_ERROR = "network_error"          # خطأ شبكة
    TIMEOUT_ERROR = "timeout_error"          # انتهاء وقت
    BUSINESS_LOGIC_ERROR = "business_logic_error"  # خطأ منطق عمل

class SeverityLevel(str, Enum):
    """مستوى الخطورة"""
    LOW = "low"                              # منخفض
    MEDIUM = "medium"                        # متوسط
    HIGH = "high"                           # عالي
    CRITICAL = "critical"                    # حرج

# ==================== نماذج الأخطاء ====================

class ValidationError(BaseModel):
    """
    ❌ خطأ التحقق من صحة البيانات
    """
    field: str = Field(..., description="اسم الحقل")
    message: str = Field(..., description="رسالة الخطأ")
    code: Optional[str] = Field(None, description="رمز الخطأ")
    value: Optional[Any] = Field(None, description="القيمة المرفوضة")
    constraint: Optional[str] = Field(None, description="القيد المنتهك")
    
    # معلومات إضافية
    field_type: Optional[str] = Field(None, description="نوع الحقل")
    expected_format: Optional[str] = Field(None, description="التنسيق المتوقع")
    suggestions: List[str] = Field(default_factory=list, description="اقتراحات الإصلاح")

class ErrorDetail(BaseModel):
    """
    🔍 تفاصيل الخطأ
    """
    error_type: ErrorType = Field(..., description="نوع الخطأ")
    error_code: str = Field(..., description="رمز الخطأ")
    message: str = Field(..., description="رسالة الخطأ")
    details: Optional[str] = Field(None, description="تفاصيل إضافية")
    
    # معلومات السياق
    context: Dict[str, Any] = Field(default_factory=dict, description="سياق الخطأ")
    stack_trace: Optional[str] = Field(None, description="تتبع المكدس")
    
    # معلومات الإصلاح
    severity: SeverityLevel = Field(SeverityLevel.MEDIUM, description="مستوى الخطورة")
    is_retryable: bool = Field(False, description="قابل للإعادة")
    retry_after: Optional[int] = Field(None, description="إعادة المحاولة بعد (ثواني)")
    
    # اقتراحات الحل
    resolution_steps: List[str] = Field(default_factory=list, description="خطوات الحل")
    documentation_url: Optional[str] = Field(None, description="رابط التوثيق")
    
    # معلومات التوقيت
    timestamp: datetime = Field(default_factory=datetime.now, description="وقت الخطأ")
    request_id: Optional[str] = Field(None, description="معرف الطلب")

# ==================== نماذج الاستجابات الأساسية ====================

class APIResponse(BaseModel):
    """
    📡 استجابة API أساسية
    """
    status: ResponseStatus = Field(..., description="حالة الاستجابة")
    message: str = Field(..., description="رسالة الاستجابة")
    
    # معلومات التوقيت
    timestamp: datetime = Field(default_factory=datetime.now, description="وقت الاستجابة")
    execution_time: Optional[float] = Field(None, description="وقت التنفيذ (ثواني)")
    
    # معلومات الطلب
    request_id: Optional[str] = Field(None, description="معرف الطلب")
    api_version: str = Field("1.0.0", description="إصدار API")
    
    # معلومات إضافية
    metadata: Dict[str, Any] = Field(default_factory=dict, description="بيانات وصفية")
    warnings: List[str] = Field(default_factory=list, description="تحذيرات")

if PYDANTIC_AVAILABLE:
    class SuccessResponse(GenericModel, Generic[T]):
        """
        ✅ استجابة النجاح
        """
        status: ResponseStatus = Field(ResponseStatus.SUCCESS, description="حالة النجاح")
        message: str = Field("تم بنجاح", description="رسالة النجاح")
        data: T = Field(..., description="البيانات المُرجعة")
        
        # إحصائيات
        count: Optional[int] = Field(None, description="عدد العناصر")
        total: Optional[int] = Field(None, description="إجمالي العناصر")
        
        # معلومات التوقيت
        timestamp: datetime = Field(default_factory=datetime.now, description="وقت الاستجابة")
        execution_time: Optional[float] = Field(None, description="وقت التنفيذ")
        
        # معلومات الطلب
        request_id: Optional[str] = Field(None, description="معرف الطلب")
        api_version: str = Field("1.0.0", description="إصدار API")
        
        # معلومات إضافية
        metadata: Dict[str, Any] = Field(default_factory=dict, description="بيانات وصفية")
        links: Dict[str, str] = Field(default_factory=dict, description="روابط ذات صلة")
else:
    class SuccessResponse(BaseModel):
        """استجابة النجاح (بدون Generic)"""
        status: ResponseStatus = Field(ResponseStatus.SUCCESS, description="حالة النجاح")
        message: str = Field("تم بنجاح", description="رسالة النجاح")
        data: Any = Field(..., description="البيانات المُرجعة")
        count: Optional[int] = Field(None, description="عدد العناصر")
        total: Optional[int] = Field(None, description="إجمالي العناصر")
        timestamp: datetime = Field(default_factory=datetime.now, description="وقت الاستجابة")
        execution_time: Optional[float] = Field(None, description="وقت التنفيذ")
        request_id: Optional[str] = Field(None, description="معرف الطلب")
        api_version: str = Field("1.0.0", description="إصدار API")
        metadata: Dict[str, Any] = Field(default_factory=dict, description="بيانات وصفية")
        links: Dict[str, str] = Field(default_factory=dict, description="روابط ذات صلة")

class ErrorResponse(BaseModel):
    """
    ❌ استجابة الخطأ
    """
    status: ResponseStatus = Field(ResponseStatus.ERROR, description="حالة الخطأ")
    message: str = Field(..., description="رسالة الخطأ")
    
    # تفاصيل الأخطاء
    errors: List[ErrorDetail] = Field(default_factory=list, description="تفاصيل الأخطاء")
    validation_errors: List[ValidationError] = Field(default_factory=list, description="أخطاء التحقق")
    
    # معلومات التوقيت
    timestamp: datetime = Field(default_factory=datetime.now, description="وقت الخطأ")
    
    # معلومات الطلب
    request_id: Optional[str] = Field(None, description="معرف الطلب")
    api_version: str = Field("1.0.0", description="إصدار API")
    
    # معلومات الدعم
    support_reference: Optional[str] = Field(None, description="مرجع الدعم")
    documentation_url: Optional[str] = Field(None, description="رابط التوثيق")
    
    # معلومات إضافية
    debug_info: Dict[str, Any] = Field(default_factory=dict, description="معلومات التصحيح")

if PYDANTIC_AVAILABLE:
    class PaginatedResponse(GenericModel, Generic[T]):
        """
        📄 استجابة مقسمة على صفحات
        """
        status: ResponseStatus = Field(ResponseStatus.SUCCESS, description="حالة الاستجابة")
        message: str = Field("تم بنجاح", description="رسالة الاستجابة")
        
        # البيانات
        data: List[T] = Field(..., description="بيانات الصفحة الحالية")
        
        # معلومات التقسيم
        page: int = Field(1, description="رقم الصفحة الحالية")
        page_size: int = Field(20, description="حجم الصفحة")
        total_pages: int = Field(..., description="إجمالي الصفحات")
        total_items: int = Field(..., description="إجمالي العناصر")
        
        # روابط التنقل
        has_next: bool = Field(False, description="يوجد صفحة تالية")
        has_previous: bool = Field(False, description="يوجد صفحة سابقة")
        next_page: Optional[str] = Field(None, description="رابط الصفحة التالية")
        previous_page: Optional[str] = Field(None, description="رابط الصفحة السابقة")
        first_page: Optional[str] = Field(None, description="رابط الصفحة الأولى")
        last_page: Optional[str] = Field(None, description="رابط الصفحة الأخيرة")
        
        # معلومات إضافية
        filters_applied: Dict[str, Any] = Field(default_factory=dict, description="المرشحات المطبقة")
        sort_by: Optional[str] = Field(None, description="ترتيب حسب")
        sort_order: str = Field("asc", description="اتجاه الترتيب")
        
        # معلومات التوقيت
        timestamp: datetime = Field(default_factory=datetime.now, description="وقت الاستجابة")
        execution_time: Optional[float] = Field(None, description="وقت التنفيذ")
        
        # معلومات الطلب
        request_id: Optional[str] = Field(None, description="معرف الطلب")
        api_version: str = Field("1.0.0", description="إصدار API")
else:
    class PaginatedResponse(BaseModel):
        """استجابة مقسمة على صفحات (بدون Generic)"""
        status: ResponseStatus = Field(ResponseStatus.SUCCESS, description="حالة الاستجابة")
        message: str = Field("تم بنجاح", description="رسالة الاستجابة")
        data: List[Any] = Field(..., description="بيانات الصفحة الحالية")
        page: int = Field(1, description="رقم الصفحة الحالية")
        page_size: int = Field(20, description="حجم الصفحة")
        total_pages: int = Field(..., description="إجمالي الصفحات")
        total_items: int = Field(..., description="إجمالي العناصر")
        has_next: bool = Field(False, description="يوجد صفحة تالية")
        has_previous: bool = Field(False, description="يوجد صفحة سابقة")
        next_page: Optional[str] = Field(None, description="رابط الصفحة التالية")
        previous_page: Optional[str] = Field(None, description="رابط الصفحة السابقة")
        first_page: Optional[str] = Field(None, description="رابط الصفحة الأولى")
        last_page: Optional[str] = Field(None, description="رابط الصفحة الأخيرة")
        filters_applied: Dict[str, Any] = Field(default_factory=dict, description="المرشحات المطبقة")
        sort_by: Optional[str] = Field(None, description="ترتيب حسب")
        sort_order: str = Field("asc", description="اتجاه الترتيب")
        timestamp: datetime = Field(default_factory=datetime.now, description="وقت الاستجابة")
        execution_time: Optional[float] = Field(None, description="وقت التنفيذ")
        request_id: Optional[str] = Field(None, description="معرف الطلب")
        api_version: str = Field("1.0.0", description="إصدار API")

# ==================== نماذج العمليات الجماعية ====================

class BulkOperationItem(BaseModel):
    """
    📦 عنصر العملية الجماعية
    """
    item_id: str = Field(..., description="معرف العنصر")
    operation: str = Field(..., description="نوع العملية")
    status: ResponseStatus = Field(..., description="حالة العملية")
    
    # البيانات
    input_data: Optional[Dict[str, Any]] = Field(None, description="البيانات المدخلة")
    output_data: Optional[Dict[str, Any]] = Field(None, description="البيانات المخرجة")
    
    # معلومات النتيجة
    success: bool = Field(..., description="نجحت العملية")
    message: Optional[str] = Field(None, description="رسالة النتيجة")
    
    # تفاصيل الأخطاء
    errors: List[ErrorDetail] = Field(default_factory=list, description="أخطاء العنصر")
    warnings: List[str] = Field(default_factory=list, description="تحذيرات العنصر")
    
    # معلومات التوقيت
    started_at: Optional[datetime] = Field(None, description="وقت البداية")
    completed_at: Optional[datetime] = Field(None, description="وقت الانتهاء")
    execution_time: Optional[float] = Field(None, description="وقت التنفيذ")
    
    # معلومات إضافية
    retry_count: int = Field(0, description="عدد المحاولات")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="بيانات وصفية")

class BulkOperationResponse(BaseModel):
    """
    📊 استجابة العملية الجماعية
    """
    status: ResponseStatus = Field(..., description="حالة العملية الإجمالية")
    message: str = Field(..., description="رسالة العملية")
    
    # معرف العملية
    operation_id: str = Field(..., description="معرف العملية الجماعية")
    operation_type: str = Field(..., description="نوع العملية الجماعية")
    
    # إحصائيات العملية
    total_items: int = Field(..., description="إجمالي العناصر")
    successful_items: int = Field(..., description="العناصر الناجحة")
    failed_items: int = Field(..., description="العناصر الفاشلة")
    skipped_items: int = Field(0, description="العناصر المتجاهلة")
    
    # معدلات النجاح
    success_rate: float = Field(..., description="معدل النجاح")
    
    # تفاصيل العناصر
    items: List[BulkOperationItem] = Field(default_factory=list, description="تفاصيل العناصر")
    
    # ملخص الأخطاء
    error_summary: Dict[str, int] = Field(default_factory=dict, description="ملخص الأخطاء")
    common_errors: List[str] = Field(default_factory=list, description="الأخطاء الشائعة")
    
    # معلومات التوقيت
    started_at: datetime = Field(..., description="وقت بداية العملية")
    completed_at: Optional[datetime] = Field(None, description="وقت انتهاء العملية")
    total_execution_time: Optional[float] = Field(None, description="إجمالي وقت التنفيذ")
    
    # معلومات الطلب
    request_id: Optional[str] = Field(None, description="معرف الطلب")
    api_version: str = Field("1.0.0", description="إصدار API")
    
    # معلومات إضافية
    batch_size: Optional[int] = Field(None, description="حجم الدفعة")
    parallel_processing: bool = Field(False, description="معالجة متوازية")
    
    if PYDANTIC_AVAILABLE:
        @root_validator
        def calculate_success_rate(cls, values):
            total = values.get('total_items', 0)
            successful = values.get('successful_items', 0)
            
            if total > 0:
                values['success_rate'] = (successful / total) * 100
            else:
                values['success_rate'] = 0.0
            
            return values
    
    def get_failed_items(self) -> List[BulkOperationItem]:
        """الحصول على العناصر الفاشلة"""
        return [item for item in self.items if not item.success]
    
    def get_successful_items(self) -> List[BulkOperationItem]:
        """الحصول على العناصر الناجحة"""
        return [item for item in self.items if item.success]

# ==================== نماذج التحليلات ====================

class MetricData(BaseModel):
    """
    📈 بيانات المقياس
    """
    metric_name: str = Field(..., description="اسم المقياس")
    value: Union[int, float, str] = Field(..., description="قيمة المقياس")
    unit: Optional[str] = Field(None, description="وحدة القياس")
    
    # معلومات المقارنة
    previous_value: Optional[Union[int, float]] = Field(None, description="القيمة السابقة")
    change: Optional[float] = Field(None, description="التغيير")
    change_percentage: Optional[float] = Field(None, description="نسبة التغيير")
    
    # معلومات إضافية
    trend: Optional[str] = Field(None, description="الاتجاه")
    benchmark: Optional[Union[int, float]] = Field(None, description="المعيار المرجعي")
    target: Optional[Union[int, float]] = Field(None, description="الهدف")
    
    # فترة القياس
    period: Optional[str] = Field(None, description="فترة القياس")
    measurement_date: Optional[datetime] = Field(None, description="تاريخ القياس")

class AnalyticsResponse(BaseModel):
    """
    📊 استجابة التحليلات
    """
    status: ResponseStatus = Field(ResponseStatus.SUCCESS, description="حالة الاستجابة")
    message: str = Field("تم تحليل البيانات بنجاح", description="رسالة الاستجابة")
    
    # معلومات التحليل
    analysis_id: str = Field(..., description="معرف التحليل")
    analysis_type: str = Field(..., description="نوع التحليل")
    
    # البيانات
    metrics: List[MetricData] = Field(default_factory=list, description="المقاييس")
    summary: Dict[str, Any] = Field(default_factory=dict, description="الملخص")
    insights: List[str] = Field(default_factory=list, description="الرؤى")
    recommendations: List[str] = Field(default_factory=list, description="التوصيات")
    
    # فترة التحليل
    date_range: Dict[str, datetime] = Field(default_factory=dict, description="نطاق التاريخ")
    granularity: str = Field("daily", description="مستوى التفصيل")
    
    # معلومات البيانات
    data_sources: List[str] = Field(default_factory=list, description="مصادر البيانات")
    data_quality: Optional[float] = Field(None, description="جودة البيانات")
    confidence_level: Optional[float] = Field(None, description="مستوى الثقة")
    
    # معلومات التوقيت
    timestamp: datetime = Field(default_factory=datetime.now, description="وقت التحليل")
    execution_time: Optional[float] = Field(None, description="وقت التنفيذ")
    
    # معلومات الطلب
    request_id: Optional[str] = Field(None, description="معرف الطلب")
    api_version: str = Field("1.0.0", description="إصدار API")
    
    # معلومات إضافية
    filters_applied: Dict[str, Any] = Field(default_factory=dict, description="المرشحات المطبقة")
    export_options: Dict[str, str] = Field(default_factory=dict, description="خيارات التصدير")
    
    def get_metric_by_name(self, metric_name: str) -> Optional[MetricData]:
        """الحصول على مقياس بالاسم"""
        for metric in self.metrics:
            if metric.metric_name == metric_name:
                return metric
        return None
    
    def get_top_metrics(self, limit: int = 5) -> List[MetricData]:
        """الحصول على أهم المقاييس"""
        # ترتيب حسب القيمة (افتراضياً)
        sorted_metrics = sorted(
            self.metrics,
            key=lambda m: float(m.value) if isinstance(m.value, (int, float)) else 0,
            reverse=True
        )
        return sorted_metrics[:limit]

# دوال مساعدة لإنشاء الاستجابات
def create_success_response(
    data: Any,
    message: str = "تم بنجاح",
    **kwargs
) -> SuccessResponse:
    """إنشاء استجابة نجاح"""
    return SuccessResponse(
        data=data,
        message=message,
        **kwargs
    )

def create_error_response(
    message: str,
    errors: List[ErrorDetail] = None,
    **kwargs
) -> ErrorResponse:
    """إنشاء استجابة خطأ"""
    return ErrorResponse(
        message=message,
        errors=errors or [],
        **kwargs
    )

def create_validation_error(
    field: str,
    message: str,
    **kwargs
) -> ValidationError:
    """إنشاء خطأ تحقق"""
    return ValidationError(
        field=field,
        message=message,
        **kwargs
    )

def create_paginated_response(
    data: List[Any],
    page: int,
    page_size: int,
    total_items: int,
    **kwargs
) -> PaginatedResponse:
    """إنشاء استجابة مقسمة"""
    total_pages = (total_items + page_size - 1) // page_size
    
    return PaginatedResponse(
        data=data,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        total_items=total_items,
        has_next=page < total_pages,
        has_previous=page > 1,
        **kwargs
    )

# تصدير النماذج
__all__ = [
    # Enums
    "ResponseStatus",
    "ErrorType",
    "SeverityLevel",
    
    # Error Models
    "ValidationError",
    "ErrorDetail",
    
    # Response Models
    "APIResponse",
    "SuccessResponse",
    "ErrorResponse",
    "PaginatedResponse",
    
    # Bulk Operation Models
    "BulkOperationItem",
    "BulkOperationResponse",
    
    # Analytics Models
    "MetricData",
    "AnalyticsResponse",
    
    # Helper functions
    "create_success_response",
    "create_error_response",
    "create_validation_error",
    "create_paginated_response"
]

