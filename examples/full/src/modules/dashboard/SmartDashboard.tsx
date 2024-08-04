import { useEffect, useState } from 'react';
import { createFXModule, MergeFXDeps } from "react-fx";
import { loggerModule } from '../logger';
import { cryptoApiModule } from '../cryptoApi';
import { weatherApiModule } from '../weatherApi';
import { performanceModule } from '../performance';
import { queryClientModule } from '../queryClient';
import { enhancedNotificationsModule } from '../notification';
import { aiRecommendationModule } from './aiModule';
import { errorBoundaryModule } from '../ErrorBoundary';
import { userPreferencesModule } from './userPreferenceModule';
import { AnimatePresence, motion } from 'framer-motion';
import { weatherWidgetModule } from './WeatherWidget';

const FXModules = [
  loggerModule,
  cryptoApiModule,
  weatherApiModule,
  performanceModule,
  queryClientModule,
  enhancedNotificationsModule,
  aiRecommendationModule,
  userPreferencesModule,
  errorBoundaryModule,
  weatherWidgetModule
];

type SmartDashboardProps = MergeFXDeps<typeof FXModules>;

export const smartDashboardModule = createFXModule({
  name: 'smartDashboard',
  dependencies: FXModules,
  provides: {
    Component: ({ errorBoundary: { ErrorBoundaryComponent }, ...rest }) => {
      return () => <ErrorBoundaryComponent><SmartDashboard {...rest} /></ErrorBoundaryComponent>
    },
  },
});

function SmartDashboard({
  logger,
  performance,
  enhancedNotifications: { Notifications },
  aiRecommendation,
  userPreferences,
  weatherWidget
}: Omit<SmartDashboardProps, "errorBoundary">) {
  const { addNotification, NotificationsDisplay } = Notifications();
  const [widgets, setWidgets] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { WeatherWidget } = weatherWidget;

  const { useUserPreferences } = userPreferences

  const { savePreferences, preferences } = useUserPreferences()

  useEffect(() => {
    const initializeDashboard = async () => {
      // const prefs = await preferences;
      if (preferences) {
        setWidgets(preferences.widgets);
      }
      logger.log('Dashboard initialized with user preferences');
    };

    initializeDashboard();
  }, [logger, userPreferences, preferences]);

  const optimizeDashboard = async () => {
    setIsOptimizing(true);
    await performance.measureTime('Dashboard Optimization', async () => {
      const recommendation = await aiRecommendation.getRecommendation(
        { userId: '123', interactionHistory: ['viewed weather', 'checked crypto prices'] },
        { widgets }
      );

      switch (recommendation.type) {
        case 'add_widget':
          if (!widgets.includes(recommendation.widget)) {
            setWidgets(prev => [...prev, recommendation.widget]);
            addNotification(`Added ${recommendation.widget} widget: ${recommendation.reason}`, 'success');
          }
          break;
        case 'remove_widget':
          if (widgets.includes(recommendation.widget)) {
            setWidgets(prev => prev.filter(w => w !== recommendation.widget));
            addNotification(`Removed ${recommendation.widget} widget: ${recommendation.reason}`, 'info');
          }
          break;
        case 'reorder_widgets':
          // Implement reordering logic here
          addNotification(`Reordered widgets: ${recommendation.reason}`, 'info');
          break;
        case 'no_change':
          addNotification(`No changes recommended: ${recommendation.reason}`, 'info');
          break;
      }
    });
    setIsOptimizing(false);
  };

  const removeWidget = (widget: string) => {
    setWidgets(prev => prev.filter(w => w !== widget));
    savePreferences({ widgets: widgets.filter(w => w !== widget) });
  };
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-white mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Smart Dashboard
        </motion.h1>

        <div className="mb-8">
          <button
            onClick={optimizeDashboard}
            disabled={isOptimizing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out"
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Dashboard'}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {widgets.map((widget) => (
              <motion.div
                key={widget}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
              >
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">{widget.charAt(0).toUpperCase() + widget.slice(1)}</h2>
                {widget === 'weather' && <WeatherWidget />}
                {widget === 'crypto' && <h1>im crypto</h1>}
                {widget === 'stocks' && <h1>User profile</h1>}
                <button
                  onClick={() => removeWidget(widget)}
                  className="mt-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition duration-150 ease-in-out"
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <NotificationsDisplay />
      </div>
    </div>
  );
}

export default SmartDashboard;
