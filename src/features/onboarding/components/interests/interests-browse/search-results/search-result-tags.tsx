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

  const duplicateNames = getDuplicateTagNames(results.tags);

  return (
    <div>
      {results.subcategories.length > 0 && (
        <p className="mb-2 font-bold font-sans text-slate-muted/50 text-xs">
          Tags
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {results.tags.map(({ category, tag, matchedAlias }) => (
          <TagPill
            key={tag.id}
            label={formatTagLabel({
              categoryName: category.name,
              duplicateNames,
              matchedAlias,
              tagName: tag.name,
            })}
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

function getDuplicateTagNames(results: InterestSearchResults["tags"]) {
  const counts = new Map<string, number>();

  for (const { tag } of results) {
    const normalizedName = tag.name.trim().toLocaleLowerCase();
    counts.set(normalizedName, (counts.get(normalizedName) ?? 0) + 1);
  }

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name),
  );
}

function formatTagLabel({
  categoryName,
  duplicateNames,
  matchedAlias,
  tagName,
}: {
  categoryName: string;
  duplicateNames: Set<string>;
  matchedAlias?: string;
  tagName: string;
}) {
  const label = formatSearchResultTagLabel(tagName, matchedAlias);

  return duplicateNames.has(tagName.trim().toLocaleLowerCase())
    ? `${label} · ${getCategoryContext(categoryName)}`
    : label;
}

function getCategoryContext(categoryName: string) {
  return categoryName.split(/[&,]/, 1)[0]?.trim() || categoryName;
}
