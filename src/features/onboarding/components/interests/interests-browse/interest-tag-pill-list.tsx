import type { Interest } from "@/shared/schemas";

import { TagPill } from "./tag-pill";

interface InterestTagPillListProps {
  animated?: boolean;
  disabled: boolean;
  keyPrefix?: string;
  onReject?: (id: string) => void;
  onToggle: (id: string) => void;
  selectedIds: Set<string>;
  tags: Interest[];
}

export function InterestTagPillList({
  animated = false,
  disabled,
  keyPrefix,
  onReject,
  onToggle,
  selectedIds,
  tags,
}: InterestTagPillListProps) {
  return (
    <>
      {tags.map((tag) => (
        <TagPill
          key={keyPrefix ? `${keyPrefix}-${tag.id}` : tag.id}
          label={tag.name}
          selected={selectedIds.has(tag.id)}
          disabled={disabled}
          onToggle={() => onToggle(tag.id)}
          onReject={onReject ? () => onReject(tag.id) : undefined}
          aliases={tag.aliases}
          animated={animated}
        />
      ))}
    </>
  );
}
