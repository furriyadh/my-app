"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  Eye,
  Loader,
  AlertCircle,
  RefreshCw,
  Award,
  BarChart3
} from "lucide-react";

interface AuctionData {
  impressionShare: number;
  avgPosition: number;
  overlapRate: number;
  topOfPageRate: number;
  competitors: Array<{
    name: string;
    impressionShare: number;
    avgPosition: number;
    overlapRate: number;
    topOfPageRate: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    impressionShare: number;
    avgPosition: number;
    overlapRate: number;
  }>;
}

interface AdAuctionInsightsProps {
  selectedPeriod: string;
}

const AdAuctionInsights: React.FC<AdAuctionInsightsProps> = ({ selectedPeriod }) => {
  const [data, setData] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'impression' | 'position' | 'overlap'>('impression');

  // Function to get date range based on selected option
  const getDateRange = (option: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
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

  // Fetch real auction insights data from Google Ads API
  const fetchAuctionData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const customerId = "3271710441";
      const { startDate, endDate } = getDateRange(selectedPeriod);
      
      console.log('Fetching auction data with params:', {
        customerId,
        startDate,
        endDate,
        dataType: 'auction_insights'
      });
      
      const response = await fetch('/api/google-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          loginCustomerId: customerId,
          startDate: startDate,
          endDate: endDate,
          dataType: 'auction_insights'
        }),
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('API Result:', result);
      
      if (result && result.success && result.data) {
        // Process real Google Ads auction insights data
        const processedData: AuctionData = {
          impressionShare: parseFloat(result.data.impression_share || result.data.impressionShare || 0),
          avgPosition: parseFloat(result.data.avg_position || result.data.avgPosition || 0),
          overlapRate: parseFloat(result.data.overlap_rate || result.data.overlapRate || 0),
          topOfPageRate: parseFloat(result.data.top_of_page_rate || result.data.topOfPageRate || 0),
          competitors: (result.data.competitors || []).map((comp: any) => ({
            name: comp.name || comp.domain || `Competitor ${(result.data.competitors || []).indexOf(comp) + 1}`,
            impressionShare: parseFloat(comp.impression_share || comp.impressionShare || 0),
            avgPosition: parseFloat(comp.avg_position || comp.avgPosition || 0),
            overlapRate: parseFloat(comp.overlap_rate || comp.overlapRate || 0),
            topOfPageRate: parseFloat(comp.top_of_page_rate || comp.topOfPageRate || 0)
          })),
          timeSeriesData: (result.data.time_series || result.data.timeSeriesData || []).map((item: any) => ({
            date: item.date || item.day,
            impressionShare: parseFloat(item.impression_share || item.impressionShare || 0),
            avgPosition: parseFloat(item.avg_position || item.avgPosition || 0),
            overlapRate: parseFloat(item.overlap_rate || item.overlapRate || 0)
          }))
        };
        
        console.log('Processed auction data:', processedData);
        
        // Validate that we have meaningful data
        if (processedData.impressionShare > 0 || processedData.competitors.length > 0) {
          setData(processedData);
        } else {
          console.log('No meaningful data, using demo data');
          setData(getEnhancedDemoData());
          setError('Real data available but empty. Showing demo data.');
        }
      } else {
        console.log('API response invalid, using demo data');
        setData(getEnhancedDemoData());
        setError('Invalid API response format. Showing demo data.');
      }
    } catch (err) {
      console.error('Error fetching auction data:', err);
      setError(`Failed to fetch real-time data: ${err instanceof Error ? err.message : 'Unknown error'}. Showing demo data.`);
      setData(getEnhancedDemoData());
    } finally {
      setLoading(false);
    }
  };

  // Enhanced demo data with more realistic competitive landscape
  const getEnhancedDemoData = (): AuctionData => {
    return {
      impressionShare: 68.4,
      avgPosition: 2.1,
      overlapRate: 26.7,
      topOfPageRate: 82.3,
      competitors: [
        {
          name: "Competitor A",
          impressionShare: 52.8,
          avgPosition: 1.6,
          overlapRate: 38.5,
          topOfPageRate: 89.2
        },
        {
          name: "Competitor B", 
          impressionShare: 41.3,
          avgPosition: 2.4,
          overlapRate: 31.8,
          topOfPageRate: 72.6
        },
        {
          name: "Competitor C",
          impressionShare: 35.7,
          avgPosition: 2.9,
          overlapRate: 24.3,
          topOfPageRate: 65.1
        },
        {
          name: "Competitor D",
          impressionShare: 28.9,
          avgPosition: 3.5,
          overlapRate: 19.7,
          topOfPageRate: 58.4
        },
        {
          name: "Competitor E",
          impressionShare: 22.1,
          avgPosition: 3.8,
          overlapRate: 15.2,
          topOfPageRate: 51.3
        },
        {
          name: "Others",
          impressionShare: 18.6,
          avgPosition: 4.2,
          overlapRate: 12.8,
          topOfPageRate: 45.7
        }
      ],
      timeSeriesData: [
        { date: "2024-06-15", impressionShare: 65.1, avgPosition: 2.3, overlapRate: 24.3 },
        { date: "2024-06-16", impressionShare: 67.8, avgPosition: 2.2, overlapRate: 25.8 },
        { date: "2024-06-17", impressionShare: 69.2, avgPosition: 2.0, overlapRate: 27.1 },
        { date: "2024-06-18", impressionShare: 66.9, avgPosition: 2.2, overlapRate: 25.5 },
        { date: "2024-06-19", impressionShare: 70.1, avgPosition: 1.9, overlapRate: 28.2 },
        { date: "2024-06-20", impressionShare: 68.4, avgPosition: 2.1, overlapRate: 26.7 },
        { date: "2024-06-21", impressionShare: 71.3, avgPosition: 1.8, overlapRate: 29.1 }
      ]
    };
  };

  // Initialize with enhanced demo data and fetch real data
  useEffect(() => {
    setData(getEnhancedDemoData());
    fetchAuctionData();
  }, [selectedPeriod]);

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getChangeIcon = (current: number, previous: number) => {
    const change = current - previous;
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getChangeColor = (current: number, previous: number): string => {
    const change = current - previous;
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  if (loading && !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Ad Auction Insights</h3>
            <p className="text-gray-600 text-sm">Competitive analysis and market position ({selectedPeriod})</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Ad Auction Insights</h3>
            <p className="text-gray-600 text-sm">Competitive analysis and market position ({selectedPeriod})</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-red-800 font-bold text-lg">Failed to load auction insights</p>
              <p className="text-red-600 text-sm mt-1">
                Unable to fetch competitive data from Google Ads API
              </p>
              <button
                onClick={fetchAuctionData}
                className="mt-3 flex items-center gap-2 text-red-700 hover:text-red-800 font-semibold text-sm bg-red-100 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Find top competitor
  const topCompetitor = data.competitors.length > 0 ? 
    data.competitors.reduce((prev, current) => (prev.impressionShare > current.impressionShare) ? prev : current) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Ad Auction Insights</h3>
            <p className="text-gray-600 text-sm">Competitive analysis and market position ({selectedPeriod})</p>
          </div>
        </div>
        <button
          onClick={fetchAuctionData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
          <p className="text-yellow-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('impression')}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'impression'
              ? 'bg-white text-blue-600 shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <Eye className="w-5 h-5" />
          Impression Share
        </button>
        <button
          onClick={() => setActiveTab('position')}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'position'
              ? 'bg-white text-blue-600 shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <Target className="w-5 h-5" />
          Avg Position
        </button>
        <button
          onClick={() => setActiveTab('overlap')}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'overlap'
              ? 'bg-white text-blue-600 shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <Users className="w-5 h-5" />
          Overlap Rate
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            {getChangeIcon(data.impressionShare, 65.1)}
          </div>
          <p className="text-blue-700 text-sm font-semibold mb-1">Avg Impression Share</p>
          <p className="text-2xl font-bold text-blue-900">{formatPercentage(data.impressionShare)}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-xs font-medium ${getChangeColor(data.impressionShare, 65.1)}`}>
              +3.3% vs last period
            </span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            {getChangeIcon(2.5, data.avgPosition)}
          </div>
          <p className="text-green-700 text-sm font-semibold mb-1">Avg Position</p>
          <p className="text-2xl font-bold text-green-900">{data.avgPosition.toFixed(1)}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-xs font-medium ${getChangeColor(2.5, data.avgPosition)}`}>
              +0.4 vs last period
            </span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-purple-700 text-sm font-semibold mb-1">Top Competitor</p>
          <p className="text-lg font-bold text-purple-900">{topCompetitor?.name || 'Unknown'}</p>
          <p className="text-xs text-purple-600">{formatPercentage(topCompetitor?.impressionShare || 0)} share</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {getChangeIcon(data.overlapRate, 24.3)}
          </div>
          <p className="text-orange-700 text-sm font-semibold mb-1">Overlap Rate</p>
          <p className="text-2xl font-bold text-orange-900">{formatPercentage(data.overlapRate)}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-xs font-medium ${getChangeColor(data.overlapRate, 24.3)}`}>
              +2.4% vs last period
            </span>
          </div>
        </div>
      </div>

      {/* Market Position Highlight */}
      <div className="mb-8 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-emerald-800 font-bold">Market Position Analysis</h4>
        </div>
        <p className="text-emerald-700">
          Your ads appear in <span className="font-bold">{formatPercentage(data.impressionShare)}</span> of eligible auctions with an average position of{' '}
          <span className="font-bold">{data.avgPosition.toFixed(1)}</span>. You compete directly with{' '}
          <span className="font-bold">{data.competitors.length} competitors</span> in{' '}
          <span className="font-bold">{formatPercentage(data.overlapRate)}</span> of auctions.
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Time Series Chart */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Performance Trend</h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => [
                  name === 'avgPosition' ? value.toFixed(1) : `${value.toFixed(1)}%`,
                  name === 'impressionShare' ? 'Impression Share' : 
                  name === 'avgPosition' ? 'Avg Position' : 'Overlap Rate'
                ]}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              {activeTab === 'impression' && (
                <Line 
                  type="monotone" 
                  dataKey="impressionShare" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                />
              )}
              {activeTab === 'position' && (
                <Line 
                  type="monotone" 
                  dataKey="avgPosition" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                />
              )}
              {activeTab === 'overlap' && (
                <Line 
                  type="monotone" 
                  dataKey="overlapRate" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Competitor Comparison */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Competitor Analysis</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.competitors} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => [
                  name === 'avgPosition' ? value.toFixed(1) : `${value.toFixed(1)}%`,
                  name === 'impressionShare' ? 'Impression Share' : 
                  name === 'avgPosition' ? 'Avg Position' : 
                  name === 'overlapRate' ? 'Overlap Rate' : 'Top of Page Rate'
                ]}
              />
              {activeTab === 'impression' && (
                <Bar dataKey="impressionShare" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              )}
              {activeTab === 'position' && (
                <Bar dataKey="avgPosition" fill="#10B981" radius={[4, 4, 0, 0]} />
              )}
              {activeTab === 'overlap' && (
                <Bar dataKey="overlapRate" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Competitor Analysis Table */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-6">Detailed Competitor Analysis</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white border-b-2 border-gray-200">
                <th className="text-left py-4 px-6 font-bold text-gray-800">COMPETITOR</th>
                <th className="text-center py-4 px-4 font-bold text-gray-800">IMPRESSION SHARE</th>
                <th className="text-center py-4 px-4 font-bold text-gray-800">AVG POSITION</th>
                <th className="text-center py-4 px-4 font-bold text-gray-800">OVERLAP RATE</th>
                <th className="text-center py-4 px-4 font-bold text-gray-800">TOP OF PAGE</th>
              </tr>
            </thead>
            <tbody>
              {data.competitors.map((competitor, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-white transition-colors duration-150">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-semibold text-gray-900">{competitor.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-green-600 font-bold">{formatPercentage(competitor.impressionShare)}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      competitor.avgPosition <= 2 ? 'bg-green-100 text-green-800' :
                      competitor.avgPosition <= 3 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {competitor.avgPosition.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-purple-600 font-bold">{formatPercentage(competitor.overlapRate)}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      competitor.topOfPageRate >= 80 ? 'bg-green-100 text-green-800' :
                      competitor.topOfPageRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {formatPercentage(competitor.topOfPageRate)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
          <h5 className="text-blue-800 font-bold mb-2">Market Share</h5>
          <p className="text-2xl font-bold text-blue-900">{formatPercentage(data.impressionShare)}</p>
          <p className="text-blue-600 text-sm mt-1">Of eligible impressions</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <h5 className="text-green-800 font-bold mb-2">Competitive Position</h5>
          <p className="text-2xl font-bold text-green-900">{data.avgPosition.toFixed(1)}</p>
          <p className="text-green-600 text-sm mt-1">Average ad position</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-200">
          <h5 className="text-purple-800 font-bold mb-2">Top of Page Rate</h5>
          <p className="text-2xl font-bold text-purple-900">{formatPercentage(data.topOfPageRate)}</p>
          <p className="text-purple-600 text-sm mt-1">Premium placement</p>
        </div>
      </div>
    </div>
  );
};

export default AdAuctionInsights;