import { Link } from "@tanstack/react-router";
import { ArrowRight, Pencil, QrCode } from "lucide-react";
import type { Group } from "@/features/activity/lib/activity-contract";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
import { buildGroupPlanDetailNavigation } from "@/shared/navigation";
import { PlanChangeDialog } from "../plan-section/plan-change-dialog";

interface GroupIdentityActionsProps {
  avatarSrc: string | null;
  canEditGroup: boolean;
  displayName: string;
  groupId: string;
  groupLink: string;
  isOnline: boolean;
  isReadOnly: boolean;
  plan?: Group["plan"];
  onEditGroup: () => void;
}

export function GroupIdentityActions({
  avatarSrc,
  canEditGroup,
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

      <QrShareDialog
        url={groupLink}
        title="Group link"
        description="Scan to open this group in TeamForge. Only members can access it."
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

      <GroupMutableAction
        canEditGroup={canEditGroup}
        isOnline={isOnline}
        isReadOnly={isReadOnly}
        plan={plan}
        onEditGroup={onEditGroup}
      />
    </div>
  );
}

function GroupMutableAction({
  canEditGroup,
  isOnline,
  isReadOnly,
  plan,
  onEditGroup,
}: {
  canEditGroup: boolean;
  isOnline: boolean;
  isReadOnly: boolean;
  plan?: Group["plan"];
  onEditGroup: () => void;
}) {
  const actionKind = getGroupMutableActionKind({
    canEditGroup,
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
  hasPlan,
  isReadOnly,
}: {
  canEditGroup: boolean;
  hasPlan: boolean;
  isReadOnly: boolean;
}) {
  if (isReadOnly) {
    return "hidden";
  }

  if (canEditGroup) {
    return "edit";
  }

  return hasPlan ? "suggest" : "hidden";
}

function getGroupEditDisabledTitle(isOnline: boolean) {
  return isOnline ? undefined : "Reconnect before editing group details.";
}

function getPlanSuggestionDisabledTitle(isOnline: boolean) {
  return isOnline ? undefined : "Reconnect before suggesting plan changes.";
}
