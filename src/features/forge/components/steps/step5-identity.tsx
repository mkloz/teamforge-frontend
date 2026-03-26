import { cn } from "@/shared/lib/utils";
import { Check, ImagePlus, Palette } from "lucide-react";

export interface Step5IdentityProps {
  planName: string;
  activity: string | null;
  coverImage: string | null;
  onCoverImageChange: (url: string | null) => void;
}

const PRESET_COVERS = [
  { color: "from-teal-500 to-emerald-400", label: "Ocean" },
  { color: "from-amber-400 to-orange-500", label: "Ember" },
  { color: "from-violet-500 to-purple-600", label: "Dusk" },
  { color: "from-rose-400 to-pink-600", label: "Bloom" },
  { color: "from-sky-400 to-blue-600", label: "Sky" },
  { color: "from-slate-600 to-zinc-800", label: "Graphite" },
];

export function Step5Identity({
  planName,
  activity,
  coverImage,
  onCoverImageChange,
}: Step5IdentityProps) {
  const activePreset = PRESET_COVERS.find((c) => c.label === coverImage);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">

      {/* Preview card */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground">Identity preview</p>
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
          {/* Cover strip */}
          <div
            className={cn(
              "h-20 w-full transition-all duration-500 bg-gradient-to-br",
              coverImage === "uploaded"
                ? "bg-primary/20"
                : activePreset?.color ?? "from-muted/60 to-muted/30",
            )}
          >
            {coverImage === "uploaded" && (
              <div className="w-full h-full flex items-center justify-center">
                <ImagePlus size={22} className="text-white/60" />
              </div>
            )}
          </div>
          {/* Info row */}
          <div className="px-4 pb-4 pt-3 flex items-start gap-3">
            {/* Avatar circle pulled up */}
            <div
              className={cn(
                "w-12 h-12 rounded-xl border-2 border-background shrink-0 -mt-6 flex items-center justify-center shadow-md bg-gradient-to-br",
                activePreset?.color ?? "from-primary/30 to-primary/10",
              )}
            />
            <div className="min-w-0 pt-1">
              <h3 className="text-sm font-bold text-foreground truncate">
                {planName || "Untitled Group"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activity || "Activity not set"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Context note */}
      <div className="flex gap-3 p-4 rounded-2xl border border-border/40 bg-card">
        <Palette size={16} className="text-primary/60 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">Visual identity</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Give your group a distinct look with a cover photo or one of the color presets below. This is visible to all members.
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground">Custom cover photo</p>
        <button
          type="button"
          onClick={() => onCoverImageChange(coverImage === "uploaded" ? null : "uploaded")}
          className={cn(
            "group w-full h-[72px] rounded-2xl border border-dashed flex items-center justify-center gap-3 transition-all duration-200",
            coverImage === "uploaded"
              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
              : "border-border/50 bg-card hover:border-primary/40 hover:bg-primary/3",
          )}
        >
          {coverImage === "uploaded" ? (
            <>
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-sm shadow-primary/25">
                <Check size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-primary">Photo selected</span>
            </>
          ) : (
            <>
              <ImagePlus size={18} className="text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Upload a background image
              </span>
            </>
          )}
        </button>
      </div>

      {/* Color presets */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground">Color presets</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {PRESET_COVERS.map(({ color, label }) => {
            const selected = coverImage === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onCoverImageChange(selected ? null : label)}
                aria-pressed={selected}
                className={cn(
                  "group relative h-16 rounded-2xl bg-gradient-to-br border-2 transition-all duration-200 overflow-hidden",
                  color,
                  selected
                    ? "border-primary shadow-md scale-[1.03]"
                    : "border-transparent opacity-75 hover:opacity-100 hover:scale-[1.02]",
                )}
              >
                <span className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-white/80 drop-shadow-sm">
                  {label}
                </span>
                {selected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Check size={10} className="text-primary" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
