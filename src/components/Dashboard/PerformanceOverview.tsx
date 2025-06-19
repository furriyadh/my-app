"use client";

import React, { useEffect, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PerformanceOverview: React.FC = () => {
  // selectedOption state
  const [selectedOption, setSelectedOption] = useState<string>("Monthly");

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    console.log(`Selected option: ${option}`); // Add your logic here
  };

  // Chart
  const [isChartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    setChartLoaded(true);
  }, []);

  const series = [
    {
      name: "Social Campaigns",
      data: [[100, 20, 50]],
    },
    {
      name: "Email Newsletter",
      data: [[300, 50, 70]],
    },
    {
      name: "TV Campaign",
      data: [[500, 80, 80]],
    },
    {
      name: "Google Ads",
      data: [[650, 40, 50]],
    },
    {
      name: "Courses",
      data: [[850, 60, 70]],
    },
    {
      name: "Radio",
      data: [[900, 20, 60]],
    },
  ];

  const options: ApexOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    colors: ["#757DFF", "#5DA8FF", "#BF85FB", "#1E8308", "#FE7A36", "#174EDE"],
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: true,
      strokeDashArray: 7,
      borderColor: "#ECEEF2",
    },
    xaxis: {
      min: 0,
      max: 1000,
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
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      tickAmount: 5,
      max: 100,
      min: 0,
      labels: {
        formatter: (val) => {
          return "$" + val + "K";
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
        shape: "square",
      },
    },
  };

  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0">Performance Overview</h5>
          </div>

          <div className="trezo-card-subtitle">
            <Menu as="div" className="trezo-card-dropdown relative">
              <MenuButton className="trezo-card-dropdown-btn inline-block rounded-md border border-gray-100 bg-gray-100 dark:bg-[#0a0e19] py-[5px] md:py-[6.5px] px-[12px] md:px-[19px] transition-all hover:bg-gray-50 dark:border-[#172036] dark:hover:bg-[#0a0e19]">
                <span className="inline-block relative ltr:pr-[17px] ltr:md:pr-[20px] rtl:pl-[17px] rtl:ml:pr-[20px]">
                  {selectedOption}
                  <i className="ri-arrow-down-s-line text-lg absolute ltr:-right-[3px] rtl:-left-[3px] top-1/2 -translate-y-1/2"></i>
                </span>
              </MenuButton>

              <MenuItems
                transition
                className="transition-all bg-white shadow-3xl rounded-md top-full py-[15px] absolute ltr:right-0 rtl:left-0 w-[195px] z-[50] dark:bg-dark dark:shadow-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                {["Weekly", "Monthly", "Yearly"].map((option) => (
                  <MenuItem
                    key={option}
                    as="div"
                    className={`block w-full transition-all text-black cursor-pointer ltr:text-left rtl:text-right relative py-[8px] px-[20px] hover:bg-gray-50 dark:text-white dark:hover:bg-black ${
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

        <div className="trezo-card-content">
          <div className="-mb-[20px] -mt-[22px] ltr:-ml-[15px] rtl:-mr-[15px]">
            {isChartLoaded && (
              <Chart
                options={options}
                series={series}
                type="bubble"
                height={370}
                width={"100%"}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PerformanceOverview;
// This code defines a React functional component named `PerformanceOverview` that displays a performance overview card with a bubble chart.
// The card includes a dropdown menu to select the time period (Weekly, Monthly, Yearly) and dynamically renders a bubble chart using the `react-apexcharts` library.
// The chart displays data for various campaigns, with options for customizing the appearance and behavior of the chart using ApexCharts options.
// The component uses Tailwind CSS classes for styling and Next.js's dynamic import for the chart to ensure it only loads on the client side.
// The dropdown menu allows users to select different time periods, and the selected option is displayed in the button.
// The chart is responsive and adapts to different screen sizes, with specific styles for larger screens.
// The component also handles the loading state of the chart to ensure it is only rendered after it has been loaded, improving performance and user experience.
// The use of `use client` indicates that this component is intended to be rendered on the client side, allowing for dynamic interactions and state management.
// The component is designed to be reusable and can be easily integrated into a larger dashboard or analytics page to provide insights into campaign performance over different time periods.   