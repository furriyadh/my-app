'use client';

import { useState, useCallback } from 'react';

export interface BudgetEstimate {
  dailyBudget: number;
  estimatedReach: number;
  estimatedClicks: number;
  averageCpc: number;
  estimatedImpressions: number;
  estimatedCtr: number;
}

export interface AccountBudget {
  totalBudget: number;
  availableBudget: number;
  currency: string;
  lastUpdated: Date;
}

export const useBudgetEstimates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // حساب تقديرات الميزانية
  const getBudgetEstimates = useCallback(async (
    dailyBudget: number,
    targetLocation?: string,
    campaignType?: string
  ): Promise<BudgetEstimate> => {
    setIsLoading(true);
    setError(null);

    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // حسابات تقديرية بناءً على الميزانية
      const baseReach = dailyBudget * 20; // 20 شخص لكل ريال
      const baseCpc = Math.max(0.5, dailyBudget / 100); // تكلفة النقرة
      const estimatedClicks = Math.floor(dailyBudget / baseCpc);
      const estimatedImpressions = estimatedClicks * 10; // 10 ظهور لكل نقرة
      const estimatedCtr = (estimatedClicks / estimatedImpressions) * 100;

      // تعديل بناءً على الموقع
      let locationMultiplier = 1;
      if (targetLocation?.includes('الرياض') || targetLocation?.includes('جدة')) {
        locationMultiplier = 1.2; // مدن كبيرة = تكلفة أعلى
      } else if (targetLocation?.includes('السعودية')) {
        locationMultiplier = 1.1;
      }

      // تعديل بناءً على نوع الحملة
      let campaignMultiplier = 1;
      if (campaignType === 'search') {
        campaignMultiplier = 1.3; // إعلانات البحث أغلى
      } else if (campaignType === 'youtube') {
        campaignMultiplier = 0.8; // فيديو أرخص
      }

      const finalCpc = baseCpc * locationMultiplier * campaignMultiplier;
      const finalClicks = Math.floor(dailyBudget / finalCpc);
      const finalReach = Math.floor(baseReach * locationMultiplier);

      return {
        dailyBudget,
        estimatedReach: finalReach,
        estimatedClicks: finalClicks,
        averageCpc: finalCpc,
        estimatedImpressions: finalClicks * 10,
        estimatedCtr: (finalClicks / (finalClicks * 10)) * 100
      };
    } catch (err) {
      setError('فشل في الحصول على تقديرات الميزانية');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // الحصول على ميزانية الحساب
  const getAccountBudget = useCallback(async (): Promise<AccountBudget> => {
    setIsLoading(true);
    setError(null);

    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // بيانات تجريبية
      return {
        totalBudget: 10000,
        availableBudget: 7500,
        currency: 'SAR',
        lastUpdated: new Date()
      };
    } catch (err) {
      setError('فشل في الحصول على ميزانية الحساب');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // تنسيق العملة
  const formatCurrency = useCallback((amount: number, currency: string = 'SAR'): string => {
    const currencySymbols: Record<string, string> = {
      'SAR': 'ر.س',
      'USD': '$',
      'AED': 'د.إ',
      'EUR': '€'
    };

    const symbol = currencySymbols[currency] || currency;
    const formattedAmount = new Intl.NumberFormat('ar-SA').format(amount);
    
    return `${formattedAmount} ${symbol}`;
  }, []);

  // حساب التكلفة الشهرية
  const getMonthlyBudget = useCallback((dailyBudget: number): number => {
    return dailyBudget * 30;
  }, []);

  // حساب ROI المتوقع
  const getEstimatedROI = useCallback((
    dailyBudget: number,
    averageOrderValue: number = 100,
    conversionRate: number = 0.02
  ): number => {
    const monthlyBudget = dailyBudget * 30;
    const estimatedConversions = (dailyBudget / 2) * 30 * conversionRate; // تقدير النقرات * معدل التحويل
    const estimatedRevenue = estimatedConversions * averageOrderValue;
    
    return ((estimatedRevenue - monthlyBudget) / monthlyBudget) * 100;
  }, []);

  return {
    getBudgetEstimates,
    getAccountBudget,
    formatCurrency,
    getMonthlyBudget,
    getEstimatedROI,
    isLoading,
    error
  };
};

