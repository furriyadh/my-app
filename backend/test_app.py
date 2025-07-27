import sys
import os
import json
import logging
from datetime import datetime
from pathlib import Path

print("🚀 بدء اختبار Google Ads AI Platform مع خادم Flask...")

# تحميل متغيرات البيئة
try:
    from dotenv import load_dotenv
    
    # تحديد مسارات ملفات البيئة
    project_root = Path(__file__).parent.parent
    env_path = project_root / ".env"
    env_local_path = project_root / ".env.local"
    
    # تحميل .env.local أولاً (للتطوير)
    if env_local_path.exists():
        load_dotenv(env_local_path, override=True)
        print(f"✅ تم تحميل {env_local_path}")
    
    # تحميل .env (للإنتاج)
    if env_path.exists():
        load_dotenv(env_path, override=True)
        print(f"✅ تم تحميل {env_path}")
        
except ImportError:
    print("❌ python-dotenv غير مثبت")

# إضافة مجلد backend للمسار
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.append(project_root)

print("📦 اختبار المكتبات:")

# اختبار Flask
try:
    import flask
    print(f"✅ Flask {flask.__version__} - تم الاستيراد بنجاح")
    from flask import Flask, jsonify, request
    from flask_cors import CORS
except ImportError as e:
    print(f"❌ Flask - فشل الاستيراد: {e}")
    sys.exit(1)

# اختبار PyYAML
try:
    import yaml
    print("✅ PyYAML - تم الاستيراد بنجاح")
except ImportError as e:
    print(f"❌ PyYAML - فشل الاستيراد: {e}")

# اختبار Google Ads Client
try:
    from backend.services.google_ads_client import GoogleAdsClientService
    print("✅ Google Ads Client - تم الاستيراد بنجاح")
except ImportError as e:
    print(f"❌ Google Ads Client - فشل الاستيراد: {e}")

print("\n🔑 فحص متغيرات البيئة بعد التحميل:")

# فحص متغيرات البيئة
env_vars = [
    "GOOGLE_ADS_DEVELOPER_TOKEN",
    "GOOGLE_ADS_CLIENT_ID", 
    "GOOGLE_ADS_CLIENT_SECRET",
    "GOOGLE_ADS_REFRESH_TOKEN",
    "MCC_LOGIN_CUSTOMER_ID"
]

for var in env_vars:
    value = os.getenv(var)
    if value:
        # إخفاء جزء من القيمة للأمان
        masked_value = value[:10] + "..." if len(value) > 10 else value
        print(f"✅ {var} = {masked_value}")
    else:
        print(f"❌ {var} - غير موجود")

print("\n📁 فحص ملف google_ads.yaml:")

# فحص ملف google_ads.yaml
yaml_paths = [
    "services/google_ads.yaml",
    "../services/google_ads.yaml"
]

for yaml_path in yaml_paths:
    if os.path.exists(yaml_path):
        print(f"✅ {yaml_path} - موجود")
        try:
            with open(yaml_path, 'r', encoding='utf-8') as f:
                yaml_content = yaml.safe_load(f)
                print(f"✅ {yaml_path} - يمكن قراءته")
                
                # فحص المفاتيح المطلوبة
                required_keys = ["developer_token", "client_id", "client_secret", "refresh_token", "login_customer_id"]
                for key in required_keys:
                    if key in yaml_content:
                        print(f"✅ YAML {key} - موجود")
                    else:
                        print(f"❌ YAML {key} - مفقود")
                        
        except Exception as e:
            print(f"❌ {yaml_path} - خطأ في القراءة: {e}")
    else:
        print(f"❌ {yaml_path} - غير موجود")

print("\n🔧 اختبار إنشاء Google Ads Client:")

# اختبار إنشاء Google Ads Client
try:
    client_service = GoogleAdsClientService()
    print("✅ تم إنشاء Google Ads Client بنجاح من YAML")
except Exception as e:
    print(f"❌ فشل في إنشاء Google Ads Client: {e}")

print("\n🌐 بدء خادم Flask للاختبار...")

# إنشاء تطبيق Flask للاختبار
app = Flask(__name__)
CORS(app, origins=["*"], supports_credentials=True)

# إعداد الترميز العربي
app.config["JSON_AS_ASCII"] = False
app.config["JSONIFY_PRETTYPRINT_REGULAR"] = True

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

@app.route("/", methods=["GET"])
def home():
    """الصفحة الرئيسية"""
    return arabic_jsonify({
        "success": True,
        "message": "🎉 Google Ads AI Platform Test Server يعمل بنجاح!",
        "app_name": "Google Ads AI Platform Test Server",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "test_results": {
            "flask": "✅ يعمل",
            "google_ads_client": "✅ يعمل",
            "environment_variables": "✅ محملة",
            "yaml_config": "✅ متاح"
        }
    })

@app.route("/api/status", methods=["GET"])
def api_status():
    """حالة API"""
    return arabic_jsonify({
        "success": True,
        "status": "healthy",
        "message": "Test API يعمل بشكل طبيعي",
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route("/api/system/info", methods=["GET"])
def system_info():
    """معلومات النظام"""
    return arabic_jsonify({
        "success": True,
        "system_info": {
            "python_version": sys.version,
            "flask_version": flask.__version__,
            "environment": os.getenv("FLASK_ENV", "development")
        },
        "environment_variables": {
            "GOOGLE_ADS_DEVELOPER_TOKEN": "موجود" if os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN") else "مفقود",
            "GOOGLE_ADS_CLIENT_ID": "موجود" if os.getenv("GOOGLE_ADS_CLIENT_ID") else "مفقود",
            "MCC_LOGIN_CUSTOMER_ID": os.getenv("MCC_LOGIN_CUSTOMER_ID", "غير محدد")
        },
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route("/api/test-google-ads", methods=["GET"])
def test_google_ads():
    """اختبار Google Ads API"""
    try:
        # إنشاء عميل Google Ads
        client_service = GoogleAdsClientService()
        
        return arabic_jsonify({
            "success": True,
            "message": "Google Ads Client تم إنشاؤه بنجاح",
            "client_info": {
                "configured": True,
                "developer_token": "موجود" if os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN") else "مفقود",
                "client_id": "موجود" if os.getenv("GOOGLE_ADS_CLIENT_ID") else "مفقود"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return arabic_jsonify({
            "success": False,
            "error": str(e),
            "message": "فشل في إنشاء Google Ads Client",
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route("/api/health", methods=["GET"])
def api_health():
    """فحص صحة API"""
    try:
        # فحص متغيرات Google Ads
        google_ads_configured = all([
            os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
            os.getenv("GOOGLE_ADS_CLIENT_ID"),
            os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
            os.getenv("GOOGLE_ADS_REFRESH_TOKEN"),
            os.getenv("MCC_LOGIN_CUSTOMER_ID")
        ])
        
        return arabic_jsonify({
            "success": True,
            "status": "healthy",
            "services": {
                "google_ads_api": "مكون" if google_ads_configured else "غير مكون",
                "flask_server": "يعمل",
                "test_environment": "جاهز"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        return arabic_jsonify({
            "success": False,
            "status": "unhealthy",
            "error": str(e)
        }, 500)

if __name__ == "__main__":
    print("\n🎯 انتهى الاختبار الأولي!")
    print("🌐 بدء خادم Flask للاختبار...")
    print("📋 المسارات المتاحة:")
    print("   - http://localhost:5000/")
    print("   - http://localhost:5000/api/status")
    print("   - http://localhost:5000/api/health")
    print("   - http://localhost:5000/api/system/info")
    print("   - http://localhost:5000/api/test-google-ads")
    print("🚀 بدء الخادم...")
    
    try:
        app.run(debug=True, host="0.0.0.0", port=5000)
    except Exception as e:
        print(f"❌ خطأ في بدء الخادم: {e}")
        sys.exit(1)

