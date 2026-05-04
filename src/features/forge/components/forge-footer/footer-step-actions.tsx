import { Check, ChevronRight, UserPlus } from "lucide-react";

import {
  AutoForgeButton,
  ManualForgeButton,
  PrimaryButton,
  ReforgeButton,
} from "@/features/forge/components/forge-buttons";

import { FooterActionMotion } from "./footer-action-motion";
import {
  getStep1ContinueLabel,
  getStep6ContinueLabel,
  getStep7InviteLabel,
} from "./footer-action-labels";
import type { ForgeFooterChildProps } from "./types";

interface Step1FooterActionProps extends ForgeFooterChildProps {
  continuePulse: boolean;
  onDisabledStep1Continue: () => void;
}

export function Step1FooterAction({
  continuePulse,
  fw,
  onDisabledStep1Continue,
}: Step1FooterActionProps) {
  const hasRecentActivitySelected =
    fw.appliedTemplateId?.startsWith("recent:") ?? false;

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
          if (hasRecentActivitySelected) {
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

export function Step2FooterAction({ fw }: ForgeFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s2">
      <PrimaryButton
        label="Start blank plan"
        icon={<ChevronRight size={16} />}
        onClick={fw.goNext}
      />
    </FooterActionMotion>
  );
}

export function Step3FooterAction({ fw }: ForgeFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s3">
      <PrimaryButton
        label="Continue to group setup"
        icon={<ChevronRight size={16} />}
        onClick={fw.goNext}
        disabled={!fw.canAdvanceStep2}
      />
    </FooterActionMotion>
  );
}

export function Step4FooterAction({ fw }: ForgeFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s4">
      {fw.forgeMode === "MANUAL" ? (
        <ManualForgeButton onClick={fw.handleManualForge} />
      ) : (
        <AutoForgeButton onClick={fw.handleAutoForge} />
      )}
    </FooterActionMotion>
  );
}

export function Step5SuccessFooterAction({ fw }: ForgeFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s5s">
      <PrimaryButton
        label="Continue to group identity"
        icon={<ChevronRight size={16} />}
        onClick={fw.goNext}
      />
    </FooterActionMotion>
  );
}

export function Step5FailedFooterAction({ fw }: ForgeFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s5f">
      <ReforgeButton onClick={fw.handleReforge} />
    </FooterActionMotion>
  );
}

export function Step6FooterAction({ fw }: ForgeFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s6">
      <PrimaryButton
        label={getStep6ContinueLabel(Boolean(fw.coverImage))}
        icon={<ChevronRight size={16} />}
        onClick={() => void fw.handleSaveIdentityAndContinue()}
        disabled={fw.isSavingIdentity}
      />
    </FooterActionMotion>
  );
}

export function Step7FooterAction({ fw }: ForgeFooterChildProps) {
  return (
    <FooterActionMotion motionKey="s7" className="w-full">
      {!fw.invitesSent ? (
        <PrimaryButton
          label={getStep7InviteLabel({
            forgeMode: fw.forgeMode,
            hasManualInvitees: fw.manualInviteeIds.length > 0,
            isSendingInvites: fw.isSendingInvites,
          })}
          icon={<UserPlus size={16} />}
          onClick={() => void fw.handleSendInvites()}
          disabled={fw.isSendingInvites}
        />
      ) : (
        <PrimaryButton
          label="Enter the group hub"
          icon={<Check size={18} />}
          onClick={() => void fw.handleEnterGroupHub()}
        />
      )}
    </FooterActionMotion>
  );
}
