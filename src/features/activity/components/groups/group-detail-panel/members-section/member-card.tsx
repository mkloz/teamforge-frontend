import { BadgeCheck, Crown, UserMinus } from "lucide-react";
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
            "h-10 w-10 ring-1 ring-border/20 transition-all group-hover/member:ring-border/40",
            isHighCompatibility && "ring-2 ring-forge-teal/30",
          )}
          imageClassName="transition-[scale,transform] duration-500 group-hover/member:scale-110"
        />
        {onlineStatus && (
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-canvas shadow-sm",
              onlineStatus === "ONLINE"
                ? "bg-forge-teal"
                : onlineStatus === "AWAY"
                  ? "bg-spark-amber"
                  : "bg-slate-muted/40",
            )}
          />
        )}
        {isAdmin && (
          <div
            className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-md border-2 border-canvas bg-spark-amber text-white shadow-md"
            title="Group Admin"
          >
            <Crown className="size-3" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {member.user?.name}
          </p>
          <Badge
            variant="mbti"
            className="h-5 px-2 text-xs font-bold tracking-tight"
          >
            {member.user?.personalityType}
          </Badge>
          {isHighCompatibility && (
            <BadgeCheck size={12} className="text-forge-teal" />
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Trust {member.user?.trustScore}%
          </span>
          <div className="h-2 w-px bg-border/50" />
          <span
            className={cn(
              "text-xs font-bold tracking-wider uppercase",
              isHighCompatibility
                ? "text-forge-teal"
                : "text-muted-foreground/60",
            )}
          >
            {member.compatibilityScore}% match
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="group/member flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition-all duration-300 hover:border-border/50 hover:bg-muted/30">
      {onShowProfile ? (
        <Button
          type="button"
          variant="ghost"
          onClick={handleShowProfile}
          className="h-auto min-w-0 flex-1 justify-start rounded-lg border-0 bg-transparent p-0 text-left focus-visible:ring-forge-teal/30"
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

      {/* Subtle interaction indicator */}
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
              className="shrink-0"
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
                {removing ? "Removing..." : "Remove Member"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <div className="size-1.5 rounded-full bg-border opacity-0 transition-opacity group-hover/member:opacity-100" />
      )}
    </div>
  );
}
