import { normalizeTrustScore } from "@/features/profile/lib/profile-utils";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/schemas";

import { ProfileBadgeDivider } from "./profile-badge-divider";

interface ProfileBadgesProps {
  archetype: string;
  user: User;
}

export function ProfileBadges({ user, archetype }: ProfileBadgesProps) {
  const trustScore = normalizeTrustScore(user.trustScore);
  const trustLabel = getTrustLabel(trustScore);
  const groupMode = archetype.replace(/^The\s+/i, "");

  return (
    <div className="grid w-full shrink-0 grid-cols-3 items-start gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-center md:justify-start md:gap-4">
      <ProfileSignal
        accent="text-forge-teal"
        label="Trust"
        value={`${trustScore} ${trustLabel}`}
      />
      <ProfileBadgeDivider />
      <ProfileSignal label="Type" value={user.personalityType || "Open"} />
      <ProfileBadgeDivider />
      <ProfileSignal label="Group mode" value={groupMode} />
    </div>
  );
}

interface ProfileSignalProps {
  accent?: string;
  label: string;
  value: string;
}

function ProfileSignal({
  accent = "text-ink",
  label,
  value,
}: ProfileSignalProps) {
  return (
    <div className="min-w-0 text-center sm:text-left">
      <p className="font-bold text-[10px] text-slate-muted uppercase tracking-widest sm:text-nano">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-extrabold text-[13px] leading-tight md:text-base",
          accent,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function getTrustLabel(trustScore: number) {
  if (trustScore >= 80) {
    return "High";
  }

  return trustScore >= 50 ? "Medium" : "Low";
}
