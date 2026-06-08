import { Check, ChevronRight, UserPlus } from "lucide-react";

import {
  AutoForgeButton,
  ManualForgeButton,
  PrimaryButton,
  ReforgeButton,
} from "@/features/forge/components/forge-buttons";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import {
  getStep1ContinueLabel,
  getStep6ContinueLabel,
  getStep7InviteLabel,
} from "./footer-action-labels";
import { FooterActionMotion } from "./footer-action-motion";
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
  const isOnline = useNetworkStatus();

  return (
    <FooterActionMotion motionKey="s4">
      {fw.forgeMode === "MANUAL" ? (
        <ManualForgeButton
          onClick={fw.handleManualForge}
          disabled={!isOnline}
        />
      ) : (
        <AutoForgeButton onClick={fw.handleAutoForge} disabled={!isOnline} />
      )}
      {!isOnline ? (
        <ForgeFooterOfflineNotice message="Reconnect before forming a group." />
      ) : null}
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
        <ForgeFooterOfflineNotice message="Reconnect before saving group identity." />
      ) : null}
    </FooterActionMotion>
  );
}

export function Step7FooterAction({ fw }: ForgeFooterChildProps) {
  const isOnline = useNetworkStatus();

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
          disabled={!isOnline || fw.isSendingInvites}
        />
      ) : (
        <PrimaryButton
          label="Enter the group hub"
          icon={<Check size={18} />}
          onClick={() => void fw.handleEnterGroupHub()}
        />
      )}
      {!isOnline && !fw.invitesSent ? (
        <ForgeFooterOfflineNotice message="Reconnect before sending invites." />
      ) : null}
    </FooterActionMotion>
  );
}

function ForgeFooterOfflineNotice({ message }: { message: string }) {
  return (
    <OfflineNotice
      size="xs"
      iconClassName="mt-0"
      iconSizeClassName="size-3.5"
      className="mt-3 justify-center border-0 bg-transparent p-0 text-center text-spark-amber"
      contentClassName="flex-none font-medium"
    >
      {message}
    </OfflineNotice>
  );
}
