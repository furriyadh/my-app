// src/app/[locale]/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      {/* ملاحظة: الترجمة هنا قد لا تعمل بشكل صحيح بدون الوصول إلى locale */}
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1> 
      <p className="text-lg mb-8">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Return to Home
      </Link>
    </div>
  );
}
