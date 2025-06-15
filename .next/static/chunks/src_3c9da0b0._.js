(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/components/Dashboard/BusinessCreation/BusinessFormContainer.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>BusinessFormContainer)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function BusinessFormContainer({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-center items-start min-h-screen bg-gray-100 p-5",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white p-10 rounded-lg shadow-md w-full max-w-xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold mb-2 text-gray-800",
                    children: "دعنا نُعد إعداد عملك الأول"
                }, void 0, false, {
                    fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessFormContainer.tsx",
                    lineNumber: 11,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-base text-gray-600 mb-8",
                    children: "أخبرنا المزيد عن عملك"
                }, void 0, false, {
                    fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessFormContainer.tsx",
                    lineNumber: 12,
                    columnNumber: 9
                }, this),
                children
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessFormContainer.tsx",
            lineNumber: 10,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessFormContainer.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = BusinessFormContainer;
var _c;
__turbopack_context__.k.register(_c, "BusinessFormContainer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Dashboard/BusinessCreation/BusinessNameInput.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>BusinessNameInput)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function BusinessNameInput({ value, onChange, placeholder = "... اسم العمل" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "businessName",
                className: "block mb-2 font-bold text-gray-700",
                children: "اسم العمل"
            }, void 0, false, {
                fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessNameInput.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                id: "businessName",
                value: value,
                onChange: (e)=>onChange?.(e.target.value),
                placeholder: placeholder,
                className: "w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            }, void 0, false, {
                fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessNameInput.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessNameInput.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = BusinessNameInput;
var _c;
__turbopack_context__.k.register(_c, "BusinessNameInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>WebsiteUrlInput)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function WebsiteUrlInput({ value, onChange, placeholder = "www.yourwebsite.com" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "websiteUrl",
                className: "block mb-2 font-bold text-gray-700",
                children: "عنوان موقع النشاط التجاري"
            }, void 0, false, {
                fileName: "[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "p-3 border border-gray-300 border-r-0 rounded-l-md bg-gray-200 text-gray-600",
                        children: "https://"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        id: "websiteUrl",
                        value: value,
                        onChange: (e)=>onChange?.(e.target.value),
                        placeholder: placeholder,
                        className: "flex-grow p-3 border border-gray-300 rounded-r-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = WebsiteUrlInput;
var _c;
__turbopack_context__.k.register(_c, "WebsiteUrlInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Dashboard/BusinessCreation/BusinessSectorSelect.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>BusinessSectorSelect)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const businessSectors = [
    {
        value: "",
        label: "... اختر الصناعة"
    },
    {
        value: "technology",
        label: "التكنولوجيا والبرمجيات"
    },
    {
        value: "retail",
        label: "التجارة والبيع بالتجزئة"
    },
    {
        value: "healthcare",
        label: "الرعاية الصحية"
    },
    {
        value: "education",
        label: "التعليم والتدريب"
    },
    {
        value: "finance",
        label: "الخدمات المالية والمصرفية"
    },
    {
        value: "food",
        label: "الأغذية والمشروبات"
    },
    {
        value: "construction",
        label: "البناء والتشييد"
    },
    {
        value: "manufacturing",
        label: "التصنيع والإنتاج"
    },
    {
        value: "transportation",
        label: "النقل واللوجستيات"
    },
    {
        value: "real-estate",
        label: "العقارات"
    },
    {
        value: "consulting",
        label: "الاستشارات"
    },
    {
        value: "marketing",
        label: "التسويق والإعلان"
    },
    {
        value: "entertainment",
        label: "الترفيه والإعلام"
    },
    {
        value: "agriculture",
        label: "الزراعة"
    },
    {
        value: "tourism",
        label: "السياحة والسفر"
    },
    {
        value: "other",
        label: "أخرى"
    }
];
function BusinessSectorSelect({ value, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "businessSector",
                className: "block mb-2 font-bold text-gray-700",
                children: "قطاع العمل"
            }, void 0, false, {
                fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessSectorSelect.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                id: "businessSector",
                value: value,
                onChange: (e)=>onChange?.(e.target.value),
                className: "w-full p-3 border border-gray-300 rounded-md text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                children: businessSectors.map((sector)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: sector.value,
                        children: sector.label
                    }, sector.value, false, {
                        fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessSectorSelect.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessSectorSelect.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessSectorSelect.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c = BusinessSectorSelect;
var _c;
__turbopack_context__.k.register(_c, "BusinessSectorSelect");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Dashboard/BusinessCreation/BusinessSizeSelect.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>BusinessSizeSelect)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const businessSizes = [
    {
        value: "micro",
        label: "صغير جداً (1 موظف)"
    },
    {
        value: "small",
        label: "صغير (2 - 10 موظفين)"
    },
    {
        value: "medium",
        label: "متوسط (11 - 50 موظف)"
    },
    {
        value: "large",
        label: "كبير (51 - 250 موظف)"
    },
    {
        value: "enterprise",
        label: "مؤسسة كبيرة (أكثر من 250 موظف)"
    }
];
function BusinessSizeSelect({ value, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "businessSize",
                className: "block mb-2 font-bold text-gray-700",
                children: "حجم العمل"
            }, void 0, false, {
                fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessSizeSelect.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                id: "businessSize",
                value: value,
                onChange: (e)=>onChange?.(e.target.value),
                className: "w-full p-3 border border-gray-300 rounded-md text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                children: businessSizes.map((size)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: size.value,
                        children: size.label
                    }, size.value, false, {
                        fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessSizeSelect.tsx",
                        lineNumber: 29,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessSizeSelect.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Dashboard/BusinessCreation/BusinessSizeSelect.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_c = BusinessSizeSelect;
var _c;
__turbopack_context__.k.register(_c, "BusinessSizeSelect");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Dashboard/BusinessCreation/SubmitButton.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>SubmitButton)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function SubmitButton({ onClick, disabled = false, loading = false, text = "التالي" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "submit",
        onClick: onClick,
        disabled: disabled || loading,
        className: `w-full p-4 font-bold text-lg rounded-md cursor-pointer transition-colors duration-300 ${disabled || loading ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`,
        children: loading ? 'جاري التحميل...' : text
    }, void 0, false, {
        fileName: "[project]/src/components/Dashboard/BusinessCreation/SubmitButton.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = SubmitButton;
var _c;
__turbopack_context__.k.register(_c, "SubmitButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Dashboard/BusinessCreation/index.tsx [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// Export all BusinessCreation components
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessFormContainer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessFormContainer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessNameInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessNameInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$WebsiteUrlInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSectorSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessSectorSelect.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSizeSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessSizeSelect.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$SubmitButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/SubmitButton.tsx [app-client] (ecmascript)");
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/Dashboard/BusinessCreation/index.tsx [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessFormContainer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessFormContainer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessNameInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessNameInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$WebsiteUrlInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSectorSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessSectorSelect.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSizeSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessSizeSelect.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$SubmitButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/SubmitButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/index.tsx [app-client] (ecmascript) <locals>");
}}),
"[project]/src/components/Dashboard/BusinessCreation/BusinessFormContainer.tsx [app-client] (ecmascript) <export default as BusinessFormContainer>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "BusinessFormContainer": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessFormContainer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessFormContainer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessFormContainer.tsx [app-client] (ecmascript)");
}}),
"[project]/src/components/Dashboard/BusinessCreation/BusinessNameInput.tsx [app-client] (ecmascript) <export default as BusinessNameInput>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "BusinessNameInput": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessNameInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessNameInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessNameInput.tsx [app-client] (ecmascript)");
}}),
"[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx [app-client] (ecmascript) <export default as WebsiteUrlInput>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "WebsiteUrlInput": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$WebsiteUrlInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$WebsiteUrlInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx [app-client] (ecmascript)");
}}),
"[project]/src/components/Dashboard/BusinessCreation/BusinessSectorSelect.tsx [app-client] (ecmascript) <export default as BusinessSectorSelect>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "BusinessSectorSelect": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSectorSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSectorSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessSectorSelect.tsx [app-client] (ecmascript)");
}}),
"[project]/src/components/Dashboard/BusinessCreation/BusinessSizeSelect.tsx [app-client] (ecmascript) <export default as BusinessSizeSelect>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "BusinessSizeSelect": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSizeSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSizeSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessSizeSelect.tsx [app-client] (ecmascript)");
}}),
"[project]/src/components/Dashboard/BusinessCreation/SubmitButton.tsx [app-client] (ecmascript) <export default as SubmitButton>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "SubmitButton": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$SubmitButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$SubmitButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/SubmitButton.tsx [app-client] (ecmascript)");
}}),
"[project]/src/app/dashboard/business-creation/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>BusinessCreationPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/index.tsx [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessFormContainer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BusinessFormContainer$3e$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessFormContainer.tsx [app-client] (ecmascript) <export default as BusinessFormContainer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessNameInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BusinessNameInput$3e$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessNameInput.tsx [app-client] (ecmascript) <export default as BusinessNameInput>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$WebsiteUrlInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WebsiteUrlInput$3e$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/WebsiteUrlInput.tsx [app-client] (ecmascript) <export default as WebsiteUrlInput>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSectorSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BusinessSectorSelect$3e$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessSectorSelect.tsx [app-client] (ecmascript) <export default as BusinessSectorSelect>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSizeSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BusinessSizeSelect$3e$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/BusinessSizeSelect.tsx [app-client] (ecmascript) <export default as BusinessSizeSelect>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$SubmitButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SubmitButton$3e$__ = __turbopack_context__.i("[project]/src/components/Dashboard/BusinessCreation/SubmitButton.tsx [app-client] (ecmascript) <export default as SubmitButton>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function BusinessCreationPage() {
    _s();
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        businessName: '',
        websiteUrl: '',
        businessSector: '',
        businessSize: 'small'
    });
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSubmit = async ()=>{
        setIsLoading(true);
        // Here you can add your form submission logic
        console.log('Form data:', formData);
        // Simulate API call
        setTimeout(()=>{
            setIsLoading(false);
        // You can add navigation logic here
        // For example: router.push('/dashboard/business-creation/next-step');
        }, 2000);
    };
    const isFormValid = formData.businessName.trim() !== '' && formData.businessSector !== '';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessFormContainer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BusinessFormContainer$3e$__["BusinessFormContainer"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessNameInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BusinessNameInput$3e$__["BusinessNameInput"], {
                value: formData.businessName,
                onChange: (value)=>setFormData((prev)=>({
                            ...prev,
                            businessName: value
                        }))
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/business-creation/page.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$WebsiteUrlInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WebsiteUrlInput$3e$__["WebsiteUrlInput"], {
                value: formData.websiteUrl,
                onChange: (value)=>setFormData((prev)=>({
                            ...prev,
                            websiteUrl: value
                        }))
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/business-creation/page.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSectorSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BusinessSectorSelect$3e$__["BusinessSectorSelect"], {
                value: formData.businessSector,
                onChange: (value)=>setFormData((prev)=>({
                            ...prev,
                            businessSector: value
                        }))
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/business-creation/page.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$BusinessSizeSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BusinessSizeSelect$3e$__["BusinessSizeSelect"], {
                value: formData.businessSize,
                onChange: (value)=>setFormData((prev)=>({
                            ...prev,
                            businessSize: value
                        }))
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/business-creation/page.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2f$BusinessCreation$2f$SubmitButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SubmitButton$3e$__["SubmitButton"], {
                onClick: handleSubmit,
                disabled: !isFormValid,
                loading: isLoading
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/business-creation/page.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/business-creation/page.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(BusinessCreationPage, "ldvGp7n5zJBGDfxuAbSCBI6A+kQ=");
_c = BusinessCreationPage;
var _c;
__turbopack_context__.k.register(_c, "BusinessCreationPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_3c9da0b0._.js.map