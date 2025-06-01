import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

const DashboardSection: React.FC = () => {
  const t = useTranslations('dashboard');

  return (
    <section className="section-6 py-4 py-md-5">
      <div className="container my-md-5 mx-auto px-4">
        <h2 
          className="text-3xl font-medium text-center mb-4" 
          data-aos="fade-up"
        >
          {t('dashboard.title.first')} <br/>
          <span className="text-gradient-purple">{t('dashboard.title.second')}</span>
        </h2>
        <p 
          className="text-gray-700 text-center max-w-3xl mx-auto mb-8" 
          data-aos="fade-in"
        >
          {t('dashboard.description')}
        </p>
        
        <div 
          className="flex justify-center mt-8 mb-6" 
          data-aos="fade-in"
        >
          <Link 
            href="https://app.shown.io/create-account?lang=ar" 
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            {t('dashboard.cta')}
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 pt-4">
          <div 
            className="col-span-1 md:col-span-7" 
            data-aos="fade-right"
          >
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <Image 
                src="/assets/images/cont-1.svg" 
                alt="Dashboard overview"
                width={500}
                height={300}
                className="w-full h-auto mb-4"
              />
              <h3 className="text-xl font-medium">{t('dashboard.overview.title')}</h3>
              <p className="text-gray-700 mt-2">{t('dashboard.overview.description')}</p>
            </div>
          </div>
          
          <div 
            className="col-span-1 md:col-span-5" 
            data-aos="fade-left"
          >
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <Image 
                src="/assets/images/cont-2.svg" 
                alt="Data-driven decisions"
                width={400}
                height={300}
                className="w-full h-auto mb-4"
              />
              <h3 className="text-xl font-medium">{t('dashboard.decisions.title')}</h3>
              <p className="text-gray-700 mt-2">{t('dashboard.decisions.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
