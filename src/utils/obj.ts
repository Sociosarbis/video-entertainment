function omit<T extends Record<string, any>, K extends string>(
  obj: T,
  omitKeys: K[],
) {
  const keySet = new Set<string>(omitKeys);
  return Object.keys(obj).reduce((acc, key) => {
    if (!keySet.has(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as any) as { [k in Exclude<keyof T, K>]: T[k] };
}

export { omit };
