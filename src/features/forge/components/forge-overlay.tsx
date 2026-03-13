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
  Cpu,
  RefreshCw,
  UserMinus,
  AlertCircle,
  Sparkles,
  Globe,
  Lock,
  UserCheck,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ForgeOverlayProps {
  open: boolean;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALGORITHM_GROUP_SIZES = [
  { value: 4 as const, label: "4", note: "Tight-knit" },
  { value: 6 as const, label: "6", note: "Balanced" },
  { value: 8 as const, label: "8", note: "Expansive" },
];
type FixedGroupSize = 4 | 6 | 8;

type ForgeMode = "manual" | "auto";
type Visibility = "public" | "friends" | "invite";
type ForgeResult = "idle" | "success" | "failed";

// Simulated matched participants for demo
const MOCK_PARTICIPANTS = [
  { id: "1", name: "Mia Torres", avatar: "MT", compatibility: 94 },
  { id: "2", name: "James Park", avatar: "JP", compatibility: 88 },
  { id: "3", name: "Sofia Chen", avatar: "SC", compatibility: 82 },
  { id: "4", name: "Luca Bianchi", avatar: "LB", compatibility: 76 },
  { id: "5", name: "Priya Nair", avatar: "PN", compatibility: 91 },
  { id: "6", name: "Noah Ellis", avatar: "NE", compatibility: 79 },
  { id: "7", name: "Amara Osei", avatar: "AO", compatibility: 85 },
];

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

// ─── Step typing ──────────────────────────────────────────────────────────────

// Steps 1–3 = pre-forge. 4 = post-forge result. 5 = identity. 6 = invite.
type Step = 1 | 2 | 3 | 4 | 5 | 6;

// ─── Root ─────────────────────────────────────────────────────────────────────

export function ForgeOverlay({ open, onClose }: ForgeOverlayProps) {
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // Step 2 — Plan
  const [planName, setPlanName] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planTime, setPlanTime] = useState("");
  const [planLocation, setPlanLocation] = useState("");

  // Step 3 — Group
  const [forgeMode, setForgeMode] = useState<ForgeMode>("manual");
  const [fixedSize, setFixedSize] = useState<FixedGroupSize>(6);
  const [autoMinSize, setAutoMinSize] = useState(4);
  const [autoMaxSize, setAutoMaxSize] = useState(8);
  const [compatibilityWeight, setCompatibilityWeight] = useState(70);
  const [diversityWeight, setDiversityWeight] = useState(50);
  const [visibility, setVisibility] = useState<Visibility>("friends");

  // Post-forge
  const [forgeResult, setForgeResult] = useState<ForgeResult>("idle");
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS.slice(0, 5));
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  // Step 5 — Identity
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Step 6 — Invite
  const [inviteCopied, setInviteCopied] = useState(false);
  const [invitesSent, setInvitesSent] = useState(false);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const activeParticipants = participants.filter((p) => !removedIds.has(p.id));

  const canAdvanceStep1 = !!selectedActivity;
  const canAdvanceStep2 = planName.trim().length >= 3;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleClose = () => {
    onClose();
    setTimeout(resetState, 300);
  };

  const resetState = () => {
    setStep(1);
    setSelectedActivity(null);
    setPlanName("");
    setPlanDate("");
    setPlanTime("");
    setPlanLocation("");
    setForgeMode("manual");
    setFixedSize(6);
    setAutoMinSize(4);
    setAutoMaxSize(8);
    setCompatibilityWeight(70);
    setDiversityWeight(50);
    setVisibility("friends");
    setForgeResult("idle");
    setParticipants(MOCK_PARTICIPANTS.slice(0, 5));
    setRemovedIds(new Set());
    setCoverImage(null);
    setInviteCopied(false);
    setInvitesSent(false);
  };

  // Manual forge: deterministic success for demo
  const handleManualForge = () => {
    setParticipants(MOCK_PARTICIPANTS.slice(0, fixedSize - 1));
    setRemovedIds(new Set());
    setForgeResult("success");
    setStep(4);
  };

  // Auto forge: simulate occasional failure for demo (fails if diversity > 80)
  const handleAutoForge = () => {
    if (diversityWeight > 80) {
      setForgeResult("failed");
    } else {
      const size = Math.floor((autoMinSize + autoMaxSize) / 2);
      setParticipants(MOCK_PARTICIPANTS.slice(0, size - 1));
      setRemovedIds(new Set());
      setForgeResult("success");
    }
    setStep(4);
  };

  const handleRemoveParticipant = (id: string) => {
    setRemovedIds((prev) => new Set([...prev, id]));
  };

  const handleReforge = () => {
    // Return to step 3 with current settings intact
    setForgeResult("idle");
    setStep(3);
  };

  const handleCopyLink = () => {
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleSendInvites = () => setInvitesSent(true);

  if (!open) return null;

  // ── Header metadata ──────────────────────────────────────────────────────────

  const headerMeta = {
    1: { title: "What are you doing?", entity: "Activity", sub: "Step 1 of 3" },
    2: { title: "Define the Plan", entity: "Plan", sub: "Step 2 of 3 · Plan" },
    3: { title: "Configure the Group", entity: "Group", sub: "Step 3 of 3 · Group" },
    4: {
      title: forgeResult === "failed" ? "Forge unsuccessful" : "Group forged",
      entity: forgeResult === "failed" ? "Failed" : "Success",
      sub: "Post-forge",
    },
    5: { title: "Give your Group an identity", entity: "Identity", sub: "Post-forge · 1 of 2" },
    6: { title: "Invite members", entity: "Invite", sub: "Post-forge · 2 of 2" },
  }[step];

  const entityPillColor: Record<string, string> = {
    Activity: "bg-muted text-muted-foreground",
    Plan: "bg-primary/10 text-primary",
    Group: "bg-accent/15 text-accent",
    Success: "bg-emerald-500/10 text-emerald-600",
    Failed: "bg-destructive/10 text-destructive",
    Identity: "bg-muted text-muted-foreground",
    Invite: "bg-muted text-muted-foreground",
  };

  const isPreForge = step <= 3;
  const canGoBack = (step > 1 && step <= 3) || step === 5 || step === 6;

  const handleBack = () => {
    if (step > 1 && step <= 3) setStep((s) => (s - 1) as Step);
    else if (step === 5) setStep(4);
    else if (step === 6) setStep(5);
  };

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
        aria-label={headerMeta.title}
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
            {canGoBack ? (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors shrink-0"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                  forgeResult === "success" ? "bg-primary/10" : "bg-accent/10",
                )}
                aria-hidden="true"
              >
                {forgeResult === "success"
                  ? <Check size={15} className="text-primary" />
                  : <Zap size={15} className="text-accent fill-current" />}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-foreground leading-none">
                  {headerMeta.title}
                </h2>
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                  entityPillColor[headerMeta.entity] ?? "bg-muted text-muted-foreground",
                )}>
                  {headerMeta.entity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{headerMeta.sub}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress track */}
        <div className="px-5 mb-1">
          {isPreForge ? (
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
          ) : (
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                {([4, 5, 6] as Step[]).map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      s <= step ? "bg-primary" : "bg-muted",
                    )}
                  />
                ))}
              </div>
              {forgeResult === "success" && (
                <p className="text-[10px] text-muted-foreground text-center">
                  Group forged — complete setup before invitations go out
                </p>
              )}
            </div>
          )}
        </div>

        {/* Entity callout for Plan / Group steps */}
        {(step === 2 || step === 3) && (
          <div className={cn(
            "mx-5 mt-3 mb-1 px-3 py-2 rounded-xl border text-xs text-muted-foreground",
            step === 2 ? "border-primary/20 bg-primary/5" : "border-accent/20 bg-accent/5",
          )}>
            {step === 2
              ? "A Plan is the concrete event — its name, date, and location. It is distinct from the Group."
              : "A Group is the set of people the algorithm assembles. It is distinct from the Plan it attends."}
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
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
              forgeMode={forgeMode}
              onForgeModeChange={setForgeMode}
              fixedSize={fixedSize}
              onFixedSizeChange={setFixedSize}
              autoMinSize={autoMinSize}
              onAutoMinSizeChange={setAutoMinSize}
              autoMaxSize={autoMaxSize}
              onAutoMaxSizeChange={setAutoMaxSize}
              compatibilityWeight={compatibilityWeight}
              onCompatibilityWeightChange={setCompatibilityWeight}
              diversityWeight={diversityWeight}
              onDiversityWeightChange={setDiversityWeight}
              visibility={visibility}
              onVisibilityChange={setVisibility}
            />
          )}
          {step === 4 && forgeResult === "success" && (
            <Step4Success
              planName={planName}
              activity={selectedActivity ?? ""}
              participants={participants}
              removedIds={removedIds}
              onRemoveParticipant={handleRemoveParticipant}
              onReforge={handleReforge}
            />
          )}
          {step === 4 && forgeResult === "failed" && (
            <Step4Failed
              forgeMode={forgeMode}
              onReforge={handleReforge}
            />
          )}
          {step === 5 && (
            <Step5Identity
              coverImage={coverImage}
              onCoverImageChange={setCoverImage}
              planName={planName || "Your Group"}
              activity={selectedActivity || ""}
            />
          )}
          {step === 6 && (
            <Step6Invite
              planName={planName || "Your Group"}
              participantCount={activeParticipants.length + 1}
              inviteCopied={inviteCopied}
              onCopyLink={handleCopyLink}
              invitesSent={invitesSent}
            />
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pt-3 pb-6 md:pb-5 border-t border-border bg-card shrink-0 space-y-2">
          {step === 1 && (
            <PrimaryButton
              label="Next: Plan Details"
              icon={<ChevronRight size={16} />}
              onClick={() => setStep(2)}
              disabled={!canAdvanceStep1}
            />
          )}

          {step === 2 && (
            <PrimaryButton
              label="Next: Group Setup"
              icon={<ChevronRight size={16} />}
              onClick={() => setStep(3)}
              disabled={!canAdvanceStep2}
            />
          )}

          {step === 3 && forgeMode === "manual" && (
            <ManualForgeButton onClick={handleManualForge} />
          )}

          {step === 3 && forgeMode === "auto" && (
            <AutoForgeButton onClick={handleAutoForge} />
          )}

          {step === 4 && forgeResult === "success" && (
            <PrimaryButton
              label="Continue: Group Identity"
              icon={<ChevronRight size={16} />}
              onClick={() => setStep(5)}
            />
          )}

          {step === 4 && forgeResult === "failed" && (
            <ReforgeButton onClick={handleReforge} />
          )}

          {step === 5 && (
            <PrimaryButton
              label={coverImage ? "Continue to Invitations" : "Skip for now"}
              icon={<ChevronRight size={16} />}
              onClick={() => setStep(6)}
            />
          )}

          {step === 6 && !invitesSent && (
            <PrimaryButton
              label="Send Invitations"
              icon={<UserPlus size={16} />}
              onClick={handleSendInvites}
            />
          )}

          {step === 6 && invitesSent && (
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

// ─── Shared button primitives ─────────────────────────────────────────────────

function PrimaryButton({
  label,
  icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm transition-all duration-150",
        disabled
          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
          : "bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-[0_4px_16px_rgba(13,148,136,0.3)]",
      )}
    >
      {label}
      {icon}
    </button>
  );
}

// Manual forge: amber, Zap icon, initiates traditional forge
function ManualForgeButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-muted-foreground">
        Forge assembles your Group using your exact configuration. Cover image and invitations follow after.
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
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/15 to-transparent pointer-events-none" aria-hidden="true" />
        <Zap size={20} aria-hidden="true" className="fill-current" />
        <span>Forge This Group</span>
      </button>
    </div>
  );
}

// Auto forge: indigo/primary, Sparkles + Cpu icon, distinct from manual forge
function AutoForgeButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-muted-foreground">
        The algorithm will optimise participant selection within your parameters. You review results before sending invitations.
      </p>
      <button
        type="button"
        onClick={onClick}
        aria-label="Auto-forge with algorithm"
        className={cn(
          "relative w-full flex items-center justify-center gap-2.5 rounded-2xl py-4",
          "bg-primary text-primary-foreground font-bold text-base",
          "shadow-[0_4px_24px_rgba(13,148,136,0.45),0_1px_3px_rgba(0,0,0,0.12)]",
          "hover:brightness-110 hover:shadow-[0_6px_32px_rgba(13,148,136,0.6)]",
          "active:scale-[0.97]",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        )}
      >
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/15 to-transparent pointer-events-none" aria-hidden="true" />
        <Cpu size={18} aria-hidden="true" />
        <span>Auto-Forge with Algorithm</span>
        <Sparkles size={14} aria-hidden="true" className="opacity-80" />
      </button>
    </div>
  );
}

function ReforgeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm transition-all duration-150",
        "bg-accent text-accent-foreground hover:brightness-110 active:scale-[0.98]",
        "shadow-[0_4px_16px_rgba(245,158,11,0.3)]",
      )}
    >
      <RefreshCw size={15} />
      Adjust & Reforge
    </button>
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

function Step2Plan({
  planName, onPlanNameChange,
  planDate, onPlanDateChange,
  planTime, onPlanTimeChange,
  planLocation, onPlanLocationChange,
}: {
  planName: string; onPlanNameChange: (v: string) => void;
  planDate: string; onPlanDateChange: (v: string) => void;
  planTime: string; onPlanTimeChange: (v: string) => void;
  planLocation: string; onPlanLocationChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
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

      {/* Plan / Group distinction note */}
      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-foreground">Plan vs Group</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A <span className="font-medium text-primary">Plan</span> describes the event — what, when, and where.
          In the next step you will configure the <span className="font-medium text-accent">Group</span> — the people assembled to attend it.
        </p>
      </div>
    </div>
  );
}

// ─── Step 3: Group ────────────────────────────────────────────────────────────

function Step3Group({
  forgeMode, onForgeModeChange,
  fixedSize, onFixedSizeChange,
  autoMinSize, onAutoMinSizeChange,
  autoMaxSize, onAutoMaxSizeChange,
  compatibilityWeight, onCompatibilityWeightChange,
  diversityWeight, onDiversityWeightChange,
  visibility, onVisibilityChange,
}: {
  forgeMode: ForgeMode; onForgeModeChange: (v: ForgeMode) => void;
  fixedSize: FixedGroupSize; onFixedSizeChange: (v: FixedGroupSize) => void;
  autoMinSize: number; onAutoMinSizeChange: (v: number) => void;
  autoMaxSize: number; onAutoMaxSizeChange: (v: number) => void;
  compatibilityWeight: number; onCompatibilityWeightChange: (v: number) => void;
  diversityWeight: number; onDiversityWeightChange: (v: number) => void;
  visibility: Visibility; onVisibilityChange: (v: Visibility) => void;
}) {
  return (
    <div className="space-y-6">

      {/* ── Mode toggle ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Forge mode</p>
        <div className="grid grid-cols-2 gap-2">
          {/* Manual */}
          <button
            type="button"
            onClick={() => onForgeModeChange("manual")}
            className={cn(
              "flex flex-col items-start gap-1.5 px-4 py-3.5 rounded-2xl border text-left transition-all duration-150",
              forgeMode === "manual"
                ? "border-transparent bg-accent text-accent-foreground shadow-[0_4px_16px_rgba(245,158,11,0.35)]"
                : "border-border bg-background hover:border-accent/40",
            )}
          >
            <div className="flex items-center gap-1.5">
              <Zap size={14} className={cn("fill-current", forgeMode === "manual" ? "text-accent-foreground" : "text-accent")} />
              <span className={cn("text-xs font-bold", forgeMode === "manual" ? "text-accent-foreground" : "text-foreground")}>Manual</span>
            </div>
            <p className={cn("text-[10px] leading-tight", forgeMode === "manual" ? "text-accent-foreground/80" : "text-muted-foreground")}>
              You pick an exact group size. Algorithm fills with best matches.
            </p>
          </button>

          {/* Auto */}
          <button
            type="button"
            onClick={() => onForgeModeChange("auto")}
            className={cn(
              "flex flex-col items-start gap-1.5 px-4 py-3.5 rounded-2xl border text-left transition-all duration-150",
              forgeMode === "auto"
                ? "border-transparent bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(13,148,136,0.35)]"
                : "border-border bg-background hover:border-primary/40",
            )}
          >
            <div className="flex items-center gap-1.5">
              <Cpu size={14} className={cn(forgeMode === "auto" ? "text-primary-foreground" : "text-primary")} />
              <span className={cn("text-xs font-bold", forgeMode === "auto" ? "text-primary-foreground" : "text-foreground")}>Auto-Algorithm</span>
            </div>
            <p className={cn("text-[10px] leading-tight", forgeMode === "auto" ? "text-primary-foreground/80" : "text-muted-foreground")}>
              Set parameters. Algorithm determines the optimal size and composition.
            </p>
          </button>
        </div>
      </div>

      {/* ── Manual: fixed size buttons ───────────────────────────────── */}
      {forgeMode === "manual" && (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Group size</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              The algorithm requires a fixed participant count to function correctly.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ALGORITHM_GROUP_SIZES.map(({ value, label, note }) => (
              <button
                key={value}
                type="button"
                onClick={() => onFixedSizeChange(value)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-4 rounded-2xl border transition-all duration-150",
                  fixedSize === value
                    ? "border-transparent bg-accent text-accent-foreground shadow-[0_4px_16px_rgba(245,158,11,0.35)]"
                    : "border-border bg-background text-foreground hover:border-accent/50",
                )}
              >
                <span className={cn("text-2xl font-bold leading-none tabular-nums", fixedSize === value ? "text-accent-foreground" : "text-foreground")}>
                  {label}
                </span>
                <span className={cn("text-[10px] font-medium mt-1", fixedSize === value ? "text-accent-foreground/80" : "text-muted-foreground")}>
                  people
                </span>
                <span className={cn("text-[10px]", fixedSize === value ? "text-accent-foreground/70" : "text-muted-foreground/60")}>
                  {note}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Including you — the algorithm will find {fixedSize - 1} compatible members.
          </p>
        </div>
      )}

      {/* ── Auto: algorithm parameter sliders ────────────────────────── */}
      {forgeMode === "auto" && (
        <div className="space-y-5">
          {/* Size range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Size range</p>
              <span className="text-xs font-bold text-primary tabular-nums">
                {autoMinSize}–{autoMaxSize} people
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground w-6">Min</span>
                <input
                  type="range"
                  min={3}
                  max={autoMaxSize - 1}
                  value={autoMinSize}
                  onChange={(e) => onAutoMinSizeChange(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full accent-primary cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground tabular-nums w-4 text-right">{autoMinSize}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground w-6">Max</span>
                <input
                  type="range"
                  min={autoMinSize + 1}
                  max={12}
                  value={autoMaxSize}
                  onChange={(e) => onAutoMaxSizeChange(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full accent-primary cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground tabular-nums w-4 text-right">{autoMaxSize}</span>
              </div>
            </div>
          </div>

          {/* Compatibility weight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Compatibility weight</p>
                <p className="text-[10px] text-muted-foreground/70">How heavily personality match is prioritised</p>
              </div>
              <span className="text-xs font-bold text-primary tabular-nums">{compatibilityWeight}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={compatibilityWeight}
                onChange={(e) => onCompatibilityWeightChange(Number(e.target.value))}
                className="flex-1 h-2 rounded-full accent-primary cursor-pointer"
              />
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
          </div>

          {/* Diversity weight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Personality diversity</p>
                <p className="text-[10px] text-muted-foreground/70">Prefer complementary types over similar ones</p>
              </div>
              <span className="text-xs font-bold text-primary tabular-nums">{diversityWeight}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">Similar</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={diversityWeight}
                onChange={(e) => onDiversityWeightChange(Number(e.target.value))}
                className="flex-1 h-2 rounded-full accent-primary cursor-pointer"
              />
              <span className="text-[10px] text-muted-foreground">Diverse</span>
            </div>
            {diversityWeight > 80 && (
              <p className="text-[10px] text-amber-600 flex items-center gap-1">
                <AlertCircle size={10} />
                Very high diversity may reduce available matches.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              The algorithm will find the optimal group within your parameters. If no combination meets all criteria, you will be prompted to adjust and reforge.
            </p>
          </div>
        </div>
      )}

      {/* ── Visibility ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Visibility</p>
        <div className="space-y-2">
          {([
            { value: "public" as Visibility, label: "Open", desc: "Anyone matching criteria can request to join", Icon: Globe },
            { value: "friends" as Visibility, label: "Friends first", desc: "Prioritise mutual connections before strangers", Icon: UserCheck },
            { value: "invite" as Visibility, label: "Invite only", desc: "Only people you explicitly invite can join", Icon: Lock },
          ]).map(({ value, label, desc, Icon }) => (
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
              <Icon size={16} className={cn("mt-0.5 shrink-0", visibility === value ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* After-forge note */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <p className="text-xs font-semibold text-accent mb-0.5">After forging</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You will review matched participants, add a cover image, and send invitations <span className="font-medium text-foreground">only after</span> your Group is fully formed.
        </p>
      </div>
    </div>
  );
}

// ─── Step 4a: Success ─────────────────────────────────────────────────────────

function Step4Success({
  planName,
  activity,
  participants,
  removedIds,
  onRemoveParticipant,
  onReforge,
}: {
  planName: string;
  activity: string;
  participants: typeof MOCK_PARTICIPANTS;
  removedIds: Set<string>;
  onRemoveParticipant: (id: string) => void;
  onReforge: () => void;
}) {
  const active = participants.filter((p) => !removedIds.has(p.id));

  return (
    <div className="space-y-5">
      {/* Success banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <Check size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">Group forged successfully</p>
          <p className="text-xs text-muted-foreground mt-0.5">"{planName}" · {activity}</p>
        </div>
      </div>

      {/* Participant list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">
            Matched participants ({active.length + 1} total)
          </p>
          {removedIds.size > 0 && (
            <button
              type="button"
              onClick={onReforge}
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <RefreshCw size={11} />
              Reforge
            </button>
          )}
        </div>

        {/* Creator (you) */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary-foreground">You</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none">You</p>
            <p className="text-xs text-muted-foreground mt-0.5">Group creator</p>
          </div>
          <span className="text-xs font-bold text-primary">Host</span>
        </div>

        {/* Matched members */}
        {participants.map((p) => {
          const removed = removedIds.has(p.id);
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200",
                removed
                  ? "opacity-40 bg-muted/20 border-border"
                  : "bg-background border-border",
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold",
                removed ? "bg-muted text-muted-foreground" : "bg-accent/15 text-accent",
              )}>
                {p.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold leading-none", removed ? "text-muted-foreground line-through" : "text-foreground")}>
                  {p.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {removed ? "Removed from group" : `${p.compatibility}% compatibility`}
                </p>
              </div>
              {!removed && (
                <button
                  type="button"
                  onClick={() => onRemoveParticipant(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <UserMinus size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Remove guidance */}
      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Removing a participant queues them for future matching rather than excluding them entirely. Tap <span className="font-medium text-foreground">Reforge</span> to run the algorithm again with updated parameters after removing members.
        </p>
      </div>
    </div>
  );
}

// ─── Step 4b: Failed forge ────────────────────────────────────────────────────

function Step4Failed({
  forgeMode,
  onReforge,
}: {
  forgeMode: ForgeMode;
  onReforge: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Failure banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/8 border border-destructive/20">
        <div className="w-9 h-9 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
          <AlertCircle size={18} className="text-destructive" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">No matching group found</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The algorithm could not form a group meeting all criteria.
          </p>
        </div>
      </div>

      {/* Why it failed */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Possible reasons</p>
        <div className="space-y-2">
          {[
            forgeMode === "auto"
              ? "Personality diversity setting is too high — fewer users meet all constraints simultaneously."
              : "Not enough compatible users are available at the selected group size.",
            "Visibility is set to 'Friends only' and your network is too small.",
            "The activity or time window has limited the eligible pool significantly.",
          ].map((reason, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-2xl border border-border bg-background">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Recommended adjustments</p>
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 space-y-2">
          {(forgeMode === "auto"
            ? [
                "Lower the personality diversity slider below 80%",
                "Widen the size range (e.g. 3–10 instead of 4–6)",
                "Reduce the compatibility weight to allow more candidates",
                "Switch visibility to 'Open' to expand the candidate pool",
              ]
            : [
                "Try a smaller group size (4 instead of 8)",
                "Switch visibility from 'Friends only' to 'Open'",
                "Change the date or time to improve availability",
              ]
          ).map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check size={12} className="text-accent mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Tap <span className="font-medium text-foreground">Adjust & Reforge</span> to return to Group setup with your current settings preserved.
      </p>
    </div>
  );
}

// ─── Step 5: Identity (post-forge) ───────────────────────────────────────────

function Step5Identity({
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
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
        Cover image is added <span className="font-medium text-foreground">after forging</span> so the invitation members receive is complete and polished. You can change it anytime from Group settings.
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Upload a photo</p>
        <button
          type="button"
          onClick={() => onCoverImageChange(coverImage === "uploaded" ? null : "uploaded")}
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

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Or choose a colour</p>
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
    </div>
  );
}

// ─── Step 6: Invite (post-forge) ─────────────────────────────────────────────

function Step6Invite({
  planName,
  participantCount,
  inviteCopied,
  onCopyLink,
  invitesSent,
}: {
  planName: string;
  participantCount: number;
  inviteCopied: boolean;
  onCopyLink: () => void;
  invitesSent: boolean;
}) {
  if (invitesSent) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Check size={28} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-foreground text-lg">Invitations sent</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
            {participantCount - 1} invitation{participantCount - 1 !== 1 ? "s" : ""} dispatched for "{planName}". Members will be notified once all spots are confirmed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Group summary</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Plan</p>
            <p className="text-sm font-semibold text-foreground truncate">{planName}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Members</p>
            <p className="text-sm font-semibold text-foreground">{participantCount} confirmed</p>
          </div>
        </div>

        {/* Slot visualiser */}
        <div className="flex gap-1.5 flex-wrap">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary-foreground">You</span>
          </div>
          {Array.from({ length: participantCount - 1 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
            >
              <Check size={12} className="text-emerald-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Invite link */}
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

      {/* Timing note */}
      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-foreground">When do members get notified?</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Push notifications and emails are dispatched only when you tap "Send Invitations" — ensuring every member receives a complete, confirmed invitation with all Plan details.
        </p>
      </div>
    </div>
  );
}
