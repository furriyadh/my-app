'use client';

import React, { useEffect, useState } from 'react';
import { Smartphone, Download, Star, Play, ExternalLink } from 'lucide-react';

interface AppData {
    name: string;
    icon: string;
    rating: number;
    downloads: string;
    category: string;
    developer: string;
    platform: string;
}

interface AppPreviewProps {
    headlines?: string[];
    descriptions?: string[];
}

export default function AppPreview({
    headlines = [],
    descriptions = [],
}: AppPreviewProps) {
    const [app, setApp] = useState<AppData>({
        name: 'اسم التطبيق',
        icon: '',
        rating: 4.5,
        downloads: '1M+',
        category: 'تطبيق',
        developer: 'المطور',
        platform: 'android'
    });

    // Load app data from localStorage - selectedApp contains the full app object
    const loadAppData = () => {
        try {
            const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
            const selectedApp = campaignData.selectedApp || {};

            console.log('📱 Loading app data from localStorage:', selectedApp);

            if (selectedApp.name) {
                setApp({
                    name: selectedApp.name || 'اسم التطبيق',
                    icon: selectedApp.icon || selectedApp.iconUrl || '',
                    rating: selectedApp.rating || 4.5,
                    downloads: selectedApp.downloads || selectedApp.installs || '1M+',
                    category: selectedApp.category || 'App',
                    developer: selectedApp.developer || 'المطور',
                    platform: selectedApp.platform || 'android'
                });
            }
        } catch (error) {
            console.error('Error loading app data:', error);
        }
    };

    useEffect(() => {
        // Load initially
        loadAppData();

        // Listen for storage changes (when other tabs/pages update localStorage)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'campaignData') {
                loadAppData();
            }
        };

        // Listen for custom event (when same page updates localStorage)
        const handleCustomStorageChange = () => {
            loadAppData();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('campaignDataUpdated', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('campaignDataUpdated', handleCustomStorageChange);
        };
    }, []);

    const displayHeadlines = headlines.length > 0 ? headlines : [
        'حمّل التطبيق الآن مجاناً',
        'أفضل تطبيق في فئته'
    ];

    const displayDescriptions = descriptions.length > 0 ? descriptions : [
        'اكتشف تجربة مميزة مع تطبيقنا. تحميل مجاني وسهل الاستخدام.'
    ];

    const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
    const isGooglePlay = app.platform === 'android';

    // Render stars
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />);
            } else if (i === fullStars && hasHalf) {
                stars.push(<Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400/50" />);
            } else {
                stars.push(<Star key={i} className="w-3 h-3 text-gray-400" />);
            }
        }
        return stars;
    };

    return (
        <div className="w-full space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-400" />
                <span className="text-gray-400 text-xs font-medium">App Campaign Preview</span>
            </div>

            {/* Main Card - Google Play / App Store Style */}
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">

                {/* App Header Section */}
                <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                        {/* App Icon */}
                        <div className="flex-shrink-0">
                            {app.icon ? (
                                <img
                                    src={app.icon}
                                    alt={app.name}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-lg"
                                    referrerPolicy="no-referrer"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        // If image fails to load, show fallback
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg ${app.icon ? 'hidden' : ''}`}>
                                <Smartphone className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        {/* App Info */}
                        <div className="flex-1 min-w-0">
                            <h3
                                className="text-gray-900 dark:text-white text-base sm:text-lg font-semibold line-clamp-1"
                                dir={isArabic(app.name) ? 'rtl' : 'ltr'}
                            >
                                {app.name}
                            </h3>

                            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
                                {app.developer}
                            </p>

                            {/* Rating & Downloads */}
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                    {renderStars(app.rating)}
                                    <span className="text-gray-600 dark:text-gray-300 text-xs ml-1">{app.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1">
                                    <Download className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{app.downloads}</span>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="mt-2">
                                <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] rounded-full">
                                    {app.category}
                                </span>
                            </div>
                        </div>

                        {/* Install Button */}
                        <button className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isGooglePlay
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}>
                            {isGooglePlay ? 'تثبيت' : 'تحميل'}
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* Ad Content Section */}
                <div className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-900/50">
                    {/* Sponsored Label */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            إعلان
                        </span>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {isGooglePlay ? 'Google Play' : 'App Store'}
                        </span>
                    </div>

                    {/* Headlines */}
                    <h4
                        className="text-blue-600 dark:text-blue-400 text-sm sm:text-base font-medium hover:underline cursor-pointer mb-2 line-clamp-2"
                        dir={isArabic(displayHeadlines[0]) ? 'rtl' : 'ltr'}
                    >
                        {displayHeadlines.slice(0, 2).join(' | ')}
                    </h4>

                    {/* Description */}
                    <p
                        className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2"
                        dir={isArabic(displayDescriptions[0]) ? 'rtl' : 'ltr'}
                    >
                        {displayDescriptions[0]}
                    </p>

                    {/* App Store Badge */}
                    <div className="flex items-center gap-2 mt-4">
                        {isGooglePlay ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-lg">
                                <Play className="w-4 h-4 text-white fill-white" />
                                <div className="text-left">
                                    <p className="text-[8px] text-gray-300">GET IT ON</p>
                                    <p className="text-xs text-white font-medium">Google Play</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-lg">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83z" />
                                </svg>
                                <div className="text-left">
                                    <p className="text-[8px] text-gray-300">Download on the</p>
                                    <p className="text-xs text-white font-medium">App Store</p>
                                </div>
                            </div>
                        )}

                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
}
