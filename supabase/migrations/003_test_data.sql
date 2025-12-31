-- ملف بيانات الاختبار لنظام ميزانيات الحملات
-- Test Data for Campaign Budget Tracking System
-- يعمل مع Migration 001 فقط (الأساسي)

-- ============================================
-- 1. إنشاء حساب عميل تجريبي
-- ============================================

INSERT INTO furriyadh_customer_accounts (
    id,
    user_email,
    google_ads_customer_id,
    account_name,
    locked_asset_url,
    locked_asset_type,
    current_balance,
    total_deposited,
    total_spent,
    status
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'cejihe6663@icousd.com',
    '1234567890',
    'حساب تجريبي - متجر السعادة',
    'https://example-store.com',
    'website',
    2500.00,
    5000.00,
    2500.00,
    'active'
) ON CONFLICT (user_email) DO UPDATE SET
    current_balance = EXCLUDED.current_balance,
    total_deposited = EXCLUDED.total_deposited,
    total_spent = EXCLUDED.total_spent,
    status = EXCLUDED.status,
    account_name = EXCLUDED.account_name;

-- ============================================
-- 2. إنشاء 6 حملات تجريبية
-- ============================================

-- حملة 1: Search - نشطة
INSERT INTO furriyadh_campaigns (
    id,
    customer_account_id,
    campaign_name,
    campaign_type,
    daily_budget,
    total_spent,
    status,
    google_campaign_id,
    target_url
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'حملة رمضان - العروض الخاصة',
    'SEARCH',
    150.00,
    350.00,
    'active',
    'google_camp_12345',
    'https://example-store.com/ramadan'
) ON CONFLICT (id) DO UPDATE SET
    daily_budget = EXCLUDED.daily_budget,
    total_spent = EXCLUDED.total_spent,
    status = EXCLUDED.status;

-- حملة 2: Search - نشطة (ميزانية منخفضة)
INSERT INTO furriyadh_campaigns (
    id,
    customer_account_id,
    campaign_name,
    campaign_type,
    daily_budget,
    total_spent,
    status,
    google_campaign_id,
    target_url
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'إعلانات البحث - كلمات مفتاحية',
    'SEARCH',
    75.00,
    425.00,
    'active',
    'google_camp_12346',
    'https://example-store.com/search'
) ON CONFLICT (id) DO UPDATE SET
    daily_budget = EXCLUDED.daily_budget,
    total_spent = EXCLUDED.total_spent,
    status = EXCLUDED.status;

-- حملة 3: Video - نشطة
INSERT INTO furriyadh_campaigns (
    id,
    customer_account_id,
    campaign_name,
    campaign_type,
    daily_budget,
    total_spent,
    status,
    google_campaign_id,
    target_url
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'إعلانات يوتيوب - فيديو ترويجي',
    'VIDEO',
    100.00,
    200.00,
    'active',
    'google_camp_12347',
    'https://youtube.com/example-store'
) ON CONFLICT (id) DO UPDATE SET
    daily_budget = EXCLUDED.daily_budget,
    total_spent = EXCLUDED.total_spent,
    status = EXCLUDED.status;

-- حملة 4: Display - متوقفة
INSERT INTO furriyadh_campaigns (
    id,
    customer_account_id,
    campaign_name,
    campaign_type,
    daily_budget,
    total_spent,
    status,
    google_campaign_id,
    target_url,
    paused_at
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'حملة المنتجات الموسمية',
    'DISPLAY',
    80.00,
    450.00,
    'paused',
    'google_camp_12348',
    'https://example-store.com/seasonal',
    NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO UPDATE SET
    daily_budget = EXCLUDED.daily_budget,
    total_spent = EXCLUDED.total_spent,
    status = EXCLUDED.status;

-- حملة 5: Display - نشطة
INSERT INTO furriyadh_campaigns (
    id,
    customer_account_id,
    campaign_name,
    campaign_type,
    daily_budget,
    total_spent,
    status,
    google_campaign_id,
    target_url
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'شبكة العرض - بانرات إعلانية',
    'DISPLAY',
    200.00,
    600.00,
    'active',
    'google_camp_12349',
    'https://example-store.com/banners'
) ON CONFLICT (id) DO UPDATE SET
    daily_budget = EXCLUDED.daily_budget,
    total_spent = EXCLUDED.total_spent,
    status = EXCLUDED.status;

-- حملة 6: Shopping - نشطة
INSERT INTO furriyadh_campaigns (
    id,
    customer_account_id,
    campaign_name,
    campaign_type,
    daily_budget,
    total_spent,
    status,
    google_campaign_id,
    target_url
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Google Shopping - المنتجات',
    'SHOPPING',
    300.00,
    475.00,
    'active',
    'google_camp_12350',
    'https://example-store.com/products'
) ON CONFLICT (id) DO UPDATE SET
    daily_budget = EXCLUDED.daily_budget,
    total_spent = EXCLUDED.total_spent,
    status = EXCLUDED.status;

-- ============================================
-- 3. إضافة إيداعات
-- ============================================

INSERT INTO furriyadh_deposits (
    id,
    customer_account_id,
    gross_amount,
    commission_amount,
    net_amount,
    payment_method,
    status,
    payment_reference
) VALUES 
(
    'dddd1111-1111-1111-1111-111111111111',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    2500.00,
    500.00,
    2000.00,
    'bank_transfer',
    'completed',
    'TRX-2024-001'
),
(
    'dddd2222-2222-2222-2222-222222222222',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    1875.00,
    375.00,
    1500.00,
    'paypal',
    'completed',
    'TRX-2024-002'
),
(
    'dddd3333-3333-3333-3333-333333333333',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    1875.00,
    375.00,
    1500.00,
    'stripe',
    'completed',
    'TRX-2024-003'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. إضافة إشعارات
-- ============================================

INSERT INTO furriyadh_notifications (
    id,
    customer_account_id,
    type,
    title,
    message,
    is_read
) VALUES 
(
    'eeee1111-1111-1111-1111-111111111111',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'low_balance',
    'تنبيه: رصيد منخفض',
    'الميزانية وصلت إلى 85%! يُنصح بإضافة ميزانية إضافية.',
    false
),
(
    'eeee2222-2222-2222-2222-222222222222',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'deposit_received',
    'تم استلام الإيداع',
    'تم إضافة 2,000$ إلى رصيدك بنجاح.',
    true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- التحقق من البيانات
-- ============================================

SELECT '✅ Test data inserted successfully!' as message;
SELECT 'Customer Account:' as item, count(*) as count FROM furriyadh_customer_accounts WHERE user_email = 'cejihe6663@icousd.com';
SELECT 'Campaigns:' as item, count(*) as count FROM furriyadh_campaigns WHERE customer_account_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
SELECT 'Deposits:' as item, count(*) as count FROM furriyadh_deposits WHERE customer_account_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
SELECT 'Notifications:' as item, count(*) as count FROM furriyadh_notifications WHERE customer_account_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
