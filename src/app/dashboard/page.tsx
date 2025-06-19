"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import SubscriptionsComponent from "@/components/Dashboard/Subscriptions";
import CreditsComponent from "@/components/Dashboard/Credits";
import PaymentsComponent from "@/components/Dashboard/Payments";
import NewCampaign from "@/components/Dashboard/NewCampaign"; // Import NewCampaign component
import MainDashboard from "@/components/Dashboard/MainDashboard"; // Import MainDashboard component
import GoogleAdsDashboard from "@/components/Dashboard/GoogleAds"; // Import GoogleAds component

const DashboardPage: React.FC = () => {
  const searchParams = useSearchParams();
  const section = searchParams.get("section") || "overview";

  const renderSection = () => {
    switch (section) {
      case "subscriptions":
        return <SubscriptionsComponent />;
      case "credits":
        return <CreditsComponent />;
      case "payments":
        return <PaymentsComponent />;
      case "new-campaign": // Add new case for New Campaign
        return <NewCampaign />;
      // Google Ads sections
      case "google-dashboard":
      case "google-campaigns":
      case "google-keywords":
        return <GoogleAdsDashboard />;
      // Other platform sections (placeholder for now)
      case "youtube-ads":
        return <div className="p-6"><h2 className="text-2xl font-bold">YouTube Ads Dashboard</h2><p>Coming soon...</p></div>;
      case "facebook-ads":
        return <div className="p-6"><h2 className="text-2xl font-bold">Facebook Ads Dashboard</h2><p>Coming soon...</p></div>;
      case "x-ads":
        return <div className="p-6"><h2 className="text-2xl font-bold">X Ads Dashboard</h2><p>Coming soon...</p></div>;
      case "instagram-ads":
        return <div className="p-6"><h2 className="text-2xl font-bold">Instagram Ads Dashboard</h2><p>Coming soon...</p></div>;
      case "linkedin-ads":
        return <div className="p-6"><h2 className="text-2xl font-bold">LinkedIn Ads Dashboard</h2><p>Coming soon...</p></div>;
      case "microsoft-ads":
        return <div className="p-6"><h2 className="text-2xl font-bold">Microsoft Ads Dashboard</h2><p>Coming soon...</p></div>;
      case "tiktok-ads":
        return <div className="p-6"><h2 className="text-2xl font-bold">TikTok Ads Dashboard</h2><p>Coming soon...</p></div>;
      case "overview":
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderSection()}
    </div>
  );
};

export default DashboardPage;
// This code defines a DashboardPage component that renders different sections of a dashboard based on the URL search parameters.
// It includes sections for subscriptions, credits, payments, a new campaign creation form, and a main dashboard.
// It also includes a Google Ads dashboard with various sub-sections, and placeholders for other advertising platforms like YouTube Ads, Facebook Ads, etc.           