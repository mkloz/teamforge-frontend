import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  LogOut,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { useGroupPlanDetailActions } from "@/features/group-plan-detail/hooks/use-group-plan-detail-actions";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  formatStatusLabel,
  getSeatsLabel,
} from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";

interface GroupPlanActionDockProps {
  detail: GroupPlanDetail;
}

export function GroupPlanActionDock({ detail }: GroupPlanActionDockProps) {
  const actions = useGroupPlanDetailActions(detail.group.id);
  const joinResult = actions.joinResult;
  const joinedGroupId =
    joinResult?.status === "JOINED" ? joinResult.groupId : null;
  const isMember =
    detail.viewer.relationship === "ADMIN" ||
    detail.viewer.relationship === "MODERATOR" ||
    detail.viewer.relationship === "MEMBER";
  const isInvited = detail.viewer.relationship === "INVITED";
  const pendingInviteId = detail.viewer.pendingInviteId;
  const canJoin =
    detail.viewer.canJoin ||
    detail.viewer.canRequestToJoin ||
    joinResult?.status === "REQUESTED";
  const actionLabel = getPrimaryActionLabel({
    detail,
    isPending: actions.isJoining,
    joinStatus: joinResult?.status,
  });

  return (
    <aside aria-label="Group action">
      <div className="sm:main-action-grid grid gap-3 rounded-2xl bg-card/45 p-3 ring-1 ring-border/35 sm:items-center">
        <div className="min-w-0">
          <p className="font-black text-foreground text-sm">
            {getSeatsLabel(detail)}
          </p>
          <p className="mt-1 font-medium text-muted-foreground text-sm leading-relaxed">
            {getDockSummary(detail)}
          </p>
        </div>

        <div className="grid gap-2 sm:min-w-48">
          {isMember ? (
            <Button asChild variant="primary">
              <Link {...buildActivityGroupHubNavigation(detail.group.id)}>
                <MessageCircle className="size-4" aria-hidden="true" />
                Open group
              </Link>
            </Button>
          ) : joinedGroupId ? (
            <Button asChild variant="primary">
              <Link {...buildActivityGroupHubNavigation(joinedGroupId)}>
                <MessageCircle className="size-4" aria-hidden="true" />
                Open group
              </Link>
            </Button>
          ) : isInvited ? (
            <Button
              variant="primary"
              disabled={!pendingInviteId || actions.isAcceptingInvite}
              loading={actions.isAcceptingInvite}
              onClick={() => {
                if (pendingInviteId) {
                  actions.acceptInvite(pendingInviteId);
                }
              }}
            >
              <Check className="size-4" aria-hidden="true" />
              {actions.isAcceptingInvite ? "Accepting..." : "Accept invite"}
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={
                !canJoin ||
                actions.isJoining ||
                joinResult?.status === "REQUESTED"
              }
              loading={actions.isJoining}
              onClick={() => actions.joinGroup()}
            >
              {detail.viewer.canRequestToJoin ? (
                <Send className="size-4" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-4" aria-hidden="true" />
              )}
              {actionLabel}
            </Button>
          )}

          {isMember && detail.viewer.canLeaveGroup ? (
            <LeaveGroupButton
              isLeaving={actions.isLeaving}
              onLeave={() => actions.leaveGroup()}
            />
          ) : isMember ? null : isInvited ? (
            <Button
              variant="outline"
              disabled={!pendingInviteId || actions.isDecliningInvite}
              loading={actions.isDecliningInvite}
              onClick={() => {
                if (pendingInviteId) {
                  actions.declineInvite(pendingInviteId);
                }
              }}
            >
              <X className="size-4" aria-hidden="true" />
              Decline
            </Button>
          ) : detail.viewer.relationship === "REQUESTED" ||
            joinResult?.status === "REQUESTED" ? (
            <Button
              variant="outline"
              disabled={actions.isCancellingRequest}
              loading={actions.isCancellingRequest}
              onClick={() => actions.cancelRequest()}
            >
              Cancel request
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link {...buildExploreNavigation()}>Keep exploring</Link>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

function LeaveGroupButton({
  isLeaving,
  onLeave,
}: {
  isLeaving: boolean;
  onLeave: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isLeaving}>
          <LogOut className="size-4" aria-hidden="true" />
          {isLeaving ? "Leaving..." : "Leave group"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave this group?</AlertDialogTitle>
          <AlertDialogDescription>
            You will lose access to the group chat and planning workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              onLeave();
            }}
          >
            Leave group
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getPrimaryActionLabel({
  detail,
  isPending,
  joinStatus,
}: {
  detail: GroupPlanDetail;
  isPending: boolean;
  joinStatus?: "JOINED" | "REQUESTED";
}) {
  if (isPending) {
    return detail.viewer.canRequestToJoin ? "Sending request..." : "Joining...";
  }

  if (
    detail.viewer.relationship === "REQUESTED" ||
    joinStatus === "REQUESTED"
  ) {
    return "Request sent";
  }

  if (detail.viewer.canRequestToJoin) {
    return "Request to join";
  }

  if (detail.viewer.canJoin) {
    return "Join group";
  }

  if (detail.viewer.joinDisabledReason) {
    return formatStatusLabel(detail.viewer.joinDisabledReason);
  }

  return "Unavailable";
}

function getDockSummary(detail: GroupPlanDetail) {
  if (detail.viewer.relationship === "INVITED") {
    return "You have a pending invite to review.";
  }

  if (detail.viewer.relationship === "REQUESTED") {
    return "Your request is with the group managers.";
  }

  if (detail.viewer.canJoin) {
    return "This group is open, so you can join directly.";
  }

  if (detail.viewer.canRequestToJoin) {
    return "Send a request and the group can bring you in.";
  }

  if (detail.viewer.joinDisabledReason === "ALREADY_MEMBER") {
    return "You are already part of this group.";
  }

  return "The group is not taking new people right now.";
}
