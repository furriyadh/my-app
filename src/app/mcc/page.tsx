'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MCCAccount {
  account_id: string;
  name: string;
  description?: string;
  currency: string;
  timezone: string;
  status: string;
  created_at: string;
  total_spend?: number;
  performance_score?: number;
}

interface MCCStats {
  total_accounts: number;
  active_accounts: number;
  total_spend: number;
  average_performance: number;
}

export default function MCCPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<MCCAccount[]>([]);
  const [stats, setStats] = useState<MCCStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMCCData();
  }, []);

  const fetchMCCData = async () => {
    try {
      setLoading(true);
      
      // استخدام النظام الموجود في الباك اند
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://furriyadh.com/api/mcc/accounts'
        : 'http://localhost:5000/api/mcc/accounts';
      const response = await fetch(backendUrl, {
        headers: {
          'Content-Type': 'application/json',
          // يمكن إضافة authorization header هنا
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
        setError('خطأ في الاتصال بالخادم');
      }
    } catch (error) {
      console.error('Error fetching MCC data:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push('/mcc/create');
  };

  const handleViewAccount = (accountId: string) => {
    router.push(`/mcc/accounts/${accountId}`);
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
            onClick={fetchMCCData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
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
                إدارة حسابات MCC
              </h1>
              <p className="text-gray-600">
                نظام إدارة حسابات Google Ads المركزي
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={fetchMCCData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                🔄 تحديث البيانات
              </button>
              <button
                onClick={handleCreateAccount}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ إنشاء حساب جديد
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="text-sm text-gray-600">الحسابات النشطة</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${stats.total_spend?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">إجمالي الإنفاق</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.average_performance?.toFixed(1) || '0'}%
                </div>
                <div className="text-sm text-gray-600">متوسط الأداء</div>
              </div>
            </div>
          )}
        </div>

        {/* Accounts List */}
        <div className=" rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">الحسابات الإعلانية</h2>
            <span className="text-gray-600">
              {accounts.length} حساب
            </span>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد حسابات</h3>
              <p className="text-gray-500 mb-6">لم يتم العثور على حسابات MCC</p>
              <button
                onClick={handleCreateAccount}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                إنشاء أول حساب
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <div
                  key={account.account_id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewAccount(account.account_id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {account.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      account.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  
                  {account.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {account.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">العملة:</span>
                      <span className="font-medium">{account.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">المنطقة الزمنية:</span>
                      <span className="font-medium">{account.timezone}</span>
                    </div>
                    {account.total_spend && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">إجمالي الإنفاق:</span>
                        <span className="font-medium">${account.total_spend.toLocaleString()}</span>
                      </div>
                    )}
                    {account.performance_score && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">معدل الأداء:</span>
                        <span className="font-medium">{account.performance_score.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      تم الإنشاء: {new Date(account.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
