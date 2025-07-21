import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for OAuth operations
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// TypeScript interfaces
interface TokenRefreshResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

interface RefreshTokenRequest {
  provider: 'google';
  force_refresh?: boolean;
}

// إعداد Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // التحقق من session token
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session token' },
        { status: 401 }
      );
    }

    // التحقق من صحة الجلسة
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    // التحقق من انتهاء صلاحية الجلسة
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Unauthorized - Session expired' },
        { status: 401 }
      );
    }

    const userId = session.user_id;
    const body: RefreshTokenRequest = await request.json();
    const { provider = 'google', force_refresh = false } = body;

    // جلب OAuth token للمستخدم
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: `${provider} account not connected` },
        { status: 400 }
      );
    }

    // التحقق من الحاجة لتحديث الـ token
    const now = new Date();
    const expiresAt = tokenData.expires_at ? new Date(tokenData.expires_at) : null;
    const needsRefresh = force_refresh || !expiresAt || expiresAt <= now;

    if (!needsRefresh) {
      return NextResponse.json({
        success: true,
        message: 'Token is still valid',
        expires_at: expiresAt?.toISOString(),
        expires_in: expiresAt ? Math.floor((expiresAt.getTime() - now.getTime()) / 1000) : null
      });
    }

    // التحقق من وجود refresh token
    if (!tokenData.refresh_token) {
      return NextResponse.json(
        { error: 'No refresh token available - user needs to re-authenticate' },
        { status: 400 }
      );
    }

    // تحديث الـ token حسب المزود
    let newTokenData: TokenRefreshResponse;
    
    switch (provider) {
      case 'google':
        newTokenData = await refreshGoogleToken(tokenData.refresh_token);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported provider' },
          { status: 400 }
        );
    }

    // حساب تاريخ انتهاء الصلاحية الجديد
    const newExpiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);

    // تحديث الـ token في قاعدة البيانات
    const { error: updateError } = await supabase
      .from('user_oauth_tokens')
      .update({
        access_token: newTokenData.access_token,
        expires_at: newExpiresAt.toISOString(),
        scope: newTokenData.scope || tokenData.scope,
        token_type: newTokenData.token_type,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', provider);

    if (updateError) {
      console.error('Error updating token in database:', updateError);
      return NextResponse.json(
        { error: 'Failed to save new token' },
        { status: 500 }
      );
    }

    // تسجيل نجاح التحديث
    console.log(`Successfully refreshed ${provider} token for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      expires_at: newExpiresAt.toISOString(),
      expires_in: newTokenData.expires_in,
      provider: provider
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    // التعامل مع أخطاء محددة
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        return NextResponse.json(
          { error: 'Refresh token expired - user needs to re-authenticate' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('invalid_client')) {
        return NextResponse.json(
          { error: 'OAuth configuration error' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // التحقق من session token
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session token' },
        { status: 401 }
      );
    }

    // التحقق من صحة الجلسة
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const userId = session.user_id;
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'google';

    // جلب معلومات الـ token الحالي
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_oauth_tokens')
      .select('expires_at, created_at, updated_at, scope')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: `${provider} account not connected` },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = tokenData.expires_at ? new Date(tokenData.expires_at) : null;
    const isExpired = expiresAt ? expiresAt <= now : true;
    const expiresIn = expiresAt ? Math.floor((expiresAt.getTime() - now.getTime()) / 1000) : 0;

    return NextResponse.json({
      provider: provider,
      is_expired: isExpired,
      expires_at: expiresAt?.toISOString(),
      expires_in: Math.max(0, expiresIn),
      scope: tokenData.scope,
      last_updated: tokenData.updated_at,
      created_at: tokenData.created_at
    });

  } catch (error) {
    console.error('Token status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// تحديث Google OAuth token
async function refreshGoogleToken(refreshToken: string): Promise<TokenRefreshResponse> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Google token refresh failed:', errorData);
    
    if (response.status === 400 && errorData.error === 'invalid_grant') {
      throw new Error('invalid_grant: Refresh token expired or revoked');
    }
    
    if (response.status === 401 && errorData.error === 'invalid_client') {
      throw new Error('invalid_client: OAuth client configuration error');
    }
    
    throw new Error(`Failed to refresh Google token: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    expires_in: data.expires_in || 3600,
    scope: data.scope,
    token_type: data.token_type || 'Bearer'
  };
}
