export const resolve = <T, U>(
  arr: T[],
  resolve: (item: T, index: number) => U | null | undefined
): U | undefined => {
  for (let i = 0; i < arr.length; i++) {
    const res = resolve(arr[i], i);
    if (res !== undefined && res !== null) {
      return res;
    }
  }
  return undefined;
};
