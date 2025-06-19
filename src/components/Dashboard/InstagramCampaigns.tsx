"use client";

import React from "react";
import Image from "next/image";

const InstagramCampaigns: React.FC = () => {
  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0">Instagram Campaigns</h5>
          </div>
        </div>

        <div className="trezo-card-content">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px] last:border-none last:mb-0 last:pb-0">
            <div className="relative ltr:pl-[28px] rtl:pr-[28px] font-medium text-primary-500">
              <Image
                src="/images/icons/instagram.svg"
                className="w-[18px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
                alt="Instagram"
                width={18}
                height={18}
              />
              Campaign A
            </div>
            <span className="inline-block transition-all leading-none text-success-500">
              +15%
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px] last:border-none last:mb-0 last:pb-0">
            <div className="relative ltr:pl-[28px] rtl:pr-[28px] font-medium text-primary-500">
              <Image
                src="/images/icons/instagram.svg"
                className="w-[18px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
                alt="Instagram"
                width={18}
                height={18}
              />
              Campaign B
            </div>
            <span className="inline-block transition-all leading-none text-orange-500">
              -5%
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px] last:border-none last:mb-0 last:pb-0">
            <div className="relative ltr:pl-[28px] rtl:pr-[28px] font-medium text-primary-500">
              <Image
                src="/images/icons/instagram.svg"
                className="w-[18px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
                alt="Instagram"
                width={18}
                height={18}
              />
              Campaign C
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

export default InstagramCampaigns;
// This code defines a React functional component named `InstagramCampaigns` that displays a card showing various Instagram campaigns.
// The card includes a header with the title "Instagram Campaigns" and a list of campaigns with their respective performance indicators.
// Each campaign is represented with an icon, name, and a percentage change indicating performance (either positive or negative).
// The component uses Tailwind CSS classes for styling and Next.js's Image component for optimized image loading.
// The campaigns are displayed in a card format with a header and a list of campaigns, each separated by a border.
// The component is responsive and adapts to different screen sizes, with specific styles for larger screens.
// The use of `use client` indicates that this component is intended to be rendered on the client side, allowing for dynamic interactions and state management if needed in the future.
// The component can be used in a dashboard or analytics page to provide insights into Instagram advertising campaigns and their performance metrics.
// The component is designed to be reusable and can be easily integrated into larger applications or dashboards that require displaying Instagram campaign data.
// The component is structured to allow for easy updates and modifications, making it suitable for various use cases related to Instagram advertising and marketing analytics.
// The component can be extended to include additional features such as filtering, sorting, or detailed views of each campaign if needed in the future.
// The component is part of a larger application that likely includes other components for displaying different types of advertising campaigns, analytics, or marketing data.
// The component is written in TypeScript, providing type safety and better development experience with autocompletion and error checking in compatible editors.
// The component is optimized for performance, using Next.js's Image component to handle image loading efficiently and reduce page load times.
// The component follows best practices for React development, including using functional components, hooks, and modular design principles.
// The component is styled using Tailwind CSS, allowing for rapid development and consistent design across the  application.
// The component can be easily customized with different styles or themes by modifying the Tailwind CSS classes used in the component.
// The component is designed to be accessible, ensuring that it can be used by a wide range of users, including those with disabilities.
// The component can be tested using various testing frameworks compatible with React, such as Jest or React Testing Library, to ensure its functionality and reliability.