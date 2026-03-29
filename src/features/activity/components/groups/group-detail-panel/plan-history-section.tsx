import { useState } from "react";
import {
  History,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  Calendar,
  RotateCcw,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type {
  PlanHistoryItem,
  PlanCategory,
  MemberRole,
} from "@/features/activity/types/groups.types";

interface PlanHistorySectionProps {
  history: PlanHistoryItem[];
  userRole: MemberRole;
}

const categoryColors: Record<PlanCategory, string> = {
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

export function PlanHistorySection({
  history,
  userRole,
}: PlanHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAdmin = userRole === "ADMIN";

  if (history.length === 0 && !isAdmin) return null;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History size={16} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Plan History
            {history.length > 0 && (
              <span className="ml-1.5 text-muted-foreground font-normal">
                ({history.length})
              </span>
            )}
          </h3>
        </div>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary gap-1"
          >
            <Plus size={14} />
            New Plan
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No completed plans yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Past activities will appear here once completed
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Show first item or all if expanded */}
          {(isExpanded ? history : history.slice(0, 2)).map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}

          {/* Expand/collapse button */}
          {history.length > 2 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-full flex items-center justify-center gap-1.5 py-2",
                "text-xs text-muted-foreground hover:text-foreground transition-colors",
              )}
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Show {history.length - 2} more
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function HistoryCard({ item }: { item: PlanHistoryItem }) {
  return (
    <div className="flex gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-4xl overflow-hidden shrink-0">
        <img
          src={item.coverImage}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground truncate">
            {item.title}
          </h4>
          {item.rating && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <span className="text-xs text-muted-foreground">
                {item.rating}
              </span>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded font-medium",
              categoryColors[item.category],
            )}
          >
            {item.category}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Calendar size={10} />
            {new Date(item.dateTime).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Location */}
        <p className="text-[10px] text-muted-foreground mt-1 truncate flex items-center gap-0.5">
          <MapPin size={10} />
          {item.location}
        </p>
      </div>

      {/* Reuse button - appears on hover */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 shrink-0 self-center",
          "opacity-0 group-hover:opacity-100 transition-opacity",
        )}
        title="Create similar plan"
      >
        <RotateCcw size={14} />
      </Button>
    </div>
  );
}
