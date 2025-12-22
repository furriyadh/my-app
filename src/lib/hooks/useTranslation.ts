'use client';

import { useState, useEffect } from 'react';

// Import all translation files
import en from '@/../messages/en.json';
import ar from '@/../messages/ar.json';
import de from '@/../messages/de.json';
import es from '@/../messages/es.json';
import fr from '@/../messages/fr.json';
import it from '@/../messages/it.json';
import pt from '@/../messages/pt.json';
import ru from '@/../messages/ru.json';
import zh from '@/../messages/zh.json';
import ja from '@/../messages/ja.json';
import ko from '@/../messages/ko.json';

type TranslationKeys = typeof en;

const translations: Record<string, TranslationKeys> = {
  en,
  ar,
  de,
  es,
  fr,
  it,
  pt,
  ru,
  zh,
  ja,
  ko,
};

export type SupportedLanguage = 'en' | 'ar' | 'de' | 'es' | 'fr' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

export function useTranslation() {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const updateLanguage = () => {
      const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage;
      if (savedLanguage && translations[savedLanguage]) {
        setLanguageState(savedLanguage);
        setIsRTL(savedLanguage === 'ar');
      }
    };
    
    updateLanguage();
    window.addEventListener('languageChange', updateLanguage);
    return () => window.removeEventListener('languageChange', updateLanguage);
  }, []);

  const t = translations[language] || translations.en;

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    setIsRTL(lang === 'ar');
    
    // Save to localStorage
    localStorage.setItem('selectedLanguage', lang);
    localStorage.setItem('preferredLanguage', lang);
    
    // Set direction
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    localStorage.setItem('dirAttribute', direction);
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('languageChange'));
  };

  return {
    t,
    language,
    isRTL,
    setLanguage,
  };
}

// Language configuration with flags
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/us.png', isRTL: false },
  { code: 'ar', name: 'العربية', flag: 'https://flagcdn.com/w40/sa.png', isRTL: true },
  { code: 'de', name: 'Deutsch', flag: 'https://flagcdn.com/w40/de.png', isRTL: false },
  { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png', isRTL: false },
  { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png', isRTL: false },
  { code: 'it', name: 'Italiano', flag: 'https://flagcdn.com/w40/it.png', isRTL: false },
  { code: 'pt', name: 'Português', flag: 'https://flagcdn.com/w40/pt.png', isRTL: false },
  { code: 'ru', name: 'Русский', flag: 'https://flagcdn.com/w40/ru.png', isRTL: false },
  { code: 'zh', name: '中文', flag: 'https://flagcdn.com/w40/cn.png', isRTL: false },
  { code: 'ja', name: '日本語', flag: 'https://flagcdn.com/w40/jp.png', isRTL: false },
  { code: 'ko', name: '한국어', flag: 'https://flagcdn.com/w40/kr.png', isRTL: false },
] as const;

