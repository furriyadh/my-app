import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 ربط الحساب الإعلاني...');
    
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('oauth_access_token')?.value;
    const refreshToken = cookieStore.get('oauth_refresh_token')?.value;
    
    // إذا لم يوجد access token، حاول تجديده باستخدام refresh token
    if (!accessToken && refreshToken) {
      console.log('🔄 محاولة تجديد access token...');
      try {
        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          accessToken = refreshData.access_token;
          console.log('✅ تم تجديد access token بنجاح');
        } else {
          console.error('❌ فشل في تجديد access token');
        }
      } catch (refreshError) {
        console.error('❌ خطأ في تجديد access token:', refreshError);
      }
    }
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token - يرجى إعادة تسجيل الدخول',
        error_type: 'OAUTH_ERROR'
      }, { status: 401 });
    }
    
    const { customer_id, account_name } = await request.json();
    
    if (!customer_id) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required',
        message: 'معرف العميل مطلوب'
      }, { status: 400 });
    }
    
    // الاتصال بالباك اند لربط الحساب
    const backendUrl = process.env.BACKEND_API_URL || (process.env.NODE_ENV === 'production' ? 'https://my-app-production-28d2.up.railway.app' : 'http://localhost:5000');
    
    const response = await fetch(`${backendUrl}/api/link-customer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id,
        account_name
      })
    });
    
    if (!response.ok) {
      console.error('❌ فشل في ربط الحساب:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to link account',
        message: 'فشل في ربط الحساب'
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم ربط الحساب بنجاح');
      return NextResponse.json({
        success: true,
        message: 'تم ربط الحساب بنجاح'
      });
    } else {
      console.error('❌ فشل في ربط الحساب:', data);
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to link account',
        message: data.message || 'فشل في ربط الحساب'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في ربط الحساب:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only POST method is allowed for linking accounts'
  }, { status: 405 });
}
