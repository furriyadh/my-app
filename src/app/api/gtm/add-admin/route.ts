// Google Tag Manager API - Add Admin Route
// إضافة مستخدم كـ Editor على Container
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// البريد الإلكتروني للمدير الذي سيُضاف على كل Container
const ADMIN_EMAIL = 'ads@furriyadh.com';

export async function POST(request: NextRequest) {
    try {
        console.log('👤 إضافة مدير على GTM Container...');

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
        const { accountPath } = body; // مثل: accounts/123456

        if (!accountPath) {
            return NextResponse.json({
                success: false,
                error: 'Account path required',
                message: 'يجب تحديد Account path'
            }, { status: 400 });
        }

        console.log(`🔗 إضافة ${ADMIN_EMAIL} كـ Admin على ${accountPath}...`);

        // استخدام Google Tag Manager API لإضافة المستخدم على مستوى الحساب
        // https://developers.google.com/tag-manager/api/v2/reference/accounts/user_permissions/create
        const apiUrl = `https://tagmanager.googleapis.com/tagmanager/v2/${accountPath}/user_permissions`;
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
                    emailAddress: ADMIN_EMAIL,
                    accountAccess: {
                        permission: 'admin' // يمكن تغييرها لـ user أو noAccess
                    }
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
                if (errorJson.error?.status === 'ALREADY_EXISTS' ||
                    errorJson.error?.message?.includes('already exists')) {
                    console.log('⚠️ المستخدم موجود بالفعل كمدير');
                    return NextResponse.json({
                        success: true,
                        alreadyExists: true,
                        message: `${ADMIN_EMAIL} موجود بالفعل كمدير على هذا الحساب`
                    });
                }

                // إذا لم تكن هناك صلاحية
                if (errorJson.error?.status === 'PERMISSION_DENIED') {
                    return NextResponse.json({
                        success: false,
                        error: 'Permission denied',
                        message: 'ليس لديك صلاحية لإضافة مستخدمين. تأكد من منح صلاحية tagmanager.manage.users'
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
            userPermission: data,
            message: `تم إضافة ${ADMIN_EMAIL} كمدير على الحساب بنجاح`
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

// GET - جلب قائمة المديرين الحاليين على الحساب
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
        const accountPath = searchParams.get('accountPath');

        if (!accountPath) {
            return NextResponse.json({
                success: false,
                error: 'Account path required'
            }, { status: 400 });
        }

        const response = await fetch(
            `https://tagmanager.googleapis.com/tagmanager/v2/${accountPath}/user_permissions`,
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
            userPermissions: data.userPermission || []
        });

    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
