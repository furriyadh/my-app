"use client";

import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AnnualProfitProps {
  title?: string;
  value?: string;
  growth?: string;
  series?: any[];
  period?: string;
}

const AnnualProfit: React.FC<AnnualProfitProps> = ({
  title = "Annual Profit",
  value = "$879.6k",
  growth = "+30%",
  period = "Last 12 months",
  series = [
    {
      name: "Annual Profit",
      data: [3, 12, 8, 10, 15, 10, 7],
    },
  ]
}) => {
  // Chart
  const [isChartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    setChartLoaded(true);
  }, []);



  const options: ApexOptions = {
    chart: {
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#C52B09"],
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: false,
      borderColor: "#ECEEF2",
    },
    stroke: {
      curve: "monotoneCubic",
      width: 1,
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisTicks: {
        show: false,
        color: "#ECEEF2",
      },
      axisBorder: {
        show: false,
        color: "#ECEEF2",
      },
      labels: {
        show: false,
        style: {
          colors: "#8695AA",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      // tickAmount: 6,
      show: false,
      // max: 150,
      // min: 0,
      labels: {
        formatter: (val) => {
          return "$" + val + "k";
        },
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
        color: "#ECEEF2",
      },
      axisTicks: {
        show: false,
        color: "#ECEEF2",
      },
    },
    legend: {
      show: false,
      position: "top",
      fontSize: "12px",
      horizontalAlign: "left",
      itemMargin: {
        horizontal: 8,
        vertical: 0,
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
  };

  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-content relative">
          <span className="block">{title}</span>

          <h5 className="!mb-0 !mt-[3px] !text-[20px]">{value}</h5>

          <div className="absolute -top-[28px] ltr:-right-[9px] rtl:-left-[9px] max-w-[120px]">
            {isChartLoaded && (
              <Chart
                options={options}
                series={series}
                type="area"
                height={100}
                width={"100%"}
              />
            )}
          </div>

          <div className="mt-[25px] md:mt-[34px] flex items-center justify-between">
            <span className={`inline-block text-sm py-[1px] px-[8.3px] border rounded-xl ${growth.startsWith('+')
              ? 'text-success-700 border-success-300 bg-success-100 dark:bg-[#15203c] dark:border-[#172036]'
              : 'text-danger-700 border-danger-300 bg-danger-100 dark:bg-[#20153c] dark:border-[#361717]'}`}>
              {growth}
            </span>
            <span className="block text-sm">{period}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnualProfit;
