'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Eye,
  ShoppingBag,
  Play,
  Zap,
  Target,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Globe,
  Info,
  HelpCircle
} from 'lucide-react';

const BasicInfo = ({ data, updateData, errors, onValidate }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Campaign types with their objectives
  const campaignTypes = {
    SEARCH: {
      name: 'Search',
      description: 'Show ads when people search for your products or services',
      icon: <Search className="w-6 h-6" />,
      color: 'blue',
      objectives: [
        {
          id: 'WEBSITE_TRAFFIC',
          name: 'Website Traffic',
          description: 'Drive visitors to your website',
          icon: <Globe className="w-5 h-5" />
        },
        {
          id: 'LEADS',
          name: 'Leads',
          description: 'Get people to take action on your site',
          icon: <Mail className="w-5 h-5" />
        },
        {
          id: 'SALES',
          name: 'Sales',
          description: 'Drive online or offline sales',
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          id: 'BRAND_AWARENESS',
          name: 'Brand Awareness',
          description: 'Increase awareness of your brand',
          icon: <Eye className="w-5 h-5" />
        }
      ]
    },
    DISPLAY: {
      name: 'Display',
      description: 'Show visual ads across the Google Display Network',
      icon: <Eye className="w-6 h-6" />,
      color: 'green',
      objectives: [
        {
          id: 'BRAND_AWARENESS',
          name: 'Brand Awareness',
          description: 'Reach people who might be interested in your brand',
          icon: <Eye className="w-5 h-5" />
        },
        {
          id: 'WEBSITE_TRAFFIC',
          name: 'Website Traffic',
          description: 'Drive visitors to your website',
          icon: <Globe className="w-5 h-5" />
        },
        {
          id: 'LEADS',
          name: 'Leads',
          description: 'Get people to take action on your site',
          icon: <Mail className="w-5 h-5" />
        },
        {
          id: 'SALES',
          name: 'Sales',
          description: 'Drive online or offline sales',
          icon: <TrendingUp className="w-5 h-5" />
        }
      ]
    },
    VIDEO: {
      name: 'Video',
      description: 'Show video ads on YouTube and across the web',
      icon: <Play className="w-6 h-6" />,
      color: 'red',
      objectives: [
        {
          id: 'BRAND_AWARENESS',
          name: 'Brand Awareness',
          description: 'Reach a broad audience and build awareness',
          icon: <Eye className="w-5 h-5" />
        },
        {
          id: 'WEBSITE_TRAFFIC',
          name: 'Website Traffic',
          description: 'Drive traffic to your website',
          icon: <Globe className="w-5 h-5" />
        },
        {
          id: 'LEADS',
          name: 'Leads',
          description: 'Get people to take action',
          icon: <Mail className="w-5 h-5" />
        },
        {
          id: 'PRODUCT_CONSIDERATION',
          name: 'Product Consideration',
          description: 'Get people to consider your products',
          icon: <Target className="w-5 h-5" />
        }
      ]
    },
    SHOPPING: {
      name: 'Shopping',
      description: 'Promote your products with rich product information',
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'orange',
      objectives: [
        {
          id: 'SALES',
          name: 'Sales',
          description: 'Drive online and offline sales',
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          id: 'WEBSITE_TRAFFIC',
          name: 'Website Traffic',
          description: 'Drive traffic to your online store',
          icon: <Globe className="w-5 h-5" />
        },
        {
          id: 'LOCAL_STORE_VISITS',
          name: 'Local Store Visits',
          description: 'Drive visits to your physical stores',
          icon: <MapPin className="w-5 h-5" />
        }
      ]
    },
    PERFORMANCE_MAX: {
      name: 'Performance Max',
      description: 'Reach customers across all Google properties with AI',
      icon: <Zap className="w-6 h-6" />,
      color: 'purple',
      objectives: [
        {
          id: 'SALES',
          name: 'Sales',
          description: 'Drive online and offline sales',
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          id: 'LEADS',
          name: 'Leads',
          description: 'Generate leads for your business',
          icon: <Mail className="w-5 h-5" />
        },
        {
          id: 'WEBSITE_TRAFFIC',
          name: 'Website Traffic',
          description: 'Drive quality traffic to your website',
          icon: <Globe className="w-5 h-5" />
        }
      ]
    }
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    updateData({ [field]: value });
  };

  // Handle campaign type change
  const handleCampaignTypeChange = (type) => {
    updateData({ 
      campaignType: type,
      objective: '' // Reset objective when campaign type changes
    });
  };

  // Get available objectives for selected campaign type
  const getAvailableObjectives = () => {
    if (!data.campaignType || !campaignTypes[data.campaignType]) {
      return [];
    }
    return campaignTypes[data.campaignType].objectives;
  };

  // Generate campaign name suggestions
  const generateCampaignNameSuggestions = () => {
    if (!data.campaignType || !data.objective) return [];
    
    const type = campaignTypes[data.campaignType]?.name || '';
    const objective = getAvailableObjectives().find(obj => obj.id === data.objective)?.name || '';
    const date = new Date().toISOString().split('T')[0];
    
    return [
      `${type} - ${objective} - ${date}`,
      `${objective} Campaign - ${type}`,
      `${type} ${objective} ${new Date().getFullYear()}`,
      `New ${type} Campaign - ${objective}`
    ];
  };

  const campaignNameSuggestions = generateCampaignNameSuggestions();

  return (
    <div className="space-y-8">
      {/* Campaign Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Campaign Name *
        </label>
        <input
          type="text"
          value={data.campaignName || ''}
          onChange={(e) => handleFieldChange('campaignName', e.target.value)}
          placeholder="Enter a descriptive name for your campaign"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:border-gray-600 dark:text-gray-800 ${
            errors.campaignName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.campaignName && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.campaignName}</p>
        )}
        
        {/* Campaign Name Suggestions */}
        {campaignNameSuggestions.length > 0 && !data.campaignName && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {campaignNameSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleFieldChange('campaignName', suggestion)}
                  className="px-2 py-1 text-xs bg-white/15 backdrop-blur-md border border-blue-200/30 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Campaign Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Campaign Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(campaignTypes).map(([typeKey, type]) => (
            <div
              key={typeKey}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.campaignType === typeKey
                  ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleCampaignTypeChange(typeKey)}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                  data.campaignType === typeKey
                    ? `bg-${type.color}-500 text-gray-800`
                    : 'bg-white/15 backdrop-blur-md border border-blue-200/30 text-gray-600 dark:text-gray-300'
                }`}>
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    data.campaignType === typeKey
                      ? `text-${type.color}-900 dark:text-${type.color}-100`
                      : 'text-gray-900 dark:text-gray-800'
                  }`}>
                    {type.name}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    data.campaignType === typeKey
                      ? `text-${type.color}-700 dark:text-${type.color}-300`
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {type.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.campaignType && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.campaignType}</p>
        )}
      </div>

      {/* Campaign Objective */}
      {data.campaignType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Campaign Objective *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getAvailableObjectives().map((objective) => (
              <div
                key={objective.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  data.objective === objective.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleFieldChange('objective', objective.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    data.objective === objective.id
                      ? 'bg-blue-500 text-gray-800'
                      : 'bg-white/15 backdrop-blur-md border border-blue-200/30 text-gray-600 dark:text-gray-300'
                  }`}>
                    {objective.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${
                      data.objective === objective.id
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-gray-800'
                    }`}>
                      {objective.name}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      data.objective === objective.id
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {objective.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.objective && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.objective}</p>
          )}
        </motion.div>
      )}

      {/* Campaign Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Campaign Description
          <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(Optional)</span>
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Describe your campaign goals and target audience..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:text-gray-800"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This description is for your reference and won't be shown to customers.
        </p>
      </div>

      {/* Advanced Settings Toggle */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <span>Advanced Settings</span>
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 p-4 bg-white/10 backdrop-blur-md border border-blue-200/20 rounded-lg"
          >
            {/* Campaign URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Final URL
              </label>
              <input
                type="url"
                value={data.finalUrl || ''}
                onChange={(e) => handleFieldChange('finalUrl', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:text-gray-800"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                The URL where people will land when they click your ad.
              </p>
            </div>

            {/* Campaign Start Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={data.startDate || ''}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                  <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={data.endDate || ''}
                  onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  min={data.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:text-gray-800"
                />
              </div>
            </div>

            {/* Campaign Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Priority
              </label>
              <select
                value={data.priority || 'NORMAL'}
                onChange={(e) => handleFieldChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:text-gray-800"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Set the priority for this campaign relative to other campaigns.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Campaign Summary */}
      {data.campaignType && data.objective && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              {campaignTypes[data.campaignType].icon}
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                Campaign Summary
              </h4>
              <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                <p>
                  <span className="font-medium">Type:</span> {campaignTypes[data.campaignType].name}
                </p>
                <p>
                  <span className="font-medium">Objective:</span> {
                    getAvailableObjectives().find(obj => obj.id === data.objective)?.name
                  }
                </p>
                {data.campaignName && (
                  <p>
                    <span className="font-medium">Name:</span> {data.campaignName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Help Section */}
      <div className="bg-white/10 backdrop-blur-md border border-blue-200/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-800">
              Campaign Setup Tips
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li>• Choose a descriptive campaign name that reflects your goals</li>
              <li>• Select the campaign type that best matches where you want to show ads</li>
              <li>• Pick an objective that aligns with your business goals</li>
              <li>• Consider your target audience when choosing campaign type and objective</li>
              <li>• You can always modify these settings later if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;

