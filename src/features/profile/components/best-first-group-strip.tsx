import { ArrowRight } from "lucide-react";

import type { ActivityIdea } from "../lib/profile-insights";

interface BestFirstGroupStripProps {
  activityIdeas: ActivityIdea[];
}

export function BestFirstGroupStrip({
  activityIdeas,
}: BestFirstGroupStripProps) {
  const primaryIdea = activityIdeas[0] ?? {
    confidence: "soft",
    detail: "A neutral starting point while TeamForge learns the profile.",
    laneKey: "general",
    secondaryLaneKey: null,
    title: "Interest-led small group",
  };
  const supportingIdeas = activityIdeas.slice(1, 3);

  return (
    <section className="border-y border-border/60 py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-spark-amber">
            Good first plan
          </p>
          <h2 className="mt-1 text-lg font-black leading-tight text-ink md:text-xl">
            {primaryIdea.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed text-slate-muted">
            {getCompactDetail(primaryIdea.detail)}
          </p>
        </div>

        {supportingIdeas.length > 0 ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
            {supportingIdeas.map((idea) => (
              <span
                key={idea.title}
                className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-border/80 px-3 py-1 text-xs font-bold leading-snug text-ink/80"
              >
                <ArrowRight size={13} className="shrink-0 text-forge-teal" />
                <span className="min-w-0 break-words">{idea.title}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function getCompactDetail(value: string) {
  const [sentence] = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  return sentence.trim();
}
