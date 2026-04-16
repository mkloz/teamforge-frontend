import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import type { Category } from "../../../data/interests-types";
import { SubcategoryChip } from "./subcategory-chip";
import { TagPill } from "./tag-pill";

interface CategorySectionProps {
  category: Category;
  selectedIds: Set<string>;
  expandedSubcategories: Set<string>;
  isAtMax: boolean;
  onToggleSubcategory: (id: string) => void;
  onToggleTag: (id: string) => void;
}

export function CategorySection({
  category,
  selectedIds,
  expandedSubcategories,
  isAtMax,
  onToggleSubcategory,
  onToggleTag,
}: CategorySectionProps) {
  const allTagsInCat = category.subcategories.flatMap((s) => s.tags);
  const selectedInCat = allTagsInCat.filter((t) =>
    selectedIds.has(t.id),
  ).length;

  return (
    <AccordionItem
      value={category.id}
      id={`category-${category.id}`}
      className="scroll-m-28 border-none"
    >
      <AccordionTrigger className="hover:no-underline py-4 group  rounded-lg px-2 -mx-2 transition-all focus-visible:underline focus-visible:text-forge-teal">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-2 h-2 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-125",
              category.color,
            )}
          />
          <span className="font-sans text-sm font-bold group-hover:text-forge-teal transition-colors">
            {category.label}
          </span>
        </div>
        {selectedInCat > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto mr-2 shrink-0 flex items-center justify-center min-w-5 h-5 px-1.5 font-sans text-xs font-bold bg-forge-teal text-white rounded-full leading-none shadow-[0_2px_4px_rgba(13,148,136,0.2)]"
          >
            {selectedInCat}
          </motion.span>
        )}
      </AccordionTrigger>

      <AccordionContent>
        <div className="pb-6 flex flex-col gap-4">
          {/* Subcategory chips */}
          <div className="flex flex-wrap gap-2 p-1.5">
            {category.subcategories.map((sub) => {
              const expanded = expandedSubcategories.has(sub.id);
              const selectedInSub = sub.tags.filter((t) =>
                selectedIds.has(t.id),
              ).length;
              return (
                <SubcategoryChip
                  key={sub.id}
                  icon={sub.icon}
                  label={sub.label}
                  selectedCount={selectedInSub}
                  expanded={expanded}
                  onToggle={() => onToggleSubcategory(sub.id)}
                />
              );
            })}
          </div>

          {/* Tag clouds */}
          {category.subcategories.map(
            (sub) =>
              expandedSubcategories.has(sub.id) && (
                <div
                  key={`tags-${sub.id}`}
                  className="py-2 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-muted/60">
                      <sub.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-muted/40">
                      {sub.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 p-1.5">
                    {sub.tags.map((tag) => (
                      <TagPill
                        key={tag.id}
                        label={tag.label}
                        selected={selectedIds.has(tag.id)}
                        disabled={isAtMax}
                        onToggle={() => onToggleTag(tag.id)}
                        aliases={tag.aliases}
                      />
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
