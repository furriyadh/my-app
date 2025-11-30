import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // الاتصال بالباك اند لمزامنة حالة الحساب (باستخدام متغيرات البيئة)
    const backendUrl = getBackendUrl();
    
    // إضافة retry logic مع timeout
    let response;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        response = await fetch(`${backendUrl}/api/sync-account-status/${customerId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(30000) // 30 seconds timeout
        });
        break; // نجحت المحاولة
      } catch (error) {
        retryCount++;
        console.warn(`⚠️ محاولة ${retryCount}/${maxRetries} فشلت:`, error);
        
        if (retryCount >= maxRetries) {
          throw error; // فشلت جميع المحاولات
        }
        
        // انتظار قبل المحاولة التالية
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (response.ok) {
      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        customer_id: customerId,
        api_status: data.api_status,
        db_status: data.db_status,
        status_changed: data.status_changed,
        link_details: data.link_details,
        message: 'تم مزامنة حالة الحساب بنجاح'
      });
    } else {
      const errorData = await response.text();
      console.error('Backend sync account status API error:', errorData);
      
      return NextResponse.json({
        success: false,
        error: 'فشل في مزامنة حالة الحساب من الخادم',
        details: errorData
      }, { status: response.status });
    }

  } catch (error) {
    console.error('Error syncing account status:', error);
    return NextResponse.json(
      { error: 'Failed to sync account status' },
      { status: 500 }
    );
  }
}
