export type FunctionPropsOf<T extends object> = {
  [K in keyof T as T[K] extends (...args: any) => any ? K : never]: T[K];
};

export type OverrideFunction<
  S,
  T extends Record<string, (...args: any) => any>,
  K extends keyof T
> = (this: S, oldFn: T[K], ...args: Parameters<T[K]>) => ReturnType<T[K]>;

export function applyReplacement<
  S,
  T extends Record<string, any>,
  K extends keyof T
>(self: S, target: T, key: K, newFn: OverrideFunction<S, T, K>): void {
  const oldFn: T[K] = Reflect.get(target, key);

  // build a new replacement function that is called instead of
  // the original function
  // it then purely delegates to "newFn", except the first parameter
  // is additionally the old function.
  function replacementFn(
    this: T,
    ...args: Parameters<typeof oldFn>
  ): ReturnType<typeof oldFn> {
    // @ts-ignore complains that `args` does not have a '[Symbol.iterator]()' method that returns an iterator
    return newFn.call(self, oldFn.bind(this), ...args);
  }

  // define the new fn as not enumerable
  Object.defineProperty(target, key, {
    value: replacementFn,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

export type OverrideFunctions<S, T extends Record<string, any>> = {
  [K in keyof T as T[K] extends (...args: any) => any
    ? K
    : never]?: OverrideFunction<S, T, K>;
};

export function applyReplacements<S, T extends Record<string, any>>(
  self: S,
  target: T,
  replacements: OverrideFunctions<S, T>
): void {
  for (const [key, newFn] of Object.entries(replacements)) {
    applyReplacement(self, target, key as any, newFn as any);
  }
}
