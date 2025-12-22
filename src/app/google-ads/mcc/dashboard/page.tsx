'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MCCAccount {
  customer_id: string;
  name: string;
  currency_code: string;
  time_zone: string;
  status: string;
  account_type: string;
  manager: boolean;
  test_account: boolean;
  auto_tagging_enabled: boolean;
  has_partners_badge: boolean;
  descriptive_name: string;
  can_manage_clients: boolean;
  optimization_score: number;
  last_updated: string;
}

interface MCCStats {
  total_accounts: number;
  active_accounts: number;
  pending_accounts: number;
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  average_cpc: number;
  conversion_rate: number;
  optimization_score: number;
}

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  verified_email: boolean;
  locale?: string;
}

export default function MCCDashboard() {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isRTL, setIsRTL] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accounts, setAccounts] = useState<MCCAccount[]>([]);
  const [stats, setStats] = useState<MCCStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadUserData();
    loadMCCData();
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

  const loadUserData = () => {
    try {
      const userInfoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('oauth2_user_info='));

      if (userInfoCookie) {
        const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
        setUserInfo(userInfo);
      } else {
        setError('لم يتم العثور على بيانات المستخدم. يرجى ربط الحساب أولاً.');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('خطأ في قراءة بيانات المستخدم');
    }
  };

  const loadMCCData = async () => {
    try {
      setLoading(true);

      // استخدام النظام الموجود في الباك اند
      const response = await fetch('/api/mcc/accounts', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAccounts(data.accounts || []);
          setStats(data.statistics || null);
        } else {
          setError(data.error || 'فشل في تحميل بيانات MCC');
        }
      } else {
        setError('فشل في الاتصال بالخادم');
      }
    } catch (error) {
      console.error('Error loading MCC data:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelection = (customerId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAccounts(accounts.map(account => account.customer_id));
  };

  const handleDeselectAll = () => {
    setSelectedAccounts([]);
  };

  const handleBulkOperation = async (operation: string) => {
    if (selectedAccounts.length === 0) {
      setError('يرجى اختيار حسابات للعملية');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/mcc/accounts/${operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_ids: selectedAccounts
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`تم تنفيذ العملية بنجاح على ${selectedAccounts.length} حساب`);
        setSelectedAccounts([]);
        loadMCCData(); // إعادة تحميل البيانات
      } else {
        setError(result.error || 'فشل في تنفيذ العملية');
      }
    } catch (error) {
      console.error('Error in bulk operation:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setProcessing(false);
    }
  };

  const handleSyncAccounts = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/mcc/accounts/sync', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('تم مزامنة الحسابات بنجاح');
          loadMCCData();
        } else {
          setError(result.error || 'فشل في مزامنة الحسابات');
        }
      } else {
        setError('فشل في الاتصال بالخادم');
      }
    } catch (error) {
      console.error('Error syncing accounts:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل بيانات MCC...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">خطأ</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/campaign/website-url')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة لصفحة ربط الحساب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className=" rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                لوحة تحكم MCC المتطورة
              </h1>
              <p className="text-gray-600">
                مرحباً {userInfo?.name || userInfo?.email}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSyncAccounts}
                disabled={processing}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                🔄 مزامنة الحسابات
              </button>
              <button
                onClick={() => router.push('/campaign/website-url')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ ربط حساب جديد
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total_accounts}
                </div>
                <div className="text-sm text-gray-600">إجمالي الحسابات</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.active_accounts}
                </div>
                <div className="text-sm text-gray-600">حسابات نشطة</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${stats.total_spend?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">إجمالي الإنفاق</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.conversion_rate?.toFixed(2) || '0'}%
                </div>
                <div className="text-sm text-gray-600">معدل التحويل</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {['overview', 'accounts', 'analytics', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                {tab === 'overview' && 'نظرة عامة'}
                {tab === 'accounts' && 'الحسابات'}
                {tab === 'analytics' && 'التحليلات'}
                {tab === 'settings' && 'الإعدادات'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className=" rounded-lg shadow-lg p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">نظرة عامة على MCC</h2>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">الأداء العام</h3>
                  <div className="text-3xl font-bold mb-2">
                    {stats?.optimization_score?.toFixed(1) || '0'}%
                  </div>
                  <p className="text-blue-100">معدل التحسين</p>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">الإنطباعات</h3>
                  <div className="text-3xl font-bold mb-2">
                    {stats?.total_impressions?.toLocaleString() || '0'}
                  </div>
                  <p className="text-green-100">إجمالي الإنطباعات</p>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">النقرات</h3>
                  <div className="text-3xl font-bold mb-2">
                    {stats?.total_clicks?.toLocaleString() || '0'}
                  </div>
                  <p className="text-purple-100">إجمالي النقرات</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">النشاط الأخير</h3>
                <div className="space-y-3">
                  {accounts.slice(0, 5).map((account) => (
                    <div key={account.customer_id} className="flex items-center justify-between p-3  rounded-lg shadow-sm">
                      <div>
                        <p className="font-medium text-gray-800">{account.descriptive_name}</p>
                        <p className="text-sm text-gray-600">آخر تحديث: {new Date(account.last_updated).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${account.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {account.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                        </span>
                        <span className="text-sm text-gray-500">{account.currency_code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">إدارة الحسابات</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    تحديد الكل
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 transition-colors"
                  >
                    إلغاء التحديد
                  </button>
                </div>
              </div>

              {selectedAccounts.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-blue-800">
                      تم تحديد {selectedAccounts.length} حساب
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBulkOperation('pause')}
                        disabled={processing}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50"
                      >
                        إيقاف مؤقت
                      </button>
                      <button
                        onClick={() => handleBulkOperation('activate')}
                        disabled={processing}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        تفعيل
                      </button>
                      <button
                        onClick={() => handleBulkOperation('optimize')}
                        disabled={processing}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        تحسين
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.customer_id}
                    className={`border rounded-lg p-4 transition-all ${selectedAccounts.includes(account.customer_id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.includes(account.customer_id)}
                          onChange={() => handleAccountSelection(account.customer_id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {account.descriptive_name || account.name}
                          </h3>
                          <p className="text-sm text-gray-600">ID: {account.customer_id}</p>
                          <div className="flex gap-4 mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {account.currency_code}
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {account.time_zone}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${account.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {account.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                            </span>
                            {account.test_account && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                حساب تجريبي
                              </span>
                            )}
                            {account.manager && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                مدير
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          التحسين: {account.optimization_score?.toFixed(1) || '0'}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(account.last_updated).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">التحليلات المتقدمة</h2>
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">تحليلات متقدمة</h3>
                <p className="text-gray-500">سيتم إضافة التحليلات المتقدمة قريباً</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات MCC</h2>
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">إعدادات متقدمة</h3>
                <p className="text-gray-500">سيتم إضافة الإعدادات المتقدمة قريباً</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
