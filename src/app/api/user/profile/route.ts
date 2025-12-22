import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Next.js API: Get user profile...');
    
    // الحصول على المستخدم الحالي من cookies
    const cookies = request.cookies;
    const oauthUserInfo = cookies.get('oauth_user_info')?.value;
    
    if (!oauthUserInfo) {
      console.log('ℹ️ No OAuth user info found');
      return NextResponse.json({
        success: false,
        error: 'No user session found'
      }, { status: 401 });
    }
    
    const userInfo = JSON.parse(oauthUserInfo);
    console.log('👤 Getting profile for user:', userInfo.email);
    
    // جلب بيانات المستخدم من قاعدة البيانات
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userInfo.id)
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('✅ Fetched user profile from Supabase:', data);
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('❌ Error in user profile API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}

