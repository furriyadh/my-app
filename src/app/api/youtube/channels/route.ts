import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl } from '@/lib/config';

export async function GET(request: NextRequest) {
    try {
        const backendUrl = getBackendUrl();
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('oauth_access_token')?.value;

        console.log('🔗 Proxying YouTube channels request to:', `${backendUrl}/api/youtube/channels`);

        // Forward the request to the Python backend
        // The backend accepts 'oauth_access_token' in cookies OR 'Authorization' header
        const response = await fetch(`${backendUrl}/api/youtube/channels`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                // Also forward all cookies just in case the backend relies on session cookies
                'Cookie': request.headers.get('cookie') || ''
            }
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('❌ Proxy error fetching YouTube channels:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to connect to backend service',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
