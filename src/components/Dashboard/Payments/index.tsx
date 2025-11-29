'use client';

import React from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

const PaymentsComponent: React.FC = () => {
  const { t, isRTL } = useTranslation();

  return (
    <div className="bg-white/15 backdrop-blur-md border border-blue-200/30 rounded-lg p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold text-black dark:text-gray-800 mb-4">
        {t.sidebar.payments || 'Payments'}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        {t.billing?.paymentsDescription || 'Here you can view your payment history.'}
      </p>
      {/* Add your payments content here */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-black dark:text-gray-800 mb-4">
          {t.billing?.paymentHistory || 'Payment History'}
        </h2>
        <div className="bg-white/10 backdrop-blur-md border border-blue-200/20 rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            {t.billing?.noPayments || 'No previous payments to display.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsComponent;