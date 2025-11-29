"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";

// Dynamic import للـ supabase client لتجنب مشاكل prerendering
const useSupabaseClient = () => {
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@/utils/supabase/client").then((module) => {
        setSupabase(module.supabase);
      });
    }
  }, []);

  return supabase;
};

interface AuthStatus {
  authenticated: boolean;
  message: string;
  user: {
    id: string;
    email: string | null;
    name?: string | null;
    picture?: string | null;
  } | null;
  backend_status: any;
  tokens: {
    has_access_token: boolean;
    has_refresh_token: boolean;
    has_user_info: boolean;
  };
}

const AuthStatusContent: React.FC = () => {
  const supabase = useSupabaseClient();
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const buildStatusFromSession = (session: Session | null): AuthStatus => {
    if (!session) {
      return {
        authenticated: false,
        message: "لا يوجد جلسة نشطة. يرجى تسجيل الدخول.",
        user: null,
        backend_status: null,
        tokens: {
          has_access_token: false,
          has_refresh_token: false,
          has_user_info: false,
        },
      };
    }

    const user = session.user;
    const metadata: any = user?.user_metadata || {};

    return {
      authenticated: true,
      message: "المستخدم مصادق عليه من خلال Supabase.",
      user: {
        id: user.id,
        email: user.email,
        name: metadata.full_name || metadata.name || null,
        picture: metadata.avatar_url || null,
      },
      backend_status: null,
      tokens: {
        has_access_token: !!session.access_token,
        has_refresh_token: !!session.refresh_token,
        has_user_info: !!user,
      },
    };
  };

  const checkAuthStatus = async () => {
    if (!supabase) return;

    setIsLoading(true);
    setError("");
    
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("خطأ في فحص حالة المصادقة من Supabase:", error);
        setError("فشل في فحص حالة المصادقة");
        setAuthStatus(
          buildStatusFromSession(null)
        );
        // إعادة التوجيه إلى صفحة تسجيل الدخول عند الخطأ
        setTimeout(() => {
          router.push("/authentication/sign-in");
        }, 3000);
        return;
      }

      const status = buildStatusFromSession(session);
      setAuthStatus(status);

      if (!status.authenticated) {
        // إعادة توجيه إلى صفحة تسجيل الدخول إذا لم يكن المستخدم مصادق عليه
        setTimeout(() => {
          router.push("/authentication/sign-in");
        }, 3000);
      }
    } catch (err) {
      console.error("خطأ غير متوقع في فحص حالة المصادقة:", err);
      setError("فشل في فحص حالة المصادقة");
      setAuthStatus(buildStatusFromSession(null));
      setTimeout(() => {
        router.push("/authentication/sign-in");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) return;

    // فحص الجلسة الحالية عند تحميل المكون
    checkAuthStatus();

    // الاستماع لتغييرات حالة المصادقة من Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const status = buildStatusFromSession(session);
      setAuthStatus(status);

      if (!status.authenticated) {
        router.push("/authentication/sign-in");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleLogout = async () => {
    if (!supabase) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("خطأ في تسجيل الخروج من Supabase:", error);
      }
    } catch (err) {
      console.error("خطأ غير متوقع في تسجيل الخروج:", err);
    } finally {
      setIsLoading(false);
      router.push("/authentication/sign-in");
      router.refresh();
      }
  };

  // عرض حالة التحميل إذا لم يتم تحميل supabase بعد
  if (!supabase) {
    return (
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                جاري تحميل النظام...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
    }

  if (isLoading) {
    return (
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري فحص حالة المصادقة...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="text-center">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">خطأ</h2>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={checkAuthStatus}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
      <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
          <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
            <Image
              src="/images/sign-up.jpg"
              alt="auth-status-image"
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
              <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[10px]">
                حالة المصادقة
              </h1>
              <p className="font-medium leading-[1.5] lg:text-md text-[#445164] dark:text-gray-400">
                {authStatus?.message || "جاري فحص الحالة..."}
              </p>
            </div>

            {authStatus?.authenticated ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                    ✅ مصادق عليه
                  </h3>
                  {authStatus.user && (
                    <div className="space-y-2">
                      <p className="text-green-600 dark:text-green-400">
                        <strong>الاسم:</strong> {authStatus.user.name || 'غير محدد'}
                      </p>
                      <p className="text-green-600 dark:text-green-400">
                        <strong>البريد الإلكتروني:</strong> {authStatus.user.email || 'غير محدد'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">حالة الـ Tokens:</h4>
                  <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                    <li>• Access Token: {authStatus.tokens.has_access_token ? '✅ موجود' : '❌ غير موجود'}</li>
                    <li>• Refresh Token: {authStatus.tokens.has_refresh_token ? '✅ موجود' : '❌ غير موجود'}</li>
                    <li>• User Info: {authStatus.tokens.has_user_info ? '✅ موجود' : '❌ غير موجود'}</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <Link
                    href="/dashboard"
                    className="flex-1 text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400"
                  >
                    الذهاب إلى لوحة التحكم
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex-1 text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-white bg-red-500 hover:bg-red-400"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                  ⚠️ غير مصادق عليه
                </h3>
                <p className="text-yellow-600 dark:text-yellow-400 mb-4">
                  سيتم توجيهك إلى صفحة تسجيل الدخول...
                </p>
                <Link
                  href="/authentication/sign-in"
                  className="inline-block text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400"
                >
                  تسجيل الدخول الآن
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthStatusContent;
