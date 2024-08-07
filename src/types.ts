export type DependencyMap = Record<string, any>;

export type ResolvedDependencies<T extends DependencyMap> = {
  [K in keyof T]: Awaited<T[K]>;
};

export type LifecycleHook = () => void | Promise<void>;

export type FXModuleDefinition<
  TDeps extends DependencyMap,
  TProvides extends DependencyMap,
> = {
  name: string;
  dependencies: Array<FXModuleDefinition<any, any>>;
  provides: {
    [K in keyof TProvides]: (
      deps: TDeps,
    ) => TProvides[K] | Promise<TProvides[K]>;
  };
  decorates?: Array<(deps: TDeps & TProvides) => void | Promise<void>>;
  invokes?: Array<(deps: TDeps & TProvides) => void | Promise<void>>;
};

export type FXModulesMap = {
  [moduleName: string]: FXModuleDefinition<any, any>;
};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type MergeFXDeps<T extends FXModuleDefinition<any, any>[]> =
  UnionToIntersection<
    {
      [K in T[number]['name']]: {
        [KP in K]: ExtractModuleProvides<Extract<T[number], { name: K }>>;
      };
    }[T[number]['name']]
  >;

export type ExtractModuleProvides<T extends FXModuleDefinition<any, any>> =
  T extends FXModuleDefinition<any, infer P> ? P : never;

export type ExtractDependencies<T extends Array<FXModuleDefinition<any, any>>> =
  {
    [K in T[number]['name']]: Extract<
      T[number],
      { name: K }
    > extends FXModuleDefinition<any, infer P>
    ? P
    : never;
  };

export type FXConfig<T extends FXModuleDefinition<any, any>[]> = {
  modules: { [K in T[number]['name']]: Extract<T[number], { name: K }> };
  onStart?: LifecycleHook[];
  onStop?: LifecycleHook[];
};
