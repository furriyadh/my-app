'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ShoppingCart, Package } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    currency: string;
    image?: string;
    category?: string;
    brand?: string;
}

interface ShoppingPreviewProps {
    merchantId?: string;
    merchantName?: string;
    headlines?: string[];
    descriptions?: string[];
    dailyBudget?: number;
    currency?: string;
    websiteUrl?: string;
}

export default function ShoppingPreview({
    merchantName = 'Store',
    headlines = [],
    descriptions = [],
}: ShoppingPreviewProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hasFetched, setHasFetched] = useState(false);

    // Load products from localStorage ONCE - no API calls here
    useEffect(() => {
        if (hasFetched) return;

        try {
            const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
            const storedProducts = campaignData.merchantProducts || [];
            setProducts(storedProducts);
        } catch (error) {
            console.error('Error loading products from localStorage:', error);
        }

        setHasFetched(true);
    }, [hasFetched]);

    // Auto-scroll animation (only runs once products are set)
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || products.length <= 3) return;

        let scrollPosition = 0;
        const scrollSpeed = 0.5;
        let animationId: number;
        let isRunning = true;

        const animate = () => {
            if (!isRunning) return;

            scrollPosition += scrollSpeed;

            if (scrollPosition >= scrollContainer.scrollWidth / 2) {
                scrollPosition = 0;
            }

            scrollContainer.scrollLeft = scrollPosition;
            animationId = requestAnimationFrame(animate);
        };

        const timer = setTimeout(() => {
            animationId = requestAnimationFrame(animate);
        }, 1000);

        const handleMouseEnter = () => { isRunning = false; cancelAnimationFrame(animationId); };
        const handleMouseLeave = () => { isRunning = true; animationId = requestAnimationFrame(animate); };

        scrollContainer.addEventListener('mouseenter', handleMouseEnter);
        scrollContainer.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            isRunning = false;
            clearTimeout(timer);
            cancelAnimationFrame(animationId);
            scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
            scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [products.length]);

    const displayHeadlines = headlines.length > 0 ? headlines : [
        'مجوهرات لازوردي - تصاميم فاخرة',
        'خواتم ذهب 18 و21 قيراط'
    ];

    const displayDescriptions = descriptions.length > 0 ? descriptions : [
        'اكتشفي مجموعة مجوهرات لازوردي الفاخرة. تصاميم عصرية وكلاسيكية من الذهب والألماس.'
    ];

    const formatPrice = (price: number, curr: string) => {
        const symbols: Record<string, string> = {
            'USD': '$', 'SAR': 'ر.س', 'AED': 'د.إ', 'EUR': '€', 'GBP': '£', 'EGP': 'ج.م'
        };
        return `${symbols[curr] || '$'}${price.toLocaleString()}`;
    };

    const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

    // Duplicate products for infinite scroll effect
    const displayProducts = products.length > 0 ? [...products, ...products] : [];

    return (
        <div className="w-full space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400 text-xs font-medium">Shopping Campaign Preview</span>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">

                {/* Ad Section */}
                <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            Sponsored
                        </span>
                        <span className="text-gray-400 text-xs">·</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs truncate">{merchantName}</span>
                    </div>

                    <h3
                        className="text-blue-600 dark:text-blue-400 text-sm sm:text-base md:text-lg font-medium hover:underline cursor-pointer mb-2 line-clamp-2"
                        dir={isArabic(displayHeadlines[0]) ? 'rtl' : 'ltr'}
                    >
                        {displayHeadlines.slice(0, 2).join(' | ')}
                    </h3>

                    <p
                        className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2"
                        dir={isArabic(displayDescriptions[0]) ? 'rtl' : 'ltr'}
                    >
                        {displayDescriptions[0]}
                    </p>
                </div>

                {/* Products Section */}
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Package className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                            {products.length > 0 ? `${products.length} Products from ${merchantName}` : 'Products'}
                        </span>
                    </div>

                    {products.length === 0 ? (
                        /* No Products Message */
                        <div className="flex items-center justify-center h-24 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400 text-sm" dir="rtl">
                                لا توجد منتجات
                            </p>
                        </div>
                    ) : (
                        /* Products Infinite Scroll */
                        <div
                            ref={scrollRef}
                            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                            style={{ scrollBehavior: 'auto' }}
                        >
                            {displayProducts.map((product, index) => (
                                <div
                                    key={`${product.id}-${index}`}
                                    className="flex-shrink-0 w-28 sm:w-32 md:w-36 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-2 sm:p-2.5">
                                        <p
                                            className="text-gray-900 dark:text-white text-[10px] sm:text-xs font-medium line-clamp-2 h-8"
                                            dir={isArabic(product.name) ? 'rtl' : 'ltr'}
                                        >
                                            {product.name}
                                        </p>
                                        <p className="text-cyan-600 dark:text-cyan-400 text-xs sm:text-sm font-bold mt-1">
                                            {formatPrice(product.price, product.currency)}
                                        </p>
                                        {product.category && (
                                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9px] rounded truncate max-w-full">
                                                {product.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
