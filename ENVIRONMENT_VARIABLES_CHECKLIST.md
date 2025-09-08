# 🔍 قائمة فحص متغيرات البيئة - Vercel و Railway

## 📋 **متغيرات البيئة المطلوبة**

### **🔧 Backend (Railway) - متغيرات البيئة المطلوبة:**

#### **1️⃣ إعدادات Flask الأساسية:**
- `FLASK_SECRET_KEY` - مفتاح سري لـ Flask
- `FLASK_ENV` - بيئة Flask (development/production)
- `NODE_ENV` - بيئة التطبيق (development/production)

#### **2️⃣ Google Ads API:**
- `GOOGLE_ADS_DEVELOPER_TOKEN` - رمز المطور
- `GOOGLE_ADS_CLIENT_ID` - معرف العميل
- `GOOGLE_ADS_CLIENT_SECRET` - سر العميل
- `GOOGLE_ADS_REFRESH_TOKEN` - رمز التحديث
- `MCC_LOGIN_CUSTOMER_ID` - معرف حساب MCC

#### **3️⃣ Google OAuth:**
- `GOOGLE_CLIENT_ID` - معرف OAuth
- `GOOGLE_CLIENT_SECRET` - سر OAuth
- `GOOGLE_REDIRECT_URI` - رابط إعادة التوجيه

#### **4️⃣ Supabase Database:**
- `SUPABASE_URL` - رابط قاعدة البيانات
- `SUPABASE_ANON_KEY` - المفتاح المجهول
- `SUPABASE_SERVICE_ROLE_KEY` - مفتاح الخدمة

#### **5️⃣ إعدادات الأمان:**
- `JWT_SECRET` - مفتاح JWT
- `ENCRYPTION_KEY` - مفتاح التشفير

#### **6️⃣ Google AI:**
- `GOOGLE_AI_API_KEY` - مفتاح Google AI
- `GOOGLE_GEMINI_API_KEY` - مفتاح Gemini

#### **7️⃣ إعدادات البريد الإلكتروني:**
- `EMAIL_SENDER_EMAIL` - بريد المرسل
- `EMAIL_SENDER_PASSWORD` - كلمة مرور البريد
- `EMAIL_SMTP_SERVER` - خادم SMTP
- `EMAIL_SMTP_PORT` - منفذ SMTP

---

### **🌐 Frontend (Vercel) - متغيرات البيئة المطلوبة:**

#### **1️⃣ إعدادات التطبيق:**
- `NEXT_PUBLIC_APP_URL` - رابط التطبيق
- `NEXT_PUBLIC_BASE_URL` - الرابط الأساسي
- `NEXT_PUBLIC_MAIN_WEBSITE` - الموقع الرئيسي

#### **2️⃣ إعدادات API:**
- `NEXT_PUBLIC_API_URL` - رابط API
- `NEXT_PUBLIC_BACKEND_URL` - رابط Backend

#### **3️⃣ Google Services:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - مفتاح خرائط Google
- `NEXT_PUBLIC_OAUTH_REDIRECT_URI` - رابط OAuth

#### **4️⃣ Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` - رابط Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - مفتاح Supabase المجهول

#### **5️⃣ NextAuth:**
- `NEXTAUTH_SECRET` - سر NextAuth
- `NEXTAUTH_URL` - رابط NextAuth

---

## ✅ **خطوات الفحص:**

### **🔍 1. فحص Railway (Backend):**
```bash
# تسجيل الدخول إلى Railway
railway login

# فحص متغيرات البيئة
railway variables

# أو عبر Dashboard
# https://railway.app/dashboard
```

### **🔍 2. فحص Vercel (Frontend):**
```bash
# تسجيل الدخول إلى Vercel
vercel login

# فحص متغيرات البيئة
vercel env ls

# أو عبر Dashboard
# https://vercel.com/dashboard
```

### **🔍 3. اختبار الاتصال:**
```bash
# اختبار Backend
curl https://my-app-production-28d2.up.railway.app/health

# اختبار Frontend
curl https://furriyadh.com
```

---

## 🚨 **متغيرات البيئة الحرجة (يجب أن تكون موجودة):**

### **Backend (Railway):**
- ✅ `GOOGLE_ADS_DEVELOPER_TOKEN`
- ✅ `GOOGLE_ADS_CLIENT_ID`
- ✅ `GOOGLE_ADS_CLIENT_SECRET`
- ✅ `GOOGLE_ADS_REFRESH_TOKEN`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `JWT_SECRET`

### **Frontend (Vercel):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_BACKEND_URL`
- ✅ `NEXTAUTH_SECRET`

---

## 📝 **ملاحظات مهمة:**

1. **لا تشارك متغيرات البيئة** في الكود أو Git
2. **استخدم قيم مختلفة** للإنتاج والتطوير
3. **تأكد من صحة الروابط** في متغيرات البيئة
4. **اختبر الاتصال** بعد إضافة المتغيرات
5. **احتفظ بنسخة احتياطية** من متغيرات البيئة

---

## 🔧 **أوامر مفيدة:**

```bash
# إضافة متغير بيئة في Railway
railway variables set KEY=value

# إضافة متغير بيئة في Vercel
vercel env add KEY

# فحص حالة النشر
railway status
vercel ls
```
