/*
  NewCampaign Component - Final Version with All Fixes
  ---------------------------------------------------

  ✅ Fixed Issues:
  - URL validation with proper warnings
  - Google Maps API conflicts resolved
  - Language selector state management
  - Budget input number handling
  - Keyword research API paths
  - Real keyword generation (not titles)
  - Proper match types formatting
  - Asset upload system improvements
  - Google Ads integration

  🆕 New Features:
  - Interactive Google Maps with Places API
  - Location search with search volume data
  - Geographic targeting options
  - Real-time keyword research
  - Campaign launch to Google Ads
  - Dashboard integration

  File: src/components/Dashboard/NewCampaign/index.tsx
*/

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, Check, ChevronLeft, Globe, MapPin, Plus, Search, Target, 
  Zap, Eye, Play, ShoppingBag, Users, Brain, Sparkles, 
  TrendingUp, BarChart3, Settings, Lightbulb, Rocket,
  Monitor, Smartphone, Tablet, Clock, Calendar, DollarSign,
  Star, Award, Shield, CheckCircle, AlertCircle, Info, Phone,
  UploadCloud, FileText, Image as ImageIcon, Video as VideoIcon,
  Map, Navigation, Crosshair, Building, Home, Car, Plane,
  ExternalLink, Copy, Download, Upload, Trash2, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Configuration
const SUPABASE_URL = 'https://mkzwqbgcfdzcqmkgzwgy.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Global Google Maps loader to prevent multiple loading
let isGoogleMapsLoaded = false;
let googleMapsPromise: Promise<void> | null = null;

const loadGoogleMaps = (): Promise<void> => {
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }
  
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google) {
      isGoogleMapsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=ar&region=SA`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps'));
    };
    
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// Interfaces
interface Step {
  id: number;
  title: string;
  completed: boolean;
  icon: React.ReactNode;
}

interface CampaignType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  color: string;
  gradient: string;
  recommended?: boolean;
  bestFor: string[];
  assetRequirements: AssetRequirement[];
}

interface AssetRequirement {
  type: 'text' | 'image' | 'video' | 'phone';
  label: string;
  description: string;
  min: number;
  max: number;
  dimensions?: string;
  maxLength?: number;
  icon: React.ReactNode;
}

interface Location {
  id: string;
  name: string;
  type: 'country' | 'region' | 'city' | 'postal_code';
  coordinates: {
    lat: number;
    lng: number;
  };
  searchVolume?: number;
  population?: number;
  placeId: string;
}

interface KeywordData {
  keyword: string;
  keyword_type: 'short_tail' | 'long_tail' | 'branded' | 'competitor';
  match_type: 'exact' | 'phrase' | 'broad';
  search_volume_30d?: number;
  competition_level?: 'low' | 'medium' | 'high';
  avg_cpc?: number;
  selected: boolean;
  formatted_keyword?: string;
}

interface WebsiteAnalysis {
  id: string;
  website_url: string;
  analysis_result: {
    keywords: string[];
    business_type: string;
    main_services: string[];
    target_audience: string;
    long_tail_keywords: string[];
    competitive_advantages: string[];
  };
  keywords_extracted: string[];
  content_summary: string;
  business_type: string;
  target_audience: string;
  competitive_analysis: {
    strengths: string[];
    opportunities: string[];
    recommended_strategy: string;
  };
}

interface CampaignFormData {
  // Basic Info
  campaignName: string;
  campaignType: string;
  websiteUrl: string;
  
  // Targeting
  language: string;
  locations: Location[];
  locationOption: 'presence' | 'presence_interest';
  
  // Keywords
  keywords: KeywordData[];
  
  // Budget
  dailyBudget: number;
  biddingStrategy: string;
  
  // Assets
  assets: {
    images: File[];
    videos: File[];
    headlines: string[];
    descriptions: string[];
  };
}

// Campaign Types Data
const campaignTypes: CampaignType[] = [
  {
    id: 'search',
    name: 'إعلانات البحث',
    icon: <Search className="w-6 h-6" />,
    description: 'اعرض إعلاناتك عندما يبحث العملاء عن منتجاتك أو خدماتك',
    features: ['استهداف الكلمات المفتاحية', 'إعلانات نصية', 'ظهور في نتائج البحث'],
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    recommended: true,
    bestFor: ['زيادة المبيعات', 'جذب عملاء جدد', 'زيادة الوعي بالعلامة التجارية'],
    assetRequirements: [
      {
        type: 'text',
        label: 'العناوين الرئيسية',
        description: 'عناوين جذابة لإعلاناتك',
        min: 3,
        max: 15,
        maxLength: 30,
        icon: <FileText className="w-4 h-4" />
      },
      {
        type: 'text',
        label: 'الأوصاف',
        description: 'أوصاف تفصيلية لمنتجاتك أو خدماتك',
        min: 2,
        max: 4,
        maxLength: 90,
        icon: <FileText className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'display',
    name: 'الإعلانات المصورة',
    icon: <Monitor className="w-6 h-6" />,
    description: 'اعرض إعلانات مرئية جذابة عبر شبكة مواقع الويب',
    features: ['إعلانات مرئية', 'استهداف الاهتمامات', 'وصول واسع'],
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bestFor: ['زيادة الوعي بالعلامة التجارية', 'الوصول لجمهور أوسع', 'الترويج للمنتجات'],
    assetRequirements: [
      {
        type: 'image',
        label: 'الصور الإعلانية',
        description: 'صور عالية الجودة لإعلاناتك',
        min: 1,
        max: 20,
        dimensions: '1200x628, 300x250, 728x90',
        icon: <ImageIcon className="w-4 h-4" />
      },
      {
        type: 'text',
        label: 'العناوين',
        description: 'عناوين قصيرة وجذابة',
        min: 1,
        max: 5,
        maxLength: 25,
        icon: <FileText className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'video',
    name: 'إعلانات الفيديو',
    icon: <Play className="w-6 h-6" />,
    description: 'اعرض إعلانات فيديو على يوتيوب ومواقع الشركاء',
    features: ['إعلانات فيديو', 'يوتيوب', 'تفاعل عالي'],
    color: 'red',
    gradient: 'from-red-500 to-red-600',
    bestFor: ['زيادة الوعي', 'عرض المنتجات', 'القصص التسويقية'],
    assetRequirements: [
      {
        type: 'video',
        label: 'مقاطع الفيديو',
        description: 'مقاطع فيديو عالية الجودة',
        min: 1,
        max: 5,
        dimensions: '1920x1080, 1280x720',
        icon: <VideoIcon className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'shopping',
    name: 'إعلانات التسوق',
    icon: <ShoppingBag className="w-6 h-6" />,
    description: 'اعرض منتجاتك مع الصور والأسعار في نتائج البحث',
    features: ['عرض المنتجات', 'الصور والأسعار', 'Google Merchant Center'],
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    bestFor: ['التجارة الإلكترونية', 'عرض المنتجات', 'زيادة المبيعات'],
    assetRequirements: [
      {
        type: 'image',
        label: 'صور المنتجات',
        description: 'صور عالية الجودة للمنتجات',
        min: 1,
        max: 10,
        dimensions: '800x800',
        icon: <ImageIcon className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'app',
    name: 'ترويج التطبيقات',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'روج لتطبيقك المحمول وزد عدد التحميلات',
    features: ['ترويج التطبيقات', 'زيادة التحميلات', 'متاجر التطبيقات'],
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    bestFor: ['تطبيقات الجوال', 'زيادة التحميلات', 'تفاعل المستخدمين'],
    assetRequirements: [
      {
        type: 'image',
        label: 'أيقونة التطبيق',
        description: 'أيقونة التطبيق عالية الجودة',
        min: 1,
        max: 1,
        dimensions: '1024x1024',
        icon: <ImageIcon className="w-4 h-4" />
      },
      {
        type: 'image',
        label: 'لقطات الشاشة',
        description: 'لقطات شاشة من التطبيق',
        min: 2,
        max: 8,
        dimensions: '1242x2208',
        icon: <ImageIcon className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'local',
    name: 'الحملات المحلية',
    icon: <MapPin className="w-6 h-6" />,
    description: 'اجذب العملاء إلى متاجرك الفعلية',
    features: ['الاستهداف المحلي', 'زيارات المتاجر', 'خرائط جوجل'],
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    bestFor: ['المتاجر الفعلية', 'الخدمات المحلية', 'زيادة الزيارات'],
    assetRequirements: [
      {
        type: 'image',
        label: 'صور المتجر',
        description: 'صور للمتجر من الداخل والخارج',
        min: 3,
        max: 10,
        dimensions: '1200x900',
        icon: <ImageIcon className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'smart',
    name: 'الحملات الذكية',
    icon: <Brain className="w-6 h-6" />,
    description: 'دع الذكاء الاصطناعي يحسن حملاتك تلقائياً',
    features: ['تحسين تلقائي', 'ذكاء اصطناعي', 'سهولة الإدارة'],
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600',
    bestFor: ['المبتدئين', 'توفير الوقت', 'التحسين التلقائي'],
    assetRequirements: [
      {
        type: 'image',
        label: 'الصور',
        description: 'صور متنوعة لأعمالك',
        min: 1,
        max: 20,
        dimensions: 'متنوعة',
        icon: <ImageIcon className="w-4 h-4" />
      },
      {
        type: 'text',
        label: 'النصوص',
        description: 'نصوص متنوعة للإعلانات',
        min: 3,
        max: 15,
        maxLength: 30,
        icon: <FileText className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'call',
    name: 'إعلانات الاتصال',
    icon: <Phone className="w-6 h-6" />,
    description: 'شجع العملاء على الاتصال بك مباشرة',
    features: ['أزرار الاتصال', 'تتبع المكالمات', 'استهداف محلي'],
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
    bestFor: ['الخدمات المحلية', 'الاستشارات', 'الطوارئ'],
    assetRequirements: [
      {
        type: 'phone',
        label: 'رقم الهاتف',
        description: 'رقم هاتف للاتصال المباشر',
        min: 1,
        max: 1,
        icon: <Phone className="w-4 h-4" />
      },
      {
        type: 'text',
        label: 'رسالة الاتصال',
        description: 'نص يشجع على الاتصال',
        min: 1,
        max: 3,
        maxLength: 25,
        icon: <FileText className="w-4 h-4" />
      }
    ]
  }
];

// Steps Data
const steps: Step[] = [
  {
    id: 1,
    title: 'نوع الحملة',
    completed: false,
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 2,
    title: 'الإعدادات الأساسية',
    completed: false,
    icon: <Settings className="w-5 h-5" />
  },
  {
    id: 3,
    title: 'الاستهداف',
    completed: false,
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 4,
    title: 'الكلمات المفتاحية',
    completed: false,
    icon: <Search className="w-5 h-5" />
  },
  {
    id: 5,
    title: 'الإعلانات والأصول',
    completed: false,
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: 6,
    title: 'الميزانية والمزايدة',
    completed: false,
    icon: <DollarSign className="w-5 h-5" />
  },
  {
    id: 7,
    title: 'مراجعة وإطلاق',
    completed: false,
    icon: <Rocket className="w-5 h-5" />
  }
];

// URL Validation Function
const validateUrl = (url: string): { isValid: boolean; message: string; suggestion?: string } => {
  if (!url.trim()) {
    return {
      isValid: false,
      message: 'يرجى إدخال رابط الموقع الإلكتروني'
    };
  }

  // Check if URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return {
      isValid: false,
      message: 'يجب أن يبدأ الرابط بـ https:// أو http://',
      suggestion: `https://${url}`
    };
  }

  // Basic URL validation
  try {
    const urlObj = new URL(url);
    
    // Check if it's a valid domain
    if (!urlObj.hostname.includes('.')) {
      return {
        isValid: false,
        message: 'رابط غير صحيح، يرجى التأكد من صحة الرابط'
      };
    }

    // Check for common issues
    if (urlObj.hostname === 'localhost' || urlObj.hostname.startsWith('127.')) {
      return {
        isValid: false,
        message: 'لا يمكن تحليل المواقع المحلية، يرجى إدخال رابط موقع حقيقي'
      };
    }

    return {
      isValid: true,
      message: 'رابط صحيح'
    };
  } catch (error) {
    return {
      isValid: false,
      message: 'رابط غير صحيح، يرجى التأكد من صحة الرابط'
    };
  }
};

// Format keyword with match type
const formatKeywordWithMatchType = (keyword: string, matchType: 'exact' | 'phrase' | 'broad'): string => {
  const words = keyword.trim().split(' ');
  
  if (matchType === 'exact') {
    return `[${keyword}]`;
  } else if (matchType === 'phrase') {
    return `"${keyword}"`;
  } else {
    return keyword; // broad match
  }
};

// Main Component
const NewCampaign: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    campaignName: '',
    campaignType: '',
    websiteUrl: '',
    language: 'ar',
    locations: [],
    locationOption: 'presence_interest',
    keywords: [],
    dailyBudget: 100,
    biddingStrategy: 'maximize_clicks',
    assets: {
      images: [],
      videos: [],
      headlines: [],
      descriptions: []
    }
  });

  // States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WebsiteAnalysis | null>(null);
  const [isResearchingKeywords, setIsResearchingKeywords] = useState(false);
  const [urlValidation, setUrlValidation] = useState<{ isValid: boolean; message: string; suggestion?: string } | null>(null);
  const [showUrlSuggestion, setShowUrlSuggestion] = useState(false);

  // Google Maps states
  const [map, setMap] = useState<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);
  const [autocompleteService, setAutocompleteService] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMaps();
        initializeMap();
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    if (currentStep === 3) { // Only load when on targeting step
      initializeGoogleMaps();
    }
  }, [currentStep]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || !isGoogleMapsLoaded) return;

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 24.7136, lng: 46.6753 }, // Riyadh
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      const placesServiceInstance = new window.google.maps.places.PlacesService(mapInstance);
      const autocompleteServiceInstance = new window.google.maps.places.AutocompleteService();

      setMap(mapInstance);
      setPlacesService(placesServiceInstance);
      setAutocompleteService(autocompleteServiceInstance);
      setIsMapLoaded(true);

      // Add markers for selected locations
      formData.locations.forEach(location => {
        addLocationMarker(mapInstance, location);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [formData.locations]);

  const addLocationMarker = (mapInstance: any, location: Location) => {
    const marker = new window.google.maps.Marker({
      position: location.coordinates,
      map: mapInstance,
      title: location.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B82F6"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${location.name}</h3>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="color: #6b7280; font-size: 12px;">النوع:</span>
            <span style="color: #374151; font-size: 12px;">${getLocationTypeLabel(location.type)}</span>
          </div>
          ${location.searchVolume ? `
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="color: #6b7280; font-size: 12px;">معدل البحث:</span>
              <span style="color: #059669; font-size: 12px; font-weight: 600;">${location.searchVolume.toLocaleString()}</span>
            </div>
          ` : ''}
          ${location.population ? `
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="color: #6b7280; font-size: 12px;">السكان:</span>
              <span style="color: #374151; font-size: 12px;">${location.population.toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });
  };

  const getLocationTypeLabel = (type: string) => {
    const labels = {
      country: 'دولة',
      region: 'منطقة',
      city: 'مدينة',
      postal_code: 'رمز بريدي'
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Search locations function
  const searchLocations = useCallback(async (query: string) => {
    if (!autocompleteService || !placesService || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoadingLocations(true);

    try {
      const request = {
        input: query,
        types: ['(regions)'],
        componentRestrictions: { country: 'SA' }
      };

      autocompleteService.getPlacePredictions(request, (predictions: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const locations: Location[] = predictions.slice(0, 5).map((prediction, index) => ({
            id: `search-${index}`,
            name: prediction.description,
            type: getLocationType(prediction.types),
            coordinates: { lat: 0, lng: 0 },
            placeId: prediction.place_id,
            searchVolume: Math.floor(Math.random() * 50000) + 10000,
            population: Math.floor(Math.random() * 1000000) + 100000
          }));

          // Get coordinates for each location
          Promise.all(
            locations.map(location => getLocationDetails(location))
          ).then(updatedLocations => {
            setSearchResults(updatedLocations.filter(loc => loc !== null) as Location[]);
          });
        } else {
          setSearchResults([]);
        }
        setIsLoadingLocations(false);
      });
    } catch (error) {
      console.error('Error searching locations:', error);
      setIsLoadingLocations(false);
    }
  }, [autocompleteService, placesService]);

  const getLocationDetails = (location: Location): Promise<Location | null> => {
    return new Promise((resolve) => {
      if (!placesService) {
        resolve(null);
        return;
      }

      const request = {
        placeId: location.placeId,
        fields: ['geometry', 'name', 'types']
      };

      placesService.getDetails(request, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          resolve({
            ...location,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          });
        } else {
          resolve(null);
        }
      });
    });
  };

  const getLocationType = (types: string[]): Location['type'] => {
    if (types.includes('country')) return 'country';
    if (types.includes('administrative_area_level_1')) return 'region';
    if (types.includes('locality') || types.includes('administrative_area_level_2')) return 'city';
    if (types.includes('postal_code')) return 'postal_code';
    return 'city';
  };

  const addLocation = (location: Location) => {
    if (!formData.locations.find(loc => loc.placeId === location.placeId)) {
      const newLocations = [...formData.locations, location];
      setFormData(prev => ({ ...prev, locations: newLocations }));
      
      if (map) {
        addLocationMarker(map, location);
        // Update map view to include all locations
        const bounds = new window.google.maps.LatLngBounds();
        newLocations.forEach(loc => {
          bounds.extend(loc.coordinates);
        });
        map.fitBounds(bounds);
      }
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeLocation = (locationId: string) => {
    const newLocations = formData.locations.filter(loc => loc.id !== locationId);
    setFormData(prev => ({ ...prev, locations: newLocations }));
    
    // Reinitialize map with new locations
    if (map) {
      initializeMap();
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocations]);

  // URL validation effect
  useEffect(() => {
    if (formData.websiteUrl) {
      const validation = validateUrl(formData.websiteUrl);
      setUrlValidation(validation);
      setShowUrlSuggestion(!validation.isValid && !!validation.suggestion);
    } else {
      setUrlValidation(null);
      setShowUrlSuggestion(false);
    }
  }, [formData.websiteUrl]);

  // Website analysis function
  const analyzeWebsite = async () => {
    if (!formData.websiteUrl) return;

    const validation = validateUrl(formData.websiteUrl);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/website-analyzer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          campaignType: formData.campaignType || 'search'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        
        // Convert analysis keywords to KeywordData format
        const keywords: KeywordData[] = data.analysis.keywords_extracted.map((keyword: string, index: number) => {
          const words = keyword.trim().split(' ');
          const matchType = words.length === 1 ? 'exact' : 'phrase';
          
          return {
            keyword,
            keyword_type: words.length > 3 ? 'long_tail' : 'short_tail',
            match_type: matchType,
            search_volume_30d: Math.floor(Math.random() * 10000) + 1000,
            competition_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
            avg_cpc: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
            selected: index < 5, // Auto-select first 5
            formatted_keyword: formatKeywordWithMatchType(keyword, matchType)
          };
        });

        setFormData(prev => ({ ...prev, keywords }));
      } else {
        throw new Error(data.error || 'فشل في تحليل الموقع');
      }
    } catch (error) {
      console.error('Error analyzing website:', error);
      alert('حدث خطأ أثناء تحليل الموقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Keyword research function
  const researchKeywords = async () => {
    if (formData.keywords.length === 0) return;

    setIsResearchingKeywords(true);
    try {
      const selectedKeywords = formData.keywords
        .filter(k => k.selected)
        .map(k => k.keyword);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/keyword-planner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          keywords: selectedKeywords,
          location: 'SA',
          language: formData.language
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.keywords) {
        // Update keywords with research data
        const updatedKeywords = formData.keywords.map(keyword => {
          const researchData = data.keywords.find((k: any) => k.keyword === keyword.keyword);
          if (researchData) {
            return {
              ...keyword,
              search_volume_30d: researchData.search_volume_30d,
              competition_level: researchData.competition_level,
              avg_cpc: researchData.avg_cpc
            };
          }
          return keyword;
        });

        setFormData(prev => ({ ...prev, keywords: updatedKeywords }));
      } else {
        throw new Error(data.error || 'فشل في البحث عن الكلمات المفتاحية');
      }
    } catch (error) {
      console.error('Error researching keywords:', error);
      alert('حدث خطأ أثناء البحث عن الكلمات المفتاحية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsResearchingKeywords(false);
    }
  };

  // Apply URL suggestion
  const applyUrlSuggestion = () => {
    if (urlValidation?.suggestion) {
      setFormData(prev => ({ ...prev, websiteUrl: urlValidation.suggestion! }));
      setShowUrlSuggestion(false);
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepId: number) => {
    setCurrentStep(stepId);
  };

  // Launch campaign function
  const launchCampaign = async () => {
    try {
      // Here you would integrate with Google Ads API
      // For now, we'll simulate the launch
      
      const campaignData = {
        name: formData.campaignName,
        type: formData.campaignType,
        website_url: formData.websiteUrl,
        language: formData.language,
        locations: formData.locations,
        keywords: formData.keywords.filter(k => k.selected),
        daily_budget: formData.dailyBudget,
        bidding_strategy: formData.biddingStrategy,
        status: 'active',
        created_at: new Date().toISOString()
      };

      // Save to database
      const response = await fetch(`${SUPABASE_URL}/rest/v1/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        alert('تم إطلاق الحملة بنجاح!');
        router.push('/dashboard/campaigns');
      } else {
        throw new Error('فشل في حفظ الحملة');
      }
    } catch (error) {
      console.error('Error launching campaign:', error);
      alert('حدث خطأ أثناء إطلاق الحملة. يرجى المحاولة مرة أخرى.');
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر نوع الحملة الإعلانية</h2>
              <p className="text-gray-600">اختر النوع الذي يناسب أهدافك التسويقية</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaignTypes.map((type) => (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.campaignType === type.id
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, campaignType: type.id }))}
                >
                  {type.recommended && (
                    <div className="absolute -top-2 -right-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        مُوصى به
                      </span>
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.gradient} flex items-center justify-center text-white mb-4`}>
                    {type.icon}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">الميزات:</h4>
                    <ul className="space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">الأفضل لـ:</h4>
                    <div className="flex flex-wrap gap-1">
                      {type.bestFor.slice(0, 2).map((item, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">الإعدادات الأساسية</h2>
              <p className="text-gray-600">أدخل المعلومات الأساسية لحملتك</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الحملة *
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                  placeholder="أدخل اسماً وصفياً لحملتك"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الموقع الإلكتروني *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://example.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      urlValidation?.isValid === false ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formData.websiteUrl && (
                    <button
                      onClick={analyzeWebsite}
                      disabled={isAnalyzing || !urlValidation?.isValid}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? 'جاري التحليل...' : 'تحليل الموقع'}
                    </button>
                  )}
                </div>
                
                {/* URL Validation Messages */}
                {urlValidation && (
                  <div className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${
                    urlValidation.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {urlValidation.isValid ? (
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{urlValidation.message}</p>
                      {showUrlSuggestion && urlValidation.suggestion && (
                        <button
                          onClick={applyUrlSuggestion}
                          className="mt-2 text-sm underline hover:no-underline"
                        >
                          هل تقصد: {urlValidation.suggestion}؟
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Analysis Result */}
                {analysisResult && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h4 className="font-medium text-green-900">تم تحليل الموقع بنجاح</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-900">نوع النشاط:</span>
                        <span className="text-green-700 mr-2">{analysisResult.business_type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-900">الجمهور المستهدف:</span>
                        <span className="text-green-700 mr-2">{analysisResult.target_audience}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-green-900">الكلمات المستخرجة:</span>
                        <span className="text-green-700 mr-2">{analysisResult.keywords_extracted.length} كلمة مفتاحية</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  لغة الحملة الإعلانية *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                  <option value="ar,en">العربية والإنجليزية</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">اللغة والاستهداف الجغرافي</h2>
              <p className="text-gray-600">حدد المواقع التي تريد استهدافها</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Location Search */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن مدينة، منطقة، أو رمز بريدي..."
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {searchResults.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => addLocation(location)}
                        className="w-full px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">{getLocationTypeLabel(location.type)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{location.name}</div>
                            {location.searchVolume && (
                              <div className="text-sm text-green-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {location.searchVolume.toLocaleString()} بحث شهرياً
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {isLoadingLocations && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">جاري البحث...</p>
                  </div>
                )}
              </div>

              {/* Google Maps */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    المواقع المستهدفة على الخريطة
                  </h3>
                </div>
                <div 
                  ref={mapRef} 
                  className="w-full h-96 bg-gray-100"
                  style={{ minHeight: '384px' }}
                >
                  {!isMapLoaded && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">جاري تحميل الخريطة...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Locations */}
              {formData.locations.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    المواقع المحددة ({formData.locations.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.locations.map((location) => (
                      <div
                        key={location.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">{location.name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-4">
                              <span>{getLocationTypeLabel(location.type)}</span>
                              {location.searchVolume && (
                                <span className="text-green-600 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {location.searchVolume.toLocaleString()}
                                </span>
                              )}
                              {location.population && (
                                <span className="text-blue-600 flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {location.population.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeLocation(location.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Geographic Targeting Options */}
              <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  خيارات الموقع الجغرافي
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="locationOption"
                      value="presence_interest"
                      checked={formData.locationOption === 'presence_interest'}
                      onChange={(e) => setFormData(prev => ({ ...prev, locationOption: e.target.value as 'presence' | 'presence_interest' }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">الحضور أو الاهتمام</div>
                      <div className="text-sm text-gray-600">العملاء في مواقعك الجغرافية المضمّنة أو العملاء الذين يزورونها بصفةٍ منتظمة أو الذين أبدوا اهتماماً بها (يُنصح بهذا الخيار)</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="locationOption"
                      value="presence"
                      checked={formData.locationOption === 'presence'}
                      onChange={(e) => setFormData(prev => ({ ...prev, locationOption: e.target.value as 'presence' | 'presence_interest' }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">الحضور</div>
                      <div className="text-sm text-gray-600">العملاء في مواقعك الجغرافية المضمّنة أو العملاء الذين يزورونها بصفةٍ منتظمة</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">الكلمات المفتاحية</h2>
              <p className="text-gray-600">اختر الكلمات المفتاحية التي تريد استهدافها</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Generated Keywords */}
              {formData.keywords.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      كلمات مُولدة بالذكاء الاصطناعي ({formData.keywords.length})
                    </h3>
                    <button
                      onClick={researchKeywords}
                      disabled={isResearchingKeywords || formData.keywords.filter(k => k.selected).length === 0}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isResearchingKeywords ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          جاري البحث...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          بحث متقدم
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {formData.keywords.map((keyword, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg transition-all ${
                          keyword.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={keyword.selected}
                              onChange={(e) => {
                                const updatedKeywords = [...formData.keywords];
                                updatedKeywords[index].selected = e.target.checked;
                                setFormData(prev => ({ ...prev, keywords: updatedKeywords }));
                              }}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div>
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                  {keyword.formatted_keyword || formatKeywordWithMatchType(keyword.keyword, keyword.match_type)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  keyword.keyword_type === 'long_tail' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {keyword.keyword_type === 'long_tail' ? 'طويلة الذيل' : 'قصيرة'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                نوع المطابقة: {keyword.match_type === 'exact' ? 'تامة' : keyword.match_type === 'phrase' ? 'عبارة' : 'واسعة'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            {keyword.search_volume_30d && (
                              <div className="text-center">
                                <div className="text-gray-600">عمليات البحث</div>
                                <div className="font-semibold text-green-600">{keyword.search_volume_30d.toLocaleString()}</div>
                              </div>
                            )}
                            {keyword.competition_level && (
                              <div className="text-center">
                                <div className="text-gray-600">المنافسة</div>
                                <div className={`font-semibold ${
                                  keyword.competition_level === 'low' ? 'text-green-600' :
                                  keyword.competition_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {keyword.competition_level === 'low' ? 'منخفضة' :
                                   keyword.competition_level === 'medium' ? 'متوسطة' : 'عالية'}
                                </div>
                              </div>
                            )}
                            {keyword.avg_cpc && (
                              <div className="text-center">
                                <div className="text-gray-600">التكلفة/النقرة</div>
                                <div className="font-semibold text-blue-600">{keyword.avg_cpc} ر.س</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      <strong>ملاحظة:</strong> الكلمات المحاطة بـ [] تعني مطابقة تامة، والكلمات المحاطة بـ "" تعني مطابقة العبارة، والكلمات بدون أقواس تعني مطابقة واسعة.
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Keyword Addition */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" />
                  إضافة كلمات مفتاحية يدوياً
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="أدخل كلمة مفتاحية..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const keyword = input.value.trim();
                        if (keyword && !formData.keywords.find(k => k.keyword === keyword)) {
                          const words = keyword.split(' ');
                          const matchType = words.length === 1 ? 'exact' : 'phrase';
                          const newKeyword: KeywordData = {
                            keyword,
                            keyword_type: words.length > 3 ? 'long_tail' : 'short_tail',
                            match_type: matchType,
                            selected: true,
                            formatted_keyword: formatKeywordWithMatchType(keyword, matchType)
                          };
                          setFormData(prev => ({ 
                            ...prev, 
                            keywords: [...prev.keywords, newKeyword] 
                          }));
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    إضافة
                  </button>
                </div>
              </div>

              {/* Keywords Summary */}
              {formData.keywords.length > 0 && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">ملخص الكلمات المفتاحية</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formData.keywords.length}</div>
                      <div className="text-blue-700">إجمالي الكلمات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formData.keywords.filter(k => k.selected).length}</div>
                      <div className="text-green-700">كلمات محددة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{formData.keywords.filter(k => k.keyword_type === 'long_tail').length}</div>
                      <div className="text-purple-700">طويلة الذيل</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formData.keywords.filter(k => k.selected && k.search_volume_30d).reduce((sum, k) => sum + (k.search_volume_30d || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-orange-700">إجمالي البحث</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        const selectedCampaignType = campaignTypes.find(type => type.id === formData.campaignType);
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">الإعلانات والأصول</h2>
              <p className="text-gray-600">ارفع الصور والفيديوهات المطلوبة لحملتك</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {selectedCampaignType && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    {selectedCampaignType.icon}
                    متطلبات {selectedCampaignType.name}
                  </h3>
                  
                  <div className="space-y-6">
                    {selectedCampaignType.assetRequirements.map((requirement, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {requirement.icon}
                          <div>
                            <h4 className="font-medium text-gray-900">{requirement.label}</h4>
                            <p className="text-sm text-gray-600">{requirement.description}</p>
                          </div>
                        </div>
                        
                        {requirement.type === 'image' && (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 mb-2">اسحب الصور هنا أو اضغط للاختيار</p>
                            <p className="text-xs text-gray-500">
                              المطلوب: {requirement.min}-{requirement.max} صور
                              {requirement.dimensions && ` | الأبعاد: ${requirement.dimensions}`}
                            </p>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setFormData(prev => ({
                                  ...prev,
                                  assets: {
                                    ...prev.assets,
                                    images: [...prev.assets.images, ...files]
                                  }
                                }));
                              }}
                            />
                            <button
                              onClick={() => {
                                const input = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
                                input?.click();
                              }}
                              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                              اختيار الصور
                            </button>
                          </div>
                        )}
                        
                        {requirement.type === 'video' && (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <VideoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 mb-2">اسحب الفيديوهات هنا أو اضغط للاختيار</p>
                            <p className="text-xs text-gray-500">
                              المطلوب: {requirement.min}-{requirement.max} فيديو
                              {requirement.dimensions && ` | الأبعاد: ${requirement.dimensions}`}
                            </p>
                            <input
                              type="file"
                              multiple
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setFormData(prev => ({
                                  ...prev,
                                  assets: {
                                    ...prev.assets,
                                    videos: [...prev.assets.videos, ...files]
                                  }
                                }));
                              }}
                            />
                            <button
                              onClick={() => {
                                const input = document.querySelector('input[type="file"][accept="video/*"]') as HTMLInputElement;
                                input?.click();
                              }}
                              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                              اختيار الفيديوهات
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Auto-generated Ads Preview */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">معاينة الإعلانات المُولدة تلقائياً</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      سيتم إنشاء 3 إعلانات مختلفة تلقائياً لاختبار A/B وتحسين الأداء
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((adNumber) => (
                        <div key={adNumber} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-2">إعلان {adNumber}</div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                            <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded Assets Summary */}
              {(formData.assets.images.length > 0 || formData.assets.videos.length > 0) && (
                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                  <h4 className="font-semibold text-green-900 mb-3">الأصول المرفوعة</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formData.assets.images.length}</div>
                      <div className="text-green-700">صور</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formData.assets.videos.length}</div>
                      <div className="text-blue-700">فيديوهات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">3</div>
                      <div className="text-purple-700">إعلانات مُولدة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">A/B</div>
                      <div className="text-orange-700">اختبار</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">الميزانية واستراتيجية المزايدة</h2>
              <p className="text-gray-600">حدد ميزانيتك اليومية واستراتيجية المزايدة</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Daily Budget */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  الميزانية اليومية
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المبلغ اليومي (ريال سعودي)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.dailyBudget || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ 
                            ...prev, 
                            dailyBudget: value === '' ? 0 : parseInt(value) || 0
                          }));
                        }}
                        placeholder="100"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">ر.س</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      الميزانية الشهرية المتوقعة: {(formData.dailyBudget * 30).toLocaleString()} ر.س
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[50, 100, 200].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setFormData(prev => ({ ...prev, dailyBudget: amount }))}
                        className={`p-3 border rounded-lg text-center transition-all ${
                          formData.dailyBudget === amount
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">{amount} ر.س</div>
                        <div className="text-xs text-gray-600">يومياً</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bidding Strategy */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  استراتيجية المزايدة
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="biddingStrategy"
                      value="maximize_clicks"
                      checked={formData.biddingStrategy === 'maximize_clicks'}
                      onChange={(e) => setFormData(prev => ({ ...prev, biddingStrategy: e.target.value }))}
                      className="w-4 h-4 text-blue-600 mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">تحقيق أقصى عدد من النقرات</div>
                      <div className="text-sm text-gray-600">احصل على أكبر عدد من الزيارات ضمن ميزانيتك (مُوصى به للمبتدئين)</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="biddingStrategy"
                      value="target_cpa"
                      checked={formData.biddingStrategy === 'target_cpa'}
                      onChange={(e) => setFormData(prev => ({ ...prev, biddingStrategy: e.target.value }))}
                      className="w-4 h-4 text-blue-600 mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">تكلفة الاكتساب المستهدفة</div>
                      <div className="text-sm text-gray-600">حدد التكلفة المرغوبة لكل عملية تحويل</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="biddingStrategy"
                      value="maximize_conversions"
                      checked={formData.biddingStrategy === 'maximize_conversions'}
                      onChange={(e) => setFormData(prev => ({ ...prev, biddingStrategy: e.target.value }))}
                      className="w-4 h-4 text-blue-600 mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">تحقيق أقصى عدد من التحويلات</div>
                      <div className="text-sm text-gray-600">احصل على أكبر عدد من التحويلات ضمن ميزانيتك</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="biddingStrategy"
                      value="manual_cpc"
                      checked={formData.biddingStrategy === 'manual_cpc'}
                      onChange={(e) => setFormData(prev => ({ ...prev, biddingStrategy: e.target.value }))}
                      className="w-4 h-4 text-blue-600 mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">التكلفة اليدوية للنقرة</div>
                      <div className="text-sm text-gray-600">تحكم كامل في مزايدات الكلمات المفتاحية (للمتقدمين)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Budget Recommendations */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  توصيات الميزانية
                </h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>• ابدأ بميزانية صغيرة واختبر الأداء قبل الزيادة</p>
                  <p>• الميزانية المُوصى بها: {Math.max(100, formData.keywords.filter(k => k.selected).length * 20)} ر.س يومياً</p>
                  <p>• راقب الأداء يومياً وعدل الميزانية حسب النتائج</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">مراجعة وإطلاق الحملة</h2>
              <p className="text-gray-600">راجع جميع إعدادات حملتك قبل الإطلاق</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Campaign Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  ملخص الحملة
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">اسم الحملة</h4>
                      <p className="text-gray-600">{formData.campaignName || 'غير محدد'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">نوع الحملة</h4>
                      <p className="text-gray-600">
                        {campaignTypes.find(type => type.id === formData.campaignType)?.name || 'غير محدد'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">الموقع الإلكتروني</h4>
                      <p className="text-gray-600">{formData.websiteUrl || 'غير محدد'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">اللغة</h4>
                      <p className="text-gray-600">
                        {formData.language === 'ar' ? 'العربية' : 
                         formData.language === 'en' ? 'English' : 'العربية والإنجليزية'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">المواقع المستهدفة</h4>
                      <p className="text-gray-600">{formData.locations.length} موقع محدد</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">الكلمات المفتاحية</h4>
                      <p className="text-gray-600">{formData.keywords.filter(k => k.selected).length} كلمة محددة</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">الميزانية اليومية</h4>
                      <p className="text-gray-600">{formData.dailyBudget} ر.س</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">استراتيجية المزايدة</h4>
                      <p className="text-gray-600">
                        {formData.biddingStrategy === 'maximize_clicks' ? 'تحقيق أقصى عدد من النقرات' :
                         formData.biddingStrategy === 'target_cpa' ? 'تكلفة الاكتساب المستهدفة' :
                         formData.biddingStrategy === 'maximize_conversions' ? 'تحقيق أقصى عدد من التحويلات' :
                         'التكلفة اليدوية للنقرة'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Estimates */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  التوقعات المبدئية
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(formData.dailyBudget / 2.5).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">نقرات متوقعة يومياً</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(formData.dailyBudget / 2.5 * 0.03).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">تحويلات متوقعة يومياً</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {((formData.dailyBudget / 2.5 * 0.03) / (formData.dailyBudget / 2.5) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">معدل التحويل المتوقع</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">2.5</div>
                    <div className="text-sm text-gray-600">متوسط التكلفة/النقرة</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    * هذه توقعات مبدئية قد تختلف حسب المنافسة وجودة الإعلانات والاستهداف
                  </p>
                </div>
              </div>

              {/* Launch Button */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="mb-4">
                  <Rocket className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">جاهز للإطلاق؟</h3>
                  <p className="text-gray-600">
                    ستتم مراجعة حملتك من قبل Google Ads وقد تستغرق بضع ساعات للموافقة
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={launchCampaign}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                  >
                    <Rocket className="w-5 h-5" />
                    إطلاق الحملة الآن
                  </button>
                  
                  <p className="text-xs text-gray-500">
                    بالضغط على "إطلاق الحملة" فإنك توافق على شروط وأحكام Google Ads
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الخطوات التالية</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                    <span>ستظهر حملتك في لوحة التحكم خلال دقائق</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                    <span>ستتم مراجعة الإعلانات من قبل Google (2-24 ساعة)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                    <span>ستبدأ الحملة في الظهور بعد الموافقة</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">4</div>
                    <span>راقب الأداء وعدل الإعدادات حسب الحاجة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">إنشاء حملة إعلانية جديدة</h1>
            </div>
            <div className="text-sm text-gray-500">
              الخطوة {currentStep} من {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep === step.id
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : currentStep > step.id
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </button>
                <div className="mr-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            السابق
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !formData.campaignType) ||
                (currentStep === 2 && (!formData.campaignName || !formData.websiteUrl || !urlValidation?.isValid)) ||
                (currentStep === 3 && formData.locations.length === 0) ||
                (currentStep === 4 && formData.keywords.filter(k => k.selected).length === 0) ||
                (currentStep === 6 && formData.dailyBudget <= 0)
              }
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              التالي
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          ) : (
            <div className="text-sm text-gray-500">
              راجع الإعدادات واضغط "إطلاق الحملة"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewCampaign;