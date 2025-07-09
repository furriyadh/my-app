'use client';

import React from 'react';
import { Search, Globe, Phone } from 'lucide-react';

interface SearchCampaignFormProps {
  formData: {
    websiteVisits: boolean;
    phoneCalls: boolean;
  };
  onUpdate: (data: any) => void;
  errors?: { [key: string]: string };
}

const SearchCampaignForm: React.FC<SearchCampaignFormProps> = ({
  formData,
  onUpdate,
  errors = {}
}) => {
  const campaignOptions = [
    {
      id: 'websiteVisits',
      name: 'Website visits',
      description: 'Drive traffic to your website when people search for your products or services',
      icon: <Globe className="w-6 h-6" />,
      color: 'blue',
      features: [
        'Text ads on Google Search',
        'Keyword targeting',
        'Ad extensions available',
        'Landing page optimization'
      ],
      badge: 'Most Popular'
    },
    {
      id: 'phoneCalls',
      name: 'Phone calls',
      description: 'Get phone calls from potential customers who are searching for your business',
      icon: <Phone className="w-6 h-6" />,
      color: 'green',
      features: [
        'Click-to-call ads',
        'Call tracking and reporting',
        'Local business focus',
        'Mobile-optimized'
      ]
    }
  ];

  const handleOptionChange = (optionId: string) => {
    // Reset both options first
    const newData = {
      websiteVisits: false,
      phoneCalls: false
    };
    
    // Set only the selected option to true
    newData[optionId as keyof typeof newData] = true;
    
    onUpdate(newData);
  };

  // Get the currently selected option
  const selectedOption = formData.websiteVisits ? 'websiteVisits' : formData.phoneCalls ? 'phoneCalls' : '';

  return (
    <div className="space-y-6">
      {/* Campaign Results Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select the results you want to get from this campaign
          </h3>
        </div>

        {errors.searchOptions && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{errors.searchOptions}</p>
          </div>
        )}

        <div className="space-y-4">
          {campaignOptions.map((option) => (
            <label 
              key={option.id}
              className={`relative flex items-start space-x-4 p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedOption === option.id
                  ? option.color === 'blue' 
                    ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Badge */}
              {option.badge && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {option.badge}
                  </span>
                </div>
              )}

              <input
                type="radio"
                name="searchCampaignType"
                checked={selectedOption === option.id}
                onChange={() => handleOptionChange(option.id)}
                className={`w-5 h-5 border-gray-300 focus:ring-2 mt-1 ${
                  option.color === 'blue' 
                    ? 'text-blue-600 focus:ring-blue-500' 
                    : 'text-green-600 focus:ring-green-500'
                }`}
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${
                    selectedOption === option.id
                      ? option.color === 'blue' 
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">
                    {option.name}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {option.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        option.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchCampaignForm;

