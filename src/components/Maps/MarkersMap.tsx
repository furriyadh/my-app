"use client";

import React, { useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 0,
  lng: 0,
};

// Sample data for markers (replace with actual data from Google Ads API later)
const markers = [
  {
    id: 1,
    name: "Riyadh",
    position: { lat: 24.7136, lng: 46.6753 },
    clicks: 150,
    calls: 30,
  },
  {
    id: 2,
    name: "Jeddah",
    position: { lat: 21.4858, lng: 39.1925 },
    clicks: 120,
    calls: 25,
  },
  {
    id: 3,
    name: "Dammam",
    position: { lat: 26.3927, lng: 49.9777 },
    clicks: 80,
    calls: 15,
  },
  {
    id: 4,
    name: "New York",
    position: { lat: 40.7128, lng: -74.0060 },
    clicks: 200,
    calls: 50,
  },
  {
    id: 5,
    name: "London",
    position: { lat: 51.5074, lng: -0.1278 },
    clicks: 180,
    calls: 40,
  },
];

const MarkersMap: React.FC = () => {
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

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
      <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
        <div className="trezo-card-title">
          <h5 className="!mb-0">Customer Interaction Map</h5>
        </div>
      </div>
      <div className="trezo-card-content">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={2} // Zoom out to show the world
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              title={marker.name}
              // You can add more info here, e.g., an InfoWindow
            />
          ))}
        </GoogleMap>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>This map displays locations where users clicked on ads or called your phone number.</p>
          <ul className="list-disc list-inside mt-2">
            {markers.map((marker) => (
              <li key={marker.id}>
                {marker.name}: {marker.clicks} Clicks, {marker.calls} Calls
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarkersMap;
