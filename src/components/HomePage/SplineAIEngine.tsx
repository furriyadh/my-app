import Spline from '@splinetool/react-spline/next';

export default function SplineAIEngine() {
    // User provided AI Engine / Neural Network Scene
    const SPLINE_SCENE_URL = "https://prod.spline.design/6l5w7FNgmoWg17TE/scene.splinecode";

    return (
        <section className="relative w-full min-h-screen bg-transparent overflow-hidden flex flex-col items-center justify-start pt-20 md:pt-24">

            {/* Section Title - Static Position (Not Absolute) */}
            <div className="z-20 text-center px-4 mb-2 md:mb-8 pointer-events-none relative shrink-0">
                <h2 className="text-2xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-3 md:mb-4">
                    Neural Optimization Engine
                </h2>
                <p className="text-white/60 text-sm md:text-xl max-w-3xl mx-auto leading-relaxed">
                    Our advanced AI analyzes millions of market signals in real-time to predict ad performance and maximize your ROI instantly.
                </p>
            </div>

            {/* 3D Scene - Takes remaining space */}
            <div className="w-full flex-grow relative z-10 scale-100 min-h-[500px]">
                <Spline
                    scene={SPLINE_SCENE_URL}
                />
            </div>

        </section>
    );
}
