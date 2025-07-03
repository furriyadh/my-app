'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { LocationData } from '@/lib/types/campaign';

interface TimezoneDisplayProps {
  location: LocationData;
}

export const TimezoneDisplay: React.FC<TimezoneDisplayProps> = ({ location }) => {
  const getLocalTime = () => {
    try {
      const now = new Date();
      const localTime = new Date(now.getTime() + (location.utcOffset * 60 * 60 * 1000));
      return localTime.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'غير متاح';
    }
  };

  const getTimezoneOffset = () => {
    const offset = location.utcOffset;
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.abs(offset);
    return `UTC${sign}${hours}`;
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <Clock className="w-4 h-4 text-blue-600" />
      <div className="text-sm">
        <div className="font-medium text-blue-800">
          التوقيت المحلي: {getLocalTime()}
        </div>
        <div className="text-blue-600">
          المنطقة الزمنية: {location.timezone} ({getTimezoneOffset()})
        </div>
      </div>
    </div>
  );
};

