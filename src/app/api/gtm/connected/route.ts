// Google Tag Manager API - Save/List connected containers
// حفظ وجلب Containers المرتبطة من Supabase
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

// GET - جلب Containers المحفوظة للمستخدم الحالي
export async function GET(request: NextRequest) {
    try {
        console.log('📦 جلب GTM Containers المحفوظة...');

        const cookieStore = await cookies();
        const userInfoCookie = cookieStore.get('oauth_user_info')?.value;

        if (!userInfoCookie) {
            console.log('⚠️ No oauth_user_info cookie found - returning empty array');
            return NextResponse.json({
                success: true,
                containers: [],
                activeContainer: null,
                count: 0,
                message: 'Not authenticated'
            });
        }

        const userInfo = JSON.parse(userInfoCookie);
        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from('gtm_containers')
            .select('*')
            .eq('user_id', userInfo.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching containers:', error);
            return NextResponse.json({
                success: false,
                error: 'Database error',
                message: error.message
            }, { status: 500 });
        }

        // جلب Container النشط
        const activeContainer = data?.find(c => c.is_active) || data?.[0] || null;

        return NextResponse.json({
            success: true,
            containers: data || [],
            activeContainer: activeContainer,
            count: data?.length || 0
        });

    } catch (error) {
        console.error('❌ Error in GET gtm/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}

// POST - حفظ Container جديد للمستخدم
export async function POST(request: NextRequest) {
    try {
        console.log('💾 حفظ GTM Container...');

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
        const { accountId, accountName, containerId, containerName, containerPublicId, usageContext } = body;

        if (!containerId) {
            return NextResponse.json({
                success: false,
                error: 'Container ID required',
                message: 'يجب تحديد Container ID'
            }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // إلغاء تفعيل جميع Containers السابقة للمستخدم
        await supabase
            .from('gtm_containers')
            .update({ is_active: false })
            .eq('user_id', userInfo.id);

        // إضافة أو تحديث Container الجديد
        const { data, error } = await supabase
            .from('gtm_containers')
            .upsert({
                user_id: userInfo.id,
                user_email: userInfo.email,
                account_id: accountId || null,
                account_name: accountName || null,
                container_id: containerId,
                container_name: containerName || null,
                container_public_id: containerPublicId || null,
                usage_context: usageContext || null,
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,container_id'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error saving container:', error);
            return NextResponse.json({
                success: false,
                error: 'Database error',
                message: error.message
            }, { status: 500 });
        }

        console.log('✅ Container saved successfully:', data);
        return NextResponse.json({
            success: true,
            container: data,
            message: 'تم حفظ Container بنجاح'
        });

    } catch (error) {
        console.error('❌ Error in POST gtm/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}

// DELETE - حذف Container
export async function DELETE(request: NextRequest) {
    try {
        console.log('🗑️ حذف GTM Container...');

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
        const containerId = searchParams.get('containerId');

        if (!containerId) {
            return NextResponse.json({
                success: false,
                error: 'Container ID required'
            }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { error } = await supabase
            .from('gtm_containers')
            .delete()
            .eq('user_id', userInfo.id)
            .eq('container_id', containerId);

        if (error) {
            console.error('❌ Error deleting container:', error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف Container بنجاح'
        });

    } catch (error) {
        console.error('❌ Error in DELETE gtm/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
