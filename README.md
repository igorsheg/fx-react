# React FX Library

React FX is a flexible dependency injection and module management library for React applications. It provides a structured way to organize your application's dependencies, making it easier to manage complex state and side effects.

## Table of Contents

- [Installation](#installation)
- [Key Concepts](#key-concepts)
- [Getting Started](#getting-started)
- [Advanced Usage](#advanced-usage)
- [API Reference](#api-reference)

## Installation

```bash
npm install react-fx
```

## Key Concepts

- **Modules**: Self-contained units of functionality with dependencies and provided values.
- **FX Context**: A React context that manages the state of all modules.
- **FX Provider**: A component that initializes and provides the FX context to your app.
- **useFX Hook**: A custom hook to access the resolved dependencies in your components.

## Getting Started

Let's create a simple application using React FX with a logger, config, and API module.

1. First, let's define our modules:

```typescript
// configModule.ts
import { createFXModule } from 'react-fx';

export const configModule = createFXModule({
  name: 'config',
  dependencies: [],
  provides: {
    apiUrl: () => 'https://api.example.com',
    debug: () => true,
  },
});

// loggerModule.ts
import { createFXModule } from 'react-fx';

export const loggerModule = createFXModule({
  name: 'logger',
  dependencies: [configModule],
  provides: {
    log:
      ({ config }) =>
      (message: string) => {
        if (config.debug) {
          console.log(`[Logger] ${message}`);
        }
      },
  },
});

// apiModule.ts
import { createFXModule } from 'react-fx';

export const apiModule = createFXModule({
  name: 'api',
  dependencies: [configModule, loggerModule],
  provides: {
    fetchData:
      ({ config, logger }) =>
      async (endpoint: string) => {
        logger.log(`Fetching data from ${endpoint}`);
        const response = await fetch(`${config.apiUrl}${endpoint}`);
        return response.json();
      },
  },
});
```

2. Now, let's set up our main App component:

```tsx
// App.tsx
import React from 'react';
import { createFXConfig, createFXContext } from 'react-fx';
import { configModule, loggerModule, apiModule } from './modules';

const FXModules = [configModule, loggerModule, apiModule];
const { FXProvider, useFX } = createFXContext<typeof FXModules>();

function App() {
  const fxConfig = createFXConfig(FXModules).withHooks({
    onStart: [() => console.log('Starting App')],
    onStop: [() => console.log('Stopping App')],
  });

  return (
    <FXProvider config={fxConfig}>
      <AppContent />
    </FXProvider>
  );
}

function AppContent() {
  const { logger, api } = useFX();

  React.useEffect(() => {
    logger.log('AppContent mounted');
    api.fetchData('/users').then((data) => {
      logger.log(`Fetched ${data.length} users`);
    });
  }, []);

  return <div>Hello, React FX!</div>;
}

export default App;
```

This example demonstrates how to set up a basic application using React FX. The `configModule` provides configuration values, the `loggerModule` provides logging functionality, and the `apiModule` provides a method to fetch data from an API.

## Advanced Usage

React FX allows for complex dependency graphs and advanced module composition. Here are some advanced features:

1. **Module Decorators**: Use the `decorates` property in your module definition to modify or enhance dependencies.

2. **Lifecycle Hooks**: Implement `onStart` and `onStop` hooks in your FX configuration for setup and cleanup tasks.

3. **Lazy Loading**: Modules can be dynamically imported and added to the FX context as needed.

4. **Testing**: Easily mock modules for unit testing by creating alternative implementations.

## API Reference

### `createFXModule<TName, TDeps, TProvides>(config)`

Creates a new FX module.

### `createFXContext<T extends FXModuleDefinition<any, any>[]>()`

Creates an FX context with the given module definitions.

### `createFXConfig(modules)`

Creates an FX configuration object from an array of modules.

### `FXProvider`

A React component that initializes and provides the FX context.

### `useFX()`

A React hook that returns the resolved dependencies from the FX context.
