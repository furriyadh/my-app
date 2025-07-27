#!/usr/bin/env python3
"""
اختبار التكامل الكامل بين Backend والFrontend
Google Ads AI Platform Integration Test
"""

import os
import sys
import json
import time
import requests
import threading
import subprocess
from pathlib import Path

# إعدادات الاختبار
BACKEND_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:3000"
TEST_TIMEOUT = 30  # ثانية

class IntegrationTester:
    """فئة اختبار التكامل"""
    
    def __init__(self):
        self.backend_running = False
        self.frontend_running = False
        self.test_results = {
            'backend_tests': {},
            'frontend_tests': {},
            'integration_tests': {},
            'overall_status': 'pending'
        }
    
    def print_header(self, title):
        """طباعة عنوان مع تنسيق"""
        print(f"\n{'='*60}")
        print(f"🧪 {title}")
        print(f"{'='*60}")
    
    def print_result(self, test_name, success, details=""):
        """طباعة نتيجة اختبار"""
        status = "✅" if success else "❌"
        print(f"{status} {test_name}")
        if details:
            print(f"   📋 {details}")
    
    def test_backend_health(self):
        """اختبار صحة Backend"""
        self.print_header("اختبار Backend")
        
        tests = [
            ("/", "الصفحة الرئيسية"),
            ("/api/status", "حالة API"),
            ("/api/system/info", "معلومات النظام"),
            ("/api/environment", "معلومات البيئة"),
            ("/api/blueprints/status", "حالة Blueprints"),
            ("/api/test-google-ads", "اختبار Google Ads")
        ]
        
        backend_healthy = True
        
        for endpoint, description in tests:
            try:
                response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=5)
                success = response.status_code == 200
                
                if success:
                    data = response.json()
                    details = f"Status: {response.status_code}"
                    if 'message' in data:
                        details += f" | Message: {data['message'][:50]}..."
                else:
                    details = f"Status: {response.status_code}"
                    backend_healthy = False
                
                self.print_result(f"{description} ({endpoint})", success, details)
                self.test_results['backend_tests'][endpoint] = {
                    'success': success,
                    'status_code': response.status_code,
                    'description': description
                }
                
            except requests.exceptions.RequestException as e:
                self.print_result(f"{description} ({endpoint})", False, f"خطأ: {str(e)}")
                self.test_results['backend_tests'][endpoint] = {
                    'success': False,
                    'error': str(e),
                    'description': description
                }
                backend_healthy = False
        
        self.backend_running = backend_healthy
        return backend_healthy
    
    def test_frontend_health(self):
        """اختبار صحة Frontend"""
        self.print_header("اختبار Frontend")
        
        try:
            response = requests.get(FRONTEND_URL, timeout=10)
            success = response.status_code == 200
            
            if success:
                # التحقق من وجود محتوى HTML
                html_content = response.text
                has_react = "react" in html_content.lower() or "_next" in html_content
                has_title = "<title>" in html_content
                
                details = f"Status: {response.status_code} | React: {has_react} | Title: {has_title}"
                self.print_result("Frontend Server", success, details)
                
                self.test_results['frontend_tests']['main_page'] = {
                    'success': success,
                    'status_code': response.status_code,
                    'has_react': has_react,
                    'has_title': has_title
                }
                
                self.frontend_running = success
                return success
                
            else:
                self.print_result("Frontend Server", False, f"Status: {response.status_code}")
                self.test_results['frontend_tests']['main_page'] = {
                    'success': False,
                    'status_code': response.status_code
                }
                return False
                
        except requests.exceptions.RequestException as e:
            self.print_result("Frontend Server", False, f"خطأ: {str(e)}")
            self.test_results['frontend_tests']['main_page'] = {
                'success': False,
                'error': str(e)
            }
            return False
    
    def test_cors_integration(self):
        """اختبار CORS بين Frontend والBackend"""
        self.print_header("اختبار CORS Integration")
        
        try:
            # محاكاة طلب من Frontend إلى Backend
            headers = {
                'Origin': FRONTEND_URL,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            
            # اختبار OPTIONS request (preflight)
            response = requests.options(f"{BACKEND_URL}/api/status", headers=headers, timeout=5)
            cors_success = response.status_code in [200, 204]
            
            if cors_success:
                cors_headers = response.headers
                allow_origin = cors_headers.get('Access-Control-Allow-Origin', '')
                allow_methods = cors_headers.get('Access-Control-Allow-Methods', '')
                
                details = f"Origin: {allow_origin} | Methods: {allow_methods[:30]}..."
                self.print_result("CORS Preflight", cors_success, details)
            else:
                self.print_result("CORS Preflight", cors_success, f"Status: {response.status_code}")
            
            # اختبار GET request مع Origin header
            response = requests.get(f"{BACKEND_URL}/api/status", headers={'Origin': FRONTEND_URL}, timeout=5)
            get_success = response.status_code == 200
            
            if get_success:
                data = response.json()
                details = f"Status: {data.get('status', 'unknown')}"
                self.print_result("CORS GET Request", get_success, details)
            else:
                self.print_result("CORS GET Request", get_success, f"Status: {response.status_code}")
            
            self.test_results['integration_tests']['cors'] = {
                'preflight_success': cors_success,
                'get_success': get_success,
                'overall_success': cors_success and get_success
            }
            
            return cors_success and get_success
            
        except requests.exceptions.RequestException as e:
            self.print_result("CORS Integration", False, f"خطأ: {str(e)}")
            self.test_results['integration_tests']['cors'] = {
                'success': False,
                'error': str(e)
            }
            return False
    
    def test_api_endpoints_from_frontend(self):
        """اختبار API endpoints كما لو كانت من Frontend"""
        self.print_header("اختبار API من Frontend")
        
        api_tests = [
            ("/api/status", "حالة API"),
            ("/api/system/info", "معلومات النظام"),
            ("/api/environment", "معلومات البيئة")
        ]
        
        all_success = True
        
        for endpoint, description in api_tests:
            try:
                headers = {
                    'Origin': FRONTEND_URL,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
                
                response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers, timeout=5)
                success = response.status_code == 200
                
                if success:
                    data = response.json()
                    details = f"Status: {response.status_code} | Data Keys: {len(data.keys())}"
                else:
                    details = f"Status: {response.status_code}"
                    all_success = False
                
                self.print_result(f"{description}", success, details)
                
            except requests.exceptions.RequestException as e:
                self.print_result(f"{description}", False, f"خطأ: {str(e)}")
                all_success = False
        
        self.test_results['integration_tests']['api_from_frontend'] = {
            'success': all_success
        }
        
        return all_success
    
    def generate_report(self):
        """إنشاء تقرير شامل"""
        self.print_header("تقرير الاختبار الشامل")
        
        # حساب الإحصائيات
        backend_success = sum(1 for test in self.test_results['backend_tests'].values() if test.get('success', False))
        backend_total = len(self.test_results['backend_tests'])
        
        frontend_success = sum(1 for test in self.test_results['frontend_tests'].values() if test.get('success', False))
        frontend_total = len(self.test_results['frontend_tests'])
        
        integration_success = sum(1 for test in self.test_results['integration_tests'].values() if test.get('success', False) or test.get('overall_success', False))
        integration_total = len(self.test_results['integration_tests'])
        
        # طباعة الإحصائيات
        print(f"📊 Backend Tests: {backend_success}/{backend_total} ({'✅' if backend_success == backend_total else '❌'})")
        print(f"📊 Frontend Tests: {frontend_success}/{frontend_total} ({'✅' if frontend_success == frontend_total else '❌'})")
        print(f"📊 Integration Tests: {integration_success}/{integration_total} ({'✅' if integration_success == integration_total else '❌'})")
        
        # تحديد الحالة العامة
        overall_success = (
            backend_success == backend_total and
            frontend_success == frontend_total and
            integration_success == integration_total
        )
        
        self.test_results['overall_status'] = 'success' if overall_success else 'failed'
        
        print(f"\n🎯 الحالة العامة: {'✅ نجح' if overall_success else '❌ فشل'}")
        
        # حفظ التقرير
        report_file = "integration_test_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, ensure_ascii=False, indent=2)
        
        print(f"📄 تم حفظ التقرير في: {report_file}")
        
        return overall_success
    
    def run_all_tests(self):
        """تشغيل جميع الاختبارات"""
        print("🚀 بدء اختبار التكامل الشامل...")
        print(f"🔗 Backend URL: {BACKEND_URL}")
        print(f"🔗 Frontend URL: {FRONTEND_URL}")
        
        # اختبار Backend
        backend_ok = self.test_backend_health()
        
        # اختبار Frontend
        frontend_ok = self.test_frontend_health()
        
        # اختبارات التكامل (فقط إذا كان Backend يعمل)
        if backend_ok:
            self.test_cors_integration()
            self.test_api_endpoints_from_frontend()
        else:
            print("⚠️ تم تخطي اختبارات التكامل لأن Backend لا يعمل")
        
        # إنشاء التقرير
        return self.generate_report()

def main():
    """الدالة الرئيسية"""
    print("🧪 Google Ads AI Platform - Integration Test")
    print("=" * 60)
    
    # إنشاء مختبر التكامل
    tester = IntegrationTester()
    
    # تشغيل الاختبارات
    success = tester.run_all_tests()
    
    # النتيجة النهائية
    if success:
        print("\n🎉 جميع الاختبارات نجحت! التكامل يعمل بشكل مثالي.")
        return 0
    else:
        print("\n⚠️ بعض الاختبارات فشلت. راجع التقرير للتفاصيل.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

