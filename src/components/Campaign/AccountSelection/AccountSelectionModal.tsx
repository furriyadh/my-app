'use client';

import React, { useState } from 'react';
import { X, User, Plus, ExternalLink, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Account {
  id: string;
  name: string;
  email: string;
  currency: string;
  balance: number;
  isConnected: boolean;
}

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (accountId: string) => void;
  onCreateNew: () => void;
  accounts: Account[];
  isLoading: boolean;
}

export const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  onCreateNew,
  accounts,
  isLoading
}) => {
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new' | null>(null);

  if (!isOpen) return null;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">اختيار الحساب الإعلاني</h2>
            <p className="text-sm text-gray-600 mt-1">اختر الحساب الذي تريد إطلاق الحملة عليه</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* خيار ربط حساب موجود */}
          <Card className={`p-6 cursor-pointer transition-all ${
            selectedOption === 'existing' 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:shadow-md'
          }`}>
            <div 
              onClick={() => setSelectedOption('existing')}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">ربط حساب Google Ads موجود</h3>
                <p className="text-sm text-gray-600 mb-4">
                  اربط حسابك الإعلاني الحالي لإطلاق الحملة عليه
                </p>
                
                {selectedOption === 'existing' && (
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="mr-2 text-sm text-gray-600">جاري تحميل الحسابات...</span>
                      </div>
                    ) : accounts.length > 0 ? (
                      <div className="space-y-2">
                        {accounts.map((account) => (
                          <div
                            key={account.id}
                            onClick={() => onSelectAccount(account.id)}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-800">{account.name}</div>
                                <div className="text-sm text-gray-600">{account.email}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                  {formatCurrency(account.balance, account.currency)}
                                </div>
                                <div className="text-xs text-gray-500">متاح</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-gray-500 text-sm">لم يتم العثور على حسابات مربوطة</div>
                        <Button
                          variant="outline"
                          className="mt-3 flex items-center gap-2"
                          onClick={() => window.open('/auth/google-ads', '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                          ربط حساب Google Ads
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* خيار إنشاء حساب جديد */}
          <Card className={`p-6 cursor-pointer transition-all ${
            selectedOption === 'new' 
              ? 'ring-2 ring-green-500 bg-green-50' 
              : 'hover:shadow-md'
          }`}>
            <div 
              onClick={() => setSelectedOption('new')}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-green-100 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">إنشاء حساب إعلاني جديد</h3>
                <p className="text-sm text-gray-600 mb-4">
                  سننشئ لك حساب Google Ads جديد وسنديره نيابة عنك
                </p>
                
                {selectedOption === 'new' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                        <Shield className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">إدارة آمنة</div>
                          <div className="text-xs text-gray-600">حماية كاملة لحسابك</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                        <Zap className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">إعداد سريع</div>
                          <div className="text-xs text-gray-600">جاهز في دقائق</div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={onCreateNew}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      إنشاء حساب جديد
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* معلومات إضافية */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-blue-600 mt-0.5">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800 mb-1">معلومة مهمة</div>
                <div className="text-sm text-blue-700">
                  يمكنك تغيير الحساب الإعلاني لاحقاً من إعدادات الحملة. جميع البيانات محمية ومشفرة.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          {selectedOption && (
            <Button 
              onClick={() => {
                if (selectedOption === 'new') {
                  onCreateNew();
                }
              }}
              disabled={selectedOption === 'existing' && accounts.length === 0}
            >
              متابعة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

