import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Plan prices configuration
const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
    free: { monthly: 0, yearly: 0 },
    basic: { monthly: 49, yearly: 490 },
    pro: { monthly: 99, yearly: 990 },
    agency: { monthly: 249, yearly: 2490 },
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { plan_id, billing_cycle, payment_method, transaction_id, amount } = body;

        // ✅ Verify user identity server-side via JWT
        const { createClient: createServerClient } = await import('@/utils/supabase/server');
        const supabaseAuth = await createServerClient();
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

        if (authError || !user) {
            console.error('❌ Unauthorized subscription attempt:', authError);
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Valid session required' },
                { status: 401 }
            );
        }

        const userId = user.id;
        const email = user.email;

        // Validate required fields
        if (!plan_id || !billing_cycle) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields (plan_id, billing_cycle)' },
                { status: 400 }
            );
        }

        // Validate plan
        if (!PLAN_PRICES[plan_id]) {
            return NextResponse.json(
                { success: false, error: 'Invalid plan' },
                { status: 400 }
            );
        }

        // Use the validated userId from JWT
        // (Previously user_id was taken from body but now secured)

        // Calculate subscription period
        const now = new Date();
        const periodStart = now.toISOString();
        let periodEnd: Date;

        if (billing_cycle === 'monthly') {
            periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else {
            periodEnd = new Date(now);
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }

        // Check if user already has a subscription
        const { data: existingSubscription } = await supabase
            .from('user_billing_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (existingSubscription) {
            // Update existing subscription
            const { data: updatedSubscription, error: updateError } = await supabase
                .from('user_billing_subscriptions')
                .update({
                    plan_id: plan_id,
                    billing_cycle: billing_cycle,
                    status: 'active',
                    current_period_start: periodStart,
                    current_period_end: periodEnd.toISOString(),
                    updated_at: now.toISOString(),
                    cancelled_at: null,
                    cancel_reason: null
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (updateError) {
                console.error('Update subscription error:', updateError);
                return NextResponse.json(
                    { success: false, error: 'Failed to update subscription' },
                    { status: 500 }
                );
            }

            // Record plan change history
            await supabase.from('billing_plan_history').insert({
                user_id: userId,
                old_plan_id: existingSubscription.plan_id,
                new_plan_id: plan_id,
                change_type: plan_id > existingSubscription.plan_id ? 'upgrade' : 'downgrade',
                change_reason: 'User payment'
            });

            // Record payment transaction
            if (payment_method && transaction_id) {
                await supabase.from('billing_transactions').insert({
                    user_id: userId,
                    transaction_type: 'subscription_fee',
                    amount: amount || PLAN_PRICES[plan_id][billing_cycle as keyof typeof PLAN_PRICES['basic']],
                    currency: 'USD',
                    description: `${plan_id} plan subscription - ${billing_cycle}`,
                    status: payment_method === 'paypal' ? 'completed' : 'pending',
                    transaction_date: now.toISOString()
                });
            }

            return NextResponse.json({
                success: true,
                subscription: updatedSubscription,
                message: 'Subscription updated successfully'
            });

        } else {
            // Create new subscription
            const { data: newSubscription, error: insertError } = await supabase
                .from('user_billing_subscriptions')
                .insert({
                    user_id: userId,
                    user_email: email,
                    plan_id: plan_id,
                    billing_cycle: billing_cycle,
                    status: 'active',
                    current_period_start: periodStart,
                    current_period_end: periodEnd.toISOString(),
                    billing_mode: 'self_managed'
                })
                .select()
                .single();

            if (insertError) {
                console.error('Create subscription error:', insertError);
                return NextResponse.json(
                    { success: false, error: 'Failed to create subscription' },
                    { status: 500 }
                );
            }

            // Record plan change history
            await supabase.from('billing_plan_history').insert({
                user_id: userId,
                old_plan_id: null,
                new_plan_id: plan_id,
                change_type: 'new',
                change_reason: 'Initial subscription'
            });

            // Record payment transaction
            if (payment_method && transaction_id) {
                await supabase.from('billing_transactions').insert({
                    user_id: userId,
                    transaction_type: 'subscription_fee',
                    amount: amount || PLAN_PRICES[plan_id][billing_cycle as keyof typeof PLAN_PRICES['basic']],
                    currency: 'USD',
                    description: `${plan_id} plan subscription - ${billing_cycle}`,
                    status: payment_method === 'paypal' ? 'completed' : 'pending'
                });
            }

            return NextResponse.json({
                success: true,
                subscription: newSubscription,
                message: 'Subscription created successfully'
            });
        }

    } catch (error) {
        console.error('Subscription API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get subscription status
export async function GET(request: NextRequest) {
    try {
        // ✅ Verify user identity server-side via JWT
        const { createClient: createServerClient } = await import('@/utils/supabase/server');
        const supabaseAuth = await createServerClient();
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = user.id;
        const email = user.email;

        // If no user found in profiles, return free plan (no subscription)
        if (!userId) {
            console.log('User not found in profiles for:', email);
        }

        if (!userId) {
            return NextResponse.json({
                success: true,
                subscription: null,
                plan_id: 'free',
                status: 'inactive'
            });
        }

        // Get subscription
        const { data: subscription, error } = await supabase
            .from('user_billing_subscriptions')
            .select(`
                *,
                billing_plans (
                    plan_name,
                    plan_name_ar,
                    price_monthly,
                    price_yearly,
                    max_accounts,
                    max_campaigns,
                    features
                )
            `)
            .eq('user_id', userId)
            .single();

        if (error || !subscription) {
            return NextResponse.json({
                success: true,
                subscription: null,
                plan_id: 'free',
                status: 'inactive'
            });
        }

        // Check if subscription is expired
        const now = new Date();
        const periodEnd = new Date(subscription.current_period_end);

        if (periodEnd < now && subscription.status === 'active') {
            // Mark as expired
            await supabase
                .from('user_billing_subscriptions')
                .update({ status: 'expired' })
                .eq('user_id', userId);

            subscription.status = 'expired';
        }

        return NextResponse.json({
            success: true,
            subscription: subscription,
            plan_id: subscription.plan_id,
            status: subscription.status,
            expires_at: subscription.current_period_end,
            plan_details: subscription.billing_plans
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
