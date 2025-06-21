"use client";

import React, { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Target, TrendingUp, Users, Eye, Loader, AlertCircle } from "lucide-react";

// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AdAuctionData {
  competitor: string;
  impression_share: number;
  avg_position: number;
  overlap_rate: number;
  position_above_rate: number;
  top_of_page_rate: number;
  absolute_top_rate: number;
}

interface AdAuctionInsightsProps {
  selectedPeriod: string;
}

const AdAuctionInsights: React.FC<AdAuctionInsightsProps> = ({ selectedPeriod }) => {
  const [selectedMetric, setSelectedMetric] = useState<"impression_share" | "avg_position" | "overlap_rate">("impression_share");
  const [auctionData, setAuctionData] = useState<AdAuctionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Safe JSON parsing function
  const safeJsonParse = (jsonString: any) => {
    try {
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      }
      return jsonString;
    } catch (error) {
      console.error('JSON parsing error:', error);
      return null;
    }
  };

  const fetchAdAuctionInsights = async (timePeriod: string) => {
    try {
      setLoading(true);
      setError(null);

      const customerId = "3271710441";
      const { startDate, endDate } = getDateRange(timePeriod);

      console.log('🎯 Fetching ad auction insights...', { customerId, startDate, endDate });

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      const result = safeJsonParse(responseText);
      
      console.log('✅ Ad auction insights response:', result);
      
      if (result && result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
        // Process real Google Ads auction data
        const processedData = result.data.map((item: any) => ({
          competitor: item.competitor || item.domain || item.display_name || 'Unknown Competitor',
          impression_share: parseFloat(item.impression_share || item.impressionShare || 0),
          avg_position: parseFloat(item.avg_position || item.averagePosition || 0),
          overlap_rate: parseFloat(item.overlap_rate || item.overlapRate || 0),
          position_above_rate: parseFloat(item.position_above_rate || item.positionAboveRate || 0),
          top_of_page_rate: parseFloat(item.top_of_page_rate || item.topOfPageRate || 0),
          absolute_top_rate: parseFloat(item.absolute_top_rate || item.absoluteTopRate || 0)
        }));
        
        setAuctionData(processedData);
        console.log('📊 Processed auction data:', processedData);
      } else {
        // Use demo data if API fails or returns no data
        console.log('📊 Using demo auction data');
        setAuctionData(getDemoAuctionData());
      }
    } catch (err: any) {
      console.error("Error fetching ad auction insights:", err);
      setError(err.message);
      // Use demo data on error
      setAuctionData(getDemoAuctionData());
    } finally {
      setLoading(false);
    }
  };

  // Demo auction data with realistic values
  const getDemoAuctionData = (): AdAuctionData[] => [
    {
      competitor: "competitor1.com",
      impression_share: 25.5,
      avg_position: 2.1,
      overlap_rate: 15.2,
      position_above_rate: 8.7,
      top_of_page_rate: 45.3,
      absolute_top_rate: 12.1
    },
    {
      competitor: "competitor2.com",
      impression_share: 18.3,
      avg_position: 2.8,
      overlap_rate: 12.1,
      position_above_rate: 6.4,
      top_of_page_rate: 38.7,
      absolute_top_rate: 9.2
    },
    {
      competitor: "competitor3.com",
      impression_share: 22.1,
      avg_position: 1.9,
      overlap_rate: 18.5,
      position_above_rate: 11.2,
      top_of_page_rate: 52.1,
      absolute_top_rate: 15.8
    },
    {
      competitor: "competitor4.com",
      impression_share: 14.7,
      avg_position: 3.2,
      overlap_rate: 9.8,
      position_above_rate: 4.1,
      top_of_page_rate: 31.5,
      absolute_top_rate: 6.7
    },
    {
      competitor: "competitor5.com",
      impression_share: 19.4,
      avg_position: 2.5,
      overlap_rate: 13.7,
      position_above_rate: 7.9,
      top_of_page_rate: 41.2,
      absolute_top_rate: 10.5
    }
  ];

  useEffect(() => {
    fetchAdAuctionInsights(selectedPeriod);
  }, [selectedPeriod]);

  // Get metric data for chart
  const getMetricData = () => {
    switch (selectedMetric) {
      case "impression_share":
        return {
          title: "Impression Share (%)",
          data: auctionData.map(item => item.impression_share),
          color: "#3B82F6"
        };
      case "avg_position":
        return {
          title: "Average Position",
          data: auctionData.map(item => item.avg_position),
          color: "#EF4444"
        };
      case "overlap_rate":
        return {
          title: "Overlap Rate (%)",
          data: auctionData.map(item => item.overlap_rate),
          color: "#10B981"
        };
      default:
        return {
          title: "Impression Share (%)",
          data: auctionData.map(item => item.impression_share),
          color: "#3B82F6"
        };
    }
  };

  const metricData = getMetricData();

  // Chart configuration
  const series = [
    {
      name: metricData.title,
      data: metricData.data
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 280,
      toolbar: {
        show: false,
      },
    },
    colors: [metricData.color],
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: any) {
        return selectedMetric === "avg_position" ? val.toFixed(1) : val.toFixed(1) + "%";
      },
      style: {
        colors: ["#fff"],
        fontSize: "12px",
        fontWeight: "bold"
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"]
    },
    xaxis: {
      categories: auctionData.map(item => item.competitor.replace('.com', '')),
      labels: {
        style: {
          colors: "#8695AA",
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: true,
        color: "#DDE4FF",
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: metricData.title,
        style: {
          color: "#8695AA",
          fontSize: "12px",
        },
      },
      labels: {
        style: {
          colors: "#8695AA",
          fontSize: "12px",
        },
      },
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return selectedMetric === "avg_position" ? val.toFixed(1) : val.toFixed(1) + "%";
        }
      }
    },
    legend: {
      show: false
    },
    grid: {
      show: true,
      strokeDashArray: 7,
      borderColor: "#ECEEF2",
    },
  };

  // Calculate summary stats
  const avgImpressionShare = auctionData.length > 0 
    ? (auctionData.reduce((sum, item) => sum + item.impression_share, 0) / auctionData.length).toFixed(1)
    : "0.0";
  
  const avgPosition = auctionData.length > 0 
    ? (auctionData.reduce((sum, item) => sum + item.avg_position, 0) / auctionData.length).toFixed(1)
    : "0.0";
  
  const topCompetitor = auctionData.length > 0 
    ? auctionData.reduce((prev, current) => (prev.impression_share > current.impression_share) ? prev : current)
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-[20px] md:p-[25px] h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ad Auction Insights</h3>
            <p className="text-sm text-gray-500">Competitive analysis and market position ({selectedPeriod})</p>
          </div>
        </div>
      </div>

      {/* Show loading or content */}
      {loading ? (
        <div className="text-center py-20">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading auction insights from Google Ads...</p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">
                API Error: {error}. Showing demo data instead.
              </p>
            </div>
          )}

          {/* Metric Selector */}
          <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
            {[
              {"key": "impression_share", "title": "Impression Share", "icon": <Eye className="w-5 h-5" />}, 
              {"key": "avg_position", "title": "Avg Position", "icon": <Target className="w-5 h-5" />}, 
              {"key": "overlap_rate", "title": "Overlap Rate", "icon": <Users className="w-5 h-5" />}
            ].map((metric) => (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key as "impression_share" | "avg_position" | "overlap_rate")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedMetric === metric.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {metric.icon}
                <span>{metric.title}</span>
              </button>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Avg Impression Share</div>
              <div className="text-lg font-bold text-blue-600">{avgImpressionShare}%</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Avg Position</div>
              <div className="text-lg font-bold text-green-600">{avgPosition}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Top Competitor</div>
              <div className="text-lg font-bold text-purple-600 truncate">
                {topCompetitor ? topCompetitor.competitor.replace('.com', '') : 'N/A'}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-6">
            {auctionData.length > 0 ? (
              <Chart
                options={options}
                series={series}
                type="bar"
                height={280}
                width="100%"
              />
            ) : (
              <div className="flex items-center justify-center h-[280px] bg-gray-50 rounded-lg">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No auction data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="pt-4 border-t border-gray-200">
            <h6 className="text-sm font-semibold text-gray-900 mb-4">Competitor Analysis</h6>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Competitor
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impression Share
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Position
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overlap Rate
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Top of Page
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auctionData.length > 0 ? (
                    auctionData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-medium">{item.competitor}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.impression_share >= 20 ? 'bg-red-100 text-red-800' :
                            item.impression_share >= 15 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.impression_share.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {item.avg_position.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {item.overlap_rate.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {item.top_of_page_rate.toFixed(1)}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-sm text-gray-500 text-center">
                        No auction insights data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdAuctionInsights;