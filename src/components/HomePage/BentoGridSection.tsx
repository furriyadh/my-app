"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { AnimatedList } from "@/components/ui/animated-list";
import { Sparkles, Target, Zap, TrendingUp, CheckCircle2 } from "lucide-react";

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "z-10 flex size-14 items-center justify-center rounded-full border-2 bg-zinc-900 border-zinc-700 p-3 shadow-[0_0_20px_-12px_rgba(168,85,247,0.8)]",
                className
            )}
        >
            {children}
        </div>
    );
});

Circle.displayName = "Circle";

// Icons - Using official icons from integrations page
const Icons = {
    googleAds: ({ className = "w-10 h-10" }: { className?: string }) => (
        <img src="/images/integrations/google-ads-logo.svg" alt="Google Ads" width={40} height={40} className={cn("object-contain", className)} />
    ),
    analytics: ({ className = "w-10 h-10" }: { className?: string }) => (
        <img src="/images/integrations/google-analytics-logo.svg" alt="Google Analytics" width={40} height={40} className={cn("object-contain", className)} />
    ),
    tagManager: ({ className = "w-10 h-10" }: { className?: string }) => (
        <svg viewBox="0 0 48 48" className={className}>
            <path fill="#4fc3f7" d="M44.945,21.453L26.547,3.055c-1.404-1.404-3.689-1.404-5.094,0L3.055,21.453c-1.404,1.404-1.404,3.689,0,5.094l18.398,18.398c0.702,0.702,1.625,1.053,2.547,1.053s1.845-0.351,2.547-1.053l18.398-18.398C46.349,25.143,46.349,22.857,44.945,21.453z M24,29l-5-5l5-5l5,5L24,29z" />
            <path fill="#2979ff" d="M33.246,9.754L24,19l5,5l-5,5l9.246,9.246l11.699-11.699c1.404-1.404,1.404-3.689,0-5.094L33.246,9.754z" />
            <path fill="#2962ff" d="M14.754,38.246l6.699,6.699c0.702,0.702,1.625,1.053,2.547,1.053s1.845-0.351,2.547-1.053l6.699-6.699L24,29L14.754,38.246z" />
        </svg>
    ),
    merchantCenter: ({ className = "w-10 h-10" }: { className?: string }) => (
        <svg viewBox="0 0 24 24" className={className}>
            <path fill="#4285F4" d="M20.01 7.56L12 2 3.99 7.56v8.88L12 22l8.01-5.56V7.56z" />
            <path fill="#34A853" d="M12 22l8.01-5.56V7.56L12 13.12V22z" />
            <path fill="#FBBC05" d="M3.99 16.44L12 22v-8.88L3.99 7.56v8.88z" />
            <path fill="#EA4335" d="M12 2l8.01 5.56L12 13.12 3.99 7.56 12 2z" />
            <path fill="#fff" d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0 5.5a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
    ),
    youtube: ({ className = "w-10 h-10" }: { className?: string }) => (
        <svg viewBox="0 0 24 24" className={className} fill="#FF0000">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
    ),
    furriyadh: ({ className = "w-12 h-12" }: { className?: string }) => (
        <img src="/images/logo-icon.svg" alt="Furriyadh" width={48} height={48} className={cn("object-contain", className)} />
    ),
    user: ({ className = "w-8 h-8" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
};

// Ad Creation Steps for AnimatedList
interface AdStep {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

const adCreationSteps: AdStep[] = [
    {
        icon: <Target className="w-5 h-5" />,
        title: "Select Campaign Goal",
        description: "Choose your objective: Sales, Leads, Traffic",
        color: "from-purple-500 to-purple-600"
    },
    {
        icon: <Sparkles className="w-5 h-5" />,
        title: "AI Generates Content",
        description: "Smart headlines & descriptions created",
        color: "from-blue-500 to-blue-600"
    },
    {
        icon: <Zap className="w-5 h-5" />,
        title: "Optimize Budget",
        description: "AI recommends best bid strategy",
        color: "from-yellow-500 to-orange-500"
    },
    {
        icon: <TrendingUp className="w-5 h-5" />,
        title: "Launch Campaign",
        description: "Go live in under 60 seconds",
        color: "from-green-500 to-emerald-500"
    },
    {
        icon: <CheckCircle2 className="w-5 h-5" />,
        title: "Track Performance",
        description: "Real-time analytics dashboard",
        color: "from-cyan-500 to-blue-500"
    },
];

// Multiply steps for continuous animation (like MagicUI demo)
const notifications = Array.from({ length: 10 }, () => adCreationSteps).flat();

const AdStepItem = ({ step }: { step: AdStep }) => (
    <figure className="relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4 transition-all duration-200 ease-in-out hover:scale-[103%] transform-gpu bg-transparent backdrop-blur-md border border-white/10">
        <div className="flex flex-row items-center gap-3">
            <div className={cn(
                "flex items-center justify-center size-10 rounded-2xl text-white shrink-0 bg-gradient-to-br",
                step.color
            )}>
                {step.icon}
            </div>
            <div className="flex flex-col overflow-hidden">
                <figcaption className="flex flex-row items-center text-lg font-medium whitespace-pre text-white">
                    <span className="text-sm sm:text-lg">{step.title}</span>
                </figcaption>
                <p className="text-sm font-normal text-white/60">
                    {step.description}
                </p>
            </div>
        </div>
    </figure>
);

export default function AnimatedBeamSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const div1Ref = useRef<HTMLDivElement>(null);
    const div2Ref = useRef<HTMLDivElement>(null);
    const div3Ref = useRef<HTMLDivElement>(null);
    const div4Ref = useRef<HTMLDivElement>(null);
    const div5Ref = useRef<HTMLDivElement>(null);
    const div6Ref = useRef<HTMLDivElement>(null);
    const div7Ref = useRef<HTMLDivElement>(null);

    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                {/* Centered Layout */}
                <div className="flex flex-col items-center gap-10">

                    <div className="text-center max-w-5xl mx-auto">
                        <h2 className="text-3xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
                            Simple, smart & <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">affordable advertising</span>
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed mt-6">
                            Whether you're just starting out or scaling up, Furriyadh makes it easy to launch powerful ad campaigns. Connect all your marketing platforms in one place. Our AI does the heavy lifting so you can focus on growing your business.
                        </p>
                    </div>

                    {/* Content - Integrations */}
                    <div className="relative w-full max-w-5xl mx-auto">
                        {/* Static Glow Effect */}
                        <div className="absolute inset-0 rounded-3xl shadow-[0_0_40px_10px_rgba(168,85,247,0.35)]" />

                        <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-purple-950/30 backdrop-blur-xl p-8 overflow-hidden">
                            {/* Top gradient line */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                            {/* Card Header */}

                            {/* Animated Beam Demo */}
                            <div
                                className="relative flex h-[400px] w-full items-center justify-center overflow-hidden"
                                ref={containerRef}
                            >
                                <div className="flex size-full max-w-3xl flex-row items-stretch justify-between gap-16 px-4">
                                    {/* Left - User */}
                                    <div className="flex flex-col justify-center">
                                        <Circle ref={div7Ref} className="size-24 border-purple-500/50 bg-zinc-900/80">
                                            <Icons.user className="w-10 h-10" />
                                        </Circle>
                                    </div>

                                    {/* Center - Furriyadh AI Hub */}
                                    <div className="flex flex-col justify-center">
                                        <Circle ref={div6Ref} className="size-24 border-purple-500 bg-gradient-to-br from-purple-900/50 to-blue-900/50 shadow-purple-500/40 shadow-2xl p-4">
                                            <Icons.furriyadh className="w-16 h-16" />
                                        </Circle>
                                    </div>

                                    {/* Right - Integrations */}
                                    <div className="flex flex-col justify-center gap-6">
                                        <Circle ref={div1Ref} className="size-16 border-yellow-500/50 bg-yellow-500/10">
                                            <Icons.googleAds className="w-8 h-8" />
                                        </Circle>
                                        <Circle ref={div2Ref} className="size-16 border-orange-500/50 bg-orange-500/10">
                                            <Icons.analytics className="w-8 h-8" />
                                        </Circle>
                                        <Circle ref={div3Ref} className="size-16 border-cyan-500/50 bg-cyan-500/10">
                                            <Icons.tagManager className="w-8 h-8" />
                                        </Circle>
                                        <Circle ref={div4Ref} className="size-16 border-blue-400/50 bg-blue-400/10">
                                            <Icons.merchantCenter className="w-8 h-8" />
                                        </Circle>
                                        <Circle ref={div5Ref} className="size-16 border-red-500/50 bg-red-500/10">
                                            <Icons.youtube className="w-8 h-8" />
                                        </Circle>
                                    </div>
                                </div>

                                {/* AnimatedBeams */}
                                <AnimatedBeam
                                    containerRef={containerRef}
                                    fromRef={div1Ref}
                                    toRef={div6Ref}
                                    duration={2}
                                    gradientStartColor="#a855f7"
                                    gradientStopColor="#3b82f6"
                                />
                                <AnimatedBeam
                                    containerRef={containerRef}
                                    fromRef={div2Ref}
                                    toRef={div6Ref}
                                    duration={2}
                                    gradientStartColor="#a855f7"
                                    gradientStopColor="#3b82f6"
                                />
                                <AnimatedBeam
                                    containerRef={containerRef}
                                    fromRef={div3Ref}
                                    toRef={div6Ref}
                                    duration={2}
                                    gradientStartColor="#a855f7"
                                    gradientStopColor="#3b82f6"
                                />
                                <AnimatedBeam
                                    containerRef={containerRef}
                                    fromRef={div4Ref}
                                    toRef={div6Ref}
                                    duration={2}
                                    gradientStartColor="#a855f7"
                                    gradientStopColor="#3b82f6"
                                />
                                <AnimatedBeam
                                    containerRef={containerRef}
                                    fromRef={div5Ref}
                                    toRef={div6Ref}
                                    duration={2}
                                    gradientStartColor="#a855f7"
                                    gradientStopColor="#3b82f6"
                                />
                                <AnimatedBeam
                                    containerRef={containerRef}
                                    fromRef={div6Ref}
                                    toRef={div7Ref}
                                    duration={2}
                                    gradientStartColor="#a855f7"
                                    gradientStopColor="#3b82f6"
                                />
                            </div>

                            {/* Decorative glows */}
                            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]" />
                            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/15 rounded-full blur-[80px]" />

                            {/* Bottom gradient line */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                        </div>
                    </div>
                </div>


            </div>
        </section>
    );
}
