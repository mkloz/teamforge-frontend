import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";

import { TagPill } from "../tag-pill";
import {
  formatSearchResultTagLabel,
  getSearchResultTagAliases,
} from "./search-result-tags-model";

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
        <p className="mb-2 font-sans text-[10px] font-bold tracking-widest text-slate-muted/50 uppercase">
          Tags
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {results.tags.map(({ tag, matchedAlias }) => (
          <TagPill
            key={tag.id}
            label={formatSearchResultTagLabel(tag.name, matchedAlias)}
            selected={selectedIds.has(tag.id)}
            disabled={isAtMax}
            onToggle={() => onToggle(tag.id)}
            aliases={getSearchResultTagAliases(
              tag.name,
              tag.aliases,
              matchedAlias,
            )}
          />
        ))}
      </div>
    </div>
  );
}
