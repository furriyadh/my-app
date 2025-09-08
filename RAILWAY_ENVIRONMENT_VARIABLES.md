# 🔧 متغيرات البيئة المطلوبة في Railway

## 📋 **قائمة متغيرات البيئة التي يجب إضافتها في Railway Dashboard:**

### **🔑 Google Ads API:**
```
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_CLIENT_ID=your_client_id_here
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token_here
MCC_LOGIN_CUSTOMER_ID=your_mcc_customer_id_here
```

### **🗄️ Supabase Database:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **🔐 Google OAuth:**
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://furriyadh.com/api/oauth/google/callback
GOOGLE_OAUTH_SCOPES=https://www.googleapis.com/auth/adwords,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile
```

### **🛡️ Security:**
```
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
FLASK_SECRET_KEY=your_flask_secret_key_here
```

### **🤖 Google AI:**
```
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_GEMINI_MODEL=gemini-1.5-flash
```

### **📧 Email Settings:**
```
EMAIL_SENDER_EMAIL=your_email@gmail.com
EMAIL_SENDER_PASSWORD=your_app_password_here
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=587
```

### **⚙️ Environment Settings:**
```
NODE_ENV=production
FLASK_ENV=production
PORT=5000
RAILWAY_ENVIRONMENT=production
```

## 🚀 **خطوات إضافة المتغيرات في Railway:**

### **1. اذهب إلى Railway Dashboard:**
- https://railway.app/dashboard
- اختر المشروع: `my-app-production`

### **2. اذهب إلى Variables Tab:**
- اضغط على **Variables** في القائمة الجانبية
- اضغط على **+ New Variable**

### **3. أضف كل متغير:**
- **Name**: اسم المتغير (مثل `GOOGLE_ADS_DEVELOPER_TOKEN`)
- **Value**: قيمة المتغير
- **Environment**: Production

### **4. كرر العملية لكل متغير**

### **5. أعد تشغيل الخدمة:**
- اذهب إلى **Settings**
- اضغط على **Restart Service**

## 🔍 **فحص المتغيرات:**

بعد إضافة جميع المتغيرات، اختبر:

```bash
# اختبار Health Check
curl https://my-app-production-28d2.up.railway.app/health

# يجب أن يعطي:
# {"status":"healthy","timestamp":"...","environment":"production"}
```

## ⚠️ **ملاحظات مهمة:**

1. **لا تشارك قيم المتغيرات** مع أي شخص
2. **تأكد من صحة القيم** قبل الإضافة
3. **استخدم قيم الإنتاج** وليس قيم التطوير
4. **أعد تشغيل الخدمة** بعد إضافة المتغيرات
5. **راقب Logs** للتأكد من عدم وجود أخطاء

## 🆘 **إذا لم تعمل:**

1. تحقق من صحة قيم المتغيرات
2. تأكد من إعادة تشغيل الخدمة
3. راجع Logs في Railway Dashboard
4. جرب حذف وإعادة إنشاء المشروع
