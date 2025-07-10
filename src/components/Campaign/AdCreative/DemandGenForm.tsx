'use client';

import React from 'react';
import { Globe, Image, Video, Users, TrendingUp, Target } from 'lucide-react';

interface DemandGenFormProps {
  formData: {
    campaignFormat?: 'standard' | 'carousel' | null;
  };
  onUpdate: (data: any) => void;
  errors?: { [key: string]: string };
}

const DemandGenForm: React.FC<DemandGenFormProps> = ({
  formData,
  onUpdate,
  errors = {}
}) => {
  const campaignFormats = [
    {
      id: 'standard',
      name: 'Standard Demand Gen',
      description: 'Drive demand with visually engaging ads across Google\'s most inspiring surfaces',
      icon: <Image className="w-6 h-6" />,
      color: 'teal',
      badge: 'Recommended',
      features: [
        'YouTube Shorts and In-Feed',
        'Discover Feed placement',
        'Gmail Promotions tab',
        'AI-powered optimization'
      ],
      details: 'Reach customers when they\'re discovering new content and ready to engage with your brand'
    },
    {
      id: 'carousel',
      name: 'Carousel Format',
      description: 'Showcase multiple products or features in a single swipeable ad',
      icon: <Video className="w-6 h-6" />,
      color: 'indigo',
      badge: 'New',
      features: [
        'Multiple product showcase',
        'Interactive swipe experience',
        'Enhanced storytelling',
        'Higher engagement rates'
      ],
      details: 'Perfect for e-commerce brands wanting to highlight product variety and drive consideration'
    }
  ];

  const colorClasses = {
    teal: 'border-teal-300 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20',
    indigo: 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
  };

  const iconColors = {
    teal: 'text-teal-600 dark:text-teal-400',
    indigo: 'text-indigo-600 dark:text-indigo-400'
  };

  return (
    <div className="space-y-6">
      {/* Campaign Format Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select your Demand Gen format
          </h3>
        </div>

        {errors.campaignFormat && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{errors.campaignFormat}</p>
          </div>
        )}

        <div className="space-y-4">
          {campaignFormats.map((format) => (
            <label 
              key={format.id}
              className={`relative flex items-start space-x-4 p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.campaignFormat === format.id
                  ? colorClasses[format.color as keyof typeof colorClasses]
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Badge */}
              {format.badge && (
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    format.badge === 'Recommended' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {format.badge}
                  </span>
                </div>
              )}

              <input
                type="radio"
                name="campaignFormat"
                value={format.id}
                checked={formData.campaignFormat === format.id}
                onChange={(e) => onUpdate({
                  ...formData,
                  campaignFormat: e.target.value as any
                })}
                className={`w-5 h-5 border-gray-300 focus:ring-2 mt-1 ${
                  format.color === 'teal' 
                    ? 'text-teal-600 focus:ring-teal-500' 
                    : 'text-indigo-600 focus:ring-indigo-500'
                }`}
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${
                    formData.campaignFormat === format.id
                      ? iconColors[format.color as keyof typeof iconColors]
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {format.icon}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">
                    {format.name}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {format.description}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  {format.details}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {format.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        format.color === 'teal' ? 'bg-teal-500' : 'bg-indigo-500'
                      }`}></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Placement Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Where your ads will appear
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Video className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="font-medium text-red-900 dark:text-red-100">YouTube</div>
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              Shorts, In-Feed, and In-Stream placements
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="font-medium text-blue-900 dark:text-blue-100">Discover</div>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Google Discover feed placements
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="font-medium text-green-900 dark:text-green-100">Gmail</div>
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Promotions and Social tabs
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Benefits */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Target className="w-6 h-6 text-teal-600 dark:text-teal-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-3">
              Why Choose Demand Gen?
            </h4>
            <div className="space-y-2 text-sm text-teal-800 dark:text-teal-200">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                <span><strong>Visual Storytelling:</strong> Reach customers with compelling visual content across Google's most engaging surfaces</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                <span><strong>AI-Powered Optimization:</strong> Google's machine learning finds the best audiences and placements for your goals</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                <span><strong>Discovery Mindset:</strong> Reach people when they're open to discovering new products and brands</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                <span><strong>Cross-Platform Reach:</strong> One campaign reaches customers across YouTube, Discover, and Gmail</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creative Requirements */}
      {formData.campaignFormat && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-gray-600 dark:text-gray-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Creative Requirements for {formData.campaignFormat === 'standard' ? 'Standard' : 'Carousel'} Format
              </h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {formData.campaignFormat === 'standard' ? (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                      <span>High-quality images (1200x628px recommended)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                      <span>Compelling headlines (up to 40 characters)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                      <span>Engaging descriptions (up to 90 characters)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                      <span>Multiple product images (3-10 cards recommended)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                      <span>Individual headlines for each card</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                      <span>Consistent branding across all cards</span>
                    </div>
                  </>
                )}
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                  <span>Clear call-to-action buttons</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                  <span>Mobile-optimized design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandGenForm;