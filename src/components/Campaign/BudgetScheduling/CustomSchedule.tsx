'use client';

import React, { useState } from 'react';
import { Plus, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TimeSlot {
  start: string;
  end: string;
}

interface CustomScheduleData {
  days: string[];
  timeSlots: TimeSlot[];
}

interface CustomScheduleProps {
  isActive: boolean;
  data?: CustomScheduleData;
  onChange: (data: CustomScheduleData) => void;
  timezone: string;
}

export const CustomSchedule: React.FC<CustomScheduleProps> = ({
  isActive,
  data,
  onChange,
  timezone
}) => {
  const [localData, setLocalData] = useState<CustomScheduleData>(
    data || { days: [], timeSlots: [{ start: '09:00', end: '17:00' }] }
  );

  const weekDays = [
    { id: 'sunday', name: 'الأحد' },
    { id: 'monday', name: 'الاثنين' },
    { id: 'tuesday', name: 'الثلاثاء' },
    { id: 'wednesday', name: 'الأربعاء' },
    { id: 'thursday', name: 'الخميس' },
    { id: 'friday', name: 'الجمعة' },
    { id: 'saturday', name: 'السبت' }
  ];

  const handleDayToggle = (dayId: string) => {
    const newDays = localData.days.includes(dayId)
      ? localData.days.filter(d => d !== dayId)
      : [...localData.days, dayId];
    
    const newData = { ...localData, days: newDays };
    setLocalData(newData);
    onChange(newData);
  };

  const handleTimeSlotChange = (index: number, field: 'start' | 'end', value: string) => {
    const newTimeSlots = [...localData.timeSlots];
    newTimeSlots[index] = { ...newTimeSlots[index], [field]: value };
    
    const newData = { ...localData, timeSlots: newTimeSlots };
    setLocalData(newData);
    onChange(newData);
  };

  const addTimeSlot = () => {
    const newTimeSlots = [...localData.timeSlots, { start: '09:00', end: '17:00' }];
    const newData = { ...localData, timeSlots: newTimeSlots };
    setLocalData(newData);
    onChange(newData);
  };

  const removeTimeSlot = (index: number) => {
    if (localData.timeSlots.length > 1) {
      const newTimeSlots = localData.timeSlots.filter((_, i) => i !== index);
      const newData = { ...localData, timeSlots: newTimeSlots };
      setLocalData(newData);
      onChange(newData);
    }
  };

  if (!isActive) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <div className="text-gray-500 text-sm">
          اختر "جدولة مخصصة" لتخصيص أوقات العرض
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-600" />
        <h3 className="font-medium text-gray-800">الجدولة المخصصة</h3>
      </div>

      {/* اختيار الأيام */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          اختر الأيام
        </label>
        <div className="grid grid-cols-4 gap-2">
          {weekDays.map((day) => (
            <button
              key={day.id}
              onClick={() => handleDayToggle(day.id)}
              className={`p-2 text-sm rounded-lg border-2 transition-colors ${
                localData.days.includes(day.id)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>
      </div>

      {/* الفترات الزمنية */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          الفترات الزمنية ({timezone})
        </label>
        <div className="space-y-3">
          {localData.timeSlots.map((slot, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 flex-1">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">من</label>
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => handleTimeSlotChange(index, 'start', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-gray-400">-</div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">إلى</label>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => handleTimeSlotChange(index, 'end', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {localData.timeSlots.length > 1 && (
                <button
                  onClick={() => removeTimeSlot(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={addTimeSlot}
          className="mt-3 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة فترة زمنية
        </Button>
      </div>

      {/* ملخص الجدولة */}
      {localData.days.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>ملخص الجدولة:</strong> سيتم عرض الإعلانات في {localData.days.length} أيام 
            خلال {localData.timeSlots.length} فترة زمنية
          </div>
        </div>
      )}
    </div>
  );
};

