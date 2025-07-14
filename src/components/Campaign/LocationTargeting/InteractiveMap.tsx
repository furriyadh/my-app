'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LocationData } from '../../../lib/types/campaign';
import { MapPin, Layers, ZoomIn, ZoomOut, RotateCcw, Settings } from 'lucide-react';

interface InteractiveMapProps {
  selectedLocation: LocationData | null;
  selectedLocations: LocationData[];
  onLocationSelect?: (coordinates: [number, number]) => void;
  apiKey: string;
  className?: string;
}

interface MapMarker {
  marker: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
  location: LocationData;
  circle?: google.maps.Circle;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedLocation,
  selectedLocations,
  onLocationSelect,
  apiKey,
  className = "h-96"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentMapType, setCurrentMapType] = useState<google.maps.MapTypeId>(google.maps.MapTypeId.ROADMAP);
  const [showControls, setShowControls] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        initializeMap();
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          setIsMapLoaded(true);
          initializeMap();
        });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=en&region=SA`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
        initializeMap();
        setMapError(null);
      };
      script.onerror = () => {
        setMapError('Failed to load Google Maps');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [apiKey]);

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || !window.google.maps) return;

    try {
      const defaultCenter = selectedLocation 
        ? { lat: selectedLocation.coordinates[0], lng: selectedLocation.coordinates[1] }
        : { lat: 24.7136, lng: 46.6753 }; // Riyadh, Saudi Arabia

      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: selectedLocation ? 12 : 6,
        mapTypeId: currentMapType,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add click listener for adding custom locations
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng && onLocationSelect) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          onLocationSelect([lat, lng]);
        }
      });

      mapInstanceRef.current = map;
      setMapError(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }
  }, [selectedLocation, currentMapType, onLocationSelect]);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(({ marker, infoWindow, circle }) => {
      marker.setMap(null);
      infoWindow.close();
      if (circle) circle.setMap(null);
    });
    markersRef.current = [];
  }, []);

  // Create marker for location
  const createMarker = useCallback((location: LocationData, index: number) => {
    if (!mapInstanceRef.current || !window.google) return null;

    const position = {
      lat: location.coordinates[0],
      lng: location.coordinates[1]
    };

    // Create marker with custom color
    const markerColor = `hsl(${index * 137.5}, 70%, 50%)`;
    const marker = new window.google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title: location.name,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: markerColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      animation: window.google.maps.Animation.DROP,
    });

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-3 max-w-xs">
          <div class="font-semibold text-gray-800 mb-2">${location.name}</div>
          <div class="space-y-1 text-sm text-gray-600">
            <div><strong>Region:</strong> ${location.region}</div>
            <div><strong>Country:</strong> ${location.country}</div>
            <div><strong>Coordinates:</strong> ${location.coordinates[0].toFixed(4)}, ${location.coordinates[1].toFixed(4)}</div>
            <div><strong>Timezone:</strong> ${location.timezone}</div>
            <div><strong>UTC Offset:</strong> UTC${location.utcOffset >= 0 ? '+' : ''}${location.utcOffset}</div>
          </div>
        </div>
      `
    });

    // Add click listener to marker
    marker.addListener('click', () => {
      // Close all other info windows
      markersRef.current.forEach(({ infoWindow: iw }) => iw.close());
      infoWindow.open(mapInstanceRef.current, marker);
    });

    // Create radius circle (default 10km)
    const circle = new window.google.maps.Circle({
      strokeColor: markerColor,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: markerColor,
      fillOpacity: 0.15,
      map: mapInstanceRef.current,
      center: position,
      radius: 10000, // 10km in meters
    });

    return { marker, infoWindow, location, circle };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    clearMarkers();

    if (selectedLocations.length > 0) {
      selectedLocations.forEach((location, index) => {
        const markerData = createMarker(location, index);
        if (markerData) {
          markersRef.current.push(markerData);
        }
      });

      // Fit map to show all markers
      if (selectedLocations.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        selectedLocations.forEach(location => {
          bounds.extend({
            lat: location.coordinates[0],
            lng: location.coordinates[1]
          });
        });
        mapInstanceRef.current.fitBounds(bounds);
        
        // Ensure minimum zoom level
        const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
          if (mapInstanceRef.current!.getZoom()! > 15) {
            mapInstanceRef.current!.setZoom(15);
          }
          window.google.maps.event.removeListener(listener);
        });
      } else if (selectedLocations.length === 1) {
        mapInstanceRef.current.setCenter({
          lat: selectedLocations[0].coordinates[0],
          lng: selectedLocations[0].coordinates[1]
        });
        mapInstanceRef.current.setZoom(12);
      }
    }
  }, [selectedLocations, isMapLoaded, createMarker, clearMarkers]);

  // Map control functions
  const zoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 10;
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 10;
      mapInstanceRef.current.setZoom(Math.max(currentZoom - 1, 1));
    }
  }, []);

  const resetView = useCallback(() => {
    if (mapInstanceRef.current) {
      if (selectedLocations.length > 0) {
        if (selectedLocations.length === 1) {
          mapInstanceRef.current.setCenter({
            lat: selectedLocations[0].coordinates[0],
            lng: selectedLocations[0].coordinates[1]
          });
          mapInstanceRef.current.setZoom(12);
        } else {
          const bounds = new window.google.maps.LatLngBounds();
          selectedLocations.forEach(location => {
            bounds.extend({
              lat: location.coordinates[0],
              lng: location.coordinates[1]
            });
          });
          mapInstanceRef.current.fitBounds(bounds);
        }
      } else {
        mapInstanceRef.current.setCenter({ lat: 24.7136, lng: 46.6753 });
        mapInstanceRef.current.setZoom(6);
      }
    }
  }, [selectedLocations]);

  const changeMapType = useCallback((mapType: google.maps.MapTypeId) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapType);
      setCurrentMapType(mapType);
    }
  }, []);

  // Map type options
  const mapTypes = [
    { id: google.maps?.MapTypeId.ROADMAP, name: 'Roadmap', icon: '🗺️' },
    { id: google.maps?.MapTypeId.SATELLITE, name: 'Satellite', icon: '🛰️' },
    { id: google.maps?.MapTypeId.HYBRID, name: 'Hybrid', icon: '🌍' },
    { id: google.maps?.MapTypeId.TERRAIN, name: 'Terrain', icon: '⛰️' },
  ];

  if (mapError) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <div className="font-medium">Map Error</div>
          <div className="text-sm mt-1">{mapError}</div>
        </div>
      </div>
    );
  }

  if (!isMapLoaded) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="font-medium">Loading Map...</div>
          <div className="text-sm mt-1">Please wait while we load the interactive map</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} rounded-lg overflow-hidden border border-gray-200`}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        {/* Settings Toggle */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors"
          title="Map Settings"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>

        {/* Controls Panel */}
        {showControls && (
          <div className="bg-white shadow-lg rounded-lg p-3 space-y-3 min-w-[200px]">
            {/* Map Type Selector */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Map Type</div>
              <div className="grid grid-cols-2 gap-1">
                {mapTypes.map((type) => (
                  <button
                    key={type.name}
                    onClick={() => changeMapType(type.id)}
                    className={`p-2 text-xs rounded border transition-colors ${
                      currentMapType === type.id
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div>{type.icon}</div>
                    <div className="mt-1">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Controls */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Zoom</div>
              <div className="flex space-x-1">
                <button
                  onClick={zoomIn}
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 mx-auto text-gray-600" />
                </button>
                <button
                  onClick={zoomOut}
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 mx-auto text-gray-600" />
                </button>
                <button
                  onClick={resetView}
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4 mx-auto text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Counter */}
      {selectedLocations.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-700">
              {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Click to Add Hint */}
      {onLocationSelect && selectedLocations.length === 0 && (
        <div className="absolute bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 max-w-xs">
          <div className="text-sm text-blue-700">
            💡 Click anywhere on the map to add a custom location
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;