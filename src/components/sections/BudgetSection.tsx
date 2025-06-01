import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const BudgetSection: React.FC = () => {
  const t = useTranslations('budget');
  return (
    <section className="section-7 py-4 py-md-5 my-md-5">
      <div className="container my-md-2 mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center text-center lg:text-start">
          <div 
            className="lg:w-5/12" 
            data-aos="fade-left"
          >
            <h2 className="text-3xl font-medium mb-4">{t('budget.title')}</h2>
            <p className="text-gray-700">{t('budget.description')}</p>
          </div>
          <div 
            className="lg:w-7/12 relative text-end counter-block" 
            data-aos="zoom-out-left" 
            data-aos-delay="250"
          >
            <Image 
              src="/assets/images/baln-count-e.svg" 
              alt="Balance counter"
              width={500}
              height={300}
              className="w-[90%] h-auto"
            />
            <Image 
              src="/assets/images/home-4ee.gif" 
              alt="Balance animation"
              width={600}
              height={400}
              className="counter-balance absolute end-0 bottom-0 w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetSection;
