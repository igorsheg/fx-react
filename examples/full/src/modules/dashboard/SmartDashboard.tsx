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

import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';

import {
  Button
} from '@/components/ui/button';

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
            <Button
              onClick={optimizeDashboard}
              disabled={isOptimizing}
              className="inline-flex items-center px-6 py-3 rounded-full shadow-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <CogIcon className={`-ml-1 mr-2 h-5 w-5 ${isOptimizing ? 'animate-spin' : ''}`} />
              {isOptimizing ? 'Optimizing...' : 'Optimize Dashboard'}
            </Button>
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
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{widget.charAt(0).toUpperCase() + widget.slice(1)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {widget === 'weather' && <WeatherWidget />}
                    {widget === 'crypto' && <div>Crypto Widget</div>}
                    {widget === 'stocks' && <div>Stock Widget</div>}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="destructive"
                      onClick={() => removeWidget(widget)}
                    >
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardContent className="flex items-center justify-center h-full">
                <Button className="inline-flex items-center">
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Add Widget
                </Button>
              </CardContent>
            </Card>
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
