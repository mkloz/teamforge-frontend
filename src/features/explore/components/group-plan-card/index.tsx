import { ArrowRight } from "lucide-react";
import type { GroupPreview } from "../../types/explore.types";
import { CardFooter } from "./card-footer";
import { CardHeader } from "./card-header";
import { CardImage } from "./card-image";
import { CardMeta } from "./card-meta";

type GroupPlanCardProps = Omit<GroupPreview, "id">;

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
}: GroupPlanCardProps) {
  return (
    <div className="group relative list-none outline-none">
      {/*
        Card Container
        Mechanical 3D hover: border shifts to ink, hard shadow pushes out.
      */}
      <div className="relative z-10 flex flex-col md:flex-row w-full bg-card border-2 border-border rounded-3xl transition-all duration-150 ease-out hover:-translate-y-1 hover:border-ink hover:shadow-button-outline cursor-pointer overflow-hidden dark:hover:border-white dark:hover:shadow-button-outline-dark isolate">
        <CardImage
          imageUrl={imageUrl}
          title={title}
          matchScore={matchScore}
          category={category}
        />

        {/* Content Body */}
        <div className="flex flex-col p-5 md:p-6 grow overflow-hidden bg-canvas">
          <CardHeader
            groupName={groupName}
            groupAvatarUrl={groupAvatarUrl}
            access={access}
          />

          {/* Plan Title Sequence */}
          <div className="relative mb-5 z-20">
            <h3 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight md:pr-6 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>

            {/* Interaction Arrow */}
            <div className="absolute right-0 top-1 text-muted-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-300 ease-out hidden md:block">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <CardMeta
            date={date}
            distance={distance}
            locationMode={locationMode}
            cost={cost}
          />

          <div className="h-px w-full bg-border/60 my-0 mt-auto relative z-10" />

          <CardFooter
            currentSize={currentSize}
            capacity={capacity}
            isFull={isFull}
            access={access}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
