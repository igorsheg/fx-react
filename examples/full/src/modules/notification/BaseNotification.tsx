/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from 'react';
import { createFXModule } from "react-fx";
import { loggerModule } from '../logger';
import { configModule } from '../config';

export const baseNotificationsModule = createFXModule({
  name: 'baseNotifications',
  dependencies: [loggerModule, configModule],
  provides: {
    BaseNotifications: ({ logger, config }) => {
      type Notification = {
        id: number;
        message: string;
        type: 'info' | 'success' | 'error';
      };

      return function BaseNotifications() {
        const [notifications, setNotifications] = useState<Notification[]>([]);

        const addNotification = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
          logger.log(`Adding notification: ${message}`);
          setNotifications(prev => {
            const newNotifications = [{ id: Date.now(), message, type }, ...prev];
            return newNotifications.slice(0, config.maxNotifications);
          });
        }, [logger, config.maxNotifications]);

        const removeNotification = useCallback((id: number) => {
          logger.log(`Removing notification with id: ${id}`);
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, [logger]);

        useEffect(() => {
          const timer = setInterval(() => {
            setNotifications(prev => {
              const now = Date.now();
              return prev.filter(n => now - n.id < config.notificationDuration);
            });
          }, 1000);
          return () => clearInterval(timer);
        }, [config.notificationDuration]);

        const NotificationsDisplay = () => (
          <div className="notifications">
            {notifications.map((notification, index) => (
              <div key={notification.id + index} className={`notification ${notification.type}`}>
                {notification.message}
                <button onClick={() => removeNotification(notification.id)}>×</button>
              </div>
            ))}
          </div>
        );

        return {
          NotificationsDisplay,
          addNotification,
          removeNotification
        };
      };
    },
  },
});
