import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';
import { cookies } from 'next/headers';

// دالة لتجديد access token
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

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

    // الحصول على Access Token (MCC أولاً)
    const mccRefreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    const cookieStore = await cookies();
    const userRefreshToken = cookieStore.get('oauth_refresh_token')?.value;

    let accessToken: string | null = null;
    if (mccRefreshToken) {
      accessToken = await refreshAccessToken(mccRefreshToken);
    }
    if (!accessToken && userRefreshToken) {
      accessToken = await refreshAccessToken(userRefreshToken);
    }

    // جلب الحالة الفعلية من Flask Backend (Railway) باستخدام متغيرات البيئة
    const backendUrl = getBackendUrl();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      console.log(`🔑 تمرير Access Token إلى Flask Backend`);
    }

    // ✅ استخدام sync-account-status (أدق) بدلاً من check-link-status
    // هذا يستعلم من customer_manager_link (من جانب الحساب) وليس customer_client_link (من MCC)
    // مما يعطي الحالة الفعلية للربط بدون تأثير الدعوات القديمة
    const backendResponse = await fetch(`${backendUrl}/api/sync-account-status/${customerId}`, {
      method: 'POST',
      headers
    });

    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      console.log(`✅ تم جلب الحالة الفعلية من Flask Backend للحساب ${customerId}:`, backendData);

      // ✅ إصلاح: استخراج الحالة بدقة أكبر من استجابة Flask
      // Flask يرجع api_status في المستوى الأعلى و link_status داخل link_details
      const flaskStatus = backendData.api_status || (backendData.link_details && backendData.link_details.link_status);
      const liveStatus = (flaskStatus || backendData.status || 'NOT_LINKED').toUpperCase().trim();

      let dbStatus = 'NOT_LINKED';

      // تحويل الحالة إلى قيمة مناسبة للـ DB
      if (liveStatus === 'ACTIVE' || liveStatus === 'ENABLED' || liveStatus === 'CONNECTED') {
        dbStatus = 'ACTIVE';
      } else if (liveStatus === 'PENDING') {
        dbStatus = 'PENDING';
      } else if (['INACTIVE', 'REFUSED', 'CANCELLED', 'CANCELED', 'NOT_LINKED', 'REJECTED'].includes(liveStatus)) {
        dbStatus = 'NOT_LINKED';
      } else {
        // إذا لم نعرف الحالة، نستخدم ما أرجعه Flask إذا كان موجوداً
        dbStatus = liveStatus === 'UNKNOWN' ? 'NOT_LINKED' : liveStatus;
      }

      // تحديث الـ API status في البيانات المرجعة
      backendData.api_status = dbStatus;

      // حفظ في Supabase (fire and forget)
      try {
        const cookieStore = await cookies();
        const userIdCookie = cookieStore.get('google_ads_user_id');

        if (userIdCookie) {
          const saveResponse = await fetch(`${request.nextUrl.origin}/api/client-requests`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({
              customer_id: customerId,
              request_type: 'status_poll',
              status: dbStatus,
              link_details: backendData.link_details || backendData
            })
          });

          if (saveResponse.ok) {
            console.log(`💾 تم حفظ الحالة ${dbStatus} للحساب ${customerId} في Supabase`);
          }
        }
      } catch (saveError) {
        console.warn(`⚠️ فشل حفظ الحالة في Supabase:`, saveError);
        // لا نوقف العملية - نستمر في إرجاع البيانات
      }

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
