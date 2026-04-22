import { cn } from "@/shared/lib/utils";
import { ArrowRight } from "lucide-react";
import type { GroupPreview } from "../../types/explore.types";
import { CardFooter } from "./card-footer";
import { CardHeader } from "./card-header";
import { CardImage } from "./card-image";
import { CardMeta } from "./card-meta";

type GroupPlanCardProps = Omit<GroupPreview, "id"> & {
  variant?: "default" | "compact";
};

export function GroupPlanCard({
  matchScore,
  title,
  groupName,
  groupAvatarUrl,
  imageUrl = "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop",
  date,
  distance,
  locationMode = "In-Person",
  cost,
  category,
  currentSize,
  capacity,
  access,
  isFull = false,
  variant = "default",
}: GroupPlanCardProps) {
  const isCompact = variant === "compact";

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
        <CardImage
          imageUrl={imageUrl}
          title={title}
          matchScore={matchScore}
          category={category}
          variant={variant}
        />

        {/* Content Body */}
        <div
          className={cn(
            "flex flex-col grow overflow-hidden bg-canvas",
            isCompact ? "p-4" : "p-5 md:p-6",
          )}
        >
          <CardHeader
            groupName={groupName}
            groupAvatarUrl={groupAvatarUrl}
            access={access}
            variant={variant}
          />

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

          {!isCompact && (
            <CardMeta
              date={date}
              distance={distance}
              locationMode={locationMode}
              cost={cost}
            />
          )}

          <div className="h-px w-full bg-border/60 my-0 mt-auto relative z-10" />

          <CardFooter
            currentSize={currentSize}
            capacity={capacity}
            isFull={isFull}
            access={access}
            title={title}
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
}
