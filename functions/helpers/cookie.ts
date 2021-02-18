export function parse(cookie: string) {
  return cookie
    ? cookie
        .split(';')
        .map((item) => item.split('='))
        .reduce((acc, [key, value]) => {
          acc[key.trim()] = value;
          return acc;
        }, {} as Record<string, string>)
    : {};
}
