import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const FeaturesSection: React.FC = () => {
  const t = useTranslations('features');
  
  return (
    <section className="section-2 py-4">
      <div className="container my-md-5 mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-5/12">
            <h2 className="text-3xl font-medium mb-4">{t('features.title')}</h2>
            <p className="text-gray-700 mt-4">{t('features.description')}</p>
          </div>
          <div className="lg:w-6/12 hidden md:block">
            <div className="section-2-image relative">
              <div className="logos-container">
                <div id="logos-container" className="flex flex-wrap gap-4 justify-center">
                  <div className="logos-logo">
                    <Image src="/assets/images/social/X.svg" alt="X ads" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Instagram.svg" alt="Instagram ads" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Facebook.svg" alt="Facebook ads" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Google-G.svg" alt="Google ads" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Microsoft.svg" alt="Microsoft ads" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Youtube.svg" alt="Youtube ads" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Linkedin.svg" alt="Linkedin ads" width={32} height={32} />
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Image 
                  src="/assets/images/home-1e2.png" 
                  alt="Features illustration" 
                  width={600} 
                  height={400} 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
