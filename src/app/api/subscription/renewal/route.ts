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

/**
 * 💳 Process Card Payment
 * This simulates a payment gateway call (replace with Stripe/Checkout.com)
 * Currently returns success for demo - in production, call actual payment API
 */
interface PaymentRequest {
    cardId: string;
    amount: number;
    currency: string;
    description: string;
    userId: string;
}

interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

async function processCardPayment(request: PaymentRequest): Promise<PaymentResult> {
    // In production, replace this with actual payment gateway call:
    // - Stripe: stripe.charges.create({...})
    // - Checkout.com: checkout.payments.request({...})

    console.log(`💳 Processing payment: $${request.amount} for card ${request.cardId}`);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // For demo/testing: 95% success rate to simulate real-world scenarios
    // Set to 100% success (always true) for production until real gateway is integrated
    const isSuccessful = true; // Change to: Math.random() > 0.05 for testing failures

    if (isSuccessful) {
        return {
            success: true,
            transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    } else {
        // Simulate various failure reasons
        const failureReasons = [
            'Insufficient funds',
            'Card declined',
            'Expired card',
            'Invalid CVV',
            'Payment gateway timeout'
        ];
        return {
            success: false,
            error: failureReasons[Math.floor(Math.random() * failureReasons.length)]
        };
    }
}

/**
 * Subscription Auto-Renewal Handler
 * This endpoint should be called by a cron job (e.g., daily at midnight)
 * 
 * Tasks:
 * 1. Find subscriptions expiring within 3 days → Send reminder email
 * 2. Find subscriptions expiring today → Process auto-renewal
 * 3. Find expired subscriptions → Mark as expired
 */
export async function POST(request: NextRequest) {
    try {
        // Verify cron secret (for security)
        const authHeader = request.headers.get('Authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const reminderDate = threeDaysFromNow.toISOString().split('T')[0];

        const results = {
            reminders_sent: 0,
            renewals_processed: 0,
            expired_marked: 0,
            errors: [] as string[]
        };

        // 1. SEND RENEWAL REMINDERS (3 days before expiry)
        const { data: reminderSubscriptions } = await supabase
            .from('user_billing_subscriptions')
            .select('*, user_profiles!inner(email)')
            .eq('status', 'active')
            .gte('current_period_end', today)
            .lte('current_period_end', reminderDate);

        if (reminderSubscriptions) {
            for (const sub of reminderSubscriptions) {
                try {
                    const userEmail = sub.user_email || sub.user_profiles?.email;
                    if (!userEmail) continue;

                    const endDate = new Date(sub.current_period_end);
                    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    if (daysLeft <= 3 && daysLeft > 0) {
                        const planPrice = PLAN_PRICES[sub.plan_id]?.[sub.billing_cycle as 'monthly' | 'yearly'] || 0;

                        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/email/send`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: userEmail,
                                type: 'subscription_renewal_reminder',
                                data: {
                                    planName: sub.plan_id.charAt(0).toUpperCase() + sub.plan_id.slice(1),
                                    daysUntilRenewal: daysLeft,
                                    renewalDate: endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                                    amount: planPrice.toFixed(2),
                                    dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/google-ads/billing`
                                }
                            })
                        });

                        results.reminders_sent++;
                    }
                } catch (err: any) {
                    results.errors.push(`Reminder error for ${sub.user_id}: ${err.message}`);
                }
            }
        }

        // 2. PROCESS AUTO-RENEWALS (subscriptions expiring today)
        // 🔄 Smart Card Fallback System - Like Amazon/Netflix
        const { data: expiringToday } = await supabase
            .from('user_billing_subscriptions')
            .select('*')
            .eq('status', 'active')
            .eq('current_period_end', today);

        if (expiringToday) {
            for (const sub of expiringToday) {
                try {
                    // Get user's saved payment methods ordered by: default first, then by creation
                    const { data: paymentMethods } = await supabase
                        .from('user_payment_methods')
                        .select('*')
                        .eq('user_id', sub.user_id)
                        .eq('type', 'card')
                        .order('is_default', { ascending: false })
                        .order('created_at', { ascending: true });

                    if (!paymentMethods || paymentMethods.length === 0) {
                        results.errors.push(`No payment methods for user ${sub.user_id}`);
                        continue;
                    }

                    const planPrice = PLAN_PRICES[sub.plan_id]?.[sub.billing_cycle as 'monthly' | 'yearly'] || 0;
                    let paymentSuccess = false;
                    let usedPaymentMethod = null;
                    let attemptedCards: string[] = [];

                    // 🔄 Try each card in order (default first, then fallback to others)
                    for (const card of paymentMethods) {
                        attemptedCards.push(`${card.brand} ****${card.last4}`);

                        // Simulate payment processing (replace with actual payment gateway call)
                        const paymentResult = await processCardPayment({
                            cardId: card.id,
                            amount: planPrice,
                            currency: 'USD',
                            description: `${sub.plan_id} plan auto-renewal`,
                            userId: sub.user_id
                        });

                        if (paymentResult.success) {
                            paymentSuccess = true;
                            usedPaymentMethod = card;
                            console.log(`✅ Payment succeeded with ${card.brand} ****${card.last4}`);
                            break;
                        } else {
                            console.log(`❌ Payment failed with ${card.brand} ****${card.last4}: ${paymentResult.error}`);

                            // Record failed attempt
                            await supabase.from('billing_transactions').insert({
                                user_id: sub.user_id,
                                transaction_type: 'subscription_fee',
                                amount: planPrice,
                                currency: 'USD',
                                description: `Failed auto-renewal attempt - ${card.brand} ****${card.last4}`,
                                status: 'failed',
                                payment_method_id: card.id
                            });
                        }
                    }

                    if (paymentSuccess && usedPaymentMethod) {
                        // Calculate new period
                        const newStart = new Date(sub.current_period_end);
                        const newEnd = new Date(newStart);

                        if (sub.billing_cycle === 'monthly') {
                            newEnd.setMonth(newEnd.getMonth() + 1);
                        } else {
                            newEnd.setFullYear(newEnd.getFullYear() + 1);
                        }

                        // Update subscription period
                        const { error: updateError } = await supabase
                            .from('user_billing_subscriptions')
                            .update({
                                current_period_start: newStart.toISOString(),
                                current_period_end: newEnd.toISOString(),
                                updated_at: now.toISOString()
                            })
                            .eq('id', sub.id);

                        if (!updateError) {
                            // Record successful transaction
                            await supabase.from('billing_transactions').insert({
                                user_id: sub.user_id,
                                transaction_type: 'subscription_fee',
                                amount: planPrice,
                                currency: 'USD',
                                description: `${sub.plan_id} plan auto-renewal - ${sub.billing_cycle} (${usedPaymentMethod.brand} ****${usedPaymentMethod.last4})`,
                                status: 'completed',
                                payment_method_id: usedPaymentMethod.id
                            });

                            // Send success email
                            const userEmail = sub.user_email;
                            if (userEmail) {
                                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/email/send`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        to: userEmail,
                                        type: 'subscription_confirmation',
                                        data: {
                                            planName: sub.plan_id,
                                            price: planPrice.toFixed(2),
                                            billingCycle: sub.billing_cycle,
                                            cardLast4: usedPaymentMethod.last4
                                        }
                                    })
                                });
                            }

                            results.renewals_processed++;
                        }
                    } else {
                        // All cards failed - mark subscription as payment_failed
                        await supabase
                            .from('user_billing_subscriptions')
                            .update({
                                status: 'payment_failed',
                                updated_at: now.toISOString()
                            })
                            .eq('id', sub.id);

                        results.errors.push(`All ${attemptedCards.length} cards failed for user ${sub.user_id}: ${attemptedCards.join(', ')}`);

                        // Send payment failed email
                        const userEmail = sub.user_email;
                        if (userEmail) {
                            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/email/send`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    to: userEmail,
                                    type: 'payment_failed',
                                    data: {
                                        planName: sub.plan_id,
                                        amount: planPrice.toFixed(2),
                                        cardsAttempted: attemptedCards.length,
                                        updatePaymentUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/google-ads/billing`
                                    }
                                })
                            });
                        }
                    }
                } catch (err: any) {
                    results.errors.push(`Renewal error for ${sub.user_id}: ${err.message}`);
                }
            }
        }

        // 3. MARK EXPIRED SUBSCRIPTIONS (past due date, no renewal)
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const { data: expiredSubs, error: expiredError } = await supabase
            .from('user_billing_subscriptions')
            .update({ status: 'expired', updated_at: now.toISOString() })
            .eq('status', 'active')
            .lt('current_period_end', yesterday.toISOString())
            .select();

        if (!expiredError && expiredSubs) {
            results.expired_marked = expiredSubs.length;
        }

        console.log('📅 Subscription renewal job completed:', results);

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            results
        });

    } catch (error: any) {
        console.error('Subscription renewal job error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// GET endpoint for manual trigger / status check
export async function GET(request: NextRequest) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get subscription stats
    const { data: activeCount } = await supabase
        .from('user_billing_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

    const { data: expiringToday } = await supabase
        .from('user_billing_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('current_period_end', today);

    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: expiringSoon } = await supabase
        .from('user_billing_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('current_period_end', today)
        .lte('current_period_end', threeDaysFromNow.toISOString().split('T')[0]);

    return NextResponse.json({
        status: 'healthy',
        timestamp: now.toISOString(),
        stats: {
            active_subscriptions: activeCount || 0,
            expiring_today: expiringToday || 0,
            expiring_in_3_days: expiringSoon || 0
        },
        note: 'POST to this endpoint to run the renewal job'
    });
}
