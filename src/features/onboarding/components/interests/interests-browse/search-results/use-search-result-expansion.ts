import { useState } from "react";

export function useSearchResultExpansion() {
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Set<string>
  >(new Set());

  function toggleSubcategory(id: string) {
    setExpandedSubcategories((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  return {
    expandedSubcategories,
    toggleSubcategory,
  };
}
