import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import type { LocationMode, PlanScheduleMode } from "@/shared/schemas/enums";

export interface Step4SuccessProps {
  groupId: string | null;
  groupName: string;
  inviteCopied: boolean;
  manualInviteeIds: string[];
  locationType: LocationMode;
  onCopyLink: () => void;
  onManualInviteeToggle: (id: string) => void;
  planTitle: string;
  planDate: string;
  planLocation: string;
  planScheduleMode: PlanScheduleMode;
  planTime: string;
  participants: ForgeParticipant[];
  removedIds: Set<string>;
  targetSize: number;
  onRemoveParticipant: (id: string) => void;
  onRestoreParticipant: (id: string) => void;
  onReforge: () => void;
}

export interface ParticipantRowProps {
  participant: ForgeParticipant;
  removed: boolean;
  highlight?: boolean;
  onRemoveParticipant: (id: string) => void;
  onRestoreParticipant: (id: string) => void;
}
