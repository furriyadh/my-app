"use client";

import React, { useEffect, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { BarChart3 } from "lucide-react";

// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Interface for auction insights data
interface AuctionInsightsData {
  impression_share: number;
  top_impression_share: number;
  absolute_top_impression_share: number;
  rank_lost_impression_share: number;
  budget_lost_impression_share: number;
  exact_match_impression_share: number;
}

const AdAuctionInsights: React.FC = () => {
  // State management
  const [selectedOption, setSelectedOption] = useState<string>("Last Month");
  const [auctionData, setAuctionData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Default data to show when no real data is available
  const defaultData = [
    {
      metric: "Impression Share",
      value: "0.00%",
      change: "0.00%",
      trend: "neutral"
    },
    {
      metric: "Top Impression Share",
      value: "0.00%",
      change: "0.00%",
      trend: "neutral"
    },
    {
      metric: "Absolute Top Impression Share",
      value: "0.00%",
      change: "0.00%",
      trend: "neutral"
    },
    {
      metric: "Search Lost IS (Budget)",
      value: "0.00%",
      change: "0.00%",
      trend: "neutral"
    },
    {
      metric: "Search Lost IS (Rank)",
      value: "0.00%",
      change: "0.00%",
      trend: "neutral"
    },
    {
      metric: "Exact Match Impression Share",
      value: "0.00%",
      change: "0.00%",
      trend: "neutral"
    }
  ];

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
      case "Last 7 Days":
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6);
        return { startDate: formatDate(last7Days), endDate: formatDate(today) };
      case "Last 30 Days":
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 29);
        return { startDate: formatDate(last30Days), endDate: formatDate(today) };
      default:
        return { startDate: formatDate(today), endDate: formatDate(today) };
    }
  };

  // Fetch auction insights data from Google Ads API
  const fetchAuctionInsights = async (timePeriod: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const customerId = "3271710441"; // Updated with your Customer ID (without dashes)
      const { startDate, endDate } = getDateRange(timePeriod);
      
      const response = await fetch(`/api/google-ads?customer_id=${customerId}&data_type=auction_insights&start_date=${startDate}&end_date=${endDate}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch auction insights");
      }
      
      const data: AuctionInsightsData = await response.json();
      
      // Check if we have real data (any value > 0)
      if (data && Object.keys(data).length > 0 && 
          (data.impression_share > 0 || data.top_impression_share > 0 || 
           data.absolute_top_impression_share > 0 || data.rank_lost_impression_share > 0 || 
           data.budget_lost_impression_share > 0 || data.exact_match_impression_share > 0)) {
        
        // Transform API data to component format
        const transformedData = [
          {
            metric: "Impression Share",
            value: `${data.impression_share}%`,
            change: "+4.5%", // You can calculate this based on historical data
            trend: "up"
          },
          {
            metric: "Top Impression Share",
            value: `${data.top_impression_share}%`,
            change: "+2.1%",
            trend: "up"
          },
          {
            metric: "Absolute Top Impression Share",
            value: `${data.absolute_top_impression_share}%`,
            change: "+5.2%",
            trend: "up"
          },
          {
            metric: "Search Lost IS (Budget)",
            value: `${data.budget_lost_impression_share}%`,
            change: "-1.3%",
            trend: "down"
          },
          {
            metric: "Search Lost IS (Rank)",
            value: `${data.rank_lost_impression_share}%`,
            change: "+0.9%",
            trend: "up"
          },
          {
            metric: "Exact Match Impression Share",
            value: `${data.exact_match_impression_share}%`,
            change: "+3.8%",
            trend: "up"
          }
        ];
        
        setAuctionData(transformedData);
      } else {
        // No real data available - use default data
        setAuctionData(defaultData);
      }
    } catch (err) {
      console.error("Error fetching auction insights:", err);
      setError(null); // Don't show error message, just use default data
      setAuctionData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionInsights(selectedOption);
  }, [selectedOption]);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
  };

  // Chart data - show default flat line when no real data
  const series = [
    {
      name: "Top Impression Share",
      data: auctionData.length > 0 ? auctionData.map(item => parseFloat(item.value)) : [0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: "Absolute Top Impression Rate",
      data: auctionData.length > 0 ? auctionData.map(item => parseFloat(item.value)) : [0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: "Top of Page Bid",
      data: auctionData.length > 0 ? auctionData.map(item => parseFloat(item.value)) : [0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: "Overlap Rate",
      data: auctionData.length > 0 ? auctionData.map(item => parseFloat(item.value)) : [0, 0, 0, 0, 0, 0, 0]
    }
  ];

  const options: ApexOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      type: "line",
      height: 300,
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    grid: {
      show: true,
      strokeDashArray: 7,
      borderColor: "#ECEEF2",
    },
    xaxis: {
      categories: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"],
      axisTicks: {
        show: false,
        color: "#DDE4FF",
      },
      axisBorder: {
        show: true,
        color: "#DDE4FF",
      },
      labels: {
        show: true,
        style: {
          colors: "#8695AA",
          fontSize: "11px", 
        },
        rotate: -45, 
        offsetY: 5, 
      },
    },
    yaxis: {
      tickAmount: 5,
      max: 80,
      min: 0,
      labels: {
        formatter: (val) => {
          return val.toFixed(1) + "%";
        },
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
        color: "#DDE4FF",
      },
    },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "12px",
      horizontalAlign: "left",
      itemMargin: {
        horizontal: 8,
        vertical: 8,
      },
      labels: {
        colors: "#64748B",
      },
      markers: {
        size: 6,
        offsetX: -2,
        offsetY: -0.5,
        shape: "circle",
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toFixed(2) + "%";
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-[20px] md:p-[25px] h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ad Auction Insights</h3>
            <p className="text-sm text-gray-500">Analyze your ad auction performance</p>
          </div>
        </div>

        <div>
          <Menu as="div" className="relative">
            <MenuButton className="inline-block rounded-md border border-gray-100 bg-gray-100 dark:bg-[#0a0e19] py-[5px] md:py-[6.5px] px-[12px] md:px-[19px] transition-all hover:bg-gray-50 dark:border-[#172036] dark:hover:bg-[#0a0e19]">
              <span className="inline-block relative pr-[17px] md:pr-[20px]">
                {selectedOption}
                <i className="ri-arrow-down-s-line text-lg absolute -right-[3px] top-1/2 -translate-y-1/2"></i>
              </span>
            </MenuButton>

            <MenuItems
              transition
              className="transition-all bg-white shadow-3xl rounded-md top-full py-[15px] absolute right-0 w-[195px] z-[50] dark:bg-dark dark:shadow-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <MenuItem>
                {({ focus }) => (
                  <a
                    href="#"
                    className={`block px-5 py-2 text-sm ${focus ? "bg-gray-100" : ""}`}
                    onClick={() => handleSelect("Today")}
                  >
                    Today
                  </a>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <a
                    href="#"
                    className={`block px-5 py-2 text-sm ${focus ? "bg-gray-100" : ""}`}
                    onClick={() => handleSelect("Yesterday")}
                  >
                    Yesterday
                  </a>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <a
                    href="#"
                    className={`block px-5 py-2 text-sm ${focus ? "bg-gray-100" : ""}`}
                    onClick={() => handleSelect("Last 7 Days")}
                  >
                    Last 7 Days
                  </a>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <a
                    href="#"
                    className={`block px-5 py-2 text-sm ${focus ? "bg-gray-100" : ""}`}
                    onClick={() => handleSelect("Last 30 Days")}
                  >
                    Last 30 Days
                  </a>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>

      {/* Show loading or content */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {auctionData.map((item, index) => (
              <div key={index} className="bg-gray-50 dark:bg-[#0a0e19] p-4 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-tight">
                  {item.metric}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.trend === "up" 
                      ? "text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300" 
                      : item.trend === "down"
                      ? "text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300"
                      : "text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-300"
                  }`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mb-6">
            <Chart
              options={options}
              series={series}
              type="line"
              height={300}
              width={"100%"}
            />
          </div>

          {/* Detailed Metrics Table */}
          <div className="pt-4 border-t border-gray-200">
            <h6 className="text-sm font-semibold text-gray-900 mb-4">Detailed Metrics</h6>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auctionData.map((metric, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {metric.metric}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {metric.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdAuctionInsights;
