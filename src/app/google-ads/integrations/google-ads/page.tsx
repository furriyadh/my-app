'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, X, ExternalLink } from 'lucide-react';
import GlowButton from '@/components/ui/glow-button';

// CSS styles for visual effects (Google Ads Blue)
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

  .ads-card {
    --glow-x: 50%;
    --glow-y: 50%;
    --glow-intensity: 0;
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .ads-card::before {
    content: '';
    position: absolute;
    inset: -40px;
    border-radius: 68px;
    background: radial-gradient(
      1000px circle at var(--glow-x) var(--glow-y),
      rgba(59, 130, 246, calc(var(--glow-intensity) * 0.8)) 0%,
      rgba(59, 130, 246, calc(var(--glow-intensity) * 0.5)) 15%,
      rgba(59, 130, 246, calc(var(--glow-intensity) * 0.3)) 30%,
      transparent 90%
    );
    pointer-events: none;
    z-index: -1;
    transition: all 0.15s ease;
    filter: blur(25px);
    opacity: var(--glow-intensity);
  }
  .ads-card:hover { transform: translateY(-2px); }
  
  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
  }
`;

interface GoogleAdsAccount {
    customerId: string;
    descriptiveName: string;
    currencyCode: string;
    timeZone: string;
    testAccount: boolean;
    manager: boolean;
    linkStatus?: string; // PENDING, ACTIVE, REJECTED, CANCELLED, NOT_LINKED
}

const GoogleAdsIntegrationContent: React.FC = () => {
    const router = useRouter();
    const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Removed useEffect for API fetching

    const handleCheckStatus = async (account: GoogleAdsAccount) => {
        setProcessingId(account.customerId);

        // Simulate API delay
        setTimeout(() => {
            setAccounts(prev => prev.map(acc =>
                acc.customerId === account.customerId
                    ? { ...acc, linkStatus: 'ACTIVE' }
                    : acc
            ));
            setProcessingId(null);
            // Optional: Show success alert/toast here
        }, 1500);
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'ACTIVE':
                return (
                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-500/30">
                        <Check className="w-3 h-3" /> Connected
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-yellow-500/30">
                        Pending Invite
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-500/30">
                        Rejected
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center gap-1 bg-gray-500/20 text-gray-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-gray-500/30">
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 bg-white/5 text-gray-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/10">
                        Not Linked
                    </span>
                );
        }
    };

    // Google Ads Logo
    const GoogleAdsLogo = () => (
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 48 48" className="w-8 h-8">
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
        </div>
    );

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: styles }} />
            <div className="min-h-screen bg-black overflow-x-hidden p-6 text-white custom-scrollbar">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                            <GoogleAdsLogo />
                            <h1 className="text-3xl font-bold">Google Ads Accounts</h1>
                        </div>
                        <p className="text-gray-400">Link your active Google Ads accounts to unlock advanced analytics and management.</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Scanning for accounts...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <p className="text-red-400 text-lg mb-6">{error}</p>
                            <GlowButton onClick={() => router.push('/google-ads/integrations')} variant="blue">
                                Back to Integrations
                            </GlowButton>
                        </div>
                    ) : (
                        <div
                            className="ads-card relative max-w-5xl mx-auto"
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
                            {/* Card Container */}
                            <div className="relative rounded-[32px] p-[2px] bg-gradient-to-br from-blue-500/50 via-blue-900/30 to-blue-600/50 shadow-2xl shadow-blue-900/40">
                                <div className="relative rounded-[30px] bg-[#05050A] backdrop-blur-xl p-8 overflow-hidden min-h-[500px]">

                                    {/* Background Particles */}
                                    <div className="absolute top-5 left-6 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-float-slow"></div>
                                    <div className="absolute top-10 right-12 w-1 h-1 bg-blue-300/50 rounded-full animate-float-medium"></div>
                                    <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-indigo-300/40 rounded-full animate-float-slow"></div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                                                        <th className="py-4 px-6 font-medium">Account Info</th>
                                                        <th className="py-4 px-6 font-medium">Currency / Time</th>
                                                        <th className="py-4 px-6 font-medium">Link Status</th>
                                                        <th className="py-4 px-6 font-medium text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {accounts.map((account) => (
                                                        <tr key={account.customerId} className="group hover:bg-white/5 transition-colors">
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${account.linkStatus === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-blue-400'}`}>
                                                                        {account.linkStatus === 'ACTIVE' ? <Check className="w-5 h-5" /> : <span className="font-bold text-xs">{account.customerId.slice(-3)}</span>}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-white">{account.descriptiveName || 'Google Ads Account'}</div>
                                                                        <div className="text-xs text-gray-500 font-mono">{account.customerId}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6 text-sm text-gray-400">
                                                                <div className="flex flex-col">
                                                                    <span>{account.currencyCode}</span>
                                                                    <span className="text-xs text-gray-600">{account.timeZone}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                {getStatusBadge(account.linkStatus)}
                                                            </td>
                                                            <td className="py-4 px-6 text-right">
                                                                {account.linkStatus === 'ACTIVE' || account.linkStatus === 'PENDING' ? (
                                                                    <button
                                                                        disabled
                                                                        className="opacity-50 cursor-not-allowed inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10"
                                                                    >
                                                                        <Check className="w-5 h-5 text-green-400" />
                                                                    </button>
                                                                ) : (
                                                                    <GlowButton
                                                                        onClick={() => handleCheckStatus(account)}
                                                                        disabled={processingId === account.customerId}
                                                                        variant="blue"
                                                                        className="!py-1.5 !px-4 !text-xs !min-w-[100px]"
                                                                    >
                                                                        {processingId === account.customerId ? 'Checking...' : 'Check Status'}
                                                                    </GlowButton>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {accounts.length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="py-12 text-center text-gray-500">
                                                                No accounts found. Please ensure you are logged in to the correct Google Account.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Navigation */}
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => router.push('/google-ads/integrations')}
                            className="text-gray-500 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Integrations Hub
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default function GoogleAdsIntegrationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <GoogleAdsIntegrationContent />
        </Suspense>
    );
}
