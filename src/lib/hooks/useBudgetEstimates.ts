'use client';

import { useState, useEffect } from 'react';

export interface BudgetEstimate {
  dailyBudget: number;
  estimatedReach: number;
  estimatedClicks: number;
  averageCpc: number;
  estimatedImpressions: number;
  estimatedCtr: number;
}

export interface AccountBudget {
  accountId: string;
  totalBudget: number;
  availableBudget: number;
  currency: string;
  lastUpdated: Date;
}

export const useBudgetEstimates = () => {
  const [estimates, setEstimates] = useState<BudgetEstimate | null>(null);
  const [accountBudget, setAccountBudget] = useState<AccountBudget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBudgetEstimates = async (
    dailyBudget: number,
    targetLocation?: string,
    adType?: string
  ): Promise<BudgetEstimate> => {
    setIsLoading(true);
    setError(null);

    try {
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // حسابات تقديرية بناءً على الميزانية
      const baseReach = Math.floor(dailyBudget * 100);
      const baseCpc = Math.max(0.5, Math.min(5, dailyBudget / 100));
      const estimatedClicks = Math.floor(dailyBudget / baseCpc);
      const estimatedImpressions = Math.floor(estimatedClicks * 20);
      const estimatedCtr = (estimatedClicks / estimatedImpressions) * 100;

      const estimate: BudgetEstimate = {
        dailyBudget,
        estimatedReach: baseReach + Math.floor(Math.random() * baseReach * 0.2),
        estimatedClicks: estimatedClicks + Math.floor(Math.random() * estimatedClicks * 0.1),
        averageCpc: baseCpc + (Math.random() - 0.5) * 0.5,
        estimatedImpressions: estimatedImpressions + Math.floor(Math.random() * estimatedImpressions * 0.1),
        estimatedCtr: estimatedCtr + (Math.random() - 0.5) * 0.5
      };

      setEstimates(estimate);
      return estimate;
    } catch (err) {
      const errorMessage = 'فشل في الحصول على تقديرات الميزانية';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountBudget = async (accountId?: string): Promise<AccountBudget> => {
    setIsLoading(true);
    setError(null);

    try {
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 800));

      const budget: AccountBudget = {
        accountId: accountId || 'default-account',
        totalBudget: 10000,
        availableBudget: 7500,
        currency: 'SAR',
        lastUpdated: new Date()
      };

      setAccountBudget(budget);
      return budget;
    } catch (err) {
      const errorMessage = 'فشل في الحصول على ميزانية الحساب';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return {
    estimates,
    accountBudget,
    isLoading,
    error,
    getBudgetEstimates,
    getAccountBudget,
    formatCurrency,
    formatNumber
  };
};

