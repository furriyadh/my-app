// Google Analytics API - Add Admin Route
// إضافة مستخدم كـ Editor/Viewer على Property
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// البريد الإلكتروني للمدير الذي سيُضاف على كل Property
const ADMIN_EMAIL = 'ads@furriyadh.com';

export async function POST(request: NextRequest) {
    try {
        console.log('👤 إضافة مدير على Analytics Property...');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('oauth_access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                error: 'No access token found',
                message: 'يرجى تسجيل الدخول أولاً'
            }, { status: 401 });
        }

        const body = await request.json();
        const { propertyId } = body;

        if (!propertyId) {
            return NextResponse.json({
                success: false,
                error: 'Property ID required',
                message: 'يجب تحديد Property ID'
            }, { status: 400 });
        }

        console.log(`🔗 إضافة ${ADMIN_EMAIL} كـ Editor على ${propertyId}...`);

        // استخدام Google Analytics Admin API لإضافة المستخدم
        // https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1alpha/properties.accessBindings/create
        const apiUrl = `https://analyticsadmin.googleapis.com/v1alpha/${propertyId}/accessBindings`;
        console.log(`🔗 API URL: ${apiUrl}`);

        const response = await fetch(
            apiUrl,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: ADMIN_EMAIL,
                    roles: ['predefinedRoles/editor'] // يمكن تغييرها لـ analyst أو viewer
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ فشل في إضافة المدير:', errorText);

            // التحقق من نوع الخطأ
            try {
                const errorJson = JSON.parse(errorText);

                // إذا كان المستخدم موجود بالفعل
                if (errorJson.error?.status === 'ALREADY_EXISTS') {
                    console.log('⚠️ المستخدم موجود بالفعل كمدير');
                    return NextResponse.json({
                        success: true,
                        alreadyExists: true,
                        message: `${ADMIN_EMAIL} موجود بالفعل كمدير على هذا Property`
                    });
                }

                // إذا لم تكن هناك صلاحية
                if (errorJson.error?.status === 'PERMISSION_DENIED') {
                    return NextResponse.json({
                        success: false,
                        error: 'Permission denied',
                        message: 'ليس لديك صلاحية لإضافة مستخدمين. تأكد من منح صلاحية analytics.manage.users'
                    }, { status: 403 });
                }
            } catch (e) {
                // تجاهل خطأ الـ parse
            }

            return NextResponse.json({
                success: false,
                error: 'Failed to add admin',
                message: 'فشل في إضافة المدير',
                details: errorText
            }, { status: response.status });
        }

        const data = await response.json();
        console.log('✅ تم إضافة المدير بنجاح:', data);

        return NextResponse.json({
            success: true,
            accessBinding: data,
            message: `تم إضافة ${ADMIN_EMAIL} كمدير على Property بنجاح`
        });

    } catch (error) {
        console.error('❌ خطأ في إضافة المدير:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}

// GET - جلب قائمة المديرين الحاليين على Property
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('oauth_access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                error: 'No access token'
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');

        if (!propertyId) {
            return NextResponse.json({
                success: false,
                error: 'Property ID required'
            }, { status: 400 });
        }

        const response = await fetch(
            `https://analyticsadmin.googleapis.com/v1alpha/${propertyId}/accessBindings`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({
                success: false,
                error: errorText
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({
            success: true,
            accessBindings: data.accessBindings || []
        });

    } catch (error) {
        console.error('Error fetching access bindings:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
