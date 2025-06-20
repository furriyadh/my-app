
'use client';
import AdAuctionInsights from '@/components/Dashboard/AdAuctionInsights';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AudienceInsights from '@/components/Dashboard/AudienceInsights';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Users, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Search,
  Plus,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  PieChart,
  Target,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

interface CampaignData {
  id: string;
  name: string;
  status: 'Enabled' | 'Paused' | 'Removed';
  type: 'Search' | 'Display' | 'Shopping' | 'Video' | 'Performance Max';
  budget: number;
  budgetType: 'Daily' | 'Shared';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  conversionRate: number;
  costPerConversion: number;
  searchImpressionShare: number;
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

const GoogleAdsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 7 days');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [metricCards, setMetricCards] = useState<MetricCard[]>([]);

  // Function to get date range based on selected option
  const getDateRange = (option: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (option) {
      case "Today":
        return { startDate: formatDate(today), endDate: formatDate(today) };
      case "Yesterday":
        return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) };
      case "Last 7 days":
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6);
        return { startDate: formatDate(last7Days), endDate: formatDate(today) };
      case "Last 14 days":
        const last14Days = new Date(today);
        last14Days.setDate(today.getDate() - 13);
        return { startDate: formatDate(last14Days), endDate: formatDate(today) };
      case "Last 30 days":
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 29);
        return { startDate: formatDate(last30Days), endDate: formatDate(today) };
      case "Last 90 days":
        const last90Days = new Date(today);
        last90Days.setDate(today.getDate() - 89);
        return { startDate: formatDate(last90Days), endDate: formatDate(today) };
      default:
        return { startDate: formatDate(today), endDate: formatDate(today) };
    }
  };

  // Fetch campaigns data from Google Ads API
  const fetchCampaignsData = async (timePeriod: string) => {
    try {
      setIsLoading(true);
      
      const customerId = "3271710441"; // Customer ID (without dashes)
      const { startDate, endDate } = getDateRange(timePeriod);
      
      const response = await fetch(`/api/google-ads?customer_id=${customerId}&data_type=campaigns&start_date=${startDate}&end_date=${endDate}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns data");
      }
      
      const data = await response.json();
      
      // Check if we have real data
      if (data && Array.isArray(data) && data.length > 0) {
        setCampaigns(data);
        
        // Calculate metrics from campaigns data
        const totalSpend = data.reduce((sum: number, campaign: any) => sum + (campaign.spend || 0), 0);
        const totalImpressions = data.reduce((sum: number, campaign: any) => sum + (campaign.impressions || 0), 0);
        const totalClicks = data.reduce((sum: number, campaign: any) => sum + (campaign.clicks || 0), 0);
        const totalConversions = data.reduce((sum: number, campaign: any) => sum + (campaign.conversions || 0), 0);
        const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
        
        const calculatedMetrics: MetricCard[] = [
          {
            title: 'Total Spend',
            value: `$${totalSpend.toFixed(2)}`,
            change: '+12.5%',
            trend: 'up',
            icon: <DollarSign className="w-6 h-6" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Impressions',
            value: totalImpressions.toLocaleString(),
            change: '+8.3%',
            trend: 'up',
            icon: <Eye className="w-6 h-6" />,
            color: 'bg-green-500'
          },
          {
            title: 'Clicks',
            value: totalClicks.toLocaleString(),
            change: '+15.2%',
            trend: 'up',
            icon: <MousePointer className="w-6 h-6" />,
            color: 'bg-purple-500'
          },
          {
            title: 'CTR',
            value: `${avgCtr.toFixed(2)}%`,
            change: '+0.3%',
            trend: 'up',
            icon: <Target className="w-6 h-6" />,
            color: 'bg-orange-500'
          },
          {
            title: 'Avg. CPC',
            value: `$${avgCpc.toFixed(2)}`,
            change: '-5.1%',
            trend: 'down',
            icon: <DollarSign className="w-6 h-6" />,
            color: 'bg-red-500'
          },
          {
            title: 'Conversions',
            value: totalConversions.toLocaleString(),
            change: '+22.1%',
            trend: 'up',
            icon: <Users className="w-6 h-6" />,
            color: 'bg-indigo-500'
          }
        ];
        
        setMetricCards(calculatedMetrics);
      } else {
        // No real data available - set to default zero values
        setCampaigns([]);
        setMetricCards([
          {
            title: 'Total Spend',
            value: '$0.00',
            change: '0.0%',
            trend: 'up' as const,
            icon: <DollarSign className="w-6 h-6" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Impressions',
            value: '0',
            change: '0.0%',
            trend: 'up' as const,
            icon: <Eye className="w-6 h-6" />,
            color: 'bg-green-500'
          },
          {
            title: 'Clicks',
            value: '0',
            change: '0.0%',
            trend: 'up' as const,
            icon: <MousePointer className="w-6 h-6" />,
            color: 'bg-purple-500'
          },
          {
            title: 'CTR',
            value: '0.00%',
            change: '0.0%',
            trend: 'up' as const,
            icon: <Target className="w-6 h-6" />,
            color: 'bg-orange-500'
          },
          {
            title: 'Avg. CPC',
            value: '$0.00',
            change: '0.0%',
            trend: 'up' as const,
            icon: <DollarSign className="w-6 h-6" />,
            color: 'bg-red-500'
          },
          {
            title: 'Conversions',
            value: '0',
            change: '0.0%',
            trend: 'up' as const,
            icon: <Users className="w-6 h-6" />,
            color: 'bg-indigo-500'
          }
        ]);
      }
    } catch (err) {
      console.error("Error fetching campaigns data:", err);
      setCampaigns([]);
      setMetricCards([
        {
          title: 'Total Spend',
          value: '$0.00',
          change: '0.0%',
          trend: 'up' as const,
          icon: <DollarSign className="w-6 h-6" />,
          color: 'bg-blue-500'
        },
        {
          title: 'Impressions',
          value: '0',
          change: '0.0%',
          trend: 'up' as const,
          icon: <Eye className="w-6 h-6" />,
          color: 'bg-green-500'
        },
        {
          title: 'Clicks',
          value: '0',
          change: '0.0%',
          trend: 'up' as const,
          icon: <MousePointer className="w-6 h-6" />,
          color: 'bg-purple-500'
        },
        {
          title: 'CTR',
          value: '0.00%',
          change: '0.0%',
          trend: 'up' as const,
          icon: <Target className="w-6 h-6" />,
          color: 'bg-orange-500'
        },
        {
          title: 'Avg. CPC',
          value: '$0.00',
          change: '0.0%',
          trend: 'up' as const,
          icon: <DollarSign className="w-6 h-6" />,
          color: 'bg-red-500'
        },
        {
          title: 'Conversions',
          value: '0',
          change: '0.0%',
          trend: 'up' as const,
          icon: <Users className="w-6 h-6" />,
          color: 'bg-indigo-500'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignsData(selectedPeriod);
  }, [selectedPeriod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enabled':
        return 'text-green-600 bg-green-50';
      case 'Paused':
        return 'text-yellow-600 bg-yellow-50';
      case 'Removed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'Search':
        return <Search className="w-4 h-4" />;
      case 'Display':
        return <Monitor className="w-4 h-4" />;
      case 'Shopping':
        return <DollarSign className="w-4 h-4" />;
      case 'Video':
        return <Play className="w-4 h-4" />;
      case 'Performance Max':
        return <Target className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold">G</span>
              </div>
              Google Ads Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage and optimize your Google Ads campaigns</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 days</option>
              <option>Last 14 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <Link href="/dashboard?section=new-campaign" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {metricCards.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.color} p-3 rounded-lg text-white`}>
                  {metric.icon}
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {metric.change}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                <p className="text-gray-600 text-sm">{metric.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Ad Auction Insights */}
        <div className="lg:col-span-1">
          <AdAuctionInsights />
        </div>
        
        {/* Audience Insights */}
        <div className="lg:col-span-1">
          <AudienceInsights />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Campaigns</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Enabled">Enabled</option>
                <option value="Paused">Paused</option>
                <option value="Removed">Removed</option>
              </select>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => fetchCampaignsData(selectedPeriod)}>
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading campaigns...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. CPC</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <span className="mr-2">{getCampaignTypeIcon(campaign.type)}</span>
                          {campaign.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${campaign.budget.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${campaign.spend.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.impressions.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.clicks.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.ctr.toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${campaign.avgCpc.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.conversions.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No campaigns data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAdsDashboard;


