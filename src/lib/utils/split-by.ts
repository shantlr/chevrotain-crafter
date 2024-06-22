/**
 * @example
 * ```tsx
 * const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
 * const res = splitBy(arr, (v) => v % 3 === 0);
 * console.log(res); // [[1, 2], [4, 5], [7, 8], [9]]
 * ```
 */
export const splitBy = <T>(arr: T[], isSplitElem: (value: T) => boolean) => {
  if (!arr.length) {
    return [];
  }

  const res: T[][] = [[]];

  for (const elem of arr) {
    if (isSplitElem(elem)) {
      res.push([]);
    } else {
      res[res.length - 1].push(elem);
    }
  }
  return res;
};
