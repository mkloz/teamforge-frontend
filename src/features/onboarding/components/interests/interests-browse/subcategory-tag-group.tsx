import type { Interest } from "@/shared/schemas";
import { createElement } from "react";

import {
  getLeafInterests,
  getSubcategoryIcon,
} from "@/features/onboarding/lib/interest-catalog";
import { TagPill } from "./tag-pill";

interface SubcategoryTagGroupProps {
  isAtMax: boolean;
  onToggleTag: (id: string) => void;
  selectedIds: Set<string>;
  subcategory: Interest;
}

export function SubcategoryTagGroup({
  isAtMax,
  onToggleTag,
  selectedIds,
  subcategory,
}: SubcategoryTagGroupProps) {
  return (
    <div className="py-2 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-slate-muted/60">
          {renderSubcategoryIcon(subcategory.id)}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-muted/40">
          {subcategory.name}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 px-0 py-1.5 sm:gap-2 sm:p-1.5">
        {getLeafInterests(subcategory).map((tag) => (
          <TagPill
            key={tag.id}
            label={tag.name}
            selected={selectedIds.has(tag.id)}
            disabled={isAtMax}
            onToggle={() => onToggleTag(tag.id)}
            aliases={tag.aliases}
          />
        ))}
      </div>
    </div>
  );
}

function renderSubcategoryIcon(subcategoryId: string) {
  return createElement(getSubcategoryIcon(subcategoryId), {
    className: "w-3.5 h-3.5",
    strokeWidth: 2.5,
  });
}
