import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { billingMode } = body;

        // ✅ Verify user identity server-side via JWT
        const { createClient: createServerClient } = await import('@/utils/supabase/server');
        const supabaseAuth = await createServerClient();
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

        if (authError || !user) {
            console.error('❌ Unauthorized billing mode update attempt:', authError);
            return NextResponse.json(
                { error: 'Unauthorized: Valid session required' },
                { status: 401 }
            );
        }

        const userId = user.id;
        const userEmail = user.email;

        if (!billingMode) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, billingMode' },
                { status: 400 }
            );
        }

        // Validate billing mode
        if (!['self_managed', 'furriyadh_managed'].includes(billingMode)) {
            return NextResponse.json(
                { error: 'Invalid billing mode. Must be "self_managed" or "furriyadh_managed"' },
                { status: 400 }
            );
        }

        // Get current billing mode for history
        const { data: currentSubscription } = await supabase
            .from('user_billing_subscriptions')
            .select('billing_mode')
            .eq('user_id', userId)
            .single();

        const oldMode = currentSubscription?.billing_mode || 'self_managed';

        // Update billing mode in user_billing_subscriptions
        const { data: updatedSubscription, error: updateError } = await supabase
            .from('user_billing_subscriptions')
            .upsert({
                user_id: userId,
                user_email: userEmail,
                billing_mode: billingMode,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (updateError) {
            console.error('Error updating billing mode:', updateError);
            return NextResponse.json(
                { error: 'Failed to update billing mode', details: updateError.message },
                { status: 500 }
            );
        }

        // Log the change in billing_mode_history
        if (oldMode !== billingMode) {
            await supabase
                .from('billing_mode_history')
                .insert({
                    user_id: userId,
                    old_mode: oldMode,
                    new_mode: billingMode,
                    change_reason: 'User toggled billing mode in campaign preview'
                });
        }

        // If switching to managed mode, check for available managed account
        let assignedAccount = null;
        if (billingMode === 'furriyadh_managed') {
            // Check if user already has an assigned account
            const { data: existingAssignment } = await supabase
                .from('managed_account_assignments')
                .select('*, managed_accounts(*)')
                .eq('user_id', userId)
                .eq('is_active', true)
                .single();

            if (existingAssignment) {
                assignedAccount = existingAssignment;
            } else {
                // Find available managed account
                const { data: availableAccount } = await supabase
                    .from('managed_accounts')
                    .select('*')
                    .eq('status', 'available')
                    .is('assigned_to', null)
                    .order('trust_score', { ascending: false })
                    .limit(1)
                    .single();

                if (availableAccount) {
                    // Assign the account to user
                    const { data: assignment, error: assignError } = await supabase
                        .from('managed_account_assignments')
                        .insert({
                            user_id: userId,
                            managed_account_id: availableAccount.id,
                            assignment_reason: 'User selected managed mode'
                        })
                        .select()
                        .single();

                    if (!assignError) {
                        // Update managed account status
                        await supabase
                            .from('managed_accounts')
                            .update({
                                status: 'assigned',
                                assigned_to: userId,
                                assigned_at: new Date().toISOString()
                            })
                            .eq('id', availableAccount.id);

                        assignedAccount = {
                            ...assignment,
                            managed_accounts: availableAccount
                        };
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            billingMode,
            subscription: updatedSubscription,
            assignedAccount,
            message: billingMode === 'furriyadh_managed'
                ? 'تم تفعيل وضع الحساب المُدار بنجاح'
                : 'تم تفعيل وضع حسابك الخاص بنجاح'
        });

    } catch (error) {
        console.error('Error in billing-mode API:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // ✅ Verify user identity server-side via JWT
        const { createClient: createServerClient } = await import('@/utils/supabase/server');
        const supabaseAuth = await createServerClient();
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized: Valid session required' },
                { status: 401 }
            );
        }

        const userId = user.id;

        // Get user's current billing mode
        const { data: subscription, error } = await supabase
            .from('user_billing_subscriptions')
            .select('billing_mode, plan_id, status')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching billing mode:', error);
            return NextResponse.json(
                { error: 'Failed to fetch billing mode' },
                { status: 500 }
            );
        }

        const billingMode = subscription?.billing_mode || 'self_managed';

        // If managed mode, get assigned account details
        let assignedAccount = null;
        if (billingMode === 'furriyadh_managed') {
            const { data: assignment } = await supabase
                .from('managed_account_assignments')
                .select('*, managed_accounts(*)')
                .eq('user_id', userId)
                .eq('is_active', true)
                .single();

            assignedAccount = assignment;
        }

        return NextResponse.json({
            success: true,
            billingMode,
            subscription,
            assignedAccount
        });

    } catch (error) {
        console.error('Error fetching billing mode:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
