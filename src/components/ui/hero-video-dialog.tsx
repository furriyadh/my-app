"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "react-responsive"
import { Play, XIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Ripple } from "@/components/ui/ripple"

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out"

interface HeroVideoProps {
  animationStyle?: AnimationStyle
  videoSrc: string
  thumbnailSrc: string
  thumbnailAlt?: string
  className?: string
}

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
}

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className,
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const selectedAnimation = animationVariants[animationStyle]

  // Responsive Ripple settings - following pattern from page.tsx to avoid hydration mismatch
  const isMobileQuery = useMediaQuery({ maxWidth: 640 })
  const isTabletQuery = useMediaQuery({ minWidth: 641, maxWidth: 1024 })

  const [rippleProps, setRippleProps] = useState({
    mainCircleSize: 120,
    numCircles: 4, // Default (Desktop) - reduced from 8/5
    circleGap: 70
  })

  useEffect(() => {
    if (isMobileQuery) {
      setRippleProps({
        mainCircleSize: 60, // Much smaller for mobile
        numCircles: 3, // Fewer circles
        circleGap: 35 // Tighter gap
      })
    } else if (isTabletQuery) {
      setRippleProps({
        mainCircleSize: 100,
        numCircles: 3,
        circleGap: 50
      })
    } else {
      setRippleProps({
        mainCircleSize: 120, // Original-ish size
        numCircles: 3, // Reduced count further
        circleGap: 70 // Original gap
      })
    }
  }, [isMobileQuery, isTabletQuery])

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Play video"
        className="group relative cursor-pointer border-0 bg-transparent p-0"
        onClick={() => setIsVideoOpen(true)}
      >
        <Image
          src={thumbnailSrc}
          alt={thumbnailAlt}
          width={1920}
          height={1080}
          priority // Load immediately as LCP element
          className="w-full rounded-3xl border shadow-lg transition-all duration-200 ease-out group-hover:brightness-[0.8]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1350px"
          quality={85}
        />
        <div className="absolute inset-0 flex scale-[0.9] items-center justify-center rounded-2xl transition-all duration-200 ease-out group-hover:scale-100">
          {/* Professional Ripple Effect */}
          <Ripple
            mainCircleSize={rippleProps.mainCircleSize}
            mainCircleOpacity={0.4}
            numCircles={rippleProps.numCircles}
            circleGap={rippleProps.circleGap}
          />

          {/* Play Button */}
          <div className="relative z-10 bg-purple-500/20 flex size-28 items-center justify-center rounded-full backdrop-blur-md border border-purple-500/30">
            <div
              className="relative flex size-20 scale-100 items-center justify-center rounded-full bg-gradient-to-b from-purple-500 to-purple-700 shadow-lg shadow-purple-500/50 transition-all duration-200 ease-out group-hover:scale-[1.2]"
            >
              <Play
                className="size-8 scale-100 fill-white text-white transition-transform duration-200 ease-out group-hover:scale-105"
                style={{
                  filter:
                    "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
                }}
              />
            </div>
          </div>
        </div>
      </button>
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                setIsVideoOpen(false)
              }
            }}
            onClick={() => setIsVideoOpen(false)}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative mx-4 aspect-video w-full max-w-4xl md:mx-0"
            >
              <motion.button className="absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black">
                <XIcon className="size-5" />
              </motion.button>
              <div className="relative isolate z-[1] size-full overflow-hidden rounded-2xl border-2 border-white">
                <iframe
                  src={videoSrc}
                  title="Hero Video player"
                  className="size-full rounded-2xl"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
