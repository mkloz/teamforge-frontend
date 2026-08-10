import type {
  PlanCategory,
  PlanStatus,
} from "@/features/activity/lib/activity-contract";

export const categoryColors: Record<PlanCategory, string> = {
  TECH: "border-brand-teal/20 bg-primary-soft text-foreground",
  SPORTS: "border-brand-teal/20 bg-primary-soft text-foreground",
  ARTS: "border-brand-amber/25 bg-accent-soft text-brand-amber",
  SOCIAL: "border-brand-amber/25 bg-accent-soft text-brand-amber",
  OUTDOORS: "border-brand-teal/20 bg-primary-soft text-foreground",
  LEARNING: "border-brand-teal/20 bg-primary-soft text-foreground",
  MUSIC: "border-brand-amber/25 bg-accent-soft text-brand-amber",
  FOOD: "border-brand-amber/25 bg-accent-soft text-brand-amber",
  GAMING: "border-slate-muted/20 bg-muted-soft text-slate-muted",
  WELLNESS: "border-brand-teal/20 bg-primary-soft text-foreground",
  TRAVEL: "border-brand-teal/20 bg-primary-soft text-foreground",
  OTHER: "border-slate-muted/20 bg-muted-soft text-slate-muted",
};

export const statusColors: Record<PlanStatus, string> = {
  DRAFT: "border-brand-amber/25 bg-accent-soft text-brand-amber",
  PROPOSED: "border-brand-amber/25 bg-accent-soft text-brand-amber",
  CONFIRMED: "border-brand-teal/20 bg-primary-soft text-foreground",
  IN_PROGRESS: "border-brand-teal/20 bg-primary-soft text-foreground",
  COMPLETED: "border-slate-muted/20 bg-muted-soft text-slate-muted",
  CANCELLED: "border-slate-muted/20 bg-muted-soft text-slate-muted",
};

export const formatDate = (date: string | Date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Date unavailable";
  }

  return value.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (date: string | Date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Time unavailable";
  }

  return value.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export function formatPanelToken(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
