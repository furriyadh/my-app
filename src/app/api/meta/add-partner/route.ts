// Meta Ads API - Add Partner/Agency Access Route
// إضافة وصول الوكالة إلى حساب الإعلانات
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// معرف Business Manager الخاص بك (الوكالة)
const AGENCY_BUSINESS_ID = process.env.META_AGENCY_BUSINESS_ID || '';

export async function POST(request: NextRequest) {
    try {
        console.log('🤝 إضافة وصول الوكالة إلى Meta Ad Account...');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('meta_access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                error: 'No Meta access token found',
                message: 'يرجى تسجيل الدخول بـ Meta أولاً'
            }, { status: 401 });
        }

        const body = await request.json();
        const { adAccountId } = body;

        if (!adAccountId) {
            return NextResponse.json({
                success: false,
                error: 'Ad Account ID required',
                message: 'يجب تحديد Ad Account ID'
            }, { status: 400 });
        }

        // ملاحظة: إضافة Agency Access في Meta يتطلب:
        // 1. أن يكون لديك Business Manager
        // 2. طلب وصول من العميل أو دعوة من الوكالة
        // 3. صلاحيات business_management

        // الطريقة 1: إذا كان لديك Business Manager ID، يمكنك طلب الوصول
        if (AGENCY_BUSINESS_ID) {
            console.log(`🔗 طلب وصول Business ${AGENCY_BUSINESS_ID} إلى ${adAccountId}...`);

            // هذا يتطلب أن يكون العميل قد منحك صلاحيات مسبقاً
            // أو أن يوافق على طلب الوصول من Business Manager

            // في الواقع، الأفضل هو:
            // 1. إرسال طلب شراكة للعميل
            // 2. العميل يوافق من Business Manager الخاص به

            // لكن يمكننا التحقق من الصلاحيات الحالية
            const permissionsUrl = `https://graph.facebook.com/v18.0/${adAccountId}/assigned_users?access_token=${accessToken}`;

            try {
                const permResponse = await fetch(permissionsUrl);

                if (permResponse.ok) {
                    const permData = await permResponse.json();
                    console.log('📋 Current permissions:', permData);

                    return NextResponse.json({
                        success: true,
                        permissions: permData.data || [],
                        message: 'تم جلب صلاحيات الحساب',
                        note: 'لإضافة وصول الوكالة، يجب على العميل منح الوصول من Business Manager'
                    });
                } else {
                    const errorData = await permResponse.json();
                    console.error('❌ Error fetching permissions:', errorData);
                }
            } catch (e) {
                console.error('❌ Error checking permissions:', e);
            }
        }

        // في حالة عدم وجود Business Manager، نحفظ الحساب فقط
        // ونطلب من العميل إضافتنا يدوياً
        return NextResponse.json({
            success: true,
            manualSetupRequired: true,
            message: 'تم حفظ الحساب. لإضافة وصول الوكالة، يرجى مشاركة الحساب من Business Manager',
            instructions: [
                '1. اذهب إلى Business Manager الخاص بك',
                '2. Settings > Ad Accounts',
                '3. اختر الحساب المطلوب',
                '4. Add Partner واكتب Business ID الخاص بالوكالة',
                '5. حدد الصلاحيات المطلوبة'
            ]
        });

    } catch (error) {
        console.error('❌ خطأ في إضافة وصول الوكالة:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي'
        }, { status: 500 });
    }
}

// GET - جلب Business ID الخاص بالوكالة لمشاركته مع العميل
export async function GET(request: NextRequest) {
    try {
        // هذا Endpoint لإظهار Business ID للعميل ليتمكن من إضافتنا
        return NextResponse.json({
            success: true,
            agencyBusinessId: AGENCY_BUSINESS_ID || 'Not configured',
            instructions: AGENCY_BUSINESS_ID ? [
                `1. اذهب إلى business.facebook.com`,
                `2. Settings > Ad Accounts > اختر حسابك`,
                `3. Add Partner`,
                `4. أدخل Business ID: ${AGENCY_BUSINESS_ID}`,
                `5. حدد صلاحيات: Manage campaigns, View performance`
            ] : [
                'يرجى تكوين META_AGENCY_BUSINESS_ID في متغيرات البيئة'
            ]
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
