#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
📝 Ad Content Models - نماذج المحتوى الإعلاني
===========================================

نماذج شاملة للمحتوى الإعلاني:
- العناوين والأوصاف
- دعوات العمل والأصول
- التنويعات الإبداعية
- قوالب المحتوى
- معاينات الإعلانات

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, field

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

class ContentType(str, Enum):
    """أنواع المحتوى"""
    HEADLINE = "headline"                      # عنوان
    DESCRIPTION = "description"                # وصف
    CALL_TO_ACTION = "call_to_action"         # دعوة للعمل
    DISPLAY_URL = "display_url"               # رابط العرض
    SITELINK = "sitelink"                     # رابط الموقع
    CALLOUT = "callout"                       # نداء
    STRUCTURED_SNIPPET = "structured_snippet"  # مقطع منظم

class AdFormat(str, Enum):
    """تنسيقات الإعلان"""
    TEXT_AD = "text_ad"                       # إعلان نصي
    RESPONSIVE_SEARCH_AD = "responsive_search_ad"  # إعلان بحث متجاوب
    DISPLAY_AD = "display_ad"                 # إعلان عرض
    VIDEO_AD = "video_ad"                     # إعلان فيديو
    SHOPPING_AD = "shopping_ad"               # إعلان تسوق
    APP_AD = "app_ad"                        # إعلان تطبيق

class ContentStatus(str, Enum):
    """حالة المحتوى"""
    DRAFT = "draft"                          # مسودة
    PENDING_REVIEW = "pending_review"        # في انتظار المراجعة
    APPROVED = "approved"                    # معتمد
    REJECTED = "rejected"                    # مرفوض
    ACTIVE = "active"                        # نشط
    PAUSED = "paused"                        # متوقف
    ARCHIVED = "archived"                    # مؤرشف

class PerformanceLevel(str, Enum):
    """مستوى الأداء"""
    EXCELLENT = "excellent"                  # ممتاز
    GOOD = "good"                           # جيد
    AVERAGE = "average"                     # متوسط
    POOR = "poor"                          # ضعيف
    UNKNOWN = "unknown"                     # غير معروف

# ==================== نماذج المحتوى الأساسية ====================

class Headline(BaseModel):
    """
    📰 عنوان الإعلان
    """
    text: str = Field(..., description="نص العنوان", max_length=30)
    position: Optional[int] = Field(None, description="موضع العنوان")
    performance_score: Optional[float] = Field(None, description="نقاط الأداء")
    click_through_rate: Optional[float] = Field(None, description="معدل النقر")
    impressions: Optional[int] = Field(None, description="مرات الظهور")
    clicks: Optional[int] = Field(None, description="النقرات")
    
    # معلومات إضافية
    language: str = Field("ar", description="اللغة")
    keywords: List[str] = Field(default_factory=list, description="الكلمات المفتاحية")
    emotional_tone: Optional[str] = Field(None, description="النبرة العاطفية")
    
    # حالة العنوان
    status: ContentStatus = Field(ContentStatus.DRAFT, description="حالة العنوان")
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    
    if PYDANTIC_AVAILABLE:
        @validator('text')
        def validate_headline_text(cls, v):
            if len(v) > 30:
                raise ValueError('العنوان يجب ألا يتجاوز 30 حرف')
            if len(v.strip()) < 3:
                raise ValueError('العنوان يجب أن يكون على الأقل 3 أحرف')
            return v.strip()

class Description(BaseModel):
    """
    📄 وصف الإعلان
    """
    text: str = Field(..., description="نص الوصف", max_length=90)
    position: Optional[int] = Field(None, description="موضع الوصف")
    performance_score: Optional[float] = Field(None, description="نقاط الأداء")
    
    # معلومات المحتوى
    includes_benefits: bool = Field(False, description="يتضمن فوائد")
    includes_features: bool = Field(False, description="يتضمن مميزات")
    includes_offer: bool = Field(False, description="يتضمن عرض")
    includes_urgency: bool = Field(False, description="يتضمن إلحاح")
    
    # معلومات إضافية
    language: str = Field("ar", description="اللغة")
    target_audience: Optional[str] = Field(None, description="الجمهور المستهدف")
    
    # حالة الوصف
    status: ContentStatus = Field(ContentStatus.DRAFT, description="حالة الوصف")
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    
    if PYDANTIC_AVAILABLE:
        @validator('text')
        def validate_description_text(cls, v):
            if len(v) > 90:
                raise ValueError('الوصف يجب ألا يتجاوز 90 حرف')
            if len(v.strip()) < 10:
                raise ValueError('الوصف يجب أن يكون على الأقل 10 أحرف')
            return v.strip()

class CallToAction(BaseModel):
    """
    👆 دعوة للعمل
    """
    text: str = Field(..., description="نص دعوة العمل")
    action_type: str = Field("click", description="نوع العمل")
    urgency_level: str = Field("medium", description="مستوى الإلحاح")
    
    # معلومات الأداء
    conversion_rate: Optional[float] = Field(None, description="معدل التحويل")
    clicks: Optional[int] = Field(None, description="النقرات")
    conversions: Optional[int] = Field(None, description="التحويلات")
    
    # معلومات إضافية
    language: str = Field("ar", description="اللغة")
    target_action: Optional[str] = Field(None, description="العمل المستهدف")
    
    # حالة دعوة العمل
    status: ContentStatus = Field(ContentStatus.DRAFT, description="الحالة")
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")

class AdAssets(BaseModel):
    """
    🎨 أصول الإعلان
    """
    # الصور
    images: List[str] = Field(default_factory=list, description="روابط الصور")
    logos: List[str] = Field(default_factory=list, description="روابط الشعارات")
    
    # الفيديوهات
    videos: List[str] = Field(default_factory=list, description="روابط الفيديوهات")
    
    # النصوص الإضافية
    sitelinks: List[Dict[str, str]] = Field(default_factory=list, description="روابط الموقع")
    callouts: List[str] = Field(default_factory=list, description="النداءات")
    structured_snippets: List[Dict[str, Any]] = Field(default_factory=list, description="المقاطع المنظمة")
    
    # معلومات الأداء
    asset_performance: Dict[str, float] = Field(default_factory=dict, description="أداء الأصول")
    
    # معلومات إضافية
    brand_guidelines: Dict[str, Any] = Field(default_factory=dict, description="إرشادات العلامة التجارية")
    
    def get_total_assets_count(self) -> int:
        """الحصول على إجمالي عدد الأصول"""
        return (
            len(self.images) + 
            len(self.logos) + 
            len(self.videos) + 
            len(self.sitelinks) + 
            len(self.callouts) + 
            len(self.structured_snippets)
        )

class CreativeVariation(BaseModel):
    """
    🎭 التنويع الإبداعي
    """
    variation_id: str = Field(..., description="معرف التنويع")
    variation_name: str = Field(..., description="اسم التنويع")
    
    # المحتوى
    headlines: List[Headline] = Field(default_factory=list, description="العناوين")
    descriptions: List[Description] = Field(default_factory=list, description="الأوصاف")
    call_to_actions: List[CallToAction] = Field(default_factory=list, description="دعوات العمل")
    
    # الأصول
    assets: AdAssets = Field(default_factory=AdAssets, description="الأصول")
    
    # معلومات الأداء
    performance_score: Optional[float] = Field(None, description="نقاط الأداء")
    performance_level: PerformanceLevel = Field(PerformanceLevel.UNKNOWN, description="مستوى الأداء")
    
    # إحصائيات
    impressions: Optional[int] = Field(None, description="مرات الظهور")
    clicks: Optional[int] = Field(None, description="النقرات")
    conversions: Optional[int] = Field(None, description="التحويلات")
    cost: Optional[float] = Field(None, description="التكلفة")
    
    # معلومات إضافية
    target_audience: Optional[str] = Field(None, description="الجمهور المستهدف")
    testing_notes: Optional[str] = Field(None, description="ملاحظات الاختبار")
    
    # حالة التنويع
    status: ContentStatus = Field(ContentStatus.DRAFT, description="الحالة")
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    
    def calculate_ctr(self) -> Optional[float]:
        """حساب معدل النقر"""
        if self.impressions and self.clicks and self.impressions > 0:
            return (self.clicks / self.impressions) * 100
        return None
    
    def calculate_conversion_rate(self) -> Optional[float]:
        """حساب معدل التحويل"""
        if self.clicks and self.conversions and self.clicks > 0:
            return (self.conversions / self.clicks) * 100
        return None

class ContentTemplate(BaseModel):
    """
    📋 قالب المحتوى
    """
    template_id: str = Field(..., description="معرف القالب")
    template_name: str = Field(..., description="اسم القالب")
    template_type: str = Field(..., description="نوع القالب")
    
    # محتوى القالب
    headline_templates: List[str] = Field(default_factory=list, description="قوالب العناوين")
    description_templates: List[str] = Field(default_factory=list, description="قوالب الأوصاف")
    cta_templates: List[str] = Field(default_factory=list, description="قوالب دعوات العمل")
    
    # معلومات القالب
    industry: Optional[str] = Field(None, description="الصناعة")
    business_type: Optional[str] = Field(None, description="نوع النشاط")
    campaign_objective: Optional[str] = Field(None, description="هدف الحملة")
    
    # إعدادات القالب
    variables: Dict[str, str] = Field(default_factory=dict, description="المتغيرات")
    placeholders: List[str] = Field(default_factory=list, description="العناصر النائبة")
    
    # معلومات الأداء
    usage_count: int = Field(0, description="عدد مرات الاستخدام")
    success_rate: Optional[float] = Field(None, description="معدل النجاح")
    
    # معلومات إضافية
    language: str = Field("ar", description="اللغة")
    tags: List[str] = Field(default_factory=list, description="العلامات")
    
    # حالة القالب
    is_active: bool = Field(True, description="نشط")
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    
    def generate_content(self, variables: Dict[str, str]) -> Dict[str, List[str]]:
        """توليد محتوى من القالب"""
        generated_content = {
            "headlines": [],
            "descriptions": [],
            "ctas": []
        }
        
        # توليد العناوين
        for template in self.headline_templates:
            content = template
            for var, value in variables.items():
                content = content.replace(f"{{{var}}}", value)
            generated_content["headlines"].append(content)
        
        # توليد الأوصاف
        for template in self.description_templates:
            content = template
            for var, value in variables.items():
                content = content.replace(f"{{{var}}}", value)
            generated_content["descriptions"].append(content)
        
        # توليد دعوات العمل
        for template in self.cta_templates:
            content = template
            for var, value in variables.items():
                content = content.replace(f"{{{var}}}", value)
            generated_content["ctas"].append(content)
        
        return generated_content

class AdPreview(BaseModel):
    """
    👁️ معاينة الإعلان
    """
    preview_id: str = Field(..., description="معرف المعاينة")
    ad_format: AdFormat = Field(..., description="تنسيق الإعلان")
    
    # محتوى المعاينة
    headline: str = Field(..., description="العنوان")
    description: str = Field(..., description="الوصف")
    display_url: str = Field(..., description="رابط العرض")
    call_to_action: Optional[str] = Field(None, description="دعوة العمل")
    
    # الأصول المرئية
    image_url: Optional[str] = Field(None, description="رابط الصورة")
    logo_url: Optional[str] = Field(None, description="رابط الشعار")
    video_url: Optional[str] = Field(None, description="رابط الفيديو")
    
    # إعدادات العرض
    device_type: str = Field("desktop", description="نوع الجهاز")
    placement: str = Field("search", description="موضع العرض")
    
    # معلومات إضافية
    preview_url: Optional[str] = Field(None, description="رابط المعاينة")
    screenshot_url: Optional[str] = Field(None, description="رابط لقطة الشاشة")
    
    # تقييم المعاينة
    visual_appeal_score: Optional[float] = Field(None, description="نقاط الجاذبية البصرية")
    readability_score: Optional[float] = Field(None, description="نقاط القابلية للقراءة")
    
    # معلومات الإنشاء
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    expires_at: Optional[datetime] = Field(None, description="تاريخ انتهاء الصلاحية")

class AdContent(BaseModel):
    """
    📝 المحتوى الإعلاني الشامل
    
    نموذج شامل يجمع جميع عناصر المحتوى الإعلاني
    """
    # المعرف الفريد
    content_id: str = Field(..., description="معرف المحتوى")
    content_name: str = Field(..., description="اسم المحتوى")
    
    # تنسيق الإعلان
    ad_format: AdFormat = Field(..., description="تنسيق الإعلان")
    
    # المحتوى الأساسي
    headlines: List[Headline] = Field(default_factory=list, description="العناوين")
    descriptions: List[Description] = Field(default_factory=list, description="الأوصاف")
    call_to_actions: List[CallToAction] = Field(default_factory=list, description="دعوات العمل")
    
    # الأصول
    assets: AdAssets = Field(default_factory=AdAssets, description="الأصول")
    
    # التنويعات
    variations: List[CreativeVariation] = Field(default_factory=list, description="التنويعات الإبداعية")
    
    # القوالب المستخدمة
    templates_used: List[str] = Field(default_factory=list, description="القوالب المستخدمة")
    
    # معلومات الحملة
    campaign_id: Optional[str] = Field(None, description="معرف الحملة")
    ad_group_id: Optional[str] = Field(None, description="معرف المجموعة الإعلانية")
    
    # معلومات الاستهداف
    target_audience: Optional[str] = Field(None, description="الجمهور المستهدف")
    target_keywords: List[str] = Field(default_factory=list, description="الكلمات المفتاحية المستهدفة")
    
    # معلومات الأداء الإجمالي
    overall_performance_score: Optional[float] = Field(None, description="نقاط الأداء الإجمالي")
    total_impressions: Optional[int] = Field(None, description="إجمالي مرات الظهور")
    total_clicks: Optional[int] = Field(None, description="إجمالي النقرات")
    total_conversions: Optional[int] = Field(None, description="إجمالي التحويلات")
    total_cost: Optional[float] = Field(None, description="إجمالي التكلفة")
    
    # معلومات إضافية
    language: str = Field("ar", description="اللغة")
    brand_guidelines: Dict[str, Any] = Field(default_factory=dict, description="إرشادات العلامة التجارية")
    compliance_notes: Optional[str] = Field(None, description="ملاحظات الامتثال")
    
    # حالة المحتوى
    status: ContentStatus = Field(ContentStatus.DRAFT, description="حالة المحتوى")
    approval_status: Optional[str] = Field(None, description="حالة الموافقة")
    
    # تواريخ مهمة
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    updated_at: Optional[datetime] = Field(None, description="تاريخ آخر تحديث")
    published_at: Optional[datetime] = Field(None, description="تاريخ النشر")
    
    if PYDANTIC_AVAILABLE:
        @root_validator
        def validate_ad_content(cls, values):
            # التحقق من وجود محتوى أساسي
            headlines = values.get('headlines', [])
            descriptions = values.get('descriptions', [])
            
            if not headlines:
                raise ValueError('يجب وجود عنوان واحد على الأقل')
            
            if not descriptions:
                raise ValueError('يجب وجود وصف واحد على الأقل')
            
            # التحقق من حدود المحتوى حسب التنسيق
            ad_format = values.get('ad_format')
            
            if ad_format == AdFormat.RESPONSIVE_SEARCH_AD:
                if len(headlines) < 3:
                    raise ValueError('الإعلان المتجاوب يحتاج 3 عناوين على الأقل')
                if len(headlines) > 15:
                    raise ValueError('الإعلان المتجاوب لا يمكن أن يحتوي على أكثر من 15 عنوان')
                if len(descriptions) > 4:
                    raise ValueError('الإعلان المتجاوب لا يمكن أن يحتوي على أكثر من 4 أوصاف')
            
            return values
    
    def get_content_summary(self) -> Dict[str, Any]:
        """الحصول على ملخص المحتوى"""
        return {
            "content_id": self.content_id,
            "content_name": self.content_name,
            "ad_format": self.ad_format,
            "headlines_count": len(self.headlines),
            "descriptions_count": len(self.descriptions),
            "ctas_count": len(self.call_to_actions),
            "variations_count": len(self.variations),
            "assets_count": self.assets.get_total_assets_count(),
            "status": self.status,
            "performance_score": self.overall_performance_score,
            "created_at": self.created_at
        }
    
    def get_best_performing_variation(self) -> Optional[CreativeVariation]:
        """الحصول على أفضل تنويع أداءً"""
        if not self.variations:
            return None
        
        return max(
            self.variations,
            key=lambda v: v.performance_score or 0
        )
    
    def calculate_overall_ctr(self) -> Optional[float]:
        """حساب معدل النقر الإجمالي"""
        if self.total_impressions and self.total_clicks and self.total_impressions > 0:
            return (self.total_clicks / self.total_impressions) * 100
        return None
    
    def calculate_overall_conversion_rate(self) -> Optional[float]:
        """حساب معدل التحويل الإجمالي"""
        if self.total_clicks and self.total_conversions and self.total_clicks > 0:
            return (self.total_conversions / self.total_clicks) * 100
        return None

# دوال مساعدة
def create_headline(text: str, **kwargs) -> Headline:
    """إنشاء عنوان جديد"""
    return Headline(text=text, **kwargs)

def create_description(text: str, **kwargs) -> Description:
    """إنشاء وصف جديد"""
    return Description(text=text, **kwargs)

def create_call_to_action(text: str, **kwargs) -> CallToAction:
    """إنشاء دعوة عمل جديدة"""
    return CallToAction(text=text, **kwargs)

def create_ad_content(
    content_id: str,
    content_name: str,
    ad_format: AdFormat,
    headlines: List[str],
    descriptions: List[str],
    **kwargs
) -> AdContent:
    """إنشاء محتوى إعلاني جديد"""
    headline_objects = [create_headline(h) for h in headlines]
    description_objects = [create_description(d) for d in descriptions]
    
    return AdContent(
        content_id=content_id,
        content_name=content_name,
        ad_format=ad_format,
        headlines=headline_objects,
        descriptions=description_objects,
        **kwargs
    )

def generate_content_variations(
    base_content: AdContent,
    variation_count: int = 3
) -> List[CreativeVariation]:
    """توليد تنويعات من المحتوى الأساسي"""
    variations = []
    
    for i in range(variation_count):
        variation = CreativeVariation(
            variation_id=f"{base_content.content_id}_var_{i+1}",
            variation_name=f"{base_content.content_name} - تنويع {i+1}",
            headlines=base_content.headlines[:3],  # أول 3 عناوين
            descriptions=base_content.descriptions[:2],  # أول وصفين
            call_to_actions=base_content.call_to_actions[:1],  # أول دعوة عمل
            assets=base_content.assets
        )
        variations.append(variation)
    
    return variations

# تصدير النماذج
__all__ = [
    # Enums
    "ContentType",
    "AdFormat",
    "ContentStatus",
    "PerformanceLevel",
    
    # Models
    "Headline",
    "Description",
    "CallToAction",
    "AdAssets",
    "CreativeVariation",
    "ContentTemplate",
    "AdPreview",
    "AdContent",
    
    # Helper functions
    "create_headline",
    "create_description",
    "create_call_to_action",
    "create_ad_content",
    "generate_content_variations"
]

