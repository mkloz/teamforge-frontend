import { cn } from "@/shared/lib/utils";
import { Check, ImagePlus } from "lucide-react";

export interface Step5IdentityProps {
  planName: string;
  activity: string | null;
  coverImage: string | null;
  onCoverImageChange: (url: string | null) => void;
}

export function Step5Identity({
  planName,
  activity,
  coverImage,
  onCoverImageChange,
}: Step5IdentityProps) {
  const PRESET_COVERS = [
    { color: "from-teal-500 to-emerald-400", label: "Ocean" },
    { color: "from-amber-400 to-orange-500", label: "Ember" },
    { color: "from-violet-500 to-purple-600", label: "Dusk" },
    { color: "from-rose-400 to-pink-600", label: "Bloom" },
    { color: "from-sky-400 to-blue-600", label: "Sky" },
    { color: "from-slate-600 to-zinc-800", label: "Graphite" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Group Identity Preview */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground/50 tracking-widest px-1">
          Identity preview
        </p>
        <div className="relative group overflow-hidden rounded-2xl border border-primary/20 bg-background shadow-xs">
          <div className="flex aspect-21/9 sm:aspect-16/5">
            {/* Left: Visual Signature */}
            <div
              className={cn(
                "w-1/4 sm:w-1/6 transition-all duration-700 bg-linear-to-br",
                coverImage === "uploaded"
                  ? "bg-primary/20"
                  : PRESET_COVERS.find((c) => c.label === coverImage)?.color ||
                      "from-muted to-muted/50",
              )}
            >
              {coverImage === "uploaded" && (
                <div className="w-full h-full flex items-center justify-center">
                  <ImagePlus size={20} className="text-primary/40" />
                </div>
              )}
            </div>

            <div className="flex-1 p-3 flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] font-black tracking-widest text-primary/60">
                  Identity
                </span>
              </div>
              <h3 className="text-[13px] font-black tracking-tight text-foreground line-clamp-1">
                {planName || "Untitled Group"}
              </h3>
              <p className="text-[9px] text-muted-foreground font-medium tracking-wider">
                {activity || "Activity Not Set"}
              </p>
            </div>
          </div>

          {/* Overlay scanning effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-scan pointer-events-none" />
        </div>
      </div>

      <div className="group rounded-xl border border-primary/20 bg-linear-to-br from-primary/3 to-transparent p-4 space-y-2 shadow-xs transition-all">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
          <p className="text-[10px] font-bold tracking-widest text-primary/80">
            Visual identity
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground leading-normal ml-3.5 italic">
          Give your group a unique look with a cover photo or color preset.
        </p>
      </div>

      {/* Upload Section */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground/50 tracking-widest px-1">
          Custom cover
        </p>
        <button
          type="button"
          onClick={() =>
            onCoverImageChange(coverImage === "uploaded" ? null : "uploaded")
          }
          className={cn(
            "group w-full h-20 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-300",
            coverImage === "uploaded"
              ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
              : "border-border/50 bg-background/50 hover:border-primary/40 hover:bg-primary/2",
          )}
        >
          {coverImage === "uploaded" ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Check size={16} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[9px] font-black tracking-widest text-primary uppercase">
                Photo Selected
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <ImagePlus size={18} className="text-muted-foreground/40" />
              <span className="text-[9px] font-black tracking-widest text-muted-foreground/60 group-hover:text-primary/80 transition-colors uppercase">
                Import background
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Presets Grid */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground/50 tracking-widest px-1">
          Color styles
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESET_COVERS.map(({ color, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => onCoverImageChange(label)}
              className={cn(
                "group relative h-12 rounded-xl bg-linear-to-br border transition-all duration-300 overflow-hidden",
                color,
                coverImage === label
                  ? "border-primary shadow-xs ring-1 ring-primary/40 scale-[1.02]"
                  : "border-transparent opacity-80 hover:opacity-100 hover:scale-[1.02]",
              )}
            >
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-1.5 left-2 text-[7px] font-black tracking-widest text-white drop-shadow-sm opacity-60 uppercase">
                {label}
              </span>
              {coverImage === label && (
                <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Check size={8} className="text-primary" strokeWidth={4} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
