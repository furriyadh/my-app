'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Facebook, ExternalLink, Copy } from 'lucide-react';
import GlowButton from '@/components/ui/glow-button';

// CSS styles for visual effects
const styles = `
  @keyframes float-slow {
    0%, 100% { 
      transform: translateY(0px) translateX(0px); 
      opacity: 0.8;
    }
    25% { 
      transform: translateY(-15px) translateX(10px); 
      opacity: 0.6;
    }
    50% { 
      transform: translateY(-25px) translateX(-5px); 
      opacity: 0.9;
    }
    75% { 
      transform: translateY(-10px) translateX(-15px); 
      opacity: 0.5;
    }
  }
  
  @keyframes float-medium {
    0%, 100% { 
      transform: translateY(0px) translateX(0px) scale(1); 
      opacity: 0.7;
    }
    33% { 
      transform: translateY(-20px) translateX(15px) scale(1.2); 
      opacity: 0.5;
    }
    66% { 
      transform: translateY(-10px) translateX(-10px) scale(0.8); 
      opacity: 0.9;
    }
  }
  
  @keyframes float-fast {
    0%, 100% { 
      transform: translateY(0px) translateX(0px) rotate(0deg); 
      opacity: 0.6;
    }
    20% { 
      transform: translateY(-12px) translateX(8px) rotate(90deg); 
      opacity: 0.8;
    }
    40% { 
      transform: translateY(-20px) translateX(-5px) rotate(180deg); 
      opacity: 0.4;
    }
    60% { 
      transform: translateY(-8px) translateX(-12px) rotate(270deg); 
      opacity: 0.9;
    }
    80% { 
      transform: translateY(-15px) translateX(5px) rotate(360deg); 
      opacity: 0.5;
    }
  }
  
  .animate-float-slow {
    animation: float-slow 8s ease-in-out infinite;
  }
  
  .animate-float-medium {
    animation: float-medium 6s ease-in-out infinite;
  }
  
  .animate-float-fast {
    animation: float-fast 4s ease-in-out infinite;
  }
  
  .account-card {
    --glow-x: 50%;
    --glow-y: 50%;
    --glow-intensity: 0;
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .account-card::before {
    content: '';
    position: absolute;
    inset: -40px;
    border-radius: 68px;
    background: radial-gradient(
      1000px circle at var(--glow-x) var(--glow-y),
      rgba(59, 130, 246, calc(var(--glow-intensity) * 1)) 0%,
      rgba(59, 130, 246, calc(var(--glow-intensity) * 0.7)) 15%,
      rgba(59, 130, 246, calc(var(--glow-intensity) * 0.5)) 30%,
      rgba(59, 130, 246, calc(var(--glow-intensity) * 0.3)) 50%,
      rgba(59, 130, 246, calc(var(--glow-intensity) * 0.15)) 70%,
      transparent 90%
    );
    pointer-events: none;
    z-index: -1;
    transition: all 0.15s ease;
    filter: blur(25px);
    opacity: var(--glow-intensity);
  }
  
  .account-card:hover {
    transform: translateY(-2px);
  }
  
  .account-item {
    transition: all 0.3s ease;
  }
  
  .account-item:hover {
    transform: translateX(4px);
    box-shadow: 
      0 0 20px rgba(59, 130, 246, 0.15),
      inset 0 0 30px rgba(59, 130, 246, 0.05);
  }
`;

interface MetaAdAccount {
    id: string;
    accountId: string;
    name: string;
    status: number;
    currency: string;
    timezoneName: string;
    businessId?: string;
    businessName?: string;
    amountSpent: string;
}

interface LinkedAccount {
    ad_account_id: string;
    account_name: string;
}

// Component to handle searchParams
const MetaAdsContent: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<MetaAdAccount[]>([]);
    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [alreadyLinkedNotification, setAlreadyLinkedNotification] = useState<{
        show: boolean;
        accountName: string;
        accountId: string;
    } | null>(null);
    const [partnerInfo, setPartnerInfo] = useState<{ businessId: string; instructions: string[] } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Check for OAuth success
        const authSuccess = searchParams.get('oauth_success');
        if (authSuccess === 'true') {
            console.log('✅ Meta OAuth completed successfully');
            // Clear URL parameters
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.delete('oauth_success');
                url.searchParams.delete('message');
                window.history.replaceState({}, '', url.toString());
            }
        }
        fetchLinkedAccounts();
        fetchAccounts();
        fetchPartnerInfo();
    }, [searchParams]);

    const fetchLinkedAccounts = async () => {
        try {
            const response = await fetch('/api/meta/connected');
            const data = await response.json();

            if (data.success && data.accounts) {
                setLinkedAccounts(data.accounts);
                console.log('📋 Linked Meta accounts:', data.accounts);
            }
        } catch (err) {
            console.error('Error fetching linked accounts:', err);
        }
    };

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/meta/accounts');
            const data = await response.json();

            if (data.success) {
                setAccounts(data.accounts || []);
                if (data.accounts?.length === 0) {
                    setError('No Meta Ad Accounts found. Make sure you have access to an ad account.');
                }
            } else {
                setError(data.message || 'Failed to fetch accounts');
            }
        } catch (err) {
            console.error('Error fetching accounts:', err);
            setError('Connection error - please login with Meta first');
        } finally {
            setLoading(false);
        }
    };

    const fetchPartnerInfo = async () => {
        try {
            const response = await fetch('/api/meta/add-partner');
            const data = await response.json();
            if (data.success) {
                setPartnerInfo({
                    businessId: data.agencyBusinessId,
                    instructions: data.instructions
                });
            }
        } catch (err) {
            console.error('Error fetching partner info:', err);
        }
    };

    const isAccountLinked = (accountId: string): boolean => {
        return linkedAccounts.some(la => la.ad_account_id === accountId);
    };

    const handleSave = async () => {
        if (!selectedAccount) {
            alert('Please select an account');
            return;
        }

        if (isAccountLinked(selectedAccount)) {
            const acc = accounts.find(a => a.id === selectedAccount);
            setAlreadyLinkedNotification({
                show: true,
                accountName: acc?.name || selectedAccount,
                accountId: selectedAccount
            });
            return;
        }

        try {
            setSaving(true);

            const selectedAcc = accounts.find(a => a.id === selectedAccount);

            // Save account to Supabase
            const response = await fetch('/api/meta/connected', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adAccountId: selectedAccount,
                    accountName: selectedAcc?.name || null,
                    businessId: selectedAcc?.businessId || null,
                    businessName: selectedAcc?.businessName || null,
                    currency: selectedAcc?.currency || null,
                    timezoneName: selectedAcc?.timezoneName || null,
                    accountStatus: selectedAcc?.status || null,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Request partner access
                console.log('🤝 Requesting partner access...');
                const partnerResponse = await fetch('/api/meta/add-partner', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adAccountId: selectedAccount }),
                });

                const partnerResult = await partnerResponse.json();
                console.log('Partner result:', partnerResult);

                localStorage.setItem('selected_meta_account', selectedAccount);
                router.push('/google-ads/integrations');
            } else {
                alert(result.message || 'Failed to save account');
            }

        } catch (err) {
            console.error('Error saving account:', err);
            alert('An error occurred while saving');
        } finally {
            setSaving(false);
        }
    };

    const copyBusinessId = () => {
        if (partnerInfo?.businessId) {
            navigator.clipboard.writeText(partnerInfo.businessId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getStatusText = (status: number): string => {
        switch (status) {
            case 1: return 'Active';
            case 2: return 'Disabled';
            case 3: return 'Unsettled';
            case 7: return 'Pending Review';
            case 8: return 'Pending Closure';
            case 9: return 'Ad Account Flagged';
            case 101: return 'Closed';
            default: return 'Unknown';
        }
    };

    const getStatusColor = (status: number): string => {
        if (status === 1) return 'text-green-400';
        if (status === 2 || status === 101) return 'text-red-400';
        return 'text-yellow-400';
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: styles }} />

            <div className="min-h-screen bg-black overflow-x-hidden">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                                <Facebook className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">
                                Meta Ads
                            </h1>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Select an ad account to connect to your dashboard
                        </p>
                    </div>

                    {/* Already Linked Notification */}
                    {alreadyLinkedNotification?.show && (
                        <div className="max-w-md mx-auto mb-6">
                            <div className="relative rounded-[20px] border border-blue-500/30 bg-[#080814] p-5 overflow-hidden">
                                <div className="relative flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
                                        <span className="text-blue-400 text-sm font-semibold">Already Linked</span>
                                    </div>
                                    <button
                                        onClick={() => setAlreadyLinkedNotification(null)}
                                        className="text-gray-600 hover:text-blue-400"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">
                                    Account <span className="font-semibold text-blue-300">{alreadyLinkedNotification.accountName}</span> is already linked.
                                </p>
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                        <Check className="w-8 h-8 text-blue-400" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setAlreadyLinkedNotification(null);
                                        router.push('/google-ads/integrations');
                                    }}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold"
                                >
                                    <span>Go to Integrations</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Partner Info Card */}
                    {partnerInfo?.businessId && partnerInfo.businessId !== 'Not configured' && (
                        <div className="max-w-2xl mx-auto mb-6">
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-blue-400 text-sm font-semibold">Agency Business ID</span>
                                    <button
                                        onClick={copyBusinessId}
                                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400"
                                    >
                                        <Copy className="w-3 h-3" />
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <code className="text-white font-mono text-lg">{partnerInfo.businessId}</code>
                                <p className="text-gray-500 text-xs mt-2">
                                    Share this ID with your client to add you as a partner in their Business Manager
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="max-w-2xl mx-auto">
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-400">Searching for ad accounts...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <div className="text-yellow-400 text-6xl mb-4">📱</div>
                                <p className="text-gray-300 text-lg mb-4">{error}</p>
                                <p className="text-gray-500 text-sm mb-6">Please login with Meta to access your ad accounts</p>
                                <GlowButton
                                    onClick={() => window.location.href = '/api/oauth/meta?redirect_after=/google-ads/integrations/meta-ads'}
                                    variant="blue"
                                >
                                    <span className="flex items-center gap-2">
                                        <Facebook className="w-5 h-5" />
                                        Login with Meta
                                    </span>
                                </GlowButton>
                            </div>
                        ) : accounts.length > 0 ? (
                            <>
                                {/* Accounts List */}
                                <div className="account-card relative group">
                                    <div className="relative rounded-[28px] p-[2px] bg-gradient-to-br from-blue-500/60 via-blue-400/40 to-blue-600/60 shadow-2xl shadow-blue-500/30">
                                        <div className="relative rounded-[26px] bg-[#000810] p-5 overflow-hidden">
                                            <div className="absolute top-5 left-6 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-float-slow"></div>
                                            <div className="absolute top-10 right-12 w-1 h-1 bg-blue-300/50 rounded-full animate-float-medium"></div>
                                            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

                                            <div className="space-y-3 relative z-10 max-h-[50vh] overflow-y-auto pr-2">
                                                {accounts.map((account) => {
                                                    const isSelected = selectedAccount === account.id;
                                                    const isLinked = isAccountLinked(account.id);

                                                    return (
                                                        <div
                                                            key={account.id}
                                                            onClick={() => setSelectedAccount(account.id)}
                                                            className={`account-item cursor-pointer rounded-xl p-4 border transition-all duration-300 ${isSelected
                                                                ? 'bg-green-500/10 border-green-500/50'
                                                                : isLinked
                                                                    ? 'bg-blue-500/10 border-blue-500/30'
                                                                    : 'bg-[#000d1a] border-blue-500/20 hover:bg-[#001025]'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${isSelected
                                                                        ? 'bg-green-500/20 border-2 border-green-400/50'
                                                                        : 'bg-blue-500/20 border border-blue-500/30'
                                                                        }`}>
                                                                        <Facebook className="w-5 h-5 text-blue-400" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <h3 className="text-white font-semibold truncate">
                                                                                {account.name}
                                                                            </h3>
                                                                            {isLinked && (
                                                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                                                                                    Linked
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-blue-400 text-sm font-mono truncate">
                                                                            {account.accountId}
                                                                        </p>
                                                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                                                            <span className={getStatusColor(account.status)}>
                                                                                {getStatusText(account.status)}
                                                                            </span>
                                                                            <span className="text-gray-500">{account.currency}</span>
                                                                            {account.businessName && (
                                                                                <span className="text-gray-500 truncate">{account.businessName}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {isSelected && (
                                                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                                        <Check className="w-5 h-5 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="mt-8 flex justify-center">
                                    <GlowButton
                                        onClick={handleSave}
                                        disabled={!selectedAccount || saving}
                                        variant="blue"
                                    >
                                        <span className="flex items-center gap-2">
                                            {saving ? 'Linking...' : 'Link'}
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </GlowButton>
                                </div>
                            </>
                        ) : null}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-16 text-gray-500 text-sm">
                        © 2025, Furriyadh. All rights reserved.
                    </div>
                </div>
            </div>
        </>
    );
};

export default function MetaAdsSetupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <MetaAdsContent />
        </Suspense>
    );
}
