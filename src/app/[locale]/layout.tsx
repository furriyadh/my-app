import React from 'react';
import '@/i18n/styles/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

const locales = ['en', 'ar'];

// Function to load messages dynamically
async function getMessages(locale: string) {
  try {
    return (await import(`../../i18n/locales/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export default async function RootLayout({ children, params: { locale } }: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Load messages asynchronously
  const messages = await getMessages(locale);

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        {/* Pass the loaded messages to the provider */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

