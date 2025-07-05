'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Search, Globe, Smartphone, ShoppingBag, Zap, TrendingUp, MapPin, Youtube, CheckCircle } from 'lucide-react';

// Types
interface AdType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  bestFor: string;
  color: string;
}

interface CampaignFormData {
  name: string;
  websiteUrl: string;
  type: string | null;
}

// Campaign Steps for Progress Indicator
const campaignSteps = [
  { id: 1, name: 'Basic Info & Ad Type', description: 'Campaign details and advertisement type' },
  { id: 2, name: 'Location Targeting', description: 'Geographic and demographic targeting' },
  { id: 3, name: 'Budget & Bidding', description: 'Budget settings and bidding strategy' },
  { id: 4, name: 'Review & Launch', description: 'Final review and campaign launch' }
];

// Ad Types Data (8 types)
const adTypes: AdType[] = [
  {
    id: 'search',
    name: 'Search Ads',
    description: 'Appear in Google search results when users search for relevant keywords',
    icon: <Search className="w-8 h-8" />,
    features: ['Text-based ads', 'Keyword targeting', 'High intent traffic', 'Call Ads'],
    bestFor: 'Capturing users actively searching for your products/services, Call Ads',
    color: 'blue'
  },
  {
    id: 'display',
    name: 'Display Network Ads',
    description: 'Visual ads that appear on websites and apps across Google\'s network',
    icon: <Globe className="w-8 h-8" />,
    features: ['Image and banner ads', 'Wide reach', 'Brand awareness'],
    bestFor: 'Building brand awareness and reaching new audiences',
    color: 'green'
  },
  {
    id: 'youtube',
    name: 'YouTube Ads',
    description: 'Comprehensive video advertising on YouTube platform with multiple formats',
    icon: <Youtube className="w-8 h-8" />,
    features: ['Skippable/non-skippable videos', 'YouTube-specific targeting', 'Creator partnerships', 'Multiple video formats'],
    bestFor: 'Video content creators, brand storytelling, and engaging visual campaigns',
    color: 'red'
  },
  {
    id: 'app',
    name: 'App Promotion Ads',
    description: 'Promote your mobile apps across Google Play and other platforms',
    icon: <Smartphone className="w-8 h-8" />,
    features: ['App install campaigns', 'Cross-platform reach', 'App engagement'],
    bestFor: 'Increasing app downloads and user engagement',
    color: 'purple'
  },
  {
    id: 'shopping',
    name: 'Shopping Ads',
    description: 'Product listings with images, prices, and merchant information',
    icon: <ShoppingBag className="w-8 h-8" />,
    features: ['Product images', 'Price display', 'Direct to product'],
    bestFor: 'E-commerce businesses selling physical products',
    color: 'orange'
  },
  {
    id: 'smart',
    name: 'Smart Campaigns',
    description: 'AI-powered campaigns that automatically optimize performance',
    icon: <Zap className="w-8 h-8" />,
    features: ['AI optimization', 'Automated bidding', 'Multi-channel reach'],
    bestFor: 'Small businesses wanting automated campaign management',
    color: 'yellow'
  },
  {
    id: 'performance-max',
    name: 'Performance Max',
    description: 'Goal-based campaigns across all Google channels for maximum performance',
    icon: <TrendingUp className="w-8 h-8" />,
    features: ['All Google channels', 'Goal optimization', 'Asset-based'],
    bestFor: 'Maximizing conversions across all Google properties',
    color: 'indigo'
  },
  {
    id: 'local',
    name: 'Local Service Ads',
    description: 'Promote local businesses on Google Maps and local search results',
    icon: <MapPin className="w-8 h-8" />,
    features: ['Google Maps placement', 'Local targeting', 'Business verification'],
    bestFor: 'Local businesses and service providers',
    color: 'teal'
  }
];

// Color variants for cards
const colorVariants = {
  blue: 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
  green: 'border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 bg-green-50 dark:bg-green-900/20',
  red: 'border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 bg-red-50 dark:bg-red-900/20',
  purple: 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 bg-purple-50 dark:bg-purple-900/20',
  orange: 'border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 bg-orange-50 dark:bg-orange-900/20',
  yellow: 'border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
  indigo: 'border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20',
  teal: 'border-teal-200 dark:border-teal-800 hover:border-teal-300 dark:hover:border-teal-700 bg-teal-50 dark:bg-teal-900/20'
};

const iconColorVariants = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  red: 'text-red-600 dark:text-red-400',
  purple: 'text-purple-600 dark:text-purple-400',
  orange: 'text-orange-600 dark:text-orange-400',
  yellow: 'text-yellow-600 dark:text-yellow-400',
  indigo: 'text-indigo-600 dark:text-indigo-400',
  teal: 'text-teal-600 dark:text-teal-400'
};

const CampaignNewPage: React.FC = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    websiteUrl: '',
    type: null
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    } else if (!formData.websiteUrl.startsWith('https://')) {
      newErrors.websiteUrl = 'URL must start with https://';
    }

    if (!formData.type) {
      newErrors.type = 'Please select an ad type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle next step
  const handleNext = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Save data to localStorage or context
      localStorage.setItem('campaignData', JSON.stringify(formData));
      
      // Navigate to next step
      router.push('/campaign/location-targeting');
    } catch (error) {
      console.error('Error saving campaign data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Campaign</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Build your advertising campaign step by step</p>
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Campaign Setup Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete each step to launch your campaign</p>
          </div>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500" style={{width: '25%'}}></div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {campaignSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step.id === 1 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.id === 1 ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className="mt-3 text-center max-w-32">
                    <div className={`text-sm font-medium ${
                      step.id === 1 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-tight">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter campaign name"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.websiteUrl ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="https://example.com"
              />
              {errors.websiteUrl && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.websiteUrl}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ad Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Choose Ad Type</h2>
            <p className="text-gray-600 dark:text-gray-400">Select the type of advertisement that best fits your campaign goals</p>
          </div>

          {errors.type && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{errors.type}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adTypes.map((adType) => (
              <div
                key={adType.id}
                onClick={() => handleInputChange('type', adType.id)}
                className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                  formData.type === adType.id 
                    ? `${colorVariants[adType.color as keyof typeof colorVariants]} border-opacity-100` 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                {/* Selection indicator */}
                {formData.type === adType.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`mb-4 ${iconColorVariants[adType.color as keyof typeof iconColorVariants]}`}>
                  {adType.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {adType.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {adType.description}
                </p>

                {/* Best For */}
                <div className="mb-4">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Best For:
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {adType.bestFor}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {adType.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </button>
          
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CampaignNewPage;

