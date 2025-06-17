"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const ConfirmEmailContent: React.FC = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [message, setMessage] = useState("جاري معالجة تأكيد البريد الإلكتروني...");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // التحقق من وجود access_token في URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // تعيين الجلسة باستخدام الرموز المميزة
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('خطأ في تعيين الجلسة:', error);
            setMessage("حدث خطأ أثناء تأكيد البريد الإلكتروني. يرجى المحاولة مرة أخرى.");
            setIsProcessing(false);
          } else if (data.session) {
            setMessage("تم تأكيد البريد الإلكتروني بنجاح! يتم التوجيه إلى لوحة التحكم...");
            // انتظار قصير قبل التوجيه
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          }
        } else {
          // إذا لم توجد رموز مميزة، فقط اعرض صفحة التأكيد
          setMessage("تم تأكيد البريد الإلكتروني بنجاح!");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('خطأ في معالجة تأكيد البريد الإلكتروني:', error);
        setMessage("حدث خطأ أثناء تأكيد البريد الإلكتروني. يرجى المحاولة مرة أخرى.");
        setIsProcessing(false);
      }
    };

    // تشغيل معالجة تأكيد البريد الإلكتروني
    handleEmailConfirmation();

    // الاستماع لتغييرات حالة المصادقة
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setMessage("تم تأكيد البريد الإلكتروني بنجاح! يتم التوجيه إلى لوحة التحكم...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <>
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/confirm-email.jpg"
                alt="confirm-email-image"
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
                  Welcome back to Furriyadh!
                </h1>
                <p className="font-medium leading-[1.5] lg:text-md text-[#445164] dark:text-gray-400">
                  {message}
                </p>
              </div>

              <div className="flex items-center justify-center bg-[#f5f7f8] text-success-600 rounded-full w-[120px] h-[120px] dark:bg-[#15203c]">
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-600"></div>
                ) : (
                  <i className="material-symbols-outlined !text-[55px]">done</i>
                )}
              </div>

              <span className="block font-medium text-black dark:text-white md:text-md mt-[20px]">
                {isProcessing ? (
                  "جاري المعالجة..."
                ) : (
                  <>
                    Your Email Verified{" "}
                    <span className="text-success-600">Successfully!</span>
                  </>
                )}
              </span>

              {!isProcessing && (
                <Link
                  href="/dashboard/"
                  className="md:text-md block w-full text-center transition-all rounded-md font-medium mt-[20px] md:mt-[25px] lg:mt-[30px] py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400"
                >
                  <span className="flex items-center justify-center gap-[5px]">
                    <i className="material-symbols-outlined">login</i>
                    Go To Dashboard
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmEmailContent;