import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * OAuth Logout Handler - يتبع تدفق البيانات الصحيح
 * Frontend → Next.js API Routes → Flask Backend → Google Ads API
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 بدء عملية تسجيل الخروج...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    const refreshToken = cookieStore.get('oauth_refresh_token')?.value;
    
    // إلغاء الـ tokens من Google إذا كانت موجودة
    if (refreshToken) {
      try {
        await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: refreshToken
          })
        });
        console.log('✅ تم إلغاء Google tokens بنجاح');
      } catch (error) {
        console.warn('⚠️ فشل في إلغاء Google tokens:', error);
      }
    }
    
    // إرسال طلب logout إلى Flask Backend
    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'https://my-app-production-28d2.up.railway.app'
      : 'http://localhost:5000';
    
    if (accessToken) {
      try {
        const backendResponse = await fetch(`${backendUrl}/api/oauth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (backendResponse.ok) {
          console.log('✅ تم تسجيل الخروج من Flask Backend بنجاح');
        } else {
          console.warn('⚠️ فشل في تسجيل الخروج من Flask Backend');
        }
      } catch (error) {
        console.warn('⚠️ خطأ في الاتصال بـ Flask Backend:', error);
      }
    }
    
    // حذف جميع الـ cookies المحلية
    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });
    
    // حذف OAuth cookies
    response.cookies.delete('oauth_access_token');
    response.cookies.delete('oauth_refresh_token');
    response.cookies.delete('oauth_user_info');
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_code_verifier');
    response.cookies.delete('oauth_mcc_customer_id');
    response.cookies.delete('oauth_redirect_after');
    
    console.log('✅ تم حذف جميع الـ cookies المحلية');
    
    return response;
    
  } catch (error) {
    console.error('❌ خطأ في عملية تسجيل الخروج:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to logout',
      message: 'فشل في تسجيل الخروج'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // إعادة توجيه إلى POST method
  return POST(request);
}
