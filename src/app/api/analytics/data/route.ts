// Google Analytics API - Data Route
// جلب بيانات التحليلات من Google Analytics
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        console.log('📊 جلب بيانات Google Analytics...');

        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const startDate = searchParams.get('startDate') || '30daysAgo';
        const endDate = searchParams.get('endDate') || 'today';

        if (!propertyId) {
            return NextResponse.json({
                success: false,
                error: 'Property ID is required',
                message: 'يجب تحديد Property ID'
            }, { status: 400 });
        }

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('oauth_access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                error: 'No access token found',
                message: 'يرجى تسجيل الدخول أولاً'
            }, { status: 401 });
        }

        // استخدام Google Analytics Data API (GA4)
        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [
                        { name: 'date' },
                        { name: 'country' },
                        { name: 'deviceCategory' }
                    ],
                    metrics: [
                        { name: 'activeUsers' },
                        { name: 'sessions' },
                        { name: 'screenPageViews' },
                        { name: 'bounceRate' },
                        { name: 'averageSessionDuration' }
                    ]
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ فشل في جلب البيانات:', errorText);

            return NextResponse.json({
                success: false,
                error: 'Failed to fetch Analytics data',
                message: 'فشل في جلب بيانات التحليلات',
                details: errorText
            }, { status: response.status });
        }

        const data = await response.json();
        console.log('✅ تم جلب البيانات بنجاح');

        // تحويل البيانات لصيغة سهلة الاستخدام
        const processedData = processAnalyticsData(data);

        return NextResponse.json({
            success: true,
            data: processedData,
            raw: data
        });

    } catch (error) {
        console.error('❌ خطأ في جلب Analytics Data:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
        }, { status: 500 });
    }
}

// تحويل البيانات لصيغة سهلة
function processAnalyticsData(data: any) {
    const rows = data.rows || [];

    // إحصائيات إجمالية
    let totalUsers = 0;
    let totalSessions = 0;
    let totalPageViews = 0;

    // البيانات حسب البلد
    const byCountry: Record<string, number> = {};

    // البيانات حسب الجهاز
    const byDevice: Record<string, number> = {};

    // البيانات حسب التاريخ
    const byDate: Record<string, any> = {};

    for (const row of rows) {
        const date = row.dimensionValues?.[0]?.value;
        const country = row.dimensionValues?.[1]?.value;
        const device = row.dimensionValues?.[2]?.value;

        const users = parseInt(row.metricValues?.[0]?.value || '0');
        const sessions = parseInt(row.metricValues?.[1]?.value || '0');
        const pageViews = parseInt(row.metricValues?.[2]?.value || '0');

        totalUsers += users;
        totalSessions += sessions;
        totalPageViews += pageViews;

        // تجميع حسب البلد
        if (country) {
            byCountry[country] = (byCountry[country] || 0) + users;
        }

        // تجميع حسب الجهاز
        if (device) {
            byDevice[device] = (byDevice[device] || 0) + users;
        }

        // تجميع حسب التاريخ
        if (date) {
            if (!byDate[date]) {
                byDate[date] = { users: 0, sessions: 0, pageViews: 0 };
            }
            byDate[date].users += users;
            byDate[date].sessions += sessions;
            byDate[date].pageViews += pageViews;
        }
    }

    return {
        summary: {
            totalUsers,
            totalSessions,
            totalPageViews,
            avgSessionDuration: calculateAvgSessionDuration(rows)
        },
        byCountry: Object.entries(byCountry)
            .map(([country, users]) => ({ country, users }))
            .sort((a, b) => b.users - a.users)
            .slice(0, 10),
        byDevice: Object.entries(byDevice)
            .map(([device, users]) => ({ device, users })),
        byDate: Object.entries(byDate)
            .map(([date, metrics]) => ({ date, ...metrics }))
            .sort((a, b) => a.date.localeCompare(b.date))
    };
}

function calculateAvgSessionDuration(rows: any[]): number {
    let total = 0;
    let count = 0;

    for (const row of rows) {
        const duration = parseFloat(row.metricValues?.[4]?.value || '0');
        if (duration > 0) {
            total += duration;
            count++;
        }
    }

    return count > 0 ? Math.round(total / count) : 0;
}
