import type { FXConfig, FXModuleDefinition, LifecycleHook } from './types';

export function createFXConfig<T extends FXModuleDefinition<any, any>[]>(
  modules: [...T],
) {
  const modulesMap = modules.reduce(
    (acc, module) => {
      return { ...acc, [module.name]: module };
    },
    {} as { [K in T[number]['name']]: Extract<T[number], { name: K }> },
  );

  return {
    withHooks: (hooks: {
      onStart?: LifecycleHook[];
      onStop?: LifecycleHook[];
    }): FXConfig<T> => ({
      modules: modulesMap,
      ...hooks,
    }),
  };
}
