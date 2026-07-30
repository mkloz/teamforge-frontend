"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";

import { currentAutoForgeRequestQueryOptions } from "@/features/forge/api/auto-forge-request-query";
import { ForgeFooter } from "@/features/forge/components/forge-footer/index";
import { useForgeRouteState } from "@/features/forge/hooks/use-forge-route-state";
import { useForgeWizard } from "@/features/forge/hooks/use-forge-wizard";
import { buildAutoForgeRequestWizardDraft } from "@/features/forge/lib/auto-forge-request-draft";
import type { AutoForgeRequest } from "@/features/forge/schemas/auto-forge-request.schema";
import { Button } from "@/shared/components/ui/button";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";

import { ForgeLoadingScreen } from "./forge-loading-screen";
import { InlineForgeHeader } from "./inline-forge-header";
import { InlineForgeStepContent } from "./inline-forge-step-content";
import { InvitesSentScreen } from "./invites-sent-screen";
import type { InlineForgeWizardProps } from "./types";

export function InlineForgeWizard({ onCancel }: InlineForgeWizardProps) {
  const routeState = useForgeRouteState();
  const requestQuery = useQuery({
    ...currentAutoForgeRequestQueryOptions(),
    enabled: Boolean(routeState.requestId),
  });

  if (routeState.requestId) {
    if (requestQuery.isLoading) {
      return <ForgeRequestLoading />;
    }

    if (
      requestQuery.isError ||
      !requestQuery.data ||
      requestQuery.data.id !== routeState.requestId ||
      !isEditableAutoForgeRequest(requestQuery.data)
    ) {
      return (
        <ForgeRequestLoadError onRetry={() => void requestQuery.refetch()} />
      );
    }

    return (
      <HydratedRequestWizard
        key={`${requestQuery.data.id}:${requestQuery.data.revision}`}
        onCancel={onCancel}
        request={requestQuery.data}
      />
    );
  }

  return <InlineForgeWizardContent onCancel={onCancel} />;
}

function isEditableAutoForgeRequest(request: AutoForgeRequest) {
  return (
    request.lifecycle === "DRAFT" ||
    request.lifecycle === "SEARCHING" ||
    (request.lifecycle === "PAUSED" && request.pauseReason === "USER")
  );
}

function HydratedRequestWizard({
  onCancel,
  request,
}: InlineForgeWizardProps & { request: AutoForgeRequest }) {
  return (
    <InlineForgeWizardContent
      initialDraft={buildAutoForgeRequestWizardDraft(request)}
      onCancel={onCancel}
    />
  );
}

function InlineForgeWizardContent({
  initialDraft,
  onCancel,
}: InlineForgeWizardProps & {
  initialDraft?: ReturnType<typeof buildAutoForgeRequestWizardDraft>;
}) {
  const routeState = useForgeRouteState();
  const fw = useForgeWizard({
    initialDraft,
    onClose: onCancel,
    consumeLaunch: routeState.consumeLaunch,
    routeStep: routeState.step,
    routeMode: routeState.forgeMode,
    routeActivityId: routeState.activityId,
    routeGroupId: routeState.groupId,
    routeIdea: routeState.idea,
    syncStep: routeState.setStep,
    syncMode: routeState.setForgeMode,
    syncTargets: routeState.setForgeTargets,
    enterGroupHub: routeState.enterGroupHub,
  });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [activityShakeRequestId, setActivityShakeRequestId] = useState(0);
  const stepHeadingId = useId();
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef(fw.step);
  const hasProgress = fw.step > 1 || fw.selectedActivity !== null;

  useScrollToTop([fw.step, fw.isForging], undefined, "auto");

  useEffect(() => {
    if (previousStepRef.current === fw.step || fw.invitesSent || fw.isForging) {
      return;
    }

    const heading = stepHeadingRef.current;
    if (!heading) return;

    previousStepRef.current = fw.step;
    heading.focus({ preventScroll: true });
  }, [fw.invitesSent, fw.isForging, fw.step]);

  if (fw.invitesSent) {
    return <InvitesSentScreen fw={fw} />;
  }

  if (fw.isForging) {
    return (
      <ForgeLoadingScreen
        progress={fw.forgingProgress}
        strikeCount={fw.forgeStrikeCount}
      />
    );
  }

  return (
    <div className="mx-auto flex size-full max-w-208 flex-col px-4 md:px-12">
      <InlineForgeHeader
        fw={fw}
        hasProgress={hasProgress}
        headingId={stepHeadingId}
        headingRef={stepHeadingRef}
        onCancelDialogChange={setShowCancelDialog}
        showCancelDialog={showCancelDialog}
      />

      <section aria-labelledby={stepHeadingId} className="flex flex-1 flex-col">
        <InlineForgeStepContent
          activityShakeRequestId={activityShakeRequestId}
          fw={fw}
        />
      </section>

      <ForgeFooter
        fw={fw}
        onDisabledStep1Continue={() =>
          setActivityShakeRequestId((requestId) => requestId + 1)
        }
      />
    </div>
  );
}

function ForgeRequestLoading() {
  return (
    <div
      className="grid min-h-72 place-items-center px-6 text-center"
      role="status"
    >
      <p className="text-muted-foreground text-sm">
        Loading your Forge request…
      </p>
    </div>
  );
}

function ForgeRequestLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid min-h-72 place-items-center px-6 text-center">
      <div className="grid max-w-sm gap-3">
        <p className="font-semibold text-foreground">
          This request could not be opened.
        </p>
        <p className="text-muted-foreground text-sm">
          Refresh its status before making changes.
        </p>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}
