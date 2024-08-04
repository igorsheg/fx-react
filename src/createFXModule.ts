import type {
  DependencyMap,
  ExtractDependencies,
  FXModuleDefinition,
} from './types';

export function createFXModule<
  TName extends string,
  TDeps extends Array<FXModuleDefinition<any, any>>,
  TProvides extends DependencyMap,
>(
  config: Omit<
    FXModuleDefinition<ExtractDependencies<TDeps>, TProvides>,
    'dependencies'
  > & {
    name: TName;
    dependencies: TDeps;
  },
): FXModuleDefinition<ExtractDependencies<TDeps>, TProvides> & { name: TName } {
  return config as FXModuleDefinition<ExtractDependencies<TDeps>, TProvides> & {
    name: TName;
  };
}
