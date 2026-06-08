export function formatSearchResultTagLabel(
  tagName: string,
  matchedAlias?: string,
) {
  return matchedAlias
    ? matchedAlias.charAt(0).toUpperCase() + matchedAlias.slice(1)
    : tagName;
}

export function getSearchResultTagAliases(
  tagName: string,
  aliases: string[] | undefined,
  matchedAlias?: string,
) {
  if (!matchedAlias || tagName === matchedAlias) {
    return aliases;
  }

  return [
    tagName,
    ...(aliases?.filter((alias) => alias !== matchedAlias) ?? []),
  ];
}
