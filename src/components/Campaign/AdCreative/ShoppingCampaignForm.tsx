'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, Settings, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Store, Package } from 'lucide-react';

interface MerchantCenterAccount {
  merchant_id: string;
  name: string;
  country: string;
  currency: string;
  status: string;
  linked_ads_accounts: string[];
  products: {
    total: number;
    approved: number;
    pending: number;
    disapproved: number;
  };
  last_sync: string | null;
}

interface ShoppingCampaignFormProps {
  formData: {
    campaignSubtype: 'performance-max' | 'standard' | null;
    merchantCenterAccount?: string;
  };
  onUpdate: (data: any) => void;
  errors?: { [key: string]: string };
}

const ShoppingCampaignForm: React.FC<ShoppingCampaignFormProps> = ({
  formData,
  onUpdate,
  errors = {}
}) => {
  const [merchantAccounts, setMerchantAccounts] = useState<MerchantCenterAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [selectedAccountDetails, setSelectedAccountDetails] = useState<MerchantCenterAccount | null>(null);

  const campaignSubtypes = [
    {
      id: 'performance-max',
      name: 'Performance Max campaign',
      description: 'Get the best of Google\'s automation to reach customers across all channels',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: 'Recommended',
      features: [
        'Automated bidding and targeting',
        'Ads across all Google properties',
        'AI-powered optimization',
        'Cross-channel insights'
      ]
    },
    {
      id: 'standard',
      name: 'Standard Shopping campaign',
      description: 'Pick your products, bid strategy, budget, and targeting. You can show ads on the Google Search Network',
      icon: <Settings className="w-5 h-5" />,
      features: [
        'Manual bid control',
        'Custom targeting options',
        'Search Network focus',
        'Detailed performance data'
      ]
    }
  ];

  // جلب حسابات Merchant Center عند تحميل المكون
  useEffect(() => {
    fetchMerchantAccounts();
  }, []);

  // جلب تفاصيل الحساب المختار
  useEffect(() => {
    if (formData.merchantCenterAccount) {
      const selectedAccount = merchantAccounts.find(
        account => account.merchant_id === formData.merchantCenterAccount
      );
      setSelectedAccountDetails(selectedAccount || null);
    } else {
      setSelectedAccountDetails(null);
    }
  }, [formData.merchantCenterAccount, merchantAccounts]);

  const fetchMerchantAccounts = async () => {
    setLoadingAccounts(true);
    setAccountsError(null);
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/merchant-center/accounts`);
      const data = await response.json();
      
      if (data.success) {
        setMerchantAccounts(data.accounts);
        
        // إذا كان هناك حساب واحد فقط، اختره تلقائياً
        if (data.accounts.length === 1 && !formData.merchantCenterAccount) {
          onUpdate({
            ...formData,
            merchantCenterAccount: data.accounts[0].merchant_id
          });
        }
      } else {
        setAccountsError(data.message || 'فشل في جلب حسابات Merchant Center');
      }
    } catch (error) {
      console.error('خطأ في جلب حسابات Merchant Center:', error);
      setAccountsError('خطأ في الاتصال بالخادم');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSubtypeChange = (subtypeId: 'performance-max' | 'standard') => {
    onUpdate({
      ...formData,
      campaignSubtype: subtypeId
    });
  };

  const handleMerchantAccountChange = (merchantId: string) => {
    onUpdate({
      ...formData,
      merchantCenterAccount: merchantId
    });
  };

  const getAccountStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enabled':
        return 'text-green-600 bg-green-100';
      case 'disabled':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProductsHealthScore = (products: MerchantCenterAccount['products']) => {
    if (products.total === 0) return 0;
    return Math.round((products.approved / products.total) * 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          Shopping Campaign Configuration
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Configure your Shopping campaign settings and link your Merchant Center account</p>
      </div>

      {/* Campaign Subtype Selection */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Select a campaign subtype</h4>
        
        {errors.campaignSubtype && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{errors.campaignSubtype}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaignSubtypes.map((subtype) => (
            <div
              key={subtype.id}
              onClick={() => handleSubtypeChange(subtype.id as 'performance-max' | 'standard')}
              className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                formData.campaignSubtype === subtype.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Badge */}
              {subtype.badge && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {subtype.badge}
                  </span>
                </div>
              )}

              {/* Selection indicator */}
              {formData.campaignSubtype === subtype.id && (
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                {subtype.icon}
              </div>

              {/* Title */}
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {subtype.name}
              </h5>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {subtype.description}
              </p>

              {/* Features */}
              <ul className="space-y-1">
                {subtype.features.map((feature, index) => (
                  <li key={index} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Merchant Center Account Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="w-4 h-4" />
            Merchant Center Account
          </h4>
          <button
            onClick={fetchMerchantAccounts}
            disabled={loadingAccounts}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAccounts ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {errors.merchantCenter && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{errors.merchantCenter}</p>
          </div>
        )}

        {accountsError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-red-700 dark:text-red-400 text-sm">{accountsError}</p>
          </div>
        )}

        {loadingAccounts ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading Merchant Center accounts...</span>
          </div>
        ) : merchantAccounts.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <Store className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No Merchant Center accounts found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Make sure your Merchant Center account is linked to your Google Ads account
            </p>
            <a
              href="https://merchants.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-700 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open Merchant Center
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {merchantAccounts.map((account) => (
              <div
                key={account.merchant_id}
                onClick={() => handleMerchantAccountChange(account.merchant_id)}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
                  formData.merchantCenterAccount === account.merchant_id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <h5 className="font-medium text-gray-900 dark:text-white">{account.name}</h5>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAccountStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">ID:</span>
                        <span className="ml-1 text-gray-900 dark:text-white font-mono">{account.merchant_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Country:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{account.country}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Currency:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{account.currency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{account.products.total} products</span>
                      </div>
                    </div>

                    {/* Products Health Bar */}
                    {account.products.total > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Products Health</span>
                          <span>{getProductsHealthScore(account.products)}% approved</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProductsHealthScore(account.products)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{account.products.approved} approved</span>
                          <span>{account.products.pending} pending</span>
                          <span>{account.products.disapproved} disapproved</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selection indicator */}
                  {formData.merchantCenterAccount === account.merchant_id && (
                    <div className="ml-4">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Account Details */}
      {selectedAccountDetails && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Selected Account: {selectedAccountDetails.name}
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Total Products:</span>
              <span className="ml-1 font-medium text-blue-900 dark:text-blue-100">{selectedAccountDetails.products.total}</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Approved:</span>
              <span className="ml-1 font-medium text-green-600">{selectedAccountDetails.products.approved}</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Pending:</span>
              <span className="ml-1 font-medium text-yellow-600">{selectedAccountDetails.products.pending}</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Disapproved:</span>
              <span className="ml-1 font-medium text-red-600">{selectedAccountDetails.products.disapproved}</span>
            </div>
          </div>
          {selectedAccountDetails.products.total > 0 && (
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Health Score: {getProductsHealthScore(selectedAccountDetails.products)}% - 
              {getProductsHealthScore(selectedAccountDetails.products) >= 80 ? ' Excellent' :
               getProductsHealthScore(selectedAccountDetails.products) >= 60 ? ' Good' :
               getProductsHealthScore(selectedAccountDetails.products) >= 40 ? ' Fair' : ' Needs Improvement'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoppingCampaignForm;

