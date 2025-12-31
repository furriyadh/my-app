-- =====================================================
-- DUAL BILLING SYSTEM SCHEMA
-- نظام الفوترة المزدوجة: self_managed vs furriyadh_managed
-- =====================================================

-- 1. ADD billing_mode COLUMN TO user_billing_subscriptions (if not exists)
-- This tracks whether the user uses their own accounts or Furriyadh managed accounts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_billing_subscriptions' 
        AND column_name = 'billing_mode'
    ) THEN
        ALTER TABLE public.user_billing_subscriptions 
        ADD COLUMN billing_mode character varying DEFAULT 'self_managed'::character varying
        CHECK (billing_mode::text = ANY (ARRAY['self_managed'::character varying, 'furriyadh_managed'::character varying]::text[]));
    END IF;
END $$;

-- 2. MANAGED ACCOUNT ASSIGNMENTS TABLE
-- Tracks which Furriyadh-managed account is assigned to which user
CREATE TABLE IF NOT EXISTS public.managed_account_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    managed_account_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    unassigned_at timestamp with time zone,
    is_active boolean DEFAULT true,
    assignment_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT managed_account_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT managed_account_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT managed_account_assignments_managed_account_id_fkey FOREIGN KEY (managed_account_id) REFERENCES public.managed_accounts(id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_managed_account_assignments_user_id ON public.managed_account_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_managed_account_assignments_active ON public.managed_account_assignments(is_active) WHERE is_active = true;

-- 3. COMMISSION RATES TABLE
-- Stores commission rates (can be adjusted per user or globally)
CREATE TABLE IF NOT EXISTS public.commission_rates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    rate_name character varying NOT NULL DEFAULT 'default'::character varying,
    commission_percentage numeric NOT NULL DEFAULT 20.00,
    min_spend numeric DEFAULT 0,
    max_spend numeric,
    is_active boolean DEFAULT true,
    effective_from timestamp with time zone DEFAULT now(),
    effective_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT commission_rates_pkey PRIMARY KEY (id),
    CONSTRAINT commission_rates_percentage_check CHECK (commission_percentage >= 0 AND commission_percentage <= 100)
);

-- Insert default 20% rate
INSERT INTO public.commission_rates (rate_name, commission_percentage, is_active)
VALUES ('default', 20.00, true)
ON CONFLICT DO NOTHING;

-- 4. DAILY AD SPEND TRACKING TABLE
-- Tracks daily ad spend for commission calculation
CREATE TABLE IF NOT EXISTS public.daily_ad_spend (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    managed_account_id uuid,
    customer_id character varying NOT NULL,
    spend_date date NOT NULL,
    ad_spend numeric NOT NULL DEFAULT 0,
    currency character varying DEFAULT 'USD'::character varying,
    commission_rate numeric DEFAULT 20.00,
    commission_amount numeric GENERATED ALWAYS AS (ad_spend * (commission_rate / 100)) STORED,
    campaign_count integer DEFAULT 0,
    impressions bigint DEFAULT 0,
    clicks bigint DEFAULT 0,
    conversions integer DEFAULT 0,
    synced_from_google boolean DEFAULT false,
    sync_timestamp timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_ad_spend_pkey PRIMARY KEY (id),
    CONSTRAINT daily_ad_spend_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT daily_ad_spend_unique UNIQUE (user_id, customer_id, spend_date)
);

-- Indexes for fast aggregation
CREATE INDEX IF NOT EXISTS idx_daily_ad_spend_user_date ON public.daily_ad_spend(user_id, spend_date);
CREATE INDEX IF NOT EXISTS idx_daily_ad_spend_date ON public.daily_ad_spend(spend_date);
CREATE INDEX IF NOT EXISTS idx_daily_ad_spend_customer ON public.daily_ad_spend(customer_id);

-- 5. MONTHLY COMMISSION INVOICES TABLE
-- Generated monthly invoices for commission payments
CREATE TABLE IF NOT EXISTS public.commission_invoices (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    invoice_number character varying NOT NULL UNIQUE,
    invoice_month date NOT NULL, -- First day of the month
    total_ad_spend numeric NOT NULL DEFAULT 0,
    commission_rate numeric NOT NULL DEFAULT 20.00,
    commission_amount numeric NOT NULL DEFAULT 0,
    currency character varying DEFAULT 'USD'::character varying,
    status character varying DEFAULT 'pending'::character varying 
        CHECK (status::text = ANY (ARRAY['pending', 'paid', 'cancelled', 'overdue']::text[])),
    due_date date,
    paid_at timestamp with time zone,
    payment_method character varying,
    payment_reference character varying,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT commission_invoices_pkey PRIMARY KEY (id),
    CONSTRAINT commission_invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Index for monthly lookups
CREATE INDEX IF NOT EXISTS idx_commission_invoices_user_month ON public.commission_invoices(user_id, invoice_month);
CREATE INDEX IF NOT EXISTS idx_commission_invoices_status ON public.commission_invoices(status);

-- 6. BILLING MODE CHANGE HISTORY
-- Tracks when users switch between billing modes
CREATE TABLE IF NOT EXISTS public.billing_mode_history (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    old_mode character varying,
    new_mode character varying NOT NULL,
    change_reason text,
    changed_by uuid, -- Admin or user
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT billing_mode_history_pkey PRIMARY KEY (id),
    CONSTRAINT billing_mode_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Index for history lookups
CREATE INDEX IF NOT EXISTS idx_billing_mode_history_user ON public.billing_mode_history(user_id);

-- 7. ADMIN DASHBOARD AGGREGATES TABLE
-- Pre-calculated aggregates for admin dashboard (updated periodically)
CREATE TABLE IF NOT EXISTS public.admin_billing_dashboard (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    dashboard_date date NOT NULL UNIQUE,
    total_managed_users integer DEFAULT 0,
    total_self_managed_users integer DEFAULT 0,
    total_ad_spend_managed numeric DEFAULT 0,
    total_ad_spend_self numeric DEFAULT 0,
    total_commission_earned numeric DEFAULT 0,
    total_commission_pending numeric DEFAULT 0,
    total_commission_paid numeric DEFAULT 0,
    active_managed_accounts integer DEFAULT 0,
    available_managed_accounts integer DEFAULT 0,
    new_managed_signups_today integer DEFAULT 0,
    top_spenders jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT admin_billing_dashboard_pkey PRIMARY KEY (id)
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's current billing mode
CREATE OR REPLACE FUNCTION get_user_billing_mode(p_user_id uuid)
RETURNS character varying AS $$
DECLARE
    v_mode character varying;
BEGIN
    SELECT billing_mode INTO v_mode
    FROM public.user_billing_subscriptions
    WHERE user_id = p_user_id
    LIMIT 1;
    
    RETURN COALESCE(v_mode, 'self_managed');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate monthly commission for a user
CREATE OR REPLACE FUNCTION calculate_monthly_commission(
    p_user_id uuid,
    p_year integer,
    p_month integer
)
RETURNS TABLE (
    total_spend numeric,
    commission_rate numeric,
    commission_amount numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(das.ad_spend), 0) as total_spend,
        COALESCE(AVG(das.commission_rate), 20.00) as commission_rate,
        COALESCE(SUM(das.commission_amount), 0) as commission_amount
    FROM public.daily_ad_spend das
    WHERE das.user_id = p_user_id
    AND EXTRACT(YEAR FROM das.spend_date) = p_year
    AND EXTRACT(MONTH FROM das.spend_date) = p_month;
END;
$$ LANGUAGE plpgsql;

-- Function to assign managed account to user
CREATE OR REPLACE FUNCTION assign_managed_account(
    p_user_id uuid,
    p_reason text DEFAULT 'User selected managed mode'
)
RETURNS uuid AS $$
DECLARE
    v_account_id uuid;
    v_assignment_id uuid;
BEGIN
    -- Find an available managed account
    SELECT id INTO v_account_id
    FROM public.managed_accounts
    WHERE status = 'available'
    AND assigned_to IS NULL
    ORDER BY trust_score DESC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
    
    IF v_account_id IS NULL THEN
        RAISE EXCEPTION 'No available managed accounts';
    END IF;
    
    -- Assign the account
    UPDATE public.managed_accounts
    SET status = 'assigned',
        assigned_to = p_user_id,
        assigned_at = now()
    WHERE id = v_account_id;
    
    -- Create assignment record
    INSERT INTO public.managed_account_assignments (
        user_id, managed_account_id, assignment_reason
    ) VALUES (
        p_user_id, v_account_id, p_reason
    ) RETURNING id INTO v_assignment_id;
    
    RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.managed_account_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_ad_spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_mode_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own assignments" ON public.managed_account_assignments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ad spend" ON public.daily_ad_spend
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own invoices" ON public.commission_invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own billing history" ON public.billing_mode_history
    FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (requires admin role check)
CREATE POLICY "Admins can view all assignments" ON public.managed_account_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all ad spend" ON public.daily_ad_spend
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all invoices" ON public.commission_invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- =====================================================

-- Uncomment to insert sample data:
/*
INSERT INTO public.managed_accounts (account_id, account_name, status, trust_score)
VALUES 
    ('123-456-7890', 'Furriyadh Premium Account 1', 'available', 100),
    ('234-567-8901', 'Furriyadh Premium Account 2', 'available', 95),
    ('345-678-9012', 'Furriyadh Premium Account 3', 'available', 90);
*/

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.managed_account_assignments IS 'Tracks which Furriyadh-managed account is assigned to which user';
COMMENT ON TABLE public.daily_ad_spend IS 'Daily ad spend tracking for commission calculations';
COMMENT ON TABLE public.commission_invoices IS 'Monthly commission invoices for Furriyadh-managed users';
COMMENT ON TABLE public.billing_mode_history IS 'History of billing mode changes (self_managed ↔ furriyadh_managed)';
COMMENT ON TABLE public.admin_billing_dashboard IS 'Pre-calculated aggregates for admin dashboard';
COMMENT ON TABLE public.commission_rates IS 'Commission rate configurations';

COMMENT ON COLUMN public.user_billing_subscriptions.billing_mode IS 'self_managed = user''s own accounts, furriyadh_managed = Furriyadh manages accounts (20% commission)';
