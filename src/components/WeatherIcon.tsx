'use client';

import { Sun, Cloud, CloudSun, CloudRain, CloudLightning } from 'lucide-react';
import { WeatherCondition } from '@/types';

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

export function WeatherIcon({ condition, className = 'w-5 h-5' }: WeatherIconProps) {
  const iconProps = { className };

  switch (condition) {
    case 'sunny':
      return <Sun {...iconProps} className={`${className} text-yellow-500`} />;
    case 'partly-cloudy':
      return <CloudSun {...iconProps} className={`${className} text-yellow-400`} />;
    case 'cloudy':
      return <Cloud {...iconProps} className={`${className} text-gray-400`} />;
    case 'rainy':
      return <CloudRain {...iconProps} className={`${className} text-blue-400`} />;
    case 'stormy':
      return <CloudLightning {...iconProps} className={`${className} text-purple-500`} />;
    default:
      return <Sun {...iconProps} className={`${className} text-yellow-500`} />;
  }
}
