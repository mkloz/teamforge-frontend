import type { GroupMember } from "@/features/activity/lib/activity-contract";
import type { MemberCardViewState } from "../member-card-view-state";
import { MemberAvatar } from "./member-avatar";
import { MemberIdentityRow } from "./member-identity-row";
import { MemberMetrics } from "./member-metrics";

export function MemberSummary({
  isViewer,
  member,
  viewState,
}: {
  isViewer: boolean;
  member: GroupMember;
  viewState: MemberCardViewState;
}) {
  return (
    <>
      <MemberAvatar member={member} viewState={viewState} />
      <div className="min-w-0 flex-1 overflow-hidden">
        <MemberIdentityRow
          isViewer={isViewer}
          member={member}
          memberName={viewState.memberName}
        />
        <MemberMetrics viewState={viewState} />
      </div>
    </>
  );
}
