import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const OptimizationSection: React.FC = () => {
  const t = useTranslations('optimization');

  return (
    <section className="section-5 py-4">
      <div className="container my-md-5 mx-auto px-4" >
        <h2 
          className="text-3xl font-medium text-center mb-6" 
          data-aos="fade-up"
        >
          <span className="text-gradient-purple">{t('optimization.title')}</span>
        </h2>
        <p 
          className="text-gray-700 text-center max-w-3xl mx-auto mb-10" 
          data-aos="fade-in"
        >
          {t('optimization.description')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <Image 
                src="/assets/images/opt-1e.png" 
                data-h="/assets/images/home-2.gif" 
                alt="Keyword optimization"
                width={400}
                height={300}
                className="w-full h-auto mb-4"
              />
              <h3 className="text-xl font-medium">{t('optimization.keywords')}</h3>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <Image 
                src="/assets/images/opt-2.png" 
                data-h="/assets/images/home-3.gif" 
                alt="A/B testing"
                width={400}
                height={300}
                className="w-full h-auto mb-4"
              />
              <h3 className="text-xl font-medium">{t('optimization.abTesting')}</h3>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <Image 
                src="/assets/images/opt-3.png" 
                data-h="/assets/images/opt-3.png" 
                alt="Targeting suggestions"
                width={400}
                height={300}
                className="w-full h-auto mb-4"
              />
              <h3 className="text-xl font-medium">{t('optimization.targeting')}</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OptimizationSection;
