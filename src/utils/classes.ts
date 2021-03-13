import cls from 'classnames';

export function merge(c1: Record<string, string>, c2: Record<string, string>) {
  if (!c2) return c1;
  if (!c1) return c2;
  const ret: Record<string, string> = {};
  for (const key in c1) {
    ret[key] = cls(c1[key], c2[key]);
  }

  for (const key in c2) {
    if (!(key in ret)) {
      ret[key] = c2[key];
    }
  }
  return ret;
}
