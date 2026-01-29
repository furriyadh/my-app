"use client";

import React, { useState } from "react";
import Image from "next/image";

interface Campaign {
    id: string;
    name: string;
    status: "Live Now" | "Paused" | "Finished";
    budget: string;
    roi: string;
    platform: "Google" | "Facebook" | "Instagram" | "LinkedIn";
}

const campaignsData: Campaign[] = [
    {
        id: "1",
        name: "Summer Sale 2024",
        status: "Live Now",
        budget: "$5,000",
        roi: "320%",
        platform: "Google"
    },
    {
        id: "2",
        name: "Brand Awareness",
        status: "Paused",
        budget: "$2,500",
        roi: "180%",
        platform: "Instagram"
    },
    {
        id: "3",
        name: "Retargeting Q1",
        status: "Finished",
        budget: "$1,200",
        roi: "250%",
        platform: "Facebook"
    }
];

const Campaigns: React.FC = () => {
    return (
        <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] flex items-center justify-between">
                <div className="trezo-card-title">
                    <h5 className="!mb-0">Campaigns</h5>
                </div>
                <div className="trezo-card-subtitle">
                    <span className="block">Active Campaigns</span>
                </div>
            </div>

            <div className="trezo-card-content">
                <div className="table-responsive">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left pb-[15px] text-sm text-gray-500 dark:text-gray-400 font-medium">Campaign</th>
                                <th className="text-left pb-[15px] text-sm text-gray-500 dark:text-gray-400 font-medium">Status</th>
                                <th className="text-right pb-[15px] text-sm text-gray-500 dark:text-gray-400 font-medium">Budget</th>
                                <th className="text-right pb-[15px] text-sm text-gray-500 dark:text-gray-400 font-medium">ROI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaignsData.map((campaign, index) => (
                                <tr key={index} className="border-b last:border-none border-gray-100 dark:border-[#172036]">
                                    <td className="py-[15px]">
                                        <div className="flex items-center gap-[10px]">
                                            <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#15203c] text-xl">
                                                {campaign.platform === "Google" && <i className="ri-google-fill text-[#4285F4]"></i>}
                                                {campaign.platform === "Instagram" && <i className="ri-instagram-line text-[#E1306C]"></i>}
                                                {campaign.platform === "Facebook" && <i className="ri-facebook-fill text-[#1877F2]"></i>}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{campaign.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-[15px]">
                                        <span
                                            className={`px-[8px] py-[2px] rounded-sm font-medium text-xs ${campaign.status === "Live Now"
                                                    ? "bg-primary-50 text-primary-600"
                                                    : campaign.status === "Paused"
                                                        ? "bg-orange-50 text-orange-600"
                                                        : "bg-gray-50 text-gray-600"
                                                }`}
                                        >
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="text-right py-[15px] font-medium text-gray-900 dark:text-gray-100">{campaign.budget}</td>
                                    <td className="text-right py-[15px] font-medium text-green-600">{campaign.roi}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Campaigns;
