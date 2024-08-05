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
import { CogIcon, PlusIcon } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className="sm:flex sm:items-center sm:justify-between mb-12">
          <motion.h1
            className="text-4xl font-light text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Smart Dashboard
          </motion.h1>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={optimizeDashboard}
              disabled={isOptimizing}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              <CogIcon className={`-ml-1 mr-2 h-5 w-5 ${isOptimizing ? 'animate-spin' : ''}`} />
              {isOptimizing ? 'Optimizing...' : 'Optimize Dashboard'}
            </button>
          </div>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {widgets.map((widget) => (
              <motion.div
                key={widget}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-3xl"
              >
                <div className="px-6 py-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {widget.charAt(0).toUpperCase() + widget.slice(1)}
                  </h3>
                  <div className="mt-4">
                    {widget === 'weather' && <WeatherWidget />}
                    {widget === 'crypto' && <div className="text-gray-700 dark:text-gray-300">Crypto Widget</div>}
                    {widget === 'stocks' && <div className="text-gray-700 dark:text-gray-300">Stock Widget</div>}
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                  <button
                    onClick={() => removeWidget(widget)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden shadow-inner rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-600"
          >
            <div className="px-6 py-8 flex items-center justify-center h-full">
              <button
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Widget
              </button>
            </div>
          </motion.div>
        </div>
        <div className="mt-12">
          <NotificationsDisplay />
        </div>
      </div>
    </div>
  );
}

export default SmartDashboard;
