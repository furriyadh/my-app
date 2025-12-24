import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';
import { cookies } from 'next/headers';

// دالة لتجديد access token
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required'
      }, { status: 400 });
    }

    console.log('🔓 إلغاء ربط الحساب:', { customerId });

    // الحصول على Access Token
    const mccRefreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    const cookieStore = await cookies();
    const userRefreshToken = cookieStore.get('oauth_refresh_token')?.value;

    let accessToken: string | null = null;
    if (mccRefreshToken) {
      accessToken = await refreshAccessToken(mccRefreshToken);
    }
    if (!accessToken && userRefreshToken) {
      accessToken = await refreshAccessToken(userRefreshToken);
    }

    // استدعاء Flask Backend
    const backendUrl = getBackendUrl();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('🔑 تمرير Access Token إلى Flask Backend');
    }

    const backendResponse = await fetch(`${backendUrl}/api/unlink-customer`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ customer_id: customerId })
    });

    const result = await backendResponse.json();

    if (backendResponse.ok && result.success) {
      console.log('✅ تم إلغاء ربط الحساب بنجاح:', customerId);
      return NextResponse.json({
        success: true,
        message: 'Account unlinked successfully',
        data: {
          customerId,
          status: 'UNLINKED'
        }
      });
    } else {
      console.error('❌ فشل إلغاء الربط:', result);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to unlink account',
        message: result.message || 'خطأ في إلغاء ربط الحساب'
      }, { status: backendResponse.status || 400 });
    }

  } catch (error) {
    console.error('❌ Error unlinking account:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}
