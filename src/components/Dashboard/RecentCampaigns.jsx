"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Edit3,
  Copy,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";

const RecentCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Mock campaign data
  const mockCampaigns = [
    {
      id: 1,
      name: "Summer Sale 2024 - Electronics",
      status: "active",
      type: "Search",
      budget: 1500,
      spent: 1247.50,
      impressions: 125000,
      clicks: 2340,
      conversions: 89,
      ctr: 1.87,
      cpc: 0.53,
      roas: 4.2,
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      performance: "excellent",
      lastModified: "2 hours ago"
    },
    {
      id: 2,
      name: "Brand Awareness Campaign",
      status: "active",
      type: "Display",
      budget: 800,
      spent: 654.30,
      impressions: 89000,
      clicks: 1120,
      conversions: 34,
      ctr: 1.26,
      cpc: 0.58,
      roas: 2.8,
      startDate: "2024-06-15",
      endDate: "2024-07-15",
      performance: "good",
      lastModified: "5 hours ago"
    },
    {
      id: 3,
      name: "Holiday Special Offers",
      status: "paused",
      type: "Shopping",
      budget: 2000,
      spent: 1890.75,
      impressions: 156000,
      clicks: 3200,
      conversions: 145,
      ctr: 2.05,
      cpc: 0.59,
      roas: 5.1,
      startDate: "2024-05-20",
      endDate: "2024-06-20",
      performance: "excellent",
      lastModified: "1 day ago"
    },
    {
      id: 4,
      name: "Mobile App Downloads",
      status: "active",
      type: "Video",
      budget: 1200,
      spent: 987.20,
      impressions: 78000,
      clicks: 890,
      conversions: 67,
      ctr: 1.14,
      cpc: 1.11,
      roas: 3.4,
      startDate: "2024-06-10",
      endDate: "2024-07-10",
      performance: "good",
      lastModified: "3 hours ago"
    },
    {
      id: 5,
      name: "Local Services Promotion",
      status: "ended",
      type: "Search",
      budget: 600,
      spent: 600,
      impressions: 45000,
      clicks: 1200,
      conversions: 28,
      ctr: 2.67,
      cpc: 0.50,
      roas: 2.1,
      startDate: "2024-05-01",
      endDate: "2024-05-31",
      performance: "average",
      lastModified: "1 week ago"
    },
    {
      id: 6,
      name: "New Product Launch",
      status: "draft",
      type: "Display",
      budget: 1800,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      roas: 0,
      startDate: "2024-07-01",
      endDate: "2024-08-01",
      performance: "pending",
      lastModified: "2 days ago"
    }
  ];

  // Load campaigns
  useEffect(() => {
    setTimeout(() => {
      setCampaigns(mockCampaigns);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and sort campaigns
  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "budget":
          return b.budget - a.budget;
        case "performance":
          return b.roas - a.roas;
        case "date":
        default:
          return new Date(b.startDate) - new Date(a.startDate);
      }
    });

  // Status configurations
  const statusConfigs = {
    active: {
      color: "text-green-700 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
      icon: Play,
      label: "Active"
    },
    paused: {
      color: "text-yellow-700 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      icon: Pause,
      label: "Paused"
    },
    ended: {
      color: "text-gray-700 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-900/30",
      icon: CheckCircle,
      label: "Ended"
    },
    draft: {
      color: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      icon: Clock,
      label: "Draft"
    }
  };

  // Performance configurations
  const performanceConfigs = {
    excellent: {
      color: "text-green-600 dark:text-green-400",
      icon: TrendingUp,
      label: "Excellent"
    },
    good: {
      color: "text-blue-600 dark:text-blue-400",
      icon: ArrowUpRight,
      label: "Good"
    },
    average: {
      color: "text-yellow-600 dark:text-yellow-400",
      icon: Activity,
      label: "Average"
    },
    poor: {
      color: "text-red-600 dark:text-red-400",
      icon: TrendingDown,
      label: "Poor"
    },
    pending: {
      color: "text-gray-600 dark:text-gray-400",
      icon: Clock,
      label: "Pending"
    }
  };

  // Campaign type icons
  const typeIcons = {
    Search: Target,
    Display: Eye,
    Shopping: DollarSign,
    Video: Play
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  // Handle campaign actions
  const handleAction = (action, campaignId) => {
    console.log(`${action} campaign ${campaignId}`);
    // Implement action logic here
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div>
                <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 mx-auto"></div>
                <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Campaign card component
  const CampaignCard = ({ campaign }) => {
    const statusConfig = statusConfigs[campaign.status];
    const performanceConfig = performanceConfigs[campaign.performance];
    const TypeIcon = typeIcons[campaign.type];
    const StatusIcon = statusConfig.icon;
    const PerformanceIcon = performanceConfig.icon;

    const budgetUsed = (campaign.spent / campaign.budget) * 100;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TypeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {campaign.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{campaign.type}</span>
                <span>•</span>
                <span>{campaign.lastModified}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Status Badge */}
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3" />
              <span>{statusConfig.label}</span>
            </div>
            
            {/* Performance Badge */}
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 ${performanceConfig.color}`}>
              <PerformanceIcon className="w-3 h-3" />
              <span>{performanceConfig.label}</span>
            </div>
            
            {/* Actions Menu */}
            <div className="relative">
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Budget Usage</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {budgetUsed.toFixed(1)}% used
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-1">
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatNumber(campaign.impressions)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Impressions</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-1">
              <MousePointer className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatNumber(campaign.clicks)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Clicks</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-1">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {campaign.conversions}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Conversions</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {campaign.ctr}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">CTR</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(campaign.cpc)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">CPC</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {campaign.roas}x
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">ROAS</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleAction('edit', campaign.id)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Edit Campaign"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleAction('copy', campaign.id)}
              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Duplicate Campaign"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleAction('delete', campaign.id)}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete Campaign"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Recent Campaigns
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor your advertising campaigns
          </p>
        </div>
        
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="ended">Ended</option>
            <option value="draft">Draft</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="budget">Sort by Budget</option>
            <option value="performance">Sort by Performance</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredCampaigns.length > 0 ? (
        <div className="space-y-4">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No campaigns found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first campaign"
            }
          </p>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto">
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      )}

      {/* Summary Footer */}
      {!isLoading && filteredCampaigns.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Showing {filteredCampaigns.length} of {campaigns.length} campaigns
            </span>
            <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
              <span>Total Budget: {formatCurrency(filteredCampaigns.reduce((sum, c) => sum + c.budget, 0))}</span>
              <span>Total Spent: {formatCurrency(filteredCampaigns.reduce((sum, c) => sum + c.spent, 0))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentCampaigns;

