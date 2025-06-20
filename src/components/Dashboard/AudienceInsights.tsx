"use client";

import React, { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { BarChart3, Users, TrendingUp, Eye } from "lucide-react";

// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AudienceDemographicsData {
  age_range: string;
  gender: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

const AudienceInsights: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<"age" | "gender" | "income">("age");
  const [selectedOption, setSelectedOption] = useState<string>("Today");
  const [audienceData, setAudienceData] = useState<AudienceDemographicsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to get date range based on selected option
  const getDateRange = (option: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 6);

    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 29);

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
      case "Last 7 Days":
        return { startDate: formatDate(last7Days), endDate: formatDate(today) };
      case "Last 30 Days":
        return { startDate: formatDate(last30Days), endDate: formatDate(today) };
      default:
        return { startDate: formatDate(today), endDate: formatDate(today) };
    }
  };

  const fetchAudienceDemographics = async (timePeriod: string) => {
    try {
      setLoading(true);

      const customerId = "3271710441"; // Replace with your actual customer ID (without dashes)
      const { startDate, endDate } = getDateRange(timePeriod);

      const response = await fetch(
        `/api/google-ads?customer_id=${customerId}&data_type=audience_demographics&start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audience demographics");
      }

      const data: AudienceDemographicsData[] = await response.json();
      
      // Always set data, even if empty, to ensure components render with 0s
      setAudienceData(data || []);
    } catch (err) {
      console.error("Error fetching audience demographics:", err);
      setAudienceData([]); // Ensure data is empty on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudienceDemographics(selectedOption);
  }, [selectedOption]);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
  };

  // Filter data based on selected category
  const filteredData = audienceData.filter(item => {
    if (selectedCategory === "age") return item.age_range !== "UNKNOWN";
    if (selectedCategory === "gender") return item.gender !== "UNKNOWN";
    return false;
  });

  // Chart configuration
  const series = [
    {
      name: "Impressions",
      data: filteredData.map(item => item.impressions)
    },
    {
      name: "Clicks",
      data: filteredData.map(item => item.clicks)
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
    colors: ["#3B82F6", "#EF4444"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"]
    },
    xaxis: {
      categories: filteredData.map(item => {
        if (selectedCategory === "age") return item.age_range;
        if (selectedCategory === "gender") return item.gender;
        return "";
      }),
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
    yaxis: [
      {
        title: {
          text: "Impressions",
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
        axisBorder: {
          show: true,
          color: "#DDE4FF",
        },
      },
      {
        opposite: true,
        title: {
          text: "Clicks",
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
      }
    ],
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex }) {
          return seriesIndex === 0 ? val + " impressions" : val + " clicks";
        }
      }
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
    grid: {
      show: true,
      strokeDashArray: 7,
      borderColor: "#ECEEF2",
    },
  };

  const totalImpressions = filteredData.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = filteredData.reduce((sum, item) => sum + item.clicks, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-[20px] md:p-[25px] h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Audience Demographics</h3>
            <p className="text-sm text-gray-500">Analyze your audience characteristics</p>
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
              {["Today", "Yesterday", "Last 7 Days", "Last 30 Days"].map((option) => (
                <MenuItem
                  key={option}
                  as="div"
                  className={`block w-full transition-all text-black cursor-pointer text-left relative py-[8px] px-[20px] hover:bg-gray-50 dark:text-white dark:hover:bg-black ${
                    selectedOption === option ? "font-semibold" : ""
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </MenuItem>
              ))}
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
        <div className="flex flex-col h-full">
          {/* Category Tabs */}
          <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
            {[{"key": "age", "title": "Age Demographics", "icon": <Users className="w-5 h-5" />}, {"key": "gender", "title": "Gender Demographics", "icon": <TrendingUp className="w-5 h-5" />}, {"key": "income", "title": "Household Income", "icon": <BarChart3 className="w-5 h-5" />},].map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key as "age" | "gender" | "income")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedCategory === category.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {category.icon}
                <span>{category.title}</span>
              </button>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Total Impressions</div>
              <div className="text-lg font-bold text-gray-900">{totalImpressions.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Total Clicks</div>
              <div className="text-lg font-bold text-gray-900">{totalClicks.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Click-Through Rate</div>
              <div className="text-lg font-bold text-gray-900">{ctr}%</div>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-6">
            <Chart
              options={options}
              series={series}
              type="bar"
              height={280}
              width="100%"
            />
          </div>

          {/* Data Table */}
          <div className="pt-4 border-t border-gray-200">
            <h6 className="text-sm font-semibold text-gray-900 mb-4">{selectedCategory === "age" ? "Age Demographics" : selectedCategory === "gender" ? "Gender" : "Household Income"}</h6>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {selectedCategory === "age" ? "Age Demographics" : selectedCategory === "gender" ? "Gender" : "Income"}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => {
                      const itemCtr = item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : "0.00";
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {selectedCategory === "age" ? item.age_range : item.gender}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {item.impressions.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {item.clicks.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {itemCtr}%
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm text-gray-500 text-center">
                        No data available.
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

export default AudienceInsights;


