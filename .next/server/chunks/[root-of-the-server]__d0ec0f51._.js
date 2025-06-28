module.exports = {

"[project]/.next-internal/server/app/api/oauth/callback/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

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
"[project]/src/app/api/oauth/callback/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/app/api/oauth/callback/route.ts
// OAuth callback handler لمعالجة استجابة Google OAuth
__turbopack_context__.s({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        console.log('OAuth Callback received:', {
            code: !!code,
            state,
            error
        });
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        // التحقق من وجود خطأ في OAuth
        if (error) {
            console.error('OAuth Error:', error);
            const errorMessage = encodeURIComponent('حدث خطأ أثناء ربط حساب Google Ads: ' + error);
            const redirectUrl = new URL('/dashboard', baseUrl);
            redirectUrl.searchParams.set('error', errorMessage);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl.toString());
        }
        // التحقق من وجود authorization code
        if (!code) {
            console.error('No authorization code received');
            const errorMessage = encodeURIComponent('لم يتم الحصول على رمز التفويض من Google');
            const redirectUrl = new URL('/dashboard', baseUrl);
            redirectUrl.searchParams.set('error', errorMessage);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl.toString());
        }
        // التحقق من state للأمان (اختياري)
        // يمكنك إضافة التحقق من state هنا إذا كنت تحفظه في localStorage
        // تحديد redirectUri بناءً على البيئة
        const currentRedirectUri = ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : 'http://localhost:3000/api/oauth/callback';
        // تبادل authorization code مع access token
        const tokenResponse = await exchangeCodeForToken(code, currentRedirectUri);
        if (!tokenResponse.success) {
            console.error('Failed to exchange code for token:', tokenResponse.error);
            const errorMessage = encodeURIComponent('فشل في الحصول على رمز الوصول من Google');
            const redirectUrl = new URL('/dashboard', baseUrl);
            redirectUrl.searchParams.set('error', errorMessage);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl.toString());
        }
        // حفظ access token (يمكنك حفظه في قاعدة البيانات أو localStorage)
        console.log('✅ OAuth successful, access token received');
        // إعادة توجيه إلى صفحة إنشاء الحملة مع معلومات الحساب المربوط
        const successUrl = new URL('/new-campaign', baseUrl);
        successUrl.searchParams.set('account_type', 'own-accounts');
        successUrl.searchParams.set('oauth_success', 'true');
        successUrl.searchParams.set('access_token', tokenResponse.access_token);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(successUrl.toString());
    } catch (error) {
        console.error('OAuth Callback Error:', error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const errorMessage = encodeURIComponent('حدث خطأ غير متوقع أثناء معالجة OAuth');
        const redirectUrl = new URL('/dashboard', baseUrl);
        redirectUrl.searchParams.set('error', errorMessage);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl.toString());
    }
}
// دالة لتبادل authorization code مع access token
async function exchangeCodeForToken(code, redirectUri) {
    try {
        const clientId = ("TURBOPACK compile-time value", "366144291902-u75bec3sviur9nrutbslt14ob14hrgud.apps.googleusercontent.com");
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        console.log('🔍 Debugging Token Exchange:');
        console.log('  Client ID:', clientId);
        console.log('  Client Secret (first 10 chars):', clientSecret ? clientSecret.substring(0, 10) + '...' : 'Not set');
        console.log('  Redirect URI:', redirectUri);
        console.log('  Authorization Code (first 10 chars):', code ? code.substring(0, 10) + '...' : 'Not set');
        if (!clientId || !clientSecret) {
            console.error('❌ Missing OAuth credentials:', {
                clientId: !!clientId,
                clientSecret: !!clientSecret
            });
            throw new Error('Missing Google OAuth credentials');
        }
        const tokenEndpoint = 'https://oauth2.googleapis.com/token';
        const params = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
        });
        console.log('📤 Sending token exchange request to:', tokenEndpoint);
        console.log('📤 Request params:', {
            client_id: clientId,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code: code ? code.substring(0, 10) + '...' : 'Not set'
        });
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });
        const data = await response.json();
        console.log('📥 Token exchange response status:', response.status);
        console.log('📥 Token exchange response:', {
            success: response.ok,
            error: data.error,
            error_description: data.error_description,
            hasAccessToken: !!data.access_token
        });
        if (!response.ok) {
            console.error('❌ Token exchange failed:', data);
            return {
                success: false,
                error: data.error_description || data.error || 'Token exchange failed'
            };
        }
        console.log('✅ Token exchange successful');
        return {
            success: true,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            token_type: data.token_type,
            scope: data.scope
        };
    } catch (error) {
        console.error('❌ Error in token exchange:', error);
        return {
            success: false,
            error: error.message || 'Unknown error during token exchange'
        };
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__d0ec0f51._.js.map