'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Globe,
  Users,
  Search,
  Target,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  Filter,
  UserCheck,
  Calendar,
  DollarSign,
  Heart,
  Briefcase,
  Home,
  Baby,
  GraduationCap
} from 'lucide-react';

const TargetingOptions = ({ data, updateData, errors, onValidate }) => {
  const [keywordInput, setKeywordInput] = useState('');
  const [negativeKeywordInput, setNegativeKeywordInput] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [showAdvancedDemographics, setShowAdvancedDemographics] = useState(false);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);

  // Location suggestions (in real app, this would come from Google Places API)
  const locationSuggestions = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Japan',
    'Brazil',
    'India',
    'Mexico',
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Jose, CA'
  ];

  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  // Demographics options
  const demographicsOptions = {
    ageGroups: [
      { id: '18-24', name: '18-24 years' },
      { id: '25-34', name: '25-34 years' },
      { id: '35-44', name: '35-44 years' },
      { id: '45-54', name: '45-54 years' },
      { id: '55-64', name: '55-64 years' },
      { id: '65+', name: '65+ years' }
    ],
    genders: [
      { id: 'male', name: 'Male' },
      { id: 'female', name: 'Female' },
      { id: 'unknown', name: 'Unknown' }
    ],
    parentalStatus: [
      { id: 'parent', name: 'Parent' },
      { id: 'not_parent', name: 'Not a parent' },
      { id: 'unknown', name: 'Unknown' }
    ],
    householdIncome: [
      { id: 'top_10', name: 'Top 10%' },
      { id: 'top_11_20', name: '11-20%' },
      { id: 'top_21_30', name: '21-30%' },
      { id: 'top_31_40', name: '31-40%' },
      { id: 'top_41_50', name: '41-50%' },
      { id: 'lower_50', name: 'Lower 50%' }
    ]
  };

  // Audience interests
  const audienceInterests = [
    { id: 'technology', name: 'Technology', icon: <Target className="w-4 h-4" /> },
    { id: 'business', name: 'Business & Finance', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'health', name: 'Health & Fitness', icon: <Heart className="w-4 h-4" /> },
    { id: 'education', name: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'home', name: 'Home & Garden', icon: <Home className="w-4 h-4" /> },
    { id: 'family', name: 'Family & Parenting', icon: <Baby className="w-4 h-4" /> },
    { id: 'travel', name: 'Travel', icon: <Globe className="w-4 h-4" /> },
    { id: 'food', name: 'Food & Dining', icon: <Users className="w-4 h-4" /> }
  ];

  // Handle field changes
  const handleFieldChange = (field, value) => {
    updateData({ [field]: value });
  };

  // Handle demographics change
  const handleDemographicsChange = (category, value) => {
    const currentDemographics = data.demographics || {};
    const currentCategory = currentDemographics[category] || [];
    
    let updatedCategory;
    if (currentCategory.includes(value)) {
      updatedCategory = currentCategory.filter(item => item !== value);
    } else {
      updatedCategory = [...currentCategory, value];
    }
    
    updateData({
      demographics: {
        ...currentDemographics,
        [category]: updatedCategory
      }
    });
  };

  // Add location
  const addLocation = (location) => {
    const currentLocations = data.locations || [];
    if (!currentLocations.includes(location)) {
      updateData({ locations: [...currentLocations, location] });
    }
    setLocationSearch('');
  };

  // Remove location
  const removeLocation = (location) => {
    const currentLocations = data.locations || [];
    updateData({ locations: currentLocations.filter(loc => loc !== location) });
  };

  // Add keyword
  const addKeyword = () => {
    if (keywordInput.trim()) {
      const currentKeywords = data.keywords || [];
      const newKeywords = keywordInput.split(',').map(k => k.trim()).filter(k => k);
      const uniqueKeywords = [...new Set([...currentKeywords, ...newKeywords])];
      updateData({ keywords: uniqueKeywords });
      setKeywordInput('');
    }
  };

  // Remove keyword
  const removeKeyword = (keyword) => {
    const currentKeywords = data.keywords || [];
    updateData({ keywords: currentKeywords.filter(k => k !== keyword) });
  };

  // Add negative keyword
  const addNegativeKeyword = () => {
    if (negativeKeywordInput.trim()) {
      const currentNegativeKeywords = data.negativeKeywords || [];
      const newNegativeKeywords = negativeKeywordInput.split(',').map(k => k.trim()).filter(k => k);
      const uniqueNegativeKeywords = [...new Set([...currentNegativeKeywords, ...newNegativeKeywords])];
      updateData({ negativeKeywords: uniqueNegativeKeywords });
      setNegativeKeywordInput('');
    }
  };

  // Remove negative keyword
  const removeNegativeKeyword = (keyword) => {
    const currentNegativeKeywords = data.negativeKeywords || [];
    updateData({ negativeKeywords: currentNegativeKeywords.filter(k => k !== keyword) });
  };

  // Toggle audience interest
  const toggleAudienceInterest = (interest) => {
    const currentAudiences = data.audiences || [];
    let updatedAudiences;
    
    if (currentAudiences.includes(interest)) {
      updatedAudiences = currentAudiences.filter(aud => aud !== interest);
    } else {
      updatedAudiences = [...currentAudiences, interest];
    }
    
    updateData({ audiences: updatedAudiences });
  };

  // Filter location suggestions
  const filteredLocationSuggestions = locationSuggestions.filter(location =>
    location.toLowerCase().includes(locationSearch.toLowerCase()) &&
    !(data.locations || []).includes(location)
  );

  return (
    <div className="space-y-8">
      {/* Geographic Targeting */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Geographic Targeting *
        </label>
        
        {/* Location Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            placeholder="Search for countries, states, cities..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Location Suggestions */}
        {locationSearch && filteredLocationSuggestions.length > 0 && (
          <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
            {filteredLocationSuggestions.slice(0, 10).map((location) => (
              <button
                key={location}
                onClick={() => addLocation(location)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{location}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected Locations */}
        <div className="space-y-2">
          {(data.locations || []).map((location) => (
            <div
              key={location}
              className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-900 dark:text-blue-100">{location}</span>
              </div>
              <button
                onClick={() => removeLocation(location)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {errors.locations && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.locations}</p>
        )}
      </div>

      {/* Language Targeting */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Language Targeting
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {languages.map((language) => (
            <label
              key={language.code}
              className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(data.languages || []).includes(language.code)}
                onChange={(e) => {
                  const currentLanguages = data.languages || [];
                  if (e.target.checked) {
                    updateData({ languages: [...currentLanguages, language.code] });
                  } else {
                    updateData({ languages: currentLanguages.filter(lang => lang !== language.code) });
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900 dark:text-white">{language.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Demographics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Demographics
          </label>
          <button
            onClick={() => setShowAdvancedDemographics(!showAdvancedDemographics)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {showAdvancedDemographics ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Age Groups */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Age Groups</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {demographicsOptions.ageGroups.map((age) => (
                <label
                  key={age.id}
                  className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(data.demographics?.ageGroups || []).includes(age.id)}
                    onChange={() => handleDemographicsChange('ageGroups', age.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">{age.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Gender</h4>
            <div className="grid grid-cols-3 gap-3">
              {demographicsOptions.genders.map((gender) => (
                <label
                  key={gender.id}
                  className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(data.demographics?.genders || []).includes(gender.id)}
                    onChange={() => handleDemographicsChange('genders', gender.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">{gender.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Demographics */}
          {showAdvancedDemographics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Parental Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Parental Status</h4>
                <div className="grid grid-cols-3 gap-3">
                  {demographicsOptions.parentalStatus.map((status) => (
                    <label
                      key={status.id}
                      className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(data.demographics?.parentalStatus || []).includes(status.id)}
                        onChange={() => handleDemographicsChange('parentalStatus', status.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{status.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Household Income */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Household Income</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {demographicsOptions.householdIncome.map((income) => (
                    <label
                      key={income.id}
                      className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(data.demographics?.householdIncome || []).includes(income.id)}
                        onChange={() => handleDemographicsChange('householdIncome', income.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{income.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Audience Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Audience Interests
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {audienceInterests.map((interest) => (
            <div
              key={interest.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                (data.audiences || []).includes(interest.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => toggleAudienceInterest(interest.id)}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  (data.audiences || []).includes(interest.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {interest.icon}
                </div>
                <span className={`text-sm font-medium ${
                  (data.audiences || []).includes(interest.id)
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {interest.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords (for Search campaigns) */}
      {data.campaignType === 'SEARCH' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Keywords *
          </label>
          
          {/* Keyword Input */}
          <div className="flex space-x-2 mb-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Enter keywords (comma-separated)"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={addKeyword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Keywords List */}
          <div className="space-y-2 mb-4">
            {(data.keywords || []).map((keyword, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-700"
              >
                <span className="text-sm text-green-900 dark:text-green-100">{keyword}</span>
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {errors.keywords && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errors.keywords}</p>
          )}

          {/* Negative Keywords */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Negative Keywords
              <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            
            <div className="flex space-x-2 mb-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <X className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={negativeKeywordInput}
                  onChange={(e) => setNegativeKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNegativeKeyword()}
                  placeholder="Enter negative keywords (comma-separated)"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={addNegativeKeyword}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {(data.negativeKeywords || []).map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-700"
                >
                  <span className="text-sm text-red-900 dark:text-red-100">-{keyword}</span>
                  <button
                    onClick={() => removeNegativeKeyword(keyword)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Targeting Summary */}
      {(data.locations?.length > 0 || data.audiences?.length > 0 || data.keywords?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                Targeting Summary
              </h4>
              <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                {data.locations?.length > 0 && (
                  <p>
                    <span className="font-medium">Locations:</span> {data.locations.length} selected
                  </p>
                )}
                {data.audiences?.length > 0 && (
                  <p>
                    <span className="font-medium">Audience Interests:</span> {data.audiences.length} selected
                  </p>
                )}
                {data.keywords?.length > 0 && (
                  <p>
                    <span className="font-medium">Keywords:</span> {data.keywords.length} added
                  </p>
                )}
                {data.negativeKeywords?.length > 0 && (
                  <p>
                    <span className="font-medium">Negative Keywords:</span> {data.negativeKeywords.length} added
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Targeting Tips
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li>• Start with broader targeting and narrow down based on performance</li>
              <li>• Use negative keywords to exclude irrelevant traffic</li>
              <li>• Consider your customer demographics when setting age and gender targets</li>
              <li>• Test different audience interests to find what works best</li>
              <li>• Monitor location performance and adjust geographic targeting accordingly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetingOptions;

