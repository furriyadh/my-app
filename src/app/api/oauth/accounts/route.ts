import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Google OAuth2 Accounts Handler - يتبع الممارسات الرسمية من Google Ads API Documentation
 * المصادر الرسمية:
 * - https://developers.google.com/google-ads/api/docs/oauth/overview
 * - https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers
 */

export async function GET(request: NextRequest) {
  try {
    console.log('📊 جلب الحسابات الإعلانية من Google Ads (حسب Google Ads API Documentation)...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    
    if (!accessToken) {
      console.error('❌ لم يتم العثور على access token');
      console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview');
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/google-ads/api/docs/oauth/overview'
      }, { status: 401 });
    }
    
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
    
    // محاولة الحصول على الحسابات مباشرة من Google Ads API (حسب Google Ads API Documentation)
    try {
      console.log('🔄 الحصول على الحسابات من الباك اند الذي يستخدم Google Ads API Client Library...');
      const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:5000');
      const googleAdsResponse = await fetch(`${backendUrl}/api/oauth/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (googleAdsResponse.ok) {
        const googleAdsData = await googleAdsResponse.json();
        console.log('✅ تم الحصول على الحسابات من Google Ads API بنجاح (حسب Google Ads API Documentation)');
        
        // تحويل البيانات من الباك اند إلى التنسيق المطلوب
        const accounts = googleAdsData.accounts?.map((account: any) => ({
          customerId: account.customerId || account.customer_id,
          resourceName: account.resourceName || `customers/${account.customerId || account.customer_id}`,
          status: account.status || 'ENABLED'
        })) || [];
        
        return NextResponse.json({
          success: true,
          accounts: accounts,
          count: accounts.length,
          message: 'تم جلب الحسابات الإعلانية بنجاح - يتبع Google Ads API Documentation',
          docs: 'https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers'
        });
      } else {
        console.warn('⚠️ فشل في الحصول على الحسابات من Google Ads API مباشرة، محاولة الباك اند...');
      }
    } catch (googleAdsError) {
      console.warn('⚠️ خطأ في الحصول على الحسابات من Google Ads API مباشرة:', googleAdsError);
      console.warn('📋 راجع: https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers');
    }
    
    // الاتصال بالباك اند لجلب الحسابات (كبديل)
    console.log('🔄 الحصول على الحسابات من الباك اند...');
    const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:5000');
    
    const response = await fetch(`${backendUrl}/api/oauth/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('❌ فشل في جلب الحسابات من الباك اند:', response.status, response.statusText);
      console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview');
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch accounts',
        message: 'فشل في جلب الحسابات الإعلانية - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/google-ads/api/docs/oauth/overview'
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب الحسابات من الباك اند بنجاح:', data.accounts?.length || 0, 'حساب');
      return NextResponse.json({
        success: true,
        accounts: data.accounts,
        count: data.accounts?.length || 0,
        message: 'تم جلب الحسابات الإعلانية بنجاح - يتبع Google Ads API Documentation',
        docs: 'https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers'
      });
    } else {
      console.error('❌ فشل في جلب الحسابات من الباك اند:', data);
      console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview');
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to fetch accounts',
        message: data.message || 'فشل في جلب الحسابات الإعلانية - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/google-ads/api/docs/oauth/overview'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب الحسابات:', error);
    console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview');
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم - راجع المصادر الرسمية',
      docs: 'https://developers.google.com/google-ads/api/docs/oauth/overview'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET method is allowed for fetching accounts (حسب Google Ads API Documentation)',
    docs: 'https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers'
  }, { status: 405 });
}
