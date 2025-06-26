"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  Eye,
  Settings,
  Target,
  DollarSign,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Users,
  MapPin,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Save,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  Camera,
  FileText,
  Link,
  Star,
  Heart,
  MessageSquare
} from "lucide-react";

// TypeScript Interfaces
interface CampaignData {
  name: string;
  objective: string;
  description: string;
  budgetType: string;
  budget: string;
  bidStrategy: string;
  maxCpc: string;
  locations: string[];
  languages: string[];
  demographics: {
    age: string[];
    gender: string;
    income: string;
  };
  interests: string[];
  keywords: string[];
  startDate: string;
  endDate: string;
  schedule: {
    days: number[];
    hours: { start: string; end: string };
  };
  headlines: string[];
  descriptions: string[];
  images: string[];
  videos: string[];
  sitelinks: any[];
  deviceTargeting: string[];
  networkSettings: {
    search: boolean;
    display: boolean;
    youtube: boolean;
    partners: boolean;
  };
  adRotation: string;
  frequencyCapping: {
    enabled: boolean;
    impressions: number;
    timeUnit: string;
  };
}

interface Errors {
  [key: string]: string;
}

const NewCampaign: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    // Basic Info
    name: "",
    objective: "",
    description: "",
    
    // Budget & Bidding
    budgetType: "daily",
    budget: "",
    bidStrategy: "maximize_clicks",
    maxCpc: "",
    
    // Targeting
    locations: [],
    languages: [],
    demographics: {
      age: [],
      gender: "all",
      income: "all"
    },
    interests: [],
    keywords: [],
    
    // Schedule
    startDate: "",
    endDate: "",
    schedule: {
      days: [],
      hours: { start: "09:00", end: "18:00" }
    },
    
    // Assets
    headlines: ["", "", ""],
    descriptions: ["", ""],
    images: [],
    videos: [],
    sitelinks: [],
    
    // Advanced Settings
    deviceTargeting: ["desktop", "mobile", "tablet"],
    networkSettings: {
      search: true,
      display: false,
      youtube: false,
      partners: false
    },
    adRotation: "optimize",
    frequencyCapping: {
      enabled: false,
      impressions: 3,
      timeUnit: "day"
    }
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Campaign objectives
  const objectives = [
    {
      id: "sales",
      title: "Drive Sales",
      description: "Encourage customers to purchase your products or services",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      id: "leads",
      title: "Generate Leads",
      description: "Get people to express interest in your business",
      icon: Users,
      color: "text-blue-600"
    },
    {
      id: "traffic",
      title: "Drive Website Traffic",
      description: "Get more visitors to your website",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      id: "awareness",
      title: "Build Brand Awareness",
      description: "Reach people who are likely to be interested in your brand",
      icon: Eye,
      color: "text-orange-600"
    },
    {
      id: "consideration",
      title: "Product Consideration",
      description: "Encourage people to explore your products or services",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      id: "app",
      title: "Promote App",
      description: "Get more app installs or engagement",
      icon: Smartphone,
      color: "text-indigo-600"
    }
  ];

  // Bid strategies
  const bidStrategies = [
    {
      id: "maximize_clicks",
      title: "Maximize Clicks",
      description: "Get as many clicks as possible within your budget"
    },
    {
      id: "maximize_conversions",
      title: "Maximize Conversions",
      description: "Get the most conversions for your budget"
    },
    {
      id: "target_cpa",
      title: "Target CPA",
      description: "Set a target cost per acquisition"
    },
    {
      id: "target_roas",
      title: "Target ROAS",
      description: "Set a target return on ad spend"
    },
    {
      id: "manual_cpc",
      title: "Manual CPC",
      description: "Set your own maximum cost-per-click bids"
    }
  ];

  // Popular locations
  const popularLocations = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany",
    "France", "Spain", "Italy", "Netherlands", "Sweden", "Norway",
    "Saudi Arabia", "UAE", "Egypt", "Jordan", "Lebanon", "Kuwait"
  ];

  // Popular languages
  const popularLanguages = [
    "English", "Arabic", "Spanish", "French", "German", "Italian",
    "Portuguese", "Dutch", "Swedish", "Norwegian", "Danish"
  ];

  // Interest categories
  const interestCategories = [
    "Technology", "Fashion", "Travel", "Food & Dining", "Sports",
    "Entertainment", "Health & Fitness", "Education", "Finance",
    "Real Estate", "Automotive", "Home & Garden", "Beauty"
  ];

  // Steps configuration
  const steps = [
    { id: 1, title: "Basic Info", icon: Info },
    { id: 2, title: "Budget & Bidding", icon: DollarSign },
    { id: 3, title: "Targeting", icon: Target },
    { id: 4, title: "Schedule", icon: Calendar },
    { id: 5, title: "Assets", icon: Camera },
    { id: 6, title: "Advanced", icon: Settings },
    { id: 7, title: "Review", icon: CheckCircle }
  ];

  // Handle input changes
  const handleInputChange = (field: keyof CampaignData, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Handle nested input changes
  const handleNestedInputChange = (parent: keyof CampaignData, field: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  // Handle array input changes
  const handleArrayInputChange = (field: keyof CampaignData, value: string, action: "add" | "remove" = "add") => {
    setCampaignData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      
      if (action === "add" && !currentArray.includes(value)) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else if (action === "remove") {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      }
      
      return prev;
    });
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Errors = {};
    
    switch (step) {
      case 1:
        if (!campaignData.name.trim()) newErrors.name = "Campaign name is required";
        if (!campaignData.objective) newErrors.objective = "Campaign objective is required";
        break;
      case 2:
        if (!campaignData.budget) newErrors.budget = "Budget is required";
        if (campaignData.bidStrategy === "manual_cpc" && !campaignData.maxCpc) {
          newErrors.maxCpc = "Max CPC is required for manual bidding";
        }
        break;
      case 3:
        if (campaignData.locations.length === 0) newErrors.locations = "At least one location is required";
        if (campaignData.languages.length === 0) newErrors.languages = "At least one language is required";
        break;
      case 4:
        if (!campaignData.startDate) newErrors.startDate = "Start date is required";
        break;
      case 5:
        if (campaignData.headlines.filter(h => h.trim()).length < 3) {
          newErrors.headlines = "At least 3 headlines are required";
        }
        if (campaignData.descriptions.filter(d => d.trim()).length < 2) {
          newErrors.descriptions = "At least 2 descriptions are required";
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Save campaign as draft
  const saveDraft = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Campaign saved as draft successfully!");
    } catch (error) {
      alert("Error saving campaign. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Launch campaign
  const launchCampaign = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Campaign launched successfully!");
    } catch (error) {
      alert("Error launching campaign. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Campaign Basic Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Set up the foundation of your advertising campaign
              </p>
            </div>

            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter campaign name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Campaign Objective */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Campaign Objective *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {objectives.map((objective) => {
                  const Icon = objective.icon;
                  return (
                    <button
                      key={objective.id}
                      onClick={() => handleInputChange("objective", objective.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                        campaignData.objective === objective.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${objective.color} mb-2`} />
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        {objective.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {objective.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              {errors.objective && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.objective}</p>
              )}
            </div>

            {/* Campaign Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Description
              </label>
              <textarea
                value={campaignData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your campaign goals and strategy"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Step {currentStep} Content
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This step is under development. Use navigation to test other steps.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Campaign
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up a new advertising campaign to reach your target audience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    isActive
                      ? "border-blue-500 bg-blue-500 text-white"
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-400"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isActive || isCompleted
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 h-0.5 ml-4 ${
                      isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={saveDraft}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>Save Draft</span>
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={launchCampaign}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                <span>{isLoading ? "Launching..." : "Launch Campaign"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCampaign;

