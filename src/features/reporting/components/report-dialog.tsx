import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Info, ShieldAlert } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  FormProvider,
  type UseFormRegisterReturn,
  useForm,
  useFormContext,
} from "react-hook-form";
import { submitReport } from "@/features/reporting/api/reporting.api";
import { ReportReceipt } from "@/features/reporting/components/report-receipt";
import {
  getSafetyGuidance,
  type SafetyGuidanceItem,
} from "@/features/reporting/data/uk-safety-guidance.v1";
import {
  REPORT_CATEGORY_OPTIONS,
  type ReportTarget,
  URGENT_REPORT_CATEGORIES,
} from "@/features/reporting/lib/report-options";
import {
  type ReportReceipt as ReportReceiptData,
  type ReportSubmission,
  type ReportTargetType,
  reportSubmissionSchema,
} from "@/features/reporting/schemas/report.schemas";
import {
  type ReportFormValues,
  reportFormSchema,
} from "@/features/reporting/schemas/report-form.schema";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";

type IndependentAction = () => Promise<unknown>;

export interface ReportDialogProps {
  canRequestBlock?: boolean;
  canRequestLeave?: boolean;
  evidenceSummary?: string;
  onBlock?: IndependentAction;
  onLeave?: IndependentAction;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  targets: readonly ReportTarget[];
  trigger?: ReactNode;
}

const DEFAULT_VALUES: ReportFormValues = {
  targetKey: "",
  category: null,
  description: "",
  immediateSafety: false,
  blockRequested: false,
  leaveRequested: false,
};

export function ReportDialog({
  canRequestBlock = false,
  canRequestLeave = false,
  evidenceSummary,
  onBlock,
  onLeave,
  onOpenChange,
  open,
  targets,
  trigger,
}: ReportDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [receipt, setReceipt] = useState<ReportReceiptData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionNotices, setActionNotices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionRef = useRef<{
    fingerprint: string;
    idempotencyKey: string;
  } | null>(null);
  const completedActionsRef = useRef(new Set<IndependentActionKind>());
  const draftSessionRef = useRef(0);
  const submitLockRef = useRef(false);
  const receiptHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const isControlled = open !== undefined;
  const dialogOpen = open ?? internalOpen;
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      targetKey: getTargetKey(targets[0]),
    },
  });
  const category = form.watch("category") ?? undefined;
  const immediateSafety = form.watch("immediateSafety");
  const guidance = getSafetyGuidance(category, immediateSafety);

  useEffect(() => {
    if (receipt) {
      receiptHeadingRef.current?.focus();
    }
  }, [receipt]);

  function resetDraft() {
    draftSessionRef.current += 1;
    form.reset({
      ...DEFAULT_VALUES,
      targetKey: getTargetKey(targets[0]),
    });
    submissionRef.current = null;
    completedActionsRef.current.clear();
    submitLockRef.current = false;
    setIsSubmitting(false);
    setReceipt(null);
    setSubmitError(null);
    setActionNotices([]);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && submitLockRef.current) {
      return;
    }

    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    if (!nextOpen) {
      resetDraft();
    }
    onOpenChange?.(nextOpen);
  }

  async function quickExit() {
    resetDraft();
    handleOpenChange(false);
    await navigate({ to: "/home", replace: true });
  }

  async function handleSubmit(values: ReportFormValues) {
    if (submitLockRef.current) return;

    if (!isOnline) {
      setSubmitError("Report not sent—reconnect to submit.");
      return;
    }

    const target = targets.find(
      (candidate) => getTargetKey(candidate) === values.targetKey,
    );
    if (!target || !values.category) return;

    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    setActionNotices([]);
    const draftSession = draftSessionRef.current;
    const payload = reportSubmissionSchema.parse({
      targetType: target.type,
      targetId: target.id,
      category: values.category,
      description: values.description.trim() || undefined,
      immediateSafety:
        values.immediateSafety || URGENT_REPORT_CATEGORIES.has(values.category),
      selectedRelatedMessageIds: target.relatedMessageIds,
      blockRequested: values.blockRequested,
      leaveRequested: values.leaveRequested,
    });
    const reportPromise = submitReport(payload, getIdempotencyKey(payload));
    const reportResult = await settlePromise(reportPromise);
    if (draftSessionRef.current !== draftSession) return;

    const independentActions = getIndependentActions({
      onBlock,
      onLeave,
      receipt:
        reportResult.status === "fulfilled" ? reportResult.value.data : null,
      values,
    });
    const independentResults = await Promise.allSettled(
      independentActions.map(runIndependentAction),
    );
    if (draftSessionRef.current !== draftSession) return;

    const notices = getIndependentActionNotices(
      independentActions,
      independentResults,
    );
    setActionNotices(notices);
    submitLockRef.current = false;
    setIsSubmitting(false);

    if (reportResult.status === "rejected") {
      setSubmitError(
        notices.length > 0
          ? `Report not sent. ${notices.join(" ")}`
          : "We couldn't send this report. Check your connection and try again.",
      );
      return;
    }

    setReceipt(
      applyIndependentActionResults(
        reportResult.value.data,
        independentActions,
        independentResults,
      ),
    );

    function getIdempotencyKey(submission: ReportSubmission) {
      const fingerprint = JSON.stringify(submission);
      if (submissionRef.current?.fingerprint !== fingerprint) {
        submissionRef.current = {
          fingerprint,
          idempotencyKey: crypto.randomUUID(),
        };
      }
      return submissionRef.current.idempotencyKey;
    }

    async function runIndependentAction(action: PendingIndependentAction) {
      if (completedActionsRef.current.has(action.kind)) return;
      await action.run();
      completedActionsRef.current.add(action.kind);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl bg-canvas p-0 sm:max-h-[92dvh] sm:w-full">
        {receipt ? (
          <ReportReceipt
            actionNotices={actionNotices}
            headingRef={receiptHeadingRef}
            receipt={receipt}
            onDone={() => handleOpenChange(false)}
          />
        ) : (
          <FormProvider {...form}>
            <form
              className="flex min-h-0 flex-col"
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
            >
              <ReportFormContent
                canRequestBlock={canRequestBlock && Boolean(onBlock)}
                canRequestLeave={canRequestLeave && Boolean(onLeave)}
                evidenceSummary={evidenceSummary}
                guidance={guidance}
                isSubmitting={isSubmitting || submitLockRef.current}
                submitError={submitError}
                targets={targets}
                onQuickExit={quickExit}
              />
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReportFormContent({
  canRequestBlock,
  canRequestLeave,
  evidenceSummary,
  guidance,
  isSubmitting,
  onQuickExit,
  submitError,
  targets,
}: {
  canRequestBlock: boolean;
  canRequestLeave: boolean;
  evidenceSummary?: string;
  guidance: readonly SafetyGuidanceItem[];
  isSubmitting: boolean;
  onQuickExit: () => Promise<void>;
  submitError: string | null;
  targets: readonly ReportTarget[];
}) {
  const form = useFormContextForReport();
  const selectedTarget = targets.find(
    (target) => getTargetKey(target) === form.watch("targetKey"),
  );

  return (
    <>
      <div className="px-5 pt-5 pr-14 pb-4 sm:px-6 sm:pt-6">
        <DialogHeader className="gap-1 text-left">
          <DialogTitle className="font-black text-xl">
            Report {getSelectedTargetLabel(form.watch("targetKey"), targets)}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            Tell us what happened. Choose the closest reason and add details if
            they would help.
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="grid min-h-0 gap-5 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
        {targets.length > 1 ? <TargetField targets={targets} /> : null}
        <CategoryField />
        {guidance.length > 0 ? <SafetyGuidance guidance={guidance} /> : null}
        <DescriptionField />
        {evidenceSummary ? (
          <p className="border-primary/35 border-l-2 py-1 pl-3 text-ink text-sm leading-relaxed">
            {evidenceSummary}
          </p>
        ) : null}
        <EvidenceNotice targetType={selectedTarget?.type} />
        <RequestedActions
          canRequestBlock={canRequestBlock}
          canRequestLeave={canRequestLeave}
        />

        {submitError ? (
          <p
            role="alert"
            className="rounded-xl bg-destructive-soft p-3 text-destructive text-sm"
          >
            {submitError}
          </p>
        ) : null}

        <div className="mt-1 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => void onQuickExit()}
            className="w-full rounded-xl"
          >
            Quick exit
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full rounded-xl"
          >
            Send report
          </Button>
        </div>
      </div>
    </>
  );
}

function TargetField({ targets }: { targets: readonly ReportTarget[] }) {
  const { register } = useFormContextForReport();
  return (
    <Field className="gap-2">
      <FieldLabel
        htmlFor="report-target"
        className="font-semibold text-ink text-sm"
      >
        What are you reporting?
      </FieldLabel>
      <NativeSelect
        id="report-target"
        {...register("targetKey")}
        className="rounded-xl"
      >
        {targets.map((target) => (
          <NativeSelectOption
            key={getTargetKey(target)}
            value={getTargetKey(target)}
          >
            {target.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  );
}

function CategoryField() {
  const { register, formState } = useFormContextForReport();
  return (
    <FieldSet
      className="grid gap-3"
      aria-describedby={
        formState.errors.category ? "report-category-error" : undefined
      }
    >
      <FieldLegend className="font-semibold text-ink text-sm" variant="label">
        Primary reason
      </FieldLegend>
      <div className="grid gap-1 sm:grid-cols-2">
        {REPORT_CATEGORY_OPTIONS.map(([value, label]) => (
          <label
            key={value}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-transparent border-l-2 bg-card px-3 py-2 text-ink text-sm transition-colors hover:bg-foreground/5 has-checked:border-primary has-checked:bg-primary-soft"
          >
            <input
              {...register("category")}
              type="radio"
              value={value}
              className="size-4 accent-primary"
            />
            {label}
          </label>
        ))}
      </div>
      {formState.errors.category ? (
        <FieldError id="report-category-error">
          {formState.errors.category.message}
        </FieldError>
      ) : null}
      <CheckRow
        label="Someone may be in immediate danger"
        registration={register("immediateSafety")}
      />
    </FieldSet>
  );
}

function SafetyGuidance({
  guidance,
}: {
  guidance: readonly SafetyGuidanceItem[];
}) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-brand-amber/40 bg-accent-soft p-4"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert
          className="mt-0.5 size-5 shrink-0 text-brand-amber"
          aria-hidden="true"
        />
        <div>
          <h3 className="font-bold text-ink text-sm">
            Get help now if you need it
          </h3>
          <ul className="mt-2 grid gap-2 text-ink text-sm leading-relaxed">
            {guidance.map((item) => (
              <li key={item.text} className="grid gap-1">
                <span>{item.text}</span>
                {item.actions ? (
                  <span className="flex flex-wrap gap-x-3 gap-y-1">
                    {item.actions.map((action) => (
                      <SafetyGuidanceLink key={action.href} {...action} />
                    ))}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SafetyGuidanceLink({ href, label }: { href: string; label: string }) {
  const isExternalLink = href.startsWith("http");

  return (
    <a
      href={href}
      className="font-semibold text-foreground underline decoration-primary/40 underline-offset-2 hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      rel={isExternalLink ? "noopener noreferrer" : undefined}
      target={isExternalLink ? "_blank" : undefined}
    >
      {label}
      {isExternalLink ? (
        <span className="sr-only"> (opens in a new tab)</span>
      ) : null}
    </a>
  );
}

function DescriptionField() {
  const { register, formState } = useFormContextForReport();
  return (
    <Field
      className="gap-2"
      data-invalid={Boolean(formState.errors.description)}
    >
      <FieldLabel
        htmlFor="report-description"
        className="font-semibold text-ink text-sm"
      >
        What happened?{" "}
        <span className="font-normal text-slate-muted">Optional</span>
      </FieldLabel>
      <Textarea
        id="report-description"
        {...register("description")}
        rows={4}
        maxLength={2000}
        placeholder="Add the details that would help someone understand what happened."
        aria-invalid={Boolean(formState.errors.description)}
        aria-describedby={
          formState.errors.description ? "report-description-error" : undefined
        }
      />
      {formState.errors.description ? (
        <FieldError id="report-description-error">
          {formState.errors.description.message}
        </FieldError>
      ) : null}
    </Field>
  );
}

function EvidenceNotice({
  targetType,
}: {
  targetType: ReportTargetType | undefined;
}) {
  const message =
    targetType === "MESSAGE" || targetType === "ATTACHMENT"
      ? "Findafew preserves the item you report and a small amount of nearby context you could see: up to 5 messages before it and 2 after it."
      : targetType === "PROPOSAL_SEAT"
        ? "Findafew preserves this proposal seat and the permitted proposal details shown to you."
        : "Findafew preserves the item you report and the permitted context you could see.";

  return (
    <div className="flex items-start gap-2.5 text-slate-muted text-sm leading-relaxed">
      <Info
        className="mt-0.5 size-4 shrink-0 text-foreground"
        aria-hidden="true"
      />
      <p>{message} A receipt confirms delivery; it is not a decision.</p>
    </div>
  );
}

function RequestedActions({
  canRequestBlock,
  canRequestLeave,
}: {
  canRequestBlock: boolean;
  canRequestLeave: boolean;
}) {
  const { register } = useFormContextForReport();
  if (!canRequestBlock && !canRequestLeave) return null;
  return (
    <FieldSet className="grid gap-2">
      <FieldLegend
        className="mb-1 font-semibold text-ink text-sm"
        variant="label"
      >
        Actions you can take now
      </FieldLegend>
      {canRequestBlock ? (
        <CheckRow
          label="Block this person now"
          registration={register("blockRequested")}
        />
      ) : null}
      {canRequestLeave ? (
        <CheckRow
          label="Leave this group now"
          registration={register("leaveRequested")}
        />
      ) : null}
      <p className="text-slate-muted text-xs leading-relaxed">
        These actions run separately from your report. If the report cannot be
        sent, you can still block the person or leave the group.
      </p>
    </FieldSet>
  );
}

function CheckRow({
  label,
  registration,
}: {
  label: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-card px-3 py-2 text-ink text-sm transition-colors hover:bg-foreground/5 has-checked:bg-primary-soft">
      <input
        {...registration}
        type="checkbox"
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}

function useFormContextForReport() {
  return useFormContext<ReportFormValues>();
}

function getTargetKey(target: ReportTarget | undefined) {
  return target ? `${target.type}:${target.id}` : "";
}

function getSelectedTargetLabel(
  targetKey: string,
  targets: readonly ReportTarget[],
) {
  return (
    targets.find((target) => getTargetKey(target) === targetKey)?.label ??
    "this item"
  );
}

async function settlePromise<T>(
  promise: Promise<T>,
): Promise<PromiseSettledResult<T>> {
  try {
    return { status: "fulfilled", value: await promise };
  } catch (reason) {
    return { status: "rejected", reason };
  }
}

interface PendingIndependentAction {
  kind: IndependentActionKind;
  label: string;
  run: IndependentAction;
}

type IndependentActionKind = "block" | "leave";

function getIndependentActions({
  onBlock,
  onLeave,
  receipt,
  values,
}: {
  onBlock?: IndependentAction;
  onLeave?: IndependentAction;
  receipt: ReportReceiptData | null;
  values: ReportFormValues;
}): PendingIndependentAction[] {
  return [
    ...(values.blockRequested && onBlock && receipt?.blockStatus !== "BLOCKED"
      ? [{ kind: "block" as const, label: "Block", run: onBlock }]
      : []),
    ...(values.leaveRequested && onLeave && receipt?.leaveStatus !== "LEFT"
      ? [{ kind: "leave" as const, label: "Leave group", run: onLeave }]
      : []),
  ];
}

function getIndependentActionNotices(
  actions: PendingIndependentAction[],
  results: PromiseSettledResult<unknown>[],
) {
  return results.map((result, index) =>
    result.status === "fulfilled"
      ? `${actions[index]?.label} completed.`
      : `${actions[index]?.label} did not complete.`,
  );
}

function applyIndependentActionResults(
  receipt: ReportReceiptData,
  actions: PendingIndependentAction[],
  results: PromiseSettledResult<unknown>[],
): ReportReceiptData {
  let blockStatus = receipt.blockStatus;
  let leaveStatus = receipt.leaveStatus;
  results.forEach((result, index) => {
    if (result.status !== "fulfilled") return;
    const action = actions[index];
    if (action?.kind === "block") {
      blockStatus = "BLOCKED";
    }
    if (action?.kind === "leave") {
      leaveStatus = "LEFT";
    }
  });
  return { ...receipt, blockStatus, leaveStatus };
}
