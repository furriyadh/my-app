
'use client'; // Keep because useRouter is a client hook

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Keep this import

// Removed useTranslations import and usage

const Header: React.FC = () => {
  // Removed const t = ('header');
  const router = useRouter(); // Keep this if needed for other functionality

  return (
    <header className="py-4 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo links to the root */}
            <Link href="/" className="flex items-center"> 
              <Image 
                src="/assets/images/logo.svg" 
                alt="شعار Shown.io" // Changed alt text to Arabic
                width={150} 
                height={40} 
                className="h-10 w-auto"
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            {/* Links updated to remove /ar/ prefix and use hardcoded Arabic text */}
            <Link href="/integrations" className="text-gray-700 hover:text-primary-600 transition-colors">
              التكاملات {/* Replaced t('nav.integrations') */}
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-primary-600 transition-colors">
              الأسعار {/* Replaced t('nav.pricing') */}
            </Link>
            <Link href="/partners" className="text-gray-700 hover:text-primary-600 transition-colors">
              الشركاء {/* Replaced t('nav.partners') */}
            </Link>
            <Link href="/api" className="text-gray-700 hover:text-primary-600 transition-colors">
              API {/* Replaced t('nav.api') - Or use واجهة برمجة التطبيقات */}
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">
              المدونة {/* Replaced t('nav.blog') */}
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Link 
              href="https://app.shown.io/create-account?lang=ar" // External link, kept as is
              className="hidden md:inline-block px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              إنشاء حساب {/* Replaced t('header.createAccount') */}
            </Link>
            
            {/* Mobile menu button - No text changes needed here */}
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

