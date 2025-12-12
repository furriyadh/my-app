// Google Merchant Center API - Save/List connected accounts
// حفظ وجلب حسابات Merchant Center المرتبطة من Supabase
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// إنشاء Supabase Admin Client
const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
};

// GET - جلب الحسابات المحفوظة للمستخدم الحالي
export async function GET(request: NextRequest) {
    try {
        console.log('🛒 جلب Merchant Accounts المحفوظة...');

        const cookieStore = await cookies();
        const userInfoCookie = cookieStore.get('oauth_user_info')?.value;

        if (!userInfoCookie) {
            return NextResponse.json({
                success: false,
                error: 'Not authenticated',
                message: 'يرجى تسجيل الدخول أولاً'
            }, { status: 401 });
        }

        const userInfo = JSON.parse(userInfoCookie);
        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from('merchant_accounts')
            .select('*')
            .eq('user_id', userInfo.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching accounts:', error);
            return NextResponse.json({
                success: false,
                error: 'Database error',
                message: error.message
            }, { status: 500 });
        }

        // جلب الحساب النشط
        const activeAccount = data?.find(a => a.is_active) || data?.[0] || null;

        return NextResponse.json({
            success: true,
            accounts: data || [],
            activeAccount: activeAccount,
            count: data?.length || 0
        });

    } catch (error) {
        console.error('❌ Error in GET merchant/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}

// POST - حفظ حساب جديد للمستخدم
export async function POST(request: NextRequest) {
    try {
        console.log('💾 حفظ Merchant Account...');

        const cookieStore = await cookies();
        const userInfoCookie = cookieStore.get('oauth_user_info')?.value;

        if (!userInfoCookie) {
            return NextResponse.json({
                success: false,
                error: 'Not authenticated',
                message: 'يرجى تسجيل الدخول أولاً'
            }, { status: 401 });
        }

        const userInfo = JSON.parse(userInfoCookie);
        const body = await request.json();
        const { merchantId, accountName, websiteUrl, adultContent } = body;

        if (!merchantId) {
            return NextResponse.json({
                success: false,
                error: 'Merchant ID required',
                message: 'يجب تحديد Merchant ID'
            }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // إلغاء تفعيل جميع الحسابات السابقة للمستخدم
        await supabase
            .from('merchant_accounts')
            .update({ is_active: false })
            .eq('user_id', userInfo.id);

        // إضافة أو تحديث الحساب الجديد
        const { data, error } = await supabase
            .from('merchant_accounts')
            .upsert({
                user_id: userInfo.id,
                user_email: userInfo.email,
                merchant_id: merchantId,
                account_name: accountName || null,
                website_url: websiteUrl || null,
                adult_content: adultContent || false,
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,merchant_id'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error saving account:', error);
            return NextResponse.json({
                success: false,
                error: 'Database error',
                message: error.message
            }, { status: 500 });
        }

        console.log('✅ Account saved successfully:', data);
        return NextResponse.json({
            success: true,
            account: data,
            message: 'تم حفظ الحساب بنجاح'
        });

    } catch (error) {
        console.error('❌ Error in POST merchant/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}

// DELETE - حذف حساب
export async function DELETE(request: NextRequest) {
    try {
        console.log('🗑️ حذف Merchant Account...');

        const cookieStore = await cookies();
        const userInfoCookie = cookieStore.get('oauth_user_info')?.value;

        if (!userInfoCookie) {
            return NextResponse.json({
                success: false,
                error: 'Not authenticated'
            }, { status: 401 });
        }

        const userInfo = JSON.parse(userInfoCookie);
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId');

        if (!merchantId) {
            return NextResponse.json({
                success: false,
                error: 'Merchant ID required'
            }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { error } = await supabase
            .from('merchant_accounts')
            .delete()
            .eq('user_id', userInfo.id)
            .eq('merchant_id', merchantId);

        if (error) {
            console.error('❌ Error deleting account:', error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف الحساب بنجاح'
        });

    } catch (error) {
        console.error('❌ Error in DELETE merchant/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
