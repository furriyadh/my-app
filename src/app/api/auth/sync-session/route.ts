import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔄 Sync Session API
 * 
 * يقوم بمزامنة بيانات جلسة Supabase مع OAuth cookies
 * حتى تعمل جميع الـ API routes بشكل صحيح
 * 
 * يُستدعى بعد تسجيل الدخول بنجاح عبر Supabase Auth (GoogleOneTap)
 */

// Helper function to get cookie options
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

export async function POST(request: NextRequest) {
    try {
        // ✅ 1. الحصول على الـ token من الـ Header (الطريقة الآمنة)
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        let user;

        if (token) {
            // التحقق باستخدام الـ token الممرر في الهيدر
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data, error } = await supabase.auth.getUser(token);
            if (!error && data.user) {
                user = data.user;
            }
        }

        // ✅ 2. إذا فشل التحقق من الـ token، نجرب الـ cookies (للتوافق مع المتصفحات القديمة)
        if (!user) {
            const { createClient } = await import('@/utils/supabase/server');
            const supabase = await createClient();
            const { data, error } = await supabase.auth.getUser();
            if (!error && data.user) {
                user = data.user;
            }
        }

        if (!user) {
            console.error('❌ Unauthorized sync attempt: No valid session or token');
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Valid Supabase session required' },
                { status: 401 }
            );
        }

        // استخراج البيانات من الـ user object الموثوق به من السيرفر
        const googleIdentity = user.identities?.find((i: any) => i.provider === 'google');
        const googleId = googleIdentity?.id ||
            user.user_metadata?.provider_id ||
            user.user_metadata?.sub ||
            user.id;

        const userInfo = {
            id: googleId,
            supabaseId: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            picture: user.user_metadata?.avatar_url || ''
        };

        console.log('🔄 Syncing authenticated Supabase session to OAuth cookies...');
        console.log('👤 Authenticated User:', { id: userInfo.id, email: userInfo.email });

        const response = NextResponse.json({
            success: true,
            message: 'Session synced successfully'
        });

        // إنشاء oauth_user_info cookie - نفس الصيغة المستخدمة في /api/oauth/google/callback
        const userInfoForCookie = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture
        };

        response.cookies.set(
            'oauth_user_info',
            JSON.stringify(userInfoForCookie),
            getCookieOptions(180 * 24 * 3600) // 180 يوم
        );

        console.log('✅ oauth_user_info cookie created successfully');

        // ✅ استعادة OAuth tokens المحفوظة من قاعدة البيانات
        try {
            const { createClient: createAdminClient } = await import('@supabase/supabase-js');
            const supabaseAdmin = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // البحث بـ user_id أولاً، ثم بـ email
            let { data: savedTokens, error } = await supabaseAdmin
                .from('user_oauth_tokens')
                .select('*')
                .eq('user_id', userInfo.id)
                .eq('provider', 'google')
                .single();

            // إذا لم يُوجد بـ user_id، نجرب بـ email
            if (!savedTokens && userInfo.email) {
                const { data: tokensByEmail } = await supabaseAdmin
                    .from('user_oauth_tokens')
                    .select('*')
                    .eq('user_email', userInfo.email)
                    .eq('provider', 'google')
                    .single();
                savedTokens = tokensByEmail;
            }

            if (savedTokens) {
                console.log('🔄 Found saved OAuth tokens, restoring to cookies...');

                let accessToken = savedTokens.access_token;
                const refreshToken = savedTokens.refresh_token;
                const expiresAt = savedTokens.expires_at ? new Date(savedTokens.expires_at) : null;
                const now = new Date();

                // Add 5 minutes buffer
                const needsRefresh = !accessToken || !expiresAt || (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000);

                if (needsRefresh && refreshToken) {
                    try {
                        const clientId = process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
                        const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

                        if (clientId && clientSecret) {
                            console.log('🔄 Access token expired or missing, refreshing...');

                            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: new URLSearchParams({
                                    client_id: clientId,
                                    client_secret: clientSecret,
                                    refresh_token: refreshToken,
                                    grant_type: 'refresh_token'
                                })
                            });

                            if (tokenResponse.ok) {
                                const tokenData = await tokenResponse.json();
                                accessToken = tokenData.access_token;
                                console.log('✅ Access token refreshed successfully');

                                // حفظ الـ access_token الجديد في قاعدة البيانات
                                const newExpiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);
                                await supabaseAdmin
                                    .from('user_oauth_tokens')
                                    .update({
                                        access_token: accessToken,
                                        expires_at: newExpiresAt.toISOString(),
                                        updated_at: new Date().toISOString()
                                    })
                                    .eq('id', savedTokens.id);

                                console.log('✅ New access token saved to database');
                            } else {
                                console.error('❌ Token refresh failed:', await tokenResponse.text());
                            }
                        }
                    } catch (refreshError) {
                        console.error('⚠️ Error refreshing token:', refreshError);
                    }
                } else {
                    console.log('✅ Access token is still valid, skipping refresh');
                }

                // استعادة access_token (الجديد أو القديم)
                if (accessToken) {
                    response.cookies.set(
                        'oauth_access_token',
                        accessToken,
                        getCookieOptions(7 * 24 * 3600) // 7 أيام
                    );
                }

                // استعادة refresh_token
                if (refreshToken) {
                    response.cookies.set(
                        'oauth_refresh_token',
                        refreshToken,
                        getCookieOptions(180 * 24 * 3600) // 180 يوم
                    );
                }

                // علامة الاتصال بـ Google Ads
                response.cookies.set(
                    'google_ads_connected',
                    'true',
                    getCookieOptions(365 * 24 * 3600, false) // غير httpOnly للوصول من JavaScript
                );

                console.log('✅ OAuth tokens restored from database successfully');
            } else {
                console.log('ℹ️ No saved OAuth tokens found for this user');
            }
        } catch (tokenRestoreError) {
            console.warn('⚠️ Error restoring OAuth tokens:', tokenRestoreError);
            // لا نُفشل العملية - المستخدم سيحتاج لإعادة الربط
        }

        return response;

    } catch (error: any) {
        console.error('❌ Error syncing session:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to sync session' },
            { status: 500 }
        );
    }
}
