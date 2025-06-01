
'use client'; // Added because useEffect is a client hook

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

// Assuming AOS is globally available or imported elsewhere
declare global {
  interface Window {
    AOS: any; // Use a more specific type if available
  }
}

const HeroSection: React.FC = () => {
  const t = useTranslations('hero');

  // تهيئة مكتبة AOS للتأثيرات الحركية عند التمرير
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AOS) {
      window.AOS.init({
        duration: 1000,
        once: true,
      });
    }
  }, []);
  
  return (
    <section className="section-1 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="hero-title">
          <h1 
            className="text-4xl md:text-5xl font-medium mx-auto text-center" 
            data-aos="fade-up"
          >
            {t('hero.title.first')} <br /> 
            {t('hero.title.second')} <span className="text-gradient-purple">{t('hero.title.highlight')}</span> {t('hero.title.third')}
          </h1>
          <h3 
            className="text-xl md:text-2xl pt-0 mb-4 my-md-4 mx-auto text-center text-gray-700" 
            data-aos="fade-in" 
            data-aos-delay="500"
          >
            {t('hero.subtitle')}
          </h3>
        </div>
        
        <div 
          className="flex flex-col items-center mt-8" 
          data-aos="fade-in" 
          data-aos-delay="500"
        >
          <Link 
            href="https://app.shown.io/create-account?lang=ar" 
            className="sbtn inline-block transition-all hover:shadow-lg"
          >
            {t('hero.cta.button')}
          </Link>
          <p className="p-4 font-medium text-gray-600 text-sm">
            {t('hero.cta.companies')}
          </p>
        </div>
        
        <div 
          className="flex justify-center mt-4" 
          data-aos="fade-in" 
          data-aos-delay="500"
        >
          <div>
            <span className="text-gray-600 text-lg m-2">
              Google Premier Partner <span className="font-medium">2025</span>
            </span>
          </div>
        </div>
        
        <div className="mt-12 relative">
          <div className="relative mx-auto max-w-4xl" id="demo-video">
            <Image 
              src="/assets/images/home-video.png" 
              className="w-full h-auto rounded-lg shadow-xl" 
              alt="shown.io demo video"
              width={800}
              height={450}
              data-aos="fade-up"
            />
            {/* Assuming pulse-play logic might involve client-side interaction */}
            <div className="pulse-play">
              <button type="button" className="play-btn">
                <div className="pulse-box">
                  <div className="pulse-css">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

