"use client";

import React from "react";
import Image from "next/image";

const Channels: React.FC = () => {
  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0">Channels</h5>
          </div>
        </div>

        <div className="trezo-card-content">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px] last:border-none last:mb-0 last:pb-0">
            <div className="relative ltr:pl-[28px] rtl:pr-[28px] font-medium text-primary-500">
              <Image
                src="/images/icons/google3.svg"
                className="w-[18px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
                alt="Google"
                width={18}
                height={18}
              />
              Google Ads
            </div>
            <span className="inline-block transition-all leading-none text-success-500">
              +15%
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px] last:border-none last:mb-0 last:pb-0">
            <div className="relative ltr:pl-[28px] rtl:pr-[28px] font-medium text-primary-500">
              <Image
                src="/images/icons/facebook3.svg"
                className="w-[18px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
                alt="Facebook"
                width={18}
                height={18}
              />
              Facebook Ads
            </div>
            <span className="inline-block transition-all leading-none text-orange-500">
              -5%
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px] last:border-none last:mb-0 last:pb-0">
            <div className="relative ltr:pl-[28px] rtl:pr-[28px] font-medium text-primary-500">
              <Image
                src="/images/icons/instagram2.svg"
                className="w-[18px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
                alt="Instagram"
                width={18}
                height={18}
              />
              Instagram Ads
            </div>
            <span className="inline-block transition-all leading-none text-success-500">
              +10%
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Channels;
