"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <>
      <div className="grow"></div>

      <footer className="bg-white dark:bg-[#0c1427] rounded-t-md px-[20px] md:px-[25px] py-[15px] md:py-[20px] text-center">
        <p>
          © 2024 <span className="text-purple-500">Furriyadh</span>. All Rights Reserved.{" "}
          <a
            href="https://furriyadh.com/"
            target="_blank"
            className="text-primary-500 transition-all hover:underline"
          >
            furriyadh.com
          </a>
        </p>
      </footer>
    </>
  );
};

export default Footer;