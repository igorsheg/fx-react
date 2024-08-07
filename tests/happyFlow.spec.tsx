import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { useEffect } from 'react';
import { createFXModule, createFXConfig, createFXContext } from 'fx-react';

const configModule = createFXModule({
  name: 'config',
  dependencies: [],
  provides: {
    debug: () => true,
  },
});

const loggerModule = createFXModule({
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

const FXModules = [configModule, loggerModule];
const { FXProvider, useFX, useFXSelector } = createFXContext<typeof FXModules>();

function TestComponent() {
  const { logger } = useFX();
  const config = useFXSelector('config');

  useEffect(() => {
    logger.log('TestComponent mounted');
  }, [logger]);

  return (
    <div>
      <h1>Test Component</h1>
      <p>Debug mode: {config.debug ? 'On' : 'Off'}</p>
    </div>
  );
}

describe('FX React Library', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should create and use FX modules', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const fxConfig = createFXConfig(FXModules).withHooks({
      onStart: [() => console.log('Starting Test App')],
      onStop: [() => console.log('Stopping Test App')],
    });

    render(
      <FXProvider config={fxConfig}>
        <TestComponent />
      </FXProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(screen.getByText('Test Component')).toBeDefined();
    expect(screen.getByText('Debug mode: On')).toBeDefined();

    expect(consoleSpy).toHaveBeenCalledWith('Starting Test App');
    expect(consoleSpy).toHaveBeenCalledWith('[Logger] TestComponent mounted');
  });

  it('should allow selecting specific module dependencies', async () => {
    const fxConfig = createFXConfig(FXModules).withHooks({});

    const SelectorComponent = () => {
      const config = useFXSelector('config');
      return <div>Config debug: {config.debug.toString()}</div>;
    };

    render(
      <FXProvider config={fxConfig}>
        <SelectorComponent />
      </FXProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(screen.getByText('Config debug: true')).toBeDefined();
  });
});
