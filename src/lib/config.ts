// Configuration helper for backend URL (works for development + production)

// ⚠️ رابط الباك إند في الإنتاج - يجب أن يتطابق مع next.config.ts
// IMPORTANT: This MUST match the RAILWAY_BACKEND_URL in next.config.ts
// ✅ VERIFIED WORKING: my-app-production-28d2.up.railway.app
const PRODUCTION_BACKEND_URL = 'https://my-app-production-28d2.up.railway.app';

export function getBackendUrl(): string {
  // ✅ Browser (Client Components): استخدم المتغيرات العامة أو القيمة الثابتة
  if (typeof window !== 'undefined') {
    // في المتصفح: تحقق من الدومين الحالي
    const currentHost = window.location.hostname;
    const isProduction = currentHost === 'furriyadh.com' || currentHost === 'www.furriyadh.com';

    // Debug logging
    console.log('🔧 [config] hostname:', currentHost);
    console.log('🔧 [config] isProduction:', isProduction);
    console.log('🔧 [config] NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);

    if (isProduction) {
      // في الإنتاج: استخدم الرابط الثابت للباك إند مباشرة
      const url = PRODUCTION_BACKEND_URL;
      console.log('🔧 [config] Using PRODUCTION URL:', url);
      return url;
    }

    // في التطوير: استخدم localhost
    const devUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    console.log('🔧 [config] Using DEV URL:', devUrl);
    return devUrl;
  }

  // ✅ Server-side (Next.js / Node)
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === 'production') {
    return (
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      PRODUCTION_BACKEND_URL
    );
  }

  // ✅ Development (محليًا)
  return (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:5000'
  );
}

export function getApiUrl(path: string): string {
  const backendUrl = getBackendUrl();
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath}`;
}