import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const Footer: React.FC = () => {
  const t = useTranslations('footer');

  return (
    <footer className="py-4">
      <div className="container my-md-5 mx-auto px-4">
        <div className="footer-inner">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-4">
            <div>
              <Image 
                src="/assets/images/logo.svg" 
                alt="Shown.io Logo" 
                width={150} 
                height={40} 
                className="h-10 w-auto"
              />
              <div className="footer-social mt-4 flex gap-2">
                <a href="https://twitter.com/shown_io" target="_blank" rel="noreferrer">
                  <Image src="/assets/images/Twitter.svg" width={28} height={28} alt="twitter-logo" />
                </a>
                {/* باقي الروابط الاجتماعية */}
              </div>
            </div>
            
            <div>
              <ul className="footer-links space-y-2">
                <li className="footer-link-item">
                  <Link href="/ar/integrations" className="text-gray-700 hover:text-primary-600 transition-colors">
                    {t('footer.links.integrations' )}
                  </Link>
                </li>
                {/* باقي الروابط */}
              </ul>
            </div>
            
            {/* باقي الأقسام */}
          </div>
          
          <div className="flex flex-col md:flex-row py-3 justify-between">
            <div className="mb-4 md:mb-0">
              <p className="footer-text text-gray-600">© 2025, Shown. All rights reserved.</p>
            </div>
            {/* باقي المحتوى */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
