import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🏢 جلب الحسابات التجارية...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token'
      }, { status: 401 });
    }
    
    // الاتصال بالباك اند لجلب الحسابات التجارية
    const backendUrl = process.env.BACKEND_API_URL || (process.env.NODE_ENV === 'production' ? 'https://my-app-production-28d2.up.railway.app' : 'http://localhost:5000');
    
    const response = await fetch(`${backendUrl}/api/oauth/business-accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('❌ فشل في جلب الحسابات التجارية:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch business accounts',
        message: 'فشل في جلب الحسابات التجارية'
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب الحسابات التجارية بنجاح:', data.accounts?.length || 0, 'حساب');
      return NextResponse.json({
        success: true,
        accounts: data.accounts,
        message: 'تم جلب الحسابات التجارية بنجاح'
      });
    } else {
      console.error('❌ فشل في جلب الحسابات التجارية:', data);
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to fetch business accounts',
        message: data.message || 'فشل في جلب الحسابات التجارية'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب الحسابات التجارية:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏢 إنشاء حساب تجاري جديد...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token'
      }, { status: 401 });
    }
    
    const { business_name, business_type, contact_info } = await request.json();
    
    if (!business_name) {
      return NextResponse.json({
        success: false,
        error: 'Business name is required',
        message: 'اسم العمل التجاري مطلوب'
      }, { status: 400 });
    }
    
    // الاتصال بالباك اند لإنشاء الحساب التجاري
    const backendUrl = process.env.BACKEND_API_URL || (process.env.NODE_ENV === 'production' ? 'https://my-app-production-28d2.up.railway.app' : 'http://localhost:5000');
    
    const response = await fetch(`${backendUrl}/api/oauth/business-accounts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name,
        business_type,
        contact_info
      })
    });
    
    if (!response.ok) {
      console.error('❌ فشل في إنشاء الحساب التجاري:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to create business account',
        message: 'فشل في إنشاء الحساب التجاري'
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم إنشاء الحساب التجاري بنجاح');
      return NextResponse.json({
        success: true,
        account: data.account,
        message: 'تم إنشاء الحساب التجاري بنجاح'
      });
    } else {
      console.error('❌ فشل في إنشاء الحساب التجاري:', data);
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to create business account',
        message: data.message || 'فشل في إنشاء الحساب التجاري'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الحساب التجاري:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}
