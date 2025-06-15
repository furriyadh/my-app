(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/components/Charts/Area/BasicAreaChart.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.r("[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = Chart;
const BasicAreaChart = ()=>{
    _s();
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BasicAreaChart.useEffect": ()=>{
            setChartLoaded(true);
        }
    }["BasicAreaChart.useEffect"], []);
    const series = [
        {
            name: "STOCK ABC",
            data: [
                8107.85,
                8128.0,
                8122.9,
                8165.5,
                8340.7,
                8423.7,
                8423.5,
                8514.3,
                8481.85,
                8487.7,
                8506.9,
                8626.2,
                8668.95,
                8602.3,
                8607.55,
                8512.9,
                8496.25,
                8600.65,
                8881.1,
                9340.85
            ]
        }
    ];
    const options = {
        chart: {
            zoom: {
                enabled: false
            },
            toolbar: {
                show: true
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: [
            "#605DFF"
        ],
        stroke: {
            curve: "straight"
        },
        title: {
            text: "Fundamental Analysis of Stocks",
            align: "left",
            offsetX: -9,
            style: {
                fontWeight: "500",
                fontSize: "14px",
                color: "#64748B"
            }
        },
        subtitle: {
            text: "Price Movements",
            align: "left",
            offsetX: -9,
            style: {
                fontWeight: "normal",
                fontSize: "13px",
                color: "#64748B"
            }
        },
        labels: [
            "13 Nov 2024",
            "14 Nov 2024",
            "15 Nov 2024",
            "16 Nov 2024",
            "17 Nov 2024",
            "20 Nov 2024",
            "21 Nov 2024",
            "22 Nov 2024",
            "23 Nov 2024",
            "24 Nov 2024",
            "27 Nov 2024",
            "28 Nov 2024",
            "29 Nov 2024",
            "30 Nov 2024",
            "01 Dec 2024",
            "04 Dec 2024",
            "05 Dec 2024",
            "06 Dec 2024",
            "07 Dec 2024",
            "08 Dec 2024"
        ],
        xaxis: {
            type: "datetime",
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            labels: {
                show: true,
                style: {
                    colors: "#8695AA",
                    fontSize: "12px"
                }
            }
        },
        grid: {
            show: true,
            borderColor: "#ECEEF2"
        },
        yaxis: {
            opposite: true,
            labels: {
                show: true,
                style: {
                    colors: "#64748B",
                    fontSize: "12px"
                }
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Basic Line Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/Area/BasicAreaChart.tsx",
                            lineNumber: 134,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/BasicAreaChart.tsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/BasicAreaChart.tsx",
                    lineNumber: 132,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "area",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/BasicAreaChart.tsx",
                        lineNumber: 139,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/BasicAreaChart.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/Area/BasicAreaChart.tsx",
            lineNumber: 131,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
_s(BasicAreaChart, "yMcmCpKZo0kJL8LGuxfsfA0rzTY=");
_c1 = BasicAreaChart;
const __TURBOPACK__default__export__ = BasicAreaChart;
var _c, _c1;
__turbopack_context__.k.register(_c, "Chart");
__turbopack_context__.k.register(_c1, "BasicAreaChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Charts/Area/DatetimeAreaChart.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.r("[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = Chart;
const DatetimeAreaChart = ()=>{
    _s();
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DatetimeAreaChart.useEffect": ()=>{
            setChartLoaded(true);
        }
    }["DatetimeAreaChart.useEffect"], []);
    const series = [
        {
            name: "Trezo",
            data: [
                [
                    1327359600000,
                    30.95
                ],
                [
                    1327446000000,
                    31.34
                ],
                [
                    1327532400000,
                    31.18
                ],
                [
                    1327618800000,
                    31.05
                ],
                [
                    1327878000000,
                    31.0
                ],
                [
                    1327964400000,
                    30.95
                ],
                [
                    1328050800000,
                    31.24
                ],
                [
                    1328137200000,
                    31.29
                ],
                [
                    1328223600000,
                    31.85
                ],
                [
                    1328482800000,
                    31.86
                ],
                [
                    1328569200000,
                    32.28
                ],
                [
                    1328655600000,
                    32.1
                ],
                [
                    1328742000000,
                    32.65
                ],
                [
                    1328828400000,
                    32.21
                ],
                [
                    1329087600000,
                    32.35
                ],
                [
                    1329174000000,
                    32.44
                ],
                [
                    1329260400000,
                    32.46
                ],
                [
                    1329346800000,
                    32.86
                ],
                [
                    1329433200000,
                    32.75
                ],
                [
                    1329778800000,
                    32.54
                ],
                [
                    1329865200000,
                    32.33
                ],
                [
                    1329951600000,
                    32.97
                ],
                [
                    1330038000000,
                    33.41
                ],
                [
                    1330297200000,
                    33.27
                ],
                [
                    1330383600000,
                    33.27
                ],
                [
                    1330470000000,
                    32.89
                ],
                [
                    1330556400000,
                    33.1
                ],
                [
                    1330642800000,
                    33.73
                ],
                [
                    1330902000000,
                    33.22
                ],
                [
                    1330988400000,
                    31.99
                ],
                [
                    1331074800000,
                    32.41
                ],
                [
                    1331161200000,
                    33.05
                ],
                [
                    1331247600000,
                    33.64
                ],
                [
                    1331506800000,
                    33.56
                ],
                [
                    1331593200000,
                    34.22
                ],
                [
                    1331679600000,
                    33.77
                ],
                [
                    1331766000000,
                    34.17
                ],
                [
                    1331852400000,
                    33.82
                ],
                [
                    1332111600000,
                    34.51
                ],
                [
                    1332198000000,
                    33.16
                ],
                [
                    1332284400000,
                    33.56
                ],
                [
                    1332370800000,
                    33.71
                ],
                [
                    1332457200000,
                    33.81
                ],
                [
                    1332712800000,
                    34.4
                ],
                [
                    1332799200000,
                    34.63
                ],
                [
                    1332885600000,
                    34.46
                ],
                [
                    1332972000000,
                    34.48
                ],
                [
                    1333058400000,
                    34.31
                ],
                [
                    1333317600000,
                    34.7
                ],
                [
                    1333404000000,
                    34.31
                ],
                [
                    1333490400000,
                    33.46
                ],
                [
                    1333576800000,
                    33.59
                ],
                [
                    1333922400000,
                    33.22
                ],
                [
                    1334008800000,
                    32.61
                ],
                [
                    1334095200000,
                    33.01
                ],
                [
                    1334181600000,
                    33.55
                ],
                [
                    1334268000000,
                    33.18
                ],
                [
                    1334527200000,
                    32.84
                ],
                [
                    1334613600000,
                    33.84
                ],
                [
                    1334700000000,
                    33.39
                ],
                [
                    1334786400000,
                    32.91
                ],
                [
                    1334872800000,
                    33.06
                ],
                [
                    1335132000000,
                    32.62
                ],
                [
                    1335218400000,
                    32.4
                ],
                [
                    1335304800000,
                    33.13
                ],
                [
                    1335391200000,
                    33.26
                ],
                [
                    1335477600000,
                    33.58
                ],
                [
                    1335736800000,
                    33.55
                ],
                [
                    1335823200000,
                    33.77
                ],
                [
                    1335909600000,
                    33.76
                ],
                [
                    1335996000000,
                    33.32
                ],
                [
                    1336082400000,
                    32.61
                ],
                [
                    1336341600000,
                    32.52
                ],
                [
                    1336428000000,
                    32.67
                ],
                [
                    1336514400000,
                    32.52
                ],
                [
                    1336600800000,
                    31.92
                ],
                [
                    1336687200000,
                    32.2
                ],
                [
                    1336946400000,
                    32.23
                ],
                [
                    1337032800000,
                    32.33
                ],
                [
                    1337119200000,
                    32.36
                ],
                [
                    1337205600000,
                    32.01
                ],
                [
                    1337292000000,
                    31.31
                ],
                [
                    1337551200000,
                    32.01
                ],
                [
                    1337637600000,
                    32.01
                ],
                [
                    1337724000000,
                    32.18
                ],
                [
                    1337810400000,
                    31.54
                ],
                [
                    1337896800000,
                    31.6
                ],
                [
                    1338242400000,
                    32.05
                ],
                [
                    1338328800000,
                    31.29
                ],
                [
                    1338415200000,
                    31.05
                ],
                [
                    1338501600000,
                    29.82
                ],
                [
                    1338760800000,
                    30.31
                ],
                [
                    1338847200000,
                    30.7
                ],
                [
                    1338933600000,
                    31.69
                ],
                [
                    1339020000000,
                    31.32
                ],
                [
                    1339106400000,
                    31.65
                ],
                [
                    1339365600000,
                    31.13
                ],
                [
                    1339452000000,
                    31.77
                ],
                [
                    1339538400000,
                    31.79
                ],
                [
                    1339624800000,
                    31.67
                ],
                [
                    1339711200000,
                    32.39
                ],
                [
                    1339970400000,
                    32.63
                ],
                [
                    1340056800000,
                    32.89
                ],
                [
                    1340143200000,
                    31.99
                ],
                [
                    1340229600000,
                    31.23
                ],
                [
                    1340316000000,
                    31.57
                ],
                [
                    1340575200000,
                    30.84
                ],
                [
                    1340661600000,
                    31.07
                ],
                [
                    1340748000000,
                    31.41
                ],
                [
                    1340834400000,
                    31.17
                ],
                [
                    1340920800000,
                    32.37
                ],
                [
                    1341180000000,
                    32.19
                ],
                [
                    1341266400000,
                    32.51
                ],
                [
                    1341439200000,
                    32.53
                ],
                [
                    1341525600000,
                    31.37
                ],
                [
                    1341784800000,
                    30.43
                ],
                [
                    1341871200000,
                    30.44
                ],
                [
                    1341957600000,
                    30.2
                ],
                [
                    1342044000000,
                    30.14
                ],
                [
                    1342130400000,
                    30.65
                ],
                [
                    1342389600000,
                    30.4
                ],
                [
                    1342476000000,
                    30.65
                ],
                [
                    1342562400000,
                    31.43
                ],
                [
                    1342648800000,
                    31.89
                ],
                [
                    1342735200000,
                    31.38
                ],
                [
                    1342994400000,
                    30.64
                ],
                [
                    1343080800000,
                    30.02
                ],
                [
                    1343167200000,
                    30.33
                ],
                [
                    1343253600000,
                    30.95
                ],
                [
                    1343340000000,
                    31.89
                ],
                [
                    1343599200000,
                    31.01
                ],
                [
                    1343685600000,
                    30.88
                ],
                [
                    1343772000000,
                    30.69
                ],
                [
                    1343858400000,
                    30.58
                ],
                [
                    1343944800000,
                    32.02
                ],
                [
                    1344204000000,
                    32.14
                ],
                [
                    1344290400000,
                    32.37
                ],
                [
                    1344376800000,
                    32.51
                ],
                [
                    1344463200000,
                    32.65
                ],
                [
                    1344549600000,
                    32.64
                ],
                [
                    1344808800000,
                    32.27
                ],
                [
                    1344895200000,
                    32.1
                ],
                [
                    1344981600000,
                    32.91
                ],
                [
                    1345068000000,
                    33.65
                ],
                [
                    1345154400000,
                    33.8
                ],
                [
                    1345413600000,
                    33.92
                ],
                [
                    1345500000000,
                    33.75
                ],
                [
                    1345586400000,
                    33.84
                ],
                [
                    1345672800000,
                    33.5
                ],
                [
                    1345759200000,
                    32.26
                ],
                [
                    1346018400000,
                    32.32
                ],
                [
                    1346104800000,
                    32.06
                ],
                [
                    1346191200000,
                    31.96
                ],
                [
                    1346277600000,
                    31.46
                ],
                [
                    1346364000000,
                    31.27
                ],
                [
                    1346709600000,
                    31.43
                ],
                [
                    1346796000000,
                    32.26
                ],
                [
                    1346882400000,
                    32.79
                ],
                [
                    1346968800000,
                    32.46
                ],
                [
                    1347228000000,
                    32.13
                ],
                [
                    1347314400000,
                    32.43
                ],
                [
                    1347400800000,
                    32.42
                ],
                [
                    1347487200000,
                    32.81
                ],
                [
                    1347573600000,
                    33.34
                ],
                [
                    1347832800000,
                    33.41
                ],
                [
                    1347919200000,
                    32.57
                ],
                [
                    1348005600000,
                    33.12
                ],
                [
                    1348092000000,
                    34.53
                ],
                [
                    1348178400000,
                    33.83
                ],
                [
                    1348437600000,
                    33.41
                ],
                [
                    1348524000000,
                    32.9
                ],
                [
                    1348610400000,
                    32.53
                ],
                [
                    1348696800000,
                    32.8
                ],
                [
                    1348783200000,
                    32.44
                ],
                [
                    1349042400000,
                    32.62
                ],
                [
                    1349128800000,
                    32.57
                ],
                [
                    1349215200000,
                    32.6
                ],
                [
                    1349301600000,
                    32.68
                ],
                [
                    1349388000000,
                    32.47
                ],
                [
                    1349647200000,
                    32.23
                ],
                [
                    1349733600000,
                    31.68
                ],
                [
                    1349820000000,
                    31.51
                ],
                [
                    1349906400000,
                    31.78
                ],
                [
                    1349992800000,
                    31.94
                ],
                [
                    1350252000000,
                    32.33
                ],
                [
                    1350338400000,
                    33.24
                ],
                [
                    1350424800000,
                    33.44
                ],
                [
                    1350511200000,
                    33.48
                ],
                [
                    1350597600000,
                    33.24
                ],
                [
                    1350856800000,
                    33.49
                ],
                [
                    1350943200000,
                    33.31
                ],
                [
                    1351029600000,
                    33.36
                ],
                [
                    1351116000000,
                    33.4
                ],
                [
                    1351202400000,
                    34.01
                ],
                [
                    1351638000000,
                    34.02
                ],
                [
                    1351724400000,
                    34.36
                ],
                [
                    1351810800000,
                    34.39
                ],
                [
                    1352070000000,
                    34.24
                ],
                [
                    1352156400000,
                    34.39
                ],
                [
                    1352242800000,
                    33.47
                ],
                [
                    1352329200000,
                    32.98
                ],
                [
                    1352415600000,
                    32.9
                ],
                [
                    1352674800000,
                    32.7
                ],
                [
                    1352761200000,
                    32.54
                ],
                [
                    1352847600000,
                    32.23
                ],
                [
                    1352934000000,
                    32.64
                ],
                [
                    1353020400000,
                    32.65
                ],
                [
                    1353279600000,
                    32.92
                ],
                [
                    1353366000000,
                    32.64
                ],
                [
                    1353452400000,
                    32.84
                ],
                [
                    1353625200000,
                    33.4
                ],
                [
                    1353884400000,
                    33.3
                ],
                [
                    1353970800000,
                    33.18
                ],
                [
                    1354057200000,
                    33.88
                ],
                [
                    1354143600000,
                    34.09
                ],
                [
                    1354230000000,
                    34.61
                ],
                [
                    1354489200000,
                    34.7
                ],
                [
                    1354575600000,
                    35.3
                ],
                [
                    1354662000000,
                    35.4
                ],
                [
                    1354748400000,
                    35.14
                ],
                [
                    1354834800000,
                    35.48
                ],
                [
                    1355094000000,
                    35.75
                ],
                [
                    1355180400000,
                    35.54
                ],
                [
                    1355266800000,
                    35.96
                ],
                [
                    1355353200000,
                    35.53
                ],
                [
                    1355439600000,
                    37.56
                ],
                [
                    1355698800000,
                    37.42
                ],
                [
                    1355785200000,
                    37.49
                ],
                [
                    1355871600000,
                    38.09
                ],
                [
                    1355958000000,
                    37.87
                ],
                [
                    1356044400000,
                    37.71
                ],
                [
                    1356303600000,
                    37.53
                ],
                [
                    1356476400000,
                    37.55
                ],
                [
                    1356562800000,
                    37.3
                ],
                [
                    1356649200000,
                    36.9
                ],
                [
                    1356908400000,
                    37.68
                ],
                [
                    1357081200000,
                    38.34
                ],
                [
                    1357167600000,
                    37.75
                ],
                [
                    1357254000000,
                    38.13
                ],
                [
                    1357513200000,
                    37.94
                ],
                [
                    1357599600000,
                    38.14
                ],
                [
                    1357686000000,
                    38.66
                ],
                [
                    1357772400000,
                    38.62
                ],
                [
                    1357858800000,
                    38.09
                ],
                [
                    1358118000000,
                    38.16
                ],
                [
                    1358204400000,
                    38.15
                ],
                [
                    1358290800000,
                    37.88
                ],
                [
                    1358377200000,
                    37.73
                ],
                [
                    1358463600000,
                    37.98
                ],
                [
                    1358809200000,
                    37.95
                ],
                [
                    1358895600000,
                    38.25
                ],
                [
                    1358982000000,
                    38.1
                ],
                [
                    1359068400000,
                    38.32
                ],
                [
                    1359327600000,
                    38.24
                ],
                [
                    1359414000000,
                    38.52
                ],
                [
                    1359500400000,
                    37.94
                ],
                [
                    1359586800000,
                    37.83
                ],
                [
                    1359673200000,
                    38.34
                ],
                [
                    1359932400000,
                    38.1
                ],
                [
                    1360018800000,
                    38.51
                ],
                [
                    1360105200000,
                    38.4
                ],
                [
                    1360191600000,
                    38.07
                ],
                [
                    1360278000000,
                    39.12
                ],
                [
                    1360537200000,
                    38.64
                ],
                [
                    1360623600000,
                    38.89
                ],
                [
                    1360710000000,
                    38.81
                ],
                [
                    1360796400000,
                    38.61
                ],
                [
                    1360882800000,
                    38.63
                ],
                [
                    1361228400000,
                    38.99
                ],
                [
                    1361314800000,
                    38.77
                ],
                [
                    1361401200000,
                    38.34
                ],
                [
                    1361487600000,
                    38.55
                ],
                [
                    1361746800000,
                    38.11
                ],
                [
                    1361833200000,
                    38.59
                ],
                [
                    1361919600000,
                    39.6
                ]
            ]
        }
    ];
    const options = {
        annotations: {
            yaxis: [
                {
                    y: 30,
                    borderColor: "#999",
                    label: {
                        text: "Support",
                        style: {
                            color: "#ffffff",
                            background: "#00E396"
                        }
                    }
                }
            ],
            xaxis: [
                {
                    x: new Date("14 Nov 2012").getTime(),
                    borderColor: "#999",
                    label: {
                        text: "Rally",
                        style: {
                            color: "#ffffff",
                            background: "#775DD0"
                        }
                    }
                }
            ]
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 0
        },
        xaxis: {
            type: "datetime",
            min: new Date("01 Mar 2012").getTime(),
            tickAmount: 6,
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            labels: {
                show: true,
                style: {
                    colors: "#8695AA",
                    fontSize: "12px"
                }
            }
        },
        colors: [
            "#605DFF"
        ],
        tooltip: {
            x: {
                format: "dd MMM yyyy"
            }
        },
        grid: {
            show: true,
            borderColor: "#ECEEF2"
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9
            }
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    colors: "#64748B",
                    fontSize: "12px"
                }
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Datetime Area Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/Area/DatetimeAreaChart.tsx",
                            lineNumber: 399,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/DatetimeAreaChart.tsx",
                        lineNumber: 398,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/DatetimeAreaChart.tsx",
                    lineNumber: 397,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "area",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/DatetimeAreaChart.tsx",
                        lineNumber: 404,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/DatetimeAreaChart.tsx",
                    lineNumber: 402,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/Area/DatetimeAreaChart.tsx",
            lineNumber: 396,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
_s(DatetimeAreaChart, "yMcmCpKZo0kJL8LGuxfsfA0rzTY=");
_c1 = DatetimeAreaChart;
const __TURBOPACK__default__export__ = DatetimeAreaChart;
var _c, _c1;
__turbopack_context__.k.register(_c, "Chart");
__turbopack_context__.k.register(_c1, "DatetimeAreaChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Charts/Area/MissingNullValuesAreaChart.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.r("[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = Chart;
const MissingNullValuesAreaChart = ()=>{
    _s();
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MissingNullValuesAreaChart.useEffect": ()=>{
            setChartLoaded(true);
        }
    }["MissingNullValuesAreaChart.useEffect"], []);
    const series = [
        {
            name: "Network",
            data: [
                {
                    x: "Dec 23 2017",
                    y: null
                },
                {
                    x: "Dec 24 2017",
                    y: 44
                },
                {
                    x: "Dec 25 2017",
                    y: 31
                },
                {
                    x: "Dec 26 2017",
                    y: 38
                },
                {
                    x: "Dec 27 2017",
                    y: null
                },
                {
                    x: "Dec 28 2017",
                    y: 32
                },
                {
                    x: "Dec 29 2017",
                    y: 55
                },
                {
                    x: "Dec 30 2017",
                    y: 51
                },
                {
                    x: "Dec 31 2017",
                    y: 67
                },
                {
                    x: "Jan 01 2018",
                    y: 22
                },
                {
                    x: "Jan 02 2018",
                    y: 34
                },
                {
                    x: "Jan 03 2018",
                    y: null
                },
                {
                    x: "Jan 04 2018",
                    y: null
                },
                {
                    x: "Jan 05 2018",
                    y: 11
                },
                {
                    x: "Jan 06 2018",
                    y: 4
                },
                {
                    x: "Jan 07 2018",
                    y: 15
                },
                {
                    x: "Jan 08 2018",
                    y: null
                },
                {
                    x: "Jan 09 2018",
                    y: 9
                },
                {
                    x: "Jan 10 2018",
                    y: 34
                },
                {
                    x: "Jan 11 2018",
                    y: null
                },
                {
                    x: "Jan 12 2018",
                    y: null
                },
                {
                    x: "Jan 13 2018",
                    y: 13
                },
                {
                    x: "Jan 14 2018",
                    y: null
                }
            ]
        }
    ];
    const options = {
        chart: {
            animations: {
                enabled: false
            },
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: [
            "#605DFF"
        ],
        stroke: {
            curve: "straight"
        },
        fill: {
            opacity: 0.8,
            type: "pattern",
            pattern: {
                style: "horizontalLines",
                width: 5,
                height: 5,
                strokeWidth: 3
            }
        },
        markers: {
            size: 5,
            hover: {
                size: 9
            }
        },
        title: {
            text: "Network Monitoring",
            align: "left",
            offsetX: -9,
            style: {
                fontWeight: "500",
                fontSize: "14px",
                color: "#64748B"
            }
        },
        tooltip: {
            intersect: true,
            shared: false
        },
        theme: {
            palette: "palette1"
        },
        xaxis: {
            type: "datetime",
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            labels: {
                show: true,
                style: {
                    colors: "#8695AA",
                    fontSize: "12px"
                }
            }
        },
        yaxis: {
            title: {
                text: "Bytes Received",
                style: {
                    color: "#3A4252",
                    fontSize: "14px",
                    fontWeight: 500
                }
            },
            labels: {
                show: true,
                style: {
                    colors: "#64748B",
                    fontSize: "12px"
                }
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            }
        },
        grid: {
            show: true,
            borderColor: "#ECEEF2"
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Missing Null Values Area Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/Area/MissingNullValuesAreaChart.tsx",
                            lineNumber: 221,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/MissingNullValuesAreaChart.tsx",
                        lineNumber: 220,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/MissingNullValuesAreaChart.tsx",
                    lineNumber: 219,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "area",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/MissingNullValuesAreaChart.tsx",
                        lineNumber: 226,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/MissingNullValuesAreaChart.tsx",
                    lineNumber: 224,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/Area/MissingNullValuesAreaChart.tsx",
            lineNumber: 218,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
_s(MissingNullValuesAreaChart, "yMcmCpKZo0kJL8LGuxfsfA0rzTY=");
_c1 = MissingNullValuesAreaChart;
const __TURBOPACK__default__export__ = MissingNullValuesAreaChart;
var _c, _c1;
__turbopack_context__.k.register(_c, "Chart");
__turbopack_context__.k.register(_c1, "MissingNullValuesAreaChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Charts/Area/NegativeValuesAreaChart.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.r("[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = Chart;
const NegativeValuesAreaChart = ()=>{
    _s();
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NegativeValuesAreaChart.useEffect": ()=>{
            setChartLoaded(true);
        }
    }["NegativeValuesAreaChart.useEffect"], []);
    const series = [
        {
            name: "North",
            data: [
                {
                    x: 1996,
                    y: 322
                },
                {
                    x: 1997,
                    y: 324
                },
                {
                    x: 1998,
                    y: 329
                },
                {
                    x: 1999,
                    y: 342
                },
                {
                    x: 2000,
                    y: 348
                },
                {
                    x: 2001,
                    y: 334
                },
                {
                    x: 2002,
                    y: 325
                },
                {
                    x: 2003,
                    y: 316
                },
                {
                    x: 2004,
                    y: 318
                },
                {
                    x: 2005,
                    y: 330
                },
                {
                    x: 2006,
                    y: 355
                },
                {
                    x: 2007,
                    y: 366
                },
                {
                    x: 2008,
                    y: 337
                },
                {
                    x: 2009,
                    y: 352
                },
                {
                    x: 2010,
                    y: 377
                },
                {
                    x: 2011,
                    y: 383
                },
                {
                    x: 2012,
                    y: 344
                },
                {
                    x: 2013,
                    y: 366
                },
                {
                    x: 2014,
                    y: 389
                },
                {
                    x: 2015,
                    y: 334
                }
            ]
        },
        {
            name: "South",
            data: [
                {
                    x: 1996,
                    y: 162
                },
                {
                    x: 1997,
                    y: 90
                },
                {
                    x: 1998,
                    y: 50
                },
                {
                    x: 1999,
                    y: 77
                },
                {
                    x: 2000,
                    y: 35
                },
                {
                    x: 2001,
                    y: -45
                },
                {
                    x: 2002,
                    y: -88
                },
                {
                    x: 2003,
                    y: -120
                },
                {
                    x: 2004,
                    y: -156
                },
                {
                    x: 2005,
                    y: -123
                },
                {
                    x: 2006,
                    y: -88
                },
                {
                    x: 2007,
                    y: -66
                },
                {
                    x: 2008,
                    y: -45
                },
                {
                    x: 2009,
                    y: -29
                },
                {
                    x: 2010,
                    y: -45
                },
                {
                    x: 2011,
                    y: -88
                },
                {
                    x: 2012,
                    y: -132
                },
                {
                    x: 2013,
                    y: -146
                },
                {
                    x: 2014,
                    y: -169
                },
                {
                    x: 2015,
                    y: -184
                }
            ]
        }
    ];
    const options = {
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: "straight"
        },
        title: {
            text: "Area with Negative Values",
            align: "left",
            offsetX: -9,
            offsetY: 0,
            style: {
                fontWeight: "500",
                fontSize: "14px",
                color: "#64748B"
            }
        },
        colors: [
            "#00cae3",
            "#605DFF"
        ],
        xaxis: {
            type: "datetime",
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            labels: {
                show: true,
                style: {
                    colors: "#8695AA",
                    fontSize: "12px"
                }
            }
        },
        yaxis: {
            tickAmount: 4,
            floating: false,
            labels: {
                show: true,
                style: {
                    colors: "#64748B",
                    fontSize: "12px"
                }
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            }
        },
        fill: {
            opacity: 0.5
        },
        tooltip: {
            x: {
                format: "yyyy"
            },
            fixed: {
                enabled: false,
                position: "topRight"
            }
        },
        grid: {
            yaxis: {
                lines: {
                    offsetX: -30
                }
            },
            padding: {
                left: 20
            },
            show: true,
            borderColor: "#ECEEF2"
        },
        legend: {
            show: true,
            position: "bottom",
            fontSize: "12px",
            horizontalAlign: "center",
            itemMargin: {
                horizontal: 8,
                vertical: 0
            },
            labels: {
                colors: "#64748B"
            },
            markers: {
                size: 6,
                offsetX: -2,
                offsetY: -0.5,
                shape: "circle"
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Negative Values Area Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/Area/NegativeValuesAreaChart.tsx",
                            lineNumber: 297,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/NegativeValuesAreaChart.tsx",
                        lineNumber: 296,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/NegativeValuesAreaChart.tsx",
                    lineNumber: 295,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "area",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/NegativeValuesAreaChart.tsx",
                        lineNumber: 302,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/NegativeValuesAreaChart.tsx",
                    lineNumber: 300,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/Area/NegativeValuesAreaChart.tsx",
            lineNumber: 294,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
_s(NegativeValuesAreaChart, "yMcmCpKZo0kJL8LGuxfsfA0rzTY=");
_c1 = NegativeValuesAreaChart;
const __TURBOPACK__default__export__ = NegativeValuesAreaChart;
var _c, _c1;
__turbopack_context__.k.register(_c, "Chart");
__turbopack_context__.k.register(_c1, "NegativeValuesAreaChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Charts/Area/SplineAreaChart.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.r("[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = Chart;
const SplineAreaChart = ()=>{
    _s();
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SplineAreaChart.useEffect": ()=>{
            setChartLoaded(true);
        }
    }["SplineAreaChart.useEffect"], []);
    const series = [
        {
            name: "Trezo",
            data: [
                31,
                40,
                28,
                51,
                42,
                109,
                100
            ]
        },
        {
            name: "Social",
            data: [
                11,
                32,
                45,
                32,
                34,
                52,
                41
            ]
        }
    ];
    const options = {
        chart: {
            toolbar: {
                show: true
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: "smooth"
        },
        colors: [
            "#605DFF",
            "#0f79f3"
        ],
        xaxis: {
            type: "datetime",
            categories: [
                "2018-09-19T00:00:00.000Z",
                "2018-09-19T01:30:00.000Z",
                "2018-09-19T02:30:00.000Z",
                "2018-09-19T03:30:00.000Z",
                "2018-09-19T04:30:00.000Z",
                "2018-09-19T05:30:00.000Z",
                "2018-09-19T06:30:00.000Z"
            ],
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            labels: {
                show: true,
                style: {
                    colors: "#8695AA",
                    fontSize: "12px"
                }
            }
        },
        tooltip: {
            x: {
                format: "dd/MM/yy HH:mm"
            }
        },
        yaxis: {
            tickAmount: 5,
            max: 110,
            min: 0,
            labels: {
                show: true,
                style: {
                    colors: "#64748B",
                    fontSize: "12px"
                }
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            }
        },
        legend: {
            show: true,
            position: "top",
            fontSize: "12px",
            horizontalAlign: "left",
            itemMargin: {
                horizontal: 8,
                vertical: 0
            },
            labels: {
                colors: "#64748B"
            },
            markers: {
                size: 6,
                offsetX: -2,
                offsetY: -0.5,
                shape: "circle"
            }
        },
        grid: {
            show: true,
            borderColor: "#ECEEF2"
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Spline Area Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/Area/SplineAreaChart.tsx",
                            lineNumber: 124,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/SplineAreaChart.tsx",
                        lineNumber: 123,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/SplineAreaChart.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "area",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/SplineAreaChart.tsx",
                        lineNumber: 129,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/SplineAreaChart.tsx",
                    lineNumber: 127,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/Area/SplineAreaChart.tsx",
            lineNumber: 121,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
_s(SplineAreaChart, "yMcmCpKZo0kJL8LGuxfsfA0rzTY=");
_c1 = SplineAreaChart;
const __TURBOPACK__default__export__ = SplineAreaChart;
var _c, _c1;
__turbopack_context__.k.register(_c, "Chart");
__turbopack_context__.k.register(_c1, "SplineAreaChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Charts/Area/StackedAreaChart.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.r("[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = Chart;
const StackedAreaChart = ()=>{
    _s();
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StackedAreaChart.useEffect": ()=>{
            setChartLoaded(true);
        }
    }["StackedAreaChart.useEffect"], []);
    const series = [
        {
            name: "South",
            data: [
                10,
                36,
                47,
                23,
                29,
                59,
                36,
                37,
                23,
                15
            ]
        },
        {
            name: "North",
            data: [
                15,
                19,
                18,
                10,
                15,
                19,
                15,
                15,
                14,
                12
            ]
        },
        {
            name: "Central",
            data: [
                12,
                11,
                12,
                13,
                12,
                13,
                12,
                12,
                11,
                11
            ]
        }
    ];
    const options = {
        chart: {
            stacked: true,
            events: {
                selection: function(chart, e) {
                    console.log(new Date(e.xaxis.min));
                }
            },
            toolbar: {
                show: true
            }
        },
        colors: [
            "#605DFF",
            "#0f79f3",
            "#00cae3"
        ],
        dataLabels: {
            enabled: false
        },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.6,
                opacityTo: 0.8
            }
        },
        legend: {
            show: true,
            position: "top",
            fontSize: "12px",
            horizontalAlign: "left",
            itemMargin: {
                horizontal: 8,
                vertical: 0
            },
            labels: {
                colors: "#64748B"
            },
            markers: {
                size: 6,
                offsetX: -2,
                offsetY: -0.5,
                shape: "circle"
            }
        },
        xaxis: {
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            labels: {
                show: true,
                style: {
                    colors: "#8695AA",
                    fontSize: "12px"
                }
            },
            categories: [
                "11 Feb",
                "12 Feb",
                "13 Feb",
                "14 Feb",
                "15 Feb",
                "16 Feb",
                "17 Feb",
                "18 Feb",
                "19 Feb",
                "20 Feb"
            ]
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    colors: "#64748B",
                    fontSize: "12px"
                }
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            },
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            }
        },
        grid: {
            borderColor: "#ECEEF2"
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Stacked Area Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/Area/StackedAreaChart.tsx",
                            lineNumber: 131,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/StackedAreaChart.tsx",
                        lineNumber: 130,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/StackedAreaChart.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "area",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/Area/StackedAreaChart.tsx",
                        lineNumber: 136,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/Area/StackedAreaChart.tsx",
                    lineNumber: 134,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/Area/StackedAreaChart.tsx",
            lineNumber: 128,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
_s(StackedAreaChart, "yMcmCpKZo0kJL8LGuxfsfA0rzTY=");
_c1 = StackedAreaChart;
const __TURBOPACK__default__export__ = StackedAreaChart;
var _c, _c1;
__turbopack_context__.k.register(_c, "Chart");
__turbopack_context__.k.register(_c1, "StackedAreaChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-bailout-to-csr.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BailoutToCSR", {
    enumerable: true,
    get: function() {
        return BailoutToCSR;
    }
});
const _bailouttocsr = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/bailout-to-csr.js [app-client] (ecmascript)");
function BailoutToCSR(param) {
    let { reason, children } = param;
    if (typeof window === 'undefined') {
        throw Object.defineProperty(new _bailouttocsr.BailoutToCSRError(reason), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
    }
    return children;
} //# sourceMappingURL=dynamic-bailout-to-csr.js.map
}}),
"[project]/node_modules/next/dist/shared/lib/encode-uri-path.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "encodeURIPath", {
    enumerable: true,
    get: function() {
        return encodeURIPath;
    }
});
function encodeURIPath(file) {
    return file.split('/').map((p)=>encodeURIComponent(p)).join('/');
} //# sourceMappingURL=encode-uri-path.js.map
}}),
"[project]/node_modules/next/dist/shared/lib/lazy-dynamic/preload-chunks.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PreloadChunks", {
    enumerable: true,
    get: function() {
        return PreloadChunks;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const _reactdom = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
const _workasyncstorageexternal = __turbopack_context__.r("[project]/node_modules/next/dist/server/app-render/work-async-storage.external.js [app-client] (ecmascript)");
const _encodeuripath = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/encode-uri-path.js [app-client] (ecmascript)");
function PreloadChunks(param) {
    let { moduleIds } = param;
    // Early return in client compilation and only load requestStore on server side
    if (typeof window !== 'undefined') {
        return null;
    }
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    if (workStore === undefined) {
        return null;
    }
    const allFiles = [];
    // Search the current dynamic call unique key id in react loadable manifest,
    // and find the corresponding CSS files to preload
    if (workStore.reactLoadableManifest && moduleIds) {
        const manifest = workStore.reactLoadableManifest;
        for (const key of moduleIds){
            if (!manifest[key]) continue;
            const chunks = manifest[key].files;
            allFiles.push(...chunks);
        }
    }
    if (allFiles.length === 0) {
        return null;
    }
    const dplId = ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : '';
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
        children: allFiles.map((chunk)=>{
            const href = workStore.assetPrefix + "/_next/" + (0, _encodeuripath.encodeURIPath)(chunk) + dplId;
            const isCss = chunk.endsWith('.css');
            // If it's stylesheet we use `precedence` o help hoist with React Float.
            // For stylesheets we actually need to render the CSS because nothing else is going to do it so it needs to be part of the component tree.
            // The `preload` for stylesheet is not optional.
            if (isCss) {
                return /*#__PURE__*/ (0, _jsxruntime.jsx)("link", {
                    // @ts-ignore
                    precedence: "dynamic",
                    href: href,
                    rel: "stylesheet",
                    as: "style"
                }, chunk);
            } else {
                // If it's script we use ReactDOM.preload to preload the resources
                (0, _reactdom.preload)(href, {
                    as: 'script',
                    fetchPriority: 'low'
                });
                return null;
            }
        })
    });
} //# sourceMappingURL=preload-chunks.js.map
}}),
"[project]/node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const _react = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
const _dynamicbailouttocsr = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-bailout-to-csr.js [app-client] (ecmascript)");
const _preloadchunks = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/preload-chunks.js [app-client] (ecmascript)");
// Normalize loader to return the module as form { default: Component } for `React.lazy`.
// Also for backward compatible since next/dynamic allows to resolve a component directly with loader
// Client component reference proxy need to be converted to a module.
function convertModule(mod) {
    // Check "default" prop before accessing it, as it could be client reference proxy that could break it reference.
    // Cases:
    // mod: { default: Component }
    // mod: Component
    // mod: { default: proxy(Component) }
    // mod: proxy(Component)
    const hasDefault = mod && 'default' in mod;
    return {
        default: hasDefault ? mod.default : mod
    };
}
const defaultOptions = {
    loader: ()=>Promise.resolve(convertModule(()=>null)),
    loading: null,
    ssr: true
};
function Loadable(options) {
    const opts = {
        ...defaultOptions,
        ...options
    };
    const Lazy = /*#__PURE__*/ (0, _react.lazy)(()=>opts.loader().then(convertModule));
    const Loading = opts.loading;
    function LoadableComponent(props) {
        const fallbackElement = Loading ? /*#__PURE__*/ (0, _jsxruntime.jsx)(Loading, {
            isLoading: true,
            pastDelay: true,
            error: null
        }) : null;
        // If it's non-SSR or provided a loading component, wrap it in a suspense boundary
        const hasSuspenseBoundary = !opts.ssr || !!opts.loading;
        const Wrap = hasSuspenseBoundary ? _react.Suspense : _react.Fragment;
        const wrapProps = hasSuspenseBoundary ? {
            fallback: fallbackElement
        } : {};
        const children = opts.ssr ? /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
            children: [
                typeof window === 'undefined' ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_preloadchunks.PreloadChunks, {
                    moduleIds: opts.modules
                }) : null,
                /*#__PURE__*/ (0, _jsxruntime.jsx)(Lazy, {
                    ...props
                })
            ]
        }) : /*#__PURE__*/ (0, _jsxruntime.jsx)(_dynamicbailouttocsr.BailoutToCSR, {
            reason: "next/dynamic",
            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(Lazy, {
                ...props
            })
        });
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(Wrap, {
            ...wrapProps,
            children: children
        });
    }
    LoadableComponent.displayName = 'LoadableComponent';
    return LoadableComponent;
}
const _default = Loadable; //# sourceMappingURL=loadable.js.map
}}),
"[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return dynamic;
    }
});
const _interop_require_default = __turbopack_context__.r("[project]/node_modules/next/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [app-client] (ecmascript)");
const _loadable = /*#__PURE__*/ _interop_require_default._(__turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js [app-client] (ecmascript)"));
function dynamic(dynamicOptions, options) {
    var _mergedOptions_loadableGenerated;
    const loadableOptions = {};
    if (typeof dynamicOptions === 'function') {
        loadableOptions.loader = dynamicOptions;
    }
    const mergedOptions = {
        ...loadableOptions,
        ...options
    };
    return (0, _loadable.default)({
        ...mergedOptions,
        modules: (_mergedOptions_loadableGenerated = mergedOptions.loadableGenerated) == null ? void 0 : _mergedOptions_loadableGenerated.modules
    });
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=app-dynamic.js.map
}}),
}]);

//# sourceMappingURL=_438d2af2._.js.map