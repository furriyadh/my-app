import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Authentication Status Handler - يتبع تدفق البيانات الصحيح
 * Frontend → Next.js API Routes → Flask Backend → Google Ads API
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 فحص حالة المصادقة...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    const refreshToken = cookieStore.get('oauth_refresh_token')?.value;
    const userInfo = cookieStore.get('oauth_user_info')?.value;
    
    // التحقق من وجود tokens أساسية
    if (!accessToken && !refreshToken) {
      return NextResponse.json({
        authenticated: false,
        message: 'No authentication tokens found',
        user: null
      });
    }
    
    // محاولة التحقق من صحة الـ token مع Flask Backend
    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'https://my-app-production-28d2.up.railway.app'
      : 'http://localhost:5000';
    
    let backendStatus = null;
    let user = null;
    
    if (accessToken) {
      try {
        const backendResponse = await fetch(`${backendUrl}/api/auth/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (backendResponse.ok) {
          backendStatus = await backendResponse.json();
          user = backendStatus.user;
          console.log('✅ تم التحقق من حالة المصادقة مع Flask Backend');
        } else {
          console.warn('⚠️ فشل في التحقق من حالة المصادقة مع Flask Backend');
        }
      } catch (error) {
        console.warn('⚠️ خطأ في الاتصال بـ Flask Backend:', error);
      }
    }
    
    // إذا لم نحصل على معلومات من Backend، نستخدم البيانات المحلية
    if (!user && userInfo) {
      try {
        user = JSON.parse(userInfo);
      } catch (error) {
        console.warn('⚠️ فشل في تحليل معلومات المستخدم المحلية');
      }
    }
    
    return NextResponse.json({
      authenticated: true,
      message: 'User is authenticated',
      user: user,
      backend_status: backendStatus,
      tokens: {
        has_access_token: !!accessToken,
        has_refresh_token: !!refreshToken,
        has_user_info: !!userInfo
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ في فحص حالة المصادقة:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Failed to check authentication status',
      message: 'فشل في فحص حالة المصادقة'
    }, { status: 500 });
  }
}
