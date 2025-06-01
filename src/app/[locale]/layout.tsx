import React from 'react';
import { NextIntlClientProvider, useMessages } from 'next-intl'; // <-- تأكد من استيراد useMessages
import { notFound } from 'next/navigation';

// لا تستورد getI18nConfig هنا

const locales = ['en', 'ar'];

export default function RootLayout({ children, params: { locale } }: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // التحقق من اللغة المدعومة
  if (!locales.includes(locale)) {
    notFound();
  }

  // استخدم useMessages هنا
  const messages = useMessages();

  // يمكنك إضافة تحقق إضافي إذا أردت، لكن useMessages يجب أن توفر الرسائل
  if (!messages) {
     console.error(`Messages not loaded for locale: ${locale}`);
     // قد تحتاج لمعالجة هذا بشكل مختلف، لكن notFound قد يكون مناسبًا
     notFound();
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        {/* تأكد من تمرير الرسائل الصحيحة هنا */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
