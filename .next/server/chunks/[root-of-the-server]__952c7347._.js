module.exports = {

"[project]/.next-internal/server/app/api/register/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

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
"[project]/src/app/api/register/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// my-app/src/app/api/register/route.ts
__turbopack_context__.s({
    "POST": (()=>POST)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// هذه دالة وهمية لإنشاء مستخدم في قاعدة البيانات
// يجب استبدالها بمنطقك الفعلي لإنشاء المستخدم
async function createUserInDatabase(email, password) {
    // هنا يمكنك إضافة منطقك لإنشاء المستخدم في قاعدة البيانات
    // على سبيل المثال، باستخدام Prisma, Mongoose, أو أي ORM آخر
    console.log(`Creating user: ${email}`);
    // افترض أننا نرجع كائن مستخدم مع خاصية تشير إلى ما إذا كان جديدًا
    return {
        id: 'user123',
        email,
        isNewUser: true,
        hasCompletedBusinessSetup: false
    };
}
// هذه دالة وهمية لتسجيل الدخول بعد إنشاء الحساب
// يجب استبدالها بمنطقك الفعلي لتسجيل الدخول وإنشاء جلسة للمستخدم
async function signInUser(userId) {
    console.log(`Signing in user: ${userId}`);
    // هنا يمكنك إنشاء جلسة للمستخدم (مثل استخدام NextAuth.js أو JWT)
    // هذا الجزء يعتمد بشكل كبير على طريقة المصادقة الخاصة بك
    return {
        success: true
    };
}
async function POST(request) {
    try {
        const { email, password } = await request.json();
        // 1. إنشاء المستخدم في قاعدة البيانات
        const user = await createUserInDatabase(email, password);
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        // 2. تسجيل الدخول التلقائي للمستخدم بعد الإنشاء
        const signInResult = await signInUser(user.id);
        if (!signInResult.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Failed to sign in user'
            }, {
                status: 500
            });
        }
        // 3. التحقق مما إذا كان المستخدم جديدًا ويحتاج إلى إعدادات العمل
        // يمكنك تخزين هذه الحالة في قاعدة البيانات (مثال: حقل hasCompletedBusinessSetup)
        if (user.isNewUser && !user.hasCompletedBusinessSetup) {
            // إعادة توجيه المستخدم إلى صفحة إعدادات العمل
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/business-creation', request.url), 302);
        }
        // إذا لم يكن جديدًا أو أكمل الإعدادات، أعد توجيهه إلى لوحة التحكم الافتراضية
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/dashboard', request.url), 302);
    } catch (error) {
        console.error('Registration error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__952c7347._.js.map