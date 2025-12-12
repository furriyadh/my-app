'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import GlowingBorderCard from '@/components/ui/glowingbordercard';
import { InteractiveInput } from '@/components/ui/interactive-input';
import { useTranslation } from '@/lib/hooks/useTranslation';

// Smart Notification Manager
const NotificationManager = dynamic(() => import('@/components/NotificationManager'), {
  ssr: false,
});

// Integration Card Component
interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'not-connected';
  onConnect: () => void;
  integrationId: string;
}

interface Integration {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'not-connected';
}

// Helper function to get integration colors (from/to)
const getIntegrationColors = (title: string): { from: string; to: string } => {
  switch (title) {
    case 'Google Ads integration':
      return { from: 'purple-600', to: 'purple-600' }; // Purple
    case 'Google Analytics integration':
      return { from: 'purple-600', to: 'purple-600' }; // Purple
    case 'Google Tag Manager integration':
      return { from: 'purple-600', to: 'purple-600' }; // Purple
    default:
      return { from: 'purple-600', to: 'purple-600' }; // Purple default
  }
};

const IntegrationCard: React.FC<IntegrationCardProps & { onRefresh?: () => void; isRefreshing?: boolean }> = ({
  title,
  description,
  icon,
  status,
  onConnect,
  onRefresh,
  isRefreshing,
  integrationId
}) => {
  const colors = getIntegrationColors(title);
  const { language, isRTL } = useTranslation();

  return (
    <GlowingBorderCard
      className="w-80 h-80"
      fromColor={colors.from}
      toColor={colors.to}
    >
      <div className="w-full h-full flex flex-col relative overflow-hidden">
        {/* Header Section */}
        <div className="flex justify-between items-start w-full mb-2 px-1">
          {/* Status Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status === 'connected'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
            {status === 'connected' ? (language === 'ar' ? 'متصل' : 'CONNECTED') : (language === 'ar' ? 'مميز' : 'FEATURED')}
          </div>

          {/* Icon */}
          <div className="text-white opacity-90 transform hover:scale-110 transition-transform flex items-center justify-center">
            {icon}
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-2 py-1">
          {/* Title */}
          <h3 className="text-lg font-semibold mb-1 text-white leading-tight text-center">
            {title.includes('Tag Manager')
              ? 'Tag Manager'
              : title.replace(' integration', '')
            }
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            {title.includes('Tag Manager')
              ? 'Manage website tracking and analytics tags'
              : description.replace('this project to your ', 'your ')
            }
          </p>
        </div>

        {/* Footer Section */}
        <div className="w-full px-1 pb-1">
          {status === 'connected' ? (
            // Connected state - زر إدارة + زر ربط حساب جديد
            <div className="flex gap-2">
              <InteractiveInput
                className="bg-green-500 text-white flex-1"
                variant="default"
                inputSize="small"
                glow={true}
                rounded="custom"
                hideAnimations={false}
                uppercase={true}
                textEffect="normal"
                shimmerColor="#39FF14"
                shimmerSize="0.1em"
                shimmerDuration="3s"
                borderRadius="100px"
                background="rgba(0, 0, 0, 1)"
                onClick={() => window.location.href = `/integrations/${integrationId}`}
              >
                {language === 'ar' ? 'إدارة' : 'Manage'}
              </InteractiveInput>
              <InteractiveInput
                className="text-white flex-1"
                variant="default"
                inputSize="small"
                glow={true}
                rounded="custom"
                hideAnimations={false}
                uppercase={true}
                textEffect="normal"
                shimmerColor="#3B82F6"
                shimmerSize="0.1em"
                shimmerDuration="3s"
                borderRadius="100px"
                background="rgba(0, 0, 0, 1)"
                onClick={onConnect}
              >
                {language === 'ar' ? 'ربط حساب' : 'Add New'}
              </InteractiveInput>
            </div>
          ) : (
            // Not connected state - single button
            <InteractiveInput
              className="bg-green-500 text-white w-full"
              variant="default"
              inputSize="small"
              glow={true}
              rounded="custom"
              hideAnimations={false}
              uppercase={true}
              textEffect="normal"
              shimmerColor="#39FF14"
              shimmerSize="0.1em"
              shimmerDuration="3s"
              borderRadius="100px"
              background="rgba(0, 0, 0, 1)"
              onClick={onConnect}
            >
              {language === 'ar' ? 'ابدأ' : 'Get Started'}
            </InteractiveInput>
          )}
        </div>
      </div>
    </GlowingBorderCard>
  );
};

// Main Integrations Page Component
const IntegrationsPage: React.FC = () => {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Integration categories for organized display
  interface IntegrationCategory {
    id: string;
    title: string;
    titleAr: string;
    integrations: Integration[];
  }

  const [integrationCategories, setIntegrationCategories] = useState<IntegrationCategory[]>([
    {
      id: 'advertising',
      title: 'Advertising Platforms',
      titleAr: 'منصات الإعلانات',
      integrations: [
        {
          id: 'google-ads',
          title: 'Google Ads',
          description: 'Connect your Google Ads account.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/images/integrations/google-ads-logo.svg" alt="Google Ads" className="w-10 h-10 object-contain" />
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'microsoft-ads',
          title: 'Microsoft Ads',
          description: 'Connect your Microsoft Advertising account.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
                <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'meta-ads',
          title: 'Meta Ads',
          description: 'Connect Facebook & Instagram Ads.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'tiktok-ads',
          title: 'TikTok Ads',
          description: 'Connect your TikTok Ads account.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="white">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'linkedin-ads',
          title: 'LinkedIn Ads',
          description: 'Connect your LinkedIn Ads account.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'twitter-ads',
          title: 'X (Twitter) Ads',
          description: 'Connect your X Ads account.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'snapchat-ads',
          title: 'Snapchat Ads',
          description: 'Connect your Snapchat Ads account.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#FFFC00">
                <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Tracking',
      titleAr: 'التحليلات والتتبع',
      integrations: [
        {
          id: 'google-analytics',
          title: 'Google Analytics',
          description: 'Track website visitors and behavior.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-10 h-10">
                <g transform="matrix(.363638 0 0 .363636 -3.272763 -2.909091)">
                  <path d="M130 29v132c0 14.77 10.2 23 21 23 10 0 21-7 21-23V30c0-13.54-10-22-21-22s-21 9.33-21 21z" fill="#f9ab00" />
                  <g fill="#e37400">
                    <path d="M75 96v65c0 14.77 10.2 23 21 23 10 0 21-7 21-23V97c0-13.54-10-22-21-22s-21 9.33-21 21z" />
                    <circle cx="41" cy="163" r="21" />
                  </g>
                </g>
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'google-tag-manager',
          title: 'Tag Manager',
          description: 'Manage website tracking tags.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-10 h-10">
                <path fill="#4fc3f7" d="M44.945,21.453L26.547,3.055c-1.404-1.404-3.689-1.404-5.094,0L3.055,21.453c-1.404,1.404-1.404,3.689,0,5.094l18.398,18.398c0.702,0.702,1.625,1.053,2.547,1.053s1.845-0.351,2.547-1.053l18.398-18.398C46.349,25.143,46.349,22.857,44.945,21.453z M24,29l-5-5l5-5l5,5L24,29z" />
                <path fill="#2979ff" d="M33.246,9.754L24,19l5,5l-5,5l9.246,9.246l11.699-11.699c1.404-1.404,1.404-3.689,0-5.094L33.246,9.754z" />
                <path fill="#2962ff" d="M14.754,38.246l6.699,6.699c0.702,0.702,1.625,1.053,2.547,1.053s1.845-0.351,2.547-1.053l6.699-6.699L24,29L14.754,38.246z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        }
      ]
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce Platforms',
      titleAr: 'منصات التجارة الإلكترونية',
      integrations: [
        {
          id: 'shopify',
          title: 'Shopify',
          description: 'Connect your Shopify store.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 256 292" className="w-10 h-10">
                <path fill="#95BF47" d="M223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.1c-1.703-1.703-5.029-1.186-6.32-.805-.19.056-3.388 1.043-8.678 2.68-5.18-14.906-14.322-28.604-30.405-28.604-.444 0-.901.018-1.358.044C129.31 3.407 123.644.779 118.75.779c-37.465 0-55.364 46.835-60.976 70.635-14.558 4.511-24.9 7.718-26.221 8.133-8.126 2.549-8.383 2.805-9.45 10.462C21.3 97.806.026 260.235.026 260.235l177.874 33.45 96.1-20.81s-49.982-214.216-50.226-215.535z" />
                <path fill="#5E8E3E" d="M182.168 52.097s-8.812 2.683-23.378 7.126c-4.63-14.25-12.763-27.363-27.092-27.363-.396 0-.798.012-1.204.034-4.086-5.415-9.145-7.794-13.527-7.794-33.314 0-49.292 41.676-54.288 62.865l-19.347 5.993c-5.94 1.862-6.133 2.048-6.912 7.67-.612 4.28-16.12 124.354-16.12 124.354L177.87 258.28l4.298-206.183z" />
                <path fill="#FFF" d="M128.965 94.94l-11.075 32.88s-9.715-5.176-21.56-5.176c-17.428 0-18.304 10.932-18.304 13.693 0 15.038 39.2 20.8 39.2 56.024 0 27.713-17.577 45.558-41.277 45.558-28.44 0-42.984-17.7-42.984-17.7l7.615-25.16s14.95 12.835 27.565 12.835c8.243 0 11.596-6.49 11.596-11.232 0-19.616-32.16-20.492-32.16-52.724 0-27.129 19.472-53.382 58.778-53.382 15.145 0 22.606 4.384 22.606 4.384z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'woocommerce',
          title: 'WooCommerce',
          description: 'Connect your WooCommerce store.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#96588A">
                <path d="M2.227 4.857A2.228 2.228 0 000 7.094v7.457c0 1.236 1.001 2.237 2.237 2.237h9.253l4.229 2.355-.962-2.355h7.006c1.236 0 2.237-1 2.237-2.237V7.094c0-1.236-1.001-2.237-2.237-2.237H2.227zm1.627 1.973c.139-.016.272.009.398.076.126.066.23.166.312.298.082.131.127.282.135.452v.025c.072.897.188 1.951.35 3.162.16 1.211.296 2.108.407 2.69l1.854-3.54c.17-.327.381-.495.63-.506.25-.01.454.142.613.458.145.287.333.77.563 1.449.23.68.418 1.27.562 1.769.178-.822.392-1.72.642-2.693.25-.974.47-1.75.66-2.33a.706.706 0 01.282-.363.753.753 0 01.43-.133c.2.015.367.101.5.259a.766.766 0 01.186.531 1.9 1.9 0 01-.047.334c-.202.837-.443 1.747-.722 2.73-.28.984-.524 1.797-.734 2.44-.21.643-.39 1.092-.54 1.347-.148.255-.348.389-.598.4-.25.012-.475-.12-.675-.396-.2-.275-.475-.794-.825-1.557-.232-.505-.443-.993-.633-1.463l-1.571 3.05c-.185.368-.4.553-.647.555-.247.002-.454-.158-.623-.48a37.152 37.152 0 01-.744-1.617c-.264-.604-.537-1.332-.819-2.183a21.466 21.466 0 01-.492-1.627l-.39-1.464c-.038-.14-.056-.263-.056-.37-.001-.205.078-.387.238-.546a.832.832 0 01.506-.248h.018zm10.939 1.36c-.34.003-.672.04-1.002.109a3.233 3.233 0 00-.894.324c-.281.15-.52.33-.718.542a2.35 2.35 0 00-.46.717 2.233 2.233 0 00-.162.843c0 .364.084.692.253.985.168.293.398.527.69.701.29.175.614.262.971.26.316-.001.61-.052.883-.154.273-.101.51-.243.713-.426.203-.182.362-.392.478-.628s.175-.484.175-.743a1.632 1.632 0 00-.35-1.03c-.236-.292-.593-.427-1.07-.405a1.9 1.9 0 00-.52.087c.158-.162.355-.298.59-.408a2.045 2.045 0 01.84-.178c.28-.007.542.05.785.17.243.121.437.302.582.543.146.241.219.524.219.848 0 .486-.121.93-.364 1.334a2.653 2.653 0 01-.995.97 2.828 2.828 0 01-1.42.365c-.431 0-.826-.085-1.183-.255a2.133 2.133 0 01-.853-.708 1.783 1.783 0 01-.32-1.044c0-.31.06-.606.178-.889.117-.283.281-.542.491-.778.21-.235.455-.44.735-.614a4.02 4.02 0 01.888-.418 4.604 4.604 0 011.015-.202l.1-.003a3.55 3.55 0 011.577.313c.455.203.809.494 1.06.872.252.378.378.82.378 1.325 0 .59-.142 1.116-.426 1.58a3.01 3.01 0 01-1.153 1.084 3.346 3.346 0 01-1.64.403 3.28 3.28 0 01-1.368-.287 2.47 2.47 0 01-.995-.815 2.064 2.064 0 01-.376-1.22c0-.36.072-.697.216-1.012.144-.315.343-.599.597-.852a3.54 3.54 0 01.884-.648 5.323 5.323 0 011.055-.42c.365-.1.728-.165 1.091-.196l.104-.004zm5.247 0c-.34.003-.672.04-1.002.109a3.233 3.233 0 00-.894.324c-.281.15-.52.33-.718.542a2.35 2.35 0 00-.46.717 2.233 2.233 0 00-.162.843c0 .364.084.692.253.985.168.293.398.527.69.701.29.175.614.262.971.26.316-.001.61-.052.883-.154.273-.101.51-.243.713-.426.203-.182.362-.392.478-.628s.175-.484.175-.743a1.632 1.632 0 00-.35-1.03c-.236-.292-.593-.427-1.07-.405a1.9 1.9 0 00-.52.087c.158-.162.355-.298.59-.408a2.045 2.045 0 01.84-.178c.28-.007.542.05.785.17.243.121.437.302.582.543.146.241.219.524.219.848 0 .486-.121.93-.364 1.334a2.653 2.653 0 01-.995.97 2.828 2.828 0 01-1.42.365c-.431 0-.826-.085-1.183-.255a2.133 2.133 0 01-.853-.708 1.783 1.783 0 01-.32-1.044c0-.31.06-.606.178-.889.117-.283.281-.542.491-.778.21-.235.455-.44.735-.614a4.02 4.02 0 01.888-.418 4.604 4.604 0 011.015-.202l.1-.003a3.55 3.55 0 011.577.313c.455.203.809.494 1.06.872.252.378.378.82.378 1.325 0 .59-.142 1.116-.426 1.58a3.01 3.01 0 01-1.153 1.084 3.346 3.346 0 01-1.64.403 3.28 3.28 0 01-1.368-.287 2.47 2.47 0 01-.995-.815 2.064 2.064 0 01-.376-1.22c0-.36.072-.697.216-1.012.144-.315.343-.599.597-.852a3.54 3.54 0 01.884-.648 5.323 5.323 0 011.055-.42c.365-.1.728-.165 1.091-.196l.104-.004z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'wordpress',
          title: 'WordPress',
          description: 'Connect your WordPress site.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#21759B">
                <path d="M12.158 12.786l-2.698 7.84c.806.236 1.657.365 2.54.365 1.047 0 2.051-.18 2.986-.51-.024-.038-.046-.078-.065-.12l-2.762-7.575zM3.008 12c0 3.56 2.07 6.634 5.068 8.092L3.788 8.342A8.947 8.947 0 003.008 12zm15.06-.454c0-1.11-.398-1.879-.74-2.477-.455-.74-.882-1.366-.882-2.106 0-.826.627-1.594 1.51-1.594.04 0 .078.005.116.007A8.963 8.963 0 0012 3.008a8.973 8.973 0 00-7.459 3.976c.21.006.407.01.573.01.932 0 2.376-.113 2.376-.113.48-.028.537.677.057.733 0 0-.483.057-1.02.085l3.246 9.653 1.95-5.847-1.388-3.806c-.48-.028-.935-.085-.935-.085-.48-.028-.424-.76.057-.733 0 0 1.472.113 2.348.113.932 0 2.376-.113 2.376-.113.48-.028.538.677.057.733 0 0-.483.057-1.021.085l3.22 9.577.89-2.974c.384-1.233.678-2.116.678-2.88zm1.907-3.808A9.004 9.004 0 0120.992 12c0 3.26-1.746 6.11-4.354 7.668l2.673-7.729c.5-1.248.666-2.245.666-3.133 0-.322-.021-.62-.062-.888zM12 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm0-19.5C6.762 2.5 2.5 6.762 2.5 12S6.762 21.5 12 21.5 21.5 17.238 21.5 12 17.238 2.5 12 2.5z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'wix',
          title: 'Wix',
          description: 'Connect your Wix website.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">wix</span>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'squarespace',
          title: 'Squarespace',
          description: 'Connect your Squarespace website.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xl font-bold text-white">S</span>
              </div>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'google-merchant',
          title: 'Google Merchant',
          description: 'Connect your Google Merchant Center.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-blue-500 rounded transform rotate-45"></div>
                <div className="absolute inset-1 bg-green-400 rounded transform rotate-45"></div>
                <div className="absolute inset-2 bg-yellow-400 rounded transform rotate-45"></div>
                <div className="absolute inset-3 bg-red-400 rounded transform rotate-45"></div>
              </div>
            </div>
          ),
          status: 'not-connected'
        }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing & CRM',
      titleAr: 'التسويق وإدارة العملاء',
      integrations: [
        {
          id: 'mailchimp',
          title: 'Mailchimp',
          description: 'Connect your Mailchimp account.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 52 52" className="w-10 h-10">
                <path fill="#FFE01B" d="M26 52c14.36 0 26-11.64 26-26S40.36 0 26 0 0 11.64 0 26s11.64 26 26 26z" />
                <path fill="#241c15" d="M42.6 24.1c-.4-.2-.8-.3-1.3-.3-.3 0-.5 0-.8.1.1-.3.1-.6.1-.9 0-1.1-.4-2-1.1-2.7-.7-.7-1.7-1.1-2.8-1.1-.7 0-1.4.2-1.9.5-.4-.7-.8-1.3-1.2-1.8-1.5-1.8-3.2-2.7-5.3-2.7-1.5 0-2.7.4-3.8 1.2-.4.3-.7.6-1 .9-.3-.1-.6-.2-.8-.3-.7-.2-1.5-.4-2.2-.4-1.4 0-2.6.4-3.8 1.1-1.2.7-2.1 1.8-2.7 3.1-.6 1.3-.8 2.7-.8 4.2 0 1.4.1 2.6.4 3.7.3 1.2.8 2.4 1.6 3.4.7 1 1.4 1.8 2.3 2.5.4.3.8.6 1.2.8-.2.4-.4.8-.4 1.2 0 .7.3 1.4.9 1.8.6.4 1.3.7 2.1.7.4 0 .7 0 1.1-.2.3-.1.7-.3 1.1-.6.4-.3 1-.8 1.7-1.4.2-.1.4-.3.7-.6 1.2.7 2.6 1.1 4.2 1.1 1.5 0 2.8-.3 4-1 1.2-.6 2.2-1.5 2.9-2.5.8-1 1.3-2.2 1.6-3.4.1-.5.2-1 .3-1.5.8-.2 1.5-.5 2.2-.8.1 0 .3-.1.4-.2.4-.2.9-.5 1.4-.8.7-.4 1.2-.8 1.5-1.3.4-.5.5-1 .5-1.5 0-.3-.1-.7-.3-.9-.1-.5-.4-.7-.8-.9z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'hubspot',
          title: 'HubSpot',
          description: 'Connect your HubSpot CRM.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#FF7A59">
                <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.984v-.066A2.2 2.2 0 0017.23.836h-.065a2.2 2.2 0 00-2.199 2.198v.066c0 .907.554 1.684 1.34 2.017v2.79a5.856 5.856 0 00-2.832 1.503l-7.473-5.821a2.56 2.56 0 00.093-.675 2.583 2.583 0 00-2.583-2.583A2.583 2.583 0 00.928 2.914 2.583 2.583 0 003.51 5.497c.486 0 .94-.137 1.326-.373l7.36 5.733a5.895 5.895 0 00-.867 3.066c0 1.122.313 2.17.857 3.064l-2.612 2.612a1.907 1.907 0 00-.604-.104 1.93 1.93 0 00-1.93 1.93 1.93 1.93 0 001.93 1.93 1.93 1.93 0 001.93-1.93c0-.22-.04-.43-.104-.628l2.575-2.575a5.903 5.903 0 003.49 1.14 5.917 5.917 0 005.917-5.917 5.86 5.86 0 00-4.614-5.515zm-1.253 8.33a2.813 2.813 0 110-5.626 2.813 2.813 0 010 5.626z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        },
        {
          id: 'klaviyo',
          title: 'Klaviyo',
          description: 'Connect your Klaviyo account.',
          icon: (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#0A8E8E">
                <path d="M12 0L0 12l12 12 12-12L12 0zm0 3.515L20.485 12 12 20.485 3.515 12 12 3.515z" />
              </svg>
            </div>
          ),
          status: 'not-connected'
        }
      ]
    }
  ]);

  // Flatten integrations for counting and connection checks
  const allIntegrations = integrationCategories.flatMap(cat => cat.integrations);
  const [integrations, setIntegrations] = useState<Integration[]>(allIntegrations);

  // Function to refresh permissions and fetch accounts
  const handleRefreshPermissions = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Refreshing Google Ads permissions and accounts...');

      // 1. مسح الحسابات القديمة من قاعدة البيانات للمستخدم الحالي
      try {
        console.log('🗑️ Deleting old accounts from database...');
        const deleteResponse = await fetch('/api/client-requests', {
          method: 'DELETE',
          credentials: 'include'
        });
        if (deleteResponse.ok) {
          console.log('✅ Old accounts deleted from database');
        } else {
          console.warn('⚠️ Could not delete old accounts:', await deleteResponse.text());
        }
      } catch (e) {
        console.warn('⚠️ Could not delete old accounts:', e);
      }

      // 2. مسح الكاش
      try {
        await fetch('/api/user/accounts?clearCache=true', {
          method: 'GET',
          credentials: 'include'
        });
        console.log('✅ Cache cleared');
      } catch (e) {
        console.warn('⚠️ Could not clear cache:', e);
      }

      // 3. إعادة توجيه المستخدم لعملية OAuth لتحديث الأذونات وجلب الحسابات
      window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/integrations/google-ads') + '&refresh=true';

    } catch (error) {
      console.error('❌ Error refreshing permissions:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء تحديث الأذونات' : 'Error refreshing permissions');
      setIsRefreshing(false);
    }
  };

  const handleConnect = async (integrationId: string) => {
    console.log(`Connecting to ${integrationId}`);

    if (integrationId === 'google-ads') {
      // Check if already connected
      const googleAdsIntegration = integrations.find(int => int.id === 'google-ads');
      if (googleAdsIntegration?.status === 'connected') {
        // If connected, ask to disconnect
        if (confirm('Are you sure you want to disconnect Google Ads? This will revoke all permissions.')) {
          try {
            console.log('🔌 Disconnecting Google Ads...');

            // Clear HttpOnly cookies through API call
            await fetch('/api/oauth/logout', {
              method: 'POST',
              credentials: 'include'
            });

            // Clear non-HttpOnly cookies
            document.cookie = 'google_ads_connected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            // Clear localStorage (for UI state only)
            localStorage.removeItem('hasSeenServiceModal');
            localStorage.removeItem('selectedGoogleAdsAccount');

            // Revoke Google permissions
            try {
              await fetch('https://oauth2.googleapis.com/revoke', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  token: '' // HttpOnly cookies not accessible via JavaScript
                })
              });
            } catch (revokeError) {
              console.log('⚠️ Could not revoke token from Google');
            }

            // Update UI
            setIntegrations(prev =>
              prev.map(integration =>
                integration.id === 'google-ads'
                  ? { ...integration, status: 'not-connected' }
                  : integration
              )
            );

            console.log('✅ Google Ads disconnected successfully');
            alert('Google Ads disconnected successfully. You can reconnect anytime.');

          } catch (error) {
            console.error('❌ Error disconnecting Google Ads:', error);
            alert('Error disconnecting Google Ads. Please try again.');
          }
        }
      } else {
        // If not connected, start OAuth flow
        window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/integrations/google-ads');
      }
    } else if (integrationId === 'google-analytics') {
      // Google Analytics OAuth - uses same OAuth flow but redirects to analytics setup
      console.log('🔗 Starting Google Analytics OAuth...');
      window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/integrations/google-analytics') + '&scope=analytics';
    } else if (integrationId === 'google-tag-manager') {
      // Google Tag Manager - comes with Analytics
      console.log('🔗 Starting Google Tag Manager OAuth...');
      window.location.href = '/api/oauth/google?redirect_after=' + encodeURIComponent('/integrations/google-tag-manager');
    } else {
      // For other integrations, show coming soon message
      alert('This integration will be available soon!');
    }
  };


  // Optimized connection check - reduced API calls
  useEffect(() => {
    const checkGoogleAdsConnection = async () => {
      try {
        // فحص الاتصال لكل عميل بناءً على البيانات المخزنة في Supabase (client_requests)
        const response = await fetch('/api/client-requests', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn('⚠️ فشل في فحص حالة Google Ads من /api/client-requests:', response.status, response.statusText);
          return;
        }

        const result = await response.json();
        const requests = Array.isArray(result.data) ? result.data : [];
        const hasGoogleAdsConnection = requests.length > 0;

        setIntegrations(prev =>
          prev.map(integration =>
            integration.id === 'google-ads'
              ? { ...integration, status: hasGoogleAdsConnection ? 'connected' : 'not-connected' }
              : integration
          )
        );
      } catch (error) {
        console.warn('⚠️ خطأ في فحص حالة Google Ads:', error);
      }
    };

    const checkGoogleAnalyticsConnection = async () => {
      try {
        const response = await fetch('/api/analytics/connected', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn('⚠️ فشل في فحص حالة Google Analytics:', response.status);
          return;
        }

        const result = await response.json();
        const hasAnalyticsConnection = result.success && result.properties && result.properties.length > 0;

        setIntegrations(prev =>
          prev.map(integration =>
            integration.id === 'google-analytics'
              ? { ...integration, status: hasAnalyticsConnection ? 'connected' : 'not-connected' }
              : integration
          )
        );

        // Update categories too
        setIntegrationCategories(prev =>
          prev.map(category => ({
            ...category,
            integrations: category.integrations.map(integration =>
              integration.id === 'google-analytics'
                ? { ...integration, status: hasAnalyticsConnection ? 'connected' : 'not-connected' }
                : integration
            )
          }))
        );
      } catch (error) {
        console.warn('⚠️ خطأ في فحص حالة Google Analytics:', error);
      }
    };

    const checkGTMConnection = async () => {
      try {
        const response = await fetch('/api/gtm/connected', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn('⚠️ فشل في فحص حالة GTM:', response.status);
          return;
        }

        const result = await response.json();
        const hasGTMConnection = result.success && result.containers && result.containers.length > 0;

        setIntegrations(prev =>
          prev.map(integration =>
            integration.id === 'google-tag-manager'
              ? { ...integration, status: hasGTMConnection ? 'connected' : 'not-connected' }
              : integration
          )
        );

        // Update categories too
        setIntegrationCategories(prev =>
          prev.map(category => ({
            ...category,
            integrations: category.integrations.map(integration =>
              integration.id === 'google-tag-manager'
                ? { ...integration, status: hasGTMConnection ? 'connected' : 'not-connected' }
                : integration
            )
          }))
        );
      } catch (error) {
        console.warn('⚠️ خطأ في فحص حالة GTM:', error);
      }
    };

    checkGoogleAdsConnection();
    checkGoogleAnalyticsConnection();
    checkGTMConnection();
  }, []);

  const connectedCount = integrations.filter(int => int.status === 'connected').length;
  const totalCount = integrations.length;

  return (
    <div className="min-h-screen p-6" dir="ltr">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {t.integrations?.title || 'Integrations'}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            {t.integrations?.description || 'Connect your accounts and external services to enhance your advertising campaigns.'}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL ? `${connectedCount} من ${totalCount} متصل` : `${connectedCount} of ${totalCount} connected`}
            </span>
          </div>
        </div>

        {/* Integration Categories */}
        {integrationCategories.map((category) => (
          <div key={category.id} className="mb-12">
            {/* Category Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-green-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL ? category.titleAr : category.title}
              </h2>
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-400">
                {category.integrations.length}
              </span>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center"
            >
              {category.integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  title={integration.title}
                  description={integration.description}
                  icon={integration.icon}
                  status={integration.status}
                  onConnect={() => handleConnect(integration.id)}
                  onRefresh={integration.id === 'google-ads' ? handleRefreshPermissions : undefined}
                  isRefreshing={isRefreshing}
                  integrationId={integration.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Smart Notifications for Integrations Page */}
      <NotificationManager />
    </div>
  );
};

export default IntegrationsPage;