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
import { AvatarPreviewDialog } from "@/shared/components/common/avatar-preview-dialog";
import { PersonalityCoverArt } from "@/shared/components/profile/personality-cover-art";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { OnlineStatus } from "@/shared/schemas/enums";
import { buildShowUpSignals, type ShowUpSignal } from "./show-up-profile";
import type { UserProfilePanelParticipant } from "./types";

interface ProfilePanelInfoProps {
  participant: UserProfilePanelParticipant;
  isHydratingProfile?: boolean;
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  compactHeaderVisible?: boolean;
  profileNavigation?: ProfileNavigation;
  onBack?: () => void;
  onCompactHeaderClick?: () => void;
}

interface ProfilePanelInfoViewState {
  groupMode: string;
  onlineStatus: OnlineStatus;
  personalitySignals: ShowUpSignal[];
  trustScore: number;
  typeLabel: string;
}

type ProfileCompactMetaItem =
  | { kind: "age"; value: string }
  | { kind: "city"; value: string };

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
  compactHeaderVisible = false,
  profileNavigation,
  onBack,
  onCompactHeaderClick,
}: ProfilePanelInfoProps) {
  const viewState = getProfilePanelInfoViewState(participant);

  return (
    <div className="relative flex w-full flex-col">
      <ProfilePanelCover
        compactHeaderVisible={compactHeaderVisible}
        onlineStatus={viewState.onlineStatus}
        onCompactHeaderClick={onCompactHeaderClick}
        participant={participant}
      />

      <ProfilePanelBackButton onBack={onBack} />

      <ProfilePanelOriginalCard
        chatNavigation={chatNavigation}
        groupMode={viewState.groupMode}
        onlineStatus={viewState.onlineStatus}
        participant={participant}
        profileNavigation={profileNavigation}
        trustScore={viewState.trustScore}
        typeLabel={viewState.typeLabel}
      />

      <ProfilePanelAboutSection participant={participant} />

      <ProfilePanelSignalsSection
        isHydratingProfile={isHydratingProfile}
        personalitySignals={viewState.personalitySignals}
      />
    </div>
  );
}

function getProfilePanelInfoViewState(
  participant: UserProfilePanelParticipant,
): ProfilePanelInfoViewState {
  const personalityType = participant.personalityType;

  return {
    groupMode: personalityType
      ? getArchetype(personalityType).replace(/^The\s+/i, "")
      : "Open",
    onlineStatus: participant.onlineStatus || "OFFLINE",
    personalitySignals: buildShowUpSignals(participant),
    trustScore: formatPercent(participant.trustScore),
    typeLabel: personalityType ?? "Open",
  };
}

function ProfilePanelCover({
  compactHeaderVisible,
  onlineStatus,
  onCompactHeaderClick,
  participant,
}: {
  compactHeaderVisible: boolean;
  onlineStatus: OnlineStatus;
  onCompactHeaderClick?: () => void;
  participant: UserProfilePanelParticipant;
}) {
  return (
    <div className="pointer-events-none sticky top-0 z-30 h-(--panel-cover-expanded-height) overflow-visible">
      <PersonalityCoverArt
        coverClassName="transform-[translate3d(0,var(--panel-cover-y,0px),0)] h-(--panel-cover-expanded-height) origin-[center_top] transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none"
        personalityType={participant.personalityType}
        watermarkClassName="text-7xl"
        watermarkContainerClassName="h-(--panel-cover-expanded-height) px-4"
      />

      <PanelCompactProfileHeader
        participant={participant}
        onlineStatus={onlineStatus}
        onClick={onCompactHeaderClick}
        visible={compactHeaderVisible}
      />
    </div>
  );
}

function ProfilePanelBackButton({ onBack }: { onBack?: () => void }) {
  if (!onBack) {
    return null;
  }

  return (
    <div className="absolute inset-x-4 top-3 z-40 flex items-center">
      <Button
        size="icon-sm"
        variant="inverseGhost"
        onClick={onBack}
        aria-label="Go back"
      >
        <ChevronLeft size={18} />
      </Button>
    </div>
  );
}

function ProfilePanelOriginalCard({
  chatNavigation,
  groupMode,
  onlineStatus,
  participant,
  profileNavigation,
  trustScore,
  typeLabel,
}: {
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  groupMode: string;
  onlineStatus: OnlineStatus;
  participant: UserProfilePanelParticipant;
  profileNavigation?: ProfileNavigation;
  trustScore: number;
  typeLabel: string;
}) {
  return (
    <section
      className="relative border-border/70 border-b bg-canvas opacity-(--profile-panel-original-opacity) transition-opacity duration-150 ease-out [pointer-events:var(--profile-panel-original-pointer-events,auto)] motion-reduce:transition-none"
      data-profile-panel-original-card=""
    >
      <div className="relative z-10 flex min-w-0 flex-row items-start gap-3 px-4 pt-6 pb-3">
        <PanelProfileAvatar
          name={participant.name}
          src={participant.avatar}
          onlineStatus={onlineStatus}
        />

        <div className="min-w-0 flex-1 pt-2 text-left">
          <h3 className="truncate font-bold text-2xl text-foreground leading-tight tracking-tight">
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
  );
}

function ProfilePanelAboutSection({
  participant,
}: {
  participant: UserProfilePanelParticipant;
}) {
  return (
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
  );
}

function ProfilePanelSignalsSection({
  isHydratingProfile,
  personalitySignals,
}: {
  isHydratingProfile: boolean;
  personalitySignals: ShowUpSignal[];
}) {
  return (
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
  );
}

function PanelCompactProfileHeader({
  onlineStatus,
  onClick,
  participant,
  visible,
}: {
  onlineStatus: OnlineStatus;
  onClick?: () => void;
  participant: UserProfilePanelParticipant;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-10 flex h-18 items-center gap-3 px-4 text-white transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
      )}
      aria-hidden={!visible}
    >
      {onClick ? (
        <button
          type="button"
          aria-label="Scroll profile panel to top"
          tabIndex={visible ? 0 : -1}
          onClick={onClick}
          className="pointer-events-auto absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-inset"
        />
      ) : null}

      <div className="pointer-events-none relative z-10 shrink-0">
        <Avatar
          src={participant.avatar}
          name={participant.name}
          className="size-12 border-2 border-canvas bg-muted text-lg shadow-sm ring-1 ring-border/70"
          fallbackClassName="bg-muted text-forge-teal"
          loading="eager"
        />
        <AvatarStatus
          status={onlineStatus}
          borderClassName="border-forge-teal"
          sizeClassName="size-3"
        />
      </div>

      <div className="pointer-events-none relative z-10 min-w-0">
        <p className="truncate font-bold text-xl leading-tight tracking-tight">
          {participant.name}
        </p>
        <ProfileCompactMetaRow participant={participant} />
      </div>
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

  return (
    <div
      className={cn(
        "grid min-w-0 gap-2",
        hasBothProfileActions({ chatNavigation, profileNavigation })
          ? "grid-cols-2"
          : "grid-cols-1",
      )}
    >
      <ProfileNavigationAction profileNavigation={profileNavigation} />
      <ChatNavigationAction chatNavigation={chatNavigation} />
    </div>
  );
}

function hasBothProfileActions({
  chatNavigation,
  profileNavigation,
}: {
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  profileNavigation?: ProfileNavigation;
}) {
  return Boolean(chatNavigation && profileNavigation);
}

function ProfileNavigationAction({
  profileNavigation,
}: {
  profileNavigation?: ProfileNavigation;
}) {
  if (!profileNavigation) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="xs" className="min-w-0 flex-1">
      <Link {...profileNavigation}>
        <ExternalLink className="size-4" />
        <span className="truncate">View profile</span>
      </Link>
    </Button>
  );
}

function ChatNavigationAction({
  chatNavigation,
}: {
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
}) {
  if (!chatNavigation) {
    return null;
  }

  return (
    <Button asChild variant="primary" size="xs" className="min-w-0 flex-1">
      <Link {...chatNavigation}>
        <MessageSquareText className="size-4" />
        <span className="truncate">Message</span>
      </Link>
    </Button>
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
    <AvatarPreviewDialog name={name} src={src}>
      <button
        type="button"
        className="group relative shrink-0 cursor-zoom-in appearance-none rounded-full border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-label={`Expand ${name} avatar`}
      >
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
      </button>
    </AvatarPreviewDialog>
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
    <div className="mt-2 flex min-w-0 items-center overflow-hidden text-slate-muted">
      {items.map((item, index) => (
        <div key={item.kind} className="flex min-w-0 items-center">
          {index > 0 ? (
            <span
              aria-hidden="true"
              className="mx-2 h-3 w-px shrink-0 bg-slate-muted/35"
            />
          ) : null}
          <ProfileMetaItem item={item} />
        </div>
      ))}
    </div>
  );
}

function ProfileCompactMetaRow({
  participant,
}: {
  participant: UserProfilePanelParticipant;
}) {
  const items = getProfileCompactMetaItems(participant);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex min-w-0 items-center gap-1.5 font-semibold text-white/82 text-xs leading-4">
      {items.map((item, index) => (
        <ProfileCompactMetaItemWithSeparator
          key={item.kind}
          item={item}
          showSeparator={index > 0}
        />
      ))}
    </div>
  );
}

function getProfileCompactMetaItems(
  participant: UserProfilePanelParticipant,
): ProfileCompactMetaItem[] {
  const items: ProfileCompactMetaItem[] = [];

  if (typeof participant.age === "number") {
    items.push({ kind: "age", value: `${participant.age} yrs` });
  }

  if (participant.city) {
    items.push({ kind: "city", value: participant.city });
  }

  return items;
}

function ProfileCompactMetaItemWithSeparator({
  item,
  showSeparator,
}: {
  item: ProfileCompactMetaItem;
  showSeparator: boolean;
}) {
  return (
    <>
      {showSeparator ? (
        <span className="size-1 rounded-full bg-white/45" />
      ) : null}
      <ProfileCompactMetaItem item={item} />
    </>
  );
}

function ProfileCompactMetaItem({ item }: { item: ProfileCompactMetaItem }) {
  if (item.kind === "age") {
    return <span className="shrink-0">{item.value}</span>;
  }

  return (
    <span className="flex min-w-0 items-center gap-1">
      <MapPin aria-hidden="true" className="size-3 shrink-0 text-white/85" />
      <span className="truncate">{item.value}</span>
    </span>
  );
}

function ProfileMetaItem({ item }: { item: { kind: string; value: string } }) {
  if (item.kind === "city") {
    return (
      <span className="flex h-4 min-w-0 items-center gap-1 font-semibold text-sm leading-4">
        <MapPin
          aria-hidden="true"
          className="size-3 shrink-0 -translate-y-px"
        />
        <span className="truncate leading-4">{item.value}</span>
      </span>
    );
  }

  return (
    <span className="flex h-4 shrink-0 items-center font-semibold text-sm leading-4">
      {item.value}
    </span>
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
      <p className="font-semibold text-slate-muted text-xs leading-tight">
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
