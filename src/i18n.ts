import { getRequestConfig } from "next-intl/server";

// Minimal static messages for testing (copied from working test project)
const staticMessages = {
  Test: {
    title: "Test Title (Static)"
  }
};

export default getRequestConfig(async ({locale}) => {
  // Fallback to 'en' if locale is undefined
  const safeLocale = locale ?? 'en';
  // Return static messages along with the validated locale
  return {
    locale: safeLocale,
    messages: staticMessages // <-- المشكلة هنا: يتم إرجاع رسائل ثابتة فقط
  };
}); 
