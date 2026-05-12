import { Section } from "@/features/group-plan-detail/components/section";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getFitPercent } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { FitScore } from "./fit-score";
import { getFitVerdict, sortFitSignalsByStrength } from "./fit-section-model";
import { SignalRow } from "./signal-row";

interface FitSectionProps {
  detail: GroupPlanDetail;
}

export function FitSection({ detail }: FitSectionProps) {
  const fit = detail.fit;
  const percent = getFitPercent(fit?.totalScore);
  const sortedSignals = sortFitSignalsByStrength(fit?.signals ?? []);

  if (!fit || sortedSignals.length === 0) {
    return (
      <Section
        heading="Fit signals are still settling"
        description="Once a few more interactions land you'll see compatibility signals here."
        headingId="fit-section-heading"
      >
        <p className="text-muted-foreground text-sm leading-relaxed">
          For now, judge the group from the plan and the people already in.
        </p>
      </Section>
    );
  }

  return (
    <Section
      heading={getFitVerdict(percent)}
      description={fit.summary}
      headingId="fit-section-heading"
      trailing={percent !== null ? <FitScore percent={percent} /> : null}
    >
      <div className="grid gap-1 sm:grid-cols-2">
        {sortedSignals.map((signal) => (
          <SignalRow key={signal.key} signal={signal} />
        ))}
      </div>
    </Section>
  );
}
