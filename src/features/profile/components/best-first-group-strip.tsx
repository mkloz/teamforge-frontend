import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { buildForgeIdeaLaunchNavigation } from "@/features/forge/lib/forge-route";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";

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
    eventDescription:
      "Start with one broad shared-interest prompt and keep the first meetup small, public, and easy to adjust. Ask the group to choose one concrete activity, one simple meeting point, and one fallback option before the plan is confirmed.",
    laneKey: "general",
    secondaryLaneKey: null,
    title: "Interest-led small group",
  };
  const supportingIdeas = activityIdeas.slice(1, 3);

  return (
    <section className="border-border/60 border-y py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="font-black text-ink text-lg leading-tight md:text-xl">
            {primaryIdea.title}
          </h2>
          <p className="mt-1 max-w-2xl font-medium text-slate-muted text-sm leading-relaxed">
            {getCompactDetail(primaryIdea.detail)}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 md:items-end">
          {supportingIdeas.length > 0 ? (
            <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
              {supportingIdeas.map((idea) => (
                <StatusPill
                  key={idea.title}
                  icon={ArrowRight}
                  tone="none"
                  size="md"
                  className="min-h-9 max-w-full border-border/80 text-ink/80 leading-snug"
                  iconClassName="text-forge-teal"
                >
                  <span className="wrap-break-word min-w-0">{idea.title}</span>
                </StatusPill>
              ))}
            </div>
          ) : null}

          <Button asChild variant="outline" size="sm">
            <Link {...buildForgeIdeaLaunchNavigation(primaryIdea)}>
              Forge this kind of group
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function getCompactDetail(value: string) {
  const [sentence] = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  return sentence.trim();
}
