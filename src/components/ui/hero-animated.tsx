'use client';

import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { type Variants } from 'motion/react';
import React from 'react';

interface HeroAnimatedProps {
    eyebrow?: string;
    headline: string;
    description: string;
    buttons?: Array<{
        text: string;
        href: string;
        variant?: 'primary' | 'outline' | 'ghost' | 'destructive';
        icon?: React.ReactNode;
        iconPosition?: 'left' | 'right';
    }>;
    image?: string;
    imageAlt?: string;
    backgroundImage?: string;
}

const transitionVariants: { item: Variants } = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 20,
            },
        },
    },
};

export function HeroAnimated({
    eyebrow,
    headline,
    description,
    buttons,
    image,
    imageAlt,
    backgroundImage,
}: HeroAnimatedProps) {
    return (
        <main className="overflow-hidden">
            <div
                aria-hidden
                className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
            >
                <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
            </div>
            <section>
                <div className="relative pt-24 md:pt-36">
                    <AnimatedGroup
                        variants={{
                            container: {
                                visible: {
                                    transition: {
                                        delayChildren: 1,
                                    },
                                },
                            },
                            item: {
                                hidden: {
                                    opacity: 0,
                                    y: 20,
                                },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        type: 'spring',
                                        bounce: 0.3,
                                        duration: 2,
                                    },
                                },
                            },
                        }}
                        className="absolute inset-0 -z-20"
                    >
                        {backgroundImage && (
                            <img
                                src={backgroundImage}
                                alt="Hero background"
                                className="absolute inset-x-0 top-56 -z-20 lg:top-32"
                            />
                        )}
                    </AnimatedGroup>
                    <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                            {eyebrow && (
                                <AnimatedGroup variants={transitionVariants}>
                                    <div className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">{eyebrow}</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedGroup>
                            )}
                            <TextEffect
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                as="h1"
                                className="mt-8 text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-bold"
                            >
                                {headline}
                            </TextEffect>
                            <TextEffect
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                delay={0.5}
                                as="p"
                                className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground"
                            >
                                {description}
                            </TextEffect>
                            {buttons && buttons.length > 0 && (
                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                                >
                                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                                        {buttons.map((button, index) => (
                                            <a key={index} href={button.href}>
                                                <Button
                                                    variant={
                                                        button.variant === 'primary'
                                                            ? 'default'
                                                            : button.variant
                                                    }
                                                    className="h-10 rounded-md px-8"
                                                >
                                                    {button.iconPosition === 'left' && button.icon}
                                                    {button.text}
                                                    {button.iconPosition === 'right' && button.icon}
                                                </Button>
                                            </a>
                                        ))}
                                    </div>
                                </AnimatedGroup>
                            )}
                            {image && (
                                <div className="mt-16 lg:mt-24">
                                    <AnimatedGroup
                                        preset="fade"
                                        variants={{
                                            container: {
                                                visible: {
                                                    transition: {
                                                        staggerChildren: 0.05,
                                                        delayChildren: 0.75,
                                                    },
                                                },
                                            },
                                            ...transitionVariants,
                                        }}
                                    >
                                        <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                            <div
                                                aria-hidden
                                                className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                            />
                                            <div
                                                className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-purple-500/50 p-4 shadow-lg bg-background"
                                                style={{
                                                    boxShadow: '0 0 60px 15px rgba(139, 92, 246, 0.3), 0 0 100px 30px rgba(139, 92, 246, 0.15)'
                                                }}
                                            >
                                                <img
                                                    className="bg-background aspect-15/8 relative block rounded-2xl w-full"
                                                    src={image}
                                                    alt={imageAlt || 'Hero image'}
                                                />
                                            </div>
                                        </div>
                                    </AnimatedGroup>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
