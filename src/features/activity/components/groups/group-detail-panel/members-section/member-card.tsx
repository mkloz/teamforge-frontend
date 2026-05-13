import { BadgeCheck, Crown, UserMinus, UserRound } from "lucide-react";
import type { GroupMember } from "@/features/activity/lib/activity-contract";
import { Avatar } from "@/shared/components/common/avatar";
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
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface MemberCardProps {
  canRemove?: boolean;
  member: GroupMember;
  onRemove?: (memberId: string) => Promise<void> | void;
  onShowProfile?: (member: GroupMember) => void;
  removing?: boolean;
}

export function MemberCard({
  canRemove = false,
  member,
  onRemove,
  onShowProfile,
  removing = false,
}: MemberCardProps) {
  const isAdmin = member.role === "ADMIN";
  const isHighCompatibility = (member.compatibilityScore || 0) > 90;
  const onlineStatus = member.user?.onlineStatus;

  const handleShowProfile = () => {
    onShowProfile?.(member);
  };

  const memberSummary = (
    <>
      <div className="relative shrink-0">
        <Avatar
          src={member.user?.avatar}
          name={member.user?.name}
          className={cn(
            "size-10 ring-1 ring-border/20 transition-all group-hover/member:ring-border/40",
            isHighCompatibility && "ring-2 ring-forge-teal/30",
          )}
          imageClassName="transition-transform duration-500 group-hover/member:scale-110"
        />
        {onlineStatus && (
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-canvas shadow-sm",
              onlineStatus === "ONLINE"
                ? "bg-forge-teal"
                : onlineStatus === "AWAY"
                  ? "bg-spark-amber"
                  : "bg-slate-muted/40",
            )}
          />
        )}
        {isAdmin && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-md border-2 border-canvas bg-spark-amber text-white shadow-md">
                <Crown className="size-3" fill="currentColor" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Group admin</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Info Section */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          <p className="truncate font-semibold text-foreground text-sm">
            {member.user?.name}
          </p>
          <Badge
            variant="mbti"
            className="h-4 shrink-0 px-1.5 font-bold leading-none tracking-normal"
          >
            {member.user?.personalityType}
          </Badge>
          {isHighCompatibility && (
            <BadgeCheck size={12} className="text-forge-teal" />
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-muted-foreground text-xs">
            Trust {member.user?.trustScore}%
          </span>
          <div className="h-2 w-px bg-border/50" />
          <span
            className={cn(
              "font-bold text-xs",
              isHighCompatibility
                ? "text-forge-teal"
                : "text-muted-foreground/60",
            )}
          >
            {member.compatibilityScore}% fit
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="group/member flex w-full items-center gap-2 px-1.5 py-1.5 text-left transition-colors duration-150 focus-within:bg-slate-muted/10 hover:bg-slate-muted/10">
      {onShowProfile ? (
        <Button
          type="button"
          variant="link"
          onClick={handleShowProfile}
          className="h-auto min-w-0 flex-1 justify-start rounded-lg p-0 text-left text-foreground! focus-visible:ring-forge-teal/30 hover:enabled:no-underline"
          contentClassName="min-w-0 justify-start gap-3"
          aria-label={`View ${member.user?.name ?? "member"} profile`}
        >
          {memberSummary}
        </Button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {memberSummary}
        </div>
      )}

      <div className="relative size-8 shrink-0">
        {onShowProfile ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="accentGhost"
                size="icon-xs"
                className={cn(
                  "absolute inset-0 size-8 rounded-lg opacity-80 transition-opacity group-hover/member:opacity-100",
                  canRemove &&
                    "group-focus-within/member:opacity-0 group-hover/member:opacity-0",
                )}
                onClick={handleShowProfile}
                aria-label={`View ${member.user?.name ?? "member"} profile`}
              >
                <UserRound className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View profile</TooltipContent>
          </Tooltip>
        ) : null}

        {canRemove && onRemove ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon-xs"
                type="button"
                disabled={removing}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className="absolute inset-0 size-8 opacity-0 transition-opacity group-focus-within/member:opacity-100 group-hover/member:opacity-100"
                aria-label={`Remove ${member.user?.name ?? "member"} from group`}
              >
                <UserMinus size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(event) => event.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove member?</AlertDialogTitle>
                <AlertDialogDescription>
                  {member.user?.name ?? "This member"} will lose access to the
                  group chat and planning workspace.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    void onRemove(member.userId);
                  }}
                >
                  {removing ? "Removing..." : "Remove member"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </div>
  );
}
