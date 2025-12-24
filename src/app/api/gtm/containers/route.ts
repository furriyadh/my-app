// Google Tag Manager API - Containers Route
// جلب قائمة Accounts و Containers من GTM
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        console.log('📦 جلب Google Tag Manager Containers...');

        const cookieStore = await cookies();

        // استخدام توكن مخصص لـ GTM أولاً
        const gtmToken = cookieStore.get('gtm_oauth_token')?.value;
        const genericToken = cookieStore.get('oauth_access_token')?.value;
        const accessToken = gtmToken || genericToken;

        const gtmRefreshToken = cookieStore.get('gtm_refresh_token')?.value;
        const genericRefreshToken = cookieStore.get('oauth_refresh_token')?.value;
        const refreshToken = gtmRefreshToken || genericRefreshToken;

        console.log('🔑 Using token:', gtmToken ? 'gtm_oauth_token (Specific)' : 'oauth_access_token (Generic)');

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                error: 'No access token found',
                message: 'يرجى تسجيل الدخول أولاً'
            }, { status: 401 });
        }

        // جلب الحسابات من Google Tag Manager API v2
        const accountsResponse = await fetch(
            'https://tagmanager.googleapis.com/tagmanager/v2/accounts',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!accountsResponse.ok) {
            const errorText = await accountsResponse.text();
            console.error('❌ فشل في جلب حسابات GTM:', errorText);

            // إذا كان التوكن منتهي، نحاول تجديده
            if (accountsResponse.status === 401 && refreshToken) {
                const newToken = await refreshAccessToken(refreshToken);
                if (newToken) {
                    const retryResponse = await fetch(
                        'https://tagmanager.googleapis.com/tagmanager/v2/accounts',
                        {
                            headers: {
                                'Authorization': `Bearer ${newToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (retryResponse.ok) {
                        const data = await retryResponse.json();
                        const containers = await fetchContainersForAccounts(data.account || [], newToken);

                        return NextResponse.json({
                            success: true,
                            accounts: data.account || [],
                            containers: containers
                        });
                    }
                }
            }

            return NextResponse.json({
                success: false,
                error: 'Failed to fetch GTM accounts',
                message: 'فشل في جلب حسابات GTM - تأكد من صلاحيات tagmanager.readonly'
            }, { status: accountsResponse.status });
        }

        const accountsData = await accountsResponse.json();
        console.log('✅ تم جلب حسابات GTM:', accountsData.account?.length || 0);

        // جلب Containers لكل حساب
        const containers = await fetchContainersForAccounts(accountsData.account || [], accessToken);

        return NextResponse.json({
            success: true,
            accounts: accountsData.account || [],
            containers: containers
        });

    } catch (error) {
        console.error('❌ خطأ في جلب GTM Containers:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
        }, { status: 500 });
    }
}

// جلب Containers لكل حساب
async function fetchContainersForAccounts(accounts: any[], accessToken: string): Promise<any[]> {
    const allContainers: any[] = [];

    for (const account of accounts) {
        try {
            const response = await fetch(
                `https://tagmanager.googleapis.com/tagmanager/v2/${account.path}/containers`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`🔍 Fetching containers for ${account.name}: status ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`📦 Containers found for ${account.name}:`, data.container?.length || 0);

                if (data.container) {
                    allContainers.push(...data.container.map((container: any) => ({
                        ...container,
                        accountName: account.name,
                        accountId: account.accountId
                    })));
                }
            } else {
                const errorText = await response.text();
                console.error(`❌ Error fetching containers for ${account.path}:`, errorText);
            }
        } catch (error) {
            console.error(`❌ خطأ في جلب containers للحساب ${account.path}:`, error);
        }
    }

    console.log(`📊 Total containers found: ${allContainers.length}`);
    return allContainers;
}

// تجديد Access Token
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        const clientId = process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error('❌ Missing OAuth credentials');
            return null;
        }

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) {
            console.error('❌ Token refresh failed');
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('❌ Error refreshing token:', error);
        return null;
    }
}
