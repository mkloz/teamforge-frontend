import { createElement } from "react";
import { getSubcategoryIcon } from "@/features/onboarding/lib/interest-catalog";

interface SearchResultSubcategoryIconProps {
  subcategoryId: string;
}

export function SearchResultSubcategoryIcon({
  subcategoryId,
}: SearchResultSubcategoryIconProps) {
  return createElement(getSubcategoryIcon(subcategoryId), {
    className: "w-5 h-5",
    strokeWidth: 1.5,
  });
}
