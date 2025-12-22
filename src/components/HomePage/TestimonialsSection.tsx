"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const testimonials = [
  {
    name: "John Smith",
    handle: "@johnsmith",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    description: "Amazing platform! Saved us tons of time and effort in managing our ad campaigns. Results exceeded all expectations."
  },
  {
    name: "Sarah Johnson",
    handle: "@sarahjohnson",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    description: "The AI helped me target customers precisely. My sales increased by 150% in just one month!"
  },
  {
    name: "Michael Chen",
    handle: "@michaelchen",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    description: "Best investment I made for my company. Excellent support and amazing results. Highly recommended!"
  },
  {
    name: "Emily Davis",
    handle: "@emilydavis",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    description: "Easy to use and very effective. Even without prior experience, I was able to create professional campaigns."
  },
  {
    name: "David Wilson",
    handle: "@davidwilson",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    description: "The analytics and reports are very detailed. I can make decisions based on accurate data."
  },
  {
    name: "Lisa Anderson",
    handle: "@lisaanderson",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    description: "The platform combines everything I need in one place. Saved me hours of daily work."
  },
  {
    name: "Robert Taylor",
    handle: "@roberttaylor",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
    description: "Our revenue increased significantly after using the platform. Smart automation saves a lot of effort."
  },
  {
    name: "Jennifer Martinez",
    handle: "@jennifermartinez",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    description: "Advanced analytics tools helped me understand my audience better. A complete and wonderful platform!"
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="!mb-4 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2] !font-bold !text-white">
            What Our Clients Say About Google Ads Management
          </h2>
          <p className="text-xl text-gray-400">
            Thousands of companies trust our platform to manage their Google Ads campaigns and increase conversions
          </p>
        </div>

        <AnimatedTestimonials
          data={testimonials}
          className="w-full"
          cardClassName="bg-gray-800/50 backdrop-blur-sm border-gray-700"
        />
      </div>
    </section>
  );
}

