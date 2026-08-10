import { GroupProposalSurface } from "@/features/group-proposals/components/group-proposal-surface";

export function GroupProposalPageLoading() {
  return <GroupProposalSurface state={{ status: "loading" }} />;
}
