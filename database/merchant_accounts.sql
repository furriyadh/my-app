-- =============================================
-- جدول merchant_accounts لحفظ حسابات Merchant Center لكل عميل
-- =============================================

-- 1. إنشاء جدول merchant_accounts
CREATE TABLE IF NOT EXISTS merchant_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,                          -- معرف المستخدم من OAuth
    user_email TEXT NOT NULL,                       -- بريد المستخدم
    merchant_id TEXT NOT NULL,                      -- معرف حساب Merchant Center
    account_name TEXT,                              -- اسم الحساب
    website_url TEXT,                               -- رابط الموقع
    adult_content BOOLEAN DEFAULT false,            -- محتوى للبالغين
    is_active BOOLEAN DEFAULT true,                 -- هل هذا الحساب هو النشط؟
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: مستخدم واحد + حساب واحد
    UNIQUE(user_id, merchant_id)
);

-- 2. إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_merchant_accounts_user_id ON merchant_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_accounts_user_email ON merchant_accounts(user_email);
CREATE INDEX IF NOT EXISTS idx_merchant_accounts_merchant_id ON merchant_accounts(merchant_id);

-- 3. تفعيل RLS (Row Level Security)
ALTER TABLE merchant_accounts ENABLE ROW LEVEL SECURITY;

-- 4. إنشاء policy للوصول
-- السماح للـ service role بكل العمليات
CREATE POLICY "Service role has full access on merchant" ON merchant_accounts
    FOR ALL USING (true) WITH CHECK (true);

-- 5. دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_merchant_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. إنشاء trigger لتحديث updated_at
DROP TRIGGER IF EXISTS trigger_update_merchant_accounts_updated_at ON merchant_accounts;
CREATE TRIGGER trigger_update_merchant_accounts_updated_at
    BEFORE UPDATE ON merchant_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_merchant_accounts_updated_at();
