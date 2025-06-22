import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Currency Exchange Rates Interface
interface ExchangeRates {
  [key: string]: number;
}

// Supported Currencies
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  EGP: { symbol: 'ج.م', name: 'Egyptian Pound', flag: '🇪🇬' },
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal', flag: '🇸🇦' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  KWD: { symbol: 'د.ك', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
  QAR: { symbol: 'ر.ق', name: 'Qatari Riyal', flag: '🇶🇦' },
  BHD: { symbol: 'د.ب', name: 'Bahraini Dinar', flag: '🇧🇭' },
  OMR: { symbol: 'ر.ع', name: 'Omani Rial', flag: '🇴🇲' }
};

// Date Range Options
export const DATE_RANGES = {
  '7d': { label: 'Last 7 Days', days: 7 },
  '30d': { label: 'Last 30 Days', days: 30 },
  '90d': { label: 'Last 90 Days', days: 90 },
  '6m': { label: 'Last 6 Months', days: 180 },
  '1y': { label: 'Last Year', days: 365 },
  'custom': { label: 'Custom Range', days: 0 }
};

// Context Interface
interface CurrencyContextType {
  // Currency State
  selectedCurrency: string;
  exchangeRates: ExchangeRates;
  isLoadingRates: boolean;
  
  // Date Range State
  selectedDateRange: string;
  customStartDate: Date | null;
  customEndDate: Date | null;
  
  // Actions
  setCurrency: (currency: string) => void;
  setDateRange: (range: string) => void;
  setCustomDateRange: (start: Date, end: Date) => void;
  
  // Utility Functions
  convertAmount: (amount: number, fromCurrency?: string) => number;
  formatCurrency: (amount: number, showSymbol?: boolean) => string;
  getDateRangeLabel: () => string;
  getActualDateRange: () => { start: Date; end: Date };
}

// Create Context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Provider Component
interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  // Currency State
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  
  // Date Range State
  const [selectedDateRange, setSelectedDateRange] = useState<string>('30d');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Fetch Exchange Rates from Frankfurter API (Free)
  const fetchExchangeRates = async (baseCurrency: string = 'USD') => {
    setIsLoadingRates(true);
    try {
      const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);
      const data = await response.json();
      
      // Add base currency rate (1.0)
      const rates = { [baseCurrency]: 1.0, ...data.rates };
      setExchangeRates(rates);
      
      console.log(`💱 Exchange rates updated for ${baseCurrency}:`, rates);
    } catch (error) {
      console.error('❌ Error fetching exchange rates:', error);
      // Fallback rates if API fails
      setExchangeRates({
        USD: 1.0,
        EUR: 0.85,
        GBP: 0.73,
        EGP: 49.0,
        SAR: 3.75,
        AED: 3.67,
        KWD: 0.31,
        QAR: 3.64,
        BHD: 0.38,
        OMR: 0.38
      });
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Load exchange rates on mount and currency change
  useEffect(() => {
    fetchExchangeRates(selectedCurrency);
  }, [selectedCurrency]);

  // Currency Actions
  const setCurrency = (currency: string) => {
    if (SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]) {
      setSelectedCurrency(currency);
      console.log(`🔄 Currency changed to: ${currency}`);
    }
  };

  // Date Range Actions
  const setDateRange = (range: string) => {
    setSelectedDateRange(range);
    if (range !== 'custom') {
      setCustomStartDate(null);
      setCustomEndDate(null);
    }
    console.log(`📅 Date range changed to: ${range}`);
  };

  const setCustomDateRange = (start: Date, end: Date) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    setSelectedDateRange('custom');
    console.log(`📅 Custom date range set: ${start.toDateString()} - ${end.toDateString()}`);
  };

  // Utility Functions
  const convertAmount = (amount: number, fromCurrency: string = 'USD'): number => {
    if (!exchangeRates[selectedCurrency] || !exchangeRates[fromCurrency]) {
      return amount;
    }
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / exchangeRates[fromCurrency];
    const convertedAmount = usdAmount * exchangeRates[selectedCurrency];
    
    return convertedAmount;
  };

  const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
    const currencyInfo = SUPPORTED_CURRENCIES[selectedCurrency as keyof typeof SUPPORTED_CURRENCIES];
    const symbol = currencyInfo?.symbol || '$';
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    return showSymbol ? `${symbol}${formattedAmount}` : formattedAmount;
  };

  const getDateRangeLabel = (): string => {
    if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`;
    }
    return DATE_RANGES[selectedDateRange as keyof typeof DATE_RANGES]?.label || 'Last 30 Days';
  };

  const getActualDateRange = (): { start: Date; end: Date } => {
    const end = new Date();
    
    if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
      return { start: customStartDate, end: customEndDate };
    }
    
    const days = DATE_RANGES[selectedDateRange as keyof typeof DATE_RANGES]?.days || 30;
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    return { start, end };
  };

  // Context Value
  const contextValue: CurrencyContextType = {
    // State
    selectedCurrency,
    exchangeRates,
    isLoadingRates,
    selectedDateRange,
    customStartDate,
    customEndDate,
    
    // Actions
    setCurrency,
    setDateRange,
    setCustomDateRange,
    
    // Utilities
    convertAmount,
    formatCurrency,
    getDateRangeLabel,
    getActualDateRange
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom Hook
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Export default
export default CurrencyProvider;