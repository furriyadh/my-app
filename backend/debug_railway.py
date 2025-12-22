#!/usr/bin/env python3
"""
Railway Debug Script
تشخيص مشاكل Railway Backend
"""

import os
import sys
from pathlib import Path

def check_environment_variables():
    """فحص متغيرات البيئة المطلوبة"""
    print("🔍 فحص متغيرات البيئة...")
    
    required_vars = [
        'GOOGLE_ADS_DEVELOPER_TOKEN',
        'GOOGLE_ADS_CLIENT_ID', 
        'GOOGLE_ADS_CLIENT_SECRET',
        'GOOGLE_ADS_REFRESH_TOKEN',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET',
        'PORT'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: موجود")
        else:
            print(f"❌ {var}: مفقود")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n🚨 متغيرات مفقودة: {', '.join(missing_vars)}")
        return False
    else:
        print("\n✅ جميع المتغيرات المطلوبة موجودة")
        return True

def check_imports():
    """فحص استيراد المكتبات"""
    print("\n🔍 فحص استيراد المكتبات...")
    
    try:
        import flask
        print("✅ Flask: متاح")
    except ImportError as e:
        print(f"❌ Flask: {e}")
        return False
    
    try:
        import google.ads.googleads
        print("✅ Google Ads API: متاح")
    except ImportError as e:
        print(f"❌ Google Ads API: {e}")
        return False
    
    try:
        from supabase import create_client
        print("✅ Supabase: متاح")
    except ImportError as e:
        print(f"❌ Supabase: {e}")
        return False
    
    return True

def check_app_file():
    """فحص ملف app.py"""
    print("\n🔍 فحص ملف app.py...")
    
    app_path = Path(__file__).parent / 'app.py'
    if app_path.exists():
        print("✅ ملف app.py موجود")
        
        # فحص محتوى الملف
        with open(app_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'if __name__ == "__main__":' in content or "if __name__ == '__main__':" in content:
            print("✅ نقطة دخول التطبيق موجودة")
        else:
            print("❌ نقطة دخول التطبيق مفقودة")
            return False
            
        if 'app.run(' in content:
            print("✅ تشغيل التطبيق موجود")
        else:
            print("❌ تشغيل التطبيق مفقود")
            return False
            
        return True
    else:
        print("❌ ملف app.py غير موجود")
        return False

def check_railway_config():
    """فحص تكوين Railway"""
    print("\n🔍 فحص تكوين Railway...")
    
    railway_json = Path(__file__).parent / 'railway.json'
    if railway_json.exists():
        print("✅ ملف railway.json موجود")
    else:
        print("❌ ملف railway.json غير موجود")
        return False
    
    procfile = Path(__file__).parent / 'Procfile'
    if procfile.exists():
        print("✅ ملف Procfile موجود")
    else:
        print("❌ ملف Procfile غير موجود")
        return False
    
    return True

def main():
    """الدالة الرئيسية"""
    print("🚀 بدء تشخيص Railway Backend...")
    print("=" * 50)
    
    # فحص متغيرات البيئة
    env_ok = check_environment_variables()
    
    # فحص المكتبات
    imports_ok = check_imports()
    
    # فحص ملف التطبيق
    app_ok = check_app_file()
    
    # فحص تكوين Railway
    config_ok = check_railway_config()
    
    print("\n" + "=" * 50)
    print("📊 نتائج التشخيص:")
    print(f"متغيرات البيئة: {'✅' if env_ok else '❌'}")
    print(f"المكتبات: {'✅' if imports_ok else '❌'}")
    print(f"ملف التطبيق: {'✅' if app_ok else '❌'}")
    print(f"تكوين Railway: {'✅' if config_ok else '❌'}")
    
    if all([env_ok, imports_ok, app_ok, config_ok]):
        print("\n🎉 جميع الفحوصات نجحت! المشكلة قد تكون في Railway نفسه.")
        print("💡 جرب إعادة تشغيل الخدمة في Railway Dashboard")
    else:
        print("\n🚨 هناك مشاكل تحتاج إصلاح قبل النشر")
    
    print("\n🔧 معلومات إضافية:")
    print(f"Python Version: {sys.version}")
    print(f"Current Directory: {os.getcwd()}")
    print(f"Railway Environment: {os.getenv('RAILWAY_ENVIRONMENT', 'غير محدد')}")
    print(f"PORT: {os.getenv('PORT', 'غير محدد')}")

if __name__ == '__main__':
    main()
