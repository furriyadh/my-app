-- =====================================================
-- Furriyadh Commission System Database Schema
-- نظام العمولة 20% - جداول قاعدة البيانات
-- =====================================================
-- تشغيل هذا الملف في Supabase SQL Editor

-- 1️⃣ جدول حسابات عملاء نظام العمولة
-- Customer Accounts for Commission System
CREATE TABLE IF NOT EXISTS furriyadh_customer_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    google_ads_customer_id VARCHAR(20) NOT NULL,
    
    -- الموقع/القناة المقفلة - Locked Asset (website/youtube/app)
    locked_asset_url TEXT NOT NULL,
    locked_asset_type VARCHAR(50) NOT NULL CHECK (locked_asset_type IN ('website', 'youtube', 'app', 'store')),
    
    -- الميزانية - Budget Tracking
    total_deposited DECIMAL(12,2) DEFAULT 0,          -- إجمالي المبالغ المودعة
    total_spent DECIMAL(12,2) DEFAULT 0,              -- إجمالي الإنفاق الفعلي من Google Ads
    current_balance DECIMAL(12,2) DEFAULT 0,          -- الرصيد الحالي المتاح
    reserved_budget DECIMAL(12,2) DEFAULT 0,          -- الميزانية المحجوزة للحملات النشطة
    
    -- العمولة - Commission (20%)
    total_commission DECIMAL(12,2) DEFAULT 0,         -- إجمالي العمولة المستحقة
    commission_paid DECIMAL(12,2) DEFAULT 0,          -- العمولة المدفوعة
    
    -- الحالة - Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'out_of_balance', 'closed')),
    
    -- البيانات الوصفية
    account_name VARCHAR(255),                        -- اسم الحساب في Google Ads
    currency VARCHAR(10) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    
    -- التواريخ
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ                          -- آخر مزامنة مع Google Ads
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_furriyadh_accounts_email ON furriyadh_customer_accounts(user_email);
CREATE INDEX IF NOT EXISTS idx_furriyadh_accounts_status ON furriyadh_customer_accounts(status);
CREATE INDEX IF NOT EXISTS idx_furriyadh_accounts_google_id ON furriyadh_customer_accounts(google_ads_customer_id);

-- 2️⃣ جدول الحملات المنشأة عبر نظام العمولة
-- Campaigns created through Commission System
CREATE TABLE IF NOT EXISTS furriyadh_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_account_id UUID NOT NULL REFERENCES furriyadh_customer_accounts(id) ON DELETE CASCADE,
    google_campaign_id VARCHAR(50) NOT NULL,
    
    -- بيانات الحملة
    campaign_name TEXT NOT NULL,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('SEARCH', 'VIDEO', 'DISPLAY', 'SHOPPING', 'PERFORMANCE_MAX')),
    
    -- الميزانية
    daily_budget DECIMAL(12,2) NOT NULL,
    daily_budget_micros BIGINT,                       -- الميزانية بالـ micros لـ Google Ads API
    total_spent DECIMAL(12,2) DEFAULT 0,
    
    -- الحالة
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped_no_balance', 'removed')),
    google_status VARCHAR(20),                        -- الحالة من Google Ads API
    
    -- بيانات إضافية
    target_url TEXT,                                  -- الرابط المستهدف
    keywords_count INT DEFAULT 0,
    ads_count INT DEFAULT 0,
    
    -- التواريخ
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paused_at TIMESTAMPTZ,                            -- تاريخ الإيقاف التلقائي
    last_activity_at TIMESTAMPTZ
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_furriyadh_campaigns_account ON furriyadh_campaigns(customer_account_id);
CREATE INDEX IF NOT EXISTS idx_furriyadh_campaigns_status ON furriyadh_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_furriyadh_campaigns_google_id ON furriyadh_campaigns(google_campaign_id);

-- 3️⃣ جدول الإيداعات والمدفوعات
-- Deposits and Payments
CREATE TABLE IF NOT EXISTS furriyadh_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_account_id UUID NOT NULL REFERENCES furriyadh_customer_accounts(id) ON DELETE CASCADE,
    
    -- المبالغ
    gross_amount DECIMAL(12,2) NOT NULL,              -- المبلغ الإجمالي المدفوع
    commission_amount DECIMAL(12,2) NOT NULL,         -- العمولة 20%
    net_amount DECIMAL(12,2) NOT NULL,                -- المبلغ الصافي (80%)
    
    -- بيانات الدفع
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('paypal', 'stripe', 'bank_transfer', 'manual')),
    payment_reference TEXT,                           -- رقم المعاملة من PayPal/Stripe
    payment_email VARCHAR(255),                       -- إيميل PayPal
    
    -- الحالة
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- البيانات الوصفية
    currency VARCHAR(10) DEFAULT 'USD',
    exchange_rate DECIMAL(10,4) DEFAULT 1,            -- سعر الصرف وقت الدفع
    notes TEXT,
    
    -- التواريخ
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_furriyadh_deposits_account ON furriyadh_deposits(customer_account_id);
CREATE INDEX IF NOT EXISTS idx_furriyadh_deposits_status ON furriyadh_deposits(status);
CREATE INDEX IF NOT EXISTS idx_furriyadh_deposits_created ON furriyadh_deposits(created_at DESC);

-- 4️⃣ جدول سجل الإنفاق اليومي
-- Daily Spending Log (synced from Google Ads)
CREATE TABLE IF NOT EXISTS furriyadh_daily_spending (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_account_id UUID NOT NULL REFERENCES furriyadh_customer_accounts(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES furriyadh_campaigns(id) ON DELETE SET NULL,
    
    -- البيانات
    date DATE NOT NULL,
    cost_micros BIGINT DEFAULT 0,                     -- التكلفة بالـ micros
    cost_usd DECIMAL(12,2) DEFAULT 0,                 -- التكلفة بالدولار
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions DECIMAL(10,2) DEFAULT 0,
    
    -- التواريخ
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint لمنع التكرار
    UNIQUE(customer_account_id, campaign_id, date)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_furriyadh_spending_account ON furriyadh_daily_spending(customer_account_id);
CREATE INDEX IF NOT EXISTS idx_furriyadh_spending_date ON furriyadh_daily_spending(date DESC);

-- 5️⃣ جدول الإشعارات والتنبيهات
-- Notifications for low balance, etc.
CREATE TABLE IF NOT EXISTS furriyadh_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_account_id UUID NOT NULL REFERENCES furriyadh_customer_accounts(id) ON DELETE CASCADE,
    
    -- النوع والرسالة
    type VARCHAR(50) NOT NULL CHECK (type IN ('low_balance', 'no_balance', 'campaign_paused', 'deposit_received', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- الحالة
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    
    -- التواريخ
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_furriyadh_notifications_account ON furriyadh_notifications(customer_account_id);
CREATE INDEX IF NOT EXISTS idx_furriyadh_notifications_unread ON furriyadh_notifications(customer_account_id) WHERE is_read = FALSE;

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE furriyadh_customer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE furriyadh_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE furriyadh_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE furriyadh_daily_spending ENABLE ROW LEVEL SECURITY;
ALTER TABLE furriyadh_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for furriyadh_customer_accounts
DROP POLICY IF EXISTS "Users can view their own account" ON furriyadh_customer_accounts;
CREATE POLICY "Users can view their own account" ON furriyadh_customer_accounts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all accounts" ON furriyadh_customer_accounts;
CREATE POLICY "Service role can manage all accounts" ON furriyadh_customer_accounts
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies for furriyadh_campaigns
DROP POLICY IF EXISTS "Users can view their own campaigns" ON furriyadh_campaigns;
CREATE POLICY "Users can view their own campaigns" ON furriyadh_campaigns
    FOR SELECT USING (
        customer_account_id IN (
            SELECT id FROM furriyadh_customer_accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Service role can manage all campaigns" ON furriyadh_campaigns;
CREATE POLICY "Service role can manage all campaigns" ON furriyadh_campaigns
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies for furriyadh_deposits
DROP POLICY IF EXISTS "Users can view their own deposits" ON furriyadh_deposits;
CREATE POLICY "Users can view their own deposits" ON furriyadh_deposits
    FOR SELECT USING (
        customer_account_id IN (
            SELECT id FROM furriyadh_customer_accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Service role can manage all deposits" ON furriyadh_deposits;
CREATE POLICY "Service role can manage all deposits" ON furriyadh_deposits
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies for furriyadh_daily_spending
DROP POLICY IF EXISTS "Users can view their own spending" ON furriyadh_daily_spending;
CREATE POLICY "Users can view their own spending" ON furriyadh_daily_spending
    FOR SELECT USING (
        customer_account_id IN (
            SELECT id FROM furriyadh_customer_accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Service role can manage all spending" ON furriyadh_daily_spending;
CREATE POLICY "Service role can manage all spending" ON furriyadh_daily_spending
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies for furriyadh_notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON furriyadh_notifications;
CREATE POLICY "Users can view their own notifications" ON furriyadh_notifications
    FOR SELECT USING (
        customer_account_id IN (
            SELECT id FROM furriyadh_customer_accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own notifications" ON furriyadh_notifications;
CREATE POLICY "Users can update their own notifications" ON furriyadh_notifications
    FOR UPDATE USING (
        customer_account_id IN (
            SELECT id FROM furriyadh_customer_accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Service role can manage all notifications" ON furriyadh_notifications;
CREATE POLICY "Service role can manage all notifications" ON furriyadh_notifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- Functions for Auto-Update
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-update
DROP TRIGGER IF EXISTS update_furriyadh_customer_accounts_updated_at ON furriyadh_customer_accounts;
CREATE TRIGGER update_furriyadh_customer_accounts_updated_at
    BEFORE UPDATE ON furriyadh_customer_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_furriyadh_campaigns_updated_at ON furriyadh_campaigns;
CREATE TRIGGER update_furriyadh_campaigns_updated_at
    BEFORE UPDATE ON furriyadh_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Function to Calculate and Update Balance
-- =====================================================
CREATE OR REPLACE FUNCTION update_customer_balance(account_id UUID)
RETURNS void AS $$
DECLARE
    total_deposits DECIMAL(12,2);
    total_spending DECIMAL(12,2);
BEGIN
    -- Calculate total deposits (net amount after commission)
    SELECT COALESCE(SUM(net_amount), 0) INTO total_deposits
    FROM furriyadh_deposits
    WHERE customer_account_id = account_id AND status = 'completed';
    
    -- Calculate total spending from Google Ads
    SELECT COALESCE(SUM(cost_usd), 0) INTO total_spending
    FROM furriyadh_daily_spending
    WHERE customer_account_id = account_id;
    
    -- Update account balance
    UPDATE furriyadh_customer_accounts
    SET 
        total_deposited = total_deposits,
        total_spent = total_spending,
        current_balance = total_deposits - total_spending,
        -- Auto-update status based on balance
        status = CASE 
            WHEN total_deposits - total_spending <= 0 THEN 'out_of_balance'
            ELSE 'active'
        END
    WHERE id = account_id;
END;
$$ language 'plpgsql';

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================
-- INSERT INTO furriyadh_customer_accounts (user_email, google_ads_customer_id, locked_asset_url, locked_asset_type, account_name)
-- VALUES ('test@example.com', '1234567890', 'https://example.com', 'website', 'Test Account');

COMMENT ON TABLE furriyadh_customer_accounts IS 'حسابات عملاء نظام العمولة 20% - Furriyadh Commission System Customer Accounts';
COMMENT ON TABLE furriyadh_campaigns IS 'الحملات المنشأة عبر نظام العمولة - Campaigns created through Commission System';
COMMENT ON TABLE furriyadh_deposits IS 'الإيداعات والمدفوعات - Customer Deposits and Payments';
COMMENT ON TABLE furriyadh_daily_spending IS 'سجل الإنفاق اليومي من Google Ads - Daily Spending synced from Google Ads';
COMMENT ON TABLE furriyadh_notifications IS 'إشعارات النظام للعملاء - System Notifications for Customers';
