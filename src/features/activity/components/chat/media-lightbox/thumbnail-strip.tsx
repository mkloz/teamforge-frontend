import { cn } from "@/shared/lib/utils";
import { useImageState } from "@/shared/hooks/use-image-state";
import { ImageOff } from "lucide-react";
import { memo } from "react";
import type { UnifiedAttachment } from "@/features/activity/types/chat.types";

interface ThumbnailStripProps {
  attachments: UnifiedAttachment[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

function ThumbnailItem({
  media,
  isSelected,
  onSelect,
}: {
  media: UnifiedAttachment;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { state, onLoad, onError } = useImageState();

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-12 h-12 rounded-lg overflow-hidden shrink-0 relative",
        "transition-[opacity,transform,filter] duration-200",
        isSelected
          ? "ring-2 ring-forge-teal scale-110 opacity-100 z-10"
          : "opacity-40 grayscale-50 hover:opacity-100 hover:grayscale-0",
      )}
    >
      {/* Skeleton */}
      {state === "loading" && (
        <div className="absolute inset-0 bg-white/10 animate-pulse rounded-lg" />
      )}

      {/* Error */}
      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
          <ImageOff size={14} className="text-white/30" />
        </div>
      )}

      <img
        src={media.thumbnailUrl || media.url}
        alt=""
        loading="lazy"
        onLoad={onLoad}
        onError={onError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-200",
          state === "loaded" ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}

export const ThumbnailStrip = memo(
  ({ attachments, selectedIndex, onSelect }: ThumbnailStripProps) => (
    <div className="absolute bottom-10 inset-x-0 h-16 flex justify-center items-center px-10 pointer-events-none">
      <div className="flex gap-2 p-2 bg-black/40 backdrop-blur-2xl rounded-xl border border-white/10 overflow-x-auto scrollbar-none pointer-events-auto">
        {attachments.map((media, i) => (
          <ThumbnailItem
            key={media.id}
            media={media}
            isSelected={selectedIndex === i}
            onSelect={() => onSelect(i)}
          />
        ))}
      </div>
    </div>
  ),
);
