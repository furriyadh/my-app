// API to fetch AI Insights from Google Ads (Devices, Audience, Competition, Budget Simulator)
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

// دالة لجلب الحسابات المرتبطة من Supabase
async function getConnectedAccounts(userId: string): Promise<string[]> {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('client_requests')
      .select('customer_id, status')
      .eq('user_id', userId)
      .in('status', [
        'connected', 'Connected', 'CONNECTED',
        'approved', 'Approved', 'APPROVED', 
        'LINKED', 'linked', 'Linked',
        'ACTIVE', 'active', 'Active'
      ]);
    
    if (error) {
      console.error('❌ خطأ في جلب الحسابات المرتبطة:', error);
      return [];
    }
    
    const uniqueIds = [...new Set((data || []).map(row => row.customer_id).filter(Boolean))];
    return uniqueIds;
  } catch (error) {
    console.error('❌ خطأ في getConnectedAccounts:', error);
    return [];
  }
}

// دالة لتجديد access token
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('❌ خطأ في تجديد التوكن:', error);
    return null;
  }
}

// Helper function for Google Ads API calls
async function googleAdsQuery(customerId: string, accessToken: string, developerToken: string, query: string) {
  const response = await fetch(
    `https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
        'login-customer-id': process.env.GOOGLE_ADS_MCC_ID?.replace(/-/g, '') || ''
      },
      body: JSON.stringify({ query })
    }
  );
  
  if (!response.ok) {
    return [];
  }
  
  const data = await response.json();
  return data.results || [];
}

// 1. جلب بيانات الأجهزة (Device Performance)
async function fetchDevicePerformance(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      segments.device,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros,
      metrics.ctr,
      metrics.average_cpc
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
      AND campaign.status = 'ENABLED'
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 2. جلب بيانات الجمهور (Age & Gender)
async function fetchAudienceData(customerId: string, accessToken: string, developerToken: string) {
  // Age Range Data
  const ageQuery = `
    SELECT
      ad_group_criterion.age_range.type,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM age_range_view
    WHERE segments.date DURING LAST_30_DAYS
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
    WHERE segments.date DURING LAST_30_DAYS
  `;
  
  const [ageResults, genderResults] = await Promise.all([
    googleAdsQuery(customerId, accessToken, developerToken, ageQuery),
    googleAdsQuery(customerId, accessToken, developerToken, genderQuery)
  ]);
  
  return { ageResults, genderResults };
}

// 3. جلب بيانات المنافسة (Competition/Auction Insights)
async function fetchCompetitionData(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      metrics.search_impression_share,
      metrics.search_top_impression_share,
      metrics.search_absolute_top_impression_share,
      metrics.search_budget_lost_impression_share,
      metrics.search_rank_lost_impression_share,
      campaign.name
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
      AND campaign.status = 'ENABLED'
      AND campaign.advertising_channel_type = 'SEARCH'
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 4. جلب بيانات الكلمات المفتاحية للمنافسة
async function fetchKeywordCompetition(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      keyword_view.resource_name,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      metrics.impressions,
      metrics.clicks,
      metrics.average_cpc,
      metrics.search_impression_share,
      ad_group_criterion.quality_info.quality_score
    FROM keyword_view
    WHERE segments.date DURING LAST_30_DAYS
      AND ad_group_criterion.status = 'ENABLED'
    ORDER BY metrics.impressions DESC
    LIMIT 20
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 5. جلب بيانات المواقع الجغرافية
async function fetchLocationData(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      geographic_view.country_criterion_id,
      geographic_view.location_type,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM geographic_view
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.impressions DESC
    LIMIT 10
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 6. جلب بيانات الساعات (Hour of Day Performance)
async function fetchHourlyData(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      segments.hour,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM campaign
    WHERE segments.date DURING LAST_7_DAYS
      AND campaign.status = 'ENABLED'
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 7. جلب نقاط التحسين (Optimization Score) - من أداء الحملات
async function fetchOptimizationScore(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      campaign.name,
      campaign.status,
      metrics.clicks,
      metrics.impressions,
      metrics.ctr,
      metrics.conversions,
      metrics.cost_micros,
      metrics.average_cpc
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 8. جلب تقرير مصطلحات البحث (Search Terms Report) - من الكلمات المفتاحية
async function fetchSearchTerms(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.status,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros,
      metrics.ctr,
      campaign.name
    FROM keyword_view
    WHERE segments.date DURING LAST_30_DAYS
      AND ad_group_criterion.status != 'REMOVED'
    ORDER BY metrics.clicks DESC
    LIMIT 15
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 9. جلب قوة الإعلانات (Ad Strength) - من الإعلانات النشطة
async function fetchAdStrength(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      ad_group_ad.ad.type,
      ad_group_ad.ad.final_urls,
      ad_group_ad.status,
      ad_group.name,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.conversions
    FROM ad_group_ad
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.clicks DESC
    LIMIT 20
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 10. جلب أداء الصفحات المقصودة (Landing Page Experience) - من final URLs
async function fetchLandingPageExperience(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      ad_group_ad.ad.final_urls,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros,
      metrics.ctr
    FROM ad_group_ad
    WHERE segments.date DURING LAST_30_DAYS
      AND ad_group_ad.status = 'ENABLED'
    ORDER BY metrics.clicks DESC
    LIMIT 10
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 11. جلب توصيات الميزانية (Budget Recommendations) - من الحملات
async function fetchBudgetRecommendations(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      campaign.name,
      campaign.status,
      campaign_budget.amount_micros,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.ctr
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.cost_micros DESC
    LIMIT 10
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

// 12. جلب رؤى المزادات (Auction Insights) - من حملات البحث
async function fetchAuctionInsights(customerId: string, accessToken: string, developerToken: string) {
  const query = `
    SELECT
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros,
      metrics.ctr,
      metrics.average_cpc
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.impressions DESC
    LIMIT 10
  `;
  return googleAdsQuery(customerId, accessToken, developerToken, query);
}

export async function GET(request: NextRequest) {
  try {
    // جلب userId من Supabase auth
    const cookieStore = await cookies();
    const supabaseAccessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!supabaseAccessToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(supabaseAccessToken);
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }
    
    // جلب الحسابات المرتبطة
    const connectedAccounts = await getConnectedAccounts(user.id);
    
    if (connectedAccounts.length === 0) {
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
    
    // جلب OAuth tokens
    const { data: tokenData } = await supabase
      .from('oauth_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single();
    
    if (!tokenData) {
      return NextResponse.json({ success: false, error: 'No OAuth tokens found' }, { status: 401 });
    }
    
    // تجديد التوكن
    let accessToken = tokenData.access_token;
    const newToken = await refreshAccessToken(tokenData.refresh_token);
    if (newToken) {
      accessToken = newToken;
    }
    
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
    
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
        // 1. Device Performance
        const devices = await fetchDevicePerformance(cleanId, accessToken, developerToken);
        for (const row of devices) {
          const device = row.segments?.device || 'UNKNOWN';
          if (!deviceData[device]) {
            deviceData[device] = { impressions: 0, clicks: 0, conversions: 0, cost: 0, ctr: 0 };
          }
          deviceData[device].impressions += row.metrics?.impressions || 0;
          deviceData[device].clicks += row.metrics?.clicks || 0;
          deviceData[device].conversions += row.metrics?.conversions || 0;
          deviceData[device].cost += (row.metrics?.costMicros || 0) / 1000000;
        }
        
        // 2. Audience Data (Age & Gender)
        const { ageResults, genderResults } = await fetchAudienceData(cleanId, accessToken, developerToken);
        
        for (const row of ageResults) {
          const age = row.adGroupCriterion?.ageRange?.type || 'UNKNOWN';
          if (!ageData[age]) {
            ageData[age] = { impressions: 0, clicks: 0, conversions: 0, cost: 0 };
          }
          ageData[age].impressions += row.metrics?.impressions || 0;
          ageData[age].clicks += row.metrics?.clicks || 0;
          ageData[age].conversions += row.metrics?.conversions || 0;
          ageData[age].cost += (row.metrics?.costMicros || 0) / 1000000;
        }
        
        for (const row of genderResults) {
          const gender = row.adGroupCriterion?.gender?.type || 'UNKNOWN';
          if (!genderData[gender]) {
            genderData[gender] = { impressions: 0, clicks: 0, conversions: 0, cost: 0 };
          }
          genderData[gender].impressions += row.metrics?.impressions || 0;
          genderData[gender].clicks += row.metrics?.clicks || 0;
          genderData[gender].conversions += row.metrics?.conversions || 0;
          genderData[gender].cost += (row.metrics?.costMicros || 0) / 1000000;
        }
        
        // 3. Competition Data
        const competition = await fetchCompetitionData(cleanId, accessToken, developerToken);
        for (const row of competition) {
          competitionData.push({
            campaign: row.campaign?.name || 'Unknown',
            impressionShare: (row.metrics?.searchImpressionShare || 0) * 100,
            topShare: (row.metrics?.searchTopImpressionShare || 0) * 100,
            absoluteTopShare: (row.metrics?.searchAbsoluteTopImpressionShare || 0) * 100,
            budgetLost: (row.metrics?.searchBudgetLostImpressionShare || 0) * 100,
            rankLost: (row.metrics?.searchRankLostImpressionShare || 0) * 100
          });
        }
        
        // 4. Keyword Competition
        const keywords = await fetchKeywordCompetition(cleanId, accessToken, developerToken);
        for (const row of keywords) {
          keywordCompetition.push({
            keyword: row.adGroupCriterion?.keyword?.text || 'Unknown',
            matchType: row.adGroupCriterion?.keyword?.matchType || 'UNKNOWN',
            impressions: row.metrics?.impressions || 0,
            clicks: row.metrics?.clicks || 0,
            cpc: (row.metrics?.averageCpc || 0) / 1000000,
            impressionShare: (row.metrics?.searchImpressionShare || 0) * 100,
            qualityScore: row.adGroupCriterion?.qualityInfo?.qualityScore || 0
          });
        }
        
        // 5. Location Data
        const locations = await fetchLocationData(cleanId, accessToken, developerToken);
        for (const row of locations) {
          locationData.push({
            locationId: row.geographicView?.countryCriterionId || 'Unknown',
            type: row.geographicView?.locationType || 'UNKNOWN',
            impressions: row.metrics?.impressions || 0,
            clicks: row.metrics?.clicks || 0,
            conversions: row.metrics?.conversions || 0,
            cost: (row.metrics?.costMicros || 0) / 1000000
          });
        }
        
        // 6. Hourly Data
        const hourly = await fetchHourlyData(cleanId, accessToken, developerToken);
        for (const row of hourly) {
          const hour = row.segments?.hour || 0;
          if (!hourlyData[hour]) {
            hourlyData[hour] = { impressions: 0, clicks: 0, conversions: 0, cost: 0 };
          }
          hourlyData[hour].impressions += row.metrics?.impressions || 0;
          hourlyData[hour].clicks += row.metrics?.clicks || 0;
          hourlyData[hour].conversions += row.metrics?.conversions || 0;
          hourlyData[hour].cost += (row.metrics?.costMicros || 0) / 1000000;
        }
        
        // 7. Optimization Score - نحسبها من أداء الحملات
        const optScore = await fetchOptimizationScore(cleanId, accessToken, developerToken);
        let totalCTR = 0;
        let totalConvRate = 0;
        let campaignCount = 0;
        for (const row of optScore) {
          const ctr = row.metrics?.ctr || 0;
          const clicks = row.metrics?.clicks || 0;
          const conversions = row.metrics?.conversions || 0;
          const convRate = clicks > 0 ? (conversions / clicks) : 0;
          totalCTR += ctr;
          totalConvRate += convRate;
          campaignCount++;
        }
        if (campaignCount > 0) {
          // نحسب نقاط التحسين بناءً على CTR و Conversion Rate
          const avgCTR = (totalCTR / campaignCount) * 100;
          const avgConvRate = (totalConvRate / campaignCount) * 100;
          // نقاط التحسين = (CTR * 40) + (ConvRate * 60) مع حد أقصى 100
          const score = Math.min(100, Math.round((avgCTR * 4) + (avgConvRate * 6)));
          optimizationScoreTotal += score;
          optimizationScoreCount++;
        }
        
        // 8. Search Terms (Keywords)
        const searchTerms = await fetchSearchTerms(cleanId, accessToken, developerToken);
        for (const row of searchTerms) {
          const keyword = row.adGroupCriterion?.keyword?.text;
          if (keyword) {
            searchTermsData.push({
              term: keyword,
              status: row.adGroupCriterion?.status || 'UNKNOWN',
              impressions: row.metrics?.impressions || 0,
              clicks: row.metrics?.clicks || 0,
              conversions: row.metrics?.conversions || 0,
              cost: (row.metrics?.costMicros || 0) / 1000000,
              ctr: (row.metrics?.ctr || 0) * 100
            });
          }
        }
        
        // 9. Ad Strength - نحسبها من الأداء
        const adStrength = await fetchAdStrength(cleanId, accessToken, developerToken);
        for (const row of adStrength) {
          const clicks = row.metrics?.clicks || 0;
          const impressions = row.metrics?.impressions || 0;
          const conversions = row.metrics?.conversions || 0;
          const ctr = (row.metrics?.ctr || 0) * 100;
          // نحسب قوة الإعلان بناءً على الأداء
          let strength = 'POOR';
          if (clicks > 10 && ctr > 5) strength = 'EXCELLENT';
          else if (clicks > 5 && ctr > 3) strength = 'GOOD';
          else if (clicks > 2 && ctr > 1) strength = 'AVERAGE';
          
          adStrengthData.push({
            strength,
            adType: row.adGroupAd?.ad?.type || 'UNKNOWN',
            url: row.adGroupAd?.ad?.finalUrls?.[0] || '',
            adGroup: row.adGroup?.name || 'Unknown',
            campaign: row.campaign?.name || 'Unknown',
            impressions,
            clicks,
            ctr
          });
        }
        
        // 10. Landing Pages - من الإعلانات
        const landingPages = await fetchLandingPageExperience(cleanId, accessToken, developerToken);
        for (const row of landingPages) {
          const url = row.adGroupAd?.ad?.finalUrls?.[0];
          if (url) {
            const clicks = row.metrics?.clicks || 0;
            const impressions = row.metrics?.impressions || 0;
            const conversions = row.metrics?.conversions || 0;
            const ctr = (row.metrics?.ctr || 0) * 100;
            // نحسب نقاط السرعة بناءً على الأداء
            const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
            const speedScore = Math.min(100, Math.round((ctr * 5) + (convRate * 10) + 50));
            landingPagesData.push({
              url,
              impressions,
              clicks,
              conversions,
              cost: (row.metrics?.costMicros || 0) / 1000000,
              mobileScore: 0,
              speedScore
            });
          }
        }
        
        // 11. Budget Recommendations - من الحملات
        const budgetRecs = await fetchBudgetRecommendations(cleanId, accessToken, developerToken);
        for (const row of budgetRecs) {
          const currentBudget = (row.campaignBudget?.amountMicros || 0) / 1000000;
          const cost = (row.metrics?.costMicros || 0) / 1000000;
          const clicks = row.metrics?.clicks || 0;
          const ctr = (row.metrics?.ctr || 0) * 100;
          
          // نقترح زيادة الميزانية بناءً على الأداء
          if (currentBudget > 0 && clicks > 0) {
            const recommendedBudget = ctr > 3 ? currentBudget * 1.5 : currentBudget * 1.2;
            const estimatedClicksChange = Math.round(clicks * (recommendedBudget / currentBudget - 1));
            
            budgetRecsData.push({
              campaign: row.campaign?.name || 'Unknown',
              currentBudget,
              recommendedBudget: Math.round(recommendedBudget),
              estimatedClicksChange,
              estimatedCostChange: recommendedBudget - currentBudget
            });
          }
        }
        
        // 12. Auction Insights - من أداء الحملات
        const auctionInsights = await fetchAuctionInsights(cleanId, accessToken, developerToken);
        for (const row of auctionInsights) {
          const impressions = row.metrics?.impressions || 0;
          const clicks = row.metrics?.clicks || 0;
          const conversions = row.metrics?.conversions || 0;
          const ctr = (row.metrics?.ctr || 0) * 100;
          
          // نحسب مقاييس المنافسة بناءً على الأداء
          const impressionShare = Math.min(100, ctr * 10); // تقدير حصة الظهور
          const topShare = Math.min(100, ctr * 8);
          const absoluteTop = Math.min(100, ctr * 5);
          const outrankingShare = Math.min(100, (conversions / Math.max(clicks, 1)) * 100);
          
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
    const devicePerformance = Object.entries(deviceData).map(([device, data]) => ({
      device: device.replace('DEVICE_', ''),
      ...data
    }));
    
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
    
    return NextResponse.json({
      success: true,
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
      // New data
      optimization_score: optimizationScoreCount > 0 ? Math.round(optimizationScoreTotal / optimizationScoreCount) : null,
      search_terms: searchTermsData.slice(0, 15),
      ad_strength: {
        distribution: {
          excellent: adStrengthData.filter(a => a.strength === 'EXCELLENT').length,
          good: adStrengthData.filter(a => a.strength === 'GOOD').length,
          average: adStrengthData.filter(a => a.strength === 'AVERAGE').length,
          poor: adStrengthData.filter(a => a.strength === 'POOR' || a.strength === 'UNSPECIFIED' || a.strength === 'UNKNOWN').length
        },
        details: adStrengthData.slice(0, 10)
      },
      landing_pages: landingPagesData.slice(0, 8),
      budget_recommendations: budgetRecsData.slice(0, 5),
      auction_insights: auctionInsightsData.slice(0, 5)
    });
    
  } catch (error) {
    console.error('❌ خطأ في AI Insights API:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
