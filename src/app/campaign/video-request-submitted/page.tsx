'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Clock, Mail, ArrowRight, Youtube, Rocket, FileCheck, Play } from 'lucide-react';

function VideoRequestContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [countdown, setCountdown] = useState(20);

    const campaignName = searchParams.get('campaign') || 'Video Campaign';
    const videoId = searchParams.get('video') || '';
    const budget = searchParams.get('budget') || '15';
    const currency = searchParams.get('currency') || 'USD';

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Separate effect to handle redirect when countdown reaches 0
    useEffect(() => {
        if (countdown === 0) {
            router.push('/dashboard');
        }
    }, [countdown, router]);

    const steps = [
        { icon: FileCheck, text: 'Team review of campaign details', color: '#3b82f6' },
        { icon: Rocket, text: 'Upload to Google Ads', color: '#8b5cf6' },
        { icon: Mail, text: 'Email notification when live', color: '#22c55e' },
        { icon: Play, text: 'Your ad starts showing on YouTube', color: '#ef4444' },
    ];

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">

                {/* Main Card */}
                <div className="bg-[#111111] rounded-3xl shadow-2xl border border-gray-800/50 overflow-hidden backdrop-blur-sm relative">

                    {/* Top Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-800/50">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/images/logo-big.svg"
                                alt="Furriyadh"
                                width={140}
                                height={40}
                                className="w-auto h-8 invert brightness-0 invert-[1] opacity-90"
                                priority
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-gray-400 text-xs font-medium tracking-wide text-white">Video Campaign</span>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-10 py-12 text-center">
                        {/* Success Icon */}
                        <div className="mb-8 relative inline-block">
                            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                                <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                            Request Received
                        </h1>

                        <p className="text-gray-400 text-base mb-10 leading-relaxed max-w-md mx-auto">
                            Your video campaign is currently under review. Our team will process and upload it within <span className="text-white font-semibold">24-48 hours</span>.
                        </p>

                        {/* CTA Button */}
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="group relative inline-flex items-center gap-2 px-10 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-white/10 text-lg"
                        >
                            <span>Go to Dashboard</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Video Thumbnail */}
                    {videoId && (
                        <div className="px-10 pb-10">
                            <div className="bg-gray-900/50 rounded-2xl p-1.5 border border-gray-800/50 shadow-xl">
                                <div className="rounded-xl overflow-hidden relative group aspect-video">
                                    <a
                                        href={`https://youtube.com/watch?v=${videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full h-full relative"
                                    >
                                        <img
                                            src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                                            alt="Video Thumbnail"
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-105 group-hover:scale-110 transform"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center backdrop-blur-[1px] group-hover:backdrop-blur-none">
                                            <div className="w-16 h-16 bg-red-600/90 hover:bg-red-600 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl transition-transform transform group-hover:scale-110">
                                                <Play className="w-7 h-7 text-white ml-0.5" fill="white" />
                                            </div>
                                        </div>
                                    </a>
                                </div>

                                <div className="px-5 py-4 flex justify-between items-center bg-[#0d0d0d] rounded-b-xl border-t border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-500/10 p-2 rounded-lg">
                                            <Youtube className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Campaign</p>
                                            <p className="text-gray-200 text-sm font-medium max-w-[200px] truncate">{campaignName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Budget</p>
                                        <p className="text-white text-sm font-bold font-mono">${budget}/{currency}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* What's Next */}
                    <div className="px-10 pb-12">
                        <h3 className="text-white text-sm font-semibold mb-6 flex items-center gap-2">
                            <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                            Next Steps
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-start gap-4 group p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center border border-gray-800 bg-gray-900 group-hover:border-${step.color.replace('#', '')} transition-colors shadow-sm`}>
                                        <step.icon className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" style={{ color: index === 0 ? step.color : undefined }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium transition-colors ${index === 0 ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                            {step.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-[#050505] border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600 gap-3">
                        <span className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Redirecting in <span className="text-red-500 font-mono font-bold text-sm">{countdown}s</span>
                        </span>
                        <div className="flex gap-6">
                            <a href="mailto:ads@furriyadh.com" className="hover:text-white transition-colors hover:underline">Support</a>
                            <a href="https://furriyadh.com" className="hover:text-white transition-colors hover:underline">Privacy Policy</a>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-gray-600/50 text-xs">
                    © 2024 Furriyadh Inc. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default function VideoRequestSubmittedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
        }>
            <VideoRequestContent />
        </Suspense>
    );
}
