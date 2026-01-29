"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";

export default function TwoWaysSection() {
    const { language, isRTL } = useTranslation();

    return (
        <section className="py-16 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="container mx-auto max-w-5xl">
                {/* Section Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {language === 'ar' ? 'طريقتان' : 'Two Ways'}
                    </span>
                    <span className="text-white">
                        {language === 'ar' ? ' لإدارة إعلاناتك' : ' to Manage Your Ads'}
                    </span>
                </h2>

                {/* Two Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {/* Option 1: Use Furriyadh Ad Accounts */}
                    <div className="bg-[#0d1829] border border-gray-700/50 rounded-2xl p-6 lg:p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {language === 'ar'
                                ? 'استخدم حسابات Furriyadh الإعلانية'
                                : 'Use Furriyadh Ad Accounts'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {language === 'ar'
                                ? 'يدير Furriyadh حساباتك الإعلانية، مركّزاً إدارة ميزانية الوسائط والمدفوعات لتسهيل رحلتك.'
                                : 'Furriyadh manages your ad accounts, centralizing media budget management and payments to simplify your journey.'}
                        </p>
                        <div className="inline-block bg-purple-500/20 border border-purple-500/30 rounded-full px-6 py-2">
                            <span className="text-purple-400 font-semibold">
                                {language === 'ar'
                                    ? 'عمولة 20% على ميزانية الإعلانات'
                                    : '20% Commission on Ad Budget'}
                            </span>
                        </div>
                    </div>

                    {/* Option 2: Use Your Own Ad Accounts */}
                    <div className="bg-[#0d1829] border border-gray-700/50 rounded-2xl p-6 lg:p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {language === 'ar'
                                ? 'استخدم حساباتك الإعلانية الخاصة'
                                : 'Use Your Own Ad Accounts'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {language === 'ar'
                                ? 'اربط حساباتك الحالية وادفع ميزانية الوسائط مباشرة عبر منصات الإعلان.'
                                : 'Link your existing accounts and pay media budget directly through ad platforms.'}
                        </p>
                        <div className="inline-block bg-green-500/20 border border-green-500/30 rounded-full px-6 py-2">
                            <span className="text-green-400 font-semibold">
                                {language === 'ar'
                                    ? 'عمولة 0% على ميزانية الإعلانات'
                                    : '0% Commission on Ad Budget'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Trustpilot Badge Placeholder */}
                <div className="text-center mt-12 pt-8">
                    <div className="inline-flex items-center gap-2 bg-gray-800/50 rounded-full px-6 py-3">
                        <span className="text-yellow-400">★★★★★</span>
                        <span className="text-gray-300 text-sm">
                            {language === 'ar' ? 'تقييم 4.8/5 من عملائنا' : 'Rated 4.8/5 by our customers'}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
