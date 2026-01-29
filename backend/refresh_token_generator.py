"""
🔐 MCC Refresh Token Generator Script
-----------------------------------
هذا السكريبت يساعدك في تجديد الـ Refresh Token الخاص بـ MCC

الخطوات:
1. شغّل هذا السكريبت
2. سيفتح نافذة متصفح لتسجيل الدخول بحساب MCC
3. بعد الموافقة، سيُطبع الـ Refresh Token الجديد
4. انسخ الـ Token وحدّثه في Railway
"""

import os
import sys

# تحميل المتغيرات من البيئة أو الـ .env
try:
    from dotenv import load_dotenv
    from pathlib import Path
    env_path = Path(__file__).parent.parent / '.env.development'
    if env_path.exists():
        load_dotenv(env_path, encoding='utf-8-sig')
except:
    pass

# OAuth Configuration
CLIENT_ID = os.getenv('GOOGLE_ADS_CLIENT_ID') or os.getenv('NEXT_PUBLIC_GOOGLE_CLIENT_ID')
CLIENT_SECRET = os.getenv('GOOGLE_ADS_CLIENT_SECRET') or os.getenv('GOOGLE_CLIENT_SECRET')

# Required scopes for Google Ads API
SCOPES = [
    'https://www.googleapis.com/auth/adwords'
]

def generate_refresh_token():
    """Generate a new refresh token using OAuth 2.0 flow"""
    
    print("=" * 60)
    print("🔐 MCC Refresh Token Generator")
    print("=" * 60)
    print()
    
    if not CLIENT_ID or not CLIENT_SECRET:
        print("❌ خطأ: لم يتم العثور على CLIENT_ID أو CLIENT_SECRET")
        print()
        print("يرجى التأكد من وجود المتغيرات التالية في .env.development:")
        print("  - GOOGLE_ADS_CLIENT_ID")
        print("  - GOOGLE_ADS_CLIENT_SECRET")
        print()
        print("أو يمكنك استخدام OAuth Playground:")
        print("  1. اذهب إلى: https://developers.google.com/oauthplayground/")
        print("  2. أدخل scope: https://www.googleapis.com/auth/adwords")
        print("  3. اضغط Authorize APIs")
        print("  4. بعد تسجيل الدخول، اضغط Exchange authorization code for tokens")
        print("  5. انسخ Refresh Token وحدّثه في Railway")
        return
    
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
        
        # Create the flow
        flow = InstalledAppFlow.from_client_config(
            {
                "installed": {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES
        )
        
        print("📋 Opening browser for authentication...")
        print("   (سيتم فتح المتصفح لتسجيل الدخول)")
        print()
        
        # Run the OAuth flow
        credentials = flow.run_local_server(port=8080)
        
        print()
        print("=" * 60)
        print("✅ تم الحصول على Refresh Token بنجاح!")
        print("=" * 60)
        print()
        print("🔑 Refresh Token:")
        print("-" * 60)
        print(credentials.refresh_token)
        print("-" * 60)
        print()
        print("📝 الخطوات التالية:")
        print("1. انسخ الـ Refresh Token أعلاه")
        print("2. اذهب إلى Railway Dashboard")
        print("3. حدّث متغير البيئة GOOGLE_ADS_REFRESH_TOKEN")
        print("4. أعد نشر التطبيق")
        print()
        
        return credentials.refresh_token
        
    except ImportError:
        print("⚠️ مكتبة google-auth-oauthlib غير مثبتة")
        print()
        print("يمكنك تثبيتها بـ:")
        print("  pip install google-auth-oauthlib")
        print()
        print("أو استخدم OAuth Playground يدوياً:")
        print("  https://developers.google.com/oauthplayground/")
        
    except Exception as e:
        print(f"❌ خطأ: {e}")
        print()
        print("يمكنك استخدام OAuth Playground يدوياً:")
        print("  https://developers.google.com/oauthplayground/")

def manual_instructions():
    """Print manual instructions for using OAuth Playground"""
    print()
    print("=" * 60)
    print("📖 تعليمات تجديد Refresh Token يدوياً")
    print("=" * 60)
    print()
    print("1. اذهب إلى: https://developers.google.com/oauthplayground/")
    print()
    print("2. في الإعدادات (⚙️ أعلى يمين):")
    print("   ✓ Use your own OAuth credentials")
    print(f"   - OAuth Client ID: {CLIENT_ID or '[غير موجود]'}")
    print(f"   - OAuth Client secret: {CLIENT_SECRET or '[غير موجود]'}")
    print()
    print("3. في الخطوة 1 (Step 1):")
    print("   - أدخل scope: https://www.googleapis.com/auth/adwords")
    print("   - اضغط Authorize APIs")
    print()
    print("4. سجّل دخولك بحساب MCC الخاص بـ Furriyadh")
    print()
    print("5. في الخطوة 2 (Step 2):")
    print("   - اضغط Exchange authorization code for tokens")
    print("   - انسخ Refresh Token")
    print()
    print("6. حدّث متغير البيئة في Railway:")
    print("   - GOOGLE_ADS_REFRESH_TOKEN = [الـ Token الجديد]")
    print()
    print("7. أعد نشر التطبيق على Railway")
    print()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == '--manual':
        manual_instructions()
    else:
        generate_refresh_token()
