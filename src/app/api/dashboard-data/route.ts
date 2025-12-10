import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * 🎯 Dashboard Data API - Unified Endpoint
 * 
 * يجلب جميع بيانات الداشبورد في طلب واحد:
 * - الحملات (Campaigns)
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
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    // جلب جميع البيانات بالتوازي في طلب واحد
    console.log('🔄 Fetching all data in parallel...');
    const startTime = Date.now();

    const [campaignsRes, performanceRes, aiInsightsRes, recommendationsRes] = await Promise.allSettled([
      // 1. الحملات
      fetch(`${baseUrl}/api/campaigns?${queryParams.toString()}`, {
        headers: {
          'Cookie': cookieHeader,
        },
      }),
      
      // 2. بيانات الأداء
      fetch(`${baseUrl}/api/campaigns/performance?${queryParams.toString()}`, {
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
      fetch(`${baseUrl}/api/campaigns/recommendations`, {
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

    // إرجاع جميع البيانات في استجابة واحدة
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        campaigns: campaigns.campaigns || [],
        metrics: campaigns.metrics || {},
        currency: campaigns.currency || 'USD',
        performanceData: performance,
        aiInsights: aiInsights,
        recommendations: recommendations.recommendations || [],
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

