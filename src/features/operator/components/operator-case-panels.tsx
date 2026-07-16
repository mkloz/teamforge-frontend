import type { ReactNode } from "react";
import {
  formatOperatorDate,
  humanizeCode,
  SEVERITY_LABELS,
} from "@/features/operator/lib/operator-language";
import type { OperatorCaseDetail } from "@/features/operator/schemas/operator.schemas";

export function CaseOverview({ item }: { item: OperatorCaseDetail }) {
  return (
    <OperatorPanel title="Case overview">
      <dl className="grid gap-3 sm:grid-cols-2">
        <Fact
          label="Severity"
          value={item.severity ? SEVERITY_LABELS[item.severity] : "Pending"}
        />
        <Fact label="Status" value={humanizeCode(item.status)} />
        <Fact
          label="Evidence completeness"
          value={humanizeCode(item.evidenceCompleteness)}
        />
        <Fact label="Uncertainty" value={humanizeCode(item.uncertainty)} />
        <Fact label="Reports" value={String(item.reportCount)} />
        <Fact label="Due" value={formatOperatorDate(item.dueAt)} />
      </dl>
      <TokenList title="Policy labels" values={item.policyLabels} />
      <TokenList
        title="Human review reasons"
        values={item.mandatoryHumanReasons}
      />
    </OperatorPanel>
  );
}

export function DecisionChronology({ item }: { item: OperatorCaseDetail }) {
  return (
    <OperatorPanel title="Decision chronology">
      {item.decisions.length ? (
        <ol className="grid gap-3">
          {item.decisions.map((decision) => (
            <li
              key={decision.id}
              className="grid gap-1 border-border border-b pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold text-ink text-sm">
                  {decision.sequence}. {humanizeCode(decision.kind)}
                </span>
                <time className="text-slate-muted text-xs">
                  {formatOperatorDate(decision.createdAt)}
                </time>
              </div>
              <p className="text-slate-muted text-sm">
                {humanizeCode(decision.previousCaseStatus)} →{" "}
                {humanizeCode(decision.nextCaseStatus)}
              </p>
              <p className="text-slate-muted text-xs">
                {humanizeCode(decision.actorType)} · policy{" "}
                {decision.policyVersion}
              </p>
              {decision.policyCodes.length ? (
                <TokenList
                  title="Policy codes"
                  values={decision.policyCodes}
                  compact
                />
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyText>No decisions recorded.</EmptyText>
      )}
    </OperatorPanel>
  );
}

export function ReportsPanel({ item }: { item: OperatorCaseDetail }) {
  return (
    <OperatorPanel title="Linked reports">
      {item.reports.length ? (
        <ul className="grid gap-3">
          {item.reports.map(({ linkedAt, report }) => (
            <li key={report.id} className="rounded-xl bg-muted/45 p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold text-ink text-sm">
                  {report.referenceCode}
                </span>
                <span className="text-slate-muted text-xs">
                  {humanizeCode(report.publicStatus)}
                </span>
              </div>
              <p className="mt-1 text-slate-muted text-xs">
                {humanizeCode(report.category)} ·{" "}
                {humanizeCode(report.targetType)}
                {report.immediateSafety ? " · Immediate safety concern" : ""}
              </p>
              <p className="mt-1 text-slate-muted text-xs">
                Submitted {formatOperatorDate(report.submittedAt)} · linked{" "}
                {formatOperatorDate(linkedAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyText>No reports linked.</EmptyText>
      )}
    </OperatorPanel>
  );
}

export function EnforcementHistory({ item }: { item: OperatorCaseDetail }) {
  return (
    <OperatorPanel title="Account action history">
      {item.enforcementActions.length ? (
        <ul className="grid gap-3">
          {item.enforcementActions.map((action) => (
            <li key={action.id} className="rounded-xl bg-muted/45 p-3 text-sm">
              <p className="font-semibold text-ink">
                {humanizeCode(action.actionType)}
              </p>
              <p className="text-slate-muted text-xs">
                {humanizeCode(action.state)} · {humanizeCode(action.scope)}
              </p>
              <p className="mt-1 text-slate-muted text-xs">
                Starts {formatOperatorDate(action.startsAt)} · ends{" "}
                {formatOperatorDate(action.expiresAt)}
              </p>
              {action.reversedAt ? (
                <p className="mt-1 text-slate-muted text-xs">
                  Reversed {formatOperatorDate(action.reversedAt)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyText>No account actions recorded.</EmptyText>
      )}
    </OperatorPanel>
  );
}

export function ContainmentHistory({ item }: { item: OperatorCaseDetail }) {
  return (
    <OperatorPanel title="Containment history">
      {item.protectiveContainments.length ? (
        <ul className="grid gap-3">
          {item.protectiveContainments.map((containment) => (
            <li
              key={containment.id}
              className="rounded-xl bg-muted/45 p-3 text-sm"
            >
              <p className="font-semibold text-ink">
                {humanizeCode(containment.scope)}
              </p>
              <p className="text-slate-muted text-xs">
                {humanizeCode(containment.state)} · review{" "}
                {formatOperatorDate(containment.mandatoryReviewAt)}
              </p>
              <p className="mt-1 text-slate-muted text-xs">
                Started {formatOperatorDate(containment.startedAt)} · hard end{" "}
                {formatOperatorDate(containment.hardExpiresAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyText>No containments recorded.</EmptyText>
      )}
    </OperatorPanel>
  );
}

export function AssignmentsPanel({ item }: { item: OperatorCaseDetail }) {
  return (
    <OperatorPanel title="Assignments">
      {item.operatorAssignments.length ? (
        <ul className="grid gap-2 text-sm">
          {item.operatorAssignments.map((assignment) => (
            <li key={assignment.id} className="rounded-xl bg-muted/45 p-3">
              <p className="font-semibold text-ink">
                Operator {assignment.operatorAccountId}
              </p>
              <p className="text-slate-muted text-xs">
                Assigned {formatOperatorDate(assignment.assignedAt)} · expires{" "}
                {formatOperatorDate(assignment.expiresAt)}
              </p>
              {assignment.revokedAt ? (
                <p className="text-slate-muted text-xs">
                  Revoked {formatOperatorDate(assignment.revokedAt)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyText>No assignments returned.</EmptyText>
      )}
    </OperatorPanel>
  );
}

export function ReviewsPanel({ item }: { item: OperatorCaseDetail }) {
  const reviews = [
    ...item.appeals.map((appeal) => ({
      id: appeal.id,
      label: "Appeal",
      status: appeal.status,
      receivedAt: appeal.receivedAt,
    })),
    ...item.outcomeReviewRequests.map((review) => ({
      id: review.id,
      label: "Outcome review",
      status: review.status,
      receivedAt: review.receivedAt,
    })),
  ];
  return (
    <OperatorPanel title="Reviews">
      {reviews.length ? (
        <ul className="grid gap-2 text-sm">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl bg-muted/45 p-3">
              <p className="font-semibold text-ink">{review.label}</p>
              <p className="text-slate-muted text-xs">
                {humanizeCode(review.status)} · received{" "}
                {formatOperatorDate(review.receivedAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyText>No appeals or outcome reviews.</EmptyText>
      )}
    </OperatorPanel>
  );
}

export function OperatorPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-bold text-ink text-lg">{title}</h2>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="text-ink text-sm">{value}</dd>
    </div>
  );
}

function TokenList({
  title,
  values,
  compact = false,
}: {
  title: string;
  values: string[];
  compact?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <h3 className="font-semibold text-slate-muted text-xs">{title}</h3>
      {values.length ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <span
              key={value}
              className={
                compact
                  ? "rounded-full bg-muted px-2 py-0.5 text-slate-muted text-xs"
                  : "rounded-full bg-primary/9 px-2.5 py-1 font-semibold text-primary text-xs"
              }
            >
              {humanizeCode(value)}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-slate-muted text-sm">None returned</span>
      )}
    </div>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="text-slate-muted text-sm leading-relaxed">{children}</p>;
}
