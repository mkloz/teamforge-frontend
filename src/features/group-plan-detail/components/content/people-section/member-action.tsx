import { Link } from "@tanstack/react-router";
import { MessageCircle, UserRoundPlus } from "lucide-react";
import type { GroupPlanDetailMember } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

const memberActionClassName =
  "flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-80 transition-colors duration-150 hover:bg-forge-teal/10 hover:text-forge-teal group-hover:opacity-100";

export function MemberAction({ member }: { member: GroupPlanDetailMember }) {
  if (member.knownConnection) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/activity"
            search={{ kind: "dm" as const }}
            className={memberActionClassName}
            aria-label={`Message ${member.name}`}
          >
            <MessageCircle className="size-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top">Message {member.name}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={memberActionClassName}
          aria-label={`Connect with ${member.name}`}
        >
          <UserRoundPlus className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">Connect with {member.name}</TooltipContent>
    </Tooltip>
  );
}
