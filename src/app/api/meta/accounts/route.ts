// Meta Ads API - Fetch Ad Accounts Route
// جلب قائمة حسابات Meta Ads
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        console.log('📱 جلب Meta Ad Accounts...');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('meta_access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                error: 'No Meta access token found',
                message: 'يرجى تسجيل الدخول بـ Meta أولاً'
            }, { status: 401 });
        }

        // جلب حسابات الإعلانات المرتبطة بالمستخدم
        // https://developers.facebook.com/docs/marketing-api/reference/ad-account
        const adAccountsUrl = `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_id,account_status,currency,timezone_name,business,amount_spent&access_token=${accessToken}`;

        console.log('🔍 Fetching ad accounts...');
        const response = await fetch(adAccountsUrl);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error fetching ad accounts:', errorData);

            // التحقق من صلاحية التوكن
            if (errorData.error?.code === 190) {
                return NextResponse.json({
                    success: false,
                    error: 'Token expired',
                    message: 'انتهت صلاحية التوكن - يرجى إعادة تسجيل الدخول'
                }, { status: 401 });
            }

            return NextResponse.json({
                success: false,
                error: 'Failed to fetch accounts',
                message: errorData.error?.message || 'فشل في جلب الحسابات'
            }, { status: response.status });
        }

        const data = await response.json();
        console.log(`✅ Found ${data.data?.length || 0} ad accounts`);

        // تحويل البيانات لتنسيق موحد
        const accounts = (data.data || []).map((account: any) => ({
            id: account.id,
            accountId: account.account_id,
            name: account.name || `Ad Account ${account.account_id}`,
            status: account.account_status,
            currency: account.currency,
            timezoneName: account.timezone_name,
            businessId: account.business?.id || null,
            businessName: account.business?.name || null,
            amountSpent: account.amount_spent || '0'
        }));

        return NextResponse.json({
            success: true,
            accounts: accounts,
            count: accounts.length
        });

    } catch (error) {
        console.error('❌ خطأ في جلب Meta Ad Accounts:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}
