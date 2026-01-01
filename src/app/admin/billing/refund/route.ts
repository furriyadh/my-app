/**
 * 💸 Furriyadh Refund API Route
 * Proxy to Python backend for refund operations
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';

// GET - Get refunds for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email is required'
            }, { status: 400 });
        }

        const response = await fetch(`${BACKEND_URL}/api/furriyadh/refunds?email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json({
                success: false,
                error: 'Backend returned non-JSON response'
            }, { status: 502 });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('❌ Furriyadh Refunds GET error:', error.message);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// POST - Process a refund
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, amount, reason, admin_email } = body;

        if (!email || !amount) {
            return NextResponse.json({
                success: false,
                error: 'Email and amount are required'
            }, { status: 400 });
        }

        const response = await fetch(`${BACKEND_URL}/api/furriyadh/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, amount, reason, admin_email }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json({
                success: false,
                error: 'Backend returned non-JSON response'
            }, { status: 502 });
        }

        const data = await response.json();

        // If successful, send email notification
        if (data.success && data.refund) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/email/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: email,
                        type: 'refund_processed',
                        data: {
                            amount: amount.toFixed(2),
                            reference: data.refund.payment_reference,
                            date: new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }),
                            reason: reason || 'Not specified',
                            newBalance: data.balance?.current_balance?.toFixed(2) || '0.00',
                            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://furriyadh.com'}/google-ads/billing`
                        }
                    })
                });
            } catch (emailError) {
                console.error('❌ Failed to send refund email:', emailError);
                // Don't fail the refund if email fails
            }
        }

        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('❌ Furriyadh Refund POST error:', error.message);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
