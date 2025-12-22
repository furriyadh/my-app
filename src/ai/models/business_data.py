#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🏢 Business Data Models - نماذج بيانات الأعمال
============================================

نماذج شاملة لبيانات الأعمال والشركات:
- معلومات الشركة الأساسية
- بيانات الاتصال والموقع
- مقاييس الأداء والنمو
- تحليل السوق والمنافسين
- بيانات الصناعة والقطاع
- ملفات تعريف المنافسين

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date
from enum import Enum
from dataclasses import dataclass, field

# استيراد Pydantic إذا كان متاحاً
try:
    from pydantic import BaseModel, Field, validator, root_validator
    PYDANTIC_AVAILABLE = True
except ImportError:
    # استخدام dataclasses كبديل
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

class BusinessType(str, Enum):
    """أنواع الأعمال"""
    ECOMMERCE = "ecommerce"                    # التجارة الإلكترونية
    RETAIL = "retail"                          # التجارة التقليدية
    SERVICES = "services"                      # الخدمات
    MANUFACTURING = "manufacturing"            # التصنيع
    TECHNOLOGY = "technology"                  # التكنولوجيا
    HEALTHCARE = "healthcare"                  # الرعاية الصحية
    EDUCATION = "education"                    # التعليم
    FINANCE = "finance"                        # المالية
    REAL_ESTATE = "real_estate"               # العقارات
    FOOD_BEVERAGE = "food_beverage"           # الأغذية والمشروبات
    TRAVEL_TOURISM = "travel_tourism"         # السفر والسياحة
    AUTOMOTIVE = "automotive"                  # السيارات
    FASHION = "fashion"                        # الأزياء
    ENTERTAINMENT = "entertainment"            # الترفيه
    NON_PROFIT = "non_profit"                 # غير ربحي
    OTHER = "other"                           # أخرى

class BusinessSize(str, Enum):
    """أحجام الأعمال"""
    STARTUP = "startup"                        # ناشئة (1-10 موظفين)
    SMALL = "small"                           # صغيرة (11-50 موظف)
    MEDIUM = "medium"                         # متوسطة (51-250 موظف)
    LARGE = "large"                           # كبيرة (251-1000 موظف)
    ENTERPRISE = "enterprise"                 # مؤسسية (1000+ موظف)

class MarketPosition(str, Enum):
    """المركز في السوق"""
    LEADER = "leader"                         # رائد السوق
    CHALLENGER = "challenger"                 # منافس قوي
    FOLLOWER = "follower"                     # تابع
    NICHE = "niche"                          # متخصص في مجال ضيق
    NEW_ENTRANT = "new_entrant"              # داخل جديد

class GrowthStage(str, Enum):
    """مرحلة النمو"""
    STARTUP = "startup"                       # بداية
    GROWTH = "growth"                         # نمو
    MATURITY = "maturity"                     # نضج
    DECLINE = "decline"                       # تراجع
    TRANSFORMATION = "transformation"         # تحول

# ==================== نماذج البيانات الأساسية ====================

class ContactInfo(BaseModel):
    """
    📞 معلومات الاتصال
    """
    email: Optional[str] = Field(None, description="البريد الإلكتروني")
    phone: Optional[str] = Field(None, description="رقم الهاتف")
    mobile: Optional[str] = Field(None, description="رقم الجوال")
    fax: Optional[str] = Field(None, description="رقم الفاكس")
    website: Optional[str] = Field(None, description="الموقع الإلكتروني")
    
    # وسائل التواصل الاجتماعي
    facebook: Optional[str] = Field(None, description="صفحة فيسبوك")
    twitter: Optional[str] = Field(None, description="حساب تويتر")
    linkedin: Optional[str] = Field(None, description="صفحة لينكد إن")
    instagram: Optional[str] = Field(None, description="حساب إنستغرام")
    youtube: Optional[str] = Field(None, description="قناة يوتيوب")
    
    # عنوان الشركة
    address_line1: Optional[str] = Field(None, description="العنوان الأول")
    address_line2: Optional[str] = Field(None, description="العنوان الثاني")
    city: Optional[str] = Field(None, description="المدينة")
    state: Optional[str] = Field(None, description="المنطقة/الولاية")
    postal_code: Optional[str] = Field(None, description="الرمز البريدي")
    country: Optional[str] = Field(None, description="الدولة")
    
    # إحداثيات جغرافية
    latitude: Optional[float] = Field(None, description="خط العرض")
    longitude: Optional[float] = Field(None, description="خط الطول")
    
    if PYDANTIC_AVAILABLE:
        @validator('email')
        def validate_email(cls, v):
            if v and '@' not in v:
                raise ValueError('بريد إلكتروني غير صحيح')
            return v
        
        @validator('website')
        def validate_website(cls, v):
            if v and not v.startswith(('http://', 'https://')):
                return f'https://{v}'
            return v

class BusinessProfile(BaseModel):
    """
    🏢 ملف تعريف الشركة
    """
    # معلومات أساسية
    business_name: str = Field(..., description="اسم الشركة")
    legal_name: Optional[str] = Field(None, description="الاسم القانوني")
    brand_name: Optional[str] = Field(None, description="اسم العلامة التجارية")
    business_type: BusinessType = Field(BusinessType.OTHER, description="نوع النشاط")
    business_size: BusinessSize = Field(BusinessSize.SMALL, description="حجم الشركة")
    
    # تواريخ مهمة
    founded_date: Optional[date] = Field(None, description="تاريخ التأسيس")
    registration_date: Optional[date] = Field(None, description="تاريخ التسجيل")
    
    # أرقام تسجيل
    registration_number: Optional[str] = Field(None, description="رقم السجل التجاري")
    tax_id: Optional[str] = Field(None, description="الرقم الضريبي")
    vat_number: Optional[str] = Field(None, description="رقم ضريبة القيمة المضافة")
    
    # وصف الشركة
    description: Optional[str] = Field(None, description="وصف الشركة")
    mission: Optional[str] = Field(None, description="رسالة الشركة")
    vision: Optional[str] = Field(None, description="رؤية الشركة")
    values: List[str] = Field(default_factory=list, description="قيم الشركة")
    
    # معلومات الصناعة
    industry: Optional[str] = Field(None, description="الصناعة")
    sub_industry: Optional[str] = Field(None, description="الصناعة الفرعية")
    industry_codes: List[str] = Field(default_factory=list, description="رموز الصناعة")
    
    # معلومات الموظفين
    employee_count: Optional[int] = Field(None, description="عدد الموظفين")
    employee_count_range: Optional[str] = Field(None, description="نطاق عدد الموظفين")
    
    # معلومات مالية
    annual_revenue: Optional[float] = Field(None, description="الإيرادات السنوية")
    revenue_currency: str = Field("SAR", description="عملة الإيرادات")
    
    # معلومات الاتصال
    contact_info: ContactInfo = Field(default_factory=ContactInfo, description="معلومات الاتصال")
    
    # معلومات إضافية
    languages: List[str] = Field(default_factory=list, description="اللغات المدعومة")
    certifications: List[str] = Field(default_factory=list, description="الشهادات والاعتمادات")
    awards: List[str] = Field(default_factory=list, description="الجوائز")
    
    # حالة النشاط
    is_active: bool = Field(True, description="نشط")
    status: str = Field("active", description="حالة الشركة")
    
    if PYDANTIC_AVAILABLE:
        @validator('business_name')
        def validate_business_name(cls, v):
            if not v or len(v.strip()) < 2:
                raise ValueError('اسم الشركة يجب أن يكون على الأقل حرفين')
            return v.strip()
        
        @validator('employee_count')
        def validate_employee_count(cls, v):
            if v is not None and v < 0:
                raise ValueError('عدد الموظفين لا يمكن أن يكون سالباً')
            return v

class BusinessMetrics(BaseModel):
    """
    📊 مقاييس الأداء التجاري
    """
    # مقاييس مالية
    revenue: Optional[float] = Field(None, description="الإيرادات")
    profit: Optional[float] = Field(None, description="الربح")
    profit_margin: Optional[float] = Field(None, description="هامش الربح")
    gross_margin: Optional[float] = Field(None, description="الهامش الإجمالي")
    
    # مقاييس النمو
    revenue_growth: Optional[float] = Field(None, description="نمو الإيرادات")
    customer_growth: Optional[float] = Field(None, description="نمو العملاء")
    market_share: Optional[float] = Field(None, description="حصة السوق")
    
    # مقاييس العملاء
    total_customers: Optional[int] = Field(None, description="إجمالي العملاء")
    active_customers: Optional[int] = Field(None, description="العملاء النشطين")
    new_customers: Optional[int] = Field(None, description="العملاء الجدد")
    customer_retention_rate: Optional[float] = Field(None, description="معدل الاحتفاظ بالعملاء")
    customer_lifetime_value: Optional[float] = Field(None, description="القيمة الدائمة للعميل")
    customer_acquisition_cost: Optional[float] = Field(None, description="تكلفة اكتساب العميل")
    
    # مقاييس التشغيل
    conversion_rate: Optional[float] = Field(None, description="معدل التحويل")
    average_order_value: Optional[float] = Field(None, description="متوسط قيمة الطلب")
    order_frequency: Optional[float] = Field(None, description="تكرار الطلبات")
    
    # مقاييس الموقع الإلكتروني
    website_traffic: Optional[int] = Field(None, description="زوار الموقع")
    bounce_rate: Optional[float] = Field(None, description="معدل الارتداد")
    session_duration: Optional[float] = Field(None, description="مدة الجلسة")
    page_views: Optional[int] = Field(None, description="مشاهدات الصفحة")
    
    # مقاييس وسائل التواصل الاجتماعي
    social_followers: Optional[int] = Field(None, description="متابعين وسائل التواصل")
    social_engagement: Optional[float] = Field(None, description="معدل التفاعل")
    
    # مقاييس الموظفين
    employee_satisfaction: Optional[float] = Field(None, description="رضا الموظفين")
    employee_turnover: Optional[float] = Field(None, description="معدل دوران الموظفين")
    
    # فترة القياس
    measurement_period: Optional[str] = Field(None, description="فترة القياس")
    measurement_date: Optional[datetime] = Field(None, description="تاريخ القياس")
    
    if PYDANTIC_AVAILABLE:
        @validator('profit_margin', 'gross_margin', 'customer_retention_rate', 'conversion_rate', 'bounce_rate')
        def validate_percentage(cls, v):
            if v is not None and (v < 0 or v > 100):
                raise ValueError('النسبة المئوية يجب أن تكون بين 0 و 100')
            return v

class MarketAnalysis(BaseModel):
    """
    📈 تحليل السوق
    """
    # معلومات السوق العامة
    market_name: str = Field(..., description="اسم السوق")
    market_size: Optional[float] = Field(None, description="حجم السوق")
    market_size_currency: str = Field("SAR", description="عملة حجم السوق")
    market_growth_rate: Optional[float] = Field(None, description="معدل نمو السوق")
    
    # تحليل المنافسة
    competition_level: str = Field("medium", description="مستوى المنافسة")
    number_of_competitors: Optional[int] = Field(None, description="عدد المنافسين")
    market_concentration: Optional[str] = Field(None, description="تركز السوق")
    
    # اتجاهات السوق
    market_trends: List[str] = Field(default_factory=list, description="اتجاهات السوق")
    growth_drivers: List[str] = Field(default_factory=list, description="محركات النمو")
    market_challenges: List[str] = Field(default_factory=list, description="تحديات السوق")
    
    # الفرص والتهديدات
    opportunities: List[str] = Field(default_factory=list, description="الفرص")
    threats: List[str] = Field(default_factory=list, description="التهديدات")
    
    # العوامل الخارجية
    economic_factors: List[str] = Field(default_factory=list, description="العوامل الاقتصادية")
    regulatory_factors: List[str] = Field(default_factory=list, description="العوامل التنظيمية")
    technological_factors: List[str] = Field(default_factory=list, description="العوامل التكنولوجية")
    
    # الجمهور المستهدف
    target_demographics: Dict[str, Any] = Field(default_factory=dict, description="الديموغرافيا المستهدفة")
    customer_segments: List[str] = Field(default_factory=list, description="شرائح العملاء")
    
    # تحليل الأسعار
    average_price_point: Optional[float] = Field(None, description="متوسط نقطة السعر")
    price_sensitivity: Optional[str] = Field(None, description="حساسية السعر")
    pricing_strategies: List[str] = Field(default_factory=list, description="استراتيجيات التسعير")
    
    # معلومات إضافية
    analysis_date: Optional[datetime] = Field(None, description="تاريخ التحليل")
    data_sources: List[str] = Field(default_factory=list, description="مصادر البيانات")
    confidence_level: Optional[float] = Field(None, description="مستوى الثقة")

class CompetitorProfile(BaseModel):
    """
    🏆 ملف تعريف المنافس
    """
    # معلومات أساسية
    competitor_name: str = Field(..., description="اسم المنافس")
    website: Optional[str] = Field(None, description="موقع المنافس")
    business_type: Optional[BusinessType] = Field(None, description="نوع النشاط")
    business_size: Optional[BusinessSize] = Field(None, description="حجم الشركة")
    
    # المركز في السوق
    market_position: MarketPosition = Field(MarketPosition.FOLLOWER, description="المركز في السوق")
    market_share: Optional[float] = Field(None, description="حصة السوق")
    
    # معلومات مالية
    estimated_revenue: Optional[float] = Field(None, description="الإيرادات المقدرة")
    funding_raised: Optional[float] = Field(None, description="التمويل المحصل عليه")
    valuation: Optional[float] = Field(None, description="التقييم")
    
    # المنتجات والخدمات
    products_services: List[str] = Field(default_factory=list, description="المنتجات والخدمات")
    key_features: List[str] = Field(default_factory=list, description="المميزات الرئيسية")
    unique_selling_points: List[str] = Field(default_factory=list, description="نقاط البيع الفريدة")
    
    # استراتيجية التسويق
    marketing_channels: List[str] = Field(default_factory=list, description="قنوات التسويق")
    advertising_spend: Optional[float] = Field(None, description="إنفاق الإعلان")
    brand_awareness: Optional[float] = Field(None, description="الوعي بالعلامة التجارية")
    
    # نقاط القوة والضعف
    strengths: List[str] = Field(default_factory=list, description="نقاط القوة")
    weaknesses: List[str] = Field(default_factory=list, description="نقاط الضعف")
    
    # الأداء الرقمي
    website_traffic: Optional[int] = Field(None, description="زوار الموقع")
    social_media_followers: Optional[int] = Field(None, description="متابعين وسائل التواصل")
    online_reviews_rating: Optional[float] = Field(None, description="تقييم المراجعات")
    
    # معلومات إضافية
    founded_year: Optional[int] = Field(None, description="سنة التأسيس")
    headquarters: Optional[str] = Field(None, description="المقر الرئيسي")
    key_executives: List[str] = Field(default_factory=list, description="المديرين التنفيذيين")
    
    # تحليل التنافس
    threat_level: str = Field("medium", description="مستوى التهديد")
    competitive_advantage: List[str] = Field(default_factory=list, description="الميزة التنافسية")
    
    # تاريخ التحليل
    analysis_date: Optional[datetime] = Field(None, description="تاريخ التحليل")
    last_updated: Optional[datetime] = Field(None, description="آخر تحديث")

class IndustryData(BaseModel):
    """
    🏭 بيانات الصناعة
    """
    # معلومات الصناعة
    industry_name: str = Field(..., description="اسم الصناعة")
    industry_code: Optional[str] = Field(None, description="رمز الصناعة")
    sub_industries: List[str] = Field(default_factory=list, description="الصناعات الفرعية")
    
    # إحصائيات الصناعة
    total_market_size: Optional[float] = Field(None, description="حجم السوق الإجمالي")
    annual_growth_rate: Optional[float] = Field(None, description="معدل النمو السنوي")
    number_of_companies: Optional[int] = Field(None, description="عدد الشركات")
    total_employment: Optional[int] = Field(None, description="إجمالي التوظيف")
    
    # الشركات الرائدة
    market_leaders: List[str] = Field(default_factory=list, description="الشركات الرائدة")
    top_companies_market_share: Dict[str, float] = Field(default_factory=dict, description="حصة الشركات الكبرى")
    
    # اتجاهات الصناعة
    industry_trends: List[str] = Field(default_factory=list, description="اتجاهات الصناعة")
    emerging_technologies: List[str] = Field(default_factory=list, description="التقنيات الناشئة")
    disruption_factors: List[str] = Field(default_factory=list, description="عوامل التغيير")
    
    # التحديات والفرص
    key_challenges: List[str] = Field(default_factory=list, description="التحديات الرئيسية")
    growth_opportunities: List[str] = Field(default_factory=list, description="فرص النمو")
    
    # العوامل التنظيمية
    regulatory_environment: str = Field("moderate", description="البيئة التنظيمية")
    key_regulations: List[str] = Field(default_factory=list, description="اللوائح الرئيسية")
    compliance_requirements: List[str] = Field(default_factory=list, description="متطلبات الامتثال")
    
    # مقاييس الأداء
    average_profit_margin: Optional[float] = Field(None, description="متوسط هامش الربح")
    average_revenue_per_employee: Optional[float] = Field(None, description="متوسط الإيرادات لكل موظف")
    customer_acquisition_cost: Optional[float] = Field(None, description="تكلفة اكتساب العميل")
    
    # معلومات جغرافية
    geographic_concentration: List[str] = Field(default_factory=list, description="التركز الجغرافي")
    international_presence: bool = Field(False, description="وجود دولي")
    
    # تاريخ البيانات
    data_year: Optional[int] = Field(None, description="سنة البيانات")
    last_updated: Optional[datetime] = Field(None, description="آخر تحديث")
    data_sources: List[str] = Field(default_factory=list, description="مصادر البيانات")

class BusinessData(BaseModel):
    """
    🏢 بيانات الأعمال الشاملة
    
    نموذج شامل يجمع جميع بيانات الأعمال في مكان واحد
    """
    # المعرف الفريد
    business_id: str = Field(..., description="معرف الشركة الفريد")
    
    # الملف التعريفي
    profile: BusinessProfile = Field(..., description="ملف تعريف الشركة")
    
    # مقاييس الأداء
    metrics: Optional[BusinessMetrics] = Field(None, description="مقاييس الأداء")
    
    # تحليل السوق
    market_analysis: Optional[MarketAnalysis] = Field(None, description="تحليل السوق")
    
    # المنافسين
    competitors: List[CompetitorProfile] = Field(default_factory=list, description="المنافسين")
    
    # بيانات الصناعة
    industry_data: Optional[IndustryData] = Field(None, description="بيانات الصناعة")
    
    # مرحلة النمو
    growth_stage: GrowthStage = Field(GrowthStage.GROWTH, description="مرحلة النمو")
    
    # الأهداف التجارية
    business_goals: List[str] = Field(default_factory=list, description="الأهداف التجارية")
    target_markets: List[str] = Field(default_factory=list, description="الأسواق المستهدفة")
    
    # معلومات إضافية
    swot_analysis: Dict[str, List[str]] = Field(default_factory=dict, description="تحليل SWOT")
    key_success_factors: List[str] = Field(default_factory=list, description="عوامل النجاح الرئيسية")
    
    # تواريخ مهمة
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    updated_at: Optional[datetime] = Field(None, description="تاريخ آخر تحديث")
    
    # حالة البيانات
    data_completeness: Optional[float] = Field(None, description="اكتمال البيانات")
    data_quality_score: Optional[float] = Field(None, description="نقاط جودة البيانات")
    
    if PYDANTIC_AVAILABLE:
        @root_validator
        def validate_business_data(cls, values):
            # التحقق من اكتمال البيانات الأساسية
            profile = values.get('profile')
            if profile and not profile.business_name:
                raise ValueError('اسم الشركة مطلوب')
            
            # حساب اكتمال البيانات
            completeness_score = 0
            total_fields = 6
            
            if profile:
                completeness_score += 1
            if values.get('metrics'):
                completeness_score += 1
            if values.get('market_analysis'):
                completeness_score += 1
            if values.get('competitors'):
                completeness_score += 1
            if values.get('industry_data'):
                completeness_score += 1
            if values.get('business_goals'):
                completeness_score += 1
            
            values['data_completeness'] = (completeness_score / total_fields) * 100
            
            return values
    
    def get_summary(self) -> Dict[str, Any]:
        """الحصول على ملخص بيانات الشركة"""
        return {
            "business_id": self.business_id,
            "business_name": self.profile.business_name,
            "business_type": self.profile.business_type,
            "business_size": self.profile.business_size,
            "growth_stage": self.growth_stage,
            "industry": self.profile.industry,
            "employee_count": self.profile.employee_count,
            "annual_revenue": self.profile.annual_revenue,
            "competitors_count": len(self.competitors),
            "data_completeness": self.data_completeness,
            "last_updated": self.updated_at
        }
    
    def get_competitive_analysis(self) -> Dict[str, Any]:
        """الحصول على تحليل تنافسي"""
        if not self.competitors:
            return {"message": "لا توجد بيانات منافسين"}
        
        threat_levels = [comp.threat_level for comp in self.competitors]
        market_positions = [comp.market_position for comp in self.competitors]
        
        return {
            "total_competitors": len(self.competitors),
            "high_threat_competitors": threat_levels.count("high"),
            "market_leaders": market_positions.count(MarketPosition.LEADER),
            "main_competitors": [comp.competitor_name for comp in self.competitors[:5]],
            "competitive_advantages": self.key_success_factors
        }

# دوال مساعدة
def create_business_profile(
    business_name: str,
    business_type: BusinessType,
    **kwargs
) -> BusinessProfile:
    """
    إنشاء ملف تعريف شركة جديد
    
    Args:
        business_name: اسم الشركة
        business_type: نوع النشاط
        **kwargs: معلومات إضافية
        
    Returns:
        BusinessProfile: ملف تعريف الشركة
    """
    return BusinessProfile(
        business_name=business_name,
        business_type=business_type,
        **kwargs
    )

def analyze_business_data(business_data: BusinessData) -> Dict[str, Any]:
    """
    تحليل بيانات الشركة وإنتاج تقرير شامل
    
    Args:
        business_data: بيانات الشركة
        
    Returns:
        Dict[str, Any]: تقرير التحليل
    """
    analysis = {
        "business_overview": business_data.get_summary(),
        "competitive_analysis": business_data.get_competitive_analysis(),
        "recommendations": [],
        "insights": []
    }
    
    # إضافة توصيات بناءً على البيانات
    if business_data.data_completeness and business_data.data_completeness < 70:
        analysis["recommendations"].append("تحسين اكتمال البيانات لتحليل أفضل")
    
    if len(business_data.competitors) < 3:
        analysis["recommendations"].append("إضافة المزيد من بيانات المنافسين")
    
    if business_data.profile.business_size == BusinessSize.STARTUP:
        analysis["insights"].append("الشركة في مرحلة النمو المبكر")
    
    return analysis

# تصدير النماذج
__all__ = [
    # Enums
    "BusinessType",
    "BusinessSize", 
    "MarketPosition",
    "GrowthStage",
    
    # Models
    "ContactInfo",
    "BusinessProfile",
    "BusinessMetrics",
    "MarketAnalysis",
    "CompetitorProfile",
    "IndustryData",
    "BusinessData",
    
    # Helper functions
    "create_business_profile",
    "analyze_business_data"
]

