import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client with service role for admin operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/campaigns/register
 * Registers a campaign created through the platform
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            google_campaign_id,
            google_campaign_name,
            customer_id,
            source, // 'furriyadh_managed' | 'self_managed'
            campaign_type,
            daily_budget,
            currency,
            website_url,
        } = body;

        // ✅ Verify user identity server-side via JWT
        const { createClient: createServerClient } = await import('@/utils/supabase/server');
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('❌ Unauthorized registration attempt:', authError);
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Valid session required' },
                { status: 401 }
            );
        }

        const user_id = user.id;
        const user_email = user.email;

        if (!google_campaign_id || !customer_id || !source) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        console.log('📝 Registering platform campaign:', {
            google_campaign_id,
            customer_id,
            source,
            user_id,
        });

        // 1. Register the campaign
        const { error: campaignError } = await supabaseAdmin
            .from('platform_created_campaigns')
            .upsert({
                google_campaign_id,
                google_campaign_name,
                customer_id: customer_id.replace(/-/g, ''), // Normalize ID
                source,
                user_id,
                user_email,
                campaign_type: campaign_type || 'SEARCH',
                daily_budget: daily_budget || 0,
                currency: currency || 'USD',
                website_url,
                status: 'active',
            }, { onConflict: 'google_campaign_id,customer_id' });

        if (campaignError) {
            console.error('❌ Error registering campaign:', campaignError);
            return NextResponse.json(
                { success: false, error: campaignError.message },
                { status: 500 }
            );
        }

        // 2. Update user billing usage
        if (user_id) {
            const currentMonth = new Date().toISOString().slice(0, 7);

            // Get current usage
            const { data: currentUsage } = await supabaseAdmin
                .from('user_billing_usage')
                .select('campaigns_count, monthly_budget_used, current_month')
                .eq('user_id', user_id)
                .single();

            let newCampaignsCount = 1;
            let newMonthlyBudget = (daily_budget || 0) * 30;

            if (currentUsage) {
                newCampaignsCount = (currentUsage.campaigns_count || 0) + 1;

                // Reset budget if new month
                if (currentUsage.current_month === currentMonth) {
                    newMonthlyBudget = (currentUsage.monthly_budget_used || 0) + (daily_budget || 0) * 30;
                }
            }

            const { error: usageError } = await supabaseAdmin
                .from('user_billing_usage')
                .upsert({
                    user_id,
                    campaigns_count: newCampaignsCount,
                    monthly_budget_used: newMonthlyBudget,
                    current_month: currentMonth,
                    last_updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });

            if (usageError) {
                console.error('⚠️ Warning: Could not update usage:', usageError);
            } else {
                console.log('✅ Usage updated:', { campaigns: newCampaignsCount, budget: newMonthlyBudget });
            }
        }

        console.log('✅ Campaign registered successfully');

        return NextResponse.json({
            success: true,
            message: 'Campaign registered',
            data: {
                google_campaign_id,
                customer_id,
                source,
            }
        });

    } catch (error: any) {
        console.error('❌ Error in campaign registration:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/campaigns/register?user_id=xxx
 * Gets list of platform-created campaign IDs for filtering
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Missing user_id' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('platform_created_campaigns')
            .select('google_campaign_id, google_campaign_name, customer_id, source, campaign_type, daily_budget')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            campaigns: data || [],
            count: data?.length || 0,
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
