import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import type { RefObject } from "react";
import { REPORT_STATUS_LABELS } from "@/features/reporting/lib/report-options";
import type { ReportReceipt as ReportReceiptData } from "@/features/reporting/schemas/report.schemas";
import { Button } from "@/shared/components/ui/button";
import { buildSafetyReportNavigation } from "@/shared/navigation/safety-navigation";

export function ReportReceipt({
  actionNotices,
  headingRef,
  onDone,
  receipt,
}: {
  actionNotices: string[];
  headingRef: RefObject<HTMLHeadingElement | null>;
  onDone: () => void;
  receipt: ReportReceiptData;
}) {
  return (
    <div className="flex flex-col gap-6 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forge-teal/12 text-forge-teal">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-bold text-ink text-xl outline-none"
          >
            Report received
          </h2>
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            Keep the reference code in case you need to contact TeamForge about
            this report.
          </p>
        </div>
      </div>

      <dl className="grid gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <ReceiptRow label="Reference" value={receipt.referenceCode} />
        <ReceiptRow
          label="Status"
          value={REPORT_STATUS_LABELS[receipt.status]}
        />
        <ReceiptRow
          label="Sent"
          value={new Date(receipt.submittedAt).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        />
        {receipt.blockStatus !== "NOT_REQUESTED" ? (
          <ReceiptRow
            label="Block action"
            value={getActionStatusLabel(receipt.blockStatus)}
          />
        ) : null}
        {receipt.leaveStatus !== "NOT_REQUESTED" ? (
          <ReceiptRow
            label="Leave action"
            value={getActionStatusLabel(receipt.leaveStatus)}
          />
        ) : null}
      </dl>

      <p className="text-slate-muted text-sm leading-relaxed">
        TeamForge will review the report. We may ask for more information, but
        we cannot promise a particular outcome.
      </p>

      {actionNotices.length > 0 ? (
        <ul className="grid gap-2 text-ink text-sm" aria-label="Other actions">
          {actionNotices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link {...buildSafetyReportNavigation(receipt.id)}>View report</Link>
        </Button>
        <Button type="button" onClick={onDone} className="w-full sm:w-auto">
          Done
        </Button>
      </div>
    </div>
  );
}

function getActionStatusLabel(status: string) {
  return (
    {
      BLOCKED: "Blocked",
      FAILED: "Could not complete",
      LEFT: "Left group",
      NOT_APPLICABLE: "Not available for this report",
    }[status] ?? status
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
      <dt className="font-semibold text-slate-muted">{label}</dt>
      <dd className="wrap-break-word font-medium text-ink">{value}</dd>
    </div>
  );
}
