-- Create user_payment_methods table for storing saved payment methods
-- This table stores credit cards and PayPal accounts for auto-renewal

CREATE TABLE IF NOT EXISTS user_payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    
    -- Payment method type
    type TEXT NOT NULL CHECK (type IN ('card', 'paypal')),
    
    -- Card details (for type = 'card')
    brand TEXT, -- visa, mastercard, amex, discover
    last4 TEXT,
    exp_month INTEGER,
    exp_year INTEGER,
    cardholder_name TEXT,
    
    -- PayPal details (for type = 'paypal')
    paypal_email TEXT,
    paypal_subscription_id TEXT, -- For PayPal subscriptions
    
    -- Settings
    is_default BOOLEAN DEFAULT FALSE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_email ON user_payment_methods(user_email);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON user_payment_methods(user_id);

-- Enable RLS
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own payment methods"
    ON user_payment_methods FOR SELECT
    USING (auth.email() = user_email OR auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
    ON user_payment_methods FOR INSERT
    WITH CHECK (auth.email() = user_email OR auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
    ON user_payment_methods FOR UPDATE
    USING (auth.email() = user_email OR auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
    ON user_payment_methods FOR DELETE
    USING (auth.email() = user_email OR auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_method_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON user_payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_method_updated_at();

-- Add comment
COMMENT ON TABLE user_payment_methods IS 'Stores saved payment methods (cards, PayPal) for subscription auto-renewal';
