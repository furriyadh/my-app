"use client";

import dynamic from "next/dynamic";

const ParticlesBackground = dynamic(() => import("@/components/ui/ParticlesBackground"), {
    ssr: false,
});

const GoogleOneTap = dynamic(() => import("@/components/Authentication/GoogleOneTap"), {
    ssr: false,
});

const ScrollProgress = dynamic(() => import("@/components/ui/scroll-progress").then(mod => mod.ScrollProgress), {
    ssr: false,
});

export default function LazyComponents() {
    return (
        <>
            <ParticlesBackground />
            <GoogleOneTap />
            <ScrollProgress className="h-1" />
        </>
    );
}
