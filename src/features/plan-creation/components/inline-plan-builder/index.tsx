"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";

import { currentAutomaticGroupFormationRequestQueryOptions } from "@/features/plan-creation/api/automatic-group-formation-request-query";
import { PlanBuilderFooter } from "@/features/plan-creation/components/plan-creation-footer/index";
import { usePlanBuilder } from "@/features/plan-creation/hooks/use-plan-builder";
import { usePlanCreationRouteState } from "@/features/plan-creation/hooks/use-plan-creation-route-state";
import { buildAutomaticGroupFormationRequestWizardDraft } from "@/features/plan-creation/lib/automatic-group-formation-request-draft";
import type { AutomaticGroupFormationRequest } from "@/features/plan-creation/schemas/automatic-group-formation-request.schema";
import { Button } from "@/shared/components/ui/button";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { InlinePlanHeader } from "./inline-plan-header";
import { InlinePlanStepContent } from "./inline-plan-step-content";
import { InvitesSentScreen } from "./invites-sent-screen";
import { PlanLoadingScreen } from "./plan-creation-loading-screen";
import type { InlinePlanBuilderProps } from "./types";

export function InlinePlanBuilder({ onCancel }: InlinePlanBuilderProps) {
  const routeState = usePlanCreationRouteState();
  const requestQuery = useQuery({
    ...currentAutomaticGroupFormationRequestQueryOptions(),
    enabled: Boolean(routeState.requestId),
  });

  if (routeState.requestId) {
    if (requestQuery.isLoading) {
      return <GroupFormationRequestLoading />;
    }

    if (
      requestQuery.isError ||
      !requestQuery.data ||
      requestQuery.data.id !== routeState.requestId ||
      !isEditableAutomaticGroupFormationRequest(requestQuery.data)
    ) {
      return (
        <GroupFormationRequestLoadError
          onRetry={() => void requestQuery.refetch()}
        />
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

  return <InlinePlanBuilderContent onCancel={onCancel} />;
}

function isEditableAutomaticGroupFormationRequest(
  request: AutomaticGroupFormationRequest,
) {
  return (
    request.lifecycle === "DRAFT" ||
    request.lifecycle === "SEARCHING" ||
    (request.lifecycle === "PAUSED" && request.pauseReason === "USER")
  );
}

function HydratedRequestWizard({
  onCancel,
  request,
}: InlinePlanBuilderProps & { request: AutomaticGroupFormationRequest }) {
  return (
    <InlinePlanBuilderContent
      initialDraft={buildAutomaticGroupFormationRequestWizardDraft(request)}
      onCancel={onCancel}
    />
  );
}

function InlinePlanBuilderContent({
  initialDraft,
  onCancel,
}: InlinePlanBuilderProps & {
  initialDraft?: ReturnType<
    typeof buildAutomaticGroupFormationRequestWizardDraft
  >;
}) {
  const routeState = usePlanCreationRouteState();
  const fw = usePlanBuilder({
    initialDraft,
    onClose: onCancel,
    consumeLaunch: routeState.consumeLaunch,
    routeStep: routeState.step,
    routeMode: routeState.groupFormationMode,
    routeActivityId: routeState.activityId,
    routeGroupId: routeState.groupId,
    routeIdea: routeState.idea,
    syncStep: routeState.setStep,
    syncMode: routeState.setGroupFormationMode,
    syncTargets: routeState.setPlanCreationTargets,
    enterGroupHub: routeState.enterGroupHub,
  });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [activityShakeRequestId, setActivityShakeRequestId] = useState(0);
  const stepHeadingId = useId();
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef(fw.step);
  const hasProgress = fw.step > 1 || fw.selectedActivity !== null;

  useScrollToTop([fw.step, fw.isCreatingPlan], undefined, "auto");

  useEffect(() => {
    if (
      previousStepRef.current === fw.step ||
      fw.invitesSent ||
      fw.isCreatingPlan
    ) {
      return;
    }

    const heading = stepHeadingRef.current;
    if (!heading) return;

    previousStepRef.current = fw.step;
    heading.focus({ preventScroll: true });
  }, [fw.invitesSent, fw.isCreatingPlan, fw.step]);

  if (fw.invitesSent) {
    return <InvitesSentScreen fw={fw} />;
  }

  if (fw.isCreatingPlan) {
    return (
      <PlanLoadingScreen
        progress={fw.creationProgress}
        strikeCount={fw.planCreationStrikeCount}
      />
    );
  }

  return (
    <div className="mx-auto flex size-full max-w-208 flex-col px-4 md:px-12">
      <InlinePlanHeader
        fw={fw}
        hasProgress={hasProgress}
        headingId={stepHeadingId}
        headingRef={stepHeadingRef}
        onCancelDialogChange={setShowCancelDialog}
        showCancelDialog={showCancelDialog}
      />

      <section aria-labelledby={stepHeadingId} className="flex flex-1 flex-col">
        <InlinePlanStepContent
          activityShakeRequestId={activityShakeRequestId}
          fw={fw}
        />
      </section>

      <PlanBuilderFooter
        fw={fw}
        onDisabledStep1Continue={() =>
          setActivityShakeRequestId((requestId) => requestId + 1)
        }
      />
    </div>
  );
}

function GroupFormationRequestLoading() {
  return (
    <div
      className="grid min-h-72 place-items-center px-6 text-center"
      role="status"
    >
      <p className="text-muted-foreground text-sm">
        Loading your group request…
      </p>
    </div>
  );
}

function GroupFormationRequestLoadError({ onRetry }: { onRetry: () => void }) {
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
