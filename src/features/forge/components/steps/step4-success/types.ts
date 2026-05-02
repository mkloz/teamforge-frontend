import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";

export interface Step4SuccessProps {
  planTitle: string;
  participants: ForgeParticipant[];
  removedIds: Set<string>;
  onRemoveParticipant: (id: string) => void;
  onRestoreParticipant: (id: string) => void;
  onReforge: () => void;
}

export interface ParticipantRowProps {
  participant: ForgeParticipant;
  removed: boolean;
  onRemoveParticipant: (id: string) => void;
  onRestoreParticipant: (id: string) => void;
}
