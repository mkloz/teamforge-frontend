import { CircleAlert, CircleCheck, HelpCircle, XCircle } from "lucide-react";
import { usePlanCommitment } from "@/features/group-plan-detail/hooks/use-plan-commitment";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";
import { cn } from "@/shared/lib/utils";

const RESPONSE_OPTIONS = [
  { icon: CircleCheck, label: "Going", value: "GOING" },
  { icon: HelpCircle, label: "Unsure", value: "UNSURE" },
  { icon: XCircle, label: "Can’t attend", value: "CANNOT_ATTEND" },
] as const;

export function PlanCommitmentSection({ detail }: { detail: GroupPlanDetail }) {
  const commitment = usePlanCommitment(detail);
  if (!commitment.canRespond || !detail.plan) return null;

  const readiness = commitment.query.data;
  const effectiveStatus = readiness?.currentUserCommitment?.effectiveStatus;
  const isReconfirmation = effectiveStatus === "NEEDS_RECONFIRMATION";

  return (
    <section
      aria-labelledby="plan-commitment-heading"
      className="mt-3 rounded-2xl bg-card px-5 py-5 sm:px-6 lg:px-7"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="font-bold text-forge-teal text-xs uppercase tracking-wide">
            Plan response
          </p>
          <h2
            id="plan-commitment-heading"
            className="mt-1 font-extrabold text-foreground text-xl"
          >
            Can you make it?
          </h2>
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            Your answer applies to plan version{" "}
            {readiness?.materialRevision ?? detail.plan.materialRevision}. You
            can change it while the plan is open.
          </p>
        </div>

        {readiness ? (
          <p className="shrink-0 font-bold text-muted-foreground text-sm">
            {readiness.goingCount} of {readiness.eligibleMemberCount} going
          </p>
        ) : null}
      </div>

      {isReconfirmation ? (
        <Notice
          className="mt-4"
          icon={<CircleAlert aria-hidden="true" className="size-4" />}
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
        <Notice className="mt-4" role="alert" tone="danger" statusIcon>
          <p>
            We couldn’t load the group’s responses. Try again before answering.
          </p>
        </Notice>
      ) : null}

      <fieldset className="mt-5 grid gap-2 sm:grid-cols-3">
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
              className={cn(
                "w-full",
                selected &&
                  "border-forge-teal bg-forge-teal/10 text-forge-teal",
              )}
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
              size="md"
              variant="subtle"
            >
              <Icon className="size-4" aria-hidden="true" />
              {option.label}
            </Button>
          );
        })}
      </fieldset>

      {readiness?.committedQuorum.met ? (
        <p className="mt-4 text-muted-foreground text-xs" role="status">
          The group has enough confirmed people for the current commitment
          target.
        </p>
      ) : readiness ? (
        <p className="mt-4 text-muted-foreground text-xs" role="status">
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
    </section>
  );
}
