import type { LucideIcon } from "lucide-react";
import { Handshake, Route, ShieldAlert } from "lucide-react";
import { EmptyGroupFitVisual } from "@/assets/empty-state/empty-group-fit";

import type { GroupFitInsight } from "../lib/profile-insights";
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
      <div className="flex flex-col gap-4">
        <ProfileSectionHeading>How they fit</ProfileSectionHeading>
        <div className="flex max-w-3xl flex-col gap-3">
          <h2 className="font-black text-2xl text-ink tracking-tight md:text-3xl">
            {insight.title}
          </h2>
          <p className="text-pretty font-medium text-base text-ink/85 leading-relaxed md:text-lg">
            {getCompactSummary(insight.summary)}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
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

      {insight.signals[0] ? (
        <div className="flex max-w-3xl flex-col gap-2 border-forge-teal/40 border-l pl-4">
          <p className="font-bold text-slate-muted text-xs uppercase tracking-widest">
            Why it works
          </p>
          <p className="font-semibold text-ink/82 text-sm leading-relaxed">
            {getCompactSummary(insight.signals[0])}
          </p>
        </div>
      ) : null}
    </section>
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 font-bold text-slate-muted text-xs uppercase tracking-widest">
        <Icon size={14} className="shrink-0 text-forge-teal" />
        {label}
      </div>
      <p className="font-medium text-ink/75 text-sm leading-relaxed">
        {getCompactSummary(value)}
      </p>
    </div>
  );
}

function getCompactSummary(value: string) {
  const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  return sentences.slice(0, 1).join(" ").trim();
}
