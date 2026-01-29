// Meta (Facebook) OAuth Route
// بدء عملية OAuth مع Meta/Facebook
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Meta OAuth Configuration
const META_APP_ID = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

// Scopes المطلوبة لـ Meta Ads
const META_SCOPES = [
    'ads_management',           // إدارة الإعلانات
    'ads_read',                 // قراءة بيانات الإعلانات
    'business_management',      // إدارة Business Manager
    'pages_read_engagement',    // قراءة تفاعل الصفحات
    'pages_show_list',          // عرض قائمة الصفحات
    'email',                    // البريد الإلكتروني
    'public_profile'            // الملف الشخصي العام
].join(',');

export async function GET(request: NextRequest) {
    try {
        console.log('🔗 بدء OAuth مع Meta/Facebook...');

        if (!META_APP_ID) {
            console.error('❌ META_APP_ID غير موجود');
            return NextResponse.json({
                success: false,
                error: 'Meta App ID not configured',
                message: 'يرجى تكوين META_APP_ID في متغيرات البيئة'
            }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const redirectAfter = searchParams.get('redirect_after') || '/dashboard/google-ads/integrations';

        // إنشاء state للحماية من CSRF
        const state = crypto.randomBytes(32).toString('base64url');
        const stateData = JSON.stringify({
            state,
            redirect_after: redirectAfter
        });

        // حفظ state في cookie
        const cookieStore = await cookies();
        cookieStore.set('meta_oauth_state', stateData, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600, // 10 دقائق
            path: '/'
        });

        // تحديد redirect URI
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:3000');
        const redirectUri = `${baseUrl}/api/oauth/meta/callback`;

        // بناء URL المصادقة
        const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
        authUrl.searchParams.set('client_id', META_APP_ID);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('scope', META_SCOPES);
        authUrl.searchParams.set('state', Buffer.from(stateData).toString('base64'));
        authUrl.searchParams.set('response_type', 'code');

        console.log('🔗 Meta Auth URL:', authUrl.toString());
        console.log('📋 Redirect URI:', redirectUri);

        return NextResponse.redirect(authUrl.toString());

    } catch (error) {
        console.error('❌ خطأ في Meta OAuth:', error);
        return NextResponse.json({
            success: false,
            error: 'OAuth initialization failed',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}
