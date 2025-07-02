@echo off
REM =============================================================================
REM Script لرفع المشروع لـ GitHub بأمان (Windows)
REM =============================================================================

echo 🚀 بدء عملية رفع المشروع بأمان...

REM التحقق من وجود Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git غير مثبت. يرجى تثبيت Git أولاً.
    pause
    exit /b 1
)

REM التحقق من وجود مجلد .git
if not exist ".git" (
    echo ❌ هذا المجلد ليس مستودع Git. يرجى تشغيل الأمر من داخل مجلد المشروع.
    pause
    exit /b 1
)

echo 📋 الخطوة 1: تنظيف Git cache من الملفات الحساسة...

REM إزالة الملفات الحساسة من Git cache
git rm --cached src\utils\googleAdsAPI.ts 2>nul || echo ملف googleAdsAPI.ts غير موجود في cache
git rm --cached .env 2>nul || echo ملف .env غير موجود في cache
git rm --cached .env.local 2>nul || echo ملف .env.local غير موجود في cache
git rm --cached .env.production 2>nul || echo ملف .env.production غير موجود في cache
git rm --cached .env.development 2>nul || echo ملف .env.development غير موجود في cache

echo 📝 الخطوة 2: تحديث .gitignore...

REM إنشاء .gitignore محدث
(
echo # Dependencies
echo node_modules
echo .pnp
echo .pnp.js
echo.
echo # Testing
echo coverage
echo.
echo # Next.js
echo .next/
echo out/
echo.
echo # Production
echo build
echo dist
echo.
echo # Environment variables
echo .env
echo .env.local
echo .env.development
echo .env.production
echo .env.test
echo.
echo # Backend Environment Variables
echo backend/.env
echo backend/.env.local
echo backend/.env.production
echo backend/.env.development
echo.
echo # Secrets and sensitive files
echo *.secret
echo *.key
echo *.pem
echo config/secrets.json
echo.
echo # Debug
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo.
echo # IDE files
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo.
echo # OS generated files
echo .DS_Store
echo Thumbs.db
echo.
echo # Python Environment
echo backend/__pycache__/
echo backend/*.pyc
echo backend/env/
echo backend/venv/
) > .gitignore

echo 🔒 الخطوة 3: نسخ الملف الآمن...

REM التحقق من وجود الملف الآمن ونسخه
if exist "googleAdsAPI_secure.ts" (
    copy "googleAdsAPI_secure.ts" "src\utils\googleAdsAPI.ts" >nul
    echo ✅ تم نسخ الملف الآمن
) else (
    echo ⚠️  ملف googleAdsAPI_secure.ts غير موجود. يرجى التأكد من وجوده.
)

echo 📦 الخطوة 4: إضافة الملفات للـ staging...
git add .

echo 💾 الخطوة 5: إنشاء commit...
git commit -m "🔒 Security: Remove hardcoded secrets and update configuration"

echo 🌐 الخطوة 6: رفع المشروع لـ GitHub...

REM التحقق من وجود remote origin
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ⚠️  لم يتم العثور على remote origin. يرجى إضافة remote أولاً:
    echo git remote add origin https://github.com/furriyadh/my-app.git
    pause
    exit /b 1
)

REM رفع التغييرات
git push origin main
if errorlevel 1 (
    echo ❌ فشل في رفع المشروع. يرجى التحقق من الاتصال والصلاحيات.
    pause
    exit /b 1
)

echo.
echo 🎉 تم رفع المشروع بنجاح!
echo 🔗 رابط المشروع: https://github.com/furriyadh/my-app
echo.
echo ✅ تمت العملية بنجاح!
echo 🔒 جميع الـ secrets محمية
echo.
echo 📋 ملاحظات مهمة:
echo 1. تأكد من إضافة متغيرات البيئة في production
echo 2. لا تشارك ملفات .env مع أي شخص
echo 3. استخدم GitHub Secrets لـ CI/CD
echo.
pause

