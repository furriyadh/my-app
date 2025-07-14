#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🎯 Campaign Data Models - نماذج بيانات الحملات
===========================================

نماذج شاملة لبيانات الحملات الإعلانية:
- بيانات الحملات والمجموعات الإعلانية
- الإعلانات والكلمات المفتاحية
- إعدادات الاستهداف والميزانية
- مقاييس الأداء والإحصائيات
- تحسين الحملات والتوصيات

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date
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

class CampaignType(str, Enum):
    """أنواع الحملات"""
    SEARCH = "search"                         # حملة بحث
    DISPLAY = "display"                       # حملة عرض
    VIDEO = "video"                          # حملة فيديو
    SHOPPING = "shopping"                     # حملة تسوق
    APP = "app"                              # حملة تطبيق
    SMART = "smart"                          # حملة ذكية
    PERFORMANCE_MAX = "performance_max"       # الأداء الأقصى
    LOCAL = "local"                          # حملة محلية
    DISCOVERY = "discovery"                   # حملة اكتشاف

class CampaignStatus(str, Enum):
    """حالة الحملة"""
    ENABLED = "enabled"                       # مُفعلة
    PAUSED = "paused"                        # متوقفة
    REMOVED = "removed"                      # محذوفة
    DRAFT = "draft"                          # مسودة
    PENDING = "pending"                      # في الانتظار
    ENDED = "ended"                          # منتهية

class CampaignObjective(str, Enum):
    """أهداف الحملة"""
    SALES = "sales"                          # المبيعات
    LEADS = "leads"                          # العملاء المحتملين
    WEBSITE_TRAFFIC = "website_traffic"       # زوار الموقع
    BRAND_AWARENESS = "brand_awareness"       # الوعي بالعلامة التجارية
    APP_PROMOTION = "app_promotion"          # ترويج التطبيق
    LOCAL_STORE_VISITS = "local_store_visits" # زيارات المتجر المحلي

class BiddingStrategy(str, Enum):
    """استراتيجيات المزايدة"""
    MANUAL_CPC = "manual_cpc"                # تكلفة النقرة اليدوية
    ENHANCED_CPC = "enhanced_cpc"            # تكلفة النقرة المحسنة
    TARGET_CPA = "target_cpa"                # تكلفة الإجراء المستهدفة
    TARGET_ROAS = "target_roas"              # عائد الإنفاق المستهدف
    MAXIMIZE_CLICKS = "maximize_clicks"       # تعظيم النقرات
    MAXIMIZE_CONVERSIONS = "maximize_conversions"  # تعظيم التحويلات
    MAXIMIZE_CONVERSION_VALUE = "maximize_conversion_value"  # تعظيم قيمة التحويل

class AdGroupType(str, Enum):
    """أنواع المجموعات الإعلانية"""
    SEARCH_STANDARD = "search_standard"       # بحث عادي
    DISPLAY_STANDARD = "display_standard"     # عرض عادي
    SHOPPING_PRODUCT_ADS = "shopping_product_ads"  # إعلانات المنتجات
    VIDEO_BUMPER = "video_bumper"            # فيديو قصير
    VIDEO_TRUE_VIEW = "video_true_view"      # فيديو TrueView

class KeywordMatchType(str, Enum):
    """أنواع مطابقة الكلمات المفتاحية"""
    EXACT = "exact"                          # مطابقة تامة
    PHRASE = "phrase"                        # مطابقة عبارة
    BROAD = "broad"                          # مطابقة واسعة
    BROAD_MATCH_MODIFIER = "broad_match_modifier"  # معدل المطابقة الواسعة

class AdType(str, Enum):
    """أنواع الإعلانات"""
    TEXT_AD = "text_ad"                      # إعلان نصي
    EXPANDED_TEXT_AD = "expanded_text_ad"     # إعلان نصي موسع
    RESPONSIVE_SEARCH_AD = "responsive_search_ad"  # إعلان بحث متجاوب
    DISPLAY_AD = "display_ad"                # إعلان عرض
    VIDEO_AD = "video_ad"                    # إعلان فيديو
    SHOPPING_AD = "shopping_ad"              # إعلان تسوق
    APP_AD = "app_ad"                        # إعلان تطبيق

# ==================== نماذج الإعدادات ====================

class BudgetSettings(BaseModel):
    """
    💰 إعدادات الميزانية
    """
    # الميزانية اليومية
    daily_budget: Decimal = Field(..., description="الميزانية اليومية")
    currency: str = Field("SAR", description="العملة")
    
    # نوع الميزانية
    budget_type: str = Field("daily", description="نوع الميزانية")
    delivery_method: str = Field("standard", description="طريقة التسليم")
    
    # حدود الإنفاق
    total_budget: Optional[Decimal] = Field(None, description="الميزانية الإجمالية")
    budget_period: Optional[str] = Field(None, description="فترة الميزانية")
    
    # إعدادات متقدمة
    shared_budget_id: Optional[str] = Field(None, description="معرف الميزانية المشتركة")
    budget_optimization: bool = Field(True, description="تحسين الميزانية")
    
    # تتبع الإنفاق
    amount_spent: Decimal = Field(Decimal('0'), description="المبلغ المُنفق")
    remaining_budget: Optional[Decimal] = Field(None, description="الميزانية المتبقية")
    
    if PYDANTIC_AVAILABLE:
        @validator('daily_budget', 'total_budget')
        def validate_budget_amounts(cls, v):
            if v is not None and v <= 0:
                raise ValueError('الميزانية يجب أن تكون أكبر من صفر')
            return v
        
        @root_validator
        def calculate_remaining_budget(cls, values):
            total = values.get('total_budget')
            spent = values.get('amount_spent', Decimal('0'))
            
            if total:
                values['remaining_budget'] = total - spent
            
            return values

class TargetingSettings(BaseModel):
    """
    🎯 إعدادات الاستهداف
    """
    # الاستهداف الجغرافي
    locations: List[str] = Field(default_factory=list, description="المواقع المستهدفة")
    excluded_locations: List[str] = Field(default_factory=list, description="المواقع المستبعدة")
    location_radius: Optional[int] = Field(None, description="نطاق الموقع (كم)")
    
    # الاستهداف الديموغرافي
    age_ranges: List[str] = Field(default_factory=list, description="الفئات العمرية")
    genders: List[str] = Field(default_factory=list, description="الجنس")
    parental_status: List[str] = Field(default_factory=list, description="حالة الوالدية")
    household_income: List[str] = Field(default_factory=list, description="دخل الأسرة")
    
    # الاستهداف السلوكي
    interests: List[str] = Field(default_factory=list, description="الاهتمامات")
    behaviors: List[str] = Field(default_factory=list, description="السلوكيات")
    life_events: List[str] = Field(default_factory=list, description="أحداث الحياة")
    
    # الاستهداف التقني
    devices: List[str] = Field(default_factory=list, description="الأجهزة")
    operating_systems: List[str] = Field(default_factory=list, description="أنظمة التشغيل")
    browsers: List[str] = Field(default_factory=list, description="المتصفحات")
    
    # الاستهداف الزمني
    ad_schedule: Dict[str, List[str]] = Field(default_factory=dict, description="جدولة الإعلانات")
    time_zones: List[str] = Field(default_factory=list, description="المناطق الزمنية")
    
    # الاستهداف المتقدم
    custom_audiences: List[str] = Field(default_factory=list, description="الجماهير المخصصة")
    lookalike_audiences: List[str] = Field(default_factory=list, description="الجماهير المشابهة")
    remarketing_lists: List[str] = Field(default_factory=list, description="قوائم إعادة التسويق")
    
    # إعدادات الاستبعاد
    negative_keywords: List[str] = Field(default_factory=list, description="الكلمات السلبية")
    excluded_placements: List[str] = Field(default_factory=list, description="المواضع المستبعدة")
    
    def get_targeting_summary(self) -> Dict[str, int]:
        """الحصول على ملخص الاستهداف"""
        return {
            "locations": len(self.locations),
            "demographics": len(self.age_ranges) + len(self.genders),
            "interests": len(self.interests),
            "devices": len(self.devices),
            "custom_audiences": len(self.custom_audiences),
            "exclusions": len(self.negative_keywords) + len(self.excluded_locations)
        }

class CampaignSettings(BaseModel):
    """
    ⚙️ إعدادات الحملة
    """
    # إعدادات أساسية
    campaign_type: CampaignType = Field(..., description="نوع الحملة")
    objective: CampaignObjective = Field(..., description="هدف الحملة")
    bidding_strategy: BiddingStrategy = Field(..., description="استراتيجية المزايدة")
    
    # إعدادات المزايدة
    target_cpa: Optional[Decimal] = Field(None, description="تكلفة الإجراء المستهدفة")
    target_roas: Optional[Decimal] = Field(None, description="عائد الإنفاق المستهدف")
    max_cpc: Optional[Decimal] = Field(None, description="أقصى تكلفة نقرة")
    
    # إعدادات الشبكة
    search_network: bool = Field(True, description="شبكة البحث")
    display_network: bool = Field(False, description="شبكة العرض")
    search_partners: bool = Field(False, description="شركاء البحث")
    
    # إعدادات متقدمة
    ad_rotation: str = Field("optimize", description="تدوير الإعلانات")
    frequency_cap: Optional[int] = Field(None, description="حد التكرار")
    conversion_tracking: bool = Field(True, description="تتبع التحويلات")
    
    # إعدادات التحسين
    auto_optimization: bool = Field(True, description="التحسين التلقائي")
    smart_bidding: bool = Field(False, description="المزايدة الذكية")
    dynamic_search_ads: bool = Field(False, description="إعلانات البحث الديناميكية")
    
    # إعدادات التجريب
    experiment_enabled: bool = Field(False, description="التجريب مُفعل")
    split_test_percentage: Optional[int] = Field(None, description="نسبة اختبار التقسيم")

# ==================== نماذج البيانات الأساسية ====================

class Keyword(BaseModel):
    """
    🔑 الكلمة المفتاحية
    """
    # معلومات أساسية
    keyword_id: Optional[str] = Field(None, description="معرف الكلمة المفتاحية")
    text: str = Field(..., description="نص الكلمة المفتاحية")
    match_type: KeywordMatchType = Field(..., description="نوع المطابقة")
    
    # إعدادات المزايدة
    max_cpc: Optional[Decimal] = Field(None, description="أقصى تكلفة نقرة")
    quality_score: Optional[int] = Field(None, description="نقاط الجودة")
    
    # حالة الكلمة المفتاحية
    status: str = Field("enabled", description="حالة الكلمة المفتاحية")
    approval_status: Optional[str] = Field(None, description="حالة الموافقة")
    
    # إحصائيات الأداء
    impressions: int = Field(0, description="مرات الظهور")
    clicks: int = Field(0, description="النقرات")
    conversions: int = Field(0, description="التحويلات")
    cost: Decimal = Field(Decimal('0'), description="التكلفة")
    
    # مقاييس محسوبة
    ctr: Optional[float] = Field(None, description="معدل النقر")
    cpc: Optional[Decimal] = Field(None, description="تكلفة النقرة")
    conversion_rate: Optional[float] = Field(None, description="معدل التحويل")
    
    # معلومات إضافية
    search_volume: Optional[int] = Field(None, description="حجم البحث")
    competition: Optional[str] = Field(None, description="مستوى المنافسة")
    suggested_bid: Optional[Decimal] = Field(None, description="المزايدة المقترحة")
    
    # تواريخ
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    last_updated: Optional[datetime] = Field(None, description="آخر تحديث")
    
    if PYDANTIC_AVAILABLE:
        @root_validator
        def calculate_metrics(cls, values):
            impressions = values.get('impressions', 0)
            clicks = values.get('clicks', 0)
            conversions = values.get('conversions', 0)
            cost = values.get('cost', Decimal('0'))
            
            # حساب معدل النقر
            if impressions > 0:
                values['ctr'] = (clicks / impressions) * 100
            
            # حساب تكلفة النقرة
            if clicks > 0:
                values['cpc'] = cost / clicks
            
            # حساب معدل التحويل
            if clicks > 0:
                values['conversion_rate'] = (conversions / clicks) * 100
            
            return values

class Advertisement(BaseModel):
    """
    📢 الإعلان
    """
    # معلومات أساسية
    ad_id: Optional[str] = Field(None, description="معرف الإعلان")
    ad_type: AdType = Field(..., description="نوع الإعلان")
    status: str = Field("enabled", description="حالة الإعلان")
    
    # محتوى الإعلان
    headlines: List[str] = Field(default_factory=list, description="العناوين")
    descriptions: List[str] = Field(default_factory=list, description="الأوصاف")
    display_url: Optional[str] = Field(None, description="رابط العرض")
    final_url: str = Field(..., description="الرابط النهائي")
    
    # الأصول المرئية
    images: List[str] = Field(default_factory=list, description="الصور")
    videos: List[str] = Field(default_factory=list, description="الفيديوهات")
    logos: List[str] = Field(default_factory=list, description="الشعارات")
    
    # إعدادات الإعلان
    call_to_action: Optional[str] = Field(None, description="دعوة العمل")
    business_name: Optional[str] = Field(None, description="اسم النشاط")
    
    # إحصائيات الأداء
    impressions: int = Field(0, description="مرات الظهور")
    clicks: int = Field(0, description="النقرات")
    conversions: int = Field(0, description="التحويلات")
    cost: Decimal = Field(Decimal('0'), description="التكلفة")
    
    # مقاييس محسوبة
    ctr: Optional[float] = Field(None, description="معدل النقر")
    cpc: Optional[Decimal] = Field(None, description="تكلفة النقرة")
    conversion_rate: Optional[float] = Field(None, description="معدل التحويل")
    
    # معلومات الموافقة
    approval_status: Optional[str] = Field(None, description="حالة الموافقة")
    policy_summary: Optional[str] = Field(None, description="ملخص السياسة")
    
    # تواريخ
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    last_updated: Optional[datetime] = Field(None, description="آخر تحديث")
    
    if PYDANTIC_AVAILABLE:
        @validator('final_url')
        def validate_final_url(cls, v):
            if not v.startswith(('http://', 'https://')):
                raise ValueError('الرابط النهائي يجب أن يبدأ بـ http:// أو https://')
            return v
        
        @root_validator
        def calculate_ad_metrics(cls, values):
            impressions = values.get('impressions', 0)
            clicks = values.get('clicks', 0)
            conversions = values.get('conversions', 0)
            cost = values.get('cost', Decimal('0'))
            
            # حساب معدل النقر
            if impressions > 0:
                values['ctr'] = (clicks / impressions) * 100
            
            # حساب تكلفة النقرة
            if clicks > 0:
                values['cpc'] = cost / clicks
            
            # حساب معدل التحويل
            if clicks > 0:
                values['conversion_rate'] = (conversions / clicks) * 100
            
            return values

class AdGroup(BaseModel):
    """
    📁 المجموعة الإعلانية
    """
    # معلومات أساسية
    ad_group_id: Optional[str] = Field(None, description="معرف المجموعة الإعلانية")
    name: str = Field(..., description="اسم المجموعة الإعلانية")
    ad_group_type: AdGroupType = Field(..., description="نوع المجموعة الإعلانية")
    status: CampaignStatus = Field(CampaignStatus.ENABLED, description="حالة المجموعة")
    
    # إعدادات المزايدة
    default_max_cpc: Optional[Decimal] = Field(None, description="أقصى تكلفة نقرة افتراضية")
    target_cpa: Optional[Decimal] = Field(None, description="تكلفة الإجراء المستهدفة")
    
    # المحتوى
    keywords: List[Keyword] = Field(default_factory=list, description="الكلمات المفتاحية")
    ads: List[Advertisement] = Field(default_factory=list, description="الإعلانات")
    
    # الاستهداف
    targeting_settings: Optional[TargetingSettings] = Field(None, description="إعدادات الاستهداف")
    
    # إحصائيات الأداء
    impressions: int = Field(0, description="مرات الظهور")
    clicks: int = Field(0, description="النقرات")
    conversions: int = Field(0, description="التحويلات")
    cost: Decimal = Field(Decimal('0'), description="التكلفة")
    
    # مقاييس محسوبة
    ctr: Optional[float] = Field(None, description="معدل النقر")
    cpc: Optional[Decimal] = Field(None, description="تكلفة النقرة")
    conversion_rate: Optional[float] = Field(None, description="معدل التحويل")
    quality_score: Optional[float] = Field(None, description="نقاط الجودة")
    
    # تواريخ
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    last_updated: Optional[datetime] = Field(None, description="آخر تحديث")
    
    def get_active_keywords_count(self) -> int:
        """عدد الكلمات المفتاحية النشطة"""
        return len([k for k in self.keywords if k.status == "enabled"])
    
    def get_active_ads_count(self) -> int:
        """عدد الإعلانات النشطة"""
        return len([a for a in self.ads if a.status == "enabled"])
    
    def get_top_performing_keywords(self, limit: int = 5) -> List[Keyword]:
        """أفضل الكلمات المفتاحية أداءً"""
        return sorted(
            self.keywords,
            key=lambda k: k.conversions,
            reverse=True
        )[:limit]

class CampaignPerformance(BaseModel):
    """
    📊 أداء الحملة
    """
    # فترة التقرير
    date_range: Dict[str, date] = Field(..., description="نطاق التاريخ")
    
    # مقاييس الأداء الأساسية
    impressions: int = Field(0, description="مرات الظهور")
    clicks: int = Field(0, description="النقرات")
    conversions: int = Field(0, description="التحويلات")
    conversion_value: Decimal = Field(Decimal('0'), description="قيمة التحويلات")
    cost: Decimal = Field(Decimal('0'), description="التكلفة")
    
    # مقاييس محسوبة
    ctr: Optional[float] = Field(None, description="معدل النقر")
    cpc: Optional[Decimal] = Field(None, description="تكلفة النقرة")
    cpa: Optional[Decimal] = Field(None, description="تكلفة الإجراء")
    roas: Optional[float] = Field(None, description="عائد الإنفاق الإعلاني")
    conversion_rate: Optional[float] = Field(None, description="معدل التحويل")
    
    # مقاييس الجودة
    quality_score: Optional[float] = Field(None, description="نقاط الجودة")
    search_impression_share: Optional[float] = Field(None, description="حصة ظهور البحث")
    
    # مقاييس متقدمة
    view_through_conversions: int = Field(0, description="تحويلات المشاهدة")
    cross_device_conversions: int = Field(0, description="تحويلات متعددة الأجهزة")
    
    # تحليل الاتجاهات
    trend_data: Dict[str, List[float]] = Field(default_factory=dict, description="بيانات الاتجاهات")
    
    # مقارنات
    previous_period_comparison: Dict[str, float] = Field(default_factory=dict, description="مقارنة الفترة السابقة")
    benchmark_comparison: Dict[str, float] = Field(default_factory=dict, description="مقارنة المعايير")
    
    if PYDANTIC_AVAILABLE:
        @root_validator
        def calculate_performance_metrics(cls, values):
            impressions = values.get('impressions', 0)
            clicks = values.get('clicks', 0)
            conversions = values.get('conversions', 0)
            conversion_value = values.get('conversion_value', Decimal('0'))
            cost = values.get('cost', Decimal('0'))
            
            # حساب معدل النقر
            if impressions > 0:
                values['ctr'] = (clicks / impressions) * 100
            
            # حساب تكلفة النقرة
            if clicks > 0:
                values['cpc'] = cost / clicks
            
            # حساب تكلفة الإجراء
            if conversions > 0:
                values['cpa'] = cost / conversions
            
            # حساب عائد الإنفاق الإعلاني
            if cost > 0:
                values['roas'] = float(conversion_value / cost)
            
            # حساب معدل التحويل
            if clicks > 0:
                values['conversion_rate'] = (conversions / clicks) * 100
            
            return values

class CampaignData(BaseModel):
    """
    🎯 بيانات الحملة الشاملة
    
    نموذج شامل يجمع جميع بيانات الحملة الإعلانية
    """
    # معلومات أساسية
    campaign_id: Optional[str] = Field(None, description="معرف الحملة")
    name: str = Field(..., description="اسم الحملة")
    status: CampaignStatus = Field(CampaignStatus.ENABLED, description="حالة الحملة")
    
    # إعدادات الحملة
    settings: CampaignSettings = Field(..., description="إعدادات الحملة")
    budget_settings: BudgetSettings = Field(..., description="إعدادات الميزانية")
    targeting_settings: TargetingSettings = Field(default_factory=TargetingSettings, description="إعدادات الاستهداف")
    
    # المجموعات الإعلانية
    ad_groups: List[AdGroup] = Field(default_factory=list, description="المجموعات الإعلانية")
    
    # أداء الحملة
    performance: Optional[CampaignPerformance] = Field(None, description="أداء الحملة")
    
    # تواريخ مهمة
    start_date: Optional[date] = Field(None, description="تاريخ البداية")
    end_date: Optional[date] = Field(None, description="تاريخ النهاية")
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    last_updated: Optional[datetime] = Field(None, description="آخر تحديث")
    
    # معلومات إضافية
    labels: List[str] = Field(default_factory=list, description="التصنيفات")
    notes: Optional[str] = Field(None, description="ملاحظات")
    
    # معلومات الحساب
    customer_id: Optional[str] = Field(None, description="معرف العميل")
    account_name: Optional[str] = Field(None, description="اسم الحساب")
    
    if PYDANTIC_AVAILABLE:
        @validator('name')
        def validate_campaign_name(cls, v):
            if len(v.strip()) < 3:
                raise ValueError('اسم الحملة يجب أن يكون على الأقل 3 أحرف')
            return v.strip()
        
        @root_validator
        def validate_campaign_dates(cls, values):
            start_date = values.get('start_date')
            end_date = values.get('end_date')
            
            if start_date and end_date and start_date > end_date:
                raise ValueError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية')
            
            return values
    
    def get_campaign_summary(self) -> Dict[str, Any]:
        """الحصول على ملخص الحملة"""
        total_ad_groups = len(self.ad_groups)
        total_keywords = sum(len(ag.keywords) for ag in self.ad_groups)
        total_ads = sum(len(ag.ads) for ag in self.ad_groups)
        
        return {
            "campaign_id": self.campaign_id,
            "name": self.name,
            "status": self.status,
            "type": self.settings.campaign_type,
            "objective": self.settings.objective,
            "daily_budget": self.budget_settings.daily_budget,
            "total_ad_groups": total_ad_groups,
            "total_keywords": total_keywords,
            "total_ads": total_ads,
            "created_at": self.created_at,
            "last_updated": self.last_updated
        }
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """الحصول على ملخص الأداء"""
        if not self.performance:
            return {"message": "لا توجد بيانات أداء"}
        
        return {
            "impressions": self.performance.impressions,
            "clicks": self.performance.clicks,
            "conversions": self.performance.conversions,
            "cost": float(self.performance.cost),
            "ctr": self.performance.ctr,
            "cpc": float(self.performance.cpc) if self.performance.cpc else None,
            "conversion_rate": self.performance.conversion_rate,
            "roas": self.performance.roas
        }
    
    def get_top_performing_ad_groups(self, limit: int = 5) -> List[AdGroup]:
        """أفضل المجموعات الإعلانية أداءً"""
        return sorted(
            self.ad_groups,
            key=lambda ag: ag.conversions,
            reverse=True
        )[:limit]
    
    def calculate_total_budget_utilization(self) -> float:
        """حساب معدل استخدام الميزانية"""
        if self.budget_settings.total_budget:
            return float(
                (self.budget_settings.amount_spent / self.budget_settings.total_budget) * 100
            )
        return 0.0

# دوال مساعدة
def create_campaign(
    name: str,
    campaign_type: CampaignType,
    objective: CampaignObjective,
    daily_budget: Decimal,
    **kwargs
) -> CampaignData:
    """إنشاء حملة جديدة"""
    settings = CampaignSettings(
        campaign_type=campaign_type,
        objective=objective,
        bidding_strategy=kwargs.get('bidding_strategy', BiddingStrategy.MANUAL_CPC)
    )
    
    budget_settings = BudgetSettings(
        daily_budget=daily_budget,
        currency=kwargs.get('currency', 'SAR')
    )
    
    return CampaignData(
        name=name,
        settings=settings,
        budget_settings=budget_settings,
        **kwargs
    )

def create_ad_group(
    name: str,
    ad_group_type: AdGroupType,
    **kwargs
) -> AdGroup:
    """إنشاء مجموعة إعلانية جديدة"""
    return AdGroup(
        name=name,
        ad_group_type=ad_group_type,
        **kwargs
    )

def create_keyword(
    text: str,
    match_type: KeywordMatchType,
    **kwargs
) -> Keyword:
    """إنشاء كلمة مفتاحية جديدة"""
    return Keyword(
        text=text,
        match_type=match_type,
        **kwargs
    )

def create_advertisement(
    ad_type: AdType,
    final_url: str,
    headlines: List[str],
    descriptions: List[str],
    **kwargs
) -> Advertisement:
    """إنشاء إعلان جديد"""
    return Advertisement(
        ad_type=ad_type,
        final_url=final_url,
        headlines=headlines,
        descriptions=descriptions,
        **kwargs
    )

# تصدير النماذج
__all__ = [
    # Enums
    "CampaignType",
    "CampaignStatus",
    "CampaignObjective",
    "BiddingStrategy",
    "AdGroupType",
    "KeywordMatchType",
    "AdType",
    
    # Settings Models
    "BudgetSettings",
    "TargetingSettings",
    "CampaignSettings",
    
    # Data Models
    "Keyword",
    "Advertisement",
    "AdGroup",
    "CampaignPerformance",
    "CampaignData",
    
    # Helper functions
    "create_campaign",
    "create_ad_group",
    "create_keyword",
    "create_advertisement"
]

