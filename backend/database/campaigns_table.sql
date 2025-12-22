-- =================================================== 
-- Campaigns Table Schema for Supabase
-- Purpose: Store all campaign data with Google Ads integration
-- =================================================== 

-- Drop table if exists (for fresh installation)
-- DROP TABLE IF EXISTS campaigns CASCADE;

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    google_campaign_id VARCHAR(100),
    
    -- Website and contact
    website_url TEXT,
    phone_number VARCHAR(50),
    
    -- Budget
    daily_budget DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Targeting
    target_locations JSONB,
    target_languages JSONB,
    
    -- Analysis and content
    website_analysis JSONB,
    cpc_data JSONB,
    generated_content JSONB,
    google_campaign_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT campaigns_name_check CHECK (char_length(name) >= 1),
    CONSTRAINT campaigns_budget_check CHECK (daily_budget > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_google_campaign_id ON campaigns(google_campaign_id);

-- Enable Row Level Security (RLS)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR SELECT USING (auth.uid()::TEXT = user_id);

-- RLS Policy: Users can create their own campaigns
CREATE POLICY "Users can create own campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

-- RLS Policy: Users can update their own campaigns
CREATE POLICY "Users can update own campaigns" ON campaigns
    FOR UPDATE USING (auth.uid()::TEXT = user_id);

-- RLS Policy: Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns" ON campaigns
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER campaigns_updated_at_trigger
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_campaigns_updated_at();

-- =================================================== 
-- Sample Query Examples
-- =================================================== 

-- Get all campaigns for a user
-- SELECT * FROM campaigns WHERE user_id = 'user_id_here' ORDER BY created_at DESC;

-- Get active campaigns only
-- SELECT * FROM campaigns WHERE user_id = 'user_id_here' AND status = 'ACTIVE';

-- Get campaigns by type
-- SELECT * FROM campaigns WHERE campaign_type = 'SEARCH' ORDER BY created_at DESC;

-- Get campaigns with Google Ads integration
-- SELECT * FROM campaigns WHERE google_campaign_id IS NOT NULL;

-- Get campaigns with budget range
-- SELECT * FROM campaigns WHERE daily_budget BETWEEN 10 AND 100;

-- =================================================== 
-- Notes
-- ===================================================
-- 1. Make sure to run this SQL in your Supabase SQL Editor
-- 2. The table uses JSONB for flexible data storage (analysis, content, etc.)
-- 3. RLS policies ensure users can only access their own campaigns
-- 4. Indexes improve query performance for common searches
-- 5. Auto-update trigger keeps updated_at timestamp current

