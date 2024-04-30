import { splitBy } from './split-by';

describe('utils/split-by', () => {
  it('should split empty array', () => {
    expect(splitBy([], () => false)).toEqual([]);
  });
  it('should not split', () => {
    expect(splitBy([1, 2, 3], () => false)).toEqual([[1, 2, 3]]);
  });
  it('should split', () => {
    expect(splitBy([1, 2, 3], (v) => v === 2)).toEqual([[1], [3]]);
  });
  it('should split at the end', () => {
    expect(splitBy([1, 2], (v) => v === 2)).toEqual([[1], []]);
  });
  it('should split at the beginning', () => {
    expect(splitBy([2, 1], (v) => v === 2)).toEqual([[], [1]]);
  });
  it('should split even if empty', () => {
    expect(splitBy([2, 2, 2], (v) => v === 2)).toEqual([[], [], [], []]);
  });
  it('should split multiple times', () => {
    expect(splitBy([1, 2, 3, 2, 2, 4, 5], (v) => v === 2)).toEqual([
      [1],
      [3],
      [],
      [4, 5],
    ]);
  });
});
