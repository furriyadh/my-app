"""
Google Ads AI Platform - Main Flask Application
الخادم الرئيسي لمنصة Google Ads AI - محدث ومطور بالكامل
"""

import sys
import os
import json
import logging
import traceback
from datetime import datetime, timedelta
from dotenv import load_dotenv

# تحميل متغيرات البيئة من ملف .env
load_dotenv()

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token

# إضافة مجلد backend للمسار
current_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else '/home/ubuntu/backend'
if current_dir not in sys.path:
    sys.path.append(current_dir)

try:
    from utils.database import DatabaseManager
except ImportError as e:
    print(f"تحذير: لم يتم استيراد DatabaseManager - {e}")
    DatabaseManager = None

def create_app():
    """إنشاء تطبيق Flask - محدث ومطور بالكامل"""
    app = Flask(__name__)
    
    # إعداد الترميز العربي
    app.config['JSON_AS_ASCII'] = False
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
    
    # إعدادات أساسية من ملف .env
    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'google-ads-ai-platform-secret-key-2025')
    app.config['JWT_SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'google-ads-ai-platform-secret-key-2025')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    
    # إعدادات البيئة
    app.config['ENV'] = os.getenv('FLASK_ENV', 'development')
    app.config['DEBUG'] = os.getenv('FLASK_ENV') == 'development'
    
    # إعداد CORS
    CORS(app, origins=['*'], supports_credentials=True)
    
    # إعداد JWT
    jwt = JWTManager(app)
    
    # إعداد التسجيل
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('app.log', encoding='utf-8')
        ]
    )
    
    # دالة مخصصة لـ JSON مع دعم UTF-8
    def arabic_jsonify(data, status_code=200):
        """دالة مخصصة لإرجاع JSON مع دعم الأحرف العربية"""
        response = app.response_class(
            response=json.dumps(data, ensure_ascii=False, indent=2),
            status=status_code,
            mimetype='application/json; charset=utf-8'
        )
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        response.headers['Cache-Control'] = 'no-cache'
        return response
    
    # ===========================================
    # Middleware والمعالجات العامة
    # ===========================================
    
    @app.before_request
    def before_request():
        """معالج ما قبل الطلب"""
        g.start_time = datetime.utcnow()
        app.logger.info(f"طلب جديد: {request.method} {request.path} من {request.remote_addr}")
    
    @app.after_request
    def after_request(response):
        """معالج ما بعد الطلب"""
        if hasattr(g, 'start_time'):
            duration = (datetime.utcnow() - g.start_time).total_seconds()
            response.headers['X-Response-Time'] = f"{duration:.3f}s"
            app.logger.info(f"استجابة: {response.status_code} في {duration:.3f}s")
        
        # إضافة headers الأمان
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        return response
    
    @app.errorhandler(404)
    def not_found(error):
        """معالج الصفحات غير الموجودة"""
        return arabic_jsonify({
            'success': False,
            'error': 'المسار غير موجود',
            'message': 'الصفحة المطلوبة غير موجودة'
        }, 404)
    
    @app.errorhandler(500)
    def internal_error(error):
        """معالج الأخطاء الداخلية"""
        app.logger.error(f"خطأ داخلي: {str(error)}")
        app.logger.error(traceback.format_exc())
        
        return arabic_jsonify({
            'success': False,
            'error': 'خطأ داخلي في الخادم',
            'message': 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى'
        }, 500)
    
    # ===========================================
    # تسجيل Blueprints الجديدة
    # ===========================================
    
    # تسجيل MCC Blueprints
    try:
        from routes.mcc.accounts import mcc_accounts_bp
        from routes.mcc.clients import mcc_clients_bp
        from routes.mcc.permissions import mcc_permissions_bp
        from routes.mcc.sync import mcc_sync_bp
        from routes.mcc.analytics import mcc_analytics_bp
        
        app.register_blueprint(mcc_accounts_bp, url_prefix='/api/mcc/accounts')
        app.register_blueprint(mcc_clients_bp, url_prefix='/api/mcc/clients')
        app.register_blueprint(mcc_permissions_bp, url_prefix='/api/mcc/permissions')
        app.register_blueprint(mcc_sync_bp, url_prefix='/api/mcc/sync')
        app.register_blueprint(mcc_analytics_bp, url_prefix='/api/mcc/analytics')
        
        app.logger.info("✅ تم تحميل MCC Blueprints الجديدة بنجاح")
    except ImportError as e:
        app.logger.warning(f"⚠️ خطأ في تحميل MCC Blueprints الجديدة: {e}")
    
    # تسجيل Google Ads Blueprints
    try:
        from routes.google_ads.oauth import google_ads_oauth_bp
        if 'google_ads_oauth_bp' not in app.blueprints:
            app.register_blueprint(google_ads_oauth_bp, url_prefix='/api/google-ads/oauth')
            app.logger.info("✅ تم تحميل Google Ads OAuth Blueprint بنجاح على /api/google-ads/oauth")
            
            # التحقق من المسارات المسجلة
            oauth_routes = [rule.rule for rule in app.url_map.iter_rules() if rule.rule.startswith('/api/google-ads/oauth')]
            app.logger.info(f"📋 مسارات OAuth المسجلة: {oauth_routes}")
        else:
            app.logger.info("ℹ️ Google Ads OAuth Blueprint مسجل بالفعل.")
        
    except ImportError as e:
        app.logger.error(f"❌ خطأ في استيراد Google Ads OAuth Blueprint: {e}")
        app.logger.error("تأكد من وجود ملف routes/google_ads/oauth.py ووجود google_ads_oauth_bp")
    except Exception as e:
        app.logger.error(f"❌ خطأ في تسجيل Google Ads OAuth Blueprint: {e}")
        app.logger.error(traceback.format_exc())
    
    # تسجيل Blueprints القديمة (للتوافق مع الإصدارات السابقة)
    try:
        from routes.mcc_advanced import mcc_api
        app.register_blueprint(mcc_api)
        app.logger.info("✅ تم تسجيل MCC Advanced API بنجاح على /api/v1/mcc")
    except ImportError as e:
        app.logger.warning(f"❌ لم يتم تسجيل MCC Advanced API: {e}")
    
    try:
        from routes.google_ads_routes import google_ads_bp
        app.register_blueprint(google_ads_bp)
        app.logger.info("✅ تم تسجيل Google Ads Blueprint بنجاح على /api/google-ads")
    except ImportError as e:
        app.logger.warning(f"❌ لم يتم تسجيل Google Ads Blueprint: {e}")
    
    try:
        from routes.auth import auth_bp
        app.register_blueprint(auth_bp)
        app.logger.info("✅ تم تسجيل Auth Blueprint بنجاح على /api/auth")
    except ImportError as e:
        app.logger.warning(f"❌ لم يتم تسجيل Auth Blueprint: {e}")
    
    try:
        from routes.campaigns import campaigns_bp
        app.register_blueprint(campaigns_bp)
        app.logger.info("✅ تم تسجيل Campaigns Blueprint بنجاح على /api/campaigns")
    except ImportError as e:
        app.logger.warning(f"❌ لم يتم تسجيل Campaigns Blueprint: {e}")
    
    try:
        from routes.accounts import accounts_bp
        app.register_blueprint(accounts_bp)
        app.logger.info("✅ تم تسجيل Accounts Blueprint بنجاح على /api/accounts")
    except ImportError as e:
        app.logger.warning(f"❌ لم يتم تسجيل Accounts Blueprint: {e}")
    
    try:
        from routes.ai import ai_bp
        app.register_blueprint(ai_bp)
        app.logger.info("✅ تم تسجيل AI Blueprint بنجاح على /api/ai")
    except ImportError as e:
        app.logger.warning(f"❌ لم يتم تسجيل AI Blueprint: {e}")
    
    # إضافة باقي Google Ads Blueprints الجديدة
    try:
        from routes.google_ads.discovery import google_ads_discovery_bp
        from routes.google_ads.sync import google_ads_sync_bp
        from routes.google_ads.campaigns import google_ads_campaigns_bp
        from routes.google_ads.reports import google_ads_reports_bp
        
        app.register_blueprint(google_ads_discovery_bp, url_prefix='/api/google-ads/discovery')
        app.register_blueprint(google_ads_sync_bp, url_prefix='/api/google-ads/sync')
        app.register_blueprint(google_ads_campaigns_bp, url_prefix='/api/google-ads/campaigns')
        app.register_blueprint(google_ads_reports_bp, url_prefix='/api/google-ads/reports')
        
        app.logger.info("✅ تم تحميل باقي Google Ads Blueprints الجديدة بنجاح")
    except ImportError as e:
        app.logger.warning(f"⚠️ خطأ في تحميل باقي Google Ads Blueprints: {e}")
    except Exception as e:
        app.logger.error(f"❌ خطأ في تسجيل باقي Google Ads Blueprints: {e}")
    
    # تسجيل AI Blueprints الجديدة
    try:
        from routes.ai.keyword_research import keyword_research_bp
        from routes.ai.optimization import optimization_bp
        from routes.ai.analysis import analysis_bp
        from routes.ai.recommendations import recommendations_bp
        
        app.register_blueprint(keyword_research_bp, url_prefix='/api/ai/keyword-research')
        app.register_blueprint(optimization_bp, url_prefix='/api/ai/optimization')
        app.register_blueprint(analysis_bp, url_prefix='/api/ai/analysis')
        app.register_blueprint(recommendations_bp, url_prefix='/api/ai/recommendations')
        
        app.logger.info("✅ تم تحميل AI Blueprints الجديدة بنجاح")
    except ImportError as e:
        app.logger.warning(f"⚠️ خطأ في تحميل AI Blueprints: {e}")
    except Exception as e:
        app.logger.error(f"❌ خطأ في تسجيل AI Blueprints: {e}")
    
    # ===========================================
    # المسارات الأساسية
    # ===========================================
    
    @app.route('/', methods=['GET'])
    def health_check():
        """فحص صحة الخادم"""
        return arabic_jsonify({
            'success': True,
            'message': 'Google Ads AI Platform يعمل بنجاح',
            'app_name': 'Google Ads AI Platform',
            'version': '2.0.0',
            'environment': os.getenv('FLASK_ENV', 'development'),
            'timestamp': datetime.utcnow().isoformat(),
            'features': [
                'MCC Advanced API',
                'Google Ads Integration',
                'JWT Authentication',
                'Arabic Support',
                'Environment Variables Support'
            ]
        })
    
    @app.route('/api/health', methods=['GET'])
    def api_health():
        """فحص صحة API"""
        try:
            # فحص متغيرات Google Ads
            google_ads_configured = all([
                os.getenv('GOOGLE_DEVELOPER_TOKEN'),
                os.getenv('GOOGLE_CLIENT_ID'),
                os.getenv('GOOGLE_CLIENT_SECRET'),
                os.getenv('GOOGLE_REFRESH_TOKEN'),
                os.getenv('MCC_LOGIN_CUSTOMER_ID')
            ])
            
            return arabic_jsonify({
                'success': True,
                'status': 'healthy',
                'services': {
                    'google_ads_api': 'مكون' if google_ads_configured else 'غير مكون',
                    'google_ai_api': 'متصل' if os.getenv('GOOGLE_AI_API_KEY') else 'غير مكون',
                    'supabase': 'متصل' if os.getenv('SUPABASE_URL') and os.getenv('SUPABASE_KEY') else 'غير مكون'
                },
                'environment_variables': {
                    'FLASK_ENV': os.getenv('FLASK_ENV', 'غير محدد'),
                    'GOOGLE_DEVELOPER_TOKEN': 'موجود' if os.getenv('GOOGLE_DEVELOPER_TOKEN') else 'مفقود',
                    'MCC_LOGIN_CUSTOMER_ID': os.getenv('MCC_LOGIN_CUSTOMER_ID', 'غير محدد'),
                    'SUPABASE_URL': 'موجود' if os.getenv('SUPABASE_URL') else 'مفقود'
                },
                'timestamp': datetime.utcnow().isoformat()
            })
        except Exception as e:
            app.logger.error(f"خطأ في فحص الصحة: {str(e)}")
            return arabic_jsonify({
                'success': False,
                'status': 'unhealthy',
                'error': str(e)
            }, 500)
    
    @app.route('/api/auth/test-token', methods=['POST'])
    def create_test_token():
        """إنشاء token تجريبي للاختبار"""
        try:
            data = request.get_json() or {}
            user_id = data.get('user_id', 'test_user')
            
            # إنشاء token
            access_token = create_access_token(
                identity=user_id,
                expires_delta=timedelta(hours=24)
            )
            
            return arabic_jsonify({
                'success': True,
                'access_token': access_token,
                'user_id': user_id,
                'expires_in': 86400,  # 24 ساعة
                'token_type': 'Bearer',
                'usage': 'استخدم هذا التوكن في header: Authorization: Bearer <token>'
            })
        except Exception as e:
            app.logger.error(f"خطأ في إنشاء token: {str(e)}")
            return arabic_jsonify({
                'success': False,
                'error': str(e)
            }, 500)
    
    @app.route('/api/auth/verify-token', methods=['GET'])
    @jwt_required()
    def verify_token():
        """التحقق من صحة Token"""
        try:
            current_user = get_jwt_identity()
            return arabic_jsonify({
                'success': True,
                'user_id': current_user,
                'message': 'Token صالح',
                'timestamp': datetime.utcnow().isoformat()
            })
        except Exception as e:
            return arabic_jsonify({
                'success': False,
                'error': str(e)
            }, 401)
    
    # نقل system_status إلى داخل create_app
    @app.route('/api/status', methods=['GET'])
    def system_status():
        """حالة النظام المفصلة"""
        try:
            # فحص الخدمات
            services_status = {}
            
            # فحص Google Ads API
            google_ads_vars = [
                'GOOGLE_DEVELOPER_TOKEN',
                'GOOGLE_CLIENT_ID', 
                'GOOGLE_CLIENT_SECRET',
                'GOOGLE_REFRESH_TOKEN',
                'MCC_LOGIN_CUSTOMER_ID'
            ]
            google_ads_configured = all(os.getenv(var) for var in google_ads_vars)
            services_status['google_ads'] = {
                'configured': google_ads_configured,
                'missing_vars': [var for var in google_ads_vars if not os.getenv(var)]
            }
            
            # فحص Google AI API
            services_status['google_ai'] = {
                'configured': bool(os.getenv('GOOGLE_AI_API_KEY')),
                'missing_vars': [] if os.getenv('GOOGLE_AI_API_KEY') else ['GOOGLE_AI_API_KEY']
            }
            
            # فحص Supabase
            supabase_vars = ['SUPABASE_URL', 'SUPABASE_KEY']
            supabase_configured = all(os.getenv(var) for var in supabase_vars)
            services_status['supabase'] = {
                'configured': supabase_configured,
                'missing_vars': [var for var in supabase_vars if not os.getenv(var)]
            }
            
            # إحصائيات النظام
            system_stats = {
                'uptime': str(datetime.utcnow() - g.get('app_start_time', datetime.utcnow())),
                'environment': os.getenv('FLASK_ENV', 'development'),
                'debug_mode': app.config.get('DEBUG', False),
                'python_version': sys.version,
                'flask_version': '2.3.3'  # أو احصل عليها ديناميكياً
            }
            
            # حالة عامة
            overall_health = all(service['configured'] for service in services_status.values())
            
            return arabic_jsonify({
                'success': True,
                'overall_health': 'صحي' if overall_health else 'يحتاج إعداد',
                'services': services_status,
                'system': system_stats,
                'timestamp': datetime.utcnow().isoformat()
            })
        except Exception as e:
            app.logger.error(f"خطأ في فحص حالة النظام: {str(e)}")
            return arabic_jsonify({
                'success': False,
                'status': 'unhealthy',
                'error': str(e)
            }, 500)

    return app

# إنشاء التطبيق
app = create_app()

if __name__ == '__main__':
    print("🚀 بدء تشغيل Google Ads AI Platform...")
    print(f"🌍 البيئة: {os.getenv('FLASK_ENV', 'development')}")
    print(f"🔑 JWT مكون: {'نعم' if os.getenv('FLASK_SECRET_KEY') else 'لا'}")
    print(f"📊 Google Ads مكون: {'نعم' if os.getenv('GOOGLE_DEVELOPER_TOKEN') else 'لا'}")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_ENV') == 'development'
    )




