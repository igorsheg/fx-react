import type { ComponentType, ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { DependencyNotInjectedError } from './errors';
import type {
  ExtractModuleProvides,
  FXConfig,
  FXModuleDefinition,
  ResolvedDependencies,
} from './types';

export function createFXContext<T extends FXModuleDefinition<any, any>[]>() {
  type ResolvedDeps = {
    [K in T[number]['name']]: ResolvedDependencies<
      ExtractModuleProvides<Extract<T[number], { name: K }>>
    >;
  };

  const FXContext = createContext<ResolvedDeps | null>(null);

  const FXProvider = ({
    config,
    FallbackComponent,
    children,
  }: {
    config: FXConfig<T>;
    FallbackComponent?: ComponentType;
    children: ReactNode;
  }) => {
    const [resolvedDependencies, setResolvedDependencies] =
      useState<ResolvedDeps | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
      const initialize = async () => {
        try {
          const resolved = {} as ResolvedDeps;

          for (const [moduleName, module] of Object.entries(config.modules) as [
            keyof ResolvedDeps,
            FXModuleDefinition<any, any>,
          ][]) {
            console.log(`Initializing module: ${moduleName}`);

            const moduleDeps = {} as ResolvedDeps;
            for (const dep of module.dependencies) {
              if (!(dep.name in resolved)) {
                throw new DependencyNotInjectedError(module.name, dep.name);
              }
              moduleDeps[dep.name as keyof ResolvedDeps] =
                resolved[dep.name as keyof ResolvedDeps];
            }

            const providedDeps = {} as ResolvedDependencies<
              ExtractModuleProvides<typeof module>
            >;
            for (const [key, provider] of Object.entries(module.provides) as [
              any,
              (deps: ResolvedDeps) => Promise<void> | void,
            ][]) {
              providedDeps[key] = await provider(moduleDeps);
            }
            (resolved as any)[moduleName] = providedDeps;
          }

          setResolvedDependencies(resolved);
          setIsInitialized(true);

          for (const startHook of config.onStart ?? []) {
            await startHook();
          }
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error('Failed to initialize FX'),
          );
        }
      };

      void initialize();

      return () => {
        const shutdown = async () => {
          for (const stopHook of (config.onStop ?? []).reverse()) {
            await stopHook();
          }
        };
        void shutdown();
      };
    }, [config]);

    if (error) {
      return <div>Error: {error.message} </div>;
    }

    if (!isInitialized) {
      return FallbackComponent ? <FallbackComponent /> : null;
    }

    return (
      <FXContext.Provider value={resolvedDependencies}>
        {children}
      </FXContext.Provider>
    );
  };

  function useFX(): ResolvedDeps {
    const context = useContext(FXContext);
    if (!context) {
      throw new Error('useFX must be used within an FXProvider');
    }
    return context;
  }

  return { FXProvider, useFX };
}
