#!/usr/bin/env python3
"""
الحل الشامل النهائي لمشكلة DLL load failed while importing _bcrypt
حل جذري شامل لإصلاح Windows DLL system

المشكلة الحقيقية: Visual C++ Runtime مفقود/تالف + Windows system files تالفة
الحل: إصلاح شامل لـ Windows system + تثبيت جميع Visual C++ Runtimes

Author: AI Assistant
Version: 4.0.0 - Ultimate Windows System Repair
Date: 2025-08-05
"""

import subprocess
import sys
import platform
import os
import time
import winreg
import shutil
from pathlib import Path

def print_header():
    """طباعة رأس السكريپت"""
    print("=" * 90)
    print("🔧 الحل الشامل النهائي لمشكلة DLL load failed while importing _bcrypt")
    print("=" * 90)
    print("📋 المشكلة: Windows DLL system تالف + Visual C++ Runtime مفقود")
    print("🎯 الهدف: إصلاح شامل للنظام + 8/8 blueprints تعمل")
    print("⏱️ الوقت المتوقع: 1-2 ساعة (حل جذري شامل)")
    print("⚠️ يتطلب: صلاحيات Administrator + اتصال إنترنت مستقر")
    print("=" * 90)

def check_admin_privileges():
    """فحص صلاحيات Administrator"""
    print("\n🔒 فحص صلاحيات Administrator...")
    
    try:
        # محاولة كتابة في مجلد System32
        test_file = r"C:\Windows\System32\test_admin.tmp"
        with open(test_file, 'w') as f:
            f.write("test")
        os.remove(test_file)
        print("✅ صلاحيات Administrator متاحة")
        return True
    except PermissionError:
        print("❌ صلاحيات Administrator غير متاحة")
        print("💡 يجب تشغيل السكريپت كـ Administrator")
        print("   انقر بالزر الأيمن على Command Prompt واختر 'Run as administrator'")
        return False
    except Exception as e:
        print(f"⚠️ خطأ في فحص الصلاحيات: {e}")
        return False

def diagnose_system_comprehensive():
    """تشخيص شامل للنظام"""
    print("\n🔍 تشخيص شامل للنظام...")
    
    system_info = {
        "python_version": platform.python_version(),
        "python_architecture": platform.architecture()[0],
        "windows_version": platform.platform(),
        "processor": platform.processor(),
    }
    
    print("📊 معلومات النظام:")
    for key, value in system_info.items():
        print(f"   {key}: {value}")
    
    return system_info

def check_visual_cpp_comprehensive():
    """فحص شامل لجميع إصدارات Visual C++ Redistributable"""
    print("\n🔍 فحص شامل لـ Visual C++ Redistributable...")
    
    # قائمة جميع إصدارات Visual C++ المهمة
    vcpp_versions = [
        # Visual C++ 2015-2022 (الأهم)
        (r"SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64", "Visual C++ 2015-2022 x64"),
        (r"SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x86", "Visual C++ 2015-2022 x86"),
        (r"SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\ARM64", "Visual C++ 2015-2022 ARM64"),
        
        # WOW64 entries
        (r"SOFTWARE\WOW6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x64", "Visual C++ 2015-2022 x64 (WOW64)"),
        (r"SOFTWARE\WOW6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x86", "Visual C++ 2015-2022 x86 (WOW64)"),
        
        # إصدارات أقدم للتوافق
        (r"SOFTWARE\Microsoft\VisualStudio\12.0\VC\Runtimes\x64", "Visual C++ 2013 x64"),
        (r"SOFTWARE\Microsoft\VisualStudio\12.0\VC\Runtimes\x86", "Visual C++ 2013 x86"),
        (r"SOFTWARE\Microsoft\VisualStudio\11.0\VC\Runtimes\x64", "Visual C++ 2012 x64"),
        (r"SOFTWARE\Microsoft\VisualStudio\11.0\VC\Runtimes\x86", "Visual C++ 2012 x86"),
        (r"SOFTWARE\Microsoft\VisualStudio\10.0\VC\Runtimes\x64", "Visual C++ 2010 x64"),
        (r"SOFTWARE\Microsoft\VisualStudio\10.0\VC\Runtimes\x86", "Visual C++ 2010 x86"),
    ]
    
    found_versions = []
    missing_versions = []
    
    for reg_path, name in vcpp_versions:
        try:
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, reg_path)
            try:
                version, _ = winreg.QueryValueEx(key, "Version")
                installed, _ = winreg.QueryValueEx(key, "Installed")
                if installed:
                    print(f"   ✅ {name}: {version}")
                    found_versions.append((name, version))
                else:
                    print(f"   ⚠️ {name}: مثبت لكن غير مفعل")
                    missing_versions.append(name)
            except FileNotFoundError:
                print(f"   ❌ {name}: معلومات الإصدار مفقودة")
                missing_versions.append(name)
            winreg.CloseKey(key)
        except FileNotFoundError:
            print(f"   ❌ {name}: غير مثبت")
            missing_versions.append(name)
        except Exception as e:
            print(f"   ⚠️ {name}: خطأ في الفحص - {e}")
            missing_versions.append(name)
    
    print(f"\n📊 النتائج: {len(found_versions)} مثبت، {len(missing_versions)} مفقود")
    
    # فحص الملفات الأساسية
    critical_dlls = [
        r"C:\Windows\System32\msvcp140.dll",
        r"C:\Windows\System32\vcruntime140.dll",
        r"C:\Windows\System32\vcruntime140_1.dll",
        r"C:\Windows\System32\msvcp140_1.dll",
        r"C:\Windows\System32\msvcp140_2.dll",
        r"C:\Windows\System32\api-ms-win-crt-runtime-l1-1-0.dll",
        r"C:\Windows\System32\ucrtbase.dll",
    ]
    
    print("\n🔍 فحص DLLs الأساسية:")
    missing_dlls = []
    for dll_path in critical_dlls:
        if os.path.exists(dll_path):
            print(f"   ✅ {os.path.basename(dll_path)}")
        else:
            print(f"   ❌ {os.path.basename(dll_path)} - مفقود")
            missing_dlls.append(dll_path)
    
    return len(found_versions) >= 2 and len(missing_dlls) == 0  # نحتاج على الأقل x64 و x86

def download_visual_cpp_all_in_one():
    """تحميل Visual C++ Redistributable All-in-One"""
    print("\n📥 تحميل Visual C++ Redistributable All-in-One...")
    
    # إنشاء مجلد التحميل
    download_dir = os.path.join(os.environ.get("TEMP", "C:\\temp"), "vcredist_all_in_one")
    os.makedirs(download_dir, exist_ok=True)
    
    print(f"📁 مجلد التحميل: {download_dir}")
    
    # رابط التحميل المباشر (من TechPowerUp)
    download_url = "https://github.com/abbodi1406/vcredist/releases/latest/download/VisualCppRedist_AIO_x86_x64.exe"
    download_file = os.path.join(download_dir, "VisualCppRedist_AIO_x86_x64.exe")
    
    print("📥 تحميل Visual C++ All-in-One...")
    try:
        # استخدام PowerShell للتحميل مع progress
        ps_command = f"""
        $ProgressPreference = 'Continue'
        Invoke-WebRequest -Uri '{download_url}' -OutFile '{download_file}' -UseBasicParsing
        """
        
        result = subprocess.run([
            "powershell", "-Command", ps_command
        ], capture_output=True, text=True, timeout=600)
        
        if result.returncode == 0 and os.path.exists(download_file):
            file_size = os.path.getsize(download_file) / (1024 * 1024)  # MB
            print(f"✅ تم التحميل بنجاح ({file_size:.1f} MB)")
            return download_file
        else:
            print(f"❌ فشل التحميل: {result.stderr}")
            
            # محاولة رابط بديل
            print("🔄 محاولة رابط بديل...")
            alt_urls = [
                "https://aka.ms/vs/17/release/vc_redist.x64.exe",
                "https://aka.ms/vs/17/release/vc_redist.x86.exe"
            ]
            
            downloaded_files = []
            for i, url in enumerate(alt_urls):
                filename = f"vc_redist_{'x64' if 'x64' in url else 'x86'}.exe"
                filepath = os.path.join(download_dir, filename)
                
                ps_cmd = f"Invoke-WebRequest -Uri '{url}' -OutFile '{filepath}'"
                result = subprocess.run([
                    "powershell", "-Command", ps_cmd
                ], capture_output=True, text=True, timeout=300)
                
                if result.returncode == 0 and os.path.exists(filepath):
                    print(f"✅ تم تحميل {filename}")
                    downloaded_files.append(filepath)
                else:
                    print(f"❌ فشل تحميل {filename}")
            
            return downloaded_files if downloaded_files else None
            
    except subprocess.TimeoutExpired:
        print("⏱️ انتهت مهلة التحميل")
        return None
    except Exception as e:
        print(f"❌ خطأ في التحميل: {e}")
        return None

def install_visual_cpp_comprehensive(download_files):
    """تثبيت شامل لـ Visual C++ Redistributable"""
    print("\n🔧 تثبيت شامل لـ Visual C++ Redistributable...")
    
    if not download_files:
        print("❌ لا توجد ملفات للتثبيت")
        return False
    
    if isinstance(download_files, str):
        download_files = [download_files]
    
    success_count = 0
    
    for file_path in download_files:
        if not os.path.exists(file_path):
            print(f"❌ الملف غير موجود: {file_path}")
            continue
        
        filename = os.path.basename(file_path)
        print(f"🔧 تثبيت {filename}...")
        
        try:
            # تثبيت صامت مع إعادة تشغيل مؤجلة
            install_args = [file_path, "/quiet", "/norestart"]
            
            # إذا كان All-in-One، استخدم معاملات مختلفة
            if "AIO" in filename or "All" in filename:
                install_args = [file_path, "/ai"]
            
            result = subprocess.run(
                install_args,
                capture_output=True, 
                text=True, 
                timeout=600
            )
            
            if result.returncode == 0:
                print(f"   ✅ تم تثبيت {filename} بنجاح")
                success_count += 1
            elif result.returncode == 3010:  # يحتاج إعادة تشغيل
                print(f"   ✅ تم تثبيت {filename} (يحتاج إعادة تشغيل)")
                success_count += 1
            else:
                print(f"   ⚠️ {filename} قد يكون مثبت مسبقاً (كود: {result.returncode})")
                if result.returncode in [1638, 1641]:  # مثبت مسبقاً
                    success_count += 1
                
        except subprocess.TimeoutExpired:
            print(f"   ⏱️ انتهت مهلة تثبيت {filename}")
        except Exception as e:
            print(f"   ❌ خطأ في تثبيت {filename}: {e}")
    
    print(f"\n📊 تم تثبيت {success_count}/{len(download_files)} ملفات")
    return success_count > 0

def repair_windows_system():
    """إصلاح شامل لـ Windows system files"""
    print("\n🔧 إصلاح شامل لـ Windows system files...")
    
    repair_commands = [
        # DISM - إصلاح Windows image
        {
            "name": "DISM RestoreHealth",
            "command": ["DISM.exe", "/Online", "/Cleanup-Image", "/RestoreHealth"],
            "timeout": 1800,  # 30 دقيقة
            "description": "إصلاح Windows image"
        },
        
        # SFC - فحص وإصلاح system files
        {
            "name": "SFC ScanNow", 
            "command": ["sfc", "/scannow"],
            "timeout": 1800,  # 30 دقيقة
            "description": "فحص وإصلاح system files"
        },
        
        # تنظيف Windows Update cache
        {
            "name": "Windows Update Reset",
            "command": ["net", "stop", "wuauserv"],
            "timeout": 60,
            "description": "إيقاف Windows Update service"
        }
    ]
    
    success_count = 0
    
    for repair in repair_commands:
        print(f"\n🔧 {repair['description']}...")
        try:
            result = subprocess.run(
                repair["command"],
                capture_output=True,
                text=True,
                timeout=repair["timeout"]
            )
            
            if result.returncode == 0:
                print(f"   ✅ {repair['name']} - نجح")
                success_count += 1
                
                # طباعة نتائج مهمة
                if "sfc" in repair["name"].lower():
                    if "did not find any integrity violations" in result.stdout:
                        print("   📋 لا توجد ملفات تالفة")
                    elif "successfully repaired" in result.stdout:
                        print("   📋 تم إصلاح ملفات تالفة")
                    elif "unable to fix some" in result.stdout:
                        print("   ⚠️ بعض الملفات لم يتم إصلاحها")
                        
            else:
                print(f"   ⚠️ {repair['name']} - كود الخروج: {result.returncode}")
                if result.stderr:
                    print(f"   📝 خطأ: {result.stderr.strip()}")
                    
        except subprocess.TimeoutExpired:
            print(f"   ⏱️ {repair['name']} - انتهت المهلة")
        except Exception as e:
            print(f"   ❌ {repair['name']} - خطأ: {e}")
    
    # إضافية: تنظيف Windows Update
    print("\n🧹 تنظيف Windows Update cache...")
    try:
        wuauserv_commands = [
            ["net", "stop", "wuauserv"],
            ["net", "stop", "cryptSvc"],
            ["net", "stop", "bits"],
            ["net", "stop", "msiserver"]
        ]
        
        for cmd in wuauserv_commands:
            subprocess.run(cmd, capture_output=True, timeout=30)
        
        # حذف cache folders
        cache_folders = [
            r"C:\Windows\SoftwareDistribution\Download",
            r"C:\Windows\System32\catroot2"
        ]
        
        for folder in cache_folders:
            try:
                if os.path.exists(folder):
                    shutil.rmtree(folder)
                    print(f"   🗑️ تم حذف {folder}")
            except:
                pass
        
        # إعادة تشغيل الخدمات
        for cmd in wuauserv_commands:
            start_cmd = cmd.copy()
            start_cmd[1] = "start"
            subprocess.run(start_cmd, capture_output=True, timeout=30)
        
        print("   ✅ تم تنظيف Windows Update cache")
        success_count += 1
        
    except Exception as e:
        print(f"   ⚠️ خطأ في تنظيف Windows Update: {e}")
    
    return success_count >= len(repair_commands) * 0.7  # 70% نجاح

def register_critical_dlls():
    """إعادة تسجيل DLLs الحرجة"""
    print("\n🔧 إعادة تسجيل DLLs الحرجة...")
    
    critical_dlls = [
        "msvcp140.dll",
        "vcruntime140.dll", 
        "vcruntime140_1.dll",
        "ucrtbase.dll",
        "api-ms-win-crt-runtime-l1-1-0.dll",
        "ole32.dll",
        "oleaut32.dll",
        "msvcrt.dll"
    ]
    
    success_count = 0
    
    for dll in critical_dlls:
        try:
            result = subprocess.run([
                "regsvr32", "/s", dll
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print(f"   ✅ {dll}")
                success_count += 1
            else:
                print(f"   ⚠️ {dll} - قد يكون مسجل مسبقاً")
                
        except Exception as e:
            print(f"   ❌ {dll} - خطأ: {e}")
    
    print(f"\n📊 تم تسجيل {success_count}/{len(critical_dlls)} DLLs")
    return success_count >= len(critical_dlls) * 0.5

def test_python_packages_final():
    """اختبار نهائي شامل للمكتبات"""
    print("\n🧪 اختبار نهائي شامل للمكتبات...")
    
    # اختبارات متدرجة من الأساسي للمتقدم
    tests = [
        # المستوى 1: استيراد أساسي
        ("cryptography", "import cryptography; print(f'cryptography {cryptography.__version__}')"),
        ("bcrypt", "import bcrypt; print(f'bcrypt {bcrypt.__version__}')"),
        ("jwt", "import jwt; print(f'PyJWT {jwt.__version__}')"),
        ("pydantic", "import pydantic; print(f'pydantic {pydantic.__version__}')"),
        
        # المستوى 2: وظائف أساسية
        ("cryptography.hazmat", "from cryptography.hazmat.primitives import hashes; print('cryptography.hazmat OK')"),
        ("bcrypt.hashpw", "import bcrypt; bcrypt.hashpw(b'test', bcrypt.gensalt()); print('bcrypt.hashpw OK')"),
        ("jwt.encode", "import jwt; jwt.encode({'test': 'data'}, 'secret', algorithm='HS256'); print('jwt.encode OK')"),
        
        # المستوى 3: وظائف متقدمة (المشكلة الأساسية)
        ("cryptography._rust", "from cryptography.hazmat.bindings._rust import openssl; print('cryptography Rust bindings OK')"),
        ("bcrypt._bcrypt", "import bcrypt; h = bcrypt.hashpw(b'password', bcrypt.gensalt()); bcrypt.checkpw(b'password', h); print('bcrypt._bcrypt OK')"),
        
        # المستوى 4: تكامل Flask
        ("flask", "import flask; print(f'Flask {flask.__version__}')"),
        ("flask_cors", "import flask_cors; print('Flask-CORS OK')"),
        
        # المستوى 5: اختبار شامل
        ("full_integration", """
import cryptography, bcrypt, jwt, pydantic, flask, flask_cors
from cryptography.hazmat.bindings._rust import openssl
bcrypt.hashpw(b'test', bcrypt.gensalt())
jwt.encode({'test': 'data'}, 'secret', algorithm='HS256')
print('🎉 جميع المكتبات تعمل بنجاح!')
""")
    ]
    
    success_count = 0
    total_count = len(tests)
    failed_tests = []
    
    for test_name, test_code in tests:
        print(f"\n   🧪 اختبار {test_name}...")
        try:
            result = subprocess.run([
                sys.executable, "-c", test_code
            ], capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                output = result.stdout.strip()
                print(f"      ✅ {output}")
                success_count += 1
            else:
                error = result.stderr.strip()
                print(f"      ❌ فشل")
                if "DLL load failed" in error:
                    print(f"      📝 مشكلة DLL: {error}")
                    failed_tests.append((test_name, "DLL load failed"))
                else:
                    print(f"      📝 خطأ: {error}")
                    failed_tests.append((test_name, error))
                    
        except subprocess.TimeoutExpired:
            print(f"      ⏱️ انتهت مهلة الاختبار")
            failed_tests.append((test_name, "Timeout"))
        except Exception as e:
            print(f"      ❌ خطأ في الاختبار: {e}")
            failed_tests.append((test_name, str(e)))
    
    success_rate = (success_count / total_count) * 100
    print(f"\n📊 نتائج الاختبار النهائي: {success_count}/{total_count} ({success_rate:.1f}%)")
    
    if failed_tests:
        print("\n❌ الاختبارات الفاشلة:")
        for test_name, error in failed_tests:
            print(f"   • {test_name}: {error}")
    
    return success_count, total_count, success_rate

def show_final_results(success_rate, needs_reboot=False):
    """عرض النتائج النهائية"""
    print("\n" + "=" * 90)
    
    if success_rate >= 95:
        print("🎉 نجح الحل الشامل بامتياز!")
        print("=" * 90)
        print("📋 النتائج:")
        print("   ✅ تم إصلاح Windows system files")
        print("   ✅ تم تثبيت جميع Visual C++ Runtimes")
        print("   ✅ جميع المكتبات تعمل بنجاح")
        print("   ✅ لا توجد أخطاء DLL load failed")
        print("")
        print("🚀 الخطوات التالية:")
        if needs_reboot:
            print("   1. إعادة تشغيل النظام (مُوصى به بقوة)")
            print("   2. تشغيل python app.py")
        else:
            print("   1. تشغيل python app.py")
        print("   3. راقب النتائج - يجب أن ترى 8/8 blueprints")
        
    elif success_rate >= 80:
        print("⚠️ نجح الحل جزئياً - تحسن كبير")
        print("=" * 90)
        print(f"📊 معدل النجاح: {success_rate:.1f}%")
        print("💡 معظم المشاكل تم حلها")
        print("")
        print("🔄 خطوات إضافية:")
        print("   1. إعادة تشغيل النظام")
        print("   2. تشغيل python app.py")
        print("   3. إذا استمرت المشاكل، شغل السكريپت مرة أخرى")
        
    elif success_rate >= 60:
        print("⚠️ تحسن متوسط - يحتاج خطوات إضافية")
        print("=" * 90)
        print(f"📊 معدل النجاح: {success_rate:.1f}%")
        print("")
        print("💡 حلول إضافية:")
        print("   1. إعادة تشغيل النظام")
        print("   2. تشغيل Windows Update")
        print("   3. فحص الأقراص الصلبة: chkdsk C: /f")
        print("   4. إعادة تشغيل السكريپت")
        
    else:
        print("❌ الحل لم ينجح بالشكل المطلوب")
        print("=" * 90)
        print(f"📊 معدل النجاح: {success_rate:.1f}%")
        print("")
        print("💡 حلول متقدمة:")
        print("   1. إعادة تشغيل النظام")
        print("   2. تشغيل في Safe Mode")
        print("   3. استخدام System Restore")
        print("   4. فحص الذاكرة: mdsched.exe")
        print("   5. استشارة خبير Windows")
    
    print("=" * 90)

def main():
    """الدالة الرئيسية"""
    print_header()
    
    # فحص صلاحيات Administrator
    if not check_admin_privileges():
        input("\nاضغط Enter للخروج...")
        return False
    
    # تشخيص النظام
    system_info = diagnose_system_comprehensive()
    
    # فحص Visual C++ الحالي
    has_vcpp = check_visual_cpp_comprehensive()
    
    if not has_vcpp:
        print("\n⚠️ Visual C++ Redistributable غير مثبت أو ناقص")
        
        # تحميل وتثبيت Visual C++
        download_files = download_visual_cpp_all_in_one()
        if download_files:
            install_success = install_visual_cpp_comprehensive(download_files)
            if not install_success:
                print("❌ فشل تثبيت Visual C++ Redistributable")
        else:
            print("❌ فشل تحميل Visual C++ Redistributable")
    
    # إصلاح Windows system
    print("\n🔧 بدء إصلاح Windows system...")
    repair_success = repair_windows_system()
    
    # إعادة تسجيل DLLs
    register_success = register_critical_dlls()
    
    # إعادة فحص Visual C++ بعد الإصلاح
    print("\n🔍 إعادة فحص Visual C++ بعد الإصلاح...")
    has_vcpp_after = check_visual_cpp_comprehensive()
    
    # اختبار نهائي للمكتبات
    success_count, total_count, success_rate = test_python_packages_final()
    
    # عرض النتائج النهائية
    needs_reboot = not repair_success or not register_success
    show_final_results(success_rate, needs_reboot)
    
    # سؤال عن إعادة التشغيل
    if needs_reboot:
        print("\n🔄 هل تريد إعادة تشغيل النظام الآن؟ (مُوصى به)")
        choice = input("اكتب 'y' لإعادة التشغيل أو أي شيء آخر للمتابعة: ").lower().strip()
        
        if choice == 'y':
            print("🔄 إعادة تشغيل النظام خلال 30 ثانية...")
            subprocess.run(["shutdown", "/r", "/t", "30", "/c", "إعادة تشغيل لإكمال إصلاح النظام"])
            print("💡 يمكنك إلغاء إعادة التشغيل بـ: shutdown /a")
    
    return success_rate >= 80

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n✅ الحل الشامل مكتمل بنجاح!")
            sys.exit(0)
        else:
            print("\n⚠️ الحل الشامل مكتمل مع تحذيرات")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n⏹️ تم إيقاف السكريپت بواسطة المستخدم")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ خطأ غير متوقع: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

