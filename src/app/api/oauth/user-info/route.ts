import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Google OAuth2 User Info Handler - يتبع الممارسات الرسمية من Google Identity Platform
 * المصادر الرسمية:
 * - https://developers.google.com/identity/protocols/oauth2
 * - https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo
 */

export async function GET(request: NextRequest) {
  try {
    console.log('👤 جلب معلومات المستخدم (حسب Google Identity Platform)...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    const userInfo = cookieStore.get('oauth_user_info')?.value;
    
    if (!accessToken) {
      console.error('❌ لم يتم العثور على access token');
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo');
      return NextResponse.json({
        success: false,
        error: 'No access token found',
        message: 'لم يتم العثور على access token - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo'
      }, { status: 401 });
    }
    
    // محاولة استخدام المعلومات المحفوظة أولاً (حسب الممارسات الرسمية)
    if (userInfo) {
      try {
        console.log('📋 استخدام معلومات المستخدم المحفوظة...');
        const userData = JSON.parse(userInfo);
        return NextResponse.json({
          success: true,
          user: userData,
          source: 'cached',
          message: 'تم جلب معلومات المستخدم بنجاح - من البيانات المحفوظة',
          docs: 'https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo'
        });
      } catch (parseError) {
        console.warn('⚠️ خطأ في تحليل معلومات المستخدم المحفوظة، جلب من Google...');
      }
    }
    
    // جلب معلومات المستخدم من Google (حسب Google Identity Platform)
    try {
      console.log('🔄 جلب معلومات المستخدم من Google...');
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        console.error('❌ فشل في جلب معلومات المستخدم من Google:', response.status, response.statusText);
        console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo');
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch user info from Google',
          message: 'فشل في جلب معلومات المستخدم من Google - راجع المصادر الرسمية',
          status: response.status,
          docs: 'https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo'
        }, { status: 500 });
      }
      
      const userData = await response.json();
      console.log('✅ تم جلب معلومات المستخدم من Google بنجاح (حسب Google Identity Platform)');
      
      // التحقق من صحة البيانات (حسب الممارسات الرسمية)
      if (!userData.id || !userData.email) {
        console.warn('⚠️ معلومات المستخدم غير مكتملة من Google');
        return NextResponse.json({
          success: false,
          error: 'Incomplete user info',
          message: 'معلومات المستخدم غير مكتملة من Google - راجع المصادر الرسمية',
          docs: 'https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo'
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: true,
        user: userData,
        source: 'google',
        message: 'تم جلب معلومات المستخدم بنجاح - يتبع Google Identity Platform',
        docs: 'https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo'
      });
      
    } catch (fetchError) {
      console.error('❌ خطأ في جلب معلومات المستخدم من Google:', fetchError);
      console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo');
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch user info',
        message: 'خطأ في جلب معلومات المستخدم من Google - راجع المصادر الرسمية',
        docs: 'https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب معلومات المستخدم:', error);
    console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2');
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم - راجع المصادر الرسمية',
      docs: 'https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET method is allowed for fetching user info (حسب Google Identity Platform)',
    docs: 'https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo'
  }, { status: 405 });
}
