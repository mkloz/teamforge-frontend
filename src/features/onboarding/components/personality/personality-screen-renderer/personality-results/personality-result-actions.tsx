import { ArrowRight, Eye, EyeOff, RefreshCcw, Trash2 } from "lucide-react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";

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
  isOnline: boolean;
  isLegacyResult: boolean;
  isPublished: boolean;
  isResultPrivate: boolean;
  onContinue: () => void;
  onDiscard: () => void;
  onDeleteAll: () => void;
  onKeepPrivate: () => void;
  onPublish: () => void;
  onRetake: () => void;
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
  isPublished,
  isResultPrivate,
  onContinue,
  onDiscard,
  onDeleteAll,
  onKeepPrivate,
  onPublish,
  onRetake,
}: PersonalityResultActionsProps) {
  const isBusy = activeAction !== null;

  return (
    <section className="mt-auto flex flex-col gap-4 border-border/70 border-t pt-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          disabled={
            !isOnline ||
            !actionsAvailable ||
            isBusy ||
            isPublished ||
            isLegacyResult
          }
          loading={activeAction === "publish"}
          onClick={onPublish}
        >
          <Eye size={16} strokeWidth={2} />
          {isPublished
            ? "Published"
            : isLegacyResult
              ? "New assessment required"
              : "Publish result"}
        </Button>
        <ActionDialog
          cancelLabel="Go back"
          confirmLabel="Keep private"
          description={
            isPublished
              ? "This withdraws the result from group formation. TeamForge will stop showing or using it in the published contexts listed above."
              : "This saves the result for you without using or showing it in group formation."
          }
          disabled={!isOnline || !actionsAvailable || isBusy || isResultPrivate}
          loading={activeAction === "keep-private"}
          onConfirm={onKeepPrivate}
          title="Keep this result private?"
          trigger={
            <Button
              variant="outline"
              disabled={
                !isOnline || !actionsAvailable || isBusy || isResultPrivate
              }
              loading={activeAction === "keep-private"}
            >
              <EyeOff size={16} strokeWidth={2} />
              {isResultPrivate ? "Kept private" : "Keep private"}
            </Button>
          }
        />
      </div>

      <Button disabled={!canContinue || isBusy} onClick={onContinue}>
        <span className="truncate">{continueLabel}</span>
        <ArrowRight size={18} className="shrink-0" />
      </Button>

      {!canContinue ? (
        <p className="text-center text-muted-foreground text-xs leading-relaxed">
          Choose Publish result or Keep private before continuing.
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
          disabled={isBusy || hasDraft}
          title={
            hasDraft
              ? "Discard this draft before starting another assessment."
              : undefined
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
            description="This removes the unpublished draft. Your previous saved result and publication choice stay unchanged."
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
        description="This removes every saved personality result and withdraws it from group formation. It does not delete your other account data. You cannot undo this."
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
