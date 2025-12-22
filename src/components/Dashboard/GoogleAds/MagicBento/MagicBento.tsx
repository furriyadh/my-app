"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Target, TrendingUp, Activity, Zap, DollarSign, Eye } from 'lucide-react';

const DEFAULT_GLOW_COLOR = '132, 0, 255'; // Keep glow for effect, but background will be standard

export interface BentoCardProps {
  color?: string;
  title?: string;
  description?: string;
  label?: string;
  icon?: React.ComponentType<any>;
  value?: string | number;
  textAutoHide?: boolean;
  disableAnimations?: boolean;
}

export interface BentoProps {
  campaigns?: BentoCardProps[];
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x: number, y: number, color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}> = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement[]>([]);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const isHoveredRef = useRef(false);
    const memoizedParticles = useRef<HTMLDivElement[]>([]);
    const particlesInitialized = useRef(false);
    const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

    const initializeParticles = useCallback(() => {
      if (particlesInitialized.current || !cardRef.current) return;

      const { width, height } = cardRef.current.getBoundingClientRect();
      memoizedParticles.current = Array.from({ length: particleCount }, () =>
        createParticleElement(Math.random() * width, Math.random() * height, glowColor)
      );
      particlesInitialized.current = true;
    }, [particleCount, glowColor]);

    const clearAllParticles = useCallback(() => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      magnetismAnimationRef.current?.kill();

      particlesRef.current.forEach(particle => {
        gsap.to(particle, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'back.in(1.7)',
          onComplete: () => {
            particle.parentNode?.removeChild(particle);
          }
        });
      });
      particlesRef.current = [];
    }, []);

    const animateParticles = useCallback(() => {
      if (!cardRef.current || !isHoveredRef.current) return;

      if (!particlesInitialized.current) {
        initializeParticles();
      }

      memoizedParticles.current.forEach((particle, index) => {
        const timeoutId = setTimeout(() => {
          if (!isHoveredRef.current || !cardRef.current) return;

          const clone = particle.cloneNode(true) as HTMLDivElement;
          cardRef.current.appendChild(clone);
          particlesRef.current.push(clone);

          gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

          gsap.to(clone, {
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            rotation: Math.random() * 360,
            duration: 2 + Math.random() * 2,
            ease: 'none',
            repeat: -1,
            yoyo: true
          });

          gsap.to(clone, {
            opacity: 0.3,
            duration: 1.5,
            ease: 'power2.inOut',
            repeat: -1,
            yoyo: true
          });
        }, index * 100);

        timeoutsRef.current.push(timeoutId);
      });
    }, [initializeParticles]);

    useEffect(() => {
      if (disableAnimations || !cardRef.current) return;

      const element = cardRef.current;

      const handleMouseEnter = () => {
        isHoveredRef.current = true;
        animateParticles();

        if (enableTilt) {
          gsap.to(element, {
            rotateX: 5,
            rotateY: 5,
            duration: 0.3,
            ease: 'power2.out',
            transformPerspective: 1000
          });
        }
      };

      const handleMouseLeave = () => {
        isHoveredRef.current = false;
        clearAllParticles();

        if (enableTilt) {
          gsap.to(element, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        }

        if (enableMagnetism) {
          gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!enableTilt && !enableMagnetism) return;

        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        if (enableTilt) {
          const rotateX = ((y - centerY) / centerY) * -10;
          const rotateY = ((x - centerX) / centerX) * 10;

          gsap.to(element, {
            rotateX,
            rotateY,
            duration: 0.1,
            ease: 'power2.out',
            transformPerspective: 1000
          });
        }

        if (enableMagnetism) {
          const magnetX = (x - centerX) * 0.05;
          const magnetY = (y - centerY) * 0.05;

          magnetismAnimationRef.current = gsap.to(element, {
            x: magnetX,
            y: magnetY,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      };

      const handleClick = (e: MouseEvent) => {
        if (!clickEffect) return;

        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const maxDistance = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height)
        );

        const ripple = document.createElement('div');
        ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

        element.appendChild(ripple);

        gsap.fromTo(
          ripple,
          {
            scale: 0,
            opacity: 1
          },
          {
            scale: 1,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => ripple.remove()
          }
        );
      };

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('click', handleClick);

      return () => {
        isHoveredRef.current = false;
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('click', handleClick);
        clearAllParticles();
      };
    }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

    return (
      <div
        ref={cardRef}
        className={`${className} relative overflow-hidden`}
        style={{ ...style, position: 'relative', overflow: 'hidden' }}
      >
        {children}
      </div>
    );
  };

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
    const spotlightRef = useRef<HTMLDivElement | null>(null);
    const isInsideSection = useRef(false);

    useEffect(() => {
      if (disableAnimations || !gridRef?.current || !enabled) return;

      const spotlight = document.createElement('div');
      spotlight.className = 'global-spotlight';
      spotlight.style.cssText = `
      position: fixed;
      width: 1000px;
      height: 1000px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.25) 0%,
        rgba(${glowColor}, 0.18) 15%,
        rgba(${glowColor}, 0.12) 25%,
        rgba(${glowColor}, 0.08) 40%,
        rgba(${glowColor}, 0.04) 55%,
        rgba(${glowColor}, 0.02) 65%,
        transparent 75%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
      filter: blur(40px);
    `;
      document.body.appendChild(spotlight);
      spotlightRef.current = spotlight;

      const handleMouseMove = (e: MouseEvent) => {
        if (!spotlightRef.current || !gridRef.current) return;

        const section = gridRef.current.closest('.bento-section');
        const rect = section?.getBoundingClientRect();
        const mouseInside =
          rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

        isInsideSection.current = mouseInside || false;
        const cards = gridRef.current.querySelectorAll('.card');

        if (!mouseInside) {
          gsap.to(spotlightRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
          cards.forEach(card => {
            (card as HTMLElement).style.setProperty('--glow-intensity', '0');
          });
          return;
        }

        const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
        let minDistance = Infinity;

        cards.forEach(card => {
          const cardElement = card as HTMLElement;
          const cardRect = cardElement.getBoundingClientRect();
          const centerX = cardRect.left + cardRect.width / 2;
          const centerY = cardRect.top + cardRect.height / 2;
          const distance =
            Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
          const effectiveDistance = Math.max(0, distance);

          minDistance = Math.min(minDistance, effectiveDistance);

          let glowIntensity = 0;
          if (effectiveDistance <= proximity) {
            glowIntensity = 1;
          } else if (effectiveDistance <= fadeDistance) {
            glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
          }

          updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
        });

        gsap.to(spotlightRef.current, {
          left: e.clientX,
          top: e.clientY,
          duration: 0.1,
          ease: 'power2.out'
        });

        const targetOpacity =
          minDistance <= proximity
            ? 1
            : minDistance <= fadeDistance
              ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 1
              : 0;

        gsap.to(spotlightRef.current, {
          opacity: targetOpacity,
          duration: targetOpacity > 0 ? 0.2 : 0.5,
          ease: 'power2.out'
        });
      };

      const handleMouseLeave = () => {
        isInsideSection.current = false;
        gridRef.current?.querySelectorAll('.card').forEach(card => {
          (card as HTMLElement).style.setProperty('--glow-intensity', '0');
        });
        if (spotlightRef.current) {
          gsap.to(spotlightRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
      };
    }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

    return null;
  };

const BentoCardGrid: React.FC<{
  children: React.ReactNode;
  gridRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ children, gridRef }) => (
  <div
    className="bento-section grid gap-2 p-3 max-w-full select-none relative"
    style={{ fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.5rem)' }}
    ref={gridRef}
  >
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Fetch real data from API
const MagicBento: React.FC<BentoProps> = ({
  campaigns = [],
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;
  const { t } = useTranslation();

  // Default card data if no campaigns provided
  const defaultCards: BentoCardProps[] = [
    {
      color: '#060010',
      title: t.dashboard.totalCampaigns || 'Total Campaigns',
      description: t.dashboard.allActiveCampaigns || 'All active campaigns',
      label: t.dashboard.overview || 'Overview',
      icon: Target,
      value: '0'
    },
    {
      color: '#060010',
      title: t.dashboard.performance || 'Performance',
      description: t.dashboard.campaignPerformance || 'Campaign performance metrics',
      label: t.dashboard.metrics || 'Metrics',
      icon: TrendingUp,
      value: '0%'
    },
    {
      color: '#060010',
      title: t.dashboard.impressions || 'Impressions',
      description: t.dashboard.totalImpressions || 'Total ad impressions',
      label: t.dashboard.reach || 'Reach',
      icon: Eye,
      value: '0'
    },
    {
      color: '#060010',
      title: t.dashboard.clicks || 'Clicks',
      description: t.dashboard.totalClicks || 'Total clicks received',
      label: t.dashboard.engagement || 'Engagement',
      icon: Activity,
      value: '0'
    },
    {
      color: '#060010',
      title: t.dashboard.spend || 'Ad Spend',
      description: t.dashboard.totalSpent || 'Total advertising expenditure',
      label: t.dashboard.budget || 'Budget',
      icon: DollarSign,
      value: '$0'
    },
    {
      color: '#060010',
      title: t.dashboard.conversions || 'Conversions',
      description: t.dashboard.totalConversions || 'Total conversions achieved',
      label: t.dashboard.results || 'Results',
      icon: Zap,
      value: '0'
    }
  ];

  const cardData = campaigns.length > 0 ? campaigns : defaultCards;

  return (
    <>
      <style>
        {`
          .bento-section {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: 200px;
            --glow-color: ${glowColor};
            --border-color: rgba(0,0,0,0.1);
            --background-dark: #0c1427; /* Standard dark mode bg */
            --white: #64748b; /* Gray-500 for generic text */
            --text-title: #333333;
            --text-dark-title: #ffffff;
            --purple-primary: rgba(132, 0, 255, 1);
            --purple-glow: rgba(132, 0, 255, 0.2);
            --purple-border: rgba(132, 0, 255, 0.8);
          }
          
          /* Dark mode overrides */
          .dark .bento-section {
             --border-color: rgba(255,255,255,0.1);
             --white: #94a3b8; /* Gray-400 */
          }
          
          .card-responsive {
            grid-template-columns: 1fr;
            width: 100%;
            margin: 0 auto;
            padding: 0.5rem;
          }
          
          @media (min-width: 600px) {
            .card-responsive {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          @media (min-width: 1024px) {
            .card-responsive {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          
          .card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 6px;
            background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.4)) 30%,
                transparent 60%);
            border-radius: inherit;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: subtract;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 1;
          }
          
          .card--border-glow:hover::after {
            opacity: 1;
          }
          
          .card--border-glow:hover {
            box-shadow: 
              0 4px 20px rgba(46, 24, 78, 0.6), 
              0 0 40px rgba(${glowColor}, 0.4),
              0 0 60px rgba(${glowColor}, 0.3),
              0 0 80px rgba(${glowColor}, 0.2);
            transform: translateY(-4px);
          }
          
          .card--border-glow {
            transition: all 0.3s ease;
          }
          
          /* Particle glow enhancement */
          .particle::before {
            content: '';
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            background: rgba(${glowColor}, 0.4);
            border-radius: 50%;
            filter: blur(4px);
            z-index: -1;
          }
          
          .text-clamp-1 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .text-clamp-2 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          /* Enhanced card styling */
          /* Enhanced card styling matching standard dashboard */
          .card {
            background: #ffffff;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          }
          .dark .card {
            background: #0c1427; /* Matching standard dark theme */
            box-shadow: none;
          }
          
          .card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            /* background: linear-gradient(145deg, rgba(132, 0, 255, 0.03), rgba(132, 0, 255, 0.01)); Removed for cleaner look */
            pointer-events: none;
            z-index: 0;
          }
          
          /* Card value number styling */
          .card__content > div:first-child {
            text-shadow: 0 0 20px rgba(132, 0, 255, 0.5), 
                         0 0 40px rgba(132, 0, 255, 0.3);
          }
          
          /* Icon glow on hover */
          .card:hover .card__header svg {
            filter: drop-shadow(0 0 8px rgba(132, 0, 255, 0.6));
          }
          
          /* Label enhancement */
          .card__label {
            text-shadow: 0 0 10px rgba(132, 0, 255, 0.3);
          }
        `}
      </style>

      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        <div className="card-responsive grid gap-4">
          {cardData.map((card, index) => {
            const baseClassName = `card flex flex-col justify-between relative aspect-[4/3] min-h-[180px] w-full max-w-full p-[20px] md:p-[25px] rounded-md border border-gray-100 dark:border-[#172036] overflow-hidden transition-all duration-300 ease-in-out ${enableBorderGlow ? 'card--border-glow' : ''
              }`;

            const cardStyle = {
              // backgroundColor handled by class
              // borderColor: 'var(--border-color)',
              // color: 'var(--white)',
              '--glow-x': '50%',
              '--glow-y': '50%',
              '--glow-intensity': '0',
              '--glow-radius': '200px'
            } as React.CSSProperties;

            const Icon = card.icon;

            if (enableStars) {
              return (
                <ParticleCard
                  key={index}
                  className={baseClassName}
                  style={cardStyle}
                  disableAnimations={shouldDisableAnimations}
                  particleCount={particleCount}
                  glowColor={glowColor}
                  enableTilt={enableTilt}
                  clickEffect={clickEffect}
                  enableMagnetism={enableMagnetism}
                >
                  <div className="card__header flex justify-between gap-3 relative z-10">
                    <span className="card__label text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">{card.label}</span>
                    {Icon && <Icon className="w-6 h-6 text-primary-500" />}
                  </div>
                  <div className="card__content flex flex-col relative z-10 mt-auto">
                    {card.value && (
                      <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white leading-tight">
                        {card.value}
                      </div>
                    )}
                    <h3 className={`card__title font-semibold text-lg m-0 mb-1 text-gray-800 dark:text-gray-100 ${textAutoHide ? 'text-clamp-1' : ''}`}>
                      {card.title}
                    </h3>
                    <p
                      className={`card__description text-sm text-gray-500 dark:text-gray-400 leading-relaxed ${textAutoHide ? 'text-clamp-2' : ''}`}
                    >
                      {card.description}
                    </p>
                  </div>
                </ParticleCard>
              );
            }

            return (
              <div
                key={index}
                className={baseClassName}
                style={cardStyle}
              >
                <div className="card__header flex justify-between gap-3 relative z-10">
                  <span className="card__label text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">{card.label}</span>
                  {Icon && <Icon className="w-6 h-6 text-primary-500" />}
                </div>
                <div className="card__content flex flex-col relative z-10 mt-auto">
                  {card.value && (
                    <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white leading-tight">
                      {card.value}
                    </div>
                  )}
                  <h3 className={`card__title font-semibold text-lg m-0 mb-1 text-gray-800 dark:text-gray-100 ${textAutoHide ? 'text-clamp-1' : ''}`}>
                    {card.title}
                  </h3>
                  <p className={`card__description text-sm text-gray-500 dark:text-gray-400 leading-relaxed ${textAutoHide ? 'text-clamp-2' : ''}`}>
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;

