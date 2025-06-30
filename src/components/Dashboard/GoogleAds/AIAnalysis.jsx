"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Brain,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
  Award,
  Rocket,
  Shield,
  Clock,
  DollarSign,
  Users,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw,
  Download,
  Share2,
  Settings,
  Play,
  Pause
} from "lucide-react";

const AIAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [recommendations, setRecommendations] = useState([]);
  const [optimizations, setOptimizations] = useState([]);

  // Mock campaign data for analysis
  const campaignData = {
    name: "Summer Sale Campaign 2024",
    budget: 1500,
    targetAudience: "25-45 years, Tech enthusiasts",
    keywords: ["summer sale", "tech deals", "electronics"],
    headlines: ["Best Summer Deals", "Tech Sale Event", "Limited Time Offers"],
    descriptions: ["Get amazing discounts on top tech products this summer."],
    images: 5,
    videos: 2
  };

  // AI Analysis Results
  const analysisResults = {
    overallScore: 87,
    performancePrediction: {
      estimatedCtr: 3.2,
      estimatedCpc: 1.45,
      estimatedConversions: 125,
      estimatedRoas: 420,
      confidenceLevel: 85
    },
    strengths: [
      {
        category: "Budget Allocation",
        score: 92,
        description: "Well-balanced budget distribution across campaign elements",
        impact: "High",
        icon: DollarSign
      },
      {
        category: "Audience Targeting",
        score: 89,
        description: "Precise targeting with good demographic alignment",
        impact: "High",
        icon: Users
      },
      {
        category: "Creative Assets",
        score: 85,
        description: "Strong visual assets with compelling messaging",
        impact: "Medium",
        icon: Eye
      },
      {
        category: "Keyword Strategy",
        score: 83,
        description: "Relevant keywords with good search volume potential",
        impact: "Medium",
        icon: Target
      }
    ],
    weaknesses: [
      {
        category: "Ad Schedule",
        score: 65,
        description: "Limited time targeting may miss potential customers",
        impact: "Medium",
        suggestion: "Expand ad schedule to include evening hours",
        icon: Clock
      },
      {
        category: "Device Targeting",
        score: 70,
        description: "Mobile optimization could be improved",
        impact: "High",
        suggestion: "Add mobile-specific ad variations",
        icon: Smartphone
      }
    ],
    opportunities: [
      {
        title: "Increase Mobile Bid Adjustments",
        description: "Mobile traffic shows 23% higher conversion rates in your industry",
        potentialImpact: "+15% conversions",
        effort: "Low",
        priority: "High"
      },
      {
        title: "Add Negative Keywords",
        description: "Filter out irrelevant traffic to improve quality score",
        potentialImpact: "+8% CTR",
        effort: "Medium",
        priority: "Medium"
      },
      {
        title: "Implement Ad Extensions",
        description: "Sitelinks and callouts can increase ad visibility",
        potentialImpact: "+12% CTR",
        effort: "Low",
        priority: "High"
      }
    ],
    competitorInsights: {
      averageCpc: 1.67,
      averageCtr: 2.8,
      topCompetitors: ["TechDeals Pro", "ElectroSaver", "GadgetWorld"],
      marketShare: 12,
      competitiveAdvantages: [
        "Lower CPC than industry average",
        "Higher quality score potential",
        "Better audience targeting precision"
      ]
    }
  };

  // Start AI Analysis
  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAnalysisData(analysisResults);
      generateRecommendations();
      generateOptimizations();
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate AI Recommendations
  const generateRecommendations = () => {
    const newRecommendations = [
      {
        id: 1,
        type: "optimization",
        title: "Optimize for Mobile Performance",
        description: "Your campaign shows strong potential on mobile devices. Consider increasing mobile bid adjustments by 20%.",
        impact: "High",
        effort: "Low",
        estimatedImprovement: "+18% conversions",
        status: "pending"
      },
      {
        id: 2,
        type: "budget",
        title: "Reallocate Budget to High-Performing Keywords",
        description: "Shift 30% of budget to top-performing keywords to maximize ROI.",
        impact: "Medium",
        effort: "Low",
        estimatedImprovement: "+12% ROAS",
        status: "pending"
      },
      {
        id: 3,
        type: "creative",
        title: "Test New Ad Variations",
        description: "Create emotional appeal variations of your current ads to improve engagement.",
        impact: "Medium",
        effort: "Medium",
        estimatedImprovement: "+8% CTR",
        status: "pending"
      }
    ];
    setRecommendations(newRecommendations);
  };

  // Generate Optimizations
  const generateOptimizations = () => {
    const newOptimizations = [
      {
        id: 1,
        category: "Bidding",
        title: "Switch to Target CPA Bidding",
        description: "Based on your conversion data, automated bidding could improve efficiency",
        currentValue: "Manual CPC: $1.45",
        recommendedValue: "Target CPA: $12.00",
        expectedImpact: "+25% conversions at same cost"
      },
      {
        id: 2,
        category: "Keywords",
        title: "Add Long-tail Keywords",
        description: "Expand keyword list with specific product terms",
        currentValue: "15 keywords",
        recommendedValue: "35 keywords",
        expectedImpact: "+30% impression share"
      },
      {
        id: 3,
        category: "Audience",
        title: "Layer Affinity Audiences",
        description: "Add technology enthusiast audiences for better targeting",
        currentValue: "Demographic targeting only",
        recommendedValue: "Demographics + Affinity audiences",
        expectedImpact: "+15% relevant traffic"
      }
    ];
    setOptimizations(newOptimizations);
  };

  // Apply recommendation
  const applyRecommendation = (id) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, status: 'applied' } : rec
      )
    );
  };

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "performance", label: "Performance Prediction", icon: TrendingUp },
    { id: "recommendations", label: "Recommendations", icon: Lightbulb },
    { id: "competitors", label: "Competitor Analysis", icon: Shield }
  ];

  // Score color helper
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  useEffect(() => {
    // Auto-start analysis when component mounts
    startAnalysis();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Campaign Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get intelligent insights and optimization recommendations powered by AI
        </p>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Analyzing Your Campaign
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI is processing your campaign data and generating insights...
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisData && !isAnalyzing && (
        <>
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-400 mb-2">
                  Campaign Score
                </h3>
                <p className="text-purple-700 dark:text-purple-300">
                  Based on industry benchmarks and best practices
                </p>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-purple-600 dark:text-purple-400">
                  {analysisData.overallScore}
                </div>
                <div className="text-purple-500 dark:text-purple-400 font-medium">
                  / 100
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
                        ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
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
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Strengths */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Strengths
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisData.strengths.map((strength, index) => {
                        const Icon = strength.icon;
                        return (
                          <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-start space-x-3">
                              <Icon className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-green-900 dark:text-green-400">
                                    {strength.category}
                                  </h4>
                                  <span className={`text-2xl font-bold ${getScoreColor(strength.score)}`}>
                                    {strength.score}
                                  </span>
                                </div>
                                <p className="text-sm text-green-800 dark:text-green-300">
                                  {strength.description}
                                </p>
                                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full">
                                  {strength.impact} Impact
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                      Areas for Improvement
                    </h3>
                    <div className="space-y-4">
                      {analysisData.weaknesses.map((weakness, index) => {
                        const Icon = weakness.icon;
                        return (
                          <div key={index} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-start space-x-3">
                              <Icon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-yellow-900 dark:text-yellow-400">
                                    {weakness.category}
                                  </h4>
                                  <span className={`text-2xl font-bold ${getScoreColor(weakness.score)}`}>
                                    {weakness.score}
                                  </span>
                                </div>
                                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                                  {weakness.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-yellow-900 dark:text-yellow-400">
                                    💡 {weakness.suggestion}
                                  </span>
                                  <span className="px-2 py-1 text-xs bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-full">
                                    {weakness.impact} Impact
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Rocket className="w-5 h-5 mr-2 text-blue-500" />
                      Growth Opportunities
                    </h3>
                    <div className="space-y-4">
                      {analysisData.opportunities.map((opportunity, index) => (
                        <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
                                {opportunity.title}
                              </h4>
                              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                                {opportunity.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs">
                                <span className="px-2 py-1 bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full">
                                  {opportunity.potentialImpact}
                                </span>
                                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                                  {opportunity.effort} Effort
                                </span>
                                <span className={`px-2 py-1 rounded-full ${
                                  opportunity.priority === 'High' 
                                    ? 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                                    : 'bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                                }`}>
                                  {opportunity.priority} Priority
                                </span>
                              </div>
                            </div>
                            <button className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                              Apply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Prediction Tab */}
              {activeTab === "performance" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {analysisData.performancePrediction.estimatedCtr}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Expected CTR</div>
                    </div>
                    
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${analysisData.performancePrediction.estimatedCpc}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Expected CPC</div>
                    </div>
                    
                    <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {analysisData.performancePrediction.estimatedConversions}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Expected Conversions</div>
                    </div>
                    
                    <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {analysisData.performancePrediction.estimatedRoas}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Expected ROAS</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-500" />
                      Prediction Confidence: {analysisData.performancePrediction.confidenceLevel}%
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      These predictions are based on historical data from similar campaigns in your industry, 
                      current market conditions, and your campaign configuration. Actual results may vary.
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendations Tab */}
              {activeTab === "recommendations" && (
                <div className="space-y-6">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="p-6 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {rec.title}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rec.impact === 'High' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {rec.impact} Impact
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {rec.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {rec.estimatedImprovement}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {rec.effort} effort required
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {rec.status === 'applied' ? (
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Applied</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => applyRecommendation(rec.id)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Competitor Analysis Tab */}
              {activeTab === "competitors" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${analysisData.competitorInsights.averageCpc}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Industry Avg CPC</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analysisData.competitorInsights.averageCtr}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Industry Avg CTR</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analysisData.competitorInsights.marketShare}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Your Market Share</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Top Competitors
                    </h4>
                    <div className="space-y-3">
                      {analysisData.competitorInsights.topCompetitors.map((competitor, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {competitor}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Competitor #{index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Your Competitive Advantages
                    </h4>
                    <div className="space-y-2">
                      {analysisData.competitorInsights.competitiveAdvantages.map((advantage, index) => (
                        <div key={index} className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">{advantage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>
          
          <button className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Save Analysis
          </button>
          
          <button className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <span>Continue to Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;

