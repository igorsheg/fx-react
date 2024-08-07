import { createFXModule } from "fx-react";
import { queryClientModule } from "./queryClient";
import { configModule } from "./config";
import { loggerModule } from "./logger";

export const weatherApiModule = createFXModule(
  {
    name: 'weather',
    dependencies: [queryClientModule, configModule, loggerModule],
    provides: {
      api: ({ reactQuery, logger, config }) => {
        const { queryClient: { useQuery, client } } = reactQuery;

        const fetchWeather = async (city: string) => {
          logger.log(`Fetching weather data for ${city}`);
          const response = await fetch(`${config.openWeatherApiUrl}/weather?q=${city}&appid=${config.openWeatherApiKey}&units=metric`);
          if (!response.ok) {
            throw new Error('Failed to fetch weather data');
          }
          const data = await response.json();
          return {
            temp: data.main.temp,
            description: data.weather[0].description,
            condition: data.weather[0].condition,
          };
        };

        const useWeatherQuery = (city: string) => {
          return useQuery(['weather', city], () => fetchWeather(city), {
            onError: (error: unknown) => {
              logger.error(`Failed to fetch weather data: ${error}`);
            },
          });
        };

        return {
          getWeather: fetchWeather,
          useWeatherQuery,
          invalidateWeather: () =>
            client.invalidateQueries('weather'),
        };
      },
    },
  }
);
