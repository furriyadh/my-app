-- =============================================
-- جدول analytics_properties لحفظ Properties لكل عميل
-- =============================================

-- 1. إنشاء جدول analytics_properties
CREATE TABLE IF NOT EXISTS analytics_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,                          -- معرف المستخدم من OAuth
    user_email TEXT NOT NULL,                       -- بريد المستخدم
    property_id TEXT NOT NULL,                      -- معرف Property في GA4 (مثل: properties/123456)
    property_name TEXT,                             -- اسم Property
    account_id TEXT,                                -- معرف الحساب (مثل: accounts/123)
    account_name TEXT,                              -- اسم الحساب
    website_url TEXT,                               -- رابط الموقع
    timezone TEXT,                                  -- المنطقة الزمنية
    currency TEXT,                                  -- العملة
    is_active BOOLEAN DEFAULT true,                 -- هل هذا Property هو النشط؟
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: مستخدم واحد + Property واحد
    UNIQUE(user_id, property_id)
);

-- 2. إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_analytics_properties_user_id ON analytics_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_properties_user_email ON analytics_properties(user_email);
CREATE INDEX IF NOT EXISTS idx_analytics_properties_property_id ON analytics_properties(property_id);

-- 3. تفعيل RLS (Row Level Security)
ALTER TABLE analytics_properties ENABLE ROW LEVEL SECURITY;

-- 4. إنشاء policy للوصول
-- السماح للـ service role بكل العمليات
DROP POLICY IF EXISTS "Service role has full access" ON analytics_properties;
CREATE POLICY "Service role has full access" ON analytics_properties
    FOR ALL USING (true) WITH CHECK (true);

-- 5. دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_analytics_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. إنشاء trigger لتحديث updated_at
DROP TRIGGER IF EXISTS trigger_update_analytics_properties_updated_at ON analytics_properties;
CREATE TRIGGER trigger_update_analytics_properties_updated_at
    BEFORE UPDATE ON analytics_properties
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_properties_updated_at();

-- =============================================
-- أوامر مفيدة للاختبار
-- =============================================
-- عرض جميع Properties
-- SELECT * FROM analytics_properties;

-- عرض Properties لمستخدم محدد
-- SELECT * FROM analytics_properties WHERE user_email = 'maxon272000@gmail.com';

-- حذف جميع البيانات (للاختبار)
-- DELETE FROM analytics_properties;
