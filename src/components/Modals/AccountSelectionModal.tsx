'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (option: string) => void;
}

// بيانات بطاقات الحسابات
const cardData = [
  {
    id: 'furriyadh-managed',
    title: 'Use Furriyadh Ad Accounts',
    description: 'Furriyadh manages ad accounts for you, centralizing media budget management.',
    commission: '20% Commission on Ad Budget',
    buttonText: 'Continue'
  },
  {
    id: 'own-accounts',
    title: 'Use your Own Ad Accounts',
    description: 'Link your existing ad accounts and pay for your media budget directly.',
    commission: '0% Commission on Ad Budget',
    buttonText: 'Connect your Google Ads Account'
  },
  {
    id: 'new-account',
    title: 'Create New Account with Furriyadh',
    description: 'Start fresh with a new Google Ads account managed by Furriyadh.',
    commission: '20% Commission on Ad Budget',
    buttonText: 'Create Account Now'
  }
];

const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  if (!isOpen) return null;

  const handleSelect = async (option: string, card: any) => {
    try {
      setIsLoading(prev => ({ ...prev, [option]: true }));

      // حفظ نوع الحساب المختار
      localStorage.setItem('selectedAccountType', option);
      localStorage.setItem('furriyadh_currency', 'USD');
      localStorage.setItem('furriyadh_country', 'US');

      if (option === 'own-accounts') {
        // إعداد OAuth للحسابات الخاصة - ربط حساب موجود - يوجه لـ Google OAuth
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id';
        
        // بناء على البيئة redirectUri
        const redirectUri = process.env.NODE_ENV === 'production'
          ? 'https://furriyadh.com/api/oauth/callback'
          : 'http://localhost:3000/api/oauth/callback';
        
        const scope = 'https://www.googleapis.com/auth/adwords';
        const state = Math.random().toString(36).substring(7);

        // للتحقق لاحقاً state حفظ
        localStorage.setItem('oauthState', state);

        console.log('DEBUG: Using clientId:', clientId);
        console.log('DEBUG: Using redirectUri:', redirectUri);

        const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
          'client_id=' + clientId + '&' +
          'redirect_uri=' + encodeURIComponent(redirectUri) + '&' +
          'scope=' + encodeURIComponent(scope) + '&' +
          'response_type=code&' +
          'access_type=offline&' +
          'prompt=consent&' +
          'state=' + state;

        console.log('Redirecting to Google OAuth:', authUrl);

        // إعادة توجيه لـ Google OAuth
        window.location.href = authUrl;
      } else {
        // للخيارات الأخرى والدالك - إنشاء حساب جديد في
        console.log('🚀 Creating real Google Ads account for:', card.title);

        // إنشاء الحساب الجديد API استدعاء
        const response = await fetch('/api/accounts/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountType: option,
            title: card.title,
            customerName: `${card.title} - ${new Date().toLocaleDateString()}`,
            currency: 'USD',
            timezone: 'America/New_York',
            countryCode: 'US',
            userEmail: 'user@example.com' // يمكن الحصول عليه من المستخدم الحالي
          }),
        });

        const result = await response.json();

        if (result.success) {
          console.log('✅ Real Google Ads account created:', result.customerId);
          
          // حفظ البيانات الجديدة
          localStorage.setItem('customerId', result.customerId);
          localStorage.setItem('accountData', JSON.stringify({
            accountType: option,
            customerId: result.customerId,
            customerName: result.customerName,
            resourceName: result.resourceName,
            createdAt: new Date().toISOString(),
            status: 'active',
            isRealAccount: true
          }));

          // إغلاق النافذة المنبثقة
          onClose();

          // استدعاء callback function
          if (onSelect) {
            onSelect(option);
          }

          // التوجيه إلى صفحة الحملة الجديدة
          const campaignUrl = '/new-campaign?account_type=' + option + '&customer_id=' + result.customerId;
          router.push(campaignUrl);
        } else {
          console.error('❌ Failed to create real Google Ads account:', result.error);
          throw new Error(result.error || 'Failed to create Google Ads account');
        }
      }
    } catch (error) {
      console.error('Error selecting account:', error);
      alert('حدث خطأ أثناء اختيار نوع الحساب. يرجى المحاولة مرة أخرى.');
      setIsLoading(prev => ({ ...prev, [option]: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* خلفية مموهة */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />
      
      {/* النافذة المنبثقة */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* رأس الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* المحتوى */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Your Account Type
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select how you want to manage your Google Ads campaigns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cardData.map((card) => (
              <div
                key={card.id}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                      {card.description}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-6">
                      {card.commission}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSelect(card.id, card)}
                    disabled={isLoading[card.id]}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      card.id === 'own-accounts'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    } ${isLoading[card.id] ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    {isLoading[card.id] ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      card.buttonText
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can change your account type later in settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSelectionModal;