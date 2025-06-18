module.exports = {

"[project]/src/components/Charts/More/BasicBoxplotChart.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
"use client";
;
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const BasicBoxplotChart = ()=>{
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setChartLoaded(true);
    }, []);
    const series = [
        {
            name: "Box",
            type: "boxPlot",
            data: [
                {
                    x: new Date("2017-01-01").getTime(),
                    y: [
                        54,
                        66,
                        69,
                        75,
                        88
                    ]
                },
                {
                    x: new Date("2018-01-01").getTime(),
                    y: [
                        43,
                        65,
                        69,
                        76,
                        81
                    ]
                },
                {
                    x: new Date("2019-01-01").getTime(),
                    y: [
                        31,
                        39,
                        45,
                        51,
                        59
                    ]
                },
                {
                    x: new Date("2020-01-01").getTime(),
                    y: [
                        39,
                        46,
                        55,
                        65,
                        71
                    ]
                },
                {
                    x: new Date("2021-01-01").getTime(),
                    y: [
                        29,
                        31,
                        35,
                        39,
                        44
                    ]
                }
            ]
        },
        {
            name: "Outliers",
            type: "scatter",
            data: [
                {
                    x: new Date("2017-01-01").getTime(),
                    y: 32
                },
                {
                    x: new Date("2018-01-01").getTime(),
                    y: 25
                },
                {
                    x: new Date("2019-01-01").getTime(),
                    y: 64
                },
                {
                    x: new Date("2020-01-01").getTime(),
                    y: 27
                },
                {
                    x: new Date("2020-01-01").getTime(),
                    y: 78
                },
                {
                    x: new Date("2021-01-01").getTime(),
                    y: 15
                }
            ]
        }
    ];
    const options = {
        chart: {
            toolbar: {
                show: true
            }
        },
        colors: [
            "#605DFF",
            "#3584FC"
        ],
        title: {
            text: "BoxPlot - Scatter Chart",
            align: "left",
            offsetX: -9,
            style: {
                fontWeight: "500",
                fontSize: "14px",
                color: "#64748B"
            }
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
        tooltip: {
            shared: false,
            intersect: true
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
            show: true,
            borderColor: "#ECEEF2"
        },
        legend: {
            show: true,
            position: "top",
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Basic Boxplot Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/More/BasicBoxplotChart.tsx",
                            lineNumber: 163,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicBoxplotChart.tsx",
                        lineNumber: 162,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicBoxplotChart.tsx",
                    lineNumber: 161,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "boxPlot",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicBoxplotChart.tsx",
                        lineNumber: 168,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicBoxplotChart.tsx",
                    lineNumber: 166,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/More/BasicBoxplotChart.tsx",
            lineNumber: 160,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
const __TURBOPACK__default__export__ = BasicBoxplotChart;
}}),
"[project]/src/components/Charts/More/BasicBubbleChart.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
"use client";
;
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const BasicBubbleChart = ()=>{
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setChartLoaded(true);
    }, []);
    function generateData(baseval, count, yrange) {
        const series = [];
        for(let i = 0; i < count; i++){
            const x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;
            const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
            const z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;
            series.push({
                x,
                y,
                z
            });
            baseval += 86400000;
        }
        return series;
    }
    const series = [
        {
            name: "Bubble 1",
            data: generateData(new Date("11 Feb 2017 GMT").getTime(), 20, {
                min: 10,
                max: 60
            })
        },
        {
            name: "Bubble 2",
            data: generateData(new Date("11 Feb 2017 GMT").getTime(), 20, {
                min: 10,
                max: 60
            })
        },
        {
            name: "Bubble 3",
            data: generateData(new Date("11 Feb 2017 GMT").getTime(), 20, {
                min: 10,
                max: 60
            })
        },
        {
            name: "Bubble 4",
            data: generateData(new Date("11 Feb 2017 GMT").getTime(), 20, {
                min: 10,
                max: 60
            })
        }
    ];
    const options = {
        chart: {
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        fill: {
            opacity: 0.8
        },
        title: {
            text: undefined
        },
        xaxis: {
            tickAmount: 12,
            type: "category",
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
            max: 70,
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
        },
        legend: {
            show: true,
            position: "top",
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Basic Bubble Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/More/BasicBubbleChart.tsx",
                            lineNumber: 159,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicBubbleChart.tsx",
                        lineNumber: 158,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicBubbleChart.tsx",
                    lineNumber: 157,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "bubble",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicBubbleChart.tsx",
                        lineNumber: 164,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicBubbleChart.tsx",
                    lineNumber: 162,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/More/BasicBubbleChart.tsx",
            lineNumber: 156,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
const __TURBOPACK__default__export__ = BasicBubbleChart;
}}),
"[project]/src/components/Charts/More/BasicCandlestickChart.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
"use client";
;
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const BasicCandlestickChart = ()=>{
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setChartLoaded(true);
    }, []);
    const series = [
        {
            name: "candle",
            data: [
                {
                    x: new Date(1538778600000),
                    y: [
                        6629.81,
                        6650.5,
                        6623.04,
                        6633.33
                    ]
                },
                {
                    x: new Date(1538780400000),
                    y: [
                        6632.01,
                        6643.59,
                        6620,
                        6630.11
                    ]
                },
                {
                    x: new Date(1538782200000),
                    y: [
                        6630.71,
                        6648.95,
                        6623.34,
                        6635.65
                    ]
                },
                {
                    x: new Date(1538784000000),
                    y: [
                        6635.65,
                        6651,
                        6629.67,
                        6638.24
                    ]
                },
                {
                    x: new Date(1538785800000),
                    y: [
                        6638.24,
                        6640,
                        6620,
                        6624.47
                    ]
                },
                {
                    x: new Date(1538787600000),
                    y: [
                        6624.53,
                        6636.03,
                        6621.68,
                        6624.31
                    ]
                },
                {
                    x: new Date(1538789400000),
                    y: [
                        6624.61,
                        6632.2,
                        6617,
                        6626.02
                    ]
                },
                {
                    x: new Date(1538791200000),
                    y: [
                        6627,
                        6627.62,
                        6584.22,
                        6603.02
                    ]
                },
                {
                    x: new Date(1538793000000),
                    y: [
                        6605,
                        6608.03,
                        6598.95,
                        6604.01
                    ]
                },
                {
                    x: new Date(1538794800000),
                    y: [
                        6604.5,
                        6614.4,
                        6602.26,
                        6608.02
                    ]
                },
                {
                    x: new Date(1538796600000),
                    y: [
                        6608.02,
                        6610.68,
                        6601.99,
                        6608.91
                    ]
                },
                {
                    x: new Date(1538798400000),
                    y: [
                        6608.91,
                        6618.99,
                        6608.01,
                        6612
                    ]
                },
                {
                    x: new Date(1538800200000),
                    y: [
                        6612,
                        6615.13,
                        6605.09,
                        6612
                    ]
                },
                {
                    x: new Date(1538802000000),
                    y: [
                        6612,
                        6624.12,
                        6608.43,
                        6622.95
                    ]
                },
                {
                    x: new Date(1538803800000),
                    y: [
                        6623.91,
                        6623.91,
                        6615,
                        6615.67
                    ]
                },
                {
                    x: new Date(1538805600000),
                    y: [
                        6618.69,
                        6618.74,
                        6610,
                        6610.4
                    ]
                },
                {
                    x: new Date(1538807400000),
                    y: [
                        6611,
                        6622.78,
                        6610.4,
                        6614.9
                    ]
                },
                {
                    x: new Date(1538809200000),
                    y: [
                        6614.9,
                        6626.2,
                        6613.33,
                        6623.45
                    ]
                },
                {
                    x: new Date(1538811000000),
                    y: [
                        6623.48,
                        6627,
                        6618.38,
                        6620.35
                    ]
                },
                {
                    x: new Date(1538812800000),
                    y: [
                        6619.43,
                        6620.35,
                        6610.05,
                        6615.53
                    ]
                },
                {
                    x: new Date(1538814600000),
                    y: [
                        6615.53,
                        6617.93,
                        6610,
                        6615.19
                    ]
                },
                {
                    x: new Date(1538816400000),
                    y: [
                        6615.19,
                        6621.6,
                        6608.2,
                        6620
                    ]
                },
                {
                    x: new Date(1538818200000),
                    y: [
                        6619.54,
                        6625.17,
                        6614.15,
                        6620
                    ]
                },
                {
                    x: new Date(1538820000000),
                    y: [
                        6620.33,
                        6634.15,
                        6617.24,
                        6624.61
                    ]
                },
                {
                    x: new Date(1538821800000),
                    y: [
                        6625.95,
                        6626,
                        6611.66,
                        6617.58
                    ]
                },
                {
                    x: new Date(1538823600000),
                    y: [
                        6619,
                        6625.97,
                        6595.27,
                        6598.86
                    ]
                },
                {
                    x: new Date(1538825400000),
                    y: [
                        6598.86,
                        6598.88,
                        6570,
                        6587.16
                    ]
                },
                {
                    x: new Date(1538827200000),
                    y: [
                        6588.86,
                        6600,
                        6580,
                        6593.4
                    ]
                },
                {
                    x: new Date(1538829000000),
                    y: [
                        6593.99,
                        6598.89,
                        6585,
                        6587.81
                    ]
                },
                {
                    x: new Date(1538830800000),
                    y: [
                        6587.81,
                        6592.73,
                        6567.14,
                        6578
                    ]
                },
                {
                    x: new Date(1538832600000),
                    y: [
                        6578.35,
                        6581.72,
                        6567.39,
                        6579
                    ]
                },
                {
                    x: new Date(1538834400000),
                    y: [
                        6579.38,
                        6580.92,
                        6566.77,
                        6575.96
                    ]
                },
                {
                    x: new Date(1538836200000),
                    y: [
                        6575.96,
                        6589,
                        6571.77,
                        6588.92
                    ]
                },
                {
                    x: new Date(1538838000000),
                    y: [
                        6588.92,
                        6594,
                        6577.55,
                        6589.22
                    ]
                },
                {
                    x: new Date(1538839800000),
                    y: [
                        6589.3,
                        6598.89,
                        6589.1,
                        6596.08
                    ]
                },
                {
                    x: new Date(1538841600000),
                    y: [
                        6597.5,
                        6600,
                        6588.39,
                        6596.25
                    ]
                },
                {
                    x: new Date(1538843400000),
                    y: [
                        6598.03,
                        6600,
                        6588.73,
                        6595.97
                    ]
                },
                {
                    x: new Date(1538845200000),
                    y: [
                        6595.97,
                        6602.01,
                        6588.17,
                        6602
                    ]
                },
                {
                    x: new Date(1538847000000),
                    y: [
                        6602,
                        6607,
                        6596.51,
                        6599.95
                    ]
                },
                {
                    x: new Date(1538848800000),
                    y: [
                        6600.63,
                        6601.21,
                        6590.39,
                        6591.02
                    ]
                },
                {
                    x: new Date(1538850600000),
                    y: [
                        6591.02,
                        6603.08,
                        6591,
                        6591
                    ]
                },
                {
                    x: new Date(1538852400000),
                    y: [
                        6591,
                        6601.32,
                        6585,
                        6592
                    ]
                },
                {
                    x: new Date(1538854200000),
                    y: [
                        6593.13,
                        6596.01,
                        6590,
                        6593.34
                    ]
                },
                {
                    x: new Date(1538856000000),
                    y: [
                        6593.34,
                        6604.76,
                        6582.63,
                        6593.86
                    ]
                },
                {
                    x: new Date(1538857800000),
                    y: [
                        6593.86,
                        6604.28,
                        6586.57,
                        6600.01
                    ]
                },
                {
                    x: new Date(1538859600000),
                    y: [
                        6601.81,
                        6603.21,
                        6592.78,
                        6596.25
                    ]
                },
                {
                    x: new Date(1538861400000),
                    y: [
                        6596.25,
                        6604.2,
                        6590,
                        6602.99
                    ]
                },
                {
                    x: new Date(1538863200000),
                    y: [
                        6602.99,
                        6606,
                        6584.99,
                        6587.81
                    ]
                },
                {
                    x: new Date(1538865000000),
                    y: [
                        6587.81,
                        6595,
                        6583.27,
                        6591.96
                    ]
                },
                {
                    x: new Date(1538866800000),
                    y: [
                        6591.97,
                        6596.07,
                        6585,
                        6588.39
                    ]
                },
                {
                    x: new Date(1538868600000),
                    y: [
                        6587.6,
                        6598.21,
                        6587.6,
                        6594.27
                    ]
                },
                {
                    x: new Date(1538870400000),
                    y: [
                        6596.44,
                        6601,
                        6590,
                        6596.55
                    ]
                },
                {
                    x: new Date(1538872200000),
                    y: [
                        6598.91,
                        6605,
                        6596.61,
                        6600.02
                    ]
                },
                {
                    x: new Date(1538874000000),
                    y: [
                        6600.55,
                        6605,
                        6589.14,
                        6593.01
                    ]
                },
                {
                    x: new Date(1538875800000),
                    y: [
                        6593.15,
                        6605,
                        6592,
                        6603.06
                    ]
                },
                {
                    x: new Date(1538877600000),
                    y: [
                        6603.07,
                        6604.5,
                        6599.09,
                        6603.89
                    ]
                },
                {
                    x: new Date(1538879400000),
                    y: [
                        6604.44,
                        6604.44,
                        6600,
                        6603.5
                    ]
                },
                {
                    x: new Date(1538881200000),
                    y: [
                        6603.5,
                        6603.99,
                        6597.5,
                        6603.86
                    ]
                },
                {
                    x: new Date(1538883000000),
                    y: [
                        6603.85,
                        6605,
                        6600,
                        6604.07
                    ]
                },
                {
                    x: new Date(1538884800000),
                    y: [
                        6604.98,
                        6606,
                        6604.07,
                        6606
                    ]
                }
            ]
        }
    ];
    const options = {
        chart: {
            toolbar: {
                show: true
            }
        },
        title: {
            text: "CandleStick Chart",
            align: "left",
            offsetX: -9,
            style: {
                fontWeight: "500",
                fontSize: "14px",
                color: "#64748B"
            }
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
            tooltip: {
                enabled: true
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Basic Candlestick Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/More/BasicCandlestickChart.tsx",
                            lineNumber: 331,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicCandlestickChart.tsx",
                        lineNumber: 330,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicCandlestickChart.tsx",
                    lineNumber: 329,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "candlestick",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicCandlestickChart.tsx",
                        lineNumber: 336,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicCandlestickChart.tsx",
                    lineNumber: 334,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/More/BasicCandlestickChart.tsx",
            lineNumber: 328,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
const __TURBOPACK__default__export__ = BasicCandlestickChart;
}}),
"[project]/src/components/Charts/More/BasicHeatmapChart.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
"use client";
;
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const BasicHeatmapChart = ()=>{
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setChartLoaded(true);
    }, []);
    function generateData(count, yrange) {
        const series = [];
        for(let i = 0; i < count; i++){
            const x = "W" + (i + 1).toString();
            const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
            series.push({
                x,
                y
            });
        }
        return series;
    }
    const series = Array.from({
        length: 9
    }, (_, i)=>({
            name: `Metric ${i + 1}`,
            data: generateData(18, {
                min: 0,
                max: 90
            })
        }));
    const options = {
        chart: {
            toolbar: {
                show: true
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: [
            "#0f79f3"
        ],
        title: {
            text: "HeatMap Chart (Single color)",
            align: "left",
            offsetX: -9,
            style: {
                fontWeight: "500",
                fontSize: "14px",
                color: "#64748B"
            }
        },
        grid: {
            show: true,
            borderColor: "#ECEEF2"
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Basic Boxplot Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/More/BasicHeatmapChart.tsx",
                            lineNumber: 109,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicHeatmapChart.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicHeatmapChart.tsx",
                    lineNumber: 107,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "heatmap",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicHeatmapChart.tsx",
                        lineNumber: 114,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicHeatmapChart.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/More/BasicHeatmapChart.tsx",
            lineNumber: 106,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
const __TURBOPACK__default__export__ = BasicHeatmapChart;
}}),
"[project]/src/components/Charts/More/BasicRangeAreaChart.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
"use client";
;
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const BasicRangeAreaChart = ()=>{
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setChartLoaded(true);
    }, []);
    const series = [
        {
            name: "New York Temperature",
            data: [
                {
                    x: "Jan",
                    y: [
                        -2,
                        4
                    ]
                },
                {
                    x: "Feb",
                    y: [
                        -1,
                        6
                    ]
                },
                {
                    x: "Mar",
                    y: [
                        3,
                        10
                    ]
                },
                {
                    x: "Apr",
                    y: [
                        8,
                        16
                    ]
                },
                {
                    x: "May",
                    y: [
                        13,
                        22
                    ]
                },
                {
                    x: "Jun",
                    y: [
                        18,
                        26
                    ]
                },
                {
                    x: "Jul",
                    y: [
                        21,
                        29
                    ]
                },
                {
                    x: "Aug",
                    y: [
                        21,
                        28
                    ]
                },
                {
                    x: "Sep",
                    y: [
                        17,
                        24
                    ]
                },
                {
                    x: "Oct",
                    y: [
                        11,
                        18
                    ]
                },
                {
                    x: "Nov",
                    y: [
                        6,
                        12
                    ]
                },
                {
                    x: "Dec",
                    y: [
                        1,
                        7
                    ]
                }
            ]
        }
    ];
    const options = {
        chart: {
            toolbar: {
                show: true
            }
        },
        stroke: {
            curve: "straight"
        },
        title: {
            text: "New York Temperature (all year round)",
            align: "left",
            offsetX: -9,
            style: {
                fontWeight: "500",
                fontSize: "14px",
                color: "#64748B"
            }
        },
        colors: [
            "#605DFF"
        ],
        markers: {
            hover: {
                sizeOffset: 5
            }
        },
        dataLabels: {
            enabled: false
        },
        yaxis: {
            labels: {
                show: true,
                formatter: (val)=>{
                    return val + "°C";
                },
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
            }
        },
        grid: {
            show: true,
            borderColor: "#ECEEF2"
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Basic Range Area Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/More/BasicRangeAreaChart.tsx",
                            lineNumber: 150,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicRangeAreaChart.tsx",
                        lineNumber: 149,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicRangeAreaChart.tsx",
                    lineNumber: 148,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "rangeArea",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicRangeAreaChart.tsx",
                        lineNumber: 155,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicRangeAreaChart.tsx",
                    lineNumber: 153,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/More/BasicRangeAreaChart.tsx",
            lineNumber: 147,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
const __TURBOPACK__default__export__ = BasicRangeAreaChart;
}}),
"[project]/src/components/Charts/More/BasicScatterChart.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
"use client";
;
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const BasicScatterChart = ()=>{
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setChartLoaded(true);
    }, []);
    const series = [
        {
            name: "Sample A",
            data: [
                [
                    16.4,
                    5.4
                ],
                [
                    21.7,
                    2
                ],
                [
                    25.4,
                    3
                ],
                [
                    19,
                    2
                ],
                [
                    10.9,
                    1
                ],
                [
                    13.6,
                    3.2
                ],
                [
                    10.9,
                    7.4
                ],
                [
                    10.9,
                    0
                ],
                [
                    10.9,
                    8.2
                ],
                [
                    16.4,
                    0
                ],
                [
                    16.4,
                    1.8
                ],
                [
                    13.6,
                    0.3
                ],
                [
                    13.6,
                    0
                ],
                [
                    29.9,
                    0
                ],
                [
                    27.1,
                    2.3
                ],
                [
                    16.4,
                    0
                ],
                [
                    13.6,
                    3.7
                ],
                [
                    10.9,
                    5.2
                ],
                [
                    16.4,
                    6.5
                ],
                [
                    10.9,
                    0
                ],
                [
                    24.5,
                    7.1
                ],
                [
                    10.9,
                    0
                ],
                [
                    8.1,
                    4.7
                ],
                [
                    19,
                    0
                ],
                [
                    21.7,
                    1.8
                ],
                [
                    27.1,
                    0
                ],
                [
                    24.5,
                    0
                ],
                [
                    27.1,
                    0
                ],
                [
                    29.9,
                    1.5
                ],
                [
                    27.1,
                    0.8
                ],
                [
                    22.1,
                    2
                ]
            ]
        },
        {
            name: "Sample B",
            data: [
                [
                    36.4,
                    13.4
                ],
                [
                    1.7,
                    11
                ],
                [
                    5.4,
                    8
                ],
                [
                    9,
                    17
                ],
                [
                    1.9,
                    4
                ],
                [
                    3.6,
                    12.2
                ],
                [
                    1.9,
                    14.4
                ],
                [
                    1.9,
                    9
                ],
                [
                    1.9,
                    13.2
                ],
                [
                    1.4,
                    7
                ],
                [
                    6.4,
                    8.8
                ],
                [
                    3.6,
                    4.3
                ],
                [
                    1.6,
                    10
                ],
                [
                    9.9,
                    2
                ],
                [
                    7.1,
                    15
                ],
                [
                    1.4,
                    0
                ],
                [
                    3.6,
                    13.7
                ],
                [
                    1.9,
                    15.2
                ],
                [
                    6.4,
                    16.5
                ],
                [
                    0.9,
                    10
                ],
                [
                    4.5,
                    17.1
                ],
                [
                    10.9,
                    10
                ],
                [
                    0.1,
                    14.7
                ],
                [
                    9,
                    10
                ],
                [
                    12.7,
                    11.8
                ],
                [
                    2.1,
                    10
                ],
                [
                    2.5,
                    10
                ],
                [
                    27.1,
                    10
                ],
                [
                    2.9,
                    11.5
                ],
                [
                    7.1,
                    10.8
                ],
                [
                    2.1,
                    12
                ]
            ]
        },
        {
            name: "Sample C",
            data: [
                [
                    21.7,
                    3
                ],
                [
                    23.6,
                    3.5
                ],
                [
                    24.6,
                    3
                ],
                [
                    29.9,
                    3
                ],
                [
                    21.7,
                    20
                ],
                [
                    23,
                    2
                ],
                [
                    10.9,
                    3
                ],
                [
                    28,
                    4
                ],
                [
                    27.1,
                    0.3
                ],
                [
                    16.4,
                    4
                ],
                [
                    13.6,
                    0
                ],
                [
                    19,
                    5
                ],
                [
                    22.4,
                    3
                ],
                [
                    24.5,
                    3
                ],
                [
                    32.6,
                    3
                ],
                [
                    27.1,
                    4
                ],
                [
                    29.6,
                    6
                ],
                [
                    31.6,
                    8
                ],
                [
                    21.6,
                    5
                ],
                [
                    20.9,
                    4
                ],
                [
                    22.4,
                    0
                ],
                [
                    32.6,
                    10.3
                ],
                [
                    29.7,
                    20.8
                ],
                [
                    24.5,
                    0.8
                ],
                [
                    21.4,
                    0
                ],
                [
                    21.7,
                    6.9
                ],
                [
                    28.6,
                    7.7
                ],
                [
                    15.4,
                    0
                ],
                [
                    18.1,
                    0
                ],
                [
                    33.4,
                    0
                ],
                [
                    16.4,
                    0
                ]
            ]
        }
    ];
    const options = {
        chart: {
            zoom: {
                enabled: true,
                type: "xy"
            },
            toolbar: {
                show: false
            }
        },
        colors: [
            "#ffb264",
            "#e74c3c",
            "#00cae3"
        ],
        xaxis: {
            tickAmount: 10,
            labels: {
                formatter: function(val) {
                    return parseFloat(val).toFixed(1);
                },
                show: true,
                style: {
                    colors: "#8695AA",
                    fontSize: "12px"
                }
            },
            axisTicks: {
                show: false,
                color: "#ECEEF2"
            },
            axisBorder: {
                show: false,
                color: "#ECEEF2"
            }
        },
        yaxis: {
            tickAmount: 7,
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
        },
        legend: {
            show: true,
            position: "top",
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Basic Scatter Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/More/BasicScatterChart.tsx",
                            lineNumber: 209,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicScatterChart.tsx",
                        lineNumber: 208,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicScatterChart.tsx",
                    lineNumber: 207,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "scatter",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicScatterChart.tsx",
                        lineNumber: 214,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicScatterChart.tsx",
                    lineNumber: 212,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/More/BasicScatterChart.tsx",
            lineNumber: 206,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
const __TURBOPACK__default__export__ = BasicScatterChart;
}}),
"[project]/src/components/Charts/More/BasicTimelineChart.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
"use client";
;
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const BasicTimelineChart = ()=>{
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setChartLoaded(true);
    }, []);
    const series = [
        {
            data: [
                {
                    x: "Code",
                    y: [
                        new Date("2019-03-02").getTime(),
                        new Date("2019-03-04").getTime()
                    ]
                },
                {
                    x: "Test",
                    y: [
                        new Date("2019-03-04").getTime(),
                        new Date("2019-03-08").getTime()
                    ]
                },
                {
                    x: "Validation",
                    y: [
                        new Date("2019-03-08").getTime(),
                        new Date("2019-03-12").getTime()
                    ]
                },
                {
                    x: "Deployment",
                    y: [
                        new Date("2019-03-12").getTime(),
                        new Date("2019-03-18").getTime()
                    ]
                }
            ]
        }
    ];
    const options = {
        chart: {
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: true
            }
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
        },
        colors: [
            "#605DFF"
        ]
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Basic Range Area Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/More/BasicTimelineChart.tsx",
                            lineNumber: 111,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicTimelineChart.tsx",
                        lineNumber: 110,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicTimelineChart.tsx",
                    lineNumber: 109,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "rangeBar",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicTimelineChart.tsx",
                        lineNumber: 116,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicTimelineChart.tsx",
                    lineNumber: 114,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/More/BasicTimelineChart.tsx",
            lineNumber: 108,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
const __TURBOPACK__default__export__ = BasicTimelineChart;
}}),
"[project]/src/components/Charts/More/BasicTreemapChart.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
"use client";
;
;
;
// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const BasicTreemapChart = ()=>{
    // Chart
    const [isChartLoaded, setChartLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setChartLoaded(true);
    }, []);
    const series = [
        {
            data: [
                {
                    x: "London",
                    y: 218
                },
                {
                    x: "New York",
                    y: 149
                },
                {
                    x: "Tokyo",
                    y: 184
                },
                {
                    x: "Beijing",
                    y: 55
                },
                {
                    x: "Paris",
                    y: 84
                },
                {
                    x: "Chicago",
                    y: 31
                },
                {
                    x: "Osaka",
                    y: 70
                },
                {
                    x: "İstanbul",
                    y: 30
                },
                {
                    x: "Bangkok",
                    y: 44
                },
                {
                    x: "Madrid",
                    y: 68
                },
                {
                    x: "Barcelona",
                    y: 28
                },
                {
                    x: "Toronto",
                    y: 19
                },
                {
                    x: "Shanghai",
                    y: 29
                }
            ]
        }
    ];
    const options = {
        chart: {
            toolbar: {
                show: true
            }
        },
        title: {
            text: "Basic Treemap",
            align: "left",
            offsetX: -9,
            style: {
                fontWeight: "500",
                fontSize: "14px",
                color: "#64748B"
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "trezo-card-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                            className: "!mb-0",
                            children: "Basic Treemap Chart"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Charts/More/BasicTreemapChart.tsx",
                            lineNumber: 100,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicTreemapChart.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicTreemapChart.tsx",
                    lineNumber: 98,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "trezo-card-content",
                    children: isChartLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Chart, {
                        options: options,
                        series: series,
                        type: "treemap",
                        height: 350,
                        width: "100%"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts/More/BasicTreemapChart.tsx",
                        lineNumber: 105,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts/More/BasicTreemapChart.tsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Charts/More/BasicTreemapChart.tsx",
            lineNumber: 97,
            columnNumber: 7
        }, this)
    }, void 0, false);
};
const __TURBOPACK__default__export__ = BasicTreemapChart;
}}),
"[project]/node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-bailout-to-csr.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

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
const _bailouttocsr = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/bailout-to-csr.js [app-ssr] (ecmascript)");
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
"[project]/node_modules/next/dist/shared/lib/encode-uri-path.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

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
"[project]/node_modules/next/dist/shared/lib/lazy-dynamic/preload-chunks.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
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
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
const _reactdom = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
const _workasyncstorageexternal = __turbopack_context__.r("[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)");
const _encodeuripath = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/encode-uri-path.js [app-ssr] (ecmascript)");
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
"[project]/node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

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
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
const _react = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
const _dynamicbailouttocsr = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-bailout-to-csr.js [app-ssr] (ecmascript)");
const _preloadchunks = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/preload-chunks.js [app-ssr] (ecmascript)");
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
"[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

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
const _interop_require_default = __turbopack_context__.r("[project]/node_modules/next/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [app-ssr] (ecmascript)");
const _loadable = /*#__PURE__*/ _interop_require_default._(__turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js [app-ssr] (ecmascript)"));
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

};

//# sourceMappingURL=_25dc62f8._.js.map