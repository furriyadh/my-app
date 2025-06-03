import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Removed useTranslations import and usage

const DashboardSection: React.FC = () => {
  // Removed const t = ('dashboard');

  return (
    <section className="section-6 py-4 py-md-5">
      <div className="container my-md-5 mx-auto px-4">
        <h2 
          className="text-3xl font-medium text-center mb-4" 
          data-aos="fade-up"
        >
          لوحة تحكم شاملة <br/> {/* Replaced {t('dashboard.title.first')} */}
          <span className="text-gradient-purple">لإدارة أعمالك</span> {/* Replaced {t('dashboard.title.second')} */}
        </h2>
        <p 
          className="text-gray-700 text-center max-w-3xl mx-auto mb-8" 
          data-aos="fade-in"
        >
          احصل على رؤى قيمة واتخذ قرارات مستنيرة بناءً على بيانات دقيقة ومحدثة. {/* Replaced {t('dashboard.description')} */}
        </p>
        
        <div 
          className="flex justify-center mt-8 mb-6" 
          data-aos="fade-in"
        >
          <Link 
            href="https://app.shown.io/create-account?lang=ar" // External link kept as is
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            إنشاء حساب {/* Replaced {t('dashboard.cta')} - Matched previous CTA */}
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
                alt="نظرة عامة على لوحة التحكم" // Changed alt text to Arabic
                width={500}
                height={300}
                className="w-full h-auto mb-4"
              />
              <h3 className="text-xl font-medium">نظرة عامة شاملة</h3> {/* Replaced {t('dashboard.overview.title')} */}
              <p className="text-gray-700 mt-2">تابع جميع مؤشرات الأداء الرئيسية في مكان واحد.</p> {/* Replaced {t('dashboard.overview.description')} */}
            </div>
          </div>
          
          <div 
            className="col-span-1 md:col-span-5" 
            data-aos="fade-left"
          >
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <Image 
                src="/assets/images/cont-2.svg" 
                alt="قرارات مبنية على البيانات" // Changed alt text to Arabic
                width={400}
                height={300}
                className="w-full h-auto mb-4"
              />
              <h3 className="text-xl font-medium">قرارات مبنية على البيانات</h3> {/* Replaced {t('dashboard.decisions.title')} */}
              <p className="text-gray-700 mt-2">استخدم التحليلات المتقدمة لتحسين استراتيجياتك.</p> {/* Replaced {t('dashboard.decisions.description')} */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;

