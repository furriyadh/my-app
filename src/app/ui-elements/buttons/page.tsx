"use client";

import { Button } from "@/components/ui/Button";
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
        <h5 className="!mb-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? 'الأزرار' : 'Buttons'}</h5>

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
            Buttons
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] mb-[25px]">
        {/* Basic Buttons */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6">
          <h6 className="text-lg font-semibold mb-4">Basic Buttons</h6>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">Custom</Button>
          </div>
        </div>

        {/* Outline Buttons */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6">
          <h6 className="text-lg font-semibold mb-4">Outline Buttons</h6>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Outline Default</Button>
            <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
              Outline Destructive
            </Button>
            <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
              Outline Success
            </Button>
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
              Outline Info
            </Button>
          </div>
        </div>

        {/* Block Buttons */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 lg:col-span-2">
          <h6 className="text-lg font-semibold mb-4">Block Buttons</h6>
          <div className="space-y-3">
            <Button className="w-full" variant="default">
              Block Button Default
            </Button>
            <Button className="w-full" variant="destructive">
              Block Button Destructive
            </Button>
            <Button className="w-full bg-gray-500 hover:bg-gray-600 text-white">
              Block Button Secondary
            </Button>
            <Button className="w-full" variant="outline">
              Block Button Outline
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

