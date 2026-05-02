import { Calendar, MapPin, Users, Zap } from "lucide-react";

import { Image } from "@/shared/components/common/image";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";

interface GroupSummaryCardProps {
  activityTitle: string;
  coverImage: string | null;
  participantCount: number;
  planDate: string;
  planLocation: string;
  planTitle: string;
}

export function GroupSummaryCard({
  activityTitle,
  coverImage,
  participantCount,
  planDate,
  planLocation,
  planTitle,
}: GroupSummaryCardProps) {
  const coverPreset = getPlanCoverPreset(coverImage);
  const coverIsImage = Boolean(
    coverImage?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i),
  );

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
      <div className="h-20 w-full overflow-hidden">
        {coverIsImage ? (
          <Image src={coverImage ?? undefined} alt="" />
        ) : (
          <div
            className={cn(
              "h-full w-full transition-colors duration-300",
              coverPreset
                ? `bg-linear-to-br ${coverPreset.gradient}`
                : "bg-linear-to-br from-muted/60 to-muted/20",
            )}
          />
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-end gap-3 -mt-6 mb-3">
          <div
            className={cn(
              "w-14 h-14 rounded-xl border-4 border-card shrink-0 shadow-md flex items-center justify-center",
              coverPreset
                ? `bg-linear-to-br ${coverPreset.gradient}`
                : "bg-muted",
            )}
          >
            <Zap size={20} className="text-white/80" />
          </div>
          <div className="min-w-0 pb-0.5">
            <h4 className="text-base font-bold text-foreground truncate leading-tight">
              {planTitle || "Untitled Group"}
            </h4>
            {activityTitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {activityTitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40">
            <Users size={12} className="text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground">
              {participantCount} member{participantCount !== 1 ? "s" : ""}
            </span>
          </div>
          {planDate && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40">
              <Calendar size={12} className="text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground">
                {planDate}
              </span>
            </div>
          )}
          {planLocation && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40">
              <MapPin size={12} className="text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground truncate max-w-28">
                {planLocation}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-primary border-2 border-card flex items-center justify-center shadow-sm z-10">
              <span className="text-nano font-bold text-primary-foreground">
                You
              </span>
            </div>
            {Array.from({ length: Math.min(4, participantCount - 1) }).map(
              (_, index) => (
                <div
                  key={index}
                  className="w-7 h-7 rounded-full bg-accent/20 border-2 border-card shadow-sm"
                  style={{ zIndex: 9 - index }}
                />
              ),
            )}
            {participantCount > 5 && (
              <div
                className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center shadow-sm"
                style={{ zIndex: 4 }}
              >
                <span className="text-nano font-bold text-muted-foreground">
                  +{participantCount - 5}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {participantCount} member{participantCount !== 1 ? "s" : ""} ready
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forge-teal/10 border border-forge-teal/15">
          <span className="w-1.5 h-1.5 rounded-full bg-forge-teal animate-pulse" />
          <span className="text-xs font-semibold text-forge-teal">
            Verified
          </span>
        </span>
      </div>
    </div>
  );
}
