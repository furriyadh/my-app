"""
Google Ads API Routes Package
حزمة مسارات Google Ads API المتطورة

تحتوي على مسارات API شاملة لإدارة Google Ads بما في ذلك:
- OAuth 2.0 والمصادقة المتطورة مع PKCE
- اكتشاف الحسابات والربط الذكي
- مزامنة البيانات المتقدمة والمتوازية
- إدارة الحملات والإعلانات المتطورة
- التقارير والتحليلات المتطورة مع AI

Author: Google Ads AI Platform Team
Version: 2.1.0
License: MIT
Created: 2024-06-24
Last Modified: 2024-06-24

Architecture:
- Microservices-based design
- Async/await support
- Advanced error handling
- Comprehensive logging
- Security-first approach
- Performance optimized
"""

import logging
from flask import Blueprint

# إعداد التسجيل
logger = logging.getLogger(__name__)

# استيراد جميع Blueprints من الملفات المتخصصة
try:
    from .oauth_routes import oauth_bp
    logger.info("✅ تم استيراد OAuth Blueprint")
except ImportError as e:
    logger.warning(f"⚠️ فشل استيراد OAuth Blueprint: {e}")
    oauth_bp = None
except Exception as e:
    logger.warning(f"⚠️ خطأ غير متوقع في استيراد OAuth Blueprint: {e}")
    oauth_bp = None

try:
    from .campaigns import google_ads_campaigns_bp
    logger.info("✅ تم استيراد Campaigns Blueprint")
except ImportError as e:
    logger.warning(f"⚠️ فشل استيراد Campaigns Blueprint: {e}")
    google_ads_campaigns_bp = None

try:
    from .discovery import google_ads_discovery_bp
    logger.info("✅ تم استيراد Discovery Blueprint")
except ImportError as e:
    logger.warning(f"⚠️ فشل استيراد Discovery Blueprint: {e}")
    google_ads_discovery_bp = None

try:
    from .reports import google_ads_reports_bp
    logger.info("✅ تم استيراد Reports Blueprint")
except ImportError as e:
    logger.warning(f"⚠️ فشل استيراد Reports Blueprint: {e}")
    google_ads_reports_bp = None

try:
    from .sync import google_ads_sync_bp
    logger.info("✅ تم استيراد Sync Blueprint")
except ImportError as e:
    logger.warning(f"⚠️ فشل استيراد Sync Blueprint: {e}")
    google_ads_sync_bp = None

try:
    from .auth_jwt import auth_bp
    logger.info("✅ تم استيراد Auth JWT Blueprint")
except ImportError as e:
    logger.warning(f"⚠️ فشل استيراد Auth JWT Blueprint: {e}")
    auth_bp = None

# إنشاء Blueprint رئيسي يجمع كل شيء
google_ads_bp = Blueprint(
    'google_ads',
    __name__,
    url_prefix='/api/google-ads'
)

# تسجيل جميع Sub-blueprints المتاحة
blueprints_registered = 0
total_blueprints = 0

# قائمة Blueprints للتسجيل
sub_blueprints = [
    (oauth_bp, 'oauth', '/oauth'),
    (google_ads_campaigns_bp, 'campaigns', '/campaigns'),
    (google_ads_discovery_bp, 'discovery', '/discovery'),
    (google_ads_reports_bp, 'reports', '/reports'),
    (google_ads_sync_bp, 'sync', '/sync'),
    (auth_bp, 'auth', '/auth')
]

for bp, name, url_prefix in sub_blueprints:
    total_blueprints += 1
    if bp is not None:
        try:
            google_ads_bp.register_blueprint(bp, url_prefix=url_prefix)
            blueprints_registered += 1
            logger.info(f"✅ تم تسجيل {name} blueprint في {url_prefix}")
        except Exception as e:
            logger.error(f"❌ فشل تسجيل {name} blueprint: {e}")
    else:
        logger.warning(f"⚠️ {name} blueprint غير متاح")

# إضافة مسارات أساسية للـ Blueprint الرئيسي
@google_ads_bp.route('/health', methods=['GET'])
def health():
    """فحص صحة خدمة Google Ads"""
    from flask import jsonify
    return jsonify({
        'status': 'healthy',
        'service': 'Google Ads API',
        'blueprints_registered': blueprints_registered,
        'total_blueprints': total_blueprints,
        'success_rate': f"{blueprints_registered}/{total_blueprints}"
    })

@google_ads_bp.route('/status', methods=['GET'])
def status():
    """حالة جميع خدمات Google Ads"""
    from flask import jsonify
    
    blueprint_status = {}
    for bp, name, url_prefix in sub_blueprints:
        blueprint_status[name] = {
            'available': bp is not None,
            'url_prefix': url_prefix,
            'registered': bp is not None
        }
    
    return jsonify({
        'service': 'Google Ads API Package',
        'blueprints': blueprint_status,
        'summary': {
            'total': total_blueprints,
            'registered': blueprints_registered,
            'success_rate': f"{blueprints_registered}/{total_blueprints}"
        }
    })

# تسجيل نتائج التحميل
logger.info(f"📦 تم تحميل Google Ads Package: {blueprints_registered}/{total_blueprints} blueprints")

# تصدير Blueprint الرئيسي
__all__ = ['google_ads_bp']

