import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

// استيراد الدالة المصدرة من i18n.ts
// نفترض أن i18n.ts يصدر دالة getRequestConfig أو ما شابهها
// يجب التأكد من أن المسار صحيح
import getI18nConfig from '../../i18n'; // تعديل المسار إذا لزم الأمر

const locales = ['en', 'ar'];

// جعل المكون async للحصول على الرسائل
export default async function RootLayout({ children, params: { locale } }: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  console.log(`--- [Original Project - Step 3] layout.tsx: Rendering with locale: ${locale} ---`);

  // التحقق من اللغة المدعومة
  if (!locales.includes(locale)) {
    notFound();
  }

  let messages;
  try {
    // استدعاء الدالة المصدرة من i18n.ts للحصول على الإعدادات (بما في ذلك الرسائل)
    // تمرير كائن يحتوي على locale
    const config = await getI18nConfig({ requestLocale: locale });
    messages = config.messages;
    console.log(`--- [Original Project - Step 3] layout.tsx: Successfully got messages for locale: ${locale} ---`);
  } catch (error) {
    console.error(`--- [Original Project - Step 3] layout.tsx: Failed to get messages for locale ${locale}:`, error);
    // يمكنك اختيار عرض خطأ أو استخدام notFound()
    notFound();
  }

  // التأكد من تحميل الرسائل
  if (!messages) {
    console.error(`--- [Original Project - Step 3] layout.tsx: Messages object is missing for locale: ${locale} ---`);
    notFound();
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        <h1>Original Project - Step 3 Layout (Locale: {locale})</h1>
        {/* تمرير الرسائل مباشرة إلى المزود */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
