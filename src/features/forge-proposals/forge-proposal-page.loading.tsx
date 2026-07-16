import { ForgeProposalSurface } from "@/features/forge-proposals/components/forge-proposal-surface";

export function ForgeProposalPageLoading() {
  return <ForgeProposalSurface state={{ status: "loading" }} />;
}
