import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl } from '@/lib/config';

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
    console.log('🏢 جلب حسابات MCC...');
    
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
    
    // الاتصال بالباك اند لجلب حسابات MCC
    const response = await fetch(`${getBackendUrl()}/api/oauth/mcc-accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('❌ فشل في جلب حسابات MCC:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch MCC accounts',
        message: 'فشل في جلب حسابات MCC'
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب حسابات MCC بنجاح:', data.accounts?.length || 0, 'حساب');
      return NextResponse.json({
        success: true,
        accounts: data.accounts,
        message: 'تم جلب حسابات MCC بنجاح'
      });
    } else {
      console.error('❌ فشل في جلب حسابات MCC:', data);
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to fetch MCC accounts',
        message: data.message || 'فشل في جلب حسابات MCC'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب حسابات MCC:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET method is allowed for fetching MCC accounts'
  }, { status: 405 });
}
