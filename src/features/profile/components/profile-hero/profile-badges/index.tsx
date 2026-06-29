import type { ReactNode } from "react";
import { TYPE_INFO } from "@/features/profile/lib/archetypes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { SheetTrigger } from "@/shared/components/ui/sheet";
import { normalizeTrustScore } from "@/shared/lib/user-psychometrics";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";
import {
  type FriendsSheetTab,
  type ProfileSocialSummary,
  useProfileSocialSummary,
} from "../use-profile-social-summary";
import { ProfileBadgeDivider } from "./profile-badge-divider";

interface ProfileBadgesProps {
  archetype: string;
  user: User;
  onOpenFriends?: (tab: FriendsSheetTab) => void;
}

interface SocialBadge {
  accent?: string;
  label: string;
  tab: FriendsSheetTab;
  value: string;
}

type SocialBadgeConfig = Omit<SocialBadge, "value">;

const SOCIAL_BADGE_CONFIGS = {
  friends: {
    label: "Friends",
    tab: "friends",
  },
  mutualFriends: {
    label: "Mutual Friends",
    tab: "friends",
  },
  publicFriends: {
    label: "Friends",
    tab: "public_friends",
  },
  requests: {
    accent: "text-spark-amber",
    label: "Requests",
    tab: "requests",
  },
} satisfies Record<string, SocialBadgeConfig>;

function getSocialBadges({
  canShowPublicFriends,
  commonFriendsCount,
  friendsCount,
  isSelf,
  publicFriendsCount,
  requestsCount,
}: ProfileSocialSummary): SocialBadge[] {
  if (isSelf) {
    return getSelfSocialBadges({ friendsCount, requestsCount });
  }

  return getPublicSocialBadges({
    canShowPublicFriends,
    commonFriendsCount,
    publicFriendsCount,
  });
}

function getSelfSocialBadges({
  friendsCount,
  requestsCount,
}: Pick<ProfileSocialSummary, "friendsCount" | "requestsCount">) {
  const badges = [
    createSocialBadge(SOCIAL_BADGE_CONFIGS.friends, friendsCount),
  ];

  if (requestsCount > 0) {
    badges.push(
      createSocialBadge(SOCIAL_BADGE_CONFIGS.requests, requestsCount),
    );
  }

  return badges;
}

function getPublicSocialBadges({
  canShowPublicFriends,
  commonFriendsCount,
  publicFriendsCount,
}: Pick<
  ProfileSocialSummary,
  "canShowPublicFriends" | "commonFriendsCount" | "publicFriendsCount"
>) {
  const badges: SocialBadge[] = [];

  if (canShowPublicFriends) {
    badges.push(
      createSocialBadge(SOCIAL_BADGE_CONFIGS.publicFriends, publicFriendsCount),
    );
  }

  if (commonFriendsCount > 0) {
    badges.push(
      createSocialBadge(SOCIAL_BADGE_CONFIGS.mutualFriends, commonFriendsCount),
    );
  }

  return badges;
}

function createSocialBadge(
  config: SocialBadgeConfig,
  count: number,
): SocialBadge {
  return {
    ...config,
    value: count.toString(),
  };
}

export function ProfileBadges({
  user,
  archetype,
  onOpenFriends,
}: ProfileBadgesProps) {
  const trustScore = normalizeTrustScore(user.trustScore);
  const trustLabel = getTrustLabel(trustScore);
  const groupMode = archetype.replace(/^The\s+/i, "");
  const socialBadgeInput = useProfileSocialSummary(user);
  const socialBadges = getSocialBadges(socialBadgeInput);

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

      <ProfileSocialBadges
        badges={socialBadges}
        onOpenFriends={onOpenFriends}
      />
    </div>
  );
}

function ProfileSocialBadges({
  badges,
  onOpenFriends,
}: {
  badges: SocialBadge[];
  onOpenFriends?: (tab: FriendsSheetTab) => void;
}) {
  return (
    <div className="hidden sm:contents">
      {badges.map((badge) => (
        <ProfileSocialBadge
          key={badge.tab}
          badge={badge}
          onOpenFriends={onOpenFriends}
        />
      ))}
    </div>
  );
}

function ProfileSocialBadge({
  badge,
  onOpenFriends,
}: {
  badge: SocialBadge;
  onOpenFriends?: (tab: FriendsSheetTab) => void;
}) {
  return (
    <>
      <ProfileBadgeDivider className="hidden sm:block" />
      <SheetTrigger asChild>
        <button
          type="button"
          onClick={() => onOpenFriends?.(badge.tab)}
          className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ProfileSignal
            accent={badge.accent}
            label={badge.label}
            value={badge.value}
          />
        </button>
      </SheetTrigger>
    </>
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
                <span className="hidden whitespace-pre sm:inline">
                  {" "}
                  {trustLabel}
                </span>
              </span>
            }
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-64 border-white/8 bg-ink p-4"
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
        <p className="font-semibold text-sm text-white">Trust score</p>
        <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
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

      <div className="border-white/6 border-t pt-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-muted text-xs">Current</span>
          <span className="font-bold text-forge-teal text-sm tabular-nums">
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
        className="w-64 border-white/8 bg-ink p-4"
      >
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm text-white">
                {typeInfo.title}
              </p>
              <p className="mt-0.5 font-medium text-forge-teal text-xs">
                {personalityType} · {category}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-forge-teal/10 px-2 py-1 font-bold text-forge-teal text-sm leading-none">
              {personalityType}
            </span>
          </div>

          <p className="text-slate-muted text-xs leading-relaxed">
            {description}
          </p>

          <div className="border-white/6 border-t pt-2">
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
                "type-signature-label flex size-5 items-center justify-center rounded font-bold transition-colors",
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
        className="w-64 border-white/8 bg-ink p-4"
      >
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-sm text-white">{archetype}</p>
            <p className="mt-0.5 text-slate-muted text-xs">
              Group role in TeamForge
            </p>
          </div>
          <p className="text-slate-muted text-xs leading-relaxed">
            {description}
          </p>
          <div className="border-white/6 border-t pt-2">
            <p className="type-signature-label text-white/35 leading-relaxed">
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
      <p className="font-semibold text-[11px] text-slate-muted sm:text-xs">
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
