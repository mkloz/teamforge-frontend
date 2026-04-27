import type {
  PlanCategory,
  PlanStatus,
  GroupStatus,
} from "@/features/activity/types/groups.types";
import type { CostType, LocationMode } from "@/shared/schemas/enums";

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

// Cost type badges
export const costColors: Record<CostType, string> = {
  FREE: "bg-forge-teal/15 text-forge-teal",
  PAID: "bg-spark-amber/15 text-amber-600",
};

// Location mode badges
export const locationModeColors: Record<LocationMode, string> = {
  IN_PERSON: "bg-emerald-500/15 text-emerald-600",
  ONLINE: "bg-blue-500/15 text-blue-600",
  TBD: "bg-slate-500/15 text-slate-600",
};

// Group status badges
export const groupStatusColors: Record<GroupStatus, string> = {
  FORMING: "bg-blue-500/15 text-blue-600",
  PENDING: "bg-amber-500/15 text-amber-600",
  ACTIVE: "bg-forge-teal/15 text-forge-teal",
  PLANNING: "bg-indigo-500/15 text-indigo-600",
  COMPLETED: "bg-green-500/15 text-green-600",
  DISBANDED: "bg-red-500/15 text-red-600",
};

// Location mode display labels
export const locationModeLabels: Record<LocationMode, string> = {
  IN_PERSON: "In Person",
  ONLINE: "Online",
  TBD: "TBD",
};

// Group status display labels
export const groupStatusLabels: Record<GroupStatus, string> = {
  FORMING: "Forming",
  PENDING: "Pending",
  ACTIVE: "Active",
  PLANNING: "Planning",
  COMPLETED: "Completed",
  DISBANDED: "Disbanded",
};
