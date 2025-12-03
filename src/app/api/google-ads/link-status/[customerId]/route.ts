import { NextRequest, NextResponse } from 'next/server';

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

// دالة للحصول على حالة الربط الفعلية من Google Ads API
async function getRealLinkStatus(customerId: string, accessToken: string) {
  try {
    console.log(`🔍 فحص حالة الربط الفعلية للحساب ${customerId}...`);
    
    // استخدام Google Ads API الصحيح للحصول على حالة الربط
    const mccCustomerId = process.env.MCC_LOGIN_CUSTOMER_ID;
    
    if (!mccCustomerId) {
      return {
        success: false,
        customerId: customerId,
        error: 'MCC_LOGIN_CUSTOMER_ID not configured',
        details: 'MCC_LOGIN_CUSTOMER_ID environment variable is required'
      };
    }
    
    // استخدام search endpoint بدلاً من searchStream
    const response = await fetch(`https://googleads.googleapis.com/v21/customers/${mccCustomerId}/googleAds:search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        'login-customer-id': mccCustomerId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `SELECT customer_client_link.client_customer, customer_client_link.status, customer_client_link.manager_customer FROM customer_client_link WHERE customer_client_link.client_customer = 'customers/${customerId}'`,
        pageSize: 1000
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      const results = data.results || [];
      
      console.log(`📊 نتائج فحص الربط للحساب ${customerId}:`, results.length);
      
      if (results.length > 0) {
        const linkInfo = results[0].customerClientLink;
        const status = linkInfo.status;
        
        console.log(`🔗 حالة الربط للحساب ${customerId}:`, {
          status: status,
          manager: linkInfo.managerCustomer,
          client: linkInfo.clientCustomer
        });
        
        return {
          success: true,
          customerId: customerId,
          linkStatus: status, // PENDING, ACTIVE, REJECTED, CANCELLED
          managerCustomer: linkInfo.managerCustomer,
          clientCustomer: linkInfo.clientCustomer,
          lastChecked: new Date().toISOString()
        };
      } else {
        // لا توجد روابط - الحساب غير مربوط
        return {
          success: true,
          customerId: customerId,
          linkStatus: 'NOT_LINKED',
          isHidden: false,
          managerCustomer: null,
          clientCustomer: `customers/${customerId}`,
          lastChecked: new Date().toISOString()
        };
      }
    } else {
      const errorText = await response.text();
      console.error(`❌ فشل في فحص حالة الربط للحساب ${customerId}:`, errorText);
      
      return {
        success: false,
        customerId: customerId,
        error: 'Failed to fetch link status',
        details: errorText
      };
    }
  } catch (error) {
    console.error(`❌ خطأ في فحص حالة الربط للحساب ${customerId}:`, error);
    
    return {
      success: false,
      customerId: customerId,
      error: 'Network error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    console.log(`🔄 GET /api/google-ads/link-status/${customerId} - فحص حالة الربط...`);
    
    // الحصول على refresh token من cookies
    const { cookies } = await import('next/headers');
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
    
    if (!customerId || customerId === 'undefined' || customerId === 'null') {
      return NextResponse.json({
        success: false,
        error: 'Invalid customer ID',
        message: 'رقم الحساب غير صحيح'
      }, { status: 400 });
    }
    
    // الحصول على حالة الربط الفعلية
    const linkStatus = await getRealLinkStatus(customerId, accessToken);
    
    return NextResponse.json(linkStatus, {
      status: linkStatus.success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ في API فحص حالة الربط:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}
