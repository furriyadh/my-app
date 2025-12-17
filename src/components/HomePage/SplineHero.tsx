import Spline from '@splinetool/react-spline/next';
import SplineHeroOverlay from './SplineHeroOverlay';

export default function SplineHero() {

    // IMPORTANT: Replace this URL with your own from Spline (Export > Code > Public URL)
    // This is a placeholder URL for testing.
    const SPLINE_SCENE_URL = "https://prod.spline.design/ZHGlWU6u-0CHy5d4/scene.splinecode";

    return (
        <section className="relative w-full min-h-screen md:min-h-[130vh] bg-transparent overflow-hidden flex items-center justify-center">

            {/* Background Elements - Removed local bg to use global one */}
            {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(0,0,0,1)_100%)] z-0" /> */}

            {/* 3D Scene */}
            <div className="w-full h-full relative z-10 scale-100 md:scale-85">
                <Spline
                    scene={SPLINE_SCENE_URL}
                />
            </div>

            {/* Overlay Text */}
            <SplineHeroOverlay />

        </section>
    );
}
