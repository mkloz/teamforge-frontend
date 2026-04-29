import type { Interest } from "@/shared/schemas";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import {
  getCategoryColorClass,
  getLeafInterests,
  getSubcategories,
  getSubcategoryIcon,
} from "../../../lib/interest-catalog";
import { SubcategoryChip } from "./subcategory-chip";
import { TagPill } from "./tag-pill";

interface CategorySectionProps {
  category: Interest;
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
  const subcategories = getSubcategories(category);
  const allTagsInCategory = subcategories.flatMap((subcategory) =>
    getLeafInterests(subcategory),
  );
  const selectedInCategory = allTagsInCategory.filter((interest) =>
    selectedIds.has(interest.id),
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
              getCategoryColorClass(category.id),
            )}
          />
          <span className="font-sans text-sm font-bold group-hover:text-forge-teal transition-colors">
            {category.name}
          </span>
        </div>
        {selectedInCategory > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto mr-2 shrink-0 flex items-center justify-center min-w-5 h-5 px-1.5 font-sans text-xs font-bold bg-forge-teal text-white rounded-full leading-none shadow-[0_2px_4px_rgba(13,148,136,0.2)]"
          >
            {selectedInCategory}
          </motion.span>
        )}
      </AccordionTrigger>

      <AccordionContent>
        <div className="pb-6 flex flex-col gap-4">
          {/* Subcategory chips */}
          <div className="flex flex-wrap gap-2 p-1.5">
            {subcategories.map((subcategory) => {
              const expanded = expandedSubcategories.has(subcategory.id);
              const selectedInSubcategory = getLeafInterests(
                subcategory,
              ).filter((interest) => selectedIds.has(interest.id)).length;

              return (
                <SubcategoryChip
                  key={subcategory.id}
                  icon={getSubcategoryIcon(subcategory.id)}
                  label={subcategory.name}
                  selectedCount={selectedInSubcategory}
                  expanded={expanded}
                  onToggle={() => onToggleSubcategory(subcategory.id)}
                />
              );
            })}
          </div>

          {/* Tag clouds */}
          {subcategories.map(
            (subcategory) =>
              expandedSubcategories.has(subcategory.id) && (
                <div
                  key={`tags-${subcategory.id}`}
                  className="py-2 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-muted/60">
                      {(() => {
                        const Icon = getSubcategoryIcon(subcategory.id);

                        return (
                          <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        );
                      })()}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-muted/40">
                      {subcategory.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 p-1.5">
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
              ),
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
