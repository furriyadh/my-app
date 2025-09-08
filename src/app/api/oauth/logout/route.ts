import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Next.js API: Logout - Clearing HttpOnly cookies...');
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'تم تسجيل الخروج بنجاح' 
    });
    
    // Clear all HttpOnly cookies
    const cookiesToClear = [
      'oauth_access_token',
      'oauth_refresh_token', 
      'oauth_user_info',
      'oauth_code_verifier',
      'oauth_state',
      'oauth_session_id',
      'oauth_mcc_customer_id',
      'oauth_redirect_after',
      'oauth_expires_in'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Delete immediately
        path: '/'
      });
    });
    
    // Clear non-HttpOnly cookies
    response.cookies.set('google_ads_connected', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Delete immediately
      path: '/'
    });
    
    console.log('✅ All cookies cleared successfully');
    return response;
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Logout failed',
      message: 'فشل في تسجيل الخروج'
    }, { status: 500 });
  }
}
