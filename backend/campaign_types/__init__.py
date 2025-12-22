# -*- coding: utf-8 -*-
"""
مكتبة أنواع الحملات الإعلانية
==============================

هذه المكتبة تحتوي على الأنواع الرسمية للحملات الإعلانية المتاحة في Google Ads
مع إعداداتها الكاملة وإنشاءها باستخدام المكتبة الرسمية (v21).

أنواع الحملات المتاحة (7 أنواع حسب واجهة Google Ads):
1. Search Campaigns (بحث) - SEARCH
2. Display Campaigns (الشبكة الإعلانية) - DISPLAY
3. Shopping Campaigns (تسوّق) - SHOPPING
4. Video Campaigns (فيديو) - VIDEO
5. Performance Max (الأداء الأقصى) - PERFORMANCE_MAX
6. Demand Gen Campaigns (الحملات لزيادة الطلب) - DEMAND_GEN
7. App Campaigns (تطبيق) - APP / MULTI_CHANNEL
"""

import logging
from typing import Dict, Any, Type, Optional
from google.ads.googleads.client import GoogleAdsClient

# استيراد الأنواع الرسمية المتاحة فقط (7 أنواع)
from .search_campaign import SearchCampaignCreator
from .display_campaign import DisplayCampaignCreator
from .shopping_campaign import ShoppingCampaignCreator
from .video_campaign import VideoCampaignCreator
from .performance_max_campaign import PerformanceMaxCampaignCreator
from .demand_gen_campaign import DemandGenCampaignCreator
from .app_campaign import AppCampaignCreator

logger = logging.getLogger(__name__)

__all__ = [
    'SearchCampaignCreator',
    'DisplayCampaignCreator', 
    'ShoppingCampaignCreator',
    'VideoCampaignCreator',
    'PerformanceMaxCampaignCreator',
    'DemandGenCampaignCreator',
    'AppCampaignCreator',
    'get_campaign_creator',
    'create_campaign_instance',
    'get_campaign_requirements',
    'CAMPAIGN_TYPES',
    'CAMPAIGN_TYPE_NAMES'
]

# خريطة أنواع الحملات (7 أنواع فقط حسب واجهة Google Ads)
# Format: "TYPE": CreatorClass
CAMPAIGN_TYPES: Dict[str, Type] = {
    # 1. حملات البحث - Search Network
    "SEARCH": SearchCampaignCreator,
    
    # 2. حملات العرض - Display Network
    "DISPLAY": DisplayCampaignCreator,
    
    # 3. حملات التسوق - Shopping
    "SHOPPING": ShoppingCampaignCreator,
    
    # 4. حملات الفيديو - Video
    "VIDEO": VideoCampaignCreator,
    
    # 5. حملات الأداء الأقصى - Performance Max
    "PERFORMANCE_MAX": PerformanceMaxCampaignCreator,
    "PMAX": PerformanceMaxCampaignCreator,  # Alias
    
    # 6. حملات توليد الطلب - Demand Gen (Video-based)
    "DEMAND_GEN": DemandGenCampaignCreator,
    
    # 7. حملات التطبيقات - App Campaigns
    "APP": AppCampaignCreator,
    "MULTI_CHANNEL": AppCampaignCreator,  # Alias (official API name)
}

# أسماء الحملات بالعربية (7 أنواع فقط)
CAMPAIGN_TYPE_NAMES: Dict[str, str] = {
    "SEARCH": "بحث",
    "DISPLAY": "الشبكة الإعلانية",
    "SHOPPING": "تسوّق",
    "VIDEO": "فيديو",
    "PERFORMANCE_MAX": "الأداء الأقصى",
    "PMAX": "الأداء الأقصى",
    "DEMAND_GEN": "الحملات لزيادة الطلب",
    "APP": "تطبيق",
    "MULTI_CHANNEL": "تطبيق",
}


def get_campaign_creator(campaign_type: str) -> Optional[Type]:
    """
    الحصول على فئة منشئ الحملة حسب النوع
    
    Args:
        campaign_type: نوع الحملة (مثل: SEARCH, DISPLAY, PERFORMANCE_MAX)
        
    Returns:
        فئة منشئ الحملة أو None إذا لم يتم العثور على النوع
        
    Example:
        creator_class = get_campaign_creator("SEARCH")
        if creator_class:
            creator = creator_class(client, customer_id)
    """
    campaign_type_upper = campaign_type.upper().strip()
    creator_class = CAMPAIGN_TYPES.get(campaign_type_upper)
    
    if creator_class is None:
        logger.warning(f"نوع الحملة '{campaign_type}' غير معروف. الأنواع المتاحة: {list(CAMPAIGN_TYPES.keys())}")
        
    return creator_class


def create_campaign_instance(campaign_type: str, client: GoogleAdsClient, customer_id: str):
    """
    إنشاء instance من منشئ الحملة حسب النوع
    
    Args:
        campaign_type: نوع الحملة (مثل: SEARCH, DISPLAY, PERFORMANCE_MAX)
        client: عميل Google Ads API
        customer_id: معرف العميل
        
    Returns:
        instance من منشئ الحملة أو None إذا لم يتم العثور على النوع
        
    Example:
        creator = create_campaign_instance("SEARCH", client, "1234567890")
        if creator:
            result = creator.create_search_campaign(...)
    """
    creator_class = get_campaign_creator(campaign_type)
    
    if creator_class is None:
        logger.error(f"فشل في إنشاء instance لنوع الحملة '{campaign_type}'")
        return None
    
    try:
        creator_instance = creator_class(client, customer_id)
        logger.info(f"✅ تم إنشاء instance لـ {CAMPAIGN_TYPE_NAMES.get(campaign_type.upper(), campaign_type)}")
        return creator_instance
    except Exception as e:
        logger.error(f"❌ خطأ في إنشاء instance لنوع الحملة '{campaign_type}': {e}")
        return None


def get_campaign_requirements(campaign_type: str) -> Optional[Dict[str, Any]]:
    """
    الحصول على متطلبات الحملة حسب النوع
    
    Args:
        campaign_type: نوع الحملة (مثل: SEARCH, DISPLAY, PERFORMANCE_MAX)
        
    Returns:
        قاموس متطلبات الحملة أو None إذا لم يتم العثور على النوع
        
    Example:
        requirements = get_campaign_requirements("PERFORMANCE_MAX")
        if requirements:
            print(f"متطلبات الصور: {requirements['image_requirements']}")
    """
    creator_class = get_campaign_creator(campaign_type)
    
    if creator_class is None:
        return None
    
    try:
        # إنشاء instance مؤقت للحصول على المتطلبات
        # نستخدم None للclient و customer_id لأنه لا نحتاجها للحصول على المتطلبات فقط
        temp_instance = creator_class(None, None)
        requirements = temp_instance.get_campaign_requirements()
        return requirements
    except Exception as e:
        logger.error(f"❌ خطأ في الحصول على متطلبات الحملة '{campaign_type}': {e}")
        return None
