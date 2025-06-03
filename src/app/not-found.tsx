// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - الصفحة غير موجودة</h1>
      <p className="text-lg mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}
