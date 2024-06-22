export const createOffsetToPosition = (text: string) => {
  const lines = text.split('\n');
  const lineStarts = lines.map((line) => line.length + 1);

  return (offset: number) => {
    let line = 0;
    while (line < lineStarts.length && lineStarts[line] <= offset) {
      offset -= lineStarts[line];
      line++;
    }
    return {
      line: line + 1,
      column: offset + 1,
    };
  };
};
