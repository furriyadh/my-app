"""
Google Ads API Routes Package
حزمة مسارات Google Ads API

Author: Google Ads AI Platform Team  
Version: 2.1.0
"""

import logging
import importlib
from flask import Blueprint

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint رئيسي
google_ads_bp = Blueprint(
    'google_ads',
    __name__,
    url_prefix='/api/google-ads'
)

# قاموس Blueprints المحملة
blueprints = {}
import_errors = {}

def safe_import_blueprint(module_name: str, blueprint_name: str):
    """استيراد آمن للـ Blueprint"""
    try:
        logger.info(f"🔄 Loading blueprint: {module_name}")
        
        # استيراد الوحدة باستخدام importlib
        try:
            # محاولة استيراد نسبي أولاً
            module = importlib.import_module(f".{module_name}", package=__name__)
        except ImportError:
            try:
                # محاولة استيراد مباشر
                module = importlib.import_module(module_name)
            except ImportError as e:
                logger.error(f"❌ Failed to import module '{module_name}': {str(e)}")
                return None
        
        # الحصول على Blueprint من الوحدة
        if hasattr(module, blueprint_name):
            blueprint = getattr(module, blueprint_name)
            logger.info(f"✅ Successfully loaded '{module_name}'")
            return blueprint
        else:
            logger.error(f"❌ Blueprint '{blueprint_name}' not found in module '{module_name}'")
            return None
            
    except Exception as e:
        logger.error(f"❌ Unexpected error loading '{module_name}': {str(e)}")
        return None

def register_sub_blueprints():
    """تسجيل جميع Sub-Blueprints في Blueprint الرئيسي"""
    logger.info("🔗 Registering sub-blueprints...")
    
    registered_count = 0
    
    for module_name, blueprint in blueprints.items():
        try:
            # تسجيل Blueprint في Blueprint الرئيسي
            google_ads_bp.register_blueprint(blueprint)
            logger.info(f"✅ Registered sub-blueprint: {module_name}")
            registered_count += 1
        except Exception as e:
            logger.error(f"❌ Failed to register {module_name}: {str(e)}")
    
    logger.info(f"📊 Sub-blueprint Registration: {registered_count}/{len(blueprints)} registered")

def initialize_blueprints():
    """تهيئة Blueprints"""
    logger.info("🚀 Initializing Google Ads Routes Package...")
    
    # قائمة Blueprints المتوقعة
    expected_blueprints = {
        'oauth_routes': 'google_ads_oauth',
        'discovery': 'google_ads_discovery_bp',
        'sync': 'google_ads_sync_bp', 
        'campaigns': 'google_ads_campaigns_bp',
        'reports': 'google_ads_reports_bp'
    }
    
    loaded_count = 0
    failed_count = 0
    
    for module_name, blueprint_name in expected_blueprints.items():
        blueprint = safe_import_blueprint(module_name, blueprint_name)
        
        if blueprint:
            blueprints[module_name] = blueprint
            loaded_count += 1
        else:
            import_errors[module_name] = f"Failed to load {module_name}"
            failed_count += 1
    
    # تقرير النتائج
    logger.info("📊 Blueprint Loading Results:")
    logger.info(f"   ✅ Loaded: {loaded_count}/{len(expected_blueprints)}")
    logger.info(f"   ❌ Failed: {failed_count}/{len(expected_blueprints)}")
    
    if import_errors:
        logger.warning("⚠️  Import Errors:")
        for key, error in import_errors.items():
            logger.warning(f"   - {key}: {error}")
    
    # تسجيل Sub-Blueprints في Blueprint الرئيسي
    if blueprints:
        register_sub_blueprints()
    
    logger.info(f"🎯 Google Ads Blueprint ready with {len(blueprints)} sub-modules")

# تهيئة Blueprints عند الاستيراد
initialize_blueprints()

# وظائف مساعدة
def get_blueprints():
    """الحصول على جميع Blueprints"""
    return blueprints.copy()

def get_blueprint(name: str):
    """الحصول على Blueprint محددة"""
    return blueprints.get(name)

def get_import_errors():
    """الحصول على أخطاء الاستيراد"""
    return import_errors.copy()

# تصدير Blueprint الرئيسي
__all__ = [
    'google_ads_bp',  # ✅ هذا هو المطلوب!
    'get_blueprints',
    'get_blueprint',
    'get_import_errors', 
    'blueprints',
    'import_errors'
]

