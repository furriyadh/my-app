import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const TestimonialsSection: React.FC = () => {
  const t = useTranslations('testimonials');

  return (
    <section className="testimonials py-4 mb-5 mt-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center" data-aos="fade-in">
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Image 
                src="/assets/images/pricing/stars.svg" 
                alt="Five stars" 
                width={120} 
                height={24} 
                className="mb-1"
              />
              <p className="text-gray-700 text-lg">
                {t('testimonials.first.content')}
              </p>
              <div className="flex items-center mt-3">
                <Image 
                  src="/assets/images/pricing/test1.png" 
                  alt="Testimonial author" 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
                <h6 className="mb-0 ms-3 font-medium">Brenton Miller</h6>
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Image 
                src="/assets/images/pricing/stars.svg" 
                alt="Five stars" 
                width={120} 
                height={24} 
                className="mb-1"
              />
              <p className="text-gray-700 text-lg">
                {t('testimonials.second.content')}
              </p>
              <div className="flex items-center mt-3">
                <Image 
                  src="/assets/images/pricing/test2.png" 
                  alt="Testimonial author" 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
                <h6 className="mb-0 ms-3 font-medium">Alexander Skibinskiy</h6>
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Image 
                src="/assets/images/pricing/stars.svg" 
                alt="Five stars" 
                width={120} 
                height={24} 
                className="mb-1"
              />
              <p className="text-gray-700 text-lg">
                {t('testimonials.third.content')}
              </p>
              <div className="flex items-center mt-3">
                <Image 
                  src="/assets/images/pricing/test3.png" 
                  alt="Testimonial author" 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
                <h6 className="mb-0 ms-3 font-medium">Baptiste Michiels</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
