#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🔗 AI Integrations Module - وحدة التكاملات
==========================================

وحدة التكاملات الشاملة لنظام Google Ads AI Platform.
تدعم التكامل مع APIs مختلفة وتصدير البيانات.

الوحدات المتاحة:
- google_ads_api: تكامل Google Ads API المتقدم
- campaign_exporter: تصدير الحملات بصيغ متعددة
- data_mapper: ربط وتحويل البيانات
- api_connector: موصل APIs عام

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
from typing import Dict, Any, List, Optional

# إعداد السجل
logger = logging.getLogger(__name__)

# معلومات الوحدة
__version__ = "1.0.0"
__author__ = "Google Ads AI Platform Team"
__description__ = "AI Integrations Module for Google Ads Platform"

# استيراد الوحدات الرئيسية
try:
    from .google_ads_api import GoogleAdsAPIIntegration
    from .campaign_exporter import CampaignExporter
    from .data_mapper import DataMapper
    from .api_connector import APIConnector
    
    INTEGRATIONS_AVAILABLE = True
    logger.info("🔗 تم تحميل وحدة التكاملات بنجاح")
    
except ImportError as e:
    INTEGRATIONS_AVAILABLE = False
    logger.warning(f"⚠️ فشل في تحميل بعض وحدات التكاملات: {e}")
    
    # إنشاء كلاسات وهمية لتجنب الأخطاء
    class GoogleAdsAPIIntegration:
        def __init__(self, *args, **kwargs):
            raise ImportError("GoogleAdsAPIIntegration غير متاح")
    
    class CampaignExporter:
        def __init__(self, *args, **kwargs):
            raise ImportError("CampaignExporter غير متاح")
    
    class DataMapper:
        def __init__(self, *args, **kwargs):
            raise ImportError("DataMapper غير متاح")
    
    class APIConnector:
        def __init__(self, *args, **kwargs):
            raise ImportError("APIConnector غير متاح")

def get_integration_status() -> Dict[str, Any]:
    """
    الحصول على حالة التكاملات
    
    Returns:
        Dict[str, Any]: حالة التكاملات
    """
    return {
        'available': INTEGRATIONS_AVAILABLE,
        'version': __version__,
        'modules': {
            'google_ads_api': 'GoogleAdsAPIIntegration' in globals(),
            'campaign_exporter': 'CampaignExporter' in globals(),
            'data_mapper': 'DataMapper' in globals(),
            'api_connector': 'APIConnector' in globals()
        }
    }

def test_integrations() -> bool:
    """
    اختبار التكاملات
    
    Returns:
        bool: True إذا كانت التكاملات تعمل
    """
    try:
        # اختبار أساسي للوحدات
        status = get_integration_status()
        
        if not status['available']:
            logger.error("❌ التكاملات غير متاحة")
            return False
        
        # اختبار إنشاء الكائنات
        try:
            # اختبار APIConnector
            connector = APIConnector()
            logger.info("✅ APIConnector يعمل")
            
            # اختبار DataMapper
            mapper = DataMapper()
            logger.info("✅ DataMapper يعمل")
            
            logger.info("✅ جميع التكاملات تعمل بشكل صحيح")
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في اختبار التكاملات: {e}")
            return False
            
    except Exception as e:
        logger.error(f"❌ خطأ في اختبار التكاملات: {e}")
        return False

# دوال مساعدة سريعة
def get_google_ads_integration(config: Optional[Dict[str, Any]] = None) -> GoogleAdsAPIIntegration:
    """الحصول على تكامل Google Ads"""
    return GoogleAdsAPIIntegration(config=config)

def get_campaign_exporter(format_type: str = "json") -> CampaignExporter:
    """الحصول على مُصدر الحملات"""
    return CampaignExporter(format_type=format_type)

def get_data_mapper(mapping_config: Optional[Dict[str, Any]] = None) -> DataMapper:
    """الحصول على مُحول البيانات"""
    return DataMapper(mapping_config=mapping_config)

def get_api_connector(base_url: Optional[str] = None) -> APIConnector:
    """الحصول على موصل API"""
    return APIConnector(base_url=base_url)

# تصدير الوحدات المهمة
__all__ = [
    # الكلاسات الرئيسية
    'GoogleAdsAPIIntegration',
    'CampaignExporter', 
    'DataMapper',
    'APIConnector',
    
    # الدوال المساعدة
    'get_integration_status',
    'test_integrations',
    'get_google_ads_integration',
    'get_campaign_exporter',
    'get_data_mapper',
    'get_api_connector',
    
    # المتغيرات
    'INTEGRATIONS_AVAILABLE',
    '__version__'
]

# رسالة ترحيب
if INTEGRATIONS_AVAILABLE:
    logger.info(f"🚀 وحدة التكاملات جاهزة - الإصدار {__version__}")
else:
    logger.warning("⚠️ وحدة التكاملات تعمل في وضع محدود")

