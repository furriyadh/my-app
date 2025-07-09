'use client';

import React from 'react';
import { Play, Eye, Users, Target, Film, Volume2, Youtube } from 'lucide-react';

interface VideoCampaignFormProps {
  formData: {
    campaignSubtype: 'video-views' | 'video-reach' | 'drive-conversions' | 'ad-sequence' | 'audio-reach' | null;
    videoReachType?: 'efficient-reach' | 'non-skippable-reach' | 'target-frequency' | null;
  };
  onUpdate: (data: any) => void;
  errors?: { [key: string]: string };
}

const VideoCampaignForm: React.FC<VideoCampaignFormProps> = ({
  formData,
  onUpdate,
  errors = {}
}) => {
  const campaignSubtypes = [
    {
      id: 'video-views',
      name: 'Video views',
      description: 'Get more views for your video content',
      icon: <Eye className="w-5 h-5" />,
      badge: 'Most Popular',
      color: 'blue',
      details: 'Ideal for building brand awareness and reaching a broad audience with your video content'
    },
    {
      id: 'video-reach',
      name: 'Video reach',
      description: 'Reach a broad audience with your video',
      icon: <Users className="w-5 h-5" />,
      color: 'green',
      details: 'Maximize the number of unique people who see your video ads',
      hasSuboptions: true
    },
    {
      id: 'drive-conversions',
      name: 'Drive conversions',
      description: 'Encourage people to take action on your website',
      icon: <Target className="w-5 h-5" />,
      color: 'purple',
      details: 'Focus on getting viewers to complete specific actions like purchases or sign-ups'
    },
    {
      id: 'ad-sequence',
      name: 'Ad sequence',
      description: 'Tell your story through a series of videos',
      icon: <Film className="w-5 h-5" />,
      color: 'orange',
      details: 'Create a narrative by showing multiple videos to the same audience in a specific order'
    },
    {
      id: 'audio-reach',
      name: 'Audio reach',
      description: 'Reach people with audio ads',
      icon: <Volume2 className="w-5 h-5" />,
      color: 'teal',
      details: 'Reach audiences through audio-only ads on YouTube and other Google properties'
    }
  ];

  const videoReachOptions = [
    {
      id: 'efficient-reach',
      name: 'Efficient reach',
      description: 'Reach the most people at the lowest cost'
    },
    {
      id: 'non-skippable-reach',
      name: 'Non-skippable reach',
      description: 'Ensure your entire message is seen'
    },
    {
      id: 'target-frequency',
      name: 'Target frequency',
      description: 'Control how often people see your ad'
    }
  ];

  const colorClasses = {
    blue: 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    teal: 'border-teal-300 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
  };

  return (
    <div className="space-y-6">
      {/* Campaign Subtype Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Play className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select a campaign subtype
          </h3>
        </div>

        {errors.campaignSubtype && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{errors.campaignSubtype}</p>
          </div>
        )}

        <div className="space-y-4">
          {campaignSubtypes.map((subtype) => (
            <label 
              key={subtype.id}
              className={`relative flex items-start space-x-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.campaignSubtype === subtype.id
                  ? colorClasses[subtype.color as keyof typeof colorClasses]
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Badge */}
              {subtype.badge && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {subtype.badge}
                  </span>
                </div>
              )}

              <input
                type="radio"
                name="videoSubtype"
                value={subtype.id}
                checked={formData.campaignSubtype === subtype.id}
                onChange={(e) => onUpdate({
                  ...formData,
                  campaignSubtype: e.target.value as any,
                  videoReachType: e.target.value === 'video-reach' ? formData.videoReachType : null
                })}
                className="w-5 h-5 text-red-600 border-gray-300 focus:ring-red-500 mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${formData.campaignSubtype === subtype.id ? '' : 'text-gray-500 dark:text-gray-400'}`}>
                    {subtype.icon}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {subtype.name}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {subtype.description}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {subtype.details}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Video Reach Sub-options */}
      {formData.campaignSubtype === 'video-reach' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Choose your reach strategy
          </h3>
          
          <div className="space-y-3">
            {videoReachOptions.map((option) => (
              <label 
                key={option.id}
                className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.videoReachType === option.id
                    ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="videoReachType"
                  value={option.id}
                  checked={formData.videoReachType === option.id}
                  onChange={(e) => onUpdate({
                    ...formData,
                    videoReachType: e.target.value as any
                  })}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 mt-1"
                />
                
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {option.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Video Requirements */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Youtube className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">
              Video Requirements
            </h4>
            <div className="space-y-2 text-sm text-red-800 dark:text-red-200">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                <span>Upload your video to YouTube first (public or unlisted)</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                <span>Video should be at least 12 seconds long for most campaign types</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                <span>Use high-quality video with clear audio and engaging content</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                <span>Consider mobile viewing - most YouTube views happen on mobile devices</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance Tips */}
      {formData.campaignSubtype && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Tips for {campaignSubtypes.find(s => s.id === formData.campaignSubtype)?.name}
          </h4>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {formData.campaignSubtype === 'video-views' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <span>Create compelling thumbnails to increase click-through rates</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <span>Hook viewers in the first 5 seconds to reduce skip rates</span>
                </div>
              </>
            )}
            {formData.campaignSubtype === 'drive-conversions' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Include clear calls-to-action in your video</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Set up conversion tracking for better optimization</span>
                </div>
              </>
            )}
            {formData.campaignSubtype === 'ad-sequence' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span>Plan your story arc across multiple videos</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span>Each video should work standalone while building the narrative</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCampaignForm;

