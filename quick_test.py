#!/usr/bin/env python3
"""
اختبار سريع لحالة Google Ads AI Platform
Quick Health Check for Google Ads AI Platform
"""

import os
import sys
import requests
import json
from pathlib import Path

def print_header(title):
    """طباعة عنوان مع تنسيق"""
    print(f"\n{'='*50}")
    print(f"🔍 {title}")
    print(f"{'='*50}")

def print_result(test_name, success, details=""):
    """طباعة نتيجة اختبار"""
    status = "✅" if success else "❌"
    print(f"{status} {test_name}")
    if details:
        print(f"   📋 {details}")

def check_environment():
    """فحص البيئة والملفات المطلوبة"""
    print_header("فحص البيئة")
    
    # فحص ملفات البيئة
    env_files = ['.env', '.env.local']
    for env_file in env_files:
        exists = os.path.exists(env_file)
        print_result(f"ملف {env_file}", exists)
    
    # فحص مجلد backend
    backend_exists = os.path.exists('backend')
    print_result("مجلد backend", backend_exists)
    
    if backend_exists:
        app_py_exists = os.path.exists('backend/app.py')
        print_result("ملف backend/app.py", app_py_exists)
        
        services_exists = os.path.exists('backend/services')
        print_result("مجلد backend/services", services_exists)
        
        if services_exists:
            yaml_exists = os.path.exists('backend/services/google_ads.yaml')
            print_result("ملف google_ads.yaml", yaml_exists)
    
    # فحص package.json
    package_json_exists = os.path.exists('package.json')
    print_result("ملف package.json", package_json_exists)

def check_backend_health():
    """فحص صحة Backend"""
    print_header("فحص Backend")
    
    backend_url = "http://localhost:5000"
    
    # اختبار الاتصال الأساسي
    try:
        response = requests.get(backend_url, timeout=5)
        backend_running = response.status_code == 200
        
        if backend_running:
            data = response.json()
            version = data.get('version', 'غير معروف')
            status = data.get('status', 'غير معروف')
            print_result("Backend Server", True, f"الإصدار: {version} | الحالة: {status}")
            
            # اختبار المسارات الأساسية
            endpoints = [
                "/api/status",
                "/api/system/info",
                "/api/blueprints/status"
            ]
            
            for endpoint in endpoints:
                try:
                    resp = requests.get(f"{backend_url}{endpoint}", timeout=3)
                    success = resp.status_code == 200
                    print_result(f"المسار {endpoint}", success, f"Status: {resp.status_code}")
                except:
                    print_result(f"المسار {endpoint}", False, "فشل الاتصال")
        else:
            print_result("Backend Server", False, f"Status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print_result("Backend Server", False, "الخادم غير متاح - تأكد من تشغيل Backend")
    except requests.exceptions.Timeout:
        print_result("Backend Server", False, "انتهت مهلة الاتصال")
    except Exception as e:
        print_result("Backend Server", False, f"خطأ: {str(e)}")

def check_frontend_health():
    """فحص صحة Frontend"""
    print_header("فحص Frontend")
    
    frontend_url = "http://localhost:3000"
    
    try:
        response = requests.get(frontend_url, timeout=5)
        frontend_running = response.status_code == 200
        
        if frontend_running:
            print_result("Frontend Server", True, f"Status: {response.status_code}")
            
            # التحقق من محتوى HTML
            html_content = response.text
            has_react = "react" in html_content.lower() or "_next" in html_content
            has_title = "<title>" in html_content
            
            print_result("React Framework", has_react)
            print_result("HTML Title", has_title)
        else:
            print_result("Frontend Server", False, f"Status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print_result("Frontend Server", False, "الخادم غير متاح - تأكد من تشغيل Frontend")
    except requests.exceptions.Timeout:
        print_result("Frontend Server", False, "انتهت مهلة الاتصال")
    except Exception as e:
        print_result("Frontend Server", False, f"خطأ: {str(e)}")

def generate_summary():
    """إنشاء ملخص سريع"""
    print_header("ملخص سريع")
    
    print("📋 للتشغيل الكامل:")
    print("   1. Backend: cd backend && ai_env\\Scripts\\activate && python app.py")
    print("   2. Frontend: npm run dev")
    print()
    print("🔗 الروابط:")
    print("   - Backend: http://localhost:5000")
    print("   - Frontend: http://localhost:3000")
    print()
    print("📄 للمزيد من التفاصيل: راجع تعليمات_التشغيل_الكاملة.md")

def main():
    """الدالة الرئيسية"""
    print("🧪 Google Ads AI Platform - Quick Health Check")
    print("=" * 60)
    
    # فحص البيئة
    check_environment()
    
    # فحص Backend
    check_backend_health()
    
    # فحص Frontend
    check_frontend_health()
    
    # ملخص
    generate_summary()
    
    print("\n🎯 انتهى الفحص السريع!")

if __name__ == "__main__":
    main()

