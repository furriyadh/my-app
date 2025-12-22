# 🔧 دليل إصلاح مشكلة Railway Backend

## 🚨 **المشكلة الحالية:**
- **خطأ**: 502 - Application failed to respond
- **الموقع**: https://my-app-production-28d2.up.railway.app
- **الحالة**: Backend لا يستجيب

## 🔍 **الأسباب المحتملة:**

### **1️⃣ مشاكل في متغيرات البيئة:**
- متغيرات البيئة مفقودة في Railway
- قيم خاطئة في متغيرات البيئة
- مشاكل في تشفير المتغيرات

### **2️⃣ مشاكل في الكود:**
- أخطاء في Python imports
- مشاكل في dependencies
- أخطاء في تشغيل التطبيق

### **3️⃣ مشاكل في Railway:**
- مشاكل في البناء (build)
- مشاكل في تشغيل الخادم
- مشاكل في المنفذ (PORT)

## 🛠️ **خطوات الإصلاح:**

### **الخطوة 1: فحص Railway Dashboard**
1. اذهب إلى: https://railway.app/dashboard
2. اختر المشروع: `my-app-production`
3. اذهب إلى **Variables** tab
4. تأكد من وجود جميع المتغيرات المطلوبة

### **الخطوة 2: متغيرات البيئة المطلوبة في Railway**
```bash
# متغيرات Google Ads API
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
MCC_LOGIN_CUSTOMER_ID=your_mcc_id

# متغيرات Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# متغيرات OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://furriyadh.com/api/oauth/google/callback

# متغيرات الأمان
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# متغيرات Google AI
GOOGLE_AI_API_KEY=your_google_ai_key
GOOGLE_GEMINI_API_KEY=your_gemini_key

# متغيرات البريد الإلكتروني
EMAIL_SENDER_EMAIL=your_email
EMAIL_SENDER_PASSWORD=your_email_password
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=587

# متغيرات Flask
FLASK_SECRET_KEY=your_flask_secret
FLASK_ENV=production
NODE_ENV=production
PORT=5000
```

### **الخطوة 3: فحص Logs في Railway**
1. اذهب إلى **Deployments** tab
2. اختر آخر deployment
3. اذهب إلى **Logs** tab
4. ابحث عن أخطاء في:
   - Build logs
   - Runtime logs
   - Error logs

### **الخطوة 4: إعادة تشغيل الخدمة**
1. اذهب إلى **Settings** tab
2. اضغط على **Restart Service**
3. انتظر حتى يكتمل التشغيل

### **الخطوة 5: فحص Health Check**
```bash
# اختبار Health Check
curl https://my-app-production-28d2.up.railway.app/health

# يجب أن يعطي:
# {"status":"healthy","timestamp":"2025-01-27T...","environment":"production"}
```

## 🔧 **إصلاحات محتملة:**

### **إصلاح 1: تحديث railway.json**
```json
{
  "deploy": {
    "startCommand": "python app.py",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **إصلاح 2: تحديث Procfile**
```
web: python app.py
```

### **إصلاح 3: فحص PORT في app.py**
```python
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,  # تعطيل debug في الإنتاج
        threaded=True
    )
```

## 📋 **قائمة فحص سريعة:**

- [ ] جميع متغيرات البيئة موجودة في Railway
- [ ] قيم متغيرات البيئة صحيحة
- [ ] لا توجد أخطاء في Logs
- [ ] Health Check يعمل
- [ ] PORT محدد بشكل صحيح
- [ ] Dependencies مثبتة بشكل صحيح

## 🚀 **بعد الإصلاح:**
1. اختبر Health Check
2. اختبر API endpoints
3. اختبر التكامل مع Frontend
4. راقب Logs للتأكد من عدم وجود أخطاء

## 📞 **إذا لم تعمل الحلول:**
1. حذف المشروع من Railway
2. إنشاء مشروع جديد
3. رفع الكود مرة أخرى
4. إضافة متغيرات البيئة
5. تشغيل المشروع
