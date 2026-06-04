import { useProfileCommonFriends } from "@/features/profile/hooks/use-profile-common-friends";
import { useProfileFriendRequests } from "@/features/profile/hooks/use-profile-friend-requests";
import { useProfileFriends } from "@/features/profile/hooks/use-profile-friends";
import { useProfilePublicFriends } from "@/features/profile/hooks/use-profile-public-friends";
import { TYPE_INFO } from "@/features/profile/lib/archetypes";
import { normalizeTrustScore } from "@/features/profile/lib/profile-utils";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { SheetTrigger } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";
import type { ReactNode } from "react";
import { ProfileBadgeDivider } from "./profile-badge-divider";

interface ProfileBadgesProps {
  archetype: string;
  user: User;
  onOpenFriends?: (tab: "friends" | "requests" | "public_friends") => void;
}

export function ProfileBadges({
  user,
  archetype,
  onOpenFriends,
}: ProfileBadgesProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const isSelf = currentUser?.id === user.id;

  const { friends } = useProfileFriends();
  const { requests } = useProfileFriendRequests();
  const { commonFriends } = useProfileCommonFriends(
    !isSelf ? user.id : undefined,
  );
  const { publicFriends } = useProfilePublicFriends(
    !isSelf && user.showFriendsListOnProfile ? user.id : "",
  );

  const friendsCount = friends?.length ?? 0;
  const requestsCount = requests?.length ?? 0;
  const commonFriendsCount = commonFriends?.length ?? 0;
  const publicFriendsCount = publicFriends?.length ?? 0;

  const trustScore = normalizeTrustScore(user.trustScore);
  const trustLabel = getTrustLabel(trustScore);
  const groupMode = archetype.replace(/^The\s+/i, "");

  const canShowPublicFriends = !isSelf && user.showFriendsListOnProfile;

  return (
    <div className="flex w-full shrink-0 flex-wrap items-center justify-start gap-x-3 gap-y-3 sm:w-auto sm:gap-4 sm:gap-y-4">
      {/* Trust score — opens a popover explaining what it means */}
      <TrustBadge trustScore={trustScore} trustLabel={trustLabel} />

      <ProfileBadgeDivider />

      {/* Personality type — opens a popover with full type title + category */}
      <TypeBadge personalityType={user.personalityType ?? null} />

      <ProfileBadgeDivider />

      {/* Group role / archetype — opens a popover with role context */}
      <RoleBadge archetype={archetype} groupMode={groupMode} />

      {isSelf ? (
        <div className="hidden sm:contents">
          <ProfileBadgeDivider className="hidden sm:block" />
          <SheetTrigger asChild>
            <button
              type="button"
              onClick={() => onOpenFriends?.("friends")}
              className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ProfileSignal label="Friends" value={friendsCount.toString()} />
            </button>
          </SheetTrigger>

          {requestsCount > 0 && (
            <>
              <ProfileBadgeDivider className="hidden sm:block" />
              <SheetTrigger asChild>
                <button
                  type="button"
                  onClick={() => onOpenFriends?.("requests")}
                  className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ProfileSignal
                    label="Requests"
                    value={requestsCount.toString()}
                    accent="text-spark-amber"
                  />
                </button>
              </SheetTrigger>
            </>
          )}
        </div>
      ) : (
        <div className="hidden sm:contents">
          {canShowPublicFriends && (
            <>
              <ProfileBadgeDivider className="hidden sm:block" />
              <SheetTrigger asChild>
                <button
                  type="button"
                  onClick={() => onOpenFriends?.("public_friends")}
                  className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ProfileSignal
                    label="Friends"
                    value={publicFriendsCount.toString()}
                  />
                </button>
              </SheetTrigger>
            </>
          )}
          {commonFriendsCount > 0 && (
            <>
              <ProfileBadgeDivider className="hidden sm:block" />
              <SheetTrigger asChild>
                <button
                  type="button"
                  onClick={() => onOpenFriends?.("friends")}
                  className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ProfileSignal
                    label="Mutual Friends"
                    value={commonFriendsCount.toString()}
                  />
                </button>
              </SheetTrigger>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Trust badge with popover ────────────────────────────────────────────────

function TrustBadge({
  trustScore,
  trustLabel,
}: {
  trustScore: number;
  trustLabel: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`Trust score: ${trustScore} ${trustLabel}. Click for more information.`}
        >
          <ProfileSignal
            accent="text-forge-teal"
            label="Trust"
            value={
              <span className="inline-flex items-center">
                {trustScore}
                <span className="hidden sm:inline whitespace-pre"> {trustLabel}</span>
              </span>
            }
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-64 border-white/8 bg-[#131312] p-4"
      >
        <TrustPopoverContent trustScore={trustScore} trustLabel={trustLabel} />
      </PopoverContent>
    </Popover>
  );
}

function TrustPopoverContent({
  trustScore,
  trustLabel,
}: {
  trustScore: number;
  trustLabel: string;
}) {
  const tiers: Array<{ label: string; range: string; active: boolean }> = [
    { label: "High", range: "80–100", active: trustLabel === "High" },
    { label: "Medium", range: "50–79", active: trustLabel === "Medium" },
    { label: "Low", range: "0–49", active: trustLabel === "Low" },
  ];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-white">Trust score</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-muted">
          Built from how groups have gone. Each completed activity and honest
          review shapes this number.
        </p>
      </div>

      <div className="space-y-1.5">
        {tiers.map((tier) => (
          <div
            key={tier.label}
            className={cn(
              "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
              tier.active
                ? "bg-forge-teal/12 text-forge-teal"
                : "text-slate-muted",
            )}
          >
            <span className="font-medium">{tier.label}</span>
            <span className="tabular-nums opacity-70">{tier.range}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/6 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-muted">Current</span>
          <span className="text-sm font-bold tabular-nums text-forge-teal">
            {trustScore}
          </span>
        </div>

        {/* Score bar */}
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-forge-teal transition-all duration-500"
            style={{ width: `${trustScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Personality type badge with popover ─────────────────────────────────────

const MBTI_CATEGORY: Record<PersonalityType, string> = {
  INTJ: "Analyst",
  INTP: "Analyst",
  ENTJ: "Analyst",
  ENTP: "Analyst",
  INFJ: "Diplomat",
  INFP: "Diplomat",
  ENFJ: "Diplomat",
  ENFP: "Diplomat",
  ISTJ: "Sentinel",
  ISFJ: "Sentinel",
  ESTJ: "Sentinel",
  ESFJ: "Sentinel",
  ISTP: "Explorer",
  ISFP: "Explorer",
  ESTP: "Explorer",
  ESFP: "Explorer",
};

const MBTI_DESCRIPTION: Record<PersonalityType, string> = {
  INTJ: "Strategic, independent, and driven by a long-range vision.",
  INTP: "Analytical and inventive — thrives on solving abstract problems.",
  ENTJ: "Natural-born organiser who rallies people around a shared goal.",
  ENTP: "Quick thinker who finds a new angle on every conversation.",
  INFJ: "Quietly insightful — understands people at a deeper level.",
  INFP: "Creative and empathetic, brings warmth and meaning to a group.",
  ENFJ: "Energises others and helps groups move toward a common purpose.",
  ENFP: "Spontaneous and ideas-driven — keeps things lively and open.",
  ISTJ: "Reliable, thorough, and the kind of person who actually shows up.",
  ISFJ: "Warm and dependable — creates comfort for everyone around them.",
  ESTJ: "Efficient organiser who keeps the group on track.",
  ESFJ: "Social glue — makes sure everyone feels included.",
  ISTP: "Calm under pressure and quietly skilled at practical things.",
  ISFP: "Gentle and perceptive, brings a creative and sensory awareness.",
  ESTP: "High-energy and action-first — turns plans into motion.",
  ESFP: "Enthusiastic and fun, makes any group feel alive.",
};

function TypeBadge({
  personalityType,
}: {
  personalityType: PersonalityType | null;
}) {
  const typeValue = personalityType ?? "Open";

  if (!personalityType) {
    return <ProfileSignal label="Type" value={typeValue} />;
  }

  const typeInfo = TYPE_INFO[personalityType];
  const category = MBTI_CATEGORY[personalityType];
  const description = MBTI_DESCRIPTION[personalityType];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`Personality type: ${personalityType}. Click for more information.`}
        >
          <ProfileSignal label="Type" value={typeValue} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-64 border-white/8 bg-[#131312] p-4"
      >
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-white text-sm">
                {typeInfo.title}
              </p>
              <p className="mt-0.5 text-xs font-medium text-forge-teal">
                {personalityType} · {category}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-forge-teal/10 px-2 py-1 text-sm font-bold leading-none text-forge-teal">
              {personalityType}
            </span>
          </div>

          <p className="text-slate-muted text-xs leading-relaxed">
            {description}
          </p>

          <div className="border-t border-white/6 pt-2">
            <TypeDimensionRow code={personalityType} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TypeDimensionRow({ code }: { code: PersonalityType }) {
  const dims = [
    { pair: ["E", "I"], active: code[0] },
    { pair: ["S", "N"], active: code[1] },
    { pair: ["T", "F"], active: code[2] },
    { pair: ["J", "P"], active: code[3] },
  ] as const;

  return (
    <div className="flex items-center gap-1.5">
      {dims.map(({ pair, active }) => (
        <div key={pair.join("")} className="flex items-center gap-0.5">
          {pair.map((letter) => (
            <span
              key={letter}
              className={cn(
                "type-signature-label flex h-5 w-5 items-center justify-center rounded font-bold transition-colors",
                letter === active
                  ? "bg-forge-teal/15 text-forge-teal"
                  : "text-white/20",
              )}
            >
              {letter}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Role / archetype badge with popover ─────────────────────────────────────

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  Strategist: "Shapes how the group thinks through a problem before acting.",
  Thinker:
    "Adds depth and perspective — asks the question no one else thought of.",
  Leader: "Moves the group forward with clear direction and energy.",
  Visionary: "Spots possibilities early and keeps options open.",
  Guide: "Holds the bigger picture while staying attuned to how people feel.",
  Dreamer: "Brings heart and imagination to ideas that could go either way.",
  Mentor: "Draws people out and helps the group work at its best.",
  Spark: "Generates enthusiasm that makes the group want to start.",
  Anchor: "Keeps things grounded when plans get complicated.",
  Caretaker: "Attentive to what the group needs and quietly makes it happen.",
  Director: "Keeps the group on track and makes sure decisions land.",
  Host: "Holds the social fabric together — everyone feels welcomed.",
  Craftsman: "Brings practical ability and calm under pressure.",
  Artist: "Adds a sensory and creative lens to what the group does.",
  Dynamo: "High-energy presence that accelerates the group's momentum.",
  Performer:
    "Makes the experience itself memorable — the group is the activity.",
};

function RoleBadge({
  archetype,
  groupMode,
}: {
  archetype: string;
  groupMode: string;
}) {
  const description = ARCHETYPE_DESCRIPTIONS[groupMode];

  if (!description) {
    return <ProfileSignal label="Role" value={groupMode} />;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`Group role: ${groupMode}. Click for more information.`}
        >
          <ProfileSignal label="Role" value={groupMode} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-64 border-white/8 bg-[#131312] p-4"
      >
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-white text-sm">{archetype}</p>
            <p className="mt-0.5 text-xs text-slate-muted">
              Group role in TeamForge
            </p>
          </div>
          <p className="text-slate-muted text-xs leading-relaxed">
            {description}
          </p>
          <div className="border-t border-white/6 pt-2">
            <p className="leading-relaxed text-white/35 type-signature-label">
              Roles are shaped by personality type and how you tend to show up
              in group settings.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

interface ProfileSignalProps {
  accent?: string;
  label: string;
  value: ReactNode;
}

function ProfileSignal({
  accent = "text-ink",
  label,
  value,
}: ProfileSignalProps) {
  return (
    <div className="min-w-0 text-left">
      <p className="font-semibold text-slate-muted text-[11px] sm:text-xs">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-extrabold text-xs leading-tight underline-offset-2 group-hover:underline sm:text-sm md:text-base",
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
