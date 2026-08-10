import { Link } from "@tanstack/react-router";
import { ArrowRight, Flag, Pencil, QrCode } from "lucide-react";
import type { Group } from "@/features/activity/lib/activity-contract";
import {
  leaveReportedGroup,
  ReportDialog,
  type ReportTarget,
} from "@/features/reporting/public/reporting";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
import { buildGroupPlanDetailNavigation } from "@/shared/navigation";
import { PlanChangeDialog } from "../plan-section/plan-change-dialog";

interface GroupIdentityActionsProps {
  activityId: string;
  activityTitle: string | null;
  avatarSrc: string | null;
  canEditGroup: boolean;
  canCreateJoinLinks: boolean;
  canLeaveGroup: boolean;
  canSuggestPlanChange: boolean;
  displayName: string;
  groupId: string;
  groupLink: string;
  isOnline: boolean;
  isReadOnly: boolean;
  plan?: Group["plan"];
  onEditGroup: () => void;
}

export function GroupIdentityActions({
  activityId,
  activityTitle,
  avatarSrc,
  canEditGroup,
  canCreateJoinLinks,
  canLeaveGroup,
  canSuggestPlanChange,
  displayName,
  groupId,
  groupLink,
  isOnline,
  isReadOnly,
  plan,
  onEditGroup,
}: GroupIdentityActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        asChild
        variant="outline"
        size="xs"
        className="min-w-0 flex-1 basis-32"
        contentClassName="gap-1.5"
      >
        <Link
          {...buildGroupPlanDetailNavigation(groupId, { source: "activity" })}
          aria-label={`View ${displayName} group details`}
        >
          <span className="truncate">View more</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>

      {canCreateJoinLinks ? (
        <QrShareDialog
          url={groupLink}
          title="Group link"
          description="Scan to open this group in Findafew. Only members can access it."
          avatarSrc={avatarSrc}
          bottomText={displayName}
          trigger={
            <Button
              variant="outline"
              size="xs"
              className="min-w-0 flex-1 basis-32"
              contentClassName="gap-1.5"
              aria-label={`Show ${displayName} group link QR code`}
            >
              <QrCode className="size-3.5" aria-hidden="true" />
              <span className="truncate">Group link</span>
            </Button>
          }
        />
      ) : null}

      <ReportDialog
        canRequestLeave={!isReadOnly && canLeaveGroup}
        onLeave={() => leaveReportedGroup(groupId)}
        targets={getAggregateReportTargets({
          activityId,
          activityTitle,
          displayName,
          groupId,
          plan,
        })}
        trigger={
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="min-w-0 flex-1 basis-32"
            contentClassName="gap-1.5"
          >
            <Flag className="size-3.5" aria-hidden="true" />
            <span className="truncate">Report</span>
          </Button>
        }
      />

      <GroupMutableAction
        canEditGroup={canEditGroup}
        canSuggestPlanChange={canSuggestPlanChange}
        isOnline={isOnline}
        isReadOnly={isReadOnly}
        plan={plan}
        onEditGroup={onEditGroup}
      />
    </div>
  );
}

function getAggregateReportTargets({
  activityId,
  activityTitle,
  displayName,
  groupId,
  plan,
}: {
  activityId: string;
  activityTitle: string | null;
  displayName: string;
  groupId: string;
  plan?: Group["plan"];
}): ReportTarget[] {
  const targets: ReportTarget[] = [
    { id: groupId, label: `Group: ${displayName}`, type: "GROUP" },
    {
      id: activityId,
      label: activityTitle ? `Activity: ${activityTitle}` : "Activity",
      type: "ACTIVITY",
    },
  ];

  if (plan) {
    targets.push({ id: plan.id, label: `Plan: ${plan.title}`, type: "PLAN" });
  }

  return targets;
}

function GroupMutableAction({
  canEditGroup,
  canSuggestPlanChange,
  isOnline,
  isReadOnly,
  plan,
  onEditGroup,
}: {
  canEditGroup: boolean;
  canSuggestPlanChange: boolean;
  isOnline: boolean;
  isReadOnly: boolean;
  plan?: Group["plan"];
  onEditGroup: () => void;
}) {
  const actionKind = getGroupMutableActionKind({
    canEditGroup,
    canSuggestPlanChange,
    hasPlan: Boolean(plan),
    isReadOnly,
  });

  if (actionKind === "hidden") {
    return null;
  }

  if (actionKind === "edit") {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="min-w-0 flex-1 basis-32"
        contentClassName="gap-1.5"
        disabled={!isOnline}
        onClick={onEditGroup}
        title={getGroupEditDisabledTitle(isOnline)}
      >
        <Pencil className="size-3.5" />
        <span className="truncate">Edit details</span>
      </Button>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <PlanChangeDialog
      plan={plan}
      className="min-w-0 flex-1 basis-32"
      trigger={
        <Button
          variant="primary"
          size="xs"
          className="min-w-0 flex-1 basis-32"
          contentClassName="gap-1.5"
          disabled={!isOnline}
          title={getPlanSuggestionDisabledTitle(isOnline)}
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          <span className="truncate">Suggest</span>
        </Button>
      }
    />
  );
}

function getGroupMutableActionKind({
  canEditGroup,
  canSuggestPlanChange,
  hasPlan,
  isReadOnly,
}: {
  canEditGroup: boolean;
  canSuggestPlanChange: boolean;
  hasPlan: boolean;
  isReadOnly: boolean;
}) {
  if (isReadOnly) {
    return "hidden";
  }

  if (canEditGroup) {
    return "edit";
  }

  return hasPlan && canSuggestPlanChange ? "suggest" : "hidden";
}

function getGroupEditDisabledTitle(isOnline: boolean) {
  return isOnline ? undefined : "Reconnect before editing group details.";
}

function getPlanSuggestionDisabledTitle(isOnline: boolean) {
  return isOnline ? undefined : "Reconnect before suggesting plan changes.";
}
