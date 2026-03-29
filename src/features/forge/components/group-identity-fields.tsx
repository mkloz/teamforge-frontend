"use client";

import { cn } from "@/shared/lib/utils";
import { Sparkles, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

// ── Activity-keyed name pools ─────────────────────────────────────────────────
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
    "Saute Collective", "The Emulsifiers", "Brine & Shine Crew", "Caramel Pack",
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
    "The AMRAPs", "EMOM Squad", "Work Capacity Collective", "The Lactate Threshold",
    "Loaded Carry Crew",
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
export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

/** Return the pool for a given activity string (case-insensitive, partial match). */
export function getPoolForActivity(activity: string | null | undefined): string[] {
  if (!activity) return ACTIVITY_NAME_POOLS.default;
  const lower = activity.toLowerCase();
  const key = Object.keys(ACTIVITY_NAME_POOLS).find((k) => lower.includes(k));
  return ACTIVITY_NAME_POOLS[key ?? "default"];
}

export interface GroupIdentityFieldsProps {
  groupName: string;
  onGroupNameChange: (v: string) => void;
  groupDescription: string;
  onGroupDescriptionChange: (v: string) => void;
  selectedActivity?: string | null;
  existingGroupNames?: string[];
  /** Subtitle shown below the section heading */
  subtitle?: string;
}

export function GroupIdentityFields({
  groupName,
  onGroupNameChange,
  groupDescription,
  onGroupDescriptionChange,
  selectedActivity,
  existingGroupNames = [],
  subtitle = "Optional — you can always update this later.",
}: GroupIdentityFieldsProps) {
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    pickRandom(getPoolForActivity(selectedActivity), 5),
  );
  const [nameFocused, setNameFocused] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const descId = useId();

  // Re-seed suggestions when activity changes; auto-set default name once
  useEffect(() => {
    const pool = getPoolForActivity(selectedActivity);
    const taken = existingGroupNames.map((n) => n.toLowerCase());
    const available = pool.filter((n) => !taken.includes(n.toLowerCase()));
    const picked = pickRandom(available, 5);
    setSuggestions(picked);
    if (!groupName && picked.length > 0) {
      onGroupNameChange(picked[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActivity]);

  const visibleSuggestions = suggestions.filter((n) => {
    const taken = existingGroupNames.map((e) => e.toLowerCase());
    return !taken.includes(n.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="px-0.5">
        <p className="text-xs md:text-sm font-semibold text-foreground">Group identity</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Name picker */}
      <div className="space-y-1.5">
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
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            onChange={(e) => onGroupNameChange(e.target.value)}
            className="w-full h-11 pl-8 pr-8 bg-transparent text-sm font-medium placeholder:text-muted-foreground/35 focus:outline-none rounded-xl"
          />
          {groupName && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onGroupNameChange(""); nameInputRef.current?.focus(); }}
              className="absolute right-2.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              aria-label="Clear name"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Suggestion chips */}
        {visibleSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {visibleSuggestions.map((name) => (
              <button
                key={name}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onGroupNameChange(name); nameInputRef.current?.blur(); }}
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

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor={descId} className="block text-xs font-semibold text-muted-foreground/70">
          Description{" "}
          <span className="font-normal text-muted-foreground/40">(optional)</span>
        </label>
        <textarea
          id={descId}
          value={groupDescription}
          maxLength={200}
          rows={2}
          placeholder="What's this group about? A shared goal, project, or interest..."
          onChange={(e) => onGroupDescriptionChange(e.target.value)}
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
    </div>
  );
}
