import { Check, Undo2, X } from "lucide-react";
import { useState } from "react";

import type { ForgeProposalActionContext } from "@/features/forge-proposals/components/forge-proposal-review";
import {
  type ForgeProposalDecisionErrorKind,
  useForgeProposalDecisions,
} from "@/features/forge-proposals/hooks/use-forge-proposal-decisions";
import type {
  ForgeProposalDecisionReceipt,
  ForgeProposalDeclineReason,
} from "@/features/forge-proposals/lib/forge-proposal-contract";
import { forgeProposalDeclineReasonSchema } from "@/features/forge-proposals/lib/forge-proposal-contract";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";

interface ForgeProposalDecisionActionsProps {
  context: ForgeProposalActionContext;
  onDecisionSaved: (receipt: ForgeProposalDecisionReceipt) => void;
  onTerminalState: (state: "expired" | "unavailable") => void;
}

interface DeclineReasonOption {
  label: string;
  value: ForgeProposalDeclineReason;
}

const sharedDeclineReasons: DeclineReasonOption[] = [
  { label: "The activity isn't for me", value: "ACTIVITY_NOT_FOR_ME" },
  { label: "Not this group", value: "NOT_THIS_GROUP" },
  { label: "I'm taking a break", value: "TAKING_A_BREAK" },
  { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
];

export function ForgeProposalDecisionActions({
  context,
  onDecisionSaved,
  onTerminalState,
}: ForgeProposalDecisionActionsProps) {
  const decisions = useForgeProposalDecisions({ onTerminalState });

  if (
    context.proposalState !== "OPEN" ||
    context.viewerDisposition !== "ACTIVE"
  ) {
    return null;
  }

  const decisionContext = {
    policyVersion: context.policyVersion,
    proposalId: context.proposalId,
    proposalVersion: context.proposalVersion,
    seatDecisionRevision: context.viewerDecisionRevision,
  };
  const isBusy = decisions.activeAction !== null;

  if (decisions.error?.kind === "stale") {
    return (
      <div className="grid w-full gap-3" role="alert">
        <p className="text-muted-foreground text-sm">
          {decisions.error.message}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => void decisions.refreshProposal(context.proposalId)}
        >
          Refresh proposal
        </Button>
      </div>
    );
  }

  if (context.viewerDecision === "ACCEPTED") {
    return (
      <div className="grid w-full gap-3">
        <WithdrawAction
          disabled={!decisions.isOnline || isBusy}
          error={decisions.error?.message ?? null}
          isOnline={decisions.isOnline}
          loading={decisions.activeAction === "withdraw"}
          onWithdraw={async () => {
            const receipt = await decisions.submitDecision({
              ...decisionContext,
              action: "withdraw",
            });

            if (receipt) onDecisionSaved(receipt);
            return Boolean(receipt);
          }}
        />
        <DecisionMessage
          error={decisions.error}
          isOnline={decisions.isOnline}
        />
      </div>
    );
  }

  if (context.viewerDecision !== "PENDING") {
    return null;
  }

  return (
    <div className="grid w-full gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          disabled={!decisions.isOnline || isBusy}
          loading={decisions.activeAction === "accept"}
          onClick={async () => {
            const receipt = await decisions.submitDecision({
              ...decisionContext,
              action: "accept",
            });

            if (receipt) onDecisionSaved(receipt);
          }}
        >
          <Check className="size-4" aria-hidden="true" />
          Accept group
        </Button>
        <DeclineAction
          context={context}
          disabled={!decisions.isOnline || isBusy}
          error={decisions.error?.message ?? null}
          isOnline={decisions.isOnline}
          loading={decisions.activeAction === "decline"}
          onDecline={async (reason) => {
            const receipt = await decisions.submitDecision({
              ...decisionContext,
              action: "decline",
              reason,
            });

            if (receipt) onDecisionSaved(receipt);
            return Boolean(receipt);
          }}
        />
      </div>
      <DecisionMessage error={decisions.error} isOnline={decisions.isOnline} />
    </div>
  );
}

function DeclineAction({
  context,
  disabled,
  error,
  isOnline,
  loading,
  onDecline,
}: {
  context: ForgeProposalActionContext;
  disabled: boolean;
  error: string | null;
  isOnline: boolean;
  loading: boolean;
  onDecline: (reason?: ForgeProposalDeclineReason) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ForgeProposalDeclineReason>();
  const reasons = getDeclineReasons(context);

  return (
    <ActionDialog
      open={open}
      onOpenChange={setOpen}
      closeOnConfirm={false}
      disabled={disabled}
      loading={loading}
      tone="info"
      eyebrow="Your response"
      title="Choose not to join this group?"
      description="You won't join this proposal. The other people in the proposal won't see your reason."
      cancelLabel="Keep reviewing"
      confirmLabel="Not this group"
      confirmVariant="outline"
      contentClassName="rounded-2xl"
      onConfirm={async () => {
        if (await onDecline(reason)) setOpen(false);
      }}
      trigger={
        <Button variant="outline" disabled={disabled}>
          <X className="size-4" aria-hidden="true" />
          Not this group
        </Button>
      }
    >
      <fieldset>
        <legend className="font-semibold text-foreground text-sm">
          Tell us why (optional)
        </legend>
        <RadioGroup
          className="mt-3 gap-2"
          value={reason}
          onValueChange={(value) => {
            const parsed = forgeProposalDeclineReasonSchema.safeParse(value);
            if (parsed.success) setReason(parsed.data);
          }}
        >
          {reasons.map((option) => (
            <label
              key={option.value}
              htmlFor={`proposal-decline-${option.value}`}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-foreground text-sm transition-colors hover:bg-muted/60"
            >
              <RadioGroupItem
                id={`proposal-decline-${option.value}`}
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>
      {error ? (
        <p className="mt-3 text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : !isOnline ? (
        <p className="mt-3 text-muted-foreground text-sm" role="status">
          Reconnect before responding.
        </p>
      ) : null}
    </ActionDialog>
  );
}

function WithdrawAction({
  disabled,
  error,
  isOnline,
  loading,
  onWithdraw,
}: {
  disabled: boolean;
  error: string | null;
  isOnline: boolean;
  loading: boolean;
  onWithdraw: () => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <ActionDialog
      open={open}
      onOpenChange={setOpen}
      closeOnConfirm={false}
      disabled={disabled}
      loading={loading}
      tone="warning"
      eyebrow="Before the group forms"
      title="Withdraw your response?"
      description="You won't join this proposal. Your response stays private."
      cancelLabel="Keep my response"
      confirmLabel="Withdraw"
      confirmVariant="outline"
      contentClassName="rounded-2xl"
      onConfirm={async () => {
        if (await onWithdraw()) setOpen(false);
      }}
      trigger={
        <Button variant="outline" disabled={disabled}>
          <Undo2 className="size-4" aria-hidden="true" />
          Withdraw
        </Button>
      }
    >
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : !isOnline ? (
        <p className="text-muted-foreground text-sm" role="status">
          Reconnect before responding.
        </p>
      ) : null}
    </ActionDialog>
  );
}

function DecisionMessage({
  error,
  isOnline,
}: {
  error: { kind: ForgeProposalDecisionErrorKind; message: string } | null;
  isOnline: boolean;
}) {
  if (error) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {error.message}
      </p>
    );
  }

  return isOnline ? null : (
    <p className="text-muted-foreground text-sm" role="status">
      Reconnect before responding.
    </p>
  );
}

function getDeclineReasons(context: ForgeProposalActionContext) {
  const reasons = [...sharedDeclineReasons];

  if (context.scheduleMode === "FIXED") {
    reasons.splice(1, 0, {
      label: "The time doesn't work",
      value: "FIXED_TIME_DOES_NOT_WORK",
    });
  }

  if (context.scope === "LOCAL") {
    const insertionIndex = context.scheduleMode === "FIXED" ? 2 : 1;
    reasons.splice(insertionIndex, 0, {
      label: "The area doesn't work",
      value: "AREA_DOES_NOT_WORK",
    });
  }

  return reasons;
}
