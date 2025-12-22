#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🧠 Google Ads AI Platform - Core AI Package
===========================================

نظام الذكاء الاصطناعي المتكامل لمنصة Google Ads AI Platform.

الوحدات الرئيسية:
- mcc/: نظام إدارة MCC
- generator/: نظام توليد الحملات
- processors/: معالجة وتحسين البيانات
- config/: إعدادات ومصادقة APIs
- utils/: أدوات مساعدة
- integrations/: التكاملات

المميزات:
✅ إدارة حسابات MCC متعددة
✅ توليد حملات إعلانية ذكية
✅ معالجة متقدمة للبيانات
✅ تحسين تلقائي للحملات
✅ دعم متعدد اللغات (عربي/إنجليزي)

الإصدار: 2.0.0
التاريخ: 2025-07-07
"""

__version__ = "2.0.0"
__author__ = "Google Ads AI Platform Team"
__description__ = "Advanced AI system for Google Ads campaign generation and optimization with MCC support"

import logging

# إعداد نظام السجلات
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# استيراد الوحدات الأساسية
try:
    from . import config
    CONFIG_AVAILABLE = True
except ImportError as e:
    logger.warning(f"وحدة config غير متاحة: {e}")
    CONFIG_AVAILABLE = False

try:
    from . import utils
    UTILS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"وحدة utils غير متاحة: {e}")
    UTILS_AVAILABLE = False

try:
    from . import mcc
    MCC_AVAILABLE = True
except ImportError as e:
    logger.warning(f"وحدة mcc غير متاحة: {e}")
    MCC_AVAILABLE = False

try:
    from . import generator
    GENERATOR_AVAILABLE = True
except ImportError as e:
    logger.warning(f"وحدة generator غير متاحة: {e}")
    GENERATOR_AVAILABLE = False

try:
    from . import processors
    PROCESSORS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"وحدة processors غير متاحة: {e}")
    PROCESSORS_AVAILABLE = False

try:
    from . import integrations
    INTEGRATIONS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"وحدة integrations غير متاحة: {e}")
    INTEGRATIONS_AVAILABLE = False

# استيراد الكلاسات المهمة (مع معالجة الأخطاء)
_exported_classes = []

# استيراد من config
if CONFIG_AVAILABLE:
    try:
        from .config import GoogleAdsConfig
        _exported_classes.append("GoogleAdsConfig")
    except ImportError:
        pass

# استيراد من utils
if UTILS_AVAILABLE:
    try:
        from .utils import get_cache_manager, get_rate_limiter, get_error_handler
        _exported_classes.extend(["get_cache_manager", "get_rate_limiter", "get_error_handler"])
    except ImportError:
        pass

# استيراد من mcc
if MCC_AVAILABLE:
    try:
        from .mcc import MCCManager, AccountDiscovery, BulkOperationsManager
        _exported_classes.extend(["MCCManager", "AccountDiscovery", "BulkOperationsManager"])
    except ImportError:
        pass

# استيراد من generator
if GENERATOR_AVAILABLE:
    try:
        from .generator import CampaignGenerator
        _exported_classes.append("CampaignGenerator")
    except ImportError:
        pass

# استيراد من processors
if PROCESSORS_AVAILABLE:
    try:
        from .processors import DataProcessor
        _exported_classes.append("DataProcessor")
    except ImportError:
        pass

# استيراد من integrations
if INTEGRATIONS_AVAILABLE:
    try:
        from .integrations import GoogleAdsAPI, CampaignExporter, DataMapper, APIConnector
        _exported_classes.extend(["GoogleAdsAPI", "CampaignExporter", "DataMapper", "APIConnector"])
    except ImportError:
        pass

# تحديد __all__ ديناميكياً
__all__ = [
    # معلومات الحزمة
    "__version__",
    "__author__",
    "__description__",
    
    # دوال النظام
    "get_system_info",
    "test_system",
    "initialize_system"
] + _exported_classes

# دالة مساعدة للحصول على معلومات النظام
def get_system_info():
    """
    الحصول على معلومات نظام الذكاء الاصطناعي
    
    Returns:
        dict: معلومات النظام والوحدات المتاحة
    """
    info = {
        "version": __version__,
        "author": __author__,
        "description": __description__,
        "modules": {
            "config": CONFIG_AVAILABLE,
            "utils": UTILS_AVAILABLE,
            "mcc": MCC_AVAILABLE,
            "generator": GENERATOR_AVAILABLE,
            "processors": PROCESSORS_AVAILABLE,
            "integrations": INTEGRATIONS_AVAILABLE
        },
        "available_classes": _exported_classes,
        "total_modules": sum([
            CONFIG_AVAILABLE,
            UTILS_AVAILABLE, 
            MCC_AVAILABLE,
            GENERATOR_AVAILABLE,
            PROCESSORS_AVAILABLE,
            INTEGRATIONS_AVAILABLE
        ])
    }
    
    return info

def test_system():
    """
    اختبار سريع لنظام الذكاء الاصطناعي
    
    Returns:
        dict: نتائج الاختبار
    """
    results = {
        "system_status": "OK",
        "modules_tested": 0,
        "modules_passed": 0,
        "modules_failed": 0,
        "errors": []
    }
    
    # اختبار الوحدات المتاحة
    modules_to_test = [
        ("config", CONFIG_AVAILABLE),
        ("utils", UTILS_AVAILABLE),
        ("mcc", MCC_AVAILABLE),
        ("generator", GENERATOR_AVAILABLE),
        ("processors", PROCESSORS_AVAILABLE),
        ("integrations", INTEGRATIONS_AVAILABLE)
    ]
    
    for module_name, is_available in modules_to_test:
        results["modules_tested"] += 1
        
        if is_available:
            try:
                # اختبار بسيط للوحدة
                module = globals().get(module_name)
                if module:
                    results["modules_passed"] += 1
                    logger.info(f"✅ وحدة {module_name} تعمل بشكل صحيح")
                else:
                    results["modules_failed"] += 1
                    results["errors"].append(f"وحدة {module_name} غير متاحة في globals")
            except Exception as e:
                results["modules_failed"] += 1
                results["errors"].append(f"خطأ في اختبار وحدة {module_name}: {str(e)}")
                logger.error(f"❌ فشل اختبار وحدة {module_name}: {e}")
        else:
            results["modules_failed"] += 1
            results["errors"].append(f"وحدة {module_name} غير متاحة")
    
    # تحديد حالة النظام العامة
    if results["modules_failed"] == 0:
        results["system_status"] = "EXCELLENT"
    elif results["modules_passed"] > results["modules_failed"]:
        results["system_status"] = "GOOD"
    else:
        results["system_status"] = "NEEDS_ATTENTION"
    
    # حساب نسبة النجاح
    success_rate = (results["modules_passed"] / results["modules_tested"]) * 100
    results["success_rate"] = round(success_rate, 1)
    
    return results

def initialize_system(config_path=None):
    """
    تهيئة نظام الذكاء الاصطناعي
    
    Args:
        config_path: مسار ملف الإعدادات (اختياري)
        
    Returns:
        dict: نتائج التهيئة
    """
    logger.info("🚀 بدء تهيئة نظام الذكاء الاصطناعي...")
    
    initialization_results = {
        "status": "SUCCESS",
        "initialized_modules": [],
        "failed_modules": [],
        "warnings": []
    }
    
    # تهيئة الوحدات المتاحة
    if CONFIG_AVAILABLE:
        try:
            # تهيئة إعدادات النظام
            logger.info("🔧 تهيئة وحدة الإعدادات...")
            initialization_results["initialized_modules"].append("config")
        except Exception as e:
            initialization_results["failed_modules"].append(f"config: {str(e)}")
    
    if UTILS_AVAILABLE:
        try:
            # تهيئة الأدوات المساعدة
            logger.info("🛠️ تهيئة الأدوات المساعدة...")
            initialization_results["initialized_modules"].append("utils")
        except Exception as e:
            initialization_results["failed_modules"].append(f"utils: {str(e)}")
    
    if MCC_AVAILABLE:
        try:
            # تهيئة نظام MCC
            logger.info("🏢 تهيئة نظام MCC...")
            initialization_results["initialized_modules"].append("mcc")
        except Exception as e:
            initialization_results["failed_modules"].append(f"mcc: {str(e)}")
    
    # تحديد حالة التهيئة النهائية
    if initialization_results["failed_modules"]:
        initialization_results["status"] = "PARTIAL"
        if len(initialization_results["failed_modules"]) > len(initialization_results["initialized_modules"]):
            initialization_results["status"] = "FAILED"
    
    logger.info(f"✅ تم إنجاز تهيئة النظام بحالة: {initialization_results['status']}")
    
    return initialization_results

# رسالة ترحيب عند تحميل الوحدة
logger.info(f"🧠 تم تحميل نظام الذكاء الاصطناعي v{__version__}")
logger.info(f"📊 الوحدات المتاحة: {sum([CONFIG_AVAILABLE, UTILS_AVAILABLE, MCC_AVAILABLE, GENERATOR_AVAILABLE, PROCESSORS_AVAILABLE, INTEGRATIONS_AVAILABLE])}/6")

# تشغيل اختبار سريع عند التحميل
try:
    test_results = test_system()
    logger.info(f"🎯 نسبة نجاح النظام: {test_results['success_rate']}%")
except Exception as e:
    logger.warning(f"⚠️ فشل في تشغيل الاختبار السريع: {e}")

