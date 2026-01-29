"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Login from "@/components/ui/login";

export default function PricingHero() {
    const { language, isRTL } = useTranslation();

    return (
        <section className="pt-[140px] pb-12 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="container 2xl:max-w-[1000px] mx-auto px-4">
                {/* Large Title */}
                <h1 className="!mb-6 !text-[32px] md:!text-[42px] lg:!text-[52px] font-medium -tracking-[1px] text-gray-900 dark:text-white leading-tight">
                    {language === 'ar'
                        ? 'تمكين الشركات الصغيرة ورواد الأعمال من خلال تسعير مرن.'
                        : 'Empowering small businesses & entrepreneurs with flexible pricing.'}
                </h1>

                {/* Subtitle */}
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-8">
                    {language === 'ar'
                        ? 'ابدأ بتجربتنا المجانية. لا حاجة لبطاقة ائتمان.'
                        : 'Start with our free trial. No credit card required.'}
                </p>

                {/* CTA Button */}
                {/* CTA Button */}
                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-colors"
                        >
                            {language === 'ar' ? 'إنشاء حساب مجاني' : 'Create a Free Account'}
                        </button>
                    </DialogTrigger>
                    <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-fit w-auto [&>button]:hidden">
                        <Login />
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}
