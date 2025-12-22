"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const SignUpForm: React.FC = () => {
  const supabase = useSupabaseClient(); // استخدام hook للـ dynamic import
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // التأكد من تحميل supabase قبل المتابعة
    if (!supabase) {
      setMessage("جاري تحميل النظام...");
      return;
    }

    setMessage("");
    setIsLoading(true);

    try {
      // تحديد رابط إعادة التوجيه بعد تأكيد البريد الإلكتروني ليتم توجيه المستخدم لصفحة تأكيد البريد (يدعم التطوير والإنتاج)
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");

      const redirectUrl = appUrl
        ? `${appUrl}/authentication/confirm-email`
        : undefined;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          setMessage("هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو التحقق من بريدك الإلكتروني لتأكيد حسابك.");
        } else {
          setMessage(`خطأ في التسجيل: ${signUpError.message}`);
        }
      } else if (data.user) {
        // إذا أعاد Supabase جلسة مباشرة (حسب إعدادات البريد في لوحة Supabase) ننقل المستخدم إلى الـ Dashboard
        if (data.session) {
          setMessage("تم التسجيل بنجاح! جاري التوجيه إلى لوحة التحكم...");
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1000);
        } else {
          // في حالة تفعيل تأكيد البريد الإلكتروني بدون جلسة مباشرة
          setMessage("تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.");
        }
      } else {
        setMessage("بدأت عملية التسجيل. يرجى التحقق من بريدك الإلكتروني للتأكيد.");
      }
    } catch (err: any) {
      setMessage("حدث خطأ غير متوقع أثناء عملية التسجيل.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "facebook" | "apple") => {
    // التأكد من تحميل supabase قبل المتابعة
    if (!supabase) {
      setMessage("جاري تحميل النظام...");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // مصادقة الحساب في Supabase (وليس Google Ads) حتى يكون لكل عميل حساب واحد متكامل
      if (provider === "google") {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          (typeof window !== "undefined" ? window.location.origin : "");

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: appUrl ? `${appUrl}/dashboard` : undefined,
          },
        });

        if (error) {
          setMessage(`خطأ في المصادقة: ${error.message}`);
        } else {
          // Supabase سيتولى إعادة التوجيه بعد المصادقة
          setMessage("");
        }
      } else {
        setMessage(`مصادقة ${provider} غير متاحة حالياً. يرجى استخدام Google.`);
      }
    } catch (err: any) {
      setMessage("حدث خطأ غير متوقع أثناء عملية المصادقة.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // عرض حالة التحميل إذا لم يتم تحميل supabase بعد
  if (!supabase) {
    return (
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[120px] xl:py-[135px]">
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
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[120px] xl:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1 relative overflow-hidden">
              <Image
                src="/images/sign-up.jpg"
                alt="sign-up-image"
                className="rounded-[25px] object-cover w-full h-full"
                width={646}
                height={804}
              />
              <div className="absolute inset-0 rounded-[25px] flex flex-col justify-center items-center text-white p-4"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)' }}>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4" style={{ color: 'white' }}>
                  20,000+ small businesses & entrepreneurs are growing with Furriyadh.
                </h2>
                <p className="text-base md:text-lg text-center leading-relaxed" style={{ color: 'white' }}>
                  Furriyadh is like a digital marketing guru sitting near me and saving my time by doing all the manual work!
                </p>
                <div className="flex justify-center" style={{ marginTop: '5px' }}>
                  <i className="material-symbols-outlined text-yellow-400">star</i>
                  <i className="material-symbols-outlined text-yellow-400">star</i>
                  <i className="material-symbols-outlined text-yellow-400">star</i>
                  <i className="material-symbols-outlined text-yellow-400">star</i>
                  <i className="material-symbols-outlined text-yellow-400">star</i>
                </div>
              </div>
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
                <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[7px]">
                  Sign Up to Furriyadh Dashboard
                </h1>
                <p className="font-medium lg:text-md text-[#445164] dark:text-gray-400">
                  Sign Up with social account or enter your details
                </p>
              </div>

              <div className="flex items-center justify-between mb-[20px] md:mb-[23px] gap-[12px]">
                <div className="grow">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("google")}
                    className="block text-center w-full rounded-md transition-all py-[8px] md:py-[10.5px] px-[15px] md:px-[25px] text-black dark:text-white border border-[#D6DAE1] bg-white dark:bg-[#0a0e19] dark:border-[#172036] shadow-sm hover:border-primary-500"
                  >
                    <Image
                      src="/images/icons/google.svg"
                      className="inline-block"
                      alt="google"
                      width={25}
                      height={25}
                    />
                  </button>
                </div>

                <div className="grow">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("facebook")}
                    className="block text-center w-full rounded-md transition-all py-[8px] md:py-[10.5px] px-[15px] md:px-[25px] text-black dark:text-white border border-[#D6DAE1] bg-white dark:bg-[#0a0e19] dark:border-[#172036] shadow-sm hover:border-primary-500"
                  >
                    <Image
                      src="/images/icons/facebook2.svg"
                      className="inline-block"
                      alt="facebook"
                      width={25}
                      height={25}
                    />
                  </button>
                </div>

                <div className="grow">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("apple")}
                    className="block text-center w-full rounded-md transition-all py-[8px] md:py-[10.5px] px-[15px] md:px-[25px] text-black dark:text-white border border-[#D6DAE1] bg-white dark:bg-[#0a0e19] dark:border-[#172036] shadow-sm hover:border-primary-500"
                  >
                    <Image
                      src="/images/icons/apple.svg"
                      className="inline-block"
                      alt="apple"
                      width={25}
                      height={25}
                    />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignUp}>
                <div className="mb-[15px] relative">
                  <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-[15px] relative">
                  <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-[15px] relative" id="passwordHideShow">
                  <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    id="password"
                    placeholder="Type password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute text-lg ltr:right-[20px] rtl:left-[20px] bottom-[12px] transition-all hover:text-primary-500"
                    id="toggleButton"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    <i className={showPassword ? "ri-eye-line" : "ri-eye-off-line"}></i>
                  </button>
                </div>

                {message && <p className="text-center mt-4 text-sm text-gray-600">{message}</p>}

                <button
                  type="submit"
                  className="md:text-md block w-full text-center transition-all rounded-md font-medium my-[20px] md:my-[25px] py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400"
                  disabled={isLoading}
                >
                  <span className="flex items-center justify-center gap-[5px]">
                    <i className="material-symbols-outlined">person_4</i>
                    {isLoading ? "Signing Up..." : "Sign Up"}
                  </span>
                </button>
              </form>

              <p className="!leading-[1.6]">
                By confirming your email, you agree to our{" "}
                <Link
                  href="#"
                  className="font-medium text-black dark:text-white transition-all hover:text-primary-500"
                >
                  Terms of Service
                </Link>{" "}
                and that you have read and understood our{" "}
                <Link
                  href="#"
                  className="font-medium text-black dark:text-white transition-all hover:text-primary-500"
                >
                  Privacy Policy
                </Link>
              </p>

              <p className="!leading-[1.6]">
                Already have an account.{" "}
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

export default SignUpForm;

