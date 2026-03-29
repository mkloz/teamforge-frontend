"use client";

import { cn } from "@/shared/lib/utils";
import * as RadixSlider from "@radix-ui/react-slider";
import {
  AlertCircle,
  ChevronDown,
  Cpu,
  Globe,
  Lock,
  Sparkles,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ForgeMode, Visibility } from "../../types/forge.types";

// ── Activity-keyed name pools ─────────────────────────────────────────────────
// Each activity key maps to a large pool; 5 random unique variants are picked
// once when the component mounts (or when the activity changes).
const ACTIVITY_NAME_POOLS: Record<string, string[]> = {
  default: [
    "Iron Collective", "Anvil Squad", "The Forge", "Steel Circle",
    "Ember Crew", "Catalyst Team", "Spark Assembly", "Alloy Guild",
    "Crucible Pack", "Tempering Group", "Molten Core", "Hammer Bloc",
    "Cinder Unit", "Fusion Cohort", "The Smelters", "Radiant Forge",
    "Obsidian Band", "Burnished Crew", "Quenched Squad", "Flux Collective",
    "Foundry Circle", "Ingot Crew", "Bellows Band", "The Crucibles",
    "Tongs Collective",
  ],
  hiking: [
    "Trail Blazers", "Summit Crew", "Ridge Runners", "The Peak Pack",
    "Uphill Squad", "Waypoint Circle", "The Trailheads", "Alpine Collective",
    "Boot Camp Crew", "High Ground Gang", "Boulder Band", "The Ascenders",
    "Wild Path Pack", "Terrain Team", "Off-Trail Crew", "Summit Seekers",
    "The Summiteers", "Footpath Forge", "Elevation Squad", "Mountain Bloc",
    "Contour Collective", "Ridgeline Crew", "Trailhead Band", "Slope Squad",
    "The Wayfarers",
  ],
  gaming: [
    "Pixel Squad", "The Respawn Crew", "Frame Rate Pack", "Controller Collective",
    "The Lag Killers", "Mid Lane Guild", "Boss Rush Band", "Crit Hit Circle",
    "GG Squad", "The Meta Breakers", "Loot Goblins", "Checkpoint Crew",
    "The Grinders", "Level Cap Collective", "Patch Day Pack", "One-Shot Unit",
    "The Sweaty Palms", "Ranked Grind Squad", "Objective Holders", "Full Clear Crew",
    "The Queue Dodgers", "AFK Circle", "No Clip Collective", "Debug Band",
    "The Headshots",
  ],
  cooking: [
    "The Mise en Place", "Sear Squad", "Roux Collective", "Flavor Forge",
    "Sous Vide Pack", "The Tasting Menu", "Umami Circle", "Braise Band",
    "The Plating Crew", "Julienne Guild", "The Reduction Squad", "Beurre Blanc Bloc",
    "Sauté Collective", "The Emulsifiers", "Brine & Shine Crew", "Caramel Pack",
    "The Maillard Band", "Zest Circle", "The Knife Skills Crew", "Stock Pot Squad",
    "The Seasoners", "Flash Fry Pack", "Mortar & Pestle Guild", "The Blanchers",
    "Chill & Serve Collective",
  ],
  music: [
    "The Session Crew", "Resonance Pack", "Chord Collective", "The Overtones",
    "Groove Band", "The Beatmakers", "Lydian Circle", "Arpeggio Squad",
    "The Dynamics", "Downbeat Guild", "The Pocket Crew", "Sustain Pack",
    "Bridge Section Band", "The Modal Squad", "Timbre Collective", "Riff Circle",
    "The Voicings", "The Ostinatos", "Tremolo Crew", "Coda Pack",
    "The Modulations", "Pizzicato Band", "The Fermatas", "Counterpoint Guild",
    "The Resolutions",
  ],
  fitness: [
    "The Gainz Collective", "Rep Squad", "Circuit Crew", "The PR Hunters",
    "Tempo Pack", "HIIT Circle", "Superset Band", "The Recovery Squad",
    "Compound Lift Guild", "Active Rest Crew", "Volume Pack", "The Intervals",
    "Periodisation Bloc", "Rest Day Collective", "The Drop Set Crew", "Split Squad",
    "The Progressive Overload", "Form Check Circle", "Mobility Band", "The Deload Crew",
    "The AMRAPs", "EMOM Squad", "Tempo Pack", "Work Capacity Collective",
    "The Lactate Threshold",
  ],
  travel: [
    "The Layover Crew", "Boarding Pass Pack", "Window Seat Collective", "Jet Lag Band",
    "The Passport Squad", "Carry-On Circle", "The Long Haul Guild", "Stopover Bloc",
    "Terminal Crew", "Red Eye Pack", "The Wanderers", "Aisle Seat Collective",
    "The Stopovers", "Baggage Claim Band", "Overhead Bin Squad", "Exit Row Circle",
    "The Transit Crew", "Upgrade Pack", "The Frequent Flyers", "Lounge Access Band",
    "The Nomads", "Backpack Collective", "The Regulars", "Check-In Squad",
    "The Arrivals",
  ],
  reading: [
    "The Annotators", "Dog-Ear Crew", "Chapter Collective", "The Footnotes",
    "Spine Squad", "The Marginalia Band", "Dust Jacket Circle", "The First Editions",
    "Prose Pack", "The Epilogues", "Index Guild", "The Subplots",
    "Unreliable Narrators Crew", "The Ellipses", "Arc Band", "The Folio Squad",
    "Long-Form Collective", "The Colophons", "Serial Pack", "The Blurbers",
    "Quill Circle", "The Typesetters", "Galley Crew", "The Serifs",
    "The Oxford Comma Crew",
  ],
};

/** Pick `n` random items from `arr` without replacement. */
function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

/** Return the pool for a given activity string (case-insensitive, partial match). */
function getPoolForActivity(activity: string | null | undefined): string[] {
  if (!activity) return ACTIVITY_NAME_POOLS.default;
  const lower = activity.toLowerCase();
  const key = Object.keys(ACTIVITY_NAME_POOLS).find((k) => lower.includes(k));
  return ACTIVITY_NAME_POOLS[key ?? "default"];
}

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
  groupName?: string;
  onGroupNameChange?: (v: string) => void;
  groupDescription?: string;
  onGroupDescriptionChange?: (v: string) => void;
  existingGroupNames?: string[];
  /** Activity from step 1 — used to seed the name suggestions. */
  selectedActivity?: string | null;
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
  groupName = "",
  onGroupNameChange,
  groupDescription = "",
  onGroupDescriptionChange,
  existingGroupNames = [],
  selectedActivity,
}: Step3GroupProps) {
  const [algorithmsExpanded, setAlgorithmsExpanded] = useState(true);
  const [capacityMode, setCapacityMode] = useState<"range" | "fixed">("range");
  const [fixedCapacity, setFixedCapacity] = useState(6);

  // Name suggestions: 5 random picks from the activity-keyed pool, stable per activity
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    pickRandom(getPoolForActivity(selectedActivity), 5),
  );

  // Re-seed suggestions when activity changes, and auto-set the default name
  useEffect(() => {
    const pool = getPoolForActivity(selectedActivity);
    const taken = existingGroupNames.map((n) => n.toLowerCase());
    const available = pool.filter((n) => !taken.includes(n.toLowerCase()));
    const picked = pickRandom(available, 5);
    setSuggestions(picked);
    // Only set a default name if the user hasn't touched the field yet
    if (!groupName && picked.length > 0) {
      onGroupNameChange?.(picked[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActivity]);

  const [nameFocused, setNameFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const descId = useId();

  const filteredSuggestions = suggestions.filter((n) => {
    const lower = n.toLowerCase();
    const query = groupName.toLowerCase();
    const taken = existingGroupNames.map((e) => e.toLowerCase());
    return !taken.includes(lower) && (query.length === 0 || lower.includes(query));
  });

  const handleSuggestionPick = (name: string) => {
    onGroupNameChange?.(name);
    setShowSuggestions(false);
    nameInputRef.current?.blur();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-4">

      {/* ── 1. Group Identity (top, prominent) ───────────────────────────── */}
      <section className="space-y-4">
        <div className="px-0.5">
          <p className="text-xs md:text-sm font-semibold text-foreground">Group identity</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Optional — you can always update this later.
          </p>
        </div>

        {/* Group name picker */}
        <div className="space-y-1.5 relative">
          <label htmlFor={nameId} className="block text-xs font-semibold text-muted-foreground/70">
            Name
          </label>
          <div
            className={cn(
              "relative flex items-center rounded-xl border bg-background/60 transition-all duration-150",
              nameFocused
                ? "border-primary/60 ring-2 ring-primary/12 bg-background"
                : "border-border/60",
            )}
          >
            <Sparkles
              size={13}
              className={cn(
                "absolute left-3 pointer-events-none transition-colors shrink-0",
                nameFocused ? "text-primary/60" : "text-muted-foreground/30",
              )}
            />
            <input
              id={nameId}
              ref={nameInputRef}
              type="text"
              value={groupName}
              maxLength={40}
              autoComplete="off"
              placeholder="e.g. Iron Collective"
              onFocus={() => { setNameFocused(true); setShowSuggestions(true); }}
              onBlur={() => { setNameFocused(false); setTimeout(() => setShowSuggestions(false), 150); }}
              onChange={(e) => { onGroupNameChange?.(e.target.value); setShowSuggestions(true); }}
              className="w-full h-11 pl-8 pr-8 bg-transparent text-sm font-medium placeholder:text-muted-foreground/35 focus:outline-none rounded-xl"
            />
            {groupName && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onGroupNameChange?.(""); nameInputRef.current?.focus(); }}
                className="absolute right-2.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                aria-label="Clear name"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Suggestion chips (always visible below input, not a floating dropdown) */}
          {filteredSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {filteredSuggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionPick(name)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all duration-150",
                    groupName === name
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/50 bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
                  )}
                >
                  <Sparkles size={9} className="shrink-0 opacity-60" />
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Group description */}
        <div className="space-y-1.5">
          <label htmlFor={descId} className="block text-xs font-semibold text-muted-foreground/70">
            Description <span className="font-normal text-muted-foreground/40">(optional)</span>
          </label>
          <textarea
            id={descId}
            value={groupDescription}
            maxLength={200}
            rows={2}
            placeholder="What's this group about? A shared goal, project, or interest..."
            onChange={(e) => onGroupDescriptionChange?.(e.target.value)}
            className={cn(
              "w-full rounded-xl border border-border/60 bg-background/60 px-3.5 py-3 text-sm font-medium",
              "placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/60",
              "focus:ring-2 focus:ring-primary/12 focus:bg-background transition-all duration-150 resize-none leading-relaxed",
            )}
          />
          {groupDescription.length > 0 && (
            <p className="text-[11px] text-muted-foreground/40 text-right">
              {groupDescription.length}/200
            </p>
          )}
        </div>
      </section>

      {/* ── 2. Privacy Settings ─────────────────────────────────────────── */}
      <section className="space-y-3 pt-2 border-t border-muted/20">
        <div className="px-0.5">
          <p className="text-xs md:text-sm font-semibold text-muted-foreground">Who can find this group?</p>
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
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className={cn("text-sm font-semibold leading-tight", active ? "text-primary" : "text-foreground")}>
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">{description}</p>
                </div>
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center mt-1 transition-all duration-200",
                    active ? "border-primary bg-primary" : "border-border/50",
                  )}
                >
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. Method Selector (bottom) ──────────────────────────────────── */}
      <section className="space-y-2.5 pt-2 border-t border-muted/20">
        <p className="text-xs md:text-sm font-semibold text-muted-foreground px-0.5">
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

      {/* ── 4. Group Details (capacity + algorithm tuning) ───────────────── */}
      <section className="space-y-4 pt-2 border-t border-muted/20">
        <p className="text-xs md:text-sm font-semibold text-muted-foreground px-0.5">
          Group details
        </p>

        {forgeMode === "manual" ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="rounded-xl border border-muted/20 bg-muted/5 p-4 flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle size={16} className="text-orange-500" />
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-black tracking-tight text-foreground">Manual Group Creation</h5>
                <p className="text-xs text-muted-foreground leading-relaxed opacity-80">
                  You are creating a standalone group. TeamForge won&apos;t search
                  for additional members. Invite people manually after forging.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
            {/* ── Capacity ── */}
            <div className="px-0.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground/50 tracking-wide">Capacity</span>
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/30 border border-border/40">
                  {(["range", "fixed"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCapacityMode(mode)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-200",
                        capacityMode === mode
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground/50 hover:text-muted-foreground",
                      )}
                    >
                      {mode === "range" ? "Range" : "Fixed"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Uniform container — same min-height so no layout shift on tab switch */}
              <div className="min-h-[72px] flex flex-col justify-center">
                {capacityMode === "range" ? (
                  <div className="space-y-1 animate-in fade-in duration-200">
                    <div className="flex justify-end">
                      <div className="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                        <span className="text-xs font-black text-primary tabular-nums tracking-wider">
                          {autoMinSize} – {autoMaxSize}
                        </span>
                      </div>
                    </div>
                    <div className="py-1">
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
                    </div>
                    <div className="flex justify-between px-0.5">
                      <span className="text-[11px] text-muted-foreground/40">3 min</span>
                      <span className="text-[11px] text-muted-foreground/40">12 max</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 animate-in fade-in duration-200">
                    <div className="flex justify-end">
                      <div className="px-2.5 py-0.5 rounded-lg bg-accent/10 border border-accent/20">
                        <span className="text-xs font-black text-accent tabular-nums tracking-wider">
                          {fixedCapacity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-1">
                      <RadixSlider.Root
                        className="relative flex items-center select-none touch-none flex-1 h-10"
                        value={[fixedCapacity]}
                        onValueChange={([v]) => setFixedCapacity(v)}
                        min={3}
                        max={12}
                        step={1}
                      >
                        <RadixSlider.Track className="bg-muted relative grow rounded-full h-1.5">
                          <RadixSlider.Range className="absolute bg-accent rounded-full h-full" />
                        </RadixSlider.Track>
                        <RadixSlider.Thumb
                          className="block w-6 h-6 bg-background border-2 border-accent rounded-full shadow-md shadow-accent/20 hover:scale-110 active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing"
                          aria-label="Fixed capacity"
                        />
                      </RadixSlider.Root>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setFixedCapacity((v) => Math.max(3, v - 1))}
                          aria-label="Decrease"
                          className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm transition-colors"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={3}
                          max={12}
                          value={fixedCapacity}
                          onChange={(e) => {
                            const v = Math.min(12, Math.max(3, Number(e.target.value)));
                            setFixedCapacity(v);
                          }}
                          className="w-10 h-7 text-center rounded-lg border border-border/50 bg-background text-sm font-black text-accent tabular-nums focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20"
                        />
                        <button
                          type="button"
                          onClick={() => setFixedCapacity((v) => Math.min(12, v + 1))}
                          aria-label="Increase"
                          className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between px-0.5">
                      <span className="text-[11px] text-muted-foreground/40">3 min</span>
                      <span className="text-[11px] text-muted-foreground/40">12 max</span>
                    </div>
                  </div>
                )}
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

function ModeButton({ active, onClick, icon, title, description, activeColor }: ModeButtonProps) {
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
        <span className={cn("text-xs font-black tracking-tight", active ? "text-inherit" : "text-foreground")}>
          {title}
        </span>
      </div>
      <p className={cn("text-[11px] leading-snug font-semibold opacity-90 pr-2", active ? "text-inherit/80" : "text-muted-foreground")}>
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

function WeightSlider({ label, value, onChange, min, max, step, warning, subLabel }: WeightSliderProps) {
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
          {subLabel && <p className="text-xs text-muted-foreground/60 leading-snug">{subLabel}</p>}
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
        onChange={(e) => { setDragging(true); onChange(Number(e.target.value)); }}
        onMouseUp={() => setDragging(false)}
        onTouchEnd={() => setDragging(false)}
        className={cn("range-input w-full h-2 rounded-full cursor-pointer", isHighDiversity ? "accent-amber-500" : "accent-primary")}
      />

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
                active ? (isHighDiversity ? "bg-amber-500/50" : "bg-primary/50") : "bg-muted/30",
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
