'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Monitor, 
  ShoppingBag, 
  Play, 
  Smartphone, 
  MapPin, 
  TrendingUp, 
  Phone,
  Zap,
  Target,
  Star,
  Sparkles,
  Crown,
  Award
} from 'lucide-react';

interface CampaignType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: 'best' | 'popular' | 'recommended' | 'beginner' | 'advanced';
  color: string;
  gradient: string;
  features: string[];
  subtypes?: CampaignSubtype[];
  objectives?: string[];
}

interface CampaignSubtype {
  id: string;
  name: string;
  description: string;
  badge?: 'recommended' | 'beginner' | 'advanced';
  requirements: string[];
  autoObjective?: string;
}

const campaignTypes: CampaignType[] = [
  {
    id: 'search',
    name: 'Search Campaigns',
    description: 'Show ads when people search for your products or services',
    icon: <Search className="w-8 h-8" />,
    badge: 'popular',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    features: ['Text ads', 'Keyword targeting', 'High intent traffic'],
    objectives: ['Website Traffic', 'Leads'],
    subtypes: [
      {
        id: 'website-visits',
        name: 'Website Visits',
        description: 'Drive traffic to your website',
        badge: 'recommended',
        requirements: ['Keywords', 'Headlines', 'Descriptions', 'Final URL'],
        autoObjective: 'Website Traffic'
      },
      {
        id: 'phone-calls',
        name: 'Phone Calls',
        description: 'Encourage customers to call your business',
        requirements: ['Phone number', 'Headlines', 'Descriptions', 'Business hours'],
        autoObjective: 'Leads'
      }
    ]
  },
  {
    id: 'performance-max',
    name: 'Performance Max',
    description: 'Reach customers across all Google channels with AI optimization',
    icon: <Zap className="w-8 h-8" />,
    badge: 'best',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    features: ['AI-powered', 'All Google channels', 'Automated optimization'],
    objectives: ['Sales', 'Leads'],
    subtypes: [
      {
        id: 'with-products',
        name: 'With Products',
        description: 'Promote products from Merchant Center',
        badge: 'recommended',
        requirements: ['Merchant Center account', 'Product feed', 'High-quality assets'],
        autoObjective: 'Sales'
      },
      {
        id: 'without-products',
        name: 'Without Products',
        description: 'Promote services or lead generation',
        requirements: ['High-quality assets', 'Headlines', 'Descriptions'],
        autoObjective: 'Leads'
      }
    ]
  },
  {
    id: 'display',
    name: 'Display Network',
    description: 'Show visual ads across millions of websites and apps',
    icon: <Monitor className="w-8 h-8" />,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    features: ['Visual ads', 'Wide reach', 'Brand awareness'],
    objectives: ['Brand Awareness', 'Website Traffic'],
    subtypes: [
      {
        id: 'standard-display',
        name: 'Standard Display',
        description: 'Responsive display ads across the web',
        badge: 'recommended',
        requirements: ['Images (multiple sizes)', 'Headlines', 'Descriptions'],
        autoObjective: 'Brand Awareness'
      }
    ]
  },
  {
    id: 'video',
    name: 'Video Campaigns',
    description: 'Reach customers with video ads on YouTube and partner sites',
    icon: <Play className="w-8 h-8" />,
    color: 'red',
    gradient: 'from-red-500 to-red-600',
    features: ['Video content', 'YouTube reach', 'Engagement'],
    objectives: ['Brand Awareness', 'Website Traffic', 'Sales'],
    subtypes: [
      {
        id: 'video-views',
        name: 'Video Views',
        description: 'Get people to consider your product with skippable in-stream or in-feed video ads',
        badge: 'recommended',
        requirements: ['YouTube video URL', 'Thumbnails', 'Headlines'],
        autoObjective: 'Brand Awareness'
      },
      {
        id: 'video-reach-efficient',
        name: 'Efficient Reach',
        description: 'Get the most reach for your budget using bumper, skippable in-stream ads',
        requirements: ['YouTube video URL', 'Multiple video formats'],
        autoObjective: 'Brand Awareness'
      },
      {
        id: 'video-reach-non-skippable',
        name: 'Non-skippable Reach',
        description: 'Reach people using bumpers, 15-second, or 30-second non-skippable in-stream ads',
        requirements: ['YouTube video URL (15-30 seconds)', 'Compelling content'],
        autoObjective: 'Brand Awareness'
      },
      {
        id: 'video-reach-target-frequency',
        name: 'Target Frequency',
        description: 'Reach the same people multiple times using bumper, skippable in-stream, non-skippable in-stream, in-feed, and Shorts ads',
        requirements: ['YouTube video URL', 'Frequency settings'],
        autoObjective: 'Brand Awareness'
      },
      {
        id: 'drive-conversions',
        name: 'Drive Conversions',
        description: 'Get more conversions with video ads designed to encourage valuable interactions',
        badge: 'advanced',
        requirements: ['YouTube video URL', 'Conversion tracking', 'Call-to-action'],
        autoObjective: 'Sales'
      },
      {
        id: 'ad-sequence',
        name: 'Ad Sequence',
        description: 'Tell a story by showing ads in a particular sequence to individual viewers',
        badge: 'advanced',
        requirements: ['Multiple YouTube videos', 'Story sequence', 'Advanced targeting'],
        autoObjective: 'Brand Awareness'
      },
      {
        id: 'audio-reach',
        name: 'Audio Reach',
        description: 'Reach people while they\'re listening to content on YouTube',
        requirements: ['Audio content', 'YouTube channel'],
        autoObjective: 'Brand Awareness'
      }
    ]
  },
  {
    id: 'app',
    name: 'App Campaigns',
    description: 'Promote your app across Google\'s largest properties',
    icon: <Smartphone className="w-8 h-8" />,
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    features: ['App promotion', 'Multi-channel', 'AI optimization'],
    objectives: ['App Promotion'],
    subtypes: [
      {
        id: 'app-installs',
        name: 'App Installs',
        description: 'Get new people to install your app',
        badge: 'recommended',
        requirements: ['App Store/Google Play ID', 'App assets', 'Screenshots'],
        autoObjective: 'App Promotion'
      },
      {
        id: 'app-engagement',
        name: 'App Engagement',
        description: 'Get existing users to take actions in your app (Minimum 50K installs required)',
        requirements: ['App Store/Google Play ID', 'App assets', 'In-app events'],
        autoObjective: 'App Promotion'
      },
      {
        id: 'app-pre-registration',
        name: 'App Pre-registration (Android only)',
        description: 'Get new users to pre-register for your app before launch',
        requirements: ['Google Play Store listing', 'Pre-registration setup'],
        autoObjective: 'App Promotion'
      }
    ]
  },
  {
    id: 'shopping',
    name: 'Shopping Campaigns',
    description: 'Promote your products with rich product information',
    icon: <ShoppingBag className="w-8 h-8" />,
    badge: 'popular',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    features: ['Product images', 'Pricing', 'Store information'],
    objectives: ['Sales'],
    subtypes: [
      {
        id: 'performance-max-shopping',
        name: 'Performance Max Campaign',
        description: 'Get the best of Google\'s automation to reach customers across all channels',
        badge: 'recommended',
        requirements: ['Merchant Center account', 'Product feed', 'High-quality assets'],
        autoObjective: 'Sales'
      },
      {
        id: 'standard-shopping',
        name: 'Standard Shopping Campaign',
        description: 'Pick your products, bid strategy, budget, and targeting. You can show ads on the Google Search Network',
        requirements: ['Merchant Center account', 'Product feed', 'Manual bid management'],
        autoObjective: 'Sales'
      }
    ]
  },
  {
    id: 'demand-gen',
    name: 'Demand Gen',
    description: 'Drive demand and conversions on YouTube, Discover, and Gmail',
    icon: <TrendingUp className="w-8 h-8" />,
    badge: 'advanced',
    color: 'pink',
    gradient: 'from-pink-500 to-pink-600',
    features: ['Visual storytelling', 'Multi-format', 'Social-like experience'],
    objectives: ['Brand Awareness', 'Website Traffic', 'Sales'],
    subtypes: [
      {
        id: 'standard-demand-gen',
        name: 'Standard Demand Gen',
        description: 'Drive demand and conversions on Google\'s most visual, entertaining surfaces',
        badge: 'recommended',
        requirements: ['High-quality images/videos', 'Headlines', 'Descriptions'],
        autoObjective: 'Brand Awareness'
      }
    ]
  },
  {
    id: 'local',
    name: 'Local Campaigns',
    description: 'Drive visits to your physical store locations',
    icon: <MapPin className="w-8 h-8" />,
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600',
    features: ['Store visits', 'Local targeting', 'Multi-channel'],
    objectives: ['Local Store Visits'],
    subtypes: [
      {
        id: 'store-visits',
        name: 'Store Visits',
        description: 'Drive visits to your physical store locations',
        badge: 'recommended',
        requirements: ['Google My Business', 'Store locations', 'Business assets'],
        autoObjective: 'Local Store Visits'
      }
    ]
  },
  {
    id: 'smart',
    name: 'Smart Campaigns',
    description: 'Simple campaign setup with automated optimization',
    icon: <Star className="w-8 h-8" />,
    badge: 'beginner',
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
    features: ['Easy setup', 'Automated', 'Small business friendly'],
    objectives: ['Sales', 'Leads', 'Website Traffic'],
    subtypes: [
      {
        id: 'smart-standard',
        name: 'Smart Campaign',
        description: 'Simple campaign setup with automated optimization across Google properties',
        badge: 'recommended',
        requirements: ['Basic business info', 'Simple assets', 'Goals'],
        autoObjective: 'Sales'
      }
    ]
  }
];

const badgeConfig = {
  best: { 
    icon: <Crown className="w-4 h-4" />, 
    text: 'الأفضل', 
    className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
  },
  popular: { 
    icon: <Award className="w-4 h-4" />, 
    text: 'الأكثر شيوعاً', 
    className: 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
  },
  recommended: { 
    icon: <Star className="w-4 h-4" />, 
    text: 'موصى به', 
    className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
  },
  beginner: { 
    icon: <Target className="w-4 h-4" />, 
    text: 'للمبتدئين', 
    className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
  },
  advanced: { 
    icon: <Sparkles className="w-4 h-4" />, 
    text: 'متقدم', 
    className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
  }
};

interface CampaignTypeSelectorProps {
  onSelect: (campaignType: CampaignType) => void;
  selectedType?: string;
}

export default function CampaignTypeSelector({ onSelect, selectedType }: CampaignTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const handleTypeSelect = (type: CampaignType) => {
    onSelect(type);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <motion.h2 
          className="text-3xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          اختر نوع الحملة الإعلانية
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          اختر نوع الحملة الذي يناسب أهدافك التسويقية ونوع نشاطك التجاري
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {campaignTypes.map((type, index) => (
          <motion.div
            key={type.id}
            className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
              selectedType === type.id 
                ? 'border-blue-500 shadow-xl scale-105' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-xl hover:scale-105'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseEnter={() => setHoveredType(type.id)}
            onMouseLeave={() => setHoveredType(null)}
            onClick={() => handleTypeSelect(type)}
          >
            {/* Badge */}
            {type.badge && (
              <div className="absolute top-3 right-3 z-10">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeConfig[type.badge].className}`}>
                  {badgeConfig[type.badge].icon}
                  <span>{badgeConfig[type.badge].text}</span>
                </div>
              </div>
            )}

            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-5`} />
            
            {/* Content */}
            <div className="relative p-6">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${type.gradient} text-white mb-4`}>
                {type.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {type.name}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {type.description}
              </p>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {type.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${type.gradient}`} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Subtypes Count */}
              {type.subtypes && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Target className="w-4 h-4" />
                  <span>{type.subtypes.length} نوع فرعي متاح</span>
                </div>
              )}

              {/* Hover Effect */}
              <AnimatePresence>
                {hoveredType === type.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {/* Selection Indicator */}
              {selectedType === type.id && (
                <motion.div
                  className="absolute top-3 left-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Type Info */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const selected = campaignTypes.find(t => t.id === selectedType);
              if (!selected) return null;
              
              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${selected.gradient} text-white flex items-center justify-center`}>
                      {selected.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
                      <p className="text-gray-600">{selected.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">المميزات:</h4>
                      <ul className="space-y-1">
                        {selected.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${selected.gradient}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {selected.subtypes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">الأنواع الفرعية:</h4>
                        <ul className="space-y-1">
                          {selected.subtypes.map((subtype, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                              <Target className="w-3 h-3 text-gray-500" />
                              <span>{subtype.name}</span>
                              {subtype.badge && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${badgeConfig[subtype.badge].className}`}>
                                  {badgeConfig[subtype.badge].text}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}