import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔓 إلغاء ربط الحساب الإعلاني...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token'
      }, { status: 401 });
    }
    
    const { customer_id } = await request.json();
    
    if (!customer_id) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required',
        message: 'معرف العميل مطلوب'
      }, { status: 400 });
    }
    
    // الاتصال بالباك اند لإلغاء ربط الحساب
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/mcc/unlink-customer/${customer_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('❌ فشل في إلغاء ربط الحساب:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to unlink account',
        message: 'فشل في إلغاء ربط الحساب'
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم إلغاء ربط الحساب بنجاح');
      return NextResponse.json({
        success: true,
        message: 'تم إلغاء ربط الحساب بنجاح'
      });
    } else {
      console.error('❌ فشل في إلغاء ربط الحساب:', data);
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to unlink account',
        message: data.message || 'فشل في إلغاء ربط الحساب'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في إلغاء ربط الحساب:', error);
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
    message: 'Only POST method is allowed for unlinking accounts'
  }, { status: 405 });
}
