import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/campaigns/budget-status
// Fetches budget status for all campaigns of a user
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const accountId = searchParams.get('accountId');

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Ignore errors in Server Components
                        }
                    },
                },
            }
        );

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Build query
        let query = supabase
            .from('furriyadh_campaigns')
            .select(`
                id,
                campaign_name,
                google_campaign_id,
                daily_budget,
                weekly_budget,
                budget_spent,
                budget_remaining,
                spend_percentage,
                avg_daily_spend,
                estimated_days_remaining,
                estimated_depletion_at,
                cycle_start_date,
                cycle_end_date,
                status,
                low_balance_notified_at,
                last_spend_sync_at,
                furriyadh_customer_accounts!inner(
                    id,
                    user_id,
                    currency,
                    current_balance
                )
            `)
            .in('status', ['active', 'paused', 'stopped_no_balance'])
            .order('created_at', { ascending: false });

        // Filter by account if specified
        if (accountId) {
            query = query.eq('customer_account_id', accountId);
        }

        const { data: campaigns, error: queryError } = await query;

        if (queryError) {
            console.error('Error fetching campaign budgets:', queryError);
            return NextResponse.json(
                { success: false, error: queryError.message },
                { status: 500 }
            );
        }

        // Transform and enrich data
        const enrichedCampaigns = (campaigns || []).map((c: any) => {
            const weeklyBudget = c.weekly_budget || (c.daily_budget * 7);
            const budgetSpent = c.budget_spent || c.total_spent || 0;
            const budgetRemaining = weeklyBudget - budgetSpent;
            const spendPercentage = weeklyBudget > 0 ? (budgetSpent / weeklyBudget) * 100 : 0;

            // Calculate days remaining based on average spend
            const avgDailySpend = c.avg_daily_spend || 0;
            const daysRemaining = avgDailySpend > 0
                ? budgetRemaining / avgDailySpend
                : 7;

            return {
                id: c.id,
                campaign_name: c.campaign_name,
                google_campaign_id: c.google_campaign_id,
                daily_budget: c.daily_budget,
                weekly_budget: weeklyBudget,
                budget_spent: budgetSpent,
                budget_remaining: budgetRemaining,
                spend_percentage: Math.min(spendPercentage, 100),
                avg_daily_spend: avgDailySpend,
                estimated_days_remaining: Math.max(daysRemaining, 0),
                estimated_depletion_at: c.estimated_depletion_at,
                cycle_start_date: c.cycle_start_date,
                cycle_end_date: c.cycle_end_date,
                status: c.status,
                currency: c.furriyadh_customer_accounts?.currency || 'USD',
                is_low_balance: daysRemaining <= 1,
                last_spend_sync_at: c.last_spend_sync_at
            };
        });

        // Summary stats
        const totalBudget = enrichedCampaigns.reduce((sum: number, c: any) => sum + c.weekly_budget, 0);
        const totalSpent = enrichedCampaigns.reduce((sum: number, c: any) => sum + c.budget_spent, 0);
        const totalRemaining = enrichedCampaigns.reduce((sum: number, c: any) => sum + c.budget_remaining, 0);
        const campaignsNeedingAttention = enrichedCampaigns.filter((c: any) => c.is_low_balance).length;

        return NextResponse.json({
            success: true,
            campaigns: enrichedCampaigns,
            summary: {
                total_campaigns: enrichedCampaigns.length,
                total_budget: totalBudget,
                total_spent: totalSpent,
                total_remaining: totalRemaining,
                campaigns_needing_attention: campaignsNeedingAttention
            }
        });

    } catch (error) {
        console.error('Unexpected error in budget-status:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
