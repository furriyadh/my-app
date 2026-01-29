"use client";

import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown } from "lucide-react";

// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface StatWidgetProps {
    title: string;
    value: string;
    change: number;
    changePeriod?: string;
    seriesData: number[];
    chartColor: string;
    chartType?: "area" | "bar" | "line";
    isRTL?: boolean;
    categories?: string[];
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
    inverseTrend?: boolean; // If true, negative change is good (green), positive is bad (red)
}

const StatWidget: React.FC<StatWidgetProps> = ({
    title,
    value,
    change,
    changePeriod = "Last 7 days",
    seriesData,
    chartColor,
    chartType = "area",
    isRTL = false,
    categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    icon,
    iconBgColor = "bg-blue-100",
    iconColor = "text-blue-600",
    inverseTrend = false
}) => {
    const [isChartLoaded, setChartLoaded] = useState(false);

    useEffect(() => {
        setChartLoaded(true);
    }, []);

    const series = [
        {
            name: title,
            data: seriesData,
        },
    ];

    // Prepare chart options based on RevenueGrowth.tsx but with dynamic props
    const options: ApexOptions = {
        chart: {
            zoom: {
                enabled: false,
            },
            toolbar: {
                show: false,
            },
        },
        colors: [chartColor],
        dataLabels: {
            enabled: false,
        },
        grid: {
            show: false,
            borderColor: "#ECEEF2",
        },
        stroke: {
            curve: "smooth", // Keeping smooth as it generally looks better, user can override if needed
            width: 1,
        },
        xaxis: {
            categories: categories,
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
            show: false,
            labels: {
                formatter: (val) => {
                    return val.toString();
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
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (val) {
                    return val.toFixed(1);
                },
            },
        },
    };

    const isPositive = inverseTrend ? change <= 0 : change >= 0;
    const changeFormatted = (isPositive ? '+' : '') + change.toFixed(1) + '%';

    return (
        <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-content relative h-full flex flex-col justify-between">
                <div>
                    <span className="block text-gray-500 dark:text-gray-400">{title}</span>
                    <h5 className="!mb-0 !mt-[3px] !text-[20px] font-bold text-gray-900 dark:text-white">{value}</h5>
                </div>

                <div className="absolute -top-[28px] ltr:-right-[9px] rtl:-left-[9px] max-w-[120px] w-full">
                    {isChartLoaded && (
                        <Chart
                            options={options}
                            series={series}
                            type={chartType}
                            height={95}
                            width={"100%"}
                        />
                    )}
                </div>

                <div className="mt-[25px] md:mt-[34px] flex items-center justify-between">
                    <span className={`inline-block text-sm py-[1px] px-[8.3px] border rounded-xl ${isPositive
                        ? 'text-success-700 border-success-300 bg-success-100 dark:bg-[#15203c] dark:border-[#172036] text-green-700 border-green-200 bg-green-50'
                        : 'text-danger-700 border-danger-300 bg-danger-100 dark:bg-[#20153c] dark:border-[#361717] text-red-700 border-red-200 bg-red-50'
                        }`}>
                        {Math.abs(change).toFixed(1)}%
                    </span>
                    <span className="block text-sm text-gray-400">{changePeriod}</span>
                </div>
            </div>
        </div>
    );
};

export default StatWidget;
