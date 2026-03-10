import type { ActivityCategory } from "../types/home.types";

export const CATEGORY_COLORS: Record<ActivityCategory, { bg: string; text: string; light: string }> = {
  Tech: {
    bg: "bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    light: "bg-blue-50 dark:bg-blue-950/30",
  },
  Sports: {
    bg: "bg-green-500/15",
    text: "text-green-600 dark:text-green-400",
    light: "bg-green-50 dark:bg-green-950/30",
  },
  Arts: {
    bg: "bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
    light: "bg-purple-50 dark:bg-purple-950/30",
  },
  Social: {
    bg: "bg-orange-500/15",
    text: "text-orange-600 dark:text-orange-400",
    light: "bg-orange-50 dark:bg-orange-950/30",
  },
  Outdoors: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    light: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  Learning: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-600 dark:text-indigo-400",
    light: "bg-indigo-50 dark:bg-indigo-950/30",
  },
};

export const getCategoryColors = (category: ActivityCategory) => CATEGORY_COLORS[category];
