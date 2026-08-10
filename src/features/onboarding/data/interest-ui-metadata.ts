export { interestIconByTaxonomyId as subcategoryIconById } from "@/shared/lib/interest-icons";

export const DEFAULT_CATEGORY_COLOR = "bg-slate-muted/30";

export const categoryColorById: Record<string, string> = {
  careers: "bg-brand-teal",
  lifestyle: "bg-brand-amber",
  entertainment: "bg-brand-teal/80",
  sports_outdoors: "bg-brand-amber/85",
  hobbies_creating: "bg-brand-teal/65",
};

export const categoryShortLabelById: Record<string, string> = {
  careers: "Career",
  lifestyle: "Lifestyle",
  entertainment: "Entertainment",
  sports_outdoors: "Sports & Outdoors",
  hobbies_creating: "Hobbies",
};
