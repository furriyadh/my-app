// Meta Ads API - Save/List connected accounts
// حفظ وجلب حسابات Meta Ads المرتبطة من Supabase
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
        console.log('📱 جلب Meta Ad Accounts المحفوظة...');

        const cookieStore = await cookies();
        // نستخدم meta_user_info أو oauth_user_info
        const metaUserCookie = cookieStore.get('meta_user_info')?.value;
        const googleUserCookie = cookieStore.get('oauth_user_info')?.value;

        const userInfoCookie = metaUserCookie || googleUserCookie;

        if (!userInfoCookie) {
            console.log('⚠️ No user info cookie found - returning empty array');
            return NextResponse.json({
                success: true,
                accounts: [],
                activeAccount: null,
                count: 0,
                message: 'Not authenticated'
            });
        }

        const userInfo = JSON.parse(userInfoCookie);
        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from('meta_ad_accounts')
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
        console.error('❌ Error in GET meta/connected:', error);
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
        console.log('💾 حفظ Meta Ad Account...');

        const cookieStore = await cookies();
        const metaUserCookie = cookieStore.get('meta_user_info')?.value;
        const metaAccessToken = cookieStore.get('meta_access_token')?.value;

        if (!metaUserCookie) {
            return NextResponse.json({
                success: false,
                error: 'Not authenticated with Meta',
                message: 'يرجى تسجيل الدخول بـ Meta أولاً'
            }, { status: 401 });
        }

        const userInfo = JSON.parse(metaUserCookie);
        const body = await request.json();
        const {
            adAccountId,
            accountName,
            businessId,
            businessName,
            currency,
            timezoneName,
            accountStatus
        } = body;

        if (!adAccountId) {
            return NextResponse.json({
                success: false,
                error: 'Ad Account ID required',
                message: 'يجب تحديد Ad Account ID'
            }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // إلغاء تفعيل جميع الحسابات السابقة للمستخدم
        await supabase
            .from('meta_ad_accounts')
            .update({ is_active: false })
            .eq('user_id', userInfo.id);

        // إضافة أو تحديث الحساب الجديد
        const { data, error } = await supabase
            .from('meta_ad_accounts')
            .upsert({
                user_id: userInfo.id,
                user_email: userInfo.email || '',
                ad_account_id: adAccountId,
                account_name: accountName || null,
                business_id: businessId || null,
                business_name: businessName || null,
                currency: currency || null,
                timezone_name: timezoneName || null,
                account_status: accountStatus || null,
                access_token: metaAccessToken || null,
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,ad_account_id'
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
        console.error('❌ Error in POST meta/connected:', error);
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
        console.log('🗑️ حذف Meta Ad Account...');

        const cookieStore = await cookies();
        const metaUserCookie = cookieStore.get('meta_user_info')?.value;

        if (!metaUserCookie) {
            return NextResponse.json({
                success: false,
                error: 'Not authenticated'
            }, { status: 401 });
        }

        const userInfo = JSON.parse(metaUserCookie);
        const { searchParams } = new URL(request.url);
        const adAccountId = searchParams.get('adAccountId');

        if (!adAccountId) {
            return NextResponse.json({
                success: false,
                error: 'Ad Account ID required'
            }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { error } = await supabase
            .from('meta_ad_accounts')
            .delete()
            .eq('user_id', userInfo.id)
            .eq('ad_account_id', adAccountId);

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
        console.error('❌ Error in DELETE meta/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
