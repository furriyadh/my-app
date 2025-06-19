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

            {/* Advertising Platforms Section */}
            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs mt-[20px]">
              Advertising Platforms
            </span>

            {/* Google Ads */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section')?.includes('google') ? "active" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(2)}
              >
                <div className="w-5 h-5 ltr:mr-[7px] rtl:ml-[7px] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                </div>
                <span className="title leading-none">Google Ads</span>
                <i className="material-symbols-outlined ltr:ml-auto rtl:mr-auto text-gray-400">
                  {openIndex === 2 ? 'expand_less' : 'expand_more'}
                </i>
              </button>

              <div className={`accordion-collapse ${openIndex === 2 ? "open" : "hidden"}`}>
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=google-dashboard"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'google-dashboard' ? "active" : ""
                        }`}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=google-campaigns"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'google-campaigns' ? "active" : ""
                        }`}
                      >
                        Campaigns
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=google-keywords"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'google-keywords' ? "active" : ""
                        }`}
                      >
                        Keywords
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=new-campaign"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'new-campaign' ? "active" : ""
                        }`}
                      >
                        New Campaign
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* YouTube Ads */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard?section=youtube-ads"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'youtube-ads' ? "active" : ""
                }`}
              >
                <div className="w-5 h-5 ltr:mr-[7px] rtl:ml-[7px] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs">▶</span>
                  </div>
                </div>
                <span className="title leading-none">YouTube Ads</span>
              </Link>
            </div>

            {/* Facebook Ads */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard?section=facebook-ads"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'facebook-ads' ? "active" : ""
                }`}
              >
                <div className="w-5 h-5 ltr:mr-[7px] rtl:ml-[7px] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                </div>
                <span className="title leading-none">Facebook Ads</span>
              </Link>
            </div>

            {/* X Ads (Twitter) */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard?section=x-ads"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'x-ads' ? "active" : ""
                }`}
              >
                <div className="w-5 h-5 ltr:mr-[7px] rtl:ml-[7px] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                    <span className="text-white text-xs font-bold">X</span>
                  </div>
                </div>
                <span className="title leading-none">X Ads</span>
              </Link>
            </div>

            {/* Instagram Ads */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard?section=instagram-ads"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'instagram-ads' ? "active" : ""
                }`}
              >
                <div className="w-5 h-5 ltr:mr-[7px] rtl:ml-[7px] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xs">📷</span>
                  </div>
                </div>
                <span className="title leading-none">Instagram Ads</span>
              </Link>
            </div>

            {/* LinkedIn Ads */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard?section=linkedin-ads"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'linkedin-ads' ? "active" : ""
                }`}
              >
                <div className="w-5 h-5 ltr:mr-[7px] rtl:ml-[7px] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-blue-700 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">in</span>
                  </div>
                </div>
                <span className="title leading-none">LinkedIn Ads</span>
              </Link>
            </div>

            {/* Microsoft Ads */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard?section=microsoft-ads"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'microsoft-ads' ? "active" : ""
                }`}
              >
                <div className="w-5 h-5 ltr:mr-[7px] rtl:ml-[7px] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">⊞</span>
                  </div>
                </div>
                <span className="title leading-none">Microsoft Ads</span>
              </Link>
            </div>

            {/* TikTok Ads */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard?section=tiktok-ads"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'tiktok-ads' ? "active" : ""
                }`}
              >
                <div className="w-5 h-5 ltr:mr-[7px] rtl:ml-[7px] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                    <span className="text-white text-xs font-bold">♬</span>
                  </div>
                </div>
                <span className="title leading-none">TikTok Ads</span>
              </Link>
            </div>

            {/* Account Management Section */}
            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs mt-[20px]">
              Account Management
            </span>

            {/* Billing Link */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard?section=billing"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'billing' ? "active" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  receipt_long
                </i>
                <span className="title leading-none">Billing</span>
                <span className="rounded-full font-medium inline-block text-center w-[20px] h-[20px] text-[11px] leading-[20px] text-orange-500 bg-orange-50 dark:bg-[#ffffff14] ltr:ml-auto rtl:mr-auto">
                  US$0
                </span>
              </Link>
            </div>

            {/* My Profile Link */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard?section=my-profile"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'my-profile' ? "active" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  person
                </i>
                <span className="title leading-none">My Profile</span>
              </Link>
            </div>

            {/* Settings Link */}
            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard?section=settings"
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === 'settings' ? "active" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  settings
                </i>
                <span className="title leading-none">Settings</span>
              </Link>
            </div>

            {/* Organization Section */}
            {/* <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs mt-[20px]">
              Organization
            </span>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  isOrganizationDropdownOpen ? "active" : ""
                }`}
                type="button"
                onClick={toggleOrganizationDropdown}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  business
                </i>
                <span className="title leading-none">Organization</span>
                <i className="material-symbols-outlined ltr:ml-auto rtl:mr-auto text-gray-400">
                  {isOrganizationDropdownOpen ? 'expand_less' : 'expand_more'}
                </i>
              </button>

              <div className={`accordion-collapse ${isOrganizationDropdownOpen ? "open" : "hidden"}`}>
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=organization-profile"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'organization-profile' ? "active" : ""
                        }`}
                      >
                        Profile
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=organization-users"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'organization-users' ? "active" : ""
                        }`}
                      >
                        Users
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=organization-roles"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'organization-roles' ? "active" : ""
                        }`}
                      >
                        Roles
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard?section=organization-settings"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'organization-settings' ? "active" : ""
                        }`}
                      >
                        Settings
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div> */}

            {/* Add Business Button */}
            {/* {canAddMoreBusinesses() ? (
              <button
                type="button"
                className="flex items-center justify-center w-full py-[9px] px-[14px] rounded-md bg-primary-500 text-white font-medium transition-all hover:bg-primary-600 mt-[20px]"
              >
                <i className="material-symbols-outlined ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  add
                </i>
                Add Business
              </button>
            ) : (
              <div className="mt-[20px] text-center text-sm text-gray-500">
                <p>You have reached the limit of businesses for your plan.</p>
                <p className="text-primary-500 cursor-pointer" onClick={() => alert(getUpgradeMessage())}>
                  Upgrade your plan
                </p>
              </div>
            )} */}

            {/* Remaining Balance */}
            {/* <div className="mt-[20px] text-center text-sm text-gray-500">
              <p>Remaining Balance: ${remainingBalance.toFixed(2)}</p>
            </div> */}

        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
// This code defines a SidebarMenu component that renders a sidebar with various links and sections.
// It includes links for different advertising platforms, account management, and organization management.                                