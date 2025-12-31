import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        // Get billing subscriptions stats
        const { data: subscriptions, error: subError } = await supabase
            .from('user_billing_subscriptions')
            .select('billing_mode, plan_id');

        if (subError) {
            console.error('Error fetching subscriptions:', subError);
        }

        const managedUsers = subscriptions?.filter(s => s.billing_mode === 'furriyadh_managed').length || 0;
        const selfManagedUsers = subscriptions?.filter(s => s.billing_mode === 'self_managed' || !s.billing_mode).length || 0;

        // Get managed accounts stats
        const { data: managedAccounts, error: accError } = await supabase
            .from('managed_accounts')
            .select('status');

        if (accError) {
            console.error('Error fetching managed accounts:', accError);
        }

        const activeAccounts = managedAccounts?.filter(a => a.status === 'assigned').length || 0;
        const availableAccounts = managedAccounts?.filter(a => a.status === 'available').length || 0;

        // Get commission stats
        const { data: invoices, error: invError } = await supabase
            .from('commission_invoices')
            .select('commission_amount, total_ad_spend, status');

        if (invError) {
            console.error('Error fetching invoices:', invError);
        }

        const totalCommissionEarned = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.commission_amount || 0), 0) || 0;
        const totalCommissionPending = invoices?.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.commission_amount || 0), 0) || 0;
        const totalAdSpend = invoices?.reduce((sum, i) => sum + (i.total_ad_spend || 0), 0) || 0;

        // Get current month stats
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: currentMonthInvoices } = await supabase
            .from('commission_invoices')
            .select('commission_amount, total_ad_spend')
            .eq('invoice_month', currentMonth);

        const thisMonthAdSpend = currentMonthInvoices?.reduce((sum, i) => sum + (i.total_ad_spend || 0), 0) || 0;
        const thisMonthCommission = currentMonthInvoices?.reduce((sum, i) => sum + (i.commission_amount || 0), 0) || 0;

        // Get daily ad spend for chart (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: dailySpend } = await supabase
            .from('daily_ad_spend')
            .select('spend_date, ad_spend_amount, commission_amount')
            .gte('spend_date', thirtyDaysAgo.toISOString().slice(0, 10))
            .order('spend_date', { ascending: true });

        // Get recent billing mode changes
        const { data: recentChanges } = await supabase
            .from('billing_mode_history')
            .select('*')
            .order('changed_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            success: true,
            stats: {
                users: {
                    managed: managedUsers,
                    selfManaged: selfManagedUsers,
                    total: managedUsers + selfManagedUsers
                },
                accounts: {
                    active: activeAccounts,
                    available: availableAccounts,
                    total: (managedAccounts?.length || 0)
                },
                commissions: {
                    earned: totalCommissionEarned,
                    pending: totalCommissionPending,
                    total: totalCommissionEarned + totalCommissionPending,
                    rate: 0.20
                },
                adSpend: {
                    total: totalAdSpend,
                    thisMonth: thisMonthAdSpend
                },
                thisMonth: {
                    adSpend: thisMonthAdSpend,
                    commission: thisMonthCommission,
                    period: currentMonth
                }
            },
            charts: {
                dailySpend: dailySpend || []
            },
            recentActivity: {
                billingModeChanges: recentChanges || []
            }
        });

    } catch (error) {
        console.error('Error in admin stats API:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
