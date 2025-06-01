import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // قائمة بجميع اللغات المدعومة
  locales: ['en', 'ar'],

  // اللغة الافتراضية المستخدمة إذا لم يتم تحديد لغة
  defaultLocale: 'en',

  // *** إضافة: تحديد استراتيجية بادئة اللغة لتطابق الإعدادات العامة ***
  localePrefix: 'always'
});

export const config = {
  // تطابق فقط المسارات التي تحتاج إلى تدويل
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
