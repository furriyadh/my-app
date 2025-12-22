"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { motion } from "framer-motion";
import { Globe, Check } from "lucide-react";

const Languages: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const updateLanguage = () => {
      const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
      if (savedLanguage) {
        setLanguage(savedLanguage);
        setIsRTL(savedLanguage === 'ar');
      }
    };
    updateLanguage();
    window.addEventListener('languageChange', updateLanguage);
    return () => window.removeEventListener('languageChange', updateLanguage);
  }, []);

  const supportedLanguages = [
    {
      code: 'ar',
      name: 'العربية',
      nameEn: 'Arabic',
      flag: '🇸🇦',
      region: language === 'ar' ? 'الشرق الأوسط' : 'Middle East',
      users: '400M+',
      gradient: 'from-green-600 to-emerald-600'
    },
    {
      code: 'en',
      name: 'English',
      nameEn: 'English',
      flag: '🇺🇸',
      region: language === 'ar' ? 'عالمي' : 'Global',
      users: '1.5B+',
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      code: 'es',
      name: 'Español',
      nameEn: 'Spanish',
      flag: '🇪🇸',
      region: language === 'ar' ? 'أوروبا وأمريكا اللاتينية' : 'Europe & Latin America',
      users: '500M+',
      gradient: 'from-red-600 to-orange-600',
      comingSoon: true
    },
    {
      code: 'fr',
      name: 'Français',
      nameEn: 'French',
      flag: '🇫🇷',
      region: language === 'ar' ? 'أوروبا وأفريقيا' : 'Europe & Africa',
      users: '280M+',
      gradient: 'from-purple-600 to-pink-600',
      comingSoon: true
    },
    {
      code: 'de',
      name: 'Deutsch',
      nameEn: 'German',
      flag: '🇩🇪',
      region: language === 'ar' ? 'أوروبا' : 'Europe',
      users: '100M+',
      gradient: 'from-yellow-600 to-amber-600',
      comingSoon: true
    },
    {
      code: 'tr',
      name: 'Türkçe',
      nameEn: 'Turkish',
      flag: '🇹🇷',
      region: language === 'ar' ? 'تركيا والشرق الأوسط' : 'Turkey & Middle East',
      users: '80M+',
      gradient: 'from-red-700 to-red-500',
      comingSoon: true
    }
  ];

  return (
    <div className="relative py-[80px] md:py-[100px] lg:py-[120px] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 dark:via-blue-950/20 to-transparent"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="container 2xl:max-w-[1320px] mx-auto px-[12px] relative z-10" dir="ltr">
        {/* Section Header */}
        <div className="text-center mb-[60px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-4"
          >
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'اللغات المدعومة' : 'Supported Languages'}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="!mb-[15px] !leading-[1.2] !text-[32px] md:!text-[40px] lg:!text-[48px] -tracking-[.5px] md:-tracking-[1px]"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {language === 'ar' ? (
              <>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  تحدث لغة عملائك
                </span>
                <br />
                حول العالم
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Speak Your Customers&apos; Language
                </span>
                <br />
                Around the Globe
              </>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {language === 'ar' 
              ? 'منصة Furriyadh تدعم لغات متعددة لتصل إلى جمهورك المستهدف في أي مكان بالعالم'
              : 'Furriyadh supports multiple languages to help you reach your target audience anywhere in the world'}
          </motion.p>
        </div>

        {/* Languages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {supportedLanguages.map((lang, index) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="group relative"
            >
              <div className="relative h-full p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-transparent dark:hover:border-transparent transition-all duration-300 overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${lang.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Coming Soon Badge */}
                {lang.comingSoon && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {language === 'ar' ? 'قريباً' : 'Coming Soon'}
                  </div>
                )}

                {/* Active Badge */}
                {!lang.comingSoon && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {language === 'ar' ? 'متاح' : 'Active'}
                    </span>
                  </div>
                )}

                {/* Flag & Language Name */}
                <div className="relative flex items-center gap-4 mb-4">
                  <div className="text-5xl">{lang.flag}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {lang.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {lang.nameEn}
                    </p>
                  </div>
                </div>

                {/* Region */}
                <div className="relative mb-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span className="text-gray-900 dark:text-white">{language === 'ar' ? 'المنطقة:' : 'Region:'}</span> {lang.region}
                  </p>
                </div>

                {/* Users */}
                <div className="relative">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span className="text-gray-900 dark:text-white">{language === 'ar' ? 'المستخدمون:' : 'Users:'}</span> {lang.users}
                  </p>
                </div>

                {/* Bottom Gradient Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${lang.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/30"
        >
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
              6+
            </div>
            <p className="text-gray-600 dark:text-gray-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'لغات مدعومة' : 'Supported Languages'}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
              2.8B+
            </div>
            <p className="text-gray-600 dark:text-gray-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'مستخدمون محتملون' : 'Potential Users'}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
              50+
            </div>
            <p className="text-gray-600 dark:text-gray-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'دولة مدعومة' : 'Countries Supported'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Languages;

