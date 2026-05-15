export { interestIconByTaxonomyId as subcategoryIconById } from "@/shared/lib/interest-icons";

export const DEFAULT_CATEGORY_COLOR = "bg-slate-muted/30";

export const categoryColorById: Record<string, string> = {
  careers: "bg-forge-teal",
  lifestyle: "bg-spark-amber",
  entertainment: "bg-forge-teal/80",
  sports_outdoors: "bg-spark-amber/85",
  hobbies_creating: "bg-forge-teal/65",
};

export const categoryShortLabelById: Record<string, string> = {
  careers: "Career",
  lifestyle: "Lifestyle",
  entertainment: "Entertainment",
  sports_outdoors: "Sports & Outdoors",
  hobbies_creating: "Hobbies",
};
