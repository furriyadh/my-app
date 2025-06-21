"use client";

import React, { useEffect, useState } from "react";
import GoogleMapsManager from "@/utils/GoogleMapsManager";
import { MapPin, Phone, MousePointer, Loader, AlertCircle } from "lucide-react";

interface LocationData {
  city: string;
  country: string;
  clicks: number;
  calls: number;
  impressions: number;
  ctr: number;
  lat?: number;
  lng?: number;
}

interface GoogleAdsMapComponentProps {
  locationData?: LocationData[];
  currency?: string;
  selectedPeriod?: string;
}

// Egyptian cities with coordinates
const egyptianCities = [
  { name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Alexandria", lat: 31.2001, lng: 29.9187 },
  { name: "Giza", lat: 30.0131, lng: 31.2089 },
  { name: "Sharm El Sheikh", lat: 27.9158, lng: 34.3300 },
  { name: "Luxor", lat: 25.6872, lng: 32.6396 },
  { name: "Aswan", lat: 24.0889, lng: 32.8998 },
  { name: "Hurghada", lat: 27.2574, lng: 33.8129 },
  { name: "Port Said", lat: 31.2653, lng: 32.3019 },
  { name: "Suez", lat: 29.9668, lng: 32.5498 },
  { name: "Mansoura", lat: 31.0409, lng: 31.3785 }
];

const GoogleAdsMapComponent: React.FC<GoogleAdsMapComponentProps> = ({ 
  locationData = [], 
  currency = "EGP",
  selectedPeriod = "Last 7 days"
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [geoData, setGeoData] = useState<LocationData[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  // Function to get date range based on selected option
  const getDateRange = (option: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (option) {
      case "Today":
        return { startDate: formatDate(today), endDate: formatDate(today) };
      case "Yesterday":
        return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) };
      case "Last 7 days":
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6);
        return { startDate: formatDate(last7Days), endDate: formatDate(today) };
      case "Last 14 days":
        const last14Days = new Date(today);
        last14Days.setDate(today.getDate() - 13);
        return { startDate: formatDate(last14Days), endDate: formatDate(today) };
      case "Last 30 days":
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 29);
        return { startDate: formatDate(last30Days), endDate: formatDate(today) };
      case "Last 90 days":
        const last90Days = new Date(today);
        last90Days.setDate(today.getDate() - 89);
        return { startDate: formatDate(last90Days), endDate: formatDate(today) };
      default:
        return { startDate: formatDate(today), endDate: formatDate(today) };
    }
  };

  // Safe number conversion function
  const safeNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Fetch geographic performance data from Google Ads API
  const fetchGeographicData = async (timePeriod: string) => {
    try {
      setIsLoading(true);
      
      const customerId = "3271710441";
      const { startDate, endDate } = getDateRange(timePeriod);
      
      const response = await fetch('/api/google-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          loginCustomerId: customerId,
          startDate: startDate,
          endDate: endDate,
          dataType: 'geographic_performance'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result && result.success && result.data) {
        // Process real geographic data with safe number conversion
        const processedData = result.data.map((item: any) => {
          const cityInfo = egyptianCities.find(city => 
            city.name.toLowerCase().includes(item.location?.toLowerCase() || '') ||
            item.location?.toLowerCase().includes(city.name.toLowerCase())
          );
          
          const clicks = safeNumber(item.clicks);
          const impressions = safeNumber(item.impressions);
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          
          return {
            city: item.location || 'Unknown',
            country: 'Egypt',
            clicks: clicks,
            calls: safeNumber(item.calls),
            impressions: impressions,
            ctr: ctr,
            lat: cityInfo?.lat,
            lng: cityInfo?.lng
          };
        });
        
        setGeoData(processedData);
      } else {
        // Use demo data if API fails
        setGeoData(getDefaultLocationData());
      }
    } catch (error) {
      console.error('Error fetching geographic data:', error);
      setGeoData(getDefaultLocationData());
    } finally {
      setIsLoading(false);
    }
  };

  // Default sample data with coordinates and safe numbers
  const getDefaultLocationData = (): LocationData[] => [
    { city: "Cairo", country: "Egypt", clicks: 230, calls: 45, impressions: 5200, ctr: 4.42, lat: 30.0444, lng: 31.2357 },
    { city: "Alexandria", country: "Egypt", clicks: 180, calls: 32, impressions: 4100, ctr: 4.39, lat: 31.2001, lng: 29.9187 },
    { city: "Giza", country: "Egypt", clicks: 150, calls: 28, impressions: 3800, ctr: 3.95, lat: 30.0131, lng: 31.2089 },
    { city: "Sharm El Sheikh", country: "Egypt", clicks: 120, calls: 22, impressions: 2900, ctr: 4.14, lat: 27.9158, lng: 34.3300 },
    { city: "Luxor", country: "Egypt", clicks: 90, calls: 15, impressions: 2200, ctr: 4.09, lat: 25.6872, lng: 32.6396 },
  ];

  // Load Google Maps using centralized manager
  useEffect(() => {
    const loadMap = async () => {
      try {
        const mapsManager = GoogleMapsManager.getInstance();
        await mapsManager.loadGoogleMaps();
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapError('Failed to load Google Maps API');
      }
    };

    loadMap();
  }, []);

  // Fetch data when period changes
  useEffect(() => {
    fetchGeographicData(selectedPeriod);
  }, [selectedPeriod]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (mapLoaded && !map && window.google && window.google.maps) {
      const mapElement = document.getElementById('google-ads-geographic-map');
      if (mapElement) {
        try {
          const newMap = new window.google.maps.Map(mapElement, {
            center: { lat: 26.8206, lng: 30.8025 }, // Center of Egypt
            zoom: 6,
            styles: [
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
              }
            ]
          });
          setMap(newMap);
        } catch (error) {
          console.error('Error initializing map:', error);
          setMapError('Failed to initialize map');
        }
      }
    }
  }, [mapLoaded, map]);

  // Add markers when map and data are ready
  useEffect(() => {
    if (map && geoData.length > 0 && window.google && window.google.maps) {
      try {
        // Clear existing markers
        markers.forEach(marker => {
          if (marker && marker.setMap) {
            marker.setMap(null);
          }
        });
        
        const newMarkers: any[] = [];
        
        geoData.forEach((location) => {
          if (location.lat && location.lng && location.clicks > 0) {
            // Calculate marker size based on clicks (min 15, max 50)
            const markerSize = Math.min(50, Math.max(15, (location.clicks / 50) * 20 + 15));
            
            const marker = new window.google.maps.Marker({
              position: { lat: location.lat, lng: location.lng },
              map: map,
              title: `${location.city}: ${location.clicks} clicks`,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#EF4444',
                fillOpacity: 0.8,
                strokeColor: '#DC2626',
                strokeWeight: 2,
                scale: markerSize / 3
              }
            });

            // Add info window
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 10px; min-width: 200px;">
                  <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${location.city}</h3>
                  <div style="display: flex; flex-direction: column; gap: 5px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Clicks:</span>
                      <span style="font-weight: 600; color: #ef4444;">${location.clicks.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Calls:</span>
                      <span style="font-weight: 600; color: #10b981;">${location.calls.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Impressions:</span>
                      <span style="font-weight: 600;">${location.impressions.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">CTR:</span>
                      <span style="font-weight: 600;">${safeNumber(location.ctr).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });

            newMarkers.push(marker);
          }
        });
        
        setMarkers(newMarkers);
      } catch (error) {
        console.error('Error adding markers:', error);
        setMapError('Failed to add markers to map');
      }
    }
  }, [map, geoData]);

  const displayData = locationData.length > 0 ? locationData : geoData;
  
  // Calculate totals with safe number conversion
  const totalClicks = displayData.reduce((sum, location) => sum + safeNumber(location.clicks), 0);
  const totalCalls = displayData.reduce((sum, location) => sum + safeNumber(location.calls), 0);
  const totalImpressions = displayData.reduce((sum, location) => sum + safeNumber(location.impressions), 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  
  // Find top performing city
  const topCity = displayData.length > 0 ? displayData.reduce((prev, current) => 
    (safeNumber(prev.clicks) > safeNumber(current.clicks)) ? prev : current
  ) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-[20px] md:p-[25px] h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Geographic Performance</h3>
            <p className="text-sm text-gray-500">Ad performance by location ({selectedPeriod})</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading geographic data...</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            {/* Interactive Google Map with unique ID */}
            <div className="rounded-lg overflow-hidden border border-gray-200 h-[400px] relative">
              {mapError ? (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">Map temporarily unavailable</p>
                    <p className="text-gray-500 text-sm">{mapError}</p>
                  </div>
                </div>
              ) : !mapLoaded ? (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">Loading interactive map...</p>
                  </div>
                </div>
              ) : (
                <div id="google-ads-geographic-map" className="w-full h-full"></div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3">Performance Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Top Performing City</div>
                <div className="text-lg font-bold text-gray-900">{topCity?.city || 'N/A'}</div>
                <div className="text-xs text-gray-500">
                  {topCity ? `${safeNumber(topCity.clicks).toLocaleString()} clicks, ${safeNumber(topCity.calls).toLocaleString()} calls` : 'No data'}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Total Locations</div>
                <div className="text-lg font-bold text-gray-900">{displayData.length}</div>
                <div className="text-xs text-gray-500">Active cities</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Average CTR</div>
                <div className="text-lg font-bold text-gray-900">{avgCtr.toFixed(2)}%</div>
                <div className="text-xs text-gray-500">Across all locations</div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calls
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayData.map((location, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{location.city}</div>
                          <div className="text-sm text-gray-500">{location.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end">
                        <MousePointer className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {safeNumber(location.clicks).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end">
                        <Phone className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {safeNumber(location.calls).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      {safeNumber(location.impressions).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        safeNumber(location.ctr) >= 4 
                          ? 'bg-green-100 text-green-800' 
                          : safeNumber(location.ctr) >= 2 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {safeNumber(location.ctr).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default GoogleAdsMapComponent;