"use client";

import React, { useState } from 'react';
import {
  BusinessFormContainer,
  BusinessNameInput,
  WebsiteUrlInput,
  BusinessSectorSelect,
  BusinessSizeSelect,
  SubmitButton
} from '@/components/Dashboard/BusinessCreation';

export default function BusinessCreationPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    websiteUrl: '',
    businessSector: '',
    businessSize: 'small'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Here you can add your form submission logic
    console.log('Form data:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // You can add navigation logic here
      // For example: router.push('/dashboard/business-creation/next-step');
    }, 2000);
  };

  const isFormValid = formData.businessName.trim() !== '' && 
                     formData.businessSector !== '';

  return (
    <BusinessFormContainer>
      <BusinessNameInput
        value={formData.businessName}
        onChange={(value) => setFormData(prev => ({ ...prev, businessName: value }))}
      />
      
      <WebsiteUrlInput
        value={formData.websiteUrl}
        onChange={(value) => setFormData(prev => ({ ...prev, websiteUrl: value }))}
      />
      
      <BusinessSectorSelect
        value={formData.businessSector}
        onChange={(value) => setFormData(prev => ({ ...prev, businessSector: value }))}
      />
      
      <BusinessSizeSelect
        value={formData.businessSize}
        onChange={(value) => setFormData(prev => ({ ...prev, businessSize: value }))}
      />
      
      <SubmitButton
        onClick={handleSubmit}
        disabled={!isFormValid}
        loading={isLoading}
      />
    </BusinessFormContainer>
  );
}
