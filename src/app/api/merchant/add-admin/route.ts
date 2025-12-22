// Google Merchant Center API - Add Admin Route
// إضافة مستخدم على حساب Merchant Center
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// البريد الإلكتروني للمدير الذي سيُضاف على كل حساب
const ADMIN_EMAIL = 'ads@furriyadh.com';

export async function POST(request: NextRequest) {
    try {
        console.log('👤 إضافة مدير على Merchant Center Account...');

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
        const { merchantId } = body;

        if (!merchantId) {
            return NextResponse.json({
                success: false,
                error: 'Merchant ID required',
                message: 'يجب تحديد Merchant ID'
            }, { status: 400 });
        }

        console.log(`🔗 إضافة ${ADMIN_EMAIL} كـ Admin على Merchant ${merchantId}...`);

        // استخدام Google Content API لإضافة المستخدم
        // https://developers.google.com/shopping-content/reference/rest/v2.1/accounts/update
        // نحتاج أولاً جلب تفاصيل الحساب ثم تحديثه

        // 1. جلب تفاصيل الحساب الحالية
        const getAccountUrl = `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/accounts/${merchantId}`;
        console.log(`🔗 Get Account URL: ${getAccountUrl}`);

        const accountResponse = await fetch(getAccountUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!accountResponse.ok) {
            const errorText = await accountResponse.text();
            console.error('❌ فشل في جلب تفاصيل الحساب:', errorText);

            return NextResponse.json({
                success: false,
                error: 'Failed to get account',
                message: 'فشل في جلب تفاصيل الحساب',
                details: errorText
            }, { status: accountResponse.status });
        }

        const accountData = await accountResponse.json();
        console.log('📋 Account data:', accountData);

        // 2. إضافة المستخدم الجديد إلى قائمة المستخدمين
        const existingUsers = accountData.users || [];

        // التحقق إذا كان المستخدم موجود بالفعل
        const userExists = existingUsers.some((user: any) =>
            user.emailAddress?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        );

        if (userExists) {
            console.log('⚠️ المستخدم موجود بالفعل كمدير');
            return NextResponse.json({
                success: true,
                alreadyExists: true,
                message: `${ADMIN_EMAIL} موجود بالفعل كمدير على هذا الحساب`
            });
        }

        // إضافة المستخدم الجديد
        const updatedUsers = [
            ...existingUsers,
            {
                emailAddress: ADMIN_EMAIL,
                admin: true // صلاحيات المدير الكاملة
            }
        ];

        // 3. تحديث الحساب مع المستخدم الجديد
        const updateUrl = `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/accounts/${merchantId}`;
        console.log(`🔗 Update Account URL: ${updateUrl}`);

        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...accountData,
                users: updatedUsers
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('❌ فشل في تحديث الحساب:', errorText);

            // التحقق من نوع الخطأ
            try {
                const errorJson = JSON.parse(errorText);

                if (errorJson.error?.status === 'PERMISSION_DENIED') {
                    return NextResponse.json({
                        success: false,
                        error: 'Permission denied',
                        message: 'ليس لديك صلاحية لإضافة مستخدمين. تأكد من أنك مالك الحساب.'
                    }, { status: 403 });
                }
            } catch (e) {
                // تجاهل خطأ الـ parse
            }

            return NextResponse.json({
                success: false,
                error: 'Failed to update account',
                message: 'فشل في إضافة المدير',
                details: errorText
            }, { status: updateResponse.status });
        }

        const updatedAccount = await updateResponse.json();
        console.log('✅ تم إضافة المدير بنجاح:', updatedAccount);

        return NextResponse.json({
            success: true,
            account: updatedAccount,
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

// GET - جلب قائمة المستخدمين الحاليين على الحساب
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
        const merchantId = searchParams.get('merchantId');

        if (!merchantId) {
            return NextResponse.json({
                success: false,
                error: 'Merchant ID required'
            }, { status: 400 });
        }

        const response = await fetch(
            `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/accounts/${merchantId}`,
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
            users: data.users || []
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
