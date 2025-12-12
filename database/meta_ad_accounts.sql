-- =============================================
-- جدول meta_ad_accounts لحفظ حسابات Meta Ads لكل عميل
-- =============================================

-- 1. إنشاء جدول meta_ad_accounts
CREATE TABLE IF NOT EXISTS meta_ad_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,                          -- معرف المستخدم من OAuth
    user_email TEXT NOT NULL,                       -- بريد المستخدم
    ad_account_id TEXT NOT NULL,                    -- معرف حساب الإعلانات (act_XXXXX)
    account_name TEXT,                              -- اسم الحساب
    business_id TEXT,                               -- معرف Business Manager (إن وجد)
    business_name TEXT,                             -- اسم Business Manager
    currency TEXT,                                  -- العملة
    timezone_name TEXT,                             -- المنطقة الزمنية
    account_status INTEGER,                         -- حالة الحساب
    is_active BOOLEAN DEFAULT true,                 -- هل هذا الحساب هو النشط؟
    access_token TEXT,                              -- Access Token للحساب
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: مستخدم واحد + حساب واحد
    UNIQUE(user_id, ad_account_id)
);

-- 2. إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_meta_ad_accounts_user_id ON meta_ad_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_ad_accounts_user_email ON meta_ad_accounts(user_email);
CREATE INDEX IF NOT EXISTS idx_meta_ad_accounts_ad_account_id ON meta_ad_accounts(ad_account_id);

-- 3. تفعيل RLS (Row Level Security)
ALTER TABLE meta_ad_accounts ENABLE ROW LEVEL SECURITY;

-- 4. إنشاء policy للوصول
-- السماح للـ service role بكل العمليات
CREATE POLICY "Service role has full access on meta" ON meta_ad_accounts
    FOR ALL USING (true) WITH CHECK (true);

-- 5. دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_meta_ad_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. إنشاء trigger لتحديث updated_at
DROP TRIGGER IF EXISTS trigger_update_meta_ad_accounts_updated_at ON meta_ad_accounts;
CREATE TRIGGER trigger_update_meta_ad_accounts_updated_at
    BEFORE UPDATE ON meta_ad_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_meta_ad_accounts_updated_at();
