-- تحديث جدول client_requests لإضافة حقول المستخدم
ALTER TABLE client_requests 
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_picture TEXT;

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_client_requests_user_id ON client_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_user_email ON client_requests(user_email);

-- إنشاء جدول user_profiles لحفظ بيانات المستخدمين الكاملة
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY, -- Google user ID
  email TEXT NOT NULL,
  name TEXT,
  picture TEXT,
  verified_email BOOLEAN DEFAULT false,
  locale TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_name ON user_profiles(name);

-- تفعيل Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (true); -- مؤقتاً للجميع

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (true); -- مؤقتاً للجميع

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (true); -- مؤقتاً للجميع

-- سياسات الأمان لجدول client_requests
DROP POLICY IF EXISTS "Users can view own requests" ON client_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON client_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON client_requests;

CREATE POLICY "Users can view own requests" ON client_requests
  FOR SELECT USING (true); -- مؤقتاً للجميع

CREATE POLICY "Users can update own requests" ON client_requests
  FOR UPDATE USING (true); -- مؤقتاً للجميع

CREATE POLICY "Users can insert own requests" ON client_requests
  FOR INSERT WITH CHECK (true); -- مؤقتاً للجميع

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers لتحديث updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_requests_updated_at ON client_requests;
CREATE TRIGGER update_client_requests_updated_at 
  BEFORE UPDATE ON client_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

