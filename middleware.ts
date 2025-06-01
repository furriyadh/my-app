import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server'; // تأكد من استيراد هذه

// إنشاء نسخة من وسيط next-intl بالإعدادات الخاصة بك
const intlMiddleware = createMiddleware({
  // قائمة بجميع اللغات المدعومة
  locales: ['en', 'ar'],

  // اللغة الافتراضية المستخدمة إذا لم يتم تحديد لغة
  defaultLocale: 'en', // تأكد أنها اللغة التي تريدها كافتراضية

  // تحديد استراتيجية بادئة اللغة (دائمًا أضف البادئة)
  localePrefix: 'always'
});

// تصدير دالة الوسيط الرئيسية
export default function middleware(request: NextRequest): NextResponse {
  // --- سطر التشخيص المضاف ---
  // اطبع رسالة في الطرفية عند تنفيذ الوسيط مع المسار الحالي
  console.log('--- Middleware Executed --- Pathname:', request.nextUrl.pathname);
  // --- نهاية سطر التشخيص ---

  // قم بتنفيذ وإرجاع نتيجة وسيط next-intl الأصلي
  return intlMiddleware(request);
}

// إعدادات المطابقة (matcher) تبقى كما هي
export const config = {
  // تطابق فقط المسارات التي تحتاج إلى تدويل
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
