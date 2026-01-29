"use client";

import React from "react";
import Image from "next/image";

const DownloadMobileApp: React.FC = () => {
  return (
    <>
      <div
        className="trezo-card p-[20px] md:p-[25px] text-center rounded-md h-full flex flex-col justify-center items-center"
        style={{
          background: "linear-gradient(150deg, #827CD8 0.57%, #2D2761 95.93%)",
        }}
      >
        <div className="trezo-card-content md:py-[13px] mx-auto md:max-w-[245px] flex flex-col h-full justify-between">
          <h3
            className="
          !text-white !text-lg md:!text-xl !leading-[1.3] !mb-[15px] md:!mb-[20px]
          "
          >
            <span className="font-normal">Have You Tried Our</span> New Mobile
            App?
          </h3>
          <div className="flex-grow flex items-center justify-center mb-[15px] md:mb-[20px]">
            <Image
              src="/images/app.png"
              className="mx-auto"
              alt="app-image"
              width={240}
              height={214}
            />
          </div>
          <button
            type="button"
            className="inline-block rounded-md bg-primary-500 text-white transition-all text-[15px] md:text-md font-medium py-[8px] px-[20px] hover:bg-primary-400 cursor-not-allowed opacity-90"
            disabled
          >
            Download Mobile App (Coming Soon)
          </button>
        </div>
      </div>
    </>
  );
};

export default DownloadMobileApp;
