import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * NowPayments Webhook (IPN) Handler
 * Receives payment confirmations from NowPayments
 * 
 * POST /api/payments/nowpayments/webhook
 */

const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface NowPaymentsIPN {
    payment_id: number;
    payment_status: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'partially_paid' | 'finished' | 'failed' | 'refunded' | 'expired';
    pay_address: string;
    price_amount: number;
    price_currency: string;
    pay_amount: number;
    pay_currency: string;
    order_id: string;
    order_description: string;
    purchase_id: string;
    outcome_amount: number;
    outcome_currency: string;
    created_at: string;
    updated_at: string;
    actually_paid: number;
    actually_paid_at_fiat: number;
}

// Verify IPN signature - CRITICAL for security
function verifySignature(payload: string, signature: string): boolean {
    if (!NOWPAYMENTS_IPN_SECRET) {
        console.error('❌ CRITICAL: IPN Secret not configured! Rejecting webhook.');
        return false; // NEVER allow without secret - security critical
    }

    if (!signature) {
        console.error('❌ No signature provided in webhook request');
        return false;
    }

    const hmac = crypto.createHmac('sha512', NOWPAYMENTS_IPN_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    const isValid = signature === expectedSignature;
    if (!isValid) {
        console.error('❌ Signature mismatch - possible attack attempt');
    }
    return isValid;
}

export async function POST(request: NextRequest) {
    try {
        // Get raw body for signature verification
        const rawBody = await request.text();
        const signature = request.headers.get('x-nowpayments-sig') || '';

        console.log('📥 Received NowPayments IPN webhook');

        // Verify signature
        if (!verifySignature(rawBody, signature)) {
            console.error('❌ Invalid IPN signature');
            return NextResponse.json(
                { success: false, error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Parse IPN data
        const ipnData: NowPaymentsIPN = JSON.parse(rawBody);
        console.log('📋 IPN Data:', {
            payment_id: ipnData.payment_id,
            status: ipnData.payment_status,
            order_id: ipnData.order_id,
            amount: ipnData.price_amount,
            actually_paid: ipnData.actually_paid,
        });

        // Handle different payment statuses
        switch (ipnData.payment_status) {
            case 'finished':
            case 'confirmed':
                await handleSuccessfulPayment(ipnData);
                break;

            case 'partially_paid':
                await handlePartialPayment(ipnData);
                break;

            case 'failed':
            case 'expired':
            case 'refunded':
                await handleFailedPayment(ipnData);
                break;

            case 'waiting':
            case 'confirming':
            case 'sending':
                // Payment in progress - log but don't process yet
                console.log(`⏳ Payment ${ipnData.payment_id} status: ${ipnData.payment_status}`);
                break;

            default:
                console.log(`❓ Unknown payment status: ${ipnData.payment_status}`);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        return NextResponse.json(
            { success: false, error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function handleSuccessfulPayment(ipnData: NowPaymentsIPN) {
    console.log('✅ Processing successful payment:', ipnData.payment_id);

    const orderId = ipnData.order_id;
    const amount = ipnData.price_amount;

    // NEW format: SUB-PRO-MONTHLY-XXXXX or DEP-100-XXXXX
    // OLD format: DEPOSIT_{email}_{timestamp} or SUB_{email}_{plan}_{cycle}_{timestamp}

    // Get email from invoice data (NowPayments stores customer_email)
    let email = '';

    // Try to get payment details to fetch email
    try {
        const paymentResponse = await fetch(`https://api.nowpayments.io/v1/payment/${ipnData.payment_id}`, {
            headers: {
                'x-api-key': process.env.NOWPAYMENTS_API_KEY || ''
            }
        });
        const paymentData = await paymentResponse.json();
        email = paymentData.customer_email || '';
        console.log('📧 Customer email from payment:', email);
    } catch (err) {
        console.warn('⚠️ Could not fetch payment details for email');
    }

    // Parse order type from order_id
    if (orderId.startsWith('DEP-') || orderId.startsWith('DEPOSIT_')) {
        // Handle deposit to balance
        if (orderId.startsWith('DEPOSIT_')) {
            // Legacy format: DEPOSIT_{email}_{timestamp}
            const orderParts = orderId.split('_');
            email = email || orderParts.slice(1, -1).join('_');
        }
        await processDeposit(email, amount, ipnData);
    } else if (orderId.startsWith('SUB-') || orderId.startsWith('SUB_')) {
        // Handle subscription payment
        let plan = 'pro';
        let cycle = 'monthly';

        if (orderId.startsWith('SUB-')) {
            // New format: SUB-PRO-MONTHLY-XXXXX
            const parts = orderId.split('-');
            plan = parts[1]?.toLowerCase() || 'pro';
            cycle = parts[2]?.toLowerCase() || 'monthly';
        } else {
            // Legacy format: SUB_{email}_{plan}_{cycle}_{timestamp}
            const orderParts = orderId.split('_');
            email = email || orderParts[1];
            plan = orderParts[2] || 'pro';
            cycle = orderParts[3] || 'monthly';
        }
        await processSubscription(email, plan, cycle, amount, ipnData);
    }
}


async function processDeposit(email: string, amount: number, ipnData: NowPaymentsIPN) {
    console.log(`💰 Processing deposit for ${email}: $${amount}`);

    try {
        // Get user by email
        const { data: user, error: userError } = await supabase
            .from('user_profiles')
            .select('id, furriyadh_balance')
            .eq('email', email)
            .single();

        if (userError || !user) {
            console.error('❌ User not found:', email);
            return;
        }

        // Calculate commission (20%)
        const commissionRate = parseFloat(process.env.NEXT_PUBLIC_FURRIYADH_COMMISSION_RATE || '0.20');
        const commission = amount * commissionRate;
        const netAmount = amount - commission;
        const newBalance = (user.furriyadh_balance || 0) + netAmount;

        // Update user balance
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ furriyadh_balance: newBalance })
            .eq('id', user.id);

        if (updateError) {
            console.error('❌ Failed to update balance:', updateError);
            return;
        }

        // Record transaction
        await supabase.from('billing_transactions').insert({
            user_id: user.id,
            type: 'deposit',
            amount: amount,
            net_amount: netAmount,
            commission: commission,
            payment_method: 'usdt_nowpayments',
            payment_reference: ipnData.payment_id.toString(),
            status: 'completed',
            metadata: {
                pay_currency: ipnData.pay_currency,
                pay_address: ipnData.pay_address,
                actually_paid: ipnData.actually_paid,
                nowpayments_order_id: ipnData.order_id,
            }
        });

        console.log(`✅ Deposit processed: $${amount} → $${netAmount} net (balance: $${newBalance})`);

        // Send confirmation email
        await sendConfirmationEmail(email, amount, netAmount, newBalance, ipnData.payment_id.toString());

    } catch (error) {
        console.error('❌ Error processing deposit:', error);
    }
}

async function processSubscription(email: string, plan: string, cycle: string, amount: number, ipnData: NowPaymentsIPN) {
    console.log(`📦 Processing subscription for ${email}: ${plan} (${cycle})`);

    try {
        // Get user
        const { data: user, error: userError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) {
            console.error('❌ User not found:', email);
            return;
        }

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        if (cycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Create or update subscription
        const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                plan: plan,
                billing_cycle: cycle,
                status: 'active',
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                payment_method: 'usdt_nowpayments',
                last_payment_id: ipnData.payment_id.toString(),
            }, {
                onConflict: 'user_id'
            });

        if (subError) {
            console.error('❌ Failed to create subscription:', subError);
            return;
        }

        // Record transaction
        await supabase.from('billing_transactions').insert({
            user_id: user.id,
            type: 'subscription',
            amount: amount,
            description: `${plan} subscription (${cycle})`,
            payment_method: 'usdt_nowpayments',
            payment_reference: ipnData.payment_id.toString(),
            status: 'completed',
        });

        console.log(`✅ Subscription activated: ${plan} (${cycle}) until ${endDate.toISOString()}`);

        // Send confirmation email
        await sendSubscriptionEmail(email, plan, cycle, endDate);

    } catch (error) {
        console.error('❌ Error processing subscription:', error);
    }
}

async function handlePartialPayment(ipnData: NowPaymentsIPN) {
    console.log(`⚠️ Partial payment received for ${ipnData.order_id}:`, {
        expected: ipnData.price_amount,
        received: ipnData.actually_paid,
    });
    // Log but don't process - user needs to complete payment
}

async function handleFailedPayment(ipnData: NowPaymentsIPN) {
    console.log(`❌ Payment failed/expired for ${ipnData.order_id}`);
    // Could notify user or clean up pending records
}

async function sendConfirmationEmail(email: string, amount: number, netAmount: number, newBalance: number, transactionId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        await fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: email,
                type: 'deposit_confirmation',
                data: {
                    amount: amount.toFixed(2),
                    netAmount: netAmount.toFixed(2),
                    commission: (amount - netAmount).toFixed(2),
                    commissionRate: 20,
                    newBalance: newBalance.toFixed(2),
                    transactionId: transactionId,
                    paymentMethod: 'USDT (NowPayments)',
                    date: new Date().toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    }),
                    dashboardUrl: `${baseUrl}/google-ads/billing`
                }
            })
        });
    } catch (error) {
        console.error('❌ Failed to send confirmation email:', error);
    }
}

async function sendSubscriptionEmail(email: string, plan: string, cycle: string, endDate: Date) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        await fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: email,
                type: 'subscription_confirmation',
                data: {
                    plan: plan,
                    cycle: cycle,
                    endDate: endDate.toLocaleDateString('en-US', { dateStyle: 'long' }),
                    dashboardUrl: `${baseUrl}/google-ads/billing`
                }
            })
        });
    } catch (error) {
        console.error('❌ Failed to send subscription email:', error);
    }
}

// Health check
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'NowPayments webhook endpoint active',
        ipn_configured: !!NOWPAYMENTS_IPN_SECRET
    });
}
