import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";

import { TagPill } from "../tag-pill";

interface SearchResultTagsProps {
  isAtMax: boolean;
  onToggle: (id: string) => void;
  results: InterestSearchResults;
  selectedIds: Set<string>;
}

export function SearchResultTags({
  isAtMax,
  onToggle,
  results,
  selectedIds,
}: SearchResultTagsProps) {
  if (results.tags.length === 0) {
    return null;
  }

  return (
    <div>
      {results.subcategories.length > 0 && (
        <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-muted/50 mb-2">
          Tags
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {results.tags.map(({ tag, matchedAlias }) => (
          <TagPill
            key={tag.id}
            label={formatTagLabel(tag.name, matchedAlias)}
            selected={selectedIds.has(tag.id)}
            disabled={isAtMax}
            onToggle={() => onToggle(tag.id)}
            aliases={getTagAliases(tag.name, tag.aliases, matchedAlias)}
          />
        ))}
      </div>
    </div>
  );
}

function formatTagLabel(tagName: string, matchedAlias?: string) {
  return matchedAlias
    ? matchedAlias.charAt(0).toUpperCase() + matchedAlias.slice(1)
    : tagName;
}

function getTagAliases(
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
