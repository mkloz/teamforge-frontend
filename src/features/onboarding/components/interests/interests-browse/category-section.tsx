import { motion } from "framer-motion";
import {
  getCategoryColorClass,
  getSubcategories,
  getSubcategoryIcon,
} from "@/features/onboarding/lib/interest-catalog";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { CountBadge } from "@/shared/components/ui/count-badge";
import { cn } from "@/shared/lib/utils";
import type { Interest } from "@/shared/schemas";
import {
  getCategorySelectedCount,
  getSubcategorySelectedCount,
} from "./category-section-model";
import { SubcategoryChip } from "./subcategory-chip";
import { SubcategoryTagGroup } from "./subcategory-tag-group";

interface CategorySectionProps {
  category: Interest;
  selectedIds: Set<string>;
  expandedSubcategories: Set<string>;
  isAtMax: boolean;
  onRegisterCategory: (id: string, element: HTMLElement | null) => void;
  onToggleSubcategory: (id: string) => void;
  onToggleTag: (id: string) => void;
}

export function CategorySection({
  category,
  selectedIds,
  expandedSubcategories,
  isAtMax,
  onRegisterCategory,
  onToggleSubcategory,
  onToggleTag,
}: CategorySectionProps) {
  const subcategories = getSubcategories(category);
  const selectedInCategory = getCategorySelectedCount(category, selectedIds);

  return (
    <AccordionItem
      value={category.id}
      id={`category-${category.id}`}
      ref={(element) => onRegisterCategory(category.id, element)}
      className="scroll-m-28 border-none"
    >
      <AccordionTrigger className="group -mx-2 rounded-lg px-2 py-4 transition-all hover:no-underline focus-visible:text-forge-teal focus-visible:underline">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "size-2 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125",
              getCategoryColorClass(category.id),
            )}
          />
          <span className="font-bold font-sans text-sm transition-colors group-hover:text-forge-teal">
            {category.name}
          </span>
        </div>
        {selectedInCategory > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mr-2 ml-auto shrink-0"
          >
            <CountBadge count={selectedInCategory} size="md" tone="teal" />
          </motion.span>
        )}
      </AccordionTrigger>

      <AccordionContent>
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex flex-wrap gap-1.5 px-0 py-1.5 sm:gap-2 sm:p-1.5">
            {subcategories.map((subcategory) => {
              const expanded = expandedSubcategories.has(subcategory.id);
              const selectedInSubcategory = getSubcategorySelectedCount(
                subcategory,
                selectedIds,
              );

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

          {subcategories.map(
            (subcategory) =>
              expandedSubcategories.has(subcategory.id) && (
                <SubcategoryTagGroup
                  key={`tags-${subcategory.id}`}
                  subcategory={subcategory}
                  selectedIds={selectedIds}
                  isAtMax={isAtMax}
                  onToggleTag={onToggleTag}
                />
              ),
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
