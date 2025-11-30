import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 ربط الحساب الإعلاني...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token'
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
    
    // الاتصال بالباك اند لربط الحساب (باستخدام متغيرات البيئة فقط)
    const backendUrl = getBackendUrl();
    
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
