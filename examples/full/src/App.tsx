/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { createFXConfig, createFXContext } from "react-fx";
import {
  autoThemingModule,
  baseNotificationsModule,
  enhancedNotificationsModule,
  configModule,
  cryptoApiModule,
  dashboardModule,
  loggerModule,
  performanceModule,
  queryClientModule,
  themingModule,
  timeStampModule,
  weatherApiModule
} from './modules';
import { analyticsModule } from './modules/bi';
import { errorBoundaryModule } from './modules/ErrorBoundary';
import { smartDashboardModule } from './modules/dashboard/SmartDashboard';
import { aiRecommendationModule } from './modules/dashboard/aiModule';
import { userPreferencesModule } from './modules/dashboard/userPreferenceModule';
import { weatherWidgetModule } from './modules/dashboard/WeatherWidget';

const FXModules = [
  configModule,
  loggerModule,
  weatherWidgetModule,
  queryClientModule,
  analyticsModule,
  baseNotificationsModule,
  themingModule,
  autoThemingModule,
  timeStampModule,
  enhancedNotificationsModule,
  performanceModule,
  errorBoundaryModule,
  weatherApiModule,
  cryptoApiModule,
  dashboardModule,
  aiRecommendationModule,
  userPreferencesModule,
  smartDashboardModule,
];

const { FXProvider, useFX } = createFXContext<typeof FXModules>();

function App() {
  const fxConfig = createFXConfig(FXModules)
    .withHooks({
      onStart: [() => console.log('Starting Weather and Crypto App')],
      onStop: [() => console.log('Stopping Weather and Crypto App')],
    });
  return (
    <FXProvider FallbackComponent={() => <div>Loading...</div>} config={fxConfig}>
      <AppContent />
    </FXProvider>
  );
}

function AppContent() {
  const deps = useFX();
  const { reactQuery, logger, enhancedNotifications: { Notifications }, smartDashboard: { Component: SmartDashboard } } = deps;
  const { QueryClientProvider } = reactQuery.queryClient;

  const { NotificationsDisplay, addNotification } = Notifications();



  useEffect(() => {
    logger.log('AppContent mounted');
    addNotification("Test", "info")
  }, []);

  return (
    <QueryClientProvider>
      <SmartDashboard />
      <NotificationsDisplay />
    </QueryClientProvider>
  );
}

export default App;
