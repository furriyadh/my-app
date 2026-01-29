import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
    try {
        // Get user from cookies
        const cookieStore = await cookies();
        const userInfoCookie = cookieStore.get('oauth_user_info');

        if (!userInfoCookie) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const userInfo = JSON.parse(userInfoCookie.value);
        const userEmail = userInfo.email;

        if (!userEmail) {
            return NextResponse.json({ error: 'User email not found' }, { status: 400 });
        }

        // Create Supabase admin client
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Update user subscription to free plan
        const { error } = await supabase
            .from('user_billing_subscriptions')
            .update({
                plan_id: 'free',
                billing_cycle: 'monthly',
                status: 'active',
                stripe_subscription_id: null,
                current_period_end: null,
                updated_at: new Date().toISOString()
            })
            .eq('user_email', userEmail);

        if (error) {
            console.error('Error downgrading to free:', error);
            return NextResponse.json({ error: 'Failed to downgrade' }, { status: 500 });
        }

        // Log the plan change
        const { data: userData } = await supabase
            .from('user_billing_subscriptions')
            .select('user_id')
            .eq('user_email', userEmail)
            .single();

        if (userData?.user_id) {
            await supabase.from('billing_plan_history').insert({
                user_id: userData.user_id,
                old_plan_id: null, // We don't know the old plan here
                new_plan_id: 'free',
                change_type: 'downgrade',
                change_reason: 'User requested downgrade to free plan'
            });
        }

        console.log(`✅ User ${userEmail} downgraded to free plan`);

        return NextResponse.json({
            success: true,
            message: 'Successfully downgraded to free plan',
            plan_id: 'free'
        });

    } catch (error) {
        console.error('Error in downgrade-to-free:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
