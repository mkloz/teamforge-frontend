import { cn } from "@/shared/lib/utils";
import {
  Activity,
  Gamepad2,
  Users,
  Palette,
  Music,
  Mountain,
  GraduationCap,
  UtensilsCrossed,
  Briefcase,
  Heart,
  Scissors,
  HandHeart,
  History,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ACTIVITIES, RECENT } from "../../constants/forge.constants";

const ICON_MAP: Record<string, React.ElementType> = {
  sports: Activity,
  gaming: Gamepad2,
  social: Users,
  arts: Palette,
  music: Music,
  outdoors: Mountain,
  learning: GraduationCap,
  food: UtensilsCrossed,
  professional: Briefcase,
  wellness: Heart,
  creative: Scissors,
  community: HandHeart,
};

export interface Step1ActivityProps {
  selectedActivity: string | null;
  onSelect: (activity: string) => void;
  /** Called by ForgeFooter when the Continue button is tapped while disabled */
  onShakeGrid?: () => void;
}

declare global {
  interface Window {
    __forgeShakeGrid?: () => void;
  }
}

export function Step1Activity({
  selectedActivity,
  onSelect,
}: Step1ActivityProps) {
  const [shaking, setShaking] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  // Expose triggerShake via a global property so ForgeFooter can call it imperatively
  useEffect(() => {
    window.__forgeShakeGrid = triggerShake;
    return () => {
      delete window.__forgeShakeGrid;
    };
  }, [triggerShake]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Recent / Quick-select row */}
      {RECENT.length > 0 && (
        <div className="space-y-2.5">
          {/* Section heading — readable size, no all-caps, no tracking-widest */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">
              Recent activity
            </p>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <History size={11} />
              <span>View all</span>
            </button>
          </div>

          {/* Horizontal scroll — right-peek gradient signals more content */}
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory touch-pan-x">
              {RECENT.map(({ id, label, count }) => {
                const Icon = ICON_MAP[id] || History;
                const active = selectedActivity === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onSelect(label)}
                    aria-pressed={active}
                    className={cn(
                      "group relative flex items-center gap-3 min-w-40 shrink-0 px-3.5 py-3 rounded-2xl border snap-start transition-colors duration-200",
                      active
                        ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                        : "border-border/40 bg-card hover:border-accent/30 hover:bg-accent/5",
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent",
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="text-left min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold truncate leading-tight",
                          active ? "text-accent" : "text-foreground",
                        )}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {count}x before
                      </p>
                    </div>
                    {active && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
            {/* Right-edge peek fade — signals horizontal scroll */}
            <div className="absolute top-0 right-0 bottom-1 w-8 bg-linear-to-l from-background to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      {/* Category grid */}
      <div className="space-y-2.5">
        <div>
          {/* Corrected hierarchy: section title larger than description */}
          <p className="text-xs font-semibold text-muted-foreground">
            Choose a category
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">
            Pick the style that fits your plan and we&apos;ll find the right
            people.
          </p>
        </div>

        {/* Grid — taller cards for 44px+ touch targets, no height cap so content isn't hidden */}
        <div
          ref={gridRef}
          className={cn(
            "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 transition-transform",
            shaking && "animate-[shake_0.45s_ease-in-out]",
          )}
        >
          {ACTIVITIES.map(({ id, label, description }) => {
            const Icon = ICON_MAP[id] || Activity;
            const selected = selectedActivity === label;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(label)}
                aria-pressed={selected}
                className={cn(
                  "group relative flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition duration-200 min-h-25 active:scale-[0.97]",
                  selected
                    ? "border-accent bg-accent/8 ring-1 ring-accent/25 shadow-sm"
                    : "border-border/40 bg-card hover:border-accent/30 hover:bg-accent/5",
                )}
              >
                {/* Selected check mark */}
                {selected && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                    <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                      <path
                        d="M1 3.5L3 5.5L7 1.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200",
                    selected
                      ? "bg-accent text-accent-foreground shadow-sm shadow-accent/25"
                      : "bg-muted text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent",
                  )}
                >
                  <Icon size={17} />
                </div>

                {/* Text — corrected opacity, correct size */}
                <div className="space-y-0.5">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-tight",
                      selected ? "text-accent" : "text-foreground",
                    )}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                    {description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
