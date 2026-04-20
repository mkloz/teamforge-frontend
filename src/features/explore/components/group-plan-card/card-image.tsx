import { Target } from "lucide-react";

interface CardImageProps {
  imageUrl: string;
  title: string;
  matchScore: number;
  category: string;
}

export function CardImage({
  imageUrl,
  title,
  matchScore,
  category,
}: CardImageProps) {
  const isHighMatch = matchScore >= 90;

  return (
    <div className="relative h-56 md:h-auto md:w-2/5 overflow-hidden shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-border group-hover:border-ink dark:group-hover:border-white transition-colors duration-150">
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />

      {/* Top Right: Compact Algorithm Match Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[11px] tracking-tight shadow-md backdrop-blur-md transition-all ${
            isHighMatch
              ? "bg-accent/90 border border-accent/40 text-accent-foreground group-hover:bg-accent"
              : "bg-black/60 border border-white/20 text-white"
          }`}
        >
          <Target
            className={`w-3.5 h-3.5 ${isHighMatch ? "animate-pulse-glow stroke-[2.5]" : "text-white/80"}`}
          />
          {matchScore}%
        </div>
      </div>

      {/* Bottom Left Floating Pill (Category) */}
      <div className="absolute bottom-4 left-5">
        <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
          {category}
        </span>
      </div>
    </div>
  );
}
