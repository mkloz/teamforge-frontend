const BLOCK_OVERSCAN_PX = 800;

interface VisibleRangeBlock {
  end: number;
  start: number;
}

export function findVisibleRange(
  blocks: VisibleRangeBlock[],
  scrollTop: number,
  viewportHeight: number,
) {
  const rangeStart = Math.max(0, scrollTop - BLOCK_OVERSCAN_PX);
  const rangeEnd = scrollTop + viewportHeight + BLOCK_OVERSCAN_PX;

  let startIndex = 0;
  while (startIndex < blocks.length && blocks[startIndex].end < rangeStart) {
    startIndex += 1;
  }

  let endIndex = startIndex;
  while (endIndex < blocks.length && blocks[endIndex].start <= rangeEnd) {
    endIndex += 1;
  }

  return {
    endIndex,
    startIndex,
  };
}
