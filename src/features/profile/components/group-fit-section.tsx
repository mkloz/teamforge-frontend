import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Handshake,
  MessageCircle,
  Route,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import { EmptyGroupFitVisual } from "@/assets/empty-state/empty-group-fit";

import type { GroupFitInsight, UserGroupSignal } from "../lib/profile-insights";
import { ProfileSectionHeading } from "./profile-section-heading";

interface GroupFitSectionProps {
  insight: GroupFitInsight;
}

export function GroupFitSection({ insight }: GroupFitSectionProps) {
  const showEmptyVisual =
    insight.title === "Fit still forming" ||
    insight.title === "Fit needs an activity";

  if (showEmptyVisual) {
    return (
      <section className="flex flex-col gap-6">
        <ProfileSectionHeading>How they fit</ProfileSectionHeading>
        <div className="flex max-w-3xl flex-col items-center gap-4 sm:flex-row">
          <EmptyGroupFitVisual className="w-32 shrink-0 text-foreground" />
          <div className="flex min-w-0 flex-col gap-3 text-center sm:text-left">
            <h2 className="font-black text-2xl text-ink tracking-tight md:text-3xl">
              {insight.title}
            </h2>
            <p className="text-pretty font-medium text-base text-ink/85 leading-relaxed md:text-lg">
              {getCompactSummary(insight.summary)}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <ProfileSectionHeading>How they fit</ProfileSectionHeading>
          <div className="flex max-w-3xl flex-col gap-3">
            <h2 className="font-black text-2xl text-ink tracking-tight md:text-3xl">
              {insight.title}
            </h2>
            <p className="text-pretty font-semibold text-base text-ink/85 leading-relaxed">
              {getCompactSummary(insight.summary)}
            </p>
          </div>
        </div>

        <UserGroupSignalCard signal={insight.userSignal} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <FitGuidance
          icon={Handshake}
          label="Best with"
          value={insight.bestWith}
        />
        <FitGuidance
          icon={Route}
          label="Opening move"
          value={insight.openingMove}
        />
        <FitGuidance icon={ShieldAlert} label="Avoid" value={insight.avoid} />
      </div>
    </section>
  );
}

function UserGroupSignalCard({ signal }: { signal: UserGroupSignal }) {
  return (
    <div className="flex h-full min-h-52 flex-col rounded-2xl border border-forge-teal/20 bg-forge-teal/8 p-4">
      <div className="flex flex-1 flex-col justify-end gap-3">
        <SignalRead
          icon={Activity}
          label="Group energy"
          signal={signal.groupEnergy}
        />
        <SignalRead
          icon={MessageCircle}
          label="Connection style"
          signal={signal.connectionStyle}
        />
        <SignalRead
          icon={UsersRound}
          label="Social rhythm"
          signal={signal.socialRhythm}
        />
      </div>
    </div>
  );
}

function FitGuidance({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border/70 bg-canvas p-4">
      <div className="flex items-center gap-2 font-bold text-slate-muted text-sm">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
          <Icon size={14} aria-hidden="true" />
        </span>
        {label}
      </div>
      <p className="font-medium text-ink/75 text-sm leading-relaxed">
        {getCompactSummary(value)}
      </p>
    </div>
  );
}

function SignalRead({
  icon: Icon,
  label,
  signal,
}: {
  icon: LucideIcon;
  label: string;
  signal: UserGroupSignal[keyof UserGroupSignal];
}) {
  return (
    <div className="min-w-0 border-border/70 border-t pt-3 first:border-t-0 first:pt-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-forge-teal/12 text-forge-teal">
          <Icon className="size-3" aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
          <p className="font-bold text-slate-muted text-sm">{label}</p>
          <p className="shrink-0 font-black text-forge-teal text-sm">
            {signal.value}
          </p>
        </div>
      </div>
      <p className="mt-2 text-pretty font-semibold text-ink/78 text-xs leading-relaxed">
        {signal.description}
      </p>
    </div>
  );
}

function getCompactSummary(value: string) {
  const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  return sentences.slice(0, 1).join(" ").trim();
}
