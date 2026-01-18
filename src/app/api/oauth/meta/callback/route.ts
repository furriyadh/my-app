// Meta (Facebook) OAuth Callback Route
// معالجة callback من Meta/Facebook OAuth
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Meta OAuth Configuration
const META_APP_ID = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

export async function GET(request: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:3000');

    try {
        console.log('🔄 معالجة Meta OAuth callback...');

        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const stateParam = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // التحقق من الأخطاء
        if (error) {
            console.error('❌ Meta OAuth Error:', error, errorDescription);
            return NextResponse.redirect(
                `${baseUrl}/google-ads/integrations?error=${encodeURIComponent(errorDescription || error)}`
            );
        }

        if (!code) {
            console.error('❌ No authorization code received');
            return NextResponse.redirect(
                `${baseUrl}/google-ads/integrations?error=no_code`
            );
        }

        // التحقق من state
        const cookieStore = await cookies();
        const savedState = cookieStore.get('meta_oauth_state')?.value;

        let redirectAfter = '/dashboard/google-ads/integrations/meta-ads';
        if (savedState && stateParam) {
            try {
                const savedStateData = JSON.parse(savedState);
                const receivedStateData = JSON.parse(Buffer.from(stateParam, 'base64').toString());

                if (savedStateData.state !== receivedStateData.state) {
                    console.error('❌ State mismatch');
                    return NextResponse.redirect(
                        `${baseUrl}/google-ads/integrations?error=state_mismatch`
                    );
                }
                redirectAfter = savedStateData.redirect_after || redirectAfter;
            } catch (e) {
                console.warn('⚠️ Could not parse state');
            }
        }

        // تبادل الكود بـ Access Token
        const redirectUri = `${baseUrl}/api/oauth/meta/callback`;
        const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
        tokenUrl.searchParams.set('client_id', META_APP_ID!);
        tokenUrl.searchParams.set('client_secret', META_APP_SECRET!);
        tokenUrl.searchParams.set('redirect_uri', redirectUri);
        tokenUrl.searchParams.set('code', code);

        console.log('🔍 Token exchange...');
        const tokenResponse = await fetch(tokenUrl.toString());

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('❌ Token exchange failed:', errorText);
            return NextResponse.redirect(
                `${baseUrl}/google-ads/integrations?error=token_exchange_failed`
            );
        }

        const tokenData = await tokenResponse.json();
        console.log('✅ Token received:', {
            access_token: tokenData.access_token ? 'present' : 'missing',
            token_type: tokenData.token_type,
            expires_in: tokenData.expires_in
        });

        // تحويل إلى Long-Lived Token
        const longLivedTokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
        longLivedTokenUrl.searchParams.set('grant_type', 'fb_exchange_token');
        longLivedTokenUrl.searchParams.set('client_id', META_APP_ID!);
        longLivedTokenUrl.searchParams.set('client_secret', META_APP_SECRET!);
        longLivedTokenUrl.searchParams.set('fb_exchange_token', tokenData.access_token);

        const longLivedResponse = await fetch(longLivedTokenUrl.toString());
        let accessToken = tokenData.access_token;

        if (longLivedResponse.ok) {
            const longLivedData = await longLivedResponse.json();
            accessToken = longLivedData.access_token || accessToken;
            console.log('✅ Long-lived token obtained');
        }

        // جلب معلومات المستخدم
        const userInfoUrl = `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`;
        const userResponse = await fetch(userInfoUrl);

        let userInfo: any = { id: '', name: '', email: '', picture: '' };
        if (userResponse.ok) {
            userInfo = await userResponse.json();
            console.log('🔍 User info:', {
                id: userInfo.id,
                name: userInfo.name,
                email: userInfo.email
            });
        }

        // حفظ التوكنات في Cookies
        const response = NextResponse.redirect(
            `${baseUrl}${redirectAfter}?oauth_success=true&message=${encodeURIComponent('تم ربط حساب Meta بنجاح')}`
        );

        // حفظ Access Token
        response.cookies.set('meta_access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 24 * 60 * 60, // 60 يوم
            path: '/'
        });

        // حفظ معلومات المستخدم
        response.cookies.set('meta_user_info', JSON.stringify({
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email || '',
            picture: userInfo.picture?.data?.url || ''
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 24 * 60 * 60,
            path: '/'
        });

        // حذف state cookie
        response.cookies.delete('meta_oauth_state');

        console.log('✅ Meta OAuth completed successfully');
        return response;

    } catch (error) {
        console.error('❌ خطأ في Meta OAuth callback:', error);
        return NextResponse.redirect(
            `${baseUrl}/google-ads/integrations?error=${encodeURIComponent('OAuth failed')}`
        );
    }
}
