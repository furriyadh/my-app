"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Clock, Globe, Plus, X, Target, Users, TrendingUp } from 'lucide-react';

// Types
interface Location {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  timezone: string;
  utcOffset: number;
  population?: number;
  type: 'country' | 'region' | 'city';
}

interface SearchResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

const LocationTargetingPage: React.FC = () => {
  // State Management
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load Google Maps API
  const loadGoogleMapsAPI = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
        return;
      }

      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        reject(new Error('Google Maps API key not found'));
        return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      
      document.head.appendChild(script);
    });
  }, []);

  // Initialize Map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 24.7136, lng: 46.6753 }, // Riyadh, Saudi Arabia
      zoom: 6,
      styles: [
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ color: "#f8f9fa" }]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#e3f2fd" }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    setMap(mapInstance);

    // Initialize services
    autocompleteService.current = new google.maps.places.AutocompleteService();
    placesService.current = new google.maps.places.PlacesService(mapInstance);

    setIsLoading(false);
  }, []);

  // Search locations with debouncing
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim() || !autocompleteService.current) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          types: ['(regions)']
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchResults(predictions);
          } else {
            setSearchResults([]);
          }
          setIsSearching(false);
        }
      );
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchLocations]);

  // Add location
  const addLocation = useCallback(async (result: SearchResult) => {
    if (!placesService.current) return;

    try {
      placesService.current.getDetails(
        {
          placeId: result.place_id,
          fields: ['name', 'geometry', 'formatted_address', 'types', 'utc_offset_minutes']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const location: Location = {
              id: result.place_id,
              name: place.name || result.structured_formatting.main_text,
              country: result.structured_formatting.secondary_text || '',
              coordinates: [
                place.geometry?.location?.lat() || 0,
                place.geometry?.location?.lng() || 0
              ],
              timezone: 'UTC',
              utcOffset: (place.utc_offset_minutes || 0) / 60,
              type: result.types.includes('country') ? 'country' : 
                    result.types.includes('administrative_area_level_1') ? 'region' : 'city'
            };

            setSelectedLocations(prev => {
              const exists = prev.find(loc => loc.id === location.id);
              if (exists) return prev;
              return [...prev, location];
            });

            // Add marker to map
            if (map && place.geometry?.location) {
              const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: location.name,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3b82f6"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(24, 24),
                  anchor: new google.maps.Point(12, 24)
                }
              });

              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="padding: 8px;">
                    <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${location.name}</h3>
                    <p style="margin: 0; font-size: 12px; color: #666;">${location.country}</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">UTC ${location.utcOffset >= 0 ? '+' : ''}${location.utcOffset}</p>
                  </div>
                `
              });

              marker.addListener('click', () => {
                infoWindow.open(map, marker);
              });

              setMarkers(prev => [...prev, marker]);

              // Adjust map view
              if (selectedLocations.length === 0) {
                map.setCenter(place.geometry.location);
                map.setZoom(8);
              }
            }

            setSearchQuery('');
            setSearchResults([]);
          }
        }
      );
    } catch (error) {
      console.error('Error adding location:', error);
    }
  }, [map, placesService, selectedLocations.length]);

  // Remove location
  const removeLocation = useCallback((locationId: string) => {
    setSelectedLocations(prev => prev.filter(loc => loc.id !== locationId));
    
    // Remove corresponding marker
    setMarkers(prev => {
      const locationIndex = selectedLocations.findIndex(loc => loc.id === locationId);
      if (locationIndex !== -1 && prev[locationIndex]) {
        prev[locationIndex].setMap(null);
        return prev.filter((_, index) => index !== locationIndex);
      }
      return prev;
    });
  }, [selectedLocations]);

  // Initialize everything
  useEffect(() => {
    const init = async () => {
      try {
        await loadGoogleMapsAPI();
        initializeMap();
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
        setIsLoading(false);
      }
    };

    init();
  }, [loadGoogleMapsAPI, initializeMap]);

  // Calculate estimated reach
  const estimatedReach = selectedLocations.reduce((total, location) => {
    const baseReach = location.type === 'country' ? 1000000 : 
                     location.type === 'region' ? 500000 : 100000;
    return total + baseReach;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Campaign Setup</h1>
            <span className="text-sm text-gray-500">Step 3 of 5</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < 3 ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Campaign Type</span>
            <span>Budget & Bidding</span>
            <span className="font-medium text-blue-600">Geography</span>
            <span>Schedule</span>
            <span>Review</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Location Search & Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Geographic Targeting</h2>
              <p className="text-gray-600">Choose where you want your ads to be shown</p>
            </div>

            {/* Search Box */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search countries, regions, or cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => addLocation(result)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-2"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {result.structured_formatting.main_text}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {result.structured_formatting.secondary_text}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="mt-3 text-center py-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}
            </div>

            {/* Selected Locations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Selected Locations ({selectedLocations.length})
              </h3>
              
              {selectedLocations.length === 0 ? (
                <p className="text-gray-500 text-sm">No locations selected yet</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{location.name}</div>
                          <div className="text-xs text-gray-500 truncate">{location.country}</div>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          UTC{location.utcOffset >= 0 ? '+' : ''}{location.utcOffset}
                        </div>
                      </div>
                      <button
                        onClick={() => removeLocation(location.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Targeting Statistics
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Locations</span>
                  <span className="font-medium">{selectedLocations.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estimated Reach</span>
                  <span className="font-medium">
                    {estimatedReach > 1000000 
                      ? `${(estimatedReach / 1000000).toFixed(1)}M` 
                      : `${(estimatedReach / 1000).toFixed(0)}K`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Time Zones</span>
                  <span className="font-medium">
                    {new Set(selectedLocations.map(loc => loc.utcOffset)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Interactive Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Interactive Map
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Visual representation of your selected locations
                </p>
              </div>
              
              <div className="relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
                
                <div
                  ref={mapRef}
                  className="w-full h-96"
                  style={{ minHeight: '400px' }}
                />
              </div>
            </div>

            {/* Time Zone Display */}
            {selectedLocations.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Time Zone Overview
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from(new Set(selectedLocations.map(loc => loc.utcOffset)))
                    .sort((a, b) => a - b)
                    .map((offset) => {
                      const locationsInZone = selectedLocations.filter(loc => loc.utcOffset === offset);
                      const currentTime = new Date();
                      currentTime.setHours(currentTime.getHours() + offset);
                      
                      return (
                        <div key={offset} className="p-3 bg-gray-50 rounded-md">
                          <div className="font-medium text-gray-900">
                            UTC{offset >= 0 ? '+' : ''}{offset}
                          </div>
                          <div className="text-sm text-gray-600">
                            {currentTime.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {locationsInZone.length} location{locationsInZone.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
            Back
          </button>
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={selectedLocations.length === 0}
          >
            Continue to Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationTargetingPage;

