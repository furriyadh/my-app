/**
 * 🏢 Furriyadh Commission System API Routes
 * Next.js API proxy to Python backend
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend URL configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const action = searchParams.get('action') || 'balance';

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email is required'
            }, { status: 400 });
        }

        let endpoint = '';
        switch (action) {
            case 'account':
                endpoint = `/api/furriyadh/account?email=${encodeURIComponent(email)}`;
                break;
            case 'balance':
                endpoint = `/api/furriyadh/balance?email=${encodeURIComponent(email)}`;
                break;
            case 'campaigns':
                endpoint = `/api/furriyadh/campaigns?email=${encodeURIComponent(email)}`;
                break;
            case 'notifications':
                const unreadOnly = searchParams.get('unread_only') || 'false';
                endpoint = `/api/furriyadh/notifications?email=${encodeURIComponent(email)}&unread_only=${unreadOnly}`;
                break;
            default:
                endpoint = `/api/furriyadh/balance?email=${encodeURIComponent(email)}`;
        }

        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Handle non-JSON responses (like HTML error pages)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json({
                success: false,
                error: 'Backend returned non-JSON response',
                status: response.status
            }, { status: 502 });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        // Suppress noisy polling errors
        if (!error.message?.includes('JSON')) {
            console.error('❌ Furriyadh API GET error:', error.message || error);
        }
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: 'حدث خطأ في الخادم'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...data } = body;

        if (!action) {
            return NextResponse.json({
                success: false,
                error: 'Action is required'
            }, { status: 400 });
        }

        let endpoint = '';
        switch (action) {
            case 'deposit':
                endpoint = '/api/furriyadh/deposit';
                break;
            case 'check-balance':
                endpoint = '/api/furriyadh/check-balance';
                break;
            case 'pause-check':
                endpoint = '/api/furriyadh/pause-check';
                break;
            case 'mark-read':
                endpoint = '/api/furriyadh/notifications/read';
                break;
            case 'create-paypal-order':
                endpoint = '/api/furriyadh/paypal/create-order';
                break;
            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        return NextResponse.json(responseData, { status: response.status });

    } catch (error) {
        console.error('❌ Furriyadh API POST error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: 'حدث خطأ في الخادم'
        }, { status: 500 });
    }
}
