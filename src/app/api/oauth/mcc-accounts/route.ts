import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🏢 جلب حسابات MCC...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token'
      }, { status: 401 });
    }
    
    // الاتصال بالباك اند لجلب حسابات MCC
    const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:5000');
    
    const response = await fetch(`${backendUrl}/api/oauth/mcc-accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('❌ فشل في جلب حسابات MCC:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch MCC accounts',
        message: 'فشل في جلب حسابات MCC'
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب حسابات MCC بنجاح:', data.accounts?.length || 0, 'حساب');
      return NextResponse.json({
        success: true,
        accounts: data.accounts,
        message: 'تم جلب حسابات MCC بنجاح'
      });
    } else {
      console.error('❌ فشل في جلب حسابات MCC:', data);
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to fetch MCC accounts',
        message: data.message || 'فشل في جلب حسابات MCC'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب حسابات MCC:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET method is allowed for fetching MCC accounts'
  }, { status: 405 });
}
