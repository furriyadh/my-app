import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl } from '@/lib/config';

/**
 * Google OAuth2 Linked Accounts Handler - يتبع الممارسات الرسمية من Google Ads API Documentation
 * المصادر الرسمية:
 * - https://developers.google.com/google-ads/api/docs/oauth/overview
 * - https://developers.google.com/google-ads/api/docs/reference/rest/v20/customers/listAccessibleCustomers
 */

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

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 جلب الحسابات المرتبطة (حسب Google Ads API Documentation)...');
    
    const cookieStore = await cookies();
    const userRefreshToken = cookieStore.get('oauth_refresh_token')?.value;
    
    // 🔑 الحصول على Access Token - MCC أولاً
    const accessToken = await getValidAccessToken(userRefreshToken);
    
    if (!accessToken) {
      console.error('❌ لم يتم العثور على access token صالح');
      return NextResponse.json({
        success: false,
        error: 'No access token available',
        message: 'لم يتم العثور على رمز وصول صالح'
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
      const response = await fetch(`${getBackendUrl()}/api/oauth/accounts`, {
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
