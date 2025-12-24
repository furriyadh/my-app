// Google Analytics API - Properties Route
// جلب قائمة Properties من Google Analytics
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        console.log('📊 جلب Google Analytics Properties...');

        const cookieStore = await cookies();

        // استخدام توكن مخصص للتحليلات أولاً
        const analyticsToken = cookieStore.get('analytics_oauth_token')?.value;
        const genericToken = cookieStore.get('oauth_access_token')?.value;
        const accessToken = analyticsToken || genericToken;

        const analyticsRefreshToken = cookieStore.get('analytics_refresh_token')?.value;
        const genericRefreshToken = cookieStore.get('oauth_refresh_token')?.value;
        const refreshToken = analyticsRefreshToken || genericRefreshToken;

        console.log('🔑 Using token:', analyticsToken ? 'analytics_option (Specific)' : 'oauth_option (Generic)');

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                error: 'No access token found',
                message: 'يرجى تسجيل الدخول أولاً'
            }, { status: 401 });
        }

        // جلب الحسابات من Google Analytics Admin API
        const accountsResponse = await fetch(
            'https://analyticsadmin.googleapis.com/v1beta/accounts',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!accountsResponse.ok) {
            const errorText = await accountsResponse.text();
            console.error('❌ فشل في جلب الحسابات:', errorText);

            // إذا كان التوكن منتهي، نحاول تجديده
            if (accountsResponse.status === 401 && refreshToken) {
                const newToken = await refreshAccessToken(refreshToken);
                if (newToken) {
                    // إعادة المحاولة مع التوكن الجديد
                    const retryResponse = await fetch(
                        'https://analyticsadmin.googleapis.com/v1beta/accounts',
                        {
                            headers: {
                                'Authorization': `Bearer ${newToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (retryResponse.ok) {
                        const data = await retryResponse.json();
                        const properties = await fetchPropertiesForAccounts(data.accounts || [], newToken);

                        return NextResponse.json({
                            success: true,
                            accounts: data.accounts || [],
                            properties: properties
                        });
                    }
                }
            }

            return NextResponse.json({
                success: false,
                error: 'Failed to fetch Analytics accounts',
                message: 'فشل في جلب حسابات Analytics - تأكد من صلاحيات analytics.readonly'
            }, { status: accountsResponse.status });
        }

        const accountsData = await accountsResponse.json();
        console.log('✅ تم جلب الحسابات:', accountsData.accounts?.length || 0);

        // جلب Properties لكل حساب
        const properties = await fetchPropertiesForAccounts(accountsData.accounts || [], accessToken);

        return NextResponse.json({
            success: true,
            accounts: accountsData.accounts || [],
            properties: properties
        });

    } catch (error) {
        console.error('❌ خطأ في جلب Analytics Properties:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
        }, { status: 500 });
    }
}

// جلب Properties لكل حساب
async function fetchPropertiesForAccounts(accounts: any[], accessToken: string): Promise<any[]> {
    const allProperties: any[] = [];

    for (const account of accounts) {
        try {
            // استخدام الـ API الصحيح لجلب Properties - filter by parent account
            const accountId = account.name; // مثل "accounts/123456789"
            const response = await fetch(
                `https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:${accountId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`🔍 Fetching properties for ${accountId}: status ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`📦 Properties found for ${account.displayName}:`, data.properties?.length || 0);

                if (data.properties) {
                    allProperties.push(...data.properties.map((prop: any) => ({
                        ...prop,
                        accountName: account.displayName
                    })));
                }
            } else {
                const errorText = await response.text();
                console.error(`❌ Error fetching properties for ${accountId}:`, errorText);
            }
        } catch (error) {
            console.error(`❌ خطأ في جلب properties للحساب ${account.name}:`, error);
        }
    }

    console.log(`📊 Total properties found: ${allProperties.length}`);
    return allProperties;
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
