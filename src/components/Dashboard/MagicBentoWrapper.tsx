"use client";

import React, { useEffect, useState } from 'react';
import MagicBento, { BentoCardProps } from './MagicBento';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Target, Eye, MousePointer, Zap, DollarSign, TrendingUp, Star, Activity } from 'lucide-react';

const MagicBentoWrapper: React.FC = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Format large numbers for better readability
  const formatLargeNumber = (num: number): string => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/campaigns?timeRange=30');
        const data = await response.json();
        if (data.success) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 animate-pulse">
            <div className="h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  // Generate 8 KPI cards from real metrics
  const cardData: BentoCardProps[] = metrics ? [
    {
      color: '59, 130, 246',
      title: (t.dashboard as any)?.totalCampaigns || 'Total Campaigns',
      description: (t.dashboard as any)?.allActiveCampaigns || 'All active advertising campaigns',
      label: (t.dashboard as any)?.overview || 'Overview',
      icon: Target,
      value: metrics.totalCampaigns?.toString() || '0',
      textAutoHide: true
    },
    {
      color: '16, 185, 129',
      title: (t.dashboard as any)?.reach || 'Reach',
      description: (t.dashboard as any)?.totalImpressions || 'Total ad impressions served',
      label: (t.dashboard as any)?.impressions || 'Impressions',
      icon: Eye,
      value: formatLargeNumber(metrics.impressions || 0),
      textAutoHide: true
    },
    {
      color: '249, 115, 22',
      title: (t.dashboard as any)?.engagement || 'Engagement',
      description: (t.dashboard as any)?.totalClicks || 'Total clicks received',
      label: (t.dashboard as any)?.clicks || 'Clicks',
      icon: MousePointer,
      value: formatLargeNumber(metrics.clicks || 0),
      textAutoHide: true
    },
    {
      color: '168, 85, 247',
      title: (t.dashboard as any)?.results || 'Results',
      description: (t.dashboard as any)?.totalConversions || 'Total conversions achieved',
      label: (t.dashboard as any)?.conversions || 'Conversions',
      icon: Zap,
      value: formatLargeNumber(metrics.conversions || 0),
      textAutoHide: true
    },
    {
      color: '236, 72, 153',
      title: (t.dashboard as any)?.budget || 'Budget',
      description: (t.dashboard as any)?.totalSpendDesc || 'Total advertising expenditure',
      label: (t.dashboard as any)?.adSpend || 'Ad Spend',
      icon: DollarSign,
      value: `$${formatLargeNumber(metrics.totalSpend || 0)}`,
      textAutoHide: true
    },
    {
      color: '234, 179, 8',
      title: (t.dashboard as any)?.performance || 'Performance',
      description: (t.dashboard as any)?.returnOnAdSpend || 'Return on ad spend',
      label: (t.dashboard as any)?.roas || 'ROAS',
      icon: TrendingUp,
      value: `${(metrics.roas || 0).toFixed(2)}x`,
      textAutoHide: true
    },
    {
      color: '239, 68, 68',
      title: (t.dashboard as any)?.quality || 'Quality',
      description: (t.dashboard as any)?.avgQualityScore || 'Average quality score across campaigns',
      label: (t.dashboard as any)?.qualityScore || 'Score',
      icon: Star,
      value: `${(metrics.qualityScore || 0)}/10`,
      textAutoHide: true
    },
    {
      color: '34, 197, 94',
      title: (t.dashboard as any)?.impressionShareTitle || 'Impression Share',
      description: (t.dashboard as any)?.searchImpressionShare || 'Search network impression share',
      label: (t.dashboard as any)?.share || 'Share',
      icon: Activity,
      value: `${(metrics.impressionShare || 0)}%`,
      textAutoHide: true
    }
  ] : [];

  return (
    <MagicBento
      campaigns={cardData}
      textAutoHide={true}
      enableStars={true}
      enableSpotlight={true}
      enableBorderGlow={true}
      spotlightRadius={300}
      particleCount={12}
      enableTilt={true}
      glowColor="132, 0, 255"
      clickEffect={true}
      enableMagnetism={false}
    />
  );
};

export default MagicBentoWrapper;

