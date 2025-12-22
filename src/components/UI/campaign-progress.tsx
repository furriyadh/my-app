'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CampaignProgressProps {
  currentStep: number; // 0-based (0 = first step)
  totalSteps?: number;
}

const STEP_NAMES = {
  0: { en: 'Setup', ar: 'الإعداد' },
  1: { en: 'Targeting', ar: 'الاستهداف' },
  2: { en: 'AI Magic', ar: 'سحر الذكاء' }
};

const CampaignProgress: React.FC<CampaignProgressProps> = ({ 
  currentStep,
  totalSteps = 3
}) => {
  const stepName = STEP_NAMES[currentStep as keyof typeof STEP_NAMES];

  return (
    <div className="w-full bg-black border-b border-gray-800 py-3 sm:py-4 px-2 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {/* Progress Dots */}
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <React.Fragment key={index}>
                {/* Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div
                    className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300
                      ${isCompleted ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' : ''}
                      ${isCurrent ? 'bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 text-white shadow-xl shadow-purple-500/50 scale-110 sm:scale-125 ring-2 sm:ring-4 ring-purple-500/20' : ''}
                      ${isPending ? 'bg-gray-800 text-gray-600 border-2 border-gray-700' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Pulse for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-pink-600"
                      animate={{
                        scale: [1, 1.6],
                        opacity: [0.6, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* Connector Line */}
                {index < totalSteps - 1 && (
                  <div className="h-0.5 sm:h-1 w-8 sm:w-16 md:w-24 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: index < currentStep ? '100%' : '0%'
                      }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress Text */}
        <div className="mt-2 sm:mt-3 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            Step <span className="text-purple-400 font-bold">{currentStep + 1}</span> of {totalSteps}
            {stepName && (
              <>
                <span className="mx-1 sm:mx-2 text-gray-700">•</span>
                <span className="text-white font-semibold">{stepName.en}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignProgress;

