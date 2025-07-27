@echo off
REM Google Ads AI Platform - Backend Startup Script
REM تشغيل Backend بسهولة

echo ========================================
echo 🚀 Google Ads AI Platform - Backend
echo ========================================

REM التحقق من وجود مجلد backend
if not exist "backend" (
    echo ❌ مجلد backend غير موجود
    echo 📁 تأكد من تشغيل الملف من جذر المشروع
    pause
    exit /b 1
)

REM الانتقال لمجلد backend
cd backend

REM التحقق من وجود البيئة الافتراضية
if not exist "ai_env\Scripts\activate.bat" (
    echo ❌ البيئة الافتراضية ai_env غير موجودة
    echo 🔧 قم بإنشائها أولاً: python -m venv ai_env
    pause
    exit /b 1
)

REM تفعيل البيئة الافتراضية
echo 🔧 تفعيل البيئة الافتراضية...
call ai_env\Scripts\activate.bat

REM التحقق من وجود ملف app.py
if not exist "app.py" (
    echo ❌ ملف app.py غير موجود
    echo 📄 تأكد من نسخ app_blueprints_fixed.py إلى app.py
    pause
    exit /b 1
)

REM عرض معلومات البيئة
echo ✅ البيئة الافتراضية مُفعلة
echo 📍 المجلد الحالي: %CD%
echo 🐍 إصدار Python:
python --version

REM تشغيل التطبيق
echo.
echo 🌟 بدء تشغيل Backend...
echo 🌐 سيكون متاح على: http://localhost:5000
echo.
echo ⚠️ لإيقاف الخادم: اضغط Ctrl+C
echo ========================================
echo.

python app.py

REM في حالة الخروج
echo.
echo 🛑 تم إيقاف الخادم
pause

