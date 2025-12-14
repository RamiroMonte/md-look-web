'use client';

import { useState } from 'react';
import { TripDay, LookType } from '@/types';
import { WeatherBadge } from './WeatherBadge';
import { LookSlot } from './LookSlot';
import { CameraCapture } from './CameraCapture';
import { formatDate, formatDayOfWeek } from '@/lib/utils';
import { MapPin, Edit2 } from 'lucide-react';

interface DayCardProps {
  day: TripDay;
  onAddLook: (dayId: string, lookType: LookType, imageData: string) => void;
  onRemoveLook: (dayId: string, lookType: LookType) => void;
  onEditDay: (day: TripDay) => void;
  onViewLook?: () => void;
}

export function DayCard({ day, onAddLook, onRemoveLook, onEditDay, onViewLook }: DayCardProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [captureLookType, setCaptureLookType] = useState<LookType>('day');

  const handleCapture = (lookType: LookType) => {
    setCaptureLookType(lookType);
    setShowCamera(true);
  };

  const handleCaptureComplete = (imageData: string) => {
    onAddLook(day.id, captureLookType, imageData);
    setShowCamera(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <WeatherBadge
                weather={day.weather}
                tempMin={day.tempMin}
                tempMax={day.tempMax}
              />
            </div>
            <button
              onClick={() => onEditDay(day)}
              className="text-gray-400 hover:text-orange-500 p-1"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase">
              {formatDayOfWeek(day.date)}
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {formatDate(day.date)}
            </div>
          </div>
          {day.location && (
            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[80px]">{day.location}</span>
            </div>
          )}
          {!day.location && (
            <button
              onClick={() => onEditDay(day)}
              className="mt-1 text-[10px] text-orange-500 border border-orange-200 rounded px-2 py-0.5 w-full"
            >
              + Local
            </button>
          )}
        </div>

        {/* Looks */}
        <div className="p-2 grid grid-cols-2 gap-2">
          <LookSlot
            look={day.dayLook}
            lookType="day"
            onCapture={() => handleCapture('day')}
            onRemove={() => onRemoveLook(day.id, 'day')}
            onView={onViewLook}
          />
          <LookSlot
            look={day.nightLook}
            lookType="night"
            onCapture={() => handleCapture('night')}
            onRemove={() => onRemoveLook(day.id, 'night')}
            onView={onViewLook}
          />
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCaptureComplete}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
