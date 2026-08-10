import {
  ArrowRight,
  Check,
  LockKeyhole,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type ResultAction =
  | "publish"
  | "keep-private"
  | "discard"
  | "delete-all"
  | "retake";

interface PersonalityResultActionsProps {
  actionsAvailable: boolean;
  activeAction: ResultAction | null;
  canContinue: boolean;
  continueLabel: string;
  error: string | null;
  hasDraft: boolean;
  isAcceptedPrivately: boolean;
  isOnline: boolean;
  isLegacyResult: boolean;
  isSaved: boolean;
  onContinue: () => void;
  onDiscard: () => void;
  onDeleteAll: () => void;
  onKeepPrivate: () => void;
  onSave: () => void;
  onRetake: () => void;
  publishBlocked: boolean;
  publishBlockedReason: string | null;
  retakeBlocked: boolean;
  retakeBlockedReason: string | null;
}

export function PersonalityResultActions({
  actionsAvailable,
  activeAction,
  canContinue,
  continueLabel,
  error,
  hasDraft,
  isAcceptedPrivately,
  isOnline,
  isLegacyResult,
  isSaved,
  onContinue,
  onDiscard,
  onDeleteAll,
  onKeepPrivate,
  onSave,
  onRetake,
  publishBlocked,
  publishBlockedReason,
  retakeBlocked,
  retakeBlockedReason,
}: PersonalityResultActionsProps) {
  const isBusy = activeAction !== null;

  return (
    <section className="mt-auto flex flex-col gap-5 border-border/70 border-t pt-6">
      {isSaved ? (
        <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
          <div
            className="inline-flex min-w-0 items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 font-semibold text-foreground text-sm"
            role="status"
          >
            <Check
              size={15}
              className="shrink-0"
              strokeWidth={2.25}
              aria-hidden="true"
            />
            <span className="truncate">Saved to profile</span>
          </div>
          <DeleteAssessmentDataAction
            actionsAvailable={actionsAvailable}
            activeAction={activeAction}
            isBusy={isBusy}
            isOnline={isOnline}
            onDeleteAll={onDeleteAll}
            compactOnMobile
          />
        </div>
      ) : isAcceptedPrivately ? (
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex min-w-0 items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 font-semibold text-foreground text-sm"
            role="status"
          >
            <LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Used privately</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={
              !isOnline ||
              !actionsAvailable ||
              isBusy ||
              isLegacyResult ||
              publishBlocked
            }
            title={publishBlockedReason ?? undefined}
            loading={activeAction === "publish"}
            onClick={onSave}
          >
            Add to profile
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            disabled={
              !isOnline ||
              !actionsAvailable ||
              isBusy ||
              isLegacyResult ||
              publishBlocked
            }
            title={publishBlockedReason ?? undefined}
            loading={activeAction === "keep-private"}
            onClick={onKeepPrivate}
          >
            <LockKeyhole size={16} strokeWidth={2} />
            {isLegacyResult ? "New assessment required" : "Use privately"}
          </Button>
          <Button
            variant="outline"
            disabled={
              !isOnline ||
              !actionsAvailable ||
              isBusy ||
              isLegacyResult ||
              publishBlocked
            }
            title={publishBlockedReason ?? undefined}
            loading={activeAction === "publish"}
            onClick={onSave}
          >
            Add to profile
          </Button>
        </div>
      )}

      <div className="main-action-grid grid gap-3">
        <Button disabled={!canContinue || isBusy} onClick={onContinue}>
          <span className="truncate">{continueLabel}</span>
          <ArrowRight size={18} className="shrink-0" />
        </Button>
        <Button
          variant="outline"
          disabled={isBusy || hasDraft || retakeBlocked}
          title={
            hasDraft
              ? "Discard this draft before starting another assessment."
              : (retakeBlockedReason ?? undefined)
          }
          loading={activeAction === "retake"}
          onClick={onRetake}
          className="min-w-28 sm:min-w-32"
        >
          <RefreshCcw size={16} strokeWidth={2} />
          Retake
        </Button>
      </div>

      {!canContinue ? (
        <p className="text-center text-muted-foreground text-xs leading-relaxed">
          Choose how to use this result before continuing.
        </p>
      ) : null}

      {!isOnline ? (
        <p className="text-center text-muted-foreground text-xs leading-relaxed">
          You can review this result offline. Reconnect before changing or
          deleting saved personality data.
        </p>
      ) : null}

      {error ? (
        <p
          className="text-center text-destructive text-xs leading-relaxed"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {hasDraft || !isSaved ? (
        <div className="flex flex-col gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center">
          {hasDraft ? (
            <ActionDialog
              cancelLabel="Keep draft"
              confirmLabel="Discard draft"
              description="This removes the draft. Your previous saved result stays unchanged."
              disabled={!isOnline || !actionsAvailable || isBusy}
              loading={activeAction === "discard"}
              onConfirm={onDiscard}
              title="Discard this draft?"
              tone="danger"
              trigger={
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!isOnline || !actionsAvailable || isBusy}
                >
                  <Trash2 size={16} strokeWidth={2} />
                  Discard draft
                </Button>
              }
            />
          ) : null}

          {!isSaved ? (
            <DeleteAssessmentDataAction
              actionsAvailable={actionsAvailable}
              activeAction={activeAction}
              isBusy={isBusy}
              isOnline={isOnline}
              onDeleteAll={onDeleteAll}
              className="w-full sm:ml-auto sm:w-auto"
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function DeleteAssessmentDataAction({
  actionsAvailable,
  activeAction,
  className,
  compactOnMobile = false,
  isBusy,
  isOnline,
  onDeleteAll,
}: {
  actionsAvailable: boolean;
  activeAction: ResultAction | null;
  className?: string;
  compactOnMobile?: boolean;
  isBusy: boolean;
  isOnline: boolean;
  onDeleteAll: () => void;
}) {
  return (
    <ActionDialog
      cancelLabel="Keep result"
      confirmLabel="Delete all"
      description="This removes every saved personality result from your profile and group formation. It does not delete your other account data. You cannot undo this."
      disabled={!isOnline || !actionsAvailable || isBusy}
      loading={activeAction === "delete-all"}
      onConfirm={onDeleteAll}
      title="Delete all personality data?"
      tone="danger"
      trigger={
        <Button
          variant="destructive"
          size="sm"
          aria-label="Delete all assessment data"
          disabled={!isOnline || !actionsAvailable || isBusy}
          className={cn(
            compactOnMobile && "size-9 shrink-0 px-0 sm:h-9 sm:w-auto sm:px-4",
            className,
          )}
        >
          <Trash2 size={16} strokeWidth={2} />
          <span className={cn(compactOnMobile && "sr-only sm:not-sr-only")}>
            Delete all assessment data
          </span>
        </Button>
      }
    />
  );
}
