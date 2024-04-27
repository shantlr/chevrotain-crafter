const createOffsetTracker = () => {
  const originalOffsets: Array<{
    offset: number;
    /**
     * Positive number = added
     * Negative number = deleted
     */
    length: number;
  }> = [];

  return {
    added(offset: number, length: number) {
      originalOffsets.push({
        offset,
        length,
      });
    },
    deleted(offset: number, length: number) {
      originalOffsets.push({
        offset,
        length: -length,
      });
    },
    getOriginalOffset(newOffset: number) {
      for (const { offset: originalOffset, length } of originalOffsets) {
        if (newOffset >= originalOffset) {
          newOffset -= length;
        }
      }
      return newOffset;
    },
  };
};

const createMultiStageTextProcessor = (
  stages: Array<{
    regex: RegExp;
    replace: string;
  }>
) => {
  return (text: string) => {
    const trackers: ReturnType<typeof createOffsetTracker>[] = [];

    let res = text;
    for (const stage of stages) {
      const tracker = createOffsetTracker();
      trackers.push(tracker);
      for (const match of res.matchAll(stage.regex)) {
        tracker.deleted(match.index, match[0].length);
        if (stage.replace?.length > 0) {
          tracker.added(match.index, stage.replace.length);
        }
      }
      res = res.replace(stage.regex, stage.replace);
    }

    return {
      text: res,
      /**
       * Retrive the original offset from the processed text offset
       */
      getOriginalOffset: (processedTextOffset: number) => {
        let offset = processedTextOffset;
        for (const tracker of trackers) {
          offset = tracker.getOriginalOffset(offset);
        }
        return offset;
      },
    };
  };
};

/**
 * trim text
 */
export const trimTextLines = createMultiStageTextProcessor([
  {
    regex: /\s+\n/g,
    replace: '\n',
  },
  {
    regex: /(\n{2,})|(\n$)|(^\s+)|(\s+$)/g,
    replace: '',
  },
]);
