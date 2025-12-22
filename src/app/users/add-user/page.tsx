"use client";

import AddUserForm from "@/components/Users/AddUserForm";
import Link from "next/link";
import { useState, useEffect } from 'react';

export default function Page() {
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

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between" dir="ltr">
        <h5 className="!mb-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? 'إضافة مستخدم' : 'Add User'}</h5>

        <ol className="breadcrumb mt-[12px] md:mt-0">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard/ecommerce/"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-primary-500"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-primary-500 top-1/2 -translate-y-1/2">
                home
              </i>
              {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </Link>
          </li>

          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <span dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? 'المستخدمون' : 'Users'}</span>
          </li>

          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <span dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? 'إضافة مستخدم' : 'Add User'}</span>
          </li>
        </ol>
      </div>

      <AddUserForm />
    </>
  );
}
