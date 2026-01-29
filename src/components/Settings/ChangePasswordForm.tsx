"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";

// Dynamic import للـ supabase client
const useSupabaseClient = () => {
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/utils/supabase/client').then((module) => {
        setSupabase(module.supabase);
      });
    }
  }, []);

  return supabase;
};

const ChangePasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const supabase = useSupabaseClient();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChangePassword = async () => {
    // Reset messages
    setError(null);
    setSuccess(null);

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError(t.settings?.allFieldsRequired || "All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.settings?.passwordsDoNotMatch || "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError(t.settings?.passwordTooShort || "Password must be at least 6 characters");
      return;
    }

    if (!supabase) {
      setError("Supabase client not initialized");
      return;
    }

    try {
      setLoading(true);

      // تحديث كلمة المرور باستخدام Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(t.settings?.passwordChangedSuccess || "Password changed successfully!");
        // Clear form
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(t.settings?.unexpectedError || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
            <p className="text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
          <div className="mb-[20px] sm:mb-0 relative">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              {t.settings?.oldPassword || "Old Password"}
            </label>
            <input
              type="password"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              placeholder={t.settings?.typePassword || "Type password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="mb-[20px] sm:mb-0 relative">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              {t.settings?.newPassword || "New Password"}
            </label>
            <input
              type="password"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              placeholder={t.settings?.typePassword || "Type password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 mb-[20px] sm:mb-0 relative">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              {t.settings?.confirmPassword || "Confirm Password"}
            </label>
            <input
              type="password"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              placeholder={t.settings?.typePassword || "Type password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-[20px] md:mt-[25px]">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={loading}
            className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50"
          >
            <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
              <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                check
              </i>
              {loading
                ? (t.settings?.saving || "Saving...")
                : (t.settings?.changePassword || "Change Password")}
            </span>
          </button>

          <Link
            href="/authentication/forgot-password/"
            className="inline-block text-danger-500 ltr:ml-[23px] rtl:mr-[23px]"
          >
            {t.settings?.forgotPassword || "Forgot Password?"}
          </Link>
        </div>
      </form>
    </>
  );
};

export default ChangePasswordForm;
