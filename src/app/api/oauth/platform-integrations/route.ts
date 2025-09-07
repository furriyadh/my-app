import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 جلب التكاملات المنصات...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token'
      }, { status: 401 });
    }
    
    // الاتصال بالباك اند لجلب التكاملات
    const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:5000');
    
    const response = await fetch(`${backendUrl}/api/oauth/platform-integrations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('❌ فشل في جلب التكاملات:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch platform integrations',
        message: 'فشل في جلب التكاملات'
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب التكاملات بنجاح:', data.integrations?.length || 0, 'تكامل');
      return NextResponse.json({
        success: true,
        integrations: data.integrations,
        message: 'تم جلب التكاملات بنجاح'
      });
    } else {
      console.error('❌ فشل في جلب التكاملات:', data);
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to fetch platform integrations',
        message: data.message || 'فشل في جلب التكاملات'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب التكاملات:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 إنشاء تكامل منصة جديد...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token'
      }, { status: 401 });
    }
    
    const { platform_name, platform_type, credentials } = await request.json();
    
    if (!platform_name || !platform_type) {
      return NextResponse.json({
        success: false,
        error: 'Platform name and type are required',
        message: 'اسم المنصة ونوعها مطلوبان'
      }, { status: 400 });
    }
    
    // الاتصال بالباك اند لإنشاء التكامل
    const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:5000');
    
    const response = await fetch(`${backendUrl}/api/oauth/platform-integrations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform_name,
        platform_type,
        credentials
      })
    });
    
    if (!response.ok) {
      console.error('❌ فشل في إنشاء التكامل:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to create platform integration',
        message: 'فشل في إنشاء التكامل'
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم إنشاء التكامل بنجاح');
      return NextResponse.json({
        success: true,
        integration: data.integration,
        message: 'تم إنشاء التكامل بنجاح'
      });
    } else {
      console.error('❌ فشل في إنشاء التكامل:', data);
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to create platform integration',
        message: data.message || 'فشل في إنشاء التكامل'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء التكامل:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}
