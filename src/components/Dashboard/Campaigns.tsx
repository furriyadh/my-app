"use client";

import React from "react";
import Image from "next/image";

const campaignsData = [
  {
    id: 1,
    icon: "/images/icons/google3.svg",
    name: "Google Ads Campaign",
    status: "Active",
    clicks: 1200,
    impressions: 50000,
    cpc: 0.50,
  },
  {
    id: 2,
    icon: "/images/icons/facebook3.svg",
    name: "Facebook Ads Campaign",
    status: "Paused",
    clicks: 800,
    impressions: 30000,
    cpc: 0.75,
  },
  {
    id: 3,
    icon: "/images/icons/instagram2.svg",
    name: "Instagram Ads Campaign",
    status: "Active",
    clicks: 1500,
    impressions: 60000,
    cpc: 0.45,
  },
];

const Campaigns: React.FC = () => {
  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md mb-[25px]">
      <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
        <div className="trezo-card-title">
          <h5 className="!mb-0">Campaigns</h5>
        </div>
      </div>
      <div className="trezo-card-content overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[#172036]">
          <thead className="bg-gray-50 dark:bg-[#0a0e19]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Campaign
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Clicks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Impressions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                CPC
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-[#0c1427] dark:divide-[#172036]">
            {campaignsData.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Image
                      src={campaign.icon}
                      className="w-[24px] h-[24px] ltr:mr-3 rtl:ml-3"
                      alt={campaign.name}
                      width={24}
                      height={24}
                    />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {campaign.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} dark:bg-[#15203c] dark:text-gray-300`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {campaign.clicks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {campaign.impressions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ${campaign.cpc.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Campaigns;
