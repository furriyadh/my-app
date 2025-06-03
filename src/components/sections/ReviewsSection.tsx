import React from 'react';
import Image from 'next/image';

const ReviewsSection: React.FC = () => {

  return (
    <section className="section-3 py-4">
      <div className="container my-md-5 mx-auto px-4">
        <div className="row">
          <div className="col mx-auto text-center" data-aos="fade-in">
            <Image 
              src="/assets/images/reviews.svg" 
              alt="التقييمات" // Changed alt text to Arabic
              width={800}
              height={100}
              className="hidden md:block mx-auto"
            />
            <p className="md:hidden text-3xl font-medium">
              موثوق بنا من قبل الآلاف حول العالم <span className="text-gradient-purple">بمتوسط تقييم</span>
            </p>
            <Image 
              src="/assets/images/trustpilot-m.svg" 
              alt="تراست بايلوت" // Changed alt text to Arabic
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