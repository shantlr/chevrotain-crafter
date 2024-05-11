export const indent = (n: number) => (n < 0 ? '' : '  '.repeat(n));

const fieldDoesNotRequireEscape = (name: string) => /^[a-z0-9_$]+$/.test(name);

export const formatFieldName = (name: string) => {
  if (fieldDoesNotRequireEscape(name)) {
    return name;
  }
  return `"${name}"`;
};

export const formatFieldAccess = (name: string) => {
  if (fieldDoesNotRequireEscape(name)) {
    return `.${name}`;
  }
  return `["${name}"]`;
};
