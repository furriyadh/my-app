"""
مسارات API - Routes Package
Google Ads AI Platform - API Routes
الملف المُصحح والمحسن - أفضل ممارسات البرمجة
"""

import logging
import sys
from typing import Tuple, List, Dict, Any
from flask import Flask, Blueprint

# إعداد التسجيل
logger = logging.getLogger(__name__)

class RouteRegistrar:
    """مدير تسجيل المسارات مع معالجة أخطاء متقدمة"""
    
    def __init__(self):
        self.registered_blueprints: List[Dict[str, Any]] = []
        self.failed_imports: List[Dict[str, Any]] = []
        self.registration_stats = {
            'total_attempted': 0,
            'successful': 0,
            'failed': 0
        }
    
    def safe_import_blueprint(self, module_path: str, blueprint_name: str, 
                            display_name: str, url_prefix: str) -> Tuple[Blueprint, bool]:
        """استيراد آمن للـ Blueprint مع معالجة أخطاء شاملة"""
        try:
            # محاولة الاستيراد النسبي أولاً
            try:
                module = __import__(f".{module_path}", fromlist=[blueprint_name], level=1)
                blueprint = getattr(module, blueprint_name)
                logger.info(f"✅ تم استيراد {display_name} من المسار النسبي")
                return blueprint, True
            except ImportError:
                # محاولة الاستيراد المطلق
                try:
                    module = __import__(f"routes.{module_path}", fromlist=[blueprint_name])
                    blueprint = getattr(module, blueprint_name)
                    logger.info(f"✅ تم استيراد {display_name} من المسار المطلق")
                    return blueprint, True
                except ImportError:
                    # محاولة الاستيراد المباشر
                    module = __import__(module_path, fromlist=[blueprint_name])
                    blueprint = getattr(module, blueprint_name)
                    logger.info(f"✅ تم استيراد {display_name} من المسار المباشر")
                    return blueprint, True
                    
        except ImportError as e:
            error_info = {
                'module': module_path,
                'blueprint': blueprint_name,
                'display_name': display_name,
                'error_type': 'ImportError',
                'error_message': str(e)
            }
            self.failed_imports.append(error_info)
            logger.warning(f"⚠️ فشل استيراد {display_name}: {e}")
            return None, False
            
        except AttributeError as e:
            error_info = {
                'module': module_path,
                'blueprint': blueprint_name,
                'display_name': display_name,
                'error_type': 'AttributeError',
                'error_message': str(e)
            }
            self.failed_imports.append(error_info)
            logger.error(f"❌ {blueprint_name} غير موجود في {module_path}: {e}")
            return None, False
            
        except Exception as e:
            error_info = {
                'module': module_path,
                'blueprint': blueprint_name,
                'display_name': display_name,
                'error_type': type(e).__name__,
                'error_message': str(e)
            }
            self.failed_imports.append(error_info)
            logger.error(f"❌ خطأ غير متوقع في استيراد {display_name}: {e}")
            return None, False
    
    def register_blueprint_safely(self, app: Flask, blueprint: Blueprint, 
                                url_prefix: str, display_name: str) -> bool:
        """تسجيل آمن للـ Blueprint"""
        try:
            app.register_blueprint(blueprint, url_prefix=url_prefix)
            
            blueprint_info = {
                'name': display_name,
                'blueprint_name': blueprint.name,
                'url_prefix': url_prefix,
                'status': 'registered'
            }
            self.registered_blueprints.append(blueprint_info)
            self.registration_stats['successful'] += 1
            
            logger.info(f"🎉 تم تسجيل {display_name} على {url_prefix}")
            return True
            
        except Exception as e:
            error_info = {
                'name': display_name,
                'url_prefix': url_prefix,
                'error_type': type(e).__name__,
                'error_message': str(e),
                'status': 'registration_failed'
            }
            self.failed_imports.append(error_info)
            self.registration_stats['failed'] += 1
            
            logger.error(f"❌ فشل تسجيل {display_name}: {e}")
            return False
    
    def get_registration_report(self) -> Dict[str, Any]:
        """تقرير شامل عن عملية التسجيل"""
        return {
            'statistics': self.registration_stats,
            'registered_blueprints': self.registered_blueprints,
            'failed_imports': self.failed_imports,
            'success_rate': (
                self.registration_stats['successful'] / 
                max(self.registration_stats['total_attempted'], 1) * 100
            )
        }

def register_routes(app: Flask) -> Tuple[int, int]:
    """
    تسجيل جميع مسارات API مع معالجة أخطاء متقدمة
    
    Args:
        app: تطبيق Flask
        
    Returns:
        Tuple[int, int]: (عدد المسارات المسجلة بنجاح, عدد المسارات الفاشلة)
    """
    logger.info("📦 بدء تسجيل Routes من __init__.py...")
    
    registrar = RouteRegistrar()
    
    # تعريف جميع Blueprints المطلوب تسجيلها
    blueprints_config = [
        {
            'module_path': 'auth_jwt',
            'blueprint_name': 'auth_routes_bp',
            'display_name': 'Auth JWT',
            'url_prefix': '/api/auth-jwt'
        },
        {
            'module_path': 'accounts',
            'blueprint_name': 'accounts_bp',
            'display_name': 'Accounts',
            'url_prefix': '/api/accounts'
        },
        {
            'module_path': 'ai',
            'blueprint_name': 'ai_bp',
            'display_name': 'AI',
            'url_prefix': '/api/ai'
        },
        {
            'module_path': 'campaigns',
            'blueprint_name': 'campaigns_bp',
            'display_name': 'Campaigns',
            'url_prefix': '/api/campaigns'
        },
        {
            'module_path': 'google_ads_routes',
            'blueprint_name': 'google_ads_bp',
            'display_name': 'Google Ads Routes',
            'url_prefix': '/api/google-ads'
        },
        {
            'module_path': 'mcc_advanced',
            'blueprint_name': 'mcc_bp',
            'display_name': 'MCC Advanced',
            'url_prefix': '/api/mcc'
        },
        {
            'module_path': 'merchant_center_routes',
            'blueprint_name': 'merchant_bp',
            'display_name': 'Merchant Center',
            'url_prefix': '/api/merchant-center'
        },

    ]
    
    # معالجة كل Blueprint
    for config in blueprints_config:
        registrar.registration_stats['total_attempted'] += 1
        
        # استيراد Blueprint
        blueprint, import_success = registrar.safe_import_blueprint(
            config['module_path'],
            config['blueprint_name'],
            config['display_name'],
            config['url_prefix']
        )
        
        # تسجيل Blueprint إذا نجح الاستيراد
        if import_success and blueprint:
            registrar.register_blueprint_safely(
                app,
                blueprint,
                config['url_prefix'],
                config['display_name']
            )
    
    # طباعة تقرير التسجيل
    report = registrar.get_registration_report()
    
    logger.info("📊 تقرير تسجيل Routes:")
    logger.info(f"   ✅ تم تسجيل: {report['statistics']['successful']}")
    logger.info(f"   ❌ فشل في التسجيل: {report['statistics']['failed']}")
    logger.info(f"   📈 معدل النجاح: {report['success_rate']:.1f}%")
    
    # طباعة تفاصيل المسارات المسجلة
    if report['registered_blueprints']:
        logger.info("🎉 المسارات المسجلة بنجاح:")
        for bp in report['registered_blueprints']:
            logger.info(f"   • {bp['name']} → {bp['url_prefix']}")
    
    # طباعة تفاصيل الأخطاء
    if report['failed_imports']:
        logger.warning("⚠️ المسارات التي فشلت:")
        for error in report['failed_imports']:
            logger.warning(f"   • {error.get('display_name', error.get('name', 'Unknown'))}: {error['error_type']}")
    
    return report['statistics']['successful'], report['statistics']['failed']

def create_health_blueprint() -> Blueprint:
    """إنشاء Blueprint للصحة العامة"""
    health_bp = Blueprint('health', __name__)
    
    @health_bp.route('/health', methods=['GET'])
    def health_check():
        """فحص صحة النظام"""
        from flask import jsonify
        from datetime import datetime
        
        return jsonify({
            'status': 'healthy',
            'service': 'Google Ads AI Platform',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        })
    
    @health_bp.route('/routes-status', methods=['GET'])
    def routes_status():
        """حالة المسارات المسجلة"""
        from flask import jsonify, current_app
        
        registered_blueprints = []
        for blueprint_name, blueprint in current_app.blueprints.items():
            registered_blueprints.append({
                'name': blueprint_name,
                'url_prefix': getattr(blueprint, 'url_prefix', None)
            })
        
        return jsonify({
            'total_blueprints': len(registered_blueprints),
            'blueprints': registered_blueprints,
            'status': 'active'
        })
    
    return health_bp

# تسجيل Blueprint الصحة تلقائياً
def register_health_routes(app: Flask) -> None:
    """تسجيل مسارات الصحة"""
    try:
        health_bp = create_health_blueprint()
        app.register_blueprint(health_bp, url_prefix='/api')
        logger.info("✅ تم تسجيل Health Routes")
    except Exception as e:
        logger.error(f"❌ فشل تسجيل Health Routes: {e}")

# دالة مساعدة للتشخيص
def diagnose_import_issues() -> Dict[str, Any]:
    """تشخيص مشاكل الاستيراد"""
    import os
    
    current_dir = os.path.dirname(__file__)
    
    diagnosis = {
        'current_directory': current_dir,
        'python_path': sys.path[:3],  # أول 3 مسارات
        'files_in_routes': [],
        'python_files': []
    }
    
    try:
        files = os.listdir(current_dir)
        diagnosis['files_in_routes'] = files
        diagnosis['python_files'] = [f for f in files if f.endswith('.py')]
    except Exception as e:
        diagnosis['error'] = str(e)
    
    return diagnosis

# تصدير الدوال الرئيسية
__all__ = [
    'register_routes',
    'register_health_routes',
    'RouteRegistrar',
    'diagnose_import_issues'
]

