"use client";

import { useState } from "react";
import {
  X,
  Zap,
  ChevronLeft,
  ChevronRight,
  Flame,
  CalendarDays,
  Users,
  ImagePlus,
  UserPlus,
  Check,
  Copy,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ForgeOverlayProps {
  open: boolean;
  onClose: () => void;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PreForgeStep = 1 | 2 | 3;
type PostForgeStep = 4 | 5;
type Step = PreForgeStep | PostForgeStep;

type Visibility = "public" | "friends" | "invite";

// The algorithm requires exactly one of these fixed sizes.
// They are optimised for the matching algorithm's group dynamics model.
const ALGORITHM_GROUP_SIZES = [
  { value: 4, label: "4 people", note: "Tight-knit" },
  { value: 6, label: "6 people", note: "Balanced" },
  { value: 8, label: "8 people", note: "Expansive" },
] as const;

type AlgorithmGroupSize = (typeof ALGORITHM_GROUP_SIZES)[number]["value"];

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

// ─── Step metadata ────────────────────────────────────────────────────────────

interface StepMeta {
  label: string;
  icon: React.ElementType;
  entity: "Activity" | "Plan" | "Group" | "Identity" | "Invite";
  description: string;
  entityDescription: string;
}

const STEP_META: Record<Step, StepMeta> = {
  1: {
    label: "Activity",
    icon: Flame,
    entity: "Activity",
    description: "What are you doing?",
    entityDescription: "Choose the type of activity to build your group around.",
  },
  2: {
    label: "Plan",
    icon: CalendarDays,
    entity: "Plan",
    description: "Define the Plan",
    entityDescription: "A Plan is the specific event — when, where, and what it's called.",
  },
  3: {
    label: "Group",
    icon: Users,
    entity: "Group",
    description: "Configure the Group",
    entityDescription: "A Group is the set of people the algorithm will assemble for your Plan.",
  },
  4: {
    label: "Identity",
    icon: ImagePlus,
    entity: "Identity",
    description: "Give your Group an identity",
    entityDescription: "Add a cover image or logo so members recognise your Group at a glance.",
  },
  5: {
    label: "Invite",
    icon: UserPlus,
    entity: "Invite",
    description: "Invite members",
    entityDescription: "Your Group is forged and confirmed. Invitations will be sent now.",
  },
};

// Pre-forge steps (shown in progress track)
const PRE_FORGE_STEPS: PreForgeStep[] = [1, 2, 3];

// ─── Overlay root ─────────────────────────────────────────────────────────────

export function ForgeOverlay({ open, onClose }: ForgeOverlayProps) {
  const [step, setStep] = useState<Step>(1);
  const [forged, setForged] = useState(false);

  // Step 1
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // Step 2 — Plan
  const [planName, setPlanName] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planTime, setPlanTime] = useState("");
  const [planLocation, setPlanLocation] = useState("");

  // Step 3 — Group
  const [groupSize, setGroupSize] = useState<AlgorithmGroupSize>(6);
  const [visibility, setVisibility] = useState<Visibility>("friends");

  // Step 4 — Identity (post-forge)
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Step 5 — Invite (post-forge)
  const [inviteCopied, setInviteCopied] = useState(false);
  const [invitesSent, setInvitesSent] = useState(false);

  const canAdvance =
    step === 1
      ? !!selectedActivity
      : step === 2
        ? planName.trim().length >= 3
        : true;

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setForged(false);
      setSelectedActivity(null);
      setPlanName("");
      setPlanDate("");
      setPlanTime("");
      setPlanLocation("");
      setGroupSize(6);
      setVisibility("friends");
      setCoverImage(null);
      setInviteCopied(false);
      setInvitesSent(false);
    }, 300);
  };

  const handleForge = () => {
    setForged(true);
    setStep(4);
  };

  const handleCopyLink = () => {
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleSendInvites = () => {
    setInvitesSent(true);
  };

  if (!open) return null;

  const meta = STEP_META[step];
  const isPreForge = step <= 3;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
        style={{ animation: "fadeIn 200ms ease forwards" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={meta.description}
        className={cn(
          "fixed z-50 bg-card shadow-2xl flex flex-col",
          "bottom-0 left-0 right-0 rounded-t-3xl max-h-[94dvh] overflow-hidden",
          "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:w-full md:max-w-lg md:rounded-3xl md:max-h-[90dvh]",
        )}
        style={{ animation: "forge-slide-up 280ms cubic-bezier(0.34,1.1,0.64,1) forwards" }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden" aria-hidden="true">
          <div className="w-9 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 md:pt-5">
          <div className="flex items-center gap-3">
            {/* Back button — only on pre-forge steps > 1, or post-forge steps */}
            {(step > 1 && isPreForge) ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                aria-label="Go back"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors shrink-0"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                  forged ? "bg-primary/10" : "bg-accent/10",
                )}
                aria-hidden="true"
              >
                {forged
                  ? <Check size={15} className="text-primary" />
                  : <Zap size={15} className="text-accent fill-current" />
                }
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground leading-none">
                  {meta.description}
                </h2>
                {/* Entity pill — makes Group vs Plan distinction explicit */}
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                  meta.entity === "Plan"
                    ? "bg-primary/10 text-primary"
                    : meta.entity === "Group"
                      ? "bg-accent/15 text-accent"
                      : meta.entity === "Identity" || meta.entity === "Invite"
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted text-muted-foreground",
                )}>
                  {meta.entity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPreForge
                  ? `Step ${step} of 3`
                  : step === 4
                    ? "Post-forge · Step 1 of 2"
                    : "Post-forge · Step 2 of 2"}
              </p>
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

        {/* Progress tracks */}
        {isPreForge ? (
          /* Pre-forge: 3-step amber track */
          <div className="px-5 mb-4">
            <div className="flex gap-1.5">
              {PRE_FORGE_STEPS.map((s) => (
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
        ) : (
          /* Post-forge: 2-step teal track */
          <div className="px-5 mb-4">
            <div className="flex gap-1.5">
              {([4, 5] as PostForgeStep[]).map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-300",
                    s <= step ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Group forged — complete setup before invitations go out
            </p>
          </div>
        )}

        {/* Entity description callout */}
        {(step === 2 || step === 3) && (
          <div className={cn(
            "mx-5 mb-4 px-3 py-2 rounded-xl border text-xs text-muted-foreground",
            step === 2 ? "border-primary/20 bg-primary/5" : "border-accent/20 bg-accent/5",
          )}>
            {meta.entityDescription}
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-hide">
          {step === 1 && (
            <Step1Activity
              selectedActivity={selectedActivity}
              onSelect={setSelectedActivity}
            />
          )}
          {step === 2 && (
            <Step2Plan
              planName={planName}
              onPlanNameChange={setPlanName}
              planDate={planDate}
              onPlanDateChange={setPlanDate}
              planTime={planTime}
              onPlanTimeChange={setPlanTime}
              planLocation={planLocation}
              onPlanLocationChange={setPlanLocation}
            />
          )}
          {step === 3 && (
            <Step3Group
              groupSize={groupSize}
              onGroupSizeChange={setGroupSize}
              visibility={visibility}
              onVisibilityChange={setVisibility}
            />
          )}
          {step === 4 && (
            <Step4Identity
              coverImage={coverImage}
              onCoverImageChange={setCoverImage}
              planName={planName || "Your Group"}
              activity={selectedActivity || ""}
            />
          )}
          {step === 5 && (
            <Step5Invite
              planName={planName || "Your Group"}
              groupSize={groupSize}
              inviteCopied={inviteCopied}
              onCopyLink={handleCopyLink}
              invitesSent={invitesSent}
            />
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pt-3 pb-6 md:pb-5 border-t border-border bg-card shrink-0">
          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canAdvance}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm transition-all duration-150",
                canAdvance
                  ? "bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-[0_4px_16px_rgba(13,148,136,0.3)]"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
              )}
            >
              Next: Plan Details
              <ChevronRight size={16} />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canAdvance}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm transition-all duration-150",
                canAdvance
                  ? "bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-[0_4px_16px_rgba(13,148,136,0.3)]"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
              )}
            >
              Next: Group Setup
              <ChevronRight size={16} />
            </button>
          )}

          {step === 3 && (
            <ForgeButton onClick={handleForge} />
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={() => setStep(5)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-[0_4px_16px_rgba(13,148,136,0.3)] transition-all duration-150"
            >
              {coverImage ? "Continue to Invitations" : "Skip for now"}
              <ChevronRight size={16} />
            </button>
          )}

          {step === 5 && !invitesSent && (
            <button
              type="button"
              onClick={handleSendInvites}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-[0_4px_16px_rgba(13,148,136,0.3)] transition-all duration-150"
            >
              <UserPlus size={16} />
              Send Invitations
            </button>
          )}

          {step === 5 && invitesSent && (
            <button
              type="button"
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm bg-muted text-foreground hover:bg-muted/80 active:scale-[0.98] transition-all duration-150"
            >
              <Check size={16} className="text-primary" />
              Done
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Step 1: Activity ─────────────────────────────────────────────────────────

function Step1Activity({
  selectedActivity,
  onSelect,
}: {
  selectedActivity: string | null;
  onSelect: (a: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3">Categories</p>
        <div className="grid grid-cols-4 gap-2">
          {ACTIVITIES.map(({ icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-center transition-all duration-150 active:scale-95",
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

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Recent</p>
        <div className="space-y-2">
          {RECENT.map(({ icon, label, count }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all duration-150",
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

// ─── Step 2: Plan ─────────────────────────────────────────────────────────────
// A Plan is the concrete event — its name, time, and place.

function Step2Plan({
  planName,
  onPlanNameChange,
  planDate,
  onPlanDateChange,
  planTime,
  onPlanTimeChange,
  planLocation,
  onPlanLocationChange,
}: {
  planName: string;
  onPlanNameChange: (v: string) => void;
  planDate: string;
  onPlanDateChange: (v: string) => void;
  planTime: string;
  onPlanTimeChange: (v: string) => void;
  planLocation: string;
  onPlanLocationChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Plan name */}
      <div className="space-y-1.5">
        <label htmlFor="plan-name" className="text-xs font-semibold text-muted-foreground">
          Plan name <span className="text-destructive">*</span>
        </label>
        <input
          id="plan-name"
          type="text"
          value={planName}
          onChange={(e) => onPlanNameChange(e.target.value)}
          placeholder="e.g. Board Game Night"
          className={cn(
            "w-full px-4 py-3 rounded-2xl border bg-background text-sm text-foreground",
            "placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            "transition-all duration-150",
          )}
        />
        {planName.length > 0 && planName.trim().length < 3 && (
          <p className="text-xs text-destructive pl-1">Name must be at least 3 characters</p>
        )}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Date</label>
          <input
            type="date"
            value={planDate}
            onChange={(e) => onPlanDateChange(e.target.value)}
            className="w-full px-3 py-3 rounded-2xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Time</label>
          <input
            type="time"
            value={planTime}
            onChange={(e) => onPlanTimeChange(e.target.value)}
            className="w-full px-3 py-3 rounded-2xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Location</label>
        <input
          type="text"
          value={planLocation}
          onChange={(e) => onPlanLocationChange(e.target.value)}
          placeholder="Search or enter an address..."
          className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150"
        />
        <div className="flex gap-2 pt-0.5">
          {["My place", "TBD", "Virtual"].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onPlanLocationChange(q)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors",
                planLocation === q
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Plan ↔ Group distinction note */}
      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-foreground">Plan vs Group</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A <span className="font-medium text-primary">Plan</span> describes the event itself — what, when, and where. In the next step you will configure the <span className="font-medium text-accent">Group</span> — the people who will be assembled to attend it.
        </p>
      </div>
    </div>
  );
}

// ─── Step 3: Group ────────────────────────────────────────────────────────────
// A Group is the set of people. Size is fixed to algorithm-approved values.
// Trust score selector removed. Compatibility slider removed.

function Step3Group({
  groupSize,
  onGroupSizeChange,
  visibility,
  onVisibilityChange,
}: {
  groupSize: AlgorithmGroupSize;
  onGroupSizeChange: (v: AlgorithmGroupSize) => void;
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Fixed group size */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Group size</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            The matching algorithm requires a fixed participant count to function correctly. Choose one of the supported sizes.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ALGORITHM_GROUP_SIZES.map(({ value, label, note }) => (
            <button
              key={value}
              type="button"
              onClick={() => onGroupSizeChange(value)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-4 rounded-2xl border transition-all duration-150",
                groupSize === value
                  ? "border-transparent bg-accent text-accent-foreground shadow-[0_4px_16px_rgba(245,158,11,0.35)]"
                  : "border-border bg-background text-foreground hover:border-accent/50",
              )}
            >
              <span className={cn("text-2xl font-bold leading-none tabular-nums", groupSize === value ? "text-accent-foreground" : "text-foreground")}>
                {value}
              </span>
              <span className={cn("text-[10px] font-medium mt-1", groupSize === value ? "text-accent-foreground/80" : "text-muted-foreground")}>
                {label}
              </span>
              <span className={cn("text-[10px]", groupSize === value ? "text-accent-foreground/70" : "text-muted-foreground/60")}>
                {note}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Including you — the algorithm will find {groupSize - 1} compatible members.
        </p>
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Visibility</p>
        <div className="space-y-2">
          {(
            [
              {
                value: "public" as Visibility,
                label: "Open",
                desc: "Anyone matching criteria can request to join",
              },
              {
                value: "friends" as Visibility,
                label: "Friends first",
                desc: "Prioritise mutual connections before strangers",
              },
              {
                value: "invite" as Visibility,
                label: "Invite only",
                desc: "Only people you explicitly invite can join",
              },
            ]
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

      {/* What happens next callout */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-accent">After forging</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You will add a cover image and send invitations <span className="font-medium text-foreground">only after</span> your Group is fully formed and confirmed — ensuring members receive a complete, polished invitation.
        </p>
      </div>
    </div>
  );
}

// ─── Step 4: Identity (post-forge) ───────────────────────────────────────────
// Cover image / logo — selected after the group has been forged.

function Step4Identity({
  coverImage,
  onCoverImageChange,
  planName,
  activity,
}: {
  coverImage: string | null;
  onCoverImageChange: (url: string | null) => void;
  planName: string;
  activity: string;
}) {
  const PRESET_COVERS = [
    { color: "from-teal-500 to-emerald-400", label: "Ocean" },
    { color: "from-amber-400 to-orange-500", label: "Ember" },
    { color: "from-violet-500 to-purple-600", label: "Dusk" },
    { color: "from-rose-400 to-pink-600", label: "Bloom" },
    { color: "from-sky-400 to-blue-600", label: "Sky" },
    { color: "from-slate-600 to-zinc-800", label: "Graphite" },
  ];

  return (
    <div className="space-y-5">
      {/* Success banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Check size={18} className="text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">Group forged!</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            "{planName}" · {activity}
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Cover image</p>
        <button
          type="button"
          onClick={() => onCoverImageChange("uploaded")}
          className={cn(
            "w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-150",
            coverImage === "uploaded"
              ? "border-primary bg-primary/5"
              : "border-border bg-background hover:border-primary/40 hover:bg-muted/40",
          )}
        >
          {coverImage === "uploaded" ? (
            <>
              <Check size={22} className="text-primary" />
              <span className="text-xs font-medium text-primary">Photo selected</span>
            </>
          ) : (
            <>
              <ImagePlus size={22} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tap to upload a photo</span>
            </>
          )}
        </button>
      </div>

      {/* Preset gradient covers */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Or choose a cover colour</p>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COVERS.map(({ color, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => onCoverImageChange(label)}
              aria-label={`${label} cover`}
              className={cn(
                "h-10 rounded-xl bg-gradient-to-br transition-all duration-150",
                color,
                coverImage === label
                  ? "ring-2 ring-offset-2 ring-primary scale-105"
                  : "hover:scale-105",
              )}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        You can change this anytime from the Group settings.
      </p>
    </div>
  );
}

// ─── Step 5: Invite (post-forge) ─────────────────────────────────────────────
// Invitations are sent ONLY after the group is confirmed and identity is set.

function Step5Invite({
  planName,
  groupSize,
  inviteCopied,
  onCopyLink,
  invitesSent,
}: {
  planName: string;
  groupSize: AlgorithmGroupSize;
  inviteCopied: boolean;
  onCopyLink: () => void;
  invitesSent: boolean;
}) {
  const slotsLeft = groupSize - 1; // excluding creator

  if (invitesSent) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Check size={28} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-foreground text-lg">Invitations sent!</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
            {slotsLeft} invitation{slotsLeft !== 1 ? "s" : ""} dispatched for "{planName}". Members will be notified once all spots are filled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Group summary */}
      <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Group summary</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Plan</p>
            <p className="text-sm font-semibold text-foreground truncate">{planName}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Spots to fill</p>
            <p className="text-sm font-semibold text-foreground">{slotsLeft} of {groupSize}</p>
          </div>
        </div>

        {/* Slots visualiser */}
        <div className="flex gap-1.5">
          {/* Creator slot */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary-foreground">You</span>
          </div>
          {/* Open slots */}
          {Array.from({ length: slotsLeft }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/40 flex items-center justify-center"
            >
              <span className="text-[10px] text-muted-foreground/50">{i + 2}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invite via link */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Share invite link</p>
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-background">
          <span className="flex-1 text-xs text-muted-foreground truncate font-mono">
            teamforge.app/join/grp_xk4j2m
          </span>
          <button
            type="button"
            onClick={onCopyLink}
            aria-label="Copy invite link"
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150",
              inviteCopied
                ? "bg-primary/10 text-primary"
                : "bg-muted text-foreground hover:bg-muted/80",
            )}
          >
            {inviteCopied ? <Check size={12} /> : <Copy size={12} />}
            {inviteCopied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Important timing note */}
      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-foreground">When do members get notified?</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Push notifications and emails are dispatched only when you tap "Send Invitations" below — ensuring every member receives a complete, confirmed invitation with all Plan details attached.
        </p>
      </div>
    </div>
  );
}

// ─── The Forge Button ─────────────────────────────────────────────────────────

function ForgeButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-muted-foreground">
        Forging creates your Group. You will set the cover image and send invitations next.
      </p>
      <button
        type="button"
        onClick={onClick}
        aria-label="Forge this group"
        className={cn(
          "relative w-full flex items-center justify-center gap-2.5 rounded-2xl py-4",
          "bg-accent text-accent-foreground font-bold text-base",
          "shadow-[0_4px_24px_rgba(245,158,11,0.5),0_1px_3px_rgba(0,0,0,0.12)]",
          "hover:brightness-110 hover:shadow-[0_6px_32px_rgba(245,158,11,0.65)]",
          "active:scale-[0.97] active:shadow-[0_2px_12px_rgba(245,158,11,0.4)]",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          "motion-safe:animate-[pulse-glow-amber_2.5s_ease-in-out_2]",
        )}
      >
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
