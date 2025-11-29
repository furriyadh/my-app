"use client";

import React, { useState } from 'react';
import { Filter, X, Search, Video, ShoppingCart, Monitor, Zap, Play, Pause, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface FilterOptions {
  campaignTypes: string[];
  statuses: string[];
  searchQuery: string;
  performanceFilters: {
    minROAS?: number;
    minCTR?: number;
    minConversions?: number;
  };
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  activeFiltersCount?: number;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  activeFiltersCount = 0
}) => {
  const { t, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    campaignTypes: [],
    statuses: [],
    searchQuery: '',
    performanceFilters: {}
  });

  const campaignTypes = [
    { value: 'SEARCH', label: 'Search', labelAr: 'بحث', icon: Search, color: 'text-blue-400' },
    { value: 'VIDEO', label: 'Video', labelAr: 'فيديو', icon: Video, color: 'text-red-400' },
    { value: 'SHOPPING', label: 'Shopping', labelAr: 'تسوق', icon: ShoppingCart, color: 'text-green-400' },
    { value: 'DISPLAY', label: 'Display', labelAr: 'عرض', icon: Monitor, color: 'text-yellow-400' },
    { value: 'PERFORMANCE_MAX', label: 'Performance Max', labelAr: 'الأداء الأقصى', icon: Zap, color: 'text-purple-400' }
  ];

  const statuses = [
    { value: 'ENABLED', label: 'Active', labelAr: 'نشط', icon: Play, color: 'text-green-400' },
    { value: 'PAUSED', label: 'Paused', labelAr: 'متوقف', icon: Pause, color: 'text-yellow-400' },
    { value: 'REMOVED', label: 'Removed', labelAr: 'محذوف', icon: X, color: 'text-red-400' }
  ];

  const handleTypeToggle = (type: string) => {
    setFilters(prev => {
      const newTypes = prev.campaignTypes.includes(type)
        ? prev.campaignTypes.filter(t => t !== type)
        : [...prev.campaignTypes, type];
      
      const newFilters = { ...prev, campaignTypes: newTypes };
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const handleStatusToggle = (status: string) => {
    setFilters(prev => {
      const newStatuses = prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status];
      
      const newFilters = { ...prev, statuses: newStatuses };
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const handleSearchChange = (query: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, searchQuery: query };
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const handlePerformanceFilter = (key: keyof FilterOptions['performanceFilters'], value: string) => {
    setFilters(prev => {
      const numValue = value ? parseFloat(value) : undefined;
      const newFilters = {
        ...prev,
        performanceFilters: {
          ...prev.performanceFilters,
          [key]: numValue
        }
      };
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      campaignTypes: [],
      statuses: [],
      searchQuery: '',
      performanceFilters: {}
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.campaignTypes.length > 0 || 
    filters.statuses.length > 0 || 
    filters.searchQuery.length > 0 ||
    Object.keys(filters.performanceFilters).length > 0;

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-900/50 rounded-lg text-purple-200 text-sm transition-all backdrop-blur-sm"
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">{isRTL ? 'تصفية' : 'Filters'}</span>
        
        {/* Active Filters Badge */}
        {hasActiveFilters && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {activeFiltersCount || (
              filters.campaignTypes.length + 
              filters.statuses.length + 
              (filters.searchQuery ? 1 : 0) +
              Object.keys(filters.performanceFilters).length
            )}
          </span>
        )}
      </button>

      {/* Filters Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div 
            className="absolute top-full mt-2 right-0 w-96 bg-[#060010] border border-purple-900/50 rounded-xl shadow-2xl shadow-purple-900/20 z-50 backdrop-blur-xl max-h-[600px] overflow-y-auto custom-scrollbar"
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#060010] z-10 flex items-center justify-between p-4 border-b border-purple-900/30">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-400" />
                {isRTL ? 'خيارات التصفية' : 'Filter Options'}
              </h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {isRTL ? 'مسح الكل' : 'Clear All'}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-purple-900/30">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'البحث عن حملة' : 'Search Campaign'}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={isRTL ? 'ابحث بالاسم...' : 'Search by name...'}
                  className="w-full pl-10 pr-4 py-2 bg-purple-900/20 border border-purple-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Campaign Types */}
            <div className="p-4 border-b border-purple-900/30">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {isRTL ? 'نوع الحملة' : 'Campaign Type'}
              </label>
              <div className="space-y-2">
                {campaignTypes.map(type => {
                  const Icon = type.icon;
                  const isSelected = filters.campaignTypes.includes(type.value);
                  
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleTypeToggle(type.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                          : 'bg-purple-900/10 border border-transparent text-gray-300 hover:bg-purple-900/20'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${type.color}`} />
                      <span className="flex-1 text-left text-sm">
                        {isRTL ? type.labelAr : type.label}
                      </span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="p-4 border-b border-purple-900/30">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {isRTL ? 'الحالة' : 'Status'}
              </label>
              <div className="space-y-2">
                {statuses.map(status => {
                  const Icon = status.icon;
                  const isSelected = filters.statuses.includes(status.value);
                  
                  return (
                    <button
                      key={status.value}
                      onClick={() => handleStatusToggle(status.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                          : 'bg-purple-900/10 border border-transparent text-gray-300 hover:bg-purple-900/20'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${status.color}`} />
                      <span className="flex-1 text-left text-sm">
                        {isRTL ? status.labelAr : status.label}
                      </span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Performance Filters */}
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {isRTL ? 'تصفية حسب الأداء' : 'Performance Filters'}
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {isRTL ? 'الحد الأدنى لـ ROAS' : 'Min ROAS'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={filters.performanceFilters.minROAS || ''}
                    onChange={(e) => handlePerformanceFilter('minROAS', e.target.value)}
                    placeholder="e.g. 3.0"
                    className="w-full px-3 py-2 bg-purple-900/20 border border-purple-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {isRTL ? 'الحد الأدنى لـ CTR (%)' : 'Min CTR (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={filters.performanceFilters.minCTR || ''}
                    onChange={(e) => handlePerformanceFilter('minCTR', e.target.value)}
                    placeholder="e.g. 5.0"
                    className="w-full px-3 py-2 bg-purple-900/20 border border-purple-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {isRTL ? 'الحد الأدنى للتحويلات' : 'Min Conversions'}
                  </label>
                  <input
                    type="number"
                    value={filters.performanceFilters.minConversions || ''}
                    onChange={(e) => handlePerformanceFilter('minConversions', e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 bg-purple-900/20 border border-purple-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Custom Scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default AdvancedFilters;

