import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { Group } from "@/shared/schemas";

interface CardFooterProps {
  group: Group;
  isFull: boolean;
  variant?: "default" | "compact";
}

export function CardFooter({
  group,
  isFull,
  variant = "default",
}: CardFooterProps) {
  const isCompact = variant === "compact";
  const currentSize = group.members?.length || 0;
  const capacity = group.maxMembers || 0;
  const access = group.activity?.access || "OPEN";
  const title = group.plan?.title || group.activity?.title || "Activity";

  return (
    <div
      className={cn(
        "flex items-center justify-between mt-auto relative z-20 gap-3",
        isCompact ? "pt-1" : "pt-2",
      )}
    >
      {/* Availability Insights */}
      <div className="flex items-center gap-2.5">
        {/* Avatar Stack */}
        <div className="flex -space-x-2 shrink-0">
          {[...Array(Math.min(currentSize, 4))].map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full border-thin border-canvas bg-canvas flex items-center justify-center overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:z-20 relative",
                isCompact ? "size-6" : "w-7 h-7",
              )}
            >
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${title}${i}`}
                alt={`Member ${i + 1}`}
                className="w-full h-full object-cover bg-muted"
                loading="lazy"
              />
            </div>
          ))}

          {/* Remainder Badge */}
          {currentSize > 4 && (
            <div
              className={cn(
                "rounded-full border-thin border-canvas bg-muted flex items-center justify-center text-[10px] font-extrabold text-muted-foreground relative z-10 transition-transform duration-300 hover:-translate-y-1 hover:z-20",
                isCompact ? "size-6" : "w-7 h-7",
              )}
            >
              +{currentSize - 4}
            </div>
          )}
        </div>

        {/* Spots Left / Capacity */}
        <div
          className={cn(
            "flex flex-col justify-center leading-tight",
            isCompact ? "text-[10px]" : "text-xs",
          )}
        >
          <span className="font-extrabold text-foreground">
            {currentSize}/{capacity}
          </span>
          {!isFull && (
            <span className="font-bold text-accent">
              {capacity - currentSize} left
            </span>
          )}
          {isFull && <span className="font-bold text-destructive">Full</span>}
        </div>
      </div>

      <button
        type="button"
        className="contents"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant={isFull ? "outline" : "primary"}
          size={isCompact ? "sm" : "default"}
          className={cn(
            "shrink-0 z-20 shadow-sm",
            isFull && "opacity-50 pointer-events-none hidden md:inline-flex",
          )}
        >
          {isFull ? "Full" : access === "BY_REQUEST" ? "Request" : "Join"}
        </Button>
      </button>
    </div>
  );
}
