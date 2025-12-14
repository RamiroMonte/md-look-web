interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface WeatherData {
  tempMin: number;
  tempMax: number;
  weatherCode: number;
}

// Busca coordenadas de uma cidade
export async function searchCity(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching city:', error);
    return [];
  }
}

// Busca previsão do tempo para uma data específica
export async function getWeatherForDate(
  latitude: number,
  longitude: number,
  date: string
): Promise<WeatherData | null> {
  try {
    // A API Open-Meteo permite buscar previsão para até 16 dias
    // Para datas mais distantes, usamos dados climáticos históricos médios
    const today = new Date();
    const targetDate = new Date(date);
    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let url: string;

    if (diffDays >= 0 && diffDays <= 16) {
      // Previsão do tempo (próximos 16 dias)
      url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&start_date=${date}&end_date=${date}&timezone=auto`;
    } else if (diffDays < 0) {
      // Data passada - busca dados históricos
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&start_date=${date}&end_date=${date}&timezone=auto`;
    } else {
      // Data muito futura - usa média climática
      // Busca dados do mesmo período do ano anterior como estimativa
      const lastYear = new Date(targetDate);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      const lastYearDate = lastYear.toISOString().split('T')[0];
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&start_date=${lastYearDate}&end_date=${lastYearDate}&timezone=auto`;
    }

    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.daily || !data.daily.temperature_2m_max || !data.daily.temperature_2m_min) {
      return null;
    }

    return {
      tempMax: Math.round(data.daily.temperature_2m_max[0]),
      tempMin: Math.round(data.daily.temperature_2m_min[0]),
      weatherCode: data.daily.weather_code?.[0] || 0,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

// Converte código de clima da API para nosso tipo
export function weatherCodeToCondition(code: number): 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' {
  // WMO Weather interpretation codes
  // https://open-meteo.com/en/docs
  if (code === 0) return 'sunny'; // Clear sky
  if (code >= 1 && code <= 3) return 'partly-cloudy'; // Mainly clear, partly cloudy
  if (code >= 45 && code <= 48) return 'cloudy'; // Fog
  if (code >= 51 && code <= 67) return 'rainy'; // Drizzle, Rain
  if (code >= 71 && code <= 77) return 'cloudy'; // Snow
  if (code >= 80 && code <= 82) return 'rainy'; // Rain showers
  if (code >= 85 && code <= 86) return 'cloudy'; // Snow showers
  if (code >= 95 && code <= 99) return 'stormy'; // Thunderstorm

  return 'partly-cloudy';
}
