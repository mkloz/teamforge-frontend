import { Check, ChevronRight, UserPlus } from "lucide-react";

import {
  AutomaticGroupFormationButton,
  ManualGroupFormationButton,
  PrimaryButton,
  RevisePlanButton,
} from "@/features/plan-creation/components/plan-creation-buttons";
import { isRecentActivityTemplateId } from "@/features/plan-creation/lib/recent-activity/recent-activity-template-id";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import {
  getStep1ContinueLabel,
  getStep6ContinueLabel,
  getStep7InviteLabel,
} from "./footer-action-labels";
import { FooterActionMotion } from "./footer-action-motion";
import type { PlanBuilderFooterChildProps } from "./types";

interface Step1FooterActionProps extends PlanBuilderFooterChildProps {
  continuePulse: boolean;
  onDisabledStep1Continue: () => void;
}

export function Step1FooterAction({
  continuePulse,
  fw,
  onDisabledStep1Continue,
}: Step1FooterActionProps) {
  return (
    <FooterActionMotion
      motionKey="s1"
      isPulsing={continuePulse}
      onPointerDown={!fw.canAdvanceStep1 ? onDisabledStep1Continue : undefined}
    >
      <PrimaryButton
        label={getStep1ContinueLabel(Boolean(fw.selectedActivity))}
        icon={<ChevronRight size={16} />}
        onClick={() => {
          if (isRecentActivityTemplateId(fw.appliedTemplateId)) {
            fw.goToStep(3);
            return;
          }

          fw.goNext();
        }}
        disabled={!fw.canAdvanceStep1}
      />
    </FooterActionMotion>
  );
}

export function Step2FooterAction({ fw }: PlanBuilderFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s2">
      <PrimaryButton
        label="Continue to scope and plan"
        icon={<ChevronRight size={16} />}
        onClick={fw.goNext}
      />
    </FooterActionMotion>
  );
}

export function Step3FooterAction({ fw }: PlanBuilderFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s3">
      <PrimaryButton
        label={
          fw.groupFormationMode === "AUTO"
            ? "Review request"
            : "Continue to group setup"
        }
        icon={<ChevronRight size={16} />}
        onClick={fw.goNext}
        disabled={!fw.canAdvanceStep2}
      />
    </FooterActionMotion>
  );
}

export function Step4FooterAction({ fw }: PlanBuilderFooterChildProps) {
  const isOnline = useNetworkStatus();

  return (
    <FooterActionMotion motionKey="s4">
      {fw.groupFormationMode === "MANUAL" ? (
        <ManualGroupFormationButton
          onClick={fw.handleManualGroupFormation}
          disabled={!isOnline}
        />
      ) : (
        <AutomaticGroupFormationButton
          onClick={fw.handleAutomaticGroupFormation}
          disabled={!isOnline}
          label={getAutomaticGroupFormationActionLabel(fw)}
        />
      )}
      {!isOnline ? (
        <PlanBuilderFooterOfflineNotice
          message={
            fw.groupFormationMode === "AUTO"
              ? "Reconnect before starting this request."
              : "Reconnect before forming a group."
          }
        />
      ) : null}
    </FooterActionMotion>
  );
}

function getAutomaticGroupFormationActionLabel(
  fw: PlanBuilderFooterChildProps["fw"],
) {
  if (!fw.automaticGroupFormationRequestId) return "Start search";
  if (fw.automaticGroupFormationRequestLifecycle === "DRAFT")
    return "Save and start search";
  if (fw.automaticGroupFormationRequestLifecycle === "PAUSED")
    return "Save and resume";
  return "Save changes";
}

export function Step5SuccessFooterAction({ fw }: PlanBuilderFooterChildProps) {
  const participantCount =
    fw.activeParticipants.length + fw.manualInviteeIds.length + 1;

  return (
    <FooterActionMotion motionKey="s5s">
      <PrimaryButton
        label={
          fw.isApplyingParticipantSelection
            ? "Updating group…"
            : `Continue with ${participantCount} ${participantCount === 1 ? "person" : "people"}`
        }
        icon={<ChevronRight size={16} />}
        onClick={() => void fw.handleContinueFromSuccess()}
        disabled={fw.isApplyingParticipantSelection}
      />
    </FooterActionMotion>
  );
}

export function Step5SearchingFooterAction({
  fw,
}: PlanBuilderFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s5-searching">
      <PrimaryButton
        label="Done"
        icon={<Check size={18} />}
        onClick={fw.close}
      />
    </FooterActionMotion>
  );
}

export function Step5FailedFooterAction({ fw }: PlanBuilderFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s5f">
      <RevisePlanButton onClick={fw.handleRevisePlan} />
    </FooterActionMotion>
  );
}

export function Step6FooterAction({ fw }: PlanBuilderFooterChildProps) {
  const isOnline = useNetworkStatus();

  return (
    <FooterActionMotion motionKey="s6">
      <PrimaryButton
        label={getStep6ContinueLabel(Boolean(fw.coverImage))}
        icon={<ChevronRight size={16} />}
        onClick={() => void fw.handleSaveIdentityAndContinue()}
        disabled={!isOnline || fw.isSavingIdentity}
      />
      {!isOnline ? (
        <PlanBuilderFooterOfflineNotice message="Reconnect before saving group details." />
      ) : null}
    </FooterActionMotion>
  );
}

export function Step7FooterAction({ fw }: PlanBuilderFooterChildProps) {
  const isOnline = useNetworkStatus();

  return (
    <FooterActionMotion motionKey="s7" className="w-full">
      {!fw.invitesSent ? (
        <PrimaryButton
          label={getStep7InviteLabel({
            hasManualInvitees: fw.manualInviteeIds.length > 0,
            isSendingInvites: fw.isSendingInvites,
          })}
          icon={<UserPlus size={16} />}
          onClick={() => void fw.handleSendInvites()}
          disabled={!isOnline || fw.isSendingInvites}
        />
      ) : (
        <PrimaryButton
          label="Open the group workspace"
          icon={<Check size={18} />}
          onClick={() => void fw.handleEnterGroupHub()}
        />
      )}
      {!isOnline && !fw.invitesSent ? (
        <PlanBuilderFooterOfflineNotice message="Reconnect before sending invites." />
      ) : null}
    </FooterActionMotion>
  );
}

function PlanBuilderFooterOfflineNotice({ message }: { message: string }) {
  return (
    <OfflineNotice
      size="xs"
      iconClassName="mt-0"
      iconSizeClassName="size-3.5"
      className="mt-3 justify-center border-0 bg-transparent p-0 text-center text-brand-amber"
      contentClassName="flex-none font-medium"
    >
      {message}
    </OfflineNotice>
  );
}
