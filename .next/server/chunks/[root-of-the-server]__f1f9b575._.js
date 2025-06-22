module.exports = {

"[project]/.next-internal/server/app/api/google-ads/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/app/api/google-ads/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/app/api/google-ads/route.ts
__turbopack_context__.s({
    "GET": (()=>GET),
    "POST": (()=>POST),
    "PUT": (()=>PUT)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// Helper function to generate comprehensive demo data
const generateComprehensiveDemoData = ()=>{
    const campaigns = [
        {
            id: 'camp_001',
            name: 'Performance Max - All Products',
            status: 'ENABLED',
            type: 'Performance Max',
            subType: 'All Products',
            budget: 8000,
            spend: 6567.20,
            impressions: 234560,
            clicks: 4456,
            conversions: 234,
            ctr: 1.90,
            avgCpc: 14.735,
            conversionRate: 5.25,
            costPerConversion: 28.07,
            qualityScore: 8.5,
            impressionShare: 85.2,
            targetLocation: 'Egypt, Saudi Arabia',
            bidStrategy: 'Maximize Conversions',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            devicePerformance: {
                desktop: {
                    impressions: 70368,
                    clicks: 1337,
                    cost: 1970.16
                },
                mobile: {
                    impressions: 140736,
                    clicks: 2669,
                    cost: 3940.32
                },
                tablet: {
                    impressions: 23456,
                    clicks: 450,
                    cost: 656.72
                }
            },
            audienceData: {
                ageGroups: {
                    '18-24': 15,
                    '25-34': 35,
                    '35-44': 30,
                    '45-54': 15,
                    '55+': 5
                },
                genders: {
                    male: 60,
                    female: 38,
                    unknown: 2
                },
                interests: [
                    'Technology',
                    'Shopping',
                    'Electronics'
                ]
            },
            geoPerformance: {
                'Egypt': {
                    impressions: 140736,
                    clicks: 2669,
                    cost: 3940.32
                },
                'Saudi Arabia': {
                    impressions: 93824,
                    clicks: 1787,
                    cost: 2626.88
                }
            }
        },
        {
            id: 'camp_002',
            name: 'Shopping - Home & Garden Products',
            status: 'ENABLED',
            type: 'Shopping',
            subType: 'Smart Shopping',
            budget: 6000,
            spend: 4567.90,
            impressions: 156780,
            clicks: 2876,
            conversions: 156,
            ctr: 1.83,
            avgCpc: 15.885,
            conversionRate: 5.42,
            costPerConversion: 29.28,
            qualityScore: 7.8,
            impressionShare: 78.5,
            targetLocation: 'Egypt, UAE',
            bidStrategy: 'Target ROAS',
            startDate: '2024-02-01',
            endDate: '2024-12-31',
            devicePerformance: {
                desktop: {
                    impressions: 62712,
                    clicks: 1150,
                    cost: 1827.16
                },
                mobile: {
                    impressions: 78390,
                    clicks: 1438,
                    cost: 2283.95
                },
                tablet: {
                    impressions: 15678,
                    clicks: 288,
                    cost: 456.79
                }
            },
            audienceData: {
                ageGroups: {
                    '25-34': 25,
                    '35-44': 40,
                    '45-54': 25,
                    '55+': 10
                },
                genders: {
                    male: 35,
                    female: 63,
                    unknown: 2
                },
                interests: [
                    'Home & Garden',
                    'Lifestyle',
                    'Interior Design'
                ]
            },
            geoPerformance: {
                'Egypt': {
                    impressions: 94068,
                    clicks: 1726,
                    cost: 2740.74
                },
                'UAE': {
                    impressions: 62712,
                    clicks: 1150,
                    cost: 1827.16
                }
            }
        },
        {
            id: 'camp_003',
            name: 'Search - Electronics & Gadgets',
            status: 'ENABLED',
            type: 'Search',
            subType: 'Standard',
            budget: 5000,
            spend: 3247.50,
            impressions: 125430,
            clicks: 2156,
            conversions: 89,
            ctr: 1.72,
            avgCpc: 15.065,
            conversionRate: 4.13,
            costPerConversion: 36.49,
            qualityScore: 9.2,
            impressionShare: 92.1,
            targetLocation: 'Egypt',
            bidStrategy: 'Enhanced CPC',
            startDate: '2024-01-15',
            endDate: '2024-12-31',
            devicePerformance: {
                desktop: {
                    impressions: 37629,
                    clicks: 647,
                    cost: 974.25
                },
                mobile: {
                    impressions: 75258,
                    clicks: 1293,
                    cost: 1948.50
                },
                tablet: {
                    impressions: 12543,
                    clicks: 216,
                    cost: 324.75
                }
            },
            audienceData: {
                ageGroups: {
                    '18-24': 30,
                    '25-34': 35,
                    '35-44': 25,
                    '45-54': 8,
                    '55+': 2
                },
                genders: {
                    male: 70,
                    female: 28,
                    unknown: 2
                },
                interests: [
                    'Electronics',
                    'Technology',
                    'Gaming'
                ]
            },
            geoPerformance: {
                'Egypt': {
                    impressions: 125430,
                    clicks: 2156,
                    cost: 3247.50
                }
            }
        },
        {
            id: 'camp_004',
            name: 'Display - Brand Awareness',
            status: 'ENABLED',
            type: 'Display',
            subType: 'Standard Display',
            budget: 4000,
            spend: 2890.75,
            impressions: 189650,
            clicks: 1847,
            conversions: 67,
            ctr: 0.97,
            avgCpc: 15.65,
            conversionRate: 3.63,
            costPerConversion: 43.14,
            qualityScore: 7.2,
            impressionShare: 68.4,
            targetLocation: 'Egypt, Jordan',
            bidStrategy: 'Target CPM',
            startDate: '2024-03-01',
            endDate: '2024-12-31',
            devicePerformance: {
                desktop: {
                    impressions: 56895,
                    clicks: 554,
                    cost: 867.23
                },
                mobile: {
                    impressions: 113790,
                    clicks: 1108,
                    cost: 1734.45
                },
                tablet: {
                    impressions: 18965,
                    clicks: 185,
                    cost: 289.07
                }
            },
            audienceData: {
                ageGroups: {
                    '18-24': 20,
                    '25-34': 30,
                    '35-44': 25,
                    '45-54': 20,
                    '55+': 5
                },
                genders: {
                    male: 45,
                    female: 53,
                    unknown: 2
                },
                interests: [
                    'Lifestyle',
                    'Fashion',
                    'Travel'
                ]
            },
            geoPerformance: {
                'Egypt': {
                    impressions: 132555,
                    clicks: 1293,
                    cost: 2023.53
                },
                'Jordan': {
                    impressions: 57095,
                    clicks: 554,
                    cost: 867.22
                }
            }
        },
        {
            id: 'camp_005',
            name: 'Video - YouTube Campaigns',
            status: 'PAUSED',
            type: 'Video',
            subType: 'Video Action',
            budget: 3500,
            spend: 1456.30,
            impressions: 98750,
            clicks: 987,
            conversions: 34,
            ctr: 1.00,
            avgCpc: 14.75,
            conversionRate: 3.44,
            costPerConversion: 42.83,
            qualityScore: 6.8,
            impressionShare: 55.2,
            targetLocation: 'Egypt, Lebanon',
            bidStrategy: 'Target CPA',
            startDate: '2024-04-01',
            endDate: '2024-12-31',
            devicePerformance: {
                desktop: {
                    impressions: 19750,
                    clicks: 197,
                    cost: 291.26
                },
                mobile: {
                    impressions: 69125,
                    clicks: 691,
                    cost: 1020.41
                },
                tablet: {
                    impressions: 9875,
                    clicks: 99,
                    cost: 144.63
                }
            },
            audienceData: {
                ageGroups: {
                    '18-24': 40,
                    '25-34': 35,
                    '35-44': 15,
                    '45-54': 8,
                    '55+': 2
                },
                genders: {
                    male: 55,
                    female: 43,
                    unknown: 2
                },
                interests: [
                    'Entertainment',
                    'Music',
                    'Sports'
                ]
            },
            geoPerformance: {
                'Egypt': {
                    impressions: 69125,
                    clicks: 691,
                    cost: 1020.41
                },
                'Lebanon': {
                    impressions: 29625,
                    clicks: 296,
                    cost: 435.89
                }
            }
        },
        {
            id: 'camp_006',
            name: 'Local - Store Visits',
            status: 'ENABLED',
            type: 'Local',
            subType: 'Local Campaigns',
            budget: 2500,
            spend: 1789.45,
            impressions: 67890,
            clicks: 1234,
            conversions: 78,
            ctr: 1.82,
            avgCpc: 14.50,
            conversionRate: 6.32,
            costPerConversion: 22.94,
            qualityScore: 8.9,
            impressionShare: 89.3,
            targetLocation: 'Cairo, Egypt',
            bidStrategy: 'Maximize Clicks',
            startDate: '2024-05-01',
            endDate: '2024-12-31',
            devicePerformance: {
                desktop: {
                    impressions: 13578,
                    clicks: 247,
                    cost: 357.89
                },
                mobile: {
                    impressions: 47523,
                    clicks: 864,
                    cost: 1252.61
                },
                tablet: {
                    impressions: 6789,
                    clicks: 123,
                    cost: 178.95
                }
            },
            audienceData: {
                ageGroups: {
                    '25-34': 30,
                    '35-44': 35,
                    '45-54': 25,
                    '55+': 10
                },
                genders: {
                    male: 48,
                    female: 50,
                    unknown: 2
                },
                interests: [
                    'Local Services',
                    'Shopping',
                    'Dining'
                ]
            },
            geoPerformance: {
                'Cairo': {
                    impressions: 67890,
                    clicks: 1234,
                    cost: 1789.45
                }
            }
        }
    ];
    // Calculate comprehensive summary
    const totalSpend = campaigns.reduce((sum, c)=>sum + c.spend, 0);
    const totalClicks = campaigns.reduce((sum, c)=>sum + c.clicks, 0);
    const totalImpressions = campaigns.reduce((sum, c)=>sum + c.impressions, 0);
    const totalConversions = campaigns.reduce((sum, c)=>sum + c.conversions, 0);
    const summary = {
        totalSpend,
        totalClicks,
        totalImpressions,
        totalConversions,
        avgCpc: totalSpend / totalClicks,
        avgCtr: totalClicks / totalImpressions * 100,
        conversionRate: totalConversions / totalClicks * 100,
        impressionShare: campaigns.reduce((sum, c)=>sum + c.impressionShare, 0) / campaigns.length,
        qualityScore: campaigns.reduce((sum, c)=>sum + c.qualityScore, 0) / campaigns.length,
        campaignTypes: {
            'Performance Max': campaigns.filter((c)=>c.type === 'Performance Max').length,
            'Shopping': campaigns.filter((c)=>c.type === 'Shopping').length,
            'Search': campaigns.filter((c)=>c.type === 'Search').length,
            'Display': campaigns.filter((c)=>c.type === 'Display').length,
            'Video': campaigns.filter((c)=>c.type === 'Video').length,
            'Local': campaigns.filter((c)=>c.type === 'Local').length
        },
        statusBreakdown: {
            enabled: campaigns.filter((c)=>c.status === 'ENABLED').length,
            paused: campaigns.filter((c)=>c.status === 'PAUSED').length,
            removed: campaigns.filter((c)=>c.status === 'REMOVED').length
        },
        performanceTrends: {
            impressions: {
                current: totalImpressions,
                previous: Math.round(totalImpressions * 0.85),
                change: 15
            },
            clicks: {
                current: totalClicks,
                previous: Math.round(totalClicks * 0.92),
                change: 8
            },
            cost: {
                current: totalSpend,
                previous: Math.round(totalSpend * 1.05),
                change: -5
            },
            conversions: {
                current: totalConversions,
                previous: Math.round(totalConversions * 0.88),
                change: 12
            }
        },
        topPerformingCampaigns: campaigns.filter((c)=>c.status === 'ENABLED').sort((a, b)=>b.conversionRate - a.conversionRate).slice(0, 3),
        recommendations: [
            {
                type: 'budget',
                title: 'Increase Budget for Top Performers',
                description: 'Performance Max campaign shows strong conversion rates. Consider increasing budget by 20%.',
                impact: 'high',
                campaignId: 'camp_001'
            },
            {
                type: 'keyword',
                title: 'Expand Keyword Targeting',
                description: 'Electronics campaign has high impression share. Add related keywords to capture more traffic.',
                impact: 'medium',
                campaignId: 'camp_003'
            },
            {
                type: 'audience',
                title: 'Optimize Audience Targeting',
                description: 'Display campaign shows potential for better audience targeting to improve conversion rates.',
                impact: 'medium',
                campaignId: 'camp_004'
            },
            {
                type: 'bidding',
                title: 'Resume Paused Campaigns',
                description: 'Video campaign is paused but showed good performance. Consider resuming with optimized targeting.',
                impact: 'high',
                campaignId: 'camp_005'
            }
        ]
    };
    return {
        campaigns,
        summary
    };
};
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataType = searchParams.get('dataType') || 'campaigns';
        const campaignType = searchParams.get('campaignType');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        console.log('🔍 GET Request params:', {
            dataType,
            campaignType,
            status,
            search
        });
        // Generate comprehensive demo data
        console.log('🔄 Generating comprehensive demo data...');
        const demoData = generateComprehensiveDemoData();
        // Apply filters if provided
        let filteredCampaigns = demoData.campaigns;
        if (campaignType && campaignType !== 'all') {
            filteredCampaigns = filteredCampaigns.filter((c)=>c.type.toLowerCase().includes(campaignType.toLowerCase()));
        }
        if (status && status !== 'all') {
            filteredCampaigns = filteredCampaigns.filter((c)=>c.status.toLowerCase() === status.toLowerCase());
        }
        if (search) {
            filteredCampaigns = filteredCampaigns.filter((c)=>c.name.toLowerCase().includes(search.toLowerCase()));
        }
        const response = {
            success: true,
            data: {
                campaigns: filteredCampaigns,
                summary: demoData.summary,
                totalCount: demoData.campaigns.length,
                filteredCount: filteredCampaigns.length
            },
            note: 'Using comprehensive demo data - configure Google Ads API for real data',
            isDemo: true
        };
        console.log('✅ Returning demo data with', filteredCampaigns.length, 'campaigns');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error('❌ API Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch campaign data',
            data: {
                campaigns: [],
                summary: {
                    totalSpend: 0,
                    totalClicks: 0,
                    totalImpressions: 0,
                    totalConversions: 0,
                    avgCpc: 0,
                    avgCtr: 0,
                    conversionRate: 0,
                    impressionShare: 0,
                    qualityScore: 0,
                    campaignTypes: {},
                    statusBreakdown: {
                        enabled: 0,
                        paused: 0,
                        removed: 0
                    },
                    performanceTrends: {
                        impressions: {
                            current: 0,
                            previous: 0,
                            change: 0
                        },
                        clicks: {
                            current: 0,
                            previous: 0,
                            change: 0
                        },
                        cost: {
                            current: 0,
                            previous: 0,
                            change: 0
                        },
                        conversions: {
                            current: 0,
                            previous: 0,
                            change: 0
                        }
                    },
                    topPerformingCampaigns: [],
                    recommendations: []
                }
            }
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        console.log('🚀 POST Request: Fetching Google Ads data...');
        const body = await request.json();
        const { loginCustomerId, startDate, endDate, dataType } = body;
        console.log('📥 Request body:', {
            loginCustomerId,
            startDate,
            endDate,
            dataType
        });
        // Generate demo data (since we don't have real Google Ads API setup)
        console.log('🔄 Using comprehensive demo data');
        const demoData = generateComprehensiveDemoData();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: demoData,
            message: 'Demo data loaded successfully',
            isDemo: true
        });
    } catch (error) {
        console.error('❌ POST request error:', error);
        // Always return demo data on error
        const demoData = generateComprehensiveDemoData();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: demoData,
            message: 'Demo data (API error)',
            isDemo: true,
            error: error.message
        });
    }
}
async function PUT(request) {
    try {
        const body = await request.json();
        const { campaignId, action } = body;
        console.log(`🔧 Campaign action: ${action} for campaign ${campaignId}`);
        // In demo mode, just return success
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: `Campaign ${campaignId} ${action}d successfully (demo mode)`,
            isDemo: true
        });
    } catch (error) {
        console.error('❌ PUT request error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Campaign action failed',
            message: error.message
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__f1f9b575._.js.map