'use client';

import { useState, useCallback } from 'react';

export interface LocationSuggestion {
  id: string;
  name: string;
  type: 'country' | 'city' | 'region';
  countryCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
  population?: number;
}

export interface SelectedLocation extends LocationSuggestion {
  radius?: number;
  targetType: 'location' | 'radius';
}

export const useLocation = () => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // بيانات وهمية للمواقع الشائعة
  const popularLocations: LocationSuggestion[] = [
    {
      id: 'riyadh',
      name: 'الرياض',
      type: 'city',
      countryCode: 'SA',
      coordinates: { lat: 24.7136, lng: 46.6753 },
      timezone: 'Asia/Riyadh',
      population: 7000000
    },
    {
      id: 'jeddah',
      name: 'جدة',
      type: 'city',
      countryCode: 'SA',
      coordinates: { lat: 21.4858, lng: 39.1925 },
      timezone: 'Asia/Riyadh',
      population: 4000000
    },
    {
      id: 'dammam',
      name: 'الدمام',
      type: 'city',
      countryCode: 'SA',
      coordinates: { lat: 26.4207, lng: 50.0888 },
      timezone: 'Asia/Riyadh',
      population: 1500000
    },
    {
      id: 'mecca',
      name: 'مكة المكرمة',
      type: 'city',
      countryCode: 'SA',
      coordinates: { lat: 21.3891, lng: 39.8579 },
      timezone: 'Asia/Riyadh',
      population: 2000000
    },
    {
      id: 'medina',
      name: 'المدينة المنورة',
      type: 'city',
      countryCode: 'SA',
      coordinates: { lat: 24.5247, lng: 39.5692 },
      timezone: 'Asia/Riyadh',
      population: 1500000
    },
    {
      id: 'saudi-arabia',
      name: 'المملكة العربية السعودية',
      type: 'country',
      countryCode: 'SA',
      coordinates: { lat: 23.8859, lng: 45.0792 },
      timezone: 'Asia/Riyadh',
      population: 35000000
    },
    {
      id: 'dubai',
      name: 'دبي',
      type: 'city',
      countryCode: 'AE',
      coordinates: { lat: 25.2048, lng: 55.2708 },
      timezone: 'Asia/Dubai',
      population: 3500000
    },
    {
      id: 'cairo',
      name: 'القاهرة',
      type: 'city',
      countryCode: 'EG',
      coordinates: { lat: 30.0444, lng: 31.2357 },
      timezone: 'Africa/Cairo',
      population: 20000000
    }
  ];

  const searchLocations = useCallback(async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 300));

      const filteredLocations = popularLocations.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.name.includes(query)
      );

      setSuggestions(filteredLocations);
      return filteredLocations;
    } catch (err) {
      const errorMessage = 'فشل في البحث عن المواقع';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addLocation = useCallback((location: LocationSuggestion, radius?: number) => {
    const newLocation: SelectedLocation = {
      ...location,
      radius,
      targetType: radius ? 'radius' : 'location'
    };

    setSelectedLocations(prev => {
      const exists = prev.find(loc => loc.id === location.id);
      if (exists) {
        return prev.map(loc => loc.id === location.id ? newLocation : loc);
      }
      return [...prev, newLocation];
    });
  }, []);

  const removeLocation = useCallback((locationId: string) => {
    setSelectedLocations(prev => prev.filter(loc => loc.id !== locationId));
  }, []);

  const clearLocations = useCallback(() => {
    setSelectedLocations([]);
  }, []);

  const getTimezone = useCallback((location: SelectedLocation): string => {
    return location.timezone;
  }, []);

  const getLocalTime = useCallback((location: SelectedLocation): string => {
    try {
      const now = new Date();
      return now.toLocaleTimeString('ar-SA', {
        timeZone: location.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'غير متاح';
    }
  }, []);

  const formatPopulation = useCallback((population?: number): string => {
    if (!population) return '';
    
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)} مليون`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(0)} ألف`;
    }
    return population.toString();
  }, []);

  return {
    suggestions,
    selectedLocations,
    isLoading,
    error,
    searchLocations,
    addLocation,
    removeLocation,
    clearLocations,
    getTimezone,
    getLocalTime,
    formatPopulation,
    popularLocations
  };
};

