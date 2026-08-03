import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Handshake,
  MessageCircle,
  Route,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import { EmptyGroupFitVisual } from "@/features/profile/assets/empty-group-fit";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

import type { GroupFitInsight, UserGroupSignal } from "../lib/profile-insights";
import { ProfileSectionHeading } from "./profile-section-heading";

interface GroupFitSectionProps {
  insight: GroupFitInsight;
  mode: "self" | "public";
}

export function GroupFitSection({ insight, mode }: GroupFitSectionProps) {
  const showEmptyVisual =
    insight.title === "Add details to see group fit" ||
    insight.title === "Add interests to improve group fit";

  if (showEmptyVisual) {
    return (
      <section className="flex flex-col gap-6">
        <ProfileSectionHeading>{getFitHeading(mode)}</ProfileSectionHeading>
        <div className="flex min-h-48 max-w-3xl flex-col items-center justify-center gap-4 sm:flex-row">
          <EmptyGroupFitVisual className="h-20 w-auto shrink-0 text-foreground" />
          <div className="flex min-w-0 flex-col gap-3 text-center sm:text-left">
            <h3 className="font-black text-2xl text-ink tracking-tight md:text-3xl">
              {insight.title}
            </h3>
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
          <ProfileSectionHeading>{getFitHeading(mode)}</ProfileSectionHeading>
          <div className="flex max-w-3xl flex-col gap-3">
            <h3 className="font-black text-2xl text-ink tracking-tight md:text-3xl">
              {insight.title}
            </h3>
            <p className="text-pretty font-semibold text-base text-ink/85 leading-relaxed">
              {getCompactSummary(insight.summary)}
            </p>
          </div>
        </div>

        <UserGroupSignalCard signal={insight.userSignal} mode={mode} />
      </div>

      <div className="grouped-surface grid overflow-hidden rounded-2xl sm:grid-cols-3">
        <FitGuidance
          icon={Handshake}
          label="Best with"
          tone="positive"
          value={insight.bestWith}
        />
        <FitGuidance
          icon={Route}
          label="Opening move"
          tone="neutral"
          value={insight.openingMove}
        />
        <FitGuidance
          icon={ShieldAlert}
          label="Avoid"
          tone="caution"
          value={insight.avoid}
        />
      </div>
    </section>
  );
}

function UserGroupSignalCard({
  mode,
  signal,
}: {
  mode: GroupFitSectionProps["mode"];
  signal: UserGroupSignal;
}) {
  return (
    <div className="grouped-surface grid h-full min-h-52 overflow-hidden rounded-2xl">
      <SignalRead
        icon={Activity}
        label="Group energy"
        mode={mode}
        signal={signal.groupEnergy}
      />
      <SignalRead
        icon={MessageCircle}
        label="Connection style"
        mode={mode}
        signal={signal.connectionStyle}
      />
      <SignalRead
        icon={UsersRound}
        label="Social rhythm"
        mode={mode}
        signal={signal.socialRhythm}
      />
    </div>
  );
}

function FitGuidance({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: "caution" | "neutral" | "positive";
  value: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 bg-card px-4 py-4 sm:px-5",
        tone === "positive" && "bg-(--grouped-menu-selected)",
        tone === "caution" && "bg-spark-amber/6",
      )}
    >
      <div className="flex items-center gap-2 font-bold text-slate-muted text-sm">
        <IconTile icon={Icon} shape="circle" size="sm" />
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
  mode,
  signal,
}: {
  icon: LucideIcon;
  label: string;
  mode: GroupFitSectionProps["mode"];
  signal: UserGroupSignal[keyof UserGroupSignal];
}) {
  return (
    <div className="min-w-0 bg-(--grouped-menu-selected) px-5 py-4">
      <div className="flex min-w-0 items-center gap-2">
        <IconTile
          icon={Icon}
          shape="circle"
          size="xs"
          className="bg-forge-teal/12"
        />
        <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
          <p className="font-bold text-slate-muted text-sm">{label}</p>
          <p className="shrink-0 font-black text-forge-teal text-sm">
            {signal.value}
          </p>
        </div>
      </div>
      <p className="mt-2 text-pretty font-semibold text-ink/78 text-xs leading-relaxed">
        {getPerspectiveCopy(signal.description, mode)}
      </p>
    </div>
  );
}

function getCompactSummary(value: string) {
  const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  return sentences.slice(0, 1).join(" ").trim();
}

function getPerspectiveCopy(value: string, mode: GroupFitSectionProps["mode"]) {
  return mode === "self" ? value : value.replace(/^You\b/, "They");
}

function getFitHeading(mode: GroupFitSectionProps["mode"]) {
  return mode === "self" ? "How you fit" : "How they fit";
}
