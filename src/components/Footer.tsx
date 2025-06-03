import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// لا حاجة لاستيراد useTranslations

const Footer: React.FC = () => {
  // لا حاجة لتعريف t باستخدام useTranslations
  // const t = ('footer'); // <-- هذا السطر يجب حذفه

  return (
    <footer className="py-4">
      <div className="container my-md-5 mx-auto px-4">
        <div className="footer-inner">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-4">
            <div>
              <Image 
                src="/assets/images/logo.svg" 
                alt="شعار Shown.io" // تعديل النص البديل للعربية
                width={150} 
                height={40} 
                className="h-10 w-auto"
              />
              <div className="footer-social mt-4 flex gap-2">
                <a href="https://twitter.com/shown_io" target="_blank" rel="noreferrer">
                  <Image src="/assets/images/Twitter.svg" width={28} height={28} alt="شعار تويتر" /> {/* تعديل النص البديل */}
                </a>
                {/* باقي الروابط الاجتماعية (تأكد من تعديل النصوص البديلة للصور إذا لزم الأمر ) */}
              </div>
            </div>
            
            <div>
              <ul className="footer-links space-y-2">
                <li className="footer-link-item">
                  {/* تم تعديل الرابط ليكون بدون /ar واستبدال t() بالنص العربي */}
                  <Link href="/integrations" className="text-gray-700 hover:text-primary-600 transition-colors">
                    التكاملات {/* استبدال {t('footer.links.integrations')} */}
                  </Link>
                </li>
                {/* تأكد من استبدال أي استخدامات أخرى لـ t() في باقي الروابط */}
              </ul>
            </div>
            
            {/* تأكد من استبدال أي استخدامات لـ t() في باقي الأقسام */}
          </div>
          
          <div className="flex flex-col md:flex-row py-3 justify-between">
            <div className="mb-4 md:mb-0">
              {/* النص ثابت ولا يحتاج تعديل إلا إذا كان يأتي من الترجمة سابقاً */}
              <p className="footer-text text-gray-600">© 2025, Shown. جميع الحقوق محفوظة.</p> {/* تعديل النص الثابت للعربية */}
            </div>
            {/* باقي المحتوى */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
