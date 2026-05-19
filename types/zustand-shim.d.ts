// Zustand 4.5.7 ships broken react-native types (index.d.ts re-exports from
// ./react which doesn't exist as a .d.ts file). This shim re-declares create
// so TypeScript is happy without downgrading zustand.

declare module 'zustand' {
  import type { StateCreator, StoreApi } from 'zustand/vanilla';

  export { StateCreator, StoreApi };

  export function create<T>(
    initializer: StateCreator<T, [], []>
  ): UseBoundStore<StoreApi<T>>;

  export function create<T>(): (
    initializer: StateCreator<T, [], []>
  ) => UseBoundStore<StoreApi<T>>;

  export interface UseBoundStore<S extends StoreApi<unknown>> {
    (): ExtractState<S>;
    <U>(selector: (state: ExtractState<S>) => U): U;
    getState: S['getState'];
    getInitialState: S['getInitialState'];
    setState: S['setState'];
    subscribe: S['subscribe'];
  }

  type ExtractState<S> = S extends StoreApi<infer T> ? T : never;

  export function useStore<S extends StoreApi<unknown>>(api: S): ExtractState<S>;
  export function useStore<S extends StoreApi<unknown>, U>(
    api: S,
    selector: (state: ExtractState<S>) => U
  ): U;
}
