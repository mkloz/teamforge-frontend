import { UserMinus } from "lucide-react";
import type { GroupMember } from "@/features/activity/lib/activity-contract";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import type { MemberCardProps } from "./types";

export function RemoveMemberAction({
  member,
  memberName,
  onRemove,
  removing,
}: {
  member: GroupMember;
  memberName: string;
  onRemove: NonNullable<MemberCardProps["onRemove"]>;
  removing: boolean;
}) {
  return (
    <div className="relative z-20 shrink-0">
      <ActionDialog
        cancelLabel="Keep member"
        confirmLabel={removing ? "Removing..." : "Remove member"}
        description={`${
          member.user?.name ?? "This member"
        } will lose access to the group chat and planning workspace.`}
        loading={removing}
        onConfirm={() => onRemove(member.userId)}
        onContentClick={(event) => event.stopPropagation()}
        title="Remove member?"
        tone="danger"
        trigger={
          <Button
            variant="destructive"
            size="icon-xs"
            type="button"
            disabled={removing}
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="size-8 max-md:opacity-100 md:opacity-0 md:transition-all md:duration-150 md:group-hover/member:opacity-100 focus-visible:md:opacity-100"
            aria-label={`Remove ${memberName} from group`}
          >
            <UserMinus className="size-3.5" />
          </Button>
        }
      />
    </div>
  );
}
