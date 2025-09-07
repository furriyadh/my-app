# Google Ads AI Platform - منصة الذكاء الاصطناعي لإعلانات جوجل

## 📋 نظرة عامة

منصة متقدمة لإدارة حملات Google Ads باستخدام الذكاء الاصطناعي. توفر المنصة واجهة برمجة تطبيقات (API) شاملة لإدارة الحملات الإعلانية، تحليل الأداء، وإدارة الكلمات المفتاحية.

## 🚀 الميزات الرئيسية

### ✅ الميزات الأساسية
- **إدارة الحملات الإعلانية** - إنشاء وتعديل وإيقاف الحملات
- **تحليل الأداء والإحصائيات** - تقارير مفصلة عن أداء الحملات
- **إدارة الكلمات المفتاحية** - إضافة وحذف وتعديل الكلمات المفتاحية
- **تحسين الميزانيات** - تحسين توزيع الميزانيات تلقائياً
- **تكامل Google Ads API** - تكامل كامل مع Google Ads API
- **إدارة MCC متقدمة** - إدارة حسابات العملاء المتعددة
- **ذكاء اصطناعي للتحليل** - تحليل ذكي للبيانات والتوصيات

### 🔧 الميزات المتقدمة (النسخة المتقدمة)
- **نظام المراقبة والتحليلات** - تتبع الطلبات والإحصائيات
- **نظام الكاش البسيط** - تحسين الأداء عبر التخزين المؤقت
- **إدارة الملفات** - رفع وإدارة الملفات
- **فحص صحة الخدمات** - مراقبة حالة جميع الخدمات
- **مقاييس الأداء** - تتبع أداء النظام

## 📁 هيكل المشروع

```
backend/
├── 📁 routes/                 # مسارات API
│   ├── accounts.py           # إدارة الحسابات
│   ├── campaigns.py          # إدارة الحملات
│   ├── auth_jwt.py           # المصادقة (محذوف)
│   ├── account_linking.py    # ربط الحسابات
│   ├── oauth2_routes.py      # OAuth2 للمصادقة
│   └── google_ads/           # مسارات Google Ads
├── 📁 services/              # الخدمات
│   ├── google_ads_client.py  # عميل Google Ads
│   └── google_oauth2_manager.py # مدير OAuth2
├── 📁 models/                # نماذج البيانات
├── 📁 utils/                 # أدوات مساعدة
├── 📁 ai/                    # الذكاء الاصطناعي
├── 📁 auth/                  # المصادقة
├── 📁 uploads/               # الملفات المرفوعة
├── run.py                    # التطبيق المبسط
├── simple_app.py             # التطبيق المبسط
├── advanced_app.py           # التطبيق المتقدم
├── ssl_patch.py              # إصلاح SSL
├── env_settings.py           # إعدادات البيئة
└── redis_config.py           # إعدادات Redis
```

## 🛠️ المتطلبات

### Python Packages
```bash
flask==3.1.1
flask-cors==4.0.0
google-ads==22.1.0
requests==2.31.0
python-dotenv==1.0.0
PyYAML==6.0.1
aiohttp==3.9.1
passlib==1.7.4
PyJWT==2.8.0
beautifulsoup4==4.12.2
matplotlib==3.8.2
pandas==2.1.4
numpy==1.25.2
seaborn==0.13.0
rich==13.7.0
cryptography==41.0.8
certifi==2023.11.17
urllib3==2.1.0
```

### متغيرات البيئة
```env
# Google Ads API
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_LOGIN_CUSTOMER_ID=9252466178
MCC_LOGIN_CUSTOMER_ID=9252466178

# Flask Settings
FLASK_SECRET_KEY=dev-secret-key-change-in-production
FLASK_DEBUG=True
FLASK_HOST=0.0.0.0
FLASK_PORT=5000

# SSL Settings
PYTHONHTTPSVERIFY=0
```

## 🚀 التشغيل

### 1. التطبيق المبسط
```bash
python run.py
```

### 2. التطبيق المتقدم
```bash
python advanced_app.py
```

### 3. الاختبار
```bash
# اختبار التطبيق المبسط
python simple_test.py

# اختبار التطبيق المتقدم
python advanced_test.py
```

## 📡 النقاط النهائية (API Endpoints)

### النقاط الأساسية
- `GET /` - الصفحة الرئيسية
- `GET /api/status` - حالة التطبيق
- `GET /api/test` - اختبار التطبيق

### النقاط المتقدمة (النسخة المتقدمة)
- `GET /api/analytics` - التحليلات والإحصائيات
- `GET /api/cache` - إحصائيات الكاش
- `GET /api/cache?action=clear` - مسح الكاش
- `GET /api/files` - قائمة الملفات
- `POST /api/files` - رفع ملف
- `DELETE /api/files?filename=file.txt` - حذف ملف
- `GET /api/health` - فحص صحة الخدمات
- `GET /api/performance` - مقاييس الأداء
- `GET /api/system/info` - معلومات النظام

### مسارات Google Ads
- `GET /api/accounts` - قائمة الحسابات
- `GET /api/campaigns` - قائمة الحملات
- `POST /api/campaigns` - إنشاء حملة جديدة
- `GET /api/keywords` - قائمة الكلمات المفتاحية
- `POST /api/keywords` - إضافة كلمات مفتاحية

## 🔧 الإعداد والتكوين

### 1. إعداد Google Cloud Console
1. إنشاء مشروع في Google Cloud Console
2. تفعيل Google Ads API
3. إنشاء OAuth 2.0 credentials
4. إضافة URIs المصرح بها

### 2. إعداد Google Ads
1. الحصول على Developer Token
2. إعداد Client ID و Client Secret
3. الحصول على Refresh Token
4. تحديد Customer ID

### 3. إعداد البيئة المحلية
```bash
# تثبيت المتطلبات
pip install -r requirements.txt

# إعداد متغيرات البيئة
cp .env.example .env
# تعديل .env بالمعلومات الصحيحة

# تشغيل التطبيق
python run.py
```

## 📊 الميزات المتقدمة

### نظام التحليلات
- تتبع عدد الطلبات
- إحصائيات استخدام النقاط النهائية
- معدل النجاح
- وقت التشغيل

### نظام الكاش
- تخزين مؤقت للبيانات
- TTL قابل للتخصيص
- إدارة حجم الكاش
- إحصائيات مفصلة

### إدارة الملفات
- رفع الملفات
- إنشاء أسماء فريدة
- قائمة الملفات
- حذف الملفات

### فحص صحة الخدمات
- فحص Google Ads API
- فحص قاعدة البيانات
- فحص SSL
- تقرير شامل عن الصحة

## 🔒 الأمان

### SSL/TLS
- إصلاح مشاكل SSL
- دعم HTTPS
- شهادات SSL صالحة

### CORS
- دعم Cross-Origin Requests
- إعدادات CORS مرنة
- دعم Credentials

### المصادقة
- OAuth 2.0 للمصادقة
- إدارة Tokens
- تجديد Tokens تلقائياً

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

#### 1. خطأ SSL
```bash
# تطبيق SSL patch
python ssl_patch.py
```

#### 2. خطأ في استيراد Google Ads
```bash
# تثبيت Google Ads library
pip install google-ads
```

#### 3. خطأ في متغيرات البيئة
```bash
# إنشاء ملف .env
cp .env.example .env
# تعديل المتغيرات
```

#### 4. خطأ في مسارات Python
```python
# إضافة المسارات في الكود
import sys
sys.path.insert(0, '/path/to/project')
```

### سجلات الأخطاء
- فحص console output
- مراجعة Flask logs
- فحص network requests

## 📈 الأداء

### تحسينات الأداء
- نظام الكاش البسيط
- تحميل Blueprints بشكل ديناميكي
- إدارة الذاكرة المحسنة
- معالجة متوازية

### مراقبة الأداء
- مقاييس CPU و Memory
- وقت الاستجابة
- عدد الاتصالات النشطة
- استخدام الشبكة

## 🤝 المساهمة

### إرشادات التطوير
1. اتبع معايير PEP 8
2. اكتب اختبارات شاملة
3. وثق الكود بشكل جيد
4. استخدم meaningful commit messages

### إعداد بيئة التطوير
```bash
# Clone المشروع
git clone <repository-url>
cd my-site/backend

# إنشاء بيئة افتراضية
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل الاختبارات
python advanced_test.py
```

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 📞 الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل:
- إنشاء Issue في GitHub
- التواصل عبر البريد الإلكتروني
- مراجعة الوثائق

## 🔄 التحديثات

### الإصدار 3.0.0
- ✅ إضافة نظام التحليلات
- ✅ إضافة نظام الكاش
- ✅ إضافة إدارة الملفات
- ✅ إضافة فحص صحة الخدمات
- ✅ تحسين الأداء
- ✅ إصلاح مشاكل SSL
- ✅ حذف JWT و Redis (تبسيط)

### الإصدار 2.0.0
- ✅ تكامل Google Ads API
- ✅ نظام OAuth 2.0
- ✅ إدارة الحملات
- ✅ إدارة الكلمات المفتاحية

### الإصدار 1.0.0
- ✅ التطبيق الأساسي
- ✅ Flask API
- ✅ CORS support
