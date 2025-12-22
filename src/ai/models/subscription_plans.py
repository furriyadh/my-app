#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
💳 Subscription Plans Models - نماذج خطط الاشتراك
==============================================

نماذج شاملة لخطط الاشتراك والفوترة:
- خطط الاشتراك المختلفة
- إدارة الفوترة والدفع
- تتبع الاستخدام والحدود
- العروض والخصومات
- إحصائيات الاشتراكات

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date, timedelta
from enum import Enum
from dataclasses import dataclass, field
from decimal import Decimal

# استيراد Pydantic إذا كان متاحاً
try:
    from pydantic import BaseModel, Field, validator, root_validator
    PYDANTIC_AVAILABLE = True
except ImportError:
    from dataclasses import dataclass as BaseModel
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

# ==================== Enums ====================

class PlanType(str, Enum):
    """أنواع الخطط"""
    FREE = "free"                            # مجاني
    BASIC = "basic"                          # أساسي
    PROFESSIONAL = "professional"            # احترافي
    ENTERPRISE = "enterprise"                # مؤسسي
    CUSTOM = "custom"                        # مخصص

class BillingCycle(str, Enum):
    """دورة الفوترة"""
    MONTHLY = "monthly"                      # شهري
    QUARTERLY = "quarterly"                  # ربع سنوي
    SEMI_ANNUAL = "semi_annual"              # نصف سنوي
    ANNUAL = "annual"                        # سنوي
    LIFETIME = "lifetime"                    # مدى الحياة

class SubscriptionStatus(str, Enum):
    """حالة الاشتراك"""
    ACTIVE = "active"                        # نشط
    INACTIVE = "inactive"                    # غير نشط
    SUSPENDED = "suspended"                  # معلق
    CANCELLED = "cancelled"                  # ملغي
    EXPIRED = "expired"                      # منتهي الصلاحية
    TRIAL = "trial"                          # تجريبي
    PENDING = "pending"                      # في الانتظار

class PaymentStatus(str, Enum):
    """حالة الدفع"""
    PAID = "paid"                           # مدفوع
    PENDING = "pending"                     # في الانتظار
    FAILED = "failed"                       # فشل
    REFUNDED = "refunded"                   # مسترد
    CANCELLED = "cancelled"                 # ملغي

class Currency(str, Enum):
    """العملات المدعومة"""
    SAR = "SAR"                             # ريال سعودي
    USD = "USD"                             # دولار أمريكي
    EUR = "EUR"                             # يورو
    GBP = "GBP"                             # جنيه إسترليني
    AED = "AED"                             # درهم إماراتي

class FeatureType(str, Enum):
    """أنواع المميزات"""
    CAMPAIGNS = "campaigns"                  # الحملات
    KEYWORDS = "keywords"                    # الكلمات المفتاحية
    ADS = "ads"                             # الإعلانات
    ACCOUNTS = "accounts"                    # الحسابات
    REPORTS = "reports"                      # التقارير
    SUPPORT = "support"                      # الدعم
    API_CALLS = "api_calls"                 # استدعاءات API
    STORAGE = "storage"                      # التخزين

# ==================== نماذج المميزات والحدود ====================

class FeatureLimit(BaseModel):
    """
    🔒 حدود المميزات
    """
    feature_type: FeatureType = Field(..., description="نوع المميزة")
    limit_value: Optional[int] = Field(None, description="قيمة الحد")
    is_unlimited: bool = Field(False, description="غير محدود")
    unit: Optional[str] = Field(None, description="الوحدة")
    
    # الاستخدام الحالي
    current_usage: int = Field(0, description="الاستخدام الحالي")
    usage_percentage: Optional[float] = Field(None, description="نسبة الاستخدام")
    
    # إعدادات إضافية
    reset_period: Optional[str] = Field(None, description="فترة إعادة التعيين")
    overage_allowed: bool = Field(False, description="السماح بالتجاوز")
    overage_cost: Optional[Decimal] = Field(None, description="تكلفة التجاوز")
    
    if PYDANTIC_AVAILABLE:
        @root_validator
        def calculate_usage_percentage(cls, values):
            current_usage = values.get('current_usage', 0)
            limit_value = values.get('limit_value')
            is_unlimited = values.get('is_unlimited', False)
            
            if not is_unlimited and limit_value and limit_value > 0:
                values['usage_percentage'] = (current_usage / limit_value) * 100
            
            return values
    
    def is_limit_exceeded(self) -> bool:
        """التحقق من تجاوز الحد"""
        if self.is_unlimited:
            return False
        if self.limit_value is None:
            return False
        return self.current_usage > self.limit_value
    
    def get_remaining_quota(self) -> Optional[int]:
        """الحصول على الكمية المتبقية"""
        if self.is_unlimited:
            return None
        if self.limit_value is None:
            return None
        return max(0, self.limit_value - self.current_usage)

class PlanFeatures(BaseModel):
    """
    ⭐ مميزات الخطة
    """
    # الحدود الأساسية
    limits: List[FeatureLimit] = Field(default_factory=list, description="حدود المميزات")
    
    # المميزات المتاحة
    available_features: List[str] = Field(default_factory=list, description="المميزات المتاحة")
    premium_features: List[str] = Field(default_factory=list, description="المميزات المتقدمة")
    
    # الدعم
    support_level: str = Field("basic", description="مستوى الدعم")
    support_channels: List[str] = Field(default_factory=list, description="قنوات الدعم")
    response_time: Optional[str] = Field(None, description="وقت الاستجابة")
    
    # API والتكاملات
    api_access: bool = Field(False, description="الوصول لـ API")
    api_rate_limit: Optional[int] = Field(None, description="حد معدل API")
    integrations: List[str] = Field(default_factory=list, description="التكاملات")
    
    # التقارير والتحليلات
    advanced_analytics: bool = Field(False, description="التحليلات المتقدمة")
    custom_reports: bool = Field(False, description="التقارير المخصصة")
    data_export: bool = Field(False, description="تصدير البيانات")
    
    # الأمان والامتثال
    sso_enabled: bool = Field(False, description="تسجيل الدخول الموحد")
    audit_logs: bool = Field(False, description="سجلات المراجعة")
    compliance_features: List[str] = Field(default_factory=list, description="مميزات الامتثال")
    
    def get_feature_limit(self, feature_type: FeatureType) -> Optional[FeatureLimit]:
        """الحصول على حد مميزة معينة"""
        for limit in self.limits:
            if limit.feature_type == feature_type:
                return limit
        return None
    
    def check_feature_availability(self, feature_name: str) -> bool:
        """التحقق من توفر مميزة"""
        return feature_name in self.available_features or feature_name in self.premium_features

class Discount(BaseModel):
    """
    🏷️ الخصم
    """
    # معلومات الخصم
    discount_id: str = Field(..., description="معرف الخصم")
    name: str = Field(..., description="اسم الخصم")
    description: Optional[str] = Field(None, description="وصف الخصم")
    
    # نوع الخصم
    discount_type: str = Field(..., description="نوع الخصم")  # percentage, fixed_amount, free_trial
    discount_value: Decimal = Field(..., description="قيمة الخصم")
    
    # شروط التطبيق
    minimum_amount: Optional[Decimal] = Field(None, description="الحد الأدنى للمبلغ")
    applicable_plans: List[str] = Field(default_factory=list, description="الخطط المطبقة")
    first_time_only: bool = Field(False, description="للمرة الأولى فقط")
    
    # فترة الصلاحية
    valid_from: Optional[datetime] = Field(None, description="صالح من")
    valid_until: Optional[datetime] = Field(None, description="صالح حتى")
    
    # حدود الاستخدام
    usage_limit: Optional[int] = Field(None, description="حد الاستخدام")
    current_usage: int = Field(0, description="الاستخدام الحالي")
    
    # حالة الخصم
    is_active: bool = Field(True, description="نشط")
    
    if PYDANTIC_AVAILABLE:
        @validator('discount_value')
        def validate_discount_value(cls, v, values):
            discount_type = values.get('discount_type')
            if discount_type == 'percentage' and (v < 0 or v > 100):
                raise ValueError('نسبة الخصم يجب أن تكون بين 0 و 100')
            elif v < 0:
                raise ValueError('قيمة الخصم يجب أن تكون موجبة')
            return v
    
    def is_valid(self) -> bool:
        """التحقق من صلاحية الخصم"""
        if not self.is_active:
            return False
        
        now = datetime.now()
        
        if self.valid_from and now < self.valid_from:
            return False
        
        if self.valid_until and now > self.valid_until:
            return False
        
        if self.usage_limit and self.current_usage >= self.usage_limit:
            return False
        
        return True
    
    def calculate_discount_amount(self, original_amount: Decimal) -> Decimal:
        """حساب مبلغ الخصم"""
        if not self.is_valid():
            return Decimal('0')
        
        if self.minimum_amount and original_amount < self.minimum_amount:
            return Decimal('0')
        
        if self.discount_type == 'percentage':
            return original_amount * (self.discount_value / 100)
        elif self.discount_type == 'fixed_amount':
            return min(self.discount_value, original_amount)
        
        return Decimal('0')

# ==================== نماذج الخطط ====================

class SubscriptionPlan(BaseModel):
    """
    📋 خطة الاشتراك
    """
    # معلومات أساسية
    plan_id: str = Field(..., description="معرف الخطة")
    name: str = Field(..., description="اسم الخطة")
    description: Optional[str] = Field(None, description="وصف الخطة")
    plan_type: PlanType = Field(..., description="نوع الخطة")
    
    # التسعير
    price: Decimal = Field(..., description="السعر")
    currency: Currency = Field(Currency.SAR, description="العملة")
    billing_cycle: BillingCycle = Field(..., description="دورة الفوترة")
    
    # المميزات
    features: PlanFeatures = Field(default_factory=PlanFeatures, description="مميزات الخطة")
    
    # الخصومات المتاحة
    available_discounts: List[str] = Field(default_factory=list, description="الخصومات المتاحة")
    
    # إعدادات الخطة
    is_active: bool = Field(True, description="نشط")
    is_popular: bool = Field(False, description="شائع")
    is_recommended: bool = Field(False, description="موصى به")
    
    # فترة تجريبية
    trial_period_days: Optional[int] = Field(None, description="فترة تجريبية (أيام)")
    trial_price: Optional[Decimal] = Field(None, description="سعر الفترة التجريبية")
    
    # معلومات إضافية
    setup_fee: Optional[Decimal] = Field(None, description="رسوم الإعداد")
    cancellation_fee: Optional[Decimal] = Field(None, description="رسوم الإلغاء")
    
    # تواريخ
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    updated_at: Optional[datetime] = Field(None, description="تاريخ آخر تحديث")
    
    if PYDANTIC_AVAILABLE:
        @validator('price')
        def validate_price(cls, v):
            if v < 0:
                raise ValueError('السعر يجب أن يكون موجباً')
            return v
    
    def get_monthly_price(self) -> Decimal:
        """الحصول على السعر الشهري"""
        if self.billing_cycle == BillingCycle.MONTHLY:
            return self.price
        elif self.billing_cycle == BillingCycle.QUARTERLY:
            return self.price / 3
        elif self.billing_cycle == BillingCycle.SEMI_ANNUAL:
            return self.price / 6
        elif self.billing_cycle == BillingCycle.ANNUAL:
            return self.price / 12
        else:
            return self.price
    
    def calculate_total_cost(self, months: int, discount: Optional[Discount] = None) -> Dict[str, Decimal]:
        """حساب التكلفة الإجمالية"""
        monthly_price = self.get_monthly_price()
        subtotal = monthly_price * months
        
        # إضافة رسوم الإعداد
        setup_cost = self.setup_fee or Decimal('0')
        
        # حساب الخصم
        discount_amount = Decimal('0')
        if discount and discount.is_valid():
            discount_amount = discount.calculate_discount_amount(subtotal)
        
        total = subtotal + setup_cost - discount_amount
        
        return {
            "subtotal": subtotal,
            "setup_fee": setup_cost,
            "discount_amount": discount_amount,
            "total": total,
            "monthly_equivalent": total / months if months > 0 else total
        }

class Subscription(BaseModel):
    """
    📝 الاشتراك
    """
    # معلومات أساسية
    subscription_id: str = Field(..., description="معرف الاشتراك")
    customer_id: str = Field(..., description="معرف العميل")
    plan_id: str = Field(..., description="معرف الخطة")
    
    # حالة الاشتراك
    status: SubscriptionStatus = Field(..., description="حالة الاشتراك")
    
    # تواريخ مهمة
    start_date: date = Field(..., description="تاريخ البداية")
    end_date: Optional[date] = Field(None, description="تاريخ النهاية")
    next_billing_date: Optional[date] = Field(None, description="تاريخ الفوترة التالي")
    trial_end_date: Optional[date] = Field(None, description="تاريخ انتهاء التجربة")
    
    # التسعير والفوترة
    current_price: Decimal = Field(..., description="السعر الحالي")
    currency: Currency = Field(Currency.SAR, description="العملة")
    billing_cycle: BillingCycle = Field(..., description="دورة الفوترة")
    
    # الخصومات المطبقة
    applied_discounts: List[str] = Field(default_factory=list, description="الخصومات المطبقة")
    
    # الاستخدام
    usage_data: Dict[str, Any] = Field(default_factory=dict, description="بيانات الاستخدام")
    
    # إعدادات التجديد
    auto_renewal: bool = Field(True, description="التجديد التلقائي")
    renewal_reminder_sent: bool = Field(False, description="تم إرسال تذكير التجديد")
    
    # معلومات الإلغاء
    cancellation_date: Optional[date] = Field(None, description="تاريخ الإلغاء")
    cancellation_reason: Optional[str] = Field(None, description="سبب الإلغاء")
    
    # تواريخ النظام
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    updated_at: Optional[datetime] = Field(None, description="تاريخ آخر تحديث")
    
    if PYDANTIC_AVAILABLE:
        @root_validator
        def validate_dates(cls, values):
            start_date = values.get('start_date')
            end_date = values.get('end_date')
            
            if start_date and end_date and start_date > end_date:
                raise ValueError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية')
            
            return values
    
    def is_active(self) -> bool:
        """التحقق من نشاط الاشتراك"""
        return self.status == SubscriptionStatus.ACTIVE
    
    def is_trial(self) -> bool:
        """التحقق من كون الاشتراك تجريبي"""
        return self.status == SubscriptionStatus.TRIAL
    
    def days_until_expiry(self) -> Optional[int]:
        """عدد الأيام حتى انتهاء الصلاحية"""
        if not self.end_date:
            return None
        
        today = date.today()
        if self.end_date <= today:
            return 0
        
        return (self.end_date - today).days
    
    def calculate_prorated_amount(self, new_plan_price: Decimal, change_date: date) -> Decimal:
        """حساب المبلغ المتناسب عند تغيير الخطة"""
        if not self.next_billing_date:
            return new_plan_price
        
        # حساب الأيام المتبقية
        days_remaining = (self.next_billing_date - change_date).days
        
        # حساب إجمالي أيام دورة الفوترة
        if self.billing_cycle == BillingCycle.MONTHLY:
            total_days = 30
        elif self.billing_cycle == BillingCycle.QUARTERLY:
            total_days = 90
        elif self.billing_cycle == BillingCycle.ANNUAL:
            total_days = 365
        else:
            total_days = 30
        
        # حساب المبلغ المتناسب
        prorated_amount = new_plan_price * (days_remaining / total_days)
        return prorated_amount

class Payment(BaseModel):
    """
    💳 الدفعة
    """
    # معلومات أساسية
    payment_id: str = Field(..., description="معرف الدفعة")
    subscription_id: str = Field(..., description="معرف الاشتراك")
    customer_id: str = Field(..., description="معرف العميل")
    
    # تفاصيل الدفعة
    amount: Decimal = Field(..., description="المبلغ")
    currency: Currency = Field(Currency.SAR, description="العملة")
    payment_method: str = Field(..., description="طريقة الدفع")
    
    # حالة الدفعة
    status: PaymentStatus = Field(..., description="حالة الدفعة")
    
    # تواريخ
    payment_date: datetime = Field(default_factory=datetime.now, description="تاريخ الدفع")
    due_date: Optional[date] = Field(None, description="تاريخ الاستحقاق")
    
    # معلومات الفاتورة
    invoice_id: Optional[str] = Field(None, description="معرف الفاتورة")
    billing_period_start: Optional[date] = Field(None, description="بداية فترة الفوترة")
    billing_period_end: Optional[date] = Field(None, description="نهاية فترة الفوترة")
    
    # تفاصيل إضافية
    transaction_id: Optional[str] = Field(None, description="معرف المعاملة")
    gateway_response: Optional[Dict[str, Any]] = Field(None, description="استجابة البوابة")
    
    # معلومات الاسترداد
    refund_amount: Optional[Decimal] = Field(None, description="مبلغ الاسترداد")
    refund_date: Optional[datetime] = Field(None, description="تاريخ الاسترداد")
    refund_reason: Optional[str] = Field(None, description="سبب الاسترداد")
    
    # ملاحظات
    notes: Optional[str] = Field(None, description="ملاحظات")
    
    def is_successful(self) -> bool:
        """التحقق من نجاح الدفعة"""
        return self.status == PaymentStatus.PAID
    
    def is_overdue(self) -> bool:
        """التحقق من تأخر الدفعة"""
        if not self.due_date:
            return False
        return date.today() > self.due_date and self.status == PaymentStatus.PENDING

# ==================== نماذج الإحصائيات ====================

class SubscriptionAnalytics(BaseModel):
    """
    📊 إحصائيات الاشتراكات
    """
    # فترة التقرير
    period_start: date = Field(..., description="بداية الفترة")
    period_end: date = Field(..., description="نهاية الفترة")
    
    # إحصائيات الاشتراكات
    total_subscriptions: int = Field(0, description="إجمالي الاشتراكات")
    active_subscriptions: int = Field(0, description="الاشتراكات النشطة")
    trial_subscriptions: int = Field(0, description="الاشتراكات التجريبية")
    cancelled_subscriptions: int = Field(0, description="الاشتراكات الملغية")
    
    # إحصائيات الإيرادات
    total_revenue: Decimal = Field(Decimal('0'), description="إجمالي الإيرادات")
    monthly_recurring_revenue: Decimal = Field(Decimal('0'), description="الإيرادات الشهرية المتكررة")
    average_revenue_per_user: Decimal = Field(Decimal('0'), description="متوسط الإيرادات لكل مستخدم")
    
    # معدلات التحويل
    trial_to_paid_conversion_rate: Optional[float] = Field(None, description="معدل تحويل التجربة للمدفوع")
    churn_rate: Optional[float] = Field(None, description="معدل الإلغاء")
    retention_rate: Optional[float] = Field(None, description="معدل الاحتفاظ")
    
    # توزيع الخطط
    plan_distribution: Dict[str, int] = Field(default_factory=dict, description="توزيع الخطط")
    
    # النمو
    growth_rate: Optional[float] = Field(None, description="معدل النمو")
    new_subscriptions: int = Field(0, description="الاشتراكات الجديدة")
    
    # معلومات إضافية
    generated_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")

# دوال مساعدة
def create_subscription_plan(
    plan_id: str,
    name: str,
    plan_type: PlanType,
    price: Decimal,
    billing_cycle: BillingCycle,
    **kwargs
) -> SubscriptionPlan:
    """إنشاء خطة اشتراك جديدة"""
    return SubscriptionPlan(
        plan_id=plan_id,
        name=name,
        plan_type=plan_type,
        price=price,
        billing_cycle=billing_cycle,
        **kwargs
    )

def create_subscription(
    subscription_id: str,
    customer_id: str,
    plan_id: str,
    current_price: Decimal,
    **kwargs
) -> Subscription:
    """إنشاء اشتراك جديد"""
    return Subscription(
        subscription_id=subscription_id,
        customer_id=customer_id,
        plan_id=plan_id,
        current_price=current_price,
        start_date=date.today(),
        status=SubscriptionStatus.ACTIVE,
        **kwargs
    )

def create_payment(
    payment_id: str,
    subscription_id: str,
    customer_id: str,
    amount: Decimal,
    payment_method: str,
    **kwargs
) -> Payment:
    """إنشاء دفعة جديدة"""
    return Payment(
        payment_id=payment_id,
        subscription_id=subscription_id,
        customer_id=customer_id,
        amount=amount,
        payment_method=payment_method,
        status=PaymentStatus.PENDING,
        **kwargs
    )

def calculate_subscription_metrics(subscriptions: List[Subscription]) -> Dict[str, Any]:
    """حساب مقاييس الاشتراكات"""
    total = len(subscriptions)
    active = len([s for s in subscriptions if s.is_active()])
    trial = len([s for s in subscriptions if s.is_trial()])
    
    total_revenue = sum(s.current_price for s in subscriptions if s.is_active())
    
    return {
        "total_subscriptions": total,
        "active_subscriptions": active,
        "trial_subscriptions": trial,
        "total_revenue": total_revenue,
        "average_revenue_per_user": total_revenue / active if active > 0 else Decimal('0')
    }

# تصدير النماذج
__all__ = [
    # Enums
    "PlanType",
    "BillingCycle",
    "SubscriptionStatus",
    "PaymentStatus",
    "Currency",
    "FeatureType",
    
    # Models
    "FeatureLimit",
    "PlanFeatures",
    "Discount",
    "SubscriptionPlan",
    "Subscription",
    "Payment",
    "SubscriptionAnalytics",
    
    # Helper functions
    "create_subscription_plan",
    "create_subscription",
    "create_payment",
    "calculate_subscription_metrics"
]

