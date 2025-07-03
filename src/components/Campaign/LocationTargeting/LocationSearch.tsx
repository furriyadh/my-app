'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { LocationData } from '@/lib/types/campaign';

interface LocationSearchProps {
  onSearch: (query: string) => void;
  results: LocationData[];
  onSelect: (location: LocationData) => void;
  isLoading: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onSearch,
  results,
  onSelect,
  isLoading
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        onSearch(query);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleSelect = (location: LocationData) => {
    onSelect(location);
    setQuery(location.name);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="ابحث عن مدينة أو منطقة..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((location, index) => (
            <button
              key={index}
              onClick={() => handleSelect(location)}
              className="w-full px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 text-right">
                  <div className="font-medium text-gray-900">{location.name}</div>
                  <div className="text-sm text-gray-500">{location.country}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
          لم يتم العثور على نتائج
        </div>
      )}
    </div>
  );
};

