import { ShieldOff, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

import { CoverageDeclarationForm } from "@/features/admin/components/admin-pilot-coverage-controls/coverage-declaration-form";
import type {
  AdminPilotCoverageControlsProps,
  Coverage,
} from "@/features/admin/components/admin-pilot-coverage-controls/types";
import { StatusPill } from "@/shared/components/ui/status-pill";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function AdminPilotCoverageControls({
  commandsEnabled,
  coverage,
  eligibleOperators,
  onCommandError,
  onUpdated,
}: AdminPilotCoverageControlsProps) {
  return (
    <section
      aria-labelledby="pilot-coverage-heading"
      className="border-border border-t pt-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
          <UsersRound className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id="pilot-coverage-heading"
            className="font-semibold text-base text-ink"
          >
            Operations coverage
          </h2>
          <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            Name a primary and backup operator to handle safety cases, appeals,
            and urgent incidents during this window.
          </p>
        </div>
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
        <div className="mt-5 flex items-start gap-3 border-border border-t py-5">
          <ShieldOff
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="grid gap-1">
            <h3 className="font-semibold text-ink text-sm">
              Two operators are required
            </h3>
            <p className="max-w-2xl text-slate-muted text-sm leading-relaxed">
              Coverage cannot be declared until the server lists at least two
              eligible active operator accounts.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function CurrentCoverage({ coverage }: { coverage: Coverage }) {
  return (
    <div className="mt-5 border-border border-t">
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <h3 className="font-semibold text-ink text-sm">Current declaration</h3>
        <CoverageStatus status={coverage.status} />
      </div>
      {coverage.declarationId ? (
        <dl className="grid gap-x-8 border-border border-t sm:grid-cols-2">
          <CoverageFact label="Primary operator">
            <OperatorDuty
              operator={coverage.primaryOperator}
              ready={coverage.primaryOperatorReady}
            />
          </CoverageFact>
          <CoverageFact label="Backup operator">
            <OperatorDuty
              operator={coverage.backupOperator}
              ready={coverage.backupOperatorReady}
            />
          </CoverageFact>
          <CoverageFact label="Starts">
            {coverage.startsAt ? (
              <AdminDateTime value={coverage.startsAt} />
            ) : (
              "—"
            )}
          </CoverageFact>
          <CoverageFact label="Ends">
            {coverage.endsAt ? <AdminDateTime value={coverage.endsAt} /> : "—"}
          </CoverageFact>
        </dl>
      ) : (
        <p className="border-border border-t py-4 text-slate-muted text-sm">
          No operations coverage window is recorded.
        </p>
      )}
    </div>
  );
}

function CoverageFact({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 border-border border-b py-3">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="min-w-0 text-right font-semibold text-ink text-sm">
        {children}
      </dd>
    </div>
  );
}

function OperatorDuty({
  operator,
  ready,
}: {
  operator: Coverage["primaryOperator"];
  ready: boolean;
}) {
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      <span>{operator?.displayName ?? "Unavailable"}</span>
      <StatusPill size="xs" surface="soft" tone={ready ? "teal" : "amber"}>
        {ready ? "Available" : "Unavailable"}
      </StatusPill>
    </span>
  );
}

function CoverageStatus({ status }: { status: Coverage["status"] }) {
  const presentation = {
    ACTIVE: { label: "Active", tone: "teal" },
    EXPIRED: { label: "Ended", tone: "amber" },
    MISSING: { label: "Not set", tone: "neutral" },
    NOT_ACTIVE: { label: "Scheduled", tone: "neutral" },
  } as const;
  const current = presentation[status];

  return (
    <StatusPill size="sm" surface="soft" tone={current.tone}>
      {current.label}
    </StatusPill>
  );
}

function AdminDateTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>{DATE_TIME_FORMATTER.format(new Date(value))}</time>
  );
}
