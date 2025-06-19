"use client";

import React from "react";

const MapComponent: React.FC = () => {
  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
      <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
        <div className="trezo-card-title">
          <h5 className="!mb-0">Customer Interaction Map</h5>
        </div>
      </div>
      <div className="trezo-card-content">
        <div className="w-full h-64 bg-gray-200 dark:bg-[#15203c] rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
          {/* Placeholder for an actual map component */}
          <p>Map showing customer interaction locations will go here.</p>
        </div>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>This map will display locations where users clicked on ads or called your phone number.</p>
          <ul className="list-disc list-inside mt-2">
            <li>Riyadh: 150 Clicks, 30 Calls</li>
            <li>Jeddah: 120 Clicks, 25 Calls</li>
            <li>Dammam: 80 Clicks, 15 Calls</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
