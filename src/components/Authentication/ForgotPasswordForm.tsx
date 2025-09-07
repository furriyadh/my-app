"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Dynamic import للـ supabase client لتجنب مشاكل prerendering
const useSupabaseClient = () => {
  const [supabase, setSupabase] = useState<any>(null);
  
  useEffect(() => {
    // تحميل supabase client فقط في المتصفح
    if (typeof window !== 'undefined') {
      import('@/utils/supabase/client').then((module) => {
        setSupabase(module.supabase);
      });
    }
  }, []);
  
  return supabase;
};

const ForgotPasswordForm: React.FC = () => {
  const supabase = useSupabaseClient(); // استخدام hook للـ dynamic import
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التأكد من تحميل supabase قبل المتابعة
    if (!supabase) {
      setMessage("جاري تحميل النظام...");
      return;
    }
    
    setMessage("");
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.NODE_ENV === 'production' 
        ? 'https://furriyadh.com/authentication/update-password' 
        : `${window.location.origin}/authentication/update-password`, // Redirect to a page where user can set new password
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Password reset email sent! Please check your inbox.");
    }
    setIsLoading(false);
  };

  // عرض حالة التحميل إذا لم يتم تحميل supabase بعد
  if (!supabase) {
    return (
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل النظام...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/forgot-password.jpg"
                alt="forgot-password-image"
                className="rounded-[25px]"
                width={646}
                height={804}
              />
            </div>

            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              <Image
                src="/images/logo-big.svg"
                alt="logo"
                className="inline-block dark:hidden"
                width={142}
                height={38}
              />
              <Image
                src="/images/white-logo-big.svg"
                alt="logo"
                className="hidden dark:inline-block"
                width={142}
                height={38}
              />

              <div className="my-[17px] md:my-[25px]">
                <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[12px]">
                  Forgot your password?
                </h1>
                <p className="font-medium leading-[1.5] lg:text-md text-[#445164] dark:text-gray-400">
                  Enter the email address you used when you joined and we'll
                  send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleResetPassword}> {/* Add form and onSubmit */}
                <div className="mb-[15px] relative">
                  <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                    Email Address
                  </label>
                  <input
                    type="email" // Changed type to email
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {message && <p className="text-center mt-4 text-sm text-gray-600">{message}</p>} {/* Display messages */}

                <button
                  type="submit"
                  className="md:text-md block w-full text-center transition-all rounded-md font-medium mt-[20px] md:mt-[25px] py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400"
                  disabled={isLoading} // Disable button when loading
                >
                  <span className="flex items-center justify-center gap-[5px]">
                    <i className="material-symbols-outlined">autorenew</i>
                    {isLoading ? "Sending..." : "Reset Password"}
                  </span>
                </button>
              </form>

              <p className="mt-[15px] md:mt-[20px]">
                Back to{" "}
                <Link
                  href="/authentication/sign-in"
                  className="text-primary-500 transition-all font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordForm;

