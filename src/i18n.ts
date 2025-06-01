import {getRequestConfig} from 'next-intl/server';

// Minimal static messages for testing (copied from working test project)
const staticMessages = {
  Test: {
    title: "Test Title (Static)"
  }
};

export default getRequestConfig(async ({locale}) => {
  // Log the received locale to check if it's passed correctly
  console.log(`--- [Original Project - Step 1] i18n.ts: Received locale: ${locale} ---`);

  // Basic validation and default locale
  const validatedLocale = locale && ['en', 'ar'].includes(locale) ? locale : 'en';
  console.log(`--- [Original Project - Step 1] i18n.ts: Using locale: ${validatedLocale} ---`);

  // Return static messages along with the validated locale
  return {
    locale: validatedLocale,
    messages: staticMessages
  };
});
