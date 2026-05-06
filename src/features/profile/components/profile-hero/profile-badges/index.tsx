import type { User } from "@/shared/schemas";
import { normalizeTrustScore } from "@/features/profile/lib/profile-utils";
import { cn } from "@/shared/lib/utils";

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
    <div className="grid w-full shrink-0 grid-cols-3 items-start gap-3 sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:justify-center md:gap-4 md:justify-start">
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-muted sm:text-nano">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-[13px] font-extrabold leading-tight md:text-base",
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
