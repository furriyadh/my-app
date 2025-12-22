// YouTube Channels API - Save/List connected channels
// حفظ وجلب قنوات YouTube المرتبطة من Supabase
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

// GET - جلب القنوات المحفوظة للمستخدم الحالي
export async function GET(request: NextRequest) {
    try {
        console.log('📺 جلب YouTube Channels المحفوظة...');

        const cookieStore = await cookies();
        const userInfoCookie = cookieStore.get('oauth_user_info')?.value;

        if (!userInfoCookie) {
            console.log('⚠️ No oauth_user_info cookie found - returning empty array');
            return NextResponse.json({
                success: true,
                channels: [],
                activeChannel: null,
                count: 0,
                message: 'Not authenticated'
            });
        }

        const userInfo = JSON.parse(userInfoCookie);
        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from('youtube_channels')
            .select('*')
            .eq('user_id', userInfo.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching channels:', error);
            return NextResponse.json({
                success: false,
                error: 'Database error',
                message: error.message
            }, { status: 500 });
        }

        // جلب القناة النشطة
        const activeChannel = data?.find(c => c.is_active) || data?.[0] || null;

        return NextResponse.json({
            success: true,
            channels: data || [],
            activeChannel: activeChannel,
            count: data?.length || 0
        });

    } catch (error) {
        console.error('❌ Error in GET youtube/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}

// POST - حفظ قناة جديدة للمستخدم
export async function POST(request: NextRequest) {
    try {
        console.log('💾 حفظ YouTube Channel...');

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
        const { channelId, channelTitle, channelThumbnail, subscriberCount, videoCount } = body;

        if (!channelId) {
            return NextResponse.json({
                success: false,
                error: 'Channel ID required',
                message: 'يجب تحديد Channel ID'
            }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // إلغاء تفعيل جميع القنوات السابقة للمستخدم
        await supabase
            .from('youtube_channels')
            .update({ is_active: false })
            .eq('user_id', userInfo.id);

        // إضافة أو تحديث القناة الجديدة
        const { data, error } = await supabase
            .from('youtube_channels')
            .upsert({
                user_id: userInfo.id,
                user_email: userInfo.email,
                channel_id: channelId,
                channel_title: channelTitle || null,
                channel_thumbnail: channelThumbnail || null,
                subscriber_count: subscriberCount || null,
                video_count: videoCount || null,
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,channel_id'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error saving channel:', error);
            return NextResponse.json({
                success: false,
                error: 'Database error',
                message: error.message
            }, { status: 500 });
        }

        console.log('✅ Channel saved successfully:', data);
        return NextResponse.json({
            success: true,
            channel: data,
            message: 'تم حفظ القناة بنجاح'
        });

    } catch (error) {
        console.error('❌ Error in POST youtube/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}

// DELETE - حذف قناة
export async function DELETE(request: NextRequest) {
    try {
        console.log('🗑️ حذف YouTube Channel...');

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
        const channelId = searchParams.get('channelId');

        if (!channelId) {
            return NextResponse.json({
                success: false,
                error: 'Channel ID required'
            }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { error } = await supabase
            .from('youtube_channels')
            .delete()
            .eq('user_id', userInfo.id)
            .eq('channel_id', channelId);

        if (error) {
            console.error('❌ Error deleting channel:', error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف القناة بنجاح'
        });

    } catch (error) {
        console.error('❌ Error in DELETE youtube/connected:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
