// Configuration helper for backend URL (works for development + production)

// ⚠️ رابط الباك إند في الإنتاج - يجب تحديثه عند تغيير الدومين
const PRODUCTION_BACKEND_URL = 'https://my-app-production-28d2.up.railway.app';

export function getBackendUrl(): string {
  const nodeEnv = process.env.NODE_ENV;

  // ✅ Browser (Client Components): استخدم المتغيرات العامة أو القيمة الثابتة
  if (typeof window !== 'undefined') {
    // في المتصفح: تحقق من الدومين الحالي
    const currentHost = window.location.hostname;
    const isProduction = currentHost === 'furriyadh.com' || currentHost === 'www.furriyadh.com';
    
    if (isProduction) {
      // في الإنتاج: استخدم الرابط الثابت للباك إند
      return process.env.NEXT_PUBLIC_BACKEND_URL || PRODUCTION_BACKEND_URL;
    }
    
    // في التطوير: استخدم localhost
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  }

  // ✅ Server-side (Next.js / Node) في الإنتاج نعتمد على متغيرات البيئة
  if (nodeEnv === 'production') {
    return (
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      PRODUCTION_BACKEND_URL
    );
  }

  // ✅ Development (محليًا): نسمح بالسقوط إلى localhost
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