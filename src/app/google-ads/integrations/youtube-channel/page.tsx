'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Youtube, Link as LinkIcon, X, ExternalLink } from 'lucide-react';
import GlowButton from '@/components/UI/glow-button';
import { toast } from '@/hooks/use-toast';

// CSS styles for visual effects (Adapted to Red/YouTube Theme)
const styles = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.8; }
    25% { transform: translateY(-15px) translateX(10px); opacity: 0.6; }
    50% { transform: translateY(-25px) translateX(-5px); opacity: 0.9; }
    75% { transform: translateY(-10px) translateX(-15px); opacity: 0.5; }
  }
  
  @keyframes float-medium {
    0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.7; }
    33% { transform: translateY(-20px) translateX(15px) scale(1.2); opacity: 0.5; }
    66% { transform: translateY(-10px) translateX(-10px) scale(0.8); opacity: 0.9; }
  }
  
  @keyframes float-fast {
    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.6; }
    20% { transform: translateY(-12px) translateX(8px) rotate(90deg); opacity: 0.8; }
    40% { transform: translateY(-20px) translateX(-5px) rotate(180deg); opacity: 0.4; }
    60% { transform: translateY(-8px) translateX(-12px) rotate(270deg); opacity: 0.9; }
    80% { transform: translateY(-15px) translateX(5px) rotate(360deg); opacity: 0.5; }
  }
  
  .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
  .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
  .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
  
  .container-card {
    --glow-x: 50%;
    --glow-y: 50%;
    --glow-intensity: 0;
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .container-card::before {
    content: '';
    position: absolute;
    inset: -40px;
    border-radius: 68px;
    background: radial-gradient(
      1000px circle at var(--glow-x) var(--glow-y),
      rgba(255, 0, 0, calc(var(--glow-intensity) * 0.8)) 0%,
      rgba(255, 0, 0, calc(var(--glow-intensity) * 0.5)) 15%,
      rgba(255, 0, 0, calc(var(--glow-intensity) * 0.3)) 30%,
      transparent 90%
    );
    pointer-events: none;
    z-index: -1;
    transition: all 0.15s ease;
    filter: blur(25px);
    opacity: var(--glow-intensity);
  }
  
  .container-card:hover { transform: translateY(-2px); }
  
  .container-item { transition: all 0.3s ease; }
  .container-item:hover {
    transform: translateX(4px);
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.15), inset 0 0 30px rgba(255, 0, 0, 0.05);
  }
  .container-item.selected {
    border-color: rgba(255, 0, 0, 0.5) !important;
    background: rgba(255, 0, 0, 0.1) !important;
  }
`;

interface YouTubeChannel {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    customUrl: string;
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
}

interface GoogleAdsAccount {
    customerId: string;
    resourceName: string;
    descriptiveName: string;
    currencyCode: string;
    timeZone: string;
    status?: string;
}

const YouTubeChannelContent: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [channels, setChannels] = useState<YouTubeChannel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null);

    // Enhanced linked channels: Map of channel_id -> ad_account_id
    const [linkedChannelsMap, setLinkedChannelsMap] = useState<Record<string, string>>({});
    const [linkedChannels, setLinkedChannels] = useState<string[]>([]);

    // Modal State
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [adsAccounts, setAdsAccounts] = useState<GoogleAdsAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<GoogleAdsAccount | null>(null);
    const [linking, setLinking] = useState(false);
    const [linkSuccess, setLinkSuccess] = useState(false);

    // Already Linked Modal State (for users who already have linked channels)
    const [showAlreadyLinkedModal, setShowAlreadyLinkedModal] = useState(false);

    // Instructions Modal State
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    const [linkingInstructions, setLinkingInstructions] = useState<{
        customer_id: string;
        channel_id: string;
        google_ads_url: string;
        youtube_studio_url: string;
        steps_google_ads: string[];
        steps_youtube_studio: string[];
    } | null>(null);
    const [activeTab, setActiveTab] = useState<'google-ads' | 'youtube-studio'>('google-ads');

    // Unlink Confirmation Modal State
    const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
    const [pendingUnlinkChannel, setPendingUnlinkChannel] = useState<YouTubeChannel | null>(null);

    // Load linked channels from localStorage on mount
    useEffect(() => {
        // Clean up OAuth URL params (make URL professional)
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.has('oauth_success') || url.searchParams.has('message')) {
                url.searchParams.delete('oauth_success');
                url.searchParams.delete('message');
                window.history.replaceState({}, '', url.pathname);
            }
        }

        // Load enhanced map (channel_id -> ad_account_id)
        const storedLinkedMap = localStorage.getItem('youtube_linked_channels_map');
        if (storedLinkedMap) {
            try {
                const parsed = JSON.parse(storedLinkedMap);
                if (typeof parsed === 'object') {
                    setLinkedChannelsMap(parsed);
                    setLinkedChannels(Object.keys(parsed));
                }
            } catch (e) {
                console.error('Error parsing linked channels map:', e);
            }
        } else {
            // Fallback to old array format
            const storedLinkedChannels = localStorage.getItem('youtube_linked_channels');
            if (storedLinkedChannels) {
                try {
                    const parsed = JSON.parse(storedLinkedChannels);
                    if (Array.isArray(parsed)) {
                        setLinkedChannels(parsed);
                    }
                } catch (e) {
                    console.error('Error parsing linked channels:', e);
                }
            }
        }
        fetchChannels();
        fetchAdsAccountsOnMount();
    }, []);

    // Fetch ads accounts on page load
    const fetchAdsAccountsOnMount = async () => {
        try {
            const response = await fetch('/api/user/accounts');
            const data = await response.json();
            if (data.google_ads && Array.isArray(data.google_ads)) {
                const mappedAccounts = data.google_ads.map((acc: any) => ({
                    customerId: acc.customerId || acc.id,
                    resourceName: `customers/${acc.customerId || acc.id}`,
                    descriptiveName: acc.name && !acc.name.includes('Account')
                        ? acc.name
                        : `Google Ads Account`,
                    currencyCode: acc.details?.currency_code || 'USD',
                    timeZone: acc.details?.time_zone || 'UTC',
                    status: acc.status
                }));
                setAdsAccounts(mappedAccounts);
            }
        } catch (e) {
            console.error('Error fetching ads accounts:', e);
        }
    };

    // Save linked channels to localStorage whenever map changes
    useEffect(() => {
        if (Object.keys(linkedChannelsMap).length > 0) {
            localStorage.setItem('youtube_linked_channels_map', JSON.stringify(linkedChannelsMap));
            localStorage.setItem('youtube_linked_channels', JSON.stringify(Object.keys(linkedChannelsMap)));
        }
    }, [linkedChannelsMap]);

    // Confirm link to database and update state
    const confirmLinkToDatabase = async (channelId: string, channelTitle: string, adAccountId: string) => {
        try {
            const response = await fetch('/api/youtube/confirm-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel_id: channelId,
                    ad_account_id: adAccountId,
                    channel_title: channelTitle
                })
            });
            const result = await response.json();

            if (result.success) {
                // Update state immediately (no page refresh needed)
                setLinkedChannelsMap(prev => ({ ...prev, [channelId]: adAccountId }));
                setLinkedChannels(prev => [...new Set([...prev, channelId])]);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error confirming link:', e);
            return false;
        }
    };

    const fetchLinkedChannelsFromAPI = async () => {
        try {
            // Fetch linked channels from each connected Google Ads account
            const accountsResponse = await fetch('/api/user/accounts');
            const accountsData = await accountsResponse.json();

            if (accountsData.google_ads && accountsData.google_ads.length > 0) {
                const allLinkedChannelIds: string[] = [];

                for (const account of accountsData.google_ads) {
                    try {
                        const linkedResponse = await fetch(`/api/youtube/linked-channels?customer_id=${account.customerId}`);
                        const linkedData = await linkedResponse.json();

                        if (linkedData.success && linkedData.linked_channels) {
                            for (const linked of linkedData.linked_channels) {
                                if (linked.channel_id && !allLinkedChannelIds.includes(linked.channel_id)) {
                                    allLinkedChannelIds.push(linked.channel_id);
                                }
                            }
                        }
                    } catch (e) {
                        console.error('Error fetching linked channels for account:', account.customerId, e);
                    }
                }

                if (allLinkedChannelIds.length > 0) {
                    setLinkedChannels(prev => {
                        const merged = [...new Set([...prev, ...allLinkedChannelIds])];
                        return merged;
                    });
                }
            }
        } catch (e) {
            console.error('Error fetching linked channels from API:', e);
        }
    };

    const fetchChannels = async () => {
        try {
            // INSTANT: Load from cache first (no loading state)
            const cached = localStorage.getItem('cached_youtube_channels');
            if (cached) {
                try {
                    const cachedChannels = JSON.parse(cached);
                    if (Array.isArray(cachedChannels) && cachedChannels.length > 0) {
                        setChannels(cachedChannels);
                        setLoading(false);
                        // Refresh in background (don't wait)
                        fetch('/api/youtube/channels')
                            .then(res => res.json())
                            .then(data => {
                                if (data.success && data.channels) {
                                    setChannels(data.channels);
                                    localStorage.setItem('cached_youtube_channels', JSON.stringify(data.channels));
                                }
                            })
                            .catch(() => { });
                        return;
                    }
                } catch (e) {
                    console.warn('Cache parse error:', e);
                }
            }

            // Only show loading if no cache
            setLoading(true);
            const response = await fetch('/api/youtube/channels');
            const data = await response.json();

            if (data.success) {
                setChannels(data.channels || []);
                // Cache for next time
                localStorage.setItem('cached_youtube_channels', JSON.stringify(data.channels || []));
            } else {
                setError(data.error || 'Failed to fetch channels');
            }
        } catch (err) {
            console.error('Error fetching channels:', err);
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenLinkModal = async (channel: YouTubeChannel) => {
        setSelectedChannel(channel);
        setIsLinkModalOpen(true);
        setLinkSuccess(false);
        setSelectedAccount(null);
        await fetchAdsAccounts();
    };

    // Helper function to format account ID as XXX-XXX-XXXX
    const formatAccountId = (id: string) => {
        const cleaned = id.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return id;
    };

    const fetchAdsAccounts = async () => {
        try {
            // INSTANT: Load from cache first (no loading state)
            const cached = localStorage.getItem('cached_google_ads_accounts');
            if (cached) {
                try {
                    const cachedAccounts = JSON.parse(cached);
                    if (Array.isArray(cachedAccounts) && cachedAccounts.length > 0) {
                        const mappedCached = cachedAccounts.map((acc: any) => ({
                            customerId: acc.customerId || acc.id,
                            resourceName: `customers/${acc.customerId || acc.id}`,
                            descriptiveName: acc.name && !acc.name.includes('Account')
                                ? acc.name
                                : `Google Ads Account`,
                            currencyCode: acc.details?.currency_code || 'USD',
                            timeZone: acc.details?.time_zone || 'UTC',
                            status: acc.status
                        }));
                        setAdsAccounts(mappedCached);
                        // Return early - data is already available instantly
                        return;
                    }
                } catch (e) {
                    console.warn('Cache parse error:', e);
                }
            }

            // Only show loading if no cache
            setIsLoadingAccounts(true);
            const response = await fetch('/api/user/accounts');
            const data = await response.json();

            // API returns { google_ads: [...], ... } structure
            if (data.google_ads && Array.isArray(data.google_ads)) {
                // Map to expected format with customerId and descriptiveName
                const mappedAccounts = data.google_ads.map((acc: any) => ({
                    customerId: acc.customerId || acc.id,
                    resourceName: `customers/${acc.customerId || acc.id}`,
                    // Use actual name from API, fallback to formatted ID
                    descriptiveName: acc.name && !acc.name.includes('Account')
                        ? acc.name
                        : `Google Ads Account`,
                    currencyCode: acc.details?.currency_code || 'USD',
                    timeZone: acc.details?.time_zone || 'UTC',
                    status: acc.status
                }));
                setAdsAccounts(mappedAccounts);
            } else {
                console.warn('Failed to fetch ads accounts', data);
            }
        } catch (e) {
            console.error('Error fetching ads accounts', e);
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    const handleLinkAccount = async () => {
        if (!selectedChannel || !selectedAccount) return;

        try {
            setLinking(true);
            // Call backend to get linking URL
            const response = await fetch('/api/youtube/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel_id: selectedChannel.id,
                    ad_account_id: selectedAccount.customerId
                })
            });
            const result = await response.json();

            if (result.success) {
                // Check if manual linking is required
                if (result.requires_manual_linking) {
                    // Show instructions modal instead of opening external URL
                    // This avoids OAuth popup and shows clear instructions
                    setLinkingInstructions({
                        customer_id: result.customer_id || selectedAccount.customerId,
                        channel_id: result.channel_id || selectedChannel.id,
                        google_ads_url: result.google_ads_url,
                        youtube_studio_url: result.youtube_studio_url,
                        steps_google_ads: result.steps_google_ads || [],
                        steps_youtube_studio: result.steps_youtube_studio || []
                    });

                    // Close link modal and open instructions modal
                    setIsLinkModalOpen(false);
                    setSelectedChannel(null);
                    setShowInstructionsModal(true);
                } else {
                    setLinkSuccess(true);
                    setLinkedChannels(prev => [...prev, selectedChannel.id]);
                    setTimeout(() => {
                        setIsLinkModalOpen(false);
                        setSelectedChannel(null);
                        setLinkSuccess(false);
                    }, 2000);
                }
            } else {
                toast.destructive({
                    title: 'Link Failed',
                    description: result.error || 'Failed to link channel',
                    duration: 5000
                });
            }
        } catch (e) {
            console.error('Linking error', e);
            toast.destructive({
                title: 'Error',
                description: 'An error occurred while linking the channel',
                duration: 5000
            });
        } finally {
            setLinking(false);
        }
    };

    // Show confirmation modal for unlink
    const handleUnlinkChannel = (channel: typeof channels[0]) => {
        setPendingUnlinkChannel(channel);
        setShowUnlinkConfirm(true);
    };

    // Confirm unlink action
    const confirmUnlinkChannel = async () => {
        if (!pendingUnlinkChannel) return;

        const channel = pendingUnlinkChannel;
        console.log('🔴 Unlinking channel:', channel.id, channel.title);
        console.log('🔴 Current linkedChannels before unlink:', linkedChannels);

        setShowUnlinkConfirm(false);
        setPendingUnlinkChannel(null);

        try {
            const response = await fetch('/api/youtube/unlink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel_id: channel.id,
                    ad_account_id: adsAccounts?.[0]?.customerId || ''
                })
            });
            const result = await response.json();

            console.log('🔴 API Response:', result);

            if (result.success) {
                // Calculate the updated list immediately
                setLinkedChannels(prev => {
                    const updated = prev.filter(id => id !== channel.id);
                    console.log('🔴 Updated linkedChannels:', updated);
                    // Update localStorage immediately with the calculated value
                    localStorage.setItem('youtube_linked_channels', JSON.stringify(updated));
                    return updated;
                });

                // Also remove from linkedChannelsMap
                setLinkedChannelsMap(prev => {
                    const updated = { ...prev };
                    delete updated[channel.id];
                    console.log('🔴 Updated linkedChannelsMap:', updated);
                    return updated;
                });

                toast.success({
                    title: 'Channel Unlinked',
                    description: `"${channel.title}" has been unlinked successfully`,
                    duration: 4000
                });
            } else {
                console.error('🔴 Unlink failed:', result.error || result.message);
                toast.destructive({
                    title: 'Unlink Failed',
                    description: result.error || result.message || 'Failed to unlink channel',
                    duration: 5000
                });
            }
        } catch (e) {
            console.error('🔴 Unlinking error:', e);
            toast.destructive({
                title: 'Error',
                description: 'An error occurred while unlinking the channel',
                duration: 5000
            });
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: styles }} />
            <div className="min-h-screen bg-black overflow-x-hidden p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                                <Youtube className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">YouTube Channels</h1>
                        </div>
                        <p className="text-gray-400 text-sm sm:text-base px-4">Manage your connected YouTube channels and link them to Google Ads.</p>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading channels...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <p className="text-red-400 text-lg">{error}</p>
                            <button onClick={() => router.push('/google-ads/integrations')} className="mt-6 text-white bg-white/10 px-6 py-2 rounded-full hover:bg-white/20 transition">Back</button>
                        </div>
                    ) : (
                        <div
                            className="container-card relative max-w-4xl mx-auto"
                            onMouseMove={(e) => {
                                const card = e.currentTarget;
                                const rect = card.getBoundingClientRect();
                                const x = ((e.clientX - rect.left) / rect.width) * 100;
                                const y = ((e.clientY - rect.top) / rect.height) * 100;
                                card.style.setProperty('--glow-x', `${x}%`);
                                card.style.setProperty('--glow-y', `${y}%`);
                                card.style.setProperty('--glow-intensity', '1');
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.setProperty('--glow-intensity', '0');
                            }}
                        >
                            {/* Card Background */}
                            <div className="relative rounded-[32px] p-[2px] bg-gradient-to-br from-red-500/50 via-red-900/30 to-red-600/50 shadow-2xl shadow-red-900/40">
                                <div className="relative rounded-[30px] bg-[#050000] backdrop-blur-xl p-8 overflow-hidden min-h-[500px]">
                                    {/* Ambient Glows inside card */}
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none"></div>

                                    <div className="space-y-4 relative z-10">
                                        {channels.map(channel => {
                                            const isLinked = linkedChannels.includes(channel.id);
                                            return (
                                                <div key={channel.id} className="container-item group rounded-xl p-4 border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex flex-col sm:flex-row sm:items-center gap-4">
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <img src={channel.thumbnail} alt={channel.title} className="w-12 h-12 rounded-full border-2 border-red-500/30 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <h3 className="text-white font-semibold text-base sm:text-lg truncate">{channel.title}</h3>
                                                            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                                                                <span>{parseInt(channel.subscriberCount).toLocaleString()} Subscribers</span>
                                                                <span>•</span>
                                                                <span>{parseInt(channel.videoCount).toLocaleString()} Videos</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isLinked ? (
                                                        <button
                                                            onClick={() => handleUnlinkChannel(channel)}
                                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all group w-full sm:w-auto"
                                                        >
                                                            <Check className="w-4 h-4 group-hover:hidden" />
                                                            <X className="w-4 h-4 hidden group-hover:block" />
                                                            <span className="text-sm font-semibold group-hover:hidden">Linked</span>
                                                            <span className="text-sm font-semibold hidden group-hover:block">Unlink</span>
                                                        </button>
                                                    ) : (
                                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                                            {/* Link Account Button - for new linking */}
                                                            <button
                                                                onClick={() => handleOpenLinkModal(channel)}
                                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all shadow-lg shadow-red-600/20 hover:shadow-red-500/40"
                                                            >
                                                                <LinkIcon className="w-4 h-4" />
                                                                <span className="font-semibold text-sm">Link</span>
                                                            </button>

                                                            {/* Already Linked Button - for users with existing links */}
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedChannel(channel);
                                                                    setShowAlreadyLinkedModal(true);
                                                                    fetchAdsAccounts();
                                                                }}
                                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full border border-white/10 hover:border-white/20 transition-all text-xs sm:text-sm"
                                                                title="Already have this channel linked in Google Ads?"
                                                            >
                                                                <Check className="w-3 h-3" />
                                                                <span>Already Linked?</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {channels.length === 0 && (
                                            <div className="text-center py-10 text-gray-500">
                                                No channels found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Linking Modal */}
                {isLinkModalOpen && selectedChannel && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto md:ltr:ml-[340px] md:rtl:mr-[340px]"
                        onClick={() => setIsLinkModalOpen(false)}>
                        <div className="min-h-screen p-4 sm:p-6 pt-20 sm:pt-6 flex items-center justify-center">
                            <div className="w-full max-w-3xl">
                                <div
                                    className="relative w-full bg-gradient-to-b from-[#0f0a0a] to-[#0a0505] border border-red-500/40 rounded-3xl p-8 shadow-2xl shadow-red-500/30 overflow-hidden"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {/* Modal Glow Effects */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-b from-red-500/20 to-transparent blur-3xl rounded-full pointer-events-none"></div>
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                    <button onClick={() => setIsLinkModalOpen(false)} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-400 hover:text-white transition z-10">
                                        <X className="w-6 h-6" />
                                    </button>

                                    {/* Header */}
                                    <div className="text-center mb-8 relative z-10">
                                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
                                            <Youtube className="w-8 h-8 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Link <span className="text-red-400">{selectedChannel.title}</span></h2>
                                        <p className="text-gray-400">Select a Google Ads account to link this channel with.</p>
                                    </div>

                                    {linkSuccess ? (
                                        <div className="flex flex-col items-center justify-center py-10 relative z-10">
                                            <div className="w-20 h-20 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-full flex items-center justify-center mb-4 border border-green-500/50 shadow-lg shadow-green-500/20">
                                                <Check className="w-10 h-10 text-green-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Linked Successfully!</h3>
                                            <p className="text-gray-400">Your channel has been linked.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 relative z-10">
                                            {isLoadingAccounts ? (
                                                <div className="flex justify-center py-10">
                                                    <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            ) : (
                                                <div className="max-h-[320px] overflow-y-auto space-y-3 ltr:pr-2 rtl:pl-2 scrollbar-thin scrollbar-thumb-red-500/30 scrollbar-track-transparent">
                                                    {adsAccounts.map(account => (
                                                        <div
                                                            key={account.customerId}
                                                            onClick={() => setSelectedAccount(account)}
                                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between group ${selectedAccount?.customerId === account.customerId
                                                                ? 'bg-gradient-to-r from-red-500/20 to-red-600/10 border-red-500/60 shadow-lg shadow-red-500/10'
                                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedAccount?.customerId === account.customerId ? 'bg-red-500/30' : 'bg-white/10'}`}>
                                                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={selectedAccount?.customerId === account.customerId ? '#ef4444' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-semibold text-lg">{account.descriptiveName}</h4>
                                                                    <p className="text-sm text-gray-400">{formatAccountId(account.customerId)}</p>
                                                                </div>
                                                            </div>
                                                            {selectedAccount?.customerId === account.customerId ? (
                                                                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                                                                    <Check className="w-5 h-5 text-white" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-8 h-8 border-2 border-white/20 rounded-full group-hover:border-white/40 transition-colors"></div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {adsAccounts.length === 0 && (
                                                        <div className="text-center py-10">
                                                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <X className="w-8 h-8 text-gray-500" />
                                                            </div>
                                                            <p className="text-gray-500">No connected ad accounts found.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="mt-8 flex justify-center pt-6 border-t border-white/10">
                                                <GlowButton
                                                    onClick={handleLinkAccount}
                                                    disabled={!selectedAccount || linking}
                                                    variant="red"
                                                >
                                                    <span className="flex items-center gap-2 px-4">
                                                        {linking ? 'Linking...' : 'Link Account'}
                                                        {!linking && <ArrowRight className="w-5 h-5" />}
                                                    </span>
                                                </GlowButton>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions Modal - Premium Design */}
                {showInstructionsModal && linkingInstructions && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto md:ltr:ml-[340px] md:rtl:mr-[340px]"
                        onClick={() => setShowInstructionsModal(false)}
                    >
                        <div className="min-h-screen p-4 sm:p-6 pt-20 sm:pt-6 flex items-center justify-center">
                            <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                                {/* Animated background glow */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
                                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                                </div>

                                {/* Modal Container with Gradient Border */}
                                <div className="relative w-full">
                                    {/* Gradient border effect */}
                                    <div className="absolute -inset-[1px] bg-gradient-to-br from-red-500 via-red-600/50 to-green-500/30 rounded-[28px] blur-sm opacity-75" />

                                    <div className="relative bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-[28px] p-8 border border-white/5">
                                        {/* Close Button */}
                                        <button
                                            onClick={() => setShowInstructionsModal(false)}
                                            className="absolute top-5 ltr:right-5 rtl:left-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all duration-300 hover:rotate-90"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>

                                        {/* Header with animated icon */}
                                        <div className="text-center mb-8">
                                            <div className="relative w-20 h-20 mx-auto mb-5">
                                                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl rotate-6 opacity-50" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl -rotate-3 opacity-75" />
                                                <div className="relative w-full h-full bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/25">
                                                    <Youtube className="w-10 h-10 text-white" />
                                                </div>
                                            </div>
                                            <h3 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                                Link YouTube Channel
                                            </h3>
                                            <p className="text-gray-400 text-base">Follow these steps to connect your channel to Google Ads</p>
                                        </div>

                                        {/* Tab Navigation */}
                                        <div className="flex gap-2 mb-6">
                                            <button
                                                onClick={() => setActiveTab('google-ads')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'google-ads'
                                                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                                </svg>
                                                Google Ads
                                                <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full">★</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('youtube-studio')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'youtube-studio'
                                                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <Youtube className="w-5 h-5" />
                                                YouTube Studio
                                            </button>
                                        </div>

                                        {/* Tab Content */}
                                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                                            {activeTab === 'google-ads' ? (
                                                <>
                                                    {/* Google Ads Steps */}
                                                    <div className="space-y-3 mb-5">
                                                        {[
                                                            { icon: '🌐', text: 'Sign in to ads.google.com' },
                                                            { icon: '⚙️', text: 'Click Tools → Data Manager' },
                                                            { icon: '📺', text: 'Find "YouTube" → Add Channel' },
                                                            { icon: '🔍', text: 'Search for your channel' },
                                                            { icon: '✓', text: 'Select "I own the channel" → Link' }
                                                        ].map((step, i) => (
                                                            <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                                                                <span className="text-base">{step.icon}</span>
                                                                <span className="text-gray-300 text-sm flex-1">{step.text}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <a
                                                        href={`https://ads.google.com/aw/productlinks?ocid=${linkingInstructions.customer_id.replace(/-/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/25"
                                                    >
                                                        Open Google Ads
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </>
                                            ) : (
                                                <>
                                                    {/* YouTube Studio Steps with Copy ID */}
                                                    <div className="space-y-3 mb-5">
                                                        {[
                                                            { icon: '📺', text: 'Open YouTube Studio' },
                                                            { icon: '⚙️', text: 'Settings → Channel → Advanced' },
                                                            { icon: '🔗', text: 'Click "Link Account"' },
                                                            { icon: '🔑', text: `Enter ID:`, hasId: true },
                                                            { icon: '✓', text: 'Enable permissions → Save' }
                                                        ].map((step, i) => (
                                                            <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                                                                <span className="text-base">{step.icon}</span>
                                                                <span className="text-gray-300 text-sm flex-1">
                                                                    {step.text}
                                                                    {step.hasId && (
                                                                        <span className="inline-flex items-center gap-2 ml-2">
                                                                            <span className="text-green-400 font-mono font-bold">{linkingInstructions.customer_id}</span>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    navigator.clipboard.writeText(linkingInstructions.customer_id);
                                                                                    toast.success({ title: 'Copied!', description: 'ID copied to clipboard', duration: 2000 });
                                                                                }}
                                                                                className="p-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                                                                                title="Copy ID"
                                                                            >
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                                </svg>
                                                                            </button>
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <a
                                                        href={`https://studio.youtube.com/channel/${linkingInstructions.channel_id}/monetization/ads`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/25"
                                                    >
                                                        <Youtube className="w-4 h-4" />
                                                        Open YouTube Studio
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Confirm Button - Premium */}
                                    <div className="mt-6 relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-40 group-hover:opacity-75 transition-opacity" />
                                        <button
                                            onClick={async () => {
                                                if (linkingInstructions) {
                                                    const success = await confirmLinkToDatabase(
                                                        linkingInstructions.channel_id,
                                                        selectedChannel?.title || '',
                                                        linkingInstructions.customer_id.replace(/-/g, '')
                                                    );
                                                    if (success) {
                                                        setShowInstructionsModal(false);
                                                        setLinkingInstructions(null);
                                                    }
                                                }
                                            }}
                                            className="relative w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/25 flex items-center justify-center gap-3"
                                        >
                                            <Check className="w-5 h-5" />
                                            I've Completed the Linking
                                        </button>
                                    </div>

                                    {/* Footer */}
                                    <p className="text-center text-gray-600 text-xs mt-6 hover:text-gray-400 transition-colors">
                                        <a href="https://support.google.com/youtube/answer/3063482" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1">
                                            Official Google Documentation
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Already Linked Modal - for users with existing links */}
                {showAlreadyLinkedModal && selectedChannel && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto md:ltr:ml-[340px] md:rtl:mr-[340px]"
                        onClick={() => {
                            setShowAlreadyLinkedModal(false);
                            setSelectedChannel(null);
                            setSelectedAccount(null);
                        }}
                    >
                        <div className="min-h-screen p-4 sm:p-6 pt-20 sm:pt-6 flex items-center justify-center">
                            <div className="w-full max-w-3xl">
                                <div className="card-glass rounded-3xl p-8 w-full relative" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => {
                                            setShowAlreadyLinkedModal(false);
                                            setSelectedChannel(null);
                                            setSelectedAccount(null);
                                        }}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-white/60 hover:text-white"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Mark as Linked</h3>
                                        <p className="text-gray-400 mt-2">
                                            If <strong className="text-white">{selectedChannel.title}</strong> is already linked in Google Ads, select the account below.
                                        </p>
                                    </div>

                                    {/* Account Selection */}
                                    <div className="space-y-3 mb-6">
                                        {isLoadingAccounts ? (
                                            <div className="text-center text-gray-400 py-4">Loading accounts...</div>
                                        ) : adsAccounts.length === 0 ? (
                                            <div className="text-center text-gray-400 py-4">No Google Ads accounts found</div>
                                        ) : (
                                            adsAccounts.map(account => (
                                                <div
                                                    key={account.customerId}
                                                    onClick={() => setSelectedAccount(account)}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAccount?.customerId === account.customerId
                                                        ? 'border-green-500 bg-green-500/10'
                                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-white font-medium">{account.descriptiveName}</p>
                                                            <p className="text-gray-400 text-sm">{formatAccountId(account.customerId)}</p>
                                                        </div>
                                                        {selectedAccount?.customerId === account.customerId && (
                                                            <Check className="w-5 h-5 text-green-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Confirm Button */}
                                    <button
                                        onClick={async () => {
                                            if (selectedAccount && selectedChannel) {
                                                const success = await confirmLinkToDatabase(
                                                    selectedChannel.id,
                                                    selectedChannel.title,
                                                    selectedAccount.customerId
                                                );
                                                if (success) {
                                                    setShowAlreadyLinkedModal(false);
                                                    setSelectedChannel(null);
                                                    setSelectedAccount(null);
                                                }
                                            }
                                        }}
                                        disabled={!selectedAccount}
                                        className={`w-full py-3 rounded-xl font-semibold transition-all ${selectedAccount
                                            ? 'bg-green-500 text-white hover:bg-green-400'
                                            : 'bg-white/10 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Confirm Link Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Unlink Confirmation Modal */}
                {showUnlinkConfirm && pendingUnlinkChannel && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto md:ltr:ml-[340px] md:rtl:mr-[340px]"
                        onClick={() => {
                            setShowUnlinkConfirm(false);
                            setPendingUnlinkChannel(null);
                        }}
                    >
                        <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
                            <div
                                className="w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-red-500/30 rounded-2xl p-6 shadow-xl"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <X className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Unlink Channel?</h3>
                                    <p className="text-gray-400">
                                        Are you sure you want to unlink <span className="text-white font-medium">"{pendingUnlinkChannel.title}"</span>?
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowUnlinkConfirm(false);
                                            setPendingUnlinkChannel(null);
                                        }}
                                        className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmUnlinkChannel}
                                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors"
                                    >
                                        Unlink
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </>
    );
};

export default function YouTubeChannelPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <YouTubeChannelContent />
        </Suspense>
    );
}
