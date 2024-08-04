import { createFXModule } from "react-fx";

export const configModule = createFXModule({
  name: 'config',
  dependencies: [],
  provides: {
    openWeatherApiKey: () => import.meta.env.VITE_OPEN_WEATHER_API_KEY,
    openWeatherApiUrl: () => 'https://api.openweathermap.org/data/2.5',
    coinGeckoApiUrl: () => 'https://api.coingecko.com/api/v3',
    debug: () => true,
    notificationDuration: () => 5000,
    maxNotifications: () => 5,
    openAiApiKey: () => import.meta.env.VITE_OPENAI_API_KEY,
    openAiApiUrl: () => 'https://api.openai.com/v1',
  }
});
