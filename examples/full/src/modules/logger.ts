import { createFXModule } from "react-fx";
import { configModule } from "./config";

export const loggerModule = createFXModule({
  name: 'logger',
  dependencies: [configModule],
  provides: {
    log: ({ config }) => (message: string) => {
      if (config.debug) {
        console.log(`[Logger] ${message}`);
      }
    },
    error: () => (message: string) => {
      console.error(`[Logger] ${message}`);
    },
  },
});
