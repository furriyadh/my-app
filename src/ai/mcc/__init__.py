#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🏢 MCC Management Package - حزمة إدارة MCC
==========================================

هذه الحزمة توفر نظام شامل لإدارة حسابات Google Ads MCC
بما في ذلك:

- إدارة حسابات MCC متعددة
- اكتشاف الحسابات تلقائياً
- العمليات الجماعية
- مراقبة الأداء
- التقارير الموحدة

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

__version__ = "1.0.0"
__author__ = "Google Ads AI Platform Team"
__email__ = "support@googleadsai.com"

# استيراد الكلاسات الرئيسية
try:
    from .mcc_manager import (
        MCCManager,
        MCCAccount,
        MCCAccountStatus,
        MCCAccountType,
        MCCSettings
    )
    
    from .account_discovery import (
        AccountDiscovery,
        DiscoverySettings,
        AccountFilter
    )
    
    from .bulk_operations import (
        BulkOperationsManager,
        OperationType,
        OperationStatus,
        OperationResult,
        BulkOperationSummary,
        BulkOperationConfig
    )
    
    # دوال مساعدة سريعة
    from .mcc_manager import get_mcc_manager
    from .account_discovery import discover_accounts
    from .bulk_operations import (
        get_bulk_operations_manager,
        create_campaigns_for_all_accounts,
        update_budgets_for_all_accounts
    )
    
    __all__ = [
        # الكلاسات الرئيسية
        'MCCManager',
        'MCCAccount',
        'MCCAccountStatus',
        'MCCAccountType',
        'MCCSettings',
        'AccountDiscovery',
        'DiscoverySettings',
        'AccountFilter',
        'BulkOperationsManager',
        'OperationType',
        'OperationStatus',
        'OperationResult',
        'BulkOperationSummary',
        'BulkOperationConfig',
        
        # الدوال المساعدة
        'get_mcc_manager',
        'discover_accounts',
        'get_bulk_operations_manager',
        'create_campaigns_for_all_accounts',
        'update_budgets_for_all_accounts',
        
        # دوال الاختبار
        'test_mcc_system',
        'get_system_info'
    ]
    
    # رسالة ترحيب
    print("🏢 تم تحميل نظام إدارة MCC بنجاح!")
    print(f"📦 الإصدار: {__version__}")
    
except ImportError as e:
    print(f"⚠️ تحذير: فشل في استيراد بعض وحدات MCC: {e}")
    __all__ = []

def test_mcc_system() -> bool:
    """
    اختبار سريع لنظام MCC
    
    Returns:
        bool: True إذا كان النظام يعمل بشكل صحيح
    """
    try:
        print("🧪 اختبار نظام MCC...")
        
        # اختبار MCCManager
        mcc_manager = get_mcc_manager()
        print("✅ MCCManager: يعمل")
        
        # اختبار AccountDiscovery
        discovery = AccountDiscovery()
        print("✅ AccountDiscovery: يعمل")
        
        # اختبار BulkOperationsManager
        bulk_manager = get_bulk_operations_manager()
        print("✅ BulkOperationsManager: يعمل")
        
        print("🎉 جميع مكونات نظام MCC تعمل بشكل صحيح!")
        return True
        
    except Exception as e:
        print(f"❌ خطأ في اختبار نظام MCC: {e}")
        return False

def get_system_info() -> dict:
    """
    الحصول على معلومات النظام
    
    Returns:
        dict: معلومات النظام
    """
    try:
        info = {
            'package_name': 'MCC Management Package',
            'version': __version__,
            'author': __author__,
            'components': {
                'mcc_manager': 'MCCManager - إدارة حسابات MCC',
                'account_discovery': 'AccountDiscovery - اكتشاف الحسابات',
                'bulk_operations': 'BulkOperationsManager - العمليات الجماعية'
            },
            'features': [
                'إدارة حسابات MCC متعددة',
                'اكتشاف الحسابات تلقائياً',
                'العمليات الجماعية',
                'مراقبة الأداء',
                'التقارير الموحدة'
            ],
            'status': 'active'
        }
        
        # اختبار توفر المكونات
        try:
            get_mcc_manager()
            info['mcc_manager_available'] = True
        except:
            info['mcc_manager_available'] = False
        
        try:
            AccountDiscovery()
            info['account_discovery_available'] = True
        except:
            info['account_discovery_available'] = False
        
        try:
            get_bulk_operations_manager()
            info['bulk_operations_available'] = True
        except:
            info['bulk_operations_available'] = False
        
        return info
        
    except Exception as e:
        return {
            'error': f'فشل في الحصول على معلومات النظام: {e}',
            'status': 'error'
        }

# إعداد نظام السجلات
import logging
logger = logging.getLogger(__name__)

# رسالة تهيئة
logger.info(f"🏢 تم تهيئة حزمة إدارة MCC - الإصدار {__version__}")

