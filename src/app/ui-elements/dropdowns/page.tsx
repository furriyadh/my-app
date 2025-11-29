"use client";

import DropdownStyle1 from "@/components/UIElements/Dropdowns/DropdownStyle1";
import DropdownStyle2 from "@/components/UIElements/Dropdowns/DropdownStyle2";
import DropdownStyle3 from "@/components/UIElements/Dropdowns/DropdownStyle3";
import DropdownStyle4 from "@/components/UIElements/Dropdowns/DropdownStyle4";
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
        <h5 className="!mb-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? 'القوائم المنسدلة' : 'Dropdowns'}</h5>

        <ol className="breadcrumb mt-[12px] md:mt-0">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard/ecommerce/"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-primary-500"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-primary-500 top-1/2 -translate-y-1/2">
                home
              </i>
              Dashboard
            </Link>
          </li>

          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            UI Elements
          </li>

          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            Dropdowns
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] mb-[25px]">
        <DropdownStyle1 />

        <DropdownStyle2 />

        <DropdownStyle3 />

        <DropdownStyle4 />
      </div>
    </>
  );
}
