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
        const userInfo = await request.json();

        // التحقق من وجود البيانات المطلوبة
        if (!userInfo.id || !userInfo.email) {
            return NextResponse.json(
                { success: false, error: 'Missing required user info (id, email)' },
                { status: 400 }
            );
        }

        console.log('🔄 Syncing Supabase session to OAuth cookies...');
        console.log('👤 User:', { id: userInfo.id, email: userInfo.email, name: userInfo.name });

        const response = NextResponse.json({
            success: true,
            message: 'Session synced successfully'
        });

        // إنشاء oauth_user_info cookie - نفس الصيغة المستخدمة في /api/oauth/google/callback
        const userInfoForCookie = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name || userInfo.full_name || '',
            picture: userInfo.picture || userInfo.avatar_url || ''
        };

        response.cookies.set(
            'oauth_user_info',
            JSON.stringify(userInfoForCookie),
            getCookieOptions(180 * 24 * 3600) // 180 يوم
        );

        console.log('✅ oauth_user_info cookie created successfully');

        // ✅ استعادة OAuth tokens المحفوظة من قاعدة البيانات
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseAdmin = createClient(
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

                // ✅ تجديد access_token تلقائياً لأنه غالباً منتهي الصلاحية
                if (refreshToken) {
                    try {
                        const clientId = process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
                        const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

                        if (clientId && clientSecret) {
                            console.log('🔄 Refreshing access token...');

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
                                const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);
                                await supabaseAdmin
                                    .from('user_oauth_tokens')
                                    .update({
                                        access_token: accessToken,
                                        expires_at: expiresAt.toISOString(),
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
