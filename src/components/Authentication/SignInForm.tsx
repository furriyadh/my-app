// SignInForm Component - Fixed & Optimized
// ========================================
// مكون تسجيل الدخول المُصحح والمحسن

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, authHelpers } from "@/utils/supabase/client";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

// أنواع البيانات
interface SignInFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface AuthState {
  isLoading: boolean;
  isSuccess: boolean;
  errors: FormErrors;
}

const SignInForm: React.FC = () => {
  const router = useRouter();
  
  // حالة النموذج
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: ''
  });
  
  // حالة المصادقة
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    isSuccess: false,
    errors: {}
  });
  
  // إظهار/إخفاء كلمة المرور
  const [showPassword, setShowPassword] = useState(false);
  
  // التحقق من الجلسة الحالية عند تحميل المكون
  useEffect(() => {
    checkCurrentSession();
  }, []);

  // التحقق من الجلسة الحالية
  const checkCurrentSession = async () => {
    try {
      const { success, session } = await authHelpers.getCurrentSession();
      if (success && session) {
        // المستخدم مسجل دخول بالفعل، توجيه للداشبورد
        router.push('/dashboard');
      }
    } catch (error) {
      console.log('No active session');
    }
  };

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // التحقق من الإيميل
    if (!formData.email) {
      errors.email = 'الإيميل مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'صيغة الإيميل غير صحيحة';
    }
    
    // التحقق من كلمة المرور
    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    setAuthState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  // معالجة تغيير البيانات
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // إزالة الخطأ عند بدء الكتابة
    if (authState.errors[name as keyof FormErrors]) {
      setAuthState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [name]: undefined
        }
      }));
    }
  };

  // معالجة تسجيل الدخول
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (!validateForm()) {
      return;
    }
    
    // بدء عملية تسجيل الدخول
    setAuthState(prev => ({
      ...prev,
      isLoading: true,
      errors: {}
    }));
    
    try {
      // تسجيل الدخول باستخدام Supabase
      const { success, data, error } = await authHelpers.signInWithEmail(
        formData.email,
        formData.password
      );
      
      if (success && data.user) {
        // نجح تسجيل الدخول
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isSuccess: true,
          errors: {}
        }));
        
        // انتظار قصير لإظهار رسالة النجاح
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
        
      } else {
        // فشل تسجيل الدخول
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isSuccess: false,
          errors: {
            general: error || 'فشل في تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.'
          }
        }));
      }
      
    } catch (error: any) {
      // خطأ غير متوقع
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: false,
        errors: {
          general: 'حدث خطأ غير متوقع. حاول مرة أخرى.'
        }
      }));
      console.error('Sign in error:', error);
    }
  };

  // معالجة تسجيل الدخول بـ Google
  const handleGoogleSignIn = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { success, error } = await authHelpers.signInWithGoogle();
      
      if (!success) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          errors: {
            general: error || 'فشل في تسجيل الدخول بـ Google'
          }
        }));
      }
      // إذا نجح، سيتم التوجيه تلقائياً بواسطة OAuth callback
      
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        errors: {
          general: 'حدث خطأ في تسجيل الدخول بـ Google'
        }
      }));
      console.error('Google sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            أو{' '}
            <Link 
              href="/authentication/sign-up" 
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            
            {/* رسالة الخطأ العامة */}
            {authState.errors.general && (
              <div className="flex items-center space-x-2 space-x-reverse bg-red-50 border border-red-200 rounded-md p-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{authState.errors.general}</span>
              </div>
            )}

            {/* رسالة النجاح */}
            {authState.isSuccess && (
              <div className="flex items-center space-x-2 space-x-reverse bg-green-50 border border-green-200 rounded-md p-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-green-700">تم تسجيل الدخول بنجاح! جاري التوجيه...</span>
              </div>
            )}

            {/* حقل الإيميل */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pr-10 px-3 py-2 border ${
                    authState.errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors`}
                  placeholder="أدخل بريدك الإلكتروني"
                  disabled={authState.isLoading}
                />
              </div>
              {authState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{authState.errors.email}</p>
              )}
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pr-10 pl-10 px-3 py-2 border ${
                    authState.errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors`}
                  placeholder="أدخل كلمة المرور"
                  disabled={authState.isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={authState.isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {authState.errors.password && (
                <p className="mt-1 text-sm text-red-600">{authState.errors.password}</p>
              )}
            </div>

            {/* خيارات إضافية */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900">
                  تذكرني
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  href="/authentication/forgot-password" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            {/* أزرار التسجيل */}
            <div className="space-y-3">
              {/* زر تسجيل الدخول العادي */}
              <button
                type="submit"
                disabled={authState.isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  authState.isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                } transition-colors`}
              >
                {authState.isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>

              {/* فاصل */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">أو</span>
                </div>
              </div>

              {/* زر تسجيل الدخول بـ Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authState.isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md ${
                  authState.isLoading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                } transition-colors`}
              >
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                تسجيل الدخول بـ Google
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            بتسجيل الدخول، أنت توافق على{' '}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
              شروط الاستخدام
            </Link>
            {' '}و{' '}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;

