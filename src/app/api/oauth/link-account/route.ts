
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

// 1. Unified Token Logic: Get the best available Refresh Token
function getUnifiedRefreshToken(): string | undefined {
  const mccToken = process.env.MCC_REFRESH_TOKEN;
  const adsToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  // Prioritize token starting with "1//04" (Standard Google User/Offline Token)
  if (mccToken && mccToken.startsWith('1//04')) return mccToken;
  if (adsToken && adsToken.startsWith('1//04')) return adsToken;

  // Fallback to whichever is available
  return mccToken || adsToken;
}

// 2. Auto-Refresh: Generate a fresh Access Token
async function generateFreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    console.log('🔄 Auto-Refreshing Access Token for Link Operation...');
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('❌ Missing Google Ads Client ID or Secret in environment variables');
      return null;
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Token Refresh Failed (Status: ${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Access Token generated successfully.');
    return data.access_token;

  } catch (error) {
    console.error('❌ Network error during token refresh:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Processing Link Account Request (Robust Worker Mode)...');

    // 1. Get Unified Refresh Token
    const refreshToken = getUnifiedRefreshToken();
    if (!refreshToken) {
      console.error('❌ critical: No valid MCC Refresh Token found in environment.');
      return NextResponse.json({
        success: false,
        error: 'Configuration Error',
        message: 'System is missing MCC permissions (Token not found).'
      }, { status: 500 });
    }

    // 2. Initial Token Gen
    let accessToken = await generateFreshAccessToken(refreshToken);
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Authentication Failed',
        message: 'Failed to generate access token for MCC.'
      }, { status: 401 });
    }

    const { customer_id, account_name } = await request.json();
    if (!customer_id) {
      return NextResponse.json({ success: false, message: 'Customer ID required' }, { status: 400 });
    }

    const backendUrl = getBackendUrl();

    // Helper to call Backend
    const performLinkRequest = async (token: string) => {
      return fetch(`${backendUrl}/api/link-customer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_id, account_name })
      });
    };

    // 3. First Attempt
    console.log(`📤 Sending Link Request for ${customer_id} to Backend...`);
    let response = await performLinkRequest(accessToken);
    let responseData = null;

    // Read response safely
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('❌ Failed to parse backend response');
      return NextResponse.json({ success: false, message: 'Invalid Backend Response' }, { status: 502 });
    }

    // 4. Retry Logic (Permission Denied or Auth Error)
    if (!response.ok) {
      const errorMsg = JSON.stringify(responseData);

      // Detect Permission Error or Auth Error
      if (response.status === 401 || (responseData.error && responseData.error.includes('PERMISSION_DENIED'))) {
        console.warn(`⚠️ Request failed (${response.status}). Retrying with fresh token... Error: ${responseData.error}`);

        // Regenerate Token
        accessToken = await generateFreshAccessToken(refreshToken);
        if (accessToken) {
          // Retry Request
          console.log('🔁 Retrying Link Request...');
          response = await performLinkRequest(accessToken);
          // Parse new response
          try { responseData = await response.json(); } catch (e) { }
        }
      }
    }

    // 5. Final Result Handling
    if (response.ok && responseData.success) {
      // ⚠️ STRICT MATRIX: Return actual status from backend (PENDING, ACTIVE, etc.)
      const actualStatus = responseData.status || 'PENDING';
      const isPending = actualStatus === 'PENDING' || actualStatus === 'INVITED';

      console.log(`✅ Link Request processed: ${actualStatus} (isPending: ${isPending})`);

      return NextResponse.json({
        success: true,
        status: actualStatus, // ⚡ Critical for Strict Matrix
        message: isPending ? 'Invitation sent - awaiting client acceptance' : 'Account linked successfully',
        data: responseData
      });
    } else {
      console.error('❌ Link Failed after attempts:', responseData);
      return NextResponse.json({
        success: false,
        error: responseData?.error || 'Link Failed',
        message: responseData?.message || 'فشل ربط الحساب',
        details: responseData
      }, { status: response.status || 400 });
    }

  } catch (error) {
    console.error('❌ Critical Error in Link Route:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred.'
    }, { status: 500 });
  }
}
