"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface SidebarMenuProps {
  toggleActive: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleActive }) => {
  const pathname = usePathname();

  // Initialize openIndex to 0 to open the first item by default
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] = React.useState(false);
  // Plan types: 'basic', 'premium' (no free plan)
  const [userPlan, setUserPlan] = React.useState<'basic' | 'premium'>('basic'); // Default to basic plan
  const [existingBusinessesCount, setExistingBusinessesCount] = React.useState(1); // Simulate 1 existing business
  const [remainingBalance, setRemainingBalance] = React.useState(0); // Simulate remaining balance

  // Plan limits
  const planLimits = {
    basic: 3,     // Basic plan ($29): 3 businesses  
    premium: -1   // Premium plan ($120): unlimited businesses
  };

  // Check if user can add more businesses
  const canAddMoreBusinesses = () => {
    const limit = planLimits[userPlan];
    if (limit === -1) return true; // Unlimited for premium
    return existingBusinessesCount < limit;
  };

  // Get upgrade message based on current plan
  const getUpgradeMessage = () => {
    if (userPlan === 'basic') {
      return 'Upgrade to Premium ($120) for unlimited businesses.';
    }
    return '';
  };

  const toggleOrganizationDropdown = () => {
    setIsOrganizationDropdownOpen(!isOrganizationDropdownOpen);
  };

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <>
      <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen transition-all rounded-r-md">
        <div className="logo bg-white dark:bg-[#0c1427] border-b border-gray-100 dark:border-[#172036] px-[25px] pt-[19px] pb-[15px] absolute z-[2] right-0 top-0 left-0">
          <Link
            href="/dashboard"
            className="transition-none relative flex items-center outline-none"
          >
            <Image
              src="/images/logo-icon.svg"
              alt="logo-icon"
              width={120}
              height={25}
            />
          </Link>

          <button
            type="button"
            className="burger-menu inline-block absolute z-[3] top-[24px] ltr:right-[25px] rtl:left-[25px] transition-all hover:text-primary-500"
            onClick={toggleActive}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>

        <div className="pt-[89px] px-[22px] pb-[20px] h-screen overflow-y-scroll sidebar-custom-scrollbar">
          {/* Organization Section */}
          <div className="organization-section mb-[20px]">
            <div className="flex items-center justify-between cursor-pointer" onClick={toggleOrganizationDropdown}>
              <div className="flex items-center">
                {/* Replaced f-icon.svg with a simple 'F' text */}
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  F
                </div>
                <span className="font-semibold ltr:ml-[10px] rtl:mr-[10px]">ORGANIZATION</span>
              </div>
              <i className="material-symbols-outlined">{isOrganizationDropdownOpen ? 'expand_less' : 'expand_more'}</i>
            </div>
            {isOrganizationDropdownOpen && (
              <div className="dropdown-content mt-[10px]">
                <div className="flex items-center justify-between py-[8px] px-[14px] rounded-md hover:bg-gray-50 dark:hover:bg-[#15203c]">
                  <span>furriyadh</span>
                  <i className="material-symbols-outlined text-primary-500">check</i>
                </div>
                {canAddMoreBusinesses() ? (
                  <Link
                    href="/business-creation"
                    className="flex items-center py-[8px] px-[14px] rounded-md hover:bg-gray-50 dark:hover:bg-[#15203c] mt-[5px]"
                  >
                    <i className="material-symbols-outlined ltr:mr-[7px] rtl:ml-[7px]">add</i>
                    <span>Create business</span>
                  </Link>
                ) : (
                  <div className="mt-[5px] px-[14px]">
                    <p className="text-sm text-gray-500 mb-[8px]">
                      {getUpgradeMessage()}
                    </p>
                    <button className="text-sm bg-primary-500 text-white px-[12px] py-[6px] rounded-md hover:bg-primary-600 transition-all">
                      Upgrade Plan
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="accordion">
            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs">
              Main
            </span>

            {/* Dashboard Link */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && !new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') ? "active" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  dashboard
                </i>
                <span className="title leading-none">Dashboard</span>
                <span className="rounded-full font-medium inline-block text-center w-[20px] h-[20px] text-[11px] leading-[20px] text-orange-500 bg-orange-50 dark:bg-[#ffffff14] ltr:ml-auto rtl:mr-auto">
                  30
                </span>
              </Link>
            </div>

            {/* Billing Section */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  (pathname === "/dashboard" && (new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'credits' || new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'subscriptions' || new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'payments')) ? "active" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(1)} // Use a new index for Billing
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  account_balance
                </i>
                <span className="title leading-none">Billing</span>
                <span className="ltr:ml-auto rtl:mr-auto text-sm text-gray-500 dark:text-gray-400"> US${remainingBalance}</span>
              </button>

              <div
                className={`accordion-collapse ${
                  openIndex === 1 ? "open" : "hidden"
                }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=credits"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'credits' ? "active" : ""
                        }`}
                      >
                        Credits
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=subscriptions"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'subscriptions' ? "active" : ""
                        }`}
                      >
                        Subscriptions
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=payments"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'payments' ? "active" : ""
                        }`}
                      >
                        Payments
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* My Profile, Settings, Logout links */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/my-profile"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/my-profile" ? "active" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  person
                </i>
                <span className="title leading-none">My Profile</span>
              </Link>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/settings"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/settings" ? "active" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  settings
                </i>
                <span className="title leading-none">Settings</span>
              </Link>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/authentication/logout"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/authentication/logout" ? "active" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  logout
                </i>
                <span className="title leading-none">Logout</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
