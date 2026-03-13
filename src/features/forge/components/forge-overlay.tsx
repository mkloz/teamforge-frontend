"use client";

import { useState } from "react";
import { X, Zap, ChevronLeft, ChevronRight, Flame, Users, Sliders } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ForgeOverlayProps {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

const ACTIVITIES = [
  { icon: "🏃", label: "Sports" },
  { icon: "🎮", label: "Gaming" },
  { icon: "☕", label: "Social" },
  { icon: "🎨", label: "Arts" },
  { icon: "🎵", label: "Music" },
  { icon: "🌲", label: "Outdoors" },
  { icon: "📚", label: "Learning" },
  { icon: "🍕", label: "Food" },
];

const RECENT = [
  { icon: "🎾", label: "Tennis at Riverside", count: 3 },
  { icon: "☕", label: "Coffee & Code", count: 2 },
];

const GROUP_SIZES = [2, 3, 4, 5, 6];

const STEP_META: Record<Step, { label: string; icon: typeof Flame; description: string }> = {
  1: { label: "Activity", icon: Flame, description: "What are you forging?" },
  2: { label: "Details", icon: Users, description: "When and where?" },
  3: { label: "Matching", icon: Sliders, description: "Who should join?" },
};

export function ForgeOverlay({ open, onClose }: ForgeOverlayProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupSize, setGroupSize] = useState(4);
  const [compatibility, setCompatibility] = useState(50);
  const [visibility, setVisibility] = useState<"public" | "friends" | "invite">("friends");

  const canAdvance = step === 1 ? !!selectedActivity : step === 2 ? groupName.length >= 3 : true;

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep(1);
      setSelectedActivity(null);
      setGroupName("");
    }, 300);
  };

  const handleForge = () => {
    handleClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm animate-fade-up"
        style={{ animationDuration: "200ms" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Forge a new group"
        className={cn(
          "fixed z-50 bg-card shadow-2xl",
          // Mobile: sheet from bottom, full-width
          "bottom-0 left-0 right-0 rounded-t-3xl max-h-[92dvh] overflow-hidden",
          // Desktop: centered modal
          "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:w-full md:max-w-lg md:rounded-3xl md:max-h-[88dvh]",
          "flex flex-col",
          "animate-fade-up",
        )}
        style={{ animationDuration: "280ms" }}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden" aria-hidden="true">
          <div className="w-9 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 md:pt-5">
          <div className="flex items-center gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                aria-label="Go back"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/15"
                aria-hidden="true"
              >
                <Zap size={15} className="text-accent" />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-foreground leading-none">
                {STEP_META[step].description}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Step {step} of 3</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step progress track */}
        <div className="px-5 mb-4">
          <div className="flex gap-1.5">
            {([1, 2, 3] as Step[]).map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  s <= step ? "bg-accent" : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-hide">
          {step === 1 && (
            <Step1
              selectedActivity={selectedActivity}
              onSelect={setSelectedActivity}
            />
          )}
          {step === 2 && (
            <Step2
              groupName={groupName}
              onGroupNameChange={setGroupName}
              groupSize={groupSize}
              onGroupSizeChange={setGroupSize}
            />
          )}
          {step === 3 && (
            <Step3
              compatibility={compatibility}
              onCompatibilityChange={setCompatibility}
              visibility={visibility}
              onVisibilityChange={setVisibility}
            />
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pt-3 pb-6 md:pb-5 border-t border-border bg-card">
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm",
                "transition-all duration-150",
                canAdvance
                  ? "bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-[0_4px_16px_rgba(13,148,136,0.3)]"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
              )}
            >
              Continue
              <ChevronRight size={16} />
            </button>
          ) : (
            <ForgeButton onClick={handleForge} />
          )}
        </div>
      </div>
    </>
  );
}

// ─── Step 1: Activity Selection ───────────────────────────────────────────────

function Step1({
  selectedActivity,
  onSelect,
}: {
  selectedActivity: string | null;
  onSelect: (a: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Categories grid */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3">Categories</p>
        <div className="grid grid-cols-4 gap-2">
          {ACTIVITIES.map(({ icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-center",
                "transition-all duration-150 active:scale-95",
                selectedActivity === label
                  ? "border-accent bg-accent/10 shadow-[0_0_0_2px_rgba(245,158,11,0.3)]"
                  : "border-border bg-background hover:border-primary/30 hover:bg-primary/5",
              )}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[10px] font-medium text-foreground leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activities */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Recent</p>
        <div className="space-y-2">
          {RECENT.map(({ icon, label, count }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left",
                "transition-all duration-150",
                selectedActivity === label
                  ? "border-accent bg-accent/10"
                  : "border-border bg-background hover:border-primary/30 hover:bg-primary/5",
              )}
            >
              <span className="text-lg">{icon}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">Used {count}×</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Activity Details ─────────────────────────────────────────────────

function Step2({
  groupName,
  onGroupNameChange,
  groupSize,
  onGroupSizeChange,
}: {
  groupName: string;
  onGroupNameChange: (v: string) => void;
  groupSize: number;
  onGroupSizeChange: (v: number) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Group name */}
      <div className="space-y-1.5">
        <label htmlFor="group-name" className="text-xs font-semibold text-muted-foreground">
          Activity name
        </label>
        <input
          id="group-name"
          type="text"
          value={groupName}
          onChange={(e) => onGroupNameChange(e.target.value)}
          placeholder="e.g. Board Game Night"
          className={cn(
            "w-full px-4 py-3 rounded-2xl border bg-background text-sm text-foreground",
            "placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            "transition-all duration-150",
          )}
        />
        {groupName.length > 0 && groupName.length < 3 && (
          <p className="text-xs text-destructive pl-1">Name must be at least 3 characters</p>
        )}
      </div>

      {/* Date/Time row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Date</label>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-3 rounded-2xl border border-border bg-background text-sm text-foreground hover:border-primary/30 transition-colors"
          >
            <span className="text-base">📅</span>
            <span className="text-muted-foreground">Pick date</span>
          </button>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Time</label>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-3 rounded-2xl border border-border bg-background text-sm text-foreground hover:border-primary/30 transition-colors"
          >
            <span className="text-base">🕖</span>
            <span className="text-muted-foreground">Pick time</span>
          </button>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Location</label>
        <input
          type="text"
          placeholder="Search location or enter address..."
          className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150"
        />
        <div className="flex gap-2 pt-0.5">
          {["My place", "TBD", "Virtual"].map((q) => (
            <button
              key={q}
              type="button"
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Group size */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">Group size</label>
        <div className="flex gap-2">
          {GROUP_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onGroupSizeChange(size)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150",
                groupSize === size
                  ? "bg-accent text-accent-foreground border-transparent shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
                  : "bg-background text-foreground border-border hover:border-accent/50",
              )}
            >
              {size}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onGroupSizeChange(7)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150",
              groupSize === 7
                ? "bg-accent text-accent-foreground border-transparent shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
                : "bg-background text-foreground border-border hover:border-accent/50",
            )}
          >
            6+
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Matching Preferences ────────────────────────────────────────────

function Step3({
  compatibility,
  onCompatibilityChange,
  visibility,
  onVisibilityChange,
}: {
  compatibility: number;
  onCompatibilityChange: (v: number) => void;
  visibility: "public" | "friends" | "invite";
  onVisibilityChange: (v: "public" | "friends" | "invite") => void;
}) {
  const compatibilityLabel =
    compatibility < 30 ? "Open to anyone" :
    compatibility < 60 ? "Prefer compatible types" :
    "Strong match required";

  return (
    <div className="space-y-5">
      {/* Personality compatibility */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Personality compatibility</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">How important is personality match?</p>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={compatibility}
          onChange={(e) => onCompatibilityChange(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer"
          aria-label="Compatibility strictness"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground -mt-1">
          <span>Casual</span>
          <span className="text-accent font-medium text-xs">{compatibilityLabel}</span>
          <span>Strict</span>
        </div>
      </div>

      {/* Trust score minimum */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Trust score minimum</p>
        <div className="flex gap-2">
          {[
            { label: "Any", value: 0 },
            { label: "50%+", value: 50 },
            { label: "70%+", value: 70 },
            { label: "90%+", value: 90 },
          ].map(({ label }) => (
            <button
              key={label}
              type="button"
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150",
                label === "70%+"
                  ? "bg-primary text-primary-foreground border-transparent shadow-[0_2px_8px_rgba(13,148,136,0.25)]"
                  : "bg-background text-foreground border-border hover:border-primary/40",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Visibility</p>
        <div className="space-y-2">
          {(
            [
              { value: "public", label: "Public", desc: "Anyone matching criteria can request" },
              { value: "friends", label: "Friends first", desc: "Prioritize mutual connections" },
              { value: "invite", label: "Invite only", desc: "Only people you invite directly" },
            ] as const
          ).map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onVisibilityChange(value)}
              className={cn(
                "w-full flex items-start gap-3 px-4 py-3 rounded-2xl border text-left transition-all duration-150",
                visibility === value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/30",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                  visibility === value ? "border-primary bg-primary" : "border-muted-foreground",
                )}
              >
                {visibility === value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── The Forge Button ────────────────────────────────────────────────────────

function ForgeButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="space-y-2">
      {/* Contextual hint */}
      <p className="text-center text-xs text-muted-foreground">
        Compatible members will be notified once your group is forged.
      </p>

      <button
        type="button"
        onClick={onClick}
        aria-label="Forge this group"
        className={cn(
          // Shape & size
          "relative w-full flex items-center justify-center gap-2.5 rounded-2xl py-4",
          // Brand amber, full impact
          "bg-accent text-accent-foreground font-bold text-base",
          // Layered shadow for depth
          "shadow-[0_4px_24px_rgba(245,158,11,0.5),0_1px_3px_rgba(0,0,0,0.12)]",
          // States
          "hover:brightness-110 hover:shadow-[0_6px_32px_rgba(245,158,11,0.65),0_1px_3px_rgba(0,0,0,0.12)]",
          "active:scale-[0.97] active:shadow-[0_2px_12px_rgba(245,158,11,0.4)]",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          // Single attention pulse on mount
          "motion-safe:animate-[pulse-glow-amber_2.5s_ease-in-out_2]",
        )}
      >
        {/* Subtle inner highlight */}
        <span
          className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/15 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <Zap size={20} aria-hidden="true" className="fill-current" />
        <span>Forge This Group</span>
      </button>
    </div>
  );
}
