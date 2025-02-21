/// <reference types="vite/client" />

type Classes<
  K extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<K, string | ((...args: any[]) => string)> = Record<K, string>,
> = Partial<T>;
