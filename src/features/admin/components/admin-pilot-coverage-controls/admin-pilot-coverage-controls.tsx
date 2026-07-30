import { CalendarOff, UserRoundCheck, UsersRound } from "lucide-react";

import { CoverageDeclarationForm } from "@/features/admin/components/admin-pilot-coverage-controls/coverage-declaration-form";
import type {
  AdminPilotCoverageControlsProps,
  Coverage,
} from "@/features/admin/components/admin-pilot-coverage-controls/types";
import { cn } from "@/shared/lib/utils";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const COVERAGE_SEGMENTS = [
  "segment-1",
  "segment-2",
  "segment-3",
  "segment-4",
  "segment-5",
  "segment-6",
  "segment-7",
  "segment-8",
] as const;

export function AdminPilotCoverageControls({
  commandsEnabled,
  coverage,
  eligibleOperators,
  onCommandError,
  onUpdated,
}: AdminPilotCoverageControlsProps) {
  return (
    <section aria-labelledby="pilot-coverage-heading" className="pt-2">
      <div className="grid gap-1">
        <h2
          id="pilot-coverage-heading"
          className="flex items-center gap-2 font-semibold text-base text-ink"
        >
          <UsersRound className="size-4 shrink-0" aria-hidden="true" />
          Operations coverage
        </h2>
        <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          Assign a primary and backup operator for safety cases, appeals, and
          urgent incidents.
        </p>
      </div>

      <CurrentCoverage coverage={coverage} />

      {eligibleOperators.length >= 2 ? (
        <CoverageDeclarationForm
          key={`${coverage.declarationId ?? "missing"}:${coverage.rowVersion ?? 0}`}
          commandsEnabled={commandsEnabled}
          coverage={coverage}
          eligibleOperators={eligibleOperators}
          onCommandError={onCommandError}
          onUpdated={onUpdated}
        />
      ) : (
        <div className="mt-5 grid gap-1 rounded-xl border border-border border-dashed px-5 py-6">
          <h3 className="font-semibold text-ink text-sm">
            Two operators are required
          </h3>
          <p className="max-w-2xl text-slate-muted text-sm leading-relaxed">
            Coverage cannot be declared until the server lists at least two
            eligible active operator accounts.
          </p>
        </div>
      )}
    </section>
  );
}

function CurrentCoverage({ coverage }: { coverage: Coverage }) {
  const hasDeclaration = Boolean(coverage.declarationId);

  return (
    <div className="mt-5 grid gap-6 rounded-2xl bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-slate-muted text-xs">Current rota</p>
          <h3 className="mt-1 font-semibold text-ink text-lg">
            {hasDeclaration ? "Coverage window" : "No coverage scheduled"}
          </h3>
        </div>
        <CoverageStatus status={coverage.status} />
      </div>

      {hasDeclaration ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <OperatorDuty
              label="Primary"
              operator={coverage.primaryOperator}
              ready={coverage.primaryOperatorReady}
            />
            <OperatorDuty
              label="Backup"
              operator={coverage.backupOperator}
              ready={coverage.backupOperatorReady}
            />
          </div>

          <div className="grid gap-3">
            <div className="grid grid-cols-[auto_minmax(2rem,1fr)_auto] items-center gap-3">
              <span className="size-2.5 rounded-full bg-primary" />
              <span className="h-1 rounded-full bg-primary/60" />
              <span className="size-2.5 rounded-full bg-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <p className="text-slate-muted">
                Starts
                <span className="mt-1 block font-semibold text-ink">
                  {coverage.startsAt ? (
                    <AdminDateTime value={coverage.startsAt} />
                  ) : (
                    "—"
                  )}
                </span>
              </p>
              <p className="text-right text-slate-muted">
                Ends
                <span className="mt-1 block font-semibold text-ink">
                  {coverage.endsAt ? (
                    <AdminDateTime value={coverage.endsAt} />
                  ) : (
                    "—"
                  )}
                </span>
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-8 gap-1.5" aria-hidden="true">
            {COVERAGE_SEGMENTS.map((segment) => (
              <span key={segment} className="h-2 rounded-full bg-accent/25" />
            ))}
          </div>
          <div className="flex items-start gap-3">
            <CalendarOff
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
              Pilot actions stay blocked until two operators cover a declared
              window.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function OperatorDuty({
  label,
  operator,
  ready,
}: {
  label: string;
  operator: Coverage["primaryOperator"];
  ready: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <UserRoundCheck
        className={cn(
          "mt-0.5 size-4 shrink-0",
          ready ? "text-primary" : "text-accent",
        )}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-slate-muted text-xs">{label}</p>
        <p className="mt-0.5 truncate font-semibold text-ink text-sm">
          {operator?.displayName ?? "Unavailable"}
        </p>
        <p
          className={cn(
            "mt-1 font-medium text-xs",
            ready ? "text-primary" : "text-accent",
          )}
        >
          {ready ? "Available" : "Unavailable"}
        </p>
      </div>
    </div>
  );
}

function CoverageStatus({ status }: { status: Coverage["status"] }) {
  const presentation = {
    ACTIVE: { label: "Active", tone: "teal" },
    EXPIRED: { label: "Ended", tone: "amber" },
    MISSING: { label: "Uncovered", tone: "amber" },
    NOT_ACTIVE: { label: "Scheduled", tone: "neutral" },
  } as const;
  const current = presentation[status];

  return (
    <p
      className={cn(
        "flex items-center gap-2 font-semibold text-sm",
        current.tone === "teal"
          ? "text-primary"
          : current.tone === "amber"
            ? "text-accent"
            : "text-slate-muted",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          current.tone === "teal"
            ? "bg-primary"
            : current.tone === "amber"
              ? "bg-accent"
              : "bg-slate-muted",
        )}
        aria-hidden="true"
      />
      {current.label}
    </p>
  );
}

function AdminDateTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>{DATE_TIME_FORMATTER.format(new Date(value))}</time>
  );
}
