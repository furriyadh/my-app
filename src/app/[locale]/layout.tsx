import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

const locales = ['en', 'ar'];

async function getMessages(locale: string) {
  try {
    // تأكد من أن المسار صحيح بالنسبة لموقع هذا الملف
    return (await import(`../../i18n/locales/${locale}.json`)).default;
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error);
    notFound();
  }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: ReactNode;
  params: { locale: string };
};

// تمرير كائن props كاملاً
export default async function LocaleLayout(props: Props) {
  // استخدام await props.params
  const params = await props.params;
  const locale = params.locale;
  const children = props.children; // استخراج children

  if (!locales.includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = await getMessages(locale);
  } catch (error) {
    console.error("Failed to get messages in layout", error);
    notFound();
  }

  // التأكد من تحميل الرسائل قبل المتابعة
  if (!messages) {
      console.error(`Messages could not be loaded for locale: ${locale}`);
      notFound(); // أو التعامل مع الخطأ بطريقة أخرى
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        {/* إعادة إضافة NextIntlClientProvider */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
