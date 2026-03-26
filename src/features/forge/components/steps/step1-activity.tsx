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
  ChevronRight,
} from "lucide-react";
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
}

export function Step1Activity({
  selectedActivity,
  onSelect,
}: Step1ActivityProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Recent / Forged Before — quick-select row at top */}
      {RECENT.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[11px] font-bold tracking-widest text-muted-foreground/50 uppercase">
              Quick select
            </p>
            <button
              type="button"
              className="flex items-center gap-0.5 text-[11px] font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              history <ChevronRight size={10} />
            </button>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-0.5 px-0.5 scrollbar-hide no-scrollbar snap-x touch-pan-x">
            {RECENT.map(({ id, label, count }) => {
              const Icon = ICON_MAP[id] || History;
              const active = selectedActivity === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSelect(label)}
                  className={cn(
                    "group relative flex items-center gap-2.5 min-w-40 shrink-0 px-3 py-2.5 rounded-xl border transition-all duration-300 snap-start",
                    active
                      ? "border-accent bg-accent/10 shadow-xs ring-1 ring-accent/20"
                      : "border-border/30 bg-background/50 hover:border-accent/20",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted/50 text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent",
                    )}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="text-left min-w-0">
                    <p
                      className={cn(
                        "text-xs font-black tracking-tight truncate",
                        active ? "text-accent" : "text-foreground",
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium opacity-60">
                      {count}× before
                    </p>
                  </div>
                  {active && (
                    <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Selection */}
      <div className="space-y-3">
        <div className="space-y-0.5 px-0.5">
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground/50 uppercase">
            What's the vibe?
          </p>
          <p className="text-[11px] text-muted-foreground/40 font-medium leading-snug">
            Pick a style to find the right people for your group.
          </p>
        </div>

        {/* Scroll-fade wrapper */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pb-2 max-h-[52vh] overflow-y-auto pr-0.5 scrollbar-hide no-scrollbar">
            {ACTIVITIES.map(({ id, label, description }) => {
              const Icon = ICON_MAP[id] || Activity;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(label)}
                  className={cn(
                    "group relative flex flex-col items-start gap-2.5 p-3 rounded-xl border transition-all duration-300",
                    selectedActivity === label
                      ? "border-accent bg-accent/5 shadow-xs ring-1 ring-accent/20"
                      : "border-border/50 bg-background/50 hover:border-accent/20 hover:bg-accent/2",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                      selectedActivity === label
                        ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                        : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent",
                    )}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="space-y-1 text-left">
                    <p
                      className={cn(
                        "text-xs font-black tracking-tight",
                        selectedActivity === label
                          ? "text-accent"
                          : "text-foreground",
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 opacity-70">
                      {description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {/* Bottom fade hint */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-background/60 to-transparent pointer-events-none rounded-b-xl" />
        </div>
      </div>
    </div>
  );
}
