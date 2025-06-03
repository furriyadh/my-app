import React from 'react';
import Image from 'next/image';

const TestimonialsSection: React.FC = () => {

  return (
    <section className="testimonials py-4 mb-5 mt-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center" data-aos="fade-in">
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Image 
                src="/assets/images/pricing/stars.svg" 
                alt="خمس نجوم" // Changed alt text to Arabic
                width={120} 
                height={24} 
                className="mb-1"
              />
              <p className="text-gray-700 text-lg">
                "أداة رائعة تتيح لك إنشاء إعلانات احترافية في دقائق. سهلة الاستخدام وتوفر الوقت والجهد."
              </p>
              <div className="flex items-center mt-3">
                <Image 
                  src="/assets/images/pricing/test1.png" 
                  alt="مؤلف الشهادة" // Changed alt text to Arabic
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
                alt="خمس نجوم" // Changed alt text to Arabic
                width={120} 
                height={24} 
                className="mb-1"
              />
              <p className="text-gray-700 text-lg">
                "لقد غيرت Shown.io طريقة عملنا، فقد أصبح إنشاء الإعلانات أسرع وأكثر فعالية بكثير."
              </p>
              <div className="flex items-center mt-3">
                <Image 
                  src="/assets/images/pricing/test2.png" 
                  alt="مؤلف الشهادة" // Changed alt text to Arabic
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
                alt="خمس نجوم" // Changed alt text to Arabic
                width={120} 
                height={24} 
                className="mb-1"
              />
              <p className="text-gray-700 text-lg">
                "لا أصدق مدى سهولة استخدام هذه الأداة! أوصي بها بشدة لأي شخص يحتاج إلى إعلانات عالية الجودة بسرعة."
              </p>
              <div className="flex items-center mt-3">
                <Image 
                  src="/assets/images/pricing/test3.png" 
                  alt="مؤلف الشهادة" // Changed alt text to Arabic
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