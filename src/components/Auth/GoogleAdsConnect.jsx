import React from 'react';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

const GoogleAdsConnect = ( ) => {
  const { 
    isAuthenticated, 
    userInfo, 
    isLoading, 
    error, 
    initiateAuth, 
    signOut 
  } = useGoogleAuth();

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800">
          تم ربط حساب Google Ads بنجاح
        </h3>
        <p className="text-green-600">
          مرحباً {userInfo?.name || userInfo?.email}
        </p>
        <button 
          onClick={signOut}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          قطع الاتصال
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800">
        ربط حساب Google Ads
      </h3>
      <p className="text-blue-600 mb-4">
        اربط حساب Google Ads الخاص بك لبدء إدارة الحملات
      </p>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}
      <button 
        onClick={initiateAuth}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'جاري الاتصال...' : 'ربط حساب Google Ads'}
      </button>
    </div>
  );
};

export default GoogleAdsConnect;
