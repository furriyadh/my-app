#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
📊 AI Models Package - حزمة نماذج البيانات
==========================================

مجموعة شاملة من نماذج البيانات لنظام الذكاء الاصطناعي:
- نماذج بيانات المواقع والأعمال
- نماذج الحملات الإعلانية والمحتوى
- نماذج خطط الاشتراك والاستجابات
- نماذج MCC وإدارة الحسابات
- نماذج التحليلات والإحصائيات

المميزات:
✅ نماذج بيانات متقدمة مع Pydantic
✅ تحقق تلقائي من صحة البيانات
✅ تسلسل وإلغاء تسلسل JSON
✅ توثيق شامل للحقول
✅ دعم العلاقات المعقدة
✅ تحويلات تلقائية للأنواع

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

__version__ = "1.0.0"
__author__ = "Google Ads AI Platform Team"
__description__ = "Advanced data models for AI-powered Google Ads platform"

import logging
from typing import Dict, Any, List, Optional, Union

# إعداد نظام السجلات
logger = logging.getLogger(__name__)

# استيراد النماذج الأساسية
try:
    from .website_data import (
        WebsiteData,
        WebsiteAnalysis,
        SEOData,
        ContentAnalysis,
        TechnicalSpecs,
        CompetitorAnalysis
    )
    WEBSITE_MODELS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"نماذج بيانات المواقع غير متاحة: {e}")
    WEBSITE_MODELS_AVAILABLE = False

try:
    from .campaign_data import (
        CampaignData,
        AdGroup,
        Advertisement,
        Keyword,
        CampaignSettings,
        BudgetSettings,
        TargetingSettings,
        CampaignPerformance
    )
    CAMPAIGN_MODELS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"نماذج بيانات الحملات غير متاحة: {e}")
    CAMPAIGN_MODELS_AVAILABLE = False

try:
    from .subscription_plans import (
        SubscriptionPlan,
        PlanFeature,
        PlanLimits,
        BillingInfo,
        UsageStats,
        PlanComparison
    )
    SUBSCRIPTION_MODELS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"نماذج خطط الاشتراك غير متاحة: {e}")
    SUBSCRIPTION_MODELS_AVAILABLE = False

try:
    from .business_data import (
        BusinessData,
        BusinessProfile,
        ContactInfo,
        BusinessMetrics,
        MarketAnalysis,
        CompetitorProfile,
        IndustryData
    )
    BUSINESS_MODELS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"نماذج بيانات الأعمال غير متاحة: {e}")
    BUSINESS_MODELS_AVAILABLE = False

try:
    from .ad_content import (
        AdContent,
        Headline,
        Description,
        CallToAction,
        AdAssets,
        CreativeVariation,
        ContentTemplate,
        AdPreview
    )
    AD_CONTENT_MODELS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"نماذج المحتوى الإعلاني غير متاحة: {e}")
    AD_CONTENT_MODELS_AVAILABLE = False

try:
    from .response_models import (
        APIResponse,
        SuccessResponse,
        ErrorResponse,
        ValidationError,
        PaginatedResponse,
        BulkOperationResponse,
        AnalyticsResponse
    )
    RESPONSE_MODELS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"نماذج الاستجابات غير متاحة: {e}")
    RESPONSE_MODELS_AVAILABLE = False

# تجميع جميع النماذج المتاحة
_available_models = []

if WEBSITE_MODELS_AVAILABLE:
    _available_models.extend([
        "WebsiteData", "WebsiteAnalysis", "SEOData", "ContentAnalysis",
        "TechnicalSpecs", "CompetitorAnalysis"
    ])

if CAMPAIGN_MODELS_AVAILABLE:
    _available_models.extend([
        "CampaignData", "AdGroup", "Advertisement", "Keyword",
        "CampaignSettings", "BudgetSettings", "TargetingSettings", "CampaignPerformance"
    ])

if SUBSCRIPTION_MODELS_AVAILABLE:
    _available_models.extend([
        "SubscriptionPlan", "PlanFeature", "PlanLimits", "BillingInfo",
        "UsageStats", "PlanComparison"
    ])

if BUSINESS_MODELS_AVAILABLE:
    _available_models.extend([
        "BusinessData", "BusinessProfile", "ContactInfo", "BusinessMetrics",
        "MarketAnalysis", "CompetitorProfile", "IndustryData"
    ])

if AD_CONTENT_MODELS_AVAILABLE:
    _available_models.extend([
        "AdContent", "Headline", "Description", "CallToAction",
        "AdAssets", "CreativeVariation", "ContentTemplate", "AdPreview"
    ])

if RESPONSE_MODELS_AVAILABLE:
    _available_models.extend([
        "APIResponse", "SuccessResponse", "ErrorResponse", "ValidationError",
        "PaginatedResponse", "BulkOperationResponse", "AnalyticsResponse"
    ])

# تحديد __all__ ديناميكياً
__all__ = [
    # معلومات الحزمة
    "__version__",
    "__author__",
    "__description__",
    
    # دوال النظام
    "get_available_models",
    "validate_model_data",
    "create_model_instance",
    "get_model_schema",
    "export_models_schema"
] + _available_models

def get_available_models() -> Dict[str, List[str]]:
    """
    الحصول على قائمة النماذج المتاحة مجمعة حسب الفئة
    
    Returns:
        Dict[str, List[str]]: النماذج المتاحة حسب الفئة
    """
    models_by_category = {}
    
    if WEBSITE_MODELS_AVAILABLE:
        models_by_category["website"] = [
            "WebsiteData", "WebsiteAnalysis", "SEOData", "ContentAnalysis",
            "TechnicalSpecs", "CompetitorAnalysis"
        ]
    
    if CAMPAIGN_MODELS_AVAILABLE:
        models_by_category["campaign"] = [
            "CampaignData", "AdGroup", "Advertisement", "Keyword",
            "CampaignSettings", "BudgetSettings", "TargetingSettings", "CampaignPerformance"
        ]
    
    if SUBSCRIPTION_MODELS_AVAILABLE:
        models_by_category["subscription"] = [
            "SubscriptionPlan", "PlanFeature", "PlanLimits", "BillingInfo",
            "UsageStats", "PlanComparison"
        ]
    
    if BUSINESS_MODELS_AVAILABLE:
        models_by_category["business"] = [
            "BusinessData", "BusinessProfile", "ContactInfo", "BusinessMetrics",
            "MarketAnalysis", "CompetitorProfile", "IndustryData"
        ]
    
    if AD_CONTENT_MODELS_AVAILABLE:
        models_by_category["ad_content"] = [
            "AdContent", "Headline", "Description", "CallToAction",
            "AdAssets", "CreativeVariation", "ContentTemplate", "AdPreview"
        ]
    
    if RESPONSE_MODELS_AVAILABLE:
        models_by_category["response"] = [
            "APIResponse", "SuccessResponse", "ErrorResponse", "ValidationError",
            "PaginatedResponse", "BulkOperationResponse", "AnalyticsResponse"
        ]
    
    return models_by_category

def validate_model_data(model_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    التحقق من صحة بيانات النموذج
    
    Args:
        model_name: اسم النموذج
        data: البيانات المراد التحقق منها
        
    Returns:
        Dict[str, Any]: نتيجة التحقق
    """
    try:
        # الحصول على النموذج من globals
        model_class = globals().get(model_name)
        
        if model_class is None:
            return {
                "valid": False,
                "error": f"النموذج {model_name} غير موجود",
                "data": None
            }
        
        # إنشاء مثيل من النموذج للتحقق
        instance = model_class(**data)
        
        return {
            "valid": True,
            "error": None,
            "data": instance.dict() if hasattr(instance, 'dict') else instance.__dict__
        }
        
    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
            "data": None
        }

def create_model_instance(model_name: str, data: Dict[str, Any]) -> Optional[Any]:
    """
    إنشاء مثيل من النموذج
    
    Args:
        model_name: اسم النموذج
        data: بيانات النموذج
        
    Returns:
        Optional[Any]: مثيل النموذج أو None
    """
    try:
        model_class = globals().get(model_name)
        
        if model_class is None:
            logger.error(f"النموذج {model_name} غير موجود")
            return None
        
        return model_class(**data)
        
    except Exception as e:
        logger.error(f"فشل في إنشاء مثيل من النموذج {model_name}: {e}")
        return None

def get_model_schema(model_name: str) -> Optional[Dict[str, Any]]:
    """
    الحصول على مخطط النموذج
    
    Args:
        model_name: اسم النموذج
        
    Returns:
        Optional[Dict[str, Any]]: مخطط النموذج أو None
    """
    try:
        model_class = globals().get(model_name)
        
        if model_class is None:
            return None
        
        # محاولة الحصول على مخطط Pydantic
        if hasattr(model_class, 'schema'):
            return model_class.schema()
        
        # إذا لم يكن Pydantic، إرجاع معلومات أساسية
        return {
            "title": model_name,
            "type": "object",
            "description": getattr(model_class, '__doc__', ''),
            "properties": {}
        }
        
    except Exception as e:
        logger.error(f"فشل في الحصول على مخطط النموذج {model_name}: {e}")
        return None

def export_models_schema() -> Dict[str, Any]:
    """
    تصدير مخططات جميع النماذج المتاحة
    
    Returns:
        Dict[str, Any]: مخططات جميع النماذج
    """
    schemas = {}
    
    for model_name in _available_models:
        schema = get_model_schema(model_name)
        if schema:
            schemas[model_name] = schema
    
    return {
        "models_count": len(schemas),
        "available_categories": list(get_available_models().keys()),
        "schemas": schemas,
        "generated_at": "2025-07-07",
        "version": __version__
    }

# معلومات إحصائية عن النماذج
def get_models_statistics() -> Dict[str, Any]:
    """
    الحصول على إحصائيات النماذج
    
    Returns:
        Dict[str, Any]: إحصائيات النماذج
    """
    categories = get_available_models()
    
    return {
        "total_models": len(_available_models),
        "categories_count": len(categories),
        "models_by_category": {
            category: len(models) for category, models in categories.items()
        },
        "availability": {
            "website_models": WEBSITE_MODELS_AVAILABLE,
            "campaign_models": CAMPAIGN_MODELS_AVAILABLE,
            "subscription_models": SUBSCRIPTION_MODELS_AVAILABLE,
            "business_models": BUSINESS_MODELS_AVAILABLE,
            "ad_content_models": AD_CONTENT_MODELS_AVAILABLE,
            "response_models": RESPONSE_MODELS_AVAILABLE
        },
        "version": __version__
    }

# رسالة ترحيب عند تحميل الوحدة
logger.info(f"📊 تم تحميل حزمة نماذج البيانات v{__version__}")
logger.info(f"🎯 النماذج المتاحة: {len(_available_models)} نموذج في {len(get_available_models())} فئات")

# تصدير دوال إضافية
__all__.extend(["get_models_statistics"])

