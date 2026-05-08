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
    <section className="border-border/60 border-y py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="font-extrabold text-sm text-spark-amber">
            Good first plan
          </p>
          <h2 className="mt-1 font-black text-ink text-lg leading-tight md:text-xl">
            {primaryIdea.title}
          </h2>
          <p className="mt-1 max-w-2xl font-medium text-slate-muted text-sm leading-relaxed">
            {getCompactDetail(primaryIdea.detail)}
          </p>
        </div>

        {supportingIdeas.length > 0 ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
            {supportingIdeas.map((idea) => (
              <span
                key={idea.title}
                className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-border/80 px-3 py-1 font-bold text-ink/80 text-xs leading-snug"
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
