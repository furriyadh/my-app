// Google Analytics Properties API - Save/List connected properties
// حفظ وجلب Properties المرتبطة من Supabase
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

// GET - جلب Properties المحفوظة للمستخدم الحالي
export async function GET(request: NextRequest) {
    try {
        console.log('📊 جلب Analytics Properties المحفوظة...');

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
            .from('analytics_properties')
            .select('*')
            .eq('user_id', userInfo.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching properties:', error);
            return NextResponse.json({
                success: false,
                error: 'Database error',
                message: error.message
            }, { status: 500 });
        }

        // جلب Property النشط
        const activeProperty = data?.find(p => p.is_active) || data?.[0] || null;

        return NextResponse.json({
            success: true,
            properties: data || [],
            activeProperty: activeProperty,
            count: data?.length || 0
        });

    } catch (error) {
        console.error('❌ Error in GET analytics/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}

// POST - حفظ Property جديد للمستخدم
export async function POST(request: NextRequest) {
    try {
        console.log('💾 حفظ Analytics Property...');

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
        const { propertyId, propertyName, accountId, accountName, websiteUrl, timezone, currency } = body;

        if (!propertyId) {
            return NextResponse.json({
                success: false,
                error: 'Property ID required',
                message: 'يجب تحديد Property ID'
            }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // إلغاء تفعيل جميع Properties السابقة للمستخدم
        await supabase
            .from('analytics_properties')
            .update({ is_active: false })
            .eq('user_id', userInfo.id);

        // إضافة أو تحديث Property الجديد
        const { data, error } = await supabase
            .from('analytics_properties')
            .upsert({
                user_id: userInfo.id,
                user_email: userInfo.email,
                property_id: propertyId,
                property_name: propertyName || null,
                account_id: accountId || null,
                account_name: accountName || null,
                website_url: websiteUrl || null,
                timezone: timezone || null,
                currency: currency || null,
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,property_id'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error saving property:', error);
            return NextResponse.json({
                success: false,
                error: 'Database error',
                message: error.message
            }, { status: 500 });
        }

        console.log('✅ Property saved successfully:', data);
        return NextResponse.json({
            success: true,
            property: data,
            message: 'تم حفظ Property بنجاح'
        });

    } catch (error) {
        console.error('❌ Error in POST analytics/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}

// DELETE - حذف Property
export async function DELETE(request: NextRequest) {
    try {
        console.log('🗑️ حذف Analytics Property...');

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
        const propertyId = searchParams.get('propertyId');

        if (!propertyId) {
            return NextResponse.json({
                success: false,
                error: 'Property ID required'
            }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { error } = await supabase
            .from('analytics_properties')
            .delete()
            .eq('user_id', userInfo.id)
            .eq('property_id', propertyId);

        if (error) {
            console.error('❌ Error deleting property:', error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف Property بنجاح'
        });

    } catch (error) {
        console.error('❌ Error in DELETE analytics/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
