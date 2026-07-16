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
          disabled={!isOnline || isBusy || isPublished || isLegacyResult}
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
        <Button
          variant="outline"
          disabled={!isOnline || isBusy || isResultPrivate}
          loading={activeAction === "keep-private"}
          onClick={onKeepPrivate}
        >
          <EyeOff size={16} strokeWidth={2} />
          {isResultPrivate ? "Kept private" : "Keep private"}
        </Button>
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
          disabled={isBusy}
          loading={activeAction === "retake"}
          onClick={onRetake}
        >
          <RefreshCcw size={16} strokeWidth={2} />
          Retake
        </Button>
        {hasDraft ? (
          <Button
            variant="destructive"
            size="sm"
            disabled={isBusy}
            loading={activeAction === "discard"}
            onClick={onDiscard}
          >
            <Trash2 size={16} strokeWidth={2} />
            Discard draft
          </Button>
        ) : null}
      </div>

      <ActionDialog
        cancelLabel="Keep result"
        confirmLabel="Delete all"
        description="This removes every saved personality result and stops using it for group formation. You cannot undo it."
        disabled={isBusy}
        loading={activeAction === "delete-all"}
        onConfirm={onDeleteAll}
        title="Delete all personality data?"
        tone="danger"
        trigger={
          <Button
            variant="destructive"
            size="sm"
            disabled={isBusy}
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
