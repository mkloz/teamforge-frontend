import type { LucideIcon } from "lucide-react";
import {
  getLeafInterests,
  getSubcategoryIcon,
} from "@/features/onboarding/lib/interest-catalog";
import type { Interest } from "@/shared/schemas";
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
    <div className="flex flex-col gap-3 py-2">
      <SubcategoryGroupHeader
        icon={getSubcategoryIcon(subcategory.id)}
        label={subcategory.name}
      />
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

function SubcategoryGroupHeader({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <span className="text-slate-muted/60">
        <Icon className="size-3.5" strokeWidth={2.5} />
      </span>
      <span className="font-bold text-slate-muted/40 text-xs">{label}</span>
    </div>
  );
}
