import { ReactNode } from 'react';
import { createFXModule } from "react-fx";
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => (
  <div className="error-container">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

export const errorBoundaryModule = createFXModule({
  name: 'errorBoundary',
  dependencies: [],
  provides: {
    ErrorBoundaryComponent: () => ({ children }: { children: ReactNode }) => {
      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {children}
        </ErrorBoundary>
      )
    },
  },
});
