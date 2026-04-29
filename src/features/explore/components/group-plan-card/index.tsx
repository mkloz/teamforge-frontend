import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";
import { ArrowRight } from "lucide-react";
import { CardFooter } from "./card-footer";
import { CardHeader } from "./card-header";
import { CardImage } from "./card-image";
import { CardMeta } from "./card-meta";
import {
  getExploreGroupDistanceLabel,
  getExploreGroupMatchScore,
  isExploreGroupFull,
} from "../../lib/explore-presenters";

type GroupPlanCardProps = {
  group: ExploreGroup;
  variant?: "default" | "compact";
};

export function GroupPlanCard({
  group,
  variant = "default",
}: GroupPlanCardProps) {
  const isCompact = variant === "compact";
  const plan = group.plan;
  const title = plan?.title || group.activity.title || "Unnamed Activity";
  const matchScore = getExploreGroupMatchScore(group);
  const distance = getExploreGroupDistanceLabel(group);
  const isFull = isExploreGroupFull(group);

  return (
    <div className="group relative list-none outline-none">
      {/*
        Card Container
        Mechanical 3D hover: border shifts to ink, hard shadow pushes out.
      */}
      <div
        className={cn(
          "relative z-10 flex w-full bg-card border-2 border-border rounded-3xl transition-all duration-150 ease-out hover:-translate-y-1 hover:border-ink hover:shadow-button-outline cursor-pointer overflow-hidden dark:hover:border-white dark:hover:shadow-button-outline-dark isolate",
          isCompact ? "flex-col max-w-[320px]" : "flex-col md:flex-row",
        )}
      >
        <CardImage group={group} matchScore={matchScore} variant={variant} />

        {/* Content Body */}
        <div
          className={cn(
            "flex flex-col grow overflow-hidden bg-canvas",
            isCompact ? "p-4" : "p-5 md:p-6",
          )}
        >
          <CardHeader group={group} variant={variant} />

          {/* Plan Title Sequence */}
          <div className={cn("relative z-20", isCompact ? "mb-3" : "mb-5")}>
            <h3
              className={cn(
                "font-extrabold text-foreground tracking-tight leading-tight md:pr-6 group-hover:text-primary transition-colors duration-300 line-clamp-2",
                isCompact ? "text-lg" : "text-2xl",
              )}
            >
              {title}
            </h3>

            {/* Interaction Arrow */}
            {!isCompact && (
              <div className="absolute right-0 top-1 text-muted-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-300 ease-out hidden md:block">
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </div>

          {!isCompact && <CardMeta group={group} distance={distance} />}

          <div className="h-px w-full bg-border/60 my-0 mt-auto relative z-10" />

          <CardFooter group={group} isFull={isFull} variant={variant} />
        </div>
      </div>
    </div>
  );
}
