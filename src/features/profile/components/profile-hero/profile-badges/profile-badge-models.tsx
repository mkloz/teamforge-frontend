import { Compass, Shield, UserPlus } from "lucide-react";

import { AnimatedCircularProgressBar } from "@/shared/components/ui/animated-circular-progress-bar";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/schemas";
import { normalizeTrustScore } from "@/features/profile/lib/profile-utils";

import type { ProfileBadgeModel } from "./profile-badge.types";

export function buildProfileBadges(
  user: User,
  archetype: string,
): ProfileBadgeModel[] {
  const trustScore = normalizeTrustScore(user.trustScore);
  const trustColorClass = getTrustColorClass(trustScore);
  const trustLabel = getTrustLabel(trustScore);
  const groupMode = archetype.replace(/^The\s+/i, "");

  return [
    {
      bgClass: trustColorClass,
      colorClass: trustColorClass,
      description: `A trust signal TeamForge uses when forming groups. Current score: ${trustScore}%.`,
      icon: Shield,
      iconBgClass: "bg-transparent",
      id: "trust",
      label: "Trust",
      renderIconWrapper: () =>
        renderTrustScoreIcon(trustColorClass, trustScore),
      value: trustLabel,
    },
    {
      bgClass: "text-ink",
      colorClass: "text-forge-teal",
      description: `A compact personality signal used alongside interests, age, and trust.`,
      icon: UserPlus,
      iconBgClass: "bg-forge-teal/10",
      id: "personality-type",
      label: "Type",
      value: user.personalityType || "N/A",
    },
    {
      bgClass: "text-ink",
      colorClass: "text-spark-amber",
      description: `A quick read on how this personality pattern may show up in a small group.`,
      icon: Compass,
      iconBgClass: "bg-spark-amber/10",
      id: "archetype",
      label: "Group mode",
      value: groupMode,
    },
  ];
}

function getTrustColorClass(trustScore: number) {
  if (trustScore >= 80) {
    return "text-primary";
  }

  return trustScore >= 50 ? "text-spark-amber" : "text-destructive";
}

function getTrustLabel(trustScore: number) {
  if (trustScore >= 80) {
    return "High";
  }

  return trustScore >= 50 ? "Medium" : "Low";
}

function renderTrustScoreIcon(trustColorClass: string, value: number) {
  return (
    <div className="relative w-8 h-8 md:w-9 md:h-9 flex shrink-0 items-center justify-center group-hover:scale-110 transition-transform duration-300">
      <div className="absolute inset-0 bg-transparent flex items-center justify-center">
        <AnimatedCircularProgressBar
          max={100}
          min={0}
          value={value}
          gaugePrimaryColor="currentColor"
          gaugeSecondaryColor="rgba(107, 114, 128, 0.15)"
          className={cn("w-full h-full text-[0px]", trustColorClass)}
        />
      </div>
      <span
        className={cn(
          "relative text-nano md:text-micro font-black leading-none",
          trustColorClass,
        )}
      >
        {value}
      </span>
    </div>
  );
}
