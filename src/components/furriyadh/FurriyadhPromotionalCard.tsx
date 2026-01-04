'use client';

import React, { useState } from 'react';
import { Gift, HelpCircle, Check, X, Sparkles, Clock } from 'lucide-react';

interface Props {
    userEmail?: string;
    isRTL?: boolean;
    accountCreatedDate?: string;
    currentSpend?: number;
}

export const FurriyadhPromotionalCard: React.FC<Props> = ({
    userEmail,
    isRTL = false,
    accountCreatedDate,
    currentSpend = 0
}) => {
    const [showGoogleTooltip, setShowGoogleTooltip] = useState(false);
    const [showFurriyadhTooltip, setShowFurriyadhTooltip] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<'A' | 'B' | 'C' | null>(null);

    // Promotional offers
    const googleOffers = [
        { id: 'A', spend: 500, credit: 500, label: isRTL ? 'العرض أ' : 'OFFER A' },
        { id: 'B', spend: 700, credit: 700, label: isRTL ? 'العرض ب' : 'OFFER B' },
        { id: 'C', spend: 900, credit: 900, label: isRTL ? 'العرض ج' : 'OFFER C' },
    ];

    // Furriyadh bonus credit
    const furriyadhBonus = {
        minDeposit: 500,
        bonusCredit: 50,
    };

    // Calculate days remaining (60 days from account creation)
    const getDaysRemaining = () => {
        if (!accountCreatedDate) return 60;
        const created = new Date(accountCreatedDate);
        const now = new Date();
        const diffTime = (created.getTime() + 60 * 24 * 60 * 60 * 1000) - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const daysRemaining = getDaysRemaining();

    // Calculate progress for selected offer
    const getProgress = (requiredSpend: number) => {
        return Math.min((currentSpend / requiredSpend) * 100, 100);
    };

    return (
        <div className="bg-white dark:bg-[#0c1427] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-[480px]" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Content */}
            <div className="p-5 space-y-5 h-full">
                {/* Google Welcome Credit */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Google Logo */}
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-lg font-bold">
                                <span className="text-blue-500">G</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {isRTL ? 'رصيد ترحيبي من Google' : 'Google Welcome Credit'}
                                </span>
                                <div className="relative">
                                    <button
                                        onMouseEnter={() => setShowGoogleTooltip(true)}
                                        onMouseLeave={() => setShowGoogleTooltip(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                    {showGoogleTooltip && (
                                        <div className="absolute z-[100] top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                                                <div className="border-8 border-transparent border-b-gray-900"></div>
                                            </div>
                                            <button
                                                onClick={() => setShowGoogleTooltip(false)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <p className="mb-2">
                                                {isRTL
                                                    ? 'عرض ترحيبي من Google: أنفق المبلغ المطلوب خلال 60 يوم واحصل على رصيد إعلاني مجاني. العرض متاح لحملات Furriyadh فقط.'
                                                    : "Google Welcome Offer: Spend the required amount within 60 days and get free ad credit. This offer applies only to Furriyadh campaigns."
                                                }
                                            </p>
                                            <p className="text-gray-400">
                                                {isRTL ? 'الرصيد المستخدم غير قابل للاسترداد.' : 'Used credits are non-refundable.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            ${currentSpend} of ${selectedOffer ? googleOffers.find(o => o.id === selectedOffer)?.spend : '---'}
                        </span>
                    </div>

                    {/* Offer Selection */}
                    <div className="grid grid-cols-3 gap-3">
                        {googleOffers.map((offer) => (
                            <button
                                key={offer.id}
                                onClick={() => setSelectedOffer(offer.id as 'A' | 'B' | 'C')}
                                className={`relative p-4 rounded-md border-2 transition-all ${selectedOffer === offer.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                {selectedOffer === offer.id && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                )}
                                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-2">
                                    {offer.label}
                                </span>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    ${offer.credit}
                                </div>
                                <div className="text-xs text-blue-500 dark:text-blue-400 mb-2">
                                    {isRTL ? 'رصيد إعلاني' : 'in ad credit'}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {isRTL
                                        ? `أنفق $${offer.spend} في أول 60 يوم`
                                        : `Spend $${offer.spend} with Google Ads in the first 60 days to unlock the credit.`
                                    }
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Premium Progress Bar - Always Visible */}
                    <div className="space-y-3 pt-2">
                        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                            {/* Animated gradient progress */}
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${getProgress(selectedOffer ? googleOffers.find(o => o.id === selectedOffer)?.spend || 500 : 500)}%` }}
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                {daysRemaining} {isRTL ? 'يوم متبقي' : 'days remaining'}
                            </span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {getProgress(selectedOffer ? googleOffers.find(o => o.id === selectedOffer)?.spend || 500 : 500).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Furriyadh Welcome Credit */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Furriyadh Logo */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {isRTL ? 'رصيد ترحيبي من Furriyadh' : 'Furriyadh Welcome Credit'}
                                </span>
                                <div className="relative">
                                    <button
                                        onMouseEnter={() => setShowFurriyadhTooltip(true)}
                                        onMouseLeave={() => setShowFurriyadhTooltip(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                    {showFurriyadhTooltip && (
                                        <div className="absolute z-[100] top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                                                <div className="border-8 border-transparent border-b-gray-900"></div>
                                            </div>
                                            <button
                                                onClick={() => setShowFurriyadhTooltip(false)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <p>
                                                {isRTL
                                                    ? `أضف $${furriyadhBonus.minDeposit} أو أكثر إلى حسابك في Furriyadh واحصل على $${furriyadhBonus.bonusCredit} رصيد مجاني. متاح بعد 60 يوم من إنشاء الحساب.`
                                                    : `Add $${furriyadhBonus.minDeposit} or more to your Furriyadh account and get $${furriyadhBonus.bonusCredit} free credit. Available after 60 days from account creation.`
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            $0 of ${furriyadhBonus.minDeposit}
                        </span>
                    </div>

                    <p className="text-sm text-purple-600 dark:text-purple-400">
                        {isRTL
                            ? `أضف $${furriyadhBonus.minDeposit} إلى حسابك واحصل على $${furriyadhBonus.bonusCredit} رصيد مجاني من Furriyadh.`
                            : `Add $${furriyadhBonus.minDeposit} of credits to your Furriyadh account and get $${furriyadhBonus.bonusCredit} free credits.`
                        }
                    </p>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: '0%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="px-4 pb-4">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    {isRTL
                        ? '* تطبق الشروط والأحكام. العروض متاحة للحسابات الجديدة فقط.'
                        : '* Terms and conditions apply. Offers available for new accounts only.'
                    }
                </p>
            </div>
        </div>
    );
};

export default FurriyadhPromotionalCard;
