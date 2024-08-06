import { useSyncExternalStore } from 'react';
import { createFXModule } from 'react-fx';

type Listener = () => void;
type Selector<T, U> = (state: T) => U;

interface Store<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: Listener) => () => void;
  useStore: <U>(selector: Selector<T, U>) => U;
}

function createStore<T extends object>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<Listener>();

  const getState = () => state;

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const update = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...update };
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useStore = <U>(selector: Selector<T, U>): U => {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(initialState)
    );
  };

  return { getState, setState, subscribe, useStore };
}

export const storeModule = createFXModule({
  name: 'store',
  dependencies: [],
  provides: {
    createStore: () => createStore,
    useStore: () => {
      const storeMap = new Map<string, Store<unknown>>();

      return {
        create: <T extends object>(name: string, initialState: T): Store<T> => {
          if (storeMap.has(name)) {
            throw new Error(`Store with name "${name}" already exists`);
          }
          const store = createStore(initialState);
          storeMap.set(name, store);
          return store;
        },
        get: <T extends object>(name: string): Store<T> => {
          const store = storeMap.get(name);
          if (!store) {
            throw new Error(`Store with name "${name}" does not exist`);
          }
          return store as Store<T>;
        },
        useStore: <T extends object, U>(name: string, selector: Selector<T, U>): U => {
          const store = storeMap.get(name) as Store<T> | undefined;
          if (!store) {
            throw new Error(`Store with name "${name}" does not exist`);
          }
          return store.useStore(selector);
        },
      };
    },
  },
});
