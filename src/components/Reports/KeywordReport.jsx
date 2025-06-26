"use client";

import React, { useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  Eye,
  MousePointer,
  DollarSign,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Globe,
  Users,
  Calendar,
  Activity,
  Award,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

const KeywordReport = () => {
  const [selectedView, setSelectedView] = useState("performance");
  const [selectedMatchType, setSelectedMatchType] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("last_30_days");
  const [sortBy, setSortBy] = useState("impressions");
  const [sortOrder, setSortOrder] = useState("desc");

  // Keyword performance data
  const keywordPerformance = [
    {
      keyword: "digital marketing services",
      matchType: "exact",
      impressions: 45678,
      clicks: 1234,
      ctr: "2.70%",
      avgCpc: "$2.45",
      cost: "$3,023",
      conversions: 67,
      conversionRate: "5.43%",
      costPerConversion: "$45.12",
      qualityScore: 8,
      avgPosition: 2.3,
      searchVolume: 12000,
      competition: "high",
      trend: "up",
      change: "+12.5%"
    },
    {
      keyword: "seo optimization",
      matchType: "broad",
      impressions: 67890,
      clicks: 1876,
      ctr: "2.76%",
      avgCpc: "$1.89",
      cost: "$3,546",
      conversions: 89,
      conversionRate: "4.75%",
      costPerConversion: "$39.84",
      qualityScore: 7,
      avgPosition: 3.1,
      searchVolume: 18500,
      competition: "medium",
      trend: "up",
      change: "+8.3%"
    },
    {
      keyword: "social media marketing",
      matchType: "phrase",
      impressions: 34567,
      clicks: 987,
      ctr: "2.85%",
      avgCpc: "$3.12",
      cost: "$3,079",
      conversions: 45,
      conversionRate: "4.56%",
      costPerConversion: "$68.42",
      qualityScore: 6,
      avgPosition: 4.2,
      searchVolume: 9800,
      competition: "high",
      trend: "down",
      change: "-3.2%"
    },
    {
      keyword: "content marketing strategy",
      matchType: "exact",
      impressions: 23456,
      clicks: 678,
      ctr: "2.89%",
      avgCpc: "$2.78",
      cost: "$1,885",
      conversions: 34,
      conversionRate: "5.01%",
      costPerConversion: "$55.44",
      qualityScore: 9,
      avgPosition: 1.8,
      searchVolume: 6700,
      competition: "medium",
      trend: "up",
      change: "+15.7%"
    },
    {
      keyword: "email marketing automation",
      matchType: "broad",
      impressions: 56789,
      clicks: 1345,
      ctr: "2.37%",
      avgCpc: "$1.67",
      cost: "$2,246",
      conversions: 78,
      conversionRate: "5.80%",
      costPerConversion: "$28.79",
      qualityScore: 8,
      avgPosition: 2.7,
      searchVolume: 14200,
      competition: "low",
      trend: "up",
      change: "+22.1%"
    }
  ];

  // Keyword opportunities
  const keywordOpportunities = [
    {
      keyword: "marketing automation tools",
      searchVolume: 15600,
      competition: "medium",
      suggestedBid: "$2.15",
      difficulty: "medium",
      opportunity: "high",
      reason: "High search volume with moderate competition"
    },
    {
      keyword: "digital advertising agency",
      searchVolume: 8900,
      competition: "high",
      suggestedBid: "$3.45",
      difficulty: "high",
      opportunity: "medium",
      reason: "Relevant to your services but competitive"
    },
    {
      keyword: "online marketing consultant",
      searchVolume: 5400,
      competition: "low",
      suggestedBid: "$1.89",
      difficulty: "low",
      opportunity: "high",
      reason: "Low competition with good search volume"
    },
    {
      keyword: "ppc management services",
      searchVolume: 7800,
      competition: "medium",
      suggestedBid: "$2.67",
      difficulty: "medium",
      opportunity: "high",
      reason: "Direct match to your service offerings"
    }
  ];

  // Negative keywords suggestions
  const negativeKeywords = [
    {
      keyword: "free marketing",
      reason: "Users looking for free services",
      impact: "high",
      impressions: 12450
    },
    {
      keyword: "marketing jobs",
      reason: "Job seekers, not potential clients",
      impact: "medium",
      impressions: 8760
    },
    {
      keyword: "marketing courses",
      reason: "Educational content seekers",
      impact: "medium",
      impressions: 6540
    },
    {
      keyword: "diy marketing",
      reason: "Self-service oriented users",
      impact: "low",
      impressions: 3210
    }
  ];

  // Search terms analysis
  const searchTerms = [
    {
      searchTerm: "best digital marketing agency",
      keyword: "digital marketing services",
      impressions: 2340,
      clicks: 89,
      ctr: "3.80%",
      conversions: 7,
      addedAsKeyword: false
    },
    {
      searchTerm: "professional seo services",
      keyword: "seo optimization",
      impressions: 1890,
      clicks: 67,
      ctr: "3.54%",
      conversions: 5,
      addedAsKeyword: true
    },
    {
      searchTerm: "social media management company",
      keyword: "social media marketing",
      impressions: 1560,
      clicks: 45,
      ctr: "2.88%",
      conversions: 3,
      addedAsKeyword: false
    }
  ];

  const getMatchTypeColor = (matchType) => {
    switch (matchType) {
      case "exact":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "phrase":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "broad":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
    }
  };

  const getCompetitionColor = (competition) => {
    switch (competition) {
      case "low":
        return "text-green-600 dark:text-green-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "high":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getOpportunityColor = (opportunity) => {
    switch (opportunity) {
      case "high":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300";
      case "low":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
    }
  };

  const getQualityScoreColor = (score) => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Keyword Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive analysis of keyword performance and opportunities
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="this_quarter">This Quarter</option>
              </select>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Keywords</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {["performance", "opportunities", "search-terms", "negative"].map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === view
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Keyword Performance */}
        {selectedView === "performance" && (
          <>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance Filters
                </h2>
                <Filter className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Match Type
                  </label>
                  <select
                    value={selectedMatchType}
                    onChange={(e) => setSelectedMatchType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Match Types</option>
                    <option value="exact">Exact Match</option>
                    <option value="phrase">Phrase Match</option>
                    <option value="broad">Broad Match</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="impressions">Impressions</option>
                    <option value="clicks">Clicks</option>
                    <option value="ctr">CTR</option>
                    <option value="cost">Cost</option>
                    <option value="conversions">Conversions</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quality Score
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="all">All Scores</option>
                    <option value="high">8-10 (High)</option>
                    <option value="medium">6-7 (Medium)</option>
                    <option value="low">1-5 (Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Keywords Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Keyword Performance
                </h2>
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-500">{keywordPerformance.length} keywords</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Keyword</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Match Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Impressions</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Clicks</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">CTR</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Avg CPC</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Conversions</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Quality Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywordPerformance.map((keyword, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {keyword.keyword}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Vol: {keyword.searchVolume.toLocaleString()} | Pos: {keyword.avgPosition}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getMatchTypeColor(keyword.matchType)}`}>
                            {keyword.matchType}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {keyword.impressions.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {keyword.clicks.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {keyword.ctr}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {keyword.avgCpc}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-gray-900 dark:text-white">{keyword.conversions}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{keyword.conversionRate}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`flex items-center space-x-1 ${getQualityScoreColor(keyword.qualityScore)}`}>
                            <Star className="w-4 h-4" />
                            <span className="font-medium">{keyword.qualityScore}/10</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`flex items-center space-x-1 text-sm ${
                            keyword.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {keyword.trend === 'up' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                            <span>{keyword.change}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Keyword Opportunities */}
        {selectedView === "opportunities" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Keyword Opportunities
                </h2>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {keywordOpportunities.map((opportunity, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {opportunity.keyword}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getOpportunityColor(opportunity.opportunity)}`}>
                        {opportunity.opportunity} opportunity
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Search Volume</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {opportunity.searchVolume.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Suggested Bid</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {opportunity.suggestedBid}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Competition</div>
                        <div className={`font-medium ${getCompetitionColor(opportunity.competition)}`}>
                          {opportunity.competition}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Difficulty</div>
                        <div className={`font-medium ${getCompetitionColor(opportunity.difficulty)}`}>
                          {opportunity.difficulty}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {opportunity.reason}
                    </p>
                    
                    <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                      Add to Campaign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Terms */}
        {selectedView === "search-terms" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Search Terms Analysis
              </h2>
              <Activity className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Search Term</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Matched Keyword</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Impressions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Clicks</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">CTR</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Conversions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchTerms.map((term, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {term.searchTerm}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {term.keyword}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {term.impressions.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {term.clicks}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {term.ctr}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {term.conversions}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {term.addedAsKeyword ? (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full">
                              Added
                            </span>
                          ) : (
                            <button className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded">
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded">
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Negative Keywords */}
        {selectedView === "negative" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Negative Keyword Suggestions
              </h2>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            
            <div className="space-y-4">
              {negativeKeywords.map((negative, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {negative.keyword}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          negative.impact === 'high' 
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                            : negative.impact === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                            : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
                        }`}>
                          {negative.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {negative.reason}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {negative.impressions.toLocaleString()} impressions affected
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                        Add as Negative
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordReport;

