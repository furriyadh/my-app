

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from 'dotenv';
import path from 'path';

// تحميل متغيرات البيئة بشكل صريح
config({ path: path.resolve(process.cwd(), '.env.development') });

/**
 * Google OAuth2 Callback Handler - يتبع الممارسات الرسمية من Google Ads API Documentation
 * المصادر الرسمية:
 * - https://developers.google.com/google-ads/api/docs/oauth/overview
 * - https://developers.google.com/google-ads/api/docs/oauth/installed-app
 * - https://developers.google.com/identity/protocols/oauth2
 */

export async function GET(request: NextRequest) {
  // تحديد base URL مرة واحدة في بداية الدالة (خارج try-catch)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    console.log('🔄 معالجة OAuth callback من Google (حسب Google Ads API Documentation)...');
    console.log('🔗 Callback Base URL:', baseUrl);
    console.log('🔗 Full Request URL:', request.url);
    
    // الحصول على معاملات من الطلب (حسب Google Identity Platform)
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    console.log('📊 معاملات Callback:', { code: code ? 'present' : 'missing', state, error });
    
    // التحقق من وجود خطأ من Google (حسب Google Identity Platform)
    if (error) {
      console.error('❌ خطأ من Google OAuth:', error);
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2');
      return NextResponse.redirect(
        `${baseUrl}/campaign/new?error=oauth_error&message=${encodeURIComponent(error)}&docs=${encodeURIComponent('https://developers.google.com/identity/protocols/oauth2')}`
      );
    }
    
    // التحقق من وجود authorization code (مطلوب حسب Google Ads API Documentation)
    if (!code) {
      console.error('❌ لم يتم استلام authorization code');
      console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/installed-app');
      return NextResponse.redirect(
        `${baseUrl}/campaign/new?error=no_code&message=${encodeURIComponent('لم يتم استلام رمز التصريح')}&docs=${encodeURIComponent('https://developers.google.com/google-ads/api/docs/oauth/installed-app')}`
      );
    }
    
    // التحقق من وجود state parameter (للأمان حسب Google Identity Platform)
    if (!state) {
      console.error('❌ لم يتم استلام state parameter');
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2');
      return NextResponse.redirect(
        `${baseUrl}/campaign/new?error=no_state&message=${encodeURIComponent('لم يتم استلام معامل الأمان')}&docs=${encodeURIComponent('https://developers.google.com/identity/protocols/oauth2')}`
      );
    }
    
    // الحصول على البيانات المحفوظة من cookies (حسب الممارسات الرسمية)
    const cookieStore = await cookies();
    const savedState = cookieStore.get('oauth_state')?.value;
    const codeVerifier = cookieStore.get('oauth_code_verifier')?.value;
    const mccCustomerId = cookieStore.get('oauth_mcc_customer_id')?.value;
    const redirectAfter = cookieStore.get('oauth_redirect_after')?.value;
    
    // التحقق من تطابق state parameter (للأمان حسب Google Identity Platform)
    if (!savedState || state !== savedState) {
      console.error('❌ state parameter غير متطابق');
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2');
      return NextResponse.redirect(
        `${baseUrl}/campaign/new?error=invalid_state&message=${encodeURIComponent('معامل الأمان غير صحيح')}&docs=${encodeURIComponent('https://developers.google.com/identity/protocols/oauth2')}`
      );
    }
    
    // التحقق من وجود code_verifier (مطلوب لـ PKCE حسب Google Identity Platform)
    if (!codeVerifier) {
      console.error('❌ لم يتم العثور على code_verifier');
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2');
      return NextResponse.redirect(
        `${baseUrl}/campaign/new?error=no_code_verifier&message=${encodeURIComponent('مفتاح التحقق غير موجود')}&docs=${encodeURIComponent('https://developers.google.com/identity/protocols/oauth2')}`
      );
    }
    
    console.log('✅ تم التحقق من جميع المعاملات بنجاح (حسب Google Ads API Documentation)');
    
    // معالجة الكود مباشرة في الفرونت اند (بدون الباك اند)
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/oauth/google/callback`;
    
    if (!clientId || !clientSecret) {
      console.error('❌ Client ID أو Client Secret غير محدد');
      return NextResponse.redirect(
        `${baseUrl}/campaign/new?error=config_error&message=${encodeURIComponent('إعدادات OAuth غير مكتملة')}`
      );
    }
    
    // تبادل الكود مع Google مباشرة
          console.log('🔍 بدء token exchange...');
            const tokenBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });
      
      console.log('🔍 Body المرسل:', {
        client_id: clientId ? 'موجود' : 'غير موجود',
        client_secret: clientSecret ? 'موجود' : 'غير موجود',
        code: code ? 'موجود' : 'غير موجود',
        code_verifier: codeVerifier ? 'موجود' : 'غير موجود',
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenBody,
        signal: AbortSignal.timeout(10000) // 10 seconds timeout for OAuth token exchange
      });
    
    if (!tokenResponse.ok) {
      console.error('❌ فشل في معالجة callback:', tokenResponse.status, tokenResponse.statusText);
      console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/installed-app');
      const errorText = await tokenResponse.text();
      console.error('❌ تفاصيل الخطأ:', errorText);
      console.error('❌ Headers المرسلة:', {
        'Content-Type': 'application/x-www-form-urlencoded',
        'client_id': process.env.GOOGLE_ADS_CLIENT_ID ? 'موجود' : 'غير موجود',
        'client_secret': process.env.GOOGLE_ADS_CLIENT_SECRET ? 'موجود' : 'غير موجود',
        'code': code ? 'موجود' : 'غير موجود',
        'code_verifier': codeVerifier ? 'موجود' : 'غير موجود'
      });
      return NextResponse.redirect(
        `${baseUrl}/campaign/new?error=callback_failed&message=${encodeURIComponent('فشل في معالجة الاستجابة')}&docs=${encodeURIComponent('https://developers.google.com/google-ads/api/docs/oauth/installed-app')}`
      );
    }
    
    const tokenData = await tokenResponse.json();
    console.log('🔍 Token exchange نجح:', {
      access_token: tokenData.access_token ? 'موجود' : 'غير موجود',
      refresh_token: tokenData.refresh_token ? 'موجود' : 'غير موجود',
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in
    });
    
    if (tokenData.access_token) {
      console.log('✅ تم المصادقة بنجاح (حسب Google Ads API Documentation)');
      
      // تحديد صفحة التحويل بعد OAuth من state
      let redirectAfter = '/integrations/google-ads'; // تغيير الافتراضي
      try {
        if (state) {
          const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
          redirectAfter = stateData.redirect_after || '/integrations/google-ads';
          console.log('🔍 redirect_after من state:', redirectAfter);
        }
      } catch (error) {
        console.log('⚠️ لا يمكن قراءة redirect_after من state، استخدام القيمة الافتراضية:', redirectAfter);
      }
      
      // حفظ بيانات المستخدم في cookies (حسب الممارسات الرسمية)
      const successResponse = NextResponse.redirect(
        `${baseUrl}${redirectAfter}?oauth_success=true&message=${encodeURIComponent('تم ربط الحساب بنجاح')}`
      );
      
      // حفظ بيانات الجلسة (حسب Google Identity Platform)
      console.log('🔍 فحص access_token:', tokenData.access_token ? 'موجود' : 'غير موجود');
      console.log('🔍 طول access_token:', tokenData.access_token ? tokenData.access_token.length : 0);
      if (tokenData.access_token) {
        console.log('💾 حفظ access_token في الكوكيز...');
        console.log('🔍 Token length:', tokenData.access_token.length);
        console.log('🔍 Token preview:', tokenData.access_token.substring(0, 50) + '...');
        successResponse.cookies.set('oauth_access_token', tokenData.access_token, {
          httpOnly: true,
          secure: false, // تعطيل HTTPS في التطوير
          sameSite: 'lax',
          maxAge: 3600, // 1 hour for testing
          path: '/' // تأكد من أن الكوكي متاح في جميع المسارات
          // إزالة domain للسماح بـ localhost
        });
        
        // إضافة cookie لحالة الاتصال
        successResponse.cookies.set('google_ads_connected', 'true', {
          httpOnly: false, // يجب أن يكون false ليكون متاحاً في JavaScript
          secure: false, // تعطيل HTTPS في التطوير
          sameSite: 'lax',
          maxAge: 34560000, // 400 يوم (أقصى مدة)
          path: '/' // تأكد من أن الكوكي متاح في جميع المسارات
        });
      }
      
      if (tokenData.refresh_token) {
        successResponse.cookies.set('oauth_refresh_token', tokenData.refresh_token, {
          httpOnly: true,
          secure: false, // تعطيل HTTPS في التطوير
          sameSite: 'lax',
          maxAge: 3600, // 1 hour for testing
          path: '/' // تأكد من أن الكوكي متاح في جميع المسارات
          // إزالة domain للسماح بـ localhost
        });
      }
      
      // الحصول على معلومات المستخدم من Google
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          },
          signal: AbortSignal.timeout(5000) // 5 seconds for user info
        });
        
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          console.log('🔍 معلومات المستخدم:', { 
            id: userInfo.id, 
            email: userInfo.email, 
            name: userInfo.name,
            picture: userInfo.picture,
            verified_email: userInfo.verified_email
          });
          
          // حفظ معلومات المستخدم في cookies
          successResponse.cookies.set('oauth_user_info', JSON.stringify(userInfo), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600
          });
          
          // حفظ بيانات المستخدم الكاملة في قاعدة البيانات
          try {
            const { saveUserProfile } = await import('@/lib/supabase');
            const savedProfile = await saveUserProfile(userInfo);
            if (savedProfile) {
              console.log('✅ تم حفظ بيانات المستخدم الكاملة في قاعدة البيانات');
            } else {
              console.warn('⚠️ فشل في حفظ بيانات المستخدم في قاعدة البيانات');
            }
          } catch (dbError) {
            console.warn('⚠️ خطأ في حفظ بيانات المستخدم في قاعدة البيانات:', dbError);
          }
          
          // Skip background account saving for now - accounts will be fetched on demand
          console.log('⚡ تم تخطي حفظ الحسابات في الخلفية - سيتم جلبها عند الطلب')
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
      console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/installed-app');
      return NextResponse.redirect(
        `${baseUrl}/campaign/new?error=auth_failed&message=${encodeURIComponent('فشل في المصادقة')}&docs=${encodeURIComponent('https://developers.google.com/google-ads/api/docs/oauth/installed-app')}`
      );
    }
    
  } catch (error) {
    console.error('❌ خطأ في معالجة callback:', error);
    console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/installed-app');
    return NextResponse.redirect(
      `${baseUrl}/campaign/new?error=callback_error&message=${encodeURIComponent('خطأ في معالجة الاستجابة')}&docs=${encodeURIComponent('https://developers.google.com/google-ads/api/docs/oauth/installed-app')}`
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET method is allowed for OAuth callback (حسب Google Identity Platform)',
    docs: 'https://developers.google.com/identity/protocols/oauth2'
  }, { status: 405 });
}
