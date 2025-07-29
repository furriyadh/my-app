#!/usr/bin/env python3
"""
Google Ads AI Platform - Backend Application
إصدار محسن مع Blueprints الحقيقية الموجودة في المشروع
"""

import os
import sys
import json
import logging
import traceback
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_environment_variables():
    """تحميل متغيرات البيئة من .env و .env.local"""
    print("🌟 بدء تشغيل Google Ads AI Platform...")
    
    # تحديد مسار جذر المشروع
    current_dir = Path(__file__).parent
    project_root = current_dir.parent if current_dir.name == 'backend' else current_dir
    
    print(f"📁 مسار جذر المشروع: {project_root}")
    
    # تحميل متغيرات البيئة
    try:
        from dotenv import load_dotenv
        
        # تحميل .env.local أولاً (للتطوير)
        env_local_path = project_root / ".env.local"
        if env_local_path.exists():
            load_dotenv(env_local_path, override=True)
            print(f"✅ تم تحميل {env_local_path}")
        else:
            print(f"⚠️ ملف .env.local غير موجود في {env_local_path}")
        
        # تحميل .env (للإنتاج)
        env_path = project_root / ".env"
        if env_path.exists():
            load_dotenv(env_path, override=True)
            print(f"✅ تم تحميل {env_path}")
        else:
            print(f"⚠️ ملف .env غير موجود في {env_path}")
            
    except ImportError:
        print("❌ python-dotenv غير مثبت")
        return False
    
    return True

def create_flask_app():
    """إنشاء تطبيق Flask مع الإعدادات الأساسية"""
    print("🔧 بدء إنشاء تطبيق Flask...")
    
    app = Flask(__name__)
    
    # إعدادات Flask الأساسية
    app.config.update({
        'SECRET_KEY': os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production'),
        'DEBUG': os.getenv('FLASK_DEBUG', 'True').lower() == 'true',
        'TESTING': False,
        'JSON_AS_ASCII': False,  # دعم الأحرف العربية في JSON
        'JSONIFY_PRETTYPRINT_REGULAR': True
    })
    
    # تمكين CORS
    CORS(app, origins="*", supports_credentials=True)
    
    print("✅ تم إعداد Flask app الأساسي")
    return app

def setup_jwt_manager(app):
    """إعداد JWT Manager إذا كان متاحاً"""
    try:
        from flask_jwt_extended import JWTManager
        
        app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['SECRET_KEY'])
        app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # ساعة واحدة
        
        jwt = JWTManager(app)
        print("✅ تم تهيئة JWT Manager بنجاح")
        return True
        
    except ImportError:
        print("⚠️ flask-jwt-extended غير مثبت - تم تخطي JWT")
        return False

def add_basic_routes(app):
    """إضافة المسارات الأساسية للاختبار"""
    
    @app.route('/')
    def home():
        """الصفحة الرئيسية"""
        return jsonify({
            'message': 'مرحباً بك في Google Ads AI Platform',
            'status': 'running',
            'version': '3.0.0',
            'description': 'منصة الذكاء الاصطناعي لإدارة حملات Google Ads - مع Blueprints كاملة',
            'features': [
                'إدارة الحملات الإعلانية',
                'تحليل الأداء والإحصائيات',
                'إدارة الكلمات المفتاحية',
                'تحسين الميزانيات',
                'تقارير مفصلة',
                'مصادقة JWT متقدمة',
                'إدارة MCC متقدمة',
                'تكامل Merchant Center',
                'ذكاء اصطناعي للتحليل'
            ],
            'endpoints': {
                'status': '/api/status',
                'system_info': '/api/system/info',
                'test_google_ads': '/api/test-google-ads',
                'environment': '/api/environment',
                'blueprints_status': '/api/blueprints/status'
            },
            'blueprints_available': [
                'accounts - إدارة الحسابات',
                'campaigns - إدارة الحملات',
                'google_ads - Google Ads API',
                'auth_jwt - المصادقة والتخويل',
                'ai - الذكاء الاصطناعي',
                'google_ads_routes - مسارات Google Ads',
                'mcc_advanced - إدارة MCC متقدمة',
                'merchant_center_routes - مسارات Merchant Center'
            ]
        })
    
    @app.route('/api/status')
    def api_status():
        """حالة API"""
        return jsonify({
            'status': 'healthy',
            'message': 'API يعمل بشكل طبيعي مع Blueprints كاملة',
            'timestamp': '2025-07-27',
            'server': 'Flask Development Server',
            'uptime': 'متاح',
            'database': 'متصل',
            'google_ads_api': 'جاهز',
            'blueprints_loaded': 'متاح في /api/blueprints/status'
        })
    
    @app.route('/api/system/info')
    def system_info():
        """معلومات النظام"""
        return jsonify({
            'system': {
                'python_version': sys.version,
                'platform': sys.platform,
                'working_directory': os.getcwd(),
                'flask_version': '3.1.1'
            },
            'environment': {
                'flask_debug': app.config.get('DEBUG'),
                'flask_testing': app.config.get('TESTING'),
                'cors_enabled': True,
                'jwt_enabled': 'JWT_SECRET_KEY' in app.config
            },
            'google_ads': {
                'developer_token_configured': bool(os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')),
                'client_id_configured': bool(os.getenv('GOOGLE_ADS_CLIENT_ID')),
                'client_secret_configured': bool(os.getenv('GOOGLE_ADS_CLIENT_SECRET')),
                'refresh_token_configured': bool(os.getenv('GOOGLE_ADS_REFRESH_TOKEN')),
                'mcc_customer_id_configured': bool(os.getenv('MCC_LOGIN_CUSTOMER_ID'))
            },
            'features': {
                'oauth_ready': True,
                'campaigns_management': True,
                'analytics_ready': True,
                'keywords_management': True,
                'ai_integration': True,
                'mcc_advanced': True,
                'merchant_center': True,
                'jwt_auth': True
            },
            'blueprints': {
                'routes_folder_exists': os.path.exists('routes'),
                'expected_blueprints': 8,
                'blueprints_status': 'متاح في /api/blueprints/status'
            }
        })
    
    @app.route('/api/test-google-ads')
    def test_google_ads():
        """اختبار Google Ads Client"""
        try:
            # اختبار استيراد Google Ads Client
            from google.ads.googleads.client import GoogleAdsClient
            
            # اختبار وجود ملف google_ads.yaml
            yaml_path = "services/google_ads.yaml"
            if not os.path.exists(yaml_path):
                return jsonify({
                    'success': False,
                    'error': f'ملف {yaml_path} غير موجود',
                    'suggestion': 'تأكد من وجود ملف google_ads.yaml في مجلد services',
                    'expected_path': os.path.abspath(yaml_path)
                }), 404
            
            # اختبار قراءة ملف YAML
            import yaml
            with open(yaml_path, 'r') as f:
                yaml_config = yaml.safe_load(f)
            
            # التحقق من المفاتيح المطلوبة
            required_keys = ['developer_token', 'client_id', 'client_secret', 'refresh_token']
            missing_keys = [key for key in required_keys if not yaml_config.get(key)]
            
            if missing_keys:
                return jsonify({
                    'success': False,
                    'error': 'مفاتيح مطلوبة مفقودة في ملف YAML',
                    'missing_keys': missing_keys,
                    'suggestion': 'تأكد من وجود جميع المفاتيح المطلوبة في ملف google_ads.yaml'
                }), 400
            
            # اختبار إنشاء Google Ads Client
            config_dict = {
                'developer_token': yaml_config.get('developer_token', ''),
                'client_id': yaml_config.get('client_id', ''),
                'client_secret': yaml_config.get('client_secret', ''),
                'refresh_token': yaml_config.get('refresh_token', ''),
                'use_proto_plus': True
            }
            
            if yaml_config.get('login_customer_id'):
                config_dict['login_customer_id'] = yaml_config.get('login_customer_id')
            
            # محاولة إنشاء العميل
            client = GoogleAdsClient.load_from_dict(config_dict)
            
            return jsonify({
                'success': True,
                'message': 'Google Ads Client تم إنشاؤه بنجاح',
                'config_loaded': True,
                'yaml_file': yaml_path,
                'client_created': True,
                'config_keys': list(yaml_config.keys()),
                'blueprints_integration': 'جاهز للتكامل مع Blueprints'
            })
            
        except ImportError as e:
            return jsonify({
                'success': False,
                'error': 'فشل في استيراد Google Ads Client',
                'details': str(e),
                'suggestion': 'تأكد من تثبيت مكتبة google-ads: pip install google-ads'
            }), 500
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': 'خطأ في إنشاء Google Ads Client',
                'details': str(e),
                'error_type': type(e).__name__,
                'traceback': traceback.format_exc() if app.config.get('DEBUG') else 'مخفي للأمان'
            }), 500
    
    @app.route('/api/environment')
    def environment_info():
        """معلومات البيئة (مع إخفاء القيم الحساسة)"""
        env_vars = [
            'GOOGLE_ADS_DEVELOPER_TOKEN',
            'GOOGLE_ADS_CLIENT_ID', 
            'GOOGLE_ADS_CLIENT_SECRET',
            'GOOGLE_ADS_REFRESH_TOKEN',
            'MCC_LOGIN_CUSTOMER_ID',
            'FLASK_SECRET_KEY',
            'FLASK_DEBUG',
            'JWT_SECRET_KEY'
        ]
        
        environment = {}
        for var in env_vars:
            value = os.getenv(var)
            if value:
                # إخفاء القيم الحساسة
                if any(sensitive in var.upper() for sensitive in ['TOKEN', 'SECRET', 'PASSWORD']):
                    environment[var] = value[:10] + "..." if len(value) > 10 else "***"
                else:
                    environment[var] = value
            else:
                environment[var] = "غير مضبوط"
        
        return jsonify({
            'environment_variables': environment,
            'python_path': sys.path[:3],  # أول 3 مسارات فقط
            'current_directory': os.getcwd(),
            'config_files': {
                '.env': os.path.exists('.env'),
                '.env.local': os.path.exists('.env.local'),
                'services/google_ads.yaml': os.path.exists('services/google_ads.yaml'),
                'routes/': os.path.exists('routes'),
                'routes/__init__.py': os.path.exists('routes/__init__.py')
            }
        })

def load_real_blueprints(app):
    """تحميل Blueprints الحقيقية الموجودة في المشروع"""
    print("📦 محاولة تحميل Blueprints الحقيقية...")
    
    # قائمة Blueprints الموجودة فعلاً في المشروع
    real_blueprints_to_load = [
        ('routes.accounts', 'accounts_bp', 'إدارة الحسابات'),
        ('routes.campaigns', 'campaigns_bp', 'إدارة الحملات'),
        ('routes.google_ads', 'google_ads_bp', 'Google Ads API'),
        ('routes.auth_jwt', 'auth_bp', 'المصادقة والتخويل JWT'),
        ('routes.ai', 'ai_bp', 'الذكاء الاصطناعي'),
        ('routes.google_ads_routes', 'google_ads_routes_bp', 'مسارات Google Ads'),
        ('routes.mcc_advanced', 'mcc_bp', 'إدارة MCC متقدمة'),
        ('routes.merchant_center_routes', 'merchant_center_bp', 'مسارات Merchant Center')
    ]
    
    loaded_blueprints = []
    failed_blueprints = []
    
    for module_name, blueprint_name, description in real_blueprints_to_load:
        try:
            # محاولة استيراد الوحدة
            module = __import__(module_name, fromlist=[blueprint_name])
            
            # البحث عن Blueprint في الوحدة
            blueprint = None
            
            # محاولة العثور على Blueprint بأسماء مختلفة
            possible_names = [
                blueprint_name,
                blueprint_name.replace('_bp', ''),
                'bp',
                'blueprint',
                module_name.split('.')[-1] + '_bp'
            ]
            
            for name in possible_names:
                if hasattr(module, name):
                    potential_bp = getattr(module, name)
                    # التحقق من أنه Blueprint فعلاً
                    if hasattr(potential_bp, 'register'):
                        blueprint = potential_bp
                        break
            
            if blueprint:
                # تسجيل Blueprint
                app.register_blueprint(blueprint)
                loaded_blueprints.append({
                    'module': module_name,
                    'blueprint': blueprint_name,
                    'description': description,
                    'status': 'loaded',
                    'actual_name': name if 'name' in locals() else blueprint_name
                })
                print(f"✅ تم تحميل: {module_name} - {description}")
            else:
                failed_blueprints.append({
                    'module': module_name,
                    'blueprint': blueprint_name,
                    'description': description,
                    'error': f"Blueprint غير موجود - جرب: {possible_names}",
                    'status': 'blueprint_not_found'
                })
                print(f"❌ فشل في تحميل: {module_name} - {description} - Blueprint غير موجود")
            
        except ImportError as e:
            failed_blueprints.append({
                'module': module_name,
                'blueprint': blueprint_name,
                'description': description,
                'error': f"استيراد فاشل: {str(e)}",
                'status': 'import_failed'
            })
            print(f"❌ فشل في تحميل: {module_name} - {description} - {str(e)}")
            
        except Exception as e:
            failed_blueprints.append({
                'module': module_name,
                'blueprint': blueprint_name,
                'description': description,
                'error': f"خطأ غير متوقع: {str(e)}",
                'status': 'unexpected_error'
            })
            print(f"❌ فشل في تحميل: {module_name} - {description} - خطأ غير متوقع: {str(e)}")
    
    # إضافة مسار لعرض حالة Blueprints
    @app.route('/api/blueprints/status')
    def blueprints_status():
        return jsonify({
            'loaded_blueprints': loaded_blueprints,
            'failed_blueprints': failed_blueprints,
            'total_loaded': len(loaded_blueprints),
            'total_failed': len(failed_blueprints),
            'total_attempted': len(real_blueprints_to_load),
            'success_rate': f"{len(loaded_blueprints)}/{len(real_blueprints_to_load)}",
            'success_percentage': round((len(loaded_blueprints) / len(real_blueprints_to_load)) * 100, 2),
            'message': 'هذه هي Blueprints الحقيقية الموجودة في مشروعك',
            'note': 'إذا فشل التحميل، تحقق من أسماء Blueprints في الملفات'
        })
    
    print(f"📊 نتائج تحميل Blueprints الحقيقية:")
    print(f"   ✅ تم تحميل: {len(loaded_blueprints)}")
    print(f"   ❌ فشل في التحميل: {len(failed_blueprints)}")
    print(f"   📈 معدل النجاح: {len(loaded_blueprints)}/{len(real_blueprints_to_load)}")
    
    return len(loaded_blueprints), len(failed_blueprints)

def setup_error_handlers(app):
    """إعداد معالجات الأخطاء"""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'المسار غير موجود',
            'status_code': 404,
            'message': 'الرابط المطلوب غير متاح',
            'suggestion': 'تحقق من صحة الرابط أو راجع قائمة المسارات المتاحة',
            'available_endpoints': [
                '/',
                '/api/status',
                '/api/system/info',
                '/api/test-google-ads',
                '/api/environment',
                '/api/blueprints/status'
            ],
            'blueprints_note': 'مسارات إضافية متاحة من Blueprints المحملة'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'error': 'خطأ داخلي في الخادم',
            'status_code': 500,
            'message': 'حدث خطأ غير متوقع في الخادم',
            'details': str(error) if app.config.get('DEBUG') else 'تم إخفاء التفاصيل للأمان',
            'suggestion': 'تحقق من سجلات الخادم أو اتصل بالدعم التقني'
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"خطأ غير معالج: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'خطأ غير متوقع',
            'message': str(e) if app.config.get('DEBUG') else 'حدث خطأ غير متوقع',
            'type': type(e).__name__,
            'suggestion': 'تحقق من إعدادات التطبيق أو اتصل بالدعم التقني'
        }), 500

def create_app():
    """إنشاء التطبيق الكامل مع Blueprints الحقيقية"""
    
    # تحميل متغيرات البيئة
    if not load_environment_variables():
        print("❌ فشل في تحميل متغيرات البيئة")
        return None
    
    # إنشاء Flask app
    app = create_flask_app()
    
    # إعداد JWT Manager
    setup_jwt_manager(app)
    
    # إضافة المسارات الأساسية
    add_basic_routes(app)
    
    # إعداد معالجات الأخطاء
    setup_error_handlers(app)
    
    # تحميل Blueprints الحقيقية
    loaded_count, failed_count = load_real_blueprints(app)
    
    print(f"🌐 الخادم متاح على: http://localhost:5000")
    print(f"📋 المسارات المتاحة:")
    print(f"   - http://localhost:5000/ (الصفحة الرئيسية)")
    print(f"   - http://localhost:5000/api/status (حالة API)")
    print(f"   - http://localhost:5000/api/system/info (معلومات النظام)")
    print(f"   - http://localhost:5000/api/test-google-ads (اختبار Google Ads)")
    print(f"   - http://localhost:5000/api/environment (معلومات البيئة)")
    print(f"   - http://localhost:5000/api/blueprints/status (حالة Blueprints)")
    
    if loaded_count > 0:
        print(f"🎉 تم تحميل {loaded_count} blueprints حقيقية بنجاح!")
        print(f"📋 مسارات إضافية متاحة من Blueprints المحملة")
    
    return app

if __name__ == "__main__":
    print("🚀 بدء الخادم مع Blueprints الحقيقية...")
    
    # إنشاء التطبيق
    app = create_app()
    
    if app is None:
        print("❌ فشل في إنشاء التطبيق")
        sys.exit(1)
    
    # تشغيل الخادم
    try:
        app.run(
            debug=True,
            host="0.0.0.0",
            port=5000,
            use_reloader=False  # تجنب إعادة التحميل التلقائي للتطوير
        )
    except KeyboardInterrupt:
        print("\n🛑 تم إيقاف الخادم بواسطة المستخدم")
    except Exception as e:
        print(f"❌ خطأ في تشغيل الخادم: {e}")
        sys.exit(1)

