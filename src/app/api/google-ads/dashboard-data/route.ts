import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for platform campaigns filtering
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 🎯 Dashboard Data API - Unified Endpoint
 * 
 * يجلب جميع بيانات الداشبورد في طلب واحد:
 * - الحملات (Campaigns) - فقط المنشأة من المنصة
 * - بيانات الأداء (Performance Data)
 * - AI Insights
 * - التوصيات (Recommendations)
 * 
 * هذا يقلل من استهلاك الكوتا بنسبة 75%
 */


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const label = searchParams.get('label') || 'Today';
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    const campaignId = searchParams.get('campaignId'); // ✅ جديد

    // Force Next.js to treat this as dynamic
    console.log('🎯 Unified Dashboard Data API called');
    console.log('📅 Parameters:', { timeRange, startDate, endDate, label, forceRefresh, campaignId });

    // بناء base URL للطلبات الداخلية
    const baseUrl = request.nextUrl.origin;

    // بناء query parameters مشتركة
    const queryParams = new URLSearchParams();
    if (timeRange) queryParams.set('timeRange', timeRange);
    if (startDate) queryParams.set('startDate', startDate);
    if (endDate) queryParams.set('endDate', endDate);
    if (label) queryParams.set('label', label);
    if (forceRefresh) queryParams.set('forceRefresh', 'true');
    if (campaignId) queryParams.set('campaignId', campaignId); // ✅ جديد

    // الحصول على cookies للطلبات الداخلية
    // ⚠️ نحتاج فقط الـ cookies المتعلقة بالمصادقة وتكون ASCII-safe
    const cookieStore = await cookies();
    const authCookieNames = ['oauth_access_token', 'oauth_refresh_token', 'sb-access-token', 'sb-refresh-token'];
    const cookieHeader = cookieStore.getAll()
      .filter(cookie => {
        // فقط الـ cookies المهمة للمصادقة
        if (!authCookieNames.some(name => cookie.name.includes(name))) {
          return false;
        }
        // تأكد أن القيمة ASCII فقط (لتجنب خطأ ByteString)
        try {
          for (let i = 0; i < cookie.value.length; i++) {
            if (cookie.value.charCodeAt(i) > 255) {
              return false;
            }
          }
          return true;
        } catch {
          return false;
        }
      })
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    // جلب جميع البيانات بالتوازي في طلب واحد
    console.log('🔄 Fetching all data in parallel...');
    const startTime = Date.now();

    const [campaignsRes, performanceRes, aiInsightsRes, recommendationsRes] = await Promise.allSettled([
      // 1. الحملات
      fetch(`${baseUrl}/api/google-ads/campaigns?${queryParams.toString()}`, {
        headers: {
          'Cookie': cookieHeader,
        },
      }),

      // 2. بيانات الأداء
      fetch(`${baseUrl}/api/google-ads/campaigns/performance?${queryParams.toString()}`, {
        headers: {
          'Cookie': cookieHeader,
        },
      }),

      // 3. AI Insights
      fetch(`${baseUrl}/api/ai-insights?${queryParams.toString()}`, {
        headers: {
          'Cookie': cookieHeader,
        },
      }),

      // 4. التوصيات
      fetch(`${baseUrl}/api/google-ads/campaigns/recommendations`, {
        headers: {
          'Cookie': cookieHeader,
        },
      }),
    ]);

    const endTime = Date.now();
    console.log(`⚡ All data fetched in ${endTime - startTime}ms`);

    // معالجة النتائج
    const campaigns = campaignsRes.status === 'fulfilled' && campaignsRes.value.ok
      ? await campaignsRes.value.json()
      : { campaigns: [], metrics: {}, currency: 'USD' };

    const performanceData = performanceRes.status === 'fulfilled' && performanceRes.value.ok
      ? await performanceRes.value.json()
      : { success: false, data: [] };

    const performance = performanceData.success ? performanceData.data : [];

    const aiInsights = aiInsightsRes.status === 'fulfilled' && aiInsightsRes.value.ok
      ? await aiInsightsRes.value.json()
      : null;

    const recommendations = recommendationsRes.status === 'fulfilled' && recommendationsRes.value.ok
      ? await recommendationsRes.value.json()
      : { recommendations: [] };

    // تسجيل الأخطاء إن وجدت
    if (campaignsRes.status === 'rejected') {
      console.error('❌ Campaigns fetch failed:', campaignsRes.reason);
    }
    if (performanceRes.status === 'rejected') {
      console.error('❌ Performance fetch failed:', performanceRes.reason);
    }
    if (aiInsightsRes.status === 'rejected') {
      console.error('❌ AI Insights fetch failed:', aiInsightsRes.reason);
    }
    if (recommendationsRes.status === 'rejected') {
      console.error('❌ Recommendations fetch failed:', recommendationsRes.reason);
    }

    // 🎯 فلترة الحملات المنشأة من المنصة فقط
    let filteredCampaigns = campaigns.campaigns || [];
    let platformCampaignIds: string[] = [];

    // جلب الحملات المنشأة من المنصة من Supabase
    try {
      const { data: platformCampaigns, error } = await supabase
        .from('platform_created_campaigns')
        .select('google_campaign_id')
        .eq('status', 'active');

      if (!error && platformCampaigns && platformCampaigns.length > 0) {
        platformCampaignIds = platformCampaigns.map(c => c.google_campaign_id);
        console.log(`🎯 Platform campaigns found: ${platformCampaignIds.length}`);

        // فلترة الحملات لإظهار المنصة فقط
        filteredCampaigns = filteredCampaigns.filter((campaign: any) =>
          platformCampaignIds.includes(campaign.id?.toString())
        );

        console.log(`✅ Filtered to ${filteredCampaigns.length} platform campaigns (from ${(campaigns.campaigns || []).length} total)`);
      } else {
        console.log('⚠️ No platform campaigns found or error:', error?.message);
        // إذا لم توجد حملات منصة، نعرض قائمة فارغة
        filteredCampaigns = [];
      }
    } catch (filterError) {
      console.error('❌ Error filtering platform campaigns:', filterError);
      // في حالة الخطأ، نعرض قائمة فارغة للأمان
      filteredCampaigns = [];
    }

    // إعادة حساب المقاييس بناءً على الحملات المفلترة
    const recalculatedMetrics = {
      totalCampaigns: filteredCampaigns.length,
      activeCampaigns: filteredCampaigns.filter((c: any) => c.status === 'ENABLED').length,
      pausedCampaigns: filteredCampaigns.filter((c: any) => c.status === 'PAUSED').length,
      totalSpend: filteredCampaigns.reduce((sum: number, c: any) => sum + (c.cost || 0), 0),
      impressions: filteredCampaigns.reduce((sum: number, c: any) => sum + (c.impressions || 0), 0),
      clicks: filteredCampaigns.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0),
      conversions: filteredCampaigns.reduce((sum: number, c: any) => sum + (c.conversions || 0), 0),
    };

    // إرجاع جميع البيانات في استجابة واحدة
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        campaigns: filteredCampaigns,
        metrics: recalculatedMetrics,
        currency: campaigns.currency || 'USD',
        performanceData: performance,
        aiInsights: aiInsights,
        recommendations: recommendations.recommendations || [],
        platformOnly: true, // علامة أننا نعرض حملات المنصة فقط
        totalExternalCampaigns: (campaigns.campaigns || []).length - filteredCampaigns.length,
      },
      meta: {
        timeRange,
        startDate,
        endDate,
        label,
        forceRefresh,
        fetchTime: endTime - startTime,
      },
    };

    console.log('✅ Unified response ready:', {
      campaigns: response.data.campaigns.length,
      performanceData: response.data.performanceData.length,
      hasAiInsights: !!response.data.aiInsights,
      recommendations: response.data.recommendations.length,
      fetchTime: `${endTime - startTime}ms`,
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Unified Dashboard Data API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch dashboard data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

