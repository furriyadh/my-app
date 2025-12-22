"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  Key,
  RefreshCw,
  Check,
  X,
  Info,
  Star,
  Heart,
  Award,
  Zap
} from "lucide-react";

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
interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

interface FormState {
  isLoading: boolean;
  isSuccess: boolean;
  errors: FormErrors;
  showPasswords: {
    old: boolean;
    new: boolean;
    confirm: boolean;
  };
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

// Password Strength Checker
const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("يجب أن تكون كلمة المرور 8 أحرف على الأقل");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("يجب أن تحتوي على حرف صغير");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("يجب أن تحتوي على حرف كبير");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("يجب أن تحتوي على رقم");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("يجب أن تحتوي على رمز خاص");
  }

  const strengthLevels = [
    { color: "bg-red-500", label: "ضعيفة جداً" },
    { color: "bg-red-400", label: "ضعيفة" },
    { color: "bg-yellow-500", label: "متوسطة" },
    { color: "bg-blue-500", label: "قوية" },
    { color: "bg-green-500", label: "قوية جداً" }
  ];

  return {
    score,
    feedback,
    color: strengthLevels[score]?.color || "bg-gray-300",
    label: strengthLevels[score]?.label || "غير محددة"
  };
};

// Password Strength Indicator Component
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const strength = checkPasswordStrength(password);
  
  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Strength Bar */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              index < strength.score ? strength.color : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>
      
      {/* Strength Label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          قوة كلمة المرور: <span className={`${strength.color.replace('bg-', 'text-')}`}>
            {strength.label}
          </span>
        </span>
        <div className="flex items-center gap-1">
          {strength.score >= 4 && <CheckCircle className="h-4 w-4 text-green-500" />}
          {strength.score < 3 && <AlertCircle className="h-4 w-4 text-yellow-500" />}
        </div>
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <X className="h-3 w-3 text-red-500" />
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {[
          { test: password.length >= 8, label: "8+ أحرف" },
          { test: /[a-z]/.test(password), label: "حرف صغير" },
          { test: /[A-Z]/.test(password), label: "حرف كبير" },
          { test: /[0-9]/.test(password), label: "رقم" },
          { test: /[^A-Za-z0-9]/.test(password), label: "رمز خاص" }
        ].map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.test ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-gray-400" />
            )}
            <span className={req.test ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Password Input Component
const PasswordInput: React.FC<{
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  error?: string;
  showStrength?: boolean;
  disabled?: boolean;
}> = ({ 
  id, 
  label, 
  placeholder, 
  value, 
  onChange, 
  showPassword, 
  onToggleShow, 
  error, 
  showStrength = false,
  disabled = false 
}) => {
  return (
    <div className="mb-6">
      <label className="mb-3 text-black dark:text-white font-semibold block text-sm">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`h-14 rounded-xl text-black dark:text-white border-2 bg-white dark:bg-[#0c1427] px-5 pr-12 block w-full outline-0 transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
            error 
              ? "border-red-500 focus:border-red-600" 
              : "border-gray-200 dark:border-[#172036] focus:border-blue-500 dark:focus:border-blue-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          placeholder={placeholder}
        />
        
        {/* Toggle Password Visibility */}
        <button
          type="button"
          onClick={onToggleShow}
          disabled={disabled}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      {/* Password Strength */}
      {showStrength && <PasswordStrengthIndicator password={value} />}
    </div>
  );
};

// Success Animation Component
const SuccessAnimation: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="relative mx-auto w-24 h-24 mb-6">
        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-green-400 rounded-full animate-bounce`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
      
      <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
        تم تغيير كلمة المرور بنجاح!
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة
      </p>
    </div>
  );
};

const ResetPasswordForm: React.FC = () => {
  const supabase = useSupabaseClient(); // استخدام hook للـ dynamic import
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResetMode = searchParams?.get('mode') === 'reset';
  
  const [formData, setFormData] = useState<FormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [state, setState] = useState<FormState>({
    isLoading: false,
    isSuccess: false,
    errors: {},
    showPasswords: {
      old: false,
      new: false,
      confirm: false
    }
  });

  // Validate form
  const validateForm = useCallback((): FormErrors => {
    const errors: FormErrors = {};

    if (!isResetMode && !formData.oldPassword.trim()) {
      errors.oldPassword = "كلمة المرور القديمة مطلوبة";
    }

    if (!formData.newPassword.trim()) {
      errors.newPassword = "كلمة المرور الجديدة مطلوبة";
    } else {
      const strength = checkPasswordStrength(formData.newPassword);
      if (strength.score < 3) {
        errors.newPassword = "كلمة المرور ضعيفة جداً";
      }
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    return errors;
  }, [formData, isResetMode]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التأكد من تحميل supabase قبل المتابعة
    if (!supabase) {
      setState(prev => ({ 
        ...prev, 
        errors: { general: "جاري تحميل النظام..." } 
      }));
      return;
    }
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, errors }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, errors: {} }));

    try {
      if (isResetMode) {
        // Reset password mode (from email link)
        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (error) {
          throw error;
        }
      } else {
        // Change password mode (logged in user)
        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (error) {
          throw error;
        }
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isSuccess: true 
      }));

      // Redirect after success
      setTimeout(() => {
        router.push("/authentication/sign-in");
      }, 3000);

    } catch (error: any) {
      console.error('خطأ في تغيير كلمة المرور:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        errors: { 
          general: error.message || "حدث خطأ أثناء تغيير كلمة المرور" 
        } 
      }));
    }
  }, [formData, validateForm, isResetMode, router, supabase]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (state.errors[field]) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: undefined }
      }));
    }
  }, [state.errors]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback((field: keyof FormState['showPasswords']) => {
    setState(prev => ({
      ...prev,
      showPasswords: {
        ...prev.showPasswords,
        [field]: !prev.showPasswords[field]
      }
    }));
  }, []);

  // Check for reset token on mount
  useEffect(() => {
    const checkResetToken = async () => {
      if (isResetMode && supabase) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          router.push("/authentication/forgot-password");
        }
      }
    };

    checkResetToken();
  }, [isResetMode, router, supabase]);

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

  if (state.isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <FurriyadhLogo className="mx-auto mb-8" />
            <SuccessAnimation />
            <Link
              href="/authentication/sign-in"
              className="block w-full text-center transition-all duration-300 rounded-xl font-semibold py-4 px-6 text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              تسجيل الدخول الآن
            </Link>
          </div>
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
                  src="/images/reset-password.jpg"
                  alt="reset-password-image"
                  className="rounded-[25px] shadow-2xl"
                  width={646}
                  height={804}
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-[25px]" />
                
                {/* Floating Security Icon */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              
              {/* Logo */}
              <FurriyadhLogo className="mb-8" />

              {/* Header */}
              <div className="my-[17px] md:my-[25px]">
                <h1 className="!font-bold !text-[28px] md:!text-[32px] lg:!text-[36px] !mb-[10px] md:!mb-[15px] bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                  {isResetMode ? "إعادة تعيين كلمة المرور" : "تغيير كلمة المرور"}
                </h1>
                <p className="font-medium leading-[1.6] lg:text-lg text-[#445164] dark:text-gray-300">
                  {isResetMode 
                    ? "أدخل كلمة المرور الجديدة وأكدها في الحقل أدناه"
                    : "أدخل كلمة المرور القديمة ثم كلمة المرور الجديدة"
                  }
                </p>
              </div>

              {/* General Error */}
              {state.errors.general && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-700 dark:text-red-300 font-medium">
                      {state.errors.general}
                    </span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Old Password (only if not reset mode) */}
                {!isResetMode && (
                  <PasswordInput
                    id="oldPassword"
                    label="كلمة المرور القديمة"
                    placeholder="أدخل كلمة المرور القديمة"
                    value={formData.oldPassword}
                    onChange={(value) => handleInputChange('oldPassword', value)}
                    showPassword={state.showPasswords.old}
                    onToggleShow={() => togglePasswordVisibility('old')}
                    error={state.errors.oldPassword}
                    disabled={state.isLoading}
                  />
                )}

                {/* New Password */}
                <PasswordInput
                  id="newPassword"
                  label="كلمة المرور الجديدة"
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={formData.newPassword}
                  onChange={(value) => handleInputChange('newPassword', value)}
                  showPassword={state.showPasswords.new}
                  onToggleShow={() => togglePasswordVisibility('new')}
                  error={state.errors.newPassword}
                  showStrength={true}
                  disabled={state.isLoading}
                />

                {/* Confirm Password */}
                <PasswordInput
                  id="confirmPassword"
                  label="تأكيد كلمة المرور"
                  placeholder="أكد كلمة المرور الجديدة"
                  value={formData.confirmPassword}
                  onChange={(value) => handleInputChange('confirmPassword', value)}
                  showPassword={state.showPasswords.confirm}
                  onToggleShow={() => togglePasswordVisibility('confirm')}
                  error={state.errors.confirmPassword}
                  disabled={state.isLoading}
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={state.isLoading}
                  className="w-full text-center transition-all duration-300 rounded-xl font-semibold py-4 px-6 text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="flex items-center justify-center gap-3">
                    {state.isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري التحديث...
                      </>
                    ) : (
                      <>
                        <Key className="h-5 w-5" />
                        {isResetMode ? "إعادة تعيين كلمة المرور" : "تغيير كلمة المرور"}
                      </>
                    )}
                  </span>
                </button>

                {/* Back Link */}
                <div className="text-center">
                  <Link
                    href="/authentication/sign-in"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 transition-all font-semibold hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    العودة لتسجيل الدخول
                  </Link>
                </div>
              </form>

              {/* Security Tips */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  نصائح الأمان
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-green-600" />
                    استخدم كلمة مرور قوية وفريدة
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-green-600" />
                    لا تشارك كلمة المرور مع أحد
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-green-600" />
                    فعّل المصادقة الثنائية
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-green-600" />
                    غيّر كلمة المرور بانتظام
                  </li>
                </ul>
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <Shield className="h-3 w-3" />
                  SSL مشفر
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <Lock className="h-3 w-3" />
                  بيانات آمنة
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

export default ResetPasswordForm;

