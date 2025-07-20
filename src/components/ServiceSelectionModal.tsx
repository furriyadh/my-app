
'use client';

import React, { useState } from 'react';
import { X, Building2, User, Check } from 'lucide-react';

export type ServiceType = 'furriyadh' | 'client';

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (serviceType: ServiceType) => void;
}

const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  if (!isOpen) return null;

  const handleSelect = (serviceType: ServiceType) => {
    setSelectedService(serviceType);
    
    if (serviceType === 'client') {
      console.log('Attempting to redirect to Google OAuth...');
      window.location.href = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/google`;
    } else {
      // Save selection to localStorage
      localStorage.setItem('furriyadh_service_type', serviceType);
      
      // Call parent callback after short delay for visual feedback
      setTimeout(() => {
        onSelect(serviceType);
        onClose();
      }, 300);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 relative border border-white/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Two Ways to Manage Your Ads
          </h2>
          <p className="text-gray-600 text-sm">
            Choose the best option for your advertising needs
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Furriyadh Accounts Card */}
          <div
            onClick={() => handleSelect('furriyadh')}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
              selectedService === 'furriyadh'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80'
                : 'border-gray-200 hover:border-blue-300 bg-gradient-to-br from-blue-50/50 to-indigo-50/50'
            }`}
          >
            {/* Selection Indicator */}
            {selectedService === 'furriyadh' && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3 shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Use Furriyadh Advertising Accounts
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Professional account management with optimized campaigns and 24/7 support
            </p>

            {/* Commission */}
            <div className="bg-blue-100/90 text-blue-800 text-xs font-semibold px-3 py-2 rounded-lg text-center mb-3 border border-blue-200/50 backdrop-blur-sm">
              20% commission on advertising budget
            </div>

            {/* Button */}
            <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:shadow-md transition-all duration-200">
              Get Started
            </button>
          </div>

          {/* Client Accounts Card */}
          <div
            onClick={() => handleSelect('client')}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
              selectedService === 'client'
                ? 'border-green-500 bg-gradient-to-br from-green-50/80 to-emerald-50/80'
                : 'border-gray-200 hover:border-green-300 bg-gradient-to-br from-green-50/50 to-emerald-50/50'
            }`}
          >
            {/* Free Trial Badge */}
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              7 Days Free
            </div>

            {/* Selection Indicator */}
            {selectedService === 'client' && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-3 shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Use Your Own Advertising Accounts
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Connect your existing accounts with full control and complete transparency
            </p>

            {/* Commission */}
            <div className="bg-green-100/90 text-green-800 text-xs font-semibold px-3 py-2 rounded-lg text-center mb-3 border border-green-200/50 backdrop-blur-sm">
              0% commission on advertising budget
            </div>

            {/* Button */}
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:shadow-md transition-all duration-200">
              Connect Account
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            You can change this option later in your account settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionModal;



