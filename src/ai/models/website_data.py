#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🌐 Website Data Models - نماذج بيانات المواقع
==========================================

نماذج شاملة لبيانات المواقع الإلكترونية:
- تحليل المحتوى والهيكل
- بيانات SEO والأداء التقني
- تحليل المنافسين والسوق
- مقاييس الأداء والزوار
- توصيات التحسين

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date
from enum import Enum
from dataclasses import dataclass, field
from urllib.parse import urlparse

# استيراد Pydantic إذا كان متاحاً
try:
    from pydantic import BaseModel, Field, validator, root_validator, HttpUrl
    PYDANTIC_AVAILABLE = True
except ImportError:
    from dataclasses import dataclass as BaseModel
    HttpUrl = str
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

class WebsiteType(str, Enum):
    """أنواع المواقع"""
    ECOMMERCE = "ecommerce"                   # متجر إلكتروني
    CORPORATE = "corporate"                   # موقع شركة
    BLOG = "blog"                            # مدونة
    PORTFOLIO = "portfolio"                   # معرض أعمال
    NEWS = "news"                            # موقع أخبار
    EDUCATIONAL = "educational"               # تعليمي
    GOVERNMENT = "government"                 # حكومي
    NON_PROFIT = "non_profit"                # غير ربحي
    PERSONAL = "personal"                     # شخصي
    LANDING_PAGE = "landing_page"             # صفحة هبوط

class ContentType(str, Enum):
    """أنواع المحتوى"""
    TEXT = "text"                            # نص
    IMAGE = "image"                          # صورة
    VIDEO = "video"                          # فيديو
    AUDIO = "audio"                          # صوت
    DOCUMENT = "document"                     # مستند
    INTERACTIVE = "interactive"               # تفاعلي

class SEOScore(str, Enum):
    """تقييم SEO"""
    EXCELLENT = "excellent"                   # ممتاز (90-100)
    GOOD = "good"                            # جيد (70-89)
    FAIR = "fair"                            # مقبول (50-69)
    POOR = "poor"                            # ضعيف (0-49)

class PageSpeed(str, Enum):
    """سرعة الصفحة"""
    FAST = "fast"                            # سريع (90-100)
    AVERAGE = "average"                       # متوسط (50-89)
    SLOW = "slow"                            # بطيء (0-49)

class MobileOptimization(str, Enum):
    """تحسين الجوال"""
    FULLY_OPTIMIZED = "fully_optimized"       # محسن بالكامل
    PARTIALLY_OPTIMIZED = "partially_optimized"  # محسن جزئياً
    NOT_OPTIMIZED = "not_optimized"           # غير محسن

# ==================== نماذج التحليل التقني ====================

class TechnicalSpecs(BaseModel):
    """
    ⚙️ المواصفات التقنية
    """
    # معلومات الخادم
    server_info: Optional[str] = Field(None, description="معلومات الخادم")
    hosting_provider: Optional[str] = Field(None, description="مزود الاستضافة")
    ip_address: Optional[str] = Field(None, description="عنوان IP")
    
    # التقنيات المستخدمة
    cms: Optional[str] = Field(None, description="نظام إدارة المحتوى")
    programming_languages: List[str] = Field(default_factory=list, description="لغات البرمجة")
    frameworks: List[str] = Field(default_factory=list, description="إطارات العمل")
    libraries: List[str] = Field(default_factory=list, description="المكتبات")
    
    # قواعد البيانات والتخزين
    databases: List[str] = Field(default_factory=list, description="قواعد البيانات")
    cdn_provider: Optional[str] = Field(None, description="مزود CDN")
    
    # الأمان
    ssl_certificate: bool = Field(False, description="شهادة SSL")
    security_headers: Dict[str, bool] = Field(default_factory=dict, description="رؤوس الأمان")
    
    # الأداء
    page_load_time: Optional[float] = Field(None, description="وقت تحميل الصفحة (ثواني)")
    page_size: Optional[int] = Field(None, description="حجم الصفحة (بايت)")
    requests_count: Optional[int] = Field(None, description="عدد الطلبات")
    
    # تحسين الجوال
    mobile_friendly: bool = Field(False, description="متوافق مع الجوال")
    responsive_design: bool = Field(False, description="تصميم متجاوب")
    amp_enabled: bool = Field(False, description="AMP مُفعل")
    
    # معلومات إضافية
    last_updated: Optional[datetime] = Field(None, description="آخر تحديث")
    uptime_percentage: Optional[float] = Field(None, description="نسبة وقت التشغيل")

class SEOData(BaseModel):
    """
    🔍 بيانات تحسين محركات البحث
    """
    # العناصر الأساسية
    title_tag: Optional[str] = Field(None, description="عنوان الصفحة")
    meta_description: Optional[str] = Field(None, description="وصف الصفحة")
    meta_keywords: List[str] = Field(default_factory=list, description="الكلمات المفتاحية")
    
    # العناوين
    h1_tags: List[str] = Field(default_factory=list, description="عناوين H1")
    h2_tags: List[str] = Field(default_factory=list, description="عناوين H2")
    h3_tags: List[str] = Field(default_factory=list, description="عناوين H3")
    
    # الروابط
    internal_links: int = Field(0, description="الروابط الداخلية")
    external_links: int = Field(0, description="الروابط الخارجية")
    broken_links: int = Field(0, description="الروابط المكسورة")
    
    # الصور
    images_count: int = Field(0, description="عدد الصور")
    images_with_alt: int = Field(0, description="الصور مع نص بديل")
    images_without_alt: int = Field(0, description="الصور بدون نص بديل")
    
    # البيانات المنظمة
    schema_markup: List[str] = Field(default_factory=list, description="البيانات المنظمة")
    open_graph_tags: Dict[str, str] = Field(default_factory=dict, description="علامات Open Graph")
    twitter_cards: Dict[str, str] = Field(default_factory=dict, description="بطاقات تويتر")
    
    # ملف robots.txt و sitemap
    robots_txt_exists: bool = Field(False, description="وجود ملف robots.txt")
    sitemap_exists: bool = Field(False, description="وجود خريطة الموقع")
    sitemap_urls: List[str] = Field(default_factory=list, description="روابط خرائط الموقع")
    
    # التقييمات
    seo_score: Optional[int] = Field(None, description="نقاط SEO")
    seo_grade: Optional[SEOScore] = Field(None, description="تقييم SEO")
    
    # مشاكل SEO
    seo_issues: List[str] = Field(default_factory=list, description="مشاكل SEO")
    seo_warnings: List[str] = Field(default_factory=list, description="تحذيرات SEO")
    seo_recommendations: List[str] = Field(default_factory=list, description="توصيات SEO")
    
    if PYDANTIC_AVAILABLE:
        @validator('seo_score')
        def validate_seo_score(cls, v):
            if v is not None and (v < 0 or v > 100):
                raise ValueError('نقاط SEO يجب أن تكون بين 0 و 100')
            return v
        
        @root_validator
        def determine_seo_grade(cls, values):
            score = values.get('seo_score')
            if score is not None:
                if score >= 90:
                    values['seo_grade'] = SEOScore.EXCELLENT
                elif score >= 70:
                    values['seo_grade'] = SEOScore.GOOD
                elif score >= 50:
                    values['seo_grade'] = SEOScore.FAIR
                else:
                    values['seo_grade'] = SEOScore.POOR
            return values

class ContentAnalysis(BaseModel):
    """
    📝 تحليل المحتوى
    """
    # إحصائيات النص
    total_words: int = Field(0, description="إجمالي الكلمات")
    unique_words: int = Field(0, description="الكلمات الفريدة")
    sentences_count: int = Field(0, description="عدد الجمل")
    paragraphs_count: int = Field(0, description="عدد الفقرات")
    
    # تحليل اللغة
    primary_language: Optional[str] = Field(None, description="اللغة الأساسية")
    languages_detected: List[str] = Field(default_factory=list, description="اللغات المكتشفة")
    
    # الكلمات المفتاحية
    top_keywords: List[Dict[str, Any]] = Field(default_factory=list, description="أهم الكلمات المفتاحية")
    keyword_density: Dict[str, float] = Field(default_factory=dict, description="كثافة الكلمات المفتاحية")
    
    # تحليل المشاعر
    sentiment_score: Optional[float] = Field(None, description="نقاط المشاعر")
    sentiment_label: Optional[str] = Field(None, description="تصنيف المشاعر")
    
    # جودة المحتوى
    readability_score: Optional[float] = Field(None, description="نقاط القابلية للقراءة")
    content_quality_score: Optional[float] = Field(None, description="نقاط جودة المحتوى")
    
    # أنواع المحتوى
    content_types: Dict[ContentType, int] = Field(default_factory=dict, description="أنواع المحتوى")
    
    # المواضيع والفئات
    topics: List[str] = Field(default_factory=list, description="المواضيع")
    categories: List[str] = Field(default_factory=list, description="الفئات")
    
    # تحليل الروابط
    call_to_actions: List[str] = Field(default_factory=list, description="دعوات العمل")
    contact_info: Dict[str, str] = Field(default_factory=dict, description="معلومات الاتصال")
    
    # معلومات إضافية
    last_updated: Optional[datetime] = Field(None, description="آخر تحديث للمحتوى")
    content_freshness: Optional[str] = Field(None, description="حداثة المحتوى")

class CompetitorAnalysis(BaseModel):
    """
    🏆 تحليل المنافسين
    """
    # معلومات المنافس
    competitor_url: str = Field(..., description="رابط المنافس")
    competitor_name: Optional[str] = Field(None, description="اسم المنافس")
    
    # مقارنة الأداء
    traffic_comparison: Dict[str, Any] = Field(default_factory=dict, description="مقارنة الزوار")
    seo_comparison: Dict[str, Any] = Field(default_factory=dict, description="مقارنة SEO")
    content_comparison: Dict[str, Any] = Field(default_factory=dict, description="مقارنة المحتوى")
    
    # الكلمات المفتاحية المشتركة
    shared_keywords: List[str] = Field(default_factory=list, description="الكلمات المفتاحية المشتركة")
    competitor_unique_keywords: List[str] = Field(default_factory=list, description="كلمات المنافس الفريدة")
    
    # نقاط القوة والضعف
    competitor_strengths: List[str] = Field(default_factory=list, description="نقاط قوة المنافس")
    competitor_weaknesses: List[str] = Field(default_factory=list, description="نقاط ضعف المنافس")
    
    # الفرص والتهديدات
    opportunities: List[str] = Field(default_factory=list, description="الفرص")
    threats: List[str] = Field(default_factory=list, description="التهديدات")
    
    # تحليل المحتوى
    content_gaps: List[str] = Field(default_factory=list, description="فجوات المحتوى")
    content_opportunities: List[str] = Field(default_factory=list, description="فرص المحتوى")
    
    # معلومات إضافية
    analysis_date: datetime = Field(default_factory=datetime.now, description="تاريخ التحليل")
    confidence_score: Optional[float] = Field(None, description="نقاط الثقة")

# ==================== نماذج البيانات الرئيسية ====================

class WebsiteAnalysis(BaseModel):
    """
    📊 تحليل الموقع الشامل
    """
    # معلومات أساسية
    url: str = Field(..., description="رابط الموقع")
    domain: Optional[str] = Field(None, description="النطاق")
    website_type: Optional[WebsiteType] = Field(None, description="نوع الموقع")
    
    # التحليلات
    technical_specs: Optional[TechnicalSpecs] = Field(None, description="المواصفات التقنية")
    seo_data: Optional[SEOData] = Field(None, description="بيانات SEO")
    content_analysis: Optional[ContentAnalysis] = Field(None, description="تحليل المحتوى")
    
    # تحليل المنافسين
    competitors: List[CompetitorAnalysis] = Field(default_factory=list, description="تحليل المنافسين")
    
    # النقاط الإجمالية
    overall_score: Optional[float] = Field(None, description="النقاط الإجمالية")
    performance_grade: Optional[str] = Field(None, description="تقييم الأداء")
    
    # التوصيات
    recommendations: List[str] = Field(default_factory=list, description="التوصيات")
    priority_issues: List[str] = Field(default_factory=list, description="المشاكل ذات الأولوية")
    
    # معلومات التحليل
    analysis_date: datetime = Field(default_factory=datetime.now, description="تاريخ التحليل")
    analysis_duration: Optional[float] = Field(None, description="مدة التحليل (ثواني)")
    
    if PYDANTIC_AVAILABLE:
        @validator('url')
        def validate_url(cls, v):
            if isinstance(v, str):
                parsed = urlparse(v)
                if not parsed.scheme or not parsed.netloc:
                    raise ValueError('رابط غير صحيح')
            return v
        
        @root_validator
        def extract_domain(cls, values):
            url = values.get('url')
            if url:
                if isinstance(url, str):
                    parsed = urlparse(url)
                    values['domain'] = parsed.netloc
                else:
                    values['domain'] = url.host
            return values
    
    def get_analysis_summary(self) -> Dict[str, Any]:
        """الحصول على ملخص التحليل"""
        return {
            "url": str(self.url),
            "domain": self.domain,
            "website_type": self.website_type,
            "overall_score": self.overall_score,
            "performance_grade": self.performance_grade,
            "seo_score": self.seo_data.seo_score if self.seo_data else None,
            "page_load_time": self.technical_specs.page_load_time if self.technical_specs else None,
            "mobile_friendly": self.technical_specs.mobile_friendly if self.technical_specs else None,
            "total_words": self.content_analysis.total_words if self.content_analysis else None,
            "competitors_count": len(self.competitors),
            "recommendations_count": len(self.recommendations),
            "analysis_date": self.analysis_date
        }

class WebsiteData(BaseModel):
    """
    🌐 بيانات الموقع الشاملة
    
    نموذج شامل يجمع جميع بيانات الموقع الإلكتروني
    """
    # معرف فريد
    website_id: str = Field(..., description="معرف الموقع الفريد")
    
    # معلومات أساسية
    url: str = Field(..., description="رابط الموقع")
    name: Optional[str] = Field(None, description="اسم الموقع")
    description: Optional[str] = Field(None, description="وصف الموقع")
    
    # معلومات المالك
    owner_name: Optional[str] = Field(None, description="اسم المالك")
    owner_email: Optional[str] = Field(None, description="بريد المالك")
    business_type: Optional[str] = Field(None, description="نوع النشاط")
    
    # التحليل الشامل
    analysis: Optional[WebsiteAnalysis] = Field(None, description="تحليل الموقع")
    
    # بيانات الزوار والأداء
    monthly_visitors: Optional[int] = Field(None, description="الزوار الشهريين")
    bounce_rate: Optional[float] = Field(None, description="معدل الارتداد")
    average_session_duration: Optional[float] = Field(None, description="متوسط مدة الجلسة")
    pages_per_session: Optional[float] = Field(None, description="الصفحات لكل جلسة")
    
    # مصادر الزوار
    traffic_sources: Dict[str, float] = Field(default_factory=dict, description="مصادر الزوار")
    top_pages: List[str] = Field(default_factory=list, description="أهم الصفحات")
    
    # معلومات التحويل
    conversion_rate: Optional[float] = Field(None, description="معدل التحويل")
    goals_completed: Optional[int] = Field(None, description="الأهداف المكتملة")
    
    # الكلمات المفتاحية
    target_keywords: List[str] = Field(default_factory=list, description="الكلمات المفتاحية المستهدفة")
    ranking_keywords: Dict[str, int] = Field(default_factory=dict, description="ترتيب الكلمات المفتاحية")
    
    # وسائل التواصل الاجتماعي
    social_media_links: Dict[str, str] = Field(default_factory=dict, description="روابط وسائل التواصل")
    social_media_followers: Dict[str, int] = Field(default_factory=dict, description="متابعين وسائل التواصل")
    
    # معلومات إضافية
    industry: Optional[str] = Field(None, description="الصناعة")
    target_audience: Optional[str] = Field(None, description="الجمهور المستهدف")
    geographic_focus: List[str] = Field(default_factory=list, description="التركيز الجغرافي")
    
    # حالة الموقع
    is_active: bool = Field(True, description="نشط")
    last_crawled: Optional[datetime] = Field(None, description="آخر زحف")
    
    # تواريخ مهمة
    created_at: datetime = Field(default_factory=datetime.now, description="تاريخ الإنشاء")
    updated_at: Optional[datetime] = Field(None, description="تاريخ آخر تحديث")
    
    # معلومات جودة البيانات
    data_completeness: Optional[float] = Field(None, description="اكتمال البيانات")
    data_accuracy: Optional[float] = Field(None, description="دقة البيانات")
    
    if PYDANTIC_AVAILABLE:
        @root_validator
        def calculate_data_completeness(cls, values):
            # حساب اكتمال البيانات
            total_fields = 15
            completed_fields = 0
            
            fields_to_check = [
                'name', 'description', 'owner_name', 'business_type',
                'analysis', 'monthly_visitors', 'bounce_rate',
                'conversion_rate', 'target_keywords', 'industry',
                'target_audience', 'traffic_sources', 'social_media_links',
                'geographic_focus', 'ranking_keywords'
            ]
            
            for field in fields_to_check:
                value = values.get(field)
                if value:
                    if isinstance(value, (list, dict)) and len(value) > 0:
                        completed_fields += 1
                    elif not isinstance(value, (list, dict)):
                        completed_fields += 1
            
            values['data_completeness'] = (completed_fields / total_fields) * 100
            
            return values
    
    def get_website_summary(self) -> Dict[str, Any]:
        """الحصول على ملخص الموقع"""
        return {
            "website_id": self.website_id,
            "url": str(self.url),
            "name": self.name,
            "business_type": self.business_type,
            "industry": self.industry,
            "monthly_visitors": self.monthly_visitors,
            "bounce_rate": self.bounce_rate,
            "conversion_rate": self.conversion_rate,
            "target_keywords_count": len(self.target_keywords),
            "social_media_presence": len(self.social_media_links),
            "data_completeness": self.data_completeness,
            "is_active": self.is_active,
            "last_updated": self.updated_at
        }
    
    def get_seo_insights(self) -> Dict[str, Any]:
        """الحصول على رؤى SEO"""
        if not self.analysis or not self.analysis.seo_data:
            return {"message": "لا توجد بيانات SEO"}
        
        seo_data = self.analysis.seo_data
        return {
            "seo_score": seo_data.seo_score,
            "seo_grade": seo_data.seo_grade,
            "title_tag_length": len(seo_data.title_tag) if seo_data.title_tag else 0,
            "meta_description_length": len(seo_data.meta_description) if seo_data.meta_description else 0,
            "h1_tags_count": len(seo_data.h1_tags),
            "internal_links": seo_data.internal_links,
            "external_links": seo_data.external_links,
            "broken_links": seo_data.broken_links,
            "images_with_alt_percentage": (seo_data.images_with_alt / seo_data.images_count * 100) if seo_data.images_count > 0 else 0,
            "schema_markup_types": len(seo_data.schema_markup),
            "issues_count": len(seo_data.seo_issues),
            "recommendations_count": len(seo_data.seo_recommendations)
        }
    
    def get_performance_insights(self) -> Dict[str, Any]:
        """الحصول على رؤى الأداء"""
        insights = {
            "traffic_performance": {
                "monthly_visitors": self.monthly_visitors,
                "bounce_rate": self.bounce_rate,
                "session_duration": self.average_session_duration,
                "pages_per_session": self.pages_per_session
            },
            "conversion_performance": {
                "conversion_rate": self.conversion_rate,
                "goals_completed": self.goals_completed
            }
        }
        
        if self.analysis and self.analysis.technical_specs:
            tech_specs = self.analysis.technical_specs
            insights["technical_performance"] = {
                "page_load_time": tech_specs.page_load_time,
                "mobile_friendly": tech_specs.mobile_friendly,
                "ssl_certificate": tech_specs.ssl_certificate,
                "uptime_percentage": tech_specs.uptime_percentage
            }
        
        return insights

# دوال مساعدة
def create_website_data(
    website_id: str,
    url: str,
    **kwargs
) -> WebsiteData:
    """إنشاء بيانات موقع جديد"""
    return WebsiteData(
        website_id=website_id,
        url=url,
        **kwargs
    )

def analyze_website(url: str) -> WebsiteAnalysis:
    """تحليل موقع إلكتروني"""
    # هذه دالة مبسطة - في التطبيق الحقيقي ستقوم بتحليل فعلي
    return WebsiteAnalysis(
        url=url,
        analysis_date=datetime.now()
    )

def compare_websites(
    website1: WebsiteData,
    website2: WebsiteData
) -> Dict[str, Any]:
    """مقارنة موقعين"""
    comparison = {
        "website1": website1.get_website_summary(),
        "website2": website2.get_website_summary(),
        "comparison": {}
    }
    
    # مقارنة المقاييس الأساسية
    metrics = ['monthly_visitors', 'bounce_rate', 'conversion_rate']
    for metric in metrics:
        value1 = getattr(website1, metric, None)
        value2 = getattr(website2, metric, None)
        
        if value1 is not None and value2 is not None:
            comparison["comparison"][metric] = {
                "website1": value1,
                "website2": value2,
                "difference": value1 - value2,
                "percentage_difference": ((value1 - value2) / value2 * 100) if value2 != 0 else None
            }
    
    return comparison

# تصدير النماذج
__all__ = [
    # Enums
    "WebsiteType",
    "ContentType",
    "SEOScore",
    "PageSpeed",
    "MobileOptimization",
    
    # Models
    "TechnicalSpecs",
    "SEOData",
    "ContentAnalysis",
    "CompetitorAnalysis",
    "WebsiteAnalysis",
    "WebsiteData",
    
    # Helper functions
    "create_website_data",
    "analyze_website",
    "compare_websites"
]

