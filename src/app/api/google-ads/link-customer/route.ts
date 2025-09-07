import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Next.js API: Link customer to MCC...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token'
      }, { status: 401 });
    }
    
    const { customerId, account_name } = await request.json();
    
    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required',
        message: 'معرف العميل مطلوب'
      }, { status: 400 });
    }
    
    // Forward request to Flask backend (proper flow)
    const backendUrl = 'http://localhost:5000/api/link-customer';
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        account_name
      })
    });
    
    if (!response.ok) {
      console.error('❌ Flask backend error:', response.status, response.statusText);
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: 'Backend request failed',
        message: 'فشل في طلب الخادم الخلفي',
        details: errorText
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    console.log('✅ Link request successful:', data);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Next.js API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}
