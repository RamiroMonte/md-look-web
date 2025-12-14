'use client';

import { WeatherIcon } from './WeatherIcon';
import { WeatherCondition } from '@/types';

interface WeatherBadgeProps {
  weather: WeatherCondition;
  tempMin: number | null;
  tempMax: number | null;
}

export function WeatherBadge({ weather, tempMin, tempMax }: WeatherBadgeProps) {
  const hasTemp = tempMin !== null || tempMax !== null;

  return (
    <div className="flex items-center gap-1 text-xs text-gray-600">
      <WeatherIcon condition={weather} className="w-4 h-4" />
      {hasTemp && (
        <span className="flex items-center gap-0.5">
          {tempMax !== null && (
            <span className="text-orange-500">{tempMax}°</span>
          )}
          {tempMin !== null && tempMax !== null && <span>/</span>}
          {tempMin !== null && (
            <span className="text-blue-500">{tempMin}°</span>
          )}
        </span>
      )}
    </div>
  );
}
