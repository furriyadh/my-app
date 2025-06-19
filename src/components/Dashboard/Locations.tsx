"use client";

import React from "react";
import Image from "next/image";

const Locations: React.FC = () => {
  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md mb-[25px]">
      <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
        <div className="trezo-card-title">
          <h5 className="!mb-0">Locations</h5>
        </div>
      </div>
      <div className="trezo-card-content">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px] last:border-none last:mb-0 last:pb-0">
          <div className="relative ltr:pl-[28px] rtl:pr-[28px] font-medium text-primary-500">
            <Image
              src="/images/icons/map-pin.svg"
              className="w-[18px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
              alt="Location"
              width={18}
              height={18}
            />
            Riyadh
          </div>
          <span className="inline-block transition-all leading-none text-success-500">
            +20%
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px] last:border-none last:mb-0 last:pb-0">
          <div className="relative ltr:pl-[28px] rtl:pr-[28px] font-medium text-primary-500">
            <Image
              src="/images/icons/map-pin.svg"
              className="w-[18px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
              alt="Location"
              width={18}
              height={18}
            />
            Jeddah
          </div>
          <span className="inline-block transition-all leading-none text-orange-500">
            -10%
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px] last:border-none last:mb-0 last:pb-0">
          <div className="relative ltr:pl-[28px] rtl:pr-[28px] font-medium text-primary-500">
            <Image
              src="/images/icons/map-pin.svg"
              className="w-[18px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
              alt="Location"
              width={18}
              height={18}
            />
            Dammam
          </div>
          <span className="inline-block transition-all leading-none text-success-500">
            +5%
          </span>
        </div>
      </div>
    </div>
  );
};

export default Locations;
