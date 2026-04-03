import type {
  PlanCategory,
  PlanStatus,
} from "@/features/activity/types/groups.types";

export const categoryColors: Record<PlanCategory, string> = {
  Tech: "bg-blue-500/15 text-blue-600",
  Sports: "bg-green-500/15 text-green-600",
  Arts: "bg-purple-500/15 text-purple-600",
  Social: "bg-orange-500/15 text-orange-600",
  Outdoors: "bg-emerald-500/15 text-emerald-600",
  Learning: "bg-indigo-500/15 text-indigo-600",
  Music: "bg-pink-500/15 text-pink-600",
  Food: "bg-amber-500/15 text-amber-600",
  Gaming: "bg-violet-500/15 text-violet-600",
  Wellness: "bg-teal-500/15 text-teal-600",
};

export const statusColors: Record<PlanStatus, string> = {
  DRAFT: "bg-slate-500/15 text-slate-600",
  CONFIRMED: "bg-teal-500/15 text-teal-600",
  COMPLETED: "bg-blue-500/15 text-blue-600",
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
