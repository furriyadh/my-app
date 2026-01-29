"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Edit,
    Trash2,
    MoreHorizontal,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    Play,
    Pause,
    List,
    Filter,
    ChevronLeft,
    ChevronRight,
    Search,
    ArrowUpDown
} from "lucide-react";
import { formatCurrency, formatLargeNumber } from "@/lib/utils";

interface Campaign {
    id: string;
    name: string;
    status: string;
    type: string;
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    cost: number;
    roas: number;
    currency?: string;
    customerId?: string;
    reviewStatus?: string;
    reviewStatusLabel?: string;
    reviewStatusLabelAr?: string;
    primaryStatus?: string;
    primaryStatusReasons?: string[];
}

interface CampaignsTableProps {
    campaigns: Campaign[];
    loading: boolean;
    selectedCampaigns: string[];
    totalCampaigns: number;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onToggleSelectAll: () => void;
    onToggleSelectCampaign: (id: string) => void;
    onBulkAction: (action: 'enable' | 'pause' | 'delete') => void;
    onToggleStatus: (id: string, currentStatus: string, customerId?: string) => void;
    isRTL: boolean;
}

import Image from "next/image";

// Map campaign types to colors and icons
const getCampaignStyle = (type: string, campaignName: string = '') => {
    const normalizedType = type.replace('_', ' ').toUpperCase();

    // Palette for cycling colors to match the diverse "Old Card" aesthetic if types are uniform
    const palette = [
        'bg-orange-500', // Video/YouTube
        'bg-purple-500', // Display
        'bg-blue-500',   // Search
        'bg-green-500',  // P.Max
        'bg-cyan-500'    // Default/Other
    ];

    // Deterministic color assignment based on campaign name hash
    // This ensures variety (Blue, Orange, Purple etc.) even if all campaigns are "Search" type
    // satisfying the user requirement for non-uniform colors.
    const getColorFromHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % palette.length;
        return palette[index];
    };

    // Use hash-based color primarily to ensure diversity as per user request
    // But keep icons valid for the type
    const assignedColor = getColorFromHash(campaignName || type);

    if (normalizedType.includes('VIDEO') || normalizedType.includes('YOUTUBE')) {
        return {
            color: 'bg-orange-500',
            borderColor: 'border-l-orange-500',
            icon: '/images/icons/youtube.svg',
            label: 'YouTube'
        };
    }
    if (normalizedType.includes('DISPLAY')) {
        return {
            color: 'bg-purple-500',
            borderColor: 'border-l-purple-500',
            icon: '/images/icons/google2.svg',
            label: 'Display'
        };
    }
    if (normalizedType.includes('SEARCH')) {
        return {
            color: 'bg-blue-500',
            borderColor: 'border-l-blue-500',
            icon: '/images/icons/google.svg',
            label: 'Search',
            // Allow override if needed for variety, but Search is blue.
            // If user wants variety, we might need to ignore type for color.
            // For now, let's keep it type-based but maybe use the hash if it's generic?
            // Actually, the user hates "All Blue". 
            // Let's use the assignedColor (random/hash) for the SIDE BAR specifically,
            // while keeping the icon correct.
            // Override strictly for Search to fix the "Blue" complaint if they want variety.
            overrideColor: assignedColor
        };
    }
    if (normalizedType.includes('PERFORMANCE')) {
        return {
            color: 'bg-green-500',
            borderColor: 'border-l-green-500',
            icon: '/images/icons/google2.svg',
            label: 'P.Max'
        };
    }

    // Default fallback
    return {
        color: assignedColor,
        borderColor: `border-l-[${assignedColor.replace('bg-', '')}]`,
        icon: '/images/icons/google.svg',
        label: 'Google'
    };
};

const CampaignsTable: React.FC<CampaignsTableProps> = ({
    campaigns,
    loading,
    selectedCampaigns,
    totalCampaigns,
    currentPage,
    totalPages,
    onPageChange,
    onToggleSelectAll,
    onToggleSelectCampaign,
    onBulkAction,
    onToggleStatus,
    isRTL
}) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"all" | "enabled" | "paused">("all");

    const filteredCampaigns = campaigns.filter(c => {
        if (activeTab === 'all') return true;
        if (activeTab === 'enabled') return c.status === 'ENABLED';
        if (activeTab === 'paused') return c.status === 'PAUSED';
        return true;
    });

    // Helper to get hex color from Tailwind class
    const getHexColor = (tailwindClass: string) => {
        switch (tailwindClass) {
            case 'bg-orange-500': return '#f97316';
            case 'bg-purple-500': return '#a855f7';
            case 'bg-blue-500': return '#3b82f6';
            case 'bg-green-500': return '#22c55e';
            case 'bg-cyan-500': return '#06b6d4';
            default: return '#8b5cf6'; // Default indigo
        }
    };

    return (
        <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md shadow-sm border border-gray-100 dark:border-[#172036]">
            {/* Header */}
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="trezo-card-title flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <List className="w-5 h-5" />
                    </div>
                    <div>
                        <h5 className="!mb-0 text-lg font-bold text-gray-900 dark:text-white">
                            {isRTL ? 'الحملات' : 'Campaigns'}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {totalCampaigns} {isRTL ? 'حملة نشطة' : 'active campaigns'}
                        </p>
                    </div>
                </div>

                {/* Actions & Filters */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {selectedCampaigns.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {selectedCampaigns.length} {isRTL ? 'محدد' : 'selected'}
                            </span>
                            <div className="h-4 w-px bg-blue-200 dark:bg-blue-800 mx-1" />
                            <button onClick={() => onBulkAction('enable')} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded text-blue-600 dark:text-blue-400" title="Enable">
                                <Play className="w-4 h-4" />
                            </button>
                            <button onClick={() => onBulkAction('pause')} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded text-blue-600 dark:text-blue-400" title="Pause">
                                <Pause className="w-4 h-4" />
                            </button>
                            <button onClick={() => onBulkAction('delete')} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400" title="Delete">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/dashboard/google-ads/campaigns/website-url')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
                    >
                        <span className="text-xl leading-none">+</span>
                        <span className="text-sm font-medium">{isRTL ? 'حملة جديدة' : 'New Campaign'}</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="trezo-card-content">
                <div className="trezo-tabs mb-6">
                    <ul className="flex items-center gap-6 border-b border-gray-100 dark:border-gray-800">
                        <li>
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "all"
                                    ? "text-primary-600 dark:text-primary-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary-600 after:dark:bg-primary-400"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                {isRTL ? 'الكل' : 'All'}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab("enabled")}
                                className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "enabled"
                                    ? "text-green-600 dark:text-green-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-green-600 after:dark:bg-green-400"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                {isRTL ? 'نشطة' : 'Enabled'}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab("paused")}
                                className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "paused"
                                    ? "text-gray-800 dark:text-gray-200 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gray-800 after:dark:bg-gray-200"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                {isRTL ? 'متوقفة' : 'Paused'}
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Table with fixed height and scroll */}
                <div className="h-[420px] overflow-y-auto custom-scrollbar pr-2">
                    <table className="w-full">
                        <thead>
                            <tr className="text-gray-500 dark:text-gray-400">
                                <th className="py-3 px-4 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                                        onChange={onToggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer dark:border-gray-600 dark:bg-gray-700"
                                    />
                                </th>
                                <th className="text-left rtl:text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">{isRTL ? 'الحملة' : 'Campaign'}</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">{isRTL ? 'القناة' : 'Channel'}</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">{isRTL ? 'الحالة' : 'Status'}</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">Impr.</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">Clicks</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">CTR</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">Conv.</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">Cost</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">ROAS</th>
                                <th className="text-center py-3 px-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCampaigns.map((campaign) => {
                                const style = getCampaignStyle(campaign.type, campaign.name);
                                // Use overrideColor if present (for Search variety), otherwise style.color
                                const displayColor = (style as any).overrideColor || style.color;
                                return (
                                    <tr
                                        key={campaign.id}
                                        className={`group relative hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200 border-b border-gray-100 dark:border-gray-800 last:border-none ${selectedCampaigns.includes(campaign.id) ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-transparent'}`}
                                    >
                                        <td className="py-4 px-4 text-center relative">
                                            {/* Colored Left Border */}
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg" style={{ backgroundColor: getHexColor(displayColor) }}></div>

                                            <input
                                                type="checkbox"
                                                checked={selectedCampaigns.includes(campaign.id)}
                                                onChange={() => onToggleSelectCampaign(campaign.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer dark:border-gray-600 dark:bg-gray-700"
                                            />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {campaign.name}
                                                </span>

                                                {/* Review Status Badge Removed - Moved to Status Column */}
                                            </div>
                                        </td>

                                        {/* Channel Logic */}
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="bg-white dark:bg-[#0c1427] p-1.5 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm" title={style.label}>
                                                    <Image src={style.icon} alt={style.label} width={16} height={16} className="w-4 h-4" />
                                                </div>
                                                {/* Optionally add extra icons to mimic multi-channel view if desired */}
                                                {/* {Math.random() > 0.7 && (
                                                <div className="bg-white dark:bg-[#0c1427] p-1.5 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm opacity-50">
                                                     <Image src="/images/icons/facebook.svg" alt="Facebook" width={16} height={16} className="w-4 h-4" />
                                                </div>
                                            )} */}
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 text-center">
                                            <div className="flex flex-col items-center justify-center gap-1.5">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => onToggleStatus(campaign.id, campaign.status, campaign.customerId)}
                                                        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${campaign.status === 'ENABLED' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${campaign.status === 'ENABLED' ? 'translate-x-3.5' : 'translate-x-0.5'
                                                                }`}
                                                        />
                                                    </button>

                                                    {/* Status Badge - made more compact */}
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${campaign.status === 'ENABLED'
                                                        ? 'bg-[#1e2a4a] text-[#605dff] border border-[#605dff]/30'
                                                        : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent'
                                                        }`}>
                                                        {campaign.status === 'ENABLED' ? (isRTL ? 'نشطة' : 'Live') : (isRTL ? 'متوقفة' : 'Paused')}
                                                    </span>
                                                </div>

                                                {/* Review Status - consistent styling */}
                                                {(() => {
                                                    const status = campaign.reviewStatus || 'APPROVED';
                                                    if (status === 'UNDER_REVIEW') {
                                                        return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30 w-full justify-center">
                                                            <Clock className="w-3 h-3" /> Under Review
                                                        </span>;
                                                    }
                                                    if (status === 'DISAPPROVED') {
                                                        return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30 w-full justify-center">
                                                            <XCircle className="w-3 h-3" /> Disapproved
                                                        </span>;
                                                    }
                                                    if (status === 'APPROVED') {
                                                        return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/30 w-full justify-center">
                                                            <CheckCircle className="w-3 h-3" /> Approved
                                                        </span>;
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formatLargeNumber(campaign.impressions)}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formatLargeNumber(campaign.clicks)}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {(campaign.ctr || 0).toFixed(2)}%
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formatLargeNumber(campaign.conversions)}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formatCurrency(campaign.cost)}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`text-sm font-bold ${(campaign.roas || 0) >= 3 ? 'text-green-600 dark:text-green-400' :
                                                (campaign.roas || 0) >= 1 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                                                {(campaign.roas || 0).toFixed(2)}x
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => router.push(`/campaign/edit-ads?campaignId=${campaign.id}`)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-colors"
                                            >
                                                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCampaigns)} of {totalCampaigns} entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignsTable;
