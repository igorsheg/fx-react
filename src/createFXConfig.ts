import type { FXConfig, FXModuleDefinition, LifecycleHook } from './types';

function generateMermaidDiagram(graph: Map<string, string[]>): string {
  let mermaidCode = 'graph TD\n';
  for (const [node, dependencies] of graph.entries()) {
    for (const dep of dependencies) {
      mermaidCode += `  ${node} --> ${dep}\n`;
    }
  }
  return mermaidCode;
}

function reverseTopologicalSort<T extends FXModuleDefinition<any, any>>(
  modules: T[],
): [Map<T['name'], T['name'][]>, T[]] {
  const graph = new Map<T['name'], T['name'][]>();
  const visited = new Set<string>();
  const sorted: T[] = [];

  modules.forEach((module) => {
    graph.set(
      module.name,
      module.dependencies.map((dep) => dep.name),
    );
  });

  function visit(name: string) {
    if (visited.has(name)) {
      return;
    }
    visited.add(name);
    (graph.get(name) ?? []).forEach(visit);
    const module = modules.find((m) => m.name === name);
    if (module) {
      sorted.push(module);
    } else {
      throw new Error(`Module "${name}" not found. This should not happen.`);
    }
  }

  modules.forEach((module) => {
    if (!visited.has(module.name)) {
      visit(module.name);
    }
  });

  return [graph, sorted];
}

type createFXConfigOptions = {
  debug?: boolean;
};

export function createFXConfig<T extends FXModuleDefinition<any, any>[]>(
  modules: [...T],
  options?: createFXConfigOptions,
) {
  const [graph, sortedModules] = reverseTopologicalSort(modules);

  if (options?.debug === true) {
    console.log('Mermaid Diagram:\n', generateMermaidDiagram(graph));
  }

  const modulesMap = sortedModules.reduce(
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
