import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MerchantAccount {
    id: string;
    name: string;
    linked: boolean;
    products: number | null;
    approvalRate: number | null;
    websiteUrl?: string;
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('google_access_token');
        const userInfo = cookieStore.get('user_info');

        if (!accessToken || !userInfo) {
            return NextResponse.json(
                { error: 'Not authenticated with Google' },
                { status: 401 }
            );
        }

        const user = JSON.parse(userInfo.value);
        const userEmail = user.email;

        // 1. First, get linked accounts from database
        const { data: linkedAccounts, error: dbError } = await supabase
            .from('merchant_accounts')
            .select('*')
            .eq('user_email', userEmail);

        if (dbError) {
            console.error('Error fetching linked accounts:', dbError);
        }

        const linkedAccountIds = new Set(linkedAccounts?.map(a => a.merchant_id) || []);

        // 2. Fetch all available Merchant accounts from Google API
        let allMerchantAccounts: MerchantAccount[] = [];

        try {
            // Try to get Merchant accounts from API
            const merchantResponse = await fetch(
                'https://shoppingcontent.googleapis.com/content/v2.1/accounts/authinfo',
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken.value}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (merchantResponse.ok) {
                const merchantData = await merchantResponse.json();

                if (merchantData.accountIdentifiers && Array.isArray(merchantData.accountIdentifiers)) {
                    // Process each account
                    for (const account of merchantData.accountIdentifiers) {
                        const merchantId = account.merchantId;

                        // Get account details
                        const detailsResponse = await fetch(
                            `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/accounts/${merchantId}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${accessToken.value}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        let accountName = `Account ${merchantId}`;
                        let websiteUrl = undefined;

                        if (detailsResponse.ok) {
                            const details = await detailsResponse.json();
                            accountName = details.name || accountName;
                            websiteUrl = details.websiteUrl;
                        }

                        // Get products count (optional)
                        let productsCount: number | null = null;
                        let approvalRate: number | null = null;

                        try {
                            const productsResponse = await fetch(
                                `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/products`,
                                {
                                    headers: {
                                        'Authorization': `Bearer ${accessToken.value}`,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );

                            if (productsResponse.ok) {
                                const productsData = await productsResponse.json();
                                productsCount = productsData.resources?.length || 0;

                                // Calculate approval rate
                                if (productsCount > 0) {
                                    const approved = productsData.resources?.filter(
                                        (p: any) => p.approvalStatus === 'approved' || !p.approvalStatus
                                    ).length || 0;
                                    approvalRate = Math.round((approved / productsCount) * 100);
                                }
                            }
                        } catch (e) {
                            // Products count is optional
                        }

                        allMerchantAccounts.push({
                            id: merchantId,
                            name: accountName,
                            linked: linkedAccountIds.has(merchantId),
                            products: productsCount,
                            approvalRate: approvalRate,
                            websiteUrl: websiteUrl
                        });
                    }
                }
            }
        } catch (apiError) {
            console.error('Error fetching from Merchant API:', apiError);
        }

        // 3. Add any linked accounts from DB that weren't in the API response
        if (linkedAccounts) {
            for (const dbAccount of linkedAccounts) {
                if (!allMerchantAccounts.find(a => a.id === dbAccount.merchant_id)) {
                    allMerchantAccounts.push({
                        id: dbAccount.merchant_id,
                        name: dbAccount.merchant_name || `Account ${dbAccount.merchant_id}`,
                        linked: true,
                        products: null,
                        approvalRate: null,
                        websiteUrl: dbAccount.website_url
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            accounts: allMerchantAccounts,
            total: allMerchantAccounts.length,
            linked: allMerchantAccounts.filter(a => a.linked).length
        });

    } catch (error) {
        console.error('Error in merchant/all:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch Merchant accounts',
                accounts: []
            },
            { status: 500 }
        );
    }
}
