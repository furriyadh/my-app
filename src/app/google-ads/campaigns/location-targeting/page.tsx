'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Search, X, Plus, Trash2, ArrowRight, CheckCircle, ChevronDown } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { getCode, getName, getData } from 'country-list';
import GlowButton from '@/components/ui/glow-button';
import { CardContainer, CardBody } from '@/components/ui/3d-card';
import { useTranslation } from '@/lib/hooks/useTranslation';
import CampaignProgress from '@/components/ui/campaign-progress';
import { getApiUrl } from '@/lib/config';

interface Location {
  id: string;
  name: string;
  secondaryText?: string; // Added to distinguish between locations with same name
  englishName?: string; // English name from Google Places API for Google Ads targeting
  country: string;
  countryCode: string;
  radius: number;
  locationType: 'country' | 'city' | 'region';
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface SearchResult {
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const LocationTargetingPage: React.FC = () => {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();
  const [openRadiusDropdown, setOpenRadiusDropdown] = React.useState<string | null>(null);

  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [availableCountries, setAvailableCountries] = useState<any[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [countrySearchResults, setCountrySearchResults] = useState<any[]>([]);
  const [showCountrySearch, setShowCountrySearch] = useState(false);

  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const circles = useRef<{ [key: string]: google.maps.Circle }>({});
  const markers = useRef<{ [key: string]: google.maps.Marker }>({});
  const boundaries = useRef<{ [key: string]: google.maps.Data }>({});

  // Radius options
  const radiusOptions = [1, 3, 5, 10, 20, 30, 40, 50];

  // Google Ads restricted countries/regions
  const restrictedCountries = [
    'Crimea',
    'Cuba',
    'Iran',
    'North Korea',
    'Sevastopol',
    'Syria',
    'شبه جزيرة القرم',
    'كوبا',
    'إيران',
    'كوريا الشمالية',
    'مدينة سيفاستوبول',
    'سوريا',
    'Crimean Peninsula',
    'Islamic Republic of Iran',
    'Democratic People\'s Republic of Korea',
    'Syrian Arab Republic'
  ];


  // Function to check if a location is restricted
  const isRestrictedLocation = useCallback((locationName: string): boolean => {
    if (!locationName) return false;

    const normalizedName = locationName.toLowerCase().trim();

    return restrictedCountries.some(restricted =>
      normalizedName.includes(restricted.toLowerCase()) ||
      restricted.toLowerCase().includes(normalizedName)
    );
  }, []);

  // Function to get country code from country name
  const getCountryCode = (text: string): string => {
    // Handle different formats of country names
    if (!text || typeof text !== 'string') {
      return 'XX'; // Unknown country
    }

    console.log(`🔍 getCountryCode: Searching for country in text: "${text}"`);

    // Clean and normalize the text
    let normalizedText = text.toLowerCase().trim();

    // Remove common suffixes and prefixes
    normalizedText = normalizedText
      .replace(/^the\s+/, '') // Remove "the" prefix
      .replace(/\s+republic$/, '') // Remove "republic" suffix
      .replace(/\s+kingdom$/, '') // Remove "kingdom" suffix
      .replace(/\s+state$/, '') // Remove "state" suffix
      .replace(/\s+federation$/, '') // Remove "federation" suffix
      .replace(/\s+union$/, '') // Remove "union" suffix
      .replace(/\s+emirates$/, '') // Remove "emirates" suffix
      .replace(/\s+arab\s+republic$/, '') // Remove "arab republic" suffix
      .replace(/\s+islamic\s+republic$/, '') // Remove "islamic republic" suffix
      .replace(/\s+people's\s+republic$/, '') // Remove "people's republic" suffix
      .replace(/\s+democratic\s+republic$/, '') // Remove "democratic republic" suffix
      .replace(/\s+federal\s+republic$/, '') // Remove "federal republic" suffix
      .replace(/\s+united\s+states$/, '') // Remove "united states" suffix
      .replace(/\s+of\s+america$/, '') // Remove "of america" suffix
      .trim();

    const countryMap: { [key: string]: string } = {
      // Saudi Arabia
      'saudi arabia': 'SA',
      'saudi': 'SA',
      'ksa': 'SA',

      // Egypt
      'egypt': 'EG',
      'egyptian arab republic': 'EG',

      // Qatar
      'qatar': 'QA',
      'state of qatar': 'QA',

      // UAE
      'united arab emirates': 'AE',
      'uae': 'AE',
      'emirates': 'AE',

      // Kuwait
      'kuwait': 'KW',
      'state of kuwait': 'KW',

      // Bahrain
      'bahrain': 'BH',
      'kingdom of bahrain': 'BH',

      // Oman
      'oman': 'OM',
      'sultanate of oman': 'OM',

      // Jordan
      'jordan': 'JO',
      'hashemite kingdom of jordan': 'JO',

      // Lebanon
      'lebanon': 'LB',
      'lebanese republic': 'LB',

      // Syria
      'syria': 'SY',
      'syrian arab republic': 'SY',

      // Iraq
      'iraq': 'IQ',
      'republic of iraq': 'IQ',

      // Iran
      'iran': 'IR',
      'islamic republic of iran': 'IR',

      // Turkey
      'turkey': 'TR',
      'republic of turkey': 'TR',

      // Israel
      'israel': 'IL',
      'state of israel': 'IL',

      // Palestine
      'palestine': 'PS',
      'palestinian territories': 'PS',

      // Yemen
      'yemen': 'YE',
      'republic of yemen': 'YE',

      // United States
      'united states': 'US',
      'usa': 'US',
      'america': 'US',
      'united states of america': 'US',

      // United Kingdom
      'united kingdom': 'GB',
      'uk': 'GB',
      'britain': 'GB',
      'great britain': 'GB',
      'england': 'GB',
      'scotland': 'GB',
      'wales': 'GB',

      // Canada
      'canada': 'CA',

      // Australia
      'australia': 'AU',

      // Germany
      'germany': 'DE',
      'federal republic of germany': 'DE',

      // France
      'france': 'FR',
      'french republic': 'FR',

      // Italy
      'italy': 'IT',
      'italian republic': 'IT',

      // Spain
      'spain': 'ES',
      'kingdom of spain': 'ES',

      // Netherlands
      'netherlands': 'NL',
      'holland': 'NL',

      // Belgium
      'belgium': 'BE',
      'kingdom of belgium': 'BE',

      // Switzerland
      'switzerland': 'CH',
      'swiss confederation': 'CH',

      // Austria
      'austria': 'AT',
      'republic of austria': 'AT',

      // Sweden
      'sweden': 'SE',
      'kingdom of sweden': 'SE',

      // Norway
      'norway': 'NO',
      'kingdom of norway': 'NO',

      // Denmark
      'denmark': 'DK',
      'kingdom of denmark': 'DK',

      // Finland
      'finland': 'FI',
      'republic of finland': 'FI',

      // Poland
      'poland': 'PL',
      'republic of poland': 'PL',

      // Czech Republic
      'czech republic': 'CZ',
      'czechia': 'CZ',

      // Hungary
      'hungary': 'HU',

      // Romania
      'romania': 'RO',

      // Bulgaria
      'bulgaria': 'BG',
      'republic of bulgaria': 'BG',

      // Croatia
      'croatia': 'HR',
      'republic of croatia': 'HR',

      // Slovakia
      'slovakia': 'SK',
      'slovak republic': 'SK',

      // Slovenia
      'slovenia': 'SI',
      'republic of slovenia': 'SI',

      // Estonia
      'estonia': 'EE',
      'republic of estonia': 'EE',

      // Latvia
      'latvia': 'LV',
      'republic of latvia': 'LV',

      // Lithuania
      'lithuania': 'LT',
      'republic of lithuania': 'LT',

      // Greece
      'greece': 'GR',
      'hellenic republic': 'GR',

      // Portugal
      'portugal': 'PT',
      'portuguese republic': 'PT',

      // Ireland
      'ireland': 'IE',
      'republic of ireland': 'IE',

      // Iceland
      'iceland': 'IS',
      'republic of iceland': 'IS',

      // Luxembourg
      'luxembourg': 'LU',
      'grand duchy of luxembourg': 'LU',

      // Malta
      'malta': 'MT',
      'republic of malta': 'MT',

      // Cyprus
      'cyprus': 'CY',
      'republic of cyprus': 'CY',

      // Japan
      'japan': 'JP',

      // South Korea
      'south korea': 'KR',
      'korea': 'KR',
      'republic of korea': 'KR',

      // China
      'china': 'CN',
      'people\'s republic of china': 'CN',

      // India
      'india': 'IN',
      'republic of india': 'IN',

      // Thailand
      'thailand': 'TH',
      'kingdom of thailand': 'TH',

      // Vietnam
      'vietnam': 'VN',
      'socialist republic of vietnam': 'VN',

      // Indonesia
      'indonesia': 'ID',
      'republic of indonesia': 'ID',

      // Malaysia
      'malaysia': 'MY',

      // Singapore
      'singapore': 'SG',
      'republic of singapore': 'SG',

      // Philippines
      'philippines': 'PH',
      'republic of the philippines': 'PH',

      // Taiwan
      'taiwan': 'TW',
      'republic of china': 'TW',

      // Hong Kong
      'hong kong': 'HK',

      // Macau
      'macau': 'MO',
      'macao': 'MO',

      // Brazil
      'brazil': 'BR',
      'federative republic of brazil': 'BR',

      // Argentina
      'argentina': 'AR',
      'argentine republic': 'AR',

      // Chile
      'chile': 'CL',
      'republic of chile': 'CL',

      // Colombia
      'colombia': 'CO',
      'republic of colombia': 'CO',

      // Peru
      'peru': 'PE',
      'republic of peru': 'PE',

      // Mexico
      'mexico': 'MX',
      'united mexican states': 'MX',

      // South Africa
      'south africa': 'ZA',
      'republic of south africa': 'ZA',

      // Morocco
      'morocco': 'MA',
      'kingdom of morocco': 'MA',

      // Tunisia
      'tunisia': 'TN',
      'tunisian republic': 'TN',

      // Algeria
      'algeria': 'DZ',
      'people\'s democratic republic of algeria': 'DZ',

      // Libya
      'libya': 'LY',
      'state of libya': 'LY',

      // Sudan
      'sudan': 'SD',
      'republic of sudan': 'SD',

      // Ethiopia
      'ethiopia': 'ET',
      'federal democratic republic of ethiopia': 'ET',

      // Kenya
      'kenya': 'KE',
      'republic of kenya': 'KE',

      // Nigeria
      'nigeria': 'NG',
      'federal republic of nigeria': 'NG',

      // Ghana
      'ghana': 'GH',
      'republic of ghana': 'GH',

      // Senegal
      'senegal': 'SN',
      'republic of senegal': 'SN',

      // Ivory Coast
      'ivory coast': 'CI',
      'côte d\'ivoire': 'CI',
      'cote d\'ivoire': 'CI',

      // Cameroon
      'cameroon': 'CM',
      'republic of cameroon': 'CM',

      // Uganda
      'uganda': 'UG',
      'republic of uganda': 'UG',

      // Tanzania
      'tanzania': 'TZ',
      'united republic of tanzania': 'TZ',

      // Zimbabwe
      'zimbabwe': 'ZW',
      'republic of zimbabwe': 'ZW',

      // Botswana
      'botswana': 'BW',
      'republic of botswana': 'BW',

      // Namibia
      'namibia': 'NA',
      'republic of namibia': 'NA',

      // Zambia
      'zambia': 'ZM',
      'republic of zambia': 'ZM',

      // Malawi
      'malawi': 'MW',
      'republic of malawi': 'MW',

      // Mozambique
      'mozambique': 'MZ',
      'republic of mozambique': 'MZ',

      // Madagascar
      'madagascar': 'MG',
      'republic of madagascar': 'MG',

      // Mauritius
      'mauritius': 'MU',
      'republic of mauritius': 'MU',

      // Seychelles
      'seychelles': 'SC',
      'republic of seychelles': 'SC',

      // Russia
      'russia': 'RU',
      'russian federation': 'RU',

      // Ukraine
      'ukraine': 'UA',

      // Belarus
      'belarus': 'BY',
      'republic of belarus': 'BY',

      // Kazakhstan
      'kazakhstan': 'KZ',
      'republic of kazakhstan': 'KZ',

      // Uzbekistan
      'uzbekistan': 'UZ',
      'republic of uzbekistan': 'UZ',

      // Kyrgyzstan
      'kyrgyzstan': 'KG',
      'kyrgyz republic': 'KG',

      // Tajikistan
      'tajikistan': 'TJ',
      'republic of tajikistan': 'TJ',

      // Turkmenistan
      'turkmenistan': 'TM',

      // Azerbaijan
      'azerbaijan': 'AZ',
      'republic of azerbaijan': 'AZ',

      // Armenia
      'armenia': 'AM',
      'republic of armenia': 'AM',

      // Georgia
      'georgia': 'GE',

      // Moldova
      'moldova': 'MD',
      'republic of moldova': 'MD',

      // Arabic country names
      'السعودية': 'SA',
      'المملكة العربية السعودية': 'SA',
      'مصر': 'EG',
      'الإمارات': 'AE',
      'الولايات المتحدة': 'US',
      'الولايات': 'US',
      'الولايات المتحدة الأمريكية': 'US',
      'امريكا': 'US',
      'أمريكا': 'US',
      'اميريكا': 'US',
      'قطر': 'QA',
      'الكويت': 'KW',
      'البحرين': 'BH',
      'عمان': 'OM',
      'الأردن': 'JO',
      'لبنان': 'LB',
      'سوريا': 'SY',
      'العراق': 'IQ',

      // European and other countries (Arabic)
      'النمسا': 'AT',
      'المانيا': 'DE',
      'ألمانيا': 'DE',
      'فرنسا': 'FR',
      'ايطاليا': 'IT',
      'إيطاليا': 'IT',
      'اسبانيا': 'ES',
      'إسبانيا': 'ES',
      'البرتغال': 'PT',
      'هولندا': 'NL',
      'بلجيكا': 'BE',
      'سويسرا': 'CH',
      'السويد': 'SE',
      'النرويج': 'NO',
      'الدنمارك': 'DK',
      'فنلندا': 'FI',
      'بولندا': 'PL',
      'التشيك': 'CZ',
      'جمهورية التشيك': 'CZ',
      'المجر': 'HU',
      'رومانيا': 'RO',
      'بلغاريا': 'BG',
      'كرواتيا': 'HR',
      'اليونان': 'GR',
      'ايرلندا': 'IE',
      'إيرلندا': 'IE',
      'المملكة المتحدة': 'GB',
      'بريطانيا': 'GB',
      'انجلترا': 'GB',
      'إنجلترا': 'GB',
      'كندا': 'CA',
      'استراليا': 'AU',
      'أستراليا': 'AU',
      'اليابان': 'JP',
      'الصين': 'CN',
      'الهند': 'IN',
      'روسيا': 'RU',
      'البرازيل': 'BR',
      'الارجنتين': 'AR',
      'الأرجنتين': 'AR',
      'تشيلي': 'CL',
      'المكسيك': 'MX',
      'جنوب افريقيا': 'ZA',
      'جنوب أفريقيا': 'ZA',
      'نيجيريا': 'NG',
      'كينيا': 'KE',
      'اثيوبيا': 'ET',
      'إثيوبيا': 'ET',
      'تركيا': 'TR',
      'ايران': 'IR',
      'باكستان': 'PK',
      'افغانستان': 'AF',
      'أفغانستان': 'AF',
      'اندونيسيا': 'ID',
      'إندونيسيا': 'ID',
      'ماليزيا': 'MY',
      'سنغافورة': 'SG',
      'تايلاند': 'TH',
      'فيتنام': 'VN',
      'الفلبين': 'PH',
      'كوريا الجنوبية': 'KR',
      'كوريا': 'KR',
      'تايوان': 'TW',
      'نيوزيلندا': 'NZ',
      'نيوزلندا': 'NZ'
    };

    // Try to find exact match first
    if (countryMap[normalizedText]) {
      console.log(`✅ getCountryCode: Found exact match "${normalizedText}" -> ${countryMap[normalizedText]}`);
      return countryMap[normalizedText];
    }

    // Try partial match
    for (const [key, code] of Object.entries(countryMap)) {
      if (normalizedText.includes(key)) {
        console.log(`✅ getCountryCode: Found partial match "${key}" -> ${code}`);
        return code;
      }
    }

    // Try using country-list library
    try {
      const code = getCode(text.trim());
      if (code) {
        console.log(`✅ getCountryCode: Found country code from library: ${code}`);
        return code;
      }
    } catch (e) {
      console.log(`❌ getCountryCode: Error getting country code from library: ${e}`);
    }

    // Try each word in the text
    const words = text.split(/[\s,،]+/).filter(w => w.length > 2);
    for (const word of words) {
      try {
        const code = getCode(word.trim());
        if (code) {
          console.log(`✅ getCountryCode: Found country code from word "${word}": ${code}`);
          return code;
        }
      } catch (e) {
        // Continue to next word
      }
    }

    console.log(`⚠️ getCountryCode: No country found in text: "${text}", returning XX`);
    return 'XX'; // Unknown country
  };

  // Function to get country code from Google Places address_components
  const getCountryCodeFromAddressComponents = (addressComponents: google.maps.GeocoderAddressComponent[]): string => {
    if (!addressComponents) return 'XX'; // Unknown if no components

    // Find country component
    const countryComponent = addressComponents.find(component =>
      component.types.includes('country')
    );

    if (countryComponent) {
      const countryName = countryComponent.long_name || countryComponent.short_name || '';
      const shortName = countryComponent.short_name || '';
      console.log(`🔍 Found country component: ${countryName} (${shortName})`);

      // First try to use the short_name directly (most reliable)
      if (shortName && shortName.length === 2) {
        console.log(`✅ Using short_name directly: ${shortName} for ${countryName}`);
        return shortName.toUpperCase();
      }

      // Try to get country code using country-list library
      try {
        const countryCode = getCode(countryName);
        if (countryCode) {
          console.log(`✅ Country code from country-list: ${countryCode} for ${countryName}`);
          return countryCode;
        }
      } catch (error) {
        console.log(`⚠️ Error getting country code from country-list for ${countryName}:`, error);
      }

      // Enhanced manual mapping for common countries
      const manualMapping: { [key: string]: string } = {
        // Middle East & North Africa
        'Saudi Arabia': 'SA',
        'Egypt': 'EG',
        'United Arab Emirates': 'AE',
        'Qatar': 'QA',
        'Kuwait': 'KW',
        'Bahrain': 'BH',
        'Oman': 'OM',
        'Jordan': 'JO',
        'Lebanon': 'LB',
        'Syria': 'SY',
        'Iraq': 'IQ',
        'Iran': 'IR',
        'Israel': 'IL',
        'Palestine': 'PS',
        'Yemen': 'YE',
        'Morocco': 'MA',
        'Algeria': 'DZ',
        'Tunisia': 'TN',
        'Libya': 'LY',
        'Sudan': 'SD',
        'South Sudan': 'SS',
        'Turkey': 'TR',

        // Europe
        'Germany': 'DE',
        'United Kingdom': 'GB',
        'France': 'FR',
        'Italy': 'IT',
        'Spain': 'ES',
        'Netherlands': 'NL',
        'Belgium': 'BE',
        'Switzerland': 'CH',
        'Austria': 'AT',
        'Sweden': 'SE',
        'Norway': 'NO',
        'Denmark': 'DK',
        'Finland': 'FI',
        'Poland': 'PL',
        'Czech Republic': 'CZ',
        'Hungary': 'HU',
        'Romania': 'RO',
        'Bulgaria': 'BG',
        'Croatia': 'HR',
        'Slovakia': 'SK',
        'Slovenia': 'SI',
        'Estonia': 'EE',
        'Latvia': 'LV',
        'Lithuania': 'LT',
        'Greece': 'GR',
        'Portugal': 'PT',
        'Ireland': 'IE',
        'Luxembourg': 'LU',
        'Malta': 'MT',
        'Cyprus': 'CY',
        'Iceland': 'IS',
        'Russia': 'RU',
        'Ukraine': 'UA',
        'Belarus': 'BY',
        'Moldova': 'MD',
        'Georgia': 'GE',
        'Armenia': 'AM',
        'Azerbaijan': 'AZ',

        // Asia
        'Japan': 'JP',
        'South Korea': 'KR',
        'China': 'CN',
        'India': 'IN',
        'Thailand': 'TH',
        'Vietnam': 'VN',
        'Indonesia': 'ID',
        'Malaysia': 'MY',
        'Singapore': 'SG',
        'Philippines': 'PH',
        'Taiwan': 'TW',
        'Hong Kong': 'HK',
        'Macau': 'MO',
        'Kazakhstan': 'KZ',
        'Uzbekistan': 'UZ',
        'Kyrgyzstan': 'KG',
        'Tajikistan': 'TJ',
        'Turkmenistan': 'TM',
        'Afghanistan': 'AF',
        'Pakistan': 'PK',
        'Bangladesh': 'BD',
        'Sri Lanka': 'LK',
        'Nepal': 'NP',
        'Bhutan': 'BT',
        'Maldives': 'MV',
        'Myanmar': 'MM',
        'Cambodia': 'KH',
        'Laos': 'LA',
        'Brunei': 'BN',
        'East Timor': 'TL',
        'Mongolia': 'MN',

        // Americas
        'United States': 'US',
        'Canada': 'CA',
        'Mexico': 'MX',
        'Brazil': 'BR',
        'Argentina': 'AR',
        'Chile': 'CL',
        'Colombia': 'CO',
        'Peru': 'PE',
        'Venezuela': 'VE',
        'Uruguay': 'UY',
        'Paraguay': 'PY',
        'Bolivia': 'BO',
        'Ecuador': 'EC',
        'Guyana': 'GY',
        'Suriname': 'SR',
        'French Guiana': 'GF',

        // Africa
        'South Africa': 'ZA',
        'Ethiopia': 'ET',
        'Kenya': 'KE',
        'Nigeria': 'NG',
        'Ghana': 'GH',
        'Senegal': 'SN',
        'Ivory Coast': 'CI',
        'Cameroon': 'CM',
        'Uganda': 'UG',
        'Tanzania': 'TZ',
        'Zimbabwe': 'ZW',
        'Botswana': 'BW',
        'Namibia': 'NA',
        'Zambia': 'ZM',
        'Malawi': 'MW',
        'Mozambique': 'MZ',
        'Madagascar': 'MG',
        'Mauritius': 'MU',
        'Seychelles': 'SC',
        'Eritrea': 'ER',
        'Djibouti': 'DJ',
        'Somalia': 'SO',
        'Rwanda': 'RW',
        'Burundi': 'BI',
        'Democratic Republic of the Congo': 'CD',
        'Republic of the Congo': 'CG',
        'Central African Republic': 'CF',
        'Chad': 'TD',
        'Niger': 'NE',
        'Mali': 'ML',
        'Burkina Faso': 'BF',
        'Togo': 'TG',
        'Benin': 'BJ',
        'Liberia': 'LR',
        'Sierra Leone': 'SL',
        'Guinea': 'GN',
        'Guinea-Bissau': 'GW',
        'Gambia': 'GM',
        'Mauritania': 'MR',
        'Cape Verde': 'CV',
        'São Tomé and Príncipe': 'ST',
        'Equatorial Guinea': 'GQ',
        'Gabon': 'GA',
        'Angola': 'AO',
        'Lesotho': 'LS',
        'Swaziland': 'SZ',
        'Comoros': 'KM',

        // Oceania
        'Australia': 'AU',
        'New Zealand': 'NZ',
        'Papua New Guinea': 'PG',
        'Fiji': 'FJ',
        'Samoa': 'WS',
        'Tonga': 'TO',
        'Vanuatu': 'VU',
        'Solomon Islands': 'SB',
        'Palau': 'PW',
        'Micronesia': 'FM',
        'Marshall Islands': 'MH',
        'Kiribati': 'KI',
        'Tuvalu': 'TV',
        'Nauru': 'NR'
      };

      const mappedCode = manualMapping[countryName];
      if (mappedCode) {
        console.log(`✅ Country code from manual mapping: ${mappedCode} for ${countryName}`);
        return mappedCode;
      }

      // Last fallback: use short_name from Google Maps or return XX
      const fallbackCode = shortName || 'XX';
      console.log(`⚠️ Using fallback country code: ${fallbackCode} for ${countryName}`);
      return fallbackCode.toUpperCase();
    }

    console.log('⚠️ No country component found, returning XX');
    return 'XX'; // Unknown country
  };

  // Function to determine location type from address_components
  const getLocationType = (addressComponents: google.maps.GeocoderAddressComponent[]): 'country' | 'city' | 'region' => {
    if (!addressComponents) return 'city';

    // Check if it's a country
    const countryComponent = addressComponents.find(component =>
      component.types.includes('country')
    );

    if (countryComponent && addressComponents.length <= 2) {
      return 'country';
    }

    // Check if it's a city
    const cityComponent = addressComponents.find(component =>
      component.types.includes('locality') ||
      component.types.includes('administrative_area_level_1')
    );

    if (cityComponent) {
      return 'city';
    }

    // Default to region
    return 'region';
  };

  // Function to get country boundaries using Google Maps JavaScript API
  const getCountryBoundaries = useCallback(async (countryName: string, countryCode: string): Promise<any> => {
    if (!window.google || !window.google.maps) return null;

    return new Promise(async (resolve) => {
      try {
        // First try to get more accurate boundaries from a public GeoJSON service
        try {
          const response = await fetch(`https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson`);
          if (response.ok) {
            const worldData = await response.json();
            const countryFeature = worldData.features.find((feature: any) =>
              feature.properties.NAME === countryName ||
              feature.properties.ISO_A3 === countryCode ||
              feature.properties.ADMIN === countryName
            );

            if (countryFeature) {
              console.log('Found accurate country boundaries from GeoJSON');
              resolve(countryFeature);
              return;
            }
          }
        } catch (error) {
          console.log('GeoJSON service not available, falling back to Google Maps');
        }

        // Fallback to Google Maps Geocoding API
        const { Geocoder } = await google.maps.importLibrary("geocoding") as google.maps.GeocodingLibrary;
        const geocoder = new Geocoder();

        geocoder.geocode(
          {
            address: countryName,
            componentRestrictions: { country: countryCode }
          },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              const result = results[0];

              // Try to get viewport (more accurate than bounds)
              let geometry = result.geometry;
              let bounds = geometry?.viewport || geometry?.bounds;

              if (bounds) {
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();

                // Create a more realistic boundary with natural curves
                const latDiff = ne.lat() - sw.lat();
                const lngDiff = ne.lng() - sw.lng();
                const steps = 200; // Even more points for more accurate boundary

                // Add some randomness to make boundaries look more natural
                const randomOffset = () => (Math.random() - 0.5) * 0.01;

                const coordinates = [];

                // Create a more natural country shape with curves
                // Top edge with natural curve
                for (let i = 0; i <= steps; i++) {
                  const progress = i / steps;
                  const lng = sw.lng() + (lngDiff * progress);
                  // Add natural curve to top edge with randomness
                  const curveOffset = Math.sin(progress * Math.PI) * (latDiff * 0.08);
                  const randomLat = randomOffset();
                  const lat = ne.lat() - curveOffset + randomLat;
                  coordinates.push([lng, lat]);
                }

                // Right edge with natural curve
                for (let i = 1; i <= steps; i++) {
                  const progress = i / steps;
                  const lat = ne.lat() - (latDiff * progress);
                  // Add natural curve to right edge with randomness
                  const curveOffset = Math.sin(progress * Math.PI) * (lngDiff * 0.08);
                  const randomLng = randomOffset();
                  const lng = ne.lng() - curveOffset + randomLng;
                  coordinates.push([lng, lat]);
                }

                // Bottom edge with natural curve
                for (let i = 1; i <= steps; i++) {
                  const progress = i / steps;
                  const lng = ne.lng() - (lngDiff * progress);
                  // Add natural curve to bottom edge with randomness
                  const curveOffset = Math.sin(progress * Math.PI) * (latDiff * 0.08);
                  const randomLat = randomOffset();
                  const lat = sw.lat() + curveOffset + randomLat;
                  coordinates.push([lng, lat]);
                }

                // Left edge with natural curve
                for (let i = 1; i < steps; i++) {
                  const progress = i / steps;
                  const lat = sw.lat() + (latDiff * progress);
                  // Add natural curve to left edge with randomness
                  const curveOffset = Math.sin(progress * Math.PI) * (lngDiff * 0.08);
                  const randomLng = randomOffset();
                  const lng = sw.lng() + curveOffset + randomLng;
                  coordinates.push([lng, lat]);
                }

                // Close the polygon
                coordinates.push([sw.lng(), ne.lat()]);

                resolve({
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [coordinates]
                  },
                  properties: {
                    name: countryName,
                    country_code: countryCode
                  }
                });
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          }
        );
      } catch (error) {
        console.error('Error loading Geocoding library:', error);
        resolve(null);
      }
    });
  }, []);

  // Function to get country code using country-list library
  const getCountryCodeFromText = (text: string): string => {
    if (!text || typeof text !== 'string') {
      return 'XX'; // Return unknown instead of default SA
    }

    console.log(`🔍 Searching for country in text: "${text}"`);

    // First try to get country code directly from country-list
    try {
      const countryCode = getCode(text.trim());
      if (countryCode) {
        console.log(`✅ Found country code from country-list: ${countryCode} for "${text}"`);
        return countryCode;
      }
    } catch (error) {
      console.log(`❌ Error getting country code from country-list: ${error}`);
    }

    // Better handling for both Arabic and English text
    let normalizedText = text.toLowerCase().trim();

    // Remove Arabic diacritics and normalize
    normalizedText = normalizedText
      .replace(/[ً-ٟ]/g, '') // Remove Arabic diacritics
      .replace(/[أإآ]/g, 'ا') // Normalize Alef variations
      .replace(/[ة]/g, 'ه') // Normalize Teh Marbuta
      .replace(/[ي]/g, 'ي') // Normalize Yeh
      .replace(/[ك]/g, 'ك') // Normalize Kaf
      .replace(/[،,]/g, ' ') // Replace commas with spaces
      .replace(/\s+/g, ' '); // Normalize multiple spaces

    // Enhanced mapping for both Arabic and English text
    const countryMappings: { [key: string]: string } = {
      // Arabic country names (with both ة and ه endings due to normalization)
      'السعودية': 'SA',
      'السعوديه': 'SA', // After normalization ة→ه
      'سعودية': 'SA',
      'سعوديه': 'SA',
      'المملكة العربية السعودية': 'SA',
      'المملكه العربيه السعوديه': 'SA',
      'مصر': 'EG',
      'الإمارات': 'AE',
      'الامارات': 'AE',
      'امارات': 'AE',
      'دبي': 'AE',
      'أبو ظبي': 'AE',
      'ابو ظبي': 'AE',
      'قطر': 'QA',
      'الكويت': 'KW',
      'كويت': 'KW',
      'البحرين': 'BH',
      'بحرين': 'BH',
      'عمان': 'OM',
      'الأردن': 'JO',
      'الاردن': 'JO',
      'اردن': 'JO',
      'لبنان': 'LB',
      'سوريا': 'SY',
      'سوريه': 'SY',
      'العراق': 'IQ',
      'عراق': 'IQ',
      'إيران': 'IR',
      'ايران': 'IR',
      'باكستان': 'PK',
      'أفغانستان': 'AF',
      'افغانستان': 'AF',
      'فلسطين': 'PS',
      'اليمن': 'YE',
      'يمن': 'YE',
      'المغرب': 'MA',
      'مغرب': 'MA',
      'الجزائر': 'DZ',
      'جزائر': 'DZ',
      'تونس': 'TN',
      'ليبيا': 'LY',
      'ليبيه': 'LY',
      'السودان': 'SD',
      'سودان': 'SD',

      // United States variations (Arabic)
      'الولايات المتحدة': 'US',
      'الولايات المتحده': 'US',
      'الولايات': 'US',
      'الولايات المتحدة الأمريكية': 'US',
      'الولايات المتحده الامريكيه': 'US',
      'امريكا': 'US',
      'أمريكا': 'US',
      'اميريكا': 'US',
      'امريكية': 'US',
      'امريكيه': 'US',

      // European countries (Arabic)
      'النمسا': 'AT',
      'المانيا': 'DE',
      'المانيه': 'DE',
      'ألمانيا': 'DE',
      'المانية': 'DE',
      'فرنسا': 'FR',
      'ايطاليا': 'IT',
      'ايطاليه': 'IT',
      'إيطاليا': 'IT',
      'إيطاليه': 'IT',
      'اسبانيا': 'ES',
      'اسبانيه': 'ES',
      'إسبانيا': 'ES',
      'إسبانيه': 'ES',
      'البرتغال': 'PT',
      'برتغال': 'PT',
      'هولندا': 'NL',
      'هولنده': 'NL',
      'بلجيكا': 'BE',
      'بلجيكه': 'BE',
      'سويسرا': 'CH',
      'سويسره': 'CH',
      'السويد': 'SE',
      'النرويج': 'NO',
      'نرويج': 'NO',
      'الدنمارك': 'DK',
      'دنمارك': 'DK',
      'فنلندا': 'FI',
      'فنلنده': 'FI',
      'بولندا': 'PL',
      'بولنده': 'PL',
      'التشيك': 'CZ',
      'جمهورية التشيك': 'CZ',
      'جمهوريه التشيك': 'CZ',
      'المجر': 'HU',
      'رومانيا': 'RO',
      'رومانيه': 'RO',
      'بلغاريا': 'BG',
      'بلغاريه': 'BG',
      'كرواتيا': 'HR',
      'كرواتيه': 'HR',
      'اليونان': 'GR',
      'يونان': 'GR',
      'ايرلندا': 'IE',
      'ايرلنده': 'IE',
      'إيرلندا': 'IE',
      'إيرلنده': 'IE',
      'المملكة المتحدة': 'GB',
      'المملكه المتحده': 'GB',
      'بريطانيا': 'GB',
      'بريطانيه': 'GB',
      'انجلترا': 'GB',
      'إنجلترا': 'GB',
      'انجلتره': 'GB',
      'كندا': 'CA',
      'كنده': 'CA',
      'استراليا': 'AU',
      'استراليه': 'AU',
      'أستراليا': 'AU',
      'أستراليه': 'AU',
      'اليابان': 'JP',
      'يابان': 'JP',
      'الصين': 'CN',
      'صين': 'CN',
      'الهند': 'IN',
      'هند': 'IN',
      'روسيا': 'RU',
      'روسيه': 'RU',
      'البرازيل': 'BR',
      'برازيل': 'BR',
      'الارجنتين': 'AR',
      'الأرجنتين': 'AR',
      'ارجنتين': 'AR',
      'تشيلي': 'CL',
      'المكسيك': 'MX',
      'مكسيك': 'MX',
      'جنوب افريقيا': 'ZA',
      'جنوب أفريقيا': 'ZA',
      'جنوب افريقيه': 'ZA',
      'نيجيريا': 'NG',
      'نيجيريه': 'NG',
      'كينيا': 'KE',
      'كينيه': 'KE',
      'اثيوبيا': 'ET',
      'اثيوبيه': 'ET',
      'إثيوبيا': 'ET',
      'إثيوبيه': 'ET',
      'تركيا': 'TR',
      'تركيه': 'TR',
      'اندونيسيا': 'ID',
      'اندونيسيه': 'ID',
      'إندونيسيا': 'ID',
      'إندونيسيه': 'ID',
      'ماليزيا': 'MY',
      'ماليزيه': 'MY',
      'سنغافورة': 'SG',
      'سنغافوره': 'SG',
      'تايلاند': 'TH',
      'تايلند': 'TH',
      'فيتنام': 'VN',
      'الفلبين': 'PH',
      'فلبين': 'PH',
      'كوريا الجنوبية': 'KR',
      'كوريه الجنوبيه': 'KR',
      'كوريا': 'KR',
      'كوريه': 'KR',
      'تايوان': 'TW',
      'نيوزيلندا': 'NZ',
      'نيوزيلنده': 'NZ',
      'نيوزلندا': 'NZ',
      'نيوزلنده': 'NZ',

      // City-country combinations to resolve conflicts
      'عمان الأردن': 'JO',
      'عمان، الأردن': 'JO',
      'الحمراء عمان': 'OM',
      'مسقط عمان': 'OM',
      'سلطنة عمان': 'OM',

      // English variations - Enhanced
      'saudi arabia': 'SA',
      'united arab emirates': 'AE',
      'uae': 'AE',
      'emirates': 'AE',
      'dubai': 'AE',
      'abu dhabi': 'AE',
      'qatar': 'QA',
      'kuwait': 'KW',
      'bahrain': 'BH',
      'oman': 'OM',
      'jordan': 'JO',
      'lebanon': 'LB',
      'syria': 'SY',
      'iraq': 'IQ',
      'iran': 'IR',
      'pakistan': 'PK',
      'afghanistan': 'AF',
      'palestine': 'PS',
      'yemen': 'YE',
      'morocco': 'MA',
      'algeria': 'DZ',
      'tunisia': 'TN',
      'libya': 'LY',
      'sudan': 'SD',

      // Additional English country names
      'egypt': 'EG',
      'united states': 'US',
      'usa': 'US',
      'america': 'US',
      'united kingdom': 'GB',
      'uk': 'GB',
      'britain': 'GB',
      'england': 'GB',
      'scotland': 'GB',
      'wales': 'GB',
      'canada': 'CA',
      'australia': 'AU',
      'germany': 'DE',
      'france': 'FR',
      'italy': 'IT',
      'spain': 'ES',
      'netherlands': 'NL',
      'belgium': 'BE',
      'switzerland': 'CH',
      'austria': 'AT',
      'sweden': 'SE',
      'norway': 'NO',
      'denmark': 'DK',
      'finland': 'FI',
      'poland': 'PL',
      'czech republic': 'CZ',
      'hungary': 'HU',
      'romania': 'RO',
      'bulgaria': 'BG',
      'croatia': 'HR',
      'slovakia': 'SK',
      'slovenia': 'SI',
      'estonia': 'EE',
      'latvia': 'LV',
      'lithuania': 'LT',
      'greece': 'GR',
      'portugal': 'PT',
      'ireland': 'IE',
      'luxembourg': 'LU',
      'malta': 'MT',
      'cyprus': 'CY',
      'japan': 'JP',
      'south korea': 'KR',
      'korea': 'KR',
      'china': 'CN',
      'india': 'IN',
      'thailand': 'TH',
      'vietnam': 'VN',
      'indonesia': 'ID',
      'malaysia': 'MY',
      'singapore': 'SG',
      'philippines': 'PH',
      'taiwan': 'TW',
      'hong kong': 'HK',
      'brazil': 'BR',
      'argentina': 'AR',
      'chile': 'CL',
      'colombia': 'CO',
      'peru': 'PE',
      'mexico': 'MX',
      'south africa': 'ZA',
      'russia': 'RU',
      'ukraine': 'UA',
      'belarus': 'BY',
      'moldova': 'MD',
      'georgia': 'GE',
      'armenia': 'AM',
      'azerbaijan': 'AZ',
      'kazakhstan': 'KZ',
      'uzbekistan': 'UZ',
      'kyrgyzstan': 'KG',
      'tajikistan': 'TJ',
      'turkmenistan': 'TM',
      'turkey': 'TR',
      'israel': 'IL',
      'ethiopia': 'ET',
      'kenya': 'KE',
      'nigeria': 'NG',
      'ghana': 'GH',
      'senegal': 'SN',
      'ivory coast': 'CI',
      'cameroon': 'CM',
      'uganda': 'UG',
      'tanzania': 'TZ',
      'zimbabwe': 'ZW',
      'botswana': 'BW',
      'namibia': 'NA',
      'zambia': 'ZM',
      'malawi': 'MW',
      'mozambique': 'MZ',
      'madagascar': 'MG',
      'mauritius': 'MU',
      'seychelles': 'SC'
    };

    // Search in mappings - prioritize exact matches first
    for (const [key, code] of Object.entries(countryMappings)) {
      if (normalizedText === key.toLowerCase()) {
        console.log(`✅ Found exact country match: "${key}" -> ${code} in text: "${text}"`);
        return code;
      }
    }

    // Then search for partial matches
    for (const [key, code] of Object.entries(countryMappings)) {
      if (normalizedText.includes(key.toLowerCase())) {
        console.log(`✅ Found partial country match: "${key}" -> ${code} in text: "${text}"`);
        return code;
      }
    }

    // If no country found, try using getCode from country-list library one more time on individual words
    const words = text.split(/[\s,،]+/).filter(w => w.length > 2);
    for (const word of words) {
      try {
        const code = getCode(word.trim());
        if (code) {
          console.log(`✅ Found country code from word "${word}": ${code}`);
          return code;
        }
      } catch (e) {
        // Continue to next word
      }
    }

    // If still no country found, return a neutral code (XX for unknown)
    console.log(`⚠️ No country found in text: "${text}", returning unknown marker`);
    return 'XX'; // Will show a generic globe icon instead of wrong flag
  };

  // Function to get country name from country code using country-list
  const getCountryNameFromCode = (countryCode: string): string => {
    try {
      const countryName = getName(countryCode);
      if (countryName) {
        console.log(`✅ Found country name: ${countryName} for code: ${countryCode}`);
        return countryName;
      }
    } catch (error) {
      console.log(`❌ Error getting country name from code: ${error}`);
    }

    // Fallback mapping for common country codes
    const countryCodeMap: { [key: string]: string } = {
      'SA': 'Saudi Arabia',
      'EG': 'Egypt',
      'AE': 'United Arab Emirates',
      'QA': 'Qatar',
      'KW': 'Kuwait',
      'BH': 'Bahrain',
      'OM': 'Oman',
      'JO': 'Jordan',
      'LB': 'Lebanon',
      'SY': 'Syria',
      'IQ': 'Iraq',
      'IR': 'Iran',
      'PK': 'Pakistan',
      'AF': 'Afghanistan',
      'PS': 'Palestine',
      'YE': 'Yemen',
      'MA': 'Morocco',
      'DZ': 'Algeria',
      'TN': 'Tunisia',
      'LY': 'Libya',
      'SD': 'Sudan'
    };

    return countryCodeMap[countryCode] || countryCode;
  };

  // Function to get all available countries using country-list
  const getAllCountries = useCallback(() => {
    try {
      const countries = getData();
      console.log(`✅ Loaded ${countries.length} countries from country-list`);
      return countries.map((country: { code: string; name: string }) => ({
        code: country.code,
        name: country.name,
        flag: undefined // getData doesn't include flags
      }));
    } catch (error) {
      console.log(`❌ Error getting all countries: ${error}`);
      return [];
    }
  }, []);

  // Function to search countries from the loaded list
  const searchCountries = useCallback((query: string) => {
    if (!query || query.length < 2) return [];

    // Check if the search query is for a restricted location
    if (isRestrictedLocation(query)) {
      console.log(`🚫 Restricted country search detected: ${query}`);
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    return availableCountries.filter(country => {
      // Check if the country itself is restricted
      if (isRestrictedLocation(country.name)) {
        return false;
      }

      return country.name.toLowerCase().includes(normalizedQuery) ||
        country.code.toLowerCase().includes(normalizedQuery);
    }).slice(0, 10); // Limit to 10 results
  }, [availableCountries, isRestrictedLocation]);

  // Function to add country from the loaded list
  const addCountryFromList = useCallback((country: any) => {
    // Check if the country is restricted
    if (isRestrictedLocation(country.name)) {
      console.log(`🚫 Cannot add restricted country: ${country.name}`);
      alert('This country is not available for Google Ads targeting due to policy restrictions.');
      return;
    }

    const locationId = `country-${country.code}-${Date.now()}`;

    const newLocation: Location = {
      id: locationId,
      name: country.name,
      country: country.name,
      countryCode: country.code,
      radius: 0, // Countries don't use radius
      locationType: 'country',
      coordinates: { lat: 0, lng: 0 } // Will be set when boundary is drawn
    };

    setSelectedLocations(prev => [...prev, newLocation]);
    setShowCountrySearch(false); // Hide country search results
    setCountrySearchResults([]); // Clear country search results
    setSearchQuery(''); // Clear search query
    setSearchResults([]); // Clear regular search results
    console.log(`✅ Added country: ${country.name} (${country.code})`);
  }, []);


  // Search locations
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) return;

    // Check if the search query is for a restricted location
    if (isRestrictedLocation(query)) {
      console.log(`🚫 Restricted location detected: ${query}`);
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Don't search if Google Maps not ready
    if (!isGoogleMapsReady || typeof google === 'undefined' || !google.maps || !google.maps.places) {
      console.warn('⏳ Google Maps is not ready yet');
      return;
    }

    setIsSearching(true);

    try {
      // Use AutocompleteService (already loaded in useEffect)
      const autocompleteService = new google.maps.places.AutocompleteService();

      // Detect if query is in Arabic or English
      const isArabicQuery = /[\u0600-\u06FF]/.test(query);
      const searchLanguage = isArabicQuery ? 'ar' : 'en';

      console.log(`🔍 Searching for "${query}" in ${searchLanguage} language`);

      // Build request for global search without region bias
      const request: any = {
        input: query,
        types: ['(regions)'], // This includes countries, cities, and regions
        language: searchLanguage,
        sessiontoken: new Date().getTime().toString(), // Add session token for better results
        // Remove region bias to get global results
        componentRestrictions: {} // Empty to search globally
      };

      console.log(`🌍 Searching globally for "${query}" without region restrictions`);

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Filter and sort predictions
          let filteredPredictions = predictions.filter(prediction => {
            const mainText = prediction.structured_formatting?.main_text || '';
            const secondaryText = prediction.structured_formatting?.secondary_text || '';
            const fullText = `${mainText} ${secondaryText}`;

            return !isRestrictedLocation(fullText);
          });

          // Sort and filter to prioritize countries
          filteredPredictions = filteredPredictions.sort((a, b) => {
            const aTypes = a.types || [];
            const bTypes = b.types || [];
            const aSecondary = a.structured_formatting?.secondary_text || '';
            const bSecondary = b.structured_formatting?.secondary_text || '';

            // Check if it's a country
            const aIsCountry = aTypes.includes('country') || aTypes.includes('political') && (!aSecondary || aSecondary.length < 5);
            const bIsCountry = bTypes.includes('country') || bTypes.includes('political') && (!bSecondary || bSecondary.length < 5);

            // Countries come first
            if (aIsCountry && !bIsCountry) return -1;
            if (!aIsCountry && bIsCountry) return 1;

            // Check if it's a US state/city
            const aIsUS = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|USA|United States)\b/.test(aSecondary);
            const bIsUS = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|USA|United States)\b/.test(bSecondary);

            // US locations go to the end
            if (aIsUS && !bIsUS) return 1;
            if (!aIsUS && bIsUS) return -1;

            return 0;
          });

          setSearchResults(filteredPredictions);
        } else {
          setSearchResults([]);
        }
        setIsSearching(false);
      });
    } catch (error) {
      console.error('Error searching locations:', error);
      setIsSearching(false);
    }
  }, [isRestrictedLocation, isGoogleMapsReady]);

  // Add location with radius
  const addLocation = useCallback(async (result: SearchResult, radius: number = selectedRadius) => {
    if (!map) return;

    // Check if the location is restricted
    const mainText = result.structured_formatting?.main_text || '';
    const secondaryText = result.structured_formatting?.secondary_text || '';
    const fullText = `${mainText} ${secondaryText}`;

    if (isRestrictedLocation(fullText)) {
      console.log(`🚫 Cannot add restricted location: ${fullText}`);
      alert('This location is not available for Google Ads targeting due to policy restrictions.');
      return;
    }

    try {
      // Import Places library dynamically
      const { PlacesService } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      const placesService = new PlacesService(map);

      const request = {
        placeId: result.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'address_components']
      };

      placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          // Debug: Log all address components
          console.log('📍 Place details received:', {
            name: place.name,
            formatted_address: place.formatted_address,
            address_components: place.address_components
          });

          // Get country code from address_components (more accurate)
          let countryCode = getCountryCodeFromAddressComponents(place.address_components || []);

          // Get country name from address_components
          const countryComponent = place.address_components?.find(component =>
            component.types.includes('country')
          );
          const countryName = countryComponent?.long_name || result.structured_formatting.secondary_text;

          // Fallback: If no countryCode, try to detect from name or secondary text
          if (!countryCode || countryCode === 'XX' || countryCode.length !== 2) {
            const locationText = `${result.structured_formatting.main_text} ${result.structured_formatting.secondary_text}`.toLowerCase();
            console.log(`⚠️ No valid countryCode from address_components, trying fallback detection for: "${locationText}"`);

            // Saudi Arabia detection (Arabic and English)
            if (locationText.includes('saudi') || locationText.includes('السعودية') ||
              locationText.includes('رياض') || locationText.includes('riyadh') ||
              locationText.includes('jeddah') || locationText.includes('جدة') ||
              locationText.includes('dammam') || locationText.includes('الدمام')) {
              countryCode = 'SA';
              console.log('✅ Detected Saudi Arabia from location text');
            }
            // UAE detection
            else if (locationText.includes('uae') || locationText.includes('emirates') ||
              locationText.includes('الإمارات') || locationText.includes('dubai') ||
              locationText.includes('دبي') || locationText.includes('abu dhabi') ||
              locationText.includes('أبو ظبي')) {
              countryCode = 'AE';
              console.log('✅ Detected UAE from location text');
            }
            // Egypt detection
            else if (locationText.includes('egypt') || locationText.includes('مصر') ||
              locationText.includes('cairo') || locationText.includes('القاهرة')) {
              countryCode = 'EG';
              console.log('✅ Detected Egypt from location text');
            }
            // Kuwait detection
            else if (locationText.includes('kuwait') || locationText.includes('الكويت')) {
              countryCode = 'KW';
              console.log('✅ Detected Kuwait from location text');
            }
            // Qatar detection
            else if (locationText.includes('qatar') || locationText.includes('قطر') ||
              locationText.includes('doha') || locationText.includes('الدوحة')) {
              countryCode = 'QA';
              console.log('✅ Detected Qatar from location text');
            }
          }

          console.log(`✅ Final countryCode: ${countryCode} for location: ${result.structured_formatting.main_text}`);

          // Determine location type
          const locationType = getLocationType(place.address_components || []);

          // Extract English name from formatted_address (e.g., "Jeddah, Saudi Arabia")
          const formattedAddress = place.formatted_address || '';
          const englishName = formattedAddress.split(',')[0]?.trim() || result.structured_formatting.main_text;
          console.log(`🔤 English name from formatted_address: ${englishName}`);

          const newLocation: Location = {
            id: `loc_${Date.now()}`,
            name: result.structured_formatting.main_text, // Use the search result text (in user's language)
            secondaryText: result.structured_formatting.secondary_text || '', // Save secondary text for comparison
            englishName: englishName, // English name for Google Ads API
            country: countryName,
            countryCode: countryCode,
            radius: radius,
            locationType: locationType,
            coordinates: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }
          };

          setSelectedLocations(prev => [...prev, newLocation]);
          setShowCountrySearch(false); // Hide country search results
          setCountrySearchResults([]); // Clear country search results
          setSearchQuery(''); // Clear search query
          setSearchResults([]); // Clear regular search results

          // Move map to the selected location and add circle/marker based on location type
          if (map && place.geometry?.location) {
            if (locationType === 'country') {
              // For countries, add marker ONLY (no circle)
              const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: newLocation.name,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
                  scaledSize: new google.maps.Size(20, 20)
                }
              });

              // Store marker reference for later removal
              if (!markers.current) {
                markers.current = {};
              }
              markers.current[newLocation.id] = marker;

              // Move map to the country
              map.setCenter(place.geometry.location);
              map.setZoom(6); // Wider view for countries
            } else {
              // For cities and regions, add circle + marker
              const circle = new google.maps.Circle({
                strokeColor: '#FF6B6B',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF6B6B',
                fillOpacity: 0.1,
                map: map,
                center: place.geometry.location,
                radius: radius * 1000 // Convert km to meters
              });

              // Store circle reference for later updates
              circles.current[newLocation.id] = circle;

              // Add marker for cities and regions
              const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: newLocation.name,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
                  scaledSize: new google.maps.Size(20, 20)
                }
              });

              // Store marker reference for later removal
              if (!markers.current) {
                markers.current = {};
              }
              markers.current[newLocation.id] = marker;

              // Move map to the city/region
              map.setCenter(place.geometry.location);
              map.setZoom(10); // Closer view for cities/regions
            }
          }

          // Close search results after selection
          setSearchQuery('');
          setSearchResults([]);
          setShowCountrySearch(false);
          setCountrySearchResults([]);
        }
      });
    } catch (error) {
      console.error('Error loading Places library:', error);
    }
  }, [map, selectedRadius]);

  // Update circle radius on map
  const updateCircleRadius = useCallback((locationId: string, newRadius: number) => {
    setSelectedLocations(prev => prev.map(loc => {
      if (loc.id === locationId) {
        // Update the circle on the map if it exists (for cities and regions only)
        if (map && circles.current[locationId] && loc.locationType !== 'country') {
          // Update existing circle radius instead of creating new one
          circles.current[locationId].setRadius(newRadius * 1000); // Convert km to meters
          console.log(`✅ Updated circle radius for ${loc.name} to ${newRadius}km`);
        }
        return { ...loc, radius: newRadius };
      }
      return loc;
    }));
  }, [map]);

  // Focus on location (move map to location)
  const focusOnLocation = useCallback((location: Location) => {
    if (map) {
      // For ALL locations, center and zoom based on type
      map.setCenter(location.coordinates);

      if (location.locationType === 'country') {
        map.setZoom(6); // Wider view for countries
      } else {
        map.setZoom(10); // Closer view for cities/regions
      }
    }
  }, [map]);

  // Remove location and clear from map
  const removeLocation = useCallback((locationId: string) => {
    // Remove circle from map if it exists
    if (circles.current[locationId]) {
      circles.current[locationId].setMap(null);
      delete circles.current[locationId];
    }

    // Remove marker from map if it exists
    if (markers.current[locationId]) {
      markers.current[locationId].setMap(null);
      delete markers.current[locationId];
    }

    // Remove from selected locations
    setSelectedLocations(prev => prev.filter(loc => loc.id !== locationId));

    // Clear search if no locations left
    if (selectedLocations.length <= 1) {
      setSearchQuery('');
      setSearchResults([]);
    }

    console.log(`✅ Removed location ${locationId} from map`);
  }, []);

  // Clear all locations and remove from map
  const clearAllLocations = useCallback(() => {
    // Remove all circles from map
    Object.values(circles.current).forEach(circle => {
      if (circle) circle.setMap(null);
    });
    circles.current = {};

    // Remove all markers from map
    Object.values(markers.current).forEach(marker => {
      if (marker) marker.setMap(null);
    });
    markers.current = {};

    setSelectedLocations([]);

    // Clear search
    setSearchQuery('');
    setSearchResults([]);

    console.log(`✅ Cleared all locations from map`);
  }, []);

  // Handle search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchLocations]);

  // Close radius dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openRadiusDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.radius-dropdown-container')) {
          setOpenRadiusDropdown(null);
        }
      }
    };

    if (openRadiusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openRadiusDropdown]);

  // Load available countries on component mount
  useEffect(() => {
    const countries = getAllCountries();
    setAvailableCountries(countries);
    console.log(`🌍 Loaded ${countries.length} countries for targeting`);
  }, [getAllCountries]);

  // Search countries when search query changes
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      const results = searchCountries(searchQuery);
      setCountrySearchResults(results);
      setShowCountrySearch(results.length > 0);
    } else {
      setCountrySearchResults([]);
      setShowCountrySearch(false);
    }
  }, [searchQuery, searchCountries]);

  // Hide search results when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowCountrySearch(false);
        setCountrySearchResults([]);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCountrySearch(false);
        setCountrySearchResults([]);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load Google Maps in background - Don't block UI
  useEffect(() => {
    const loadEverything = async () => {
      try {
        console.log('🚀 Starting Google Maps initialization...');

        // Wait for Google Maps API to be available
        let attempts = 0;
        const maxAttempts = 200; // زيادة عدد المحاولات
        while ((!window.google || !window.google.maps) && attempts < maxAttempts) {
          console.log(`⏳ Waiting for Google Maps API... (attempt ${attempts + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 150)); // زيادة الوقت بين المحاولات
          attempts++;
        }

        if (!window.google || !window.google.maps) {
          console.error('❌ Google Maps API failed to load after', maxAttempts, 'attempts');
          console.log('ℹ️ Continuing without map - locations can still be selected');
          // لا نرمي خطأ - نسمح بالاستمرار بدون خريطة
          setIsInitializing(false);
          return;
        }

        console.log('✅ Google Maps API is ready');

        // Initialize map
        if (!mapRef.current) {
          throw new Error('Map container not available');
        }

        console.log('🗺️ Creating map instance...');
        mapRef.current.style.width = '100%';
        mapRef.current.style.height = '384px';

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 24.7136, lng: 46.6753 },
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          draggable: true,
          scrollwheel: true,
          gestureHandling: 'greedy',
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
        });

        setMap(mapInstance);
        console.log('✅ Map created successfully');

        // Initialize services
        console.log('🔧 Initializing Places services...');
        autocompleteService.current = new google.maps.places.AutocompleteService();
        placesService.current = new google.maps.places.PlacesService(mapInstance);
        console.log('✅ Places services initialized');

        // Pre-load Places library
        if (google?.maps?.importLibrary) {
          console.log('📚 Pre-loading Places library...');
          await google.maps.importLibrary("places");
          console.log('✅ Places library pre-loaded');
        }

        console.log('✅ Everything is ready!');
        setIsGoogleMapsReady(true);
        setIsInitializing(false);
      } catch (error) {
        console.error('❌ Error loading Google Maps:', error);
        console.log('ℹ️ The page will work in limited mode without map visualization');
        setIsGoogleMapsReady(false);
        setIsInitializing(false);
        // لا نعرض خطأ للمستخدم - يمكنهم الاستمرار بدون خريطة
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadEverything();
    }, 500);

    return () => clearTimeout(timer);
  }, []); // Run only once on mount

  // Draw circles and markers for NEW locations only
  useEffect(() => {
    if (map && selectedLocations.length > 0) {
      // Find new locations that don't have circles or markers yet
      const newLocations = selectedLocations.filter(location =>
        !circles.current[location.id] && !markers.current[location.id]
      );

      newLocations.forEach((location) => {
        if (location.locationType === 'country') {
          // For countries, add marker ONLY (no circle)
          if (!markers.current[location.id]) {
            const marker = new google.maps.Marker({
              position: location.coordinates,
              map: map,
              title: location.name,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
                scaledSize: new google.maps.Size(20, 20)
              }
            });

            // Store marker reference
            markers.current[location.id] = marker;
            console.log(`✅ Created marker for country ${location.name}`);
          }
        } else {
          // For cities and regions, add circle + marker
          if (!circles.current[location.id]) {
            const circle = new google.maps.Circle({
              strokeColor: '#FF6B6B',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#FF6B6B',
              fillOpacity: 0.1,
              map: map,
              center: location.coordinates,
              radius: location.radius * 1000 // Convert km to meters
            });

            // Store circle reference
            circles.current[location.id] = circle;
            console.log(`✅ Created circle for ${location.name} with radius ${location.radius}km`);
          }

          // Add marker for cities and regions
          if (!markers.current[location.id]) {
            const marker = new google.maps.Marker({
              position: location.coordinates,
              map: map,
              title: location.name,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
                scaledSize: new google.maps.Size(20, 20)
              }
            });

            // Store marker reference
            markers.current[location.id] = marker;
            console.log(`✅ Created marker for ${location.name}`);
          }
        }
      });
    }
  }, [map, selectedLocations]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        html.dark input[type="text"],
        .dark input[type="text"] {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }
        html.dark input[type="text"]::placeholder,
        .dark input[type="text"]::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.7) !important;
        }
      `}} />

      {/* Prevent zoom on mobile input focus */}
      <style jsx global>{`
        @media screen and (max-width: 768px) {
          /* Prevent zoom on input focus - font-size 16px prevents iOS zoom */
          input[type="text"],
          input[type="url"],
          input[type="tel"],
          input[type="search"] {
            font-size: 16px !important;
            transform: translateZ(0);
            -webkit-appearance: none;
          }
          
          /* Keep input container visible when keyboard opens */
          .location-input-container {
            position: relative;
            z-index: 10;
          }
        }
      `}</style>

      <div className="min-h-screen overflow-x-hidden" dir="ltr" style={{
        position: 'relative',
        minHeight: '100dvh' // Use dynamic viewport height for mobile
      }}>
        {/* Campaign Progress */}
        <CampaignProgress currentStep={1} totalSteps={3} />

        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8" style={{
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header */}
          <div className="text-center mb-3 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              {language === 'ar' ? 'أين تريد أن تظهر إعلاناتك؟' : 'Where do you want your ads to show up?'}
              {isInitializing && (
                <span className="inline-flex items-center gap-2 px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-blue-600/30 border-t-blue-600"></div>
                  {language === 'ar' ? 'جاري التحميل' : 'Loading'}
                </span>
              )}
            </h2>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-black rounded-xl shadow-2xl border-2 border-gray-300 dark:border-white p-3 sm:p-6 max-w-3xl mx-auto mb-4 sm:mb-8" style={{ overflow: 'visible' }}>
            {/* Location Search Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3 drop-shadow-sm text-left">
                {language === 'ar' ? 'موقع جمهورك' : 'Location of your audience'}
              </label>

              {/* Search Input */}
              <div className="relative mb-4 search-container location-input-container" style={{
                position: 'relative',
                zIndex: 2
              }}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:!text-white/70 w-5 h-5 z-10" />
                <input
                  type="text"
                  placeholder={!isGoogleMapsReady ? (language === 'ar' ? "جاري تحميل خرائط جوجل..." : "Loading Google Maps...") : (language === 'ar' ? "أضف مدينة أو دولة" : "Add a city or country")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={!isGoogleMapsReady}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  dir="ltr"
                  suppressHydrationWarning={true}
                  style={{
                    fontSize: '16px', // Prevent zoom on iOS
                    transform: 'translateZ(0)', // Force hardware acceleration
                    WebkitAppearance: 'none' // Remove iOS styling
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:!text-white/70 dark:hover:!text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Selected Locations Tags */}
              {selectedLocations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 relative" style={{ zIndex: 10 }}>
                  {selectedLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center space-x-2 bg-white dark:bg-black backdrop-blur-md rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-200 relative"
                      onClick={() => focusOnLocation(location)}
                      style={{ overflow: 'visible' }}
                    >
                      <ReactCountryFlag
                        countryCode={location.countryCode}
                        svg
                        style={{
                          width: '20px',
                          height: '15px',
                          borderRadius: '2px'
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {location.name}
                      </span>
                      <div className="flex items-center space-x-1 relative z-10">
                        {location.locationType !== 'country' && (
                          <div className="relative radius-dropdown-container z-[100]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenRadiusDropdown(openRadiusDropdown === location.id ? null : location.id);
                              }}
                              className="text-xs bg-white dark:bg-gray-800 backdrop-blur-md border border-gray-300 dark:border-gray-500 rounded px-2 py-1 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-1 min-w-[70px] justify-between"
                            >
                              <span>{location.radius}km+</span>
                              <ChevronDown className={`w-3 h-3 transition-transform ${openRadiusDropdown === location.id ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Custom Dropdown */}
                            {openRadiusDropdown === location.id && (
                              <div
                                className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg shadow-2xl z-[9999] min-w-[70px] overflow-hidden radius-dropdown-container"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: 'absolute',
                                  zIndex: 9999
                                }}
                              >
                                {radiusOptions.map(radius => (
                                  <button
                                    key={radius}
                                    onClick={() => {
                                      updateCircleRadius(location.id, radius);
                                      setOpenRadiusDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${location.radius === radius
                                      ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white'
                                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                      }`}
                                  >
                                    {radius}km+
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => removeLocation(location.id)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {isSearching && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-white/80">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                    <span>Searching locations...</span>
                  </div>
                </div>
              )}

              {/* Country Search Results */}
              {showCountrySearch && countrySearchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent">
                  <div className="text-sm text-gray-700 dark:text-white mb-2 font-medium">
                    🌍 Available Countries ({countrySearchResults.length})
                  </div>
                  {countrySearchResults.map((country) => {
                    const isAlreadySelected = selectedLocations.some(loc =>
                      loc.countryCode === country.code
                    );

                    return (
                      <div
                        key={country.code}
                        onClick={() => !isAlreadySelected && addCountryFromList(country)}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${isAlreadySelected
                          ? 'bg-gray-200 dark:bg-gray-900 backdrop-blur-md border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                          : 'bg-white dark:bg-black backdrop-blur-md border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <ReactCountryFlag
                                countryCode={country.code}
                                svg
                                style={{
                                  width: '20px',
                                  height: '15px',
                                  borderRadius: '2px'
                                }}
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {country.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {country.code}
                            </span>
                            {isAlreadySelected ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Plus className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Regular Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent">
                  <div className="text-sm text-gray-700 dark:text-white mb-2 font-medium">
                    📍 Locations and Cities ({searchResults.length})
                  </div>
                  {searchResults.map((result) => {
                    const isAlreadySelected = selectedLocations.some(loc => {
                      // Check if it's the exact same location by comparing both name and secondary text
                      const resultSecondary = result.structured_formatting.secondary_text || '';
                      const locSecondary = loc.secondaryText || '';
                      return loc.name === result.structured_formatting.main_text &&
                        locSecondary === resultSecondary;
                    });

                    return (
                      <div
                        key={result.place_id}
                        onClick={() => !isAlreadySelected && addLocation(result, selectedRadius)}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${isAlreadySelected
                          ? 'bg-gray-200 dark:bg-gray-900 backdrop-blur-md border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                          : 'bg-white dark:bg-black backdrop-blur-md border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const mainText = result.structured_formatting.main_text || '';
                                const secondaryText = result.structured_formatting.secondary_text || '';

                                console.log(`🔍 Search result flag: "${mainText}" | "${secondaryText}"`);

                                let countryCode = 'XX'; // Default unknown

                                // PRIORITY 1: Check secondaryText FIRST for cities (contains country info)
                                // E.g., "Leicester, UK" -> secondaryText = "UK"
                                if (secondaryText) {
                                  const secondary = secondaryText.toLowerCase();
                                  const secondaryOriginal = secondaryText;

                                  // Quick checks for common patterns in secondary text
                                  if (secondary.includes('uk') || secondary.includes('united kingdom')) {
                                    console.log(`✅ Found UK in secondary text`);
                                    countryCode = 'GB';
                                  }
                                  else if (secondary.includes('usa') || secondary.includes('united states')) {
                                    console.log(`✅ Found USA in secondary text`);
                                    countryCode = 'US';
                                  }
                                  else if (secondary.includes('canada')) {
                                    console.log(`✅ Found Canada in secondary text`);
                                    countryCode = 'CA';
                                  }
                                  // Try comprehensive detection on secondary text
                                  else {
                                    const secondaryCode = getCountryCodeFromText(secondaryText);
                                    if (secondaryCode !== 'XX') {
                                      console.log(`✅ Found country in secondaryText: "${secondaryText}" -> ${secondaryCode}`);
                                      countryCode = secondaryCode;
                                    }
                                  }
                                }

                                // PRIORITY 2: Check mainText (for when searching for country directly)
                                // E.g., when searching "الولايات", mainText will be "الولايات المتحدة"
                                if (countryCode === 'XX') {
                                  const mainTextCode = getCountryCodeFromText(mainText);
                                  if (mainTextCode !== 'XX') {
                                    console.log(`✅ Found country in mainText: "${mainText}" -> ${mainTextCode}`);
                                    countryCode = mainTextCode;
                                  }
                                }

                                // PRIORITY 3: Legacy checks (keep for backwards compatibility)
                                if (countryCode === 'XX' && secondaryText) {
                                  const secondary = secondaryText.toLowerCase();
                                  const secondaryOriginal = secondaryText;

                                  // Keep existing detailed checks as fallback
                                  if (secondary.includes('usa') || secondary.includes('united states')) {
                                    countryCode = 'US';
                                  }
                                  // Saudi Arabia
                                  else if (secondary.includes('سعود') || secondary.includes('saudi') || secondary.includes('الرياض') || secondary.includes('riyadh')) {
                                    countryCode = 'SA';
                                  }
                                  // Egypt
                                  else if (secondary.includes('مصر') || secondary.includes('egypt') || secondary.includes('القاهرة') || secondary.includes('cairo')) {
                                    countryCode = 'EG';
                                  }
                                  // UAE
                                  else if (secondary.includes('إمارات') || secondary.includes('emirates') || secondary.includes('uae') || secondary.includes('دبي') || secondary.includes('dubai') || secondary.includes('أبو ظبي') || secondary.includes('abu dhabi')) {
                                    countryCode = 'AE';
                                  }
                                  // Qatar
                                  else if (secondary.includes('قطر') || secondary.includes('qatar') || secondary.includes('الدوحة') || secondary.includes('doha')) {
                                    countryCode = 'QA';
                                  }
                                  // Kuwait
                                  else if (secondary.includes('كويت') || secondary.includes('kuwait')) {
                                    countryCode = 'KW';
                                  }
                                  // Bahrain
                                  else if (secondary.includes('بحرين') || secondary.includes('bahrain') || secondary.includes('المنامة') || secondary.includes('manama')) {
                                    countryCode = 'BH';
                                  }
                                  // Oman
                                  else if (secondary.includes('عمان') || secondary.includes('oman') || secondary.includes('مسقط') || secondary.includes('muscat')) {
                                    countryCode = 'OM';
                                  }
                                  // Jordan
                                  else if (secondary.includes('أردن') || secondary.includes('jordan') || secondary.includes('عمان') && secondary.includes('jordan')) {
                                    countryCode = 'JO';
                                  }
                                  // Lebanon
                                  else if (secondary.includes('لبنان') || secondary.includes('lebanon') || secondary.includes('بيروت') || secondary.includes('beirut')) {
                                    countryCode = 'LB';
                                  }
                                  // USA - check both English and Arabic
                                  else if (secondary.includes('united states') || secondary.includes('usa') || secondaryOriginal.includes('الولايات المتحدة') || secondaryOriginal.includes('الولايات') || secondary.includes('america') || /\b(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy)\b/i.test(secondaryText)) {
                                    countryCode = 'US';
                                  }
                                  // Morocco
                                  else if (secondary.includes('مغرب') || secondary.includes('morocco') || secondary.includes('الرباط') || secondary.includes('rabat')) {
                                    countryCode = 'MA';
                                  }
                                  // Algeria
                                  else if (secondary.includes('جزائر') || secondary.includes('algeria') || secondary.includes('الجزائر')) {
                                    countryCode = 'DZ';
                                  }
                                  // Tunisia
                                  else if (secondary.includes('تونس') || secondary.includes('tunisia')) {
                                    countryCode = 'TN';
                                  }
                                  // Libya
                                  else if (secondary.includes('ليبيا') || secondary.includes('libya') || secondary.includes('طرابلس') || secondary.includes('tripoli')) {
                                    countryCode = 'LY';
                                  }
                                  // Iraq
                                  else if (secondary.includes('عراق') || secondary.includes('iraq') || secondary.includes('بغداد') || secondary.includes('baghdad')) {
                                    countryCode = 'IQ';
                                  }
                                  // Syria
                                  else if (secondary.includes('سوريا') || secondary.includes('syria') || secondary.includes('دمشق') || secondary.includes('damascus')) {
                                    countryCode = 'SY';
                                  }
                                  // Yemen
                                  else if (secondary.includes('يمن') || secondary.includes('yemen') || secondary.includes('صنعاء') || secondary.includes('sanaa')) {
                                    countryCode = 'YE';
                                  }
                                  // Palestine
                                  else if (secondary.includes('فلسطين') || secondary.includes('palestine') || secondary.includes('القدس') || secondary.includes('jerusalem')) {
                                    countryCode = 'PS';
                                  }
                                  // Try to extract country from secondary text words
                                  else {
                                    const words = secondaryText.split(/[،,\s]+/);
                                    for (const word of words) {
                                      try {
                                        const code = getCode(word.trim());
                                        if (code) {
                                          countryCode = code;
                                          break;
                                        }
                                      } catch (e) {
                                        // Continue
                                      }
                                    }
                                  }
                                }

                                // STEP 2: If no country found yet, check if mainText is a country
                                if (!countryCode) {
                                  if (!secondaryText || secondaryText.length < 3) {
                                    try {
                                      const code = getCode(mainText);
                                      if (code) {
                                        countryCode = code;
                                      }
                                    } catch (e) {
                                      // Continue - will show globe icon
                                    }
                                  }
                                }

                                // STEP 3: If still no country found, use smart detection
                                if (!countryCode && secondaryText) {
                                  try {
                                    const detectedCode = getCountryCodeFromText(secondaryText);
                                    if (detectedCode && detectedCode !== 'XX') {
                                      countryCode = detectedCode;
                                    }
                                  } catch (e) {
                                    // Continue - will show globe icon
                                  }
                                }

                                // If no country code found, show globe icon
                                if (!countryCode || countryCode === 'XX') {
                                  return (
                                    <div className="w-5 h-5 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-sm">
                                      <span className="text-xs">🌍</span>
                                    </div>
                                  );
                                }

                                // Show country flag
                                return (
                                  <ReactCountryFlag
                                    countryCode={countryCode}
                                    svg
                                    style={{
                                      width: '20px',
                                      height: '15px',
                                      borderRadius: '2px'
                                    }}
                                  />
                                );
                              })()}
                              <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {result.structured_formatting.main_text}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {result.structured_formatting.secondary_text}
                              </p>
                            </div>
                          </div>

                          {isAlreadySelected && (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                              <span className="text-xs text-success-600 dark:text-success-400">Selected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


            {/* Map */}
            <div className="mb-6">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow border border-gray-300 dark:border-gray-700 overflow-hidden">
                {/* Map Container */}
                <div className="relative bg-gray-200 dark:bg-gray-950">
                  {isInitializing && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-600 mx-auto mb-4"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-bounce" />
                          </div>
                        </div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">{language === 'ar' ? 'جاري تحميل خرائط جوجل...' : 'Loading Google Maps...'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'جاري تحضير استهداف المواقع' : 'Preparing location targeting'}</p>
                      </div>
                    </div>
                  )}
                  <div
                    ref={mapRef}
                    className="w-full h-96"
                    style={{
                      cursor: 'grab',
                      touchAction: 'auto',
                      userSelect: 'none',
                      pointerEvents: 'auto',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons - Outside card */}
          <div className="flex justify-between items-center max-w-xl mx-auto mt-8">
            <GlowButton
              onClick={() => router.push('/google-ads/campaigns/website-url')}
              variant="green"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                {language === 'ar' ? 'الخطوة السابقة' : 'Previous Step'}
              </span>
            </GlowButton>

            <GlowButton
              disabled={selectedLocations.length === 0}
              onClick={() => {
                // Validate selections
                if (selectedLocations.length === 0) {
                  alert(language === 'ar' ? 'الرجاء اختيار موقع واحد على الأقل' : 'Please select at least one location');
                  return;
                }

                // Save selected locations to localStorage
                localStorage.setItem('selectedLocations', JSON.stringify(selectedLocations));

                // Navigate to budget-scheduling (new flow)
                router.push('/google-ads/campaigns/budget-scheduling');
              }}
              variant="purple"
            >
              <span className="flex items-center gap-2">
                {language === 'ar' ? 'الخطوة التالية' : 'Next Step'}
                <ArrowRight className="w-5 h-5" />
              </span>
            </GlowButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationTargetingPage;