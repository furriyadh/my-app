// Configuration helper for backend URL (works for development + production)
export function getBackendUrl(): string {
  const nodeEnv = process.env.NODE_ENV;

  // ✅ Browser (Client Components): استخدم فقط المتغيرات العامة
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  }

  // ✅ Server-side (Next.js / Node) في الإنتاج نعتمد فقط على متغيرات البيئة
  if (nodeEnv === 'production') {
    // على Vercel/VPS يجب ضبط واحد على الأقل من هذه المتغيرات
    return (
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      ''
    );
  }

  // ✅ Development (محليًا): نسمح بالسقوط إلى localhost إذا لم تُضبط المتغيرات
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
