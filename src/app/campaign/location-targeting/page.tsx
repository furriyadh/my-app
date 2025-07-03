'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignData } from '@/lib/hooks/useCampaignData';
import { useLocation } from '@/lib/hooks/useLocation';
import { InteractiveMap } from '@/components/campaign/LocationTargeting/InteractiveMap';
import { LocationSearch } from '@/components/campaign/LocationTargeting/LocationSearch';
import { TimezoneDisplay } from '@/components/campaign/LocationTargeting/TimezoneDisplay';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/common/ProgressIndicator';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { LocationData } from '@/lib/types/campaign';

const LocationTargetingPage: React.FC = () => {
  const router = useRouter();
  const { campaignData, updateLocationData } = useCampaignData();
  const { searchLocations, getTimezone } = useLocation();
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    campaignData?.targetLocation || null
  );
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // البحث عن المواقع
  const handleLocationSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchLocations(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
      setError('فشل في البحث عن المواقع');
    } finally {
      setIsLoading(false);
    }
  };

  // اختيار موقع من نتائج البحث
  const handleLocationSelect = async (location: LocationData) => {
    try {
      // الحصول على المنطقة الزمنية
      const timezone = await getTimezone(location.coordinates);
      
      const locationWithTimezone = {
        ...location,
        timezone: timezone.timeZoneId,
        utcOffset: timezone.rawOffset / 3600
      };

      setSelectedLocation(locationWithTimezone);
      setSearchResults([]);
      setError('');
    } catch (error) {
      console.error('Error getting timezone:', error);
      setError('فشل في تحديد المنطقة الزمنية');
    }
  };

  // اختيار موقع من الخريطة
  const handleMapClick = async (coordinates: [number, number]) => {
    setIsLoading(true);
    try {
      // الحصول على معلومات الموقع من الإحداثيات
      const response = await fetch(`/api/location/reverse-geocode?lat=${coordinates[0]}&lng=${coordinates[1]}`);
      const locationData = await response.json();

      if (locationData.error) {
        throw new Error(locationData.error);
      }

      await handleLocationSelect(locationData);
    } catch (error) {
      console.error('Error getting location from coordinates:', error);
      setError('فشل في تحديد الموقع');
    } finally {
      setIsLoading(false);
    }
  };

  // الانتقال للخطوة التالية
  const handleNext = async () => {
    if (!selectedLocation) {
      setError('يجب تحديد الموقع المستهدف');
      return;
    }

    setIsLoading(true);
    try {
      await updateLocationData(selectedLocation);
      router.push('/campaign/budget-scheduling');
    } catch (error) {
      console.error('Error saving location data:', error);
      setError('فشل في حفظ بيانات الموقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">الاستهداف الجغرافي</h1>
            <p className="text-gray-600 mt-1">الخطوة 2 من 4: تحديد المنطقة المستهدفة</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={2} totalSteps={4} className="mb-8" />

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* قسم البحث والاختيار */}
          <div className="space-y-6">
            
            {/* البحث عن المواقع */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">البحث عن الموقع</h2>
              </div>
              
              <LocationSearch
                onSearch={handleLocationSearch}
                results={searchResults}
                onSelect={handleLocationSelect}
                isLoading={isLoading}
              />
            </div>

            {/* عرض الموقع المختار */}
            {selectedLocation && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">الموقع المختار</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-800">{selectedLocation.name}</div>
                      <div className="text-sm text-green-600">{selectedLocation.country}</div>
                    </div>
                  </div>
                  
                  <TimezoneDisplay location={selectedLocation} />
                </div>
              </div>
            )}

            {/* رسالة الخطأ */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            )}

          </div>

          {/* الخريطة التفاعلية */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">الخريطة التفاعلية</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <InteractiveMap
                selectedLocation={selectedLocation}
                onLocationSelect={handleMapClick}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              💡 انقر على الخريطة لتحديد الموقع المستهدف
            </div>
          </div>

        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            السابق
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!selectedLocation || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                التالي
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default LocationTargetingPage;

