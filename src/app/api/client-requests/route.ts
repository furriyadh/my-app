import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Next.js API: Get client requests from Supabase...');
    
    // الحصول على المستخدم الحالي من HttpOnly cookies
    const cookieStore = cookies();
    const oauthUserInfo = cookieStore.get('oauth_user_info')?.value;
    
    if (!oauthUserInfo) {
      console.log('ℹ️ No OAuth user info found');
      return NextResponse.json({ success: true, data: [] });
    }
    
    const userInfo = JSON.parse(oauthUserInfo);
    console.log('👤 User email:', userInfo.email);
    
    // جلب الطلبات من Supabase مباشرة (فلترة حسب المستخدم)
    const { data, error } = await supabase
      .from('client_requests')
      .select('*')
      .eq('user_id', userInfo.id) // فقط طلبات المستخدم الحالي
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('✅ Fetched client requests from Supabase:', data?.length || 0);
    return NextResponse.json({ success: true, data: data || [] });
    
  } catch (error) {
    console.error('❌ Error in client requests API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Next.js API: Save client request to Supabase...');
    
    const body = await request.json();
    
    // الحصول على المستخدم الحالي من HttpOnly cookies
    const cookieStore = cookies();
    const oauthUserInfo = cookieStore.get('oauth_user_info')?.value;
    
    if (!oauthUserInfo) {
      console.log('ℹ️ No OAuth user info found');
      return NextResponse.json({
        success: false,
        error: 'No user session found'
      }, { status: 401 });
    }
    
    const userInfo = JSON.parse(oauthUserInfo);
    console.log('👤 Saving request for user:', userInfo.email);
    
    // إضافة بيانات المستخدم الكاملة للطلب
    const requestData = {
      ...body,
      user_id: userInfo.id, // استخدام Google user ID
      user_email: userInfo.email, // حفظ الإيميل
      user_name: userInfo.name || null, // حفظ الاسم
      user_picture: userInfo.picture || null, // حفظ الصورة
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // حفظ الطلب في Supabase مباشرة
    const { data, error } = await supabase
      .from('client_requests')
      .insert([requestData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('✅ Saved client request to Supabase:', data);
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('❌ Error in save client request API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}
