#!/usr/bin/env python3
"""
تطبيق Flask للاختبار
اختبار مسارات OAuth و Google Ads API
"""

import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

# إضافة المسار الجذر للمشروع إلى sys.path
# هذا يضمن أن يتمكن Python من العثور على الوحدات النمطية داخل مجلد backend
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root) # استخدام insert(0, ...) لإعطاء الأولوية

# تحميل متغيرات البيئة
from dotenv import load_dotenv
load_dotenv()

def create_test_app():
    """إنشاء تطبيق Flask للاختبار"""
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "test-secret-key"
    
    # تمكين CORS
    CORS(app, origins="*")
    
    @app.route("/")
    def home():
        """الصفحة الرئيسية"""
        return jsonify({
            "message": "تطبيق Google Ads API يعمل بنجاح",
            "status": "running",
            "version": "1.0.0"
        })
    
    @app.route("/health")
    def health_check():
        """فحص صحة التطبيق"""
        return jsonify({
            "status": "healthy",
            "timestamp": "2025-07-22T18:20:00Z"
        })
    
    @app.route("/api/config")
    def config_check():
        """فحص إعدادات البيئة"""
        config_status = {
            "GOOGLE_CLIENT_ID": bool(os.getenv("GOOGLE_CLIENT_ID") or os.getenv("GOOGLE_ADS_CLIENT_ID")),
            "GOOGLE_CLIENT_SECRET": bool(os.getenv("GOOGLE_CLIENT_SECRET") or os.getenv("GOOGLE_ADS_CLIENT_SECRET")),
            "GOOGLE_DEVELOPER_TOKEN": bool(os.getenv("GOOGLE_DEVELOPER_TOKEN") or os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN")),
            "MCC_LOGIN_CUSTOMER_ID": bool(os.getenv("MCC_LOGIN_CUSTOMER_ID") or os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID")),
            "GOOGLE_REDIRECT_URI": bool(os.getenv("GOOGLE_REDIRECT_URI") or os.getenv("REACT_APP_GOOGLE_REDIRECT_URI"))
        }
        
        return jsonify({
            "config": config_status,
            "all_configured": all(config_status.values())
        })
    
    # تسجيل OAuth Blueprint
    try:
        from backend.routes.google_ads.oauth_routes import oauth_bp
        app.register_blueprint(oauth_bp)
        print("✅ تم تحميل OAuth Blueprint بنجاح")
    except Exception as e:
        print(f"❌ خطأ في تحميل OAuth Blueprint: {e}")
    
    return app

if __name__ == "__main__":
    app = create_test_app()
    print("🚀 بدء تشغيل تطبيق الاختبار...")
    print("📍 الرابط: http://localhost:5000")
    print("🔗 OAuth: http://localhost:5000/api/google-ads/oauth/test")
    
    # تشغيل التطبيق في وضع الإنتاج لضمان عدم إغلاقه تلقائيًا
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True, # تفعيل وضع التصحيح
        use_reloader=False
    )

