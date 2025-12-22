-- =================================================== 
-- Supabase Database Schema for Google Ads Integration
-- Domain: furriyadh.com
-- Retention: 10 years
-- ===================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================== 


-- Table: client_requests
-- Purpose: Store client requests and OAuth data (10-year retention)
-- ===================================================
CREATE TABLE IF NOT EXISTS client_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) NOT NULL,
    request_type VARCHAR(50) NOT NULL DEFAULT 'link_request',
    account_name VARCHAR(255),
    oauth_data JSONB,
    link_details JSONB,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 years'),
    
    -- Add indexes for better performance
    CONSTRAINT unique_customer_request UNIQUE(customer_id, request_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_requests_customer_id ON client_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_created_at ON client_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_client_requests_expires_at ON client_requests(expires_at);

-- =================================================== 
-- Table: oauth_sessions
-- Purpose: Store OAuth session data (10-year retention)
-- ===================================================
CREATE TABLE IF NOT EXISTS oauth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) NOT NULL,
    access_token_hash VARCHAR(255), -- Store hash for security
    refresh_token_hash VARCHAR(255), -- Store hash for security
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    user_info JSONB,
    session_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 years'),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Add constraint
    CONSTRAINT unique_customer_session UNIQUE(customer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_customer_id ON oauth_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_is_active ON oauth_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires_at ON oauth_sessions(expires_at);

-- =================================================== 
-- Table: link_status_history
-- Purpose: Track link status changes over time
-- ===================================================
CREATE TABLE IF NOT EXISTS link_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    status_details JSONB,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by VARCHAR(100) DEFAULT 'system',
    
    -- Foreign key reference
    FOREIGN KEY (customer_id) REFERENCES client_requests(customer_id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_link_status_history_customer_id ON link_status_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_link_status_history_changed_at ON link_status_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_link_status_history_new_status ON link_status_history(new_status);

-- =================================================== 
-- Table: google_ads_accounts
-- Purpose: Cache Google Ads account information
-- ===================================================
CREATE TABLE IF NOT EXISTS google_ads_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) NOT NULL UNIQUE,
    account_name VARCHAR(255),
    account_status VARCHAR(50),
    account_type VARCHAR(50),
    currency_code VARCHAR(10),
    time_zone VARCHAR(100),
    is_test_account BOOLEAN DEFAULT FALSE,
    is_manager BOOLEAN DEFAULT FALSE,
    manager_customer_id VARCHAR(50),
    account_details JSONB,
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_google_ads_accounts_customer_id ON google_ads_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_accounts_status ON google_ads_accounts(account_status);
CREATE INDEX IF NOT EXISTS idx_google_ads_accounts_last_sync ON google_ads_accounts(last_sync_at);

-- =================================================== 
-- Functions and Triggers
-- ===================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_client_requests_updated_at 
    BEFORE UPDATE ON client_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_sessions_updated_at 
    BEFORE UPDATE ON oauth_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_ads_accounts_updated_at 
    BEFORE UPDATE ON google_ads_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO link_status_history (customer_id, old_status, new_status, status_details)
        VALUES (NEW.customer_id, OLD.status, NEW.status, 
                jsonb_build_object('changed_at', NOW(), 'trigger', 'auto'));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for status change logging
CREATE TRIGGER log_client_request_status_change
    AFTER UPDATE ON client_requests
    FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- =================================================== 
-- Row Level Security (RLS) Policies
-- ===================================================

-- Enable RLS on all tables
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for client_requests
CREATE POLICY "Users can view their own requests" ON client_requests
    FOR SELECT USING (auth.uid()::text = customer_id OR auth.role() = 'service_role');

CREATE POLICY "Users can insert their own requests" ON client_requests
    FOR INSERT WITH CHECK (auth.uid()::text = customer_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own requests" ON client_requests
    FOR UPDATE USING (auth.uid()::text = customer_id OR auth.role() = 'service_role');

-- Policies for oauth_sessions
CREATE POLICY "Users can view their own sessions" ON oauth_sessions
    FOR SELECT USING (auth.uid()::text = customer_id OR auth.role() = 'service_role');

CREATE POLICY "Users can manage their own sessions" ON oauth_sessions
    FOR ALL USING (auth.uid()::text = customer_id OR auth.role() = 'service_role');

-- Policies for link_status_history
CREATE POLICY "Users can view their own history" ON link_status_history
    FOR SELECT USING (auth.uid()::text = customer_id OR auth.role() = 'service_role');

-- Policies for google_ads_accounts
CREATE POLICY "Users can view their own accounts" ON google_ads_accounts
    FOR SELECT USING (auth.uid()::text = customer_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage all accounts" ON google_ads_accounts
    FOR ALL USING (auth.role() = 'service_role');

-- =================================================== 
-- Views for easier data access
-- ===================================================

-- View: Active client requests with latest status
CREATE OR REPLACE VIEW active_client_requests AS
SELECT 
    cr.*,
    lsh.new_status as latest_status,
    lsh.changed_at as status_changed_at
FROM client_requests cr
LEFT JOIN LATERAL (
    SELECT new_status, changed_at
    FROM link_status_history 
    WHERE customer_id = cr.customer_id 
    ORDER BY changed_at DESC 
    LIMIT 1
) lsh ON true
WHERE cr.expires_at > NOW()
AND cr.status != 'CANCELLED';

-- View: Account summary with link status
CREATE OR REPLACE VIEW account_summary AS
SELECT 
    gaa.customer_id,
    gaa.account_name,
    gaa.account_status,
    gaa.account_type,
    gaa.is_test_account,
    gaa.is_manager,
    cr.status as link_status,
    cr.created_at as link_requested_at,
    cr.updated_at as link_updated_at,
    os.is_active as session_active,
    os.token_expires_at
FROM google_ads_accounts gaa
LEFT JOIN client_requests cr ON gaa.customer_id = cr.customer_id
LEFT JOIN oauth_sessions os ON gaa.customer_id = os.customer_id;

-- =================================================== 
-- Cleanup Functions
-- ===================================================

-- Function to cleanup expired records
CREATE OR REPLACE FUNCTION cleanup_expired_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete expired client requests
    DELETE FROM client_requests WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete expired oauth sessions
    DELETE FROM oauth_sessions WHERE expires_at < NOW();
    
    -- Delete old status history (keep only last 2 years)
    DELETE FROM link_status_history WHERE changed_at < (NOW() - INTERVAL '2 years');
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =================================================== 
-- Comments for documentation
-- ===================================================

COMMENT ON TABLE client_requests IS 'Stores client requests for Google Ads account linking with 10-year retention';
COMMENT ON TABLE oauth_sessions IS 'Stores OAuth session data with 10-year retention for furriyadh.com';
COMMENT ON TABLE link_status_history IS 'Tracks all status changes for audit purposes';
COMMENT ON TABLE google_ads_accounts IS 'Cached Google Ads account information for performance';

COMMENT ON COLUMN client_requests.customer_id IS 'Google Ads Customer ID';
COMMENT ON COLUMN client_requests.oauth_data IS 'OAuth tokens and user data (unencrypted as requested)';
COMMENT ON COLUMN client_requests.link_details IS 'Details about the linking process and status';
COMMENT ON COLUMN client_requests.expires_at IS 'Record expiration date (10 years from creation)';

-- =================================================== 
-- Initial Setup Complete
-- ===================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant full access to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
