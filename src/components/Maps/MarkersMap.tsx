"use client";

import React, { useState, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 0,
  lng: 0,
};


interface LocationData {
  locationId: string;
  locationName?: string;
  campaignId?: string;
  campaignName?: string;
  type: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
}

interface MarkersMapProps {
  locations?: LocationData[];
}

const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  // Saudi Arabia
  "Riyadh": { lat: 24.7136, lng: 46.6753 },
  "Jeddah": { lat: 21.4858, lng: 39.1925 },
  "Dammam": { lat: 26.3927, lng: 49.9777 },
  "Mecca": { lat: 21.3891, lng: 39.8579 },
  "Makkah": { lat: 21.3891, lng: 39.8579 }, // Alias
  "Medina": { lat: 24.5247, lng: 39.5692 },
  "Madinah": { lat: 24.5247, lng: 39.5692 }, // Alias
  "Khobar": { lat: 26.2172, lng: 50.1971 },
  "Abha": { lat: 18.2068, lng: 42.5061 },
  "Tabuk": { lat: 28.3835, lng: 36.5662 },
  "Buraydah": { lat: 26.3259, lng: 43.9750 },
  "Khamis Mushait": { lat: 18.3001, lng: 42.7213 },
  "Jubail": { lat: 27.0000, lng: 49.6111 },
  "Hail": { lat: 27.5219, lng: 41.6907 },
  "Najran": { lat: 17.4917, lng: 44.1322 },
  "Yanbu": { lat: 24.0891, lng: 38.0637 },

  // Countries
  "Saudi Arabia": { lat: 23.8859, lng: 45.0792 },
  "Kuwait": { lat: 29.3759, lng: 47.9774 },
  "Qatar": { lat: 25.3548, lng: 51.1839 },
  "United Arab Emirates": { lat: 23.4241, lng: 53.8478 },
  "UAE": { lat: 23.4241, lng: 53.8478 },
  "Bahrain": { lat: 26.0667, lng: 50.5577 },
  "Oman": { lat: 21.4735, lng: 55.9754 },
  "Egypt": { lat: 26.8206, lng: 30.8025 },
  "Jordan": { lat: 30.5852, lng: 36.2384 },
  "Lebanon": { lat: 33.8547, lng: 35.8623 },
  "Morocco": { lat: 31.7917, lng: -7.0926 },
  "Iraq": { lat: 33.2232, lng: 43.6793 },
  "Tunisia": { lat: 33.8869, lng: 9.5375 },
  "Algeria": { lat: 28.0339, lng: 1.6596 },
  "Sudan": { lat: 12.8628, lng: 30.2176 },
  "Libya": { lat: 26.3351, lng: 17.2283 },
  "Syria": { lat: 34.8021, lng: 38.9968 },
  "Palestine": { lat: 31.9522, lng: 35.2332 },
  "Yemen": { lat: 15.5527, lng: 48.5164 },
  "Turkey": { lat: 38.9637, lng: 35.2433 },
  "United States": { lat: 37.0902, lng: -95.7129 },
  "USA": { lat: 37.0902, lng: -95.7129 },
  "United Kingdom": { lat: 55.3781, lng: -3.4360 },
  "UK": { lat: 55.3781, lng: -3.4360 },
  "Canada": { lat: 56.1304, lng: -106.3468 },
  "Germany": { lat: 51.1657, lng: 10.4515 },
  "France": { lat: 46.2276, lng: 2.2137 },
  "Italy": { lat: 41.8719, lng: 12.5674 },
  "Spain": { lat: 40.4637, lng: -3.7492 },
  "India": { lat: 20.5937, lng: 78.9629 },
  "Pakistan": { lat: 30.3753, lng: 69.3451 },
  "Bangladesh": { lat: 23.6850, lng: 90.3563 },
  "Philippines": { lat: 12.8797, lng: 121.7740 },
  "Indonesia": { lat: -0.7893, lng: 113.9213 },
  "Australia": { lat: -25.2744, lng: 133.7751 },

  // International Major Cities
  "New York": { lat: 40.7128, lng: -74.0060 },
  "London": { lat: 51.5074, lng: -0.1278 },
  "Dubai": { lat: 25.2048, lng: 55.2708 },
  "Cairo": { lat: 30.0444, lng: 31.2357 },
  "Paris": { lat: 48.8566, lng: 2.3522 },
  "Berlin": { lat: 52.5200, lng: 13.4050 },
  "Tokyo": { lat: 35.6762, lng: 139.6503 },
  "Sydney": { lat: -33.8688, lng: 151.2093 },
  "Toronto": { lat: 43.6510, lng: -79.3470 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  "Istanbul": { lat: 41.0082, lng: 28.9784 },
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
};

const MarkersMap: React.FC<MarkersMapProps> = ({ locations = [] }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // Filter and map locations to coordinates
  const mappedLocations = locations
    .filter(loc => loc.locationName) // Ensure name exists
    .map(loc => {
      // Direct match
      if (cityCoordinates[loc.locationName!]) {
        return {
          ...loc,
          position: cityCoordinates[loc.locationName!]
        };
      }
      // Case-insensitive match or contains match
      const locationNameLower = loc.locationName!.toLowerCase();
      // Try to find a key that is part of the location name or vice versa
      const matchedKey = Object.keys(cityCoordinates).find(key =>
        locationNameLower === key.toLowerCase() ||
        locationNameLower.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(locationNameLower)
      );

      if (matchedKey) {
        return {
          ...loc,
          position: cityCoordinates[matchedKey]
        };
      }
      return null;
    })
    .filter(loc => loc !== null) as (LocationData & { position: google.maps.LatLngLiteral })[];

  const unmappedLocations = locations.filter(loc => {
    if (!loc.locationName) return true;
    // Check if it was mapped
    const locationNameLower = loc.locationName.toLowerCase();
    const matchedKey = Object.keys(cityCoordinates).find(key =>
      locationNameLower === key.toLowerCase() ||
      locationNameLower.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(locationNameLower)
    );
    return !matchedKey;
  });

  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const handleMouseOver = (markerId: string) => {
    setActiveMarker(markerId);
  };

  const handleMouseOut = () => {
    setActiveMarker(null);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md h-full">
      <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
        <div className="trezo-card-title">
          <h5 className="!mb-0">Customer Interaction Map</h5>
        </div>
      </div>
      <div className="trezo-card-content">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={2}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {mappedLocations.map((loc, index) => (
            <Marker
              key={`${loc.locationId}-${index}`}
              position={loc.position}
              title={`${loc.locationName}: ${loc.clicks} Clicks`}
            />
          ))}
        </GoogleMap>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Displaying {mappedLocations.length} locations with coordinates.</p>

          {mappedLocations.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto custom-scrollbar">
              <ul className="list-disc list-inside">
                {mappedLocations.map((loc, index) => (
                  <li key={`${loc.locationId}-${index}`}>
                    <span className="font-semibold">{loc.locationName}</span>: {loc.clicks} Clicks, {loc.impressions} Impr.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {unmappedLocations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Other Locations (No coordinates found):</p>
              <ul className="list-disc list-inside text-xs text-gray-500">
                {unmappedLocations.slice(0, 5).map((loc, index) => (
                  <li key={`${loc.locationId}-${index}`}>
                    {loc.locationName}: {loc.clicks} Clicks
                  </li>
                ))}
                {unmappedLocations.length > 5 && <li>...and {unmappedLocations.length - 5} others</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkersMap;
