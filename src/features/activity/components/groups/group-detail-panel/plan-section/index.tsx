import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  MapPin,
  MessageSquareDiff,
  Pencil,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type {
  MemberRole,
  Plan,
} from "@/features/activity/lib/activity-contract";
import { formatPlanLocation } from "@/features/activity/lib/plan-location";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { FactItem } from "@/shared/components/ui/fact-item";
import type { IconTileTone } from "@/shared/components/ui/icon-tile";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import {
  categoryColors,
  formatDate,
  formatPanelToken,
  formatTime,
  statusColors,
} from "../lib/constants";
import {
  getPlanLifecycleViewState,
  type PlanLifecycleViewState,
} from "./plan-lifecycle-view-state";

interface PlanSectionProps {
  plan: Plan;
  currentUserRole?: MemberRole;
  isFocused?: boolean;
  isOnline?: boolean;
  focusedProposalId?: string | null;
  isReadOnly?: boolean;
  onCancelPlan?: () => Promise<void> | void;
  onCompletePlan?: () => Promise<void> | void;
  onConfirmPlan?: () => Promise<void> | void;
  onCreateNextPlan?: () => Promise<void> | void;
  onEditPlan?: () => void;
  pendingAction?: string | null;
}

export function PlanSection({
  currentUserRole = "MEMBER",
  plan,
  isFocused = false,
  isOnline = true,
  isReadOnly = false,
  onCancelPlan,
  onCompletePlan,
  onConfirmPlan,
  onCreateNextPlan,
  onEditPlan,
  pendingAction = null,
}: PlanSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const formattedDate = plan.dateTime ? formatDate(plan.dateTime) : "Date TBD";
  const formattedTime = plan.dateTime ? formatTime(plan.dateTime) : "Time TBD";
  const formattedLocation = formatPlanLocation(plan);
  const displayTitle = stripStatusPrefix(
    plan.title,
    formatPanelToken(plan.status),
  );
  const sectionLabel = getPlanSectionLabel(plan.status, isReadOnly);
  const shouldShowStatusPill = !(isReadOnly && plan.status === "COMPLETED");

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [isFocused]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "scroll-mt-24 border-border/70 border-t pt-5 transition-all duration-500",
        isFocused &&
          "rounded-xl bg-forge-teal/8 px-3 pb-3 ring-1 ring-forge-teal/20",
      )}
      aria-labelledby="current-plan-title"
    >
      <div className="flex flex-col gap-3 border-border/70 border-b pb-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-bold text-slate-muted text-xs">{sectionLabel}</p>
          <div className="flex flex-wrap justify-end gap-1.5">
            <PlanCategoryPill category={plan.category} />
            {shouldShowStatusPill ? (
              <PlanStatusPill status={plan.status} />
            ) : null}
          </div>
        </div>

        <h2
          id="current-plan-title"
          className="text-balance font-bold text-ink text-xl leading-tight tracking-tight"
        >
          {displayTitle}
        </h2>
      </div>

      {plan.description ? (
        <p className="mt-2 line-clamp-2 text-ink/70 text-sm leading-relaxed">
          {plan.description}
        </p>
      ) : null}

      <PlanFactList
        cost={formatPlanCost(plan)}
        date={formattedDate}
        location={formattedLocation}
        locationHref={
          plan.locationMode === "IN_PERSON" &&
          plan.locationLat !== null &&
          plan.locationLng !== null
            ? `https://maps.google.com/?q=${plan.locationLat},${plan.locationLng}`
            : null
        }
        time={formattedTime}
      />

      <PlanLifecycleActions
        currentUserRole={currentUserRole}
        isOnline={isOnline}
        isReadOnly={isReadOnly}
        onCancelPlan={onCancelPlan}
        onCompletePlan={onCompletePlan}
        onConfirmPlan={onConfirmPlan}
        onCreateNextPlan={onCreateNextPlan}
        onEditPlan={onEditPlan}
        pendingAction={pendingAction}
        plan={plan}
      />
    </section>
  );
}

function PlanCategoryPill({ category }: { category: Plan["category"] }) {
  return (
    <StatusPill tone="none" className={categoryColors[category]}>
      {formatPanelToken(category)}
    </StatusPill>
  );
}

function PlanStatusPill({ status }: { status: Plan["status"] }) {
  const Icon = getPlanStatusPillIcon(status);
  const label = formatPanelToken(status);

  return (
    <StatusPill icon={Icon} tone="none" className={statusColors[status]}>
      {label}
    </StatusPill>
  );
}

function getPlanStatusPillIcon(status: Plan["status"]) {
  if (status === "DRAFT") {
    return Pencil;
  }

  if (status === "CONFIRMED" || status === "COMPLETED") {
    return CheckCircle2;
  }

  if (status === "CANCELLED") {
    return XCircle;
  }

  if (status === "IN_PROGRESS") {
    return CircleDot;
  }

  if (status === "PROPOSED") {
    return MessageSquareDiff;
  }

  return CircleDashed;
}

function PlanFactList({
  cost,
  date,
  location,
  locationHref,
  time,
}: {
  cost: string;
  date: string;
  location: string;
  locationHref: string | null;
  time: string;
}) {
  const facts: PlanFactProps[] = [
    {
      icon: Calendar,
      label: "When",
      meta: time,
      tone: "teal" as const,
      value: date,
      wide: true,
    },
    {
      href: locationHref,
      icon: MapPin,
      label: "Where",
      tone: "muted" as const,
      value: location,
      wide: true,
    },
    {
      icon: Banknote,
      label: "Cost",
      tone: "muted" as const,
      value: cost,
    },
  ];

  return (
    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-border/70 border-b pb-3">
      {facts.map((fact) => (
        <PlanFact key={fact.label} {...fact} />
      ))}
    </dl>
  );
}

function PlanFact({
  href,
  icon,
  label,
  meta,
  tone,
  value,
  wide = false,
}: PlanFactProps) {
  return (
    <FactItem
      className={wide ? "col-span-2" : undefined}
      href={href}
      icon={icon}
      iconTone={tone}
      label={label}
      linkClassName={wide ? "wrap-break-word" : undefined}
      meta={meta}
      value={value}
    />
  );
}

function PlanLifecycleActions({
  currentUserRole,
  isReadOnly,
  isOnline,
  onCancelPlan,
  onCompletePlan,
  onConfirmPlan,
  onCreateNextPlan,
  onEditPlan,
  pendingAction,
  plan,
}: {
  currentUserRole: MemberRole;
  isOnline: boolean;
  isReadOnly: boolean;
  onCancelPlan?: () => Promise<void> | void;
  onCompletePlan?: () => Promise<void> | void;
  onConfirmPlan?: () => Promise<void> | void;
  onCreateNextPlan?: () => Promise<void> | void;
  onEditPlan?: () => void;
  pendingAction: string | null;
  plan: Plan;
}) {
  const viewState = getPlanLifecycleViewState({
    currentUserRole,
    hasCancelPlan: Boolean(onCancelPlan),
    hasCompletePlan: Boolean(onCompletePlan),
    hasConfirmPlan: Boolean(onConfirmPlan),
    hasEditPlan: Boolean(onEditPlan),
    isOnline,
    isReadOnly,
    pendingAction,
    plan,
  });

  if (!viewState.canManagePlan) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {viewState.hasOfflineBlock ? (
        <OfflineNotice
          withIcon={false}
          tone="neutral"
          size="xs"
          className="basis-full rounded-lg border-border/70 bg-muted/30 text-slate-muted"
        >
          Reconnect before changing this plan.
        </OfflineNotice>
      ) : null}

      {viewState.showConfirmAction ? (
        <ConfirmPlanAction
          onConfirmPlan={onConfirmPlan}
          plan={plan}
          viewState={viewState}
        />
      ) : null}

      {viewState.showCompleteAction ? (
        <CompletePlanAction
          onCompletePlan={onCompletePlan}
          viewState={viewState}
        />
      ) : null}

      {viewState.showCancelAction ? (
        <CancelPlanAction onCancelPlan={onCancelPlan} viewState={viewState} />
      ) : null}

      {viewState.showCreateNextAction ? (
        <CreateNextPlanAction
          onCreateNextPlan={onCreateNextPlan}
          viewState={viewState}
        />
      ) : null}

      <EditPlanAction onEditPlan={onEditPlan} viewState={viewState} />
    </div>
  );
}

function ConfirmPlanAction({
  onConfirmPlan,
  plan,
  viewState,
}: {
  onConfirmPlan?: () => Promise<void> | void;
  plan: Plan;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.confirm;

  return (
    <ActionDialog
      cancelLabel="Review first"
      confirmLabel={action.confirmLabel}
      description="This turns the draft into the plan everyone sees as ready."
      details={[
        plan.dateTime ? `Time: ${formatDate(plan.dateTime)}` : "Date TBD",
        `Place: ${formatPlanLocation(plan)}`,
      ]}
      disabled={action.disabled}
      loading={action.loading}
      onConfirm={onConfirmPlan}
      title="Confirm this plan?"
      tone="info"
      trigger={
        <Button
          type="button"
          size="sm"
          className="min-w-max grow basis-36"
          contentClassName="gap-1.5"
          disabled={action.disabled}
          loading={action.loading}
          title={action.title}
        >
          <CheckCircle2 className="size-3.5 shrink-0" />
          Confirm plan
        </Button>
      }
    />
  );
}

function CompletePlanAction({
  onCompletePlan,
  viewState,
}: {
  onCompletePlan?: () => Promise<void> | void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.complete;

  return (
    <ActionDialog
      cancelLabel="Not yet"
      confirmLabel={action.confirmLabel}
      description="Mark this plan as finished when the group has wrapped it up."
      details={[
        "The plan moves into completed history.",
        "Members can still use the group for follow-up and future plans.",
      ]}
      disabled={action.disabled}
      loading={action.loading}
      onConfirm={onCompletePlan}
      title="Complete this plan?"
      tone="success"
      trigger={
        <Button
          type="button"
          size="sm"
          className="min-w-max grow basis-36"
          contentClassName="gap-1.5"
          disabled={action.disabled}
          loading={action.loading}
          title={action.title}
        >
          <CheckCircle2 className="size-3.5 shrink-0" />
          Complete
        </Button>
      }
    />
  );
}

function CancelPlanAction({
  onCancelPlan,
  viewState,
}: {
  onCancelPlan?: () => Promise<void> | void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.cancel;

  return (
    <ActionDialog
      cancelLabel="Keep plan"
      confirmLabel={action.confirmLabel}
      description="This closes the current plan for the group."
      details={[
        "Members will see the plan as cancelled.",
        "The group chat stays open for deciding what happens next.",
      ]}
      disabled={action.disabled}
      loading={action.loading}
      onConfirm={onCancelPlan}
      title="Cancel this plan?"
      tone="danger"
      trigger={
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="min-w-max grow basis-36"
          contentClassName="gap-1.5"
          disabled={action.disabled}
          loading={action.loading}
          title={action.title}
        >
          <XCircle className="size-3.5 shrink-0" />
          Cancel
        </Button>
      }
    />
  );
}

function CreateNextPlanAction({
  onCreateNextPlan,
  viewState,
}: {
  onCreateNextPlan?: () => Promise<void> | void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.createNext;

  return (
    <Button
      type="button"
      size="sm"
      className="min-w-max grow basis-36"
      contentClassName="gap-1.5"
      disabled={action.disabled}
      loading={action.loading}
      onClick={onCreateNextPlan}
      title={action.title}
    >
      <PlusCircle className="size-3.5 shrink-0" />
      Plan another
    </Button>
  );
}

function EditPlanAction({
  onEditPlan,
  viewState,
}: {
  onEditPlan?: () => void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.edit;

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="min-w-max grow basis-36"
      contentClassName="gap-1.5"
      disabled={action.disabled}
      onClick={onEditPlan}
      title={action.title}
    >
      <Pencil className="size-3.5 shrink-0" />
      Edit plan
    </Button>
  );
}

interface PlanFactProps {
  href?: string | null;
  icon: LucideIcon;
  label: string;
  meta?: string;
  tone: Extract<IconTileTone, "amber" | "muted" | "teal">;
  value: string;
  wide?: boolean;
}

function getPlanSectionLabel(planStatus: Plan["status"], isReadOnly: boolean) {
  if (!isReadOnly) {
    return "Current plan";
  }

  if (planStatus === "COMPLETED") {
    return "Final plan";
  }

  if (planStatus === "CANCELLED") {
    return "Cancelled plan";
  }

  return "Plan";
}

function stripStatusPrefix(value: string, statusLabel: string) {
  const prefix = `${statusLabel} `;

  if (!value.toLowerCase().startsWith(prefix.toLowerCase())) {
    return value;
  }

  const strippedValue = value.slice(prefix.length).trim();
  return strippedValue || value;
}

function formatPlanCost(plan: Plan) {
  if (plan.cost === "FREE") {
    return plan.costDetails ? `Free · ${plan.costDetails}` : "Free";
  }

  if (typeof plan.costAmount === "number") {
    return `About £${plan.costAmount.toFixed(0)}`;
  }

  return plan.costDetails ?? "Paid";
}
