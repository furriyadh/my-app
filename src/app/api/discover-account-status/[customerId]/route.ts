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
    
    // جلب الحالة الفعلية من Flask Backend (Railway) باستخدام متغيرات البيئة
    const backendUrl = getBackendUrl();
    
    const backendResponse = await fetch(`${backendUrl}/api/check-link-status/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      console.log(`✅ تم جلب الحالة الفعلية من Flask Backend للحساب ${customerId}:`, backendData);
      return NextResponse.json(backendData);
    } else {
      console.warn(`⚠️ Flask Backend error for ${customerId}:`, backendResponse.status);
      // إرجاع حالة افتراضية في حالة فشل Backend
      const result = {
        success: true,
        customer_id: customerId,
        status: 'NOT_LINKED',
        account_type: 'REGULAR_ACCOUNT',
        is_connected: false,
        is_linked_to_mcc: false,
        display_status: 'Link Google Ads',
        link_details: {
          success: false,
          lastChecked: new Date().toISOString(),
          error: `Backend error: ${backendResponse.status}`
        },
        lastSync: new Date().toISOString(),
        campaignsCount: 0,
        monthlySpend: 0,
        message: 'Backend unavailable - using default status'
      };
      return NextResponse.json(result);
    }
    
  } catch (error) {
    console.error('❌ Error in discover account status API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}
