import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Google OAuth2 Revoke Handler - يتبع الممارسات الرسمية من Google Identity Platform
 * المصادر الرسمية:
 * - https://developers.google.com/identity/protocols/oauth2
 * - https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🚫 إلغاء OAuth (حسب Google Identity Platform)...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    const refreshToken = cookieStore.get('oauth_refresh_token')?.value;
    
    // إلغاء tokens في Google (حسب Google Identity Platform)
    if (accessToken) {
      try {
        console.log('🔄 إلغاء access token في Google...');
        const revokeResponse = await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: accessToken,
          }),
        });
        
        if (revokeResponse.ok) {
          console.log('✅ تم إلغاء access token في Google بنجاح (حسب Google Identity Platform)');
        } else {
          console.warn('⚠️ فشل في إلغاء access token في Google');
          console.warn('📋 راجع: https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke');
        }
      } catch (revokeError) {
        console.warn('⚠️ خطأ في إلغاء access token في Google:', revokeError);
        console.warn('📋 راجع: https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke');
      }
    }
    
    // إلغاء refresh token أيضاً (حسب الممارسات الرسمية)
    if (refreshToken) {
      try {
        console.log('🔄 إلغاء refresh token في Google...');
        const revokeRefreshResponse = await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: refreshToken,
          }),
        });
        
        if (revokeRefreshResponse.ok) {
          console.log('✅ تم إلغاء refresh token في Google بنجاح');
        } else {
          console.warn('⚠️ فشل في إلغاء refresh token في Google');
        }
      } catch (revokeError) {
        console.warn('⚠️ خطأ في إلغاء refresh token في Google:', revokeError);
      }
    }
    
    // الاتصال بالباك اند لإلغاء OAuth (حسب Google Ads API Documentation)
    const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:5000');
    
    try {
      console.log('🔄 إلغاء OAuth في الباك اند...');
      const backendResponse = await fetch(`${backendUrl}/api/oauth/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken
        })
      });
      
      if (backendResponse.ok) {
        console.log('✅ تم إلغاء OAuth في الباك اند بنجاح');
      } else {
        console.warn('⚠️ فشل في إلغاء OAuth في الباك اند');
      }
    } catch (backendError) {
      console.warn('⚠️ فشل في الاتصال بالباك اند لإلغاء OAuth:', backendError);
      console.warn('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview');
    }
    
    // حذف جميع cookies المتعلقة بـ OAuth (حسب الممارسات الرسمية)
    const response = NextResponse.json({
      success: true,
      message: 'تم إلغاء OAuth بنجاح - يتبع Google Identity Platform',
      docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke'
    });
    
    // حذف cookies (حسب الممارسات الرسمية)
    response.cookies.delete('oauth_access_token');
    response.cookies.delete('oauth_refresh_token');
    response.cookies.delete('oauth_user_info');
    response.cookies.delete('oauth_expires_in');
    response.cookies.delete('oauth_scope');
    response.cookies.delete('oauth_code_verifier');
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_mcc_customer_id');
    response.cookies.delete('oauth_redirect_after');
    
    console.log('✅ تم حذف جميع بيانات OAuth بنجاح (حسب الممارسات الرسمية)');
    
    return response;
    
  } catch (error) {
    console.error('❌ خطأ في إلغاء OAuth:', error);
    console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke');
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ في إلغاء OAuth - راجع المصادر الرسمية',
      docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only POST method is allowed for OAuth revocation (حسب Google Identity Platform)',
    docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke'
  }, { status: 405 });
}
