import { Button } from "@/shared/components/ui/button";

interface CardFooterProps {
  currentSize: number;
  capacity: number;
  isFull: boolean;
  access: string;
  title: string;
}

export function CardFooter({
  currentSize,
  capacity,
  isFull,
  access,
  title,
}: CardFooterProps) {
  return (
    <div className="flex items-center justify-between pt-2 mt-auto relative z-20 gap-3">
      {/* Availability Insights */}
      <div className="flex items-center gap-2.5">
        {/* Avatar Stack */}
        <div className="flex -space-x-2 shrink-0">
          {[...Array(Math.min(currentSize, 4))].map((_, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-thin border-canvas bg-canvas flex items-center justify-center overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:z-20 relative"
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
            <div className="w-7 h-7 rounded-full border-thin border-canvas bg-muted flex items-center justify-center text-[10px] font-extrabold text-muted-foreground relative z-10 transition-transform duration-300 hover:-translate-y-1 hover:z-20">
              +{currentSize - 4}
            </div>
          )}
        </div>

        {/* Spots Left / Capacity */}
        <div className="text-xs flex flex-col justify-center leading-tight">
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
          className={`shrink-0 z-20 shadow-sm ${isFull ? "opacity-50 pointer-events-none hidden md:inline-flex" : ""}`}
        >
          {isFull ? "Full" : access === "By Request" ? "Request" : "Join"}
        </Button>
      </button>
    </div>
  );
}
