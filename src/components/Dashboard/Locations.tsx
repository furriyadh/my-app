"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// تعريف أنواع البيانات
interface LocationData {
  id: string;
  name: string;
  nameAr: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  performance: number;
  trend: 'up' | 'down' | 'stable';
  clicks: number;
  impressions: number;
  conversions: number;
  cost: number;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address: string;
  types: string[];
}

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // المواقع الافتراضية للبحث عنها
  const defaultLocations = [
    { name: "Riyadh", nameAr: "الرياض", searchQuery: "Riyadh, Saudi Arabia" },
    { name: "Jeddah", nameAr: "جدة", searchQuery: "Jeddah, Saudi Arabia" },
    { name: "Dammam", nameAr: "الدمام", searchQuery: "Dammam, Saudi Arabia" },
    { name: "Mecca", nameAr: "مكة المكرمة", searchQuery: "Mecca, Saudi Arabia" },
    { name: "Medina", nameAr: "المدينة المنورة", searchQuery: "Medina, Saudi Arabia" }
  ];

  // دالة لتوليد بيانات الأداء العشوائية (محاكاة)
  const generatePerformanceData = () => {
    const baseClicks = Math.floor(Math.random() * 1000) + 500;
    const baseImpressions = baseClicks * (Math.floor(Math.random() * 20) + 10);
    const conversions = Math.floor(baseClicks * (Math.random() * 0.1 + 0.02));
    const cost = parseFloat((baseClicks * (Math.random() * 2 + 1)).toFixed(2));
    const performance = Math.floor(Math.random() * 60) - 20; // من -20 إلى +40
    
    return {
      clicks: baseClicks,
      impressions: baseImpressions,
      conversions,
      cost,
      performance,
      trend: performance > 10 ? 'up' as const : performance < -5 ? 'down' as const : 'stable' as const
    };
  };

  // دالة للبحث عن المواقع باستخدام Google Places API
  const searchLocation = async (query: string): Promise<GooglePlaceResult | null> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key not found');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return data.results[0];
      } else {
        console.warn(`No results found for: ${query}`);
        return null;
      }
    } catch (error) {
      console.error(`Error searching for location ${query}:`, error);
      return null;
    }
  };

  // دالة لتحميل بيانات المواقع
  const loadLocationsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const locationsData: LocationData[] = [];

      for (const location of defaultLocations) {
        try {
          // البحث عن الموقع باستخدام Google Places API
          const placeResult = await searchLocation(location.searchQuery);
          
          if (placeResult) {
            const performanceData = generatePerformanceData();
            
            locationsData.push({
              id: placeResult.place_id,
              name: location.name,
              nameAr: location.nameAr,
              coordinates: {
                lat: placeResult.geometry.location.lat,
                lng: placeResult.geometry.location.lng
              },
              ...performanceData
            });
          } else {
            // إذا فشل البحث، استخدم بيانات افتراضية
            const performanceData = generatePerformanceData();
            const defaultCoordinates = getDefaultCoordinates(location.name);
            
            locationsData.push({
              id: `default_${location.name.toLowerCase()}`,
              name: location.name,
              nameAr: location.nameAr,
              coordinates: defaultCoordinates,
              ...performanceData
            });
          }

          // تأخير قصير لتجنب تجاوز حدود API
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error processing location ${location.name}:`, error);
        }
      }

      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading locations data:', error);
      setError('فشل في تحميل بيانات المواقع');
      
      // استخدام بيانات افتراضية في حالة الخطأ
      const fallbackData = defaultLocations.map(location => ({
        id: `fallback_${location.name.toLowerCase()}`,
        name: location.name,
        nameAr: location.nameAr,
        coordinates: getDefaultCoordinates(location.name),
        ...generatePerformanceData()
      }));
      
      setLocations(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // دالة للحصول على إحداثيات افتراضية
  const getDefaultCoordinates = (cityName: string) => {
    const coordinates: { [key: string]: { lat: number; lng: number } } = {
      'Riyadh': { lat: 24.7136, lng: 46.6753 },
      'Jeddah': { lat: 21.4858, lng: 39.1925 },
      'Dammam': { lat: 26.4207, lng: 50.0888 },
      'Mecca': { lat: 21.3891, lng: 39.8579 },
      'Medina': { lat: 24.5247, lng: 39.5692 }
    };
    
    return coordinates[cityName] || { lat: 24.7136, lng: 46.6753 };
  };

  // دالة لتنسيق الأرقام
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // دالة لتحديد لون الأداء
  const getPerformanceColor = (trend: string, performance: number) => {
    if (trend === 'up' || performance > 0) {
      return 'text-green-500';
    } else if (trend === 'down' || performance < 0) {
      return 'text-red-500';
    }
    return 'text-gray-500';
  };

  // دالة لتحديد أيقونة الاتجاه
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '➡️';
    }
  };

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    loadLocationsData();
  }, []);

  // دالة لإعادة تحميل البيانات
  const refreshData = () => {
    loadLocationsData();
  };

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md mb-[25px]">
      <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
        <div className="trezo-card-title">
          <h5 className="!mb-0 flex items-center">
            🗺️ المواقع الجغرافية
            {loading && (
              <div className="ml-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h5>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md transition-colors disabled:opacity-50"
        >
          🔄 تحديث
        </button>
      </div>

      <div className="trezo-card-content">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">⚠️ {error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px]">
                <div className="flex items-center">
                  <div className="w-[18px] h-[18px] bg-gray-200 rounded-full animate-pulse mr-3"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {locations.map((location, index) => (
              <div
                key={location.id}
                className="flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[13px] mb-[13px] last:border-none last:mb-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-[#1a2332] p-2 rounded-md transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <div className="relative ltr:pl-[28px] rtl:pr-[28px] font-medium text-primary-500">
                      <Image
                        src="/images/icons/map-pin.svg"
                        className="w-[18px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
                        alt="Location"
                        width={18}
                        height={18}
                      />
                      <span className="font-semibold">{location.nameAr}</span>
                      <span className="text-xs text-gray-500 ml-2">({location.name})</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center">
                      <span className="text-blue-600">👆</span>
                      <span className="ml-1">{formatNumber(location.clicks)} نقرة</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-600">👁️</span>
                      <span className="ml-1">{formatNumber(location.impressions)} ظهور</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-600">🎯</span>
                      <span className="ml-1">{location.conversions} تحويل</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-orange-600">💰</span>
                      <span className="ml-1">${location.cost}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block transition-all leading-none font-semibold ${getPerformanceColor(location.trend, location.performance)}`}>
                    {getTrendIcon(location.trend)} {location.performance > 0 ? '+' : ''}{location.performance}%
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    📍 {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && locations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🗺️</div>
            <p>لا توجد بيانات مواقع متاحة</p>
            <button
              onClick={refreshData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {!loading && locations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#172036]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <div className="text-lg font-bold text-blue-600">
                  {formatNumber(locations.reduce((sum, loc) => sum + loc.clicks, 0))}
                </div>
                <div className="text-xs text-gray-600">إجمالي النقرات</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                <div className="text-lg font-bold text-green-600">
                  {formatNumber(locations.reduce((sum, loc) => sum + loc.impressions, 0))}
                </div>
                <div className="text-xs text-gray-600">إجمالي الظهور</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
                <div className="text-lg font-bold text-purple-600">
                  {locations.reduce((sum, loc) => sum + loc.conversions, 0)}
                </div>
                <div className="text-xs text-gray-600">إجمالي التحويلات</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md">
                <div className="text-lg font-bold text-orange-600">
                  ${locations.reduce((sum, loc) => sum + loc.cost, 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">إجمالي التكلفة</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;

