import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Compass, Eye, Radar, TriangleAlert } from "lucide-react";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import type { ProfilePortraitInsight } from "../lib/profile-insights";
import { ProfileSectionHeading } from "./profile-section-heading";

interface ProfilePortraitSectionProps {
  portrait: ProfilePortraitInsight;
}

const PROFILE_CONFIDENCE_LABELS = {
  early: "Early read",
  high: "Strong read",
  medium: "Good read",
} satisfies Record<ProfilePortraitInsight["confidence"], string>;

const DETAIL_ICON_RULES = [
  {
    Icon: Compass,
    matches: (label: string) => label.includes("setting"),
  },
  {
    Icon: TriangleAlert,
    matches: (label: string) =>
      label.includes("watch") || label.includes("avoid"),
  },
  {
    Icon: BadgeCheck,
    matches: (label: string) =>
      label.includes("basis") || label.includes("trait"),
  },
] as const;

const SHOW_UP_RANK_LABELS = [
  "Most visible",
  "Also present",
  "Quiet signal",
] as const;

const COMPACT_SHOW_UP_TITLES = {
  activeCatalyst: "You turn loose plans into real outings",
  cafeConnector: "You make easy plans feel personal",
  calmAnchor: "You keep the pace feeling human",
  creativeInstigator: "You give the plan a point of view",
  curiousSpecialist: "You bring the tangent people remember",
  flexibleParticipant: "You find the thread others can follow",
  focusedBuilder: "You turn talk into something concrete",
  ideaFirstExplorer: "You find the better angle on a plan",
  playfulScout: "You make joining feel easier",
  practicalOrganizer: "You help the plan actually hold",
  quietSpecialist: "You bring the interesting side route",
  restlessInstigator: "You get people moving before things stall",
  socialGameHost: "You give everyone something to do",
  steadyHost: "You help the room settle",
  tasteMaker: "You make the plan feel chosen",
  warmConnector: "You make the room feel easier",
} satisfies Record<ProfilePortraitInsight["candidates"][number]["key"], string>;

export function ProfilePortraitSection({
  portrait,
}: ProfilePortraitSectionProps) {
  const readLabel = getPortraitReadLabel(portrait);
  const visibleDetails = getVisiblePortraitDetails(portrait);

  return (
    <section className="border-border/60 border-t pt-6 sm:pt-8">
      <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <ProfileSectionHeading>Profile sketch</ProfileSectionHeading>
              <StatusPill tone="neutral" size="xs" className="bg-transparent">
                {readLabel}
              </StatusPill>
            </div>
            <h3 className="max-w-3xl font-black text-2xl text-ink leading-tight tracking-tight md:text-3xl">
              {portrait.title}
            </h3>
            <p className="max-w-2xl text-pretty font-semibold text-base text-ink/82 leading-relaxed">
              {getCompactLead(portrait.lead)}
            </p>
          </div>

          <div className="grid max-w-3xl border-border/70 border-y md:grid-cols-3">
            {visibleDetails.map((detail) => (
              <PortraitDetailRow
                key={`${detail.label}-${detail.value}`}
                detail={detail}
              />
            ))}
          </div>
        </div>

        <HowYouShowUpCard candidates={portrait.candidates} />
      </div>
    </section>
  );
}

function HowYouShowUpCard({
  candidates,
}: {
  candidates: ProfilePortraitInsight["candidates"];
}) {
  const visibleCandidates = getVisibleShowUpCandidates(candidates);
  const leaderScore = visibleCandidates[0]?.score ?? 0;

  if (visibleCandidates.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full min-h-64 flex-col rounded-2xl border border-forge-teal/20 bg-forge-teal/8 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-black text-slate-muted text-sm">How you show up</p>
        <Radar className="size-4 text-forge-teal" aria-hidden="true" />
      </div>
      <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
        {visibleCandidates.map((candidate) => (
          <ShowUpMeter
            key={candidate.key}
            rank={visibleCandidates.indexOf(candidate)}
            candidateKey={candidate.key}
            leaderScore={leaderScore}
            score={candidate.score}
            title={candidate.title}
          />
        ))}
      </div>
    </div>
  );
}

function ShowUpMeter({
  candidateKey,
  leaderScore,
  rank,
  score,
  title,
}: {
  candidateKey: ProfilePortraitInsight["candidates"][number]["key"];
  leaderScore: number;
  rank: number;
  score: number;
  title: string;
}) {
  const percent = formatSignalStrengthPercent(score, leaderScore);
  const filledSegments = getFilledSignalSegments(percent);
  const rankLabel = getShowUpRankLabel(rank);
  const compactTitle = getCompactShowUpTitle(candidateKey, title);

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-slate-muted text-xs">{rankLabel}</p>
        <p className="shrink-0 font-black text-forge-teal text-xs">
          {percent}%
        </p>
      </div>
      <p className="mt-1 text-pretty font-bold text-ink text-sm leading-snug">
        {compactTitle}
      </p>
      <meter
        className="sr-only"
        min={0}
        max={100}
        value={percent}
        aria-label={`${rankLabel}: ${title}, ${percent} percent signal strength`}
      />
      <div className="mt-2 grid grid-cols-6 gap-1.5" aria-hidden="true">
        {SHOW_UP_SEGMENTS.map((segment) => (
          <span
            key={segment}
            className={
              segment <= filledSegments
                ? "h-1.5 rounded-full bg-forge-teal"
                : "h-1.5 rounded-full bg-slate-muted/15"
            }
          />
        ))}
      </div>
    </div>
  );
}

function PortraitDetailRow({
  detail,
}: {
  detail: ProfilePortraitInsight["details"][number];
}) {
  const Icon = getDetailIcon(detail.label);

  return (
    <div className="min-w-0 border-border/70 border-t py-4 first:border-t-0 md:border-t-0 md:border-l md:px-4 last:md:pr-0 first:md:border-l-0 first:md:pl-0">
      <div className="flex min-w-0 items-center gap-2">
        <IconTile icon={Icon} shape="circle" size="sm" />
        <p className="font-bold text-slate-muted text-sm">{detail.label}</p>
      </div>
      <p className="mt-2 text-pretty font-semibold text-ink/85 text-sm leading-snug">
        {getCompactSentence(detail.value)}
      </p>{" "}
    </div>
  );
}

function getCompactLead(value: string) {
  const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  return sentences.slice(0, 1).join(" ").trim();
}

function getCompactSentence(value: string) {
  const [sentence] = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  return sentence.trim();
}

function getDetailIcon(label: string): LucideIcon {
  const normalizedLabel = label.toLowerCase();
  const matchingRule = DETAIL_ICON_RULES.find((rule) =>
    rule.matches(normalizedLabel),
  );

  return matchingRule?.Icon ?? Eye;
}

function formatSignalStrengthPercent(score: number, leaderScore: number) {
  if (
    !Number.isFinite(score) ||
    !Number.isFinite(leaderScore) ||
    score <= 0 ||
    leaderScore <= 0
  ) {
    return 0;
  }

  const leaderPercent =
    MIN_SIGNAL_STRENGTH_PERCENT +
    (MAX_SIGNAL_STRENGTH_PERCENT - MIN_SIGNAL_STRENGTH_PERCENT) *
      (1 - Math.exp(-leaderScore / SIGNAL_STRENGTH_SCORE_SCALE));
  const relativeStrength = Math.min(Math.max(score / leaderScore, 0), 1);
  const normalizedStrength =
    SIGNAL_STRENGTH_FLOOR +
    relativeStrength * (leaderPercent - SIGNAL_STRENGTH_FLOOR);

  return Math.min(Math.max(Math.round(normalizedStrength), 0), 100);
}

function getFilledSignalSegments(percent: number) {
  if (!Number.isFinite(percent) || percent <= 0) {
    return 0;
  }

  const segmentCount = Math.round((percent / 100) * SHOW_UP_SEGMENTS.length);

  return Math.max(1, Math.min(SHOW_UP_SEGMENTS.length, segmentCount));
}

function getShowUpRankLabel(rank: number) {
  return SHOW_UP_RANK_LABELS[rank] ?? "Signal";
}

function getCompactShowUpTitle(
  key: ProfilePortraitInsight["candidates"][number]["key"],
  fallback: string,
) {
  return COMPACT_SHOW_UP_TITLES[key] ?? fallback;
}

function getPortraitReadLabel(portrait: ProfilePortraitInsight) {
  if (portrait.mode === "hybrid") {
    return "Blended read";
  }

  return PROFILE_CONFIDENCE_LABELS[portrait.confidence];
}

function getVisiblePortraitDetails(portrait: ProfilePortraitInsight) {
  return portrait.details.slice(0, 3);
}

function getVisibleShowUpCandidates(
  candidates: ProfilePortraitInsight["candidates"],
) {
  return candidates.slice(0, 3);
}

const SHOW_UP_SEGMENTS = [1, 2, 3, 4, 5, 6];
const SIGNAL_STRENGTH_FLOOR = 20;
const MIN_SIGNAL_STRENGTH_PERCENT = 48;
const MAX_SIGNAL_STRENGTH_PERCENT = 88;
const SIGNAL_STRENGTH_SCORE_SCALE = 6;
