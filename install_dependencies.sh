#!/bin/bash

# ==================== AI Platform Dependencies Installer ====================
# سكريبت تثبيت جميع المكتبات المطلوبة لمنصة الذكاء الاصطناعي
# تاريخ الإنشاء: 2025-07-07
# ==================== ==================== ====================

echo "🚀 بدء تثبيت مكتبات منصة الذكاء الاصطناعي..."
echo "=================================================="

# تحديث pip
echo "📦 تحديث pip..."
python3 -m pip install --upgrade pip

# تثبيت wheel و setuptools
echo "🔧 تثبيت أدوات البناء الأساسية..."
pip3 install wheel setuptools

# تثبيت المكتبات الأساسية أولاً
echo "⚡ تثبيت المكتبات الأساسية..."
pip3 install fastapi uvicorn pydantic python-multipart

# تثبيت مكتبات الذكاء الاصطناعي
echo "🧠 تثبيت مكتبات الذكاء الاصطناعي..."
pip3 install google-generativeai google-ai-generativelanguage
pip3 install openai anthropic langchain

# تثبيت مكتبات الويب سكرابينغ
echo "🕷️ تثبيت مكتبات الويب سكرابينغ..."
pip3 install scrapegraphai playwright beautifulsoup4 lxml html5lib
pip3 install selenium scrapy requests-html

# تثبيت مكتبات معالجة اللغة الطبيعية
echo "📝 تثبيت مكتبات معالجة اللغة الطبيعية..."
pip3 install nltk spacy textblob langdetect

# تثبيت Google Ads API
echo "📊 تثبيت Google Ads API..."
pip3 install google-ads google-auth google-auth-oauthlib
pip3 install google-auth-httplib2 google-api-python-client

# تثبيت مكتبات قواعد البيانات
echo "🗄️ تثبيت مكتبات قواعد البيانات..."
pip3 install sqlalchemy alembic psycopg2-binary pymysql
pip3 install redis pymongo

# تثبيت مكتبات HTTP و API
echo "🌐 تثبيت مكتبات HTTP و API..."
pip3 install httpx aiohttp requests urllib3

# تثبيت مكتبات معالجة البيانات
echo "📈 تثبيت مكتبات معالجة البيانات..."
pip3 install pandas numpy openpyxl xlsxwriter python-docx

# تثبيت مكتبات التعامل مع الملفات
echo "📁 تثبيت مكتبات التعامل مع الملفات..."
pip3 install python-dotenv pyyaml toml configparser

# تثبيت مكتبات البرمجة غير المتزامنة
echo "⚡ تثبيت مكتبات البرمجة غير المتزامنة..."
pip3 install aiofiles celery

# تثبيت مكتبات التحقق والتسلسل
echo "✅ تثبيت مكتبات التحقق والتسلسل..."
pip3 install marshmallow cerberus jsonschema

# تثبيت مكتبات التخزين المؤقت
echo "💾 تثبيت مكتبات التخزين المؤقت..."
pip3 install cachetools diskcache python-memcached

# تثبيت مكتبات تحديد معدل الطلبات
echo "⏱️ تثبيت مكتبات تحديد معدل الطلبات..."
pip3 install slowapi limits

# تثبيت مكتبات السجلات والمراقبة
echo "📋 تثبيت مكتبات السجلات والمراقبة..."
pip3 install loguru structlog colorama

# تثبيت مكتبات الأمان
echo "🔒 تثبيت مكتبات الأمان..."
pip3 install cryptography passlib bcrypt python-jose

# تثبيت مكتبات التاريخ والوقت
echo "🕐 تثبيت مكتبات التاريخ والوقت..."
pip3 install python-dateutil pytz arrow

# تثبيت مكتبات معالجة الصور
echo "🖼️ تثبيت مكتبات معالجة الصور..."
pip3 install pillow opencv-python

# تثبيت مكتبات معالجة PDF
echo "📄 تثبيت مكتبات معالجة PDF..."
pip3 install pypdf2 reportlab weasyprint

# تثبيت مكتبات البريد الإلكتروني
echo "📧 تثبيت مكتبات البريد الإلكتروني..."
pip3 install sendgrid emails

# تثبيت مكتبات الاختبار
echo "🧪 تثبيت مكتبات الاختبار..."
pip3 install pytest pytest-asyncio pytest-cov

# تثبيت أدوات التطوير
echo "🛠️ تثبيت أدوات التطوير..."
pip3 install black flake8 mypy pre-commit

# تثبيت مكتبات البيئة والإعدادات
echo "⚙️ تثبيت مكتبات البيئة والإعدادات..."
pip3 install python-decouple environs

# تثبيت مكتبات الأدوات المساعدة
echo "🔧 تثبيت مكتبات الأدوات المساعدة..."
pip3 install click rich tqdm schedule

# تثبيت مكتبات توثيق API
echo "📚 تثبيت مكتبات توثيق API..."
pip3 install swagger-ui-bundle

# تحميل نماذج spaCy
echo "🔤 تحميل نماذج spaCy..."
python3 -m spacy download en_core_web_sm
python3 -m spacy download ar_core_news_sm

# تحميل بيانات NLTK
echo "📖 تحميل بيانات NLTK..."
python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('vader_lexicon')"

# تثبيت متصفحات Playwright
echo "🌐 تثبيت متصفحات Playwright..."
playwright install

echo ""
echo "🎉 تم تثبيت جميع المكتبات بنجاح!"
echo "=================================================="
echo "📋 ملخص التثبيت:"
echo "   ✅ مكتبات الذكاء الاصطناعي"
echo "   ✅ مكتبات الويب سكرابينغ"
echo "   ✅ مكتبات Google Ads API"
echo "   ✅ مكتبات قواعد البيانات"
echo "   ✅ مكتبات معالجة البيانات"
echo "   ✅ مكتبات الأمان والتشفير"
echo "   ✅ أدوات التطوير والاختبار"
echo ""
echo "🚀 المنصة جاهزة للاستخدام!"

