import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Globe, Building, Clock, Star, X, Loader2 } from 'lucide-react';
import { LocationData } from '../../../lib/types/campaign';

interface LocationSearchProps {
  onSearch: (query: string) => Promise<void>;
  results: LocationData[];
  onSelect: (location: LocationData) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

interface PlaceResult {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  opening_hours?: {
    open_now: boolean;
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

interface AutocompleteService {
  getPlacePredictions: (
    request: {
      input: string;
      types?: string[];
      componentRestrictions?: { country?: string | string[] };
    },
    callback: (predictions: any[] | null, status: string) => void
  ) => void;
}

interface PlacesService {
  getDetails: (
    request: { placeId: string; fields: string[] },
    callback: (place: PlaceResult | null, status: string) => void
  ) => void;
}

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => AutocompleteService;
          PlacesService: new (map: any) => PlacesService;
          PlacesServiceStatus: {
            OK: string;
          };
        };
        Map: new (element: HTMLElement, options: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        Geocoder: new () => {
          geocode: (
            request: { address?: string; location?: any },
            callback: (results: any[] | null, status: string) => void
          ) => void;
        };
        GeocoderStatus: {
          OK: string;
        };
      };
    };
  }
}

const getLocationTypeIcon = (types: string[]) => {
  if (types.includes('country') || types.includes('administrative_area_level_1')) {
    return <Globe className="w-4 h-4 text-blue-500" />;
  }
  if (types.includes('locality') || types.includes('administrative_area_level_2')) {
    return <MapPin className="w-4 h-4 text-green-500" />;
  }
  if (types.includes('establishment') || types.includes('point_of_interest')) {
    return <Building className="w-4 h-4 text-purple-500" />;
  }
  return <MapPin className="w-4 h-4 text-gray-500" />;
};

const getLocationTypeBadge = (types: string[]) => {
  if (types.includes('country')) return 'Country';
  if (types.includes('administrative_area_level_1')) return 'State/Province';
  if (types.includes('locality')) return 'City';
  if (types.includes('administrative_area_level_2')) return 'County';
  if (types.includes('establishment')) return 'Business';
  if (types.includes('point_of_interest')) return 'POI';
  return 'Location';
};

const parseCoordinates = (input: string): [number, number] | null => {
  // Remove any extra whitespace and normalize
  const cleaned = input.trim().replace(/\s+/g, ' ');
  
  // Try different coordinate formats
  const patterns = [
    // Decimal degrees: "40.7128, -74.0060" or "40.7128,-74.0060"
    /^(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)$/,
    // Degrees with N/S/E/W: "40.7128N, 74.0060W"
    /^(\d+\.?\d*)[NS],?\s*(\d+\.?\d*)[EW]$/i,
    // DMS format: "40°42'46"N 74°00'22"W"
    /^(\d+)°(\d+)'(\d+)"?([NS]),?\s*(\d+)°(\d+)'(\d+)"?([EW])$/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      if (pattern === patterns[0]) {
        // Decimal degrees
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return [lat, lng];
        }
      } else if (pattern === patterns[1]) {
        // Degrees with N/S/E/W
        let lat = parseFloat(match[1]);
        let lng = parseFloat(match[2]);
        if (cleaned.includes('S')) lat = -lat;
        if (cleaned.includes('W')) lng = -lng;
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return [lat, lng];
        }
      } else if (pattern === patterns[2]) {
        // DMS format
        const latDeg = parseInt(match[1]);
        const latMin = parseInt(match[2]);
        const latSec = parseInt(match[3]);
        const latDir = match[4].toUpperCase();
        const lngDeg = parseInt(match[5]);
        const lngMin = parseInt(match[6]);
        const lngSec = parseInt(match[7]);
        const lngDir = match[8].toUpperCase();
        
        let lat = latDeg + latMin / 60 + latSec / 3600;
        let lng = lngDeg + lngMin / 60 + lngSec / 3600;
        
        if (latDir === 'S') lat = -lat;
        if (lngDir === 'W') lng = -lng;
        
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return [lat, lng];
        }
      }
    }
  }
  
  return null;
};

const isPostalCode = (input: string): boolean => {
  const postalPatterns = [
    /^\d{5}(-\d{4})?$/, // US ZIP
    /^[A-Z]\d[A-Z] \d[A-Z]\d$/, // Canada
    /^\d{4,5}$/, // Germany, many others
    /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/, // UK
    /^\d{3}-\d{4}$/, // Japan
  ];
  
  return postalPatterns.some(pattern => pattern.test(input.trim().toUpperCase()));
};

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onSearch,
  results,
  onSelect,
  isLoading = false,
  placeholder = "Search for cities, countries, or coordinates...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [googleResults, setGoogleResults] = useState<any[]>([]);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<AutocompleteService | null>(null);
  const placesService = useRef<PlacesService | null>(null);
  const geocoder = useRef<any>(null);

  // Initialize Google Maps services
  useEffect(() => {
    const initializeGoogleServices = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        try {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
          
          // Create a dummy map for PlacesService
          const mapDiv = document.createElement('div');
          const map = new window.google.maps.Map(mapDiv, {});
          placesService.current = new window.google.maps.places.PlacesService(map);
          
          geocoder.current = new window.google.maps.Geocoder();
        } catch (err) {
          console.error('Failed to initialize Google Maps services:', err);
        }
      }
    };

    // Check if Google Maps is already loaded
    if (window.google) {
      initializeGoogleServices();
    } else {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAe57f_PT4dsrCcwK_UPN7nY4SERmnH254C&libraries=places&language=en`;
      script.async = true;
      script.onload = initializeGoogleServices;
      script.onerror = () => {
        setError('Failed to load Google Maps API');
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchQuery: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleGoogleSearch(searchQuery);
        }, 300);
      };
    })(),
    []
  );

  // Handle Google Places search
  const handleGoogleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !autocompleteService.current) {
      setGoogleResults([]);
      return;
    }

    setIsGoogleLoading(true);
    setError(null);

    try {
      // Check if input looks like coordinates
      const coordinates = parseCoordinates(searchQuery);
      if (coordinates) {
        await handleCoordinateSearch(coordinates);
        return;
      }

      // Check if input looks like a postal code
      if (isPostalCode(searchQuery)) {
        await handlePostalCodeSearch(searchQuery);
        return;
      }

      // Regular place search
      autocompleteService.current.getPlacePredictions(
        {
          input: searchQuery,
          types: ['geocode', 'establishment'],
        },
        (predictions, status) => {
          setIsGoogleLoading(false);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setGoogleResults(predictions.slice(0, 8));
            setShowResults(true);
          } else {
            setGoogleResults([]);
            if (status !== 'ZERO_RESULTS') {
              setError('Search service temporarily unavailable');
            }
          }
        }
      );
    } catch (err) {
      setIsGoogleLoading(false);
      setError('Search failed. Please try again.');
      console.error('Google search error:', err);
    }
  }, []);

  // Handle coordinate search with reverse geocoding
  const handleCoordinateSearch = useCallback(async (coordinates: [number, number]) => {
    if (!geocoder.current) return;

    try {
      const latLng = new window.google.maps.LatLng(coordinates[0], coordinates[1]);
      
      geocoder.current.geocode(
        { location: latLng },
        (results: any[], status: string) => {
          setIsGoogleLoading(false);
          
          if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const result = results[0];
            const locationData: LocationData = {
              name: result.formatted_address.split(',')[0] || `Location (${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)})`,
              coordinates: coordinates,
              timezone: 'Asia/Riyadh', // Default - could be enhanced with timezone API
              utcOffset: 3,
              country: result.address_components?.find((comp: any) => 
                comp.types.includes('country'))?.long_name || 'Unknown',
              region: result.address_components?.find((comp: any) => 
                comp.types.includes('administrative_area_level_1'))?.long_name || 'region'
            };
            
            onSelect(locationData);
            setQuery('');
            setShowResults(false);
          } else {
            setError('Could not find location for these coordinates');
          }
        }
      );
    } catch (err) {
      setIsGoogleLoading(false);
      setError('Coordinate search failed');
      console.error('Coordinate search error:', err);
    }
  }, [onSelect]);

  // Handle postal code search
  const handlePostalCodeSearch = useCallback(async (postalCode: string) => {
    if (!geocoder.current) return;

    try {
      geocoder.current.geocode(
        { address: postalCode },
        (results: any[], status: string) => {
          setIsGoogleLoading(false);
          
          if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const mockResults = results.slice(0, 3).map((result: any) => ({
              place_id: result.place_id,
              description: result.formatted_address,
              structured_formatting: {
                main_text: result.address_components?.[0]?.long_name || postalCode,
                secondary_text: result.formatted_address
              },
              types: ['postal_code']
            }));
            
            setGoogleResults(mockResults);
            setShowResults(true);
          } else {
            setError('Postal code not found');
          }
        }
      );
    } catch (err) {
      setIsGoogleLoading(false);
      setError('Postal code search failed');
      console.error('Postal code search error:', err);
    }
  }, []);

  // Handle place selection from Google results
  const handleGooglePlaceSelect = useCallback((prediction: any) => {
    if (!placesService.current) return;

    setIsGoogleLoading(true);
    
    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'types', 'address_components', 'rating', 'user_ratings_total', 'business_status', 'opening_hours']
      },
      (place: PlaceResult | null, status: string) => {
        setIsGoogleLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const lat = typeof place.geometry.location.lat === 'function' 
            ? place.geometry.location.lat() 
            : place.geometry.location.lat;
          const lng = typeof place.geometry.location.lng === 'function' 
            ? place.geometry.location.lng() 
            : place.geometry.location.lng;

          const locationData: LocationData = {
            name: place.name || place.formatted_address.split(',')[0],
            coordinates: [lat, lng],
            timezone: 'Asia/Riyadh', // Default - could be enhanced
            utcOffset: 3,
            country: place.address_components?.find(comp => 
              comp.types.includes('country'))?.long_name || 'Unknown',
            region: place.address_components?.find(comp => 
              comp.types.includes('administrative_area_level_1'))?.long_name || 'region'
          };
          
          onSelect(locationData);
          setQuery('');
          setShowResults(false);
          setGoogleResults([]);
        } else {
          setError('Could not get place details');
        }
      }
    );
  }, [onSelect]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setError(null);
    
    if (value.trim()) {
      debouncedSearch(value);
      onSearch(value); // Also trigger the original search
    } else {
      setGoogleResults([]);
      setShowResults(false);
    }
  }, [debouncedSearch, onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalResults = googleResults.length + results.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalResults);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev <= 0 ? totalResults - 1 : prev - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (selectedIndex < googleResults.length) {
          handleGooglePlaceSelect(googleResults[selectedIndex]);
        } else {
          onSelect(results[selectedIndex - googleResults.length]);
          setQuery('');
          setShowResults(false);
        }
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  }, [googleResults, results, selectedIndex, handleGooglePlaceSelect, onSelect]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setGoogleResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    setError(null);
    inputRef.current?.focus();
  }, []);

  const totalResults = googleResults.length + results.length;
  const hasResults = totalResults > 0;
  const isSearching = isLoading || isGoogleLoading;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => hasResults && setShowResults(true)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-colors duration-200"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Search Results */}
      {showResults && hasResults && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Google Results */}
          {googleResults.map((prediction, index) => (
            <button
              key={prediction.place_id}
              onClick={() => handleGooglePlaceSelect(prediction)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-150 ${
                selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getLocationTypeIcon(prediction.types || [])}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {prediction.structured_formatting?.main_text || prediction.description}
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {getLocationTypeBadge(prediction.types || [])}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {prediction.structured_formatting?.secondary_text || prediction.description}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Local Results */}
          {results.map((location, index) => (
            <button
              key={`local-${index}`}
              onClick={() => {
                onSelect(location);
                setQuery('');
                setShowResults(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-150 ${
                selectedIndex === googleResults.length + index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <MapPin className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {location.name}
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      Local
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {location.region} • {location.country}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      UTC{location.utcOffset >= 0 ? '+' : ''}{location.utcOffset}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* No Results */}
          {!hasResults && query && !isSearching && (
            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No locations found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for a city, country, or coordinates</p>
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {query && !hasResults && !isSearching && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <div className="font-medium mb-1">Search Tips:</div>
            <ul className="text-xs space-y-1">
              <li>• Try city names: "New York", "London", "Tokyo"</li>
              <li>• Use coordinates: "40.7128, -74.0060"</li>
              <li>• Search postal codes: "10001", "SW1A 1AA"</li>
              <li>• Include country: "Paris, France"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;

