-- =============================================
-- جدول gtm_containers لحفظ Containers لكل عميل
-- =============================================

-- 1. إنشاء جدول gtm_containers
CREATE TABLE IF NOT EXISTS gtm_containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,                          -- معرف المستخدم من OAuth
    user_email TEXT NOT NULL,                       -- بريد المستخدم
    account_id TEXT NOT NULL,                       -- معرف الحساب في GTM
    account_name TEXT,                              -- اسم الحساب
    container_id TEXT NOT NULL,                     -- معرف Container (مثل: GTM-XXXXX)
    container_name TEXT,                            -- اسم Container
    container_public_id TEXT,                       -- Public ID (GTM-XXXXX)
    usage_context TEXT[],                           -- سياق الاستخدام (web, android, ios)
    is_active BOOLEAN DEFAULT true,                 -- هل هذا Container هو النشط؟
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: مستخدم واحد + Container واحد
    UNIQUE(user_id, container_id)
);

-- 2. إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_gtm_containers_user_id ON gtm_containers(user_id);
CREATE INDEX IF NOT EXISTS idx_gtm_containers_user_email ON gtm_containers(user_email);
CREATE INDEX IF NOT EXISTS idx_gtm_containers_container_id ON gtm_containers(container_id);

-- 3. تفعيل RLS (Row Level Security)
ALTER TABLE gtm_containers ENABLE ROW LEVEL SECURITY;

-- 4. إنشاء policy للوصول
-- السماح للـ service role بكل العمليات
DROP POLICY IF EXISTS "Service role has full access on gtm" ON gtm_containers;
CREATE POLICY "Service role has full access on gtm" ON gtm_containers
    FOR ALL USING (true) WITH CHECK (true);

-- 5. دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_gtm_containers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. إنشاء trigger لتحديث updated_at
DROP TRIGGER IF EXISTS trigger_update_gtm_containers_updated_at ON gtm_containers;
CREATE TRIGGER trigger_update_gtm_containers_updated_at
    BEFORE UPDATE ON gtm_containers
    FOR EACH ROW
    EXECUTE FUNCTION update_gtm_containers_updated_at();
