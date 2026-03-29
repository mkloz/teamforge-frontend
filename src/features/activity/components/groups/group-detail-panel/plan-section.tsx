import { Calendar, MapPin, Clock, Pencil, Image } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type {
  Plan,
  PlanCategory,
  MemberRole,
} from "@/features/activity/types/groups.types";

interface PlanSectionProps {
  plan: Plan;
  userRole?: MemberRole;
  showCoverImage?: boolean;
}

const categoryColors: Record<PlanCategory, string> = {
  Tech: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Sports: "bg-green-500/15 text-green-600 dark:text-green-400",
  Arts: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  Social: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  Outdoors: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Learning: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  Music: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  Food: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Gaming: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  Wellness: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  CONFIRMED: "bg-green-500/15 text-green-600 dark:text-green-400",
  COMPLETED: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function PlanSection({
  plan,
  userRole = "MEMBER",
  showCoverImage = false,
}: PlanSectionProps) {
  const isAdmin = userRole === "ADMIN";
  const canEdit = isAdmin && plan.status === "DRAFT";

  return (
    <section>
      {/* Cover image (optional - for when not shown elsewhere) */}
      {showCoverImage && (
        <div className="relative rounded-xl overflow-hidden mb-4 group">
          <img
            src={plan.coverImage}
            alt={plan.title}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          {canEdit && (
            <button
              className={cn(
                "absolute top-2 right-2 p-1.5 rounded-lg",
                "bg-black/40 hover:bg-black/60 transition-colors",
                "opacity-0 group-hover:opacity-100",
              )}
              aria-label="Change cover image"
            >
              <Image size={14} className="text-white" />
            </button>
          )}
        </div>
      )}

      {/* Title and badges */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-bold text-foreground">{plan.title}</h2>
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            title="Edit plan"
          >
            <Pencil size={14} />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
            categoryColors[plan.category],
          )}
        >
          {plan.category}
        </span>
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
            statusColors[plan.status],
          )}
        >
          {plan.status === "DRAFT" ? "Awaiting Confirmation" : plan.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        {plan.description}
      </p>

      {/* Details */}
      <div className="mt-4 space-y-3">
        {/* Date */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
            <Calendar size={16} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {formatDate(plan.dateTime)}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
            <Clock size={16} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {formatTime(plan.dateTime)}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
            <MapPin size={16} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{plan.location}</p>
            {plan.locationCoords && (
              <a
                href={`https://maps.google.com/?q=${plan.locationCoords.lat},${plan.locationCoords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Open in Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
