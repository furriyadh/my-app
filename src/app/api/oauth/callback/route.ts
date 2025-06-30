// src/app/api/oauth/callback/route.ts
// OAuth callback handler لمعالجة استجابة Google OAuth

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // تعريف baseUrl في بداية الدالة ليكون متاحاً في جميع أنحاء الدالة
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('OAuth Callback received:', { code: !!code, state, error });

    // التحقق من وجود خطأ في OAuth
    if (error) {
      console.error('OAuth Error:', error);
      const errorMessage = encodeURIComponent('حدث خطأ أثناء ربط حساب Google Ads: ' + error);
      const redirectUrl = new URL('/dashboard', baseUrl);
      redirectUrl.searchParams.set('error', errorMessage);
      return NextResponse.redirect(redirectUrl.toString());
    }

    // التحقق من وجود authorization code
    if (!code) {
      console.error('No authorization code received');
      const errorMessage = encodeURIComponent('لم يتم الحصول على رمز التفويض من Google');
      const redirectUrl = new URL('/dashboard', baseUrl);
      redirectUrl.searchParams.set('error', errorMessage);
      return NextResponse.redirect(redirectUrl.toString());
    }

    // تحديد redirectUri بناءً على البيئة
    const currentRedirectUri = process.env.NODE_ENV === 'production'
      ? 'https://furriyadh.com/api/oauth/callback'
      : 'http://localhost:3000/api/oauth/callback';

    console.log('DEBUG: currentRedirectUri:', currentRedirectUri);

    const tokenResponse = await exchangeCodeForToken(code, currentRedirectUri);

    if (tokenResponse.success) {
      console.log('✅ Token exchange successful, redirecting to dashboard...');
      // هنا يمكنك حفظ الـ access_token والـ refresh_token في قاعدة البيانات أو في جلسة المستخدم
      // ثم إعادة توجيه المستخدم إلى لوحة التحكم
      const redirectUrl = new URL('/dashboard', baseUrl);
      redirectUrl.searchParams.set('success', 'true');
      redirectUrl.searchParams.set('access_token', tokenResponse.access_token);
      if (tokenResponse.refresh_token) {
        redirectUrl.searchParams.set('refresh_token', tokenResponse.refresh_token);
      }
      return NextResponse.redirect(redirectUrl.toString());
    } else {
      console.error('❌ Token exchange failed:', tokenResponse.error);
      const errorMessage = encodeURIComponent('فشل في الحصول على رمز الوصول من Google: ' + tokenResponse.error);
      const redirectUrl = new URL('/dashboard', baseUrl);
      redirectUrl.searchParams.set('error', errorMessage);
      return NextResponse.redirect(redirectUrl.toString());
    }

  } catch (error: any) {
    console.error('❌ Error in OAuth callback:', error);
    const errorMessage = encodeURIComponent('حدث خطأ غير متوقع أثناء عملية OAuth: ' + error.message);
    const redirectUrl = new URL('/dashboard', baseUrl);
    redirectUrl.searchParams.set('error', errorMessage);
    return NextResponse.redirect(redirectUrl.toString());
  }
}

async function exchangeCodeForToken(code: string, redirectUri: string) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // DEBUGGING LOGS
    console.log("DEBUG: Loaded GOOGLE_CLIENT_ID:", clientId);
    console.log("DEBUG: Loaded GOOGLE_CLIENT_SECRET:", clientSecret ? clientSecret.substring(0, 5) + '...' : 'Not loaded');

    if (!clientId || !clientSecret) {
      console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables.');
      return { success: false, error: 'Missing client credentials' };
    }

    const tokenEndpoint = 'https://oauth2.googleapis.com/token';

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri, // استخدام الـ redirectUri المحدد
    });

    console.log('📤 Sending token exchange request to:', tokenEndpoint);
    console.log('📤 Request params:', {
      client_id: clientId,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code ? code.substring(0, 10) + '...' : 'Not set'
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    console.log('📥 Token exchange response status:', response.status);
    console.log('📥 Token exchange response:', {
      success: response.ok,
      error: data.error,
      error_description: data.error_description,
      hasAccessToken: !!data.access_token
    });

    if (!response.ok) {
      console.error('❌ Token exchange failed:', data);
      return {
        success: false,
        error: data.error_description || data.error || 'Token exchange failed'
      };
    }

    console.log('✅ Token exchange successful');
    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope
    };

  } catch (error: any) {
    console.error('❌ Error in token exchange:', error);
    return {
      success: false,
      error: error.message || 'Unknown error during token exchange'
    };
  }
}

