import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

import {
  ADMIN_PILOT_OPERATIONS_QUERY_KEY,
  AdminPilotOperationsApi,
} from "@/features/admin/api/admin-pilot-operations.api";
import type { AdminPilotCoverageControlsProps } from "@/features/admin/components/admin-pilot-coverage-controls/types";
import {
  declareAdminPilotOperationsCoverageSchema,
  PILOT_OPERATIONS_REQUIRED_COVERAGE_SCOPES,
} from "@/features/admin/schemas/admin-pilot-operations.schema";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

type EligibleOperator =
  AdminPilotCoverageControlsProps["eligibleOperators"][number];
type CoverageField = "backup" | "endsAt" | "form" | "primary" | "startsAt";
type CoverageFieldErrors = Partial<Record<CoverageField, string>>;

export function CoverageDeclarationForm({
  commandsEnabled,
  coverage,
  eligibleOperators,
  onCommandError,
  onUpdated,
}: AdminPilotCoverageControlsProps) {
  const queryClient = useQueryClient();
  const initialWindow = createDefaultCoverageWindow();
  const [primaryOperatorId, setPrimaryOperatorId] = useState(
    eligibleOperatorId(coverage.primaryOperator?.id, eligibleOperators),
  );
  const [backupOperatorId, setBackupOperatorId] = useState(
    eligibleOperatorId(coverage.backupOperator?.id, eligibleOperators),
  );
  const [startsAt, setStartsAt] = useState(initialWindow.startsAt);
  const [endsAt, setEndsAt] = useState(initialWindow.endsAt);
  const [fieldErrors, setFieldErrors] = useState<CoverageFieldErrors>({});
  const [revokeOpen, setRevokeOpen] = useState(false);
  const declarationCommand = useRef<{
    fingerprint: string;
    idempotencyKey: string;
  } | null>(null);
  const revocationKey = useRef<string | null>(null);
  const declarationId = coverage.declarationId;
  const rowVersion = coverage.rowVersion;
  const declareMutation = useMutation({
    mutationKey: [...ADMIN_PILOT_OPERATIONS_QUERY_KEY, "declare-coverage"],
    mutationFn: (
      input: Parameters<typeof AdminPilotOperationsApi.declareCoverage>[0],
    ) => AdminPilotOperationsApi.declareCoverage(input),
    onError: onCommandError,
    onSuccess: async () => {
      declarationCommand.current = null;
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PILOT_OPERATIONS_QUERY_KEY,
      });
      onUpdated("Operations coverage was updated.");
    },
  });
  const revokeMutation = useMutation({
    mutationKey: [...ADMIN_PILOT_OPERATIONS_QUERY_KEY, "revoke-coverage"],
    mutationFn: (input: {
      declarationId: string;
      expectedRowVersion: number;
      idempotencyKey: string;
    }) =>
      AdminPilotOperationsApi.revokeCoverage(input.declarationId, {
        expectedRowVersion: input.expectedRowVersion,
        idempotencyKey: input.idempotencyKey,
        reasonCode: "PILOT_COVERAGE_REVOKED",
      }),
    onError: onCommandError,
    onSuccess: async () => {
      revocationKey.current = null;
      setRevokeOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PILOT_OPERATIONS_QUERY_KEY,
      });
      onUpdated("Operations coverage was ended.");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    declareMutation.reset();
    const startIso = localDateTimeToIso(startsAt);
    const endIso = localDateTimeToIso(endsAt);
    const nextErrors: CoverageFieldErrors = {};

    if (!primaryOperatorId) nextErrors.primary = "Choose a primary operator.";
    if (!backupOperatorId) nextErrors.backup = "Choose a backup operator.";
    if (!startIso) nextErrors.startsAt = "Choose a valid start date and time.";
    if (!endIso) nextErrors.endsAt = "Choose a valid end date and time.";
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const commandWithoutKey = {
      backupOperatorAccountId: backupOperatorId,
      endsAt: endIso,
      expectedCurrentDeclarationId: coverage.declarationId,
      expectedCurrentRowVersion: coverage.rowVersion,
      primaryOperatorAccountId: primaryOperatorId,
      reasonCode: "SHIFT_HANDOFF_CONFIRMED",
      scopes: [...PILOT_OPERATIONS_REQUIRED_COVERAGE_SCOPES],
      startsAt: startIso,
    };
    const fingerprint = JSON.stringify(commandWithoutKey);
    if (declarationCommand.current?.fingerprint !== fingerprint) {
      declarationCommand.current = {
        fingerprint,
        idempotencyKey: globalThis.crypto.randomUUID(),
      };
    }
    const parsed = declareAdminPilotOperationsCoverageSchema.safeParse({
      ...commandWithoutKey,
      idempotencyKey: declarationCommand.current.idempotencyKey,
    });

    if (!parsed.success) {
      setFieldErrors(mapCoverageIssues(parsed.error.issues));
      return;
    }

    setFieldErrors({});
    declareMutation.mutate(parsed.data);
  };

  const updatePrimary = (value: string) => {
    setPrimaryOperatorId(value);
    if (backupOperatorId === value) setBackupOperatorId("");
    setFieldErrors((current) => ({ ...current, primary: undefined }));
  };
  const updateBackup = (value: string) => {
    setBackupOperatorId(value);
    if (primaryOperatorId === value) setPrimaryOperatorId("");
    setFieldErrors((current) => ({ ...current, backup: undefined }));
  };

  return (
    <div className="mt-6">
      <div className="grid gap-1">
        <h3 className="font-semibold text-ink text-sm">
          {coverage.declarationId
            ? "Replace coverage window"
            : "Declare coverage window"}
        </h3>
        <p className="max-w-2xl text-slate-muted text-sm leading-relaxed">
          Pair two eligible operators with a shift of up to 24 hours.
        </p>
      </div>

      <form
        className="mt-5 grid gap-6 rounded-2xl bg-card p-5 sm:p-6"
        onSubmit={handleSubmit}
        noValidate
      >
        <fieldset className="grid gap-4">
          <legend className="mb-3 font-semibold text-ink text-sm">
            Coverage team
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <OperatorSelectField
              error={fieldErrors.primary}
              id="pilot-primary-operator"
              label="Primary operator"
              operators={eligibleOperators}
              unavailableOperatorId={backupOperatorId}
              value={primaryOperatorId}
              onValueChange={updatePrimary}
            />
            <OperatorSelectField
              error={fieldErrors.backup}
              id="pilot-backup-operator"
              label="Backup operator"
              operators={eligibleOperators}
              unavailableOperatorId={primaryOperatorId}
              value={backupOperatorId}
              onValueChange={updateBackup}
            />
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-3 font-semibold text-ink text-sm">
            Shift window
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <DateTimeField
              error={fieldErrors.startsAt}
              id="pilot-coverage-start"
              label="Starts"
              value={startsAt}
              onChange={setStartsAt}
            />
            <DateTimeField
              error={fieldErrors.endsAt}
              id="pilot-coverage-end"
              label="Ends"
              value={endsAt}
              onChange={setEndsAt}
            />
          </div>
          <div className="grid grid-cols-[auto_minmax(2rem,1fr)_auto] items-center gap-3 text-slate-muted text-xs">
            <span>Handoff</span>
            <span className="h-1 rounded-full bg-primary/35" />
            <span>Up to 24h</span>
          </div>
        </fieldset>

        {fieldErrors.form || declareMutation.error ? (
          <p className="text-destructive text-sm" role="alert">
            {fieldErrors.form ?? coverageErrorMessage(declareMutation.error)}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            disabled={!commandsEnabled || declareMutation.isPending}
          >
            <CalendarClock className="size-4" aria-hidden="true" />
            {declareMutation.isPending
              ? "Saving coverage…"
              : coverage.declarationId
                ? "Replace coverage"
                : "Declare coverage"}
          </Button>

          {declarationId && rowVersion ? (
            <AlertDialog
              open={revokeOpen}
              onOpenChange={(open) => {
                if (!revokeMutation.isPending) {
                  if (!open) {
                    revocationKey.current = null;
                    revokeMutation.reset();
                  }
                  setRevokeOpen(open);
                }
              }}
            >
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!commandsEnabled || revokeMutation.isPending}
                >
                  End coverage
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End this coverage window?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Pilot operations will remain blocked until another valid
                    primary and backup coverage window is declared.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {revokeMutation.error ? (
                  <p className="text-destructive text-sm" role="alert">
                    {coverageErrorMessage(revokeMutation.error)}
                  </p>
                ) : null}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={revokeMutation.isPending}>
                    Keep coverage
                  </AlertDialogCancel>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={revokeMutation.isPending}
                    onClick={() => {
                      revocationKey.current ??= globalThis.crypto.randomUUID();
                      revokeMutation.mutate({
                        declarationId,
                        expectedRowVersion: rowVersion,
                        idempotencyKey: revocationKey.current,
                      });
                    }}
                  >
                    {revokeMutation.isPending ? "Ending…" : "End coverage"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function OperatorSelectField({
  error,
  id,
  label,
  onValueChange,
  operators,
  unavailableOperatorId,
  value,
}: {
  error?: string;
  id: string;
  label: string;
  onValueChange: (value: string) => void;
  operators: EligibleOperator[];
  unavailableOperatorId: string;
  value: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <Label id={`${id}-label`}>{label}</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          aria-labelledby={`${id}-label`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
        >
          <SelectValue placeholder={`Choose ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {operators.map((operator) => (
            <SelectItem
              key={operator.id}
              value={operator.id}
              disabled={operator.id === unavailableOperatorId}
            >
              {operator.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p id={errorId} className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DateTimeField({
  error,
  id,
  label,
  onChange,
  value,
}: {
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="datetime-local"
        step={60}
        value={value}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function eligibleOperatorId(
  id: string | undefined,
  eligibleOperators: EligibleOperator[],
) {
  return id && eligibleOperators.some((operator) => operator.id === id)
    ? id
    : "";
}

function createDefaultCoverageWindow() {
  const start = new Date();
  start.setSeconds(0, 0);
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15);
  const end = new Date(start.getTime() + 8 * 60 * 60 * 1_000);

  return {
    endsAt: formatLocalDateTime(end),
    startsAt: formatLocalDateTime(start),
  };
}

function formatLocalDateTime(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function localDateTimeToIso(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mapCoverageIssues(
  issues: ReadonlyArray<{ message: string; path: PropertyKey[] }>,
): CoverageFieldErrors {
  const errors: CoverageFieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (field === "primaryOperatorAccountId") errors.primary ??= issue.message;
    else if (field === "backupOperatorAccountId")
      errors.backup ??= issue.message;
    else if (field === "startsAt") errors.startsAt ??= issue.message;
    else if (field === "endsAt") errors.endsAt ??= issue.message;
    else errors.form ??= issue.message;
  }

  return errors;
}

export function coverageErrorMessage(error: unknown) {
  return getApiErrorMessage(
    error,
    "Coverage could not be changed. Refresh and try again.",
    {
      badRequestMessage:
        "The server rejected this coverage window or operator selection.",
      conflictMessage:
        "Coverage changed on the server. Refresh before trying again.",
      forbiddenMessage: "Recent owner administrator verification is required.",
    },
  );
}
