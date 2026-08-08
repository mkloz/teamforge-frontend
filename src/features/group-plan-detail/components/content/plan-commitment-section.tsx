import {
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { PlanManagementSection } from "@/features/group-plan-detail/components/content/plan-management-section";
import { usePlanCommitment } from "@/features/group-plan-detail/hooks/use-plan-commitment";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";
import type { PlanOperationalState } from "@/shared/schemas/plan-operational-state";

const RESPONSE_OPTIONS = [
  { icon: CircleCheck, label: "Going", value: "GOING" },
  { icon: HelpCircle, label: "Unsure", value: "UNSURE" },
  { icon: XCircle, label: "Can’t attend", value: "CANNOT_ATTEND" },
] as const;

export function PlanCommitmentSection({
  detail,
  operationalState,
}: {
  detail: GroupPlanDetail;
  operationalState?: PlanOperationalState;
}) {
  const commitment = usePlanCommitment(detail, operationalState);
  if (!commitment.canRespond || !detail.plan) return null;

  const readiness = commitment.query.data;
  const effectiveStatus = operationalState
    ? operationalState.viewer.commitmentIsCurrent
      ? operationalState.viewer.commitmentState
      : "NEEDS_RECONFIRMATION"
    : readiness?.currentUserCommitment?.effectiveStatus;
  const isReconfirmation = effectiveStatus === "NEEDS_RECONFIRMATION";

  return (
    <PlanManagementSection
      description={`Your answer applies to plan version ${operationalState?.materialRevision ?? readiness?.materialRevision ?? detail.plan.materialRevision}. You can change it while the plan is open.`}
      icon={CalendarCheck}
      title="Can you make it?"
    >
      {isReconfirmation ? (
        <Notice
          icon={<CircleAlert aria-hidden className="size-4" />}
          role="status"
          tone="warning"
        >
          <p>
            The plan changed. Review the latest details and confirm your answer
            again.
          </p>
        </Notice>
      ) : null}

      {commitment.query.isError ? (
        <Notice className="mt-3" role="alert" tone="danger" statusIcon>
          <p>
            We couldn’t load the group’s responses. Try again before answering.
          </p>
        </Notice>
      ) : null}

      {commitment.mutationOutcome ? (
        <Notice
          className="mt-3"
          role="alert"
          tone={commitment.mutationOutcome.tone}
          statusIcon
        >
          <p className="font-semibold">{commitment.mutationOutcome.title}</p>
          <p>{commitment.mutationOutcome.detail}</p>
        </Notice>
      ) : null}

      {readiness ? (
        <p className="mt-3 px-1 font-semibold text-muted-foreground text-xs">
          {readiness.goingCount} of {readiness.eligibleMemberCount} going
        </p>
      ) : null}

      <fieldset className="mt-3 flex flex-wrap gap-2">
        <legend className="sr-only">Your plan response</legend>
        {RESPONSE_OPTIONS.map((option) => {
          const selected =
            !isReconfirmation &&
            readiness?.currentUserCommitment?.response === option.value;
          const Icon = option.icon;

          return (
            <Button
              key={option.value}
              aria-pressed={selected}
              disabled={
                !commitment.isOnline ||
                commitment.query.isError ||
                commitment.mutation.isPending
              }
              loading={
                commitment.mutation.isPending &&
                commitment.mutation.variables === option.value
              }
              onClick={() => commitment.respond(option.value)}
              size="sm"
              variant={selected ? "primary" : "outline"}
            >
              <Icon className="size-4" aria-hidden="true" />
              {option.label}
            </Button>
          );
        })}
      </fieldset>

      {readiness?.committedQuorum.met ? (
        <p className="mt-3 px-1 text-muted-foreground text-xs" role="status">
          The group has enough confirmed people for the current commitment
          target.
        </p>
      ) : readiness ? (
        <p className="mt-3 px-1 text-muted-foreground text-xs" role="status">
          {readiness.committedQuorum.required -
            readiness.committedQuorum.current}{" "}
          more
          {readiness.committedQuorum.required -
            readiness.committedQuorum.current ===
          1
            ? " person is"
            : " people are"}{" "}
          needed for the current commitment target.
        </p>
      ) : null}
    </PlanManagementSection>
  );
}
