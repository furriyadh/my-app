'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Video, Play, Clock, Eye, Target, Sparkles, AlertCircle, Link as LinkIcon, TrendingUp, Crown, X } from 'lucide-react';
import ScrollList from '@/components/ui/scroll-list';
import GlowButton from '@/components/ui/glow-button';
import { useTranslation } from '@/lib/hooks/useTranslation';
import CampaignProgress from '@/components/ui/campaign-progress';

interface VideoResult {
    id: string;
    title: string;
    channelTitle: string;
    thumbnail: string;
    publishedAt: string;
    viewCount: string;
    description: string;
}

interface VideoSubType {
    id: string;
    name: string;
    name_en: string;
    type: string;
    icon: React.ComponentType<any>;
    urlRequirement: 'required' | 'optional' | 'not_allowed';
}

// Video sub-types data
const VIDEO_SUB_TYPES: VideoSubType[] = [
    {
        id: '1',
        name: 'فيديو متجاوب',
        name_en: 'Video Responsive',
        type: 'VIDEO_RESPONSIVE_AD',
        icon: Sparkles,
        urlRequirement: 'required'
    },
    {
        id: '2',
        name: 'TrueView داخل البث',
        name_en: 'TrueView In-Stream',
        type: 'VIDEO_TRUEVIEW_IN_STREAM_AD',
        icon: Target,
        urlRequirement: 'required'
    },
    {
        id: '3',
        name: 'فيديو في الخلاصة',
        name_en: 'In-Feed Video',
        type: 'IN_FEED_VIDEO_AD',
        icon: Eye,
        urlRequirement: 'not_allowed'
    },
    {
        id: '4',
        name: 'إعلان بامبر',
        name_en: 'Bumper Ad',
        type: 'VIDEO_BUMPER_AD',
        icon: Clock,
        urlRequirement: 'optional'
    },
    {
        id: '5',
        name: 'غير قابل للتخطي',
        name_en: 'Non-Skippable',
        type: 'VIDEO_NON_SKIPPABLE_IN_STREAM_AD',
        icon: Play,
        urlRequirement: 'optional'
    }
];

export default function VideoSubtypePage() {
    const router = useRouter();
    const { language, isRTL } = useTranslation();

    const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
    const [conversionUrl, setConversionUrl] = useState('');
    const [isValidUrl, setIsValidUrl] = useState(true);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [pendingSubType, setPendingSubType] = useState<string | null>(null);

    // Load saved data
    useEffect(() => {
        const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');

        if (campaignData.selectedVideo) {
            setSelectedVideo(campaignData.selectedVideo);
        }

        if (campaignData.conversionUrl) {
            setConversionUrl(campaignData.conversionUrl.replace('https://', ''));
        }

        if (campaignData.videoSubType) {
            setSelectedSubType(campaignData.videoSubType);
        }
    }, []);

    // Disable scroll when modal is open
    useEffect(() => {
        if (showUrlModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showUrlModal]);

    // Handle URL input - strip https:// if pasted
    const handleUrlChange = (value: string) => {
        // Remove https:// or http:// if user pastes full URL
        let cleanUrl = value
            .replace(/^https?:\/\//i, '')
            .replace(/^www\./i, '');
        setConversionUrl(cleanUrl);
    };

    // Validate URL
    useEffect(() => {
        if (!conversionUrl) {
            setIsValidUrl(true);
            return;
        }
        // Pattern for domain without protocol
        const urlPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)+(\/.*)?\s*$/;
        setIsValidUrl(urlPattern.test(conversionUrl.trim()));
    }, [conversionUrl]);

    const getSubTypeInfo = (type: string) => {
        return VIDEO_SUB_TYPES.find(st => st.type === type);
    };

    const handleSubTypeSelect = useCallback((subType: string) => {
        const info = getSubTypeInfo(subType);

        if (!info) return;

        // For "not_allowed" types, select directly without modal
        if (info.urlRequirement === 'not_allowed') {
            setSelectedSubType(subType);
            setConversionUrl(''); // Clear any URL
            window.dispatchEvent(new Event('campaignTypeChanged'));
        } else {
            // For "required" or "optional", show modal
            setPendingSubType(subType);
            setShowUrlModal(true);
        }
    }, []);

    const handleModalSave = () => {
        if (!pendingSubType) return;

        const info = getSubTypeInfo(pendingSubType);
        if (!info) return;

        // For required, check URL is valid
        if (info.urlRequirement === 'required' && (!conversionUrl || !isValidUrl)) {
            return;
        }

        setSelectedSubType(pendingSubType);
        setShowUrlModal(false);
        setPendingSubType(null);
        window.dispatchEvent(new Event('campaignTypeChanged'));
    };

    const handleModalSkip = () => {
        if (!pendingSubType) return;

        setSelectedSubType(pendingSubType);
        setConversionUrl(''); // Clear URL when skipping
        setShowUrlModal(false);
        setPendingSubType(null);
        window.dispatchEvent(new Event('campaignTypeChanged'));
    };

    const handleModalClose = () => {
        setShowUrlModal(false);
        setPendingSubType(null);
    };

    // Get description for sub-type
    const getSubTypeDescription = (type: string): string => {
        const descriptions: { [key: string]: { en: string; ar: string } } = {
            'VIDEO_RESPONSIVE_AD': {
                en: '🎯 Best for: Sales & Website Visits - Drive customers to your website',
                ar: '🎯 الأفضل لـ: المبيعات وزيارات الموقع - حوّل المشاهدين لعملاء'
            },
            'VIDEO_TRUEVIEW_IN_STREAM_AD': {
                en: '💰 Best for: Sales & Leads - Pay only when viewers watch 30 seconds',
                ar: '💰 الأفضل لـ: المبيعات والعملاء المحتملين - ادفع فقط عند المشاهدة'
            },
            'IN_FEED_VIDEO_AD': {
                en: '📺 Best for: Views & Subscribers - Grow your YouTube channel',
                ar: '📺 الأفضل لـ: المشاهدات والمشتركين - زيادة متابعين قناتك'
            },
            'VIDEO_BUMPER_AD': {
                en: '👁️ Best for: Brand Awareness - Short 6-second memorable message',
                ar: '👁️ الأفضل لـ: الوعي بالعلامة - رسالة قصيرة 6 ثواني لا تُنسى'
            },
            'VIDEO_NON_SKIPPABLE_IN_STREAM_AD': {
                en: '📢 Best for: Brand Awareness - Full message guaranteed (15-20s)',
                ar: '📢 الأفضل لـ: الوعي بالعلامة - رسالة كاملة مضمونة (15-20 ثانية)'
            }
        };
        return language === 'ar' ? descriptions[type]?.ar : descriptions[type]?.en;
    };

    // Get badge for sub-type
    const getSubTypeBadge = (type: string): { text: string; text_ar: string; icon: React.ReactNode; bgGradient: string; iconColor: string } | null => {
        const badges: { [key: string]: { text: string; text_ar: string; icon: React.ReactNode; bgGradient: string; iconColor: string } } = {
            'VIDEO_RESPONSIVE_AD': {
                text: '💼 Sales',
                text_ar: '💼 مبيعات',
                icon: <Crown />,
                bgGradient: 'from-yellow-400 via-yellow-500 to-orange-500',
                iconColor: 'text-yellow-100'
            },
            'VIDEO_TRUEVIEW_IN_STREAM_AD': {
                text: '💰 Leads',
                text_ar: '💰 عملاء',
                icon: <TrendingUp />,
                bgGradient: 'from-pink-500 via-rose-500 to-pink-600',
                iconColor: 'text-pink-100'
            },
            'IN_FEED_VIDEO_AD': {
                text: '📺 Views',
                text_ar: '📺 مشاهدات',
                icon: <Eye />,
                bgGradient: 'from-blue-500 via-cyan-500 to-blue-600',
                iconColor: 'text-blue-100'
            },
            'VIDEO_BUMPER_AD': {
                text: '👁️ Awareness',
                text_ar: '👁️ وعي',
                icon: <Clock />,
                bgGradient: 'from-orange-500 via-amber-500 to-orange-600',
                iconColor: 'text-orange-100'
            },
            'VIDEO_NON_SKIPPABLE_IN_STREAM_AD': {
                text: '📢 Awareness',
                text_ar: '📢 وعي',
                icon: <Play />,
                bgGradient: 'from-gray-500 via-gray-600 to-gray-700',
                iconColor: 'text-gray-100'
            }
        };
        return badges[type] || null;
    };

    // Get URL requirement badge
    const getUrlBadge = (requirement: 'required' | 'optional' | 'not_allowed') => {
        switch (requirement) {
            case 'required':
                return { text: 'URL Required', text_ar: 'رابط مطلوب', color: 'bg-red-500/80' };
            case 'optional':
                return { text: 'URL Optional', text_ar: 'رابط اختياري', color: 'bg-blue-500/80' };
            case 'not_allowed':
                return { text: 'No URL', text_ar: 'بدون رابط', color: 'bg-gray-500/80' };
        }
    };

    const canContinue = () => {
        return selectedSubType && selectedVideo;
    };

    const handleNext = useCallback(() => {
        if (!canContinue()) return;

        const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
        const updatedData = {
            ...campaignData,
            videoSubType: selectedSubType,
            selectedVideo: selectedVideo,
            conversionUrl: conversionUrl ? `https://${conversionUrl}` : null
        };
        localStorage.setItem('campaignData', JSON.stringify(updatedData));

        router.push('/campaign/location-targeting');
    }, [selectedSubType, selectedVideo, conversionUrl, router]);

    const pendingSubTypeInfo = pendingSubType ? getSubTypeInfo(pendingSubType) : null;

    return (
        <div className="min-h-screen bg-black overflow-x-hidden" dir="ltr">
            {/* Campaign Progress */}
            <CampaignProgress currentStep={1} totalSteps={4} />

            <div className="container mx-auto px-4 py-4 sm:py-8">
                {/* Header */}
                <div className="text-center mb-2 sm:mb-6">
                    <h1
                        className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        {language === 'ar' ? 'اختر نوع إعلان الفيديو' : 'Choose Video Ad Type'}
                    </h1>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* ScrollList for Video Sub-Types */}
                    <div className="flex justify-center">
                        <ScrollList
                            data={VIDEO_SUB_TYPES}
                            renderItem={(subType: VideoSubType, index: number) => {
                                const colors = [
                                    'bg-gradient-to-br from-red-500 to-rose-600',      // Responsive
                                    'bg-gradient-to-br from-purple-500 to-pink-600',   // TrueView
                                    'bg-gradient-to-br from-blue-500 to-cyan-600',     // In-Feed
                                    'bg-gradient-to-br from-orange-500 to-amber-600',  // Bumper
                                    'bg-gradient-to-br from-gray-600 to-gray-700'      // Non-Skippable
                                ];

                                const checkmarkColors = [
                                    'bg-gradient-to-br from-red-500 to-rose-600 shadow-rose-600/60',
                                    'bg-gradient-to-br from-purple-500 to-pink-600 shadow-pink-600/60',
                                    'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-cyan-600/60',
                                    'bg-gradient-to-br from-orange-500 to-amber-600 shadow-amber-600/60',
                                    'bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-600/60'
                                ];

                                const isSelected = selectedSubType === subType.type;
                                const IconComponent = subType.icon;
                                const badge = getSubTypeBadge(subType.type);
                                const urlBadge = getUrlBadge(subType.urlRequirement);

                                return (
                                    <div
                                        className={`relative p-4 sm:p-5 ${colors[index % colors.length]} rounded-xl cursor-pointer transition-all duration-150 ease-out h-full flex flex-col justify-center border ${isSelected
                                            ? 'ring-2 sm:ring-4 ring-gray-900/30 dark:ring-white/60 shadow-2xl shadow-gray-400/70 dark:shadow-black/40 scale-[1.02] border-gray-300 dark:border-white/30'
                                            : 'shadow-lg shadow-gray-300/60 dark:shadow-black/20 hover:shadow-xl hover:shadow-gray-400/70 dark:hover:shadow-black/30 hover:scale-[1.01] border-gray-200 dark:border-white/10'
                                            }`}
                                        onClick={() => handleSubTypeSelect(subType.type)}
                                    >
                                        {/* Badge */}
                                        {badge && (
                                            <div className="absolute -top-2 -right-1 sm:-right-2 z-10">
                                                <div className={`bg-gradient-to-r ${badge.bgGradient} text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-lg ring-1 sm:ring-2 ring-white/20 backdrop-blur-sm`}>
                                                    <span className={`${badge.iconColor} [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-4 sm:[&>svg]:h-4`}>
                                                        {badge.icon}
                                                    </span>
                                                    <span className="text-[10px] sm:text-xs font-bold drop-shadow-md whitespace-nowrap">
                                                        {language === 'ar' ? badge.text_ar : badge.text}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Checkmark */}
                                        {isSelected && (
                                            <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-10">
                                                <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 ${checkmarkColors[index % checkmarkColors.length]} rounded-full shadow-lg ring-2 ring-white/30`}>
                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={3} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {/* Icon and Title */}
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                                                    <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-md" strokeWidth={2} />
                                                </div>
                                                <h3
                                                    className="text-base sm:text-lg font-bold text-white drop-shadow-md text-left leading-tight"
                                                    dir={isRTL ? 'rtl' : 'ltr'}
                                                >
                                                    {isRTL ? subType.name : subType.name_en}
                                                </h3>
                                            </div>
                                            <p
                                                className="text-white/90 text-xs sm:text-sm leading-snug sm:leading-relaxed drop-shadow text-left mt-2 line-clamp-2"
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                            >
                                                {getSubTypeDescription(subType.type)}
                                            </p>

                                            {/* URL Requirement Badge */}
                                            <div className="mt-2">
                                                <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${urlBadge.color} text-white font-medium`}>
                                                    {language === 'ar' ? urlBadge.text_ar : urlBadge.text}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }}
                            itemHeight={160}
                        />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-4 sm:mt-8 flex justify-between items-center max-w-2xl mx-auto">
                        <GlowButton
                            onClick={() => router.push('/campaign/website-url')}
                            variant="green"
                        >
                            <span className="flex items-center gap-2">
                                <ArrowLeft className="w-5 h-5" />
                                {language === 'ar' ? 'السابق' : 'Previous'}
                            </span>
                        </GlowButton>

                        <GlowButton
                            onClick={handleNext}
                            disabled={!canContinue()}
                            variant="blue"
                        >
                            <span className="flex items-center gap-2">
                                {language === 'ar' ? 'التالي' : 'Next Step'}
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </GlowButton>
                    </div>

                </div>
            </div>

            {/* URL Modal - Premium Design */}
            {showUrlModal && pendingSubTypeInfo && (
                <div className={`fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 ${isRTL ? 'md:right-[350px]' : 'md:left-[350px]'}`} onClick={handleModalClose}>
                    {/* Animated background glow */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse" />
                    </div>

                    {/* Modal Container - stop propagation to prevent closing when clicking inside */}
                    <div className="relative max-w-lg w-full animate-in zoom-in-95 fade-in duration-300" onClick={(e) => e.stopPropagation()}>
                        {/* Glowing border effect */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl opacity-75 blur-sm" />
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl opacity-50" />

                        {/* Modal Content */}
                        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl overflow-hidden">
                            {/* Top gradient line */}
                            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />

                            {/* Header */}
                            <div className="p-6 text-center">
                                {/* Icon with glow */}
                                <div className="relative inline-flex mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60" />
                                    <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                                        <LinkIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {language === 'ar' ? 'أين تريد توجيه العملاء؟' : 'Where do you want to send customers?'}
                                </h2>

                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${pendingSubTypeInfo.urlRequirement === 'required'
                                    ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                                    : 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                                    }`}>
                                    {pendingSubTypeInfo.urlRequirement === 'required' ? (
                                        <>
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {language === 'ar' ? 'مطلوب لإتمام التحويلات' : 'Required for conversions'}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {language === 'ar' ? 'اختياري - يمكنك التخطي' : 'Optional - you can skip'}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Input Section */}
                            <div className="px-6 pb-6">
                                <div className="relative">
                                    {/* Input glow */}
                                    <div className={`absolute -inset-1 rounded-xl blur-md transition-opacity ${conversionUrl && isValidUrl ? 'bg-green-500/30 opacity-100' : 'opacity-0'
                                        }`} />

                                    <div className="relative flex items-center bg-white/5 border border-white/20 rounded-xl overflow-hidden focus-within:border-purple-500/50 transition-colors">
                                        <div className="px-4 py-4 bg-white/10 text-white/60 font-mono text-sm border-r border-white/10">
                                            https://
                                        </div>
                                        <input
                                            type="text"
                                            value={conversionUrl}
                                            onChange={(e) => handleUrlChange(e.target.value)}
                                            placeholder="https://yourwebsite.com"
                                            className="flex-1 px-4 py-4 bg-transparent text-white text-base placeholder-white/30 focus:outline-none"
                                            autoFocus
                                        />
                                        {conversionUrl && isValidUrl && (
                                            <div className="px-4">
                                                <Check className="w-5 h-5 text-green-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!isValidUrl && conversionUrl && (
                                    <p className="text-sm text-red-400 mt-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {language === 'ar' ? 'الرابط غير صحيح - تأكد من الصيغة' : 'Invalid URL - please check the format'}
                                    </p>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-6 bg-white/5 border-t border-white/10 flex gap-4">
                                {pendingSubTypeInfo.urlRequirement === 'optional' && (
                                    <button
                                        onClick={handleModalSkip}
                                        className="flex-1 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {language === 'ar' ? 'تخطي ←' : 'Skip →'}
                                    </button>
                                )}
                                <button
                                    onClick={handleModalSave}
                                    disabled={pendingSubTypeInfo.urlRequirement === 'required' && (!conversionUrl || !isValidUrl)}
                                    className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${pendingSubTypeInfo.urlRequirement === 'required' && (!conversionUrl || !isValidUrl)
                                        ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >
                                    {language === 'ar' ? '✓ حفظ والمتابعة' : '✓ Save & Continue'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Close button - floating */}
                    <button
                        onClick={handleModalClose}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>
            )}
        </div>
    );
}
