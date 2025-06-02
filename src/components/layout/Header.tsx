'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl'; // Added useLocale
// useRouter is not directly used in the final proposed code, so it can be removed if not needed elsewhere.
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const t = useTranslations('header');
  const tNav = useTranslations('nav'); // Separate namespace for nav links
  const locale = useLocale(); // Get current locale

  // Helper for locale-prefixed internal links
  const localePrefixed = (path: string) => `/${locale}${path}`;

  // External app links with lang parameter
  const appLink = (path: string) => `https://app.shown.io${path}?lang=${locale}`;

  return (
    <header className="py-4 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0"> {/* Added flex-shrink-0 to prevent shrinking */}
            <Link href={localePrefixed('/')} className="flex items-center">
              <Image
                src="/assets/images/logo.svg"
                alt="Shown.io Logo"
                width={120} // Adjusted size slightly
                height={32}
                className="h-8 w-auto" // Adjusted size
              />
            </Link>
          </div>

          {/* Centered Navigation Links */}
          <nav className="hidden md:flex flex-grow justify-center items-center space-x-4 lg:space-x-6 rtl:space-x-reverse">
            <Link href={localePrefixed('/integrations')} className="text-gray-700 hover:text-primary-600 transition-colors">
              {tNav('integrations')}
            </Link>
            <Link href={localePrefixed('/pricing')} className="text-gray-700 hover:text-primary-600 transition-colors">
              {tNav('pricing')}
            </Link>
            <Link href={localePrefixed('/partners')} className="text-gray-700 hover:text-primary-600 transition-colors">
              {tNav('partners')}
            </Link>
            <Link href={localePrefixed('/api')} className="text-gray-700 hover:text-primary-600 transition-colors">
              {tNav('api')}
            </Link>
            {/* Blog link without locale prefix as per shown.io/ar (this might need reconsideration for consistency) */}
            <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">
              {tNav('blog')}
            </Link>
          </nav>

          {/* Action Buttons and Language Switcher */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 rtl:space-x-reverse">
            <LanguageSwitcher />
            <Link
              href={appLink('/login')}
              className="text-gray-700 hover:text-primary-600 transition-colors px-3 py-2" // Adjusted padding
            >
              {t('login')}
            </Link>
            <Link
              href={appLink('/create-account')}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity text-sm" // Adjusted padding and text size
            >
              {t('createAccount')}
            </Link>
          </div>

          {/* Mobile Menu Button (functionality not implemented in this step) */}
          <div className="md:hidden flex items-center">
            <LanguageSwitcher /> {/* Also show switcher on mobile */}
            <button className="ml-2 text-gray-700 focus:outline-none"> {/* Added margin for spacing */}
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
