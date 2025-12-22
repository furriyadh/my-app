'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  Info,
  AlertCircle,
  Calculator,
  Clock,
  Percent,
  HelpCircle
} from 'lucide-react';

const BudgetSettings = ({ data, updateData, errors, onValidate }) => {
  const [budgetRecommendations, setBudgetRecommendations] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Bidding strategies configuration
  const biddingStrategies = [
    {
      id: 'MAXIMIZE_CLICKS',
      name: 'Maximize Clicks',
      description: 'Get as many clicks as possible within your budget',
      icon: <Target className="w-5 h-5" />,
      bestFor: 'Driving website traffic',
      level: 'Beginner',
      requiresTarget: false,
      color: 'blue'
    },
    {
      id: 'MAXIMIZE_CONVERSIONS',
      name: 'Maximize Conversions',
      description: 'Get as many conversions as possible within your budget',
      icon: <TrendingUp className="w-5 h-5" />,
      bestFor: 'Driving conversions',
      level: 'Intermediate',
      requiresTarget: false,
      color: 'green'
    },
    {
      id: 'TARGET_CPA',
      name: 'Target CPA',
      description: 'Set a target cost per acquisition',
      icon: <DollarSign className="w-5 h-5" />,
      bestFor: 'Controlling cost per conversion',
      level: 'Advanced',
      requiresTarget: true,
      targetField: 'targetCpa',
      targetLabel: 'Target CPA',
      color: 'purple'
    },
    {
      id: 'TARGET_ROAS',
      name: 'Target ROAS',
      description: 'Set a target return on ad spend',
      icon: <Percent className="w-5 h-5" />,
      bestFor: 'Maximizing revenue',
      level: 'Advanced',
      requiresTarget: true,
      targetField: 'targetRoas',
      targetLabel: 'Target ROAS',
      color: 'orange'
    },
    {
      id: 'MANUAL_CPC',
      name: 'Manual CPC',
      description: 'Set your own maximum cost-per-click bids',
      icon: <Calculator className="w-5 h-5" />,
      bestFor: 'Full control over bids',
      level: 'Expert',
      requiresTarget: false,
      color: 'gray'
    }
  ];

  // Calculate budget recommendations
  useEffect(() => {
    if (data.campaignType && data.objective) {
      generateBudgetRecommendations();
    }
  }, [data.campaignType, data.objective]);

  const generateBudgetRecommendations = () => {
    // Simulate budget recommendations based on campaign type and objective
    const recommendations = {
      SEARCH: {
        WEBSITE_TRAFFIC: { min: 10, recommended: 25, max: 100 },
        LEADS: { min: 20, recommended: 50, max: 200 },
        SALES: { min: 30, recommended: 75, max: 300 },
        BRAND_AWARENESS: { min: 15, recommended: 40, max: 150 }
      },
      DISPLAY: {
        BRAND_AWARENESS: { min: 5, recommended: 15, max: 75 },
        WEBSITE_TRAFFIC: { min: 8, recommended: 20, max: 100 },
        LEADS: { min: 12, recommended: 30, max: 150 },
        SALES: { min: 20, recommended: 50, max: 250 }
      },
      VIDEO: {
        BRAND_AWARENESS: { min: 10, recommended: 30, max: 150 },
        WEBSITE_TRAFFIC: { min: 15, recommended: 35, max: 175 },
        LEADS: { min: 20, recommended: 45, max: 200 },
        PRODUCT_CONSIDERATION: { min: 18, recommended: 40, max: 180 }
      },
      SHOPPING: {
        SALES: { min: 25, recommended: 60, max: 300 },
        WEBSITE_TRAFFIC: { min: 15, recommended: 35, max: 175 },
        LOCAL_STORE_VISITS: { min: 20, recommended: 45, max: 200 }
      },
      PERFORMANCE_MAX: {
        SALES: { min: 30, recommended: 80, max: 400 },
        LEADS: { min: 25, recommended: 65, max: 300 },
        WEBSITE_TRAFFIC: { min: 20, recommended: 50, max: 250 }
      }
    };

    const campaignRec = recommendations[data.campaignType];
    if (campaignRec && campaignRec[data.objective]) {
      setBudgetRecommendations(campaignRec[data.objective]);
    }
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    updateData({ [field]: value });
  };

  // Handle bidding strategy change
  const handleBiddingStrategyChange = (strategy) => {
    const updates = { bidStrategy: strategy };
    
    // Reset target values when changing strategy
    if (strategy !== 'TARGET_CPA') {
      updates.targetCpa = 0;
    }
    if (strategy !== 'TARGET_ROAS') {
      updates.targetRoas = 0;
    }
    
    updateData(updates);
  };

  // Apply budget recommendation
  const applyBudgetRecommendation = (amount) => {
    updateData({ budgetAmount: amount });
  };

  // Calculate estimated metrics
  const calculateEstimatedMetrics = () => {
    if (!data.budgetAmount || data.budgetAmount <= 0) return null;

    const budget = parseFloat(data.budgetAmount);
    const estimatedClicks = Math.round(budget * (Math.random() * 5 + 2)); // 2-7 clicks per dollar
    const estimatedImpressions = Math.round(estimatedClicks * (Math.random() * 50 + 20)); // 20-70 impressions per click
    const estimatedCtr = ((estimatedClicks / estimatedImpressions) * 100).toFixed(2);
    const estimatedCpc = (budget / estimatedClicks).toFixed(2);

    return {
      clicks: estimatedClicks,
      impressions: estimatedImpressions,
      ctr: estimatedCtr,
      cpc: estimatedCpc
    };
  };

  const estimatedMetrics = calculateEstimatedMetrics();
  const selectedStrategy = biddingStrategies.find(s => s.id === data.bidStrategy);

  return (
    <div className="space-y-8">
      {/* Budget Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Budget Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              data.budgetType === 'DAILY'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handleFieldChange('budgetType', 'DAILY')}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                data.budgetType === 'DAILY'
                  ? 'bg-blue-500 text-gray-800'
                  : 'bg-white/15 backdrop-blur-md border border-blue-200/30 text-gray-600 dark:text-gray-300'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-medium ${
                  data.budgetType === 'DAILY'
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-gray-900 dark:text-gray-800'
                }`}>
                  Daily Budget
                </h3>
                <p className={`text-xs mt-1 ${
                  data.budgetType === 'DAILY'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  Set an average daily spending limit
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              data.budgetType === 'CAMPAIGN'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handleFieldChange('budgetType', 'CAMPAIGN')}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                data.budgetType === 'CAMPAIGN'
                  ? 'bg-blue-500 text-gray-800'
                  : 'bg-white/15 backdrop-blur-md border border-blue-200/30 text-gray-600 dark:text-gray-300'
              }`}>
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-medium ${
                  data.budgetType === 'CAMPAIGN'
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-gray-900 dark:text-gray-800'
                }`}>
                  Campaign Budget
                </h3>
                <p className={`text-xs mt-1 ${
                  data.budgetType === 'CAMPAIGN'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  Set a total budget for the entire campaign
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {data.budgetType === 'DAILY' ? 'Daily Budget' : 'Total Campaign Budget'} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            value={data.budgetAmount || ''}
            onChange={(e) => handleFieldChange('budgetAmount', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:border-gray-600 dark:text-gray-800 ${
              errors.budgetAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        </div>
        {errors.budgetAmount && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.budgetAmount}</p>
        )}

        {/* Budget Recommendations */}
        {budgetRecommendations && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Budget Recommendations
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Based on your campaign type and objective:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => applyBudgetRecommendation(budgetRecommendations.min)}
                    className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                  >
                    Conservative: ${budgetRecommendations.min}/day
                  </button>
                  <button
                    onClick={() => applyBudgetRecommendation(budgetRecommendations.recommended)}
                    className="px-3 py-1 text-xs bg-blue-500 text-gray-800 rounded hover:bg-blue-600 transition-colors"
                  >
                    Recommended: ${budgetRecommendations.recommended}/day
                  </button>
                  <button
                    onClick={() => applyBudgetRecommendation(budgetRecommendations.max)}
                    className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                  >
                    Aggressive: ${budgetRecommendations.max}/day
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bidding Strategy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Bidding Strategy *
        </label>
        <div className="space-y-3">
          {biddingStrategies.map((strategy) => (
            <div
              key={strategy.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.bidStrategy === strategy.id
                  ? `border-${strategy.color}-500 bg-${strategy.color}-50 dark:bg-${strategy.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleBiddingStrategyChange(strategy.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  data.bidStrategy === strategy.id
                    ? `bg-${strategy.color}-500 text-gray-800`
                    : 'bg-white/15 backdrop-blur-md border border-blue-200/30 text-gray-600 dark:text-gray-300'
                }`}>
                  {strategy.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-sm font-medium ${
                      data.bidStrategy === strategy.id
                        ? `text-${strategy.color}-900 dark:text-${strategy.color}-100`
                        : 'text-gray-900 dark:text-gray-800'
                    }`}>
                      {strategy.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      strategy.level === 'Beginner'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : strategy.level === 'Intermediate'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : strategy.level === 'Advanced'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {strategy.level}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    data.bidStrategy === strategy.id
                      ? `text-${strategy.color}-700 dark:text-${strategy.color}-300`
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {strategy.description}
                  </p>
                  <p className={`text-xs mt-1 font-medium ${
                    data.bidStrategy === strategy.id
                      ? `text-${strategy.color}-800 dark:text-${strategy.color}-200`
                      : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    Best for: {strategy.bestFor}
                  </p>
                </div>
              </div>

              {/* Target value input for strategies that require it */}
              {data.bidStrategy === strategy.id && strategy.requiresTarget && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {strategy.targetLabel} *
                  </label>
                  <div className="relative">
                    {strategy.targetField === 'targetCpa' && (
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="number"
                      value={data[strategy.targetField] || ''}
                      onChange={(e) => handleFieldChange(strategy.targetField, parseFloat(e.target.value) || 0)}
                      placeholder={strategy.targetField === 'targetCpa' ? '0.00' : '0'}
                      min="0"
                      step={strategy.targetField === 'targetCpa' ? '0.01' : '1'}
                      className={`w-full ${strategy.targetField === 'targetCpa' ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:text-gray-800 ${
                        errors[strategy.targetField] ? 'border-red-500' : ''
                      }`}
                    />
                    {strategy.targetField === 'targetRoas' && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Percent className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {errors[strategy.targetField] && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors[strategy.targetField]}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {strategy.targetField === 'targetCpa'
                      ? 'The average amount you want to pay for a conversion'
                      : 'The average return you want for every dollar spent (e.g., 400 = $4 return for every $1 spent)'
                    }
                  </p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
        {errors.bidStrategy && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.bidStrategy}</p>
        )}
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <span>Advanced Budget Settings</span>
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
            {/* Budget Delivery Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Delivery Method
              </label>
              <select
                value={data.budgetDeliveryMethod || 'STANDARD'}
                onChange={(e) => handleFieldChange('budgetDeliveryMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:text-gray-800"
              >
                <option value="STANDARD">Standard (Recommended)</option>
                <option value="ACCELERATED">Accelerated</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Standard delivery spreads your budget throughout the day. Accelerated delivery shows ads more quickly until budget is exhausted.
              </p>
            </div>

            {/* Device Bid Adjustments */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Device Bid Adjustments
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Mobile Bid Adjustment (%)
                  </label>
                  <input
                    type="number"
                    value={data.mobileBidAdjustment || 0}
                    onChange={(e) => handleFieldChange('mobileBidAdjustment', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="-90"
                    max="900"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:text-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Increase or decrease bids for mobile devices (-90% to +900%)
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Tablet Bid Adjustment (%)
                  </label>
                  <input
                    type="number"
                    value={data.tabletBidAdjustment || 0}
                    onChange={(e) => handleFieldChange('tabletBidAdjustment', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="-90"
                    max="900"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/15 backdrop-blur-md dark:text-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Increase or decrease bids for tablet devices (-90% to +900%)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Estimated Performance */}
      {estimatedMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                Estimated Daily Performance
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400">Clicks</p>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {estimatedMetrics.clicks.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400">Impressions</p>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {estimatedMetrics.impressions.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400">CTR</p>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {estimatedMetrics.ctr}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400">Avg. CPC</p>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                    ${estimatedMetrics.cpc}
                  </p>
                </div>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                * These are estimates based on your budget and bidding strategy. Actual performance may vary.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Budget Summary */}
      {data.budgetAmount > 0 && selectedStrategy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Budget Summary
              </h4>
              <div className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  <span className="font-medium">Budget Type:</span> {data.budgetType === 'DAILY' ? 'Daily' : 'Campaign Total'}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> ${data.budgetAmount}
                  {data.budgetType === 'DAILY' ? '/day' : ' total'}
                </p>
                <p>
                  <span className="font-medium">Bidding Strategy:</span> {selectedStrategy.name}
                </p>
                {selectedStrategy.requiresTarget && data[selectedStrategy.targetField] && (
                  <p>
                    <span className="font-medium">{selectedStrategy.targetLabel}:</span> 
                    {selectedStrategy.targetField === 'targetCpa' ? '$' : ''}{data[selectedStrategy.targetField]}
                    {selectedStrategy.targetField === 'targetRoas' ? '%' : ''}
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
              Budget & Bidding Tips
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li>• Start with a daily budget you're comfortable spending</li>
              <li>• Use "Maximize Clicks" for new campaigns to gather data</li>
              <li>• Switch to Target CPA/ROAS after collecting conversion data</li>
              <li>• Monitor performance and adjust budgets based on results</li>
              <li>• Consider seasonal trends when setting budgets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSettings;

