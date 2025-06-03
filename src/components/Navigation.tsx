
'use client'; // Keep if other client hooks/interactions remain, remove if not needed

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Keep for isActive logic
// Removed useRouter as it was only used for language change
// Removed useTranslations

// مكون التنقل بين الصفحات (نسخة معدلة للعربية فقط)
const Navigation: React.FC = () => {
  // Removed t = ('navigation');
  const pathname = usePathname(); // Keep for isActive
  // Removed router = useRouter();
  
  // Removed currentLocale logic
  // Removed changeLanguage function
  
  // التحقق من الصفحة النشطة (تم تبسيطه ليعمل بدون بادئة اللغة)
  const isActive = (path: string) => {
    // Check if the current pathname (without query params) ends with the path
    // or exactly matches the path (for root)
    const currentPath = pathname?.split('?')[0];
    return currentPath === path || (path !== '/' && currentPath?.endsWith(path));
  };
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* القائمة الرئيسية */}
          <div className="hidden md:flex space-x-6 rtl:space-x-reverse">
            {/* Links updated to remove locale prefix and use hardcoded Arabic text */}
            <Link 
              href="/integrations"
              className={`text-gray-700 hover:text-primary-600 transition-colors ${isActive('/integrations') ? 'font-medium text-primary-600' : ''}`}
            >
              التكاملات {/* Replaced {t('nav.integrations')} */}
            </Link>
            <Link 
              href="/pricing"
              className={`text-gray-700 hover:text-primary-600 transition-colors ${isActive('/pricing') ? 'font-medium text-primary-600' : ''}`}
            >
              الأسعار {/* Replaced {t('nav.pricing')} */}
            </Link>
            <Link 
              href="/partners"
              className={`text-gray-700 hover:text-primary-600 transition-colors ${isActive('/partners') ? 'font-medium text-primary-600' : ''}`}
            >
              الشركاء {/* Replaced {t('nav.partners')} */}
            </Link>
            <Link 
              href="/api"
              className={`text-gray-700 hover:text-primary-600 transition-colors ${isActive('/api') ? 'font-medium text-primary-600' : ''}`}
            >
              API {/* Replaced {t('nav.api')} - Or use واجهة برمجة التطبيقات */}
            </Link>
            <Link 
              href="/blog"
              className={`text-gray-700 hover:text-primary-600 transition-colors ${isActive('/blog') ? 'font-medium text-primary-600' : ''}`}
            >
              المدونة {/* Replaced {t('nav.blog')} */}
            </Link>
          </div>
          
          {/* تم إزالة مفتاح تغيير اللغة */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
             {/* زر القائمة للشاشات الصغيرة - Kept for mobile responsiveness */}
            <button className="md:hidden text-gray-700 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

