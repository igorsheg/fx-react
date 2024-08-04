import { createFXModule } from "react-fx";
import { loggerModule } from "./logger";

export const analyticsModule = createFXModule({
  name: 'analytics',
  dependencies: [loggerModule],
  provides: {
    trackEvent: ({ logger }) => (eventName: string, data: unknown) => {
      logger.log(`[Analytics] Tracking event: ${eventName}, with data: ${data}`);
      console.log(`Sending analytics: ${eventName}`, data);
    },
  },
});
