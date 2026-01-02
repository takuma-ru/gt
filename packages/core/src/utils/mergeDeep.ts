import { isPlainObject } from "./isPlainObject";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export const mergeDeep = <T>(base: T, override?: DeepPartial<T>): T => {
  if (override == null) return base;

  // Arrays: override replaces base
  if (Array.isArray(base) || Array.isArray(override)) {
    return (override as unknown as T) ?? base;
  }

  // Plain objects: recursively merge
  if (isPlainObject(base) && isPlainObject(override)) {
    const result: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(override)) {
      const baseValue = (base as Record<string, unknown>)[key];
      if (isPlainObject(baseValue) && isPlainObject(value)) {
        result[key] = mergeDeep(
          baseValue,
          value as DeepPartial<typeof baseValue>,
        );
      } else {
        result[key] = value;
      }
    }
    return result as unknown as T;
  }

  // Primitives / non-plain objects: override replaces base
  return (override as unknown as T) ?? base;
};
