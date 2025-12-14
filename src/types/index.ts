export type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy';

export interface Look {
  id: string;
  imageData: string; // Base64
  createdAt: string;
}

export interface TripDay {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  location: string;
  weather: WeatherCondition;
  tempMin: number | null;
  tempMax: number | null;
  dayLook: Look | null;
  nightLook: Look | null;
  notes?: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  createdAt: string;
  days: TripDay[];
}

export type LookType = 'day' | 'night';
