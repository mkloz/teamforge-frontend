import { Section } from "@/features/group-plan-detail/components/section";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getFitPercent } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { FitScore } from "./fit-score";
import { getFitVerdict, sortFitSignalsByStrength } from "./fit-section-model";
import { SignalRow } from "./signal-row";

interface FitSectionProps {
  detail: GroupPlanDetail;
}

type Fit = NonNullable<GroupPlanDetail["fit"]>;
type SortedFitSignals = ReturnType<typeof sortFitSignalsByStrength>;

type FitSectionState =
  | { kind: "empty" }
  | {
      fit: Fit;
      kind: "signals";
      percent: number | null;
      sortedSignals: SortedFitSignals;
    };

export function FitSection({ detail }: FitSectionProps) {
  const state = getFitSectionState(detail);

  if (state.kind === "empty") {
    return <EmptyFitSection />;
  }

  return <FitSignalsSection state={state} />;
}

function getFitSectionState(detail: GroupPlanDetail): FitSectionState {
  const fit = detail.fit;

  if (!fit) {
    return { kind: "empty" };
  }

  const sortedSignals = sortFitSignalsByStrength(fit.signals);

  if (sortedSignals.length === 0) {
    return { kind: "empty" };
  }

  return {
    fit,
    kind: "signals",
    percent: getFitPercent(fit.totalScore),
    sortedSignals,
  };
}

function EmptyFitSection() {
  return (
    <Section heading="Group fit unavailable" headingId="fit-section-heading">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Review the plan and members instead.
      </p>
    </Section>
  );
}

function FitSignalsSection({
  state,
}: {
  state: Extract<FitSectionState, { kind: "signals" }>;
}) {
  return (
    <Section
      heading={getFitVerdict(state.percent)}
      description={state.fit.summary}
      headingId="fit-section-heading"
      trailing={
        state.percent !== null ? <FitScore percent={state.percent} /> : null
      }
    >
      <div className="grid gap-1 sm:grid-cols-2">
        {state.sortedSignals.map((signal) => (
          <SignalRow key={signal.key} signal={signal} />
        ))}
      </div>
    </Section>
  );
}
