'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Store, Package, TrendingUp } from 'lucide-react';

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

interface PerformanceMaxFormProps {
  formData: {
    addProducts: boolean;
    merchantCenterAccount?: string;
  };
  onUpdate: (data: any) => void;
  errors?: { [key: string]: string };
}

const PerformanceMaxForm: React.FC<PerformanceMaxFormProps> = ({
  formData,
  onUpdate,
  errors = {}
}) => {
  const [merchantAccounts, setMerchantAccounts] = useState<MerchantCenterAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [selectedAccountDetails, setSelectedAccountDetails] = useState<MerchantCenterAccount | null>(null);

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
        
        // إذا كان هناك حساب واحد فقط وتم تفعيل المنتجات، اختره تلقائياً
        if (data.accounts.length === 1 && formData.addProducts && !formData.merchantCenterAccount) {
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

  const handleAddProductsChange = (checked: boolean) => {
    onUpdate({
      ...formData,
      addProducts: checked,
      merchantCenterAccount: checked ? formData.merchantCenterAccount : undefined
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
    <div className="space-y-6">
      {/* Performance Max Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Max Campaign Configuration
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Get the best of Google's automation to reach customers across all channels with AI-powered optimization.
        </p>
      </div>

      {/* Add Products Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add products to this campaign
          </h3>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={formData.addProducts}
              onChange={(e) => handleAddProductsChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">
                Advertise products from a Merchant Center account
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Connect your Google Merchant Center to show product ads across Google's network
              </div>
            </div>
          </label>

          {formData.addProducts && (
            <div className="ml-7 space-y-4">
              {/* Merchant Center Account Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Merchant Center account
                  </label>
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
                  <div className="flex items-center justify-center py-8 border border-gray-200 dark:border-gray-600 rounded-lg">
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

              {/* Selected Account Summary */}
              {selectedAccountDetails && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
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

              {/* Merchant Center Setup Help */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Don't have a Merchant Center account?
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      You'll need to create one to advertise your products. 
                      <a href="https://merchants.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline ml-1">
                        Set up Merchant Center
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Goals Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Where should people go after clicking your ads?
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Your website</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Performance Max will automatically optimize to drive the best results across all of Google's channels
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Max Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Max Benefits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-800 dark:text-blue-200">AI-powered optimization across all Google channels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-800 dark:text-blue-200">Automated bidding and targeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-800 dark:text-blue-200">Cross-channel performance insights</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-800 dark:text-blue-200">Real-time campaign optimization</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMaxForm;

