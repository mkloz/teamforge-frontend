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
  getSubcategories,
  getSubcategoryIcon,
} from "@/features/onboarding/lib/interest-catalog";
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
