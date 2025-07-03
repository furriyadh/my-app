'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  className = ''
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step < currentStep
                  ? 'bg-green-500 border-green-500 text-white'
                  : step === currentStep
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              {step < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{step}</span>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

