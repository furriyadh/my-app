#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
📝 Logger Utility - أداة السجلات
===============================

نظام سجلات متقدم لمنصة Google Ads AI Platform
يدعم تسجيل الأحداث والأخطاء بتنسيق عربي وإنجليزي

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import logging
import os
import sys
from datetime import datetime
from typing import Optional
from pathlib import Path

def setup_logger(
    name: str,
    level: str = "INFO",
    log_file: Optional[str] = None,
    format_style: str = "detailed"
) -> logging.Logger:
    """
    إعداد نظام السجلات
    
    Args:
        name: اسم السجل
        level: مستوى السجل (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: مسار ملف السجل (اختياري)
        format_style: نمط التنسيق (simple, detailed, json)
    
    Returns:
        logging.Logger: كائن السجل
    """
    
    # إنشاء السجل
    logger = logging.getLogger(name)
    
    # تجنب إضافة handlers متعددة
    if logger.handlers:
        return logger
    
    # تحديد مستوى السجل
    log_levels = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
        "CRITICAL": logging.CRITICAL
    }
    
    logger.setLevel(log_levels.get(level.upper(), logging.INFO))
    
    # تحديد تنسيق السجل
    if format_style == "simple":
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    elif format_style == "json":
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "logger": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    else:  # detailed
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    # إضافة handler للكونسول
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # إضافة handler للملف إذا تم تحديده
    if log_file:
        # إنشاء مجلد السجلات إذا لم يكن موجوداً
        log_dir = Path(log_file).parent
        log_dir.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

def get_default_logger(name: str) -> logging.Logger:
    """
    الحصول على سجل افتراضي
    
    Args:
        name: اسم السجل
    
    Returns:
        logging.Logger: كائن السجل
    """
    # تحديد مسار ملف السجل
    log_dir = os.getenv('LOG_DIR', 'logs')
    log_file = os.path.join(log_dir, f"{name.replace('.', '_')}.log")
    
    return setup_logger(
        name=name,
        level=os.getenv('LOG_LEVEL', 'INFO'),
        log_file=log_file,
        format_style='detailed'
    )

# إنشاء سجل افتراضي للمشروع
project_logger = get_default_logger('google_ads_ai_platform')

# دوال مساعدة سريعة
def log_info(message: str, logger_name: str = 'google_ads_ai_platform'):
    """تسجيل رسالة معلومات"""
    logger = logging.getLogger(logger_name)
    logger.info(message)

def log_warning(message: str, logger_name: str = 'google_ads_ai_platform'):
    """تسجيل رسالة تحذير"""
    logger = logging.getLogger(logger_name)
    logger.warning(message)

def log_error(message: str, logger_name: str = 'google_ads_ai_platform'):
    """تسجيل رسالة خطأ"""
    logger = logging.getLogger(logger_name)
    logger.error(message)

def log_debug(message: str, logger_name: str = 'google_ads_ai_platform'):
    """تسجيل رسالة تصحيح"""
    logger = logging.getLogger(logger_name)
    logger.debug(message)

# اختبار النظام
if __name__ == "__main__":
    # اختبار نظام السجلات
    test_logger = setup_logger("test_logger", "DEBUG")
    
    test_logger.debug("🔍 رسالة تصحيح")
    test_logger.info("ℹ️ رسالة معلومات")
    test_logger.warning("⚠️ رسالة تحذير")
    test_logger.error("❌ رسالة خطأ")
    test_logger.critical("🚨 رسالة حرجة")
    
    print("✅ تم اختبار نظام السجلات بنجاح")

