import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    
    console.log(`🔄 [sync-account-status] بدء مزامنة الحساب: ${customerId}`);

    if (!customerId) {
      console.error('❌ [sync-account-status] Customer ID مفقود');
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // الاتصال بالباك اند لمزامنة حالة الحساب (باستخدام متغيرات البيئة)
    const backendUrl = getBackendUrl();
    const fullUrl = `${backendUrl}/api/sync-account-status/${customerId}`;
    
    console.log(`📡 [sync-account-status] Backend URL: ${backendUrl}`);
    console.log(`📡 [sync-account-status] Full URL: ${fullUrl}`);
    console.log(`📡 [sync-account-status] NODE_ENV: ${process.env.NODE_ENV}`);
    
    // التحقق من أن backendUrl ليس فارغاً
    if (!backendUrl) {
      console.error('❌ [sync-account-status] Backend URL غير مُعرَّف!');
      return NextResponse.json({
        success: false,
        error: 'Backend URL is not configured',
        details: 'NEXT_PUBLIC_BACKEND_URL or BACKEND_API_URL environment variable is not set'
      }, { status: 500 });
    }
    
    // إضافة retry logic مع timeout
    let response: Response | undefined;
    let retryCount = 0;
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`🔄 [sync-account-status] محاولة ${retryCount + 1}/${maxRetries}...`);
        
        response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(30000) // 30 seconds timeout
        });
        
        console.log(`✅ [sync-account-status] الاستجابة: ${response.status} ${response.statusText}`);
        break; // نجحت المحاولة
      } catch (error) {
        retryCount++;
        lastError = error as Error;
        console.warn(`⚠️ [sync-account-status] محاولة ${retryCount}/${maxRetries} فشلت:`, error);
        
        if (retryCount >= maxRetries) {
          console.error(`❌ [sync-account-status] فشلت جميع المحاولات (${maxRetries})`);
          throw error;
        }
        
        // انتظار قبل المحاولة التالية
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!response) {
      console.error('❌ [sync-account-status] لم يتم الحصول على استجابة من الخادم');
      return NextResponse.json({
        success: false,
        error: 'No response from backend server',
        details: lastError?.message || 'Unknown error'
      }, { status: 500 });
    }

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ [sync-account-status] نجاح! api_status: ${data.api_status}, db_status: ${data.db_status}`);
      
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
      console.error(`❌ [sync-account-status] خطأ من الباك إند (${response.status}):`, errorData);
      
      return NextResponse.json({
        success: false,
        error: 'فشل في مزامنة حالة الحساب من الخادم',
        details: errorData,
        status_code: response.status
      }, { status: response.status });
    }

  } catch (error) {
    console.error('❌ [sync-account-status] خطأ عام:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync account status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
