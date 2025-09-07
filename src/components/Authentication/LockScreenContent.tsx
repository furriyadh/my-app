"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Shield, 
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  LogIn,
  Settings,
  HelpCircle,
  ArrowRight,
  Loader2
} from "lucide-react";

// Types
interface LockScreenState {
  password: string;
  isLoading: boolean;
  showPassword: boolean;
  error: string;
  attempts: number;
  isLocked: boolean;
  lockTimeRemaining: number;
  sessionExpired: boolean;
  lastActivity: Date | null;
}

interface UserInfo {
  name: string;
  email: string;
  avatar: string;
  role: string;
  lastLogin: Date;
}

// Constants
const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60; // 15 minutes in seconds
const SESSION_TIMEOUT = 30 * 60; // 30 minutes in seconds

const LockScreenContent: React.FC = () => {
  // State Management
  const [state, setState] = useState<LockScreenState>({
    password: "",
    isLoading: false,
    showPassword: false,
    error: "",
    attempts: 0,
    isLocked: false,
    lockTimeRemaining: 0,
    sessionExpired: false,
    lastActivity: null
  });

  // Mock user data - تحديث لاستخدام البيانات الفعلية من OAuth2
  const [userInfo] = useState<UserInfo>(() => {
    // محاولة الحصول على بيانات المستخدم من localStorage أو cookies
    try {
      // التحقق من وجود document (client-side only)
      if (typeof window === 'undefined') {
        return {
          name: "User",
          email: "user@example.com",
          avatar: "/images/avatar-placeholder.png",
          role: "User",
          lastLogin: new Date()
        };
      }
      
      const userInfoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('oauth2_user_info='));
      
      if (userInfoCookie) {
        const userData = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
        return {
          name: userData.name || "مستخدم النظام",
          email: userData.email || "user@example.com",
          avatar: userData.picture || "/images/admin.png",
          role: "مدير النظام",
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
        };
      }
    } catch (error) {
      console.warn('Could not parse user info from cookies:', error);
    }
    
    // البيانات الافتراضية إذا لم يتم العثور على بيانات المستخدم
    return {
      name: "مستخدم النظام",
      email: "user@example.com",
      avatar: "/images/admin.png",
      role: "مدير النظام",
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
    };
  });

  // Lock timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isLocked && state.lockTimeRemaining > 0) {
      interval = setInterval(() => {
        setState(prev => {
          const newTime = prev.lockTimeRemaining - 1;
          if (newTime <= 0) {
            return {
              ...prev,
              isLocked: false,
              lockTimeRemaining: 0,
              attempts: 0,
              error: ""
            };
          }
          return { ...prev, lockTimeRemaining: newTime };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isLocked, state.lockTimeRemaining]);

  // Session timeout check
  useEffect(() => {
    const checkSessionTimeout = () => {
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity) {
        const timeDiff = (Date.now() - parseInt(lastActivity)) / 1000;
        if (timeDiff > SESSION_TIMEOUT) {
          setState(prev => ({ ...prev, sessionExpired: true }));
        }
      }
    };

    checkSessionTimeout();
    const interval = setInterval(checkSessionTimeout, 60000);

    return () => clearInterval(interval);
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setState(prev => ({
      ...prev,
      password: value,
      error: value ? "" : prev.error
    }));
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  // Handle unlock
  const handleUnlock = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (state.isLocked) return;
    if (!state.password.trim()) {
      setState(prev => ({ ...prev, error: "يرجى إدخال كلمة المرور" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: "" }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isValidPassword = state.password === "123456";
      
      if (isValidPassword) {
        localStorage.setItem("lastActivity", Date.now().toString());
        localStorage.setItem("isAuthenticated", "true");
        window.location.href = "/dashboard";
      } else {
        const newAttempts = state.attempts + 1;
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            attempts: newAttempts,
            isLocked: true,
            lockTimeRemaining: LOCK_DURATION,
            error: `تم قفل الحساب لمدة ${LOCK_DURATION / 60} دقيقة بسبب المحاولات المتكررة`
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            attempts: newAttempts,
            error: `كلمة المرور غير صحيحة. المحاولات المتبقية: ${MAX_ATTEMPTS - newAttempts}`,
            password: ""
          }));
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى."
      }));
    }
  }, [state.password, state.attempts, state.isLocked]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle forgot password
  const handleForgotPassword = useCallback(() => {
    window.location.href = "/auth/forgot-password";
  }, []);

  // Handle switch user
  const handleSwitchUser = useCallback(() => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("lastActivity");
    window.location.href = "/auth/login";
  }, []);

  // Furriyadh Logo Component
  const FurriyadhLogo = () => (
    <div className="flex items-center gap-2 mb-6">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
        Furriyadh
      </span>
    </div>
  );

  // Loading Animation Component
  const LoadingAnimation = () => (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>جاري التحقق...</span>
    </div>
  );

  // Lock Animation Component
  const LockAnimation = () => (
    <div className="text-center py-8">
      <div className="relative mx-auto w-20 h-20 mb-4">
        <Lock className="w-20 h-20 text-red-500 animate-pulse" />
        <div className="absolute inset-0 border-4 border-red-200 rounded-full animate-ping"></div>
      </div>
      <h3 className="text-lg font-semibold text-red-600 mb-2">تم قفل الحساب</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        تم قفل حسابك مؤقتاً بسبب المحاولات المتكررة
      </p>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
          <Clock className="w-5 h-5" />
          <span className="font-mono text-xl">{formatTimeRemaining(state.lockTimeRemaining)}</span>
        </div>
        <p className="text-sm text-red-500 mt-2">سيتم إلغاء القفل تلقائياً</p>
      </div>
    </div>
  );

  // Session Expired Component
  const SessionExpiredBanner = () => (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <div>
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">انتهت صلاحية الجلسة</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            يرجى إدخال كلمة المرور للمتابعة
          </p>
        </div>
      </div>
    </div>
  );

  // Security Tips Component
  const SecurityTips = () => (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-blue-800 dark:text-blue-200">نصائح الأمان</h4>
      </div>
      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
        <li>• استخدم كلمة مرور قوية ومعقدة</li>
        <li>• لا تشارك كلمة المرور مع أي شخص</li>
        <li>• قم بتسجيل الخروج عند الانتهاء</li>
        <li>• تأكد من أمان جهازك</li>
      </ul>
    </div>
  );

  return (
    <>
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px] min-h-screen">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            
            {/* Left Side - Image */}
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1 relative">
              <Image
                src="/images/lock-screen.jpg"
                alt="شاشة القفل"
                className="rounded-[25px] w-full h-auto object-cover shadow-2xl"
                width={646}
                height={804}
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'646\' height=\'804\' viewBox=\'0 0 646 804\'%3E%3Crect width=\'646\' height=\'804\' fill=\'%23f3f4f6\'%3E%3C/rect%3E%3Ctext x=\'323\' y=\'402\' text-anchor=\'middle\' fill=\'%236b7280\' font-family=\'Arial\' font-size=\'24\'%3ELock Screen%3C/text%3E%3C/svg%3E";
                }}
              />
              
              {/* Floating Security Badge */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-[25px]"></div>
            </div>

            {/* Right Side - Lock Form */}
            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              
              {/* Logo Section */}
              <div className="mb-6">
                <FurriyadhLogo />
                
                {/* Fallback to original logos if needed */}
                <div className="hidden">
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
                </div>
              </div>

              {/* Session Expired Banner */}
              {state.sessionExpired && <SessionExpiredBanner />}

              {/* Lock Screen Content */}
              {state.isLocked ? (
                <LockAnimation />
               ) : (
                <>
                  {/* Header */}
                  <div className="my-[17px] md:my-[25px]">
                    <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[10px] text-black dark:text-white">
                      مرحباً بعودتك إلى Furriyadh!
                    </h1>
                    <p className="font-medium leading-[1.5] lg:text-md text-[#445164] dark:text-gray-400">
                      أدخل كلمة المرور للوصول إلى لوحة الإدارة
                    </p>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center mb-[20px] p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Image
                        src="/images/admin.png"
                        alt="صورة المدير"
                        className="rounded-full w-[50px] h-[50px] border-[2px] ltr:mr-[13px] rtl:ml-[13px] border-blue-500 object-cover"
                        width={50}
                        height={50}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'50\' height=\'50\' viewBox=\'0 0 50 50\'%3E%3Ccircle cx=\'25\' cy=\'25\' r=\'25\' fill=\'%236b7280\'%3E%3C/circle%3E%3Ctext x=\'25\' y=\'30\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial\' font-size=\'16\'%3EUser%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-black dark:text-white block">
                        {userInfo.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {userInfo.role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSwitchUser}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="تبديل المستخدم"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Password Form */}
                  <form onSubmit={handleUnlock} className="space-y-4">
                    {/* Password Input */}
                    <div className="mb-[15px] relative" id="passwordHideShow">
                      <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                        كلمة المرور
                      </label>
                      <div className="relative">
                        <input
                          type={state.showPassword ? "text" : "password"}
                          value={state.password}
                          onChange={handleInputChange}
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] pr-[50px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          id="password"
                          placeholder="أدخل كلمة المرور"
                          disabled={state.isLoading}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {state.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Error Message */}
                    {state.error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{state.error}</span>
                      </div>
                     )}

                    {/* Attempts Warning */}
                    {state.attempts > 0 && state.attempts < MAX_ATTEMPTS && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">
                          تحذير: {state.attempts} من {MAX_ATTEMPTS} محاولات مستخدمة
                        </span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={state.isLoading || !state.password.trim()}
                      className="md:text-md block w-full text-center transition-all rounded-md font-medium mt-[20px] py-[12px] px-[25px] text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center gap-[5px]">
                        {state.isLoading ? (
                          <LoadingAnimation />
                        ) : (
                          <>
                            <LogIn className="w-5 h-5" />
                            <span>تسجيل الدخول</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </button>

                    {/* Action Links */}
                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        <HelpCircle className="w-4 h-4" />
                        نسيت كلمة المرور؟
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => window.location.href = "/settings"}
                        className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
                      >
                        <Settings className="w-4 h-4" />
                        الإعدادات
                      </button>
                    </div>
                  </form>

                  {/* Security Tips */}
                  <SecurityTips />
                </>
              )}

              {/* Footer Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  آخر نشاط: {userInfo.lastLogin.toLocaleString("ar-SA")}
                </p>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>اتصال آمن</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Shield className="w-3 h-3" />
                    <span>محمي بـ SSL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LockScreenContent;
