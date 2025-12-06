// API to fetch AI Insights from Google Ads (Devices, Audience, Competition, Budget Simulator)
// يدعم التخزين في Supabase لتقليل استدعاءات API وتسريع العرض
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// إنشاء Supabase client
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
};

// ==================== دوال التخزين في Supabase ====================

// جلب البيانات المخزنة من Supabase
async function getCachedInsights(userId: string, startDate: string, endDate: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('dashboard_aggregated')
      .select('*')
      .eq('user_id', userId)
      .eq('start_date', startDate)
      .eq('end_date', endDate)
      .single();
    
    if (error || !data) {
      console.log(`📭 No cached data for ${userId} (${startDate} to ${endDate})`);
      return null;
    }
    
    // التحقق من أن البيانات ليست قديمة جداً (أقل من 6 ساعات)
    const lastSynced = new Date(data.last_synced_at);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - lastSynced.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync > 6) {
      console.log(`⏰ Cached data is stale (${hoursSinceSync.toFixed(1)} hours old)`);
      return null;
    }
    
    console.log(`✅ Found cached data for ${userId} (synced ${hoursSinceSync.toFixed(1)} hours ago)`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching cached insights:', error);
    return null;
  }
}

// حفظ البيانات في Supabase
async function saveInsightsToCache(
  userId: string,
  userEmail: string,
  startDate: string,
  endDate: string,
  dateRangeLabel: string,
  insights: any,
  connectedAccountsCount: number
) {
  try {
    const supabase = getSupabaseAdmin();
    
    const dataToSave = {
      user_id: userId,
      user_email: userEmail,
      start_date: startDate,
      end_date: endDate,
      date_range_label: dateRangeLabel,
      device_performance: insights.device_performance || [],
      audience_gender: insights.audience_data?.gender || [],
      audience_age: insights.audience_data?.age || [],
      competition_data: insights.competition_data?.impression_share || [],
      keyword_performance: insights.competition_data?.keywords || [],
      hourly_performance: insights.hourly_data || [],
      optimization_score: insights.optimization_score,
      search_terms: insights.search_terms || [],
      ad_strength: insights.ad_strength || { distribution: { excellent: 0, good: 0, average: 0, poor: 0 }, details: [] },
      landing_pages: insights.landing_pages || [],
      budget_recommendations: insights.budget_recommendations || [],
      auction_insights: insights.auction_insights || [],
      location_data: insights.location_data || [],
      connected_accounts_count: connectedAccountsCount,
      last_synced_at: new Date().toISOString()
    };
    
    // Upsert - إدراج أو تحديث
    const { error } = await supabase
      .from('dashboard_aggregated')
      .upsert(dataToSave, {
        onConflict: 'user_id,start_date,end_date'
      });
    
    if (error) {
      console.error('❌ Error saving insights to cache:', error);
      return false;
    }
    
    console.log(`💾 Saved insights to cache for ${userId} (${startDate} to ${endDate})`);
    return true;
  } catch (error) {
    console.error('❌ Exception saving insights:', error);
    return false;
  }
}

// تحويل البيانات المخزنة إلى صيغة الـ API response
function formatCachedData(cachedData: any) {
  return {
    success: true,
    fromCache: true,
    lastSyncedAt: cachedData.last_synced_at,
    device_performance: cachedData.device_performance || [],
    audience_data: {
      age: cachedData.audience_age || [],
      gender: cachedData.audience_gender || []
    },
    competition_data: {
      impression_share: cachedData.competition_data || [],
      keywords: cachedData.keyword_performance || []
    },
    location_data: cachedData.location_data || [],
    hourly_data: cachedData.hourly_performance || [],
    optimization_score: cachedData.optimization_score,
    search_terms: cachedData.search_terms || [],
    ad_strength: cachedData.ad_strength || { distribution: { excellent: 0, good: 0, average: 0, poor: 0 }, details: [] },
    landing_pages: cachedData.landing_pages || [],
    budget_recommendations: cachedData.budget_recommendations || [],
    auction_insights: cachedData.auction_insights || []
  };
}

// ==================== نهاية دوال التخزين ====================

// دالة لجلب الحسابات المرتبطة من Supabase
async function getConnectedAccounts(userId: string, userEmail?: string): Promise<string[]> {
  try {
    const supabase = getSupabaseAdmin();
    
    console.log(`🔍 Searching connected accounts: userId=${userId}, email=${userEmail}`);
    
    // جلب جميع الحسابات للمستخدم بالـ user_id أولاً
    let { data: allData, error } = await supabase
      .from('client_requests')
      .select('customer_id, status, link_details, user_email')
      .eq('user_id', userId);
    
    if (error) {
      console.error('❌ خطأ في جلب الحسابات بالـ user_id:', error);
    }
    
    // إذا لم نجد بالـ user_id، نبحث بالـ email
    if ((!allData || allData.length === 0) && userEmail) {
      console.log(`🔍 No accounts by user_id, trying email: ${userEmail}`);
      const { data: emailData, error: emailError } = await supabase
        .from('client_requests')
        .select('customer_id, status, link_details, user_email')
        .eq('user_email', userEmail);
      
      if (!emailError && emailData) {
        allData = emailData;
      }
    }
    
    console.log(`📊 Total accounts in DB: ${allData?.length || 0}`);
    
    if (!allData || allData.length === 0) {
      return [];
    }
    
    // فلترة الحسابات المرتبطة (Connected) - نفس المنطق في صفحة الحسابات
    // نضيف ENABLED لأن بعض الحسابات تُحفظ بهذه الحالة من Google Ads API
    const connectedStatuses = ['ACTIVE', 'ENABLED', 'DISABLED', 'SUSPENDED', 'CUSTOMER_NOT_ENABLED', 'PENDING'];
    const connectedAccounts = allData.filter(row => {
      if (!row.customer_id) return false;
      
      console.log(`🔍 Checking account ${row.customer_id}: status=${row.status}, link_details=${JSON.stringify(row.link_details)}`);
      
      // التحقق من الحالة المباشرة
      if (connectedStatuses.includes(row.status)) {
        console.log(`✅ Account ${row.customer_id} connected via status: ${row.status}`);
        return true;
      }
      
      // التحقق من link_details
      const linkDetails = row.link_details as any;
      if (linkDetails) {
        if (linkDetails.link_status === 'ACTIVE' || linkDetails.verified === true || linkDetails.status === 'ACTIVE') {
          console.log(`✅ Account ${row.customer_id} connected via link_details`);
          return true;
        }
      }
      
      // إذا لم يكن هناك status محدد لكن الحساب موجود، نعتبره متصل
      if (!row.status && row.customer_id) {
        console.log(`✅ Account ${row.customer_id} connected (no status, assuming connected)`);
        return true;
      }
      
      return false;
    });
    
    const uniqueIds = [...new Set(connectedAccounts.map(row => row.customer_id).filter(Boolean))];
    console.log(`✅ Connected accounts: ${uniqueIds.length}`, uniqueIds);
    return uniqueIds;
  } catch (error) {
    console.error('❌ خطأ في getConnectedAccounts:', error);
    return [];
  }
}

// دالة لتجديد access token
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('❌ Missing OAuth credentials for token refresh');
      return null;
    }
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Token refresh failed:', response.status, errorText);
      return null;
    }
    const data = await response.json();
    console.log('✅ Token refreshed successfully');
    return data.access_token;
  } catch (error) {
    console.error('❌ خطأ في تجديد التوكن:', error);
    return null;
  }
}

// Helper function for Google Ads API calls
async function googleAdsQuery(customerId: string, accessToken: string, developerToken: string, query: string) {
  try {
    const response = await fetch(
      `https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
          'login-customer-id': (process.env.MCC_LOGIN_CUSTOMER_ID || process.env.GOOGLE_ADS_MCC_ID || '').replace(/-/g, '')
        },
        body: JSON.stringify({ query })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Google Ads API Error for ${customerId}:`, response.status, errorText.substring(0, 200));
      return [];
    }
    
    const data = await response.json();
    console.log(`✅ Query success for ${customerId}: ${data.results?.length || 0} results`);
    return data.results || [];
  } catch (error) {
    console.error(`❌ Exception in googleAdsQuery for ${customerId}:`, error);
    return [];
  }
}

// 1. جلب بيانات الأجهزة (Device Performance)
async function fetchDevicePerformance(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  // نجلب كل الحملات بغض النظر عن حالتها للحصول على البيانات التاريخية
  const query = `
    SELECT
      segments.device,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM campaign
    WHERE ${dateCondition}
  `;
  console.log(`📱 Device Performance Query for ${customerId}:`, query.replace(/\s+/g, ' ').trim());
  const results = await googleAdsQuery(customerId, accessToken, developerToken, query);
  console.log(`📱 Device Performance Results for ${customerId}:`, JSON.stringify(results).slice(0, 500));
  return results;
}

// 2. جلب بيانات الجمهور (Age & Gender)
async function fetchAudienceData(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  // Age Range Data
  const ageQuery = `
    SELECT
      ad_group_criterion.age_range.type,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM age_range_view
    WHERE ${dateCondition}
  `;
  
  // Gender Data
  const genderQuery = `
    SELECT
      ad_group_criterion.gender.type,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM gender_view
    WHERE ${dateCondition}
  `;
  
  const [ageResults, genderResults] = await Promise.all([
    googleAdsQuery(customerId, accessToken, developerToken, ageQuery),
    googleAdsQuery(customerId, accessToken, developerToken, genderQuery)
  ]);
  
  return { ageResults, genderResults };
}

// 3. جلب بيانات المنافسة (Competition/Auction Insights)
async function fetchCompetitionData(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  // نجلب كل الحملات للحصول على البيانات التاريخية
  const query = `
    SELECT
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM campaign
    WHERE ${dateCondition}
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 4. جلب بيانات الكلمات المفتاحية للمنافسة
async function fetchKeywordCompetition(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  const query = `
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros
    FROM keyword_view
    WHERE ${dateCondition}
    ORDER BY metrics.impressions DESC
    LIMIT 20
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 5. جلب بيانات المواقع الجغرافية
async function fetchLocationData(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  const query = `
    SELECT
      geographic_view.country_criterion_id,
      geographic_view.location_type,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM geographic_view
    WHERE ${dateCondition}
    ORDER BY metrics.impressions DESC
    LIMIT 10
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 6. جلب بيانات الساعات (Hour of Day Performance)
async function fetchHourlyData(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_7_DAYS') {
  const query = `
    SELECT
      segments.hour,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM campaign
    WHERE ${dateCondition}
      AND campaign.status = ENABLED
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 7. جلب نقاط التحسين (Optimization Score) - من أداء الحملات
async function fetchOptimizationScore(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  const query = `
    SELECT
      campaign.name,
      metrics.clicks,
      metrics.impressions,
      metrics.conversions,
      metrics.cost_micros
    FROM campaign
    WHERE ${dateCondition}
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 8. جلب تقرير مصطلحات البحث (Search Terms Report) - من الكلمات المفتاحية
async function fetchSearchTerms(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  const query = `
    SELECT
      ad_group_criterion.keyword.text,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM keyword_view
    WHERE ${dateCondition}
    ORDER BY metrics.clicks DESC
    LIMIT 15
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 9. جلب قوة الإعلانات (Ad Strength) - من الإعلانات النشطة
async function fetchAdStrength(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  const query = `
    SELECT
      segments.date,
      ad_group_ad.ad.responsive_search_ad.strength,
      ad_group_ad.ad.expanded_text_ad.strength,
      ad_group_ad.ad.final_urls,
      ad_group_ad.ad.type,
      ad_group.name,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM ad_group_ad
    WHERE ad_group_ad.status = ENABLED
      AND campaign.status = ENABLED
      AND ${dateCondition}
  `;
  console.log(`💪 Ad Strength Query for ${customerId}:`, query.replace(/\s+/g, ' ').trim());
  const results = await googleAdsQuery(customerId, accessToken, developerToken, query);
  console.log(`💪 Ad Strength Results for ${customerId}:`, results.length, 'rows');
  return results;
}

// 10. جلب أداء الصفحات المقصودة (Landing Page Experience) - من final URLs
async function fetchLandingPageExperience(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  const query = `
    SELECT
      ad_group_ad.ad.final_urls,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM ad_group_ad
    WHERE ${dateCondition}
    ORDER BY metrics.clicks DESC
    LIMIT 10
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 11. جلب توصيات الميزانية (Budget Recommendations) - من الحملات
async function fetchBudgetRecommendations(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  const query = `
    SELECT
      campaign.name,
      campaign_budget.amount_micros,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions
    FROM campaign
    WHERE ${dateCondition}
    ORDER BY metrics.cost_micros DESC
    LIMIT 10
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 12. جلب رؤى المزادات (Auction Insights) - من حملات البحث
async function fetchAuctionInsights(customerId: string, accessToken: string, developerToken: string, dateCondition: string = 'segments.date DURING LAST_30_DAYS') {
  const query = `
    SELECT
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM campaign
    WHERE ${dateCondition}
    ORDER BY metrics.impressions DESC
    LIMIT 10
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

export async function GET(request: NextRequest) {
  console.log('🚀 AI Insights API called');
  
  try {
    // جلب التواريخ من الـ query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const forceRefresh = searchParams.get('refresh') === 'true'; // إجبار التحديث من Google Ads
    const dateRangeLabel = searchParams.get('label') || 'Custom';
    
    console.log(`📅 AI Insights Request: startDate=${startDate}, endDate=${endDate}, forceRefresh=${forceRefresh}`);
    
    // جلب معلومات المستخدم و OAuth tokens من cookies (Google OAuth)
    const cookieStore = await cookies();
    const oauthUserInfoCookie = cookieStore.get('oauth_user_info')?.value;
    const oauthAccessToken = cookieStore.get('oauth_access_token')?.value;
    const oauthRefreshToken = cookieStore.get('oauth_refresh_token')?.value;
    
    console.log('🔑 Cookies check:', {
      hasUserInfo: !!oauthUserInfoCookie,
      hasAccessToken: !!oauthAccessToken,
      hasRefreshToken: !!oauthRefreshToken
    });
    
    // استخراج معلومات المستخدم أولاً للتحقق من الـ cache
    let userId = '';
    let userEmail = '';
    
    if (oauthUserInfoCookie) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(oauthUserInfoCookie));
        userId = userInfo.id || '';
        userEmail = userInfo.email || '';
      } catch (e) {
        console.error('❌ Error parsing oauth_user_info:', e);
      }
    }
    
    // ==================== جلب من الـ Cache أولاً ====================
    if (userId && startDate && endDate && !forceRefresh) {
      const cachedData = await getCachedInsights(userId, startDate, endDate);
      if (cachedData) {
        console.log('📦 Returning cached data');
        return NextResponse.json(formatCachedData(cachedData));
      }
    }
    // ==================== نهاية جلب الـ Cache ====================
    
    // بناء شرط التاريخ للـ query
    let dateCondition = 'segments.date DURING LAST_30_DAYS';
    if (startDate && endDate) {
      dateCondition = `segments.date BETWEEN '${startDate}' AND '${endDate}'`;
      console.log(`📅 AI Insights للفترة: ${startDate} إلى ${endDate}`);
    }
    
    console.log('👤 AI Insights - User:', { userId, userEmail });
    
    if (!userId || !oauthAccessToken) {
      console.log('❌ Not authenticated - missing userId or access token');
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    
    // جلب الحسابات المرتبطة من Supabase (بالـ user_id أو email)
    const connectedAccounts = await getConnectedAccounts(userId, userEmail);
    console.log(`📊 Found ${connectedAccounts.length} connected accounts:`, connectedAccounts);
    
    if (connectedAccounts.length === 0) {
      console.log('⚠️ No connected accounts found for AI Insights');
      return NextResponse.json({
        success: true,
        device_performance: [],
        audience_data: { age: [], gender: [] },
        competition_data: { impression_share: [], keywords: [] },
        location_data: [],
        hourly_data: [],
        optimization_score: null,
        search_terms: [],
        ad_strength: { distribution: { excellent: 0, good: 0, average: 0, poor: 0 }, details: [] },
        landing_pages: [],
        budget_recommendations: [],
        auction_insights: [],
        message: 'No connected accounts found'
      });
    }
    
    // ==================== استخدام MCC credentials بدلاً من user OAuth ====================
    // المستخدم قد يملك OAuth token لكن بدون صلاحيات MCC
    // لذلك نستخدم MCC refresh token من environment variables للوصول للبيانات
    const mccRefreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
    
    let accessToken: string | null = null;
    
    // أولاً: نحاول استخدام MCC refresh token (الأفضل للوصول لجميع الحسابات)
    if (mccRefreshToken) {
      console.log('🔑 Using MCC refresh token for API access...');
      const newToken = await refreshAccessToken(mccRefreshToken);
      if (newToken) {
        accessToken = newToken;
        console.log('✅ MCC Token refreshed successfully');
      }
    }
    
    // إذا فشل MCC token، نحاول user OAuth token كـ fallback
    if (!accessToken && oauthRefreshToken) {
      console.log('🔑 Falling back to user OAuth token...');
      const newToken = await refreshAccessToken(oauthRefreshToken);
      if (newToken) {
        accessToken = newToken;
        console.log('✅ User OAuth Token refreshed successfully');
      }
    }
    
    // إذا لم نحصل على أي token
    if (!accessToken) {
      console.error('❌ No valid access token available');
      return NextResponse.json({
        success: false,
        error: 'No valid access token',
        device_performance: [],
        audience_data: { age: [], gender: [] },
        competition_data: { impression_share: [], keywords: [] },
        location_data: [],
        hourly_data: [],
        optimization_score: null,
        search_terms: [],
        ad_strength: { distribution: { excellent: 0, good: 0, average: 0, poor: 0 }, details: [] },
        landing_pages: [],
        budget_recommendations: [],
        auction_insights: []
      });
    }
    // ==================== نهاية إعداد التوكن ====================
    
    // Initialize data containers
    const deviceData: Record<string, { impressions: number; clicks: number; conversions: number; cost: number; ctr: number }> = {};
    const ageData: Record<string, { impressions: number; clicks: number; conversions: number; cost: number }> = {};
    const genderData: Record<string, { impressions: number; clicks: number; conversions: number; cost: number }> = {};
    const competitionData: { campaign: string; impressionShare: number; topShare: number; absoluteTopShare: number; budgetLost: number; rankLost: number }[] = [];
    const keywordCompetition: { keyword: string; matchType: string; impressions: number; clicks: number; cpc: number; impressionShare: number; qualityScore: number }[] = [];
    const locationData: { locationId: string; type: string; impressions: number; clicks: number; conversions: number; cost: number }[] = [];
    const hourlyData: Record<number, { impressions: number; clicks: number; conversions: number; cost: number }> = {};
    
    // New data containers
    let optimizationScoreTotal = 0;
    let optimizationScoreCount = 0;
    const searchTermsData: { term: string; status: string; impressions: number; clicks: number; conversions: number; cost: number; ctr: number }[] = [];
    const adStrengthData: { strength: string; adType: string; url: string; adGroup: string; campaign: string; impressions: number; clicks: number; ctr: number }[] = [];
    const landingPagesData: { url: string; impressions: number; clicks: number; conversions: number; cost: number; mobileScore: number; speedScore: number }[] = [];
    const budgetRecsData: { campaign: string; currentBudget: number; recommendedBudget: number; estimatedClicksChange: number; estimatedCostChange: number }[] = [];
    const auctionInsightsData: { campaign: string; impressionShare: number; overlapRate: number; positionAboveRate: number; topImpressionPct: number; absoluteTopPct: number; outrankingShare: number }[] = [];
    
    // جلب البيانات من جميع الحسابات
    for (const customerId of connectedAccounts) {
      const cleanId = customerId.replace(/-/g, '');
      
      try {
        console.log(`🔄 Fetching data for account ${cleanId}...`);
        
        // 1. Device Performance
        const devices = await fetchDevicePerformance(cleanId, accessToken, developerToken, dateCondition);
        console.log(`📱 Device data for ${cleanId}: ${devices.length} rows`);
        for (const row of devices) {
          const device = row.segments?.device || 'UNKNOWN';
          if (!deviceData[device]) {
            deviceData[device] = { impressions: 0, clicks: 0, conversions: 0, cost: 0, ctr: 0 };
          }
          // تحويل القيم لأرقام صحيحة (Google Ads API يُرجع strings أحياناً)
          deviceData[device].impressions += parseInt(String(row.metrics?.impressions || 0), 10);
          deviceData[device].clicks += parseInt(String(row.metrics?.clicks || 0), 10);
          deviceData[device].conversions += parseFloat(String(row.metrics?.conversions || 0));
          deviceData[device].cost += parseInt(String(row.metrics?.costMicros || 0), 10) / 1000000;
        }
        
        // 2. Audience Data (Age & Gender)
        const { ageResults, genderResults } = await fetchAudienceData(cleanId, accessToken, developerToken, dateCondition);
        
        for (const row of ageResults) {
          const age = row.adGroupCriterion?.ageRange?.type || 'UNKNOWN';
          if (!ageData[age]) {
            ageData[age] = { impressions: 0, clicks: 0, conversions: 0, cost: 0 };
          }
          ageData[age].impressions += parseInt(String(row.metrics?.impressions || 0), 10);
          ageData[age].clicks += parseInt(String(row.metrics?.clicks || 0), 10);
          ageData[age].conversions += parseFloat(String(row.metrics?.conversions || 0));
          ageData[age].cost += parseInt(String(row.metrics?.costMicros || 0), 10) / 1000000;
        }
        
        for (const row of genderResults) {
          const gender = row.adGroupCriterion?.gender?.type || 'UNKNOWN';
          if (!genderData[gender]) {
            genderData[gender] = { impressions: 0, clicks: 0, conversions: 0, cost: 0 };
          }
          genderData[gender].impressions += parseInt(String(row.metrics?.impressions || 0), 10);
          genderData[gender].clicks += parseInt(String(row.metrics?.clicks || 0), 10);
          genderData[gender].conversions += parseFloat(String(row.metrics?.conversions || 0));
          genderData[gender].cost += parseInt(String(row.metrics?.costMicros || 0), 10) / 1000000;
        }
        
        // 3. Competition Data - نحسبها من أداء الحملات
        const competition = await fetchCompetitionData(cleanId, accessToken, developerToken, dateCondition);
        for (const row of competition) {
          const impressions = parseInt(String(row.metrics?.impressions || 0), 10);
          const clicks = parseInt(String(row.metrics?.clicks || 0), 10);
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          // نحسب مقاييس المنافسة التقريبية من الأداء
          competitionData.push({
            campaign: row.campaign?.name || 'Unknown',
            impressionShare: Math.min(100, 30 + ctr * 5),
            topShare: Math.min(100, 20 + ctr * 4),
            absoluteTopShare: Math.min(100, 10 + ctr * 3),
            budgetLost: Math.max(0, 20 - ctr * 2),
            rankLost: Math.max(0, 15 - ctr * 1.5)
          });
        }
        
        // 4. Keyword Competition
        const keywords = await fetchKeywordCompetition(cleanId, accessToken, developerToken, dateCondition);
        for (const row of keywords) {
          const impressions = parseInt(String(row.metrics?.impressions || 0), 10);
          const clicks = parseInt(String(row.metrics?.clicks || 0), 10);
          const cost = parseInt(String(row.metrics?.costMicros || 0), 10) / 1000000;
          keywordCompetition.push({
            keyword: row.adGroupCriterion?.keyword?.text || 'Unknown',
            matchType: row.adGroupCriterion?.keyword?.matchType || 'UNKNOWN',
            impressions,
            clicks,
            cpc: clicks > 0 ? cost / clicks : 0,
            impressionShare: 0,
            qualityScore: 0
          });
        }
        
        // 5. Location Data
        const locations = await fetchLocationData(cleanId, accessToken, developerToken, dateCondition);
        for (const row of locations) {
          locationData.push({
            locationId: row.geographicView?.countryCriterionId || 'Unknown',
            type: row.geographicView?.locationType || 'UNKNOWN',
            impressions: parseInt(String(row.metrics?.impressions || 0), 10),
            clicks: parseInt(String(row.metrics?.clicks || 0), 10),
            conversions: parseFloat(String(row.metrics?.conversions || 0)),
            cost: parseInt(String(row.metrics?.costMicros || 0), 10) / 1000000
          });
        }
        
        // 6. Hourly Data
        const hourly = await fetchHourlyData(cleanId, accessToken, developerToken, dateCondition);
        for (const row of hourly) {
          const hour = parseInt(String(row.segments?.hour || 0), 10);
          if (!hourlyData[hour]) {
            hourlyData[hour] = { impressions: 0, clicks: 0, conversions: 0, cost: 0 };
          }
          hourlyData[hour].impressions += parseInt(String(row.metrics?.impressions || 0), 10);
          hourlyData[hour].clicks += parseInt(String(row.metrics?.clicks || 0), 10);
          hourlyData[hour].conversions += parseFloat(String(row.metrics?.conversions || 0));
          hourlyData[hour].cost += parseInt(String(row.metrics?.costMicros || 0), 10) / 1000000;
        }
        
        // 7. Optimization Score - نحسبها من أداء الحملات
        const optScore = await fetchOptimizationScore(cleanId, accessToken, developerToken, dateCondition);
        console.log(`📊 Optimization Score data for ${customerId}:`, optScore.length, 'campaigns');
        let totalClicks = 0;
        let totalImpressions = 0;
        let totalConversions = 0;
        for (const row of optScore) {
          totalClicks += parseInt(String(row.metrics?.clicks || 0), 10);
          totalImpressions += parseInt(String(row.metrics?.impressions || 0), 10);
          totalConversions += parseFloat(String(row.metrics?.conversions || 0));
        }
        if (totalImpressions > 0) {
          const ctr = (totalClicks / totalImpressions) * 100;
          const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
          // نقاط التحسين = (CTR * 5) + (ConvRate * 10) + base 40
          const score = Math.min(100, Math.round(40 + (ctr * 5) + (convRate * 10)));
          optimizationScoreTotal += score;
          optimizationScoreCount++;
        }
        
        // 8. Search Terms (Keywords)
        const searchTerms = await fetchSearchTerms(cleanId, accessToken, developerToken, dateCondition);
        console.log(`🔍 Search Terms data for ${customerId}:`, searchTerms.length, 'keywords');
        for (const row of searchTerms) {
          const keyword = row.adGroupCriterion?.keyword?.text;
          if (keyword) {
            const clicks = parseInt(String(row.metrics?.clicks || 0), 10);
            const impressions = parseInt(String(row.metrics?.impressions || 0), 10);
            const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            searchTermsData.push({
              term: keyword,
              status: 'ENABLED',
              impressions,
              clicks,
              conversions: parseFloat(String(row.metrics?.conversions || 0)),
              cost: parseInt(String(row.metrics?.costMicros || 0), 10) / 1000000,
              ctr
            });
          }
        }
        
        // 9. Ad Strength - من Google Ads API الفعلي (نفس طريقة باقي الكروت)
        const adStrength = await fetchAdStrength(cleanId, accessToken, developerToken, dateCondition);
        console.log(`💪 Ad Strength data for ${customerId}:`, adStrength.length, 'rows');
        if (adStrength.length > 0) {
          console.log('💪 Sample Ad Strength row:', JSON.stringify(adStrength[0], null, 2));
        }
        
        // تجميع البيانات حسب Ad Strength (مثل Device Performance)
        const adStrengthMap: Record<string, { count: number; impressions: number; clicks: number; conversions: number }> = {};
        
        for (const row of adStrength) {
          const clicks = parseInt(String(row.metrics?.clicks || 0), 10);
          const impressions = parseInt(String(row.metrics?.impressions || 0), 10);
          const conversions = parseFloat(String(row.metrics?.conversions || 0));
          
          // جلب Ad Strength الفعلي من Google Ads API
          // القيم الممكنة: UNKNOWN, NONE, POOR, AVERAGE, GOOD, EXCELLENT
          let strength = row.adGroupAd?.ad?.responsiveSearchAd?.strength || 
                        row.adGroupAd?.ad?.expandedTextAd?.strength ||
                        'UNKNOWN';
          
          // إذا لم يكن متوفراً، نستخدم fallback بناءً على الأداء
          if (!strength || strength === 'UNKNOWN' || strength === 'NONE') {
            const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            if (clicks > 5 && ctr > 3) strength = 'EXCELLENT';
            else if (clicks > 2 && ctr > 1) strength = 'GOOD';
            else if (clicks > 0) strength = 'AVERAGE';
            else strength = 'POOR';
          }
          
          // تحويل NONE إلى POOR
          if (strength === 'NONE') strength = 'POOR';
          
          const strengthKey = strength.toUpperCase();
          
          // تجميع البيانات
          if (!adStrengthMap[strengthKey]) {
            adStrengthMap[strengthKey] = { count: 0, impressions: 0, clicks: 0, conversions: 0 };
          }
          adStrengthMap[strengthKey].count += 1;
          adStrengthMap[strengthKey].impressions += impressions;
          adStrengthMap[strengthKey].clicks += clicks;
          adStrengthMap[strengthKey].conversions += conversions;
          
          // حفظ التفاصيل أيضاً
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          adStrengthData.push({
            strength: strengthKey,
            adType: row.adGroupAd?.ad?.type || 'RESPONSIVE_SEARCH_AD',
            url: row.adGroupAd?.ad?.finalUrls?.[0] || '',
            adGroup: row.adGroup?.name || 'Unknown',
            campaign: row.campaign?.name || 'Unknown',
            impressions,
            clicks,
            ctr
          });
        }
        
        console.log(`💪 Ad Strength Map for ${customerId}:`, adStrengthMap);
        
        // 10. Landing Pages - من الإعلانات
        const landingPages = await fetchLandingPageExperience(cleanId, accessToken, developerToken, dateCondition);
        console.log(`📱 Landing Pages data for ${customerId}:`, landingPages.length, 'pages');
        for (const row of landingPages) {
          const url = row.adGroupAd?.ad?.finalUrls?.[0];
          if (url) {
            const clicks = parseInt(String(row.metrics?.clicks || 0), 10);
            const impressions = parseInt(String(row.metrics?.impressions || 0), 10);
            const conversions = parseFloat(String(row.metrics?.conversions || 0));
            const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            // نحسب نقاط السرعة بناءً على الأداء
            const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
            const speedScore = Math.min(100, Math.round(50 + (ctr * 5) + (convRate * 10)));
            landingPagesData.push({
              url,
              impressions,
              clicks,
              conversions,
              cost: parseInt(String(row.metrics?.costMicros || 0), 10) / 1000000,
              mobileScore: 0,
              speedScore
            });
          }
        }
        
        // 11. Budget Recommendations - من الحملات
        const budgetRecs = await fetchBudgetRecommendations(cleanId, accessToken, developerToken, dateCondition);
        console.log(`💰 Budget Recs data for ${customerId}:`, budgetRecs.length, 'campaigns');
        for (const row of budgetRecs) {
          const currentBudget = parseInt(String(row.campaignBudget?.amountMicros || 0), 10) / 1000000;
          const cost = parseInt(String(row.metrics?.costMicros || 0), 10) / 1000000;
          const clicks = parseInt(String(row.metrics?.clicks || 0), 10);
          const impressions = parseInt(String(row.metrics?.impressions || 0), 10);
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          
          // نقترح زيادة الميزانية بناءً على الأداء
          if (clicks > 0) {
            const budget = currentBudget > 0 ? currentBudget : cost > 0 ? cost : 10;
            const recommendedBudget = ctr > 2 ? budget * 1.5 : budget * 1.2;
            const estimatedClicksChange = Math.round(clicks * 0.3);
            
            budgetRecsData.push({
              campaign: row.campaign?.name || 'Unknown',
              currentBudget: Math.round(budget),
              recommendedBudget: Math.round(recommendedBudget),
              estimatedClicksChange,
              estimatedCostChange: Math.round(recommendedBudget - budget)
            });
          }
        }
        
        // 12. Auction Insights - من أداء الحملات
        const auctionInsights = await fetchAuctionInsights(cleanId, accessToken, developerToken, dateCondition);
        console.log(`🏆 Auction Insights data for ${customerId}:`, auctionInsights.length, 'campaigns');
        for (const row of auctionInsights) {
          const impressions = parseInt(String(row.metrics?.impressions || 0), 10);
          const clicks = parseInt(String(row.metrics?.clicks || 0), 10);
          const conversions = parseFloat(String(row.metrics?.conversions || 0));
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          
          // نحسب مقاييس المنافسة بناءً على الأداء
          const impressionShare = Math.min(100, 30 + (ctr * 10));
          const topShare = Math.min(100, 20 + (ctr * 8));
          const absoluteTop = Math.min(100, 10 + (ctr * 5));
          const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
          const outrankingShare = Math.min(100, 20 + convRate * 5);
          
          auctionInsightsData.push({
            campaign: row.campaign?.name || 'Unknown',
            impressionShare,
            overlapRate: 0,
            positionAboveRate: 0,
            topImpressionPct: topShare,
            absoluteTopPct: absoluteTop,
            outrankingShare
          });
        }
        
        console.log(`✅ AI Insights for ${customerId}:`, {
          optScore: optimizationScoreCount,
          searchTerms: searchTermsData.length,
          adStrength: adStrengthData.length,
          landingPages: landingPagesData.length,
          budgetRecs: budgetRecsData.length,
          auctionInsights: auctionInsightsData.length
        });
        
      } catch (e) {
        console.error(`⚠️ خطأ في جلب بيانات ${customerId}:`, e);
      }
    }
    
    // Calculate CTR for devices
    for (const device in deviceData) {
      const d = deviceData[device];
      d.ctr = d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0;
    }
    
    // Convert to arrays
    console.log('📊 Raw deviceData before conversion:', JSON.stringify(deviceData));
    const devicePerformance = Object.entries(deviceData).map(([device, data]) => ({
      device: device.replace('DEVICE_', ''),
      ...data
    }));
    console.log('📊 devicePerformance after conversion:', JSON.stringify(devicePerformance));
    
    const ageBreakdown = Object.entries(ageData).map(([age, data]) => ({
      age: age.replace('AGE_RANGE_', '').replace('_', '-'),
      ...data
    }));
    
    const genderBreakdown = Object.entries(genderData).map(([gender, data]) => ({
      gender: gender.replace('GENDER_', ''),
      ...data
    }));
    
    const hourlyBreakdown = Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        ...data
      }))
      .sort((a, b) => a.hour - b.hour);
    
    // بناء الـ response object
    const responseData = {
      success: true,
      fromCache: false,
      lastSyncedAt: new Date().toISOString(),
      device_performance: devicePerformance,
      audience_data: {
        age: ageBreakdown,
        gender: genderBreakdown
      },
      competition_data: {
        impression_share: competitionData,
        keywords: keywordCompetition.slice(0, 10)
      },
      location_data: locationData,
      hourly_data: hourlyBreakdown,
      optimization_score: optimizationScoreCount > 0 ? Math.round(optimizationScoreTotal / optimizationScoreCount) : null,
      search_terms: searchTermsData.slice(0, 15),
      ad_strength: {
        distribution: {
          excellent: adStrengthData.filter(a => a.strength === 'EXCELLENT').length,
          good: adStrengthData.filter(a => a.strength === 'GOOD').length,
          average: adStrengthData.filter(a => a.strength === 'AVERAGE').length,
          poor: adStrengthData.filter(a => a.strength === 'POOR' || a.strength === 'UNSPECIFIED' || a.strength === 'UNKNOWN' || a.strength === 'NONE').length
        },
        details: adStrengthData.slice(0, 10)
      },
      landing_pages: landingPagesData.slice(0, 8),
      budget_recommendations: budgetRecsData.slice(0, 5),
      auction_insights: auctionInsightsData.slice(0, 5)
    };
    
    // ==================== حفظ البيانات في الـ Cache ====================
    if (startDate && endDate) {
      // حفظ في الخلفية بدون انتظار
      saveInsightsToCache(
        userId,
        userEmail,
        startDate,
        endDate,
        dateRangeLabel,
        responseData,
        connectedAccounts.length
      ).catch(err => console.error('❌ Background cache save failed:', err));
    }
    // ==================== نهاية حفظ الـ Cache ====================
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ خطأ في AI Insights API:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
