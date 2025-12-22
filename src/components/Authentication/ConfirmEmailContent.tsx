"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, 
  Loader2, 
  Mail, 
  AlertCircle, 
  ArrowRight,
  Shield,
  Clock,
  Star,
  Heart,
  Award,
  RefreshCw,
  Home
} from "lucide-react";
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

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

// Types
interface ConfirmEmailState {
  isProcessing: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
  countdown: number;
}

// Furriyadh Logo Component
const FurriyadhLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
          <span className="text-xl">C</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
        </div>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
          Furriyadh
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
          AI Marketing Platform
        </span>
      </div>
    </div>
  );
};

// Success Animation Component
const SuccessAnimation: React.FC = () => {
  return (
    <div className="relative">
      <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <CheckCircle className="h-16 w-16 text-white" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-blue-400 rounded-full animate-bounce`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Loading Animation Component
const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center">
          <Mail className="h-12 w-12 text-white" />
        </div>
        <Loader2 className="absolute inset-0 h-24 w-24 text-blue-600 animate-spin" />
      </div>
      
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

// Error Animation Component
const ErrorAnimation: React.FC = () => {
  return (
    <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
      <AlertCircle className="h-12 w-12 text-white" />
    </div>
  );
};

// Features Grid Component
const FeaturesGrid: React.FC = () => {
  const features = [
    { icon: Shield, label: "حساب آمن", color: "text-green-600" },
    { icon: Star, label: "ميزات متقدمة", color: "text-blue-600" },
    { icon: Heart, label: "دعم 24/7", color: "text-pink-600" },
    { icon: Award, label: "جودة عالية", color: "text-purple-600" }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <div
            key={index}
            className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
          >
            <IconComponent className={`h-6 w-6 mx-auto mb-2 ${feature.color}`} />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {feature.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ConfirmEmailContent: React.FC = () => {
  const supabase = useSupabaseClient(); // استخدام hook للـ dynamic import
  const router = useRouter();
  const [state, setState] = useState<ConfirmEmailState>({
    isProcessing: true,
    isSuccess: false,
    isError: false,
    message: "جاري تحميل النظام...",
    countdown: 5
  });

  // Countdown timer for redirect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isSuccess && state.countdown > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          countdown: prev.countdown - 1
        }));
      }, 1000);
    } else if (state.isSuccess && state.countdown === 0) {
      router.push("/dashboard");
      router.refresh();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isSuccess, state.countdown, router]);

  // Handle email confirmation
  const handleEmailConfirmation = useCallback(async () => {
    // التأكد من تحميل supabase قبل المتابعة
    if (!supabase) {
      setState(prev => ({
        ...prev,
        message: "جاري تحميل النظام..."
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        message: "جاري التحقق من البريد الإلكتروني..."
      }));

      // Check for access_token in URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      if (accessToken && refreshToken) {
        setState(prev => ({
          ...prev,
          message: "جاري تعيين الجلسة..."
        }));

        // Set session using tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('خطأ في تعيين الجلسة:', error);
          setState({
            isProcessing: false,
            isSuccess: false,
            isError: true,
            message: "حدث خطأ أثناء تأكيد البريد الإلكتروني. يرجى المحاولة مرة أخرى.",
            countdown: 0
          });
          return;
        }

        if (data.session) {
          // Update user metadata if needed
          const { error: updateError } = await supabase.auth.updateUser({
            data: { email_confirmed: true }
          });

          if (updateError) {
            console.warn('تحذير: لم يتم تحديث بيانات المستخدم:', updateError);
          }

          setState({
            isProcessing: false,
            isSuccess: true,
            isError: false,
            message: "تم تأكيد البريد الإلكتروني بنجاح! يتم التوجيه إلى لوحة التحكم...",
            countdown: 5
          });

          // Clear URL hash for security
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      } else if (type === 'signup') {
        // Handle signup confirmation without tokens
        setState({
          isProcessing: false,
          isSuccess: true,
          isError: false,
          message: "تم تأكيد البريد الإلكتروني بنجاح!",
          countdown: 5
        });
      } else {
        // No tokens found, check current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('خطأ في الحصول على الجلسة:', error);
          setState({
            isProcessing: false,
            isSuccess: false,
            isError: true,
            message: "حدث خطأ أثناء التحقق من الجلسة.",
            countdown: 0
          });
          return;
        }

        if (session) {
          setState({
            isProcessing: false,
            isSuccess: true,
            isError: false,
            message: "تم تأكيد البريد الإلكتروني بنجاح!",
            countdown: 5
          });
        } else {
          setState({
            isProcessing: false,
            isSuccess: false,
            isError: true,
            message: "رابط التأكيد غير صالح أو منتهي الصلاحية.",
            countdown: 0
          });
        }
      }
    } catch (error) {
      console.error('خطأ في معالجة تأكيد البريد الإلكتروني:', error);
      setState({
        isProcessing: false,
        isSuccess: false,
        isError: true,
        message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        countdown: 0
      });
    }
  }, [supabase]);

  // Handle retry
  const handleRetry = useCallback(() => {
    handleEmailConfirmation();
  }, [handleEmailConfirmation]);

  // Run email confirmation when supabase is loaded
  useEffect(() => {
    if (!supabase) return;

    handleEmailConfirmation();

    // Listen for auth state changes مع تحديد أنواع البيانات
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session && !state.isSuccess) {
          setState({
            isProcessing: false,
            isSuccess: true,
            isError: false,
            message: "تم تأكيد البريد الإلكتروني بنجاح! يتم التوجيه إلى لوحة التحكم...",
            countdown: 5
          });
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase, handleEmailConfirmation, state.isSuccess]);

  // عرض حالة التحميل إذا لم يتم تحميل supabase بعد
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="auth-main-content py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            
            {/* Image Section */}
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <div className="relative">
                <Image
                  src="/images/confirm-email.jpg"
                  alt="confirm-email-image"
                  className="rounded-[25px] shadow-2xl"
                  width={646}
                  height={804}
                  priority
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                
                {/* Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-[25px]" />
                
                {/* Floating elements */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              
              {/* Logo */}
              <FurriyadhLogo className="mb-8" />

              {/* Main Content */}
              <div className="my-[17px] md:my-[25px]">
                <h1 className="!font-semibold !text-[28px] md:!text-[32px] lg:!text-[36px] !mb-[10px] md:!mb-[15px] bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                  {state.isSuccess ? "مرحباً بك في Furriyadh!" : 
                   state.isError ? "حدث خطأ" : 
                   "جاري التحقق..."}
                </h1>
                
                <p className="font-medium leading-[1.6] lg:text-lg text-[#445164] dark:text-gray-300 mb-8">
                  {state.message}
                </p>

                {/* Countdown */}
                {state.isSuccess && state.countdown > 0 && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-6">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      التوجيه خلال {state.countdown} ثوانٍ...
                    </span>
                  </div>
                )}
              </div>

              {/* Animation Section */}
              <div className="flex justify-center mb-8">
                {state.isProcessing && <LoadingAnimation />}
                {state.isSuccess && <SuccessAnimation />}
                {state.isError && <ErrorAnimation />}
              </div>

              {/* Status Message */}
              <div className="text-center mb-8">
                <span className="block font-semibold text-lg text-black dark:text-white">
                  {state.isProcessing && "جاري المعالجة..."}
                  {state.isSuccess && (
                    <>
                      تم تأكيد البريد الإلكتروني{" "}
                      <span className="text-green-600">بنجاح!</span>
                    </>
                  )}
                  {state.isError && (
                    <span className="text-red-600">فشل في التأكيد</span>
                  )}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {state.isSuccess && (
                  <Link
                    href="/dashboard/"
                    className="block w-full text-center transition-all duration-300 rounded-xl font-semibold py-4 px-6 text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <ArrowRight className="h-5 w-5" />
                      الانتقال إلى لوحة التحكم
                    </span>
                  </Link>
                )}

                {state.isError && (
                  <div className="space-y-3">
                    <button
                      onClick={handleRetry}
                      className="block w-full text-center transition-all duration-300 rounded-xl font-semibold py-4 px-6 text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center gap-3">
                        <RefreshCw className="h-5 w-5" />
                        إعادة المحاولة
                      </span>
                    </button>
                    
                    <Link
                      href="/"
                      className="block w-full text-center transition-all duration-300 rounded-xl font-semibold py-4 px-6 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <span className="flex items-center justify-center gap-3">
                        <Home className="h-5 w-5" />
                        العودة للصفحة الرئيسية
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Features Grid */}
              {state.isSuccess && <FeaturesGrid />}

              {/* Help Text */}
              {state.isError && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    نصائح لحل المشكلة:
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• تأكد من أن الرابط لم تنته صلاحيته</li>
                    <li>• تحقق من اتصالك بالإنترنت</li>
                    <li>• جرب فتح الرابط في متصفح آخر</li>
                    <li>• تواصل مع الدعم الفني إذا استمرت المشكلة</li>
                  </ul>
                </div>
              )}

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <Shield className="h-3 w-3" />
                  SSL مشفر
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  GDPR متوافق
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <Award className="h-3 w-3" />
                  ISO 27001
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailContent;

