"""
MCC (My Client Center) API Routes
مسارات API لإدارة حسابات MCC المتطورة

هذا المجلد يحتوي على جميع مسارات API الخاصة بإدارة:
- حسابات MCC
- العملاء والحسابات الفرعية
- الصلاحيات والأذونات
- المزامنة والتحديثات
- التحليلات والتقارير

Version: 2.0.0
Author: Google Ads AI Platform Team
"""

__version__ = "2.0.0"
__author__ = "Google Ads AI Platform Team"

# تصدير جميع Blueprints
from .accounts import mcc_accounts_bp
from .clients import mcc_clients_bp
from .permissions import mcc_permissions_bp
from .sync import mcc_sync_bp
from .analytics import mcc_analytics_bp

__all__ = [
    'mcc_accounts_bp',
    'mcc_clients_bp', 
    'mcc_permissions_bp',
    'mcc_sync_bp',
    'mcc_analytics_bp'
]

