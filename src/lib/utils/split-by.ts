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
