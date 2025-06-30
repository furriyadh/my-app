import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Calendar, 
  ChevronDown, 
  RefreshCw,
  TrendingUp,
  Clock,
  Check
} from 'lucide-react';
import { useCurrency, SUPPORTED_CURRENCIES, DATE_RANGES } from '../contexts/CurrencyContext';

const CurrencyDateControls: React.FC = () => {
  const {
    selectedCurrency,
    selectedDateRange,
    isLoadingRates,
    setCurrency,
    setDateRange,
    setCustomDateRange,
    getDateRangeLabel,
    formatCurrency
  } = useCurrency();

  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Handle Custom Date Range
  const handleCustomDateSubmit = () => {
    if (customStart && customEnd) {
      const startDate = new Date(customStart);
      const endDate = new Date(customEnd);
      setCustomDateRange(startDate, endDate);
      setShowCustomDatePicker(false);
      setShowDateDropdown(false);
    }
  };

  // Handle Date Range Selection
  const handleDateRangeSelect = (range: string) => {
    if (range === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setDateRange(range);
      setShowDateDropdown(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8">
      {/* Currency Selector */}
      <div className="relative">
        <motion.button
          onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
          className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <span className="text-2xl">
              {SUPPORTED_CURRENCIES[selectedCurrency as keyof typeof SUPPORTED_CURRENCIES]?.flag}
            </span>
            <div className="text-left">
              <div className="font-semibold text-gray-900">{selectedCurrency}</div>
              <div className="text-xs text-gray-600">
                {SUPPORTED_CURRENCIES[selectedCurrency as keyof typeof SUPPORTED_CURRENCIES]?.name}
              </div>
            </div>
          </div>
          
          {isLoadingRates ? (
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          ) : (
            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
          )}
        </motion.button>

        {/* Currency Dropdown */}
        <AnimatePresence>
          {showCurrencyDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 max-h-80 overflow-y-auto"
            >
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Currency</h3>
                <div className="space-y-1">
                  {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                    <motion.button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setShowCurrencyDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                        selectedCurrency === code
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-xl">{info.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{code}</div>
                        <div className="text-xs text-gray-600">{info.name}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {info.symbol}
                      </div>
                      {selectedCurrency === code && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Date Range Selector */}
      <div className="relative">
        <motion.button
          onClick={() => setShowDateDropdown(!showDateDropdown)}
          className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Calendar className="w-5 h-5 text-purple-600" />
          <div className="text-left">
            <div className="font-semibold text-gray-900">Time Period</div>
            <div className="text-xs text-gray-600">{getDateRangeLabel()}</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
        </motion.button>

        {/* Date Range Dropdown */}
        <AnimatePresence>
          {showDateDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50"
            >
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Time Period</h3>
                <div className="space-y-1">
                  {Object.entries(DATE_RANGES).map(([key, range]) => (
                    <motion.button
                      key={key}
                      onClick={() => handleDateRangeSelect(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                        selectedDateRange === key
                          ? 'bg-purple-100 text-purple-900'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Clock className="w-4 h-4" />
                      <span className="flex-1 text-left font-medium">{range.label}</span>
                      {selectedDateRange === key && (
                        <Check className="w-4 h-4 text-purple-600" />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Custom Date Picker */}
                <AnimatePresence>
                  {showCustomDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Date Range</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
                          <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">End Date</label>
                          <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCustomDateSubmit}
                            disabled={!customStart || !customEnd}
                            className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => setShowCustomDatePicker(false)}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-sm font-medium text-green-700">Live Data</span>
      </div>

      {/* Performance Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-xl">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">
          {formatCurrency(1250.50)} Total Spend
        </span>
      </div>
    </div>
  );
};

export default CurrencyDateControls;