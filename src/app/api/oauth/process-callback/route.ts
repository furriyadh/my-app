import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Google OAuth2 Process Callback Handler - يتبع الممارسات الرسمية من Google Ads API Documentation
 * المصادر الرسمية:
 * - https://developers.google.com/google-ads/api/docs/oauth/overview
 * - https://developers.google.com/google-ads/api/docs/oauth/installed-app
 * - https://developers.google.com/identity/protocols/oauth2
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 معالجة OAuth callback متقدمة (حسب Google Ads API Documentation)...');
    
    const { code, state } = await request.json();
    
    // التحقق من وجود authorization code (مطلوب حسب Google Ads API Documentation)
    if (!code) {
      console.error('❌ authorization code مطلوب');
      console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/installed-app');
      return NextResponse.json({
        success: false,
        error: 'Authorization code is required',
        message: 'رمز التصريح مطلوب - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/google-ads/api/docs/oauth/installed-app'
      }, { status: 400 });
    }
    
    // الحصول على البيانات المحفوظة من cookies (حسب الممارسات الرسمية)
    const cookieStore = await cookies();
    const savedState = cookieStore.get('oauth_state')?.value;
    const codeVerifier = cookieStore.get('oauth_code_verifier')?.value;
    const mccCustomerId = cookieStore.get('oauth_mcc_customer_id')?.value;
    
    // التحقق من تطابق state parameter (للأمان حسب Google Identity Platform)
    if (state && savedState && state !== savedState) {
      console.error('❌ state parameter غير متطابق');
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2');
      return NextResponse.json({
        success: false,
        error: 'Invalid state parameter',
        message: 'معامل الأمان غير صحيح - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/identity/protocols/oauth2'
      }, { status: 400 });
    }
    
    // معالجة الكود مباشرة في الفرونت اند (بدون الباك اند)
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    // استخدام نفس منطق تحديد redirect_uri المستخدم في مسار OAuth الرئيسي (يدعم التطوير والإنتاج)
    const redirectUriFromEnv =
      process.env.GOOGLE_REDIRECT_URI ||
      process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI ||
      '';

    const redirectUri =
      redirectUriFromEnv ||
      (process.env.NODE_ENV === 'production'
        ? 'https://furriyadh.com/api/oauth/google/callback'
        : 'http://localhost:3000/api/oauth/google/callback');
    
    if (!clientId || !clientSecret) {
      console.error('❌ Client ID أو Client Secret غير محدد');
      return NextResponse.json({
        success: false,
        error: 'OAuth configuration missing',
        message: 'إعدادات OAuth غير مكتملة'
      }, { status: 500 });
    }
    
    // التحقق من وجود code_verifier
    if (!codeVerifier) {
      console.error('❌ code_verifier مطلوب');
      return NextResponse.json({
        success: false,
        error: 'Code verifier is required',
        message: 'رمز التحقق مطلوب'
      }, { status: 400 });
    }
    
    // تبادل الكود مع Google مباشرة
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    
    if (!tokenResponse.ok) {
      console.error('❌ فشل في معالجة callback:', tokenResponse.status, tokenResponse.statusText);
      const errorText = await tokenResponse.text();
      console.error('❌ تفاصيل الخطأ:', errorText);
      return NextResponse.json({
        success: false,
        error: 'Failed to exchange code for tokens',
        message: 'فشل في تبادل الكود مع Google'
      }, { status: 500 });
    }
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.access_token) {
      console.log('✅ تم المصادقة بنجاح (حسب Google Ads API Documentation)');
      
      // حفظ بيانات المستخدم في cookies (حسب الممارسات الرسمية)
      const successResponse = NextResponse.json({
        success: true,
        message: 'تم المصادقة بنجاح - يتبع الممارسات الرسمية'
      });
      
      // حفظ بيانات الجلسة (حسب Google Identity Platform)
      if (tokenData.access_token) {
        successResponse.cookies.set('oauth_access_token', tokenData.access_token, {
          httpOnly: true,        // يمنع الوصول من JavaScript
          secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
          sameSite: 'strict',    // يمنع هجمات CSRF
          maxAge: 3600,          // ساعة واحدة
          path: '/'
        });
      }
      
      if (tokenData.refresh_token) {
        successResponse.cookies.set('oauth_refresh_token', tokenData.refresh_token, {
          httpOnly: true,        // يمنع الوصول من JavaScript
          secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
          sameSite: 'strict',    // يمنع هجمات CSRF
          maxAge: 2592000,       // 30 يوم
          path: '/'
        });
      }
      
      // الحصول على معلومات المستخدم من Google
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });
        
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          successResponse.cookies.set('oauth_user_info', JSON.stringify(userInfo), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600
          });
        }
      } catch (userError) {
        console.warn('⚠️ فشل في الحصول على معلومات المستخدم:', userError);
      }
      
      // حفظ معلومات إضافية (حسب Google Ads API Documentation)
      if (tokenData.expires_in) {
        successResponse.cookies.set('oauth_expires_in', tokenData.expires_in.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 3600
        });
      }
      
      if (tokenData.scope) {
        successResponse.cookies.set('oauth_scope', tokenData.scope, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 3600
        });
      }
      
      // حذف البيانات المؤقتة (حسب الممارسات الرسمية)
      successResponse.cookies.delete('oauth_code_verifier');
      successResponse.cookies.delete('oauth_state');
      successResponse.cookies.delete('oauth_mcc_customer_id');
      successResponse.cookies.delete('oauth_redirect_after');
      
      return successResponse;
    } else {
      console.error('❌ فشل في المصادقة:', tokenData);
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        message: 'فشل في المصادقة'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في معالجة callback:', error);
    console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/installed-app');
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم - راجع المصادر الرسمية',
      docs: 'https://developers.google.com/google-ads/api/docs/oauth/installed-app'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only POST method is allowed for processing callback (حسب Google Identity Platform)',
    docs: 'https://developers.google.com/identity/protocols/oauth2'
  }, { status: 405 });
}
