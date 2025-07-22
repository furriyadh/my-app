import sys
import os
import json
import logging
import traceback
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pathlib import Path

# تحميل متغيرات البيئة من ملف .env.local أولاً ثم .env
env_path_local = Path(__file__).parent.parent / ".env.local"
env_path = Path(__file__).parent.parent / ".env"

load_dotenv(dotenv_path=env_path)
load_dotenv(dotenv_path=env_path_local, override=True)

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# إضافة مجلد backend للمسار
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.append(project_root)
# استيراد نظام المصادقة الجديد
from backend.auth.jwt_manager import jwt_manager

try:
    from backend.utils.database import DatabaseManager
except ImportError as e:
    print(f"تحذير: لم يتم استيراد DatabaseManager - {e}")
    DatabaseManager = None

from backend.utils.email_sender import EmailSender

def create_app():
    """إنشاء تطبيق Flask - محدث ومطور بالكامل"""
    app = Flask(__name__)
    
    # إعداد الترميز العربي
    app.config["JSON_AS_ASCII"] = False
    app.config["JSONIFY_PRETTYPRINT_REGULAR"] = True
    
    # إعدادات أساسية من ملف .env
    app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "google-ads-ai-platform-secret-key-2025")
    app.config["JWT_SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "google-ads-ai-platform-secret-key-2025")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
    app.config["JWT_VERIFICATION_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_RESET_TOKEN_EXPIRES"] = timedelta(minutes=15)
    
    # إعدادات البيئة
    app.config["ENV"] = os.getenv("FLASK_ENV", "development")
    app.config["DEBUG"] = os.getenv("FLASK_ENV") == "development"
    
    # إعداد CORS
    CORS(app, origins=["*"], supports_credentials=True)
    
    # تهيئة JWT Manager الجديد
    jwt_manager.init_app(app)
    
    # إعداد التسجيل
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler("app.log", encoding="utf-8")
        ]
    )
    
    # دالة مخصصة لـ JSON مع دعم UTF-8
    def arabic_jsonify(data, status_code=200):
        """دالة مخصصة لإرجاع JSON مع دعم الأحرف العربية"""
        response = app.response_class(
            response=json.dumps(data, ensure_ascii=False, indent=2),
            status=status_code,
            mimetype="application/json; charset=utf-8"
        )
        response.headers["Content-Type"] = "application/json; charset=utf-8"
        response.headers["Cache-Control"] = "no-cache"
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
        if hasattr(g, "start_time"):
            duration = (datetime.utcnow() - g.start_time).total_seconds()
            response.headers["X-Response-Time"] = f"{duration:.3f}s"
            app.logger.info(f"استجابة: {response.status_code} في {duration:.3f}s")
        
        # إضافة headers الأمان
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        return response
    
    @app.errorhandler(404)
    def not_found(error):
        """معالج الصفحات غير الموجودة"""
        return arabic_jsonify({
            "success": False,
            "error": "المسار غير موجود",
            "message": "الصفحة المطلوبة غير موجودة"
        }, 404)
    
    @app.errorhandler(500)
    def internal_error(error):
        """معالج الأخطاء الداخلية"""
        app.logger.error(f"خطأ داخلي: {str(error)}")
        app.logger.error(traceback.format_exc())
        
        return arabic_jsonify({
            "success": False,
            "error": "خطأ داخلي في الخادم",
            "message": "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى"
        }, 500)
    
    # ===========================================
    # تسجيل Blueprints
    # ===========================================
    
    # تسجيل Google Ads OAuth Blueprint
    try:
        from backend.routes.google_ads.auth_jwt import auth_jwt_bp as google_ads_oauth_bp
        app.register_blueprint(google_ads_oauth_bp, url_prefix="/api/google-ads/oauth")
        app.logger.info("✅ تم تحميل Google Ads OAuth Blueprint بنجاح على /api/google-ads/oauth")
    except ImportError as e:
        app.logger.error(f"❌ خطأ في استيراد Google Ads OAuth Blueprint: {e}")
    except Exception as e:
        app.logger.error(f"❌ خطأ في تسجيل Google Ads OAuth Blueprint: {e}")
    
    # تسجيل Campaigns Blueprint
    try:
        from backend.routes.campaigns import campaigns_bp
        app.register_blueprint(campaigns_bp)
        app.logger.info("✅ تم تسجيل Campaigns Blueprint بنجاح على /api/campaigns")
    except ImportError as e:
        app.logger.warning(f"❌ لم يتم تسجيل Campaigns Blueprint: {e}")
    
    # تسجيل Accounts Blueprint
    try:
        from backend.routes.accounts import accounts_bp
        app.register_blueprint(accounts_bp)
        app.logger.info("✅ تم تسجيل Accounts Blueprint بنجاح على /api/accounts")
    except ImportError as e:
        app.logger.warning(f"❌ لم يتم تسجيل Accounts Blueprint: {e}")
    
    # تسجيل Merchant Center Blueprint
    try:
        from backend.routes.merchant_center_routes import merchant_center_bp
        app.register_blueprint(merchant_center_bp, url_prefix="/api/merchant-center")
        app.logger.info("✅ تم تحميل Merchant Center Blueprint بنجاح")
    except ImportError as e:
        app.logger.warning(f"⚠️ خطأ في تحميل Merchant Center Blueprint: {e}")
    except Exception as e:
        app.logger.error(f"❌ خطأ في تسجيل Merchant Center Blueprint: {e}")
        
    # ===========================================
    # المسارات الأساسية
    # ===========================================
    
    @app.route("/", methods=["GET"])
    def health_check():
        """فحص صحة الخادم"""
        return arabic_jsonify({
            "success": True,
            "message": "Google Ads AI Platform يعمل بنجاح",
            "app_name": "Google Ads AI Platform",
            "version": "2.0.0",
            "environment": os.getenv("FLASK_ENV", "development"),
            "timestamp": datetime.utcnow().isoformat(),
            "features": [
                "Google Ads Integration",
                "JWT Authentication",
                "Arabic Support",
                "Environment Variables Support"
            ]
        })
    
    @app.route("/api/health", methods=["GET"])
    def api_health():
        """فحص صحة API"""
        try:
            # فحص متغيرات Google Ads
            google_ads_configured = all([
                os.getenv("GOOGLE_DEVELOPER_TOKEN"),
                os.getenv("GOOGLE_CLIENT_ID"),
                os.getenv("GOOGLE_CLIENT_SECRET"),
                os.getenv("GOOGLE_REFRESH_TOKEN"),
                os.getenv("MCC_LOGIN_CUSTOMER_ID")
            ])
            
            return arabic_jsonify({
                "success": True,
                "status": "healthy",
                "services": {
                    "google_ads_api": "مكون" if google_ads_configured else "غير مكون",
                    "google_ai_api": "متصل" if os.getenv("GOOGLE_AI_API_KEY") else "غير مكون",
                    "supabase": "متصل" if os.getenv("NEXT_PUBLIC_SUPABASE_URL") and os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") else "غير مكون"
                },
                "environment_variables": {
                    "FLASK_ENV": os.getenv("FLASK_ENV", "غير محدد"),
                    "GOOGLE_DEVELOPER_TOKEN": "موجود" if os.getenv("GOOGLE_DEVELOPER_TOKEN") else "مفقود",
                    "MCC_LOGIN_CUSTOMER_ID": os.getenv("MCC_LOGIN_CUSTOMER_ID", "غير محدد"),
                    "SUPABASE_URL": "موجود" if os.getenv("NEXT_PUBLIC_SUPABASE_URL") else "مفقود"
                },
                "timestamp": datetime.utcnow().isoformat()
            })
        except Exception as e:
            app.logger.error(f"خطأ في فحص الصحة: {str(e)}")
            return arabic_jsonify({
                "success": False,
                "status": "unhealthy",
                "error": str(e)
            }, 500)
    
    @app.route("/api/test-email", methods=["POST"])
    def test_email_endpoint():
        data = request.get_json()
        to_email = data.get("to_email")
        subject = data.get("subject", "اختبار البريد الإلكتروني من Google Ads AI Platform")
        html_content = data.get("html_content", "<p>هذا بريد إلكتروني اختباري من تطبيق Google Ads AI Platform.</p>")

        email_sender = EmailSender()
        if not to_email:
            return arabic_jsonify({"success": False, "message": "البريد الإلكتروني للمستلم مطلوب"}, 400)

        if email_sender.send_email(to_email, subject, html_content, is_html=True):
            return arabic_jsonify({"success": True, "message": "تم إرسال البريد الإلكتروني بنجاح"}, 200)
        else:
            return arabic_jsonify({"success": False, "message": "فشل في إرسال البريد الإلكتروني"}, 500)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)




    # تسجيل AI Blueprint
    try:
        from backend.routes.ai.ai_routes import ai_bp as ai_blueprint
        app.register_blueprint(ai_blueprint, url_prefix="/api/ai")
        app.logger.info("✅ تم تحميل AI Blueprint بنجاح على /api/ai")
    except ImportError as e:
        app.logger.error(f"❌ خطأ في استيراد AI Blueprint: {e}")
    except Exception as e:
        app.logger.error(f"❌ خطأ في تسجيل AI Blueprint: {e}")


