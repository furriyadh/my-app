import React from 'react';
import Image from 'next/image';

// Removed useTranslations import and usage

const CampaignSection: React.FC = () => {
  // Removed const t = ('campaign');

  return (
    <section className="section-4 py-4">
      <div className="container my-5 mx-auto px-4">
        <h2 
          className="text-3xl font-medium text-center mb-8" 
          data-aos="fade-up"
        >
          أطلق حملاتك التسويقية <br /> {/* Replaced {t('campaign.title.first')} */}
          بكل سهولة وفعالية <span className="text-gradient-purple"></span> {/* Replaced {t('campaign.title.second')} */}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-aos="fade-in">
          <div className="relative">
            <div className="ad-image">
              <Image 
                src="/assets/images/Logo-pp.svg" 
                alt="شعار" // Changed alt text to Arabic
                width={200} 
                height={100} 
              />
              <div className="masked-bg hidden md:block"></div>
              <div className="masked-bg-m md:hidden"></div>
            </div>
            <div className="eff-text text-left hidden md:block">
              <h3 className="text-xl font-medium">أداء فائق</h3> {/* Replaced {t('campaign.performance.title')} */}
              <p>تابع أداء حملاتك وحسن نتائجها باستمرار.</p> {/* Replaced {t('campaign.performance.description')} */}
            </div>
          </div>
          
          <div className="mx-auto text-center">
            <Image 
              className="eff-sample" 
              src="/assets/images/efforts.png" 
              alt="جهود الحملة" // Changed alt text to Arabic
              width={500} 
              height={400} 
            />
          </div>
          
          <div className="md:hidden">
            <div className="px-3 mt-5">
              <h3 className="text-xl font-medium">أداء فائق</h3> {/* Replaced {t('campaign.performance.title')} */}
              <p>تابع أداء حملاتك وحسن نتائجها باستمرار.</p> {/* Replaced {t('campaign.performance.description')} */}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="relative">
                <Image 
                  src="/assets/images/s4-r2-c1.png" 
                  className="img-left w-full" 
                  alt="أتمتة بالذكاء الاصطناعي" // Changed alt text to Arabic
                  width={500} 
                  height={300} 
                />
                <div className="spinnerg absolute bottom-4 right-4">
                  {/* SVG kept as is */}
                  <svg width="25" height="25" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12.5" cy="13.0999" r="12.5" fill="#0188FF"/>
                    <path d="M12.755 7.84985C9.85274 7.84985 7.5 10.2026 7.5 13.1049C7.5 16.0071 9.85274 18.3599 12.755 18.3599C14.8624 18.3599 16.68 17.1194 17.5176 15.3288" stroke="url(#paint0_linear_0_1)" strokeWidth="2.4" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="paint0_linear_0_1" x1="12.3501" y1="9.42747" x2="20.6281" y2="12.6113" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white"/>
                        <stop offset="1" stopColor="white" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-medium">أتمتة ذكية</h3> {/* Replaced {t('campaign.automation.title')} */}
                <p className="text-gray-700 mt-2">استفد من الذكاء الاصطناعي لأتمتة مهامك التسويقية.</p> {/* Replaced {t('campaign.automation.description')} */}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div>
                <Image 
                  src="/assets/images/social.png" 
                  className="img-right w-full" 
                  alt="منصات اجتماعية" // Changed alt text to Arabic
                  width={500} 
                  height={300} 
                />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-medium">منصات متعددة</h3> {/* Replaced {t('campaign.platforms.title')} */}
                <p className="text-gray-700 mt-2">أدر حملاتك عبر مختلف المنصات الاجتماعية من مكان واحد.</p> {/* Replaced {t('campaign.platforms.description')} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampaignSection;

