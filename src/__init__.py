"""
🚀 My-App Source Package
========================

هذا هو الملف الرئيسي لحزمة src في مشروع Google Ads AI Platform.

المحتويات:
- ai/: نظام الذكاء الاصطناعي المتكامل
- components/: مكونات واجهة المستخدم
- utils/: أدوات مساعدة عامة

الإصدار: 1.0.0
التاريخ: 2025-01-07
المطور: Google Ads AI Platform Team
"""

__version__ = "1.0.0"
__author__ = "Google Ads AI Platform Team"
__email__ = "support@googleadsai.com"

# تصدير الوحدات الرئيسية
from . import ai

__all__ = [
    "ai",
    "__version__",
    "__author__",
    "__email__"
]

