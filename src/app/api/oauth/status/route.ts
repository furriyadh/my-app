import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Google OAuth2 Status Handler - يتبع الممارسات الرسمية من Google Identity Platform
 * المصادر الرسمية:
 * - https://developers.google.com/identity/protocols/oauth2
 * - https://developers.google.com/identity/protocols/oauth2/web-server#tokeninfo
 */

/**
 * Google OAuth2 Status Handler - يتبع الممارسات الرسمية من Google Identity Platform
 * المصادر الرسمية:
 * - https://developers.google.com/identity/protocols/oauth2
 * - https://developers.google.com/identity/protocols/oauth2/web-server#tokeninfo
 */

export async function GET(request: NextRequest) {
  try {
    console.log('📊 فحص حالة OAuth (حسب Google Identity Platform)...');
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    const refreshToken = cookieStore.get('oauth_refresh_token')?.value;
    const userInfo = cookieStore.get('oauth_user_info')?.value;
    const expiresIn = cookieStore.get('oauth_expires_in')?.value;
    const scope = cookieStore.get('oauth_scope')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'لم يتم العثور على access token',
        docs: 'https://developers.google.com/identity/protocols/oauth2'
      }, { status: 401 });
    }
    
    // التحقق من صحة access token (حسب Google Identity Platform)
    try {
      console.log('🔄 التحقق من صحة access token...');
      const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`);
      
      if (tokenInfoResponse.ok) {
        const tokenInfo = await tokenInfoResponse.json();
        console.log('✅ access token صالح (حسب Google Identity Platform)');
        
        // التحقق من معلومات المستخدم
        let userInfoData = null;
        if (userInfo) {
          try {
            userInfoData = JSON.parse(userInfo);
          } catch (e) {
            console.warn('⚠️ خطأ في تحليل معلومات المستخدم من cookies');
          }
        }
        
        // الحصول على معلومات المستخدم من Google إذا لم تكن متوفرة
        if (!userInfoData) {
          try {
            console.log('🔄 الحصول على معلومات المستخدم من Google...');
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            });
            
            if (userInfoResponse.ok) {
              userInfoData = await userInfoResponse.json();
              console.log('✅ تم الحصول على معلومات المستخدم من Google');
            }
          } catch (userError) {
            console.warn('⚠️ فشل في الحصول على معلومات المستخدم:', userError);
          }
        }
        
        return NextResponse.json({
          success: true,
          authenticated: true,
          token_info: {
            expires_in: tokenInfo.expires_in || expiresIn,
            scope: tokenInfo.scope || scope,
            token_type: tokenInfo.token_type || 'Bearer',
            audience: tokenInfo.audience,
            issued_to: tokenInfo.issued_to
          },
          user_info: userInfoData,
          has_refresh_token: !!refreshToken,
          docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#tokeninfo'
        });
        
      } else {
        console.warn('⚠️ access token غير صالح');
        return NextResponse.json({
          success: false,
          authenticated: false,
          message: 'access token غير صالح أو منتهي الصلاحية',
          docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#tokeninfo'
        }, { status: 401 });
      }
      
    } catch (tokenError) {
      console.error('❌ خطأ في التحقق من صحة access token:', tokenError);
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'خطأ في التحقق من صحة access token',
        docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#tokeninfo'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص حالة OAuth:', error);
    console.error('📋 راجع: https://developers.google.com/identity/protocols/oauth2');
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: 'Internal server error',
      message: 'خطأ في فحص حالة OAuth - راجع المصادر الرسمية',
      docs: 'https://developers.google.com/identity/protocols/oauth2'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET method is allowed for OAuth status (حسب Google Identity Platform)',
    docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#tokeninfo'
  }, { status: 405 });
}
