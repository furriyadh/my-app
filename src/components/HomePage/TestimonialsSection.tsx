"use client";

import { Star } from "lucide-react";
import { 
  ThreeDScrollTriggerContainer, 
  ThreeDScrollTriggerRow 
} from "@/components/lightswind/3d-scroll-trigger";

const testimonials = [
  {
    name: "Ahmed Mohamed",
    handle: "@ahmedmohamed",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    text: "Amazing platform! Saved us tons of time and effort managing our ad campaigns. Results exceeded all expectations.",
    rating: 5,
  },
  {
    name: "Fatima Al-Saeed",
    handle: "@fatimaalsaeed",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    text: "The AI helped me target customers precisely. My sales increased by 150% in just one month!",
    rating: 5,
  },
  {
    name: "Khaled Al-Otaibi",
    handle: "@khaledalotaibi",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    text: "Best investment I made for my company. Excellent support and amazing results. Highly recommended!",
    rating: 5,
  },
  {
    name: "Noura Al-Shammari",
    handle: "@noorahalshammari",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    text: "Easy to use and very effective. Even without prior experience, I was able to create professional campaigns.",
    rating: 5,
  },
  {
    name: "Mohammed Al-Ghamdi",
    handle: "@mohammadalghamdi",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    text: "The analytics and reports are very detailed. I can make decisions based on accurate data.",
    rating: 5,
  },
  {
    name: "Sarah Al-Qahtani",
    handle: "@sarahalqahtani",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    text: "The platform combines everything I need in one place. Saved me hours of daily work.",
    rating: 5,
  },
  {
    name: "Abdullah Al-Mutairi",
    handle: "@abdullahmutairi",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
    text: "Our revenue increased significantly after using the platform. Smart automation saves a lot of effort.",
    rating: 5,
  },
  {
    name: "Reem Al-Dosari",
    handle: "@reemaldosari",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    text: "Advanced analytics tools helped me understand my audience better. A complete and wonderful platform!",
    rating: 5,
  },
  {
    name: "Yousef Al-Harbi",
    handle: "@yousefalharbi",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    text: "Excellent customer service and easy-to-use platform. Results showed up from the first week.",
    rating: 5,
  },
  {
    name: "Mona Al-Anazi",
    handle: "@monaalanazi",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    text: "The AI improves campaigns automatically. I no longer worry about managing ads daily.",
    rating: 5,
  },
  {
    name: "Sultan Al-Shahri",
    handle: "@sultanshahri",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    text: "ROI improved by 200%. The platform is worth every penny I paid for it.",
    rating: 5,
  },
  {
    name: "Hind Al-Zahrani",
    handle: "@hindalzahrani",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    text: "Simple user interface and powerful features. I recommend it to every business owner.",
    rating: 5,
  },
];

// Testimonial Card Component
function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="mx-3 w-[380px] sm:w-[420px] shrink-0">
      <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/40 shadow-lg"
          />
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
            <p className="text-gray-400 text-sm">{testimonial.handle}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        {/* Text */}
        <p className="text-gray-300 leading-relaxed text-base flex-grow">{testimonial.text}</p>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  // Split testimonials into three rows
  const row1 = testimonials.slice(0, 4);
  const row2 = testimonials.slice(4, 8);
  const row3 = testimonials.slice(8, 12);

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-purple-300">Client Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">What Our Clients Say About </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Google Ads Management
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Thousands of companies trust our platform to manage their Google Ads campaigns and increase conversions
          </p>
        </div>

        {/* 3D Scroll Trigger Testimonials */}
        <ThreeDScrollTriggerContainer className="space-y-6">
          {/* Row 1 - Moving Right */}
          <ThreeDScrollTriggerRow baseVelocity={2} direction={1}>
            {row1.map((testimonial, index) => (
              <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
            ))}
          </ThreeDScrollTriggerRow>

          {/* Row 2 - Moving Left */}
          <ThreeDScrollTriggerRow baseVelocity={2} direction={-1}>
            {row2.map((testimonial, index) => (
              <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
            ))}
          </ThreeDScrollTriggerRow>

          {/* Row 3 - Moving Right */}
          <ThreeDScrollTriggerRow baseVelocity={2} direction={1}>
            {row3.map((testimonial, index) => (
              <TestimonialCard key={`row3-${index}`} testimonial={testimonial} />
            ))}
          </ThreeDScrollTriggerRow>
        </ThreeDScrollTriggerContainer>
      </div>
    </section>
  );
}
