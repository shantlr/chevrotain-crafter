export const indent = (n: number) => (n < 0 ? '' : '  '.repeat(n));

export const formatFieldName = (name: string) => {
  if (/^[a-z0-9_$]+$/.test(name)) {
    return name;
  }
  return `"${name}"`;
};
