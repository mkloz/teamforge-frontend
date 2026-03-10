"use client";

import { Calendar, MapPin, Users } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Activity } from "../types/home.types";
import { getCategoryColors } from "../utils/category-colors";

export interface ActivityCardProps {
  activity: Activity;
  onJoin?: () => void;
}

export function ActivityCard({ activity, onJoin }: ActivityCardProps) {
  const colors = getCategoryColors(activity.category);
  const spotsRemaining = (activity.memberLimit || 0) - activity.memberCount;
  const formattedDate = new Date(activity.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  return (
    <button
      onClick={onJoin}
      className={cn(
        "group w-full overflow-hidden rounded-2xl border border-border bg-card",
        "transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-black/10",
        "dark:hover:shadow-black/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {/* Cover Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300",
            "group-hover:scale-105",
          )}
          loading="lazy"
        />

        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category Badge */}
        <div
          className={cn(
            "absolute top-3 left-3 rounded-lg px-2.5 py-1",
            colors.bg,
            colors.text,
            "text-xs font-semibold",
          )}
        >
          {activity.category}
        </div>

        {/* Similarity Score Badge */}
        {activity.similarity !== undefined && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary">
            <span>Match</span>
            <span className="font-bold">{Math.round(activity.similarity * 100)}%</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title */}
        <h3 className="line-clamp-2 text-left text-base font-semibold text-foreground">
          {activity.title}
        </h3>

        {/* Creator Info */}
        <div className="flex items-center gap-2">
          <img
            src={activity.creatorAvatar}
            alt={activity.creatorName}
            className="h-7 w-7 rounded-full object-cover"
          />
          <div className="flex flex-col gap-0">
            <p className="text-xs font-medium text-foreground">
              {activity.creatorName}
            </p>
            <p className="text-[10px] text-muted-foreground">{activity.location}</p>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={14} className="shrink-0" />
            <span>{formattedDate}</span>
          </div>

          {/* Spots */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users size={14} className="shrink-0" />
            <span>{spotsRemaining > 0 ? `${spotsRemaining} spots` : "Full"}</span>
          </div>
        </div>

        {/* Tags */}
        {activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activity.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  colors.light,
                  colors.text,
                )}
              >
                {tag}
              </span>
            ))}
            {activity.tags.length > 2 && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{activity.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          className={cn(
            "mt-2 w-full rounded-lg px-3 py-2 text-sm font-semibold",
            "bg-primary/10 text-primary hover:bg-primary/20",
            "transition-colors duration-150",
            spotsRemaining <= 0 && "opacity-50 cursor-not-allowed",
          )}
          disabled={spotsRemaining <= 0}
        >
          {spotsRemaining > 0 ? "Join" : "Full"}
        </button>
      </div>
    </button>
  );
}
