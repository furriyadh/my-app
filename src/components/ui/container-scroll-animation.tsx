"use client";
import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { useMediaQuery } from "react-responsive";

export const ContainerScroll = ({
    titleComponent,
    children,
}: {
    titleComponent: string | React.ReactNode;
    children: React.ReactNode;
}) => {
    const containerRef = useRef<any>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
    });

    // Use library for robust media query handling
    const isMobileQuery = useMediaQuery({ maxWidth: 768 });
    const [isMobile, setIsMobile] = useState(false);

    // Handle hydration mismatch safely
    useEffect(() => {
        setIsMobile(isMobileQuery);
    }, [isMobileQuery]);

    const scaleDimensions = () => {
        return isMobile ? [0.7, 0.9] : [1.05, 1];
    };

    const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);

    // Mobile: Flat (0) -> Curved (20) to show content clearly first
    // Desktop: Curved (20) -> Flat (0) for dramatic reveal
    const mobileRotate = useTransform(scrollYProgress, [0, 1], [0, 20]);

    const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
    const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

    return (
        <div
            className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
            ref={containerRef}
        >
            <div
                className="py-10 w-full relative"
                style={{
                    perspective: "1000px",
                }}
            >
                <Header translate={translate} titleComponent={titleComponent} />
                <Card
                    rotate={isMobile ? mobileRotate : rotate}
                    translate={translate}
                    scale={scale}
                >
                    {children}
                </Card>
            </div>
        </div>
    );
};

export const Header = ({ translate, titleComponent }: any) => {
    return (
        <motion.div
            style={{
                translateY: translate,
            }}
            className="div max-w-5xl mx-auto text-center"
        >
            {titleComponent}
        </motion.div>
    );
};

export const Card = ({
    rotate,
    scale,
    translate,
    children,
}: {
    rotate: MotionValue<number>;
    scale: MotionValue<number>;
    translate: MotionValue<number>;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            style={{
                translateY: translate,
                rotateX: rotate,
                scale,
                boxShadow:
                    "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
            }}
            className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] max-h-[55vh] md:max-h-[80vh] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
        >
            <div className=" h-full w-full overflow-hidden rounded-2xl bg-black md:rounded-2xl">
                {children}
            </div>
        </motion.div>
    );
};
