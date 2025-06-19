'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [isLoading, setIsLoading] = useState(false);

  // Sample data - في التطبيق الحقيقي، ستأتي هذه البيانات من API
  const campaigns: CampaignData[] = [
    {
      id: '1',
      name: 'Search Campaign - Brand Keywords',
      status: 'Enabled',
      type: 'Search',
      budget: 50,
      budgetType: 'Daily',
      spend: 342.50,
      impressions: 12450,
      clicks: 523,
      ctr: 4.2,
      avgCpc: 0.65,
      cost: 342.50,
      conversions: 23,
      conversionRate: 4.4,
      costPerConversion: 14.89,
      searchImpressionShare: 78.5
    },
    {
      id: '2',
      name: 'Display Campaign - Remarketing',
      status: 'Enabled',
      type: 'Display',
      budget: 30,
      budgetType: 'Daily',
      spend: 198.75,
      impressions: 45230,
      clicks: 234,
      ctr: 0.52,
      avgCpc: 0.85,
      cost: 198.75,
      conversions: 12,
      conversionRate: 5.1,
      costPerConversion: 16.56,
      searchImpressionShare: 0
    },
    {
      id: '3',
      name: 'Shopping Campaign - Product Ads',
      status: 'Paused',
      type: 'Shopping',
      budget: 75,
      budgetType: 'Daily',
      spend: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      avgCpc: 0,
      cost: 0,
      conversions: 0,
      conversionRate: 0,
      costPerConversion: 0,
      searchImpressionShare: 0
    },
    {
      id: '4',
      name: 'Performance Max - All Products',
      status: 'Enabled',
      type: 'Performance Max',
      budget: 100,
      budgetType: 'Daily',
      spend: 567.25,
      impressions: 23450,
      clicks: 892,
      ctr: 3.8,
      avgCpc: 0.64,
      cost: 567.25,
      conversions: 45,
      conversionRate: 5.0,
      costPerConversion: 12.61,
      searchImpressionShare: 85.2
    }
  ];

  const metricCards: MetricCard[] = [
    {
      title: 'Total Spend',
      value: '$1,108.50',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Impressions',
      value: '81,130',
      change: '+8.3%',
      trend: 'up',
      icon: <Eye className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Clicks',
      value: '1,649',
      change: '+15.2%',
      trend: 'up',
      icon: <MousePointer className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'CTR',
      value: '2.03%',
      change: '+0.3%',
      trend: 'up',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Avg. CPC',
      value: '$0.67',
      change: '-5.1%',
      trend: 'down',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-red-500'
    },
    {
      title: 'Conversions',
      value: '80',
      change: '+22.1%',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-indigo-500'
    }
  ];

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <BarChart3 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Performance chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Campaign Types Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Types</h3>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <PieChart className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Campaign distribution chart will be displayed here</p>
            </div>
          </div>
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
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. CPC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                        } else {
                          setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getCampaignTypeIcon(campaign.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${campaign.budget.toFixed(2)} / {campaign.budgetType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${campaign.spend.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.impressions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.clicks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.ctr.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${campaign.avgCpc.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.conversions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.conversionRate.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Play className="w-5 h-5" />
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-900">
                        <Pause className="w-5 h-5" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Copy className="w-5 h-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GoogleAdsDashboard;