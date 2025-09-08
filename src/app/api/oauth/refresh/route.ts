import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Google OAuth2 Refresh Handler - يتبع الممارسات الرسمية من Google Identity Platform
 * المصادر الرسمية:
 * - https://developers.google.com/identity/protocols/oauth2
 * - https://developers.google.com/identity/protocols/oauth2/web-server#offline
 */

/**
 * Google OAuth2 Refresh Handler - يتبع الممارسات الرسمية من Google Identity Platform
 * المصادر الرسمية:
 * - https://developers.google.com/identity/protocols/oauth2
 * - https://developers.google.com/identity/protocols/oauth2/web-server#offline
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 تجديد OAuth token (حسب Google Identity Platform)...');
    
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('oauth_refresh_token')?.value;
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    
    if (!refreshToken) {
      console.error('❌ لم يتم العثور على refresh token');
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2/web-server#offline');
      return NextResponse.json({
        success: false,
        error: 'Refresh token not found',
        message: 'لم يتم العثور على refresh token - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#offline'
      }, { status: 400 });
    }
    
    if (!clientId || !clientSecret) {
      console.error('❌ Client ID أو Client Secret غير محدد');
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2/web-server#offline');
      return NextResponse.json({
        success: false,
        error: 'Client credentials not configured',
        message: 'Client ID أو Client Secret غير محدد - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#offline'
      }, { status: 500 });
    }
    
    // تجديد access token (حسب Google Identity Platform)
    try {
      console.log('🔄 تجديد access token في Google...');
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });
      
      if (refreshResponse.ok) {
        const tokenData = await refreshResponse.json();
        console.log('✅ تم تجديد access token بنجاح (حسب Google Identity Platform)');
        
        // حفظ الـ token الجديد في cookies
        const response = NextResponse.json({
          success: true,
          message: 'تم تجديد access token بنجاح - يتبع Google Identity Platform',
          access_token: tokenData.access_token,
          expires_in: tokenData.expires_in,
          token_type: tokenData.token_type || 'Bearer',
          scope: tokenData.scope,
          docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#offline'
        });
        
        // حفظ access token الجديد
        response.cookies.set('oauth_access_token', tokenData.access_token, {
          httpOnly: true,        // يمنع الوصول من JavaScript
          secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
          sameSite: 'strict',    // يمنع هجمات CSRF
          maxAge: tokenData.expires_in || 3600,
          path: '/'
        });
        
        // حفظ معلومات إضافية
        if (tokenData.expires_in) {
          response.cookies.set('oauth_expires_in', tokenData.expires_in.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600
          });
        }
        
        if (tokenData.scope) {
          response.cookies.set('oauth_scope', tokenData.scope, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600
          });
        }
        
        return response;
        
      } else {
        const errorData = await refreshResponse.text();
        console.error('❌ فشل في تجديد access token:', refreshResponse.status, errorData);
        console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2/web-server#offline');
        
        return NextResponse.json({
          success: false,
          error: 'Token refresh failed',
          message: 'فشل في تجديد access token - راجع المصادر الرسمية',
          status: refreshResponse.status,
          docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#offline'
        }, { status: 400 });
      }
      
    } catch (refreshError) {
      console.error('❌ خطأ في تجديد access token:', refreshError);
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2/web-server#offline');
      
      return NextResponse.json({
        success: false,
        error: 'Token refresh error',
        message: 'خطأ في تجديد access token - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#offline'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في تجديد OAuth:', error);
    console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2');
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ في تجديد OAuth - راجع المصادر الرسمية',
      docs: 'https://developers.google.com/identity/protocols/oauth2'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only POST method is allowed for OAuth refresh (حسب Google Identity Platform)',
    docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#offline'
  }, { status: 405 });
}
