import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

const IntegrationSection: React.FC = () => {
  const t = useTranslations('integration');

  return (
    <section className="section-8">
      <Image 
        src="/assets/images/int-logos.svg" 
        alt="Integration logos"
        width={1200}
        height={100}
        className="int-logos hidden md:block w-full h-auto"
      />
      <Image 
        src="/assets/images/int-logos-m.svg" 
        alt="Integration logos mobile"
        width={600}
        height={100}
        className="int-logos md:hidden w-full h-auto"
      />
      
      <div className="container my-md-5 mx-auto px-4" data-aos="zoom-in">
        <h2 className="text-3xl font-medium text-center mb-4">
          {t('integration.title.first')} <br/>
          <span className="text-gradient-purple">{t('integration.title.second')}</span>
        </h2>
        <p className="text-gray-700 text-center max-w-3xl mx-auto mb-8">
          {t('integration.description')}
        </p>
        <div className="flex justify-center mt-8">
          <Link 
            href="/ar/integrations" 
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            {t('integration.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;
