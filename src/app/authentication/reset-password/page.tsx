"use client";

import { Suspense, useState, useEffect } from 'react';
import ResetPasswordForm from "@/components/Authentication/ResetPasswordForm";

// Loading component with translation
const LoadingFallback: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center" dir="ltr">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'ar' ? 'جاري تحميل الصفحة...' : 'Loading page...'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'ar' ? 'يرجى الانتظار' : 'Please wait'}
        </p>
      </div>
    </div>
  );
};

// Component منفصل يحتوي على ResetPasswordForm
const ResetPasswordContent: React.FC = () => {
  return (
    <>
      <ResetPasswordForm />
    </>
  );
};

// Main page component مع Suspense boundary
export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

