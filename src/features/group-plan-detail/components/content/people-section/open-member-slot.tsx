import { Plus, UserPlus } from "lucide-react";
import type { GroupInviteSuggestionsState } from "@/features/group-plan-detail/hooks/use-group-invite-suggestions";
import { cn } from "@/shared/lib/utils";
import { InviteMemberDialog } from "./invite-member-dialog";

export function OpenMemberSlot({
  invitations,
  maxMembers,
  slotNumber,
}: {
  invitations: GroupInviteSuggestionsState;
  maxMembers: number;
  slotNumber: number;
}) {
  const interactive = invitations.isEligible;
  const slot = (
    <button
      type="button"
      aria-label={
        interactive
          ? `Invite someone to member slot ${slotNumber} of ${maxMembers}`
          : `Open member slot ${slotNumber} of ${maxMembers}`
      }
      className={cn(
        "group/slot flex min-h-16 w-full items-center gap-3 rounded-xl border border-border/45 border-dashed px-2 py-2 text-left text-muted-foreground transition-[background-color,border-color,color] duration-150",
        interactive &&
          "hover:border-forge-teal/45 hover:bg-forge-teal/5 hover:text-forge-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30",
        !interactive && "cursor-default opacity-65",
      )}
      disabled={!interactive}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/55 border-dashed bg-muted/25 transition-colors group-hover/slot:border-forge-teal/35 group-hover/slot:bg-forge-teal/8">
        {interactive ? (
          <UserPlus className="size-4" aria-hidden="true" />
        ) : (
          <Plus className="size-4" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-sm">
          {interactive ? "Invite someone" : "Open member slot"}
        </span>
        <span className="mt-0.5 block text-muted-foreground/70 text-xs">
          Slot {slotNumber} of {maxMembers}
        </span>
      </span>
    </button>
  );

  return interactive ? (
    <InviteMemberDialog invitations={invitations} trigger={slot} />
  ) : (
    slot
  );
}
