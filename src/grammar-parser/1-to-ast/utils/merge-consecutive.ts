export const mergeConsecutive = <Item, Key, MergedItem = Item>(
  arr: Item[],
  itemToKey: (item: Item) => Key,
  mergeItems: (items: Item[]) => MergedItem,
) => {
  const result: Array<Item | MergedItem> = [];
  let lastKey: Key | undefined;
  let lastBatch: Item[] = [];

  for (const item of arr) {
    const key = itemToKey(item);
    if (lastKey === undefined || key === lastKey) {
      lastBatch.push(item);
    } else {
      if (lastBatch.length) {
        if (lastBatch.length > 1) {
          result.push(mergeItems(lastBatch));
        } else {
          result.push(lastBatch[0]);
        }
        lastBatch = [];
      }

      lastBatch.push(item);
    }
    lastKey = key;
  }

  if (lastBatch.length > 0) {
    if (lastBatch.length > 1) {
      result.push(mergeItems(lastBatch));
    } else {
      result.push(lastBatch[0]);
    }
  }

  return result;
};
