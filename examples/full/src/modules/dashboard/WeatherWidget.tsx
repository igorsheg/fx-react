import { createFXModule } from "fx-react";
import { motion } from "framer-motion";
import { weatherApiModule } from "../weatherApi";
import { Sun, CloudRain, Wind, Droplets } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"

export const weatherWidgetModule = createFXModule({
  name: 'weatherWidget',
  dependencies: [weatherApiModule],
  provides: {
    WeatherWidget: ({ weather }) => ({ city = "New York" }: { city?: string }) => {
      const { data: weatherData, isLoading, error } = weather.api.useWeatherQuery(city);

      if (isLoading) {
        return (
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            </CardContent>
          </Card>
        );
      }

      if (error) {
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
              <CardDescription>Unable to load weather data</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <CloudRain className="h-12 w-12 text-red-500 mx-auto" />
            </CardContent>
          </Card>
        );
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{city}</CardTitle>
                <Sun className="h-6 w-6 text-yellow-500" />
              </div>
              <CardDescription className="text-4xl font-light">
                {weatherData?.temp}°
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl capitalize mb-4">
                {weatherData?.description}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                    <p className="font-medium">{weatherData?.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Wind className="h-4 w-4 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Wind Speed</p>
                    <p className="font-medium">{weatherData?.windSpeed} km/h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    },
    useWeatherData: ({ weather }) => (city: string) => {
      return weather.api.useWeatherQuery(city);
    }
  },
});
