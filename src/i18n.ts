import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

// Define the supported locales
const locales = ["en", "ar"];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // If the locale is not supported, redirect to the not found page
  if (!locales.includes(locale as any)) {
    notFound();
  }
  // Assert that locale is a string after the check
  const validLocale = locale as string;
  return {
    locale: validLocale, // Use the asserted locale
    messages: (await import(`./i18n/locales/${validLocale}.json`)).default
  };
});