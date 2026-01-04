import { NextRequest, NextResponse } from 'next/server';

/**
 * NowPayments Create Invoice API
 * Creates a payment invoice for USDT payments
 * 
 * POST /api/payments/nowpayments/create-invoice
 * Body: { amount, email, order_id, description }
 */

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

interface CreateInvoiceRequest {
    amount: number;
    email: string;
    order_id: string;
    description?: string;
    success_url?: string;
    cancel_url?: string;
}

interface NowPaymentsInvoiceResponse {
    id: string;
    token_id: string;
    order_id: string;
    order_description: string;
    price_amount: number;
    price_currency: string;
    pay_currency: string | null;
    ipn_callback_url: string;
    invoice_url: string;
    success_url: string;
    cancel_url: string;
    created_at: string;
    updated_at: string;
}

export async function POST(request: NextRequest) {
    try {
        if (!NOWPAYMENTS_API_KEY) {
            console.error('❌ NowPayments API key not configured');
            return NextResponse.json(
                { success: false, error: 'Payment gateway not configured' },
                { status: 500 }
            );
        }

        const body: CreateInvoiceRequest = await request.json();
        const { amount, email, order_id, description, success_url, cancel_url } = body;

        // Validate required fields
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid amount' },
                { status: 400 }
            );
        }

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        // Get base URL for callbacks
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create invoice via NowPayments API
        const invoiceData = {
            price_amount: amount,
            price_currency: 'usd',
            order_id: order_id || `ORDER_${Date.now()}`,
            order_description: description || `Payment for ${email}`,
            ipn_callback_url: `${baseUrl}/api/payments/nowpayments/webhook`,
            success_url: success_url || `${baseUrl}/google-ads/billing?payment=success`,
            cancel_url: cancel_url || `${baseUrl}/google-ads/billing?payment=cancelled`,
        };

        console.log('📤 Creating NowPayments invoice:', invoiceData);

        const response = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ NowPayments API error:', response.status, errorText);
            return NextResponse.json(
                { success: false, error: `Payment gateway error: ${response.status}` },
                { status: response.status }
            );
        }

        const invoiceResponse: NowPaymentsInvoiceResponse = await response.json();
        console.log('✅ Invoice created:', invoiceResponse.id);

        // Return invoice details
        return NextResponse.json({
            success: true,
            invoice: {
                id: invoiceResponse.id,
                invoice_url: invoiceResponse.invoice_url,
                order_id: invoiceResponse.order_id,
                amount: invoiceResponse.price_amount,
                currency: invoiceResponse.price_currency,
                created_at: invoiceResponse.created_at,
            }
        });

    } catch (error) {
        console.error('❌ Create invoice error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create payment invoice' },
            { status: 500 }
        );
    }
}

// GET - Check API status
export async function GET() {
    try {
        if (!NOWPAYMENTS_API_KEY) {
            return NextResponse.json({ success: false, error: 'API key not configured' });
        }

        // Check NowPayments API status
        const response = await fetch(`${NOWPAYMENTS_API_URL}/status`, {
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
            },
        });

        const data = await response.json();
        return NextResponse.json({ success: true, status: data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'API check failed' });
    }
}
