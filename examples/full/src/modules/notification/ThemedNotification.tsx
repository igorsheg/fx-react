/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from 'react';
import { createFXModule } from "fx-react";
import { baseNotificationsModule } from './BaseNotification';
import { motion, AnimatePresence } from 'framer-motion';

export const themingModule = createFXModule({
  name: 'theming',
  dependencies: [],
  provides: {
    useTheme: () => () => {
      const [theme, setTheme] = useState({
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderColor: '#e5e7eb',
      });
      return { theme, setTheme };
    }
  }
});

export const timeStampModule = createFXModule({
  name: 'timeStamp',
  dependencies: [],
  provides: {
    addTimeStamp: () => () => (message: string) => `${new Date().toLocaleTimeString()} - ${message}`
  }
});

export const autoThemingModule = createFXModule({
  name: 'autoTheming',
  dependencies: [themingModule],
  provides: {
    useAutoTheme: ({ theming }) => () => {
      const { setTheme } = theming.useTheme();
      useEffect(() => {
        const updateTheme = () => {
          const hour = new Date().getHours();
          if (hour >= 6 && hour < 18) {
            setTheme({
              backgroundColor: '#ffffff',
              textColor: '#1f2937',
              borderColor: '#e5e7eb',
            });
          } else {
            setTheme({
              backgroundColor: '#1f2937',
              textColor: '#f3f4f6',
              borderColor: '#374151',
            });
          }
        };
        updateTheme();
        const interval = setInterval(updateTheme, 60000);
        return () => clearInterval(interval);
      }, [setTheme]);
    }
  }
});

export const enhancedNotificationsModule = createFXModule({
  name: 'enhancedNotifications',
  dependencies: [baseNotificationsModule, themingModule, timeStampModule, autoThemingModule],
  provides: {
    Notifications: ({ baseNotifications, theming, timeStamp, autoTheming }) => {
      return function EnhancedNotifications() {
        const baseInstance = baseNotifications.BaseNotifications();
        const { theme } = theming.useTheme();
        const addTimeStamp = timeStamp.addTimeStamp();
        autoTheming.useAutoTheme();

        const ThemedNotificationsDisplay = () => {
          const notifications = useMemo(() => {
            return baseInstance.NotificationsDisplay().props.children;
          }, [baseInstance.NotificationsDisplay().props.children]);

          return (
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
              <AnimatePresence initial={false}>
                {notifications.map((notification: React.ReactElement) => (
                  <motion.div
                    key={notification.key}
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                    style={{
                      backgroundColor: theme.backgroundColor,
                      color: theme.textColor,
                      borderColor: theme.borderColor,
                    }}
                  >
                    {React.cloneElement(notification, {
                      className: `${notification.props.className} px-4 py-3 text-sm`
                    })}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          );
        };

        const enhancedAddNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
          baseInstance.addNotification(addTimeStamp(message), type);
        };

        return {
          ...baseInstance,
          NotificationsDisplay: ThemedNotificationsDisplay,
          addNotification: enhancedAddNotification,
        };
      };
    },
  },
});
