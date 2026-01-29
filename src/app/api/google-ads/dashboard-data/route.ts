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
    const authCookieNames = ['oauth_access_token', 'oauth_refresh_token', 'sb-access-token', 'sb-refresh-token', 'oauth_user_info'];
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

    // 🎯 لا حاجة لفلترة الحملات - نعرض جميع الحملات من الحساب
    // تم إزالة الفلترة بناءً على طلب المستخدم لعرض الحملات الموجودة مسبقاً

    // استخدام جميع الحملات المجلوبة مباشرة
    const allCampaigns = campaigns.campaigns || [];
    console.log(`✅ Returning all ${allCampaigns.length} campaigns (Platform + External)`);

    // إعادة حساب المقاييس بناءً على جميع الحملات
    const totalSpend = allCampaigns.reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
    const impressions = allCampaigns.reduce((sum: number, c: any) => sum + (c.impressions || 0), 0);
    const clicks = allCampaigns.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0);
    const conversions = allCampaigns.reduce((sum: number, c: any) => sum + (c.conversions || 0), 0);
    const revenue = allCampaigns.reduce((sum: number, c: any) => sum + (c.conversionsValue || 0), 0);

    const recalculatedMetrics = {
      totalCampaigns: allCampaigns.length,
      activeCampaigns: allCampaigns.filter((c: any) => c.status === 'ENABLED').length,
      pausedCampaigns: allCampaigns.filter((c: any) => c.status === 'PAUSED').length,
      totalSpend, // `cost` alias
      cost: totalSpend,
      impressions,
      clicks,
      conversions,
      revenue, // `conversionsValue` alias
      conversionsValue: revenue,

      // Derived Metrics
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? totalSpend / clicks : 0,
      averageCpc: clicks > 0 ? totalSpend / clicks : 0, // Alias
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      costPerConversion: conversions > 0 ? totalSpend / conversions : 0,
      roas: totalSpend > 0 ? revenue / totalSpend : 0,
      averageCpm: impressions > 0 ? (totalSpend / impressions) * 1000 : 0,
    };

    // إرجاع جميع البيانات في استجابة واحدة
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        campaigns: allCampaigns,
        metrics: recalculatedMetrics,
        currency: campaigns.currency || 'USD',
        performanceData: performance,
        aiInsights: aiInsights,
        recommendations: recommendations.recommendations || [],
        platformOnly: false, // تم تغيير هذا ليعكس أننا نعرض الكل
        totalExternalCampaigns: 0, // لم تعد هناك حملات مخفية
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

