import type { FormationCandidate } from "@/features/plan-creation/lib/plan-creation-contract";
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
  participants: FormationCandidate[];
  removedIds: Set<string>;
  targetSize: number;
  onRemoveParticipant: (id: string) => void;
  onRestoreParticipant: (id: string) => void;
  onRevisePlan: () => void;
}

export interface ParticipantRowProps {
  participant: FormationCandidate;
  removed: boolean;
  highlight?: boolean;
  onRemoveParticipant: (id: string) => void;
  onRestoreParticipant: (id: string) => void;
}
