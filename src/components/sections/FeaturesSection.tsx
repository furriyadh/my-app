import React from 'react';
import Image from 'next/image';

// Removed useTranslations import and usage

const FeaturesSection: React.FC = () => {
  // Removed const t = ('features');
  
  return (
    <section className="section-2 py-4">
      <div className="container my-md-5 mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-5/12">
            {/* Replaced t('features.title') with hardcoded Arabic text */}
            <h2 className="text-3xl font-medium mb-4">ميزات قوية لإدارة حملاتك</h2> 
            {/* Replaced t('features.description') with hardcoded Arabic text */}
            <p className="text-gray-700 mt-4">استفد من أدواتنا المتقدمة لتحقيق أفضل النتائج عبر جميع المنصات.</p> 
          </div>
          <div className="lg:w-6/12 hidden md:block">
            <div className="section-2-image relative">
              <div className="logos-container">
                <div id="logos-container" className="flex flex-wrap gap-4 justify-center">
                  {/* Updated alt text for logos */}
                  <div className="logos-logo">
                    <Image src="/assets/images/social/X.svg" alt="إعلانات X" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Instagram.svg" alt="إعلانات انستجرام" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Facebook.svg" alt="إعلانات فيسبوك" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Google-G.svg" alt="إعلانات جوجل" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Microsoft.svg" alt="إعلانات مايكروسوفت" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Youtube.svg" alt="إعلانات يوتيوب" width={32} height={32} />
                  </div>
                  <div className="logos-logo">
                    <Image src="/assets/images/social/Linkedin.svg" alt="إعلانات لينكدإن" width={32} height={32} />
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Image 
                  src="/assets/images/home-1e2.png" 
                  alt="رسم توضيحي للميزات" // Changed alt text to Arabic
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

