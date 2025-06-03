import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const IntegrationSection: React.FC = () => {

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
          دمج سلس مع أدواتك المفضلة <br/>
          <span className="text-gradient-purple">لتحقيق أقصى استفادة</span>
        </h2>
        <p className="text-gray-700 text-center max-w-3xl mx-auto mb-8">
          يمكنك دمج Shown.io بسهولة مع منصات التسويق وإدارة الأعمال التي تستخدمها بالفعل، مما يوفر لك سير عمل متكامل وفعال.
        </p>
        <div className="flex justify-center mt-8">
          <Link 
            href="/ar/integrations" 
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            استكشف جميع التكاملات
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;