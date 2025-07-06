"use client";

import React from 'react';
import { Calendar, Clock, Settings } from 'lucide-react';

interface ScheduleSettings {
  startDate: string;
  endDate: string;
  dailySchedule: {
    [key: string]: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  };
}

interface CustomScheduleProps {
  scheduleSettings: ScheduleSettings;
  setScheduleSettings: (settings: ScheduleSettings) => void;
}

const CustomSchedule: React.FC<CustomScheduleProps> = ({ scheduleSettings, setScheduleSettings }) => {
  const daysOfWeek = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' }
  ];

  const updateDaySchedule = (day: string, field: string, value: any) => {
    setScheduleSettings({
      ...scheduleSettings,
      dailySchedule: {
        ...scheduleSettings.dailySchedule,
        [day]: {
          ...scheduleSettings.dailySchedule[day],
          [field]: value
        }
      }
    });
  };

  const toggleAllDays = (enabled: boolean) => {
    const newDailySchedule = { ...scheduleSettings.dailySchedule };
    daysOfWeek.forEach(day => {
      newDailySchedule[day.key] = {
        ...newDailySchedule[day.key],
        enabled
      };
    });
    setScheduleSettings({
      ...scheduleSettings,
      dailySchedule: newDailySchedule
    });
  };

  const calculateDuration = () => {
    if (!scheduleSettings.startDate || !scheduleSettings.endDate) return 0;
    const start = new Date(scheduleSettings.startDate);
    const end = new Date(scheduleSettings.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Campaign Duration */}
      <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Duration</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set start and end dates</p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={scheduleSettings.startDate}
              onChange={(e) => setScheduleSettings({
                ...scheduleSettings,
                startDate: e.target.value
              })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={scheduleSettings.endDate}
              onChange={(e) => setScheduleSettings({
                ...scheduleSettings,
                endDate: e.target.value
              })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {calculateDuration() > 0 && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              Campaign Duration: {calculateDuration()} days
            </p>
          </div>
        )}
      </div>

      {/* Daily Schedule */}
      <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daily Schedule</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure when ads should run</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => toggleAllDays(true)}
            className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            Enable All
          </button>
          <button
            onClick={() => toggleAllDays(false)}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Disable All
          </button>
        </div>

        {/* Days Configuration */}
        <div className="space-y-4">
          {daysOfWeek.map((day) => {
            const daySchedule = scheduleSettings.dailySchedule[day.key];
            return (
              <div key={day.key} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={daySchedule?.enabled || false}
                      onChange={(e) => updateDaySchedule(day.key, 'enabled', e.target.checked)}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="font-semibold text-gray-900 dark:text-white">{day.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{day.short}</span>
                </div>

                {daySchedule?.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={daySchedule.startTime || '09:00'}
                        onChange={(e) => updateDaySchedule(day.key, 'startTime', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={daySchedule.endTime || '18:00'}
                        onChange={(e) => updateDaySchedule(day.key, 'endTime', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Schedule Summary */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Schedule Summary</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {daysOfWeek.filter(day => scheduleSettings.dailySchedule[day.key]?.enabled).length} days active
            {calculateDuration() > 0 && ` • ${calculateDuration()} days total duration`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomSchedule;
