'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Play,
    SkipForward,
    MonitorPlay,
    Zap,
    ExternalLink,
    Youtube,
    Clock,
    Check,
    AlertCircle,
    Smartphone
} from 'lucide-react';
import GlowButton from '@/components/ui/glow-button';
import { useTranslation } from '@/lib/hooks/useTranslation';
import CampaignProgress from '@/components/ui/campaign-progress';
import ScrollList from '@/components/ui/scroll-list';

// --- DATA ---
const VIDEO_SUB_TYPES = [
    {
        id: '1',
        name: 'إعلان في البث (قابل للتخطي)',
        name_en: 'Skippable In-Stream',
        type: 'SKIPPABLE_IN_STREAM',
        icon: SkipForward,
        urlRequirement: 'optional',
        description_ar: 'يظهر قبل أو أثناء أو بعد مقاطع الفيديو الأخرى. يمكن للمستخدم تخطيه بعد 5 ثوانٍ.',
        description_en: 'Runs before, during, or after other videos. User can skip after 5s.',
        bestFor_ar: 'المبيعات، العملاء المحتملين، حركة الزيارات، الوعي بالعلامة التجارية',
        bestFor_en: 'Sales, Leads, Traffic, Brand Awareness',
        duration_ar: 'لا يوجد حد (يوصى بـ < 3 د)',
        duration_en: 'No limit (Rec. < 3m)',
        skippable_ar: 'نعم، بعد 5 ثوانٍ',
        skippable_en: 'Yes, after 5s',
        costModel_ar: 'CPV (مشاهدة 30 ث أو نقرة)',
        costModel_en: 'CPV (View 30s or Click)',
        biddingStrategy: 'TARGET_CPV',
        recommendedBid: 0.05
    },
    {
        id: '2',
        name: 'إعلان ضمن الخلاصة (In-Feed)',
        name_en: 'In-Feed Video Ad',
        type: 'IN_FEED_VIDEO_AD',
        icon: LayoutGridIcon,
        urlRequirement: 'channel_required', // Special Flag for Channel Selector
        description_ar: 'صورة مصغرة تظهر في نتائج البحث أو "التالي". تدعو للنقر للمشاهدة.',
        description_en: 'Thumbnail in search results or "Up Next". Invites click to watch.',
        bestFor_ar: 'الاعتبار (Consideration)، الترويج للمحتوى',
        bestFor_en: 'Consideration, Content Promotion',
        duration_ar: 'أي طول',
        duration_en: 'Any length',
        skippable_ar: 'يعتمد على الموضع',
        skippable_en: 'Depends on placement',
        costModel_ar: 'CPV (مشاهدة أو نقرة)',
        costModel_en: 'CPV (View or Click)',
        biddingStrategy: 'TARGET_CPV',
        recommendedBid: 0.04
    },
    {
        id: '3',
        name: 'إعلان الملصق الصغير (Bumper)',
        name_en: 'Bumper Ad',
        type: 'BUMPER',
        icon: Zap,
        urlRequirement: 'required',
        description_ar: 'إعلان قصير جداً (6 ثوانٍ أو أقل) لا يمكن تخطيه. للوصول السريع واسع النطاق.',
        description_en: 'Very short (6s or less), non-skippable. For broad reach.',
        bestFor_ar: 'الوعي بالعلامة التجارية والوصول',
        bestFor_en: 'Brand Awareness & Reach',
        duration_ar: '6 ثوانٍ أو أقل',
        duration_en: '6s or less',
        skippable_ar: 'لا (جزء من واجهة المستخدم)',
        skippable_en: 'No (Part of UI)',
        costModel_ar: 'CPM (لكل 1000 ظهور)',
        costModel_en: 'CPM (Per 1000 Impr.)',
        biddingStrategy: 'TARGET_CPM',
        recommendedBid: 5.00
    },
    {
        id: '4',
        name: 'إعلان غير قابل للتخطي',
        name_en: 'Non-Skippable In-Stream',
        type: 'NON_SKIPPABLE_IN_STREAM',
        icon: MonitorPlay,
        urlRequirement: 'required',
        description_ar: 'مدة 15 ثانية (أو أقل). يجب مشاهدته بالكامل قبل عرض الفيديو.',
        description_en: '15s (or less). Must watch full ad before video details.',
        bestFor_ar: 'الوعي بالعلامة التجارية والوصول',
        bestFor_en: 'Brand Awareness & Reach',
        duration_ar: '15 ثانية كحد أقصى',
        duration_en: 'Max 15s',
        skippable_ar: 'لا، غير قابل للتخطي',
        skippable_en: 'No, Non-Skippable',
        costModel_ar: 'CPM (لكل 1000 ظهور)',
        costModel_en: 'CPM (Per 1000 Impr.)',
        biddingStrategy: 'TARGET_CPM',
        recommendedBid: 6.50
    },
    {
        id: '5',
        name: 'إعلان خارج البث (Outstream)',
        name_en: 'Outstream Ad',
        type: 'OUTSTREAM',
        icon: Smartphone,
        urlRequirement: 'required',
        description_ar: 'للجوال فقط. يظهر في المواقع والتطبيقات الشريكة (وليس YouTube).',
        description_en: 'Mobile only. Partner sites & apps (not YouTube).',
        bestFor_ar: 'الوصول (توسيع النطاق خارج YouTube)',
        bestFor_en: 'Reach (Expand beyond YouTube)',
        duration_ar: 'متنوع',
        duration_en: 'Varied',
        skippable_ar: 'لا، غير قابل للتخطي',
        skippable_en: 'No, Non-Skippable',
        costModel_ar: 'vCPM (لكل 1000 ظهور مرئي)',
        costModel_en: 'vCPM (Viewable CPM)',
        biddingStrategy: 'TARGET_CPM',
        recommendedBid: 4.00
    }
];

// Helper icon
function LayoutGridIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
    )
}

// --- Real YouTube Channel Selector Component (ONLY LINKED CHANNELS) ---
const YouTubeChannelSelector = ({ onSelect, selectedId }: { onSelect: (channelId: string) => void; selectedId?: string | null }) => {
    const [linkedChannels, setLinkedChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLinkedChannels = async () => {
            try {
                // First, check localStorage for quick load
                const cachedChannels = localStorage.getItem('cached_youtube_channels');
                const linkedChannelIds = localStorage.getItem('youtube_linked_channels');

                let allChannels: any[] = [];
                let linkedIds: string[] = [];

                // Parse cached channels
                if (cachedChannels) {
                    try {
                        allChannels = JSON.parse(cachedChannels);
                    } catch (e) { /* ignore */ }
                }

                // Parse linked channel IDs
                if (linkedChannelIds) {
                    try {
                        linkedIds = JSON.parse(linkedChannelIds);
                    } catch (e) { /* ignore */ }
                }

                // If we have local data, filter immediately
                if (allChannels.length > 0 && linkedIds.length > 0) {
                    const filtered = allChannels.filter(ch => linkedIds.includes(ch.id));
                    if (filtered.length > 0) {
                        setLinkedChannels(filtered);
                        setLoading(false);
                        return;
                    }
                }

                // Fallback: Fetch from API
                const channelsRes = await fetch('/api/youtube/channels');
                if (channelsRes.ok) {
                    const data = await channelsRes.json();
                    allChannels = data.channels || [];

                    // Check localStorage again for linked IDs (might have been updated)
                    const storedLinkedIds = localStorage.getItem('youtube_linked_channels');
                    if (storedLinkedIds) {
                        try {
                            linkedIds = JSON.parse(storedLinkedIds);
                        } catch (e) { /* ignore */ }
                    }

                    const filtered = allChannels.filter(ch => linkedIds.includes(ch.id));
                    setLinkedChannels(filtered);
                } else {
                    if (channelsRes.status === 401) {
                        setError('unauthorized');
                    } else {
                        setError('failed');
                    }
                }
            } catch (e) {
                setError('failed');
            } finally {
                setLoading(false);
            }
        };
        fetchLinkedChannels();
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Loading linked channels...</p>
            </div>
        );
    }

    if (error === 'unauthorized' || linkedChannels.length === 0) {
        return (
            <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Youtube className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">No Linked Channels</h3>
                <p className="text-gray-400 text-sm mb-4">
                    You need to link a YouTube channel to Google Ads first.
                </p>
                <button
                    onClick={() => window.location.href = '/integrations/youtube-channel'}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-red-900/30"
                >
                    Go to Integrations
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02]">
                <h3 className="text-white font-bold text-lg flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Youtube className="w-4 h-4 text-red-500" />
                    </div>
                    Select Linked Channel
                </h3>
                <p className="text-gray-500 text-xs mt-1">Choose a channel linked to Google Ads</p>
            </div>

            {/* Channel List */}
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {linkedChannels.map((channel) => {
                    const isSelected = selectedId === channel.id;
                    return (
                        <div
                            key={channel.id}
                            onClick={() => onSelect(channel.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${isSelected
                                ? 'bg-red-500/15 border-red-500/60 shadow-lg shadow-red-500/10'
                                : 'bg-white/[0.03] hover:bg-red-500/10 border-transparent hover:border-red-500/40'
                                }`}
                        >
                            {/* Channel Avatar */}
                            {channel.thumbnail ? (
                                <img src={channel.thumbnail} alt={channel.title} className={`w-12 h-12 rounded-xl object-cover border-2 transition-colors ${isSelected ? 'border-red-500' : 'border-white/10'}`} />
                            ) : (
                                <div className={`w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white font-bold text-lg border-2 transition-colors ${isSelected ? 'border-red-500' : 'border-white/10'}`}>
                                    {channel.title?.charAt(0) || 'Y'}
                                </div>
                            )}

                            {/* Channel Info */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold truncate transition-colors ${isSelected ? 'text-red-400' : 'text-white'}`}>{channel.title}</p>
                                <p className="text-gray-500 text-sm truncate">
                                    {parseInt(channel.subscriberCount || '0').toLocaleString()} subscribers • {channel.videoCount || '0'} videos
                                </p>
                            </div>

                            {/* Status & Selection */}
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full font-semibold border border-green-500/30">✓ Linked</span>
                                <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${isSelected
                                    ? 'border-red-500 bg-red-500 shadow-lg shadow-red-500/30'
                                    : 'border-gray-600'
                                    }`}>
                                    <Check className={`w-3 h-3 text-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default function VideoSubtypePage() {
    const router = useRouter();
    const { t, language, isRTL } = useTranslation();

    const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<any>(null); // To store video details if any
    const [conversionUrl, setConversionUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [pendingSubType, setPendingSubType] = useState<string | null>(null);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [isValidUrl, setIsValidUrl] = useState(true);
    // For In-Feed video channel validation
    const [videoChannelId, setVideoChannelId] = useState<string | null>(null);
    const [channelMismatch, setChannelMismatch] = useState(false);

    // Load initial data
    useEffect(() => {
        try {
            const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
            if (campaignData.videoSubType) {
                setSelectedSubType(campaignData.videoSubType);
            }
            if (campaignData.selectedVideo) {
                setSelectedVideo(campaignData.selectedVideo);
            }
            if (campaignData.conversionUrl) {
                setConversionUrl(campaignData.conversionUrl.replace(/^https?:\/\//, ''));
            }
            if (campaignData.linkedChannelId) {
                setSelectedChannelId(campaignData.linkedChannelId);
            }
            // Load video's channel ID for In-Feed validation
            if (campaignData.youtubeChannelId) {
                setVideoChannelId(campaignData.youtubeChannelId);
                console.log('📺 Video Channel ID loaded:', campaignData.youtubeChannelId);
            }
        } catch (error) {
            console.error('Error loading campaign data:', error);
        }
    }, []);

    // Scroll Lock
    useEffect(() => {
        if (showModal) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showModal]);

    // Validation Logic
    useEffect(() => {
        if (!conversionUrl) {
            setIsValidUrl(true);
            return;
        }
        const urlPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)+(\/.*)?\s*$/;
        setIsValidUrl(urlPattern.test(conversionUrl.trim()));
    }, [conversionUrl]);

    const handleSubTypeClick = (type: string) => {
        const subType = VIDEO_SUB_TYPES.find(st => st.type === type);
        setPendingSubType(type);
        setConversionUrl('');
        setSelectedChannelId(null);

        // Show modal if URL/Channel is required/optional
        if (subType && (subType.urlRequirement !== 'none')) {
            setShowModal(true);
        } else {
            setSelectedSubType(type);
            setPendingSubType(null); // Clear pending since we selected immediately
        }
    };

    const confirmSelection = () => {
        if (!pendingSubType) return;
        const info = VIDEO_SUB_TYPES.find(st => st.type === pendingSubType);

        // Validation based on requirement
        if (info?.urlRequirement === 'required' && (!conversionUrl || !isValidUrl)) return;
        if (info?.urlRequirement === 'channel_required' && !selectedChannelId) {
            // Block if channel required and not selected
            return;
        }

        setSelectedSubType(pendingSubType);
        setShowModal(false);
        setPendingSubType(null);
    };

    // Handle URL Input
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConversionUrl(e.target.value);
    };

    // Channel selection handler - validates channel matches video for In-Feed ads
    const handleChannelSelect = (id: string) => {
        console.log('📺 Channel selected:', id);
        console.log('📺 Video Channel ID:', videoChannelId);

        // For IN_FEED_VIDEO_AD, check if selected channel matches video's channel
        if (pendingSubType === 'IN_FEED_VIDEO_AD' && videoChannelId) {
            if (id !== videoChannelId) {
                console.log('⚠️ Channel mismatch detected!');
                setChannelMismatch(true);
                setSelectedChannelId(null);
                return;
            }
        }

        // Channel matches or validation not needed
        setChannelMismatch(false);
        setSelectedChannelId(id);
    };

    const handleModalSave = () => {
        console.log('💾 Saving selection - selectedChannelId:', selectedChannelId);
        if (channelMismatch) {
            return; // Don't save if there's a mismatch
        }
        confirmSelection();
    };

    const handleNext = () => {
        if (!selectedSubType) return;

        const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
        const updatedData = {
            ...campaignData,
            videoSubType: selectedSubType,
            videoAdType: selectedSubType,
            selectedVideo: selectedVideo || campaignData.selectedVideo, // Keep existing if not changed
            youtubeVideoId: selectedVideo?.id || campaignData.youtubeVideoId,
            conversionUrl: conversionUrl ? `https://${conversionUrl}` : null,
            linkedChannelId: selectedChannelId, // Store linked channel
            // logic to set websiteUrl fallback
            websiteUrl: conversionUrl ? `https://${conversionUrl}` : campaignData.websiteUrl || null,
        };
        localStorage.setItem('campaignData', JSON.stringify(updatedData));
        router.push('/campaign/location-targeting');
    };

    const pendingInfo = VIDEO_SUB_TYPES.find(st => st.type === pendingSubType);

    return (
        <div className="min-h-screen bg-black overflow-x-hidden font-sans text-gray-100" dir="ltr">
            <CampaignProgress currentStep={1} totalSteps={4} />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" dir={isRTL ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? 'اختر نوع إعلان الفيديو' : 'Choose Video Ad Type'}
                    </h1>
                </div>

                {/* SCROLL LIST IMPLEMENTATION - WIDER CONTAINER */}
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center">
                        <ScrollList
                            data={VIDEO_SUB_TYPES}
                            renderItem={(subType, index) => {
                                // Define card colors based on index or type
                                const colors = [
                                    'bg-gradient-to-br from-blue-600 to-indigo-700', // Skippable
                                    'bg-gradient-to-br from-red-600 to-rose-700',    // In-Feed (Red for YouTube)
                                    'bg-gradient-to-br from-amber-600 to-orange-700', // Bumper (Fast)
                                    'bg-gradient-to-br from-purple-600 to-violet-700',// Non-Skippable
                                    'bg-gradient-to-br from-emerald-600 to-teal-700'  // Outstream
                                ];
                                const isSelected = selectedSubType === subType.type || pendingSubType === subType.type; // Highlight if selected or pending
                                const Icon = subType.icon;

                                return (
                                    <div
                                        key={subType.id}
                                        onClick={() => handleSubTypeClick(subType.type)}
                                        className={`relative p-5 ${colors[index % colors.length]} rounded-2xl cursor-pointer transition-all duration-200 ease-out h-full flex flex-col justify-between border ${isSelected
                                            ? 'ring-4 ring-white/50 shadow-2xl scale-[1.02] border-white/40'
                                            : 'shadow-lg hover:shadow-xl hover:scale-[1.01] border-white/10'
                                            }`}
                                    >
                                        {/* Selection Checkmark */}
                                        {selectedSubType === subType.type && (
                                            <div className="absolute top-4 right-4 bg-white text-black p-1 rounded-full shadow-lg">
                                                <Check className="w-4 h-4" strokeWidth={3} />
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {/* Header: Icon & Name */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white drop-shadow-md" dir={isRTL ? 'rtl' : 'ltr'}>
                                                        {language === 'ar' ? subType.name : subType.name_en}
                                                    </h3>
                                                    {/* Cost Model Badge Removed */}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-white/90 text-sm leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
                                                {language === 'ar' ? subType.description_ar : subType.description_en}
                                            </p>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                <div className="bg-black/20 rounded-lg p-2 backdrop-blur-sm">
                                                    <p className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {language === 'ar' ? 'المدة' : 'Duration'}
                                                    </p>
                                                    <p className="text-sm font-semibold text-white">
                                                        {language === 'ar' ? subType.duration_ar : subType.duration_en}
                                                    </p>
                                                </div>
                                                <div className="bg-black/20 rounded-lg p-2 backdrop-blur-sm">
                                                    <p className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                                        <Zap className="w-3 h-3" /> {language === 'ar' ? 'الأفضل لـ' : 'Best For'}
                                                    </p>
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {language === 'ar' ? subType.bestFor_ar : subType.bestFor_en}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Action Hint REMOVED */}
                                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/70">
                                            {/* Hint text removed */}
                                        </div>
                                    </div>
                                );
                            }}
                            itemHeight={210} // Reduced height slightly as content was removed
                        />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between items-center max-w-2xl mx-auto">
                        <GlowButton onClick={() => router.push('/campaign/website-url')} variant="green">
                            <div className="flex items-center">
                                <ArrowLeft className="w-5 h-5 mr-2" /> {language === 'ar' ? 'السابق' : 'Previous'}
                            </div>
                        </GlowButton>
                        <GlowButton onClick={handleNext} disabled={!selectedSubType} variant="blue">
                            <div className="flex items-center">
                                {language === 'ar' ? 'التالي' : 'Next Step'} <ArrowRight className="w-5 h-5 ml-2" />
                            </div>
                        </GlowButton>
                    </div>
                </div>
            </div>

            {/* --- Dynamic Modal for URL/Channel Input --- */}
            {showModal && pendingInfo && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md ${isRTL ? 'md:mr-[340px]' : 'md:ml-[340px]'}`} onClick={() => setShowModal(false)}>
                    <div className="relative w-full max-w-xl bg-[#0F1115] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>


                        {/* Modal Header */}
                        <div className={`h-2 w-full bg-gradient-to-r ${pendingInfo.type === 'IN_FEED_VIDEO_AD' ? 'from-red-500 to-red-700' : 'from-blue-500 to-purple-600'}`} />

                        <div className="p-6 text-center flex-1 overflow-y-auto">
                            {/* Icon Animation */}
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className={`absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse ${pendingInfo.type === 'IN_FEED_VIDEO_AD' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                <div className="relative w-full h-full bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                                    <pendingInfo.icon className="w-10 h-10 text-white drop-shadow-md" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                {language === 'ar' ? pendingInfo.name : pendingInfo.name_en}
                            </h2>
                            <p className="text-gray-400 text-sm mb-6 px-4">
                                {language === 'ar' ? 'إعدادات إضافية مطلوبة' : 'Additional setup required'}
                            </p>

                            {/* --- CONDITIONAL CONTENT BASED ON AD TYPE --- */}

                            {/* Case 1: YouTube Channel Selector for In-Feed */}
                            {pendingInfo.urlRequirement === 'channel_required' ? (
                                <div className="space-y-4">
                                    <YouTubeChannelSelector
                                        selectedId={selectedChannelId}
                                        onSelect={(id) => {
                                            handleChannelSelect(id);
                                        }}
                                    />

                                    {/* Channel Mismatch Error */}
                                    {channelMismatch && (
                                        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-center animate-in fade-in duration-300">
                                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <AlertCircle className="w-6 h-6 text-red-500" />
                                            </div>
                                            <h4 className="text-red-400 font-semibold mb-2">
                                                {language === 'ar' ? 'القناة غير متطابقة!' : 'Channel Mismatch!'}
                                            </h4>
                                            <p className="text-gray-400 text-sm mb-4">
                                                {language === 'ar'
                                                    ? 'الفيديو المحدد ليس من هذه القناة. يجب اختيار فيديو من القناة المرتبطة.'
                                                    : 'The selected video is not from this channel. Please choose a video from your linked channel.'}
                                            </p>
                                            <button
                                                onClick={() => router.push('/campaign/website-url')}
                                                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-red-900/30"
                                            >
                                                {language === 'ar' ? 'تغيير الفيديو' : 'Change Video'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Case 2: Standard URL Input */
                                <div className="space-y-4">
                                    <div className="text-left">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">
                                            {language === 'ar' ? 'رابط صفحة الهبوط' : 'Landing Page URL'}
                                            {pendingInfo.urlRequirement === 'optional' && <span className="text-gray-600 normal-case ml-2">(Optional)</span>}
                                        </label>
                                        <div className="relative">
                                            <div className={`absolute -inset-0.5 rounded-xl blur opacity-30 transition-opacity ${conversionUrl ? 'bg-blue-500 opacity-70' : ''}`} />
                                            <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
                                                <span className="pl-4 pr-2 text-gray-500 select-none">https://</span>
                                                <input
                                                    type="text"
                                                    value={conversionUrl}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/^https?:\/\//, '').replace(/^www\./, '');
                                                        setConversionUrl(val);
                                                    }}
                                                    placeholder="yourwebsite.com/product"
                                                    className="w-full bg-transparent py-3 text-white placeholder-gray-600 focus:outline-none"
                                                    autoFocus
                                                />
                                                {isValidUrl && conversionUrl && <Check className="w-5 h-5 text-green-500 mr-3" />}
                                            </div>
                                        </div>
                                        {!isValidUrl && conversionUrl && (
                                            <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Invalid URL format</p>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleModalSave}
                                disabled={
                                    (pendingInfo.urlRequirement === 'required' && (!conversionUrl || !isValidUrl)) ||
                                    (pendingInfo.urlRequirement === 'channel_required' && !selectedChannelId)
                                }
                                className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                                    ${pendingInfo.type === 'IN_FEED_VIDEO_AD'
                                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:shadow-red-900/40'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-900/40'}
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                                `}
                            >
                                {language === 'ar' ? 'تأكيد واختيار' : 'Confirm & Select'}
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
