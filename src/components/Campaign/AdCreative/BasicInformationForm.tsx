'use client';

import React from 'react';
import { Info, Globe, Phone, Video, AlertTriangle } from 'lucide-react';

interface BasicInformationFormProps {
  campaignType: string;
  campaignSubtype?: string;
  formData?: {
    campaignName: string;
    finalUrl?: string;
    phoneNumber?: string;
    videoUrl?: string;
  };
  initialData?: any;
  searchOptions?: {
    websiteVisits: boolean;
    phoneCalls: boolean;
  };
  onUpdate?: (data: any) => void;
  onSubmit?: (data: any) => void;
  errors?: { [key: string]: string };
}

// Country codes with flags
const countryCodes = [
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+98', country: 'Iran', flag: '🇮🇷' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: '+389', country: 'North Macedonia', flag: '🇲🇰' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
  { code: '+383', country: 'Kosovo', flag: '🇽🇰' },
  { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+853', country: 'Macau', flag: '🇲🇴' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+679', country: 'Fiji', flag: '🇫🇯' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼' },
  { code: '+268', country: 'Eswatini', flag: '🇸🇿' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷' },
  { code: '+594', country: 'French Guiana', flag: '🇬🇫' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', country: 'Panama', flag: '🇵🇦' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+1', country: 'Jamaica', flag: '🇯🇲' },
  { code: '+1', country: 'Bahamas', flag: '🇧🇸' },
  { code: '+1', country: 'Barbados', flag: '🇧🇧' },
  { code: '+1', country: 'Trinidad and Tobago', flag: '🇹🇹' }
];

const BasicInformationForm: React.FC<BasicInformationFormProps> = ({
  campaignType,
  campaignSubtype,
  formData,
  initialData,
  searchOptions,
  onUpdate,
  onSubmit,
  errors = {}
}) => {
  // Use formData if available, otherwise use initialData
  const data = formData || initialData || {
    campaignName: '',
    finalUrl: '',
    phoneNumber: '',
    videoUrl: ''
  };
  const [selectedCountryCode, setSelectedCountryCode] = React.useState('+966');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [urlError, setUrlError] = React.useState('');
  const [videoUrlError, setVideoUrlError] = React.useState('');

  // Determine which fields to show based on campaign type
  const shouldShowFinalUrl = () => {
    return ['performance-max', 'display', 'demand-gen'].includes(campaignType) || 
           (campaignType === 'search' && (searchOptions?.websiteVisits || searchOptions?.phoneCalls));
  };

  const shouldShowPhoneNumber = () => {
    return campaignType === 'search' && searchOptions?.phoneCalls;
  };

  const shouldShowVideoUrl = () => {
    return campaignType === 'video';
  };

  // URL validation
  const validateUrl = (url: string) => {
    if (!url) return '';
    
    // Must start with https://
    if (!url.startsWith('https://')) {
      return 'URL must start with https://';
    }
    
    // Block Wix sites
    if (url.includes('.wix.com')) {
      return 'Wix websites are not allowed';
    }
    
    // Block Google Sites
    if (url.includes('sites.google.com')) {
      return 'Google Sites are not allowed';
    }
    
    // Block 123 Website Builder
    if (url.includes('123website.') || url.includes('123site.')) {
      return '123 Website Builder sites are not allowed';
    }
    
    return '';
  };

  const handleUrlChange = (url: string) => {
    const error = validateUrl(url);
    setUrlError(error);
    const updatedData = {
      ...data,
      finalUrl: url
    };
    onUpdate?.(updatedData);
    onSubmit?.(updatedData);
  };

  const handleVideoUrlChange = (url: string) => {
    let error = '';
    if (url && !url.startsWith('https://')) {
      error = 'Video URL must start with https://';
    }
    setVideoUrlError(error);
    const updatedData = {
      ...data,
      videoUrl: url
    };
    onUpdate?.(updatedData);
    onSubmit?.(updatedData);
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    const updatedData = {
      ...data,
      phoneNumber: selectedCountryCode + value
    };
    onUpdate?.(updatedData);
    onSubmit?.(updatedData);
  };

  const handleCountryCodeChange = (code: string) => {
    setSelectedCountryCode(code);
    const updatedData = {
      ...data,
      phoneNumber: code + phoneNumber
    };
    onUpdate?.(updatedData);
    onSubmit?.(updatedData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h3>
      </div>
      
      <div className="space-y-6">
        {/* Campaign Name - Always required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Campaign name *
          </label>
          <input
            type="text"
            value={data.campaignName}
            onChange={(e) => {
              const updatedData = {
                ...data,
                campaignName: e.target.value
              };
              onUpdate?.(updatedData);
              onSubmit?.(updatedData);
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors.campaignName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter a descriptive campaign name"
          />
          {errors.campaignName && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.campaignName}</p>
          )}
        </div>

        {/* Final URL */}
        {shouldShowFinalUrl() && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website URL *
              </label>
            </div>
            <input
              type="url"
              value={data.finalUrl || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                urlError || errors.finalUrl ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="https://example.com"
            />
            {urlError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{urlError}</p>
            )}
            {errors.finalUrl && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.finalUrl}</p>
            )}
          </div>
        )}

        {/* Phone Number - For Call Ads */}
        {shouldShowPhoneNumber() && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone number *
              </label>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCountryCode}
                onChange={(e) => handleCountryCodeChange(e.target.value)}
                className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {countryCodes.map((country, index) => (
                  <option key={`${country.code}-${country.country}-${index}`} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.phoneNumber ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="123456789"
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.phoneNumber}</p>
            )}
            
            {/* Warning for Phone calls */}
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Important:</strong> Make sure your website has a clickable phone number button for better user experience and campaign performance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Video URL - For Video Campaigns */}
        {shouldShowVideoUrl() && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 text-gray-500" />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Video URL *
              </label>
            </div>
            <input
              type="url"
              value={data.videoUrl || ''}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                videoUrlError || errors.videoUrl ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="https://youtube.com/watch?v=..."
            />
            {videoUrlError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{videoUrlError}</p>
            )}
            {errors.videoUrl && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.videoUrl}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInformationForm;