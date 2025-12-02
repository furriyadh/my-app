-- =====================================================
-- جداول تخزين بيانات Dashboard لكل عميل
-- يحفظ البيانات من Google Ads API لتجنب استدعاء API في كل مرة
-- يدعم جميع الفترات الزمنية: Today, Yesterday, Last 7/30/60/90 days,
-- This Month, Last Month, This Quarter, Last Quarter, This Year, Last Year
-- =====================================================

-- جدول البيانات لكل حساب إعلاني منفصل
CREATE TABLE IF NOT EXISTS dashboard_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  customer_id TEXT NOT NULL,
  
  -- الفترة الزمنية (تاريخ البداية والنهاية)
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- تسمية الفترة الزمنية (اختياري للتعريف السريع)
  date_range_label TEXT, -- 'Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Last 60 days', 'Last 90 days', 'This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year', 'Custom'
  
  -- Device Performance
  device_performance JSONB DEFAULT '[]'::jsonb,
  
  -- Audience Data
  audience_gender JSONB DEFAULT '[]'::jsonb,
  audience_age JSONB DEFAULT '[]'::jsonb,
  
  -- Competition & Keywords
  competition_data JSONB DEFAULT '[]'::jsonb,
  keyword_performance JSONB DEFAULT '[]'::jsonb,
  
  -- Hourly Performance
  hourly_performance JSONB DEFAULT '[]'::jsonb,
  
  -- Optimization Score
  optimization_score INTEGER,
  
  -- Search Terms
  search_terms JSONB DEFAULT '[]'::jsonb,
  
  -- Ad Strength
  ad_strength JSONB DEFAULT '{"distribution": {"excellent": 0, "good": 0, "average": 0, "poor": 0}, "details": []}'::jsonb,
  
  -- Landing Pages
  landing_pages JSONB DEFAULT '[]'::jsonb,
  
  -- Budget Recommendations
  budget_recommendations JSONB DEFAULT '[]'::jsonb,
  
  -- Auction Insights
  auction_insights JSONB DEFAULT '[]'::jsonb,
  
  -- Location Data
  location_data JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: كل مستخدم + حساب + فترة زمنية
  UNIQUE(user_id, customer_id, start_date, end_date)
);

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_user_id ON dashboard_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_customer_id ON dashboard_insights(customer_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_dates ON dashboard_insights(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_updated ON dashboard_insights(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_label ON dashboard_insights(date_range_label);

-- =====================================================
-- جدول مجمع لكل المستخدمين (للعرض السريع في Dashboard)
-- يحتوي على بيانات مجمعة من جميع الحسابات المرتبطة
-- =====================================================
CREATE TABLE IF NOT EXISTS dashboard_aggregated (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  
  -- الفترة الزمنية (تاريخ البداية والنهاية)
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- تسمية الفترة الزمنية
  -- القيم المدعومة:
  -- 'Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Last 60 days', 'Last 90 days',
  -- 'This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year', 'Custom'
  date_range_label TEXT,
  
  -- البيانات المجمعة من جميع الحسابات
  device_performance JSONB DEFAULT '[]'::jsonb,
  audience_gender JSONB DEFAULT '[]'::jsonb,
  audience_age JSONB DEFAULT '[]'::jsonb,
  competition_data JSONB DEFAULT '[]'::jsonb,
  keyword_performance JSONB DEFAULT '[]'::jsonb,
  hourly_performance JSONB DEFAULT '[]'::jsonb,
  optimization_score INTEGER,
  search_terms JSONB DEFAULT '[]'::jsonb,
  ad_strength JSONB DEFAULT '{"distribution": {"excellent": 0, "good": 0, "average": 0, "poor": 0}, "details": []}'::jsonb,
  landing_pages JSONB DEFAULT '[]'::jsonb,
  budget_recommendations JSONB DEFAULT '[]'::jsonb,
  auction_insights JSONB DEFAULT '[]'::jsonb,
  location_data JSONB DEFAULT '[]'::jsonb,
  
  -- عدد الحسابات المرتبطة
  connected_accounts_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id, start_date, end_date)
);

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_dashboard_aggregated_user_id ON dashboard_aggregated(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_aggregated_dates ON dashboard_aggregated(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_dashboard_aggregated_updated ON dashboard_aggregated(updated_at DESC);

-- Function لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_dashboard_insights_updated_at ON dashboard_insights;
CREATE TRIGGER update_dashboard_insights_updated_at
    BEFORE UPDATE ON dashboard_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_aggregated_updated_at ON dashboard_aggregated;
CREATE TRIGGER update_dashboard_aggregated_updated_at
    BEFORE UPDATE ON dashboard_aggregated
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE dashboard_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_aggregated ENABLE ROW LEVEL SECURITY;

-- سياسة: كل مستخدم يرى بياناته فقط
CREATE POLICY "Users can view own dashboard_insights" ON dashboard_insights
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own dashboard_insights" ON dashboard_insights
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own dashboard_insights" ON dashboard_insights
    FOR UPDATE USING (true);

CREATE POLICY "Users can view own dashboard_aggregated" ON dashboard_aggregated
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own dashboard_aggregated" ON dashboard_aggregated
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own dashboard_aggregated" ON dashboard_aggregated
    FOR UPDATE USING (true);

