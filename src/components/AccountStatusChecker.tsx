'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AccountStatus {
  user: {
    id: string;
    email: string;
    name: string;
    google_id: string;
  };
  oauth: {
    has_tokens: boolean;
    token_expires_at: string;
    is_valid: boolean;
  };
  accounts: {
    total_count: number;
    accounts: any[];
    has_default: boolean;
  };
  integrations: {
    business_accounts: number;
    platform_integrations: any[];
  };
}

interface AccountStatusCheckerProps {
  userEmail: string;
  onStatusChange?: (status: AccountStatus) => void;
}

const AccountStatusChecker: React.FC<AccountStatusCheckerProps> = ({
  userEmail,
  onStatusChange
}) => {
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // دالة توحيد شكل المعرف الرقمي (إزالة الشرطات)
  const normalizeId = (id: string) => {
    if (!id) return '';
    return id.toString().replace(/-/g, '').trim();
  };

  const checkAccountStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/check-account-status?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
        onStatusChange?.(data.data);
      } else {
        setError(data.message || 'فشل في فحص حالة الحساب');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      checkAccountStatus();
    }
  }, [userEmail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>جاري فحص حالة الحساب...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <button
          onClick={checkAccountStatus}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">حالة ربط الحسابات</h3>
        <button
          onClick={checkAccountStatus}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          تحديث
        </button>
      </div>

      {/* حالة OAuth */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          {status.oauth.is_valid ? (
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
          )}
          <span className="font-medium">OAuth Tokens</span>
        </div>
        <span className={`text-sm ${status.oauth.is_valid ? 'text-green-600' : 'text-blue-600'}`}>
          {status.oauth.is_valid ? 'صالح' : 'منتهي الصلاحية'}
        </span>
      </div>

      {/* الحسابات الإعلانية */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="font-medium">الحسابات الإعلانية</span>
        </div>
        <span className="text-sm text-gray-600">
          {status.accounts.total_count} حساب
        </span>
      </div>

      {/* Platform Integrations */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="font-medium">تكامل المنصات</span>
        </div>
        <span className="text-sm text-gray-600">
          {status.integrations.platform_integrations.length} تكامل
        </span>
      </div>

      {/* تفاصيل الحسابات */}
      {status.accounts.accounts.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">الحسابات المرتبطة:</h4>
          <div className="space-y-2">
            {status.accounts.accounts.map((account, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">{account.account_name}</span>
                <span className="text-xs text-gray-500">{normalizeId(account.account_id)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountStatusChecker;
