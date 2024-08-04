export class DependencyNotInjectedError extends Error {
  constructor(moduleName: string, dependencyName: string) {
    super(
      `Module "${moduleName}" is trying to use dependency "${dependencyName}" which was not injected.`,
    );
    this.name = 'DependencyNotInjectedError';
  }
}
