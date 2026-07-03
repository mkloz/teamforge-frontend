import { ChevronLeft, MapPin } from "lucide-react";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import { PersonalityCoverArt } from "@/shared/components/profile/personality-cover-art";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { OnlineStatus } from "@/shared/schemas/enums";
import type { UserProfilePanelParticipant } from "./types";

type ProfileCompactMetaItem =
  | { kind: "age"; value: string }
  | { kind: "city"; value: string };

interface ProfilePanelCoverProps {
  compactHeaderVisible: boolean;
  onlineStatus: OnlineStatus;
  onCompactHeaderClick?: () => void;
  participant: UserProfilePanelParticipant;
}

export function ProfilePanelCover({
  compactHeaderVisible,
  onlineStatus,
  onCompactHeaderClick,
  participant,
}: ProfilePanelCoverProps) {
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

export function ProfilePanelBackButton({ onBack }: { onBack?: () => void }) {
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
