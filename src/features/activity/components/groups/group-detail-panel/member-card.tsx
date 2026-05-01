import { Crown, Sparkles, UserMinus } from "lucide-react";
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
import type { GroupMember } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Avatar } from "@/shared/components/common/avatar";

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

  return (
    <div
      role={onShowProfile ? "button" : undefined}
      tabIndex={onShowProfile ? 0 : undefined}
      onClick={onShowProfile ? handleShowProfile : undefined}
      onKeyDown={
        onShowProfile
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleShowProfile();
              }
            }
          : undefined
      }
      className="w-full flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all duration-300 group/member text-left"
    >
      {/* Avatar Container */}
      <div className="relative shrink-0">
        <Avatar
          src={member.user?.avatar}
          name={member.user?.name}
          className={cn(
            "h-10 w-10 ring-1 ring-border/20 transition-all group-hover/member:ring-border/40",
            isHighCompatibility && "ring-forge-teal/30 ring-2",
          )}
          imageClassName="transition-transform duration-500 group-hover/member:scale-110"
        />
        {onlineStatus && (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-canvas shadow-sm",
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
            className="absolute -top-1 -left-1 flex items-center justify-center w-5 h-5 rounded-md bg-amber-500 shadow-md text-white border-2 border-canvas"
            title="Group Admin"
          >
            <Crown size={10} fill="currentColor" />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-foreground truncate">
            {member.user?.name}
          </p>
          <Badge
            variant="mbti"
            className="text-[9px] h-4 px-1.5 font-bold tracking-tight"
          >
            {member.user?.personalityType}
          </Badge>
          {isHighCompatibility && (
            <Sparkles size={12} className="text-forge-teal animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            Trust {member.user?.trustScore}%
          </span>
          <div className="w-px h-2 bg-border/50" />
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider",
              isHighCompatibility
                ? "text-forge-teal"
                : "text-muted-foreground/60",
            )}
          >
            {member.compatibilityScore}% match
          </span>
        </div>
      </div>

      {/* Subtle interaction indicator */}
      {canRemove && onRemove ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              type="button"
              disabled={removing}
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        <div className="w-1.5 h-1.5 rounded-full bg-border opacity-0 group-hover/member:opacity-100 transition-opacity" />
      )}
    </div>
  );
}
