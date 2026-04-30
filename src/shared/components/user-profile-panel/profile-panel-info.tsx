import { OceanDiagram } from "@/shared/components/psychometrics/ocean-chart";
import { Button } from "@/shared/components/ui/button";
import { buildProfileNavigation } from "@/shared/lib/app-route";
import { cn } from "@/shared/lib/utils";
import type { OnlineStatus } from "@/shared/schemas/enums";
import type { OceanScores } from "@/shared/types/psychometrics";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ExternalLink,
  Info,
  MessageSquareText,
  UserPlus,
} from "lucide-react";
import type { UserProfilePanelParticipant } from "./types";

interface ProfilePanelInfoProps {
  participant: UserProfilePanelParticipant;
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
    case "OFFLINE":
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
    <div className="flex flex-col w-full">
      <div className="relative h-24 md:h-28 w-full bg-forge-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

        <div className="absolute inset-x-4 top-4 flex items-center justify-between z-40">
          {onBack ? (
            <Button
              size="icon"
              variant="outline"
              onClick={onBack}
              className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-sm transition-all"
              aria-label="Go back"
            >
              <ChevronLeft size={18} />
            </Button>
          ) : (
            <div />
          )}

          <Link
            {...buildProfileNavigation()}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
          >
            <Button
              size="icon"
              variant="outline"
              className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-sm transition-all"
              aria-label="View full profile"
            >
              <ExternalLink size={14} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-6 -mt-10 md:-mt-12 flex flex-col items-center text-center relative z-40 space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative group"
        >
          <img
            src={participant.avatar || ""}
            alt={participant.name}
            className={cn(
              "rounded-full object-cover bg-card ring-4 ring-canvas shadow-sm transition-all duration-300",
              isMobile ? "w-20 h-20" : "w-24 h-24",
            )}
          />
          <span
            className={cn(
              "absolute bottom-0.5 right-0.5 rounded-full border-4 border-canvas shadow-sm z-10",
              isMobile ? "w-5 h-5" : "w-6 h-6",
              statusColor,
            )}
          />
        </motion.div>

        <div className="space-y-0.5">
          <h3 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight leading-tight">
            {participant.name}
          </h3>
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-xs font-medium text-slate-muted tracking-normal">
              {participantDetails ?? "Profile details syncing"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full pt-1">
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
              <span className="ml-2 text-sm font-semibold text-slate-muted group-hover:text-forge-teal transition-colors">
                Details
              </span>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {participant.personalityType && (
            <div className="bg-forge-teal text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
              {participant.personalityType}
            </div>
          )}
          <div className="bg-spark-amber/10 border border-spark-amber/20 text-spark-amber text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Trust {formatTrustScore(participant.trustScore)}
          </div>
        </div>
      </div>

      {participant.bio && (
        <div className="px-6 pt-10">
          <h4 className="text-xs font-semibold text-slate-muted uppercase tracking-widest px-1 mb-4">
            About
          </h4>
          <div className="relative bg-forge-teal/5 rounded-2xl p-4 border border-forge-teal/10">
            <p className="text-sm text-ink leading-relaxed font-medium italic text-pretty opacity-90">
              "{participant.bio}"
            </p>
          </div>
        </div>
      )}

      <div className="px-6 pt-8 pb-2 space-y-6 flex flex-col items-center">
        <div className="w-full">
          <h4 className="text-xs font-semibold text-slate-muted uppercase tracking-widest px-1 mb-2">
            Psychometric Profile
          </h4>
        </div>

        {oceanScores ? (
          <div className="relative w-full aspect-square pointer-events-none opacity-90 hover:opacity-100 transition-opacity px-4">
            <div className="relative z-10 w-full h-full scale-110">
              <OceanDiagram scores={oceanScores} interactive={false} />
            </div>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-border bg-card px-4 py-6 text-center">
            <p className="text-sm font-medium text-slate-muted">
              Psychometric profile syncing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
