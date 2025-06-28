'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (option: string) => void;
}

// بيانات الكروت من القالب
const cardData = [
  {
    id: 'furriyadh-managed',
    title: 'Use Furriyadh Ad Accounts',
    description: 'Furriyadh manages ad accounts for you, centralizing media budget management & payments to simplify your journey even more.',
    commission: '20% Commission on Ad Budget',
    buttonText: 'Continue'
  },
  {
    id: 'own-accounts',
    title: 'Use your Own Ad Accounts',
    description: 'Link your existing ad accounts and pay for your media budget directly through the ad platforms.',
    commission: '0% Commission on Ad Budget',
    buttonText: 'Connect your Google Ads Account'
  },
  {
    id: 'new-account',
    title: 'Create New Account with Furriyadh',
    description: 'Start fresh with a new Google Ads account managed by Furriyadh, including $150 credit bonus and expert setup.',
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
        // الكرت الثاني فقط - ربط حساب موجود - يوجه لـ Google OAuth
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id';
        // تحديد redirectUri بناءً على البيئة
        const redirectUri = process.env.NODE_ENV === 'production'
          ? 'https://furriyadh.com/api/oauth/callback'
          : 'http://localhost:3000/api/oauth/callback';
        const scope = 'https://www.googleapis.com/auth/adwords';
        const state = Math.random( ).toString(36).substring(7);
        
        // حفظ state للتحقق لاحقاً
        localStorage.setItem('oauthState', state);
        
        const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
          'client_id=' + clientId + '&' +
          'redirect_uri=' + encodeURIComponent(redirectUri ) + '&' +
          'scope=' + encodeURIComponent(scope) + '&' +
          'response_type=code&' +
          'access_type=offline&' +
          'state=' + state;

        // إعادة توجيه لـ Google OAuth
        window.location.href = authUrl;
        
      } else {
        // الكرت الأول والثالث - إنشاء حساب حقيقي في Google Ads
        console.log('🚀 Creating real Google Ads account for:', card.title);
        
        // استدعاء API إنشاء الحساب الحقيقي
        const response = await fetch('/api/accounts/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountType: option,
            customerName: `${card.title} - ${new Date().toLocaleDateString()}`,
            currency: 'USD',
            timezone: 'America/New_York',
            countryCode: 'US',
            userEmail: 'user@example.com' // يمكن الحصول عليه من المستخدم المسجل
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Real Google Ads account created:', result.customerId);
          
          // حفظ البيانات الحقيقية
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
          
          // التوجيه إلى صفحة الحملة الجديدة مع الحساب الحقيقي
          const campaignUrl = '/new-campaign?account_type=' + option + '&customer_id=' + result.customerId + '&currency=USD&country=US&real_account=true';
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
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-6xl w-full">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* المحتوى */}
        <div className="p-12">
          {/* العنوان */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-blue-600 dark:text-blue-400">Three ways</span>
              <span className="text-gray-900 dark:text-white"> to run your ads</span>
            </h2>
          </div>

          {/* الكروت */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cardData.map((card, index) => {
              let cardBgClass = 'bg-white';
              let borderClass = 'border-gray-200 dark:border-gray-700';
              let textColorClass = 'text-gray-900 dark:text-white';
              let descriptionColorClass = 'text-gray-600 dark:text-gray-100';
              let commissionColorClass = 'text-gray-700 dark:text-gray-200';
              
              // تطبيق الألوان الشفافة مع الحدود الملونة في الوضع الليلي
              if (index === 0) {
                cardBgClass = 'bg-white dark:bg-red-500/10 dark:backdrop-blur-sm';
                borderClass = 'border-gray-200 dark:border-red-500/30';
                textColorClass = 'text-gray-900 dark:text-white';
                descriptionColorClass = 'text-gray-600 dark:text-gray-100';
                commissionColorClass = 'text-gray-700 dark:text-gray-200';
              } else if (index === 1) {
                cardBgClass = 'bg-white dark:bg-green-500/10 dark:backdrop-blur-sm';
                borderClass = 'border-gray-200 dark:border-green-500/30';
                textColorClass = 'text-gray-900 dark:text-white';
                descriptionColorClass = 'text-gray-600 dark:text-gray-100';
                commissionColorClass = 'text-gray-700 dark:text-gray-200';
              } else if (index === 2) {
                cardBgClass = 'bg-white dark:bg-purple-500/10 dark:backdrop-blur-sm';
                borderClass = 'border-gray-200 dark:border-purple-500/30';
                textColorClass = 'text-gray-900 dark:text-white';
                descriptionColorClass = 'text-gray-600 dark:text-gray-100';
                commissionColorClass = 'text-gray-700 dark:text-gray-200';
              }

              const isCardLoading = isLoading[card.id];
              
              return (
                <div
                  key={card.id}
                  className={
                    'group relative rounded-2xl p-8 border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ' +
                    cardBgClass + ' ' + borderClass + ' ' +
                    (isCardLoading ? 'opacity-75 cursor-not-allowed' : '')
                  }
                  onClick={() => !isCardLoading && handleSelect(card.id, card)}
                >
                  <div className="text-center">
                    <h3 className={'text-2xl font-semibold mb-6 ' + textColorClass}>
                      {card.title}
                    </h3>
                    
                    <p className={descriptionColorClass + ' mb-8 leading-relaxed text-lg'}>
                      {card.description}
                    </p>
                    
                    <div className="mb-8">
                      <span className={commissionColorClass + ' font-medium text-lg'}>
                        {card.commission}
                      </span>
                    </div>
                    
                    <button 
                      className={
                        'w-full py-3 px-4 rounded-lg font-medium transition-colors text-base ' +
                        (isCardLoading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white')
                      }
                      disabled={isCardLoading}
                    >
                      {isCardLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          {card.id === 'own-accounts' ? 'Redirecting to Google...' : 'Creating Account...'}
                        </div>
                      ) : (
                        card.buttonText
                      )}
                    </button>
                  </div>

                  {/* Loading overlay */}
                  {isCardLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-2xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSelectionModal;
