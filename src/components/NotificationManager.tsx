"use client";

import { usePathname } from 'next/navigation';
import AnimatedNotification from '@/components/ui/animated-notification';

// 🏠 Homepage Messages
const HOMEPAGE_MESSAGES = [
  // Performance & Results
  "Campaign ROI increased by 127% 📈",
  "CPC reduced from $2.40 to $0.85 💰",
  "Quality Score improved: 6 → 9 ⭐",
  "Conversion rate up 43% this week 🎯",
  "Ad spend optimized: Saved $840 today 💵",
  "CTR jumped from 2.1% to 5.8% 🚀",
  "Impressions increased by 234% 👀",
  "Cost per conversion down 67% 📉",
  "ROAS improved to 4.2x this month 💎",
  
  // AI Actions
  "AI found 12 high-intent keywords 🔍",
  "Smart bidding adjusted for peak hours ⚡",
  "Audience targeting refined automatically 🎯",
  "AI paused 3 underperforming ads 🛑",
  "Budget reallocated to top campaigns 🔄",
  "Machine learning detected new trend 🧠",
  "AI optimized 47 ad groups today 🤖",
  "Predictive analytics: +89% next week 📈",
  
  // Package Sales
  "Sarah J. upgraded to Premium 🎉",
  "New client from Dubai joined 🇦🇪",
  "Michael K. chose 20% Commission 💼",
  "Agency: 5 accounts managed 🏢",
  "Emma L. renewed for 12 months 🔄",
  "London client activated AI 🇬🇧",
  "Premium user added 3 campaigns ⚡",
  "New signup from Saudi Arabia 🇸🇦",
  "John D. upgraded Basic → Premium ⬆️",
  "Client rating: 4.9★ received ⭐",
  
  // Geographic
  "Top region: California +89% ROI 🌎",
  "New opportunity: Texas market 📍",
  "International expansion: UK, UAE 🌐",
  "Local campaigns performing +67% 🏙️",
];

// 📊 Dashboard Messages
const DASHBOARD_MESSAGES = [
  // Real-time Performance
  "Your CPC decreased by $0.34 today 💰",
  "Campaign 'Summer Sale' ROI: +156% 📈",
  "Budget alert: 78% spent today ⚠️",
  "Quality Score improved in 3 ad groups ⭐",
  "Your CTR is 2.3x industry average 🚀",
  "New conversion recorded: $840 💵",
  "Ad Group 'Premium Products' leading 🏆",
  "Daily goal achieved: 127% 🎯",
  
  // AI Recommendations
  "AI suggests: Increase mobile bids +25% 📱",
  "Recommended: Pause 2 low-performing ads 🛑",
  "AI found 8 negative keywords to add 🔍",
  "Smart tip: Adjust schedule for peak hours ⏰",
  "Budget optimization available 💡",
  "AI detected: Competitor price drop 👁️",
  
  // Alerts & Updates
  "Campaign sync completed ✅",
  "Weekly report is ready 📊",
  "New audience segment created 👥",
  "Conversion tracking verified ✓",
  "Account health: Excellent 💚",
  "API connection stable 🔗",
];

// 💰 Pricing Page Messages
const PRICING_MESSAGES = [
  // Recent Purchases
  "Alex M. just upgraded to Premium 🎉",
  "Sarah from London subscribed 🇬🇧",
  "Agency plan activated: 10 accounts 🏢",
  "Michael renewed annual plan 🔄",
  "New client from Dubai joined 🇦🇪",
  "Emma chose 20% Commission plan 💼",
  "Premium tier unlocked by John D. ⬆️",
  "Enterprise package purchased 🏆",
  "Annual plan: Save 20% activated 📅",
  "VIP package unlocked 👑",
  
  // Social Proof
  "47 clients upgraded this week 📈",
  "Average rating: 4.9★ from 840 reviews ⭐",
  "Client retention rate: 96% 🎯",
  "Most popular: Premium Plan 💎",
  "Trusted by 2,400+ businesses 🌟",
  
  // Limited Offers
  "Limited time: 20% off annual plans ⏰",
  "Early bird discount: 3 days left 🎁",
  "Referral bonus: Earn $150 💰",
];

// 🔗 Integrations Page Messages
const INTEGRATIONS_MESSAGES = [
  // Connection Status
  "Google Ads account synced ✅",
  "3 new campaigns imported 📥",
  "API connection: Active 🟢",
  "Data sync completed: 2,847 records 🔄",
  "Account linked successfully 🔗",
  "Real-time sync enabled ⚡",
  
  // Integration Actions
  "New Google Ads account connected 🎉",
  "Campaign data refreshed 🔃",
  "Conversion tracking verified ✓",
  "OAuth token renewed automatically 🔐",
  "Bulk import completed: 12 campaigns 📊",
  
  // Integration Stats
  "15 accounts managed seamlessly 🏢",
  "API calls: 99.9% success rate 📈",
  "Last sync: 2 minutes ago ⏱️",
  "Data accuracy: 100% verified ✅",
];

// 📈 Reports/Analytics Page Messages
const REPORTS_MESSAGES = [
  // Report Ready
  "Weekly performance report ready 📊",
  "Monthly analysis completed 📈",
  "Custom report generated ✅",
  "Export completed: Download ready 📥",
  "Competitor analysis finished 🔬",
  
  // Insights
  "AI insight: Best performing hour is 2 PM ⏰",
  "Trend detected: Mobile traffic +67% 📱",
  "Recommendation: Increase budget 15% 💡",
  "Pattern found: Weekend conversions peak 📅",
  "Forecast: Next week +34% performance 🔮",
  
  // Data Analysis
  "1,247 data points analyzed 🧮",
  "ROI calculation updated 💰",
  "Attribution model applied 🎯",
  "Cohort analysis completed 👥",
  "Funnel optimization suggested 🔄",
];

// 🎯 Campaigns Page Messages
const CAMPAIGNS_MESSAGES = [
  // Campaign Updates
  "Campaign 'Black Friday' is live 🚀",
  "Ad group optimized: +45% CTR 📈",
  "Budget adjusted automatically ⚖️",
  "New ad variation created by AI ✨",
  "Campaign paused: Budget limit reached ⏸️",
  
  // Performance
  "Top campaign: 'Summer Sale' 🏆",
  "Best performing ad: Headline A 🥇",
  "Keyword 'buy now' converting well 🎯",
  "Ad schedule optimized for ROI ⏰",
  "Quality Score: 9/10 achieved ⭐",
];

// 🎨 Creative/Ads Page Messages
const CREATIVE_MESSAGES = [
  // Creative Updates
  "New ad copy generated by AI ✍️",
  "5 headline variations ready 🧪",
  "Image ads created automatically 🖼️",
  "Video ad uploaded successfully 🎥",
  "Responsive ads optimized 📱",
  
  // Performance
  "Ad variant B performing +89% better 📊",
  "Creative refresh recommended 🎨",
  "A/B test completed: Winner found ✅",
  "Dynamic ads personalized 🎯",
  "Brand consistency: 100% ✓",
];

// 🛠️ Settings Page Messages
const SETTINGS_MESSAGES = [
  // Account Updates
  "Settings saved successfully ✅",
  "Profile updated 👤",
  "Notification preferences saved 🔔",
  "API key regenerated 🔑",
  "Two-factor auth enabled 🔐",
  "Billing info updated 💳",
  
  // System
  "Account security: Strong 💪",
  "Backup completed automatically 💾",
  "Data export scheduled 📤",
];

export default function NotificationManager() {
  const pathname = usePathname();

  // Smart message selection based on current page
  const getMessagesForPage = (): string[] => {
    // Dashboard pages
    if (pathname.startsWith('/dashboard')) {
      if (pathname.includes('/campaigns')) return CAMPAIGNS_MESSAGES;
      if (pathname.includes('/reports') || pathname.includes('/analytics')) return REPORTS_MESSAGES;
      if (pathname.includes('/creative') || pathname.includes('/ads')) return CREATIVE_MESSAGES;
      if (pathname.includes('/settings')) return SETTINGS_MESSAGES;
      return DASHBOARD_MESSAGES;
    }
    
    // Integrations page
    if (pathname.startsWith('/integrations')) return INTEGRATIONS_MESSAGES;
    
    // Pricing page
    if (pathname.includes('/pricing')) return PRICING_MESSAGES;
    
    // Reports page (standalone)
    if (pathname.startsWith('/reports')) return REPORTS_MESSAGES;
    
    // Default: Homepage messages
    return HOMEPAGE_MESSAGES;
  };

  // Don't show notifications on authentication pages
  if (pathname.startsWith('/authentication')) {
    return null;
  }

  return (
    <AnimatedNotification
      autoGenerate={true}
      maxNotifications={1}
      autoInterval={20000}
      autoDismissTimeout={8000}
      animationDuration={1000}
      variant="glass"
      position="bottom-left"
      showAvatars={true}
      allowDismiss={true}
      customMessages={getMessagesForPage()}
    />
  );
}

