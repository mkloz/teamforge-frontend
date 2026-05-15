"use client";

import { useState } from "react";

import { ForgeFooter } from "@/features/forge/components/forge-footer/index";
import { useForgeRouteState } from "@/features/forge/hooks/use-forge-route-state";
import { useForgeWizard } from "@/features/forge/hooks/use-forge-wizard";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";

import { ForgeLoadingScreen } from "./forge-loading-screen";
import { InlineForgeHeader } from "./inline-forge-header";
import { InlineForgeStepContent } from "./inline-forge-step-content";
import { InvitesSentScreen } from "./invites-sent-screen";
import type { InlineForgeWizardProps } from "./types";

export function InlineForgeWizard({ onCancel }: InlineForgeWizardProps) {
  const routeState = useForgeRouteState();
  const fw = useForgeWizard({
    onClose: onCancel,
    routeStep: routeState.step,
    routeMode: routeState.forgeMode,
    routeActivityId: routeState.activityId,
    routeGroupId: routeState.groupId,
    syncStep: routeState.setStep,
    syncMode: routeState.setForgeMode,
    syncTargets: routeState.setForgeTargets,
    enterGroupHub: routeState.enterGroupHub,
  });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [activityShakeRequestId, setActivityShakeRequestId] = useState(0);
  const hasProgress = fw.step > 1 || fw.selectedActivity !== null;

  useScrollToTop([fw.step, fw.isForging], undefined, "auto");

  if (fw.invitesSent) {
    return <InvitesSentScreen fw={fw} />;
  }

  if (fw.isForging) {
    return <ForgeLoadingScreen strikeCount={fw.forgeStrikeCount} />;
  }

  return (
    <div className="mx-auto flex size-full max-w-3xl flex-col px-4 md:px-12">
      <InlineForgeHeader
        fw={fw}
        hasProgress={hasProgress}
        onCancel={onCancel}
        onCancelDialogChange={setShowCancelDialog}
        showCancelDialog={showCancelDialog}
      />

      <InlineForgeStepContent
        activityShakeRequestId={activityShakeRequestId}
        fw={fw}
      />

      <ForgeFooter
        fw={fw}
        onDisabledStep1Continue={() =>
          setActivityShakeRequestId((requestId) => requestId + 1)
        }
      />
    </div>
  );
}
