"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SubscriptionsComponent from "@/components/Dashboard/Subscriptions";
import CreditsComponent from "@/components/Dashboard/Credits";
import PaymentsComponent from "@/components/Dashboard/Payments"; // Import PaymentsComponent

const DashboardPage: React.FC = () => {
  const searchParams = useSearchParams();
  const section = searchParams.get("section") || "overview";
  const router = useRouter();

  useEffect(() => {
    // تحقق مما إذا كان هناك أي معلمات في عنوان URL بعد #
    if (window.location.hash) {
      // قم بإزالة الجزء الخاص بالـ hash من عنوان URL
      router.replace(window.location.pathname, undefined, { shallow: true });
    }
  }, [router]);

  const renderSection = () => {
    switch (section) {
      case "subscriptions":
        return <SubscriptionsComponent />;
      case "credits":
        return <CreditsComponent />;
      case "payments": // Add payments case
        return <PaymentsComponent />;
      case "overview":
      default:
        return (
          <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              لوحة التحكم الرئيسية
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              مرحبًا بك في لوحة التحكم الخاصة بـ Furriyadh. يمكنك التنقل بين الأقسام المختلفة من خلال الشريط الجانبي.
            </p>
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                  <h3 className="font-semibold text-black dark:text-white">الحملات النشطة</h3>
                </div>
                <p className="text-2xl font-bold text-black dark:text-white">3</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">من أصل 3 متاحة</p>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                  <h3 className="font-semibold text-black dark:text-white">الرصيد المتاح</h3>
                </div>
                <p className="text-2xl font-bold text-black dark:text-white">$0</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">يحتاج إلى شحن</p>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">⭐</span>
                  </div>
                  <h3 className="font-semibold text-black dark:text-white">الخطة الحالية</h3>
                </div>
                <p className="text-2xl font-bold text-black dark:text-white">أساسية</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">$29/شهر</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-black dark:text-white mb-4">النشاط الأخير</h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  لا توجد أنشطة حديثة لعرضها
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {renderSection()}
    </div>
  );
};

export default DashboardPage;
