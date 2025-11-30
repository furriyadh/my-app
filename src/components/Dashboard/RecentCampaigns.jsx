"use client";

import React, { useState, useEffect } from "react";
import { getBackendUrl } from "@/lib/config";
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
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";

const RecentCampaigns = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [error, setError] = useState(null);

  // Load campaigns from API
  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const backendUrl = `${getBackendUrl()}/api`;

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter.toUpperCase());
      }

      const response = await fetch(`${backendUrl}/campaigns?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if available
          ...(typeof window !== 'undefined' && localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const formattedCampaigns = (result.data?.campaigns || result.campaigns || []).map(campaign => ({
          id: campaign.id,
          name: campaign.name || 'Unnamed Campaign',
          type: mapCampaignType(campaign.type || campaign.campaignType),
          status: mapCampaignStatus(campaign.status),
          budget: campaign.budget || 0,
          spent: campaign.cost || campaign.spent || 0,
          impressions: campaign.impressions || 0,
          clicks: campaign.clicks || 0,
          conversions: campaign.conversions || 0,
          ctr: campaign.ctr || 0,
          cpc: campaign.cpc || 0,
          roas: campaign.roas || 0,
          performance: calculatePerformance(campaign),
          startDate: campaign.created_date || campaign.start_date || new Date().toISOString(),
          endDate: campaign.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastModified: campaign.last_modified || campaign.created_date || 'Recently'
        }));
        
        setCampaigns(formattedCampaigns);
      } else {
        throw new Error(result.error || 'Failed to fetch campaigns');
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err.message);
      // Set empty campaigns on error
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const mapCampaignType = (type) => {
    const typeMap = {
      'SEARCH': 'Search',
      'DISPLAY': 'Display',
      'SHOPPING': 'Shopping',
      'VIDEO': 'Video',
      'APP': 'App',
      'PERFORMANCE_MAX': 'Performance Max',
      'DEMAND_GEN': 'Demand Gen'
    };
    return typeMap[type] || 'Search';
  };

  const mapCampaignStatus = (status) => {
    const statusMap = {
      'ENABLED': 'active',
      'PAUSED': 'paused',
      'REMOVED': 'ended',
      'DRAFT': 'draft'
    };
    return statusMap[status] || 'draft';
  };

  const calculatePerformance = (campaign) => {
    const roas = campaign.roas || 0;
    if (roas >= 4) return 'excellent';
    if (roas >= 2.5) return 'good';
    if (roas >= 1.5) return 'average';
    if (roas > 0) return 'poor';
    return 'pending';
  };

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

  // Status configurations - Updated for AnimatedWave background
  const statusConfigs = {
    active: {
      color: "text-green-200 drop-shadow-sm",
      bg: "bg-green-500/20 backdrop-blur-sm border border-green-300/30",
      icon: Play,
      label: "Active"
    },
    paused: {
      color: "text-yellow-200 drop-shadow-sm",
      bg: "bg-yellow-500/20 backdrop-blur-sm border border-yellow-300/30",
      icon: Pause,
      label: "Paused"
    },
    ended: {
      color: "text-gray-200 drop-shadow-sm",
      bg: "bg-gray-500/20 backdrop-blur-sm border border-gray-300/30",
      icon: CheckCircle,
      label: "Ended"
    },
    draft: {
      color: "text-blue-200 drop-shadow-sm",
      bg: "bg-blue-500/20 backdrop-blur-sm border border-blue-300/30",
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
        <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-blue-200/30 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-200/30 rounded-lg"></div>
              <div>
                <div className="w-48 h-4 bg-blue-200/30 rounded mb-2"></div>
                <div className="w-24 h-3 bg-blue-200/30 rounded"></div>
              </div>
            </div>
            <div className="w-20 h-6 bg-blue-200/30 rounded"></div>
          </div>
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-4 bg-blue-200/30 rounded mb-1 mx-auto"></div>
                <div className="w-16 h-3 bg-blue-200/30 rounded mx-auto"></div>
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
      <div className="  rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TypeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-800 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-md border border-blue-200/30 ${performanceConfig.color}`}>
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
            <span className="font-medium text-gray-900 dark:text-gray-800">
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
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-800">
              {formatNumber(campaign.impressions)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Impressions</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-1">
              <MousePointer className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-800">
              {formatNumber(campaign.clicks)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Clicks</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-1">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-800">
              {campaign.conversions}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Conversions</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-800">
              {campaign.ctr}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">CTR</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-800">
              {formatCurrency(campaign.cpc)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">CPC</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-800">
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-800 mb-2">
            {t.dashboard?.recentCampaigns || 'Recent Campaigns'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t.dashboard?.manageCampaigns || 'Manage and monitor your advertising campaigns'}
          </p>
        </div>
        
        <button 
          onClick={() => router.push('/campaign/new')}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t.campaign?.newCampaign || 'New Campaign'}</span>
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  dark:bg-gray-700 text-gray-900 dark:text-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  dark:bg-gray-700 text-gray-900 dark:text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  dark:bg-gray-700 text-gray-900 dark:text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      ) : error ? (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-800 mb-2">
            {t.dashboard?.errorLoadingCampaigns || 'Error loading campaigns'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button 
            onClick={fetchCampaigns}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
          >
            <Activity className="w-4 h-4" />
            <span>{t.common?.retry || 'Try Again'}</span>
          </button>
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="space-y-4">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-md border border-blue-200/30  rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-800 mb-2">
            {t.dashboard?.noCampaignsFound || 'No campaigns found'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== "all" 
              ? t.dashboard?.tryAdjustingFilters || "Try adjusting your search or filter criteria"
              : t.dashboard?.getStartedCampaign || "Get started by creating your first campaign"
            }
          </p>
          <button 
            onClick={() => router.push('/campaign/new')}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.campaign?.createCampaign || 'Create Campaign'}</span>
          </button>
        </div>
      )}

      {/* Summary Footer */}
      {!isLoading && filteredCampaigns.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md border border-blue-200/30 rounded-lg p-4">
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

