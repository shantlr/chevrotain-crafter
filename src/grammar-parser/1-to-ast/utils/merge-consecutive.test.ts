import { mergeConsecutive } from './merge-consecutive';

describe('utils/merge-consecutive', () => {
  it('should not merge different items', () => {
    const result = mergeConsecutive(
      [1, 2, 3, 4, 5],
      (x) => x,
      (items) => ({ merged: items })
    );

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
  it('should merge consecutive items', () => {
    const result = mergeConsecutive(
      [1, 1, 1, 1, 2, 2, 3, 4, 4, 5],
      (x) => x,
      (items) => ({ merged: items })
    );

    expect(result).toEqual([
      { merged: [1, 1, 1, 1] },
      { merged: [2, 2] },
      3,
      { merged: [4, 4] },
      5,
    ]);
  });

  it('should merge tail consecutive items', () => {
    const result = mergeConsecutive(
      [1, 2, 3, 4, 4, 4, 4],
      (x) => x,
      (items) => ({ merged: items })
    );

    expect(result).toEqual([1, 2, 3, { merged: [4, 4, 4, 4] }]);
  });
  it('should not merge if key is NaN', () => {
    const result = mergeConsecutive(
      [1, 2, 3, 3, 3, 4, 4, 4, 4],
      (v) => (v === 3 ? NaN : v),
      (items) => ({ merged: items })
    );

    expect(result).toEqual([1, 2, 3, 3, 3, { merged: [4, 4, 4, 4] }]);
  });
});
