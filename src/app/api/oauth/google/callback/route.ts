

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from 'dotenv';
import path from 'path';

// تحميل متغيرات البيئة حسب البيئة
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
config({ path: path.resolve(process.cwd(), envFile) });

// Helper function to get cookie options with proper domain
const getCookieOptions = (maxAge: number, httpOnly: boolean = true) => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
    // في الإنتاج، أضف domain للتأكد من أن الـ cookies تعمل على كل الـ subdomains
    ...(isProduction && { domain: '.furriyadh.com' })
  };
};


export async function GET(request: NextRequest) {
  // تحديد base URL مرة واحدة في بداية الدالة (خارج try-catch)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:3000');

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
      let redirectAfter = '/dashboard/google-ads/integrations/google-ads'; // تغيير الافتراضي
      try {
        if (state) {
          const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
          redirectAfter = stateData.redirect_after || '/dashboard/google-ads/integrations/google-ads';
          console.log('🔍 redirect_after من state:', redirectAfter);
        }
      } catch (error) {
        console.log('⚠️ لا يمكن قراءة redirect_after من state، استخدام القيمة الافتراضية:', redirectAfter);
      }

      // حفظ بيانات المستخدم في cookies (حسب الممارسات الرسمية)
      const successResponse = NextResponse.redirect(
        `${baseUrl}${redirectAfter}?oauth_success=true&message=${encodeURIComponent('تم ربط الحساب بنجاح')}`
      );

      // حفظ بيانات الجلسة (حسب Google Identity Platform) - JWT + HttpOnly Cookies
      console.log('🔍 فحص access_token:', tokenData.access_token ? 'موجود' : 'غير موجود');
      console.log('🔍 طول access_token:', tokenData.access_token ? tokenData.access_token.length : 0);
      if (tokenData.access_token) {
        console.log('💾 حفظ access_token في HttpOnly Cookies...');
        console.log('🔍 Token length:', tokenData.access_token.length);
        console.log('🔍 Token preview:', tokenData.access_token.substring(0, 50) + '...');

        // حفظ OAuth access token في HttpOnly cookie (Generic)
        // 🔧 استخدام getCookieOptions للحصول على الإعدادات الصحيحة مع domain في الإنتاج
        successResponse.cookies.set('oauth_access_token', tokenData.access_token, getCookieOptions(7 * 24 * 3600));

        // ✅ حفظ Token مخصص للخدمة (Service-Specific Token Isolation)
        // هذا يمنع تداخل الصلاحيات عند استخدام خدمات متعددة (مثل Analytics و YouTube)
        if (redirectAfter) {
          if (redirectAfter.includes('/youtube')) {
            console.log('🎯 Detected YouTube Auth -> Saving youtube_oauth_token');
            successResponse.cookies.set('youtube_oauth_token', tokenData.access_token, getCookieOptions(7 * 24 * 3600));
            if (tokenData.refresh_token) {
              successResponse.cookies.set('youtube_refresh_token', tokenData.refresh_token, getCookieOptions(180 * 24 * 3600));
            }
          } else if (redirectAfter.includes('/google-analytics') || redirectAfter.includes('/analytics')) {
            console.log('🎯 Detected Analytics Auth -> Saving analytics_oauth_token');
            successResponse.cookies.set('analytics_oauth_token', tokenData.access_token, getCookieOptions(7 * 24 * 3600));
            if (tokenData.refresh_token) {
              successResponse.cookies.set('analytics_refresh_token', tokenData.refresh_token, getCookieOptions(180 * 24 * 3600));
            }
          } else if (redirectAfter.includes('/google-tag-manager') || redirectAfter.includes('/gtm')) {
            console.log('🎯 Detected GTM Auth -> Saving gtm_oauth_token');
            successResponse.cookies.set('gtm_oauth_token', tokenData.access_token, getCookieOptions(7 * 24 * 3600));
            if (tokenData.refresh_token) {
              successResponse.cookies.set('gtm_refresh_token', tokenData.refresh_token, getCookieOptions(180 * 24 * 3600));
            }
          } else if (redirectAfter.includes('/dashboard/google-ads')) {
            console.log('🎯 Detected Google Ads Auth -> Saving ads_oauth_token');
            successResponse.cookies.set('ads_oauth_token', tokenData.access_token, getCookieOptions(7 * 24 * 3600));
            if (tokenData.refresh_token) {
              successResponse.cookies.set('ads_refresh_token', tokenData.refresh_token, getCookieOptions(180 * 24 * 3600));
            }
          }
        }

        // إضافة cookie لحالة الاتصال (غير HttpOnly للوصول من JavaScript)
        successResponse.cookies.set('google_ads_connected', 'true', getCookieOptions(365 * 24 * 3600, false));
      }

      if (tokenData.refresh_token) {
        // حفظ OAuth refresh token في HttpOnly cookie
        successResponse.cookies.set('oauth_refresh_token', tokenData.refresh_token, getCookieOptions(180 * 24 * 3600));
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

          // حفظ معلومات المستخدم في cookies - مع domain في الإنتاج
          successResponse.cookies.set('oauth_user_info', JSON.stringify(userInfo), getCookieOptions(180 * 24 * 3600));

          // ملاحظة: لا نحفظ ملف المستخدم في قاعدة البيانات هنا
          // لأن نظام المصادقة منفصل عن نظام ربط الحسابات
          // نحفظ فقط OAuth tokens لربط الحسابات

          // ✅ حفظ OAuth tokens في قاعدة البيانات للاستعادة بعد تسجيل الدخول
          try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseAdmin = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { error: tokenSaveError } = await supabaseAdmin
              .from('user_oauth_tokens')
              .upsert({
                user_id: userInfo.id,
                user_email: userInfo.email,
                provider: 'google',
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || null,
                expires_at: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString(),
                scopes: tokenData.scope || '',
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,provider',
                ignoreDuplicates: false
              });

            if (tokenSaveError) {
              console.warn('⚠️ فشل حفظ OAuth tokens في قاعدة البيانات:', tokenSaveError);
            } else {
              console.log('✅ تم حفظ OAuth tokens في قاعدة البيانات بنجاح');
            }
          } catch (tokenDbError) {
            console.warn('⚠️ خطأ في حفظ OAuth tokens:', tokenDbError);
          }

          // ✅ Auto-discover and save Google Ads accounts after OAuth
          if (redirectAfter?.includes('/dashboard/google-ads')) {
            console.log('🔄 اكتشاف حسابات Google Ads تلقائياً بعد OAuth...');
            try {
              const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
              if (developerToken) {
                // 1. جلب قائمة الحسابات المتاحة
                const listResponse = await fetch('https://googleads.googleapis.com/v21/customers:listAccessibleCustomers', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'developer-token': developerToken,
                    'Content-Type': 'application/json'
                  },
                  signal: AbortSignal.timeout(15000)
                });

                if (listResponse.ok) {
                  const listData = await listResponse.json();
                  const resourceNames = listData.resourceNames || [];
                  console.log(`📋 تم اكتشاف ${resourceNames.length} حساب Google Ads`);

                  // 2. حفظ كل حساب في Supabase
                  for (const resourceName of resourceNames) {
                    const customerId = resourceName.split('/').pop();
                    if (!customerId) continue;

                    try {
                      // جلب تفاصيل الحساب
                      const loginCustomerId = (process.env.MCC_LOGIN_CUSTOMER_ID || '').replace(/-/g, '');
                      const detailsResponse = await fetch(`https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${tokenData.access_token}`,
                          'developer-token': developerToken,
                          'login-customer-id': loginCustomerId,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          query: `SELECT customer.id, customer.descriptive_name, customer.status FROM customer LIMIT 1`
                        }),
                        signal: AbortSignal.timeout(10000)
                      });

                      let accountName = `Account ${customerId}`;
                      let accountStatus = 'ENABLED';

                      if (detailsResponse.ok) {
                        const detailsData = await detailsResponse.json();
                        const results = detailsData.results || [];
                        if (results.length > 0) {
                          accountName = results[0].customer?.descriptiveName || accountName;
                          accountStatus = results[0].customer?.status || 'ENABLED';
                        }
                      }

                      // 3. حفظ في Supabase
                      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
                      const supabaseForAccounts = createSupabaseClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                      );

                      // التحقق من وجود الحساب أولاً
                      const { data: existingAccount } = await supabaseForAccounts
                        .from('client_requests')
                        .select('id')
                        .eq('customer_id', customerId)
                        .eq('user_id', userInfo.id)
                        .single();

                      let saveError;
                      if (existingAccount) {
                        // تحديث الحساب الموجود
                        const result = await supabaseForAccounts
                          .from('client_requests')
                          .update({
                            account_name: accountName,
                            link_details: {
                              discovered_at: new Date().toISOString(),
                              source: 'oauth_callback',
                              account_status: accountStatus
                            },
                            updated_at: new Date().toISOString()
                          })
                          .eq('id', existingAccount.id);
                        saveError = result.error;
                      } else {
                        // إدخال حساب جديد
                        const result = await supabaseForAccounts
                          .from('client_requests')
                          .insert({
                            customer_id: customerId,
                            user_id: userInfo.id,
                            user_email: userInfo.email,
                            account_name: accountName,
                            request_type: 'auto_discovery',
                            status: 'NOT_LINKED',
                            link_details: {
                              discovered_at: new Date().toISOString(),
                              source: 'oauth_callback',
                              account_status: accountStatus
                            },
                            updated_at: new Date().toISOString()
                          });
                        saveError = result.error;
                      }

                      if (!saveError) {
                        console.log(`✅ تم حفظ الحساب ${customerId} (${accountName})`);
                      } else {
                        console.warn(`⚠️ خطأ في حفظ الحساب ${customerId}:`, saveError.message);
                      }
                    } catch (accError) {
                      console.warn(`⚠️ فشل حفظ الحساب ${customerId}:`, accError);
                    }
                  }
                  console.log(`✅ تم اكتشاف وحفظ ${resourceNames.length} حساب Google Ads`);
                } else {
                  console.warn('⚠️ فشل جلب قائمة الحسابات:', listResponse.status);
                }
              }
            } catch (discoveryError) {
              console.warn('⚠️ فشل اكتشاف الحسابات:', discoveryError);
            }
          } else {
            console.log('ℹ️ ليس OAuth لـ Google Ads - تخطي اكتشاف الحسابات');
          }
        }
      } catch (userError) {
        console.warn('⚠️ فشل في الحصول على معلومات المستخدم:', userError);
      }

      // حفظ معلومات إضافية (حسب Google Ads API Documentation)
      if (tokenData.expires_in) {
        successResponse.cookies.set('oauth_expires_in', tokenData.expires_in.toString(), getCookieOptions(3600));
      }

      if (tokenData.scope) {
        successResponse.cookies.set('oauth_scope', tokenData.scope, getCookieOptions(3600));
      }

      // حذف البيانات المؤقتة
      successResponse.cookies.delete('oauth_code_verifier');
      successResponse.cookies.delete('oauth_state');
      successResponse.cookies.delete('oauth_mcc_customer_id');

      // ✅ بدلاً من التوجيه، نعيد صفحة HTML تغلق النافذة وتبلغ الصفحة الأصلية
      const closePopupHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Successful</title>
          <script>
            try {
              // 1. Try BroadcastChannel (Most reliable for same-origin)
              try {
                const bc = new BroadcastChannel('oauth_channel');
                bc.postMessage({ 
                  type: 'OAUTH_SUCCESS', 
                  redirectUrl: '${redirectAfter}'
                });
                console.log('✅ BroadcastChannel message sent');
                setTimeout(() => bc.close(), 1000);
              } catch (e) {
                console.warn('BroadcastChannel not supported', e);
              }

              // 2. Try window.opener (Legacy fallback)
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_SUCCESS', 
                  redirectUrl: '${redirectAfter}'
                }, '*');
                console.log('✅ window.opener message sent');
              }
              
              // 3. Close window
              setTimeout(() => {
                 window.close();
                 // Fallback if close fails (e.g. if script blocked close)
                 document.body.innerHTML = '<div class="success-message"><h2>Done!</h2><p>You can close this window.</p></div>';
              }, 500);

            } catch (e) {
              console.error(e);
              window.close();
            }
          </script>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
              background-color: #f3f4f6; 
              color: #1f2937;
            }
            .success-message {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 0.5rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .icon { font-size: 3rem; margin-bottom: 1rem; color: #10b981; }
          </style>
        </head>
        <body>
          <div class="success-message">
            <div class="icon">✅</div>
            <h2>Successfully Connected!</h2>
            <p>You can close this window now.</p>
          </div>
        </body>
        </html>
      `;

      // إنشاء استجابة HTML مع الحفاظ على الـ cookies
      const htmlResponse = new NextResponse(closePopupHtml, {
        headers: { 'Content-Type': 'text/html' }
      });

      // نسخ جميع الكوكيز من successResponse إلى htmlResponse
      successResponse.cookies.getAll().forEach(cookie => {
        htmlResponse.cookies.set(cookie.name, cookie.value, {
          ...cookie,
          // التأكد من نسخ جميع الخصائص المهمة (httpOnly, secure, path, domain)
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          path: cookie.path,
          domain: cookie.domain,
          maxAge: cookie.maxAge,
          sameSite: cookie.sameSite as any
        });
      });

      return htmlResponse;
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
