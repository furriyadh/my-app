import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Google OAuth2 Linked Accounts Handler - يتبع الممارسات الرسمية من Google Ads API Documentation
 * المصادر الرسمية:
 * - https://developers.google.com/google-ads/api/docs/oauth/overview
 * - https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers
 */

/**
 * Google OAuth2 Linked Accounts Handler - يتبع الممارسات الرسمية من Google Ads API Documentation
 * المصادر الرسمية:
 * - https://developers.google.com/google-ads/api/docs/oauth/overview
 * - https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 جلب الحسابات المرتبطة (حسب Google Ads API Documentation)...');
    
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
    
    // الحصول على الحسابات المرتبطة من Google Ads API (حسب Google Ads API Documentation)
    try {
      console.log('🔄 الحصول على الحسابات المرتبطة من الباك اند الذي يستخدم Google Ads API Client Library...');
      const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:5000');
      const response = await fetch(`${backendUrl}/api/oauth/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ تم الحصول على الحسابات المرتبطة بنجاح (حسب Google Ads API Documentation)');
        
        // تحويل البيانات من الباك اند إلى التنسيق المطلوب
        const linkedAccounts = data.accounts?.map((account: any) => ({
          customerId: account.customerId || account.customer_id,
          resourceName: account.resourceName || `customers/${account.customerId || account.customer_id}`,
          status: 'LINKED',
          linkedAt: new Date().toISOString(),
          permissions: ['READ', 'WRITE'] // حسب Google Ads API
        })) || [];
        
        return NextResponse.json({
          success: true,
          linkedAccounts: linkedAccounts,
          count: linkedAccounts.length,
          message: 'تم جلب الحسابات المرتبطة بنجاح - يتبع Google Ads API Documentation',
          docs: 'https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers'
        });
        
      } else {
        console.error('❌ فشل في الحصول على الحسابات المرتبطة:', response.status, response.statusText);
        console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers');
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch linked accounts',
          message: 'فشل في جلب الحسابات المرتبطة - راجع المصادر الرسمية',
          status: response.status,
          docs: 'https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers'
        }, { status: 500 });
      }
      
    } catch (fetchError) {
      console.error('❌ خطأ في الحصول على الحسابات المرتبطة:', fetchError);
      console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers');
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch linked accounts',
        message: 'خطأ في جلب الحسابات المرتبطة - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب الحسابات المرتبطة:', error);
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
    message: 'Only GET method is allowed for fetching linked accounts (حسب Google Ads API Documentation)',
    docs: 'https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers'
  }, { status: 405 });
}
