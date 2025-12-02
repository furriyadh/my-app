// API to fetch performance data over time for charts
// 📊 يجلب البيانات فقط من الحسابات المرتبطة (Connected)
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
    // جلب جميع الحسابات للمستخدم
    const { data: allData, error } = await supabase
      .from('client_requests')
      .select('customer_id, status, link_details')
      .eq('user_id', userId);
    
    if (error) return [];
    
    // فلترة الحسابات المرتبطة (Connected) - نفس المنطق في صفحة الحسابات
    const connectedStatuses = ['ACTIVE', 'DISABLED', 'SUSPENDED', 'CUSTOMER_NOT_ENABLED'];
    const connectedAccounts = (allData || []).filter(row => {
      if (!row.customer_id) return false;
      
      // التحقق من الحالة المباشرة
      if (connectedStatuses.includes(row.status)) {
        return true;
      }
      
      // التحقق من link_details
      const linkDetails = row.link_details as any;
      if (linkDetails) {
        if (linkDetails.link_status === 'ACTIVE' || linkDetails.verified === true) {
          return true;
        }
      }
      
      return false;
    });
    
    // إزالة التكرارات
    const uniqueIds = [...new Set(connectedAccounts.map(row => row.customer_id).filter(Boolean))];
    return uniqueIds;
  } catch (error) {
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
        client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// دالة لجلب بيانات الأداء اليومية من حساب واحد
async function fetchDailyPerformance(customerId: string, accessToken: string, startDate: string, endDate: string) {
  try {
    const response = await fetch(`https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          SELECT 
            segments.date,
            metrics.impressions, metrics.clicks, metrics.ctr,
            metrics.conversions, metrics.conversions_value, metrics.cost_micros, metrics.average_cpc
          FROM customer
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
          ORDER BY segments.date ASC
        `
      }),
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    return [];
  }
}


export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/campaigns/performance - جلب بيانات الأداء للحسابات المرتبطة...');
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30';
    const days = parseInt(timeRange);
    // جلب التواريخ المرسلة من العميل (بتوقيته المحلي)
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    console.log(`📅 الفترة الزمنية: ${days} يوم، التواريخ: ${startDateParam || 'غير محدد'} - ${endDateParam || 'غير محدد'}`);
    
    // الحصول على معلومات المستخدم و tokens من cookies
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('oauth_access_token')?.value;
    const refreshToken = cookieStore.get('oauth_refresh_token')?.value;
    const userInfoCookie = cookieStore.get('oauth_user_info')?.value;
    
    // استخراج user ID
    let userId = null;
    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(userInfoCookie);
        userId = userInfo.id;
      } catch (e) {}
    }
    
    // تجديد access token دائماً للتأكد من صلاحيته
    if (refreshToken) {
      const newToken = await refreshAccessToken(refreshToken);
      if (newToken) {
        accessToken = newToken;
      }
    }
    
    // إذا لم يوجد access token أو user ID - إرجاع بيانات فارغة (وليس mock)
    if (!accessToken || !userId) {
      return NextResponse.json({
        success: true,
        data: [],
        timeRange: days,
        accountsCount: 0,
        message: 'يرجى تسجيل الدخول وربط حساباتك الإعلانية.'
      });
    }
    
    // 🔑 جلب الحسابات المرتبطة فقط من Supabase
    const connectedAccountIds = await getConnectedAccounts(userId);
    
    if (connectedAccountIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        timeRange: days,
        accountsCount: 0,
        message: 'لا توجد حسابات مرتبطة'
      });
    }
    
    // استخدام التواريخ المرسلة من العميل إذا وجدت، وإلا حساب التواريخ على الخادم
    let startDateStr: string;
    let endDateStr: string;
    
    if (startDateParam && endDateParam) {
      // استخدام التواريخ المرسلة من العميل (بتوقيته المحلي)
      startDateStr = startDateParam;
      endDateStr = endDateParam;
      console.log(`📅 استخدام تواريخ العميل: ${startDateStr} - ${endDateStr}`);
    } else {
      // حساب التواريخ على الخادم (للتوافق مع الطلبات القديمة)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDateStr = startDate.toISOString().split('T')[0];
      endDateStr = endDate.toISOString().split('T')[0];
      console.log(`📅 حساب التواريخ على الخادم: ${startDateStr} - ${endDateStr}`);
    }
    
    console.log(`🔗 جلب بيانات الأداء من ${connectedAccountIds.length} حساب مرتبط...`);
    
    // جلب البيانات من جميع الحسابات المرتبطة بالتوازي
    const performancePromises = connectedAccountIds.map(customerId => 
      fetchDailyPerformance(customerId, accessToken!, startDateStr, endDateStr)
    );
    
    const allResults = await Promise.all(performancePromises);
    
    console.log(`📊 جلب ${allResults.length} مجموعة نتائج`);
    for (let i = 0; i < allResults.length; i++) {
      console.log(`   - حساب ${connectedAccountIds[i]}: ${allResults[i].length} سجل`);
    }
    
    // تجميع البيانات حسب التاريخ
    const dailyDataMap = new Map<string, {
      impressions: number; clicks: number; conversions: number;
      cost: number; conversionsValue: number;
    }>();
    
    for (const results of allResults) {
      for (const row of results) {
        const date = row.segments?.date || '';
        const metrics = row.metrics || {};
        
        const existing = dailyDataMap.get(date) || {
          impressions: 0, clicks: 0, conversions: 0, cost: 0, conversionsValue: 0
        };
        
        dailyDataMap.set(date, {
          impressions: existing.impressions + (parseInt(metrics.impressions) || 0),
          clicks: existing.clicks + (parseInt(metrics.clicks) || 0),
          conversions: existing.conversions + (parseFloat(metrics.conversions) || 0),
          cost: existing.cost + (metrics.costMicros ? metrics.costMicros / 1000000 : 0),
          conversionsValue: existing.conversionsValue + (parseFloat(metrics.conversionsValue) || 0)
        });
      }
    }
    
    // تحويل إلى مصفوفة مرتبة
    const performanceData = Array.from(dailyDataMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        // التاريخ يأتي بصيغة YYYY-MM-DD من Google Ads API
        const dateObj = new Date(date);
        return {
          date: date,
          day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          impressions: data.impressions,
          clicks: data.clicks,
          conversions: Math.round(data.conversions * 100) / 100,
          cost: Math.round(data.cost * 100) / 100,
          conversionsValue: Math.round(data.conversionsValue * 100) / 100,
          ctr: data.impressions > 0 ? Math.round((data.clicks / data.impressions) * 10000) / 100 : 0,
          cpc: data.clicks > 0 ? Math.round((data.cost / data.clicks) * 100) / 100 : 0,
          roas: data.cost > 0 ? Math.round((data.conversionsValue / data.cost) * 100) / 100 : 0
        };
      });
    
    console.log(`✅ تم جلب بيانات ${performanceData.length} يوم من ${connectedAccountIds.length} حساب مرتبط`);
    
    return NextResponse.json({
      success: true,
      data: performanceData.length > 0 ? performanceData : [],
      timeRange: days,
      accountsCount: connectedAccountIds.length,
      source: 'google_ads_connected_accounts'
    });
    
  } catch (error) {
    console.error('❌ Error fetching performance data:', error);
    // إرجاع بيانات فارغة في حالة الخطأ (وليس mock)
    return NextResponse.json({
      success: true,
      data: [],
      timeRange: 30,
      accountsCount: 0,
      error: 'حدث خطأ في جلب البيانات'
    });
  }
}

