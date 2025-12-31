-- =====================================================
-- Campaign Budget Tracking System - Migration
-- نظام تتبع ميزانيات الحملات
-- =====================================================
-- Run this after 001_furriyadh_commission_system.sql

-- 1️⃣ Add budget tracking columns to furriyadh_campaigns
-- إضافة أعمدة تتبع الميزانية

ALTER TABLE furriyadh_campaigns 
ADD COLUMN IF NOT EXISTS weekly_budget DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS user_requested_budget DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS budget_spent DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget_remaining DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS spend_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_daily_spend DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_days_remaining DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS estimated_depletion_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cycle_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cycle_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS low_balance_notified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS low_balance_threshold_hours INT DEFAULT 24,
ADD COLUMN IF NOT EXISTS pending_budget_increase DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS pending_payment_required DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS budget_increase_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_spend_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_progress_calc_at TIMESTAMPTZ;

-- Update weekly_budget from daily_budget for existing campaigns
UPDATE furriyadh_campaigns 
SET weekly_budget = daily_budget * 7,
    budget_remaining = daily_budget * 7 - COALESCE(total_spent, 0),
    cycle_start_date = COALESCE(created_at, NOW()),
    cycle_end_date = COALESCE(created_at, NOW()) + INTERVAL '7 days'
WHERE weekly_budget IS NULL;

-- 2️⃣ Create budget history table
-- جدول تاريخ تغييرات الميزانية

CREATE TABLE IF NOT EXISTS campaign_budget_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES furriyadh_campaigns(id) ON DELETE CASCADE,
    
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN (
        'initial',
        'increase',
        'decrease',
        'spend_update',
        'cycle_renewal'
    )),
    
    previous_budget DECIMAL(12,2),
    new_budget DECIMAL(12,2),
    difference DECIMAL(12,2),
    
    deposit_id UUID REFERENCES furriyadh_deposits(id),
    payment_amount DECIMAL(12,2),
    
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_history_campaign ON campaign_budget_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_budget_history_created ON campaign_budget_history(created_at DESC);

-- 3️⃣ Create budget alerts table
-- جدول تنبيهات الميزانية

CREATE TABLE IF NOT EXISTS budget_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES furriyadh_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN (
        'low_balance_24h',
        'low_balance_12h',
        'balance_depleted',
        'campaign_paused',
        'budget_increase_pending',
        'payment_required'
    )),
    
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    title_ar TEXT,
    message_ar TEXT,
    
    action_url TEXT,
    action_label TEXT,
    action_label_ar TEXT,
    
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    email_sent_at TIMESTAMPTZ,
    push_sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_budget_alerts_campaign ON budget_alerts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_user ON budget_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_unread ON budget_alerts(user_id) WHERE is_read = FALSE;

-- 4️⃣ Enable RLS for new tables
ALTER TABLE campaign_budget_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

-- 5️⃣ RLS Policies for campaign_budget_history
DROP POLICY IF EXISTS "Users can view their campaign budget history" ON campaign_budget_history;
CREATE POLICY "Users can view their campaign budget history" ON campaign_budget_history
    FOR SELECT USING (
        campaign_id IN (
            SELECT fc.id FROM furriyadh_campaigns fc
            JOIN furriyadh_customer_accounts fca ON fc.customer_account_id = fca.id
            WHERE fca.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Service role can manage budget history" ON campaign_budget_history;
CREATE POLICY "Service role can manage budget history" ON campaign_budget_history
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 6️⃣ RLS Policies for budget_alerts
DROP POLICY IF EXISTS "Users can view their budget alerts" ON budget_alerts;
CREATE POLICY "Users can view their budget alerts" ON budget_alerts
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their budget alerts" ON budget_alerts;
CREATE POLICY "Users can update their budget alerts" ON budget_alerts
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage budget alerts" ON budget_alerts;
CREATE POLICY "Service role can manage budget alerts" ON budget_alerts
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 7️⃣ Function to calculate and update campaign budget progress
CREATE OR REPLACE FUNCTION update_campaign_budget_progress(p_campaign_id UUID)
RETURNS void AS $$
DECLARE
    v_total_spent DECIMAL(12,2);
    v_weekly_budget DECIMAL(12,2);
    v_daily_budget DECIMAL(12,2);
    v_days_elapsed INT;
    v_avg_daily DECIMAL(12,2);
    v_remaining DECIMAL(12,2);
    v_days_remaining DECIMAL(5,2);
    v_percentage DECIMAL(5,2);
BEGIN
    -- Get campaign budget info
    SELECT daily_budget, weekly_budget, total_spent, cycle_start_date
    INTO v_daily_budget, v_weekly_budget, v_total_spent, v_days_elapsed
    FROM furriyadh_campaigns 
    WHERE id = p_campaign_id;
    
    -- Calculate days elapsed
    SELECT EXTRACT(DAY FROM NOW() - cycle_start_date)::INT 
    INTO v_days_elapsed
    FROM furriyadh_campaigns 
    WHERE id = p_campaign_id;
    
    -- Avoid division by zero
    IF v_days_elapsed < 1 THEN v_days_elapsed := 1; END IF;
    
    -- Calculate average daily spend
    v_avg_daily := COALESCE(v_total_spent, 0) / v_days_elapsed;
    
    -- Calculate remaining budget
    v_remaining := COALESCE(v_weekly_budget, 0) - COALESCE(v_total_spent, 0);
    IF v_remaining < 0 THEN v_remaining := 0; END IF;
    
    -- Calculate days remaining
    IF v_avg_daily > 0 THEN
        v_days_remaining := v_remaining / v_avg_daily;
    ELSE
        v_days_remaining := 7; -- Default to full week if no spending yet
    END IF;
    
    -- Calculate spend percentage
    IF COALESCE(v_weekly_budget, 0) > 0 THEN
        v_percentage := (COALESCE(v_total_spent, 0) / v_weekly_budget) * 100;
    ELSE
        v_percentage := 0;
    END IF;
    
    -- Update campaign
    UPDATE furriyadh_campaigns
    SET 
        budget_spent = COALESCE(v_total_spent, 0),
        budget_remaining = v_remaining,
        avg_daily_spend = v_avg_daily,
        estimated_days_remaining = v_days_remaining,
        estimated_depletion_at = NOW() + (v_days_remaining || ' days')::INTERVAL,
        spend_percentage = LEAST(v_percentage, 100),
        last_progress_calc_at = NOW()
    WHERE id = p_campaign_id;
    
END;
$$ LANGUAGE plpgsql;

-- 8️⃣ Function to check and send low balance alerts
CREATE OR REPLACE FUNCTION check_low_balance_alerts()
RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    -- Find campaigns with balance running out within 24 hours
    FOR r IN 
        SELECT 
            fc.id as campaign_id,
            fc.campaign_name,
            fc.estimated_days_remaining,
            fca.user_id,
            fca.user_email
        FROM furriyadh_campaigns fc
        JOIN furriyadh_customer_accounts fca ON fc.customer_account_id = fca.id
        WHERE fc.status = 'active'
        AND fc.estimated_days_remaining <= 1  -- Less than 24 hours
        AND (fc.low_balance_notified_at IS NULL 
             OR fc.low_balance_notified_at < NOW() - INTERVAL '12 hours')
    LOOP
        -- Insert alert
        INSERT INTO budget_alerts (
            campaign_id, user_id, alert_type,
            title, message, title_ar, message_ar,
            action_url, action_label, action_label_ar
        ) VALUES (
            r.campaign_id, r.user_id, 'low_balance_24h',
            'Low Budget Alert: ' || r.campaign_name,
            'Your campaign budget will run out in approximately ' || ROUND(r.estimated_days_remaining * 24) || ' hours. Add budget to keep your ads running.',
            'تنبيه: رصيد منخفض - ' || r.campaign_name,
            'سينتهي رصيد حملتك خلال ' || ROUND(r.estimated_days_remaining * 24) || ' ساعة تقريباً. أضف رصيداً للحفاظ على إعلاناتك.',
            '/google-ads/billing',
            'Add Budget',
            'إضافة رصيد'
        );
        
        -- Mark campaign as notified
        UPDATE furriyadh_campaigns 
        SET low_balance_notified_at = NOW()
        WHERE id = r.campaign_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9️⃣ Function to auto-pause campaigns with zero balance
CREATE OR REPLACE FUNCTION auto_pause_zero_balance_campaigns()
RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            fc.id as campaign_id,
            fc.campaign_name,
            fca.user_id
        FROM furriyadh_campaigns fc
        JOIN furriyadh_customer_accounts fca ON fc.customer_account_id = fca.id
        WHERE fc.status = 'active'
        AND fc.budget_remaining <= 0
    LOOP
        -- Update campaign status
        UPDATE furriyadh_campaigns
        SET status = 'stopped_no_balance',
            paused_at = NOW()
        WHERE id = r.campaign_id;
        
        -- Insert alert
        INSERT INTO budget_alerts (
            campaign_id, user_id, alert_type,
            title, message, title_ar, message_ar,
            action_url, action_label, action_label_ar
        ) VALUES (
            r.campaign_id, r.user_id, 'balance_depleted',
            'Campaign Paused: ' || r.campaign_name,
            'Your campaign has been paused due to zero balance. Add budget to resume.',
            'تم إيقاف الحملة: ' || r.campaign_name,
            'تم إيقاف حملتك بسبب نفاد الرصيد. أضف رصيداً لاستئنافها.',
            '/google-ads/billing',
            'Add Budget Now',
            'أضف رصيداً الآن'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 🔟 Comments
COMMENT ON TABLE campaign_budget_history IS 'تاريخ تغييرات ميزانية الحملات - Campaign Budget Change History';
COMMENT ON TABLE budget_alerts IS 'تنبيهات الميزانية للعملاء - Budget Alerts for Customers';
COMMENT ON FUNCTION update_campaign_budget_progress(UUID) IS 'حساب وتحديث progress الميزانية - Calculate and update budget progress';
COMMENT ON FUNCTION check_low_balance_alerts() IS 'فحص وإرسال تنبيهات انخفاض الرصيد - Check and send low balance alerts';
COMMENT ON FUNCTION auto_pause_zero_balance_campaigns() IS 'إيقاف الحملات تلقائياً عند نفاد الرصيد - Auto-pause campaigns with zero balance';
