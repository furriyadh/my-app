-- Campaign Budgets Table
CREATE TABLE IF NOT EXISTS campaign_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    daily_budget DECIMAL(10, 2) NOT NULL,
    total_budget DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Budget Schedules Table
CREATE TABLE IF NOT EXISTS budget_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_id UUID NOT NULL REFERENCES campaign_budgets(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    budget_multiplier DECIMAL(3, 1) NOT NULL DEFAULT 1.0,
    estimated_spend DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_campaign_budgets_user_id ON campaign_budgets(user_id);
CREATE INDEX idx_budget_schedules_budget_id ON budget_schedules(budget_id);
CREATE INDEX idx_budget_schedules_day_of_week ON budget_schedules(day_of_week);

-- RLS Policies
ALTER TABLE campaign_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_schedules ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own budgets
CREATE POLICY "Users can view own budgets" ON campaign_budgets
    FOR SELECT USING (auth.uid()::TEXT = user_id);

-- Allow users to insert their own budgets
CREATE POLICY "Users can create own budgets" ON campaign_budgets
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

-- Allow users to update their own budgets
CREATE POLICY "Users can update own budgets" ON campaign_budgets
    FOR UPDATE USING (auth.uid()::TEXT = user_id);

-- Allow users to delete their own budgets
CREATE POLICY "Users can delete own budgets" ON campaign_budgets
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- Budget schedules inherit permissions from campaign_budgets
CREATE POLICY "Users can view budget schedules" ON budget_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaign_budgets 
            WHERE campaign_budgets.id = budget_schedules.budget_id 
            AND campaign_budgets.user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY "Users can create budget schedules" ON budget_schedules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM campaign_budgets 
            WHERE campaign_budgets.id = budget_schedules.budget_id 
            AND campaign_budgets.user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY "Users can update budget schedules" ON budget_schedules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM campaign_budgets 
            WHERE campaign_budgets.id = budget_schedules.budget_id 
            AND campaign_budgets.user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY "Users can delete budget schedules" ON budget_schedules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM campaign_budgets 
            WHERE campaign_budgets.id = budget_schedules.budget_id 
            AND campaign_budgets.user_id = auth.uid()::TEXT
        )
    );
