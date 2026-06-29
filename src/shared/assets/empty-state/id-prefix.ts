export function getEmptyStateIdPrefix(prefix: string, reactId: string) {
  return `${prefix}-${reactId.replaceAll(":", "")}`;
}
