#!/usr/bin/env python3
"""
Google Ads AI Platform - Main Flask Application
التطبيق الرئيسي لمنصة Google Ads AI
"""

import os
import sys
import logging
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

# إضافة مجلد backend للمسار
current_dir = Path(__file__).parent.absolute()
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

# استيراد الإعدادات
from config import Config

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(config_class=None):
    """
    Flask Application Factory
    إنشاء تطبيق Flask مع جميع الإعدادات والمسارات
    """
    app = Flask(__name__)
    
    # تحديد الإعدادات
    if config_class is None:
        config_class = Config
    
    app.config.from_object(config_class)
    
    # إعداد CORS حسب البيئة
    if app.config.get('IS_PRODUCTION', False):
        # إعدادات الإنتاج - furriyadh.com
        CORS(app, resources={
            r"/api/*": {
                "origins": ["https://furriyadh.com", "https://www.furriyadh.com"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True
            }
        })
    else:
        # إعدادات التطوير - localhost
        CORS(app, resources={
            r"/api/*": {
                "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"]
            }
        })
    
    # تسجيل معلومات التطبيق
    logger.info("🚀 بدء تشغيل Google Ads AI Platform")
    logger.info(f"📊 البيئة: {os.getenv('FLASK_ENV', 'development')}")
    logger.info(f"🔧 Debug Mode: {app.config.get('DEBUG', False)}")
    logger.info(f"🏢 MCC Customer ID: {app.config.get('MCC_LOGIN_CUSTOMER_ID', 'غير محدد')}")
    
    # تسجيل المسارات (Routes)
    register_routes(app)
    
    # تسجيل معالجات الأخطاء
    register_error_handlers(app)
    
    # إضافة مسارات صحة النظام
    register_health_routes(app)
    
    logger.info("✅ تم تهيئة التطبيق بنجاح")
    return app

def register_routes(app):
    """تسجيل جميع مسارات API"""
    try:
        logger.info("📦 بدء تسجيل المسارات...")
        
        registered_count = 0
        failed_count = 0
        
        # 1. مسارات MCC وربط الحسابات
        try:
            from routes.mcc.link_customer import mcc_link_bp
            app.register_blueprint(mcc_link_bp)
            registered_count += 1
            logger.info("✅ تم تسجيل MCC Link Customer routes")
        except ImportError as e:
            failed_count += 1
            logger.warning(f"⚠️ فشل استيراد MCC Link routes: {e}")
        
        # 2. مسارات ربط الحسابات العامة
        try:
            from routes.account_linking import account_linking_bp
            app.register_blueprint(account_linking_bp, url_prefix='/api')
            registered_count += 1
            logger.info("✅ تم تسجيل Account Linking routes")
        except ImportError as e:
            failed_count += 1
            logger.warning(f"⚠️ فشل استيراد Account Linking routes: {e}")
        
        # 3. مسارات MCC المتقدمة
        try:
            from routes.mcc_advanced import mcc_api
            app.register_blueprint(mcc_api)
            registered_count += 1
            logger.info("✅ تم تسجيل MCC Advanced routes")
        except ImportError as e:
            failed_count += 1
            logger.warning(f"⚠️ فشل استيراد MCC Advanced routes: {e}")
        
        # 4. مسارات Google Ads العامة
        try:
            from routes.google_ads_routes import google_ads_bp
            app.register_blueprint(google_ads_bp, url_prefix='/api/google-ads')
            registered_count += 1
            logger.info("✅ تم تسجيل Google Ads routes")
        except ImportError as e:
            failed_count += 1
            logger.warning(f"⚠️ فشل استيراد Google Ads routes: {e}")
        
        # 5. مسارات الحسابات
        try:
            from routes.accounts import accounts_bp
            app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
            registered_count += 1
            logger.info("✅ تم تسجيل Accounts routes")
        except ImportError as e:
            failed_count += 1
            logger.warning(f"⚠️ فشل استيراد Accounts routes: {e}")
        
        # 6. مسارات الحملات
        try:
            from routes.campaigns import campaigns_bp
            app.register_blueprint(campaigns_bp, url_prefix='/api/campaigns')
            registered_count += 1
            logger.info("✅ تم تسجيل Campaigns routes")
        except ImportError as e:
            failed_count += 1
            logger.warning(f"⚠️ فشل استيراد Campaigns routes: {e}")
        
        # 7. مسارات المصادقة
        try:
            from routes.auth_jwt import auth_bp
            app.register_blueprint(auth_bp, url_prefix='/api/auth')
            registered_count += 1
            logger.info("✅ تم تسجيل Auth JWT routes")
        except ImportError as e:
            failed_count += 1
            logger.warning(f"⚠️ فشل استيراد Auth routes: {e}")
        
        # 8. مسارات الذكاء الاصطناعي
        try:
            from routes.ai import ai_bp
            app.register_blueprint(ai_bp, url_prefix='/api/ai')
            registered_count += 1
            logger.info("✅ تم تسجيل AI routes")
        except ImportError as e:
            failed_count += 1
            logger.warning(f"⚠️ فشل استيراد AI routes: {e}")
        
        # 9. مسارات التقارير
        try:
            from routes.reports import reports_bp
            app.register_blueprint(reports_bp, url_prefix='/api/reports')
            registered_count += 1
            logger.info("✅ تم تسجيل Reports routes")
        except ImportError as e:
            failed_count += 1
            logger.warning(f"⚠️ فشل استيراد Reports routes: {e}")
        
        # إحصائيات التسجيل
        total_attempted = registered_count + failed_count
        logger.info(f"📊 نتائج تسجيل المسارات:")
        logger.info(f"   ✅ تم تسجيل: {registered_count}")
        logger.info(f"   ❌ فشل في التسجيل: {failed_count}")
        logger.info(f"   📈 معدل النجاح: {registered_count}/{total_attempted}")
        
        if registered_count > 0:
            logger.info(f"🎉 تم تسجيل {registered_count} مسارات بنجاح!")
        else:
            logger.warning("⚠️ لم يتم تسجيل أي مسارات")
            
    except Exception as e:
        logger.error(f"❌ خطأ في تسجيل المسارات: {e}")

def register_error_handlers(app):
    """تسجيل معالجات الأخطاء"""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Not Found',
            'message': 'المسار المطلوب غير موجود',
            'timestamp': datetime.now().isoformat()
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"خطأ داخلي في الخادم: {error}")
        return jsonify({
            'success': False,
            'error': 'Internal Server Error',
            'message': 'خطأ داخلي في الخادم',
            'timestamp': datetime.now().isoformat()
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error': 'Bad Request',
            'message': 'طلب غير صحيح',
            'timestamp': datetime.now().isoformat()
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'error': 'Unauthorized',
            'message': 'غير مصرح لك بالوصول',
            'timestamp': datetime.now().isoformat()
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'error': 'Forbidden',
            'message': 'ممنوع الوصول',
            'timestamp': datetime.now().isoformat()
        }), 403

def register_health_routes(app):
    """تسجيل مسارات فحص صحة النظام"""
    
    @app.route('/health')
    @app.route('/api/health')
    def health_check():
        """فحص صحة النظام"""
        try:
            # فحص الاتصال بـ Google Ads API
            google_ads_status = check_google_ads_connection()
            
            # فحص متغيرات البيئة المطلوبة
            env_status = check_environment_variables()
            
            # فحص الخدمات
            services_status = check_services()
            
            health_data = {
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'version': '1.0.0',
                'environment': os.getenv('FLASK_ENV', 'development'),
                'checks': {
                    'google_ads_api': google_ads_status,
                    'environment_variables': env_status,
                    'services': services_status
                }
            }
            
            # تحديد الحالة العامة
            if not all([google_ads_status['healthy'], env_status['healthy'], services_status['healthy']]):
                health_data['status'] = 'unhealthy'
                return jsonify(health_data), 503
            
            return jsonify(health_data), 200
            
        except Exception as e:
            logger.error(f"خطأ في فحص صحة النظام: {e}")
            return jsonify({
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500
    
    @app.route('/')
    @app.route('/api')
    def root():
        """المسار الجذر"""
        return jsonify({
            'message': 'Google Ads AI Platform API',
            'version': '1.0.0',
            'status': 'running',
            'timestamp': datetime.now().isoformat(),
            'endpoints': {
                'health': '/health',
                'mcc_link': '/api/mcc/link-customer',
                'accounts': '/api/accounts',
                'campaigns': '/api/campaigns',
                'ai': '/api/ai',
                'reports': '/api/reports'
            },
            'documentation': 'https://developers.google.com/google-ads/api'
        })

def check_google_ads_connection():
    """فحص الاتصال بـ Google Ads API"""
    try:
        # فحص متغيرات Google Ads
        required_vars = [
            'GOOGLE_ADS_DEVELOPER_TOKEN',
            'GOOGLE_ADS_CLIENT_ID', 
            'GOOGLE_ADS_CLIENT_SECRET',
            'MCC_LOGIN_CUSTOMER_ID'
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            return {
                'healthy': False,
                'message': f'متغيرات مفقودة: {", ".join(missing_vars)}'
            }
        
        # محاولة استيراد مكتبة Google Ads
        try:
            from google_ads_lib.client import GoogleAdsClient
            return {
                'healthy': True,
                'message': 'Google Ads library available'
            }
        except ImportError as e:
            return {
                'healthy': False,
                'message': f'Google Ads library import failed: {e}'
            }
            
    except Exception as e:
        return {
            'healthy': False,
            'message': f'Google Ads check failed: {e}'
        }

def check_environment_variables():
    """فحص متغيرات البيئة المطلوبة"""
    try:
        required_vars = [
            'FLASK_SECRET_KEY',
            'GOOGLE_ADS_DEVELOPER_TOKEN',
            'GOOGLE_ADS_CLIENT_ID',
            'GOOGLE_ADS_CLIENT_SECRET',
            'MCC_LOGIN_CUSTOMER_ID'
        ]
        
        missing_vars = []
        present_vars = []
        
        for var in required_vars:
            if os.getenv(var):
                present_vars.append(var)
            else:
                missing_vars.append(var)
        
        return {
            'healthy': len(missing_vars) == 0,
            'message': f'Present: {len(present_vars)}, Missing: {len(missing_vars)}',
            'missing_variables': missing_vars
        }
        
    except Exception as e:
        return {
            'healthy': False,
            'message': f'Environment check failed: {e}'
        }

def check_services():
    """فحص الخدمات المتاحة"""
    try:
        services_status = {}
        
        # فحص خدمة MCC Manager
        try:
            from services.mcc_manager import mcc_manager
            services_status['mcc_manager'] = True
        except ImportError:
            services_status['mcc_manager'] = False
        
        # فحص خدمة Google Ads Client
        try:
            from services.google_ads_client import GoogleAdsClientService
            services_status['google_ads_client'] = True
        except ImportError:
            services_status['google_ads_client'] = False
        
        # فحص خدمة OAuth Manager
        try:
            from services.google_oauth2_manager import GoogleOAuth2Manager
            services_status['oauth_manager'] = True
        except ImportError:
            services_status['oauth_manager'] = False
        
        healthy_services = sum(1 for status in services_status.values() if status)
        total_services = len(services_status)
        
        return {
            'healthy': healthy_services > 0,
            'message': f'{healthy_services}/{total_services} services available',
            'services': services_status
        }
        
    except Exception as e:
        return {
            'healthy': False,
            'message': f'Services check failed: {e}'
        }

# إنشاء التطبيق للاستخدام المباشر
if __name__ == '__main__':
    app = create_app()
    
    # إعدادات التشغيل
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('PORT', os.getenv('FLASK_PORT', 5000)))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    # تأكد من أن التطبيق يعمل على المنفذ الصحيح
    if not port:
        port = 5000
    
    logger.info(f"🚀 تشغيل الخادم على {host}:{port}")
    logger.info(f"🔧 Debug Mode: {debug}")
    
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    )
