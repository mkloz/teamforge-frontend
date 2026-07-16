import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";

export interface Step4SuccessProps {
  planTitle: string;
  participants: ForgeParticipant[];
}

export interface ParticipantRowProps {
  participant: ForgeParticipant;
}
