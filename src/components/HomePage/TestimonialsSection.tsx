"use client";

import {
    ThreeDScrollTriggerContainer,
    ThreeDScrollTriggerRow,
} from "@/components/lightswind/3d-scroll-trigger";
import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Emily Chen",
        role: "Product Manager",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        content: "This platform has completely transformed how we manage our ad campaigns. The AI insights are incredibly accurate.",
    },
    {
        name: "Michael Roberts",
        role: "Marketing Director",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        content: "We've seen a 150% increase in ROI since switching to this platform. The automation saves us hours every week.",
    },
    {
        name: "Sarah Johnson",
        role: "Startup Founder",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        content: "Best investment I made for my company. Excellent support and amazing results. Highly recommended!",
    },
    {
        name: "David Kim",
        role: "E-commerce Owner",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        content: "The AI helped me target customers precisely. My sales increased by 150% in just one month!",
    },
    {
        name: "Lisa Anderson",
        role: "Agency Director",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        content: "The platform combines everything I need in one place. Saved me hours of daily work.",
    },
    {
        name: "James Wilson",
        role: "Digital Marketer",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        content: "The analytics and reports are very detailed. I can make decisions based on accurate data.",
    },
    {
        name: "Amanda Lee",
        role: "Growth Lead",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        content: "Advanced analytics tools helped me understand my audience better. A complete and wonderful platform!",
    },
    {
        name: "Robert Taylor",
        role: "Retail Manager",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
        content: "Our revenue increased significantly after using the platform. Smart automation saves a lot of effort.",
    },
    {
        name: "Jennifer Martinez",
        role: "Business Owner",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
        content: "Simple and effective. Even without prior experience, I was able to create professional campaigns.",
    },
];

function TestimonialCard({
    name,
    role,
    avatar,
    content,
}: {
    name: string;
    role: string;
    avatar: string;
    content: string;
}) {
    return (
        <div className="w-[300px] shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 mx-2 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <img
                    src={avatar}
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">{name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{role}</p>
                </div>
            </div>
            <div className="flex gap-1 mb-2" aria-label="5 out of 5 stars" role="img">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" aria-hidden="true" />
                ))}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-normal">
                {content}
            </p>
        </div>
    );
}

export default function TestimonialsSection() {
    const row1 = testimonials.slice(0, 3);
    const row2 = testimonials.slice(3, 6);
    const row3 = testimonials.slice(6, 9);

    return (
        <section className="py-16 md:py-24">
            {/* Container */}
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
                        What our <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Clients Say</span>
                    </h2>
                    <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mt-6">
                        Thousands of companies trust our platform to manage their Google Ads campaigns
                    </p>
                </div>

                {/* 3D Scroll Trigger - 3 Rows */}
                <ThreeDScrollTriggerContainer className="space-y-4 overflow-hidden rounded-xl">
                    <ThreeDScrollTriggerRow baseVelocity={3} direction={1}>
                        {row1.map((testimonial, i) => (
                            <TestimonialCard key={i} {...testimonial} />
                        ))}
                    </ThreeDScrollTriggerRow>

                    <ThreeDScrollTriggerRow baseVelocity={3} direction={-1}>
                        {row2.map((testimonial, i) => (
                            <TestimonialCard key={i} {...testimonial} />
                        ))}
                    </ThreeDScrollTriggerRow>

                    <ThreeDScrollTriggerRow baseVelocity={3} direction={1}>
                        {row3.map((testimonial, i) => (
                            <TestimonialCard key={i} {...testimonial} />
                        ))}
                    </ThreeDScrollTriggerRow>
                </ThreeDScrollTriggerContainer>
            </div>
        </section>
    );
}
