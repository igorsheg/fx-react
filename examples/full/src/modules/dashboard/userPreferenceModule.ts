import { createFXModule } from "fx-react";
import { loggerModule } from "../logger";
import { useState, useEffect, useCallback } from 'react';

export const userPreferencesModule = createFXModule({
  name: 'userPreferences',
  dependencies: [loggerModule],
  provides: {
    useUserPreferences: ({ logger }) => {
      // This is now a proper custom hook
      return function useUserPreferences() {
        const [preferences, setPreferences] = useState<{ theme: string, widgets: string[] } | null>(null);

        useEffect(() => {
          const fetchPreferences = async () => {
            logger.log('Fetching user preferences');
            const fetchedPreferences = { theme: 'dark', widgets: ['weather', 'crypto'] };
            setPreferences(fetchedPreferences);
          };
          fetchPreferences();
        }, []);

        const savePreferences = useCallback(async (newPreferences: { theme?: string, widgets?: string[] }) => {
          logger.log(`Saving user preferences: ${JSON.stringify(newPreferences)}`);
          setPreferences(prev => ({ ...prev, ...newPreferences }));
        }, []);

        const addWidget = useCallback((widget: string) => {
          savePreferences({ widgets: [...(preferences?.widgets || []), widget] });
        }, [preferences, savePreferences]);

        const removeWidget = useCallback((widget: string) => {
          savePreferences({ widgets: preferences?.widgets?.filter(w => w !== widget) || [] });
        }, [preferences, savePreferences]);

        return {
          preferences,
          savePreferences,
          addWidget,
          removeWidget,
        };
      };
    },
  },
});
