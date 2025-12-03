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
  const mccRefreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  
  if (mccRefreshToken) {
    console.log('🔑 محاولة استخدام MCC Token من البيئة...');
    const mccAccessToken = await refreshAccessToken(mccRefreshToken);
    if (mccAccessToken) {
      console.log('✅ تم الحصول على MCC Access Token بنجاح');
      return mccAccessToken;
    }
  }
  
  if (userRefreshToken) {
    console.log('🔑 محاولة استخدام User OAuth Token...');
    const userAccessToken = await refreshAccessToken(userRefreshToken);
    if (userAccessToken) {
      return userAccessToken;
    }
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // الحصول على refresh token من cookies
    const cookieStore = await cookies();
    const userRefreshToken = cookieStore.get('oauth_refresh_token')?.value;
    
    // 🔑 الحصول على Access Token - MCC أولاً
    const accessToken = await getValidAccessToken(userRefreshToken);
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token available'
      }, { status: 401 });
    }
    
    const accountStats = await getGoogleAdsAccountStats(customerId, accessToken);
    
    return NextResponse.json(accountStats);
  } catch (error) {
    console.error('Error fetching account stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account statistics' },
      { status: 500 }
    );
  }
}

async function getGoogleAdsAccountStats(customerId: string, accessToken: string) {
  try {
    const loginCustomerId = (process.env.MCC_LOGIN_CUSTOMER_ID || process.env.GOOGLE_ADS_MCC_ID || '').replace(/-/g, '');
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
    
    // جلب إحصائيات الحساب من Google Ads API
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
      console.error(`❌ Google Ads API error: ${response.status}`);
      return {
        customerId,
        campaignsCount: 0,
        monthlySpend: 0,
        currency: 'USD',
        lastUpdated: new Date().toISOString(),
        metrics: { impressions: 0, clicks: 0, conversions: 0, ctr: '0.00', cpc: '0.00' }
      };
    }
    
    const data = await response.json();
    const results = data.results || [];
    
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
    
    return {
      customerId,
      campaignsCount: 0, // يمكن جلبها بـ query منفصل
      monthlySpend: Math.round(totalCost * 100) / 100,
      currency: customerInfo.currencyCode || 'USD',
      lastUpdated: new Date().toISOString(),
      metrics: {
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: Math.round(totalConversions * 100) / 100,
        ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
        cpc: totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : '0.00'
      }
    };
  } catch (error) {
    console.error('Error in getGoogleAdsAccountStats:', error);
    return {
      customerId,
      campaignsCount: 0,
      monthlySpend: 0,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      metrics: { impressions: 0, clicks: 0, conversions: 0, ctr: '0.00', cpc: '0.00' }
    };
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
