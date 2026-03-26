import { cn } from "@/shared/lib/utils";
import * as RadixSlider from "@radix-ui/react-slider";
import {
  AlertCircle,
  ChevronDown,
  Cpu,
  Globe,
  Lock,
  UserCheck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { ForgeMode, Visibility } from "../../types/forge.types";

export interface Step3GroupProps {
  forgeMode: ForgeMode;
  onForgeModeChange: (v: ForgeMode) => void;
  autoMinSize: number;
  onAutoMinSizeChange: (v: number) => void;
  autoMaxSize: number;
  onAutoMaxSizeChange: (v: number) => void;
  compatibilityWeight: number;
  onCompatibilityWeightChange: (v: number) => void;
  diversityWeight: number;
  onDiversityWeightChange: (v: number) => void;
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
}

export function Step3Group({
  forgeMode,
  onForgeModeChange,
  autoMinSize,
  onAutoMinSizeChange,
  autoMaxSize,
  onAutoMaxSizeChange,
  compatibilityWeight,
  onCompatibilityWeightChange,
  diversityWeight,
  onDiversityWeightChange,
  visibility,
  onVisibilityChange,
}: Step3GroupProps) {
  const [algorithmsExpanded, setAlgorithmsExpanded] = useState(true);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-4">
      {/* ── Method Selector ── */}
      <section className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground px-0.5">
          Choose your method
        </p>
        <div className="grid grid-cols-2 gap-3">
          <ModeButton
            active={forgeMode === "auto"}
            onClick={() => onForgeModeChange("auto")}
            icon={<Cpu size={16} />}
            title="Algorithmic"
            description="Algorithm finds the best balance for you."
            activeColor="primary"
          />
          <ModeButton
            active={forgeMode === "manual"}
            onClick={() => onForgeModeChange("manual")}
            icon={<Zap size={16} />}
            title="Manual"
            description="You pick the members and set a fixed size."
            activeColor="accent"
          />
        </div>
      </section>

      {/* ── Group Details ── */}
      <section className="space-y-4 pt-2 border-t border-muted/20">
        <p className="text-xs font-semibold text-muted-foreground px-0.5">
          Group details
        </p>

        {forgeMode === "manual" ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="rounded-xl border border-muted/20 bg-muted/5 p-4 flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle size={16} className="text-orange-500" />
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-black tracking-tight text-foreground">
                  Manual Group Creation
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed opacity-80">
                  You are creating a standalone group. TeamForge won't search
                  for additional members. Invite people manually after forging.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
            {/* Capacity Range */}
            <div className="px-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground/50 tracking-wide">
                  Capacity range
                </span>
                <div className="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 leading-none">
                  <span className="text-xs font-black text-primary tabular-nums tracking-wider">
                    {autoMinSize} - {autoMaxSize}
                  </span>
                </div>
              </div>

              <div className="py-2 space-y-2">
                <RadixSlider.Root
                  className="relative flex items-center select-none touch-none w-full h-10"
                  value={[autoMinSize, autoMaxSize]}
                  onValueChange={([min, max]) => {
                    onAutoMinSizeChange(min);
                    onAutoMaxSizeChange(max);
                  }}
                  min={3}
                  max={12}
                  step={1}
                  minStepsBetweenThumbs={1}
                >
                  <RadixSlider.Track className="bg-muted relative grow rounded-full h-1.5">
                    <RadixSlider.Range className="absolute bg-primary rounded-full h-full" />
                  </RadixSlider.Track>
                  <RadixSlider.Thumb
                    className="block w-6 h-6 bg-background border-2 border-primary rounded-full shadow-md shadow-primary/20 hover:scale-110 active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing"
                    aria-label="Minimum members"
                  />
                  <RadixSlider.Thumb
                    className="block w-6 h-6 bg-background border-2 border-primary rounded-full shadow-md shadow-primary/20 hover:scale-110 active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing"
                    aria-label="Maximum members"
                  />
                </RadixSlider.Root>
                <div className="flex justify-between px-0.5">
                  <span className="text-[11px] text-muted-foreground/40">3 min</span>
                  <span className="text-[11px] text-muted-foreground/40">12 max</span>
                </div>
              </div>
            </div>

            {/* Collapsible Algorithm Tuning */}
            <div className="rounded-xl border overflow-hidden">
              <button
                type="button"
                onClick={() => setAlgorithmsExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors"
              >
                <div className="text-left space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Algorithm tuning</p>
                  <p className="text-xs text-muted-foreground/70">
                    Match: {compatibilityWeight}% · Diversity: {diversityWeight}%
                  </p>
                </div>
                <ChevronDown
                  size={15}
                  className={cn(
                    "text-muted-foreground/40 transition-transform duration-300",
                    algorithmsExpanded ? "rotate-180" : "",
                  )}
                />
              </button>

              {algorithmsExpanded && (
                <div className="px-4 pb-4 space-y-5 border-t border-muted/15 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <WeightSlider
                    label="Matching level"
                    subLabel="Prioritize behavioral compatibility"
                    value={compatibilityWeight}
                    onChange={onCompatibilityWeightChange}
                    min={20}
                    max={100}
                    step={5}
                  />
                  <WeightSlider
                    label="Diversity focus"
                    subLabel="Encourage unique cognitive backgrounds"
                    value={diversityWeight}
                    onChange={onDiversityWeightChange}
                    min={0}
                    max={100}
                    step={5}
                    warning={
                      diversityWeight > 80
                        ? "High diversity values may take longer to match"
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Privacy Settings ── */}
      <section className="space-y-3 pt-2 border-t border-muted/20">
        <div className="px-0.5">
          <p className="text-xs font-semibold text-muted-foreground">Who can find this group?</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Controls who can discover and join.</p>
        </div>

        <div className="flex flex-col gap-2">
          {[
            {
              value: "public",
              label: "Public",
              description: "Anyone on TeamForge can discover and request to join.",
              Icon: Globe,
            },
            {
              value: "friends",
              label: "Friends only",
              description: "Only people in your network can see and request to join.",
              Icon: UserCheck,
            },
            {
              value: "invite",
              label: "Private — invite only",
              description: "Hidden from discovery. Members join by invitation only.",
              Icon: Lock,
            },
          ].map(({ value, label, description, Icon }) => {
            const active = visibility === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onVisibilityChange(value as Visibility)}
                className={cn(
                  "group w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200",
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                    : "border-border/40 bg-card hover:border-primary/30 hover:bg-primary/3",
                )}
              >
                {/* Icon badge */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                  )}
                >
                  <Icon size={17} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-tight",
                      active ? "text-primary" : "text-foreground",
                    )}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {description}
                  </p>
                </div>

                {/* Selection indicator */}
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center mt-1 transition-all duration-200",
                    active
                      ? "border-primary bg-primary"
                      : "border-border/50",
                  )}
                >
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ModeButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  activeColor: "primary" | "accent";
}

function ModeButton({
  active,
  onClick,
  icon,
  title,
  description,
  activeColor,
}: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start gap-2.5 p-3.5 rounded-xl border text-left transition-all duration-300 overflow-hidden",
        active
          ? activeColor === "primary"
            ? "border-primary bg-primary text-primary-foreground shadow-md"
            : "border-accent bg-accent text-accent-foreground shadow-md"
          : "border-border bg-background/50 hover:border-border hover:bg-background shadow-xs",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            active ? "bg-white/20" : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "text-xs font-black tracking-tight",
            active ? "text-inherit" : "text-foreground",
          )}
        >
          {title}
        </span>
      </div>
      <p
        className={cn(
          "text-[11px] leading-snug font-semibold opacity-90 pr-2",
          active ? "text-inherit/80" : "text-muted-foreground",
        )}
      >
        {description}
      </p>
      {active && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 -mr-8 -mt-8 rounded-full blur-xl pointer-events-none" />
      )}
    </button>
  );
}

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  warning?: string;
  subLabel?: string;
}

function WeightSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  warning,
  subLabel,
}: WeightSliderProps) {
  const [dragging, setDragging] = useState(false);
  const isHighDiversity = label.includes("Diversity") && value > 75;
  const semanticLabels = label.toLowerCase().includes("personality")
    ? { min: "Broad Match", max: "Highly Compatible" }
    : { min: "Consistent", max: "Diverse" };

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          {subLabel && (
            <p className="text-xs text-muted-foreground/60 leading-snug">{subLabel}</p>
          )}
        </div>
        <div
          className={cn(
            "text-sm font-black italic tabular-nums transition-colors duration-300 shrink-0",
            isHighDiversity ? "text-amber-500" : "text-primary",
            dragging && "scale-110 transition-transform",
          )}
        >
          {value}%
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => {
          setDragging(true);
          onChange(Number(e.target.value));
        }}
        onMouseUp={() => setDragging(false)}
        onTouchEnd={() => setDragging(false)}
        className={cn(
          "range-input w-full h-2 rounded-full cursor-pointer",
          isHighDiversity ? "accent-amber-500" : "accent-primary",
        )}
      />

      {/* Dot visualizer — gradient progression */}
      <div className="flex justify-between items-center gap-1 px-0.5 -mt-2">
        {Array.from({ length: 15 }).map((_, i) => {
          const dotPct = (i / 14) * 100;
          const active = pct >= dotPct;
          const intensity = active ? Math.min(1, (pct - dotPct) / 20 + 0.4) : 0;
          return (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                active
                  ? isHighDiversity
                    ? "bg-amber-500/50"
                    : "bg-primary/50"
                  : "bg-muted/30",
              )}
              style={active ? { opacity: 0.4 + intensity * 0.6 } : undefined}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-[11px] font-medium text-muted-foreground/50 -mt-1">
        <span>{semanticLabels.min}</span>
        <span>{semanticLabels.max}</span>
      </div>

      {warning && (
        <div className="flex items-center gap-2 px-1 text-[11px] font-bold text-amber-600/80 tracking-tight animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={12} />
          {warning}
        </div>
      )}
    </div>
  );
}
