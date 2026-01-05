"use client";

import React from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Star } from "lucide-react";

const testimonials = [
    {
        nameEn: "Ahmed Al-Rashid",
        nameAr: "أحمد الراشد",
        textEn: "Furriyadh helped me scale my Google Ads campaigns effortlessly. The AI optimization saved me hours every week!",
        textAr: "ساعدني Furriyadh في توسيع حملاتي الإعلانية على جوجل بسهولة. التحسين بالذكاء الاصطناعي وفر لي ساعات كل أسبوع!",
        rating: 5,
    },
    {
        nameEn: "Sara Mohammed",
        nameAr: "سارة محمد",
        textEn: "The verified accounts feature is a game changer. No more worrying about ad account suspensions!",
        textAr: "ميزة الحسابات الموثوقة غيرت قواعد اللعبة. لا مزيد من القلق بشأن تعليق الحسابات الإعلانية!",
        rating: 5,
    },
    {
        nameEn: "Khalid Ibrahim",
        nameAr: "خالد إبراهيم",
        textEn: "Excellent support team and the AI ad copy generator creates compelling ads that convert. Highly recommend!",
        textAr: "فريق دعم ممتاز ومولد نسخ الإعلانات بالذكاء الاصطناعي ينشئ إعلانات جذابة تحقق نتائج. أوصي به بشدة!",
        rating: 5,
    },
];

export default function PricingTestimonials() {
    const { language, isRTL } = useTranslation();

    return (
        <section className="py-16" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="container 2xl:max-w-[1200px] mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6">
                                {language === 'ar' ? testimonial.textAr : testimonial.textEn}
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                    {(language === 'ar' ? testimonial.nameAr : testimonial.nameEn).charAt(0)}
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {language === 'ar' ? testimonial.nameAr : testimonial.nameEn}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
