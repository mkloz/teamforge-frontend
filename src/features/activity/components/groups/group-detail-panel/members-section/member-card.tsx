import { cn } from "@/shared/lib/utils";
import { MemberSummary } from "./member-card/member-summary";
import { RemoveMemberAction } from "./member-card/remove-member-action";
import type { MemberCardProps } from "./member-card/types";
import { getMemberCardViewState } from "./member-card-view-state";

export function MemberCard({
  canRemove = false,
  isViewer = false,
  member,
  onRemove,
  onShowProfile,
  removing = false,
}: MemberCardProps) {
  const viewState = getMemberCardViewState(member);

  return (
    <article
      className={cn(
        "group/member flex min-h-16 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-150 focus-within:bg-muted/50 hover:bg-muted/50",
        viewState.isAdmin && "bg-forge-teal/5",
      )}
    >
      {onShowProfile ? (
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center justify-start gap-3 rounded-xl text-left text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30"
          aria-label={`Open ${viewState.memberName} details`}
          onClick={() => onShowProfile(member)}
        >
          <MemberSummary
            isViewer={isViewer}
            member={member}
            viewState={viewState}
          />
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MemberSummary
            isViewer={isViewer}
            member={member}
            viewState={viewState}
          />
        </div>
      )}

      {canRemove && onRemove ? (
        <RemoveMemberAction
          member={member}
          memberName={viewState.memberName}
          onRemove={onRemove}
          removing={removing}
        />
      ) : null}
    </article>
  );
}
