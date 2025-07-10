'use client';

import React from 'react';
import { Monitor, Mail, Smartphone, Image, Target, Users } from 'lucide-react';

interface DisplayCampaignFormProps {
  formData: {
    displayType?: 'standard' | 'gmail' | 'mobile-app' | null;
  };
  onUpdate: (data: any) => void;
  errors?: { [key: string]: string };
}

const DisplayCampaignForm: React.FC<DisplayCampaignFormProps> = ({
  formData,
  onUpdate,
  errors = {}
}) => {
  const displayTypes = [
    {
      id: 'standard',
      name: 'Standard Display',
      description: 'Show image and text ads on websites and apps that partner with Google',
      icon: <Monitor className="w-6 h-6" />,
      color: 'blue',
      badge: 'Most Popular',
      features: [
        'Reach over 2 million websites',
        'Multiple ad formats available',
        'Audience targeting options',
        'Remarketing capabilities'
      ],
      details: 'Perfect for building brand awareness and reaching potential customers while they browse the web'
    },
    {
      id: 'gmail',
      name: 'Gmail Campaigns',
      description: 'Show ads in Gmail promotions and social tabs',
      icon: <Mail className="w-6 h-6" />,
      color: 'red',
      features: [
        'Native Gmail integration',
        'Interactive ad formats',
        'High engagement rates',
        'Mobile-optimized'
      ],
      details: 'Reach customers directly in their Gmail inbox with engaging, expandable ads'
    },
    {
      id: 'mobile-app',
      name: 'Mobile App Promotion',
      description: 'Promote your mobile app across the Google Display Network',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'purple',
      features: [
        'App install campaigns',
        'In-app engagement',
        'Cross-platform reach',
        'App store optimization'
      ],
      details: 'Drive app downloads and engagement through targeted display advertising'
    }
  ];

  const colorClasses = {
    blue: 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20',
    red: 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20',
    purple: 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20'
  };

  const iconColors = {
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="space-y-6">
      {/* Display Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Monitor className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose your display campaign type
          </h3>
        </div>

        {errors.displayType && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{errors.displayType}</p>
          </div>
        )}

        <div className="space-y-4">
          {displayTypes.map((type) => (
            <label 
              key={type.id}
              className={`relative flex items-start space-x-4 p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.displayType === type.id
                  ? colorClasses[type.color as keyof typeof colorClasses]
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Badge */}
              {type.badge && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {type.badge}
                  </span>
                </div>
              )}

              <input
                type="radio"
                name="displayType"
                value={type.id}
                checked={formData.displayType === type.id}
                onChange={(e) => onUpdate({
                  ...formData,
                  displayType: e.target.value as any
                })}
                className={`w-5 h-5 border-gray-300 focus:ring-2 mt-1 ${
                  type.color === 'blue' ? 'text-blue-600 focus:ring-blue-500' :
                  type.color === 'red' ? 'text-red-600 focus:ring-red-500' :
                  'text-purple-600 focus:ring-purple-500'
                }`}
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${
                    formData.displayType === type.id
                      ? iconColors[type.color as keyof typeof iconColors]
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {type.icon}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">
                    {type.name}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {type.description}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  {type.details}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {type.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        type.color === 'blue' ? 'bg-blue-500' :
                        type.color === 'red' ? 'bg-red-500' :
                        'bg-purple-500'
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

      {/* Campaign Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Campaign Goals
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Brand Awareness & Reach</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Display campaigns are optimized to increase brand visibility and reach potential customers
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Format Information */}
      {formData.displayType && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Image className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                Available Ad Formats
              </h4>
              <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                {formData.displayType === 'standard' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                      <span><strong>Responsive Display Ads:</strong> Automatically adjust to fit available ad spaces</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                      <span><strong>Image Ads:</strong> Static banner ads in various sizes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                      <span><strong>Rich Media Ads:</strong> Interactive ads with animations and video</span>
                    </div>
                  </>
                )}
                {formData.displayType === 'gmail' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                      <span><strong>Gmail Promotions:</strong> Collapsed ads that expand when clicked</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                      <span><strong>Interactive Content:</strong> Forms, videos, and product catalogs</span>
                    </div>
                  </>
                )}
                {formData.displayType === 'mobile-app' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                      <span><strong>App Install Ads:</strong> Direct links to app stores</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                      <span><strong>App Engagement Ads:</strong> Deep links to specific app features</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tips */}
      {formData.displayType && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-gray-600 dark:text-gray-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Tips for Better Performance
              </h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                  <span>Use high-quality, eye-catching images that represent your brand</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                  <span>Create multiple ad variations to test what works best</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                  <span>Use audience targeting to reach people interested in your products</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2"></div>
                  <span>Set up remarketing to re-engage previous website visitors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayCampaignForm;