// src/app/select-ads-account/page.tsx
// صفحة اختيار الحسابات الإعلانية بعد نجاح OAuth

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';

interface GoogleAdsAccount {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  testAccount: boolean;
  manager: boolean;
}

// Component منفصل يستخدم useSearchParams
const SelectAdsAccountContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isRTL, setIsRTL] = useState(false);

  // دالة توحيد شكل المعرف الرقمي (إزالة الشرطات)
  const normalizeCustomerId = (id: string) => {
    if (!id) return '';
    return id.toString().replace(/-/g, '').trim();
  };

  useEffect(() => {
    fetchGoogleAdsAccounts();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const updateLanguage = () => {
      const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
      if (savedLanguage) {
        setLanguage(savedLanguage);
        setIsRTL(savedLanguage === 'ar');
      }
    };
    updateLanguage();
    window.addEventListener('languageChange', updateLanguage);
    return () => window.removeEventListener('languageChange', updateLanguage);
  }, []);

  const fetchGoogleAdsAccounts = async () => {
    try {
      setLoading(true);

      const response = await authFetch('/api/google-ads/accounts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const normalizedAccounts = (data.accounts || []).map((acc: any) => ({
          ...acc,
          customerId: normalizeCustomerId(acc.customerId || acc.id)
        }));
        setAccounts(normalizedAccounts);

        if (normalizedAccounts.length === 0) {
          setError('لم يتم العثور على حسابات Google Ads مرتبطة بهذا الإيميل');
        }
      } else {
        setError(data.error || 'فشل في جلب الحسابات الإعلانية');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('حدث خطأ أثناء جلب الحسابات الإعلانية');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = async (rawCustomerId: string) => {
    try {
      const customerId = normalizeCustomerId(rawCustomerId);
      setConnecting(true);
      setSelectedAccount(customerId);

      // ربط الحساب المختار بالـ MCC
      const response = await authFetch('/api/google-ads/connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          action: 'connect_to_mcc'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // حفظ معلومات الحساب المختار
        localStorage.setItem('selectedGoogleAdsAccount', JSON.stringify({
          customerId,
          descriptiveName: accounts.find(acc => normalizeCustomerId(acc.customerId) === customerId)?.descriptiveName,
          connectedAt: new Date().toISOString()
        }));

        // التوجيه للـ Dashboard
        router.push('/dashboard/google-ads?account_connected=true&customer_id=' + customerId);
      } else {
        setError(data.error || 'فشل في ربط الحساب');
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      setError('حدث خطأ أثناء ربط الحساب');
    } finally {
      setConnecting(false);
      setSelectedAccount(null);
    }
  };

  const handleSkip = () => {
    // التوجيه للـ Dashboard بدون ربط حساب محدد
    router.push('/dashboard/google-ads?oauth_completed=true');
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">جاري جلب حساباتك الإعلانية...</h2>
          <p className="text-gray-600">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">خطأ في جلب الحسابات</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={fetchGoogleAdsAccounts}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                تخطي
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" dir="ltr">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar' ? 'اختر حسابك الإعلاني' : 'Select your Ads Account'}
          </h1>
          <p className="text-lg text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar'
              ? `تم العثور على ${accounts.length} حساب إعلاني مرتبط بإيميلك`
              : `Found ${accounts.length} ad account(s) linked to your email`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div
              key={account.customerId}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {account.descriptiveName || `حساب ${account.customerId}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {account.customerId}
                  </p>
                </div>
                {account.manager && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    MCC
                  </span>
                )}
                {account.testAccount && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    تجريبي
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">العملة:</span>
                  <span className="text-gray-900">{account.currencyCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المنطقة الزمنية:</span>
                  <span className="text-gray-900">{account.timeZone}</span>
                </div>
              </div>

              <button
                onClick={() => handleAccountSelect(account.customerId)}
                disabled={connecting && selectedAccount === account.customerId}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${connecting && selectedAccount === account.customerId
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {connecting && selectedAccount === account.customerId ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الربط...
                  </div>
                ) : (
                  'اختيار هذا الحساب'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            تخطي واختيار لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen  flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">جاري تحميل الصفحة...</h2>
      <p className="text-gray-600">يرجى الانتظار</p>
    </div>
  </div>
);

// Main page component مع Suspense boundary
const SelectAdsAccountPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SelectAdsAccountContent />
    </Suspense>
  );
};

export default SelectAdsAccountPage;

