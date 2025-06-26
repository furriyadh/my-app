"use client";

import React, { useState } from "react";
import {
  Eye,
  Play,
  Edit,
  Share2,
  Download,
  Calendar,
  DollarSign,
  Target,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  MapPin,
  Languages,
  Image,
  Video,
  Type,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Star,
  ThumbsUp,
  MessageSquare,
  Heart,
  Zap
} from "lucide-react";

const CampaignPreview = () => {
  const [previewMode, setPreviewMode] = useState("desktop");
  const [isLaunching, setIsLaunching] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mock campaign data
  const campaignData = {
    name: "Summer Tech Sale 2024",
    status: "Ready to Launch",
    budget: {
      daily: 150,
      total: 4500,
      delivery: "Standard"
    },
    schedule: {
      startDate: "2024-07-01",
      endDate: "2024-07-31",
      timezone: "UTC-5"
    },
    targeting: {
      locations: ["United States", "Canada"],
      languages: ["English"],
      demographics: {
        age: "25-54",
        gender: "All",
        income: "Top 30%"
      },
      devices: ["Desktop", "Mobile", "Tablet"],
      interests: ["Technology", "Electronics", "Online Shopping"]
    },
    assets: {
      headlines: [
        "Best Summer Tech Deals",
        "Limited Time Electronics Sale",
        "Premium Gadgets at Low Prices",
        "Tech Sale Event 2024"
      ],
      descriptions: [
        "Discover amazing discounts on top tech products this summer.",
        "Get the latest gadgets with free shipping and warranty."
      ],
      images: 8,
      videos: 3,
      logos: 2
    },
    keywords: [
      "summer tech sale",
      "electronics deals",
      "gadget discounts",
      "tech offers",
      "laptop deals"
    ],
    bidding: {
      strategy: "Target CPA",
      targetCpa: 25,
      maxCpc: 2.50
    }
  };

  // Performance estimates
  const performanceEstimates = {
    impressions: "125K - 180K",
    clicks: "3.2K - 4.8K",
    conversions: "180 - 240",
    ctr: "2.8% - 3.4%",
    cpc: "$1.45 - $1.85",
    cpa: "$22 - $28",
    roas: "380% - 420%"
  };

  // Ad preview data
  const adPreviews = [
    {
      id: 1,
      headline: "Best Summer Tech Deals",
      description: "Discover amazing discounts on top tech products this summer.",
      displayUrl: "techstore.com/summer-sale",
      sitelinks: ["Laptops", "Smartphones", "Accessories", "Support"]
    },
    {
      id: 2,
      headline: "Limited Time Electronics Sale",
      description: "Get the latest gadgets with free shipping and warranty.",
      displayUrl: "techstore.com/electronics",
      sitelinks: ["Gaming", "Audio", "Smart Home", "Deals"]
    }
  ];

  // Launch campaign
  const launchCampaign = async () => {
    setIsLaunching(true);
    try {
      // Simulate campaign launch
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log("Campaign launched successfully!");
      // Redirect to campaigns dashboard
    } catch (error) {
      console.error("Launch failed:", error);
    } finally {
      setIsLaunching(false);
    }
  };

  // Device preview components
  const DeviceFrame = ({ children, device }) => {
    const frameStyles = {
      desktop: "w-full max-w-4xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-4",
      mobile: "w-80 mx-auto bg-gray-900 rounded-3xl p-2",
      tablet: "w-96 mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl p-3"
    };

    return (
      <div className={frameStyles[device]}>
        {device === "mobile" && (
          <div className="bg-black rounded-2xl p-4">
            <div className="w-full h-1 bg-gray-700 rounded-full mb-4 mx-auto"></div>
            {children}
          </div>
        )}
        {device !== "mobile" && children}
      </div>
    );
  };

  // Ad preview component
  const AdPreview = ({ ad, device }) => {
    const isMobile = device === "mobile";
    
    return (
      <div className={`bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 ${
        isMobile ? "text-sm" : ""
      }`}>
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            Ad
          </div>
          <div className="flex-1">
            <div className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer">
              {ad.headline}
            </div>
            <div className="text-green-600 dark:text-green-400 text-sm">
              {ad.displayUrl}
            </div>
            <div className="text-gray-700 dark:text-gray-300 mt-1">
              {ad.description}
            </div>
            
            {/* Sitelinks */}
            <div className="flex flex-wrap gap-2 mt-3">
              {ad.sitelinks.map((link, index) => (
                <span
                  key={index}
                  className="text-blue-600 dark:text-blue-400 text-sm hover:underline cursor-pointer"
                >
                  {link}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tab configuration
  const tabs = [
    { id: "preview", label: "Ad Preview", icon: Eye },
    { id: "summary", label: "Campaign Summary", icon: BarChart3 },
    { id: "performance", label: "Performance Estimates", icon: TrendingUp },
    { id: "checklist", label: "Launch Checklist", icon: CheckCircle }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <Eye className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Campaign Preview & Launch
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review your campaign before launching it to the world
        </p>
      </div>

      {/* Campaign Status */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-xl font-bold text-green-900 dark:text-green-400">
                {campaignData.name}
              </h3>
              <p className="text-green-700 dark:text-green-300">
                Status: {campaignData.status}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${campaignData.budget.daily}/day
            </div>
            <div className="text-green-500 dark:text-green-400 text-sm">
              Total: ${campaignData.budget.total}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Ad Preview Tab */}
          {activeTab === "preview" && (
            <div className="space-y-6">
              {/* Device Selection */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ad Preview
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewMode("desktop")}
                    className={`p-2 rounded-lg transition-colors ${
                      previewMode === "desktop"
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode("tablet")}
                    className={`p-2 rounded-lg transition-colors ${
                      previewMode === "tablet"
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Tablet className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode("mobile")}
                    className={`p-2 rounded-lg transition-colors ${
                      previewMode === "mobile"
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Ad Previews */}
              <DeviceFrame device={previewMode}>
                <div className="space-y-4">
                  {adPreviews.map(ad => (
                    <AdPreview key={ad.id} ad={ad} device={previewMode} />
                  ))}
                </div>
              </DeviceFrame>

              {/* Preview Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing 2 of {campaignData.assets.headlines.length} ad variations
                </span>
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Campaign Summary Tab */}
          {activeTab === "summary" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Budget & Schedule */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Budget & Schedule
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-300">Daily Budget:</span>
                      <span className="font-medium text-blue-900 dark:text-blue-400">${campaignData.budget.daily}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-300">Total Budget:</span>
                      <span className="font-medium text-blue-900 dark:text-blue-400">${campaignData.budget.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-300">Start Date:</span>
                      <span className="font-medium text-blue-900 dark:text-blue-400">{campaignData.schedule.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-300">End Date:</span>
                      <span className="font-medium text-blue-900 dark:text-blue-400">{campaignData.schedule.endDate}</span>
                    </div>
                  </div>
                </div>

                {/* Targeting */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Targeting
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-purple-800 dark:text-purple-300">Locations:</span>
                      <div className="font-medium text-purple-900 dark:text-purple-400">
                        {campaignData.targeting.locations.join(", ")}
                      </div>
                    </div>
                    <div>
                      <span className="text-purple-800 dark:text-purple-300">Age Range:</span>
                      <div className="font-medium text-purple-900 dark:text-purple-400">
                        {campaignData.targeting.demographics.age}
                      </div>
                    </div>
                    <div>
                      <span className="text-purple-800 dark:text-purple-300">Devices:</span>
                      <div className="font-medium text-purple-900 dark:text-purple-400">
                        {campaignData.targeting.devices.join(", ")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assets */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-400 mb-3 flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Assets
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-800 dark:text-green-300">Headlines:</span>
                      <span className="font-medium text-green-900 dark:text-green-400">{campaignData.assets.headlines.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800 dark:text-green-300">Descriptions:</span>
                      <span className="font-medium text-green-900 dark:text-green-400">{campaignData.assets.descriptions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800 dark:text-green-300">Images:</span>
                      <span className="font-medium text-green-900 dark:text-green-400">{campaignData.assets.images}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800 dark:text-green-300">Videos:</span>
                      <span className="font-medium text-green-900 dark:text-green-400">{campaignData.assets.videos}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Target Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {campaignData.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Estimates Tab */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {performanceEstimates.impressions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Impressions</div>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {performanceEstimates.clicks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Clicks</div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {performanceEstimates.conversions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Conversions</div>
                </div>
                
                <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {performanceEstimates.roas}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">ROAS</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {performanceEstimates.ctr}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Expected CTR</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {performanceEstimates.cpc}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Expected CPC</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {performanceEstimates.cpa}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Expected CPA</div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-400 mb-1">
                      Performance Estimates
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      These estimates are based on historical data and current market conditions. 
                      Actual performance may vary depending on competition, seasonality, and other factors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Launch Checklist Tab */}
          {activeTab === "checklist" && (
            <div className="space-y-6">
              <div className="space-y-4">
                {[
                  { item: "Campaign name and objectives defined", completed: true },
                  { item: "Budget and bidding strategy configured", completed: true },
                  { item: "Target audience and locations selected", completed: true },
                  { item: "Keywords and negative keywords added", completed: true },
                  { item: "Ad assets uploaded and approved", completed: true },
                  { item: "Conversion tracking implemented", completed: false },
                  { item: "Landing page optimized", completed: false },
                  { item: "Campaign schedule configured", completed: true }
                ].map((check, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {check.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className={`flex-1 ${
                      check.completed 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {check.item}
                    </span>
                    {!check.completed && (
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                        Setup
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-400 mb-1">
                      Action Required
                    </h4>
                    <p className="text-sm text-red-800 dark:text-red-300">
                      Please complete the remaining items before launching your campaign for optimal performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Edit className="w-4 h-4" />
            <span>Edit Campaign</span>
          </button>
          
          <button className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Preview</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Save as Draft
          </button>
          
          <button
            onClick={launchCampaign}
            disabled={isLaunching}
            className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLaunching ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isLaunching ? 'Launching...' : 'Launch Campaign'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignPreview;

