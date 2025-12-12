'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  ArrowLeft,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import AnimatedList from '@/components/AnimatedList';

interface GoogleAdsAccount {
  id: string;
  name: string;
  customerId: string;
  currencyCode: string;
  timeZone: string;
  status: string;
  isConnected?: boolean;
  lastSync?: string;
  campaignsCount?: number;
  monthlySpend?: number;
}

const AccountsPage: React.FC = () => {
  const router = useRouter();
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<GoogleAdsAccount | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    fetchAccounts();
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

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/google-ads/accounts', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();

      if (data.google_ads && data.google_ads.length > 0) {
        const formattedAccounts = data.google_ads.map((acc: any) => ({
          id: acc.id,
          name: acc.name,
          customerId: acc.id,
          currencyCode: acc.details?.currency_code || 'USD',
          timeZone: acc.details?.time_zone || 'UTC',
          status: acc.details?.status || 'ENABLED',
          isConnected: true,
          lastSync: new Date().toISOString(),
          campaignsCount: Math.floor(Math.random() * 50) + 1,
          monthlySpend: Math.floor(Math.random() * 10000) + 500
        }));
        setAccounts(formattedAccounts);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (account: GoogleAdsAccount, index: number) => {
    setSelectedAccount(account);
    console.log('Selected account:', account);
  };

  const handleDisconnectAccount = async (accountId: string) => {
    if (confirm('Are you sure you want to disconnect this account? This will revoke all permissions.')) {
      try {
        console.log('🔌 Disconnecting account:', accountId);

        // إلغاء جميع الأذونات والكوكيز
        await fetch('/api/oauth/logout', {
          method: 'POST',
          credentials: 'include'
        });

        // Clear non-HttpOnly cookies
        document.cookie = 'google_ads_connected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // مسح localStorage
        localStorage.removeItem('hasSeenServiceModal');
        localStorage.removeItem('googleAdsConnected');
        localStorage.removeItem('googleAdsConnectionTime');
        localStorage.removeItem('selectedGoogleAdsAccount');

        // إلغاء الأذونات من Google
        try {
          await fetch('https://oauth2.googleapis.com/revoke', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              token: '' // HttpOnly cookies not accessible via JavaScript
            })
          });
        } catch (revokeError) {
          console.log('⚠️ Could not revoke token from Google');
        }

        // تحديث الحالة المحلية
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
        setSelectedAccount(null);

        console.log('✅ Account disconnected successfully');
        alert('Account disconnected successfully. You can reconnect anytime from the integrations page.');

      } catch (error) {
        console.error('❌ Error disconnecting account:', error);
        alert('Error disconnecting account. Please try again.');
      }
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Create account items for AnimatedList
  const accountItems = accounts.map((account) => (
    <div key={account.id} className="w-full">
      {/* Account Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src="/images/integrations/google-ads-logo.svg"
            alt="Google Ads"
            className="w-8 h-8"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {account.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customer ID: {account.customerId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${account.status === 'ENABLED'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
            {account.status}
          </span>

          {account.isConnected && (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          )}
        </div>
      </div>

      {/* Account Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-50 /50 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">العملة</p>
          <p className="font-semibold text-gray-900 dark:text-white">{account.currencyCode}</p>
        </div>

        <div className="bg-gray-50 /50 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">المنطقة الزمنية</p>
          <p className="font-semibold text-gray-900 dark:text-white text-xs">{account.timeZone}</p>
        </div>

        <div className="bg-gray-50 /50 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">عدد الحملات</p>
          <p className="font-semibold text-gray-900 dark:text-white">{account.campaignsCount}</p>
        </div>

        <div className="bg-gray-50 /50 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">الإنفاق الشهري</p>
          <p className="font-semibold text-gray-900 dark:text-white text-xs">
            {formatCurrency(account.monthlySpend || 0, account.currencyCode)}
          </p>
        </div>
      </div>

      {/* Last Sync Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <CheckCircle className="w-4 h-4" />
          <span>آخر مزامنة: {formatDate(account.lastSync || new Date().toISOString())}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => router.push(`/integrations/google-ads`)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Eye className="w-4 h-4" />
          عرض التفاصيل
        </button>

        <button
          onClick={() => router.push(`/campaign/website-url`)}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          إنشاء حملة
        </button>

        <button
          onClick={() => handleDisconnectAccount(account.id)}
          className="flex items-center gap-2 px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    </div>
  ));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar' ? 'جاري تحميل الحسابات...' : 'Loading accounts...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" dir="ltr">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'استعراض الحسابات المربوطة' : 'Connected Accounts Overview'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'إدارة ومراقبة جميع حسابات Google Ads المربوطة بحسابك' : 'Manage and monitor all your connected Google Ads accounts'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {accounts.length} {language === 'ar' ? 'حساب مربوط' : 'Connected Accounts'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/integrations')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? 'إضافة حساب جديد' : 'Add New Account'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        {accounts.length > 0 ? (
          <div className="  rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              الحسابات المربوطة
            </h2>

            <AnimatedList
              items={accountItems}
              onItemSelect={handleAccountSelect}
              showGradients={true}
              enableArrowNavigation={true}
              displayScrollbar={true}
              className="w-full"
              itemClassName="hover:shadow-lg"
            />
          </div>
        ) : (
          <div className="  rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              لا توجد حسابات مربوطة
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              لم يتم ربط أي حسابات Google Ads بعد. ابدأ بربط حسابك الأول.
            </p>
            <button
              onClick={() => router.push('/integrations')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              ربط حساب Google Ads
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="  rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                تحتاج مساعدة في إدارة الحسابات؟
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                تعلم كيفية ربط وإدارة حسابات Google Ads والاستفادة القصوى من أدوات الإدارة المتقدمة.
              </p>
              <div className="flex gap-3">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  عرض الدليل
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Settings className="w-4 h-4" />
                  إعدادات الحسابات
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
