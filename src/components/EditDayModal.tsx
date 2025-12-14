'use client';

import { useState, useEffect, useCallback } from 'react';
import { TripDay, WeatherCondition } from '@/types';
import { WeatherIcon } from './WeatherIcon';
import { X, Loader2, MapPin } from 'lucide-react';
import { formatDateFull } from '@/lib/utils';
import { searchCity, getWeatherForDate, weatherCodeToCondition } from '@/lib/weather';

interface EditDayModalProps {
  day: TripDay;
  onSave: (updates: {
    location: string;
    weather: WeatherCondition;
    tempMin: number | null;
    tempMax: number | null;
    notes: string;
  }) => void;
  onClose: () => void;
}

interface CityResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

const weatherOptions: { value: WeatherCondition; label: string }[] = [
  { value: 'sunny', label: 'Ensolarado' },
  { value: 'partly-cloudy', label: 'Parcialmente nublado' },
  { value: 'cloudy', label: 'Nublado' },
  { value: 'rainy', label: 'Chuvoso' },
  { value: 'stormy', label: 'Tempestade' },
];

export function EditDayModal({ day, onSave, onClose }: EditDayModalProps) {
  const [location, setLocation] = useState(day.location);
  const [weather, setWeather] = useState<WeatherCondition>(day.weather);
  const [tempMin, setTempMin] = useState(day.tempMin?.toString() || '');
  const [tempMax, setTempMax] = useState(day.tempMax?.toString() || '');
  const [notes, setNotes] = useState(day.notes || '');

  // City search state
  const [searchQuery, setSearchQuery] = useState(day.location);
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Debounced city search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setCityResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCity(searchQuery);
      setCityResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectCity = useCallback(async (city: CityResult) => {
    const cityName = city.admin1
      ? `${city.name}, ${city.admin1}`
      : `${city.name}, ${city.country}`;

    setLocation(cityName);
    setSearchQuery(cityName);
    setShowResults(false);
    setCityResults([]);

    // Buscar temperatura automaticamente
    setIsLoadingWeather(true);
    const weatherData = await getWeatherForDate(city.latitude, city.longitude, day.date);

    if (weatherData) {
      setTempMax(weatherData.tempMax.toString());
      setTempMin(weatherData.tempMin.toString());
      setWeather(weatherCodeToCondition(weatherData.weatherCode));
    }
    setIsLoadingWeather(false);
  }, [day.date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      location,
      weather,
      tempMin: tempMin ? parseInt(tempMin) : null,
      tempMax: tempMax ? parseInt(tempMax) : null,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-900">
            {formatDateFull(day.date)}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Location with autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local / Cidade
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setLocation(e.target.value);
                }}
                onFocus={() => cityResults.length > 0 && setShowResults(true)}
                placeholder="Digite o nome da cidade..."
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {(isSearching || isLoadingWeather) && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" />
              )}
            </div>

            {/* City suggestions dropdown */}
            {showResults && cityResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {cityResults.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center gap-2 border-b last:border-b-0"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{city.name}</div>
                      <div className="text-xs text-gray-500">
                        {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isLoadingWeather && (
              <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Buscando temperatura...
              </p>
            )}
          </div>

          {/* Weather */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clima
            </label>
            <div className="grid grid-cols-5 gap-2">
              {weatherOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setWeather(option.value)}
                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition-colors ${
                    weather === option.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <WeatherIcon condition={option.value} className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temp. Max
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={tempMax}
                  onChange={(e) => setTempMax(e.target.value)}
                  placeholder="--"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  °C
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temp. Min
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={tempMin}
                  onChange={(e) => setTempMin(e.target.value)}
                  placeholder="--"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  °C
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas / Evento
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Jantar, Passeio..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoadingWeather}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
