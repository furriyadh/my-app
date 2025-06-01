'use client'; // Added because useEffect is a client hook

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import ReviewsSection from '@/components/sections/ReviewsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CampaignSection from '@/components/sections/CampaignSection';
import OptimizationSection from '@/components/sections/OptimizationSection';
import DashboardSection from '@/components/sections/DashboardSection';
import BudgetSection from '@/components/sections/BudgetSection';
import IntegrationSection from '@/components/sections/IntegrationSection';

export default function HomePage() {
  const t = useTranslations('home');
  
  // تفعيل تأثيرات AOS عند تحميل الصفحة
  useEffect(() => {
    // Ensure AOS is available (it might be loaded via script tag)
    // Also check if window is defined (ensures code runs only in browser)
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.init();
    }
  }, []);
  
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ReviewsSection />
      <TestimonialsSection />
      <CampaignSection />
      <OptimizationSection />
      <DashboardSection />
      <BudgetSection />
      <IntegrationSection />
    </>
  );
}
