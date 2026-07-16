import { ArrowRight, Check, RefreshCcw, Trash2 } from "lucide-react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";

type ResultAction = "publish" | "discard" | "delete-all" | "retake";

interface PersonalityResultActionsProps {
  actionsAvailable: boolean;
  activeAction: ResultAction | null;
  canContinue: boolean;
  continueLabel: string;
  error: string | null;
  hasDraft: boolean;
  isOnline: boolean;
  isLegacyResult: boolean;
  isSaved: boolean;
  onContinue: () => void;
  onDiscard: () => void;
  onDeleteAll: () => void;
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
  isOnline,
  isLegacyResult,
  isSaved,
  onContinue,
  onDiscard,
  onDeleteAll,
  onSave,
  onRetake,
  publishBlocked,
  publishBlockedReason,
  retakeBlocked,
  retakeBlockedReason,
}: PersonalityResultActionsProps) {
  const isBusy = activeAction !== null;

  return (
    <section className="mt-auto flex flex-col gap-4 border-border/70 border-t pt-6">
      <div className="grid gap-3">
        <Button
          disabled={
            !isOnline ||
            !actionsAvailable ||
            isBusy ||
            isSaved ||
            isLegacyResult ||
            publishBlocked
          }
          title={publishBlockedReason ?? undefined}
          loading={activeAction === "publish"}
          onClick={onSave}
        >
          <Check size={16} strokeWidth={2} />
          {isSaved
            ? "Saved to profile"
            : isLegacyResult
              ? "New assessment required"
              : "Use this result"}
        </Button>
      </div>

      <Button disabled={!canContinue || isBusy} onClick={onContinue}>
        <span className="truncate">{continueLabel}</span>
        <ArrowRight size={18} className="shrink-0" />
      </Button>

      {!canContinue ? (
        <p className="text-center text-muted-foreground text-xs leading-relaxed">
          Save this result before continuing.
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

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="ghost"
          size="sm"
          disabled={isBusy || hasDraft || retakeBlocked}
          title={
            hasDraft
              ? "Discard this draft before starting another assessment."
              : (retakeBlockedReason ?? undefined)
          }
          loading={activeAction === "retake"}
          onClick={onRetake}
        >
          <RefreshCcw size={16} strokeWidth={2} />
          Retake
        </Button>
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
      </div>

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
            disabled={!isOnline || !actionsAvailable || isBusy}
            className="self-center"
          >
            <Trash2 size={16} strokeWidth={2} />
            Delete all assessment data
          </Button>
        }
      />
    </section>
  );
}
