// Custom Hook for Language Management
// Hook مخصص لإدارة اللغة

import { useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Update language from localStorage
    const updateLanguage = () => {
      const savedLanguage = (
        localStorage.getItem('preferredLanguage') || 
        localStorage.getItem('selectedLanguage') ||
        'en'
      ) as Language;
      
      setLanguage(savedLanguage);
      setIsRTL(savedLanguage === 'ar');
    };

    // Initial load
    updateLanguage();

    // Listen for language changes
    window.addEventListener('languageChange', updateLanguage);
    window.addEventListener('storage', updateLanguage);

    return () => {
      window.removeEventListener('languageChange', updateLanguage);
      window.removeEventListener('storage', updateLanguage);
    };
  }, []);

  // Helper function to get translation
  const translate = (translations: { en: string; ar: string }) => {
    return translations[language] || translations.en;
  };

  return {
    language,
    isRTL,
    translate,
    t: translate // alias
  };
};

