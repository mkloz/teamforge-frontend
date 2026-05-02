export interface Step6InviteProps {
  planTitle: string;
  planDate: string;
  planLocation: string;
  activityTitle: string;
  participantCount: number;
  inviteeCount: number;
  forgeMode: "AUTO" | "MANUAL";
  coverImage: string | null;
  inviteCopied: boolean;
  onCopyLink: () => void;
}
