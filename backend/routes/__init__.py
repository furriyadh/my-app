""" 
مسارات API - Routes Package
Google Ads AI Platform - API Routes
الملف المحدث والمُصحح - يحل مشكلة "No module named 'backend'"
"""

from flask import Blueprint
import os
import sys

def register_routes(app):
    """تسجيل جميع مسارات API مع معالجة أخطاء الاستيراد"""
    
    print("📦 بدء تسجيل Routes من __init__.py...")
    
    # قائمة Blueprints للتسجيل مع معالجة آمنة للأخطاء
    blueprints_to_register = []
    
    # 1. محاولة استيراد auth_middleware
    try:
        # جرب مسارات مختلفة للاستيراد
        try:
            from ..auth.auth_middleware import auth_middleware_bp
            blueprints_to_register.append((auth_middleware_bp, "/api/auth", "Auth Middleware"))
            print("✅ تم استيراد auth_middleware_bp من ..auth.auth_middleware")
        except ImportError:
            try:
                from auth.auth_middleware import auth_middleware_bp
                blueprints_to_register.append((auth_middleware_bp, "/api/auth", "Auth Middleware"))
                print("✅ تم استيراد auth_middleware_bp من auth.auth_middleware")
            except ImportError:
                print("⚠️ فشل استيراد auth_middleware_bp - تم تخطيه")
    except Exception as e:
        print(f"❌ خطأ في استيراد auth_middleware: {e}")
    
    # 2. محاولة استيراد campaigns
    try:
        from .campaigns import campaigns_bp
        blueprints_to_register.append((campaigns_bp, "/api/campaigns", "Campaigns"))
        print("✅ تم استيراد campaigns_bp")
    except ImportError as e:
        print(f"⚠️ فشل استيراد campaigns_bp: {e}")
    except Exception as e:
        print(f"❌ خطأ في استيراد campaigns: {e}")
    
    # 3. محاولة استيراد accounts
    try:
        from .accounts import accounts_bp
        blueprints_to_register.append((accounts_bp, "/api/accounts", "Accounts"))
        print("✅ تم استيراد accounts_bp")
    except ImportError as e:
        print(f"⚠️ فشل استيراد accounts_bp: {e}")
    except Exception as e:
        print(f"❌ خطأ في استيراد accounts: {e}")
    
    # 4. محاولة استيراد ai
    try:
        from .ai import ai_bp
        blueprints_to_register.append((ai_bp, "/api/ai", "AI"))
        print("✅ تم استيراد ai_bp")
    except ImportError as e:
        print(f"⚠️ فشل استيراد ai_bp: {e}")
    except Exception as e:
        print(f"❌ خطأ في استيراد ai: {e}")
    
    # 5. محاولة استيراد google_ads
    try:
        from .google_ads import google_ads_bp
        blueprints_to_register.append((google_ads_bp, "/api/google-ads", "Google Ads"))
        print("✅ تم استيراد google_ads_bp")
    except ImportError as e:
        print(f"⚠️ فشل استيراد google_ads_bp: {e}")
    except Exception as e:
        print(f"❌ خطأ في استيراد google_ads: {e}")
    
    # 6. محاولة استيراد auth_jwt
    try:
        from .auth_jwt import auth_bp
        blueprints_to_register.append((auth_bp, "/api/auth-jwt", "Auth JWT"))
        print("✅ تم استيراد auth_bp من auth_jwt")
    except ImportError as e:
        print(f"⚠️ فشل استيراد auth_bp: {e}")
    except Exception as e:
        print(f"❌ خطأ في استيراد auth_jwt: {e}")
    
    # 7. محاولة استيراد google_ads_routes
    try:
        from .google_ads_routes import google_ads_routes_bp
        blueprints_to_register.append((google_ads_routes_bp, "/api/google-ads-routes", "Google Ads Routes"))
        print("✅ تم استيراد google_ads_routes_bp")
    except ImportError as e:
        print(f"⚠️ فشل استيراد google_ads_routes_bp: {e}")
    except Exception as e:
        print(f"❌ خطأ في استيراد google_ads_routes: {e}")
    
    # 8. محاولة استيراد mcc_advanced
    try:
        from .mcc_advanced import mcc_bp
        blueprints_to_register.append((mcc_bp, "/api/mcc", "MCC Advanced"))
        print("✅ تم استيراد mcc_bp")
    except ImportError as e:
        print(f"⚠️ فشل استيراد mcc_bp: {e}")
    except Exception as e:
        print(f"❌ خطأ في استيراد mcc_advanced: {e}")
    
    # 9. محاولة استيراد merchant_center_routes
    try:
        from .merchant_center_routes import merchant_center_bp
        blueprints_to_register.append((merchant_center_bp, "/api/merchant-center", "Merchant Center"))
        print("✅ تم استيراد merchant_center_bp")
    except ImportError as e:
        print(f"⚠️ فشل استيراد merchant_center_bp: {e}")
    except Exception as e:
        print(f"❌ خطأ في استيراد merchant_center_routes: {e}")
    
    # تسجيل جميع Blueprints المستوردة بنجاح
    registered_count = 0
    failed_count = 0
    
    for blueprint, url_prefix, name in blueprints_to_register:
        try:
            app.register_blueprint(blueprint, url_prefix=url_prefix)
            registered_count += 1
            print(f"🎉 تم تسجيل {name} على {url_prefix}")
        except Exception as e:
            failed_count += 1
            print(f"❌ فشل تسجيل {name}: {e}")
    
    # إحصائيات التسجيل
    total_attempted = len(blueprints_to_register)
    print(f"📊 نتائج تسجيل Routes:")
    print(f"   ✅ تم تسجيل: {registered_count}")
    print(f"   ❌ فشل في التسجيل: {failed_count}")
    print(f"   📈 معدل النجاح: {registered_count}/{total_attempted}")
    
    if registered_count > 0:
        print(f"🎉 تم تسجيل {registered_count} routes بنجاح من __init__.py!")
    else:
        print("⚠️ لم يتم تسجيل أي routes من __init__.py")
    
    return registered_count, failed_count

# إضافة دالة مساعدة لاختبار الاستيرادات
def test_imports():
    """اختبار جميع الاستيرادات المحتملة"""
    print("🧪 اختبار استيرادات Routes...")
    
    imports_status = {}
    
    # قائمة الاستيرادات للاختبار
    test_imports = [
        ("campaigns", "from .campaigns import campaigns_bp"),
        ("accounts", "from .accounts import accounts_bp"),
        ("ai", "from .ai import ai_bp"),
        ("google_ads", "from .google_ads import google_ads_bp"),
        ("auth_jwt", "from .auth_jwt import auth_bp"),
        ("google_ads_routes", "from .google_ads_routes import google_ads_routes_bp"),
        ("mcc_advanced", "from .mcc_advanced import mcc_bp"),
        ("merchant_center_routes", "from .merchant_center_routes import merchant_center_bp"),
    ]
    
    for module_name, import_statement in test_imports:
        try:
            exec(import_statement)
            imports_status[module_name] = "✅ نجح"
            print(f"✅ {module_name}: نجح الاستيراد")
        except ImportError as e:
            imports_status[module_name] = f"❌ فشل: {e}"
            print(f"❌ {module_name}: فشل الاستيراد - {e}")
        except Exception as e:
            imports_status[module_name] = f"❌ خطأ: {e}"
            print(f"❌ {module_name}: خطأ غير متوقع - {e}")
    
    return imports_status

# إضافة معلومات للتشخيص
def get_routes_info():
    """الحصول على معلومات مجلد routes"""
    import os
    
    routes_dir = os.path.dirname(__file__)
    
    info = {
        'routes_directory': routes_dir,
        'files_in_routes': [],
        'python_files': [],
        'init_file_exists': os.path.exists(os.path.join(routes_dir, '__init__.py'))
    }
    
    try:
        files = os.listdir(routes_dir)
        info['files_in_routes'] = files
        info['python_files'] = [f for f in files if f.endswith('.py')]
    except Exception as e:
        info['error'] = str(e)
    
    return info

# دالة للحصول على معلومات Python Path
def get_python_path_info():
    """معلومات Python Path للتشخيص"""
    import sys
    
    return {
        'python_path': sys.path[:5],  # أول 5 مسارات فقط
        'current_working_directory': os.getcwd(),
        'file_location': __file__ if '__file__' in globals() else 'غير معروف'
    }

# إضافة دالة تشخيص شاملة
def diagnose_routes():
    """تشخيص شامل لمشاكل Routes"""
    print("🔍 بدء التشخيص الشامل لـ Routes...")
    
    # معلومات المجلد
    routes_info = get_routes_info()
    print(f"📁 مجلد Routes: {routes_info['routes_directory']}")
    print(f"📄 ملفات Python: {routes_info['python_files']}")
    
    # معلومات Python Path
    path_info = get_python_path_info()
    print(f"🐍 Python Path: {path_info['python_path']}")
    print(f"📂 مجلد العمل: {path_info['current_working_directory']}")
    
    # اختبار الاستيرادات
    imports_status = test_imports()
    
    # ملخص التشخيص
    successful_imports = sum(1 for status in imports_status.values() if status.startswith("✅"))
    total_imports = len(imports_status)
    
    print(f"📊 ملخص التشخيص:")
    print(f"   ✅ استيرادات ناجحة: {successful_imports}/{total_imports}")
    print(f"   📁 ملفات Python في routes: {len(routes_info['python_files'])}")
    print(f"   🔧 __init__.py موجود: {routes_info['init_file_exists']}")
    
    return {
        'routes_info': routes_info,
        'path_info': path_info,
        'imports_status': imports_status,
        'summary': {
            'successful_imports': successful_imports,
            'total_imports': total_imports,
            'success_rate': f"{successful_imports}/{total_imports}"
        }
    }

# تشغيل التشخيص عند استيراد الملف (للاختبار)
if __name__ == "__main__":
    print("🧪 تشغيل اختبار __init__.py...")
    diagnosis = diagnose_routes()
    print("✅ انتهى الاختبار")

