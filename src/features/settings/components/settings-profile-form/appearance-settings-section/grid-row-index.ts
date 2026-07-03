export function getLastGridRowStartIndex(optionCount: number) {
  return optionCount - (optionCount % 2 === 0 ? 2 : 1);
}
