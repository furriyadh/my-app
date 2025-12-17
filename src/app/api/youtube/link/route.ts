import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl } from '@/lib/config';

export async function POST(request: NextRequest) {
    try {
        const backendUrl = getBackendUrl();
        const body = await request.json();
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('oauth_access_token')?.value;

        console.log('🔗 Proxying YouTube link request to:', `${backendUrl}/api/youtube/link`);

        const response = await fetch(`${backendUrl}/api/youtube/link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('❌ Proxy error linking YouTube channel:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to connect to backend service',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
