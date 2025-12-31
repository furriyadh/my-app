-- =====================================================
-- Migration: Plan Limits Enforcement System
-- Created: 2024-12-31
-- Purpose: Track campaigns created via platform & enforce plan limits
-- =====================================================

-- =====================================================
-- 1. Platform Created Campaigns Table
-- Tracks all campaigns created through our platform
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_created_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Google Ads identifiers
    google_campaign_id VARCHAR(50) NOT NULL,
    google_campaign_name VARCHAR(255),
    customer_id VARCHAR(20) NOT NULL,
    
    -- Source tracking
    source VARCHAR(20) NOT NULL CHECK (source IN ('furriyadh_managed', 'self_managed')),
    
    -- User association
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    
    -- Campaign details
    campaign_type VARCHAR(30) DEFAULT 'SEARCH',
    daily_budget DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    website_url TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique campaign per customer
    UNIQUE(google_campaign_id, customer_id)
);

-- =====================================================
-- 2. User Billing Usage Table
-- Tracks current usage for plan limit enforcement
-- =====================================================
CREATE TABLE IF NOT EXISTS user_billing_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Counts
    accounts_count INTEGER DEFAULT 0,
    campaigns_count INTEGER DEFAULT 0,
    
    -- Budget tracking
    monthly_budget_used DECIMAL(12,2) DEFAULT 0,
    current_month VARCHAR(7), -- Format: '2025-01'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- 3. User Billing Subscriptions Table (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_billing_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    
    -- Plan info
    plan_id VARCHAR(20) DEFAULT 'free',
    status VARCHAR(20) DEFAULT 'active',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    billing_mode VARCHAR(30) DEFAULT 'self_managed',
    
    -- Period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- 4. Indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_platform_campaigns_user_id ON platform_created_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_campaigns_source ON platform_created_campaigns(source);
CREATE INDEX IF NOT EXISTS idx_platform_campaigns_customer_id ON platform_created_campaigns(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_billing_usage_user_id ON user_billing_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_billing_subscriptions_user_id ON user_billing_subscriptions(user_id);

-- =====================================================
-- 5. Row Level Security
-- =====================================================
ALTER TABLE platform_created_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_billing_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for platform_created_campaigns
DROP POLICY IF EXISTS "Users can view own campaigns" ON platform_created_campaigns;
CREATE POLICY "Users can view own campaigns" ON platform_created_campaigns
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to campaigns" ON platform_created_campaigns;
CREATE POLICY "Service role full access to campaigns" ON platform_created_campaigns
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies for user_billing_usage
DROP POLICY IF EXISTS "Users can view own usage" ON user_billing_usage;
CREATE POLICY "Users can view own usage" ON user_billing_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to usage" ON user_billing_usage;
CREATE POLICY "Service role full access to usage" ON user_billing_usage
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies for user_billing_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON user_billing_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_billing_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to subscriptions" ON user_billing_subscriptions;
CREATE POLICY "Service role full access to subscriptions" ON user_billing_subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 6. Function to reset monthly usage
-- =====================================================
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
DECLARE
    current_month_str VARCHAR(7);
BEGIN
    current_month_str := TO_CHAR(NOW(), 'YYYY-MM');
    
    -- Reset usage for users whose current_month is different
    UPDATE user_billing_usage
    SET monthly_budget_used = 0,
        current_month = current_month_str,
        last_updated_at = NOW()
    WHERE current_month IS NULL OR current_month != current_month_str;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. Trigger to update timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_platform_campaigns_updated ON platform_created_campaigns;
CREATE TRIGGER trigger_platform_campaigns_updated
    BEFORE UPDATE ON platform_created_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
