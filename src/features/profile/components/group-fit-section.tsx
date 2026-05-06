import type { LucideIcon } from "lucide-react";
import { Handshake, Route, ShieldAlert } from "lucide-react";

import type { GroupFitInsight } from "../lib/profile-insights";
import { ProfileSectionHeading } from "./profile-section-heading";

interface GroupFitSectionProps {
  insight: GroupFitInsight;
}

export function GroupFitSection({ insight }: GroupFitSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <ProfileSectionHeading>How they fit</ProfileSectionHeading>
        <div className="flex max-w-3xl flex-col gap-3">
          <h2 className="text-[1.6rem] font-black tracking-tight text-ink md:text-3xl">
            {insight.title}
          </h2>
          <p className="text-base font-medium leading-relaxed text-ink/85 text-pretty md:text-lg">
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
        <div className="flex max-w-3xl flex-col gap-2 border-l border-forge-teal/40 pl-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-muted">
            Why it works
          </p>
          <p className="text-sm font-semibold leading-relaxed text-ink/82">
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
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-muted">
        <Icon size={14} className="shrink-0 text-forge-teal" />
        {label}
      </div>
      <p className="text-sm font-medium leading-relaxed text-ink/75">
        {getCompactSummary(value)}
      </p>
    </div>
  );
}

function getCompactSummary(value: string) {
  const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  return sentences.slice(0, 1).join(" ").trim();
}
