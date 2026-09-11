/**
 * Weather Service for Ganpati Festival Intelligence
 *
 * Integrates with Open-Meteo API (keyless, reliable) with caching,
 * timeout guards, and graceful fallback to realistic local weather patterns.
 * Analyzes weather impact on crowd dynamics, outdoor queues, and pandal navigation.
 */

const WEATHER_CACHE = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const CITY_COORDINATES = {
  pune: { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  mumbai: { lat: 18.9904, lng: 72.8369, name: 'Mumbai' },
};

export class WeatherService {
  async getWeather(citySlug) {
    const slug = (citySlug || 'pune').toLowerCase();
    const cityCoord = CITY_COORDINATES[slug] || CITY_COORDINATES.pune;

    const cached = WEATHER_CACHE.get(slug);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityCoord.lat}&longitude=${cityCoord.lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability&timezone=Asia%2FKolkata`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Weather API returned status ${res.status}`);
      const data = await res.json();
      
      const current = data.current || {};
      const temp = Math.round(current.temperature_2m ?? (slug === 'mumbai' ? 29 : 26));
      const humidity = Math.round(current.relative_humidity_2m ?? (slug === 'mumbai' ? 82 : 68));
      const rainProb = data.hourly?.precipitation_probability?.[0] ?? 10;
      const windSpeed = Math.round(current.wind_speed_10m ?? 8);

      const condition = this.interpretWeatherCode(current.weather_code, rainProb);
      const impact = this.calculateCrowdImpact(temp, humidity, rainProb);

      const result = {
        city: cityCoord.name,
        temperatureC: temp,
        humidityPct: humidity,
        windSpeedKmh: windSpeed,
        rainProbabilityPct: rainProb,
        condition,
        impact,
        timestamp: new Date().toISOString(),
        source: 'Open-Meteo Live API',
      };

      WEATHER_CACHE.set(slug, { timestamp: Date.now(), data: result });
      return result;
    } catch (err) {
      // Graceful fallback to realistic festival weather in Maharashtra (Bhadrapada month)
      const isMumbai = slug === 'mumbai';
      const fallback = {
        city: cityCoord.name,
        temperatureC: isMumbai ? 29 : 26,
        humidityPct: isMumbai ? 80 : 66,
        windSpeedKmh: 9,
        rainProbabilityPct: isMumbai ? 25 : 15,
        condition: isMumbai ? 'Partly cloudy with coastal breeze' : 'Pleasant evening skies',
        impact: {
          crowdModifier: 1.0,
          queueComfort: 'Good',
          advice: 'Comfortable weather for outdoor queueing and walking along pandal routes.',
        },
        timestamp: new Date().toISOString(),
        source: 'Festival Weather Modeling (Cached/Offline Fallback)',
      };
      return fallback;
    }
  }

  interpretWeatherCode(code, rainProb) {
    if (code >= 80 || rainProb > 60) return 'Scattered monsoon showers';
    if (code >= 51 || rainProb > 35) return 'Light drizzle';
    if (code >= 1 && code <= 3) return 'Partly cloudy';
    return 'Clear and pleasant';
  }

  calculateCrowdImpact(temp, humidity, rainProb) {
    if (rainProb > 50) {
      return {
        crowdModifier: 0.85,
        queueComfort: 'Fair - Carry Umbrella',
        advice: 'Rain showers may slow outdoor procession movement; covered mandaps recommended.',
      };
    }
    if (temp > 33 || (temp > 30 && humidity > 75)) {
      return {
        crowdModifier: 0.92,
        queueComfort: 'Moderate - Stay Hydrated',
        advice: 'High humidity during peak afternoon hours; hydrate well while waiting in queues.',
      };
    }
    return {
      crowdModifier: 1.05,
      queueComfort: 'Excellent',
      advice: 'Ideal evening conditions for visiting major heritage and thematic pandals.',
    };
  }
}

export const weatherService = new WeatherService();
