"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md" dir="ltr">
        <div className="trezo-card-content md:pb-[75px] text-center">
          <Image
            src="/images/internal-error.png"
            className="inline-block"
            alt="internal-error-image"
            width={400}
            height={434}
          />
          <h4 className="!text-[19px] md:!text-[21px] !mt-[25px] md:!mt-[33px] !mb-[11px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar' ? 'يبدو أن لدينا خطأ داخلي، يرجى المحاولة مرة أخرى لاحقاً.' : 'Looks like we have an internal error, please try again later.'}
          </h4>
          <p dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar' ? 'لكن لا تقلق! فريقنا يبحث في كل مكان بينما تنتظر بأمان.' : 'But no worries! Our team is looking ever where while you wait safely.'}
          </p>
          <Link
            href="/dashboard/ecommerce/"
            className="inline-block font-medium rounded-md md:text-md mt-[2px] md:mt-[12px] py-[12px] px-[25px] text-white bg-primary-500 transition-all hover:bg-primary-400"
          >
            {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
          </Link>
        </div>
      </div>
    </>
  );
}
