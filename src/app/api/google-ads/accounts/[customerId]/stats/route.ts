import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    
    console.log(`📊 جلب إحصائيات الحساب ${customerId}...`);
    
    // التحقق من صحة معرف العميل
    if (!customerId || !customerId.match(/^\d{10}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid customer ID format',
        message: 'معرف العميل يجب أن يكون 10 أرقام'
      }, { status: 400 });
    }
    
    // الحصول على access token من HttpOnly cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على رمز الوصول'
      }, { status: 401 });
    }
    
    // جلب إحصائيات الحساب من Flask Backend (Railway)
    try {
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://my-app-production-28d2.up.railway.app'
        : 'http://localhost:5000';
      
      // إرسال الطلب إلى Flask Backend
      const response = await fetch(`${backendUrl}/api/user/accounts/${customerId}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`❌ Flask Backend error: ${response.status} - ${response.statusText}`);
        return NextResponse.json({
          success: false,
          error: `Backend error: ${response.status}`,
          message: 'خطأ في الخادم الخلفي'
        }, { status: response.status });
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ تم جلب إحصائيات الحساب ${customerId} من Flask Backend:`, data);
        return NextResponse.json(data);
      } else {
        return NextResponse.json({
          success: false,
          error: data.error || 'Backend error',
          message: data.message || 'خطأ في الخادم الخلفي'
        }, { status: 500 });
      }
      
    } catch (apiError) {
      console.error(`❌ خطأ في الاتصال بـ Flask Backend:`, apiError);
      return NextResponse.json({
        success: false,
        error: 'Backend connection error',
        message: 'خطأ في الاتصال بالخادم الخلفي'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات الحساب:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}
