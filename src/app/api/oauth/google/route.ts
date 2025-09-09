import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { config } from 'dotenv';
import path from 'path';

// تحميل متغيرات البيئة حسب البيئة
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
config({ path: path.resolve(process.cwd(), envFile) });

/**
 * Google OAuth2 Manager - يتبع الممارسات الرسمية من Google Ads API Documentation
 * المصادر الرسمية:
 * - https://developers.google.com/google-ads/api/docs/oauth/overview
 * - https://developers.google.com/google-ads/api/docs/oauth/installed-app
 * - https://developers.google.com/identity/protocols/oauth2
 */

// توليد code_verifier و code_challenge لـ PKCE (حسب Google Identity Platform)
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}

// توليد state parameter للأمان (حسب Google Identity Platform)
function generateState() {
  return crypto.randomBytes(32).toString('base64url');
}

// Google OAuth Scopes المطلوبة (حسب Google Ads API Documentation)
const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/adwords',           // Google Ads API (مطلوب)
  'https://www.googleapis.com/auth/userinfo.email',    // معلومات البريد الإلكتروني
  'https://www.googleapis.com/auth/userinfo.profile',  // معلومات الملف الشخصي
  'openid',                                            // OpenID Connect (حسب Google Identity Platform)
  'profile',                                           // معلومات الملف الشخصي الأساسية
  'email'                                              // معلومات البريد الإلكتروني الأساسية
];

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 بدء OAuth مع Google (حسب Google Ads API Documentation)...');
    
    // الحصول على معاملات من الطلب
    const { searchParams } = new URL(request.url);
    const mcc_customer_id = searchParams.get('mcc_customer_id');
    const redirect_after = searchParams.get('redirect_after');
    
    console.log('📊 معاملات الطلب:', { mcc_customer_id, redirect_after });
    
    // التحقق من وجود client_id (مطلوب حسب Google Ads API Documentation)
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    if (!clientId) {
      console.error('❌ GOOGLE_ADS_CLIENT_ID غير محدد');
      console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview');
      return NextResponse.json({
        success: false,
        error: 'Google Client ID not configured',
        message: 'معرف العميل غير محدد - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/google-ads/api/docs/oauth/overview'
      }, { status: 500 });
    }
    
    // تحديد redirect_uri حسب البيئة (حسب Google Ads API Documentation)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:3000');
    const redirectUri = `${baseUrl}/api/oauth/google/callback`;
    
    // التحقق من تطابق redirect_uri مع Google Cloud Console
    console.log('🔍 NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 Final redirectUri:', redirectUri);
    console.log('🔗 Base URL:', baseUrl);
    console.log('🔗 Redirect URI:', redirectUri);
    
    // التحقق من أن redirect_uri يطابق Google Cloud Console
    const expectedRedirectUri = 'https://furriyadh.com/api/oauth/google/callback';
    if (redirectUri !== expectedRedirectUri) {
      console.error('❌ redirect_uri mismatch!');
      console.error('Expected:', expectedRedirectUri);
      console.error('Actual:', redirectUri);
    } else {
      console.log('✅ redirect_uri matches Google Cloud Console');
    }
    
    // توليد PKCE و state (حسب Google Identity Platform)
    const { codeVerifier, codeChallenge } = generatePKCE();
    const baseState = generateState();
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    // إضافة redirect_after إلى state إذا كان موجوداً
    const stateData = {
      state: baseState,
      redirect_after: redirect_after || '/integrations/google-ads'
    };
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');
    
    // بناء رابط المصادقة مع Google (حسب Google Identity Platform)
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', GOOGLE_OAUTH_SCOPES.join(' '));
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('access_type', 'offline');  // للحصول على refresh token
    authUrl.searchParams.set('prompt', 'consent');       // إجبار ظهور شاشة الأذونات
    authUrl.searchParams.set('include_granted_scopes', 'true');
    
    console.log('✅ تم إنشاء رابط المصادقة بنجاح (حسب Google Ads API Documentation)');
    console.log('🔗 رابط المصادقة:', authUrl.toString());
    console.log('📋 يتبع: https://developers.google.com/identity/protocols/oauth2');
    
    // فحص نوع الطلب - JSON أم redirect
    const acceptHeader = request.headers.get('accept');
    const isJsonRequest = acceptHeader?.includes('application/json');
    
    if (isJsonRequest) {
      // إرجاع البيانات كـ JSON للاستخدام مع JavaScript
      const jsonResponse = NextResponse.json({
        success: true,
        authUrl: authUrl.toString(),
        state: state,
        sessionId: sessionId,
        message: 'Authorization URL generated successfully',
        docs: 'https://developers.google.com/identity/protocols/oauth2'
      });
      
      jsonResponse.cookies.set('oauth_code_verifier', codeVerifier, {
        httpOnly: true,        // يمنع الوصول من JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
        sameSite: 'strict',    // يمنع هجمات CSRF
        maxAge: 600,
        path: '/'
      });
      
      jsonResponse.cookies.set('oauth_state', state, {
        httpOnly: true,        // يمنع الوصول من JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
        sameSite: 'strict',    // يمنع هجمات CSRF
        maxAge: 600,
        path: '/'
      });
      
      jsonResponse.cookies.set('oauth_session_id', sessionId, {
        httpOnly: true,        // يمنع الوصول من JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
        sameSite: 'strict',    // يمنع هجمات CSRF
        maxAge: 600,
        path: '/'
      });
      
      if (mcc_customer_id) {
        jsonResponse.cookies.set('oauth_mcc_customer_id', mcc_customer_id, {
          httpOnly: true,        // يمنع الوصول من JavaScript
          secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
          sameSite: 'strict',    // يمنع هجمات CSRF
          maxAge: 600,
          path: '/'
        });
      }
      
      if (redirect_after) {
        jsonResponse.cookies.set('oauth_redirect_after', redirect_after, {
          httpOnly: true,        // يمنع الوصول من JavaScript
          secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
          sameSite: 'strict',    // يمنع هجمات CSRF
          maxAge: 600,
          path: '/'
        });
      }
      
      return jsonResponse;
    }
    
    // حفظ البيانات المهمة في cookies للأمان (حسب الممارسات الرسمية) - للـ redirect
    const response = NextResponse.redirect(authUrl.toString());
    
    // حفظ code_verifier (مطلوب لـ PKCE)
    response.cookies.set('oauth_code_verifier', codeVerifier, {
      httpOnly: true,        // يمنع الوصول من JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
      sameSite: 'strict',    // يمنع هجمات CSRF
      maxAge: 600,           // 10 دقائق
      path: '/'
    });
    
    // حفظ state (للتحقق من الأمان)
    response.cookies.set('oauth_state', state, {
      httpOnly: true,        // يمنع الوصول من JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
      sameSite: 'strict',    // يمنع هجمات CSRF
      maxAge: 600,           // 10 دقائق
      path: '/'
    });
    
    // حفظ معاملات إضافية
    if (mcc_customer_id) {
      response.cookies.set('oauth_mcc_customer_id', mcc_customer_id, {
        httpOnly: true,        // يمنع الوصول من JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
        sameSite: 'strict',    // يمنع هجمات CSRF
        maxAge: 600,
        path: '/'
      });
    }
    
    if (redirect_after) {
      response.cookies.set('oauth_redirect_after', redirect_after, {
        httpOnly: true,        // يمنع الوصول من JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
        sameSite: 'strict',    // يمنع هجمات CSRF
        maxAge: 600,
        path: '/'
      });
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ خطأ في OAuth Google:', error);
    console.error('📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/installed-app');
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم',
      docs: 'https://developers.google.com/google-ads/api/docs/oauth/installed-app'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET method is allowed for OAuth initiation (حسب Google Identity Platform)',
    docs: 'https://developers.google.com/identity/protocols/oauth2'
  }, { status: 405 });
}
