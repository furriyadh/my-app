import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// دالة لتجديد access token
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    console.log('🔄 محاولة تجديد access token...');
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
      console.log('✅ تم تجديد access token بنجاح');
      return data.access_token;
    }
    console.error('❌ فشل تجديد token:', response.status);
    return null;
  } catch (error) {
    console.error('❌ خطأ في تجديد token:', error);
    return null;
  }
}

// دالة للحصول على Access Token - تستخدم MCC Token أولاً
async function getValidAccessToken(userRefreshToken?: string): Promise<string | null> {
  // 1. أولاً: نحاول استخدام MCC refresh token من البيئة (الأفضل)
  const mccRefreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  
  if (mccRefreshToken) {
    console.log('🔑 محاولة استخدام MCC Token من البيئة...');
    const mccAccessToken = await refreshAccessToken(mccRefreshToken);
    if (mccAccessToken) {
      console.log('✅ تم الحصول على MCC Access Token بنجاح');
      return mccAccessToken;
    }
    console.warn('⚠️ فشل MCC Token، سنحاول User Token...');
  }
  
  // 2. ثانياً: نحاول User OAuth Token كـ fallback
  if (userRefreshToken) {
    console.log('🔑 محاولة استخدام User OAuth Token...');
    const userAccessToken = await refreshAccessToken(userRefreshToken);
    if (userAccessToken) {
      console.log('✅ تم الحصول على User Access Token بنجاح');
      return userAccessToken;
    }
  }
  
  console.error('❌ فشل الحصول على أي Access Token صالح');
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    
    console.log(`📊 جلب إحصائيات الحساب ${customerId}...`);
    
    // التحقق من صحة معرف العميل
    if (!customerId || !customerId.match(/^\d{10}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid customer ID format',
        message: 'معرف العميل يجب أن يكون 10 أرقام'
      }, { status: 400 });
    }
    
    // الحصول على refresh token من cookies
    const cookieStore = await cookies();
    const userRefreshToken = cookieStore.get('oauth_refresh_token')?.value;
    
    // 🔑 الحصول على Access Token - MCC أولاً
    const accessToken = await getValidAccessToken(userRefreshToken);
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token available',
        message: 'لم يتم العثور على رمز وصول صالح'
      }, { status: 401 });
    }
    
    // جلب إحصائيات الحساب مباشرة من Google Ads API
    try {
      const loginCustomerId = (process.env.MCC_LOGIN_CUSTOMER_ID || process.env.GOOGLE_ADS_MCC_ID || '').replace(/-/g, '');
      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
      
      const response = await fetch(`https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'login-customer-id': loginCustomerId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            SELECT 
              customer.id,
              customer.descriptive_name,
              customer.currency_code,
              customer.status,
              metrics.impressions,
              metrics.clicks,
              metrics.cost_micros,
              metrics.conversions
            FROM customer
            WHERE segments.date DURING LAST_30_DAYS
          `
        }),
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Google Ads API error: ${response.status}`, errorText);
        
        // تحليل الخطأ
        if (response.status === 403) {
          return NextResponse.json({
            success: false,
            error: 'PERMISSION_DENIED',
            message: 'هذا الحساب غير متاح من MCC الحالي'
          }, { status: 200 }); // نرجع 200 لأن هذا ليس خطأ فني
        }
        
        return NextResponse.json({
          success: false,
          error: `API error: ${response.status}`,
          message: 'خطأ في جلب البيانات من Google Ads'
        }, { status: response.status });
      }
      
      const data = await response.json();
      const results = data.results || [];
      
      if (results.length === 0) {
        return NextResponse.json({
          success: true,
          customer_id: customerId,
          stats: {
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0
          },
          message: 'لا توجد بيانات لهذه الفترة'
        });
      }
      
      // تجميع الإحصائيات
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalCost = 0;
      let totalConversions = 0;
      
      for (const row of results) {
        const metrics = row.metrics || {};
        totalImpressions += parseInt(metrics.impressions || '0', 10);
        totalClicks += parseInt(metrics.clicks || '0', 10);
        totalCost += parseFloat(metrics.costMicros || '0') / 1000000;
        totalConversions += parseFloat(metrics.conversions || '0');
      }
      
      const customerInfo = results[0]?.customer || {};
      
      console.log(`📊 إحصائيات الحساب ${customerId}: impressions=${totalImpressions}, clicks=${totalClicks}`);
      
      return NextResponse.json({
        success: true,
        customer_id: customerId,
        customer_name: customerInfo.descriptiveName || `Account ${customerId}`,
        currency: customerInfo.currencyCode || 'USD',
        status: customerInfo.status || 'UNKNOWN',
        stats: {
          impressions: totalImpressions,
          clicks: totalClicks,
          cost: Math.round(totalCost * 100) / 100,
          conversions: Math.round(totalConversions * 100) / 100,
          ctr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0
        }
      });
      
    } catch (apiError) {
      console.error(`❌ خطأ في الاتصال بـ Google Ads API:`, apiError);
      return NextResponse.json({
        success: false,
        error: 'API connection error',
        message: 'خطأ في الاتصال بـ Google Ads API'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات الحساب:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}
