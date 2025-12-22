-- =====================================================
-- YouTube Channels Table Schema
-- جدول قنوات اليوتيوب
-- =====================================================
-- يخزن بيانات قنوات اليوتيوب المتصلة لكل مستخدم
-- كل مستخدم له بياناته الخاصة (Row Level Security)

CREATE TABLE IF NOT EXISTS youtube_channels (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Reference (كل مستخدم له قنواته الخاصة)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- YouTube Channel Data
    channel_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    custom_url TEXT,
    
    -- Channel Statistics
    subscriber_count BIGINT DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    
    -- Linking Status (حالة الربط مع Google Ads)
    is_linked BOOLEAN DEFAULT FALSE,
    linked_ad_account_id TEXT,
    link_resource_name TEXT, -- Resource name from Google Ads API
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: each user can have a channel only once
    CONSTRAINT unique_user_channel UNIQUE (user_id, channel_id)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_youtube_channels_user_id ON youtube_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_channels_channel_id ON youtube_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_channels_is_linked ON youtube_channels(is_linked);

-- =====================================================
-- Row Level Security (RLS)
-- كل مستخدم يرى بياناته فقط
-- =====================================================
ALTER TABLE youtube_channels ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own channels
CREATE POLICY "Users can view own channels" ON youtube_channels
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own channels
CREATE POLICY "Users can insert own channels" ON youtube_channels
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own channels
CREATE POLICY "Users can update own channels" ON youtube_channels
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own channels
CREATE POLICY "Users can delete own channels" ON youtube_channels
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Trigger for auto-updating updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_youtube_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_youtube_channels_updated_at
    BEFORE UPDATE ON youtube_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_youtube_channels_updated_at();

-- =====================================================
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE youtube_channels IS 'جدول قنوات اليوتيوب المتصلة لكل مستخدم';
COMMENT ON COLUMN youtube_channels.user_id IS 'معرف المستخدم - كل مستخدم له بياناته الخاصة';
COMMENT ON COLUMN youtube_channels.channel_id IS 'معرف قناة اليوتيوب الفريد';
COMMENT ON COLUMN youtube_channels.is_linked IS 'هل القناة مربوطة بحساب إعلاني؟';
COMMENT ON COLUMN youtube_channels.linked_ad_account_id IS 'معرف حساب Google Ads المرتبط';
COMMENT ON COLUMN youtube_channels.link_resource_name IS 'اسم المورد من Google Ads API';
