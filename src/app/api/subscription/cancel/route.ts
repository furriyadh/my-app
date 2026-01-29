import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cancel subscription
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, reason } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        // Get user by email
        const { data: userData } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('email', email)
            .single();

        let userId = userData?.user_id;

        if (!userId) {
            const { data: authUser } = await supabase.auth.admin.getUserByEmail(email);
            userId = authUser?.user?.id;
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Get current subscription
        const { data: subscription, error: fetchError } = await supabase
            .from('user_billing_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (fetchError || !subscription) {
            return NextResponse.json(
                { success: false, error: 'No active subscription found' },
                { status: 404 }
            );
        }

        // Update subscription to cancelled
        const now = new Date();
        const { error: updateError } = await supabase
            .from('user_billing_subscriptions')
            .update({
                status: 'cancelled',
                cancelled_at: now.toISOString(),
                cancel_reason: reason || 'User requested cancellation',
                updated_at: now.toISOString()
            })
            .eq('user_id', userId);

        if (updateError) {
            console.error('Cancel subscription error:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to cancel subscription' },
                { status: 500 }
            );
        }

        // Record plan change history
        await supabase.from('billing_plan_history').insert({
            user_id: userId,
            old_plan_id: subscription.plan_id,
            new_plan_id: 'free',
            change_type: 'cancelled',
            change_reason: reason || 'User requested cancellation'
        });

        // Send cancellation email
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    type: 'subscription_cancelled',
                    data: {
                        planName: subscription.plan_id,
                        endDate: subscription.current_period_end,
                        reason: reason
                    }
                })
            });
        } catch (emailError) {
            console.error('Failed to send cancellation email:', emailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription cancelled successfully',
            access_until: subscription.current_period_end
        });

    } catch (error) {
        console.error('Cancel subscription API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
