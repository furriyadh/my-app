'use client';

import React, { useState } from 'react';
import { Smartphone, Download, Users, Bell, Search, ExternalLink, Apple, Play } from 'lucide-react';

interface AppCampaignFormProps {
  formData: {
    campaignSubtype: 'app-installs' | 'app-engagement' | 'app-pre-registration' | null;
    appPlatform?: 'android' | 'ios' | null;
    appSearchQuery?: string;
    appStoreUrl?: string;
  };
  onUpdate: (data: any) => void;
  errors?: { [key: string]: string };
}

const AppCampaignForm: React.FC<AppCampaignFormProps> = ({
  formData,
  onUpdate,
  errors = {}
}) => {
  const [searchMode, setSearchMode] = useState<'search' | 'url'>('search');

  const campaignSubtypes = [
    {
      id: 'app-installs',
      name: 'App installs',
      description: 'Get more people to install your app',
      icon: <Download className="w-5 h-5" />,
      badge: 'Most Popular',
      color: 'blue',
      details: 'Drive downloads and installations of your mobile app across Google\'s network',
      requirements: 'Available for both iOS and Android apps'
    },
    {
      id: 'app-engagement',
      name: 'App engagement',
      description: 'Encourage people to take specific actions in your app',
      icon: <Users className="w-5 h-5" />,
      color: 'green',
      details: 'Re-engage existing users and encourage in-app actions like purchases or level completions',
      requirements: 'Requires at least 50,000 app installs in the last 30 days'
    },
    {
      id: 'app-pre-registration',
      name: 'App pre-registration (Android only)',
      description: 'Get people to pre-register for your app before it launches',
      icon: <Bell className="w-5 h-5" />,
      color: 'purple',
      details: 'Build anticipation and collect pre-registrations for your upcoming Android app',
      requirements: 'Only available for Android apps not yet released'
    }
  ];

  const colorClasses = {
    blue: 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20',
    purple: 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20'
  };

  return (
    <div className="space-y-6">
      {/* Campaign Subtype Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                name="appSubtype"
                value={subtype.id}
                checked={formData.campaignSubtype === subtype.id}
                onChange={(e) => onUpdate({
                  ...formData,
                  campaignSubtype: e.target.value as any
                })}
                className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500 mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${formData.campaignSubtype === subtype.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {subtype.icon}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {subtype.name}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {subtype.description}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                  {subtype.details}
                </p>

                <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 inline-block">
                  {subtype.requirements}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* App Lookup Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Look up your app
        </h3>

        {/* Search Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSearchMode('search')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchMode === 'search'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search by name
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('url')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchMode === 'url'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ExternalLink className="w-4 h-4 inline mr-2" />
            Enter store URL
          </button>
        </div>

        {searchMode === 'search' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                App name
              </label>
              <input
                type="text"
                value={formData.appSearchQuery || ''}
                onChange={(e) => onUpdate({
                  ...formData,
                  appSearchQuery: e.target.value
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.appSearch ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Search for your app by name..."
              />
              {errors.appSearch && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.appSearch}</p>
              )}
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select your mobile app's platform
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.appPlatform === 'android'
                    ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="appPlatform"
                    value="android"
                    checked={formData.appPlatform === 'android'}
                    onChange={(e) => onUpdate({
                      ...formData,
                      appPlatform: e.target.value as 'android'
                    })}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <Play className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Android</span>
                </label>

                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.appPlatform === 'ios'
                    ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="appPlatform"
                    value="ios"
                    checked={formData.appPlatform === 'ios'}
                    onChange={(e) => onUpdate({
                      ...formData,
                      appPlatform: e.target.value as 'ios'
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Apple className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">iOS</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              App Store URL
            </label>
            <input
              type="url"
              value={formData.appStoreUrl || ''}
              onChange={(e) => onUpdate({
                ...formData,
                appStoreUrl: e.target.value
              })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.appStoreUrl ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="https://play.google.com/store/apps/details?id=... or https://apps.apple.com/app/..."
            />
            {errors.appStoreUrl && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.appStoreUrl}</p>
            )}
          </div>
        )}
      </div>

      {/* App Campaign Tips */}
      {formData.campaignSubtype && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
            {campaignSubtypes.find(s => s.id === formData.campaignSubtype)?.name} Best Practices
          </h4>
          <div className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
            {formData.campaignSubtype === 'app-installs' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Optimize your app store listing with compelling screenshots and descriptions</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Use app install tracking to measure campaign performance</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Target users likely to find value in your app's core features</span>
                </div>
              </>
            )}
            {formData.campaignSubtype === 'app-engagement' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Set up in-app event tracking for better optimization</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Create compelling creative assets that showcase app features</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Target users who haven't used your app recently</span>
                </div>
              </>
            )}
            {formData.campaignSubtype === 'app-pre-registration' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Build excitement with teaser content and exclusive previews</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Highlight unique features that differentiate your app</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <span>Plan your launch campaign to convert pre-registrations</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppCampaignForm;