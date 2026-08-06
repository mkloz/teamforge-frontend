import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import type { ReputationSummary } from "@/shared/schemas/reputation";
import { ProfileSignal } from "./profile-signal";

export function TrustBadge({
  isSelf,
  summary,
}: {
  isSelf: boolean;
  summary: ReputationSummary;
}) {
  const score =
    summary.displayScore === null ? null : Math.round(summary.displayScore);
  const displayValue = score === null ? "New" : `${score}`;
  const accessibleValue =
    score === null
      ? "New — reputation not yet established"
      : `Participation reputation ${score} out of 100`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`${accessibleValue}. Open details.`}
        >
          <ProfileSignal
            accent="text-forge-teal"
            label="Participation"
            value={displayValue}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-80 border-white/8 bg-ink p-4"
      >
        <ReputationPopoverContent isSelf={isSelf} summary={summary} />
      </PopoverContent>
    </Popover>
  );
}

function ReputationPopoverContent({
  isSelf,
  summary,
}: {
  isSelf: boolean;
  summary: ReputationSummary;
}) {
  const score =
    summary.displayScore === null ? null : Math.round(summary.displayScore);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-semibold text-sm text-white">
          Participation reputation
        </p>
        <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
          This reflects eligible plan follow-through. It is not a safety check,
          identity verification, character judgment, or compatibility
          prediction.
        </p>
      </div>

      <div className="rounded-lg bg-white/5 px-3 py-2.5">
        <p className="text-slate-muted text-xs">
          {score === null
            ? "New — reputation not yet established"
            : "Current score"}
        </p>
        {score !== null ? (
          <p className="mt-0.5 font-bold text-forge-teal text-lg tabular-nums">
            {score} / 100
          </p>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <ReputationFact
          label="Evidence"
          value={formatEvidenceState(summary.evidenceState)}
        />
        <ReputationFact
          label="Eligible plans"
          value={String(summary.eligiblePlanCount)}
        />
        <ReputationFact
          label="Different people"
          value={String(summary.distinctCounterpartyCount)}
        />
        <ReputationFact
          label="Updated"
          value={formatUpdatedAt(summary.updatedAt)}
        />
      </dl>

      <div className="border-white/6 border-t pt-3 text-slate-muted text-xs leading-relaxed">
        <p>Calculation version: {summary.calculationVersion}</p>
        {isSelf ? (
          <a
            className="mt-2 inline-flex min-h-9 items-center font-semibold text-forge-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal"
            href="/settings?tab=privacy"
          >
            {summary.hasOpenCorrection
              ? "Correction under review"
              : "Review or request a correction"}
          </a>
        ) : (
          <p className="mt-2">
            Scores update only after enough eligible plans and different people
            contribute delayed evidence.
          </p>
        )}
      </div>
    </div>
  );
}

function ReputationFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-white">{value}</dd>
    </div>
  );
}

function formatEvidenceState(state: ReputationSummary["evidenceState"]) {
  switch (state) {
    case "ESTABLISHED":
      return "Established history";
    case "LIMITED":
      return "Limited history";
    case "NEW":
      return "Not established";
  }

  return "Not established";
}

function formatUpdatedAt(value: string | null) {
  if (!value) return "Not yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not yet";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
