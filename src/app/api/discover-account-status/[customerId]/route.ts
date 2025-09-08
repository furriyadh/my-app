import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    
    console.log(`🔍 Next.js API: Discover account status for ${customerId}`);
    
    // التحقق من صحة معرف العميل
    if (!customerId || !customerId.match(/^\d{10}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid customer ID format',
        message: 'معرف العميل يجب أن يكون 10 أرقام'
      }, { status: 400 });
    }
    
    // استدعاء Flask backend
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? `https://my-app-production-28d2.up.railway.app/api/discover-account-status/${customerId}`
      : `http://localhost:5000/api/discover-account-status/${customerId}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend error: ${response.status} - ${errorText}`);
      
      return NextResponse.json({
        success: false,
        error: `Backend error: ${response.status}`,
        message: 'خطأ في الخادم الخلفي'
      }, { status: response.status });
    }
    
    const result = await response.json();
    
    console.log(`✅ Account ${customerId} discovery result:`, {
      success: result.success,
      status: result.status,
      status_changed: result.status_changed,
      previous_status: result.previous_status
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error in discover account status API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}
