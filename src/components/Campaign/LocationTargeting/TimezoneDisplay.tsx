import React, { useState, useEffect } from 'react';
import { Clock, Globe, Sun, Moon, Calendar } from 'lucide-react';
import { LocationData } from '../../../lib/types/campaign';

interface TimezoneDisplayProps {
  location: LocationData;
  showDetails?: boolean;
  compact?: boolean;
}

interface TimeInfo {
  time: string;
  date: string;
  period: 'AM' | 'PM';
  isDaytime: boolean;
  dayOfWeek: string;
  timeZoneAbbr: string;
}

const getTimezoneAbbreviation = (timezone: string): string => {
  const abbreviations: { [key: string]: string } = {
    'Asia/Riyadh': 'AST',
    'Asia/Dubai': 'GST',
    'Asia/Kuwait': 'AST',
    'Asia/Qatar': 'AST',
    'Asia/Bahrain': 'AST',
    'Asia/Muscat': 'GST',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Europe/Berlin': 'CET',
    'America/New_York': 'EST',
    'America/Los_Angeles': 'PST',
    'America/Chicago': 'CST',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Asia/Kolkata': 'IST',
    'Australia/Sydney': 'AEDT',
    'Africa/Cairo': 'EET',
    'Africa/Lagos': 'WAT',
    'Asia/Bangkok': 'ICT',
    'Asia/Singapore': 'SGT',
    'Asia/Hong_Kong': 'HKT',
    'Europe/Moscow': 'MSK',
    'America/Toronto': 'EST',
    'America/Mexico_City': 'CST',
    'America/Sao_Paulo': 'BRT',
    'Pacific/Auckland': 'NZDT',
  };
  return abbreviations[timezone] || 'UTC';
};

const calculateLocalTime = (utcOffset: number): TimeInfo => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localTime = new Date(utc + (utcOffset * 3600000));
  
  const hours = localTime.getHours();
  const minutes = localTime.getMinutes();
  const seconds = localTime.getSeconds();
  
  const period: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  const time = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const date = localTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const dayOfWeek = localTime.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Consider daytime as 6 AM to 6 PM
  const isDaytime = hours >= 6 && hours < 18;
  
  return {
    time,
    date,
    period,
    isDaytime,
    dayOfWeek,
    timeZoneAbbr: ''
  };
};

export const TimezoneDisplay: React.FC<TimezoneDisplayProps> = ({
  location,
  showDetails = true,
  compact = false
}) => {
  const [timeInfo, setTimeInfo] = useState<TimeInfo>(() => calculateLocalTime(location.utcOffset));
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const newTimeInfo = calculateLocalTime(location.utcOffset);
      newTimeInfo.timeZoneAbbr = getTimezoneAbbreviation(location.timezone);
      setTimeInfo(newTimeInfo);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [location.utcOffset, location.timezone]);

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className="flex items-center space-x-1">
          {timeInfo.isDaytime ? (
            <Sun className="w-3 h-3 text-yellow-500" />
          ) : (
            <Moon className="w-3 h-3 text-blue-400" />
          )}
          <Clock className="w-3 h-3 text-gray-500" />
        </div>
        <span className="font-mono text-gray-700">
          {timeInfo.time} {timeInfo.period}
        </span>
        <span className="text-gray-500 text-xs">
          {timeInfo.timeZoneAbbr}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {timeInfo.isDaytime ? (
              <Sun className="w-4 h-4 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-800 dark:text-white truncate">
            {location.name}
          </h3>
        </div>
        
        {showDetails && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Globe className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Time Display */}
      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-mono font-bold text-gray-800 dark:text-white">
            {timeInfo.time}
          </span>
          <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
            {timeInfo.period}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            {timeInfo.timeZoneAbbr}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{timeInfo.dayOfWeek}</span>
          </div>
          <span>{timeInfo.date}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 dark:text-gray-400">Timezone</div>
              <div className="font-medium text-gray-800 dark:text-white">
                {location.timezone}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">UTC Offset</div>
              <div className="font-medium text-gray-800 dark:text-white">
                UTC{location.utcOffset >= 0 ? '+' : ''}{location.utcOffset}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Region</div>
              <div className="font-medium text-gray-800 dark:text-white">
                {location.region}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Country</div>
              <div className="font-medium text-gray-800 dark:text-white">
                {location.country}
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Coordinates</div>
            <div className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
              {location.coordinates[0].toFixed(6)}, {location.coordinates[1].toFixed(6)}
            </div>
          </div>

          {/* Time Status Indicator */}
          <div className="flex items-center space-x-2 pt-2">
            <div className={`w-2 h-2 rounded-full ${timeInfo.isDaytime ? 'bg-yellow-400' : 'bg-blue-400'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {timeInfo.isDaytime ? 'Daytime' : 'Nighttime'} in {location.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimezoneDisplay;