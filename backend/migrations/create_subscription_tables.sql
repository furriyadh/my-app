-- =====================================================
-- Subscription System Tables Migration
-- Run in Supabase SQL Editor: supabase.com/dashboard
-- =====================================================

-- 1. Billing Plans (Reference Table)
-- Drop if exists to recreate with correct schema
DROP TABLE IF EXISTS billing_plans CASCADE;
CREATE TABLE billing_plans (
    id TEXT PRIMARY KEY,
    plan_name TEXT NOT NULL,
    plan_name_ar TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_accounts INTEGER NOT NULL DEFAULT 1,
    max_campaigns INTEGER NOT NULL DEFAULT 1,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO billing_plans (id, plan_name, plan_name_ar, price_monthly, price_yearly, max_accounts, max_campaigns, features)
VALUES 
    ('free', 'Free', 'مجاني', 0, 0, 1, 1, '["1 Google Ads Account", "1 Campaign", "Basic Analytics"]'::jsonb),
    ('basic', 'Basic', 'أساسي', 49, 490, 3, 5, '["3 Google Ads Accounts", "5 Campaigns", "AI Ad Creation", "Email Support"]'::jsonb),
    ('pro', 'Pro', 'احترافي', 99, 990, 10, 25, '["10 Google Ads Accounts", "25 Campaigns", "AI Ad Creation", "Priority Support", "Advanced Analytics"]'::jsonb),
    ('agency', 'Agency', 'وكالة', 249, 2490, 50, 100, '["50 Google Ads Accounts", "Unlimited Campaigns", "White Label", "24/7 Support", "API Access", "Custom Reports"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    plan_name_ar = EXCLUDED.plan_name_ar,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    max_accounts = EXCLUDED.max_accounts,
    max_campaigns = EXCLUDED.max_campaigns,
    features = EXCLUDED.features;

-- 2. User Billing Subscriptions
CREATE TABLE IF NOT EXISTS user_billing_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    user_email TEXT NOT NULL,
    plan_id TEXT NOT NULL REFERENCES billing_plans(id),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    billing_mode TEXT DEFAULT 'self_managed' CHECK (billing_mode IN ('managed', 'self_managed')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    auto_renewal BOOLEAN DEFAULT TRUE,
    stripe_subscription_id TEXT,
    paypal_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON user_billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON user_billing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON user_billing_subscriptions(current_period_end);

-- 3. Billing Transactions
CREATE TABLE IF NOT EXISTS billing_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription_fee', 'ad_spend', 'refund', 'adjustment', 'payment')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    transaction_reference TEXT,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON billing_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON billing_transactions(status);

-- 4. Billing Plan History (Audit Trail)
CREATE TABLE IF NOT EXISTS billing_plan_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    old_plan_id TEXT,
    new_plan_id TEXT NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('new', 'upgrade', 'downgrade', 'cancel', 'reactivate')),
    change_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_history_user_id ON billing_plan_history(user_id);

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE user_billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_plan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_billing_subscriptions
CREATE POLICY "Users can view their own subscription"
    ON user_billing_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
    ON user_billing_subscriptions FOR ALL
    USING (auth.role() = 'service_role');

-- RLS Policies for billing_transactions
CREATE POLICY "Users can view their own transactions"
    ON billing_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
    ON billing_transactions FOR ALL
    USING (auth.role() = 'service_role');

-- RLS Policies for billing_plan_history
CREATE POLICY "Users can view their own plan history"
    ON billing_plan_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all plan history"
    ON billing_plan_history FOR ALL
    USING (auth.role() = 'service_role');

-- Grant public read access to billing_plans
GRANT SELECT ON billing_plans TO anon, authenticated;
