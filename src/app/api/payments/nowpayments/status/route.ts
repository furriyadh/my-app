import { NextRequest, NextResponse } from 'next/server';

/**
 * NowPayments Payment Status API
 * Check the status of a payment
 * 
 * GET /api/payments/nowpayments/status?payment_id=123
 */

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

export async function GET(request: NextRequest) {
    try {
        if (!NOWPAYMENTS_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'Payment gateway not configured' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const paymentId = searchParams.get('payment_id');
        const invoiceId = searchParams.get('invoice_id');

        if (!paymentId && !invoiceId) {
            return NextResponse.json(
                { success: false, error: 'payment_id or invoice_id is required' },
                { status: 400 }
            );
        }

        let endpoint = '';
        if (paymentId) {
            endpoint = `${NOWPAYMENTS_API_URL}/payment/${paymentId}`;
        } else if (invoiceId) {
            endpoint = `${NOWPAYMENTS_API_URL}/invoice-payment/${invoiceId}`;
        }

        const response = await fetch(endpoint, {
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ NowPayments status check error:', response.status, errorText);
            return NextResponse.json(
                { success: false, error: `Payment status check failed: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // For invoice-payment endpoint, the response is an array
        if (invoiceId && Array.isArray(data)) {
            // Return the most recent payment for this invoice
            const latestPayment = data[0];
            return NextResponse.json({
                success: true,
                payment: latestPayment ? {
                    id: latestPayment.payment_id,
                    status: latestPayment.payment_status,
                    pay_amount: latestPayment.pay_amount,
                    pay_currency: latestPayment.pay_currency,
                    actually_paid: latestPayment.actually_paid,
                    pay_address: latestPayment.pay_address,
                } : null,
                has_payment: data.length > 0,
            });
        }

        // Single payment response
        return NextResponse.json({
            success: true,
            payment: {
                id: data.payment_id,
                status: data.payment_status,
                pay_amount: data.pay_amount,
                pay_currency: data.pay_currency,
                actually_paid: data.actually_paid,
                pay_address: data.pay_address,
                price_amount: data.price_amount,
                price_currency: data.price_currency,
                created_at: data.created_at,
                updated_at: data.updated_at,
            }
        });

    } catch (error) {
        console.error('❌ Status check error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check payment status' },
            { status: 500 }
        );
    }
}
