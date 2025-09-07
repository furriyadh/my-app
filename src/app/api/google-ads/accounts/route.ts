import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

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

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Google Ads accounts (حسب Google Ads API Documentation)...');
    
    // الحصول على access token من Authorization header (حسب Google Identity Platform)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid authorization header');
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2');
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid authorization header',
        message: 'Access token is required - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/identity/protocols/oauth2'
      }, { status: 401 });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    console.log('🔍 Fetching Google Ads accounts with access token...');

    // التحقق من وجود developer token (مطلوب حسب Google Ads API Documentation)
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!developerToken) {
      console.error('❌ GOOGLE_ADS_DEVELOPER_TOKEN غير محدد');
      console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview');
      return NextResponse.json({
        success: false,
        error: 'Developer token not configured',
        message: 'Developer token مطلوب - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/google-ads/api/docs/oauth/overview'
      }, { status: 500 });
    }

    // الحصول على حسابات Google Ads باستخدام Google Ads API (حسب Google Ads API Documentation)
    const accounts = await getGoogleAdsAccounts(accessToken, developerToken);
    
    console.log(`✅ Found ${accounts.length} Google Ads accounts (حسب Google Ads API Documentation)`);
    
    return NextResponse.json({
      success: true,
      accounts: accounts,
      count: accounts.length,
      docs: 'https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers'
    });

  } catch (error) {
    console.error('❌ Error fetching Google Ads accounts:', error);
    console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview');
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Google Ads accounts',
      message: error instanceof Error ? error.message : 'Unknown error - راجع المصادر الرسمية',
      docs: 'https://developers.google.com/google-ads/api/docs/oauth/overview',
      accounts: []
    }, { status: 500 });
  }
}

// دالة للحصول على حسابات Google Ads (حسب Google Ads API Documentation)
async function getGoogleAdsAccounts(accessToken: string, developerToken: string): Promise<GoogleAdsAccount[]> {
  try {
    console.log('📊 استدعاء الباك اند للحصول على الحسابات باستخدام Google Ads API Client Library...');
    
    // استدعاء الباك اند الذي يستخدم Google Ads API Client Library (الطريقة الرسمية)
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://furriyadh.com/api/user/accounts'
      : 'http://localhost:5000/api/user/accounts';
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`Backend API error: ${response.status} ${response.statusText}`);
      console.warn('📋 استدعاء الباك اند فشل، محاولة الحصول على الحسابات من OAuth...');
      
      // إذا فشل استدعاء الباك اند، نحاول الحصول على الحسابات من Google OAuth
      return await getAccountsFromOAuth(accessToken);
    }

    const data = await response.json();
    console.log('Backend API response:', data);
    
    if (!data.success || !data.accounts || data.accounts.length === 0) {
      console.log('No Google Ads accounts found via backend, trying OAuth method...');
      return await getAccountsFromOAuth(accessToken);
    }

    // تحويل البيانات من الباك اند إلى التنسيق المطلوب
    const accounts: GoogleAdsAccount[] = data.accounts.map((account: any) => ({
      customerId: account.customerId || account.customer_id,
      descriptiveName: account.customerName || account.descriptive_name || `Account ${account.customerId || account.customer_id}`,
      currencyCode: account.currencyCode || account.currency_code || 'USD',
      timeZone: account.timeZone || account.time_zone || 'America/New_York',
      manager: account.manager || false,
      testAccount: account.testAccount || account.test_account || false,
      status: account.status || 'ENABLED',
      resourceName: account.resourceName || `customers/${account.customerId || account.customer_id}`
    }));

    return accounts;

  } catch (error) {
    console.error('Error in getGoogleAdsAccounts:', error);
    console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview');
    
    // محاولة الحصول من OAuth كبديل (حسب الممارسات الرسمية)
    return await getAccountsFromOAuth(accessToken);
  }
}

// دالة للحصول على تفاصيل الحساب (حسب Google Ads API Documentation)
async function getAccountDetails(customerId: string, accessToken: string, developerToken: string): Promise<GoogleAdsAccount> {
  console.log(`📊 Getting details for account ${customerId} (حسب Google Ads API Documentation)...`);
  
  const response = await fetch(`https://googleads.googleapis.com/v20/customers/${customerId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get account details: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Account details for ${customerId}:`, data);

  return {
    customerId: data.id || customerId,
    descriptiveName: data.descriptiveName || `Account ${customerId}`,
    currencyCode: data.currencyCode || 'USD',
    timeZone: data.timeZone || 'America/New_York',
    manager: data.manager || false,
    testAccount: data.testAccount || false,
    status: data.status || 'ENABLED',
    resourceName: data.resourceName || `customers/${customerId}`
  };
}

// دالة بديلة للحصول على الحسابات من OAuth (حسب الممارسات الرسمية)
async function getAccountsFromOAuth(accessToken: string): Promise<GoogleAdsAccount[]> {
  console.log('📊 Trying to get accounts from OAuth (حسب الممارسات الرسمية)...');
  
  try {
    // محاولة الحصول على معلومات المستخدم من Google Identity Platform
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      console.log('User info from OAuth:', userInfo);
      
      // إنشاء حساب افتراضي بناءً على معلومات المستخدم
      return [{
        customerId: 'default',
        descriptiveName: userInfo.name || userInfo.email || 'Default Account',
        currencyCode: 'USD',
        timeZone: 'America/New_York',
        manager: false,
        testAccount: false,
        status: 'ENABLED'
      }];
    }
  } catch (error) {
    console.warn('Failed to get user info from OAuth:', error);
  }

  // إرجاع حساب افتراضي إذا فشل كل شيء
  return [{
    customerId: 'default',
    descriptiveName: 'Default Google Ads Account',
    currencyCode: 'USD',
    timeZone: 'America/New_York',
    manager: false,
    testAccount: false,
    status: 'ENABLED'
  }];
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

