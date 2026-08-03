import {
  type UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Armchair, Clock3 } from "lucide-react";
import { useState } from "react";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { PlanSeatViewerState } from "@/features/group-plan-detail/schemas/plan-seat-recovery.schema";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";

export function PlanSeatRecoverySection({
  detail,
}: {
  detail: GroupPlanDetail;
}) {
  const plan = detail.plan;
  const enabled = Boolean(plan?.seatRecoveryEnabled);
  const query = useQuery(
    groupPlanDetailQueries.seatRecovery(plan?.id ?? "", enabled),
  );

  if (!plan || !enabled) return null;

  return (
    <section className="mt-6 rounded-2xl border border-border/70 bg-card px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
          <Armchair className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-ink text-sm">Plan places</h2>
          <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
            A plan place is separate from your commitment and group membership.
            Choosing “can&apos;t attend” releases only this plan place.
          </p>
          <SeatRecoveryBody detail={detail} query={query} />
        </div>
      </div>
    </section>
  );
}

function SeatRecoveryBody({
  detail,
  query,
}: {
  detail: GroupPlanDetail;
  query: UseQueryResult<PlanSeatViewerState>;
}) {
  const plan = detail.plan;
  if (!plan || query.isLoading) {
    return (
      <p className="mt-3 text-muted-foreground text-xs">
        Checking place status…
      </p>
    );
  }
  if (query.isError || !query.data) {
    return (
      <Notice className="mt-3" role="alert" size="sm" tone="warning">
        We couldn&apos;t load the current place status.
      </Notice>
    );
  }
  const state = query.data;
  const offer = state.offer;

  if (offer?.status === "OFFERED") {
    return <OfferedSeatActions planId={plan.id} state={state} />;
  }
  if (offer?.status === "WAITING") {
    return (
      <p className="mt-3 flex items-center gap-2 font-semibold text-ink text-xs">
        <Clock3 className="size-4 text-forge-teal" aria-hidden />
        Waiting for a place. We&apos;ll show an expiry time if one is offered.
      </p>
    );
  }
  if (state.seatCounts) {
    return (
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-muted px-2.5 py-1 font-semibold text-ink">
          {state.seatCounts.OCCUPIED ?? 0} filled
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-semibold text-ink">
          {state.seatCounts.HELD ?? 0} offered
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-semibold text-ink">
          {state.seatCounts.OPEN ?? 0} open
        </span>
      </div>
    );
  }

  return <JoinWaitlistAction planId={plan.id} />;
}

function JoinWaitlistAction({ planId }: { planId: string }) {
  const mutation = useMutation({
    mutationFn: () => GroupPlanDetailCommands.joinSeatWaitlist(planId),
    meta: {
      errorToastMessage:
        "You aren't currently eligible for this plan waitlist.",
      telemetryName: "plan_seat_waitlist_join",
    },
  });
  return (
    <Button
      className="mt-3"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
      size="sm"
      variant="outline"
    >
      {mutation.isPending ? "Joining…" : "Join the place waitlist"}
    </Button>
  );
}

function OfferedSeatActions({
  planId,
  state,
}: {
  planId: string;
  state: PlanSeatViewerState;
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [doNotOfferAgain, setDoNotOfferAgain] = useState(false);
  const offer = state.offer;
  const accept = useMutation({
    mutationFn: () => {
      if (!offer) throw new Error("A current offer is required.");
      return GroupPlanDetailCommands.acceptSeatOffer({
        expectedMaterialRevision: state.materialRevision,
        offerId: offer.id,
        planId,
      });
    },
    meta: {
      errorToastMessage:
        "This place is no longer available. Refresh and try again.",
      telemetryName: "plan_seat_offer_accept",
    },
  });
  const decline = useMutation({
    mutationFn: () => {
      if (!offer) throw new Error("A current offer is required.");
      return GroupPlanDetailCommands.declineSeatOffer({
        doNotOfferAgain,
        offerId: offer.id,
        planId,
      });
    },
    meta: {
      errorToastMessage: "We couldn't decline this place.",
      telemetryName: "plan_seat_offer_decline",
    },
  });

  if (!offer) return null;

  return (
    <div className="mt-3 grid gap-3 rounded-xl bg-forge-teal/5 p-3">
      <p className="font-semibold text-ink text-xs">
        A place is held for you until {formatDateTime(offer.expiresAt)}.
      </p>
      <div className="flex flex-wrap gap-2">
        <ActionDialog
          confirmLabel="Accept plan place"
          description="This accepts attendance for this plan only. It does not add you to the group or its chat. If you belonged to the group before, your membership will be restored instead."
          disabled={!acknowledged}
          loading={accept.isPending}
          onConfirm={() => accept.mutate()}
          title="Accept this plan place?"
          trigger={<Button size="sm">Review and accept</Button>}
        >
          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3 text-sm">
            <input
              checked={acknowledged}
              className="mt-1 accent-forge-teal"
              onChange={(event) => setAcknowledged(event.target.checked)}
              type="checkbox"
            />
            <span>
              I understand this is plan-only access unless a former membership
              can be restored.
            </span>
          </label>
        </ActionDialog>
        <ActionDialog
          confirmLabel="Decline place"
          description="The place will be released immediately for the next eligible person."
          loading={decline.isPending}
          onConfirm={() => decline.mutate()}
          title="Decline this place?"
          tone="danger"
          trigger={
            <Button size="sm" variant="outline">
              Decline
            </Button>
          }
        >
          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3 text-sm">
            <input
              checked={doNotOfferAgain}
              className="mt-1 accent-forge-teal"
              onChange={(event) => setDoNotOfferAgain(event.target.checked)}
              type="checkbox"
            />
            <span>Do not offer me places in this group again.</span>
          </label>
        </ActionDialog>
      </div>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "the displayed deadline";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
