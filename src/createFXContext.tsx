import type { ComponentType, ReactNode } from 'react';
import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  memo
} from 'react';

import {
  createContext,
  useContext,
  useContextSelector,
  useContextUpdate,
} from './context';

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

  const FXProvider = memo(
    ({
      config,
      FallbackComponent,
      children,
    }: {
      config: FXConfig<T>;
      FallbackComponent?: ComponentType;
      children: ReactNode;
    }) => {
      const renderCount = useRef(0);
      renderCount.current += 1;

      const [resolvedDependencies, setResolvedDependencies] =
        useState<ResolvedDeps | null>(null);
      const [error, setError] = useState<Error | null>(null);
      const [isInitialized, setIsInitialized] = useState(false);

      const initialize = useCallback(async () => {
        try {
          const resolved = {} as ResolvedDeps;
          for (const [moduleName, module] of Object.entries(config.modules) as [
            keyof ResolvedDeps,
            FXModuleDefinition<any, any>,
          ][]) {
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

            if (module.decorates) {
              for (const decorator of module.decorates) {
                await decorator({ ...moduleDeps, ...providedDeps });
              }
            }

            if (module.invokes) {
              for (const invoke of module.invokes) {
                await invoke({ ...moduleDeps, ...providedDeps });
              }
            }
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
      }, [config]);

      useEffect(() => {
        void initialize();
        return () => {
          const shutdown = async () => {
            for (const stopHook of (config.onStop ?? []).reverse()) {
              await stopHook();
            }
          };
          void shutdown();
        };
      }, [initialize, config.onStop]);

      const contextUpdate = useContextUpdate(FXContext);

      const memoizedValue = useMemo(() => {
        return resolvedDependencies;
      }, [resolvedDependencies]);

      useEffect(() => {
        if (memoizedValue) {
          contextUpdate(() => { }, { suspense: false });
        }
      }, [memoizedValue, contextUpdate]);

      if (error) {
        return <div>Error: {error.message} </div>;
      }
      if (!isInitialized) {
        return FallbackComponent ? <FallbackComponent /> : null;
      }
      return (
        <FXContext.Provider value={memoizedValue}>
          {children}
        </FXContext.Provider>
      );
    },
  );

  FXProvider.displayName = 'FXProvider';

  function useFX(): ResolvedDeps {
    const context = useContext(FXContext);
    if (!context) {
      console.error('useFX called outside of FXProvider');
      throw new Error('useFX must be used within an FXProvider');
    }
    return context;
  }

  function useFXSelector<K extends keyof ResolvedDeps>(
    depName: K,
  ): ResolvedDeps[K] {
    return useContextSelector(FXContext, (context) => {
      if (!context) {
        console.error('useFXSelector called outside of FXProvider');
        throw new Error('useFXSelector must be used within an FXProvider');
      }
      return context[depName];
    });
  }

  return { FXProvider, useFX, useFXSelector };
}
