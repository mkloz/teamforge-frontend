import type {
  PlanCategory,
  PlanStatus,
} from "@/features/activity/lib/activity-contract";

export const categoryColors: Record<PlanCategory, string> = {
  TECH: "bg-blue-500/15 text-blue-600",
  SPORTS: "bg-green-500/15 text-green-600",
  ARTS: "bg-purple-500/15 text-purple-600",
  SOCIAL: "bg-orange-500/15 text-orange-600",
  OUTDOORS: "bg-emerald-500/15 text-emerald-600",
  LEARNING: "bg-indigo-500/15 text-indigo-600",
  MUSIC: "bg-pink-500/15 text-pink-600",
  FOOD: "bg-amber-500/15 text-amber-600",
  GAMING: "bg-violet-500/15 text-violet-600",
  WELLNESS: "bg-teal-500/15 text-teal-600",
  TRAVEL: "bg-sky-500/15 text-sky-600",
  OTHER: "bg-slate-500/15 text-slate-600",
};

export const statusColors: Record<PlanStatus, string> = {
  DRAFT: "bg-slate-500/15 text-slate-600",
  PROPOSED: "bg-amber-500/15 text-amber-600",
  CONFIRMED: "bg-teal-500/15 text-teal-600",
  IN_PROGRESS: "bg-indigo-500/15 text-indigo-600",
  COMPLETED: "bg-blue-500/15 text-blue-600",
  CANCELLED: "bg-red-500/15 text-red-600",
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
