import type {
  OnlineStatus,
  Participant,
} from "@/features/activity/types/direct-chats.types";
import { OceanDiagram } from "@/features/profile/components/ocean-chart";
import type { OceanScores } from "@/features/profile/types/profile.types";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ExternalLink,
  Info,
  MessageSquareText,
  UserPlus,
} from "lucide-react";

interface ProfilePanelInfoProps {
  participant: Participant;
  isMobile?: boolean;
  isDirectChat?: boolean;
  onBack?: () => void;
}

function getOnlineStatusColor(status: OnlineStatus): string {
  switch (status) {
    case "ONLINE":
      return "bg-green-500";
    case "AWAY":
      return "bg-amber-500";
    case "OFFLINE":
      return "bg-muted-foreground/40";
  }
}

export function ProfilePanelInfo({
  participant,
  isMobile = false,
  isDirectChat = false,
  onBack,
}: ProfilePanelInfoProps) {
  const statusColor = getOnlineStatusColor(participant.onlineStatus);

  // Mock OCEAN scores for the side panel
  const mockOceanScores: OceanScores = {
    openness: 82,
    conscientiousness: 65,
    extraversion: 40,
    agreeableness: 88,
    neuroticism: 15,
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. Brand Header Area - Minimal solid cover */}
      <div className="relative h-24 md:h-28 w-full bg-forge-teal dark:bg-forge-teal-light overflow-hidden">
        {/* Subtle geometric texture instead of blobs */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

        {/* Navigation Buttons */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between z-40">
          {onBack ? (
            <Button
              size="icon"
              variant="outline"
              onClick={onBack}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-sm transition-all duration-200"
              aria-label="Go back"
            >
              <ChevronLeft size={18} />
            </Button>
          ) : (
            <div />
          )}

          <Link
            to="/profile"
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
          >
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-sm transition-all duration-200"
              aria-label="View full profile"
            >
              <ExternalLink size={14} />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Structured Avatar Section */}
      <div className="px-6 -mt-10 md:-mt-12 flex flex-col items-center text-center relative z-40 space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative group"
        >
          <img
            src={participant.avatar}
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

        {/* 3. Peer-led Identity */}
        <div className="space-y-0.5">
          <h3 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight leading-tight">
            {participant.name}
          </h3>
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-xs font-medium text-slate-muted tracking-normal">
              {participant.age || 24} ·{" "}
              {participant.location || "San Francisco, CA"}
            </p>
          </div>
        </div>

        {/* 4. Knowledgeable Actions */}
        <div className="flex items-center gap-2 w-full pt-1">
          {isDirectChat ? (
            <Button className="flex-1 rounded-xl bg-forge-teal dark:bg-forge-teal-light hover:opacity-90 text-white dark:text-hero-bg font-semibold h-10 gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
              <UserPlus size={16} />
              Connect
            </Button>
          ) : (
            <Button className="flex-1 rounded-xl bg-forge-teal dark:bg-forge-teal-light hover:opacity-90 text-white dark:text-hero-bg font-semibold h-10 gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
              <MessageSquareText size={16} />
              Message
            </Button>
          )}

          {!isDirectChat && (
            <Button
              variant="outline"
              className="h-10 w-10 rounded-xl border-border bg-card hover:bg-canvas hover:border-forge-teal transition-all flex items-center justify-center p-0"
              aria-label="Add Buddy"
            >
              <UserPlus size={18} className="text-slate-muted" />
            </Button>
          )}

          <Button
            variant="outline"
            className={cn(
              "h-10 rounded-xl border-border bg-card hover:bg-canvas hover:border-forge-teal transition-all flex items-center justify-center p-0",
              isDirectChat ? "flex-1" : "w-10",
            )}
            aria-label="Info"
          >
            <Info size={18} className="text-slate-muted" />
            {isDirectChat && (
              <span className="ml-2 text-sm font-semibold text-slate-muted group-hover:text-forge-teal transition-colors">
                Details
              </span>
            )}
          </Button>
        </div>

        {/* 5. Personality Pills - Structured Pattern */}
        <div className="flex items-center gap-2">
          {participant.personalityType && (
            <div className="bg-forge-teal dark:bg-forge-teal-light text-white dark:text-hero-bg text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
              {participant.personalityType}
            </div>
          )}
          <div className="bg-spark-amber/10 border border-spark-amber/20 text-spark-amber text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Trust: 98.2
          </div>
        </div>
      </div>

      {/* 6. About Section - Peer Wisdom style */}
      {participant.bio && (
        <div className="px-6 pt-10">
          <h4 className="text-xs font-semibold text-slate-muted uppercase tracking-widest px-1 mb-4">
            About
          </h4>
          <blockquote className="relative border-l-thick border-forge-teal/20 pl-4 py-1">
            <p className="text-sm text-ink leading-relaxed font-medium italic text-pretty opacity-90">
              "{participant.bio}"
            </p>
          </blockquote>
        </div>
      )}

      {/* 7. Geometric Analysis - OCEAN Profile (Not boxy) */}
      <div className="px-6 pt-8 pb-2 space-y-6 flex flex-col items-center">
        <div className="w-full">
          <h4 className="text-xs font-semibold text-slate-muted uppercase tracking-widest px-1 mb-2">
            Psychometric Profile
          </h4>
        </div>

        <div className="relative w-full aspect-square pointer-events-none opacity-90 hover:opacity-100 transition-opacity px-4">
          <div className="relative z-10 w-full h-full scale-110">
            <OceanDiagram scores={mockOceanScores} interactive={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
