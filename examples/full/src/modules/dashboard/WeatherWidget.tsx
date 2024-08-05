import { createFXModule } from "react-fx";
import { motion } from "framer-motion";
import { weatherApiModule } from "../weatherApi";
import { Sun, CloudRain, Loader, Wind, Droplets } from "lucide-react";

export const weatherWidgetModule = createFXModule({
  name: 'weatherWidget',
  dependencies: [weatherApiModule],
  provides: {
    WeatherWidget: ({ weather }) => ({ city = "New York" }: { city?: string }) => {
      const { data: weatherData, isLoading, error } = weather.api.useWeatherQuery(city);

      const containerClasses = "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg overflow-hidden";
      const contentClasses = "p-8";

      if (isLoading) {
        return (
          <motion.div
            className={`${containerClasses} ${contentClasses} flex items-center justify-center h-64`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Loader className="animate-spin h-8 w-8 text-blue-500" />
          </motion.div>
        );
      }

      if (error) {
        return (
          <motion.div
            className={`${containerClasses} ${contentClasses} flex items-center justify-center h-64`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <CloudRain className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Unable to load weather data</p>
            </div>
          </motion.div>
        );
      }

      return (
        <motion.div
          className={containerClasses}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={contentClasses}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                {city}
              </h3>
              <Sun className="h-10 w-10 text-yellow-500" />
            </div>

            <div className="mb-8">
              <p className="text-6xl font-light text-gray-900 dark:text-white">
                {weatherData?.temp}°
              </p>
              <p className="mt-2 text-xl text-gray-600 dark:text-gray-300 capitalize">
                {weatherData?.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Droplets className="h-6 w-6 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Humidity</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{weatherData?.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center">
                <Wind className="h-6 w-6 text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wind Speed</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{weatherData?.windSpeed} km/h</p>
                </div>
              </div>
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
