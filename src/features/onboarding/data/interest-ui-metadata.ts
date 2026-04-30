export { interestIconByTaxonomyId as subcategoryIconById } from "@/shared/lib/interest-icons";

export const DEFAULT_CATEGORY_COLOR = "bg-slate-muted/30";

export const categoryColorById: Record<string, string> = {
  careers: "bg-blue-500",
  lifestyle: "bg-emerald-500",
  entertainment: "bg-violet-500",
  sports_outdoors: "bg-orange-500",
  hobbies_creating: "bg-pink-500",
};

export const categoryShortLabelById: Record<string, string> = {
  careers: "Career",
  lifestyle: "Lifestyle",
  entertainment: "Entertainment",
  sports_outdoors: "Sports & Outdoors",
  hobbies_creating: "Hobbies",
};
