'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Edit2, Sparkles, X, Crown } from 'lucide-react';
import GlowButton from '@/components/ui/glow-button';
import { CardStack } from '@/components/ui/card-stack';
import Announcement from '@/components/seraui/Announcement';
import { Progress } from '@/components/ui/progress';
import { subscribeToClientRequests } from '@/lib/supabase';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { getApiUrl } from '@/lib/config';
import ModernLoader from '@/components/ui/modern-loader';
import ShoppingPreview from '@/components/GoogleAds/ShoppingPreview';
import AppPreview from '@/components/GoogleAds/AppPreview';
import { getCurrentPlanLimits, getVisibleAccounts } from '@/lib/services/PlanService';

interface AdVariation {
  headlines: string[];
  descriptions: string[];
}

// Function to format customer ID with dashes (e.g., 123-456-7890)
const formatCustomerId = (customerId: string): string => {
  const cleanId = customerId.replace(/[\s-]/g, '');

  if (cleanId.length === 10) {
    return `${cleanId.slice(0, 3)}-${cleanId.slice(3, 6)}-${cleanId.slice(6)}`;
  }

  return customerId;
};

export default function CampaignPreviewPage() {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();
  const [adVariations, setAdVariations] = useState<AdVariation[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [campaignType, setCampaignType] = useState<string>('SEARCH');
  const [videoSubType, setVideoSubType] = useState<string>('VIDEO_RESPONSIVE_AD');
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>('');
  const [youtubeVideoTitle, setYoutubeVideoTitle] = useState<string>('');
  const [youtubeVideoViews, setYoutubeVideoViews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const isPublishingRef = useRef(false); // ⚠️ Prevent double submission using ref
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [showPublishingModal, setShowPublishingModal] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // 🔄 Publish Mode: 'my_account' (user's accounts) or 'managed' (platform's verified accounts)
  const [publishMode, setPublishMode] = useState<'my_account' | 'managed'>('my_account');

  // Check if desktop on mount
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1280);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Announcement notifications state
  const [announcement, setAnnouncement] = useState<{
    show: boolean;
    variant: 'success' | 'error' | 'warning' | 'info' | 'account-disabled';
    message: string;
    href?: string;
  }>({
    show: false,
    variant: 'info',
    message: '',
  });

  // Dynamic modal colors based on campaign type
  const getModalColors = () => {
    switch (campaignType) {
      case 'SEARCH':
        return {
          primary: 'rgb(249, 115, 22)',
          secondary: 'rgb(234, 88, 12)',
          bgGradient: 'rgba(249, 115, 22, 0.15)',
          orb1: 'bg-orange-500/20',
          orb2: 'bg-yellow-500/20',
          icon: 'from-yellow-500 to-orange-600',
          iconShadow: 'shadow-orange-500/50',
          title: 'from-yellow-400 via-orange-400 to-orange-500',
          progress: 'from-yellow-500 via-orange-500 to-orange-600',
          progressGlow: 'from-orange-500/30 to-yellow-500/30',
          dots: ['bg-yellow-500', 'bg-orange-500', 'bg-orange-600']
        };
      case 'DISPLAY':
        return {
          primary: 'rgb(16, 185, 129)',
          secondary: 'rgb(5, 150, 105)',
          bgGradient: 'rgba(16, 185, 129, 0.15)',
          orb1: 'bg-emerald-500/20',
          orb2: 'bg-green-500/20',
          icon: 'from-green-500 to-emerald-600',
          iconShadow: 'shadow-emerald-500/50',
          title: 'from-green-400 via-emerald-400 to-emerald-500',
          progress: 'from-green-500 via-emerald-500 to-emerald-600',
          progressGlow: 'from-emerald-500/30 to-green-500/30',
          dots: ['bg-green-500', 'bg-emerald-500', 'bg-emerald-600']
        };
      case 'SHOPPING':
        return {
          primary: 'rgb(59, 130, 246)',
          secondary: 'rgb(6, 182, 212)',
          bgGradient: 'rgba(34, 211, 238, 0.15)',
          orb1: 'bg-cyan-500/20',
          orb2: 'bg-blue-500/20',
          icon: 'from-cyan-500 via-blue-500 to-blue-600',
          iconShadow: 'shadow-cyan-500/50',
          title: 'from-cyan-400 via-blue-400 to-blue-500',
          progress: 'from-cyan-500 via-blue-500 to-blue-600',
          progressGlow: 'from-cyan-500/30 via-blue-500/30 to-blue-600/30',
          dots: ['bg-cyan-500', 'bg-blue-500', 'bg-blue-600']
        };
      case 'VIDEO':
        return {
          primary: 'rgb(168, 85, 247)',
          secondary: 'rgb(236, 72, 153)',
          bgGradient: 'rgba(168, 85, 247, 0.15)',
          orb1: 'bg-purple-500/20',
          orb2: 'bg-pink-500/20',
          icon: 'from-purple-500 to-pink-600',
          iconShadow: 'shadow-purple-500/50',
          title: 'from-purple-400 via-pink-400 to-pink-500',
          progress: 'from-purple-500 via-pink-500 to-pink-600',
          progressGlow: 'from-purple-500/30 to-pink-500/30',
          dots: ['bg-purple-500', 'bg-pink-500', 'bg-pink-600']
        };
      case 'APP':
        return {
          primary: 'rgb(249, 115, 22)',
          secondary: 'rgb(239, 68, 68)',
          bgGradient: 'rgba(249, 115, 22, 0.15)',
          orb1: 'bg-orange-500/20',
          orb2: 'bg-red-500/20',
          icon: 'from-orange-500 to-red-600',
          iconShadow: 'shadow-orange-500/50',
          title: 'from-orange-400 via-red-400 to-red-500',
          progress: 'from-orange-500 via-red-500 to-red-600',
          progressGlow: 'from-orange-500/30 to-red-500/30',
          dots: ['bg-orange-500', 'bg-red-500', 'bg-red-600']
        };
      case 'PERFORMANCE_MAX':
        return {
          primary: 'rgb(236, 72, 153)',
          secondary: 'rgb(244, 63, 94)',
          bgGradient: 'rgba(236, 72, 153, 0.15)',
          orb1: 'bg-pink-500/20',
          orb2: 'bg-rose-500/20',
          icon: 'from-pink-500 to-rose-600',
          iconShadow: 'shadow-pink-500/50',
          title: 'from-pink-400 via-rose-400 to-rose-500',
          progress: 'from-pink-500 via-rose-500 to-rose-600',
          progressGlow: 'from-pink-500/30 to-rose-500/30',
          dots: ['bg-pink-500', 'bg-rose-500', 'bg-rose-600']
        };
      case 'DEMAND_GEN':
        return {
          primary: 'rgb(239, 68, 68)',
          secondary: 'rgb(236, 72, 153)',
          bgGradient: 'rgba(239, 68, 68, 0.15)',
          orb1: 'bg-red-500/20',
          orb2: 'bg-pink-500/20',
          icon: 'from-red-500 to-pink-600',
          iconShadow: 'shadow-red-500/50',
          title: 'from-red-400 via-pink-400 to-pink-500',
          progress: 'from-red-500 via-pink-500 to-pink-600',
          progressGlow: 'from-red-500/30 to-pink-500/30',
          dots: ['bg-red-500', 'bg-pink-500', 'bg-pink-600']
        };
      default:
        return {
          primary: 'rgb(99, 102, 241)',
          secondary: 'rgb(147, 51, 234)',
          bgGradient: 'rgba(99, 102, 241, 0.15)',
          orb1: 'bg-blue-500/20',
          orb2: 'bg-purple-500/20',
          icon: 'from-blue-500 to-purple-600',
          iconShadow: 'shadow-blue-500/50',
          title: 'from-blue-400 via-purple-400 to-pink-400',
          progress: 'from-blue-500 via-purple-500 to-pink-500',
          progressGlow: 'from-blue-500/30 to-purple-500/30',
          dots: ['bg-blue-500', 'bg-purple-500', 'bg-pink-500']
        };
    }
  };

  const modalColors = getModalColors();

  useEffect(() => {
    // Get generated content from localStorage
    const campaignDataStr = localStorage.getItem('campaignData') || '{}';
    const campaignData = JSON.parse(campaignDataStr);

    const generatedContentStr = localStorage.getItem('generatedContent') || '{}';
    const generatedContent = JSON.parse(generatedContentStr);

    console.log('🌐 Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server');
    console.log('📦 Campaign Data:', campaignData);
    console.log('📦 Generated Content:', generatedContent);
    console.log('📦 Headlines count:', generatedContent.headlines?.length || 0);
    console.log('📦 Descriptions count:', generatedContent.descriptions?.length || 0);

    // Load saved billing mode
    const savedBillingMode = localStorage.getItem('billing_mode');
    if (savedBillingMode === 'furriyadh_managed') {
      setPublishMode('managed');
    } else {
      setPublishMode('my_account');
    }

    const url = campaignData.websiteUrl || '';
    setWebsiteUrl(url);

    // Set campaign type and video sub-type
    setCampaignType(campaignData.campaignType || 'SEARCH');
    setVideoSubType(campaignData.videoSubType || 'VIDEO_RESPONSIVE_AD');

    // Set YouTube video data for VIDEO campaigns
    if (campaignData.campaignType === 'VIDEO') {
      // Try to get video ID from various sources
      let videoId = campaignData.youtubeVideoId || campaignData.videoId || '';

      // Extract video ID from URL if not directly available
      if (!videoId && url) {
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
          /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
        ];
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) {
            videoId = match[1];
            break;
          }
        }
      }

      setYoutubeVideoId(videoId);
      setYoutubeVideoTitle(campaignData.youtubeVideoTitle || generatedContent.headlines?.[0] || '');
      setYoutubeVideoViews(campaignData.youtubeVideoViews || 0);

      console.log('📹 YouTube Video ID:', videoId);
      console.log('📹 YouTube Video Title:', campaignData.youtubeVideoTitle);
    }

    // Extract domain from URL
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      setWebsiteDomain(domain);
    } catch {
      setWebsiteDomain(url);
    }

    // Create multiple variations from the generated content
    if (generatedContent.headlines && generatedContent.headlines.length > 0 &&
      generatedContent.descriptions && generatedContent.descriptions.length > 0) {
      const variations: AdVariation[] = [];
      const totalHeadlines = generatedContent.headlines.length;
      const totalDescriptions = generatedContent.descriptions.length;

      console.log('✅ Creating variations:', totalHeadlines, 'headlines,', totalDescriptions, 'descriptions');

      // Create only 3 variations
      for (let i = 0; i < Math.min(3, totalHeadlines); i++) {
        const headlineStart = i % totalHeadlines;
        const descStart = i % totalDescriptions;

        variations.push({
          headlines: [
            generatedContent.headlines[headlineStart],
            generatedContent.headlines[(headlineStart + 1) % totalHeadlines],
            generatedContent.headlines[(headlineStart + 2) % totalHeadlines]
          ],
          descriptions: [
            generatedContent.descriptions[descStart],
            generatedContent.descriptions[(descStart + 1) % totalDescriptions]
          ]
        });
      }

      console.log('✅ Created', variations.length, 'variations');
      setAdVariations(variations);
    } else {
      console.warn('⚠️ No headlines or descriptions found - generating content...');

      // Fallback: Generate content if missing
      const generateMissingContent = async () => {
        try {
          // For VIDEO campaigns, use the detected language from the video itself
          // This ensures ads are generated in the same language as the video
          let targetLanguage = 'ar'; // Default

          if (campaignData.campaignType === 'VIDEO') {
            // Priority: 1) Video detected language, 2) Selected language, 3) Detected from URL, 4) Default
            targetLanguage = campaignData.videoDetectedLanguage ||
              campaignData.detectedLanguage ||
              campaignData.selectedLanguageCode ||
              campaignData.detectedLanguageCode || 'ar';
            console.log('🎬 VIDEO Campaign - Using video language:', targetLanguage);
          } else {
            // For other campaigns, use website/selected language
            targetLanguage = campaignData.selectedLanguageCode || campaignData.detectedLanguageCode || 'ar';
          }

          const keywords = generatedContent.keywords || [];

          const apiUrl = getApiUrl('/api/ai-campaign/generate-campaign-content');
          const currentVideoAdType = campaignData.videoSubType || campaignData.videoAdType || 'VIDEO_RESPONSIVE_AD';
          console.log('🔄 Generating missing ad content...');
          console.log('📡 API URL:', apiUrl);
          console.log('📦 Request data:', {
            website_url: url,
            campaign_type: campaignData.campaignType || 'SEARCH',
            video_ad_type: currentVideoAdType,
            keywords_count: keywords.length,
            target_language: targetLanguage
          });

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              website_url: url,
              campaign_type: campaignData.campaignType || 'SEARCH',
              video_ad_type: currentVideoAdType,
              keywords_list: keywords,
              target_language: targetLanguage
            })
          });

          console.log('📡 Response status:', response.status, response.statusText);

          if (response.ok) {
            const result = await response.json();
            console.log('📦 API Response:', result);

            if (result.success && result.content) {
              const newContent = {
                ...generatedContent,
                headlines: result.content.headlines || [],
                descriptions: result.content.descriptions || [],
                keywords: keywords.length > 0 ? keywords : (result.content.keywords || [])
              };

              localStorage.setItem('generatedContent', JSON.stringify(newContent));
              console.log('✅ Generated and saved content:', newContent.headlines.length, 'headlines,', newContent.descriptions.length, 'descriptions');

              // Create variations from new content
              if (newContent.headlines.length > 0 && newContent.descriptions.length > 0) {
                const newVariations: AdVariation[] = [];
                for (let i = 0; i < Math.min(3, newContent.headlines.length); i++) {
                  const headlineStart = i % newContent.headlines.length;
                  const descStart = i % newContent.descriptions.length;

                  newVariations.push({
                    headlines: [
                      newContent.headlines[headlineStart],
                      newContent.headlines[(headlineStart + 1) % newContent.headlines.length],
                      newContent.headlines[(headlineStart + 2) % newContent.headlines.length]
                    ],
                    descriptions: [
                      newContent.descriptions[descStart],
                      newContent.descriptions[(descStart + 1) % newContent.descriptions.length]
                    ]
                  });
                }
                setAdVariations(newVariations);
                console.log('✅ Created', newVariations.length, 'ad variations');
              } else {
                console.error('❌ No headlines or descriptions in API response');
              }
            } else {
              console.error('❌ API response not successful:', result);
            }
          } else {
            const errorText = await response.text();
            console.error('❌ API request failed:', response.status, errorText);
          }
        } catch (error) {
          console.error('❌ Failed to generate content:', error);
        }
      };

      generateMissingContent();
    }
  }, []);

  // Fetch connected accounts - same method as integrations page (MUST BE BEFORE subscription!)
  const fetchConnectedAccounts = async () => {
    console.log('📥 جلب الحسابات المرتبطة من Supabase (نفس طريقة صفحة integrations)...');
    try {
      // جلب طلبات العميل المربوطة بالمستخدم الحالي فقط عبر API Next.js
      const response = await fetch('/api/client-requests', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('❌ فشل في جلب client_requests من /api/client-requests:', response.status, response.statusText);
        setConnectedAccounts([]);
        return;
      }

      const result = await response.json();
      const allClientRequests = Array.isArray(result.data) ? result.data : [];
      console.log('📋 إجمالي الطلبات (حسب المستخدم الحالي):', allClientRequests.length);
      console.log('📋 جميع الطلبات:', allClientRequests);

      if (allClientRequests.length === 0) {
        console.warn('⚠️ لا توجد أي طلبات في قاعدة البيانات!');
        setAnnouncement({
          show: true,
          variant: 'warning',
          message: '⚠️ لا توجد حسابات مرتبطة - اضغط هنا للذهاب لصفحة الربط',
          href: '/integrations/google-ads'
        });
        setConnectedAccounts([]);
        return;
      }

      // تجميع السجلات حسب customer_id واختيار أحدث سجل لكل حساب (نفس الطريقة في integrations)
      const clientRequestsMap = new Map();
      allClientRequests.forEach((req: any) => {
        const existing = clientRequestsMap.get(req.customer_id);
        if (!existing || new Date(req.updated_at) > new Date(existing.updated_at)) {
          clientRequestsMap.set(req.customer_id, req);
        }
      });

      const clientRequests = Array.from(clientRequestsMap.values());
      console.log('📋 أحدث طلبات العملاء (مجمعة):', clientRequests.length);
      console.log('📋 تفاصيل الطلبات:', clientRequests);

      // Get user email to filter accounts
      let userEmail = '';
      try {
        const storedUserInfo = localStorage.getItem('oauth_user_info');
        console.log('🔍 oauth_user_info:', storedUserInfo);
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          userEmail = userInfo.email || '';
        }
      } catch (e) {
        console.warn('⚠️ Failed to get user email from localStorage:', e);
      }

      if (!userEmail) {
        userEmail = localStorage.getItem('userEmail') || '';
        console.log('🔍 userEmail from localStorage:', userEmail);
      }

      console.log('📧 البريد الإلكتروني للمستخدم الحالي:', userEmail);

      // Debug: show all accounts with their status and user_email
      console.log('🔍 فحص جميع الحسابات:');
      clientRequests.forEach((req: any) => {
        console.log(`  - ${req.customer_id}: status=${req.status}, user_email=${req.user_email}`);
      });

      // ⚡ OPTIMIZATION: Filter out non-linked accounts BEFORE checking status (faster!)
      const userAccounts = clientRequests.filter((req: any) => {
        // فلترة الحسابات الخاصة بهذا المستخدم فقط (حسب البريد المخزن مع الطلب)
        const isUserAccount = userEmail ? req.user_email === userEmail : true;

        // 🚀 Pre-filter: Skip accounts that are clearly not linked in DB
        const dbStatus = req.status?.toUpperCase();
        const isLikelyLinked = !(
          dbStatus === 'NOT_LINKED' ||
          dbStatus === 'REJECTED' ||
          dbStatus === 'CANCELLED' ||
          dbStatus === 'REMOVED'
        );

        console.log(`  🔍 فحص ${req.customer_id}:`);
        console.log(`     - status: ${req.status}`);
        console.log(`     - user_email: ${req.user_email}`);
        console.log(`     - current user: ${userEmail}`);
        console.log(`     - isUserAccount: ${isUserAccount} (TEMP: showing all)`);
        console.log(`     - isLikelyLinked: ${isLikelyLinked} (pre-filter)`);

        return isUserAccount && isLikelyLinked;
      });

      console.log(`✅ وجدنا ${userAccounts.length} حساب محتمل الربط (بعد التصفية الأولية)`);

      if (userAccounts.length === 0) {
        console.warn('⚠️ لا توجد حسابات للمستخدم الحالي');
        if (!userEmail) {
          setAnnouncement({
            show: true,
            variant: 'warning',
            message: '⚠️ لم يتم العثور على بريد المستخدم - اضغط هنا لتسجيل الدخول',
            href: '/integrations/google-ads'
          });
        } else {
          setAnnouncement({
            show: true,
            variant: 'warning',
            message: `⚠️ لا توجد حسابات مرتبطة - اضغط هنا للذهاب لصفحة الربط`,
            href: '/integrations/google-ads'
          });
        }
        setConnectedAccounts([]);
        return;
      }

      // Transform to expected format
      let formattedAccounts = userAccounts.map((req: any) => ({
        customerId: req.customer_id,
        name: req.account_name || `Google Ads Account ${req.customer_id}`,
        status: req.status,
        linkStatus: req.status,
        currency: 'USD',
        userEmail: req.user_email,
        userName: req.user_name,
        userPicture: req.user_picture
      }));

      console.log('📊 الحسابات من قاعدة البيانات:', formattedAccounts);

      // ✅ استخدام البيانات من Supabase مباشرة (بدون استدعاء Google Ads API)
      // الحالة الفعلية تم تخزينها في Supabase من صفحة integrations/google-ads
      // للتحديث من Google Ads API، يجب الذهاب لصفحة integrations/google-ads والضغط على زر Refresh

      // تحويل الحالة من Supabase إلى الحالة المتوقعة
      formattedAccounts = formattedAccounts.map((account: any) => {
        const dbStatus = account.status?.toUpperCase() || 'UNKNOWN';
        let mappedStatus = 'ACTIVE';
        let linkStatus = 'ACTIVE';

        switch (dbStatus) {
          case 'ACTIVE':
            mappedStatus = 'ACTIVE';
            linkStatus = 'ACTIVE';
            break;
          case 'PENDING':
            mappedStatus = 'PENDING';
            linkStatus = 'PENDING';
            break;
          case 'NOT_LINKED':
          case 'REJECTED':
          case 'CANCELLED':
          case 'REMOVED':
            // هذه الحسابات تم تصفيتها سابقاً، لكن للتأكد
            mappedStatus = 'NOT_LINKED';
            linkStatus = dbStatus;
            break;
          default:
            mappedStatus = 'ACTIVE';
            linkStatus = 'ACTIVE';
        }

        console.log(`📋 ${account.customerId}: db_status=${dbStatus}, mapped_status=${mappedStatus}, link_status=${linkStatus}`);

        return {
          ...account,
          status: mappedStatus,
          linkStatus: linkStatus
        };
      });

      // تصفية الحسابات غير المرتبطة
      formattedAccounts = formattedAccounts.filter((acc: any) =>
        acc.linkStatus === 'ACTIVE' || acc.linkStatus === 'PENDING'
      );

      console.log(`✅ الحسابات المرتبطة: ${formattedAccounts.length} حساب`);

      // Check if no accounts after filtering
      if (formattedAccounts.length === 0) {
        console.warn('⚠️ لا توجد حسابات مرتبطة بالـ MCC');
        setAnnouncement({
          show: true,
          variant: 'warning',
          message: '⚠️ لا توجد حسابات مرتبطة بالحساب الإداري - اضغط هنا لربط حساب جديد',
          href: '/integrations/google-ads'
        });
        setConnectedAccounts([]);
        return;
      }

      // ✅ تطبيق حدود الخطة على الحسابات المعروضة
      const planLimits = getCurrentPlanLimits();
      const visibleAccounts = getVisibleAccounts(formattedAccounts);
      console.log(`📊 حدود الخطة: ${planLimits.maxAccounts === -1 ? 'غير محدود' : planLimits.maxAccounts} حساب (${planLimits.planName})`);
      console.log(`📊 الحسابات المعروضة: ${visibleAccounts.length} من ${formattedAccounts.length}`);

      setConnectedAccounts(visibleAccounts);
      console.log('✅ تم تحميل الحسابات بنجاح (من Supabase):', visibleAccounts);

    } catch (error) {
      console.error('❌ خطأ في جلب الحسابات:', error);
      setAnnouncement({
        show: true,
        variant: 'error',
        message: '❌ حدث خطأ في جلب الحسابات'
      });
      setConnectedAccounts([]);
    }
  };

  // 🔄 STABLE: Supabase Realtime Subscription (always active - modal open or closed!)
  useEffect(() => {
    console.log('📡 الاشتراك في التحديثات الفورية من Supabase (دائماً نشط)...');

    // Subscribe to real-time updates from Supabase (always active!)
    const subscription = subscribeToClientRequests((payload) => {
      console.log('🔄 تحديث فوري من Supabase:', payload);
      console.log('📊 نوع الحدث:', payload.eventType);
      console.log('📊 البيانات الجديدة:', payload.new);
      console.log('📊 البيانات القديمة:', payload.old);

      // Re-fetch data from DB when UPDATE or INSERT happens
      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        console.log('📥 تحديث البيانات بسبب تغيير في قاعدة البيانات (تلقائي)');
        console.log('⏰ الوقت:', new Date().toLocaleTimeString());

        // 🚀 INSTANT UPDATE: Update state directly from Supabase payload first!
        if (payload.new && payload.new.customer_id) {
          const updatedAccountFromDB = payload.new;
          const dbCustomerId = updatedAccountFromDB.customer_id;
          console.log('⚡ تحديث فوري للحساب:', dbCustomerId);
          console.log('📊 الحالة الجديدة:', updatedAccountFromDB.status);

          // Show visual indicator
          setIsRefreshingStatus(true);

          // Normalize customer_id (both with and without dashes)
          const normalizeId = (id: string) => id.replace(/-/g, '');
          const normalizedDbId = normalizeId(dbCustomerId);

          // Update connectedAccounts state immediately with new data from Supabase
          setConnectedAccounts(prev => {
            console.log('📋 الحسابات الحالية قبل التحديث:', prev.map(a => `${a.customerId}: ${a.status}`).join(', '));

            const updatedAccounts = prev.map(acc => {
              const normalizedAccId = normalizeId(acc.customerId);
              if (normalizedAccId === normalizedDbId) {
                console.log(`✅ تحديث فوري: ${acc.customerId} من ${acc.status} إلى ${updatedAccountFromDB.status}`);
                return {
                  ...acc,
                  status: updatedAccountFromDB.status,
                  linkStatus: updatedAccountFromDB.status
                };
              }
              return acc;
            });

            // If account doesn't exist, add it
            const accountExists = prev.some(acc => normalizeId(acc.customerId) === normalizedDbId);
            if (!accountExists && updatedAccountFromDB.status !== 'NOT_LINKED') {
              console.log(`➕ إضافة حساب جديد: ${dbCustomerId}`);
              updatedAccounts.push({
                customerId: dbCustomerId,
                name: updatedAccountFromDB.account_name || `Google Ads Account ${dbCustomerId}`,
                status: updatedAccountFromDB.status,
                linkStatus: updatedAccountFromDB.status,
                currency: 'USD',
                userEmail: updatedAccountFromDB.user_email,
                userName: updatedAccountFromDB.user_name,
                userPicture: updatedAccountFromDB.user_picture
              });
            }

            console.log('🔄 الحسابات المحدثة:', updatedAccounts.map(a => `${a.customerId}: ${a.status}`).join(', '));
            console.log('🎯 عدد الحسابات:', updatedAccounts.length);
            return updatedAccounts;
          });

          console.log('✅ تم تحديث الـ state فوراً! (بدون انتظار API calls)');
          console.log('🎨 يجب أن تتحدث الواجهة الآن تلقائياً!');

          // Hide visual indicator after a short delay
          setTimeout(() => {
            setIsRefreshingStatus(false);
          }, 1500);
        }

        // Then re-fetch all data in background (for completeness)
        setTimeout(() => {
          console.log('🔄 إعادة جلب جميع البيانات في الخلفية (للتحقق النهائي)...');
          fetchConnectedAccounts().then(() => {
            console.log('✅ تم إعادة التحقق من جميع البيانات من قاعدة البيانات');
          }).catch(error => {
            console.error('❌ خطأ في إعادة التحقق:', error);
          });
        }, 2000); // Wait 2 seconds before full re-fetch (give time for instant update to show)
      }
    });

    return () => {
      console.log('🔌 إلغاء الاشتراك في تحديثات Supabase');
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✨ Empty array = always active, even when modal is closed!

  const handleEditAds = () => {
    router.push('/dashboard/google-ads/campaigns/edit-ads');
  };

  // Close modal when Activate button is clicked
  const handleActivateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAccountModal(false);
  };

  // 🔄 Handle billing mode change and save to database
  const handleBillingModeChange = async (mode: 'my_account' | 'managed') => {
    setPublishMode(mode);

    // Map mode to database billing_mode
    const billingMode = mode === 'my_account' ? 'self_managed' : 'furriyadh_managed';

    // Get user info from multiple sources
    let userId = null;
    let userEmail = null;

    // Try localStorage 'user' key first
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        userId = userData?.id || userData?.user?.id;
        userEmail = userData?.email || userData?.user?.email;
      } catch (e) {
        console.warn('Failed to parse user data');
      }
    }

    // Fallback: Try Supabase auth token
    if (!userId) {
      const authTokenStr = localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').split('.')[0] + '-auth-token');
      if (authTokenStr) {
        try {
          const authToken = JSON.parse(authTokenStr);
          userId = authToken?.user?.id;
          userEmail = authToken?.user?.email;
        } catch (e) {
          console.warn('Failed to parse auth token');
        }
      }
    }

    // Fallback 2: Try any key containing user info
    if (!userId) {
      for (const key of Object.keys(localStorage)) {
        if (key.includes('auth') || key.includes('supabase')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data?.user?.id) {
              userId = data.user.id;
              userEmail = data.user.email;
              break;
            }
          } catch (e) {
            // Skip non-JSON values
          }
        }
      }
    }

    if (!userId) {
      console.warn('⚠️ No user ID found, skipping billing mode save');
      return;
    }

    try {
      const response = await fetch('/api/billing-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingMode })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Billing mode saved:', billingMode);
        // Store locally for quick access
        localStorage.setItem('billing_mode', billingMode);

        // If managed mode and account assigned, store it
        if (result.assignedAccount) {
          localStorage.setItem('managed_account', JSON.stringify(result.assignedAccount));
        }
      } else {
        console.error('❌ Failed to save billing mode:', result.error);
      }
    } catch (error) {
      console.error('❌ Error saving billing mode:', error);
    }
  };

  const handlePublishClick = async () => {
    console.log('🔵 تم الضغط على زر نشر الحملة');
    try {
      // Fetch connected accounts first
      console.log('🔵 جلب الحسابات المرتبطة...');
      await fetchConnectedAccounts();
      // Show account selection modal
      console.log('🔵 عرض نافذة اختيار الحساب...');
      setShowAccountModal(true);
    } catch (error) {
      console.error('❌ خطأ في handlePublishClick:', error);
      setAnnouncement({
        show: true,
        variant: 'error',
        message: 'حدث خطأ. يرجى المحاولة مرة أخرى.'
      });
    }
  };

  const handlePublish = async () => {
    // ⚠️ Prevent double submission using ref (more reliable than state)
    if (isPublishingRef.current) {
      console.log('⚠️ Already publishing, ignoring duplicate click');
      return;
    }

    // ⚠️ Also check isLoading state as additional protection
    if (isLoading) {
      console.log('⚠️ Already publishing (state check), ignoring duplicate click');
      return;
    }

    if (!selectedAccount) {
      setAnnouncement({
        show: true,
        variant: 'warning',
        message: 'الرجاء اختيار حساب إعلاني أولاً'
      });
      return;
    }

    // Check if selected account is enabled
    const selectedAccountData = connectedAccounts.find(acc => acc.customerId === selectedAccount);
    if (selectedAccountData?.status !== 'ACTIVE') {
      // Show beautiful red notification for disabled/suspended account
      setShowAccountModal(false); // Close the account selection modal
      const cleanCustomerId = selectedAccount.replace(/-/g, '');
      const formattedId = `${cleanCustomerId.slice(0, 3)}-${cleanCustomerId.slice(3, 6)}-${cleanCustomerId.slice(6)}`;
      setAnnouncement({
        show: true,
        variant: 'account-disabled',
        message: `⚠️ Account ${formattedId} is not enabled - Click here to activate in Google Ads`,
        href: `https://ads.google.com/aw/overview?__e=${cleanCustomerId}`
      });
      // Auto-hide after 5 seconds
      setTimeout(() => setAnnouncement(prev => ({ ...prev, show: false })), 10000);
      return;
    }

    console.log('🚀 Starting campaign publication...');
    isPublishingRef.current = true; // ✅ Set ref immediately to prevent double clicks
    setIsLoading(true);
    setShowAccountModal(false);
    setShowPublishingModal(true);
    setPublishProgress(0);

    // Simulate progress - now goes slower and stops at 80%
    let progressInterval: NodeJS.Timeout;
    const startProgressSimulation = () => {
      progressInterval = setInterval(() => {
        setPublishProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 5; // Slower progress (5% instead of 10%)
        });
      }, 500); // Slower interval (500ms instead of 300ms)
    };

    startProgressSimulation();

    try {
      // Get all required data from localStorage
      const campaignDataStr = localStorage.getItem('campaignData') || '{}';
      const selectedLocationsStr = localStorage.getItem('selectedLocations') || '[]';
      const generatedContentStr = localStorage.getItem('generatedContent') || '{}';
      const cpcDataStr = localStorage.getItem('cpcData') || '{}';

      const campaignData = JSON.parse(campaignDataStr);
      const selectedLocations = JSON.parse(selectedLocationsStr);
      const generatedContent = JSON.parse(generatedContentStr);
      const cpcData = JSON.parse(cpcDataStr);

      const selectedLanguage = campaignData.selectedLanguage || '1019';
      const selectedLanguageCode = campaignData.selectedLanguageCode || 'ar';

      // Get user info for billing mode
      let billingModeForPublish = 'self_managed';
      let userIdForPublish: string | null = null;
      try {
        billingModeForPublish = localStorage.getItem('billing_mode') || 'self_managed';

        // Method 1: Try 'user' key
        const userDataStr = localStorage.getItem('user');
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            userIdForPublish = userData?.id || userData?.user?.id || null;
            console.log('🔍 Found user from "user" key:', userIdForPublish);
          } catch { /* skip */ }
        }

        // Method 2: Try Supabase auth token keys
        if (!userIdForPublish) {
          const supabaseKeys = Object.keys(localStorage).filter(
            key => key.startsWith('sb-') && key.includes('auth-token')
          );
          console.log('🔍 Found Supabase auth keys:', supabaseKeys);

          for (const key of supabaseKeys) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              if (data?.user?.id) {
                userIdForPublish = data.user.id;
                console.log('✅ Found user_id from Supabase token:', userIdForPublish);
                break;
              }
            } catch { /* skip */ }
          }
        }

        // Method 3: Try any key containing 'auth' or 'supabase'
        if (!userIdForPublish) {
          for (const key of Object.keys(localStorage)) {
            if (key.includes('auth') || key.includes('supabase') || key.includes('session')) {
              try {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                if (data?.user?.id) {
                  userIdForPublish = data.user.id;
                  console.log('✅ Found user_id from key:', key, userIdForPublish);
                  break;
                }
              } catch { /* skip non-JSON */ }
            }
          }
        }

        // Final fallback warning
        if (!userIdForPublish) {
          // Method 4: Try to get from oauth_user_info (this contains the real Google ID)
          try {
            const oauthInfo = localStorage.getItem('oauth_user_info');
            if (oauthInfo) {
              const parsed = JSON.parse(oauthInfo);
              userIdForPublish = parsed?.id || parsed?.sub || null;
              if (userIdForPublish) {
                console.log('✅ Found user_id from oauth_user_info:', userIdForPublish);
              }
            }
          } catch { /* skip */ }
        }

        // Method 5: Try to parse cookies for oauth_user_info
        if (!userIdForPublish && typeof document !== 'undefined') {
          try {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
              const [name, value] = cookie.trim().split('=');
              if (name === 'oauth_user_info' && value) {
                const decoded = decodeURIComponent(value);
                const parsed = JSON.parse(decoded);
                userIdForPublish = parsed?.id || parsed?.sub || null;
                if (userIdForPublish) {
                  console.log('✅ Found user_id from cookie oauth_user_info:', userIdForPublish);
                  break;
                }
              }
            }
          } catch { /* skip */ }
        }

        if (!userIdForPublish) {
          console.warn('⚠️ Could not find user_id. Available localStorage keys:',
            Object.keys(localStorage).filter(k => k.includes('user') || k.includes('auth') || k.includes('oauth'))
          );
        }
      } catch (e) {
        console.warn('Could not get billing mode or user ID:', e);
      }

      console.log('💳 Billing Mode for publish:', billingModeForPublish);
      console.log('👤 User ID for publish:', userIdForPublish);

      // Prepare complete campaign data
      const completeCampaignData = {
        customer_id: selectedAccount,  // Selected Google Ads account
        campaign_name: `Campaign ${campaignData.campaignType || 'SEARCH'} - ${new Date().toLocaleDateString()}`,
        campaign_type: campaignData.campaignType || 'SEARCH',
        website_url: campaignData.websiteUrl || '',
        daily_budget: campaignData.dailyBudgetUSD || campaignData.dailyBudget || 15, // Always use USD value for Google Ads
        currency: campaignData.currency || 'USD',
        target_locations: selectedLocations.map((loc: any) => ({
          name: loc.name,
          formatted_address: loc.secondaryText || loc.name,
          place_id: loc.id,
          country_code: loc.countryCode,
          location_type: loc.locationType,
          coordinates: loc.coordinates,
          radius: loc.radius || 10
        })),
        target_languages: [selectedLanguageCode],
        phone_number: campaignData.phoneNumber || null,
        cpc_data: cpcData,
        generated_content: generatedContent,
        realCPC: campaignData.realCPC || null, // Real CPC from Google Ads Historical Metrics (USD)
        maxCpcBid: campaignData.maxCpcBid || campaignData.realCPC || null, // Max CPC Bid (USD)
        // ═══════════════════════════════════════════════════════════════════
        // BILLING MODE & USER ID
        // ═══════════════════════════════════════════════════════════════════
        billing_mode: billingModeForPublish,
        // user_id removed for security (verified via JWT)
        // ═══════════════════════════════════════════════════════════════════
        // VIDEO CAMPAIGN SPECIFIC DATA
        // ═══════════════════════════════════════════════════════════════════
        video_ad_type: campaignData.videoSubType || campaignData.videoAdType || campaignData.videoSubtype || 'VIDEO_RESPONSIVE_AD',
        youtube_video_id: campaignData.youtubeVideoId || campaignData.videoId || null,
        // ═══════════════════════════════════════════════════════════════════
        adCreative: {
          headlines: generatedContent?.headlines || [],
          descriptions: generatedContent?.descriptions || [],
          keywords: generatedContent?.keywords || cpcData?.keywords || [],
          phoneNumber: campaignData.phoneNumber || null,
          // Video-specific creative data
          long_headlines: generatedContent?.long_headlines || generatedContent?.descriptions || [],
          call_to_action: generatedContent?.call_to_action || 'اكتشف المزيد',
          action_button_label: generatedContent?.action_button_label || 'تعرف أكثر',
          action_headline: generatedContent?.action_headline || '',
        },
        // customer_email removed for security (verified via JWT)
      };

      console.log('📦 Publishing campaign:', completeCampaignData);
      console.log('🎯 Selected customer_id:', selectedAccount);

      const apiUrl = getApiUrl('/api/ai-campaign/launch-campaign');
      console.log('🌐 API URL:', apiUrl);

      // Launch campaign - this is the real work happening
      let launchResponse: Response;
      try {
        launchResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completeCampaignData)
        });
      } catch (fetchError) {
        console.error('❌ Fetch error details:', fetchError);
        console.error('❌ Error name:', (fetchError as Error).name);
        console.error('❌ Error message:', (fetchError as Error).message);
        throw new Error(`Network error: ${(fetchError as Error).message}. تأكد من أن الخادم يعمل على ${apiUrl}`);
      }

      // Stop simulation and move to 90% when API responds
      clearInterval(progressInterval);
      setPublishProgress(90);
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!launchResponse.ok) {
        const errorData = await launchResponse.json().catch(() => null);
        console.error('❌ Backend error:', errorData);

        // Extract Arabic message if available
        const errorMessage = errorData?.message || errorData?.error || 'فشل في نشر الحملة';

        // Check if it's an account not enabled error
        if (errorMessage.includes('غير مفعل') || errorMessage.includes('CUSTOMER_NOT_ENABLED') || errorMessage.includes('not yet enabled') || errorMessage.includes('ENABLED')) {
          const cleanCustomerId = selectedAccount.replace(/-/g, '');
          const formattedId = `${cleanCustomerId.slice(0, 3)}-${cleanCustomerId.slice(3, 6)}-${cleanCustomerId.slice(6)}`;
          setAnnouncement({
            show: true,
            variant: 'account-disabled',
            message: `⚠️ Account ${formattedId} is not enabled - Click here to activate in Google Ads`,
            href: `https://ads.google.com/aw/overview?__e=${cleanCustomerId}`
          });
          // Auto-hide after 5 seconds
          setTimeout(() => setAnnouncement(prev => ({ ...prev, show: false })), 10000);
        } else {
          setAnnouncement({
            show: true,
            variant: 'error',
            message: `❌ خطأ في نشر الحملة: ${errorMessage}`
          });
          // Auto-hide after 5 seconds
          setTimeout(() => setAnnouncement(prev => ({ ...prev, show: false })), 10000);
        }
        setIsLoading(false);
        setShowPublishingModal(false);
        clearInterval(progressInterval);
        isPublishingRef.current = false; // ✅ Reset ref on error
        return;
      }

      const result = await launchResponse.json();
      console.log('✅ Campaign launch result:', result);

      // ✅ Register campaign in platform_created_campaigns for tracking
      // Use google_campaign_id (real Google Ads ID) not campaign_id (internal UUID)
      const realGoogleCampaignId = result.google_campaign_id || result.campaign_id;
      if (result.success && realGoogleCampaignId) {
        try {
          await fetch('/api/campaigns/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              google_campaign_id: realGoogleCampaignId,
              google_campaign_name: result.campaign_name || completeCampaignData.campaign_name,
              customer_id: selectedAccount,
              source: billingModeForPublish === 'furriyadh_managed' ? 'furriyadh_managed' : 'self_managed',
              campaign_type: completeCampaignData.campaign_type || 'SEARCH',
              daily_budget: completeCampaignData.daily_budget || 0,
              currency: completeCampaignData.currency || 'USD',
              website_url: completeCampaignData.website_url,
            })
          });
          console.log('✅ Campaign registered in platform tracking with Google ID:', realGoogleCampaignId);
        } catch (regError) {
          console.warn('⚠️ Could not register campaign for tracking:', regError);
        }
      }

      // Smoothly complete progress to 100%
      setPublishProgress(95);
      await new Promise(resolve => setTimeout(resolve, 200));
      setPublishProgress(100);

      // Keep modal open for 2 seconds to show success
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (result.success) {
        // Save result and redirect to final success page
        localStorage.setItem('launchedCampaign', JSON.stringify(result));
        localStorage.removeItem('creatingCampaign');
        localStorage.removeItem('selectedLocations');

        // DON'T hide publishing modal - keep it open until redirect!
        // setShowPublishingModal(false); // ❌ Removed - modal stays open until redirect

        // Check if this is a VIDEO campaign with manual upload required
        if (result.manual_upload_required || result.campaign_type === 'VIDEO') {
          // Show success announcement for video campaigns
          setAnnouncement({
            show: true,
            variant: 'success',
            message: '🎉 Request submitted! Your video campaign is being reviewed.'
          });

          // Redirect to video request submitted page (modal will stay open during redirect)
          const campaignDataStr = localStorage.getItem('campaignData') || '{}';
          const campaignDataForUrl = JSON.parse(campaignDataStr);
          const videoId = result.youtube_video_id || campaignDataForUrl.youtubeVideoId || '';
          const budget = result.daily_budget || campaignDataForUrl.dailyBudget || 15;
          const currency = result.currency || campaignDataForUrl.currency || 'USD';
          const campaignName = result.campaign_name || 'Video Campaign';

          setTimeout(() => {
            router.push(`/campaign/video-request-submitted?campaign=${encodeURIComponent(campaignName)}&video=${videoId}&budget=${budget}&currency=${currency}`);
          }, 1500);
        } else {
          // Regular campaigns - redirect to dashboard
          setAnnouncement({
            show: true,
            variant: 'success',
            message: '🎉 تم نشر الحملة بنجاح على Google Ads!'
          });

          // Redirect to dashboard (modal will stay open during redirect)
          setTimeout(() => {
            router.push('/dashboard');
            // Modal will disappear automatically when page changes
          }, 2000);
        }
      } else {
        // Show user-friendly error message
        const errorMsg = result.message || result.error || 'فشل في نشر الحملة';

        // Check if it's an account not enabled error
        if (errorMsg.includes('غير مفعل') || errorMsg.includes('CUSTOMER_NOT_ENABLED') || errorMsg.includes('not yet enabled') || errorMsg.includes('ENABLED')) {
          const cleanCustomerId = selectedAccount.replace(/-/g, '');
          const formattedId = `${cleanCustomerId.slice(0, 3)}-${cleanCustomerId.slice(3, 6)}-${cleanCustomerId.slice(6)}`;
          setAnnouncement({
            show: true,
            variant: 'account-disabled',
            message: `⚠️ Account ${formattedId} is not enabled - Click here to activate in Google Ads`,
            href: `https://ads.google.com/aw/overview?__e=${cleanCustomerId}`
          });
          // Auto-hide after 5 seconds
          setTimeout(() => setAnnouncement(prev => ({ ...prev, show: false })), 10000);
        } else {
          setAnnouncement({
            show: true,
            variant: 'error',
            message: `❌ خطأ في نشر الحملة: ${errorMsg}`
          });
          // Auto-hide after 5 seconds
          setTimeout(() => setAnnouncement(prev => ({ ...prev, show: false })), 10000);
        }
      }
    } catch (error) {
      console.error('Error publishing campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل في نشر الحملة. الرجاء المحاولة مرة أخرى.';
      setAnnouncement({
        show: true,
        variant: 'error',
        message: `❌ خطأ: ${errorMessage}`
      });
      // Auto-hide after 5 seconds
      setTimeout(() => setAnnouncement(prev => ({ ...prev, show: false })), 10000);
      // Close modal on error
      setShowPublishingModal(false);
    } finally {
      setIsLoading(false);
      isPublishingRef.current = false; // ✅ Reset ref in finally block
      // DON'T close modal here - let it stay open until redirect to dashboard
      // setShowPublishingModal(false); // ❌ Removed - modal stays open on success
    }
  };

  const totalVariations = adVariations.length;

  // Get platform bar based on campaign type
  const getPlatformBar = () => {
    switch (campaignType) {
      case 'SEARCH':
        return (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <path d="M10.5 18C6.5 18 3 14.5 3 10.5C3 6.5 6.5 3 10.5 3C14.5 3 18 6.5 18 10.5" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
              <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" className="text-red-500" />
              <path d="M10.5 3C14.0899 3 17 5.91015 17 9.5" stroke="currentColor" strokeWidth="2" className="text-yellow-500" />
              <path d="M10.5 18C7.18629 18 4.5 15.3137 4.5 12" stroke="currentColor" strokeWidth="2" className="text-green-500" />
            </svg>
            <span className="text-black dark:text-gray-400 text-[11px]">Search</span>
          </div>
        );
      case 'DISPLAY':
        return (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700">
            <svg className="w-3.5 h-3.5 text-black dark:text-gray-400" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="text-black dark:text-gray-400 text-[11px]">Display Ad</span>
          </div>
        );
      case 'VIDEO':
        return (
          <div className="flex items-center gap-2 bg-black dark:bg-gray-900 rounded-lg px-3 py-1.5 border border-gray-700 dark:border-gray-600">
            <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z" />
            </svg>
            <span className="text-white dark:text-gray-300 text-[11px] font-medium">YouTube</span>
          </div>
        );
      case 'SHOPPING':
        return (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700">
            <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" viewBox="0 0 24 24" fill="none">
              <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="text-black dark:text-gray-400 text-[11px]">Shopping</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <path d="M10.5 18C6.5 18 3 14.5 3 10.5C3 6.5 6.5 3 10.5 3C14.5 3 18 6.5 18 10.5" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
              <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" className="text-red-500" />
              <path d="M10.5 3C14.0899 3 17 5.91015 17 9.5" stroke="currentColor" strokeWidth="2" className="text-yellow-500" />
              <path d="M10.5 18C7.18629 18 4.5 15.3137 4.5 12" stroke="currentColor" strokeWidth="2" className="text-green-500" />
            </svg>
            <span className="text-black dark:text-gray-400 text-[11px]">Search</span>
          </div>
        );
    }
  };

  // Helper function to detect Arabic text
  const isArabic = (text: string) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  // Create cards for CardStack
  const cards = adVariations.map((ad, index) => ({
    id: index,
    content: (
      <div className={`w-full h-full flex flex-col ${campaignType === 'VIDEO' ? 'min-h-[420px] sm:min-h-[480px]' : campaignType === 'SHOPPING' ? 'min-h-[700px] sm:min-h-[800px] lg:min-h-[850px]' : campaignType === 'APP' ? 'min-h-[380px] sm:min-h-[420px]' : 'min-h-[200px] sm:min-h-[240px]'}`}>
        {/* Platform Bar */}
        <div className="bg-gray-50 dark:bg-gray-800 p-2 sm:p-2.5 border-b border-gray-200 dark:border-gray-700">
          {getPlatformBar()}
        </div>

        {/* Conditional Ad Preview based on Campaign Type */}
        {campaignType === 'APP' ? (
          // App Campaign Preview
          <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1">
            <AppPreview
              headlines={ad.headlines}
              descriptions={ad.descriptions}
            />
          </div>
        ) : campaignType === 'SHOPPING' ? (
          // Shopping Campaign Preview
          <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1">
            <ShoppingPreview
              merchantName={websiteDomain}
              headlines={ad.headlines}
              descriptions={ad.descriptions}
              dailyBudget={15}
              currency="USD"
              websiteUrl={websiteUrl}
            />
          </div>
        ) : campaignType === 'VIDEO' && youtubeVideoId ? (
          // YouTube Video Ad Preview
          <div className="flex-1 flex flex-col bg-gray-900 dark:bg-gray-950">
            {/* Video Thumbnail with Overlays */}
            <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
              {/* YouTube Thumbnail */}
              <img
                src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
                alt="Video Thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to hqdefault if maxresdefault not available
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
                }}
              />

              {/* Visit Advertiser Button - Top Left */}
              <div className="absolute top-3 left-3">
                <button className="bg-black/80 hover:bg-black text-white text-xs sm:text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition-all">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {language === 'ar' ? 'زيارة صفحة المعلن' : 'Visit Advertiser'}
                </button>
              </div>

              {/* Skip Ad Button - Bottom Left */}
              <div className="absolute bottom-3 left-3">
                <button className="bg-yellow-500/90 hover:bg-yellow-500 text-black text-xs sm:text-sm px-4 py-2 rounded font-bold flex items-center gap-2 transition-all shadow-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
                  </svg>
                  {language === 'ar' ? 'تخطّي الإعلان' : 'Skip Ad'}
                </button>
              </div>

              {/* Video Duration - Bottom Right */}
              <div className="absolute bottom-3 right-3">
                <span className="bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
                  0:15
                </span>
              </div>

              {/* Ad Badge - Top Right */}
              <div className="absolute top-3 right-3">
                <span className="bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded font-bold">
                  {language === 'ar' ? 'إعلان' : 'Ad'}
                </span>
              </div>
            </div>

            {/* Video Info Section */}
            <div className="p-3 sm:p-4 bg-gray-800 dark:bg-gray-900">
              <div className="flex items-start gap-3">
                {/* Channel Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {youtubeVideoId && (
                    <img
                      src={`https://img.youtube.com/vi/${youtubeVideoId}/default.jpg`}
                      alt="Channel"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Ad Label + Title */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">
                      {language === 'ar' ? 'إعلان' : 'Ad'}
                    </span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-white text-sm font-medium truncate" dir={isArabic(ad.headlines[0]) ? 'rtl' : 'ltr'}>
                      {ad.headlines[0]}
                    </span>
                  </div>

                  {/* Views Count */}
                  <p className="text-gray-400 text-xs">
                    {youtubeVideoViews > 0
                      ? (() => {
                        const views = youtubeVideoViews;
                        if (views >= 1_000_000) {
                          return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M ${language === 'ar' ? 'مشاهدة' : 'views'}`;
                        } else if (views >= 1_000) {
                          return `${(views / 1_000).toFixed(1).replace(/\.0$/, '')}K ${language === 'ar' ? 'مشاهدة' : 'views'}`;
                        }
                        return `${views.toLocaleString()} ${language === 'ar' ? 'مشاهدة' : 'views'}`;
                      })()
                      : (language === 'ar' ? 'جاري التحميل...' : 'Loading...')}
                  </p>

                  {/* Description */}
                  <p className="text-gray-300 text-xs mt-1 line-clamp-2" dir={isArabic(ad.descriptions[0]) ? 'rtl' : 'ltr'}>
                    {ad.descriptions[0]}
                  </p>
                </div>

                {/* Menu Button */}
                <button className="text-gray-400 hover:text-white p-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Original Search/Display Ad Preview
          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 flex-1 flex flex-col justify-center">
            <div className="mb-1 sm:mb-1.5">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-900 dark:text-white">
                Sponsored
              </span>
            </div>

            {/* Website Info */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] sm:text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                  {websiteDomain.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-gray-900 dark:text-white font-medium truncate">
                {websiteDomain}
              </div>
            </div>

            <div className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2 truncate">
              https://{websiteDomain}
            </div>

            {/* Headlines */}
            <div className="space-y-1 sm:space-y-1.5">
              {/* Mobile/Tablet: Single Headline */}
              <h3
                className="xl:hidden text-[11px] sm:text-xs md:text-sm font-normal text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-tight sm:leading-snug line-clamp-2 sm:line-clamp-1"
                dir={isArabic(ad.headlines[0]) ? 'rtl' : 'ltr'}
              >
                {ad.headlines[0]}
              </h3>

              {/* Desktop/Laptop: Two Headlines with separator */}
              {ad.headlines[1] && (
                <h3
                  className="hidden xl:block text-[11px] sm:text-xs md:text-sm font-normal text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-tight sm:leading-snug line-clamp-1"
                  dir={isArabic(ad.headlines[0]) ? 'rtl' : 'ltr'}
                >
                  {ad.headlines[0]} <span className="text-gray-400 dark:text-gray-600 mx-1">|</span> {ad.headlines[1]}
                </h3>
              )}

              {/* Descriptions */}
              <div className="space-y-0.5">
                {ad.descriptions.slice(0, 2).map((desc, idx) => (
                  <p
                    key={idx}
                    className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-1"
                    dir={isArabic(desc) ? 'rtl' : 'ltr'}
                  >
                    {desc}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    ),
  }));

  return (
    <>
      {/* Announcement Notification - Outside main container to prevent re-render issues */}
      {announcement.show && (
        <div className="fixed top-20 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-auto" dir="ltr">
          <Announcement
            variant={announcement.variant}
            href={announcement.href}
            onClick={() => setAnnouncement({ ...announcement, show: false })}
          >
            {announcement.message}
          </Announcement>
        </div>
      )}

      <div className="" dir="ltr">
        <div className="container mx-auto px-4 py-8 max-w-7xl">

          {/* Header */}
          <div className="text-center mb-3 sm:mb-6">
            <h5 className="!mb-0 text-lg sm:text-xl font-bold text-gray-900 dark:text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'معاينة الإعلانات التي أنشأها الذكاء الاصطناعي لك' : 'Preview the ads Furriyadh AI has generated for you'}
            </h5>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm max-w-4xl mx-auto mt-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar'
                ? 'تم إنشاء عناوين وأوصاف ووسائط متعددة. سيتم اختبارها للعثور على الإعلانات الأكثر فعالية لجمهورك.'
                : "Multiple headlines, descriptions, and media have been generated. They'll be A/B tested to find the most effective ads for your audience."}
            </p>
          </div>

          {/* Variations Counter */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-sm sm:text-base text-purple-600 dark:text-purple-400">
                {language === 'ar' ? `تم إنشاء ${totalVariations} نسخة إعلانية` : `${totalVariations} ad variations generated`}
              </span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          {/* Ad Preview Section - Centered Layout */}
          <div className={`flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-8 mt-4 sm:mt-6 md:mt-8 lg:mr-[140px]`}>

            {/* Card Stack - Centered */}
            <div className="flex items-center justify-center w-full">
              {cards.length > 0 ? (
                <div className={`w-full ${campaignType === 'VIDEO' ? 'max-w-[360px] sm:max-w-[450px] md:max-w-[550px] lg:max-w-[650px]' : 'max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px]'}`}>
                  <CardStack
                    items={cards}
                    offset={10}
                    scaleFactor={0.06}
                    className={campaignType === 'VIDEO'
                      ? 'h-[450px] w-full sm:h-[500px] md:h-[520px] lg:h-[560px] sm:w-[450px] md:w-[550px] lg:w-[650px]'
                      : campaignType === 'APP'
                        ? 'h-[420px] w-full sm:h-[460px] md:h-[440px] lg:h-[400px] sm:w-[450px] md:w-[550px] lg:w-[650px]'
                        : campaignType === 'SHOPPING'
                          ? 'h-[480px] w-full sm:h-[520px] md:h-[560px] lg:h-[600px] sm:w-[450px] md:w-[550px] lg:w-[650px]'
                          : 'h-64 w-96 md:h-80 md:w-[600px]'
                    }
                  />
                </div>
              ) : (
                <div className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] h-48 sm:h-64 md:h-80 rounded-3xl border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-14 md:w-14 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">{language === 'ar' ? 'جاري تحميل الإعلانات...' : 'Loading ads...'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Button - Below Card */}
            <div className="flex items-center justify-center w-full">
              <p className={`text-gray-700 dark:text-gray-300 text-sm sm:text-base lg:text-lg text-center ${isRTL ? 'lg:translate-x-[75px]' : 'lg:translate-x-[75px]'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'هل تريد تغيير محتوى الإعلانات؟ ' : "Want to change the ads' content? "}
                <button
                  onClick={handleEditAds}
                  className="inline-flex items-center gap-1 hover:underline font-semibold"
                >
                  <span className="!text-blue-600 dark:!text-blue-500">{language === 'ar' ? 'تعديل الإعلانات' : 'Edit ads'}</span>
                  <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 !text-blue-600 dark:!text-blue-500" />
                </button>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mt-12">
            <GlowButton
              onClick={handlePublishClick}
              variant="blue"
              disabled={isLoading}
            >
              <span className="flex items-center gap-2">
                {isLoading
                  ? (language === 'ar' ? 'جاري النشر...' : 'Publishing...')
                  : (language === 'ar' ? 'نشر الحملة' : 'Publish Campaign')}
                <ArrowRight className="w-5 h-5" />
              </span>
            </GlowButton>
          </div>
        </div>

        {/* Account Selection Modal - Dynamic colors based on campaign type */}
        {showAccountModal && (
          <div
            className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${isRTL ? 'lg:pr-[250px]' : 'lg:pl-[250px]'}`}
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
            }}
            onClick={() => setShowAccountModal(false)}
          >


            <div
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 rounded-2xl w-full max-w-2xl min-h-[600px] relative z-50 shadow-lg flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-8 flex items-center justify-center">
                <div className="text-center">
                  <h5 className="h5 !mb-0">
                    {language === 'ar' ? 'إعداد حسابك الإعلاني لهذه الحملة' : 'Configure your ad account for this campaign'}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 !mb-0">
                    {language === 'ar' ? 'أي حساب تريد استخدامه لنشر حملتك عبر Furriyadh؟' : 'What account would you like to use to publish your Furriyadh campaign?'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-0' : 'right-0'} p-2 hover:bg-white/10 rounded-full transition-colors`}
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* 🔄 Publish Mode Toggle */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* My Account Option */}
                <button
                  onClick={() => handleBillingModeChange('my_account')}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${publishMode === 'my_account'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  {publishMode === 'my_account' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <img src="/images/integrations/google-ads-logo.svg" alt="Google Ads" className="w-4 h-4" />
                    </div>
                    <span className="h6 !mb-0">
                      {language === 'ar' ? 'حسابي على Google Ads' : 'My Google Ads Account'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 !mb-0">
                    {language === 'ar' ? 'النشر على حسابي المربوط' : 'Publish to my linked account'}
                  </p>
                </button>

                {/* Managed Account Option */}
                <button
                  onClick={() => handleBillingModeChange('managed')}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${publishMode === 'managed'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {language === 'ar' ? 'الأكثر شعبية' : 'Popular'}
                    </span>
                  </div>
                  {publishMode === 'managed' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1 mt-1">
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Crown className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="h6 !mb-0">
                      {language === 'ar' ? 'حساب Furriyadh' : 'Furriyadh Account'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 !mb-0">
                    {language === 'ar' ? 'إدارة احترافية • حماية من الإيقاف' : 'Professional management • Suspension protection'}
                  </p>
                </button>
              </div>

              {/* Account Selection Content - Only show for my_account mode */}
              {publishMode === 'my_account' && (
                <div className="custom-scrollbar max-h-[400px] overflow-y-auto pr-2">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-gray-400">{language === 'ar' ? 'جاري جلب الحسابات...' : 'Loading accounts...'}</p>
                    </div>
                  ) : connectedAccounts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img src="/images/integrations/google-ads-logo.svg" alt="Google Ads" className="w-8 h-8 opacity-50" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {language === 'ar' ? 'لا توجد حسابات مرتبطة' : 'No Connected Accounts'}
                      </h3>
                      <p className="text-gray-600 dark:text-white/70 mb-4 sm:mb-6 max-w-sm mx-auto text-xs sm:text-sm">
                        {language === 'ar' ? 'يرجى ربط حساب إعلانات جوجل لنشر حملاتك' : 'Please connect a Google Ads account to publish your campaigns'}
                      </p>
                      <button
                        onClick={() => router.push('/integrations/google-ads')}
                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                      >
                        <span>{language === 'ar' ? 'ربط حساب' : 'Connect Account'}</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Plan limits banner */}
                      {(() => {
                        const planLimits = getCurrentPlanLimits();
                        const isAtLimit = planLimits.maxAccounts !== -1 && connectedAccounts.length >= planLimits.maxAccounts;

                        return (
                          <div className={`mb-4 p-3 rounded-lg border ${isAtLimit
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Crown className={`w-4 h-4 ${isAtLimit ? 'text-orange-500' : 'text-primary-500'}`} />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {language === 'ar'
                                    ? `${connectedAccounts.length}/${planLimits.maxAccounts === -1 ? '∞' : planLimits.maxAccounts} حساب (${planLimits.planName})`
                                    : `${connectedAccounts.length}/${planLimits.maxAccounts === -1 ? '∞' : planLimits.maxAccounts} accounts (${planLimits.planName})`}
                                </span>
                              </div>
                              {isAtLimit && (
                                <button
                                  onClick={() => router.push('/dashboard/dashboard/google-ads/billing')}
                                  className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full font-medium transition-colors"
                                >
                                  {language === 'ar' ? 'ترقية' : 'Upgrade'}
                                </button>
                              )}
                            </div>
                            {isAtLimit && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                {language === 'ar'
                                  ? 'قم بالترقية لإضافة المزيد من الحسابات'
                                  : 'Upgrade to add more accounts'}
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      <div className="space-y-3">
                        {connectedAccounts.map((account, index) => {
                          const isEnabled = account.status === 'ACTIVE';
                          const activationUrl = `https://ads.google.com/aw/preferences?ocid=${account.customerId.replace(/-/g, '')}`;

                          return (
                            <div
                              key={account.customerId}
                              onClick={() => isEnabled && setSelectedAccount(account.customerId)}
                              className={`relative w-full p-4 rounded-xl border-2 transition-all duration-200 ${!isEnabled
                                ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
                                : selectedAccount === account.customerId
                                  ? 'bg-white dark:bg-gray-800 border-blue-500 shadow-md shadow-blue-500/10 cursor-pointer'
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-sm cursor-pointer'
                                }`}
                              style={{
                                animationDelay: `${index * 0.05}s`,
                                animation: 'fadeInUp 0.3s ease-out forwards',
                                opacity: 0
                              }}
                            >
                              {/* Account Display */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {/* Radio Button Style - Larger and more prominent */}
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedAccount === account.customerId
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'
                                    }`}>
                                    {selectedAccount === account.customerId && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-gray-900 dark:text-white font-medium text-base">
                                      {language === 'ar' ? 'حساب Furriyadh' : 'Furriyadh Account'}
                                      <span dir="ltr" className="text-gray-500 dark:text-gray-400 font-normal text-sm ml-2">
                                        {formatCustomerId(account.customerId)}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <div className="ml-4 flex items-center gap-2">
                                  {/* Managed Badge - Cleaner style */}
                                  <div className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    {language === 'ar' ? 'مُدار' : 'Managed'}
                                  </div>
                                  {!isEnabled && (
                                    <>
                                      <div className="flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-orange-400"></span>
                                        {language === 'ar' ? 'غير مفعّل' : 'Not Enabled'}
                                      </div>
                                      <a
                                        href={activationUrl}
                                        target="_blank"
                                        rel="nofollow noopener noreferrer"
                                        onClick={handleActivateClick}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs font-medium"
                                        title={language === 'ar' ? 'تفعيل الحساب' : 'Activate Account'}
                                      >
                                        <span>{language === 'ar' ? 'تفعيل' : 'Activate'}</span>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Managed Account Mode - Direct publish */}
              {publishMode === 'managed' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h6 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {language === 'ar' ? 'نشر احترافي مُدار بالكامل' : 'Fully Managed Professional Publishing'}
                  </h6>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-sm mx-auto">
                    {language === 'ar'
                      ? 'حملتك ستُنشر على حسابات إعلانية متميزة ومُعتمدة من Google مع ضمان عدم الإيقاف'
                      : 'Your campaign will be published on premium Google-verified advertising accounts with suspension protection guaranteed'
                    }
                  </p>

                  {/* Commission Info */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-4 max-w-sm mx-auto">
                    <div className="flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300">
                      <span className="text-lg font-bold">20%</span>
                      <span className="text-sm">{language === 'ar' ? 'رسوم إدارة الحملة' : 'campaign management fee'}</span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {language === 'ar' ? 'بدون اشتراكات • تُحتسب من الميزانية الإعلانية فقط' : 'No subscriptions • Calculated from ad budget only'}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {[
                      { en: 'No Suspension Risk', ar: 'بدون خطر إيقاف' },
                      { en: 'High Trust Score', ar: 'درجة ثقة عالية' },
                      { en: '24/7 Optimization', ar: 'تحسين مستمر' },
                    ].map((feature, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {language === 'ar' ? feature.ar : feature.en}
                      </span>
                    ))}
                  </div>

                  {/* Start Now Button - Navigate to managed account setup */}
                  <button
                    onClick={() => {
                      // Save campaign data for later
                      localStorage.setItem('pending_managed_campaign', 'true');
                      // Redirect to managed account setup/billing page
                      router.push('/dashboard/dashboard/google-ads/billing?setup=managed');
                    }}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {language === 'ar' ? 'ابدأ الآن' : 'Start Now'}
                      <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                </div>
              )}

              {/* Add animation keyframes */}
              <style jsx>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              @keyframes pulse-slow {
                0%, 100% {
                  opacity: 1;
                  transform: scale(1);
                }
                50% {
                  opacity: 0.95;
                  transform: scale(1.02);
                }
              }
              
              :global(.animate-pulse-slow) {
                animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              }
              
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(156, 163, 175, 0.3);
                border-radius: 4px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(156, 163, 175, 0.5);
              }
            `}</style>

              {/* Footer - GlowButton style like campaign pages */}
              <div className="px-6 py-4 flex justify-between items-center gap-4">
                <GlowButton
                  onClick={() => setShowAccountModal(false)}
                  variant="green"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </span>
                </GlowButton>

                <div className="relative group">
                  {(() => {
                    const selectedAccountData = selectedAccount
                      ? connectedAccounts.find(acc => acc.customerId === selectedAccount)
                      : null;
                    const isAccountActive = selectedAccountData?.status === 'ACTIVE';

                    // For managed mode, no account selection needed
                    const isButtonDisabled = publishMode === 'managed'
                      ? isLoading
                      : (!selectedAccount || isLoading || !isAccountActive);

                    console.log(`🔵 Button state: mode=${publishMode}, selected=${selectedAccount}, status=${selectedAccountData?.status}, disabled=${isButtonDisabled}`);

                    return (
                      <>
                        <GlowButton
                          onClick={handlePublish}
                          variant="blue"
                          disabled={isButtonDisabled}
                          className={isAccountActive ? 'animate-pulse-slow' : ''}
                        >
                          <span className="flex items-center gap-2">
                            {isLoading ? (
                              <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {language === 'ar' ? 'جاري النشر...' : 'Publishing...'}
                              </>
                            ) : language === 'ar' ? (
                              // Arabic: Text -> Arrow on Left (End of RTL line)
                              <>
                                نشر الحملة
                                <ArrowRight className="w-5 h-5" />
                              </>
                            ) : (
                              // English: Text -> Arrow on Right (End of LTR)
                              <>
                                Publish Campaign
                                <ArrowRight className="w-5 h-5" />
                              </>
                            )}
                          </span>
                        </GlowButton>

                        {/* Tooltip for disabled state */}
                        {!selectedAccount && (
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              {language === 'ar' ? 'يرجى اختيار حساب أولاً' : 'Please select an account first'}
                            </div>
                          </div>
                        )}
                        {selectedAccount && !isAccountActive && (
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                            <div className="bg-orange-600 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              {language === 'ar'
                                ? `⚠️ يجب تفعيل الحساب أولاً (${selectedAccountData?.status || 'UNKNOWN'})`
                                : `⚠️ Account must be activated first (${selectedAccountData?.status || 'UNKNOWN'})`}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Connect New Account Link - Only show in my_account mode */}
              {publishMode === 'my_account' && (
                <div className="text-center mt-4 pb-2">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                    {language === 'ar' ? 'الحساب الذي تبحث عنه غير موجود هنا؟' : 'The account you are looking for is not here?'}
                  </p>
                  <button
                    onClick={() => {
                      setShowAccountModal(false);
                      router.push('/dashboard/google-ads/integrations/google-ads');
                    }}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    {language === 'ar' ? 'ربط حساب جديد' : 'Connect a new account'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Publishing Progress Modal with Modern Loader */}
        {showPublishingModal && (
          <div
            className={`fixed inset-0 z-[9999] backdrop-blur-xl flex items-center justify-center ${isRTL ? 'lg:pr-[340px]' : 'lg:pl-[340px]'}`}
            style={{
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0.98))',
            }}
          >
            <ModernLoader
              words={language === 'ar' ? [
                'جاري الاتصال بـ Google Ads...',
                'إنشاء الحملة...',
                'إعداد الميزانية...',
                'تكوين الاستهداف...',
                'إضافة الكلمات المفتاحية...',
                'إنشاء المجموعات الإعلانية...',
                'رفع نص الإعلان...',
                'إنهاء الإعدادات...',
                'النشر على Google...',
                'جاري الانتهاء...'
              ] : [
                'Connecting to Google Ads…',
                'Creating campaign…',
                'Setting up budget…',
                'Configuring targeting…',
                'Adding keywords…',
                'Creating ad groups…',
                'Uploading ad copy…',
                'Finalizing settings…',
                'Publishing to Google…',
                'Almost done…'
              ]}
            />
          </div>
        )}
      </div >
    </>
  );
}