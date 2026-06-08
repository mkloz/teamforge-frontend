import type {
  PlanCategory,
  PlanStatus,
} from "@/features/activity/lib/activity-contract";

export const categoryColors: Record<PlanCategory, string> = {
  TECH: "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
  SPORTS: "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
  ARTS: "border-spark-amber/25 bg-spark-amber/12 text-spark-amber",
  SOCIAL: "border-spark-amber/25 bg-spark-amber/12 text-spark-amber",
  OUTDOORS: "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
  LEARNING: "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
  MUSIC: "border-spark-amber/25 bg-spark-amber/12 text-spark-amber",
  FOOD: "border-spark-amber/25 bg-spark-amber/12 text-spark-amber",
  GAMING: "border-slate-muted/20 bg-slate-muted/10 text-slate-muted",
  WELLNESS: "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
  TRAVEL: "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
  OTHER: "border-slate-muted/20 bg-slate-muted/10 text-slate-muted",
};

export const statusColors: Record<PlanStatus, string> = {
  DRAFT: "border-spark-amber/25 bg-spark-amber/12 text-spark-amber",
  PROPOSED: "border-spark-amber/25 bg-spark-amber/12 text-spark-amber",
  CONFIRMED: "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
  IN_PROGRESS: "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
  COMPLETED: "border-slate-muted/20 bg-slate-muted/10 text-slate-muted",
  CANCELLED: "border-slate-muted/20 bg-slate-muted/10 text-slate-muted",
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString("en-US", {
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
