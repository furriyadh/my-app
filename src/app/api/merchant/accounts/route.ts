// Google Merchant Center API - Accounts Route
// جلب قائمة حسابات Merchant Center
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        console.log('🛒 جلب Google Merchant Center Accounts...');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('oauth_access_token')?.value;
        const refreshToken = cookieStore.get('oauth_refresh_token')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                error: 'No access token found',
                message: 'يرجى تسجيل الدخول أولاً'
            }, { status: 401 });
        }

        // جلب الحسابات من Google Content API for Shopping
        // https://developers.google.com/shopping-content/reference/rest/v2.1/accounts/authinfo
        const authInfoResponse = await fetch(
            'https://shoppingcontent.googleapis.com/content/v2.1/accounts/authinfo',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!authInfoResponse.ok) {
            const errorText = await authInfoResponse.text();
            console.error('❌ فشل في جلب معلومات Merchant Center:', errorText);

            // إذا كان التوكن منتهي، نحاول تجديده
            if (authInfoResponse.status === 401 && refreshToken) {
                const newToken = await refreshAccessToken(refreshToken);
                if (newToken) {
                    const retryResponse = await fetch(
                        'https://shoppingcontent.googleapis.com/content/v2.1/accounts/authinfo',
                        {
                            headers: {
                                'Authorization': `Bearer ${newToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (retryResponse.ok) {
                        const data = await retryResponse.json();
                        const accounts = await fetchAccountDetails(data.accountIdentifiers || [], newToken);

                        return NextResponse.json({
                            success: true,
                            accounts: accounts
                        });
                    }
                }
            }

            return NextResponse.json({
                success: false,
                error: 'Failed to fetch Merchant accounts',
                message: 'فشل في جلب حسابات Merchant Center - تأكد من صلاحيات content'
            }, { status: authInfoResponse.status });
        }

        const authInfoData = await authInfoResponse.json();
        console.log('✅ تم جلب معلومات Auth:', authInfoData);

        // جلب تفاصيل كل حساب
        const accounts = await fetchAccountDetails(authInfoData.accountIdentifiers || [], accessToken);
        console.log(`📊 Total accounts found: ${accounts.length}`);

        return NextResponse.json({
            success: true,
            accounts: accounts
        });

    } catch (error) {
        console.error('❌ خطأ في جلب Merchant Accounts:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
        }, { status: 500 });
    }
}

// جلب تفاصيل كل حساب
async function fetchAccountDetails(accountIdentifiers: any[], accessToken: string): Promise<any[]> {
    const accounts: any[] = [];

    for (const identifier of accountIdentifiers) {
        const merchantId = identifier.merchantId || identifier.aggregatorId;

        if (!merchantId) continue;

        try {
            const response = await fetch(
                `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/accounts/${merchantId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`🔍 Fetching account ${merchantId}: status ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                accounts.push({
                    merchantId: merchantId,
                    name: data.name || `Account ${merchantId}`,
                    websiteUrl: data.websiteUrl || null,
                    adultContent: data.adultContent || false,
                    sellerId: data.sellerId || null,
                    isAggregator: !!identifier.aggregatorId
                });
            } else {
                // إذا فشل جلب التفاصيل، أضف الحساب بمعلومات أساسية
                accounts.push({
                    merchantId: merchantId,
                    name: `Account ${merchantId}`,
                    websiteUrl: null,
                    adultContent: false,
                    isAggregator: !!identifier.aggregatorId
                });
            }
        } catch (error) {
            console.error(`❌ خطأ في جلب تفاصيل الحساب ${merchantId}:`, error);
            // أضف الحساب بمعلومات أساسية حتى لو فشل
            accounts.push({
                merchantId: merchantId,
                name: `Account ${merchantId}`,
                websiteUrl: null,
                adultContent: false,
                isAggregator: !!identifier.aggregatorId
            });
        }
    }

    return accounts;
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
