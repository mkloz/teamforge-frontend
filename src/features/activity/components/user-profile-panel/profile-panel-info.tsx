import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ExternalLink,
  MapPin,
  MessageSquareText,
} from "lucide-react";
import type { buildActivityDmNavigation } from "@/features/activity/lib/activity-route";
import { getArchetype } from "@/features/profile/lib/archetypes";
import type { ProfileNavigation } from "@/features/profile/lib/profile-route";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { OnlineStatus } from "@/shared/schemas/enums";
import { buildShowUpSignals, type ShowUpSignal } from "./show-up-profile";
import type { UserProfilePanelParticipant } from "./types";

interface ProfilePanelInfoProps {
  participant: UserProfilePanelParticipant;
  isHydratingProfile?: boolean;
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  profileNavigation?: ProfileNavigation;
  onBack?: () => void;
}

function formatPercent(score: number | null | undefined): number {
  if (typeof score !== "number") {
    return 0;
  }

  return Math.round(score > 0 && score <= 1 ? score * 100 : score);
}

export function ProfilePanelInfo({
  participant,
  isHydratingProfile = false,
  chatNavigation,
  profileNavigation,
  onBack,
}: ProfilePanelInfoProps) {
  const onlineStatus = participant.onlineStatus || "OFFLINE";
  const personalitySignals = buildShowUpSignals(participant);
  const trustScore = formatPercent(participant.trustScore);
  const typeLabel = participant.personalityType ?? "Open";
  const groupMode = participant.personalityType
    ? getArchetype(participant.personalityType).replace(/^The\s+/i, "")
    : "Open";

  return (
    <div className="flex w-full flex-col">
      <section className="relative border-border/70 border-b bg-canvas">
        <div className="relative h-28 overflow-hidden bg-forge-teal px-4 pt-3">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 bg-linear-to-b from-black/5 to-black/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle,var(--color-canvas)_1px,transparent_1px)] bg-size-[24px_24px] opacity-15" />
            {participant.personalityType ? (
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 select-none font-black text-8xl text-white/10 leading-none tracking-tighter mix-blend-overlay">
                {participant.personalityType}
              </span>
            ) : null}
          </div>
        </div>

        <div className="absolute inset-x-4 top-3 z-40 flex items-center justify-between">
          {onBack ? (
            <Button
              size="icon-sm"
              variant="inverseGhost"
              onClick={onBack}
              className="rounded-full"
              aria-label="Go back"
            >
              <ChevronLeft size={18} />
            </Button>
          ) : (
            <div />
          )}

          {profileNavigation ? (
            <Button
              asChild
              size="icon-sm"
              variant="inverseGhost"
              className="rounded-full"
            >
              <Link {...profileNavigation} aria-label="View full profile">
                <ExternalLink size={14} />
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="relative z-10 -mt-14 flex min-w-0 flex-row items-start gap-3 px-4 pb-4">
          <PanelProfileAvatar
            name={participant.name}
            src={participant.avatar}
            onlineStatus={onlineStatus}
          />

          <div className="min-w-0 flex-1 pt-5 text-left">
            <h3 className="truncate font-bold text-2xl text-white leading-tight tracking-tight">
              {participant.name}
            </h3>
            <ProfileMetaRow participant={participant} />
          </div>
        </div>

        <div className="px-4 pb-4">
          <ProfileActionButtons
            chatNavigation={chatNavigation}
            profileNavigation={profileNavigation}
          />
        </div>

        <div className="border-border border-t px-4 py-3">
          <PanelProfileSignals
            groupMode={groupMode}
            trustScore={trustScore}
            typeLabel={typeLabel}
          />
        </div>
      </section>

      <section className="border-border/70 border-b px-5 py-5">
        <h4 className="font-bold text-slate-muted text-xs">About</h4>
        {participant.bio ? (
          <p className="mt-2 text-pretty text-ink/80 text-sm leading-relaxed">
            {participant.bio}
          </p>
        ) : (
          <p className="mt-2 text-slate-muted text-sm leading-relaxed">
            {participant.name} has not added a profile note yet.
          </p>
        )}
      </section>

      <section className="px-5 py-5">
        <h4 className="font-bold text-slate-muted text-xs">
          How they tend to show up
        </h4>

        {personalitySignals.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {personalitySignals.map((signal) => (
              <PersonalitySignal key={signal.key} signal={signal} />
            ))}
          </div>
        ) : (
          <p className="mt-2 font-medium text-slate-muted text-sm">
            {isHydratingProfile
              ? "Personality signals are loading."
              : "Personality signals are not available yet."}
          </p>
        )}
      </section>
    </div>
  );
}

function ProfileActionButtons({
  chatNavigation,
  profileNavigation,
}: {
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  profileNavigation?: ProfileNavigation;
}) {
  if (!chatNavigation && !profileNavigation) {
    return null;
  }

  const hasBothActions = Boolean(chatNavigation && profileNavigation);

  return (
    <div
      className={cn(
        "grid min-w-0 gap-2",
        hasBothActions ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {profileNavigation ? (
        <Button
          asChild
          variant="outline"
          size="xs"
          className="min-w-0 flex-1 px-3"
        >
          <Link {...profileNavigation}>
            <ExternalLink className="size-4" />
            <span className="truncate">View profile</span>
          </Link>
        </Button>
      ) : null}

      {chatNavigation ? (
        <Button
          asChild
          variant="primary"
          size="xs"
          className="min-w-0 flex-1 px-3"
        >
          <Link {...chatNavigation}>
            <MessageSquareText className="size-4" />
            <span className="truncate">Message</span>
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function PanelProfileAvatar({
  name,
  onlineStatus,
  src,
}: {
  name: string;
  onlineStatus: OnlineStatus;
  src: string | null;
}) {
  return (
    <div className="group relative shrink-0">
      <div className="absolute inset-0 rounded-full bg-spark-amber/20 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
      <div className="absolute -inset-1.5 rounded-full border-2 border-forge-teal/30 opacity-0 transition duration-700 group-hover:rotate-180 group-hover:scale-105 group-hover:opacity-100" />
      <div className="relative z-10 size-20 transition-transform duration-300 group-hover:scale-105">
        <Avatar
          src={src}
          name={name}
          className="size-full border-canvas border-thick bg-muted text-2xl shadow-lg ring-1 ring-border/70"
          fallbackClassName="bg-muted text-forge-teal text-2xl"
          loading="eager"
        />
        <AvatarStatus
          status={onlineStatus}
          borderClassName="border-canvas"
          sizeClassName="size-4"
        />
      </div>
    </div>
  );
}

function PanelProfileSignals({
  groupMode,
  trustScore,
  typeLabel,
}: {
  groupMode: string;
  trustScore: number;
  typeLabel: string;
}) {
  return (
    <div className="grid grid-cols-3 overflow-hidden">
      <ProfileSignal
        label="Trust"
        value={`${trustScore} ${getTrustLabel(trustScore)}`}
        accent="text-forge-teal"
      />
      <ProfileSignal
        label="Type"
        value={typeLabel}
        className="border-border border-l pl-3"
      />
      <ProfileSignal
        label="Role"
        value={groupMode}
        className="border-border border-l pl-3"
      />
    </div>
  );
}

function ProfileMetaRow({
  participant,
}: {
  participant: UserProfilePanelParticipant;
}) {
  const items = [
    typeof participant.age === "number"
      ? { kind: "age", value: `${participant.age} yrs` }
      : null,
    participant.city ? { kind: "city", value: participant.city } : null,
    formatGender(participant.gender)
      ? { kind: "gender", value: formatGender(participant.gender) }
      : null,
  ].filter((item): item is { kind: string; value: string } => Boolean(item));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-slate-muted">
      {items.map((item, index) => (
        <div key={item.kind} className="flex min-w-0 items-center gap-2">
          {index > 0 ? (
            <span className="size-1 rounded-full bg-border" />
          ) : null}
          {item.kind === "city" ? (
            <span className="flex min-w-0 items-center gap-1 font-bold text-micro uppercase tracking-widest">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{item.value}</span>
            </span>
          ) : (
            <span className="font-semibold text-sm">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function PersonalitySignal({ signal }: { signal: ShowUpSignal }) {
  const filledSegments =
    typeof signal.value === "number"
      ? Math.max(1, Math.min(5, Math.round(signal.value / 20)))
      : null;
  const roundedValue = Math.round(signal.value ?? 0);

  return (
    <div className="min-w-0 border-border/70 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-ink text-sm leading-tight">
            {signal.label}
          </p>
          <p className="mt-0.5 font-bold text-slate-muted text-xs leading-tight">
            {signal.level}
          </p>
        </div>
        {signal.source === "ocean" ? (
          <p className="shrink-0 font-bold text-forge-teal text-xs leading-tight">
            {roundedValue}%
          </p>
        ) : (
          <p className="shrink-0 font-bold text-slate-muted text-xs leading-tight">
            Type cue
          </p>
        )}
      </div>

      <p className="mt-2 text-pretty text-slate-muted text-xs leading-relaxed">
        {signal.description}
      </p>

      {filledSegments ? (
        <div className="mt-3">
          <meter
            className="sr-only"
            min={0}
            max={100}
            value={roundedValue}
            aria-label={`${signal.label} ${roundedValue} percent`}
          />
          <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
            {PERSONALITY_SEGMENTS.map((segment) => (
              <span
                key={segment}
                className={cn(
                  "h-1.5 min-w-0 rounded-full",
                  segment <= filledSegments
                    ? "bg-forge-teal"
                    : "bg-slate-muted/15",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const PERSONALITY_SEGMENTS = [1, 2, 3, 4, 5];

function ProfileSignal({
  accent = "text-ink",
  className,
  label,
  value,
}: {
  accent?: string;
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={cn("min-w-0 pr-2", className)}>
      <p className="font-bold text-nano text-slate-muted uppercase leading-tight tracking-widest">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate font-extrabold text-sm leading-tight",
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

function formatGender(gender?: UserProfilePanelParticipant["gender"] | null) {
  switch (gender) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    case "NON_BINARY":
      return "Non-binary";
    case "OTHER":
      return "Other";
    default:
      return null;
  }
}
