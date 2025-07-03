'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignContext } from '../../../lib/context/CampaignContext';
import { useLocation } from '../../../lib/hooks/useLocation';
import { InteractiveMap } from '../../../components/campaign/LocationTargeting/InteractiveMap';
import { LocationSearch } from '../../../components/campaign/LocationTargeting/LocationSearch';
import { TimezoneDisplay } from '../../../components/campaign/LocationTargeting/TimezoneDisplay';
import { Button } from '../../../components/ui/Button';
import { ProgressIndicator } from '../../../components/common/ProgressIndicator';
import { LocationData } from '../../../lib/types/campaign';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';

const LocationTargetingPage: React.FC = () => {
  const router = useRouter();
  const { state, updateCampaignData } = useCampaignContext();
  const { searchLocations, selectedLocations, addLocation, removeLocation, getLocalTime } = useLocation();
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // البحث عن المواقع
  const handleLocationSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const results = await searchLocations(query);
      setSearchResults(results);
    } catch (err) {
      setError('فشل في البحث عن المواقع');
    } finally {
      setIsLoading(false);
    }
  };

  // اختيار موقع من النتائج
  const handleLocationSelect = (location: any) => {
    addLocation(location);
    
    // تحديث بيانات الحملة
    const locationData: LocationData = {
      name: location.name,
      coordinates: [location.coordinates.lat, location.coordinates.lng],
      timezone: location.timezone,
      utcOffset: 3, // يمكن حسابه بناءً على التوقيت
      country: location.countryCode === 'SA' ? 'السعودية' : location.name
    };

    updateCampaignData({
      targetLocation: locationData
    });

    setSearchResults([]);
    setSearchQuery('');
  };

  // إزالة موقع مختار
  const handleLocationRemove = (locationId: string) => {
    removeLocation(locationId);
  };

  // التنقل للخطوة التالية
  const handleNext = () => {
    if (selectedLocations.length === 0) {
      setError('يرجى اختيار موقع واحد على الأقل');
      return;
    }

    router.push('/campaign/budget-scheduling');
  };

  // التنقل للخطوة السابقة
  const handlePrevious = () => {
    router.push('/campaign/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* مؤشر التقدم */}
        <div className="mb-8">
          <ProgressIndicator currentStep={2} totalSteps={4} />
        </div>

        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            الاستهداف الجغرافي
          </h1>
          <p className="text-gray-600">
            حدد المناطق التي تريد عرض إعلانك فيها
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* قسم البحث والنتائج */}
          <div className="space-y-6">
            {/* البحث */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                البحث عن المواقع
              </h2>
              
              <LocationSearch
                onSearch={handleLocationSearch}
                results={searchResults}
                onSelect={handleLocationSelect}
                isLoading={isLoading}
              />
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* المواقع المختارة */}
            {selectedLocations.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  المواقع المختارة ({selectedLocations.length})
                </h3>
                
                <div className="space-y-3">
                  {selectedLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {location.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {location.type === 'country' ? 'دولة' : 
                           location.type === 'city' ? 'مدينة' : 'منطقة'}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          التوقيت المحلي
                        </div>
                        <div className="font-medium text-blue-600">
                          {getLocalTime(location)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleLocationRemove(location.id)}
                        className="ml-3 p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* عرض التوقيت */}
            {selectedLocations.length > 0 && (
              <div className="space-y-2">
                {selectedLocations.map((location, index) => {
                  // تحويل SelectedLocation إلى LocationData
                  const locationData: LocationData = {
                    name: location.name,
                    coordinates: [location.coordinates.lat, location.coordinates.lng],
                    timezone: location.timezone,
                    utcOffset: 3, // افتراضي للسعودية
                    country: location.countryCode === 'SA' ? 'السعودية' : 'دولة أخرى',
                    region: location.type === 'city' ? 'مدينة' : 'منطقة'
                  };
                  return (
                    <TimezoneDisplay key={index} location={locationData} />
                  );
                })}
              </div>
            )}
          </div>

          {/* الخريطة التفاعلية */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              الخريطة التفاعلية
            </h2>
            
            <InteractiveMap
              selectedLocation={selectedLocations.length > 0 ? {
                name: selectedLocations[0].name,
                coordinates: [selectedLocations[0].coordinates.lat, selectedLocations[0].coordinates.lng],
                timezone: selectedLocations[0].timezone,
                utcOffset: 3,
                country: selectedLocations[0].countryCode === 'SA' ? 'السعودية' : 'دولة أخرى',
                region: selectedLocations[0].type === 'city' ? 'مدينة' : 'منطقة'
              } : null}
              onLocationSelect={(coordinates: [number, number]) => {
                console.log('Selected coordinates:', coordinates);
              }}
              apiKey="YOUR_GOOGLE_MAPS_API_KEY"
            />
          </div>
        </div>

        {/* أزرار التنقل */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            السابق
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              الخطوة 2 من 4
            </p>
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedLocations.length === 0}
            className="flex items-center gap-2"
          >
            التالي
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* نصائح مفيدة */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3">💡 نصائح للاستهداف الجغرافي:</h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• ابدأ بمناطق صغيرة لاختبار الأداء</li>
            <li>• راعي التوقيت المحلي عند جدولة الإعلانات</li>
            <li>• استهدف المناطق التي يتواجد فيها عملاؤك المحتملون</li>
            <li>• يمكنك إضافة أو إزالة مناطق لاحقاً حسب الأداء</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LocationTargetingPage;

