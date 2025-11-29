import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// إنشاء Supabase client مع Service Role للوصول الكامل
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseAdmin = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Next.js API: Get client requests from Supabase...');
    
    // الحصول على المستخدم الحالي من HttpOnly cookies
    const cookieStore = await cookies();
    const oauthUserInfo = cookieStore.get('oauth_user_info')?.value;
    
    if (!oauthUserInfo) {
      console.log('ℹ️ No OAuth user info found - returning empty array');
      return NextResponse.json({ success: true, data: [] });
    }
    
    let userInfo;
    try {
      userInfo = JSON.parse(oauthUserInfo);
    } catch (parseError) {
      console.error('❌ Failed to parse oauth_user_info cookie:', parseError);
      return NextResponse.json({ success: true, data: [] });
    }
    
    console.log('👤 Current user:', { id: userInfo.id, email: userInfo.email });
    
    if (!userInfo.id) {
      console.log('⚠️ No user ID in oauth_user_info');
      return NextResponse.json({ success: true, data: [] });
    }
    
    const supabaseAdmin = getSupabaseAdmin();
    
    // جلب الطلبات من Supabase مباشرة (فلترة حسب user_id أو user_email)
    // نفلتر بـ user_id أولاً، وإذا لم نجد نفلتر بـ user_email
    let { data, error } = await supabaseAdmin
      .from('client_requests')
      .select('*')
      .eq('user_id', userInfo.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }
    
    // إذا لم نجد بيانات بـ user_id، نحاول بـ user_email
    if ((!data || data.length === 0) && userInfo.email) {
      console.log('🔍 No data found by user_id, trying user_email...');
      const emailResult = await supabaseAdmin
        .from('client_requests')
        .select('*')
        .eq('user_email', userInfo.email)
        .order('created_at', { ascending: false });
      
      if (!emailResult.error && emailResult.data && emailResult.data.length > 0) {
        data = emailResult.data;
        console.log(`✅ Found ${data.length} records by user_email`);
        
        // تحديث السجلات القديمة لتضمين user_id الصحيح
        for (const record of data) {
          if (!record.user_id || record.user_id !== userInfo.id) {
            await supabaseAdmin
              .from('client_requests')
              .update({ user_id: userInfo.id, user_email: userInfo.email })
              .eq('id', record.id);
            console.log(`🔄 Updated record ${record.id} with correct user_id`);
          }
        }
      } else {
        // ✅ إذا لم نجد بـ user_id ولا user_email، نبحث عن السجلات القديمة بدون user_id
        // هذه السجلات تم إنشاؤها قبل إضافة نظام المستخدمين
        console.log('🔍 No data found by user_email, checking for orphan records...');
        const orphanResult = await supabaseAdmin
          .from('client_requests')
          .select('*')
          .is('user_id', null)
          .order('created_at', { ascending: false });
        
        if (!orphanResult.error && orphanResult.data && orphanResult.data.length > 0) {
          // نعتبر هذه السجلات تابعة للمستخدم الحالي (أول مستخدم يسجل دخول)
          // لكن فقط إذا كان هذا المستخدم هو صاحب الحسابات فعلاً
          console.log(`📋 Found ${orphanResult.data.length} orphan records - will be claimed by current user`);
          
          // تحديث السجلات القديمة لتضمين user_id و user_email
          for (const record of orphanResult.data) {
            await supabaseAdmin
              .from('client_requests')
              .update({ 
                user_id: userInfo.id, 
                user_email: userInfo.email,
                user_name: userInfo.name || null,
                user_picture: userInfo.picture || null
              })
              .eq('id', record.id);
            console.log(`🔄 Claimed orphan record ${record.id} for user ${userInfo.email}`);
          }
          
          data = orphanResult.data.map(record => ({
            ...record,
            user_id: userInfo.id,
            user_email: userInfo.email
          }));
        }
      }
    }
    
    console.log(`✅ Fetched ${data?.length || 0} client requests for user ${userInfo.email}`);
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
    const cookieStore = await cookies();
    const oauthUserInfo = cookieStore.get('oauth_user_info')?.value;
    
    if (!oauthUserInfo) {
      console.log('⚠️ No OAuth user info found - cannot save request');
      return NextResponse.json({
        success: false,
        error: 'No user session found'
      }, { status: 401 });
    }
    
    let userInfo;
    try {
      userInfo = JSON.parse(oauthUserInfo);
    } catch (parseError) {
      console.error('❌ Failed to parse oauth_user_info cookie:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid user session'
      }, { status: 401 });
    }
    
    if (!userInfo.id || !userInfo.email) {
      console.error('❌ Missing user ID or email in oauth_user_info');
      return NextResponse.json({
        success: false,
        error: 'Incomplete user session'
      }, { status: 401 });
    }
    
    console.log('👤 Saving request for user:', { id: userInfo.id, email: userInfo.email });
    
    const supabaseAdmin = getSupabaseAdmin();
    
    // ✅ البحث عن سجل موجود بعدة طرق:
    // 1. بـ user_id + customer_id (الطريقة الصحيحة)
    // 2. بـ customer_id + request_type بدون user_id (سجلات قديمة)
    
    // أولاً: البحث بـ user_id + customer_id
    let { data: existingRecord } = await supabaseAdmin
      .from('client_requests')
      .select('id, user_id')
      .eq('user_id', userInfo.id)
      .eq('customer_id', body.customer_id)
      .single();
    
    // ثانياً: إذا لم نجد، نبحث عن سجل قديم بدون user_id (orphan record)
    if (!existingRecord) {
      const { data: orphanRecord } = await supabaseAdmin
        .from('client_requests')
        .select('id, user_id')
        .eq('customer_id', body.customer_id)
        .eq('request_type', body.request_type || 'link_request')
        .is('user_id', null)
        .single();
      
      if (orphanRecord) {
        console.log(`🔄 Found orphan record for customer ${body.customer_id} - claiming for user ${userInfo.email}`);
        existingRecord = orphanRecord;
      }
    }
    
    // ثالثاً: إذا لم نجد، نبحث عن أي سجل بنفس customer_id و request_type (لتجنب duplicate key)
    if (!existingRecord) {
      const { data: anyRecord } = await supabaseAdmin
        .from('client_requests')
        .select('id, user_id')
        .eq('customer_id', body.customer_id)
        .eq('request_type', body.request_type || 'link_request')
        .single();
      
      if (anyRecord) {
        console.log(`🔄 Found existing record for customer ${body.customer_id} (owned by different user or orphan) - updating with current user`);
        existingRecord = anyRecord;
      }
    }
    
    if (existingRecord) {
      // تحديث السجل الموجود بدلاً من إنشاء جديد
      console.log('🔄 Updating existing record for customer:', body.customer_id);
      const { data, error } = await supabaseAdmin
        .from('client_requests')
        .update({
          ...body,
          user_id: userInfo.id,
          user_email: userInfo.email,
          user_name: userInfo.name || null,
          user_picture: userInfo.picture || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase update error:', error);
        return NextResponse.json({
          success: false,
          error: 'Database error',
          details: error.message
        }, { status: 500 });
      }
      
      console.log('✅ Updated client request in Supabase:', data);
      return NextResponse.json({ success: true, data, updated: true });
    }
    
    // إضافة بيانات المستخدم الكاملة للطلب الجديد
    const requestData = {
      ...body,
      user_id: userInfo.id,
      user_email: userInfo.email,
      user_name: userInfo.name || null,
      user_picture: userInfo.picture || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // حفظ الطلب الجديد في Supabase
    const { data, error } = await supabaseAdmin
      .from('client_requests')
      .insert([requestData])
      .select()
      .single();
    
    if (error) {
      // ✅ معالجة خطأ duplicate key بشكل خاص
      if (error.code === '23505') {
        console.log('⚠️ Duplicate key error - trying to update instead');
        
        // محاولة تحديث السجل الموجود
        const { data: existingData } = await supabaseAdmin
          .from('client_requests')
          .select('id')
          .eq('customer_id', body.customer_id)
          .eq('request_type', body.request_type || 'link_request')
          .single();
        
        if (existingData) {
          const { data: updatedData, error: updateError } = await supabaseAdmin
            .from('client_requests')
            .update({
              ...body,
              user_id: userInfo.id,
              user_email: userInfo.email,
              user_name: userInfo.name || null,
              user_picture: userInfo.picture || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingData.id)
            .select()
            .single();
          
          if (!updateError) {
            console.log('✅ Updated existing record after duplicate key error');
            return NextResponse.json({ success: true, data: updatedData, updated: true });
          }
        }
      }
      
      console.error('❌ Supabase insert error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('✅ Saved new client request to Supabase:', data);
    return NextResponse.json({ success: true, data, created: true });
    
  } catch (error) {
    console.error('❌ Error in save client request API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}
