'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import GlowButton from '@/components/ui/glow-button';

// Google Ads Language IDs mapping
const LANGUAGES = [
  { id: '1019', code: 'ar', name: 'Arabic', countryCode: 'AE' },
  { id: '1056', code: 'bn', name: 'Bengali', countryCode: 'BD' },
  { id: '1020', code: 'bg', name: 'Bulgarian', countryCode: 'BG' },
  { id: '1038', code: 'ca', name: 'Catalan', countryCode: 'ES' },
  { id: '1017', code: 'zh-CN', name: 'Chinese (simplified)', countryCode: 'CN' },
  { id: '1018', code: 'zh-TW', name: 'Chinese (traditional)', countryCode: 'TW' },
  { id: '1031', code: 'cs', name: 'Czech', countryCode: 'CZ' },
  { id: '1009', code: 'da', name: 'Danish', countryCode: 'DK' },
  { id: '1010', code: 'nl', name: 'Dutch', countryCode: 'NL' },
  { id: '1000', code: 'en', name: 'English', countryCode: 'US' },
  { id: '1043', code: 'et', name: 'Estonian', countryCode: 'EE' },
  { id: '1042', code: 'fil', name: 'Filipino', countryCode: 'PH' },
  { id: '1011', code: 'fi', name: 'Finnish', countryCode: 'FI' },
  { id: '1002', code: 'fr', name: 'French', countryCode: 'FR' },
  { id: '1001', code: 'de', name: 'German', countryCode: 'DE' },
  { id: '1022', code: 'el', name: 'Greek', countryCode: 'GR' },
  { id: '1047', code: 'gu', name: 'Gujarati', countryCode: 'IN' },
  { id: '1027', code: 'he', name: 'Hebrew', countryCode: 'IL' },
  { id: '1023', code: 'hi', name: 'Hindi', countryCode: 'IN' },
  { id: '1024', code: 'hu', name: 'Hungarian', countryCode: 'HU' },
  { id: '1026', code: 'is', name: 'Icelandic', countryCode: 'IS' },
  { id: '1025', code: 'id', name: 'Indonesian', countryCode: 'ID' },
  { id: '1004', code: 'it', name: 'Italian', countryCode: 'IT' },
  { id: '1005', code: 'ja', name: 'Japanese', countryCode: 'JP' },
  { id: '1048', code: 'kn', name: 'Kannada', countryCode: 'IN' },
  { id: '1012', code: 'ko', name: 'Korean', countryCode: 'KR' },
  { id: '1028', code: 'lv', name: 'Latvian', countryCode: 'LV' },
  { id: '1029', code: 'lt', name: 'Lithuanian', countryCode: 'LT' },
  { id: '1050', code: 'ms', name: 'Malay', countryCode: 'MY' },
  { id: '1049', code: 'ml', name: 'Malayalam', countryCode: 'IN' },
  { id: '1051', code: 'mr', name: 'Marathi', countryCode: 'IN' },
  { id: '1013', code: 'no', name: 'Norwegian', countryCode: 'NO' },
  { id: '1064', code: 'fa', name: 'Persian', countryCode: 'IR' },
  { id: '1030', code: 'pl', name: 'Polish', countryCode: 'PL' },
  { id: '1014', code: 'pt', name: 'Portuguese', countryCode: 'PT' },
  { id: '1032', code: 'ro', name: 'Romanian', countryCode: 'RO' },
  { id: '1015', code: 'ru', name: 'Russian', countryCode: 'RU' },
  { id: '1033', code: 'sr', name: 'Serbian', countryCode: 'RS' },
  { id: '1034', code: 'sk', name: 'Slovak', countryCode: 'SK' },
  { id: '1035', code: 'sl', name: 'Slovenian', countryCode: 'SI' },
  { id: '1003', code: 'es', name: 'Spanish', countryCode: 'ES' },
  { id: '1016', code: 'sv', name: 'Swedish', countryCode: 'SE' },
  { id: '1044', code: 'ta', name: 'Tamil', countryCode: 'IN' },
  { id: '1045', code: 'te', name: 'Telugu', countryCode: 'IN' },
  { id: '1006', code: 'th', name: 'Thai', countryCode: 'TH' },
  { id: '1037', code: 'tr', name: 'Turkish', countryCode: 'TR' },
  { id: '1036', code: 'uk', name: 'Ukrainian', countryCode: 'UA' },
  { id: '1041', code: 'ur', name: 'Urdu', countryCode: 'PK' },
  { id: '1040', code: 'vi', name: 'Vietnamese', countryCode: 'VN' },
];

export default function LanguageSelectionPage() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]); // Arabic default
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignData, setCampaignData] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isRTL, setIsRTL] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Detect language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setIsRTL(savedLanguage === 'ar');
    }
  }, []);

  // Load campaign data and saved/detected language on mount
  useEffect(() => {
    console.log('🔍 Loading language selection page...');
    
    const data = localStorage.getItem('campaignData');
    console.log('📦 localStorage campaignData:', data);
    
    if (data) {
      const parsed = JSON.parse(data);
      setCampaignData(parsed);
      
      console.log('📋 Parsed campaign data:', {
        websiteUrl: parsed.websiteUrl,
        detectedLanguageCode: parsed.detectedLanguageCode,
        detectedLanguageId: parsed.detectedLanguageId,
        languageConfidence: parsed.languageConfidence,
        selectedLanguage: parsed.selectedLanguage
      });
      
      // Priority 1: Load manually selected language if exists (user chose it before)
      if (parsed.selectedLanguage) {
        console.log(`🔍 Found manual selection: ${parsed.selectedLanguage}`);
        const savedLanguage = LANGUAGES.find(lang => lang.id === parsed.selectedLanguage);
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage);
          console.log(`✅ Loaded manually selected language: ${savedLanguage.name} (Priority 1 - Manual)`);
          return; // Exit early - manual selection has priority
        } else {
          console.warn(`⚠️ Manual selection ID ${parsed.selectedLanguage} not found, falling back to detection`);
        }
      } else {
        console.log(`ℹ️ No manual selection found, checking auto-detection...`);
      }
      
      // Priority 2: Load auto-detected language from website
      if (parsed.detectedLanguageId) {
        console.log(`🔍 Looking for language with ID: ${parsed.detectedLanguageId}`);
        const detectedLanguage = LANGUAGES.find(lang => lang.id === parsed.detectedLanguageId);
        
        if (detectedLanguage) {
          setSelectedLanguage(detectedLanguage);
          console.log(`🌍 ✅ Auto-detected language from website: ${detectedLanguage.name} (${parsed.detectedLanguageCode})`);
          console.log(`🎯 Confidence: ${parsed.languageConfidence || 'unknown'}`);
        } else {
          console.warn(`⚠️ Language ID ${parsed.detectedLanguageId} not found in LANGUAGES array!`);
          console.log(`📚 Available language IDs:`, LANGUAGES.map(l => `${l.name}: ${l.id}`).join(', '));
        }
      } else {
        console.log(`ℹ️ No detectedLanguageId in localStorage, using default: Arabic`);
      }
    } else {
      console.log(`ℹ️ No campaignData in localStorage, using default: Arabic`);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = (language: typeof LANGUAGES[0]) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleNext = () => {
    // Save selected language to localStorage
    const updatedData = {
      ...campaignData,
      selectedLanguage: selectedLanguage.id,
      selectedLanguageCode: selectedLanguage.code,
      selectedLanguageName: selectedLanguage.name
    };
    localStorage.setItem('campaignData', JSON.stringify(updatedData));

    // Navigate to location targeting
    router.push('/campaign/location-targeting');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'ما هي اللغات التي يتحدث بها جمهورك؟' : 'Which languages does your audience speak?'}
          </h2>
        </div>

        {/* Language Selection */}
        <div className="max-w-2xl mx-auto mb-12">
          <label className={`block text-base font-medium text-gray-700 dark:text-gray-300 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'اختر اللغة' : 'Select Language'}
          </label>

          {/* Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full px-6 py-4 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 shadow-sm`}
            >
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <ReactCountryFlag
                  countryCode={selectedLanguage.countryCode}
                  svg
                  style={{
                    width: '2em',
                    height: '2em',
                  }}
                />
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedLanguage.name}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:!bg-black border-2 border-gray-300 dark:!border-gray-800 rounded-xl shadow-2xl max-h-96 overflow-hidden">
                {/* Search Input */}
                <div 
                  className="sticky top-0 p-3 bg-gray-50 dark:!bg-black border-b border-gray-200 dark:!border-gray-800"
                  style={isDark ? { backgroundColor: '#000000' } : {}}
                >
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'بحث عن اللغات...' : 'Search languages...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className={`w-full px-4 py-2 bg-white dark:!bg-black border border-gray-300 dark:!border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-900 dark:!text-white placeholder-gray-500 dark:!placeholder-gray-500 [color-scheme:dark] ${isRTL ? 'text-right' : 'text-left'}`}
                    style={isDark ? { backgroundColor: '#000000', color: '#ffffff', borderColor: '#1f2937' } : {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Language Options */}
                <div className="overflow-y-auto max-h-80 bg-white dark:!bg-black">
                  {filteredLanguages.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'لا توجد خيارات' : 'No Options'}
                    </div>
                  ) : (
                    <div className="p-2 bg-transparent dark:!bg-black">
                      {filteredLanguages.map((lang) => {
                        const isSelected = selectedLanguage.id === lang.id;
                        return (
                          <button
                            key={lang.id}
                            onClick={() => handleLanguageSelect(lang)}
                            className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-200 ${isRTL ? 'flex-row-reverse' : ''} ${
                              isSelected
                                ? 'text-blue-700 dark:!text-white'
                                : 'bg-transparent hover:bg-gray-100 dark:hover:!bg-transparent text-gray-700 dark:!text-white'
                            }`}
                            style={{ backgroundColor: 'transparent' }}
                          >
                            <ReactCountryFlag
                              countryCode={lang.countryCode}
                              svg
                              style={{
                                width: '1.5em',
                                height: '1.5em',
                              }}
                            />
                            <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'} font-medium`}>{lang.name}</span>
                            {isSelected && (
                              <Check className="w-5 h-5 text-blue-600 dark:!text-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className={`flex justify-between items-center max-w-2xl mx-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
          <GlowButton
            onClick={() => router.push('/campaign/website-url')}
            variant="green"
          >
            <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              {language === 'ar' ? 'الخطوة السابقة' : 'Previous Step'}
            </span>
          </GlowButton>

          <GlowButton
            onClick={handleNext}
            variant="purple"
          >
            <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {language === 'ar' ? 'الخطوة التالية' : 'Next Step'}
              {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </span>
          </GlowButton>
        </div>
      </div>
    </div>
  );
}

