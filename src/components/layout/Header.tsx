
'use client'; // Added because useRouter and useTranslations are client hooks

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const t = useTranslations('header');
  const router = useRouter();

  return (
    <header className="py-4 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* Assuming the logo should link to the current locale's homepage */}
            {/* Need to get current locale, perhaps from usePathname or passed as prop */}
            {/* For now, linking to '/' which might redirect based on middleware */}
            <Link href="/" className="flex items-center"> 
              <Image 
                src="/assets/images/logo.svg" 
                alt="Shown.io Logo" 
                width={150} 
                height={40} 
                className="h-10 w-auto"
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            {/* Links are hardcoded to /ar/, consider making them dynamic based on current locale */}
            <Link href="/ar/integrations" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.integrations')}
            </Link>
            <Link href="/ar/pricing" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.pricing')}
            </Link>
            <Link href="/ar/partners" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.partners')}
            </Link>
            <Link href="/ar/api" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.api')}
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">
              {/* Blog link might also need locale prefix */}
              {t('nav.blog')}
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Link 
              href="https://app.shown.io/create-account?lang=ar" 
              className="hidden md:inline-block px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              {t('header.createAccount')}
            </Link>
            
            {/* Mobile menu button logic seems missing */}
            <button className="md:hidden text-gray-700 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

