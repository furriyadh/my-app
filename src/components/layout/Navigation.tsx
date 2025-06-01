import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
// مكون التنقل بين الصفحات
const Navigation: React.FC = () => {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const router = useRouter();
  
  // تحديد اللغة الحالية من المسار
  const currentLocale = pathname?.split('/')[1] || 'ar';
  
  // تغيير اللغة
  const changeLanguage = (newLocale: string) => {
    // استبدال اللغة الحالية في المسار
    const newPath = pathname?.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath || `/${newLocale}`);
  };
  
  // التحقق من الصفحة النشطة
  const isActive = (path: string) => {
    return pathname?.includes(path);
  };
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* القائمة الرئيسية */}
          <div className="hidden md:flex space-x-6 rtl:space-x-reverse">
            <Link 
              href={`/${currentLocale}/integrations`}
              className={`text-gray-700 hover:text-primary-600 transition-colors ${isActive('/integrations') ? 'font-medium text-primary-600' : ''}`}
            >
              {t('nav.integrations')}
            </Link>
            <Link 
              href={`/${currentLocale}/pricing`}
              className={`text-gray-700 hover:text-primary-600 transition-colors ${isActive('/pricing') ? 'font-medium text-primary-600' : ''}`}
            >
              {t('nav.pricing')}
            </Link>
            <Link 
              href={`/${currentLocale}/partners`}
              className={`text-gray-700 hover:text-primary-600 transition-colors ${isActive('/partners') ? 'font-medium text-primary-600' : ''}`}
            >
              {t('nav.partners')}
            </Link>
            <Link 
              href={`/${currentLocale}/api`}
              className={`text-gray-700 hover:text-primary-600 transition-colors ${isActive('/api') ? 'font-medium text-primary-600' : ''}`}
            >
              {t('nav.api')}
            </Link>
            <Link 
              href={`/${currentLocale}/blog`}
              className={`text-gray-700 hover:text-primary-600 transition-colors ${isActive('/blog') ? 'font-medium text-primary-600' : ''}`}
            >
              {t('nav.blog')}
            </Link>
          </div>
          
          {/* مفتاح تغيير اللغة */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button 
              onClick={() => changeLanguage(currentLocale === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
            >
              {currentLocale === 'ar' ? 'English' : 'العربية'}
            </button>
            
            {/* زر القائمة للشاشات الصغيرة */}
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
