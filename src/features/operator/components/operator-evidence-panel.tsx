import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, FileLock2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OperatorApi } from "@/features/operator/api/operator.api";
import { operatorQueries } from "@/features/operator/api/operator-queries";
import { OperatorPanel } from "@/features/operator/components/operator-case-panels";
import {
  formatOperatorDate,
  humanizeCode,
  isChildSafetyCase,
} from "@/features/operator/lib/operator-language";
import type {
  OperatorEvidenceMetadata,
  RevealedEvidence,
  RevealedMediaEvidence,
} from "@/features/operator/schemas/operator.schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function OperatorEvidencePanel({
  caseId,
  commandsEnabled,
  mandatoryHumanReasons,
  onCommandError,
  policyLabels,
  reportCategories,
}: {
  caseId: string;
  commandsEnabled: boolean;
  mandatoryHumanReasons: string[];
  onCommandError: (error: unknown) => void;
  policyLabels: string[];
  reportCategories: string[];
}) {
  const query = useQuery(operatorQueries.evidence(caseId));
  const childSafety = isChildSafetyCase(
    policyLabels,
    reportCategories,
    mandatoryHumanReasons,
  );

  return (
    <OperatorPanel title="Evidence metadata">
      <p className="text-slate-muted text-sm leading-relaxed">
        Evidence stays metadata-only until an audited reveal succeeds. Clean,
        preserved image attachments can be previewed outside child-safety cases.
      </p>
      {query.isLoading ? (
        <div className="grid gap-2">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : query.isError ? (
        <div className="grid gap-2">
          <p className="text-destructive text-sm" role="alert">
            Evidence metadata could not be loaded.
          </p>
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => void query.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : query.data?.length ? (
        <ul className="grid gap-3">
          {query.data.map((evidence) => (
            <EvidenceItem
              key={evidence.id}
              caseId={caseId}
              childSafety={childSafety}
              commandsEnabled={commandsEnabled}
              evidence={evidence}
              onCommandError={onCommandError}
            />
          ))}
        </ul>
      ) : (
        <p className="text-slate-muted text-sm">
          No evidence metadata returned.
        </p>
      )}
    </OperatorPanel>
  );
}

function EvidenceItem({
  caseId,
  childSafety,
  commandsEnabled,
  evidence,
  onCommandError,
}: {
  caseId: string;
  childSafety: boolean;
  commandsEnabled: boolean;
  evidence: OperatorEvidenceMetadata;
  onCommandError: (error: unknown) => void;
}) {
  const [reasonCode, setReasonCode] = useState("CASE_REVIEW");
  const revealedEvidenceRef = useRef<HTMLElement>(null);
  const revealButtonRef = useRef<HTMLButtonElement>(null);
  const restoreRevealFocusRef = useRef(false);
  const mutation = useMutation<RevealedEvidence | RevealedMediaEvidence>({
    mutationKey: [
      "admin",
      "operator",
      "moderation",
      "evidence-reveal",
      evidence.id,
    ],
    gcTime: 0,
    mutationFn: () =>
      evidence.sourceType === "ATTACHMENT"
        ? OperatorApi.revealMediaEvidence({
            caseId,
            evidenceId: evidence.id,
            reasonCode,
          })
        : OperatorApi.revealEvidence({
            caseId,
            evidenceId: evidence.id,
            childSafety,
            reasonCode,
          }),
    onError: onCommandError,
  });
  useEffect(() => {
    if (mutation.data) {
      revealedEvidenceRef.current?.focus();
      return;
    }
    if (!restoreRevealFocusRef.current) return;

    restoreRevealFocusRef.current = false;
    revealButtonRef.current?.focus();
  }, [mutation.data]);

  const canReveal =
    evidence.preservationState === "PRESERVED" &&
    (evidence.sourceType !== "ATTACHMENT" ||
      (!childSafety &&
        evidence.attachmentType === "IMAGE" &&
        evidence.scanState === "CLEAN")) &&
    /^[A-Z][A-Z0-9_]{2,63}$/u.test(reasonCode);
  const attachmentUnavailable =
    evidence.sourceType === "ATTACHMENT" &&
    (childSafety ||
      evidence.attachmentType !== "IMAGE" ||
      evidence.scanState !== "CLEAN");

  return (
    <li className="grid gap-3 rounded-xl bg-muted/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="grid gap-1">
          <p className="flex items-center gap-2 font-semibold text-ink text-sm">
            <FileLock2 className="size-4" aria-hidden="true" />
            {humanizeCode(evidence.sourceType)} · {evidence.sourceId}
          </p>
          <p className="text-slate-muted text-xs">
            {humanizeCode(evidence.preservationState)} · {evidence.sensitivity}
          </p>
          <p className="text-slate-muted text-xs">
            Preserved {formatOperatorDate(evidence.preservedAt)} · retained
            until {formatOperatorDate(evidence.retentionUntil)}
          </p>
        </div>
        {mutation.data ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              restoreRevealFocusRef.current = true;
              mutation.reset();
            }}
          >
            <EyeOff className="size-4" aria-hidden="true" />
            Hide revealed evidence
          </Button>
        ) : null}
      </div>

      {mutation.data ? (
        <section
          ref={revealedEvidenceRef}
          tabIndex={-1}
          aria-label="Revealed evidence"
          className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isRevealedMediaEvidence(mutation.data) ? (
            <RevealedMedia value={mutation.data} />
          ) : (
            <RevealedText value={mutation.data} />
          )}
        </section>
      ) : attachmentUnavailable ? (
        <p className="text-slate-muted text-sm">
          {getAttachmentUnavailableMessage(evidence, childSafety)}
        </p>
      ) : (
        <div className="sm:main-action-grid grid gap-2 sm:items-end">
          <label
            htmlFor={`reveal-reason-${evidence.id}`}
            className="grid gap-1.5 font-semibold text-ink text-sm"
          >
            Audit reason code
            <Input
              id={`reveal-reason-${evidence.id}`}
              disabled={!commandsEnabled || mutation.isPending}
              value={reasonCode}
              maxLength={64}
              spellCheck={false}
              onChange={(event) =>
                setReasonCode(event.target.value.toUpperCase())
              }
            />
          </label>
          <Button
            ref={revealButtonRef}
            variant="outline"
            disabled={!commandsEnabled || !canReveal || mutation.isPending}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <Eye className="size-4" aria-hidden="true" />
            {evidence.sourceType === "ATTACHMENT"
              ? "Reveal attachment"
              : "Reveal text"}
          </Button>
        </div>
      )}
      {mutation.isError ? (
        <p className="text-destructive text-sm" role="alert">
          The reveal did not complete. Check your role, sign in again if asked,
          then try again.
        </p>
      ) : null}
    </li>
  );
}

function getAttachmentUnavailableMessage(
  evidence: OperatorEvidenceMetadata,
  childSafety: boolean,
) {
  if (childSafety) {
    return "Attachment previews stay unavailable in child-safety cases.";
  }
  if (evidence.attachmentType !== "IMAGE") {
    return "Only image attachments can be previewed here.";
  }
  return `Attachment preview is unavailable while its scan state is ${humanizeCode(
    evidence.scanState,
  ).toLowerCase()}.`;
}

function isRevealedMediaEvidence(
  value: RevealedEvidence | RevealedMediaEvidence,
): value is RevealedMediaEvidence {
  return "dataUrl" in value;
}

function RevealedMedia({ value }: { value: RevealedMediaEvidence }) {
  return (
    <div className="grid gap-3 rounded-xl border border-accent/30 bg-card p-4">
      <div className="grid gap-1">
        <p className="font-semibold text-ink text-sm">Revealed attachment</p>
        <p className="text-slate-muted text-xs">
          {value.width} × {value.height} ·{" "}
          {new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 1,
          }).format(value.byteLength / 1024)}{" "}
          KB
        </p>
      </div>
      <img
        src={value.dataUrl}
        alt="Revealed attachment evidence"
        width={value.width}
        height={value.height}
        className="max-h-96 w-full rounded-xl object-contain"
      />
    </div>
  );
}

function RevealedText({ value }: { value: RevealedEvidence }) {
  return (
    <div className="grid gap-4 rounded-xl border border-accent/30 bg-card p-4">
      <div className="grid gap-1">
        <p className="font-semibold text-ink text-sm">Revealed text</p>
        <p className="text-slate-muted text-xs">
          Captured {formatOperatorDate(value.capturedAt)} ·{" "}
          {humanizeCode(value.targetType)}
        </p>
      </div>
      <EvidenceFields value={value.target} />
      {value.reporterNarrative ? (
        <div className="grid gap-1 rounded-xl bg-muted/45 p-3">
          <h4 className="font-semibold text-slate-muted text-xs">
            Reporter's account
          </h4>
          <p className="wrap-break-word whitespace-pre-wrap text-ink text-sm leading-relaxed">
            {value.reporterNarrative}
          </p>
        </div>
      ) : null}
      {value.context.length ? (
        <div className="grid gap-3">
          <h4 className="font-semibold text-slate-muted text-xs">Context</h4>
          {value.context.map((entry) => (
            <EvidenceFields
              key={String(entry.id ?? JSON.stringify(entry))}
              value={entry}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EvidenceFields({
  value,
}: {
  value: Record<string, boolean | number | string | null>;
}) {
  return (
    <dl className="grid gap-2 rounded-xl bg-muted/45 p-3">
      {Object.entries(value).map(([label, content]) => (
        <div key={label} className="grid gap-0.5">
          <dt className="font-semibold text-slate-muted text-xs">
            {humanizeCode(label)}
          </dt>
          <dd className="wrap-break-word whitespace-pre-wrap text-ink text-sm">
            {content === null ? "Not available" : String(content)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
