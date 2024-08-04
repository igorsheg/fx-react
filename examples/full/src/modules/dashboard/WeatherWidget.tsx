import { createFXModule } from "react-fx";
import { motion } from "framer-motion";
import { weatherApiModule } from "../weatherApi";

export const weatherWidgetModule = createFXModule({
  name: 'weatherWidget',
  dependencies: [weatherApiModule],
  provides: {
    WeatherWidget: ({ weather }) => ({ city = "New York" }: { city?: string }) => {
      const { data: weatherData, isLoading, error } = weather.api.useWeatherQuery(city);

      if (isLoading) {
        return (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-500 dark:text-gray-400">Loading weather data...</p>
          </motion.div>
        );
      }

      if (error) {
        return (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-red-500 dark:text-red-400">Error loading weather data</p>
          </motion.div>
        );
      }

      return (
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Weather in {city}</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Temperature</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{weatherData?.temp}°C</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</p>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{weatherData?.description}</p>
            </div>
          </div>
        </motion.div>
      );
    },
    useWeatherData: ({ weather }) => (city: string) => {
      return weather.api.useWeatherQuery(city);
    }
  },
});
