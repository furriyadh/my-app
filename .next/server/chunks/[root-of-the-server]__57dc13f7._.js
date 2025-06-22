module.exports = {

"[externals]/crypto [external] (crypto, cjs, async loader)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[externals]/crypto [external] (crypto, cjs)");
    });
});
}}),
"[project]/node_modules/https-proxy-agent/dist/index.js [app-route] (ecmascript, async loader)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/node_modules/https-proxy-agent/dist/index.js [app-route] (ecmascript)");
    });
});
}}),
"[project]/node_modules/google-gax/node_modules/node-fetch/src/index.js [app-route] (ecmascript, async loader)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/aeab5_node-fetch_src_utils_multipart-parser_73f17118.js",
  "server/chunks/node_modules_aa6e19b0._.js",
  "server/chunks/[root-of-the-server]__7652628b._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/google-gax/node_modules/node-fetch/src/index.js [app-route] (ecmascript)");
    });
});
}}),

};