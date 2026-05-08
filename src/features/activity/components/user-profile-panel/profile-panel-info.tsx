import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ExternalLink,
  Info,
  MessageSquareText,
  UserPlus,
} from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import { OceanDiagram } from "@/shared/components/psychometrics/ocean-chart";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { OnlineStatus } from "@/shared/schemas/enums";
import type { OceanScores } from "@/shared/types/psychometrics";
import type { UserProfilePanelParticipant } from "./types";

interface ProfilePanelInfoProps {
  participant: UserProfilePanelParticipant;
  profileNavigation?: { to: "/profile" };
  isMobile?: boolean;
  isDirectChat?: boolean;
  onBack?: () => void;
}

function getOnlineStatusColor(status: OnlineStatus): string {
  switch (status) {
    case "ONLINE":
      return "bg-forge-teal";
    case "AWAY":
      return "bg-spark-amber";
    default:
      return "bg-muted-foreground/40";
  }
}

function formatTrustScore(trustScore: number): string {
  const normalizedScore =
    trustScore > 0 && trustScore <= 1 ? trustScore * 100 : trustScore;

  return `${Math.round(normalizedScore)}%`;
}

function getParticipantDetails(
  participant: UserProfilePanelParticipant,
): string | null {
  const details = [
    participant.age !== null ? String(participant.age) : null,
    participant.city,
  ].filter(Boolean);

  return details.length > 0 ? details.join(" · ") : null;
}

function getParticipantOceanScores(
  participant: UserProfilePanelParticipant,
): OceanScores | null {
  const hasAnyOceanScores = [
    participant.oceanO,
    participant.oceanC,
    participant.oceanE,
    participant.oceanA,
    participant.oceanN,
  ].some((score) => score !== null);

  if (!hasAnyOceanScores) {
    return null;
  }

  return {
    openness: participant.oceanO ?? 50,
    conscientiousness: participant.oceanC ?? 50,
    extraversion: participant.oceanE ?? 50,
    agreeableness: participant.oceanA ?? 50,
    neuroticism: participant.oceanN ?? 50,
  };
}

export function ProfilePanelInfo({
  participant,
  profileNavigation,
  isMobile = false,
  isDirectChat = false,
  onBack,
}: ProfilePanelInfoProps) {
  const statusColor = getOnlineStatusColor(
    participant.onlineStatus || "OFFLINE",
  );
  const oceanScores = getParticipantOceanScores(participant);
  const participantDetails = getParticipantDetails(participant);

  return (
    <div className="flex w-full flex-col">
      <div className="relative h-24 w-full overflow-hidden bg-forge-teal md:h-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-10" />

        <div className="absolute inset-x-4 top-4 z-40 flex items-center justify-between">
          {onBack ? (
            <Button
              size="icon"
              variant="outline"
              onClick={onBack}
              className="rounded-full border-white/20 bg-white/10 text-white shadow-sm transition-all hover:bg-white/20"
              aria-label="Go back"
            >
              <ChevronLeft size={18} />
            </Button>
          ) : (
            <div />
          )}

          {profileNavigation && (
            <Link
              {...profileNavigation}
              className="block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Button
                size="icon"
                variant="outline"
                className="rounded-full border-white/20 bg-white/10 text-white shadow-sm transition-all hover:bg-white/20"
                aria-label="View full profile"
              >
                <ExternalLink size={14} />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="relative z-40 -mt-10 flex flex-col items-center space-y-4 px-6 text-center md:-mt-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="group relative"
        >
          <Avatar
            src={participant.avatar}
            name={participant.name}
            className={cn(
              "bg-card shadow-sm ring-4 ring-canvas transition-all duration-300",
              isMobile ? "h-20 w-20" : "h-24 w-24",
            )}
          />
          <span
            className={cn(
              "absolute right-0.5 bottom-0.5 z-10 rounded-full border-4 border-canvas shadow-sm",
              isMobile ? "h-5 w-5" : "h-6 w-6",
              statusColor,
            )}
          />
        </motion.div>

        <div className="space-y-0.5">
          <h3 className="font-extrabold text-ink text-xl leading-tight tracking-tight md:text-2xl">
            {participant.name}
          </h3>
          <div className="flex items-center justify-center gap-1.5">
            <p className="font-medium text-slate-muted text-xs tracking-normal">
              {participantDetails ?? "Profile details syncing"}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 pt-1">
          {isDirectChat ? (
            <Button variant="primary" className="flex-1">
              <UserPlus size={16} />
              Connect
            </Button>
          ) : (
            <Button variant="primary" className="flex-1">
              <MessageSquareText size={16} />
              Message
            </Button>
          )}

          {!isDirectChat && (
            <Button variant="outline" size="icon" aria-label="Add Buddy">
              <UserPlus size={18} />
            </Button>
          )}

          <Button
            variant="outline"
            size={isDirectChat ? "default" : "icon"}
            className={cn(isDirectChat && "flex-1")}
            aria-label="Info"
          >
            <Info size={18} />
            {isDirectChat && (
              <span className="ml-2 font-semibold text-slate-muted text-sm transition-colors group-hover:text-forge-teal">
                Details
              </span>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {participant.personalityType && (
            <div className="rounded-full bg-forge-teal px-3 py-1 font-bold text-[11px] text-white uppercase tracking-widest shadow-sm">
              {participant.personalityType}
            </div>
          )}
          <div className="rounded-full border border-spark-amber/20 bg-spark-amber/10 px-3 py-1 font-bold text-[11px] text-spark-amber uppercase tracking-widest">
            Trust {formatTrustScore(participant.trustScore)}
          </div>
        </div>
      </div>

      {participant.bio && (
        <div className="px-6 pt-10">
          <h4 className="mb-4 px-1 font-semibold text-slate-muted text-xs uppercase tracking-widest">
            About
          </h4>
          <div className="relative rounded-xl border border-forge-teal/10 bg-forge-teal/5 p-4">
            <p className="text-pretty font-medium text-ink text-sm italic leading-relaxed opacity-90">
              "{participant.bio}"
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center space-y-6 px-6 pt-8 pb-2">
        <div className="w-full">
          <h4 className="mb-2 px-1 font-semibold text-slate-muted text-xs uppercase tracking-widest">
            Psychometric Profile
          </h4>
        </div>

        {oceanScores ? (
          <div className="pointer-events-none relative aspect-square w-full px-4 opacity-90 transition-opacity hover:opacity-100">
            <div className="relative z-10 h-full w-full scale-110">
              <OceanDiagram scores={oceanScores} interactive={false} />
            </div>
          </div>
        ) : (
          <div className="w-full rounded-xl border border-border bg-card px-4 py-6 text-center">
            <p className="font-medium text-slate-muted text-sm">
              Psychometric profile syncing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
