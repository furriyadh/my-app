import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'crypto';

// TypeScript interfaces
interface GoogleAdsAccount {
  id: string;
  name: string;
  currency_code: string;
  time_zone: string;
  is_manager_account: boolean;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
}

// إعداد Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// إعداد Google OAuth مع جميع الـ Scopes
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// جميع الـ Scopes المطلوبة
const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/adwords'
].join(' ' );

// Google APIs configuration
const GOOGLE_ADS_API_VERSION = 'v16';
const GOOGLE_ADS_API_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

export async function GET(request: NextRequest ) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // إذا لم يكن هناك code، فهذا طلب لبدء OAuth
    if (!code && !error) {
      return handleOAuthInitiation(request);
    }

    // إذا كان هناك code، فهذا callback من Google
    return handleOAuthCallback(request, code, error, state);

  } catch (error) {
    console.error('OAuth error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Error</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5; }
          .error-message { text-align: center; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1 ); color: #d32f2f; }
        </style>
      </head>
      <body>
        <div class="error-message">
          <h2>Authentication Failed</h2>
          <p>${errorMessage}</p>
          <p>This window will close automatically.</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'oauthError', payload: { message: '${errorMessage}' } }, '*');
          }
          setTimeout(function() {
            window.close();
          }, 3000);
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// معالجة بدء OAuth
async function handleOAuthInitiation(request: NextRequest) {
  // التحقق من متغيرات البيئة المطلوبة
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    console.error('Missing required Google OAuth configuration');
    return NextResponse.json(
      { 
        error: 'OAuth configuration error',
        message: 'Missing required Google OAuth environment variables'
      },
      { status: 500 }
    );
  }

  // إنشاء state parameter للحماية من CSRF attacks
  const state = randomBytes(32).toString('hex');
  
  // بناء Google OAuth authorization URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth' );
  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GOOGLE_OAUTH_SCOPES);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('include_granted_scopes', 'true');

  // إنشاء response مع redirect إلى Google
  const response = NextResponse.redirect(authUrl.toString());

  // حفظ state parameter في cookie للتحقق لاحقاً
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 دقائق
    path: '/'
  } );

  return response;
}

// معالجة OAuth callback
async function handleOAuthCallback(request: NextRequest, code: string | null, error: string | null, state: string | null) {
  // التحقق من state parameter للحماية من CSRF
  const storedState = request.cookies.get("oauth_state")?.value;
  if (!state || state !== storedState) {
    console.error("Invalid state parameter");
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head><title>OAuth Error</title></head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'oauthError', payload: { message: 'Invalid state parameter' } }, '*');
          }
          window.close();
        </script>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }

  // التحقق من وجود خطأ في OAuth
  if (error) {
    console.error("OAuth Error:", error);
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head><title>OAuth Error</title></head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'oauthError', payload: { message: '${encodeURIComponent(error)}' } }, '*');
          }
          window.close();
        </script>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }

  // التحقق من وجود authorization code
  if (!code) {
    console.error("No authorization code received");
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head><title>OAuth Error</title></head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'oauthError', payload: { message: 'No authorization code received' } }, '*');
          }
          window.close();
        </script>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }

  // تبديل authorization code بـ access token
  const { tokens } = await oauth2Client.getToken(code);
  
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to get tokens from Google');
  }

  // الحصول على معلومات المستخدم من Google
  oauth2Client.setCredentials(tokens);
  
  const userInfoResponse = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
   );
  
  if (!userInfoResponse.ok) {
    throw new Error('Failed to get user info from Google');
  }
  
  const userInfo: GoogleUserInfo = await userInfoResponse.json();

  // التحقق من صحة البيانات المطلوبة
  if (!userInfo.email || !userInfo.id) {
    throw new Error('Invalid user info received from Google');
  }

  // جلب جميع البيانات من Google APIs
  let googleAdsAccounts: GoogleAdsAccount[] = [];

  
  try {
    // جلب حسابات Google Ads
    googleAdsAccounts = await fetchGoogleAdsAccounts(tokens.access_token);

    
  } catch (apiError) {
    console.warn('Failed to fetch some Google API data:', apiError);
    // لا نرمي خطأ هنا، سنحاول لاحقاً
  }

  // البحث عن المستخدم في قاعدة البيانات
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', userInfo.email)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Database fetch error:', fetchError);
    throw new Error('Database error while fetching user');
  }

  let userId: string;
  let isNewUser = false;

  if (existingUser) {
    // تحديث المستخدم الموجود
    userId = existingUser.id;
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        name: userInfo.name || existingUser.name,
        picture: userInfo.picture || existingUser.picture,
        google_id: userInfo.id,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      throw new Error('Failed to update user information');
    }
  } else {
    // إنشاء مستخدم جديد
    isNewUser = true;
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split('@')[0],
        picture: userInfo.picture,
        google_id: userInfo.id,
        provider: 'google',
        email_verified: userInfo.verified_email || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError || !newUser) {
      console.error('Error creating user:', insertError);
      throw new Error('Failed to create user account');
    }

    userId = newUser.id;
  }

  // حفظ أو تحديث Google OAuth tokens مع جميع الـ Scopes
  const { error: tokenError } = await supabase
    .from('user_oauth_tokens')
    .upsert({
      user_id: userId,
      provider: 'google',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      scope: tokens.scope || GOOGLE_OAUTH_SCOPES,
      token_type: tokens.token_type || 'Bearer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,provider'
    });

  if (tokenError) {
    console.error('Error saving OAuth tokens:', tokenError);
  }

  // حفظ جميع الحسابات في قاعدة البيانات
  await saveAccountsToDatabase(userId, {
    googleAdsAccounts
  });

  // إنشاء session token
  const sessionToken = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 يوم

  // حفظ الجلسة في قاعدة البيانات
  const { error: sessionError } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    });

  if (sessionError) {
    console.error('Error creating session:', sessionError);
    throw new Error('Failed to create user session');
  }

  // إعداد الاستجابة مع cookies
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // توجيه المستخدم إلى صفحة إنشاء الحملة مع معلومات جميع الحسابات المربوطة
  // إغلاق النافذة المنبثقة بعد إتمام الأذونات بنجاح
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Success</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .success-message {
          text-align: center;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1 );
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="success-message">
        <div class="spinner"></div>
        <h2>Authentication Successful!</h2>
        <p>Your account has been connected successfully. This window will close automatically.</p>
      </div>
      <script>
        try {
          // إرسال رسالة للنافذة الأصلية
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'oauthSuccess', 
              payload: { 
                ads_accounts: ${googleAdsAccounts.length},
                success: true 
              } 
            }, '*');
          }
          
          // إغلاق النافذة بعد ثانيتين
          setTimeout(function() {
            window.close();
          }, 2000);
          
          // محاولة إغلاق فوري كنسخة احتياطية
          window.close();
          
        } catch (error) {
          console.error('Error closing popup:', error);
          // في حالة فشل الإغلاق، إعادة توجيه للصفحة الرئيسية
          setTimeout(function() {
            window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}';
          }, 3000 );
        }
      </script>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// حفظ جميع الحسابات في قاعدة البيانات
async function saveAccountsToDatabase(userId: string, accounts: {
  googleAdsAccounts: GoogleAdsAccount[];
}) {
  const { googleAdsAccounts } = accounts;

  // حفظ حسابات Google Ads
  if (googleAdsAccounts.length > 0) {
    const { error: adsError } = await supabase
      .from('user_google_ads_accounts')
      .upsert(
        googleAdsAccounts.map((account: GoogleAdsAccount) => ({
          user_id: userId,
          account_id: account.id,
          account_name: account.name,
          currency_code: account.currency_code,
          time_zone: account.time_zone,
          is_manager_account: account.is_manager_account || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'user_id,account_id' }
      );

    if (adsError) {
      console.error('Error saving Google Ads accounts:', adsError);
    }
  }
}


// جلب حسابات Google Ads
async function fetchGoogleAdsAccounts(accessToken: string): Promise<GoogleAdsAccount[]> {
  try {
    const response = await fetch(`${GOOGLE_ADS_API_BASE_URL}/customers:listAccessibleCustomers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Ads API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.resourceNames || data.resourceNames.length === 0) {
      return [];
    }

    // جلب تفاصيل كل حساب
    const accounts: GoogleAdsAccount[] = [];
    for (const resourceName of data.resourceNames) {
      const customerId = resourceName.split('/')[1];
      
      try {
        const accountResponse = await fetch(`${GOOGLE_ADS_API_BASE_URL}/customers/${customerId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
            'Content-Type': 'application/json',
          },
        });

        if (accountResponse.ok) {
          const accountData = await accountResponse.json();
          accounts.push({
            id: customerId,
            name: accountData.descriptiveName || `Account ${customerId}`,
            currency_code: accountData.currencyCode || 'USD',
            time_zone: accountData.timeZone || 'UTC',
            is_manager_account: accountData.manager || false,
          });
        }
      } catch (accountError) {
        console.warn(`Failed to fetch details for account ${customerId}:`, accountError);
      }
    }

    return accounts;
  } catch (error) {
    console.error('Error fetching Google Ads accounts:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

// دالة مساعدة لإنشاء session token
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
