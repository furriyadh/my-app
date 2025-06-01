import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const ReviewsSection: React.FC = () => {
  const t = useTranslations('reviews');

  return (
    <section className="section-3 py-4">
      <div className="container my-md-5 mx-auto px-4">
        <div className="row">
          <div className="col mx-auto text-center" data-aos="fade-in">
            <Image 
              src="/assets/images/reviews.svg" 
              alt="Reviews" 
              width={800}
              height={100}
              className="hidden md:block mx-auto"
            />
            <p className="md:hidden text-3xl font-medium">
              {t('reviews.title')} <span className="text-gradient-purple">{t('reviews.highlight')}</span>
            </p>
            <Image 
              src="/assets/images/trustpilot-m.svg" 
              alt="Trustpilot" 
              width={200}
              height={50}
              className="md:hidden mx-auto mt-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
