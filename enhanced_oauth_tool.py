#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🚀 أداة OAuth محسّنة لمشروع Google Ads AI Platform
================================================

هذه الأداة محسّنة خصيصاً لمشروعك وتستفيد من جميع الإعدادات الموجودة في ملف .env

المميزات:
✅ تستخدم إعدادات OAuth الموجودة
✅ تستخدم Redirect URI المُعد مسبقاً  
✅ تستخدم Scopes الشاملة المُعدة
✅ تحفظ Refresh Token تلقائياً
✅ تختبر النظام بعد الإكمال

الاستخدام:
    python enhanced_oauth_tool.py
"""

import os
import sys
import json
import webbrowser
import threading
import time
from urllib.parse import urlparse, parse_qs, urlencode
from http.server import HTTPServer, BaseHTTPRequestHandler
import requests
from dotenv import load_dotenv, set_key

class OAuthCallbackHandler(BaseHTTPRequestHandler):
    """معالج callback لـ OAuth"""
    
    def do_GET(self):
        """معالجة GET request من Google OAuth"""
        try:
            # تحليل URL
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            if 'code' in query_params:
                # حفظ authorization code
                self.server.auth_code = query_params['code'][0]
                
                # إرسال صفحة نجاح
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                
                success_page = """
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>نجح الاتصال!</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f8ff; }
                        .success { color: #28a745; font-size: 24px; margin: 20px 0; }
                        .code { background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace; }
                        .next { color: #007bff; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <h1 class="success">🎉 تم الاتصال بنجاح!</h1>
                    <p>تم الحصول على Authorization Code:</p>
                    <div class="code">""" + self.server.auth_code[:50] + """...</div>
                    <p class="next">يمكنك إغلاق هذه النافذة والعودة للأداة</p>
                    <script>
                        setTimeout(function() {
                            window.close();
                        }, 3000);
                    </script>
                </body>
                </html>
                """
                
                self.wfile.write(success_page.encode('utf-8'))
                
            elif 'error' in query_params:
                # معالجة الخطأ
                error = query_params['error'][0]
                self.server.auth_error = error
                
                self.send_response(400)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                
                error_page = f"""
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>خطأ في الاتصال</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #ffe6e6; }}
                        .error {{ color: #dc3545; font-size: 24px; margin: 20px 0; }}
                    </style>
                </head>
                <body>
                    <h1 class="error">❌ خطأ في الاتصال</h1>
                    <p>حدث خطأ: {error}</p>
                    <p>يرجى المحاولة مرة أخرى</p>
                </body>
                </html>
                """
                
                self.wfile.write(error_page.encode('utf-8'))
                
        except Exception as e:
            print(f"خطأ في معالجة callback: {e}")
    
    def log_message(self, format, *args):
        """تعطيل رسائل السجل"""
        pass

class EnhancedOAuthTool:
    """أداة OAuth محسّنة"""
    
    def __init__(self):
        self.load_config()
        self.server = None
        self.auth_code = None
        
    def load_config(self):
        """تحميل الإعدادات من ملف .env"""
        print("🔍 تحميل إعدادات المشروع...")
        
        # تحميل ملف .env
        load_dotenv()
        
        # تحميل الإعدادات
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/api/oauth/callback')
        self.scopes = os.getenv('GOOGLE_OAUTH_SCOPES', 'https://www.googleapis.com/auth/adwords')
        
        # التحقق من الإعدادات
        if not self.client_id or not self.client_secret:
            print("❌ خطأ: لم يتم العثور على Client ID أو Client Secret")
            print("تأكد من وجود GOOGLE_ADS_CLIENT_ID و GOOGLE_ADS_CLIENT_SECRET في ملف .env")
            sys.exit(1)
        
        print("✅ تم تحميل إعدادات المشروع بنجاح")
        print(f"  Client ID: {self.client_id[:20]}...")
        print(f"  Redirect URI: {self.redirect_uri}")
        print(f"  Scopes: {self.scopes}")
        print()
    
    def start_local_server(self):
        """بدء خادم محلي لاستقبال callback"""
        try:
            # استخراج port من redirect URI
            parsed_uri = urlparse(self.redirect_uri)
            port = parsed_uri.port or 3000
            
            print(f"🌐 بدء خادم محلي على المنفذ {port}...")
            
            # إنشاء الخادم
            self.server = HTTPServer(('localhost', port), OAuthCallbackHandler)
            self.server.auth_code = None
            self.server.auth_error = None
            
            # تشغيل الخادم في thread منفصل
            server_thread = threading.Thread(target=self.server.serve_forever)
            server_thread.daemon = True
            server_thread.start()
            
            print(f"✅ الخادم يعمل على {self.redirect_uri}")
            return True
            
        except Exception as e:
            print(f"❌ خطأ في بدء الخادم: {e}")
            return False
    
    def generate_auth_url(self):
        """إنشاء رابط المصادقة"""
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': self.scopes,
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent',
            'include_granted_scopes': 'true'
        }
        
        auth_url = f"https://accounts.google.com/o/oauth2/auth?{urlencode(params)}"
        return auth_url
    
    def wait_for_callback(self, timeout=300):
        """انتظار callback من Google"""
        print("⏳ انتظار المصادقة من Google...")
        print("📋 تعليمات:")
        print("1. سجل دخول بحساب Google")
        print("2. اقبل الصلاحيات المطلوبة")
        print("3. ستتم إعادة التوجيه تلقائياً")
        print()
        
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if self.server.auth_code:
                print("✅ تم الحصول على Authorization Code!")
                return self.server.auth_code
            
            if self.server.auth_error:
                print(f"❌ خطأ في المصادقة: {self.server.auth_error}")
                return None
            
            time.sleep(1)
        
        print("⏰ انتهت مهلة الانتظار")
        return None
    
    def exchange_code_for_tokens(self, auth_code):
        """تحويل Authorization Code إلى Refresh Token"""
        print("🔄 تحويل الكود إلى Refresh Token...")
        
        token_url = "https://oauth2.googleapis.com/token"
        
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': auth_code,
            'grant_type': 'authorization_code',
            'redirect_uri': self.redirect_uri
        }
        
        try:
            response = requests.post(token_url, data=data)
            
            if response.status_code == 200:
                tokens = response.json()
                
                if 'refresh_token' in tokens:
                    refresh_token = tokens['refresh_token']
                    access_token = tokens['access_token']
                    
                    print("✅ تم الحصول على Refresh Token بنجاح!")
                    print(f"  Refresh Token: {refresh_token[:30]}...")
                    print(f"  Access Token: {access_token[:30]}...")
                    
                    return refresh_token, access_token
                else:
                    print("❌ لم يتم العثور على Refresh Token")
                    print("قد يكون السبب أن المستخدم وافق مسبقاً على التطبيق")
                    print("جرب إلغاء الموافقة من: https://myaccount.google.com/permissions")
                    return None, None
            else:
                print(f"❌ خطأ في الحصول على Token: {response.status_code}")
                print(f"الاستجابة: {response.text}")
                return None, None
                
        except Exception as e:
            print(f"❌ خطأ في الاتصال: {e}")
            return None, None
    
    def save_refresh_token(self, refresh_token):
        """حفظ Refresh Token في ملف .env"""
        print("💾 حفظ Refresh Token في ملف .env...")
        
        try:
            # حفظ في ملف .env
            set_key('.env', 'GOOGLE_ADS_REFRESH_TOKEN', refresh_token)
            
            print("✅ تم حفظ Refresh Token بنجاح!")
            print(f"تم تحديث GOOGLE_ADS_REFRESH_TOKEN في ملف .env")
            
            return True
            
        except Exception as e:
            print(f"❌ خطأ في حفظ الملف: {e}")
            print("يمكنك إضافة السطر التالي يدوياً:")
            print(f"GOOGLE_ADS_REFRESH_TOKEN={refresh_token}")
            return False
    
    def test_refresh_token(self):
        """اختبار Refresh Token الجديد"""
        print("🧪 اختبار Refresh Token...")
        
        try:
            # إعادة تحميل متغيرات البيئة
            load_dotenv()
            
            refresh_token = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')
            if not refresh_token:
                print("❌ لم يتم العثور على Refresh Token في ملف .env")
                return False
            
            # اختبار سريع للـ token
            token_url = "https://oauth2.googleapis.com/token"
            
            data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            }
            
            response = requests.post(token_url, data=data)
            
            if response.status_code == 200:
                print("✅ Refresh Token يعمل بشكل صحيح!")
                return True
            else:
                print(f"❌ خطأ في اختبار Refresh Token: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ خطأ في الاختبار: {e}")
            return False
    
    def run_system_test(self):
        """تشغيل اختبار شامل للنظام"""
        print("\n🧪 تشغيل اختبار شامل للنظام...")
        print("-" * 40)
        
        try:
            # تشغيل fixed_test.py إذا كان موجوداً
            if os.path.exists('fixed_test.py'):
                os.system('python fixed_test.py')
            else:
                print("⚠️ ملف fixed_test.py غير موجود")
                print("يمكنك تشغيل الاختبار يدوياً لاحقاً")
                
        except Exception as e:
            print(f"❌ خطأ في تشغيل الاختبار: {e}")
    
    def cleanup(self):
        """تنظيف الموارد"""
        if self.server:
            self.server.shutdown()
            print("🧹 تم إغلاق الخادم المحلي")
    
    def run(self):
        """تشغيل الأداة"""
        print("🚀 أداة OAuth محسّنة لمشروع Google Ads AI Platform")
        print("=" * 60)
        print("هذه الأداة ستحصل على Refresh Token تلقائياً باستخدام إعدادات مشروعك")
        print()
        
        try:
            # بدء الخادم المحلي
            if not self.start_local_server():
                return False
            
            # إنشاء رابط المصادقة
            auth_url = self.generate_auth_url()
            
            print("🌐 فتح متصفح للمصادقة...")
            print(f"الرابط: {auth_url}")
            print()
            
            # فتح المتصفح
            try:
                webbrowser.open(auth_url)
                print("✅ تم فتح المتصفح")
            except:
                print("⚠️ لم يتمكن من فتح المتصفح تلقائياً")
                print("انسخ الرابط أعلاه والصقه في المتصفح")
            
            # انتظار callback
            auth_code = self.wait_for_callback()
            
            if not auth_code:
                print("❌ فشل في الحصول على Authorization Code")
                return False
            
            # تحويل إلى Refresh Token
            refresh_token, access_token = self.exchange_code_for_tokens(auth_code)
            
            if not refresh_token:
                print("❌ فشل في الحصول على Refresh Token")
                return False
            
            # حفظ Refresh Token
            if not self.save_refresh_token(refresh_token):
                print("⚠️ فشل في حفظ Refresh Token تلقائياً")
                return False
            
            # اختبار Refresh Token
            if not self.test_refresh_token():
                print("⚠️ Refresh Token قد لا يعمل بشكل صحيح")
            
            print("\n🎉 تم إكمال الإعداد بنجاح!")
            print("=" * 40)
            print("✅ Refresh Token تم إنشاؤه وحفظه")
            print("✅ النظام جاهز للاستخدام")
            print()
            
            # سؤال عن تشغيل الاختبار
            test_choice = input("🧪 هل تريد تشغيل اختبار شامل للنظام؟ (y/n): ").lower()
            if test_choice in ['y', 'yes', 'نعم']:
                self.run_system_test()
            
            print("\n🚀 مبروك! مشروع Google Ads AI Platform جاهز 100%!")
            
            return True
            
        except KeyboardInterrupt:
            print("\n⏹️ تم إيقاف الأداة بواسطة المستخدم")
            return False
        except Exception as e:
            print(f"\n💥 خطأ غير متوقع: {e}")
            return False
        finally:
            self.cleanup()

def main():
    """الدالة الرئيسية"""
    tool = EnhancedOAuthTool()
    success = tool.run()
    
    if success:
        print("\n🎯 النتيجة: نجح الإعداد بالكامل!")
    else:
        print("\n❌ النتيجة: فشل في الإعداد")
        print("يمكنك المحاولة مرة أخرى أو استخدام Google OAuth Playground يدوياً")
    
    input("\n⏸️ اضغط Enter للخروج...")

if __name__ == "__main__":
    main()

