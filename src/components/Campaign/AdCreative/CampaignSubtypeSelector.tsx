'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Star, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  Info,
  AlertCircle
} from 'lucide-react';

interface CampaignSubtype {
  id: string;
  name: string;
  description: string;
  badge?: 'recommended' | 'beginner' | 'advanced';
  requirements: string[];
  autoObjective?: string;
  features?: string[];
  limitations?: string[];
}

interface CampaignSubtypeSelectorProps {
  campaignType: string;
  subtypes: CampaignSubtype[];
  onSelect: (subtype: CampaignSubtype) => void;
  selectedSubtype?: string;
}

const badgeConfig = {
  recommended: { 
    icon: <Star className="w-4 h-4" />, 
    text: 'موصى به', 
    className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
  },
  beginner: { 
    icon: <Target className="w-4 h-4" />, 
    text: 'للمبتدئين', 
    className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
  },
  advanced: { 
    icon: <Sparkles className="w-4 h-4" />, 
    text: 'متقدم', 
    className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
  }
};

const campaignTypeNames: { [key: string]: string } = {
  'search': 'حملات البحث',
  'performance-max': 'Performance Max',
  'display': 'الشبكة الإعلانية',
  'video': 'حملات الفيديو',
  'app': 'حملات التطبيقات',
  'shopping': 'حملات التسوق',
  'demand-gen': 'Demand Gen',
  'local': 'الحملات المحلية',
  'smart': 'الحملات الذكية'
};

export default function CampaignSubtypeSelector({ 
  campaignType, 
  subtypes, 
  onSelect, 
  selectedSubtype 
}: CampaignSubtypeSelectorProps) {
  const [hoveredSubtype, setHoveredSubtype] = useState<string | null>(null);

  const handleSubtypeSelect = (subtype: CampaignSubtype) => {
    onSelect(subtype);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <motion.h2 
          className="text-3xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          اختر نوع {campaignTypeNames[campaignType] || 'الحملة'}
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          اختر النوع الفرعي الذي يناسب أهدافك التسويقية المحددة
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subtypes.map((subtype, index) => (
          <motion.div
            key={subtype.id}
            className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
              selectedSubtype === subtype.id 
                ? 'border-blue-500 shadow-xl scale-105' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-xl hover:scale-105'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseEnter={() => setHoveredSubtype(subtype.id)}
            onMouseLeave={() => setHoveredSubtype(null)}
            onClick={() => handleSubtypeSelect(subtype)}
          >
            {/* Badge */}
            {subtype.badge && (
              <div className="absolute top-3 right-3 z-10">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeConfig[subtype.badge].className}`}>
                  {badgeConfig[subtype.badge].icon}
                  <span>{badgeConfig[subtype.badge].text}</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="relative p-6">
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {subtype.name}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {subtype.description}
              </p>

              {/* Auto Objective */}
              {subtype.autoObjective && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 rounded-lg">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">
                    الهدف التلقائي: {subtype.autoObjective}
                  </span>
                </div>
              )}

              {/* Requirements */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  المتطلبات:
                </h4>
                <ul className="space-y-1">
                  {subtype.requirements.slice(0, 3).map((requirement, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                  {subtype.requirements.length > 3 && (
                    <li className="text-sm text-gray-500 italic">
                      +{subtype.requirements.length - 3} متطلبات أخرى
                    </li>
                  )}
                </ul>
              </div>

              {/* Features */}
              {subtype.features && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    المميزات:
                  </h4>
                  <ul className="space-y-1">
                    {subtype.features.slice(0, 2).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitations */}
              {subtype.limitations && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    قيود:
                  </h4>
                  <ul className="space-y-1">
                    {subtype.limitations.map((limitation, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-orange-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hover Effect */}
              <AnimatePresence>
                {hoveredSubtype === subtype.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {/* Selection Indicator */}
              {selectedSubtype === subtype.id && (
                <motion.div
                  className="absolute top-3 left-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  />
                </motion.div>
              )}

              {/* Select Button */}
              <motion.div
                className={`mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all duration-200 ${
                  selectedSubtype === subtype.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm font-medium">
                  {selectedSubtype === subtype.id ? 'محدد' : 'اختيار'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Subtype Details */}
      <AnimatePresence>
        {selectedSubtype && (
          <motion.div
            className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const selected = subtypes.find(s => s.id === selectedSubtype);
              if (!selected) return null;
              
              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
                      <p className="text-gray-600">{selected.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Requirements */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        المتطلبات الكاملة:
                      </h4>
                      <ul className="space-y-2">
                        {selected.requirements.map((requirement, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Auto Objective */}
                    {selected.autoObjective && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          الهدف التلقائي:
                        </h4>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <p className="text-blue-800 font-medium">{selected.autoObjective}</p>
                          <p className="text-blue-600 text-sm mt-1">
                            سيتم اختيار هذا الهدف تلقائياً بواسطة الذكاء الاصطناعي
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5 text-purple-600" />
                        معلومات إضافية:
                      </h4>
                      <div className="space-y-2">
                        {selected.features && (
                          <div>
                            <p className="text-sm font-medium text-gray-800">المميزات:</p>
                            <ul className="text-sm text-gray-600 mt-1">
                              {selected.features.map((feature, idx) => (
                                <li key={idx}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selected.limitations && (
                          <div>
                            <p className="text-sm font-medium text-gray-800">القيود:</p>
                            <ul className="text-sm text-orange-600 mt-1">
                              {selected.limitations.map((limitation, idx) => (
                                <li key={idx}>• {limitation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

