-- =============================================
-- الجداول الكاملة لـ Supabase
-- =============================================

-- 1. جدول user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture TEXT,
    verified_email BOOLEAN DEFAULT false,
    locale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إضافة الأعمدة المفقودة لجدول client_requests
ALTER TABLE client_requests 
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_picture TEXT;

-- 3. إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_client_requests_user_id ON client_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_user_email ON client_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 4. إضافة RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;

-- 5. إنشاء policies للأمان
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can view own client requests" ON client_requests
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own client requests" ON client_requests
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own client requests" ON client_requests
    FOR UPDATE USING (auth.uid()::text = user_id);

-- 6. تحديث البيانات الموجودة (اختياري)
-- إذا كان لديك بيانات موجودة وترغب في ربطها بالمستخدم الحالي
-- UPDATE client_requests 
-- SET user_id = '117641495753253130939', 
--     user_email = 'maxon272000@gmail.com',
--     user_name = 'Hossam Hassan',
--     user_picture = 'https://lh3.googleusercontent.com/a/ACg8ocKGWozkkWBrgNvnEXCSecNSS0DBKoirKLsDwtukKerrD1ZczAc=s96-c'
-- WHERE user_id IS NULL;
