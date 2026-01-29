"use client";

import React from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Login from "@/components/ui/login";

export default function PricingCTA() {
    const { language, isRTL } = useTranslation();

    return (
        <section className="py-20 text-center relative" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="container 2xl:max-w-[900px] mx-auto px-4">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white mb-4">
                    {language === 'ar' ? 'افتح حسابك المجاني' : 'Open Your Free Account'}
                    <br />
                    <span className="text-primary-600 dark:text-primary-400">
                        {language === 'ar' ? 'وأنشئ حملات إعلانية في ثوانٍ' : 'and Create Ad Campaigns in Seconds'}
                    </span>
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-8">
                    {language === 'ar'
                        ? 'اعتبر Furriyadh كقسم التسويق الآلي الخاص بك، وذكاءً اصطناعياً يُحسّن الإعلانات نيابةً عنك، ودعم على مدار الساعة. ابدأ في أقل من 5 دقائق مع منصتنا الإعلانية الذكية.'
                        : 'Think of Furriyadh as your automated marketing department, AI that optimizes ads for you, and 24/7 support. Get started in less than 5 minutes with our smart advertising platform.'}
                </p>

                {/* CTA Button */}
                <div className="mb-6">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                className="inline-block px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-colors shadow-lg shadow-primary-500/30 text-lg"
                            >
                                {language === 'ar' ? 'إنشاء حساب مجاني' : 'Create Free Account'}
                            </button>
                        </DialogTrigger>
                        <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-fit w-auto [&>button]:hidden">
                            <Login />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Social Proof */}
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {language === 'ar'
                        ? 'تسجيل أكثر من 1000 شركة الأسبوع الماضي!'
                        : 'Over 1000 companies signed up last week!'}
                </p>
            </div>
        </section>
    );
}
