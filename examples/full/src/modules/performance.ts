import { createFXModule } from "fx-react";
import { loggerModule } from "./logger";

export const performanceModule = createFXModule({
  name: 'performance',
  dependencies: [loggerModule],
  provides: {
    measureTime: ({ logger }) => async function measureTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
      const start = performance.now();
      try {
        return await fn();
      } finally {
        const end = performance.now();
        logger.log(`[Performance] ${name} took ${(end - start).toFixed(2)}ms`);
      }
    },
  },
});
