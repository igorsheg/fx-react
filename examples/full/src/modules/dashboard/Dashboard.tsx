/* eslint-disable react-refresh/only-export-components */
import React, { Suspense, useState, useEffect } from 'react';
import { createFXModule, MergeFXDeps } from "fx-react";
import { motion } from 'framer-motion';
import { loggerModule } from '../logger';
import { weatherApiModule } from '../weatherApi';
import { cryptoApiModule } from '../cryptoApi';
import { performanceModule } from '../performance';
import { queryClientModule } from '../queryClient';
import { errorBoundaryModule } from '../ErrorBoundary';
import { enhancedNotificationsModule } from '../notification';

const UserProfile = React.lazy(() => import('./UserProfile'));
const WeatherWidget = React.lazy(() => import('./WeatherWidget'));
const CryptoList = React.lazy(() => import('./CryptoList'));

const LoadingFallback = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
  </div>
);

const FXModules = [
  loggerModule,
  cryptoApiModule,
  weatherApiModule,
  performanceModule,
  queryClientModule,
  enhancedNotificationsModule
];


type DashboardProps = MergeFXDeps<typeof FXModules>;

export const dashboardModule = createFXModule({
  name: 'dashboard',
  dependencies: Object.values([...FXModules, errorBoundaryModule]),
  provides: {
    Component: ({ errorBoundary: { ErrorBoundaryComponent }, ...rest }) => {
      return () => <ErrorBoundaryComponent><Dashboard  {...rest} /></ErrorBoundaryComponent>
    },
  },
});


function Dashboard({ weather, crypto, logger, performance, enhancedNotifications: { Notifications } }: DashboardProps) {
  const { addNotification, NotificationsDisplay } = Notifications()

  const [userData, setUserData] = useState<{ name: string, email: string } | null>(null);

  const { data: weatherData, isLoading: isWeatherLoading } = weather.api.useWeatherQuery('New York');
  const { data: topCryptos, isLoading: isCryptoLoading } = crypto.api.useTopCryptosQuery(5);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await performance.measureTime('Fetch user data', async () => {
          const data = { name: 'John Doe', email: 'john@example.com' };
          setUserData(data);
          logger.log('User data fetched successfully');
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "unknown error";
        logger.error(`Error fetching user data: ${message}`);
      }
    };

    fetchUserData();
  }, [logger, performance]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome to Your Dashboard
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-300">
            Stay up to date with your profile, weather, and crypto information.
          </p>
        </motion.div>

        <div className="mt-12">
          <button
            onClick={() => addNotification("Notification added!", "info")}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Add Notification
          </button>
        </div>

        <NotificationsDisplay />

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<LoadingFallback />}>
            {userData && <UserProfile userData={userData} />}
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            {!isWeatherLoading && weatherData && (
              <WeatherWidget weatherData={weatherData} />
            )}
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            {!isCryptoLoading && topCryptos && (
              <CryptoList cryptos={topCryptos} />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

