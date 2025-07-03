'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LocationData } from '@/lib/types/campaign';

interface InteractiveMapProps {
  selectedLocation?: LocationData | null;
  onLocationSelect: (coordinates: [number, number]) => void;
  apiKey: string;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedLocation,
  onLocationSelect,
  apiKey,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // تحميل Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  // إنشاء الخريطة
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const defaultCenter = selectedLocation?.coordinates 
      ? { lat: selectedLocation.coordinates[0], lng: selectedLocation.coordinates[1] }
      : { lat: 24.7136, lng: 46.6753 }; // الرياض كموقع افتراضي

    const newMap = new google.maps.Map(mapRef.current, {
      zoom: 10,
      center: defaultCenter,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // إضافة مستمع للنقر على الخريطة
    newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        onLocationSelect([lat, lng]);
      }
    });

    setMap(newMap);
  }, [isLoaded, selectedLocation, onLocationSelect, map]);

  // تحديث العلامة عند تغيير الموقع المختار
  useEffect(() => {
    if (!map || !selectedLocation) return;

    // إزالة العلامة السابقة
    if (marker) {
      marker.setMap(null);
    }

    // إضافة علامة جديدة
    const newMarker = new google.maps.Marker({
      position: {
        lat: selectedLocation.coordinates[0],
        lng: selectedLocation.coordinates[1]
      },
      map: map,
      title: selectedLocation.name,
      animation: google.maps.Animation.DROP,
    });

    // تحريك الخريطة للموقع الجديد
    map.panTo({
      lat: selectedLocation.coordinates[0],
      lng: selectedLocation.coordinates[1]
    });

    setMarker(newMarker);
  }, [map, selectedLocation, marker]);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-gray-600 text-sm">جاري تحميل الخريطة...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full rounded-lg ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};

