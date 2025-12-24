import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Google Ads Accounts API - يتبع الممارسات الرسمية من Google Ads API Documentation
 * المصادر الرسمية:
 * - https://developers.google.com/google-ads/api/docs/oauth/overview
 * - https://developers.google.com/google-ads/api/docs/oauth/installed-app
 * - https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers
 * - https://github.com/googleads/google-ads-python
 */

// TypeScript interfaces (حسب Google Ads API Documentation)
interface GoogleAdsAccount {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  manager: boolean;
  testAccount: boolean;
  status?: string;
  resourceName?: string;
}

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


// دالة للحصول على Access Token - تعطي الأولوية لـ User Token (لاكتشاف حسابات المستخدم)
async function getValidAccessToken(userRefreshToken?: string): Promise<string | null> {
  // 1. أولاً: نحاول User OAuth Token (الأصح لاكتشاف حسابات المستخدم الشخصية)
  if (userRefreshToken) {
    console.log('🔑 محاولة استخدام User OAuth Token (User Context)...');
    const userAccessToken = await refreshAccessToken(userRefreshToken);
    if (userAccessToken) {
      console.log('✅ تم الحصول على User Access Token بنجاح');
      return userAccessToken;
    }
    console.warn('⚠️ فشل User Token، سنحاول MCC Token كاحتياطي...');
  }

  // 2. ثانياً: نحاول استخدام MCC refresh token من البيئة (System Context)
  // هذا مفيد إذا كنا نريد عرض الحسابات المرتبطة بالفعل بالمدير
  const mccRefreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (mccRefreshToken) {
    console.log('🔑 محاولة استخدام MCC Token من البيئة (System Context)...');
    const mccAccessToken = await refreshAccessToken(mccRefreshToken);
    if (mccAccessToken) {
      console.log('✅ تم الحصول على MCC Access Token بنجاح');
      return mccAccessToken;
    }
  }

  console.error('❌ فشل الحصول على أي Access Token صالح');
  return null;
}


export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Google Ads accounts (حسب Google Ads API Documentation)...');

    // الحصول على refresh token من cookies
    const cookieStore = await cookies();

    // استخدام توكن مخصص للإعلانات أولاً
    const adsRefreshToken = cookieStore.get('ads_refresh_token')?.value;
    const genericRefreshToken = cookieStore.get('oauth_refresh_token')?.value;
    const userRefreshToken = adsRefreshToken || genericRefreshToken;

    console.log('🔑 Token Source:', adsRefreshToken ? 'ads_refresh_token (Specific)' : 'oauth_refresh_token (Generic)');

    // 🔑 الحصول على Access Token - MCC أولاً
    const accessToken = await getValidAccessToken(userRefreshToken);

    if (!accessToken) {
      console.error('❌ No valid access token available');
      return NextResponse.json({
        success: false,
        error: 'No valid access token',
        message: 'لم يتم العثور على رمز وصول صالح',
        accounts: []
      }, { status: 401 });
    }

    // التحقق من وجود developer token (مطلوب حسب Google Ads API Documentation)
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!developerToken) {
      console.error('❌ GOOGLE_ADS_DEVELOPER_TOKEN غير محدد');
      return NextResponse.json({
        success: false,
        error: 'Developer token not configured',
        message: 'Developer token مطلوب',
        accounts: []
      }, { status: 500 });
    }

    // الحصول على حسابات Google Ads باستخدام Google Ads API
    const accounts = await getGoogleAdsAccounts(accessToken, developerToken);

    console.log(`✅ Found ${accounts.length} Google Ads accounts`);

    return NextResponse.json({
      success: true,
      accounts: accounts,
      count: accounts.length
    });

  } catch (error) {
    console.error('❌ Error fetching Google Ads accounts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Google Ads accounts',
      message: error instanceof Error ? error.message : 'Unknown error',
      accounts: []
    }, { status: 500 });
  }
}

// دالة للحصول على حسابات Google Ads مباشرة من API
async function getGoogleAdsAccounts(accessToken: string, developerToken: string): Promise<GoogleAdsAccount[]> {
  try {
    console.log('📊 جلب الحسابات مباشرة من Google Ads API...');

    const loginCustomerId = (process.env.MCC_LOGIN_CUSTOMER_ID || process.env.GOOGLE_ADS_MCC_ID || '').replace(/-/g, '');

    // جلب قائمة الحسابات المتاحة
    const listResponse = await fetch('https://googleads.googleapis.com/v21/customers:listAccessibleCustomers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!listResponse.ok) {
      console.error('❌ فشل في جلب قائمة الحسابات:', listResponse.status);
      return [];
    }

    const listData = await listResponse.json();
    const resourceNames = listData.resourceNames || [];
    console.log(`📋 عدد الحسابات المتاحة: ${resourceNames.length}`);

    const accounts: GoogleAdsAccount[] = [];

    for (const resourceName of resourceNames) {
      const customerId = resourceName.split('/').pop();

      try {
        // جلب تفاصيل كل حساب
        const detailsResponse = await fetch(`https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`, {
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
                customer.time_zone,
                customer.status,
                customer.manager,
                customer.test_account
              FROM customer
              LIMIT 1
            `
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          const results = detailsData.results || [];

          if (results.length > 0) {
            const customer = results[0].customer;
            accounts.push({
              customerId: customerId,
              descriptiveName: customer.descriptiveName || `Account ${customerId}`,
              currencyCode: customer.currencyCode || 'USD',
              timeZone: customer.timeZone || 'UTC',
              manager: customer.manager || false,
              testAccount: customer.testAccount || false,
              status: customer.status || 'ENABLED',
              resourceName: resourceName
            });
          }
        } else {
          // إضافة الحساب حتى لو فشل جلب التفاصيل
          accounts.push({
            customerId: customerId,
            descriptiveName: `Account ${customerId}`,
            currencyCode: 'USD',
            timeZone: 'UTC',
            manager: false,
            testAccount: false,
            status: 'ENABLED',
            resourceName: resourceName
          });
        }
      } catch (error) {
        console.warn(`⚠️ فشل في جلب تفاصيل الحساب ${customerId}:`, error);
        accounts.push({
          customerId: customerId,
          descriptiveName: `Account ${customerId}`,
          currencyCode: 'USD',
          timeZone: 'UTC',
          manager: false,
          testAccount: false,
          status: 'ENABLED',
          resourceName: resourceName
        });
      }
    }

    console.log(`✅ تم جلب ${accounts.length} حساب`);
    return accounts;

  } catch (error) {
    console.error('❌ Error in getGoogleAdsAccounts:', error);
    return [];
  }
}


export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

